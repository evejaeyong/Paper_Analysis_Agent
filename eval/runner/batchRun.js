// eval/runner/batchRun.js
// 문항 × 시스템 조합을 **순차** 실행하는 배치 러너 (CLI subprocess rate limit 때문에 병렬 금지).
// resume: 시작 전 eval/runs/ 를 스캔해 이미 성공한 run_id는 skip.
//
// 사용법:
//   node eval/runner/batchRun.js --dataset eval/data/qasper_subset.json \
//     --systems agent-evidence,single-llm --limit 20 [--retry-errors]
//
//   --limit N        앞에서 N문항만 (파일럿용)
//   --retry-errors   error 필드가 있는 run만 재실행 (신규 실행 안 함)
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeRunId, saveRun, loadRun, isSuccessfulRun } from './logger.js';
import * as agentEvidence from '../systems/agentEvidence.js';
import * as singleLlm from '../systems/singleLlm.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPT_VERSION = 'v1';

const SYSTEMS = {
  [agentEvidence.SYSTEM_NAME]: agentEvidence,
  [singleLlm.SYSTEM_NAME]: singleLlm,
};

// ---- CLI 인자 ----
const argv = process.argv.slice(2);
function argValue(name, fallback = null) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}
const datasetPath = path.resolve(argValue('--dataset', path.join(__dirname, '..', 'data', 'qasper_subset.json')));
const systemNames = argValue('--systems', Object.keys(SYSTEMS).join(',')).split(',').map(s => s.trim()).filter(Boolean);
const limit = argValue('--limit') ? Number(argValue('--limit')) : null;
const retryErrors = argv.includes('--retry-errors');

for (const name of systemNames) {
  if (!SYSTEMS[name]) {
    console.error(`알 수 없는 시스템: ${name} (가능: ${Object.keys(SYSTEMS).join(', ')})`);
    process.exit(1);
  }
}

// run_id의 dataset 부분: 파일명에서 확장자·_subset 접미사 제거 (qasper_subset.json → qasper)
const datasetName = path.basename(datasetPath, '.json').replace(/_subset$/, '');

// ---- 작업 목록 ----
let tasks = JSON.parse(await readFile(datasetPath, 'utf8'));
if (Number.isFinite(limit) && limit > 0) tasks = tasks.slice(0, limit);

// 문항-우선 순서: 같은 문항의 두 시스템 결과가 나란히 실행됨
const jobs = [];
for (const task of tasks) {
  for (const name of systemNames) jobs.push({ task, system: name });
}

console.log(`dataset: ${datasetName} (${datasetPath})`);
console.log(`systems: ${systemNames.join(', ')} | 문항 ${tasks.length}개 → ${jobs.length} runs${retryErrors ? ' | --retry-errors' : ''}`);

// ---- 순차 실행 ----
let ran = 0, ok = 0, failed = 0, skippedDone = 0, skippedError = 0, skippedNew = 0;

for (let i = 0; i < jobs.length; i++) {
  const { task, system } = jobs[i];
  const prefix = `[${i + 1}/${jobs.length}] ${system} ${task.task_id}`;
  const runId = makeRunId(datasetName, system, task.task_id);
  const existing = await loadRun(runId);

  // resume 판별
  if (isSuccessfulRun(existing)) {
    skippedDone++;
    console.log(`${prefix} ... skip (완료됨)`);
    continue;
  }
  if (existing && existing.error != null && !retryErrors) {
    skippedError++;
    console.log(`${prefix} ... skip (에러 — --retry-errors 로 재실행)`);
    continue;
  }
  if (!existing && retryErrors) {
    skippedNew++;
    continue; // retry 모드에서는 error가 있는 run만 재실행
  }

  const sys = SYSTEMS[system];
  const meta = sys.getMeta();
  const startedAt = new Date().toISOString();
  const t0 = Date.now();
  let output = null, error = null;

  try {
    output = await sys.answer(task);
    if (!output || !output.trim()) { output = output ?? ''; error = '빈 출력'; }
  } catch (err) {
    error = String(err?.message || err);
  }

  const durationMs = Date.now() - t0;
  await saveRun({
    run_id: runId,
    system,
    task_id: task.task_id,
    question: task.question,
    gold_answer: task.gold_answer,
    output,
    error,
    started_at: startedAt,
    duration_ms: durationMs,
    backend: meta.backend,
    model: meta.model,
    prompt_version: PROMPT_VERSION,
  });

  ran++;
  const secs = (durationMs / 1000).toFixed(1);
  if (error) {
    failed++;
    console.log(`${prefix} ... ${secs}s ERROR: ${error.split('\n')[0].slice(0, 120)}`);
  } else {
    ok++;
    console.log(`${prefix} ... ${secs}s`);
  }
}

// ---- 요약 ----
console.log('---');
console.log(`실행 ${ran} (성공 ${ok}, 실패 ${failed}) | skip: 완료 ${skippedDone}, 에러 ${skippedError}${retryErrors ? `, 미실행 ${skippedNew}` : ''}`);
if (failed + skippedError > 0 && !retryErrors) {
  console.log(`에러 run ${failed + skippedError}건 — 재시도: node eval/runner/batchRun.js --dataset ${path.relative(process.cwd(), datasetPath)} --systems ${systemNames.join(',')}${limit ? ` --limit ${limit}` : ''} --retry-errors`);
}
process.exitCode = 0; // 개별 실패는 error 기록으로 처리 — 전체 중단/실패 아님
