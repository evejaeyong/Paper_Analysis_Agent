// core/latexProject.js
// LaTeX 프로젝트 ZIP 해제 + 소스 파일 read/write (경로 탐색 차단).
import path from 'node:path';
import fs from 'node:fs/promises';
import { unzipSync, zipSync } from 'fflate';
import { projectSrcDir, projectDir, ensureDir } from './fileManager.js';

const MAX_FILES = 3000;
const MAX_TOTAL_BYTES = 120 * 1024 * 1024; // 해제 후 총량 상한
const EDITABLE_EXT = new Set(['.tex', '.bib', '.cls', '.sty', '.txt', '.md', '.def', '.ltx', '.tikz']);
// in-place 컴파일 산출물 — 파일 트리에서 숨긴다. (.pdf는 그림일 수 있어 제외 — 컴파일 출력 pdf만
// listFiles에서 별도로 숨긴다.)
const ARTIFACT_EXT = new Set([
  '.aux', '.log', '.out', '.bbl', '.blg', '.bcf', '.toc', '.lof', '.lot',
  '.fls', '.fdb_latexmk', '.synctex', '.gz', '.nav', '.snm', '.vrb', '.xdv',
  '.dvi', '.idx', '.ind', '.ilg', '.run.xml',
]);

// 미리보기 가능한 래스터 이미지(=업로드 허용 자산)
const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg']);
// 그림으로 쓰이지만 <img>로 미리보기 안 되는 형식(트리에는 보여줌)
const GRAPHIC_OTHER_EXT = new Set(['.eps', '.ps', '.tif', '.tiff']);
const MAX_ASSET_BYTES = 50 * 1024 * 1024; // 업로드 1파일 상한(전송 한도와 동일)

export function isEditablePath(rel) {
  return EDITABLE_EXT.has(path.extname(rel).toLowerCase());
}

export function isImagePath(rel) {
  return IMAGE_EXT.has(path.extname(rel).toLowerCase());
}

export function isPdfPath(rel) {
  return path.extname(rel).toLowerCase() === '.pdf';
}

// 업로드(드래그/선택)로 추가 가능한 자산 — 모든 파일 형식 허용(pdf 등 포함).
// 경로 안전성은 resolveInSrc, 크기는 MAX_ASSET_BYTES가 담당한다.
export function isUploadableAsset(rel) {
  return !!rel && !String(rel).endsWith('/');
}

// 파일 종류: 'text'(편집) | 'image'(래스터 미리보기) | 'pdf'(미리보기) | 'other'(목록만)
export function fileKind(rel) {
  if (isEditablePath(rel)) return 'text';
  if (isImagePath(rel)) return 'image';
  if (isPdfPath(rel)) return 'pdf';
  return 'other';
}

export function isArtifactPath(rel) {
  const lower = rel.toLowerCase();
  if (lower.endsWith('.synctex.gz') || lower.endsWith('.run.xml')) return true;
  return ARTIFACT_EXT.has(path.extname(lower));
}

// zip 엔트리 이름을 안전한 상대 경로(posix)로. 거부 시 null.
function sanitizeEntryName(name) {
  const norm = name.replace(/\\/g, '/');
  if (norm.startsWith('__MACOSX/')) return null;
  const base = norm.split('/').pop() || '';
  if (base === '.DS_Store' || base.startsWith('._')) return null;
  if (norm.startsWith('/') || /^[a-zA-Z]:/.test(norm)) return null; // 절대경로
  const parts = norm.split('/').filter(p => p && p !== '.');
  if (parts.some(p => p === '..')) return null; // 상위 탈출
  if (!parts.length) return null;
  return parts.join('/');
}

// 모든 엔트리가 동일한 최상위 폴더 하나에 들어있으면 그 prefix 를 반환(벗겨내기 용).
function commonTopPrefix(names) {
  let prefix = null;
  for (const n of names) {
    const top = n.includes('/') ? n.slice(0, n.indexOf('/')) : null;
    if (top === null) return null; // 루트에 파일이 있음 → 벗기지 않음
    if (prefix === null) prefix = top;
    else if (prefix !== top) return null;
  }
  return prefix;
}

/**
 * ZIP 버퍼를 projects/{id}/src 로 해제. 보안 검증 포함.
 * @returns {Promise<{fileCount:number, mainGuess:string}>}
 */
