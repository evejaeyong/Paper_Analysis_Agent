// scripts/verify-project-snapshot.mjs
// projectSnapshot 모듈 동작 검증: snapshot → 변경 → diff → restore 라운드트립.
// 실행: node scripts/verify-project-snapshot.mjs
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { takeSnapshot, diffSnapshot, restoreSnapshot } from '../core/projectSnapshot.js';

function assert(cond, msg) {
  if (!cond) { console.error('✗ FAIL:', msg); process.exit(1); }
  console.log('✓', msg);
}

const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'snaptest-'));
try {
  await fs.mkdir(path.join(dir, 'sub'));
  await fs.writeFile(path.join(dir, 'main.tex'), 'hello', 'utf8');
  await fs.writeFile(path.join(dir, 'sub', 'refs.bib'), '@article{a,}', 'utf8');
  await fs.writeFile(path.join(dir, 'fig.png'), Buffer.from([1, 2, 3]));
  await fs.writeFile(path.join(dir, 'main.aux'), 'artifact', 'utf8');

  const snap = await takeSnapshot(dir);
  assert(snap.entries.has('main.tex') && snap.entries.has('sub/refs.bib') && snap.entries.has('fig.png'),
    '스냅샷이 일반 파일을 기록한다');
  assert(!snap.entries.has('main.aux'), '컴파일 산출물(.aux)은 스냅샷에서 제외된다');
  assert(snap.texts.has('main.tex') && !snap.texts.has('fig.png'), '텍스트 파일만 내용 백업한다');

  // mtime 차이가 나도록 약간 대기 후 변경 적용
  await new Promise(r => setTimeout(r, 20));
  await fs.writeFile(path.join(dir, 'main.tex'), 'hello world', 'utf8'); // 수정
  await fs.writeFile(path.join(dir, 'new.tex'), 'new', 'utf8');          // 추가
  await fs.writeFile(path.join(dir, 'sub', 'refs.bib'), '@article{a,}', 'utf8'); // 같은 내용 재기록(mtime만)

  const diff = await diffSnapshot(snap);
  assert(diff.modified.length === 1 && diff.modified[0] === 'main.tex', 'modified는 main.tex 하나만 감지');
  assert(diff.added.length === 1 && diff.added[0] === 'new.tex', 'added는 new.tex 하나만 감지');
  assert(diff.deleted.length === 0, 'deleted 없음');
  assert(!diff.modified.includes('sub/refs.bib'), 'mtime만 바뀐 동일 내용은 변경으로 안 잡힘');

  const unrestored = await restoreSnapshot(snap, diff);
  assert(unrestored.length === 0, '복원 불가 항목 없음');
  assert((await fs.readFile(path.join(dir, 'main.tex'), 'utf8')) === 'hello', 'main.tex 내용 복원');
  assert(!existsSync(path.join(dir, 'new.tex')), '추가된 new.tex 삭제됨');

  const diff2 = await diffSnapshot(snap);
  assert(diff2.modified.length === 0 && diff2.added.length === 0 && diff2.deleted.length === 0,
    '복원 후 diff가 깨끗함');

  console.log('\n모든 검증 통과');
} finally {
  await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
}
