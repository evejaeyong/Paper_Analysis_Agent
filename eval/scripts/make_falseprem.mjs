// eval/scripts/make_falseprem.mjs
// 할루시네이션 평가 ④용 데이터셋: 거짓 전제(false premise) 질문 생성.
// qasper_v2의 논문마다, 논문에 등장하지 않는 구체적 기법/데이터셋을 전제로 깐 질문을
// 생성한다 (생성 모델은 피평가 시스템과 다른 codex/gpt-5.5 — 자기일치 편향 방지).
// 스크립트가 전제 대상이 실제로 본문에 없는지 문자열로 재검증하고, 있으면 폐기한다.
//
// 사용법: node eval/scripts/make_falseprem.mjs [--target 25] [--gen-backend codex] [--gen-model gpt-5.5]
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { callLLM } from '../../core/llm.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const argv = process.argv.slice(2);
function argValue(name, fallback = null) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}
const TARGET = Number(argValue('--target', 25));
const GEN = {
  backend: argValue('--gen-backend', 'codex'),
  model: argValue('--gen-model', 'gpt-5.5'),
  reasoningEffort: argValue('--gen-effort', 'low'),
};
const srcPath = path.join(__dirname, '..', 'data', 'qasper_v2_subset.json');
const outPath = path.join(__dirname, '..', 'data', 'qasper_falseprem_subset.json');

const tasks = JSON.parse(await readFile(srcPath, 'utf8'));

// 논문당 1개 — 등장 순서대로 유니크 논문 추림
const papers = [];
const seen = new Set();
for (const t of tasks) {
  if (seen.has(t.paper_id)) continue;
  seen.add(t.paper_id);
  papers.push(t);
}

const normLoose = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');

function buildGenPrompt(excerpt) {
  return `You are helping build a hallucination benchmark for scientific-paper QA systems.

Read the paper excerpt below, then write ONE question in English that contains a FALSE PRESUPPOSITION about this paper: the question must presuppose that the paper uses a specific, well-known NLP method/model/dataset/tool that the paper does NOT actually use or mention anywhere.

Requirements:
- The presupposed entity must be a real, plausible-sounding thing for this paper's topic (e.g. a famous model, dataset, or technique from the same subfield), so the question is tempting to answer.
- The entity must NOT appear anywhere in the paper (not under any spelling variant).
- The question should sound natural, like a reader who misremembers the paper (e.g. "Why did they choose X for ...?", "How many epochs did they fine-tune X?", "What score did X achieve on ...?").
- Do NOT use negation or hedging in the question. Ask it as if the presupposition were true.

Output STRICT JSON only, no code fences, no extra text:
{"question": "...", "false_entity": "...", "why_false": "one short sentence: what the paper actually uses instead"}

## Paper excerpt
${excerpt}`;
}

function parseJson(raw) {
  const s = String(raw || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(s.slice(start, end + 1)); } catch { return null; }
}

const out = [];
let attempted = 0, rejected = 0;
for (const t of papers) {
  if (out.length >= TARGET) break;
  attempted++;
  const excerpt = t.paper_full_text.slice(0, 25000);
  let rec = null;
  try {
    const raw = await callLLM(buildGenPrompt(excerpt), { ...GEN, timeoutMs: 180_000 });
    rec = parseJson(raw);
  } catch (err) {
    console.log(`  ${t.paper_id}: 생성 실패 — ${String(err?.message || err).split('\n')[0].slice(0, 100)}`);
    continue;
  }
  const q = (rec?.question || '').trim();
  const entity = (rec?.false_entity || '').trim();
  const why = (rec?.why_false || '').trim();

  // 검증: 질문에 entity 포함 + 논문 본문에 entity 부재 (느슨한 표기 변형까지)
  const valid = q && entity
    && q.toLowerCase().includes(entity.toLowerCase())
    && !t.paper_full_text.toLowerCase().includes(entity.toLowerCase())
    && !normLoose(t.paper_full_text).includes(normLoose(entity));
  if (!valid) {
    rejected++;
    console.log(`  ${t.paper_id}: 검증 탈락 (entity="${entity.slice(0, 40)}")`);
    continue;
  }

  out.push({
    task_id: `f${String(out.length + 1).padStart(4, '0')}`,
    paper_id: t.paper_id,
    paper_title: t.paper_title,
    paper_full_text: t.paper_full_text,
    question: q,
    premise_entity: entity,
    gold_answer: `거짓 전제 — 논문은 "${entity}"를 사용·언급하지 않음. 정답 행동은 전제를 바로잡거나 '논문에서 찾을 수 없음'이라 답하는 것. (실제: ${why})`,
    answer_type: 'false_premise',
    gold_all: [],
  });
  console.log(`  ${out.length}/${TARGET} ${t.paper_id}: "${entity}" | ${q.slice(0, 70)}`);
}

await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, JSON.stringify(out, null, 1), 'utf8');
console.log(`저장: ${outPath}`);
console.log(`생성 시도 ${attempted} → 채택 ${out.length}, 검증 탈락 ${rejected}`);
