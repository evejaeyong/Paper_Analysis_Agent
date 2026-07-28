// eval/scripts/make_judge_check.mjs
// T6: judge 판정 목록에서 무작위 15건을 뽑아 사람 검증용 파일 생성
// → eval/results/judge_check.md (사용자가 직접 재채점해 judge 일치율 계산)
//
// 사용법: node eval/scripts/make_judge_check.mjs [--dataset ...] [--n 15] [--seed 42]
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeRunId, loadRun, RUNS_DIR } from '../runner/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const argv = process.argv.slice(2);
function argValue(name, fallback = null) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}
const datasetPath = path.resolve(argValue('--dataset', path.join(__dirname, '..', 'data', 'qasper_v2_subset.json')));
const n = Number(argValue('--n', '15'));
const seed = Number(argValue('--seed', '42'));
const outPath = path.resolve(argValue('--out', path.join(__dirname, '..', 'results', 'judge_check.md')));
const SYSTEM_NAMES = ['agent-evidence', 'single-llm'];

const datasetName = path.basename(datasetPath, '.json').replace(/_subset$/, '');
const tasks = JSON.parse(await readFile(datasetPath, 'utf8'));
const taskById = new Map(tasks.map(t => [t.task_id, t]));

// 결정적 셔플 (LCG) — 같은 seed면 항상 같은 15건
function lcg(s) {
  let x = s >>> 0;
  return () => ((x = (1103515245 * x + 12345) >>> 0) / 2 ** 32);
}

async function loadJudge(runId) {
  try {
    return JSON.parse(await readFile(path.join(RUNS_DIR, `${runId}.judge.json`), 'utf8'));
  } catch (err) {
    if (err?.code === 'ENOENT') return null;
    throw err;
  }
}

// 판정 완료된 run 전부 수집
const judged = [];
for (const task of tasks) {
  for (const system of SYSTEM_NAMES) {
    const runId = makeRunId(datasetName, system, task.task_id);
    const judge = await loadJudge(runId);
    if (judge?.verdict) judged.push({ runId, system, task, judge });
  }
}
if (!judged.length) {
  console.error('판정된 run이 없습니다 — 먼저 judge.js를 실행하세요.');
  process.exit(1);
}

const rand = lcg(seed);
const shuffled = [...judged].sort(() => rand() - 0.5);
const sample = shuffled.slice(0, Math.min(n, shuffled.length));

const lines = [];
lines.push(`# judge 사람 검증 — 무작위 ${sample.length}건 (seed=${seed})`);
lines.push('');
lines.push('각 항목의 "사람 판정" 칸을 직접 채워 judge와의 일치율을 계산하세요.');
lines.push('');
for (const [i, { runId, system, task, judge }] of sample.entries()) {
  const run = await loadRun(runId);
  lines.push('---');
  lines.push('');
  lines.push(`## ${i + 1}. ${task.task_id} / ${system}`);
  lines.push('');
  lines.push(`**질문:** ${task.question}`);
  lines.push('');
  lines.push(`**gold (${task.answer_type}):** ${task.gold_answer}`);
  if (task.gold_all?.length > 1) {
    lines.push('');
    lines.push(`**다른 gold 주석:** ${task.gold_all.map(g => g.answer).join(' ⟋ ')}`);
  }
  lines.push('');
  lines.push('**시스템 출력:**');
  lines.push('');
  lines.push((run?.output || '(없음)').trim());
  lines.push('');
  lines.push(`**judge 판정:** ${judge.verdict} — ${judge.reason || ''}`);
  lines.push('');
  lines.push('**사람 판정:** [ CORRECT / INCORRECT ] — ');
  lines.push('');
}

await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, lines.join('\n'), 'utf8');
console.log(`저장: ${outPath} (${sample.length}건)`);
