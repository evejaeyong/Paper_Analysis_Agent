// eval/scripts/make_perturbed.mjs
// 할루시네이션 평가 ③용 데이터셋: 반사실(perturbed) 논문 테스트.
// qasper_v2에서 gold 답이 수치인 문항을 골라, 본문·근거·gold의 해당 수치를
// **전부 다른 값으로 치환**한 변형 논문을 만든다.
//   - 본문에 충실한 시스템 → 치환된 값(perturbed)을 답함
//   - 지어내는 시스템 → 학습 지식의 원래 값(original)을 답하거나 다른 값을 냄
// 채점은 score_perturbed.mjs 가 문자열 매칭으로 결정적으로 수행 (LLM judge 불필요).
//
// 사용법: node eval/scripts/make_perturbed.mjs [--target 30]
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const argv = process.argv.slice(2);
function argValue(name, fallback = null) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}
const TARGET = Number(argValue('--target', 30));
const srcPath = path.join(__dirname, '..', 'data', 'qasper_v2_subset.json');
const outPath = path.join(__dirname, '..', 'data', 'qasper_perturbed_subset.json');

const tasks = JSON.parse(await readFile(srcPath, 'utf8'));

const NUM_RE = /\d(?:[\d,]*\d)?(?:\.\d+)?/g; // 콤마는 숫자 사이에서만 (트레일링 콤마 방지)
const isYear = tok => /^(19|20)\d{2}$/.test(tok.replace(/,/g, ''));

// 결정적 수치 변형: 정수부 첫 두 자리를 교환 (같으면 +7). 소수부·콤마 형식 유지.
function perturbNumber(tok) {
  const hasComma = tok.includes(',');
  const plain = tok.replace(/,/g, '');
  const [intPart, fracPart] = plain.split('.');
  let newInt;
  if (intPart.length >= 2 && intPart[0] !== intPart[1] && intPart[1] !== '0') {
    // 첫 두 자리 교환 (두 번째 자리가 0이면 교환 시 선행 0 → 대신 +7 경로)
    newInt = intPart[1] + intPart[0] + intPart.slice(2);
  } else {
    newInt = String(BigInt(intPart) + 7n);
  }
  let formatted = newInt;
  if (hasComma) formatted = newInt.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fracPart != null ? `${formatted}.${fracPart}` : formatted;
}

// 숫자 토큰 치환용 정규식 (더 큰 수의 일부가 아니어야 함)
function tokenRegex(tok) {
  const esc = tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\d.,])${esc}(?![\\d.,])`, 'g');
}

const out = [];
const usedPapers = new Set();

for (const t of tasks) {
  if (out.length >= TARGET) break;
  if (usedPapers.has(t.paper_id)) continue; // 논문 다양성: 논문당 1문항
  if (t.answer_type === 'yes_no') continue;

  // gold 답에서 수치 후보 추출 (2자리 이상 또는 소수, 연도 제외)
  const nums = [...new Set((t.gold_answer.match(NUM_RE) || []))]
    .filter(tok => tok.replace(/[,.]/g, '').length >= 2 && !isYear(tok));

  let picked = null;
  for (const tok of nums) {
    const re = tokenRegex(tok);
    const inDoc = (t.paper_full_text.match(re) || []).length;
    const inEvidence = (t.evidence || []).some(e => tokenRegex(tok).test(e));
    // 본문에 1~30회 등장 + 근거 문장에 등장해야 질문과의 관련성이 보장됨
    if (inDoc >= 1 && inDoc <= 30 && inEvidence) { picked = { tok, inDoc }; break; }
  }
  if (!picked) continue;

  const perturbed = perturbNumber(picked.tok);
  if (perturbed === picked.tok) continue;
  // 치환값이 이미 본문에 존재하면 채점이 모호해짐 → 제외
  if (tokenRegex(perturbed).test(t.paper_full_text)) continue;

  const re = tokenRegex(picked.tok);
  out.push({
    task_id: `p${String(out.length + 1).padStart(4, '0')}`,
    original_task_id: t.task_id,
    paper_id: t.paper_id,
    paper_title: t.paper_title,
    paper_full_text: t.paper_full_text.replace(re, perturbed),
    question: t.question,
    gold_answer: t.gold_answer.replace(tokenRegex(picked.tok), perturbed),
    original_answer: t.gold_answer,
    original_value: picked.tok,
    perturbed_value: perturbed,
    occurrences_in_doc: picked.inDoc,
    answer_type: t.answer_type,
    evidence: (t.evidence || []).map(e => e.replace(tokenRegex(picked.tok), perturbed)),
    gold_all: [],
  });
  usedPapers.add(t.paper_id);
}

await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, JSON.stringify(out, null, 1), 'utf8');
console.log(`저장: ${outPath}`);
console.log(`문항 수: ${out.length} (논문 ${usedPapers.size}개, 논문당 1문항)`);
for (const t of out.slice(0, 10)) {
  console.log(`  ${t.task_id} (${t.original_task_id}): ${t.original_value} → ${t.perturbed_value} (본문 ${t.occurrences_in_doc}회) | ${t.question.slice(0, 60)}`);
}
