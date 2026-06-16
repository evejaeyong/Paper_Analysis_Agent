// core/projectSnapshot.js
// 워크스페이스 편집(에이전트가 src 디렉터리 파일을 직접 수정) 전후의 변경 추적·롤백.
// git 의존 없이 동작한다: 텍스트(편집 가능 확장자) 파일은 내용까지 백업해 복원 가능하고,
// 그 외 파일은 size/mtime 으로 변경 감지만 한다. 에이전트에 Bash를 주지 않으므로
// 파일 삭제는 발생하지 않고(Edit/Write는 생성·수정만 가능), 비텍스트 파일 변경은
// 정책 위반으로 호출 측에서 거부한다.
import path from 'node:path';
import fs from 'node:fs/promises';
import { isEditablePath, isArtifactPath } from './latexProject.js';

// srcDir 하위 전체 파일(컴파일 산출물 제외) → Map rel(posix) → { size, mtimeMs }
async function walkFiles(rootDir) {
  const out = new Map();
  async function walk(absDir, relDir) {
    let entries;
    try { entries = await fs.readdir(absDir, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      const rel = relDir ? `${relDir}/${e.name}` : e.name;
      if (e.isDirectory()) {
        if (e.name === '.claude') continue; // 하위 에이전트 정의 등 도구 설정 — 추적·롤백 대상 아님
        await walk(path.join(absDir, e.name), rel); continue;
      }
      if (isArtifactPath(rel)) continue;
      try {
        const st = await fs.stat(path.join(absDir, e.name));
        out.set(rel, { size: st.size, mtimeMs: st.mtimeMs });
      } catch { /* ignore */ }
    }
  }
  await walk(rootDir, '');
  return out;
}

/**
 * 편집 직전 상태 기록. 텍스트 파일은 복원용으로 내용까지 보관한다.
 * @returns {Promise<{srcDir:string, entries:Map, texts:Map}>}
 */
export async function takeSnapshot(srcDir) {
  const entries = await walkFiles(srcDir);
  const texts = new Map();
  for (const rel of entries.keys()) {
    if (!isEditablePath(rel)) continue;
    try { texts.set(rel, await fs.readFile(path.join(srcDir, rel), 'utf8')); }
    catch { /* 읽기 실패 → 복원 불가로 취급 */ }
  }
  return { srcDir, entries, texts };
}

/**
 * 스냅샷 대비 변경 목록. 텍스트 파일은 내용 비교로 mtime만 바뀐 거짓 양성을 거른다.
 * @returns {Promise<{modified:string[], added:string[], deleted:string[]}>}
 */
export async function diffSnapshot(snap) {
  const after = await walkFiles(snap.srcDir);
  const modified = [], added = [], deleted = [];
  for (const [rel, st] of after) {
    const before = snap.entries.get(rel);
    if (!before) { added.push(rel); continue; }
    if (before.size === st.size && before.mtimeMs === st.mtimeMs) continue;
    if (snap.texts.has(rel)) {
      let now = null;
      try { now = await fs.readFile(path.join(snap.srcDir, rel), 'utf8'); }
      catch { /* 읽기 실패 → 변경으로 취급 */ }
      if (now !== null && now === snap.texts.get(rel)) continue;
    }
    modified.push(rel);
  }
  for (const rel of snap.entries.keys()) {
    if (!after.has(rel)) deleted.push(rel);
  }
  return { modified, added, deleted };
}

/**
 * diff 항목을 스냅샷 상태로 복원. added는 삭제, modified/deleted는 텍스트 백업으로 복원.
 * 백업이 없는(비텍스트) 변경은 복원 불가 → 그 경로 목록을 반환한다.
 */
export async function restoreSnapshot(snap, diff) {
  const unrestored = [];
  for (const rel of diff.added) {
    try { await fs.rm(path.join(snap.srcDir, rel), { force: true }); }
    catch { unrestored.push(rel); }
  }
  for (const rel of [...diff.modified, ...diff.deleted]) {
    if (snap.texts.has(rel)) {
      const abs = path.join(snap.srcDir, rel);
      try {
        await fs.mkdir(path.dirname(abs), { recursive: true });
        await fs.writeFile(abs, snap.texts.get(rel), 'utf8');
      } catch { unrestored.push(rel); }
    } else {
      unrestored.push(rel);
    }
  }
  return unrestored;
}
