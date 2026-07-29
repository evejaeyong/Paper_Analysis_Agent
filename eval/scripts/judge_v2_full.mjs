// eval/scripts/judge_v2_full.mjs
// 프롬프트 v2 재평가: 동일 judge(qa_judge v2, claude-sonnet-4-6 low)로 세 변형을 쌍대 판정.
//   agent_v1  — 기존 agent-evidence 출력 (evidence 프롬프트 v1, dataset qasper_v2)
//   single_v1 — 기존 single-llm 출력 (베이스라인 불변, dataset qasper_v2)
//   agent_v2  — evidence 프롬프트 v2 + 인용 가드 재실행 출력 (dataset qasper_v2p2)
// judge 판정은 results/judge_v2_full.json 에 누적(resume). 완료 후 results/prompt_v2_ab.md 생성.
// LLM 호출 전부 순차.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { callLLM } from '../../core/llm.js';
import { fillTemplate } from '../../core/promptStore.js';
import { makeRunId, loadRun, isSuccessfulRun } from '../runner/logger.js';
import { extractQuotes, verifyQuote } from '../../core/quoteGuard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JUDGE = { backend: 'claude', model: 'claude-sonnet-4-6', reasoningEffort: 'low', timeoutMs: 180_000 };
const VARIANTS = [
  ['agent_v1', 'qasper_v2', 'agent-evidence'],
  ['single_v1', 'qasper_v2', 'single-llm'],
  ['agent_v2', 'qasper_v2p2', 'agent-evidence'],
];

const tasks = JSON.parse(await readFile(path.join(__dirname, '..', 'data', 'qasper_v2_subset.json'), 'utf8'));
const judgeTemplate = await readFile(path.join(__dirname, '..', 'scoring', 'prompts', 'qa_judge.md'), 'utf8');
const outJson = path.join(__dirname, '..', 'results', 'judge_v2_full.json');
const outMd = path.join(__dirname, '..', 'results', 'prompt_v2_ab.md');

let store = {};
try { store = JSON.parse(await readFile(outJson, 'utf8')); } catch { /* 처음 실행 */ }

function parseVerdict(raw) {
  const lines = (raw || '').trim().split('\n').map(l => l.trim()).filter(Boolean);
  const first = (lines[0] || '').toUpperCase();
  return (first === 'CORRECT' || first === 'INCORRECT') ? { verdict: first, reason: lines.slice(1).join(' ') } : null;
}

const total = tasks.length * VARIANTS.length;
let i = 0, errors = 0;
for (const task of tasks) {
  for (const [variant, dataset, system] of VARIANTS) {
    i++;
    const key = `${variant}:${task.task_id}`;
    if (store[key]?.verdict) continue;
    const run = await loadRun(makeRunId(dataset, system, task.task_id));
    if (!isSuccessfulRun(run)) {
      console.log(`[${i}/${total}] ${key} ... run 없음(건너뜀)`);
      continue;
    }
    const goldAll = (task.gold_all || []).map((g, n) => `${n + 1}. [${g.answer_type}] ${g.answer}`).join('\n') || '(없음 — 위 gold 정답만 사용)';
    const prompt = fillTemplate(judgeTemplate, {
      question: task.question, answer_type: task.answer_type,
      gold_answer: task.gold_answer, gold_all: goldAll, output: run.output,
    });
    const t0 = Date.now();
    try {
      const raw = await callLLM(prompt, JUDGE);
      const parsed = parseVerdict(raw);
      store[key] = parsed || { verdict: null, error: `파싱 실패: ${String(raw).slice(0, 120)}` };
    } catch (err) {
      store[key] = { verdict: null, error: String(err?.message || err).slice(0, 200) };
      errors++;
    }
    await mkdir(path.dirname(outJson), { recursive: true });
    await writeFile(outJson, JSON.stringify(store), 'utf8');
    console.log(`[${i}/${total}] ${key} ... ${((Date.now() - t0) / 1000).toFixed(1)}s ${store[key].verdict || 'ERROR'}`);
  }
}

// ---- 집계 ----
const acc = {};
for (const [variant] of VARIANTS) acc[variant] = { correct: 0, incorrect: 0, missing: 0 };
for (const task of tasks) {
  for (const [variant] of VARIANTS) {
    const v = store[`${variant}:${task.task_id}`]?.verdict;
    if (v === 'CORRECT') acc[variant].correct++;
    else if (v === 'INCORRECT') acc[variant].incorrect++;
    else acc[variant].missing++;
  }
}
function paired(a, b) {
  let aOnly = 0, bOnly = 0, flippedIds = [];
  for (const task of tasks) {
    const va = store[`${a}:${task.task_id}`]?.verdict;
    const vb = store[`${b}:${task.task_id}`]?.verdict;
    if (va === 'CORRECT' && vb === 'INCORRECT') { aOnly++; flippedIds.push(`${task.task_id}(${a}만)`); }
    if (va === 'INCORRECT' && vb === 'CORRECT') { bOnly++; flippedIds.push(`${task.task_id}(${b}만)`); }
  }
  return { aOnly, bOnly, flippedIds };
}

