// eval/scoring/judge.js
// T6: LLM judge — (질문, gold, 시스템 출력) → CORRECT | INCORRECT.
//
// Judge는 피평가 시스템(claude backend)과 **다른 backend**를 사용한다: codex(gpt-5.5).
// 판정 결과는 eval/runs/{run_id}.judge.json 으로 저장 (원본 run 파일 수정 금지).
// resume: 이미 판정된 run은 skip. --retry-errors 는 judge 에러 건만 재실행.
//
// 사용법:
//   node eval/scoring/judge.js --dataset eval/data/qasper_v2_subset.json \
//     --systems agent-evidence,single-llm [--limit N] [--retry-errors]
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { callLLM } from '../../core/llm.js';
import { fillTemplate } from '../../core/promptStore.js';
import { makeRunId, loadRun, isSuccessfulRun, RUNS_DIR } from '../runner/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const JUDGE_TIMEOUT_MS = 180_000;

// ---- CLI 인자 ----
const argv = process.argv.slice(2);
function argValue(name, fallback = null) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}

// 피평가 시스템과 **다른 backend/model**을 쓸 것 (시스템: claude/claude-opus-4-8).
// 기본은 codex(gpt-5.5). codex 사용량 한도 소진 시 --judge-backend claude
// --judge-model claude-sonnet-4-6 으로 폴백 (같은 backend라도 반드시 다른 모델).
const JUDGE = {
  backend: argValue('--judge-backend', 'codex'),
  model: argValue('--judge-model', 'gpt-5.5'),
  reasoningEffort: argValue('--judge-effort', 'medium'),
};
const datasetPath = path.resolve(argValue('--dataset', path.join(__dirname, '..', 'data', 'qasper_v2_subset.json')));
// 판정 프롬프트 교체 가능 (할루시네이션 평가: unans_judge.md, falseprem_judge.md)
const judgePromptPath = path.resolve(argValue('--judge-prompt', path.join(__dirname, 'prompts', 'qa_judge.md')));
const systemNames = argValue('--systems', 'agent-evidence,single-llm').split(',').map(s => s.trim()).filter(Boolean);
const limit = argValue('--limit') ? Number(argValue('--limit')) : null;
const retryErrors = argv.includes('--retry-errors');

const datasetName = path.basename(datasetPath, '.json').replace(/_subset$/, '');
let tasks = JSON.parse(await readFile(datasetPath, 'utf8'));
if (Number.isFinite(limit) && limit > 0) tasks = tasks.slice(0, limit);
const taskById = new Map(tasks.map(t => [t.task_id, t]));

const judgeTemplate = await readFile(judgePromptPath, 'utf8');

function judgePath(runId) {
  return path.join(RUNS_DIR, `${runId}.judge.json`);
}

async function loadJudge(runId) {
  try {
    return JSON.parse(await readFile(judgePath(runId), 'utf8'));
  } catch (err) {
    if (err?.code === 'ENOENT') return null;
    throw err;
  }
}

async function saveJudge(record) {
  await mkdir(RUNS_DIR, { recursive: true });
  const file = judgePath(record.run_id);
  const tmp = `${file}.tmp`;
  await writeFile(tmp, JSON.stringify(record, null, 2), 'utf8');
  await rename(tmp, file);
}

/** judge 출력 파싱: 첫 줄 CORRECT|INCORRECT, 둘째 줄 근거 */
function parseVerdict(raw) {
  const lines = (raw || '').trim().split('\n').map(l => l.trim()).filter(Boolean);
  const first = (lines[0] || '').toUpperCase();
  if (first === 'CORRECT' || first === 'INCORRECT') {
    return { verdict: first, reason: lines.slice(1).join(' ') };
  }
  return null;
}

// ---- 순차 실행 ----
const jobs = [];
for (const task of tasks) {
  for (const system of systemNames) jobs.push({ task, system });
}
console.log(`judge: ${JUDGE.backend}/${JUDGE.model} | 대상 ${jobs.length} runs${retryErrors ? ' | --retry-errors' : ''}`);

let judged = 0, ok = 0, failed = 0, skippedDone = 0, skippedNoRun = 0, skippedError = 0;

for (let i = 0; i < jobs.length; i++) {
  const { task, system } = jobs[i];
  const runId = makeRunId(datasetName, system, task.task_id);
  const prefix = `[${i + 1}/${jobs.length}] judge ${system} ${task.task_id}`;

  const existing = await loadJudge(runId);
  if (existing?.verdict) { skippedDone++; continue; }
  if (existing?.error && !retryErrors) {
    skippedError++;
    console.log(`${prefix} ... skip (judge 에러 — --retry-errors 로 재실행)`);
    continue;
  }
  if (!existing && retryErrors) { continue; }

  const run = await loadRun(runId);
  if (!isSuccessfulRun(run)) {
    skippedNoRun++;
    console.log(`${prefix} ... skip (성공한 run 없음)`);
    continue;
  }

  const goldAll = (task.gold_all || [])
    .map((g, n) => `${n + 1}. [${g.answer_type}] ${g.answer}`)
    .join('\n') || '(없음 — 위 gold 정답만 사용)';

  const prompt = fillTemplate(judgeTemplate, {
    question: task.question,
    answer_type: task.answer_type,
    gold_answer: task.gold_answer,
    gold_all: goldAll,
    output: run.output,
  });

  const t0 = Date.now();
  let verdict = null, reason = null, raw = null, error = null;
  try {
    raw = await callLLM(prompt, { ...JUDGE, timeoutMs: JUDGE_TIMEOUT_MS });
    const parsed = parseVerdict(raw);
    if (!parsed) error = `판정 파싱 실패: ${String(raw).slice(0, 120)}`;
    else ({ verdict, reason } = parsed);
  } catch (err) {
    error = String(err?.message || err);
  }

  const durationMs = Date.now() - t0;
  await saveJudge({
    run_id: runId,
    system,
    task_id: task.task_id,
    verdict,
    reason,
    error,
    judge_backend: JUDGE.backend,
    judge_model: JUDGE.model,
    judge_effort: JUDGE.reasoningEffort,
    judged_at: new Date().toISOString(),
    duration_ms: durationMs,
    prompt_version: 'v1',
  });

  judged++;
  const secs = (durationMs / 1000).toFixed(1);
  if (error) {
    failed++;
    console.log(`${prefix} ... ${secs}s ERROR: ${error.split('\n')[0].slice(0, 120)}`);
  } else {
    ok++;
    console.log(`${prefix} ... ${secs}s ${verdict}`);
  }
}

console.log('---');
console.log(`판정 ${judged} (성공 ${ok}, 실패 ${failed}) | skip: 판정됨 ${skippedDone}, run 없음 ${skippedNoRun}, judge 에러 ${skippedError}`);
if ((failed + skippedError) > 0 && !retryErrors) {
  console.log(`에러 ${failed + skippedError}건 — 재시도: node eval/scoring/judge.js --dataset ${path.relative(process.cwd(), datasetPath)} --systems ${systemNames.join(',')}${limit ? ` --limit ${limit}` : ''} --retry-errors`);
}
