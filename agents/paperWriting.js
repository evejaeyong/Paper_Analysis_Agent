// agents/paperWriting.js
// 논문 작성팀: 오케스트레이터가 지시를 분류 → writing/figure/citation 모듈 실행
// → 컴파일 게이트(에러 시 writeCompile 수정 루프). STORM식 계획-우선 + self-reflection.
import { callLLM } from '../core/llm.js';
import { callClaude } from '../core/claudeClient.js';
import * as llmConfig from '../core/llmConfig.js';
import { getCurrent as getPrompts, fillTemplate } from '../core/promptStore.js';
import * as latexProject from '../core/latexProject.js';
import { projectSrcDir } from '../core/fileManager.js';
import { takeSnapshot, diffSnapshot, restoreSnapshot } from '../core/projectSnapshot.js';
import { compileProject } from '../core/latexCompiler.js';
import { findEvidence } from './evidence.js';

const MAX_CHARS = 80000;
const MAX_COMPILE_FIXES = 2;

// 가장 큰 코드펜스 블록 추출(수정된 전체 파일)
function extractFenced(text) {
  const re = /```[a-zA-Z]*\n?([\s\S]*?)```/g;
  let m, best = null;
  while ((m = re.exec(text)) !== null) {
    if (best === null || m[1].length > best.length) best = m[1];
  }
  return best;
}

function stripFence(text) {
  const f = extractFenced(text);
  return f !== null ? f : text;
}

// 모듈 1회 실행: 프롬프트 채우고 LLM 호출 → {content, note}.
// 코드블록(수정된 전체 파일)을 못 찾으면 형식 리마인더와 함께 1회 재시도.
const FENCE_REMINDER = '\n\n[중요] 반드시 수정된 **전체 파일 내용**을 하나의 ```latex 코드블록으로 반환하세요. 변경이 없어도 파일 전체를 코드블록에 담아야 합니다. 설명만 적고 코드블록을 빠뜨리지 마세요.';
async function runModule(promptKey, roleName, vars) {
  const prompts = await getPrompts();
  const tpl = prompts[promptKey];
  if (!tpl) throw new Error(`프롬프트 없음: ${promptKey}`);
  const role = llmConfig.getRole(roleName);
  const filled = fillTemplate(tpl, vars);
  const opts = { backend: role.backend, model: role.model, reasoningEffort: role.reasoningEffort, timeoutMs: 600_000 };

  let out = await callLLM(filled, opts);
  let edited = extractFenced(out);
  if (edited === null) { // 형식 슬립 → 리마인더 붙여 1회 재시도
    out = await callLLM(filled + FENCE_REMINDER, opts);
    edited = extractFenced(out);
  }
  if (edited === null) {
    throw new Error('AI가 수정된 전체 파일(```latex 코드블록)을 반환하지 않았습니다. 파일이 너무 크거나(출력 잘림) 형식 오류일 수 있어요.');
  }
  const note = (out.split('```')[0] || '').trim() || '수정 완료';
  return { content: edited.replace(/\s*$/, '') + '\n', note };
}

