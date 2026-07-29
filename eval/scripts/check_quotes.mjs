// eval/scripts/check_quotes.mjs
// 할루시네이션 평가 ①: 근거 인용문 실재성 검증 (LLM 불필요, 기존 run 재활용).
// 두 시스템의 출력에서 따옴표 인용("...")을 추출해, 실제 논문 본문에 존재하는지 검사한다.
// 지어낸 인용(fabricated quote)의 비율을 시스템별로 집계한다.
//
// 판정 등급:
//   exact    — 공백 정규화 후 본문에 그대로 존재
//   relaxed  — 영숫자만 남긴 뒤 존재 (LaTeX·문장부호·따옴표 변형 허용)
//   fabricated — 위 둘 다 실패 (본문에 없는 인용)
// "..." / "…" 로 중략된 인용은 조각별로 검사해 전 조각이 존재해야 인정.
// 한글이 섞인 인용은 번역/의역으로 보고 별도 카운트(fabrication 분모에서 제외).
//
// 사용법: node eval/scripts/check_quotes.mjs [--dataset eval/data/qasper_v2_subset.json]
//         [--out eval/results/quote_check.md]
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
const datasetPath = path.resolve(argValue('--dataset', path.join(__dirname, '..', 'data', 'qasper_v2_subset.json')));
const outPath = path.resolve(argValue('--out', path.join(__dirname, '..', 'results', 'quote_check.md')));
const SYSTEM_NAMES = ['agent-evidence', 'single-llm'];

const datasetName = path.basename(datasetPath, '.json').replace(/_subset$/, '');
const tasks = JSON.parse(await readFile(datasetPath, 'utf8'));

// ---- 정규화 ----
const normWs = s => (s || '').replace(/\s+/g, ' ').trim();
const normAlnum = s => (s || '').toLowerCase().replace(/[^a-z0-9가-힣]+/g, '');
const hasHangul = s => /[가-힣]/.test(s);

// 출력에서 따옴표 인용 추출: "..." / “...” / 「...」
function extractQuotes(output) {
  const quotes = [];
  const patterns = [/"([^"]{10,}?)"/g, /“([^”]{10,}?)”/g];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(output)) !== null) quotes.push(m[1]);
  }
  return quotes;
}

// 인용 1건 판정: 'exact' | 'relaxed' | 'fabricated' | 'skip'(짧음) | 'korean'
function verifyQuote(quote, docWs, docAlnum) {
  if (hasHangul(quote)) return 'korean';
  // 중략(... / …)으로 나눠 조각별 검사
  const segs = quote.split(/\.\.\.|…|\[\.\.\.?\]|\(\.\.\.?\)/).map(normWs).filter(Boolean);
  const meaningful = segs.filter(s => normAlnum(s).length >= 20);
  if (!meaningful.length) return 'skip'; // 검사할 만큼 긴 조각이 없음
  if (meaningful.every(s => docWs.includes(s))) return 'exact';
  if (meaningful.every(s => docAlnum.includes(normAlnum(s)))) return 'relaxed';
  return 'fabricated';
}

// ---- 집계 ----
const stats = new Map(SYSTEM_NAMES.map(s => [s, {
  runs: 0, runsWithQuote: 0, runsWithFab: 0,
  quotes: 0, exact: 0, relaxed: 0, fabricated: 0, korean: 0, skipped: 0,
  fabExamples: [],
}]));

for (const task of tasks) {
  const docWs = normWs(task.paper_full_text);
  const docAlnum = normAlnum(task.paper_full_text);
  for (const system of SYSTEM_NAMES) {
    const run = await loadRun(makeRunId(datasetName, system, task.task_id));
    if (!isSuccessfulRun(run)) continue;
    const st = stats.get(system);
    st.runs++;
    const quotes = extractQuotes(run.output);
    const verdicts = quotes.map(q => ({ q, v: verifyQuote(q, docWs, docAlnum) }));
    const counted = verdicts.filter(({ v }) => v !== 'skip' && v !== 'korean');
    if (counted.length) st.runsWithQuote++;
    let fab = false;
    for (const { q, v } of verdicts) {
      if (v === 'skip') { st.skipped++; continue; }
      if (v === 'korean') { st.korean++; continue; }
      st.quotes++;
      st[v]++;
      if (v === 'fabricated') {
        fab = true;
        if (st.fabExamples.length < 15) st.fabExamples.push({ task_id: task.task_id, quote: q });
      }
    }
    if (fab) st.runsWithFab++;
  }
}

// ---- 리포트 ----
const pct = (n, d) => d ? `${((n / d) * 100).toFixed(1)}%` : '-';
const lines = [];
lines.push(`# 근거 인용 실재성 검증 — ${datasetName} (할루시네이션 평가 ①)`);
lines.push('');
lines.push('시스템 출력의 따옴표 인용("...")이 실제 논문 본문에 존재하는지 문자열 매칭으로 검사.');
lines.push('- **exact**: 공백 정규화 후 본문에 그대로 존재 / **relaxed**: 영숫자만 비교 시 존재(LaTeX·부호 변형)');
lines.push('- **fabricated**: 본문에 없음(지어낸 인용) — 영숫자 20자 미만 조각·한글(번역) 인용은 분모 제외');
lines.push('');
lines.push('| 시스템 | 성공 run | 인용 포함 run | 검사 인용 수 | exact | relaxed | **fabricated** | 인용당 위조율 | 위조 포함 run |');
lines.push('|---|---|---|---|---|---|---|---|---|');
for (const system of SYSTEM_NAMES) {
  const s = stats.get(system);
  lines.push(`| ${system} | ${s.runs} | ${s.runsWithQuote} | ${s.quotes} | ${s.exact} | ${s.relaxed} | **${s.fabricated}** | **${pct(s.fabricated, s.quotes)}** | ${s.runsWithFab} (${pct(s.runsWithFab, s.runs)}) |`);
}
lines.push('');
lines.push('참고: 한글(번역) 인용 — ' + SYSTEM_NAMES.map(s => `${s}: ${stats.get(s).korean}건`).join(', ')
  + ' / 짧아서 제외 — ' + SYSTEM_NAMES.map(s => `${s}: ${stats.get(s).skipped}건`).join(', '));
lines.push('');
for (const system of SYSTEM_NAMES) {
  const s = stats.get(system);
  if (!s.fabExamples.length) continue;
  lines.push(`## ${system} — fabricated 인용 예시 (최대 15건)`);
  lines.push('');
  for (const ex of s.fabExamples) {
    lines.push(`- **${ex.task_id}**: "${ex.quote.slice(0, 200)}${ex.quote.length > 200 ? '…' : ''}"`);
  }
  lines.push('');
}

await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, lines.join('\n'), 'utf8');
console.log(`저장: ${outPath}`);
for (const system of SYSTEM_NAMES) {
  const s = stats.get(system);
  console.log(`${system}: 인용 ${s.quotes}건 중 fabricated ${s.fabricated} (${pct(s.fabricated, s.quotes)}), 위조 포함 run ${s.runsWithFab}/${s.runs}`);
}
