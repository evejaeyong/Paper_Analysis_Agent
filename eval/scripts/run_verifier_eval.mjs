// eval/scripts/run_verifier_eval.mjs
// claim_pairs.json의 참/왜곡 claim을 실제 verifier(agents/verifier.js — BM25 top-3 + 배치 판정)로 검증.
// 쌍둥이 유출 방지를 위해 참 세트와 왜곡 세트를 논문별로 **별도 호출**로 나눠 실행한다
// (같은 배치에 참/왜곡 쌍이 함께 있으면 상호 대조로 문제가 쉬워짐).
// 결과: eval/runs/verifier-eval-{pid}-{true|perturbed}.json (resume: 파일 존재+정상이면 skip)
// 실행 순차 (verifier 내부의 기존 동시성은 그대로).
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { run as runVerifier } from '../../agents/verifier.js';
import { getCurrent as getPrompts } from '../../core/promptStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pairsPath = path.join(__dirname, '..', 'data', 'claim_pairs.json');
const runsDir = path.join(__dirname, '..', 'runs');
const store = JSON.parse(await readFile(pairsPath, 'utf8'));
const tasks = JSON.parse(await readFile(path.join(__dirname, '..', 'data', 'qasper_v2_subset.json'), 'utf8'));
const taskById = new Map(tasks.map(t => [t.task_id, t]));
const prompts = await getPrompts();

async function loadRun(file) {
  try { return JSON.parse(await readFile(file, 'utf8')); } catch { return null; }
}

const pids = Object.keys(store.papers).sort();
const jobs = [];
for (const pid of pids) {
  const entry = store.papers[pid];
  if (!entry.claims?.length) continue;
  jobs.push([pid, 'true', entry.claims.map(c => ({ id: `t_${c.id}`, text: c.true_claim, sourceSection: '' }))]);
  jobs.push([pid, 'perturbed', entry.claims.map(c => ({ id: `f_${c.id}`, text: c.perturbed_claim, sourceSection: '' }))]);
}
console.log(`대상: 논문 ${pids.length}편 × 2세트 = ${jobs.length} runs`);

let done = 0;
for (const [pid, setName, claims] of jobs) {
  done++;
  const file = path.join(runsDir, `verifier-eval-${pid}-${setName}.json`);
  const existing = await loadRun(file);
  if (existing?.verdicts?.length === claims.length && !existing.error) {
    console.log(`[${done}/${jobs.length}] ${pid}/${setName} ... skip (완료됨)`);
    continue;
  }
  const entry = store.papers[pid];
  const paper = taskById.get(entry.task_id);
  const t0 = Date.now();
  let verdicts = null, error = null;
  try {
    const res = await runVerifier({ paperText: paper.paper_full_text, prompts, claims, verificationFocus: '', llm: {} });
    verdicts = res.map(v => ({ claimId: v.claim.id, status: v.status, evidenceQuote: v.evidenceQuote, confidence: v.confidence, note: v.note }));
  } catch (err) {
    error = String(err?.message || err);
  }
  await mkdir(runsDir, { recursive: true });
  await writeFile(file, JSON.stringify({ pid, set: setName, claims, verdicts, error, duration_ms: Date.now() - t0, at: new Date().toISOString() }, null, 2), 'utf8');
  console.log(`[${done}/${jobs.length}] ${pid}/${setName} ... ${error ? 'ERROR: ' + error.slice(0, 100) : ((Date.now() - t0) / 1000).toFixed(1) + 's ' + verdicts.map(v => v.status[0]).join('')}`);
}
console.log('실행 완료 — 채점: node eval/scripts/score_verifier_eval.mjs');
