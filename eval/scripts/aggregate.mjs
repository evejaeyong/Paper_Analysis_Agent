// eval/scripts/aggregate.mjs
// T6: judge 판정 집계 — 시스템별 accuracy, answer_type별 accuracy, 평균 duration
// → eval/results/summary.md
//
// 사용법: node eval/scripts/aggregate.mjs [--dataset eval/data/qasper_v2_subset.json] [--out eval/results/summary.md]
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
const datasetPath = path.resolve(argValue('--dataset', path.join(__dirname, '..', 'data', 'qasper_v2_subset.json')));
const outPath = path.resolve(argValue('--out', path.join(__dirname, '..', 'results', 'summary.md')));
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

// 수집: system → { rows: [{task, run, judge}] }
const bySystem = new Map(SYSTEM_NAMES.map(s => [s, []]));
for (const task of tasks) {
  for (const system of SYSTEM_NAMES) {
    const runId = makeRunId(datasetName, system, task.task_id);
    const run = await loadRun(runId);
    const judge = await loadJudge(runId);
    bySystem.get(system).push({ task, run, judge });
  }
}

function pct(n, d) {
  return d ? `${((n / d) * 100).toFixed(1)}%` : '-';
}

const lines = [];
lines.push(`# 평가 결과 요약 — ${datasetName} (${tasks.length}문항 × ${SYSTEM_NAMES.length}시스템)`);
lines.push('');
lines.push(`- judge: 판정 파일(\`*.judge.json\`) 기준. CORRECT/INCORRECT만 accuracy 분모에 포함.`);
lines.push('');

// ---- 시스템별 요약 표 ----
lines.push('## 시스템별 결과');
lines.push('');
lines.push('| 시스템 | 판정 완료 | CORRECT | accuracy | run 실패 | 미판정 | 평균 duration | 평균 출력 길이 |');
lines.push('|---|---|---|---|---|---|---|---|');
for (const system of SYSTEM_NAMES) {
  const rows = bySystem.get(system);
  const judged = rows.filter(r => r.judge?.verdict);
  const correct = judged.filter(r => r.judge.verdict === 'CORRECT');
  const runFailed = rows.filter(r => r.run && !isSuccessfulRun(r.run));
  const unjudged = rows.filter(r => isSuccessfulRun(r.run) && !r.judge?.verdict);
  const okRuns = rows.filter(r => isSuccessfulRun(r.run));
  const avgDur = okRuns.length ? okRuns.reduce((a, r) => a + r.run.duration_ms, 0) / okRuns.length / 1000 : 0;
  const avgLen = okRuns.length ? okRuns.reduce((a, r) => a + (r.run.output || '').length, 0) / okRuns.length : 0;
  lines.push(`| ${system} | ${judged.length}/${rows.length} | ${correct.length} | **${pct(correct.length, judged.length)}** | ${runFailed.length} | ${unjudged.length} | ${avgDur.toFixed(1)}s | ${Math.round(avgLen)}자 |`);
}
lines.push('');

// ---- answer_type별 accuracy ----
lines.push('## answer_type별 accuracy');
lines.push('');
const types = [...new Set(tasks.map(t => t.answer_type))];
lines.push(`| answer_type | 문항 수 | ${SYSTEM_NAMES.join(' | ')} |`);
lines.push(`|---|---|${SYSTEM_NAMES.map(() => '---').join('|')}|`);
for (const type of types) {
  const cells = SYSTEM_NAMES.map(system => {
    const rows = bySystem.get(system).filter(r => r.task.answer_type === type && r.judge?.verdict);
    const correct = rows.filter(r => r.judge.verdict === 'CORRECT');
    return `${pct(correct.length, rows.length)} (${correct.length}/${rows.length})`;
  });
  lines.push(`| ${type} | ${tasks.filter(t => t.answer_type === type).length} | ${cells.join(' | ')} |`);
}
lines.push('');

// ---- 시스템 간 판정 갈린 문항 ----
lines.push('## 두 시스템의 판정이 갈린 문항');
lines.push('');
const diverged = [];
for (const task of tasks) {
  const verdicts = SYSTEM_NAMES.map(s => bySystem.get(s).find(r => r.task.task_id === task.task_id)?.judge?.verdict);
  if (verdicts.every(Boolean) && new Set(verdicts).size > 1) {
    diverged.push({ task, verdicts });
  }
}
if (!diverged.length) {
  lines.push('(없음)');
} else {
  lines.push(`| 문항 | 질문 | ${SYSTEM_NAMES.join(' | ')} |`);
  lines.push(`|---|---|${SYSTEM_NAMES.map(() => '---').join('|')}|`);
  for (const { task, verdicts } of diverged) {
    lines.push(`| ${task.task_id} | ${task.question.slice(0, 60)} | ${verdicts.join(' | ')} |`);
  }
}
lines.push('');

await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, lines.join('\n'), 'utf8');
console.log(`저장: ${outPath}`);
console.log(lines.slice(4, 12).join('\n'));
