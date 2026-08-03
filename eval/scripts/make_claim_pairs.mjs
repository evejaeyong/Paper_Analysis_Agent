// eval/scripts/make_claim_pairs.mjs
// verifier 정면 평가용 참/왜곡 claim 쌍 생성.
// 원문 문장(source_quote)에서 참 claim(설계상 supported)과, 핵심 요소 하나만 조작한
// 왜곡 claim(설계상 unsupported/contradicted)을 쌍으로 만든다.
// 생성 모델은 피평가 verifier(opus)와 다른 claude-sonnet-4-6. 생성 직후 기계 검증:
//   - source_quote가 논문 본문에 실재하는지 (quoteGuard와 동일한 relaxed 대조)
//   - true_claim ≠ perturbed_claim, 유형/기대라벨이 enum에 속하는지
// 실패 항목은 버리고 로그. 출력: eval/data/claim_pairs.json (resume: 논문 단위 skip)
// 사용법: node eval/scripts/make_claim_pairs.mjs [--papers 20]
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { callLLMJson } from '../../core/llm.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
function argValue(name, fallback = null) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}
const N_PAPERS = Number(argValue('--papers', '20'));
// --skip N: 앞의 N편을 건너뛰고 그다음부터 선택 (홀드아웃 세트 생성용 — 기존 세트와 논문 불겹침)
const SKIP = Number(argValue('--skip', '0'));
// --out <file>: 출력 파일명 (기본 claim_pairs.json)
const OUT_NAME = argValue('--out', 'claim_pairs.json');
const GEN = { backend: 'claude', model: 'claude-sonnet-4-6', reasoningEffort: 'low' };
const GEN_MAX_CHARS = 60000; // 생성 입력 상한 (검증 실행은 전문 사용)
const TYPES = ['number_change', 'direction_flip', 'entity_swap', 'condition_change', 'unsupported_addition'];
const EXPECTED = ['contradicted', 'unsupported'];

const outPath = path.join(__dirname, '..', 'data', OUT_NAME);
const tasks = JSON.parse(await readFile(path.join(__dirname, '..', 'data', 'qasper_v2_subset.json'), 'utf8'));

// 논문 중복 제거 → SKIP편 건너뛰고 N_PAPERS편 선택
const papers = [];
const seen = new Set();
let uniqueIdx = 0;
for (const t of tasks) {
  if (seen.has(t.paper_id)) continue;
  seen.add(t.paper_id);
  uniqueIdx++;
  if (uniqueIdx <= SKIP) continue;
  papers.push(t);
  if (papers.length >= N_PAPERS) break;
}

let store = { papers: {} };
try { store = JSON.parse(await readFile(outPath, 'utf8')); } catch { /* 처음 실행 */ }

const normWs = s => (s || '').replace(/\s+/g, ' ').trim();
const normAlnum = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');

const SCHEMA_HINT = `{"claims":[{"source_quote":"원문 그대로의 연속 구절","true_claim":"영어 1문장","perturbed_claim":"영어 1문장","perturbation_type":"number_change|direction_flip|entity_swap|condition_change|unsupported_addition","expected_perturbed_status":"contradicted|unsupported"}]}`;

function buildPrompt(paperText) {
  return `당신은 논문 사실 검증(claim verification) 평가용 데이터 생성기입니다. 아래 <paper>의 논문에서 검증 가능한 사실 문장 5개를 고르고, 각각에 대해 참/왜곡 claim 쌍을 만듭니다.

<paper>
${paperText}
</paper>

## 규칙
- source_quote: 근거가 되는 원문 문장을 **글자 그대로**(연속된 구절, 10단어 이상) 발췌. 수치·비교·방법 서술처럼 사실 확인이 가능한 문장을 고른다. 서로 다른 섹션에서 고르게 선택.
- true_claim: source_quote가 지지하는 범위 안에서 그 내용을 영어 1문장으로 패러프레이즈. 과장·일반화 금지.
- perturbed_claim: true_claim에서 **딱 한 요소만** 조작한 영어 1문장. 5개에 걸쳐 유형을 고르게 섞는다:
  - number_change: 수치를 다른 값으로 변경
  - direction_flip: 증감·비교 방향 반전 (outperforms→underperforms 등)
  - entity_swap: 주체(모델/방법/데이터셋)를 논문에 등장하는 다른 것으로 교체
  - condition_change: 조건·데이터셋·설정을 교체
  - unsupported_addition: 논문에 없는 방법·속성·주장을 추가
- expected_perturbed_status: 조작 결과가 원문과 **정면 충돌**하면 "contradicted", 원문에 **근거가 없을 뿐**이면 "unsupported".
- 조작된 수치·주장이 논문의 다른 부분과 우연히 일치하지 않게 한다.
- JSON만 출력.`;
}

let totalPairs = 0, dropped = 0;
for (let p = 0; p < papers.length; p++) {
  const paper = papers[p];
  const pid = `p${String(SKIP + p + 1).padStart(2, '0')}`;
  if (store.papers[pid]?.claims?.length) {
    console.log(`[${p + 1}/${papers.length}] ${pid} ... skip (완료됨, ${store.papers[pid].claims.length}쌍)`);
    totalPairs += store.papers[pid].claims.length;
    continue;
  }
  const genText = paper.paper_full_text.slice(0, GEN_MAX_CHARS);
  const docWs = normWs(paper.paper_full_text);
  const docAlnum = normAlnum(paper.paper_full_text);
  const t0 = Date.now();
  let out;
  try {
    out = await callLLMJson(buildPrompt(genText), SCHEMA_HINT, { ...GEN, timeoutMs: 300_000 });
  } catch (err) {
    console.log(`[${p + 1}/${papers.length}] ${pid} ... ERROR: ${String(err?.message || err).slice(0, 120)}`);
    continue;
  }
  const raw = Array.isArray(out?.claims) ? out.claims : [];
  const valid = [];
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    const quoteOk = c?.source_quote && normAlnum(c.source_quote).length >= 20
      && (docWs.includes(normWs(c.source_quote)) || docAlnum.includes(normAlnum(c.source_quote)));
    const shapeOk = c?.true_claim && c?.perturbed_claim && c.true_claim !== c.perturbed_claim
      && TYPES.includes(c.perturbation_type) && EXPECTED.includes(c.expected_perturbed_status);
    if (quoteOk && shapeOk) {
      valid.push({ id: `${pid}_${i + 1}`, ...c });
    } else {
      dropped++;
      console.log(`  - drop ${pid}_${i + 1}: quote실재=${!!quoteOk} 형식=${!!shapeOk}`);
    }
  }
  store.papers[pid] = { paper_id: paper.paper_id, paper_title: paper.paper_title, task_id: paper.task_id, claims: valid };
  totalPairs += valid.length;
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(store, null, 2), 'utf8');
  console.log(`[${p + 1}/${papers.length}] ${pid} ... ${((Date.now() - t0) / 1000).toFixed(1)}s 유효 ${valid.length}/${raw.length}쌍`);
}
console.log(`완료: 논문 ${Object.keys(store.papers).length}편, 유효 쌍 ${totalPairs}개 (탈락 ${dropped}) → ${outPath}`);
