// eval/scripts/aggregate_judged.mjs
// judge 판정이 있는 데이터셋(unanswerable·false premise 등)의 범용 집계기.
// CORRECT = 올바른 행동(거절/전제 바로잡음), INCORRECT = 할루시네이션.
//
// 사용법: node eval/scripts/aggregate_judged.mjs --dataset eval/data/qasper_unans_subset.json \
//   --out eval/results/unans_summary.md --title "unanswerable 거절 테스트"
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeRunId, loadRun, isSuccessfulRun, RUNS_DIR } from '../runner/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const argv = process.argv.slice(2);
function argValue(name, fallback = null) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}
const datasetPath = path.resolve(argValue('--dataset'));
const outPath = path.resolve(argValue('--out'));
const title = argValue('--title', '판정 집계');
const SYSTEM_NAMES = ['agent-evidence', 'single-llm'];

const datasetName = path.basename(datasetPath, '.json').replace(/_subset$/, '');
const tasks = JSON.parse(await readFile(datasetPath, 'utf8'));

async function loadJudge(runId) {
  try {
    return JSON.parse(await readFile(path.join(RUNS_DIR, `${runId}.judge.json`), 'utf8'));
  } catch (err) {
    if (err?.code === 'ENOENT') return null;
    throw err;
  }
}

const bySystem = new Map(SYSTEM_NAMES.map(s => [s, []]));
for (const task of tasks) {
  for (const system of SYSTEM_NAMES) {
    const runId = makeRunId(datasetName, system, task.task_id);
    bySystem.get(system).push({ task, run: await loadRun(runId), judge: await loadJudge(runId) });
  }
}

const pct = (n, d) => d ? `${((n / d) * 100).toFixed(1)}%` : '-';
const lines = [];
lines.push(`# ${title} — ${datasetName} (${tasks.length}문항)`);
lines.push('');
lines.push('CORRECT = 올바른 행동(거절/전제 바로잡음), **INCORRECT = 답을 지어냄(할루시네이션)**.');
lines.push('');
lines.push('| 시스템 | 판정 완료 | CORRECT | **할루시네이션(INCORRECT)** | 할루시네이션율 | run 실패 | 미판정 |');
lines.push('|---|---|---|---|---|---|---|');
for (const system of SYSTEM_NAMES) {
  const rows = bySystem.get(system);
  const judged = rows.filter(r => r.judge?.verdict);
  const correct = judged.filter(r => r.judge.verdict === 'CORRECT').length;
  const incorrect = judged.length - correct;
  const runFailed = rows.filter(r => r.run && !isSuccessfulRun(r.run)).length;
  const unjudged = rows.filter(r => isSuccessfulRun(r.run) && !r.judge?.verdict).length;
  lines.push(`| ${system} | ${judged.length}/${rows.length} | ${correct} (${pct(correct, judged.length)}) | **${incorrect}** | **${pct(incorrect, judged.length)}** | ${runFailed} | ${unjudged} |`);
}
lines.push('');
for (const system of SYSTEM_NAMES) {
  const bad = bySystem.get(system).filter(r => r.judge?.verdict === 'INCORRECT');
  lines.push(`## ${system} — 할루시네이션 문항 (${bad.length}건)`);
  lines.push('');
  if (!bad.length) { lines.push('(없음)'); lines.push(''); continue; }
  for (const { task, run, judge } of bad) {
    lines.push(`### ${task.task_id}: ${task.question}`);
    if (task.premise_entity) lines.push(`- 거짓 전제 대상: **${task.premise_entity}**`);
    lines.push(`- judge: ${judge.reason || ''}`);
    lines.push(`- 출력(앞부분): ${String(run?.output || '').slice(0, 300).replace(/\n/g, ' ')}`);
    lines.push('');
  }
}

await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, lines.join('\n'), 'utf8');
console.log(`저장: ${outPath}`);
for (const system of SYSTEM_NAMES) {
  const rows = bySystem.get(system);
  const judged = rows.filter(r => r.judge?.verdict);
  const inc = judged.filter(r => r.judge.verdict === 'INCORRECT').length;
  console.log(`${system}: 할루시네이션 ${inc}/${judged.length} (${pct(inc, judged.length)})`);
}
