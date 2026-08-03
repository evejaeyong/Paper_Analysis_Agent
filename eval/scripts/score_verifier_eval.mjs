// eval/scripts/score_verifier_eval.mjs
// verifier 평가 기계 채점 (LLM 불필요 — 기대 라벨이 설계로 정해져 있음).
//   왜곡 검출 recall: 왜곡 claim이 unsupported/contradicted로 판정된 비율
//   오탐률: 참 claim이 unsupported/contradicted로 깎인 비율
//   세분 정확도: expected_perturbed_status(contradicted/unsupported)와의 일치
//   원인 분해: source_quote가 BM25 top-3 청크에 포함됐는지로 검색 실패 vs 판단 실패 분리
// 출력: eval/results/verifier_eval.md
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BM25Index } from '../../utils/bm25.js';
import { chunk } from '../../utils/chunker.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// --tag <name>: run 파일 접미사 및 결과 파일명 (run_verifier_eval.mjs의 --tag와 짝)
// --pairs <file>: claim 쌍 파일 (기본 claim_pairs.json)
const argv = process.argv.slice(2);
const tagIdx = argv.indexOf('--tag');
const TAG = tagIdx >= 0 && argv[tagIdx + 1] ? `-${argv[tagIdx + 1]}` : '';
const pairsIdx = argv.indexOf('--pairs');
const PAIRS_NAME = pairsIdx >= 0 && argv[pairsIdx + 1] ? argv[pairsIdx + 1] : 'claim_pairs.json';
const store = JSON.parse(await readFile(path.join(__dirname, '..', 'data', PAIRS_NAME), 'utf8'));
const tasks = JSON.parse(await readFile(path.join(__dirname, '..', 'data', 'qasper_v2_subset.json'), 'utf8'));
const taskById = new Map(tasks.map(t => [t.task_id, t]));
const runsDir = path.join(__dirname, '..', 'runs');
const outPath = path.join(__dirname, '..', 'results', `verifier_eval${TAG}.md`);
const TOP_K = 3; // agents/verifier.js와 동일

const normWs = s => (s || '').replace(/\s+/g, ' ').trim();
const normAlnum = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const NEG = new Set(['unsupported', 'contradicted']);

async function loadRun(file) {
  try { return JSON.parse(await readFile(path.join(runsDir, file), 'utf8')); } catch { return null; }
}

// 집계 컨테이너
const rows = [];
let missingRuns = 0;
const byType = {}; // perturbation_type -> {n, caught, expectMatch}

for (const pid of Object.keys(store.papers).sort()) {
  const entry = store.papers[pid];
  if (!entry.claims?.length) continue;
  const paper = taskById.get(entry.task_id);

  // verifier와 동일한 청크+BM25로 검색 재현 → source_quote 포함 여부
  const chunks = chunk(paper.paper_full_text);
  const idx = new BM25Index();
  for (const c of chunks) idx.add(c.id, c.text);
  const chunkText = new Map(chunks.map(c => [c.id, c.text]));

  const tRun = await loadRun(`verifier-eval${TAG}-${pid}-true.json`);
  const fRun = await loadRun(`verifier-eval${TAG}-${pid}-perturbed.json`);
  if (!tRun?.verdicts || !fRun?.verdicts) { missingRuns++; continue; }
  const tById = new Map(tRun.verdicts.map(v => [v.claimId, v]));
  const fById = new Map(fRun.verdicts.map(v => [v.claimId, v]));

  for (const c of entry.claims) {
    const quoteAlnum = normAlnum(c.source_quote);
    function retrieved(claimText) {
      const hits = idx.search(claimText, TOP_K);
      return hits.some(h => normAlnum(chunkText.get(h.id) || '').includes(quoteAlnum));
    }
    const tv = tById.get(`t_${c.id}`);
    const fv = fById.get(`f_${c.id}`);
    rows.push({
      id: c.id, type: c.perturbation_type, expected: c.expected_perturbed_status,
      trueStatus: tv?.status || '(누락)', perturbedStatus: fv?.status || '(누락)',
      trueRetrieved: retrieved(c.true_claim), perturbedRetrieved: retrieved(c.perturbed_claim),
    });
  }
}

const n = rows.length;
const trueFP = rows.filter(r => NEG.has(r.trueStatus));
const caught = rows.filter(r => NEG.has(r.perturbedStatus));
const missed = rows.filter(r => !NEG.has(r.perturbedStatus));
const expectMatch = rows.filter(r => r.perturbedStatus === r.expected);
for (const r of rows) {
  byType[r.type] = byType[r.type] || { n: 0, caught: 0, expectMatch: 0 };
  byType[r.type].n++;
  if (NEG.has(r.perturbedStatus)) byType[r.type].caught++;
  if (r.perturbedStatus === r.expected) byType[r.type].expectMatch++;
}
// 원인 분해 (왜곡 claim 기준)
const retrY = rows.filter(r => r.perturbedRetrieved);
const retrN = rows.filter(r => !r.perturbedRetrieved);
const caughtRetrY = retrY.filter(r => NEG.has(r.perturbedStatus)).length;
const caughtRetrN = retrN.filter(r => NEG.has(r.perturbedStatus)).length;

