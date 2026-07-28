// eval/scripts/smoke.mjs
// T3 스모크: 두 시스템을 qasper_subset의 1번 문항으로 단발 실행 (순차 — 병렬 금지).
// 사용법: node eval/scripts/smoke.mjs [--task q0001] [--system agent-evidence|single-llm]
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as agentEvidence from '../systems/agentEvidence.js';
import * as singleLlm from '../systems/singleLlm.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATASET = path.join(__dirname, '..', 'data', 'qasper_subset.json');

const argv = process.argv.slice(2);
function argValue(name) {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : null;
}

const taskId = argValue('--task') || 'q0001';
const only = argValue('--system');

const tasks = JSON.parse(await readFile(DATASET, 'utf8'));
const task = tasks.find(t => t.task_id === taskId);
if (!task) {
  console.error(`문항 없음: ${taskId}`);
  process.exit(1);
}

console.log(`문항: ${task.task_id} (${task.answer_type})`);
console.log(`논문: ${task.paper_title}`);
console.log(`질문: ${task.question}`);
console.log(`gold: ${task.gold_answer}`);

const systems = [agentEvidence, singleLlm].filter(s => !only || s.SYSTEM_NAME === only);
for (const sys of systems) {
  const meta = sys.getMeta();
  console.log(`\n=== ${sys.SYSTEM_NAME} (${meta.backend}/${meta.model}) ===`);
  const t0 = Date.now();
  try {
    const out = await sys.answer(task);
    console.log(`(${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    console.log(out);
  } catch (err) {
    console.error(`(${((Date.now() - t0) / 1000).toFixed(1)}s) 실패:`, err?.message || err);
    process.exitCode = 1;
  }
}