// src 내 .bib 파일들에서 인용 키 수집
async function collectBibKeys(projectId) {
  const files = (await latexProject.listFiles(projectId)).filter(f => /\.bib$/i.test(f.path));
  const keys = [];
  for (const f of files) {
    try {
      const txt = await latexProject.readProjectFile(projectId, f.path);
      for (const m of txt.matchAll(/@\w+\s*\{\s*([^,\s]+)/g)) keys.push(m[1]);
    } catch { /* ignore */ }
  }
  return [...new Set(keys)];
}

// 프로젝트의 모든 .tex 내용을 합쳐 반환(근거 탐색용 문서 텍스트).
// 메인 파일을 맨 앞에 둬서, journalnames.tex 같은 긴 보일러플레이트가 본문을 밀어내지 않게 한다.
async function collectProjectText(projectId, mainFile) {
  const files = (await latexProject.listFiles(projectId)).filter(f => !f.dir && /\.tex$/i.test(f.path));
  files.sort((a, b) => {
    const am = a.path === mainFile ? 0 : 1;
    const bm = b.path === mainFile ? 0 : 1;
    return am - bm || a.path.localeCompare(b.path);
  });
  let txt = '';
  for (const f of files) {
    try {
      const body = await latexProject.readProjectFile(projectId, f.path);
      txt += `\n% ===== ${f.path} =====\n${body}\n`;
    } catch { /* ignore */ }
  }
  return txt.trim();
}

const MODULE_MAP = {
  writing: { prompt: 'writeBody', role: 'writeBody', type: '본문' },
  figure: { prompt: 'writeFigure', role: 'writeFigure', type: '그림/표' },
  citation: { prompt: 'writeCitation', role: 'writeCitation' },
};

// 작성팀 채팅 기록을 프롬프트용 텍스트로. 최근 8턴, 길면 자른다.
function formatHistory(history) {
  if (!Array.isArray(history) || !history.length) return '(이전 대화 없음)';
  return history.slice(-8).map((h) => {
    const who = (h.c || h.role) === 'user' ? '사용자' : 'AI';
    let t = String(h.text || '').replace(/^[\s🧑🤖🔎✗✓🧭🗺️✍️🔍🔧🎯📊📚]+/u, '').trim();
    if (t.length > 600) t = t.slice(0, 600) + '…';
    return `${who}: ${t}`;
  }).join('\n');
}

// Planner: 텍스트 계획 반환(코드블록 없음)
async function planStep(moduleType, fileName, content, instruction, history = '(이전 대화 없음)') {
  const prompts = await getPrompts();
  const role = llmConfig.getRole('writePlan');
  const out = await callLLM(fillTemplate(prompts.writePlan, { moduleType, fileName, content, instruction, history }), {
    backend: role.backend, model: role.model, reasoningEffort: role.reasoningEffort, timeoutMs: 180_000,
  });
  return (out || '').trim();
}

// 본문/그림 모듈: 계획 → 작성 → 검토 (멀티에이전트, STORM식)
async function multiAgentEdit({ module, fileName, content, instruction, onStep, history = '(이전 대화 없음)' }) {
  const sel = MODULE_MAP[module];
  onStep({ stage: 'plan', label: '🗺️ 계획 수립 중…' });
  const plan = await planStep(sel.type, fileName, content, instruction, history);
  onStep({ stage: 'write', label: `✍️ ${sel.type} 작성 중…` });
  const draft = await runModule(sel.prompt, sel.role, { fileName, content, instruction, plan, history });
  onStep({ stage: 'review', label: '🔍 검토 중…' });
  // 검토는 비치명적: 검토가 코드블록을 안 돌려주면(수정 불필요 등) 작성 초안을 그대로 채택.
  try {
    const reviewed = await runModule('writeReview', 'writeReview', { fileName, content: draft.content, instruction, plan, history });
    return { content: reviewed.content, note: `[계획→작성→검토] ${reviewed.note}` };
  } catch {
    return { content: draft.content, note: `[계획→작성] ${draft.note} (검토 생략)` };
  }
}

const MODLABEL = { writing: '✍️ 본문', figure: '📊 그림·표', citation: '📚 인용', evidence: '🔎 근거탐색', research: '🌐 리서치' };
const MAX_STEPS = 4;

// 웹 리서치 1회 → 답변 텍스트. 준 URL을 WebFetch로 읽음(claude 웹도구).
async function runResearchStep(projectId, rawInstruction, stepInstruction, mainFile) {
  const urlSet = new Set();
  for (const src of [rawInstruction, stepInstruction]) {
    for (const m of (String(src || '').match(/https?:\/\/[^\s)>\]]+/g) || [])) urlSet.add(m);
  }
  const urls = [...urlSet];
  const docText = (await collectProjectText(projectId, mainFile)).slice(0, 60000);
  const prompts = await getPrompts();
  const role = llmConfig.getRole('research');
  const useClaude = role.backend === 'claude';
  try {
    const out = await callLLM(fillTemplate(prompts.research, {
      urls: urls.length ? urls.join('\n') : '(URL 없음 — 필요하면 WebSearch로 검색)',
      document: docText || '(논문 내용 없음)',
      question: stepInstruction,
    }), {
      backend: 'claude', // 웹(WebFetch/WebSearch)은 claude 백엔드에서만
      model: useClaude ? role.model : undefined,
      reasoningEffort: useClaude ? role.reasoningEffort : undefined,
      allowedTools: ['WebFetch', 'WebSearch'],
      timeoutMs: 300_000,
    });
    return (out || '').trim();
  } catch (err) {
    return `웹 리서치에 실패했습니다: ${err.message} (claude 로그인/웹 도구 사용 가능 여부 확인)`;
  }
}

// 일반 채팅(읽기 전용) → 답변 텍스트. 전문 모듈에 안 맞는 요청을 튜닝 없는 도우미가 답함.
async function runChatStep(question, history) {
  const prompts = await getPrompts();
  const role = llmConfig.getRole('writeChat');
  try {
    const out = await callLLM(fillTemplate(prompts.writeChat, { question, history: history || '(이전 대화 없음)' }), {
      backend: role.backend, model: role.model, reasoningEffort: role.reasoningEffort, timeoutMs: 180_000,
    });
    return (out || '').trim();
  } catch (err) {
    return `답변 생성에 실패했습니다: ${err.message}`;
  }
}