// 인용 위조 전수(기계 채점) — agent_v2 150 run
const normWs = s => (s || '').replace(/\s+/g, ' ').trim();
const normAlnum = s => (s || '').toLowerCase().replace(/[^a-z0-9가-힣]+/g, '');
let qChecked = 0, qFab = 0, runsWithFab = 0, okRuns = 0;
for (const task of tasks) {
  const run = await loadRun(makeRunId('qasper_v2p2', 'agent-evidence', task.task_id));
  if (!isSuccessfulRun(run)) continue;
  okRuns++;
  const docWs = normWs(task.paper_full_text), docAlnum = normAlnum(task.paper_full_text);
  let fab = 0;
  for (const q of extractQuotes(run.output)) {
    const v = verifyQuote(q, docWs, docAlnum);
    if (v === 'skip' || v === 'korean') continue;
    qChecked++;
    if (v === 'fabricated') { qFab++; fab++; }
  }
  if (fab > 0) runsWithFab++;
}

const pct = (n, d) => d ? `${((n / d) * 100).toFixed(1)}%` : '-';
const p12 = paired('agent_v1', 'agent_v2');
const p2s = paired('agent_v2', 'single_v1');
const lines = [];
lines.push('# 프롬프트 v2 재평가 — 동일 judge(qa_judge v2, claude-sonnet-4-6 low) 쌍대 비교');
lines.push('');
lines.push('세 변형을 같은 judge로 판정해 judge 버전 교란 없이 비교:');
lines.push('- **agent_v1**: evidence 프롬프트 v1 출력(기존 run) / **agent_v2**: 프롬프트 v2(<document> 상단 배치)+인용 가드 재실행 / **single_v1**: 베이스라인(불변)');
lines.push('');
lines.push('| 변형 | CORRECT | accuracy | 미판정/실패 |');
lines.push('|---|---|---|---|');
for (const [variant] of VARIANTS) {
  const a = acc[variant];
  const denom = a.correct + a.incorrect;
  lines.push(`| ${variant} | ${a.correct}/${denom} | **${pct(a.correct, denom)}** | ${a.missing} |`);
}
lines.push('');
lines.push(`## 쌍대 비교 (같은 문항, 같은 judge)`);
lines.push('');
lines.push(`- **agent_v1 vs agent_v2** (프롬프트 효과): v1만 정답 ${p12.aOnly} / v2만 정답 ${p12.bOnly}`);
lines.push(`- **agent_v2 vs single_v1** (구조 효과): v2만 정답 ${p2s.aOnly} / single만 정답 ${p2s.bOnly}`);
lines.push('');
lines.push('<details><summary>갈린 문항</summary>');
lines.push('');
lines.push(`- v1↔v2: ${p12.flippedIds.join(', ') || '없음'}`);
lines.push(`- v2↔single: ${p2s.flippedIds.join(', ') || '없음'}`);
lines.push('');
lines.push('</details>');
lines.push('');
lines.push('## 인용 위조 전수 (agent_v2 150문항, 기계 채점)');
lines.push('');
lines.push(`- 성공 run ${okRuns}/150 | 검사 인용 ${qChecked}건 중 fabricated **${qFab}건 (${pct(qFab, qChecked)})** | 위조 포함 run **${runsWithFab}건 (${pct(runsWithFab, okRuns)})**`);
lines.push(`- 참고: 가드 도입 전(v1 프롬프트) 전수 측정치는 위조 포함 run 13.3%(20/150), 인용당 3.5%.`);
lines.push('');
lines.push(`판정 오류 ${errors}건. 원본 판정: results/judge_v2_full.json (v1 gpt-5.5 판정 파일은 별도 보존).`);
await writeFile(outMd, lines.join('\n'), 'utf8');
console.log(`저장: ${outMd}`);
for (const [variant] of VARIANTS) {
  const a = acc[variant];
  console.log(`${variant}: ${a.correct}/${a.correct + a.incorrect} (${pct(a.correct, a.correct + a.incorrect)}) 미판정 ${a.missing}`);
}
console.log(`agent_v1 vs v2: +${p12.bOnly}/-${p12.aOnly} | v2 vs single: +${p2s.aOnly}/-${p2s.bOnly} | fab ${qFab}/${qChecked}, runs ${runsWithFab}`);
