// eval/scripts/rerun_quote_guard.mjs
// 인용 가드(core/quoteGuard.js + evidence 수선 패스) 효과 측정.
// 기존 qasper_v2 agent-evidence run 중 위조 인용이 있던 문항만 새 코드로 재실행해
// (run_id 접두사 qasper_v2qg — 기존 run 보존), 전/후 위조 인용 수를 비교한다.
// LLM 호출은 전부 순차. resume: 이미 성공한 qg run은 건너뜀.
// 사용법: node eval/scripts/rerun_quote_guard.mjs [--limit N]
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeRunId, loadRun, saveRun, isSuccessfulRun } from '../runner/logger.js';
import { findEvidence } from '../../agents/evidence.js';
import * as llmConfig from '../../core/llmConfig.js';
import { extractQuotes, verifyQuote } from '../../core/quoteGuard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
function argValue(name, fallback = null) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}
const limit = Number(argValue('--limit', '0')) || 0;

const datasetPath = path.join(__dirname, '..', 'data', 'qasper_v2_subset.json');
const outPath = path.join(__dirname, '..', 'results', 'quote_guard_ab.md');
const OLD_DATASET = 'qasper_v2';
const NEW_DATASET = 'qasper_v2qg';
const SYSTEM = 'agent-evidence';

const tasks = JSON.parse(await readFile(datasetPath, 'utf8'));

const normWs = s => (s || '').replace(/\s+/g, ' ').trim();
const normAlnum = s => (s || '').toLowerCase().replace(/[^a-z0-9가-힣]+/g, '');

function fabStats(output, paperText) {
  const docWs = normWs(paperText);
  const docAlnum = normAlnum(paperText);
  let checked = 0, fabricated = 0;
  const fabQuotes = [];
  for (const q of extractQuotes(output || '')) {
    const v = verifyQuote(q, docWs, docAlnum);
    if (v === 'skip' || v === 'korean') continue;
    checked++;
    if (v === 'fabricated') { fabricated++; fabQuotes.push(q); }
  }
  return { checked, fabricated, fabQuotes };
}

// 1) 기존 run에서 위조 인용이 있던 문항 선정
const affected = [];
for (const task of tasks) {
  const oldRun = await loadRun(makeRunId(OLD_DATASET, SYSTEM, task.task_id));
  if (!isSuccessfulRun(oldRun)) continue;
  const s = fabStats(oldRun.output, task.paper_full_text);
  if (s.fabricated > 0) affected.push({ task, old: s });
}
const targets = limit > 0 ? affected.slice(0, limit) : affected;
console.log(`위조 인용 포함 기존 run: ${affected.length}건 → 재실행 대상 ${targets.length}건`);

// 2) 순차 재실행 (resume)
const role = llmConfig.getRole('evidence');
let done = 0;
for (const { task } of targets) {
  done++;
  const runId = makeRunId(NEW_DATASET, SYSTEM, task.task_id);
  const existing = await loadRun(runId);
  if (isSuccessfulRun(existing)) {
    console.log(`[${done}/${targets.length}] ${task.task_id} ... skip (완료됨)`);
    continue;
  }
  const startedAt = new Date().toISOString();
  const t0 = Date.now();
  let output = null, error = null;
  try {
    output = await findEvidence({ documentText: task.paper_full_text, question: task.question });
  } catch (err) {
    error = err?.message || String(err);
  }
  const durationMs = Date.now() - t0;
  await saveRun({
    run_id: runId, system: SYSTEM, task_id: task.task_id,
    question: task.question, gold_answer: task.gold_answer,
    output, error, started_at: startedAt, duration_ms: durationMs,
    backend: role.backend, model: role.model, prompt_version: 'v1+quoteguard',
  });
  console.log(`[${done}/${targets.length}] ${task.task_id} ... ${error ? 'ERROR: ' + error : (durationMs / 1000).toFixed(1) + 's'}`);
}

// 3) 전/후 비교 집계
const rows = [];
let oldChecked = 0, oldFab = 0, newChecked = 0, newFab = 0, newRunsWithFab = 0, failed = 0;
for (const { task, old } of targets) {
  const newRun = await loadRun(makeRunId(NEW_DATASET, SYSTEM, task.task_id));
  if (!isSuccessfulRun(newRun)) {
    failed++;
    rows.push({ id: task.task_id, old, next: null });
    continue;
  }
  const next = fabStats(newRun.output, task.paper_full_text);
  oldChecked += old.checked; oldFab += old.fabricated;
  newChecked += next.checked; newFab += next.fabricated;
  if (next.fabricated > 0) newRunsWithFab++;
  rows.push({ id: task.task_id, old, next });
}

const pct = (n, d) => d ? `${((n / d) * 100).toFixed(1)}%` : '-';
const lines = [];
lines.push('# 인용 가드 전/후 비교 — qasper_v2 agent-evidence 위조 인용 문항 재실행');
lines.push('');
lines.push('가드: 답변의 따옴표 인용을 원문 대조 → 위조 발견 시 1회 수선 호출 (agents/evidence.js).');
lines.push(`재실행 대상: 기존 run에서 위조 인용이 있던 ${targets.length}문항 (동일 문항·동일 모델·새 코드).`);
lines.push('');
lines.push('| 지표 | 가드 전 (기존 run) | 가드 후 (재실행) |');
lines.push('|---|---|---|');
lines.push(`| 검사 인용 수 | ${oldChecked} | ${newChecked} |`);
lines.push(`| fabricated | **${oldFab}** (${pct(oldFab, oldChecked)}) | **${newFab}** (${pct(newFab, newChecked)}) |`);
lines.push(`| 위조 포함 run | ${targets.length}/${targets.length} (선정 기준) | ${newRunsWithFab}/${targets.length - failed} |`);
if (failed) lines.push(`| 재실행 실패 | - | ${failed}건 |`);
lines.push('');
lines.push('## 문항별');
lines.push('');
lines.push('| 문항 | 전: 검사/위조 | 후: 검사/위조 | 후 위조 인용 |');
lines.push('|---|---|---|---|');
for (const r of rows) {
  const after = r.next ? `${r.next.checked}/${r.next.fabricated}` : '(실패)';
  const fq = r.next?.fabQuotes?.length ? r.next.fabQuotes.map(q => `"${q.slice(0, 80)}…"`).join('<br>') : '';
  lines.push(`| ${r.id} | ${r.old.checked}/${r.old.fabricated} | ${after} | ${fq} |`);
}
lines.push('');
lines.push('주의: 동일 문항 재실행이므로 비결정성(같은 코드라도 출력이 달라짐)이 섞여 있음.');
lines.push('가드의 효과는 "출력 시점에 인용이 기계 검증을 통과했는가"로 해석할 것 (후 fabricated ≈ 수선 실패 잔여).');

await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, lines.join('\n'), 'utf8');
console.log(`저장: ${outPath}`);
console.log(`가드 전: ${oldFab}/${oldChecked} fabricated → 가드 후: ${newFab}/${newChecked} (위조 포함 run ${newRunsWithFab}건, 실패 ${failed}건)`);