// 편집 단계 1회(writing/figure/citation) → {content, note}. 전문을 다 읽고 수정한다(전체 흐름 일관성).
async function runEditStep({ projectId, file, module, content, instruction, history, onStep }) {
  if (module === 'citation') {
    onStep({ stage: 'citation', label: '📚 인용 채우는 중…' });
    const bibKeys = (await collectBibKeys(projectId)).join(', ') || '(없음)';
    return runModule('writeCitation', 'writeCitation', { fileName: file, content, instruction, bibKeys });
  }
  return multiAgentEdit({ module, fileName: file, content, instruction, onStep, history });
}

// ---------------- 워크스페이스 편집 (claude 백엔드 전용) ----------------
// 프로젝트 src 디렉터리를 cwd로 두고 Claude Code가 Read/Grep/Glob/Edit/Write로
// 직접 탐색·수정한다. 기존 "전문을 프롬프트에 넣고 전문을 돌려받는" 파이프라인과 달리
// 큰 파일·멀티파일 수정이 가능하고 토큰도 적게 쓴다. 변경은 스냅샷 diff로 추적하고,
// 텍스트 소스 외 파일이 변경되면 전부 롤백한다.

const WORKSPACE_TOOLS = ['Read', 'Grep', 'Glob', 'Edit', 'Write', 'WebFetch', 'WebSearch'];

function diffToChangedFiles(diff) {
  return [
    ...diff.modified.map(p => ({ path: p, status: 'modified' })),
    ...diff.added.map(p => ({ path: p, status: 'added' })),
    ...diff.deleted.map(p => ({ path: p, status: 'deleted' })),
  ];
}

// 워크스페이스에서 claude 1회 실행. 텍스트 외 파일 변경 시 롤백 후 throw.
async function runWorkspaceClaude({ srcDir, snap, role, prompt, timeoutMs }) {
  let answer;
  try {
    answer = await callClaude(prompt, {
      cwd: srcDir,
      model: role.model,
      reasoningEffort: role.reasoningEffort,
      allowedTools: WORKSPACE_TOOLS,
      permissionMode: 'acceptEdits',
      timeoutMs,
    });
  } catch (err) {
    // 타임아웃·CLI 실패 등으로 부분 수정이 남을 수 있음 → 스냅샷으로 전체 복원
    const d = await diffSnapshot(snap).catch(() => null);
    if (d) await restoreSnapshot(snap, d).catch(() => {});
    throw err;
  }
  const diff = await diffSnapshot(snap);
  const violations = [...diff.modified, ...diff.added, ...diff.deleted]
    .filter(p => !latexProject.isEditablePath(p));
  if (violations.length) {
    await restoreSnapshot(snap, diff).catch(() => {});
    throw new Error(`에이전트가 텍스트 소스가 아닌 파일을 변경하려 해 모두 되돌렸습니다: ${violations.join(', ')}`);
  }
  return { answer: (answer || '').trim(), diff };
}

/**
 * 워크스페이스 편집: 단일 에이전트 세션이 탐색→수정(→웹)을 모두 처리한다.
 * 반환 형태는 runPaperWriting과 호환 + changedFiles 추가.
 * @param {{ projectId:number, file:string, mainFile:string, instruction:string, history?:Array, onStep?:Function }} args
 */
