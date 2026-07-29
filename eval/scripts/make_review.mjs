// eval/scripts/make_review.mjs
// T5: 파일럿 결과를 사람이 직접 읽고 판단하기 위한 리뷰 파일 생성.
// 문항별로 질문 / gold / agent-evidence 출력 / single-llm 출력을 나란히 배치.
// 자동 채점(T6)보다 먼저 이 파일을 읽는 것이 목적.
//
// 사용법: node eval/scripts/make_review.mjs [--limit 20] [--out eval/results/pilot_review.md]
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeRunId, loadRun, isSuccessfulRun } from '../runner/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const argv = process.argv.slice(2);
function argValue(name, fallback = null) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}
const datasetPath = path.resolve(argValue('--dataset', path.join(__dirname, '..', 'data', 'qasper_subset.json')));
const limit = Number(argValue('--limit', '20'));
const outPath = path.resolve(argValue('--out', path.join(__dirname, '..', 'results', 'pilot_review.md')));
const SYSTEM_NAMES = ['agent-evidence', 'single-llm'];

const datasetName = path.basename(datasetPath, '.json').replace(/_subset$/, '');
const tasks = JSON.parse(await readFile(datasetPath, 'utf8')).slice(0, limit);

let totalRuns = 0, missing = 0, failures = 0;
const lines = [];
lines.push(`# 파일럿 리뷰 — ${datasetName} ${tasks.length}문항 × ${SYSTEM_NAMES.length}시스템`);
lines.push('');
lines.push('각 문항의 두 시스템 출력을 gold와 비교해 직접 판단하세요. (T6 자동 채점 전 게이트)');
lines.push('');

const failureList = [];

for (const task of tasks) {
  lines.push('---');
  lines.push('');
  lines.push(`## ${task.task_id} — ${task.paper_title}`);
  lines.push('');
  lines.push(`**질문:** ${task.question}`);
  lines.push('');
  lines.push(`**gold (${task.answer_type}):** ${task.gold_answer}`);
  if (task.evidence?.length) {
    lines.push('');
    lines.push('<details><summary>gold evidence</summary>');
    lines.push('');
    for (const e of task.evidence) lines.push(`> ${e.replace(/\n/g, ' ')}`);
    lines.push('');
    lines.push('</details>');
  }
  lines.push('');

  for (const system of SYSTEM_NAMES) {
    const runId = makeRunId(datasetName, system, task.task_id);
    const run = await loadRun(runId);
    totalRuns++;
    lines.push(`### ${system}${run ? ` (${(run.duration_ms / 1000).toFixed(1)}s)` : ''}`);
    lines.push('');
    if (!run) {
      missing++;
      failureList.push(`${runId}: run 파일 없음`);
      lines.push('_(run 파일 없음 — 아직 실행되지 않음)_');
    } else if (!isSuccessfulRun(run)) {
      failures++;
      failureList.push(`${runId}: ${(run.error || '빈 출력').split('\n')[0]}`);
      lines.push(`_(실패: ${run.error || '빈 출력'})_`);
    } else {
      lines.push(run.output.trim());
    }
    lines.push('');
  }
}

// ---- 실패 집계 (게이트: 40건 중 4건 이하) ----
const problem = failures + missing;
const gate = Math.max(4, Math.ceil(totalRuns * 0.1));
lines.splice(3, 0,
  `- 총 run: ${totalRuns} | 실패(에러/빈 출력): ${failures} | 미실행: ${missing}`,
  `- 게이트 기준: 실패 ${gate}건 이하 → **${problem <= gate ? '통과' : '초과 — 원인 분석 필요 (T6 진행 금지)'}**`,
  '');

await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, lines.join('\n'), 'utf8');

console.log(`리뷰 파일 생성: ${outPath}`);
console.log(`총 run ${totalRuns} | 실패 ${failures} | 미실행 ${missing} → 게이트(${gate}건 이하): ${problem <= gate ? '통과' : '초과'}`);
if (failureList.length) {
  console.log('문제 run 목록:');
  for (const f of failureList) console.log(`  - ${f}`);
}
