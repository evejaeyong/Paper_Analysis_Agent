// eval/scripts/smoke_logger.mjs
// T1 로거 스모크: 쓰기 → 읽기 → 필드 검증 → 정리. LLM 호출 없음.
import assert from 'node:assert/strict';
import { makeRunId, saveRun, loadRun, deleteRun, isSuccessfulRun, loadAllRuns } from '../runner/logger.js';

const runId = makeRunId('qasper', 'smoke-test', 'q9999');
assert.equal(runId, 'qasper-smoke-test-q9999');

const record = {
  run_id: runId,
  system: 'smoke-test',
  task_id: 'q9999',
  question: '스모크 질문',
  gold_answer: '스모크 정답',
  output: '스모크 출력',
  error: null,
  started_at: new Date().toISOString(),
  duration_ms: 123,
  backend: 'claude',
  model: 'claude-opus-4-8',
  prompt_version: 'v1',
};

const file = await saveRun(record);
console.log('저장:', file);

const loaded = await loadRun(runId);
assert.deepEqual(loaded, record);
assert.ok(isSuccessfulRun(loaded));
assert.ok(!isSuccessfulRun({ ...record, error: 'boom' }));
assert.ok(!isSuccessfulRun({ ...record, output: '' }));
assert.ok((await loadAllRuns()).some(r => r.run_id === runId));

// 미존재 run은 null
assert.equal(await loadRun('qasper-smoke-test-없음'), null);

await deleteRun(runId);
assert.equal(await loadRun(runId), null);

console.log('T1 로거 스모크 통과 ✔');