export async function extractZip(buf, projectId) {
  const entries = unzipSync(new Uint8Array(buf)); // { name: Uint8Array }
  const names = Object.keys(entries)
    .map(sanitizeEntryName)
    .filter(Boolean)
    .filter(n => !n.endsWith('/'));
  if (!names.length) throw new Error('ZIP 안에서 유효한 파일을 찾지 못했습니다.');
  if (names.length > MAX_FILES) throw new Error(`파일 수가 너무 많습니다 (${names.length} > ${MAX_FILES}).`);

  const strip = commonTopPrefix(names);
  const srcDir = projectSrcDir(projectId);
  await ensureDir(srcDir);

  // strip 적용한 최종 상대경로
  const relOf = (safe) => {
    if (strip && safe.startsWith(strip + '/')) return safe.slice(strip.length + 1);
    return safe;
  };
  // 디렉터리로 쓰이는 경로 집합. 슬래시 없이 저장된 디렉터리 엔트리(예: `figures`)가
  // 빈 파일로 써진 뒤 같은 이름의 폴더를 mkdir 하다 EEXIST로 터지는 것을 막는다.
  const dirPaths = new Set();
  for (const n of names) {
    const parts = relOf(n).split('/');
    for (let i = 1; i < parts.length; i++) dirPaths.add(parts.slice(0, i).join('/'));
  }

  let total = 0;
  const written = [];
  for (const origName of Object.keys(entries)) {
    const safe = sanitizeEntryName(origName);
    if (!safe || safe.endsWith('/')) continue;
    const rel = relOf(safe);
    if (!rel || dirPaths.has(rel)) continue; // 디렉터리 마커(같은 이름이 폴더로 쓰임)는 파일로 쓰지 않음
    const data = entries[origName];
    total += data.length;
    if (total > MAX_TOTAL_BYTES) throw new Error('해제 후 총 용량이 한계를 초과했습니다.');

    const abs = path.join(srcDir, rel);
    // 최종 방어: 해석 경로가 srcDir 하위인지 확인
    if (abs !== srcDir && !abs.startsWith(srcDir + path.sep)) continue;
    await ensureDir(path.dirname(abs));
    await fs.writeFile(abs, Buffer.from(data));
    written.push(rel.replace(/\\/g, '/'));
  }
  if (!written.length) throw new Error('ZIP 해제 결과가 비어 있습니다.');

  const mainGuess = await detectMainTex(projectId, written);
  return { fileCount: written.length, mainGuess };
}

// \documentclass 를 포함한 .tex 우선. 없으면 main.tex / 첫 .tex.
export async function detectMainTex(projectId, knownFiles = null) {
  const srcDir = projectSrcDir(projectId);
  const files = knownFiles || (await listFiles(projectId)).map(f => f.path);
  const texFiles = files.filter(f => /\.tex$/i.test(f));
  if (!texFiles.length) return files[0] || 'main.tex';
  // 얕은 경로 우선
  texFiles.sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b));
  for (const rel of texFiles) {
    try {
      const txt = await fs.readFile(path.join(srcDir, rel), 'utf8');
      if (/\\documentclass/.test(txt)) return rel;
    } catch { /* ignore */ }
  }
  return texFiles.find(f => /(^|\/)main\.tex$/i.test(f)) || texFiles[0];
}