export async function runWorkspaceEdit({ projectId, file, mainFile, instruction, history = [], onStep = () => {} }) {
  const role = llmConfig.getRole('writeOrchestrator');
  if (role.backend !== 'claude') throw new Error('워크스페이스 편집은 claude 백엔드에서만 지원됩니다.');
  const srcDir = projectSrcDir(projectId);
  const prompts = await getPrompts();
  if (!prompts.writeWorkspace) throw new Error('프롬프트 없음: writeWorkspace');
  const convHistory = formatHistory(history);

  onStep({ stage: 'snapshot', label: '📸 변경 추적 준비…' });
  const snap = await takeSnapshot(srcDir);

  onStep({ stage: 'agent', label: '🛠️ 워크스페이스에서 작업 중… (탐색→수정)' });
  const main = await runWorkspaceClaude({
    srcDir, snap, role,
    prompt: fillTemplate(prompts.writeWorkspace, { fileName: file, mainFile, instruction, history: convHistory }),
    timeoutMs: 900_000,
  });

  let changed = diffToChangedFiles(main.diff);

  // 아무 파일도 안 바뀜 → 읽기 전용 답변 (컴파일 생략)
  if (!changed.length) {
    const answer = main.answer || '(결과 없음)';
    const content = await latexProject.readProjectFile(projectId, file).catch(() => '');
    return { module: 'workspace', readOnly: true, answer, note: answer, file, content, compiled: null, fixes: 0, log: '', changedFiles: [] };
  }

  // 컴파일 게이트 + 오류 시 워크스페이스 수정 루프
  onStep({ stage: 'compile', label: '🔧 컴파일 중…' });
  let compile = await compileProject(projectId, mainFile, { timeoutMs: 180_000 });
  let fixes = 0;
  while (!compile.hasPdf && fixes < MAX_COMPILE_FIXES) {
    fixes++;
    onStep({ stage: 'fix', label: `🔧 컴파일 오류 수정 중… (${fixes}회)` });
    const logTail = (compile.log || '').split('\n').slice(-80).join('\n');
    // 수정 단계 전용 스냅샷 — 실패/위반 시 이번 수정 시도만 롤백되고 본편집은 유지된다.
    const snapFix = await takeSnapshot(srcDir);
    try {
      await runWorkspaceClaude({
        srcDir, snap: snapFix, role,
        prompt: fillTemplate(prompts.writeWorkspace, {
          fileName: file, mainFile, history: '(직전 편집에 대한 컴파일 오류 수정 단계)',
          instruction: `방금 편집한 뒤 LaTeX 컴파일이 실패했습니다. 아래 로그 끝부분을 보고 원인 파일·위치를 찾아 **최소 수정**으로 고치세요. 내용을 새로 쓰지 말고 컴파일이 통과하게만 만드세요.\n\n## 컴파일 로그 (끝부분)\n${logTail}`,
        }),
        timeoutMs: 600_000,
      });
    } catch { break; }
    compile = await compileProject(projectId, mainFile, { timeoutMs: 180_000 });
  }

  // 수정 루프 반영해 최종 변경 목록 재계산
  changed = diffToChangedFiles(await diffSnapshot(snap));

  let note = `🛠️ ${main.answer || '수정 완료'}`;
  note += `\n\n변경된 파일: ${changed.map(c => `${c.path}${c.status === 'added' ? ' (새 파일)' : ''}`).join(', ') || '(없음)'}`;
  if (fixes > 0) note += compile.hasPdf ? `\n(컴파일 오류 ${fixes}회 자동 수정)` : `\n(컴파일 오류 자동 수정 ${fixes}회 시도했으나 실패 — 로그 확인)`;

  const content = await latexProject.readProjectFile(projectId, file).catch(() => '');
  return {
    module: 'workspace',
    note,
    content,
    file,
    compiled: compile.hasPdf,
    fixes,
    log: (compile.log || '').slice(-8000),
    changedFiles: changed,
  };
}

/**
 * 정적 다단계 코디네이터: 오케스트레이터가 단계 목록(steps)을 세우고 순서대로 실행한다.
 * 읽기전용 단계(research/evidence)의 결과는 이후 편집 단계의 컨텍스트로 전달된다.
 * @param {{ projectId:number, file:string, mainFile:string, instruction:string, history?:Array, onStep?:Function }} args
 */
