// eval/scripts/run_write_eval.mjs
// 작성팀(워크스페이스 편집) 기계 채점 평가 — 실행부.
// 고정 LaTeX 픽스처 프로젝트를 과제마다 새로 만들고, 기계 채점 가능한 지시 10개를
// 실제 경로(runWorkspaceEdit: 스냅샷 → 에이전트 편집 → 컴파일 게이트)로 실행한다.
// 채점 기준(전 과제 공통):
//   ① 컴파일 성공  ② 지시 이행(기대 regex)  ③ 보존성(변경 파일 ⊆ 허용 목록)
//   ④ 인용 유효성(모든 \cite 키가 refs.bib에 존재)
// 데이터 격리: PAA_DATA_DIR을 eval/runs/write_eval_data 로 — 앱 라이브러리를 건드리지 않음.
// resume: eval/runs/write-eval-{tid}.json 존재+정상이면 skip. LLM 호출 순차.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const runsDir = path.join(__dirname, '..', 'runs');
// 반드시 fileManager import 전에 설정 (userDataDir가 이 값을 읽음)
process.env.PAA_DATA_DIR = path.join(runsDir, 'write_eval_data');

const { writeProjectFile, writeProjectAsset, readProjectFile } = await import('../../core/latexProject.js');
const { projectSrcDir } = await import('../../core/fileManager.js');
const { runWorkspaceEdit } = await import('../../agents/paperWriting.js');

// ---- 픽스처 프로젝트 (컴파일 가능 최소 논문) ----
const PNG_1PX = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

const FIXTURE = {
  'main.tex': `\\documentclass{article}
\\usepackage{graphicx}
\\usepackage{booktabs}
\\newcommand{\\sysname}{SysA}
\\title{A Study on Adaptive Routing}
\\author{Anonymous}
\\begin{document}
\\maketitle
\\begin{abstract}
This paper studies adaptive routing.
\\end{abstract}
\\input{sections/intro}
\\input{sections/method}
\\bibliographystyle{plain}
\\bibliography{refs}
\\end{document}
`,
  'sections/intro.tex': `\\section{Introduction}
Adaptive routing has become an important topic in networked systems~\\cite{lee2020}.
Many legacy systems could not adapt to changing workloads.
Our system, \\sysname{}, aims to recieve routing decisions in real time.
`,
  'sections/method.tex': `\\section{Method}
\\sysname{} consists of a monitor and a router. The monitor observes traffic
statistics, and the router updates forwarding rules based on the observations.
In our experiments, \\sysname{} achieved an F1 score of 0.91, while the baseline
achieved 0.85 on the same workload~\\cite{park2019}.
`,
  'refs.bib': `@article{lee2020,
  author = {Lee, J.},
  title = {Adaptive Systems},
  journal = {Journal of Systems},
  year = {2020}
}
@article{kim2021,
  author = {Kim, S.},
  title = {Traffic Prediction with Neural Networks},
  journal = {Networking Letters},
  year = {2021}
}
@article{park2019,
  author = {Park, H.},
  title = {Baseline Routing Methods},
  journal = {Journal of Systems},
  year = {2019}
}
`,
};

// ---- 과제 정의 (기계 채점 가능 지시 10개) ----
// expected: [{file, regex(문자열), should(기본 true=존재해야)}], allowed: 변경 허용 파일
const TASKS = [
  {
    id: 't01', file: 'sections/intro.tex',
    instruction: '서론(intro.tex)에 에너지 효율(energy efficiency) 관점의 동기 문장을 한두 문장 추가해줘. 다른 파일은 건드리지 마.',
    expected: [{ file: 'sections/intro.tex', regex: 'energy[- ]?efficien' }],
    allowed: ['sections/intro.tex'],
  },
  {
    id: 't02', file: 'main.tex',
    instruction: '시스템 표시 이름을 SysA에서 SysB로 바꿔줘. \\sysname 명령 정의만 고치면 전체에 반영될 거야.',
    expected: [
      { file: 'main.tex', regex: '\\\\newcommand\\{\\\\sysname\\}\\{SysB\\}' },
      { file: 'sections/intro.tex', regex: '\\\\sysname', should: true },
    ],
    allowed: ['main.tex'],
  },
  {
    id: 't03', file: 'sections/method.tex',
    instruction: 'method.tex의 실험 결과 문장에 트래픽 예측 관련 선행연구 인용을 추가해줘. refs.bib에 있는 kim2021 키를 사용해.',
    expected: [{ file: 'sections/method.tex', regex: '\\\\cite\\{[^}]*kim2021[^}]*\\}' }],
    allowed: ['sections/method.tex'],
  },
  {
    id: 't04', file: 'sections/method.tex',
    instruction: 'method.tex에 실험 결과를 정리한 booktabs 표를 추가해줘. 열은 Model과 F1, 행은 SysA 0.91과 Baseline 0.85.',
    expected: [
      { file: 'sections/method.tex', regex: '\\\\begin\\{tabular' },
      { file: 'sections/method.tex', regex: '0\\.91' },
      { file: 'sections/method.tex', regex: '0\\.85' },
    ],
    allowed: ['sections/method.tex', 'main.tex'],
  },
  {
    id: 't05', file: 'sections/intro.tex',
    instruction: 'intro.tex에 오타가 있어. recieve를 receive로 고쳐줘. 그것만 고치고 다른 건 그대로 둬.',
    expected: [
      { file: 'sections/intro.tex', regex: 'receive' },
      { file: 'sections/intro.tex', regex: 'recieve', should: false },
    ],
    allowed: ['sections/intro.tex'],
  },
  {
    id: 't06', file: 'sections/method.tex',
    instruction: 'method.tex의 Method 섹션을 논리 단위로 \\subsection 두 개 이상으로 나눠서 구조화해줘. 내용은 유지하고.',
    expected: [{ file: 'sections/method.tex', regex: '\\\\subsection\\{' }],
    allowed: ['sections/method.tex'],
  },
  {
    id: 't07', file: 'sections/method.tex',
    instruction: 'method.tex에 figures/arch.png를 넣는 figure 환경을 추가해줘. 라벨은 fig:arch, 캡션은 시스템 구조 설명으로. 본문에서 \\ref{fig:arch}로 한 번 언급해줘.',
    expected: [
      { file: 'sections/method.tex', regex: 'includegraphics[^\\n]*arch' },
      { file: 'sections/method.tex', regex: '\\\\label\\{fig:arch\\}' },
      { file: 'sections/method.tex', regex: '\\\\ref\\{fig:arch\\}' },
    ],
    allowed: ['sections/method.tex', 'main.tex'],
  },
  {
    id: 't08', file: 'main.tex',
    instruction: '논문 제목을 "Adaptive Forecast Routing for Dynamic Workloads"로 바꿔줘.',
    expected: [{ file: 'main.tex', regex: '\\\\title\\{Adaptive Forecast Routing for Dynamic Workloads\\}' }],
    allowed: ['main.tex'],
  },
  {
    id: 't09', file: 'sections/intro.tex',
    instruction: 'intro.tex에서 legacy systems를 언급하는 문장을 삭제해줘. 나머지는 그대로.',
    expected: [{ file: 'sections/intro.tex', regex: 'legacy systems', should: false }],
    allowed: ['sections/intro.tex'],
  },
  {
    id: 't10', file: 'main.tex',
    instruction: 'abstract를 2~3문장으로 확장해줘. 적응형 라우팅(adaptive routing)의 필요성과 우리 접근의 핵심을 담아서.',
    expected: [{ file: 'main.tex', regex: '\\\\begin\\{abstract\\}[\\s\\S]{120,}\\\\end\\{abstract\\}' }],
    allowed: ['main.tex'],
  },
];

