// eval/runner/logger.js
// 평가 실행 로그: run 1건당 JSON 1파일을 eval/runs/{runId}.json 으로 저장.
// run_id는 {dataset}-{system}-{task_id} 로 결정적(deterministic) — resume 판별의 키.
import { mkdir, readFile, writeFile, rename, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const RUNS_DIR = path.join(__dirname, '..', 'runs');

/** 결정적 run_id 생성: {dataset}-{system}-{task_id} */
export function makeRunId(dataset, system, taskId) {
  return [dataset, system, taskId].map(s => String(s).trim()).join('-');
}

function runPath(runId) {
  return path.join(RUNS_DIR, `${runId}.json`);
}

/**
 * run 레코드 1건 저장. 임시 파일에 쓴 뒤 rename — 중단 시 깨진 JSON이 남지 않게.
 * @param {{
 *   run_id:string, system:string, task_id:string, question:string, gold_answer:string,
 *   output:string|null, error:string|null, started_at:string, duration_ms:number,
 *   backend:string, model:string, prompt_version:string
 * }} record
 * @returns {Promise<string>} 저장된 파일 경로
 */
export async function saveRun(record) {
  if (!record || !record.run_id) throw new Error('saveRun: run_id 필수');
  await mkdir(RUNS_DIR, { recursive: true });
  const file = runPath(record.run_id);
  const tmp = `${file}.tmp`;
  await writeFile(tmp, JSON.stringify(record, null, 2), 'utf8');
  await rename(tmp, file);
  return file;
}

/** run 레코드 읽기. 없으면 null. */
export async function loadRun(runId) {
  try {
    return JSON.parse(await readFile(runPath(runId), 'utf8'));
  } catch (err) {
    if (err?.code === 'ENOENT') return null;
    throw err;
  }
}

/** eval/runs/ 의 모든 run 레코드 로드 (judge 등 부속 파일 제외). */
export async function loadAllRuns() {
  let files;
  try {
    files = await readdir(RUNS_DIR);
  } catch (err) {
    if (err?.code === 'ENOENT') return [];
    throw err;
  }
  const out = [];
  for (const f of files) {
    if (!f.endsWith('.json') || f.endsWith('.judge.json') || f.endsWith('.tmp')) continue;
    try {
      out.push(JSON.parse(await readFile(path.join(RUNS_DIR, f), 'utf8')));
    } catch { /* 깨진 파일은 재실행 대상으로 간주하고 건너뜀 */ }
  }
  return out;
}

/** 성공한 run(error 없음 + output 있음)인지 — resume 시 skip 판별. */
export function isSuccessfulRun(record) {
  return !!record && record.error == null && typeof record.output === 'string' && record.output.trim() !== '';
}

/** 스모크/테스트용 삭제 헬퍼. */
export async function deleteRun(runId) {
  try {
    await unlink(runPath(runId));
    return true;
  } catch (err) {
    if (err?.code === 'ENOENT') return false;
    throw err;
  }
}