export async function runPaperWriting({ projectId, file, mainFile, instruction, history = [], onStep = () => {} }) {
  const originalContent = await latexProject.readProjectFile(projectId, file);
  if (originalContent.length > MAX_CHARS) throw new Error(`파일이 너무 큽니다(${originalContent.length}자, 최대 ${MAX_CHARS}).`);
  const convHistory = formatHistory(history);

  // 1) 오케스트레이터: 다단계 계획(steps) 수립 (이전 대화 참고)
  onStep({ stage: 'orchestrate', label: '🧭 지시 분석·계획 중…' });
  let steps = [];
  try {
    const prompts = await getPrompts();
    const orchRole = llmConfig.getRole('writeOrchestrator');
    const out = await callLLM(fillTemplate(prompts.writeOrchestrator, { fileName: file, instruction, history: convHistory }), {
      backend: orchRole.backend, model: orchRole.model, reasoningEffort: orchRole.reasoningEffort, timeoutMs: 120_000,
    });
    const j = JSON.parse(stripFence(out));
    if (Array.isArray(j.steps)) steps = j.steps;
    else if (j.module) steps = [{ module: j.module, instruction: j.refinedInstruction || instruction }];
  } catch { /* 실패 → 기본 writing */ }
  steps = steps
    .filter(s => s && ['writing', 'figure', 'citation', 'evidence', 'research', 'chat'].includes(s.module) && typeof s.instruction === 'string' && s.instruction.trim())
    .slice(0, MAX_STEPS);
  if (!steps.length) steps = [{ module: 'writing', instruction }];

  onStep({ stage: 'plan', label: `🧭 계획: ${steps.map(s => MODLABEL[s.module] || s.module).join(' → ')}`, steps: steps.map(s => s.module) });

  // 2) 단계별 실행 — 읽기전용 결과를 이후 편집 단계 컨텍스트로 전달
  const readOnlyAnswers = [];
  const editNotes = [];
  let priorContext = '';
  let edited = false;
  let lastEditModule = 'writing';

  for (let i = 0; i < steps.length; i++) {
    const st = steps[i];
    const tag = steps.length > 1 ? `(${i + 1}/${steps.length}) ` : '';
    if (st.module === 'evidence') {
      onStep({ stage: 'step', label: `${tag}🔎 근거 탐색…` });
      const docText = await collectProjectText(projectId, mainFile);
      const ans = await findEvidence({ documentText: docText, question: st.instruction });
      readOnlyAnswers.push(`🔎 [근거 탐색]\n${ans}`);
      priorContext += `\n[근거 탐색 결과] ${ans}\n`;
    } else if (st.module === 'research') {
      onStep({ stage: 'step', label: `${tag}🌐 웹 리서치…` });
      const ans = await runResearchStep(projectId, instruction, st.instruction, mainFile);
      readOnlyAnswers.push(`🌐 [웹 리서치]\n${ans}`);
      priorContext += `\n[웹 리서치 결과] ${ans}\n`;
    } else if (st.module === 'chat') {
      onStep({ stage: 'step', label: `${tag}💬 답변 생성…` });
      const ctx = convHistory + (priorContext ? `\n\n[이전 단계 결과]\n${priorContext}` : '');
      const ans = await runChatStep(st.instruction, ctx);
      readOnlyAnswers.push(`💬 ${ans}`);
      priorContext += `\n[채팅 답변] ${ans}\n`;
    } else {
      onStep({ stage: 'step', label: `${tag}${MODLABEL[st.module]} 작성…` });
      const curContent = await latexProject.readProjectFile(projectId, file);
      const stepHistory = convHistory + (priorContext ? `\n\n[이번 작업의 이전 단계 결과 — 반영할 것]\n${priorContext}` : '');
      const ed = await runEditStep({ projectId, file, module: st.module, content: curContent, instruction: st.instruction, history: stepHistory, onStep });
      await latexProject.writeProjectFile(projectId, file, ed.content);
      edited = true;
      lastEditModule = st.module;
      editNotes.push(`${MODLABEL[st.module]} ${ed.note}`);
    }
  }

  // 읽기 전용만 수행 → 답변 반환(파일·컴파일 변경 없음)
  if (!edited) {
    const answer = readOnlyAnswers.join('\n\n') || '(결과 없음)';
    return { module: steps[steps.length - 1].module, readOnly: true, answer, note: answer, file, content: originalContent, compiled: null, fixes: 0, log: '' };
  }

  // 3) 컴파일 게이트 + 에러 수정 루프 (모든 편집 후 1회)
  onStep({ stage: 'compile', label: '🔧 컴파일 중…' });
  let compile = await compileProject(projectId, mainFile, { timeoutMs: 180_000 });
  let fixes = 0;
  let finalContent = await latexProject.readProjectFile(projectId, file);
  while (!compile.hasPdf && fixes < MAX_COMPILE_FIXES) {
    fixes++;
    onStep({ stage: 'fix', label: `🔧 컴파일 오류 수정 중… (${fixes}회)` });
    const cur = await latexProject.readProjectFile(projectId, file);
    const logTail = (compile.log || '').split('\n').slice(-60).join('\n');
    let fix;
    try {
      fix = await runModule('writeCompile', 'writeCompile', { fileName: file, content: cur, log: logTail });
    } catch { break; }
    await latexProject.writeProjectFile(projectId, file, fix.content);
    finalContent = fix.content;
    compile = await compileProject(projectId, mainFile, { timeoutMs: 180_000 });
  }

  let note = [...readOnlyAnswers, ...editNotes].join('\n\n');
  if (fixes > 0) note += compile.hasPdf ? `\n(컴파일 오류 ${fixes}회 자동 수정)` : `\n(컴파일 오류 자동 수정 ${fixes}회 시도했으나 실패 — 로그 확인)`;

  return {
    module: lastEditModule,
    note,
    content: finalContent,
    file,
    compiled: compile.hasPdf,
    fixes,
    log: (compile.log || '').slice(-8000),
  };
}
