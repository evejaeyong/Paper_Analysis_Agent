// eval/scripts/judge_qg_pairs.mjs
// 인용 가드 전/후 정답률 쌍대 비교 — 같은 judge(claude-sonnet-4-6, codex 한도 소진 폴백)로
// 20문항의 가드 전(qasper_v2) / 가드 후(qasper_v2qg) 출력을 모두 재판정한다.
// 기존 gpt-5.5 judge 파일은 수정하지 않음. 결과는 results/quote_guard_judge_pairs.json 에 누적(resume).
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { callLLM } from '../../core/llm.js';
import { fillTemplate } from '../../core/promptStore.js';
import { makeRunId, loadRun, isSuccessfulRun } from '../runner/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IDS = ['q0009','q0027','q0055','q0056','q0060','q0075','q0078','q0082','q0083','q0088','q0091','q0097','q0100','q0116','q0127','q0134','q0140','q0141','q0146','q0147'];
const JUDGE = { backend: 'claude', model: 'claude-sonnet-4-6', reasoningEffort: 'low' };
const VARIANTS = [['before', 'qasper_v2'], ['after', 'qasper_v2qg']];

const tasks = JSON.parse(await readFile(path.join(__dirname, '..', 'data', 'qasper_v2_subset.json'), 'utf8'));
const byId = new Map(tasks.map(t => [t.task_id, t]));
const judgeTemplate = await readFile(path.join(__dirname, '..', 'scoring', 'prompts', 'qa_judge.md'), 'utf8');
const outJson = path.join(__dirname, '..', 'results', 'quote_guard_judge_pairs.json');
const outMd = path.join(__dirname, '..', 'results', 'quote_guard_judge_pairs.md');

let store = {};
try { store = JSON.parse(await readFile(outJson, 'utf8')); } catch { /* 처음 실행 */ }

function parseVerdict(raw) {
  const lines = (raw || '').trim().split('\n').map(l => l.trim()).filter(Boolean);
  const first = (lines[0] || '').toUpperCase();
  return (first === 'CORRECT' || first === 'INCORRECT') ? { verdict: first, reason: lines.slice(1).join(' ') } : null;
}

let total = IDS.length * VARIANTS.length, i = 0;
for (const id of IDS) {
  const task = byId.get(id);
  for (const [variant, dataset] of VARIANTS) {
    i++;
    const key = `${id}:${variant}`;
    if (store[key]?.verdict) { console.log(`[${i}/${total}] ${key} ... skip`); continue; }
    const run = await loadRun(makeRunId(dataset, 'agent-evidence', id));
    if (!isSuccessfulRun(run)) { console.log(`[${i}/${total}] ${key} ... run 없음`); continue; }
    const goldAll = (task.gold_all || []).map((g, n) => `${n + 1}. [${g.answer_type}] ${g.answer}`).join('\n') || '(없음 — 위 gold 정답만 사용)';
    const prompt = fillTemplate(judgeTemplate, {
      question: task.question, answer_type: task.answer_type,
      gold_answer: task.gold_answer, gold_all: goldAll, output: run.output,
    });
    const t0 = Date.now();
    try {
      const raw = await callLLM(prompt, { ...JUDGE, timeoutMs: 180_000 });
      const parsed = parseVerdict(raw);
      store[key] = parsed
        ? { ...parsed, judge: `${JUDGE.backend}/${JUDGE.model}`, duration_ms: Date.now() - t0 }
        : { verdict: null, error: `파싱 실패: ${String(raw).slice(0, 120)}` };
    } catch (err) {
      store[key] = { verdict: null, error: String(err?.message || err).slice(0, 300) };
    }
    await mkdir(path.dirname(outJson), { recursive: true });
    await writeFile(outJson, JSON.stringify(store, null, 2), 'utf8');
    console.log(`[${i}/${total}] ${key} ... ${((Date.now() - t0) / 1000).toFixed(1)}s ${store[key].verdict || 'ERROR'}`);
  }
}

// 집계
let beforeC = 0, afterC = 0, err = 0;
const regressions = [], improvements = [];
const lines = [];
lines.push('# 인용 가드 전/후 정답률 쌍대 비교 — 동일 judge(claude-sonnet-4-6, effort low)');
lines.push('');
lines.push('codex(gpt-5.5) 한도 소진으로 README 폴백 규정 적용. 가드 전/후 출력을 **같은 judge**로 재판정한 쌍대 비교.');
lines.push('(기존 gpt-5.5 판정 파일은 별도 보존 — 이 문서의 "전" 판정과 다를 수 있음)');
lines.push('');
lines.push('| 문항 | 가드 전 | 가드 후 | 변화 |');
lines.push('|---|---|---|---|');
for (const id of IDS) {
  const b = store[`${id}:before`]?.verdict || 'ERR';
  const a = store[`${id}:after`]?.verdict || 'ERR';
  if (b === 'ERR' || a === 'ERR') err++;
  if (b === 'CORRECT') beforeC++;
  if (a === 'CORRECT') afterC++;
  let delta = '';
  if (b === 'CORRECT' && a === 'INCORRECT') { delta = '**회귀**'; regressions.push(id); }
  if (b === 'INCORRECT' && a === 'CORRECT') { delta = '개선'; improvements.push(id); }
  lines.push(`| ${id} | ${b} | ${a} | ${delta} |`);
}
lines.push('');
lines.push(`**가드 전 CORRECT ${beforeC}/20 → 가드 후 CORRECT ${afterC}/20** | 회귀 ${regressions.length}건(${regressions.join(', ') || '-'}) | 개선 ${improvements.length}건(${improvements.join(', ') || '-'}) | 판정 오류 ${err}건`);
await writeFile(outMd, lines.join('\n'), 'utf8');
console.log(`저장: ${outMd}`);
console.log(`전 ${beforeC}/20 → 후 ${afterC}/20 | 회귀: ${regressions.join(', ') || '없음'} | 개선: ${improvements.join(', ') || '없음'} | 오류 ${err}`);
