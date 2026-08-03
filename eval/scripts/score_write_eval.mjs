// eval/scripts/score_write_eval.mjs
// 작성팀 평가 기계 채점 — run_write_eval.mjs가 남긴 레코드를 4축으로 판정.
//   ① 컴파일 성공  ② 지시 이행(기대 regex 전부 충족)  ③ 보존성(변경 파일 ⊆ 허용 목록)
//   ④ 인용 유효성(\cite 키 전부 refs.bib에 존재)
// 전 축이 기계 판정 — LLM judge 불필요. 출력: eval/results/write_eval.md
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const runsDir = path.join(__dirname, '..', 'runs');
const outPath = path.join(__dirname, '..', 'results', 'write_eval.md');

const files = (await readdir(runsDir)).filter(f => /^write-eval-t\d+\.json$/.test(f)).sort();
const rows = [];
for (const f of files) {
  const r = JSON.parse(await readFile(path.join(runsDir, f), 'utf8'));
  if (r.error) {
    rows.push({ id: r.task_id, error: r.error, compile: false, comply: false, preserve: false, cite: false });
    continue;
  }
  const compile = r.compiled === true;
  let comply = !r.read_only;
  const missed = [];
  for (const exp of r.expected) {
    const content = r.files_after[exp.file] ?? '';
    const hit = new RegExp(exp.regex, 'i').test(content);
    const want = exp.should !== false;
    if (hit !== want) { comply = false; missed.push(`${exp.file} ${want ? '누락' : '잔존'}: /${exp.regex}/`); }
  }
  const disallowed = r.changed_files.filter(p => !r.allowed.includes(p));
  const preserve = disallowed.length === 0;
  const cite = (r.bad_cite_keys || []).length === 0;
  rows.push({
    id: r.task_id, compile, comply, preserve, cite,
    fixes: r.fixes, changed: r.changed_files, disallowed, missed,
    badCites: r.bad_cite_keys || [], secs: (r.duration_ms / 1000).toFixed(0),
  });
}

const n = rows.length;
const cnt = k => rows.filter(r => r[k]).length;
const allPass = rows.filter(r => r.compile && r.comply && r.preserve && r.cite).length;
const pct = (a, b) => b ? `${((a / b) * 100).toFixed(0)}%` : '-';

const lines = [];
lines.push('# 작성팀(워크스페이스 편집) 기계 채점 평가');
lines.push('');
lines.push('고정 LaTeX 픽스처(4파일: main/intro/method/refs.bib + 그림)를 과제마다 새로 만들고,');
lines.push('기계 채점 가능한 지시 10개를 실제 경로(runWorkspaceEdit: 편집→컴파일 게이트)로 실행.');
lines.push('생성물 평가는 정답이 없으므로 **속성 4축을 기계로 판정**한다 (LLM judge 불필요).');
lines.push('');
lines.push('| 축 | 통과 | 설명 |');
lines.push('|---|---|---|');
lines.push(`| ① 컴파일 성공 | **${cnt('compile')}/${n} (${pct(cnt('compile'), n)})** | 편집 후 pdflatex 빌드 성공 (자동 수정 루프 포함) |`);
lines.push(`| ② 지시 이행 | **${cnt('comply')}/${n} (${pct(cnt('comply'), n)})** | 기대 변경(regex)이 전부 반영 |`);
lines.push(`| ③ 보존성 | **${cnt('preserve')}/${n} (${pct(cnt('preserve'), n)})** | 변경 파일이 허용 목록 안에만 있음 |`);
lines.push(`| ④ 인용 유효성 | **${cnt('cite')}/${n} (${pct(cnt('cite'), n)})** | 모든 \\cite 키가 refs.bib에 실재 |`);
lines.push(`| **전 축 통과** | **${allPass}/${n} (${pct(allPass, n)})** | |`);
lines.push('');
lines.push('## 과제별');
lines.push('');
lines.push('| 과제 | 컴파일 | 이행 | 보존 | 인용 | 시간 | 비고 |');
lines.push('|---|---|---|---|---|---|---|');
for (const r of rows) {
  const mark = v => v ? '✅' : '❌';
  if (r.error) {
    lines.push(`| ${r.id} | ❌ | ❌ | ❌ | ❌ | - | 실행 오류: ${r.error.slice(0, 60)} |`);
    continue;
  }
  const notes = [];
  if (r.fixes > 0) notes.push(`컴파일 자동수정 ${r.fixes}회`);
  if (r.disallowed.length) notes.push(`허용 외 변경: ${r.disallowed.join(',')}`);
  if (r.missed.length) notes.push(r.missed.join('; ').slice(0, 80));
  if (r.badCites.length) notes.push(`무효 인용: ${r.badCites.join(',')}`);
  lines.push(`| ${r.id} | ${mark(r.compile)} | ${mark(r.comply)} | ${mark(r.preserve)} | ${mark(r.cite)} | ${r.secs}s | ${notes.join(' / ') || ''} |`);
}
lines.push('');
lines.push('실행 레코드: `eval/runs/write-eval-*.json` (편집 후 파일 전문 포함, 로컬).');
lines.push('데이터 격리: `PAA_DATA_DIR=eval/runs/write_eval_data` — 앱 라이브러리와 분리.');

await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, lines.join('\n'), 'utf8');
console.log(`저장: ${outPath}`);
console.log(`컴파일 ${cnt('compile')}/${n} | 이행 ${cnt('comply')}/${n} | 보존 ${cnt('preserve')}/${n} | 인용 ${cnt('cite')}/${n} | 전축 ${allPass}/${n}`);