// ---- 실행 ----
async function buildFixture(projectId) {
  const srcDir = projectSrcDir(projectId);
  await rm(srcDir, { recursive: true, force: true });
  await mkdir(srcDir, { recursive: true });
  for (const [rel, content] of Object.entries(FIXTURE)) await writeProjectFile(projectId, rel, content);
  await writeProjectAsset(projectId, 'figures/arch.png', PNG_1PX);
}

async function loadResult(tid) {
  try { return JSON.parse(await readFile(path.join(runsDir, `write-eval-${tid}.json`), 'utf8')); } catch { return null; }
}

// 인용 유효성: 전체 .tex의 \cite 키 ⊆ refs.bib 키 (빈 \cite{}는 위반으로 집계)
async function checkCitations(projectId) {
  const bib = await readProjectFile(projectId, 'refs.bib');
  const bibKeys = new Set([...bib.matchAll(/@\w+\{([^,\s]+)\s*,/g)].map(m => m[1]));
  const badKeys = [];
  for (const rel of ['main.tex', 'sections/intro.tex', 'sections/method.tex']) {
    const tex = await readProjectFile(projectId, rel).catch(() => '');
    for (const m of tex.matchAll(/\\cite\{([^}]*)\}/g)) {
      for (const key of m[1].split(',').map(s => s.trim())) {
        if (!key || !bibKeys.has(key)) badKeys.push(`${rel}:${key || '(빈 키)'}`);
      }
    }
  }
  return badKeys;
}

for (let i = 0; i < TASKS.length; i++) {
  const task = TASKS[i];
  const existing = await loadResult(task.id);
  if (existing && !existing.error) {
    console.log(`[${i + 1}/${TASKS.length}] ${task.id} ... skip (완료됨)`);
    continue;
  }
  const projectId = `writeeval-${task.id}`;
  await buildFixture(projectId);
  const t0 = Date.now();
  let result = null, error = null;
  try {
    result = await runWorkspaceEdit({
      projectId, file: task.file, mainFile: 'main.tex',
      instruction: task.instruction, history: [],
    });
  } catch (err) {
    error = String(err?.message || err);
  }

  // 채점 재료 수집 (판정은 score 스크립트에서)
  const record = {
    task_id: task.id, instruction: task.instruction, target_file: task.file,
    allowed: task.allowed, expected: task.expected,
    error,
    read_only: result?.readOnly || false,
    compiled: result?.compiled ?? null,
    fixes: result?.fixes ?? null,
    changed_files: (result?.changedFiles || []).map(c => c.path),
    bad_cite_keys: error ? null : await checkCitations(projectId),
    files_after: {},
    duration_ms: Date.now() - t0,
    at: new Date().toISOString(),
  };
  for (const rel of ['main.tex', 'sections/intro.tex', 'sections/method.tex']) {
    record.files_after[rel] = await readProjectFile(projectId, rel).catch(() => null);
  }
  await mkdir(runsDir, { recursive: true });
  await writeFile(path.join(runsDir, `write-eval-${task.id}.json`), JSON.stringify(record, null, 2), 'utf8');
  console.log(`[${i + 1}/${TASKS.length}] ${task.id} ... ${error ? 'ERROR: ' + error.slice(0, 100) : `${((Date.now() - t0) / 1000).toFixed(1)}s 컴파일=${record.compiled} 변경=${record.changed_files.join(',')}`}`);
}
console.log('실행 완료 — 채점: node eval/scripts/score_write_eval.mjs');