const pct = (a, b) => b ? `${((a / b) * 100).toFixed(1)}%` : '-';
const lines = [];
lines.push('# Verifier 정면 평가 — 왜곡 claim 검출 (기계 채점)');
lines.push('');
lines.push('원문 문장에서 참 claim(설계상 supported)과, 핵심 요소 하나만 조작한 왜곡 claim');
lines.push('(설계상 unsupported/contradicted)을 쌍으로 생성해(생성: claude-sonnet-4-6, 검증 대상과 다른 모델),');
lines.push('실제 verifier(BM25 top-3 + 배치 판정, claude-opus-4-8)에 참/왜곡 세트를 **별도 호출**로 투입.');
lines.push('기대 라벨이 설계로 정해져 있어 채점은 문자열 비교(LLM judge 불필요).');
lines.push('');
lines.push('## 핵심 지표');
lines.push('');
lines.push('| 지표 | 값 |');
lines.push('|---|---|');
lines.push(`| 평가 쌍 | ${n}쌍 (논문 ${Object.keys(store.papers).length}편) |`);
lines.push(`| **왜곡 검출 recall** (unsupported/contradicted로 판정) | **${caught.length}/${n} (${pct(caught.length, n)})** |`);
lines.push(`| **참 claim 오탐률** (멀쩡한 claim을 깎음) | **${trueFP.length}/${n} (${pct(trueFP.length, n)})** |`);
lines.push(`| 세분 일치 (기대 라벨과 정확히 일치) | ${expectMatch.length}/${n} (${pct(expectMatch.length, n)}) |`);
lines.push('');
lines.push('## 왜곡 유형별 검출');
lines.push('');
lines.push('| 유형 | 검출 | 세분 일치 |');
lines.push('|---|---|---|');
for (const [type, s] of Object.entries(byType)) {
  lines.push(`| ${type} | ${s.caught}/${s.n} (${pct(s.caught, s.n)}) | ${s.expectMatch}/${s.n} |`);
}
lines.push('');
lines.push('## 원인 분해 — 검색 실패 vs 판단 실패 (왜곡 claim)');
lines.push('');
lines.push('source_quote가 BM25 top-3 청크에 포함됐는지로 분리 (verifier와 동일한 청크·검색 재현):');
lines.push('');
lines.push('| 근거가 검색됨? | 쌍 수 | 검출 | 해석 |');
lines.push('|---|---|---|---|');
lines.push(`| 포함 (판단만 문제) | ${retrY.length} | ${caughtRetrY}/${retrY.length} (${pct(caughtRetrY, retrY.length)}) | 놓치면 **판단 실패** |`);
lines.push(`| 미포함 (검색부터 실패) | ${retrN.length} | ${caughtRetrN}/${retrN.length} (${pct(caughtRetrN, retrN.length)}) | 근거 없이 판정 — 보수 원칙 의존 |`);
lines.push('');
if (missed.length) {
  lines.push('<details><summary>놓친 왜곡 claim (' + missed.length + '건)</summary>');
  lines.push('');
  for (const r of missed) lines.push(`- ${r.id} [${r.type}] → ${r.perturbedStatus} (검색 ${r.perturbedRetrieved ? '됨' : '안 됨'})`);
  lines.push('');
  lines.push('</details>');
  lines.push('');
}
if (trueFP.length) {
  lines.push('<details><summary>오탐된 참 claim (' + trueFP.length + '건)</summary>');
  lines.push('');
  for (const r of trueFP) lines.push(`- ${r.id} [${r.type}] → ${r.trueStatus} (검색 ${r.trueRetrieved ? '됨' : '안 됨'})`);
  lines.push('');
  lines.push('</details>');
  lines.push('');
}
if (missingRuns) lines.push(`주의: run 누락 논문 ${missingRuns}편 — run_verifier_eval.mjs 재실행 필요.`);
lines.push('데이터: `eval/data/claim_pairs.json` / run: `eval/runs/verifier-eval-*.json` (로컬).');

await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, lines.join('\n'), 'utf8');
console.log(`저장: ${outPath}`);
console.log(`recall ${caught.length}/${n} (${pct(caught.length, n)}) | 오탐 ${trueFP.length}/${n} (${pct(trueFP.length, n)}) | 세분 ${expectMatch.length}/${n}`);
console.log(`검색됨 검출 ${caughtRetrY}/${retrY.length} | 검색실패 검출 ${caughtRetrN}/${retrN.length}`);