// 소스 트리 평탄 목록. 파일 { path, size, editable, kind } + 빈 폴더 { path, dir:true }
export async function listFiles(projectId) {
  const srcDir = projectSrcDir(projectId);
  const raw = []; // { path, size }
  const allDirs = []; // 모든 디렉터리 상대경로
  const dirsWithFiles = new Set(); // 파일이 (재귀적으로) 들어있는 디렉터리
  async function walk(absDir, relDir) {
    let entries;
    try { entries = await fs.readdir(absDir, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      const rel = relDir ? `${relDir}/${e.name}` : e.name;
      if (e.isDirectory()) {
        if (e.name === '.claude') continue; // 도구 설정(.claude/agents 등)은 트리에 숨김
        allDirs.push(rel); await walk(path.join(absDir, e.name), rel); continue;
      }
      if (isArtifactPath(rel)) continue; // 컴파일 산출물 숨김(.pdf 제외)
      let size = 0;
      try { size = (await fs.stat(path.join(absDir, e.name))).size; } catch { /* ignore */ }
      raw.push({ path: rel, size });
      // 이 파일의 조상 디렉터리 모두 표시
      let p = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : '';
      while (p) { dirsWithFiles.add(p); p = p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : ''; }
    }
  }
  await walk(srcDir, '');

  // 같은 폴더에 동명의 .tex 가 있는 .pdf 는 "컴파일 출력물"로 보고 숨긴다(그림 pdf는 표시).
  const texBases = new Set(raw.filter(f => /\.tex$/i.test(f.path)).map(f => f.path.replace(/\.tex$/i, '')));
  const out = raw
    .filter(f => !(isPdfPath(f.path) && texBases.has(f.path.replace(/\.pdf$/i, ''))))
    .map(f => ({ path: f.path, size: f.size, editable: isEditablePath(f.path), kind: fileKind(f.path) }));
  // 파일이 하나도 없는 빈 폴더는 별도 dir 항목으로 추가(트리에 보이도록)
  for (const d of allDirs) {
    if (!dirsWithFiles.has(d)) out.push({ path: d, dir: true });
  }
  out.sort((a, b) => a.path.localeCompare(b.path));
  return out;
}

// relPath 를 srcDir 하위 절대경로로. 탈출 시 throw.
function resolveInSrc(projectId, relPath) {
  const srcDir = projectSrcDir(projectId);
  const rel = String(relPath || '').replace(/\\/g, '/');
  if (rel.startsWith('/') || /^[a-zA-Z]:/.test(rel) || rel.split('/').includes('..')) {
    throw new Error('잘못된 파일 경로');
  }
  const abs = path.join(srcDir, rel);
  if (abs !== srcDir && !abs.startsWith(srcDir + path.sep)) throw new Error('잘못된 파일 경로');
  return abs;
}

export async function readProjectFile(projectId, relPath) {
  const abs = resolveInSrc(projectId, relPath);
  return await fs.readFile(abs, 'utf8');
}

// 바이너리(이미지 등) 원본 바이트 — 미리보기/다운로드용
export async function readProjectFileBuffer(projectId, relPath) {
  const abs = resolveInSrc(projectId, relPath);
  return await fs.readFile(abs);
}

// 새 (빈) 텍스트 파일 생성. 편집 가능한 형식만, 이미 있으면 거부. 상위 폴더는 자동 생성.
export async function createProjectFile(projectId, relPath) {
  const rel = String(relPath || '').trim();
  if (!rel) throw new Error('파일 이름이 필요합니다.');
  if (!isEditablePath(rel)) throw new Error('이 형식은 만들 수 없습니다 (.tex/.bib/.sty/.txt 등 텍스트만 가능).');
  const abs = resolveInSrc(projectId, rel);
  let exists = false;
  try { await fs.access(abs); exists = true; } catch { /* 없음 */ }
  if (exists) throw new Error('이미 존재하는 파일입니다.');
  await ensureDir(path.dirname(abs));
  await fs.writeFile(abs, '', 'utf8');
  return rel.replace(/\\/g, '/');
}

// 작성팀 채팅 로그 — 프로젝트 디렉터리에 영구 저장(src 밖이라 파일트리·zip에 안 들어감).
const CHAT_FILE = 'chat.json';
export async function readProjectChat(projectId) {
  try {
    const raw = await fs.readFile(path.join(projectDir(projectId), CHAT_FILE), 'utf8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
export async function writeProjectChat(projectId, chats) {
  const arr = (Array.isArray(chats) ? chats : [])
    .filter(m => m && typeof m.text === 'string')
    .map(m => ({ c: m.c === 'user' ? 'user' : (m.c === 'ai error' ? 'ai error' : 'ai'), text: String(m.text).slice(0, 8000) }))
    .slice(-200);
  const dir = projectDir(projectId);
  await ensureDir(dir);
  await fs.writeFile(path.join(dir, CHAT_FILE), JSON.stringify(arr), 'utf8');
  return arr.length;
}

// 파일/폴더 이동(드래그&드롭). 경로탈출 차단, 대상 중복·자기하위 이동 거부.
export async function moveProjectPath(projectId, from, to) {
  const absFrom = resolveInSrc(projectId, from);
  const absTo = resolveInSrc(projectId, to);
  const srcDir = projectSrcDir(projectId);
  if (absFrom === srcDir) throw new Error('루트는 이동할 수 없습니다.');
  if (absFrom === absTo) return String(to).replace(/\\/g, '/');
  let st;
  try { st = await fs.stat(absFrom); } catch { throw new Error('원본을 찾을 수 없습니다.'); }
  if (st.isDirectory() && (absTo === absFrom || absTo.startsWith(absFrom + path.sep))) {
    throw new Error('폴더를 자기 자신 하위로 이동할 수 없습니다.');
  }
  let exists = false;
  try { await fs.access(absTo); exists = true; } catch { /* 없음 */ }
  if (exists) throw new Error('대상 위치에 같은 이름이 이미 있습니다.');
  await ensureDir(path.dirname(absTo));
  await fs.rename(absFrom, absTo);
  return String(to).replace(/\\/g, '/');
}

// 새 폴더 생성. 이미 있으면 거부. 경로탈출 차단.
export async function createProjectFolder(projectId, relPath) {
  const rel = String(relPath || '').trim().replace(/\/+$/, '');
  if (!rel) throw new Error('폴더 이름이 필요합니다.');
  const abs = resolveInSrc(projectId, rel);
  let exists = false;
  try { await fs.access(abs); exists = true; } catch { /* 없음 */ }
  if (exists) throw new Error('이미 존재합니다.');
  await ensureDir(abs);
  return rel.replace(/\\/g, '/');
}

// 프로젝트 내 파일/폴더 삭제(경로탈출 차단). 폴더면 재귀 삭제. src 루트 자체는 거부.
export async function deleteProjectPath(projectId, relPath) {
  const srcDir = projectSrcDir(projectId);
  const abs = resolveInSrc(projectId, relPath);
  if (abs === srcDir) throw new Error('루트는 삭제할 수 없습니다.');
  let stat;
  try { stat = await fs.stat(abs); }
  catch { throw new Error('파일을 찾을 수 없습니다.'); }
  if (stat.isDirectory()) await fs.rm(abs, { recursive: true, force: true });
  else await fs.unlink(abs);
  return String(relPath).replace(/\\/g, '/');
}

// 업로드된 자산 저장. 모든 파일 형식 허용(이미지·pdf 등). 편집 불가 형식도 프로젝트에 추가 가능.
export async function writeProjectAsset(projectId, relPath, buffer) {
  if (!isUploadableAsset(relPath)) throw new Error('파일 이름이 올바르지 않습니다.');
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  if (buf.length > MAX_ASSET_BYTES) throw new Error('파일이 너무 큽니다 (최대 50MB).');
  const abs = resolveInSrc(projectId, relPath);
  await ensureDir(path.dirname(abs));
  await fs.writeFile(abs, buf);
  return String(relPath).replace(/\\/g, '/');
}

export async function writeProjectFile(projectId, relPath, content) {
  if (!isEditablePath(relPath)) throw new Error('편집할 수 없는 파일 형식입니다.');
  const abs = resolveInSrc(projectId, relPath);
  await ensureDir(path.dirname(abs));
  await fs.writeFile(abs, String(content ?? ''), 'utf8');
}

// 작성팀 하위 에이전트(프로젝트별 src/.claude/agents/). 기존 작성팀 프롬프트 전체를 그대로
// 가져와(STORM 입출력 배관 줄만 제거), 워크스페이스 헤더를 붙여 생성한다. 프롬프트가 단일
// 출처이므로 **채팅마다 자동 갱신**(덮어씀). 작성팀 구조를 그대로 서브에이전트로 재현한다.
// mode: edit(파일 수정) | read(읽기/분석/계획만) | web(읽기+웹 도구)
const AGENTS_FROM_PROMPT = [
  { file: 'planner.md', name: 'planner', key: 'writePlan', mode: 'read', desc: '작성 전 무엇을 어디에 어떻게 할지 구체적 작업 계획 수립(LaTeX 코드 작성 X).' },
  { file: 'writer.md', name: 'writer', key: 'writeBody', mode: 'edit', desc: '본문 텍스트 작성·수정·요약·번역·재구성(문단/섹션 단위).' },
  { file: 'figure.md', name: 'figure', key: 'writeFigure', mode: 'edit', desc: 'tikz/pgfplots 그림과 표(table) 생성·수정. 표 작업은 반드시 이 에이전트.' },
  { file: 'citation.md', name: 'citation', key: 'writeCitation', mode: 'edit', desc: '빈 \\cite{} 를 기존 .bib 키로 채움·인용 정리(새 키 생성 금지).' },
  { file: 'reviewer.md', name: 'reviewer', key: 'writeReview', mode: 'edit', desc: '작성/수정 후 흐름·문법·일관성·작성 rule 점검(문제 부분만 최소 수정).' },
  { file: 'compile.md', name: 'compile', key: 'writeCompile', mode: 'edit', desc: '컴파일 오류를 로그 보고 근본 원인만 최소 수정.' },
  { file: 'research.md', name: 'research', key: 'research', mode: 'web', desc: 'URL 읽기·웹 검색으로 외부 자료·관련연구 조사(파일 수정 X).' },
  { file: 'evidence.md', name: 'evidence', key: 'evidence', mode: 'read', desc: '문서 안에 특정 주장·내용이 있는지 근거(원문 발췌·위치)와 함께 찾기(파일 수정 X).' },
  { file: 'chat.md', name: 'chat', key: 'writeChat', mode: 'read', desc: '전문 작업이 아닌 일반 질문·조언·md/요약 작성(파일 수정 X).' },
];

const EDIT_HEADER = '[워크스페이스 하위 에이전트] 프로젝트 폴더에서 Edit 도구로 파일을 직접 수정합니다. 전체 파일을 반환하거나 코드블록으로 출력하지 말고, 바뀌는 부분만 Edit로 최소 수정하세요. 요청하지 않은 부분·기존 내용을 통째로 지우지 마세요. 작업 후 무엇을 왜 바꿨는지 1~3문장으로 보고합니다.';
const READ_HEADER = '[워크스페이스 하위 에이전트] 프로젝트 폴더의 파일을 Read/Grep/Glob(필요시 웹 도구)으로 직접 읽고 분석·조사·계획만 합니다. **파일은 수정하지 않습니다.** 결과를 오케스트레이터에게 한국어로 보고합니다.';
const AGENT_TOOLS = { edit: 'Read, Grep, Glob, Edit', read: 'Read, Grep, Glob', web: 'Read, Grep, Glob, WebFetch, WebSearch' };

// 기존 프롬프트 → 서브에이전트 본문: 치환변수({{...}})가 든 섹션·헤딩만 있는 빈 섹션 제거,
// "전체 파일 반환/코드블록" 등 STORM 전용(워크스페이스에 안 맞는) 줄만 제거하고 나머지는 그대로.
export function promptToAgentBody(text) {
  const sections = String(text || '').split(/\n(?=##\s)/);
  const kept = sections.filter(s => {
    if (/\{\{/.test(s)) return false; // 입력 치환 섹션 제거
    const lines = s.split('\n');
    if (/^##\s/.test(lines[0]) && lines.slice(1).join('').trim() === '') return false; // 헤딩만 있는 빈 섹션 제거
    return true;
  });
  const body = kept.join('\n').split('\n')
    .filter(l => !/(전체 파일|파일 전체|코드블록|일부만 반환|스니펫|직접 읽을 수 없|파일 시스템에 대한 추측)/.test(l))
    .join('\n');
  return body.replace(/\n{3,}/g, '\n\n').trim();
}

// 프로젝트 src/.claude/agents/ 에 하위 에이전트 정의를 (현재 프롬프트 기준으로) 생성·갱신.
// prompts: getCurrent() 결과 객체. 반환: agents 디렉터리.
export async function writeProjectAgents(projectId, prompts) {
  const dir = path.join(projectSrcDir(projectId), '.claude', 'agents');
  await ensureDir(dir);
  for (const a of AGENTS_FROM_PROMPT) {
    const src = prompts && prompts[a.key];
    if (!src) continue;
    const header = a.mode === 'edit' ? EDIT_HEADER : READ_HEADER;
    const tools = AGENT_TOOLS[a.mode] || AGENT_TOOLS.read;
    const md = `---\nname: ${a.name}\ndescription: ${a.desc}\ntools: ${tools}\n---\n${header}\n\n--- 아래는 당신의 전문 규칙입니다 ---\n\n${promptToAgentBody(src)}\n`;
    await fs.writeFile(path.join(dir, a.file), md, 'utf8'); // 단일 출처(프롬프트) → 매번 갱신
  }
  return dir;
}

// zip 다운로드용: 소스 + 결과 PDF 포함, 중간 산출물(.aux/.log/.synctex.gz 등)·.claude 설정은 제외.
const ZIP_SKIP_EXT = new Set([
  '.aux', '.log', '.out', '.blg', '.fls', '.fdb_latexmk', '.toc', '.lof', '.lot',
  '.nav', '.snm', '.vrb', '.xdv', '.dvi', '.idx', '.ind', '.ilg', '.bcf',
]);
function skipForZip(rel) {
  const l = rel.toLowerCase().replace(/\\/g, '/');
  if (l === '.claude' || l.startsWith('.claude/')) return true; // 에이전트 정의 등 도구 설정은 ZIP 제외
  if (l.endsWith('.synctex.gz') || l.endsWith('.run.xml')) return true;
  return ZIP_SKIP_EXT.has(path.extname(l));
}

export async function zipProject(projectId) {
  const srcDir = projectSrcDir(projectId);
  const entries = {};
  async function walk(absDir, relDir) {
    let list;
    try { list = await fs.readdir(absDir, { withFileTypes: true }); } catch { return; }
    for (const e of list) {
      const rel = relDir ? `${relDir}/${e.name}` : e.name;
      if (e.isDirectory()) { await walk(path.join(absDir, e.name), rel); continue; }
      if (skipForZip(rel)) continue;
      entries[rel] = new Uint8Array(await fs.readFile(path.join(absDir, e.name)));
    }
  }
  await walk(srcDir, '');
  return Buffer.from(zipSync(entries));
}
