// eval/scripts/score_perturbed.mjs
// 할루시네이션 평가 ③ 채점: 반사실(perturbed) run을 문자열 매칭으로 결정적으로 채점.
//   faithful   — 출력에 치환값(perturbed)만 등장: 본문에 충실
//   parametric — 출력에 원래값(original)만 등장: 학습 지식으로 답함(파라메트릭 할루시네이션)
//   both       — 둘 다 등장 (모호 — 본문값과 기억값을 함께 언급)
//   neither    — 둘 다 없음 (다른 값·거절·우회 답변)
//
// 사용법: node eval/scripts/score_perturbed.mjs [--out eval/results/perturbed_summary.md]
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
const datasetPath = path.join(__dirname, '..', 'data', 'qasper_perturbed_subset.json');
const outPath = path.resolve(argValue('--out', path.join(__dirname, '..', 'results', 'perturbed_summary.md')));
const SYSTEM_NAMES = ['agent-evidence', 'single-llm'];
const datasetName = 'qasper_perturbed';

const tasks = JSON.parse(await readFile(datasetPath, 'utf8'));

// 수치 토큰의 표기 변형들 (콤마 유무, 트레일링 .0 제거)
function variants(tok) {
  const set = new Set([tok, tok.replace(/,/g, '')]);
  for (const v of [...set]) {
    if (v.endsWith('.0')) set.add(v.slice(0, -2));
    if (!v.includes('.') && !v.includes(',') && v.length > 3) {
      set.add(v.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    }
  }
  return [...set];
}

function containsNumber(text, tok) {
  return variants(tok).some(v => {
    const esc = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?<![\\d.,])${esc}(?![\\d.,])`).test(text);
  });
}

const stats = new Map(SYSTEM_NAMES.map(s => [s, { total: 0, faithful: 0, parametric: 0, both: 0, neither: 0, missing: 0, rows: [] }]));

for (const task of tasks) {
  for (const system of SYSTEM_NAMES) {
    const st = stats.get(system);
    const run = await loadRun(makeRunId(datasetName, system, task.task_id));
    if (!isSuccessfulRun(run)) { st.missing++; continue; }
    st.total++;
    const hasPert = containsNumber(run.output, task.perturbed_value);
    const hasOrig = containsNumber(run.output, task.original_value);
    let cls;
    if (hasPert && !hasOrig) cls = 'faithful';
    else if (hasOrig && !hasPert) cls = 'parametric';
    else if (hasPert && hasOrig) cls = 'both';
    else cls = 'neither';
    st[cls]++;
    st.rows.push({ task_id: task.task_id, cls, orig: task.original_value, pert: task.perturbed_value });
  }
}

const pct = (n, d) => d ? `${((n / d) * 100).toFixed(1)}%` : '-';
const lines = [];
lines.push(`# 반사실(perturbed) 논문 테스트 — 할루시네이션 평가 ③`);
lines.push('');
lines.push(`qasper_v2 문항 ${tasks.length}개의 본문 속 gold 수치를 전부 다른 값으로 치환한 변형 논문에 같은 질문.`);
lines.push('본문에 충실하면 치환값(faithful), 학습 지식으로 답하면 원래값(parametric 할루시네이션)이 나온다.');
lines.push('채점: 문자열 매칭 (LLM judge 불필요).');
lines.push('');
lines.push('| 시스템 | 채점 | **faithful** | parametric | both | neither | faithful율 |');
lines.push('|---|---|---|---|---|---|---|');
for (const system of SYSTEM_NAMES) {
  const s = stats.get(system);
  lines.push(`| ${system} | ${s.total}/${tasks.length} | **${s.faithful}** | ${s.parametric} | ${s.both} | ${s.neither} | **${pct(s.faithful, s.total)}** |`);
}
lines.push('');
lines.push('## 문항별 상세');
lines.push('');
lines.push(`| 문항 | 치환 | ${SYSTEM_NAMES.join(' | ')} |`);
lines.push(`|---|---|${SYSTEM_NAMES.map(() => '---').join('|')}|`);
for (const task of tasks) {
  const cells = SYSTEM_NAMES.map(s => stats.get(s).rows.find(r => r.task_id === task.task_id)?.cls || '(run 없음)');
  lines.push(`| ${task.task_id} | ${task.original_value} → ${task.perturbed_value} | ${cells.join(' | ')} |`);
}
lines.push('');

await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, lines.join('\n'), 'utf8');
console.log(`저장: ${outPath}`);
for (const system of SYSTEM_NAMES) {
  const s = stats.get(system);
  console.log(`${system}: faithful ${s.faithful}/${s.total} (${pct(s.faithful, s.total)}), parametric ${s.parametric}, both ${s.both}, neither ${s.neither}${s.missing ? `, run 없음 ${s.missing}` : ''}`);
}
