// eval/scripts/make_gold_audit.mjs
// judge가 INCORRECT로 판정한 run들을 모아 사람이 gold 품질을 감사하는 문서 생성.
// 목적: "시스템이 틀린 것"과 "gold가 나쁜 것(표 수치·질문 불일치·주석 누락)"을 구분.
// 사용법: node eval/scripts/make_gold_audit.mjs [--dataset eval/data/qasper_v2_subset.json]
//         [--out eval/results/gold_audit.md]
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
const outPath = path.resolve(argValue('--out', path.join(__dirname, '..', 'results', 'gold_audit.md')));
const SYSTEM_NAMES = ['agent-evidence', 'single-llm'];

const datasetName = path.basename(datasetPath, '.json').replace(/_subset$/, '');
const tasks = JSON.parse(await readFile(datasetPath, 'utf8'));
const byTaskId = new Map(tasks.map(t => [t.task_id, t]));

async function loadJudge(runId) {
  try {
    return JSON.parse(await readFile(path.join(RUNS_DIR, `${runId}.judge.json`), 'utf8'));
  } catch (err) {
    if (err?.code === 'ENOENT') return null;
    throw err;
  }
}

// INCORRECT 판정 run 수집 (문항 기준으로 묶어 두 시스템 판정을 나란히 보이게)
const incorrectByTask = new Map(); // task_id -> { [system]: {run, judge} }
for (const task of tasks) {
  for (const system of SYSTEM_NAMES) {
    const runId = makeRunId(datasetName, system, task.task_id);
    const judge = await loadJudge(runId);
    if (!judge || judge.verdict !== 'INCORRECT') continue;
    const run = await loadRun(runId);
    if (!incorrectByTask.has(task.task_id)) incorrectByTask.set(task.task_id, {});
    incorrectByTask.get(task.task_id)[system] = { run, judge };
  }
}

const lines = [];
lines.push(`# gold 감사 — ${datasetName} judge INCORRECT 문항 전수`);
lines.push('');
lines.push('> 각 문항에 대해 아래 셋 중 하나로 분류해 "감사 결과"를 채우세요.');
lines.push('> - **시스템 오답** — gold가 타당하고 시스템이 실제로 틀림');
lines.push('> - **gold 불량** — gold가 표 수치(입력에 없음)·질문 불일치·주석 누락 등으로 채점 불가');
lines.push('> - **judge 오판** — gold·시스템 답이 사실상 일치하는데 judge가 INCORRECT');
lines.push('');
const taskIds = [...incorrectByTask.keys()].sort();
const perSystemCount = Object.fromEntries(SYSTEM_NAMES.map(s => [s, 0]));
for (const tid of taskIds) {
  for (const s of SYSTEM_NAMES) if (incorrectByTask.get(tid)[s]) perSystemCount[s]++;
}
lines.push(`총 ${taskIds.length}개 문항 (${SYSTEM_NAMES.map(s => `${s} ${perSystemCount[s]}건`).join(', ')})`);
lines.push('');
lines.push('---');

for (const tid of taskIds) {
  const task = byTaskId.get(tid);
  const entry = incorrectByTask.get(tid);
  lines.push('');
  lines.push(`## ${tid} — ${task.paper_title || ''}`);
  lines.push('');
  lines.push(`**질문:** ${task.question}`);
  lines.push('');
  lines.push(`**gold (${task.answer_type}):** ${task.gold_answer}`);
  if (task.gold_all && String(task.gold_all).trim() && task.gold_all !== task.gold_answer) {
    lines.push('');
    lines.push(`**다른 gold 주석:** ${task.gold_all}`);
  }
  if (Array.isArray(task.evidence) && task.evidence.length) {
    lines.push('');
    lines.push('<details><summary>gold evidence</summary>');
    lines.push('');
    for (const ev of task.evidence) lines.push(`> ${String(ev).replace(/\n/g, ' ')}`);
    lines.push('');
    lines.push('</details>');
  }
  for (const system of SYSTEM_NAMES) {
    const e = entry[system];
    if (!e) continue;
    lines.push('');
    lines.push(`### ${system} — judge INCORRECT`);
    lines.push('');
    lines.push(`**judge 사유:** ${e.judge.reason || '(없음)'}`);
    lines.push('');
    lines.push('<details><summary>시스템 출력 전문</summary>');
    lines.push('');
    lines.push(e.run?.output || '(run 없음)');
    lines.push('');
    lines.push('</details>');
  }
  lines.push('');
  lines.push('**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — ');
  lines.push('');
  lines.push('---');
}

await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, lines.join('\n'), 'utf8');
console.log(`저장: ${outPath} (문항 ${taskIds.length}개)`);
