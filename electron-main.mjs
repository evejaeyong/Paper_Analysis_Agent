// Electron 메인 프로세스 진입점.
// HTTP 서버를 무조건 먼저 띄우고, BrowserWindow 가 로드할 URL 을
// claude CLI 의 binary/인증 상태에 따라 분기:
//   - binary 없음        → /setup?reason=missing  (CLI 설치 안내)
//   - binary 있고 미로그인 → /setup?reason=login   (로그인 안내 + 자동 폴링)
//   - 둘 다 OK           → / (메인 채팅 UI)
import { app, BrowserWindow, shell, dialog } from 'electron';
import fixPath from 'fix-path';
import { startServer } from './server.js';

// macOS/Linux 에서 Finder/Dock 으로 실행한 .app 은 로그인 셸의 PATH 를 상속받지 못해
// /opt/homebrew/bin 같은 위치의 claude/codex 바이너리를 못 찾는다.
// fix-path 가 유저의 기본 셸에서 PATH 를 가져와 process.env.PATH 에 병합한다 (Windows 에선 no-op).
fixPath();

// Authentication routing is handled in public/app.js via /api/auth-status.
let mainWindow = null;
let serverHandle = null;

function startupErrorPage(message) {
  const safe = String(message).replace(/[<&>]/g, c => ({ '<': '&lt;', '&': '&amp;', '>': '&gt;' }[c]));
  const html = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><title>PAA — 시작 실패</title>
<style>
  body { margin:0; padding:48px; background:#0e0f13; color:#e6e6e6;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif; }
  .card { max-width:640px; margin:0 auto; background:#1a1c22; border:1px solid #ff6b6b;
    border-radius:12px; padding:28px 32px; }
  h1 { margin:0 0 12px; font-size:18px; color:#ff6b6b; }
  pre { background:#11131a; border:1px solid #2a2d35; border-radius:6px; padding:12px;
    font-family:ui-monospace,Menlo,Consolas,monospace; font-size:12.5px;
    color:#b5bac4; white-space:pre-wrap; word-break:break-word; }
</style></head><body>
<div class="card"><h1>앱 시작 실패</h1><pre>${safe}</pre></div></body></html>`;
  return 'data:text/html;charset=utf-8;base64,' + Buffer.from(html, 'utf8').toString('base64');
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'PAA',
    backgroundColor: '#0e0f13',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());

  // 외부 링크는 기본 브라우저로
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('http://127.0.0.1:') && !url.startsWith('data:')) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  try {
    // 서버는 claude 상태와 무관하게 항상 먼저 부트. setup 페이지의 폴링 라우트가 필요.
    if (!serverHandle) {
      serverHandle = await startServer({ host: '127.0.0.1', port: 0 });
    }
    await mainWindow.loadURL(`http://127.0.0.1:${serverHandle.port}/`);
  } catch (err) {
    await mainWindow.loadURL(startupErrorPage(err?.stack || err?.message || String(err)));
  }

  setupAutoUpdate(); // 새 버전 있으면 알림 → 사용자가 선택해 업데이트(자동 다운로드 안 함)
}

// 자동 업데이트(설치형 Windows 전용). 새 릴리즈가 있으면 알림만 띄우고, 사용자가
// "지금 업데이트"를 누르면 다운로드 → 다운로드 후 "재시작해 설치" 여부를 다시 선택.
let updateChecked = false;
async function setupAutoUpdate() {
  if (updateChecked) return;
  updateChecked = true;
  if (!app.isPackaged) return;                      // 개발 모드(npm start) 스킵
  if (process.platform !== 'win32') return;         // 현재 업데이트 메타는 Windows만 게시(mac 미서명)
  if (process.env.PORTABLE_EXECUTABLE_DIR) return;  // 포터블 exe는 자가 설치 불가 → 스킵(설치형만)
  let autoUpdater;
  try { ({ autoUpdater } = await import('electron-updater')); }
  catch { return; }                                 // 의존성 없으면 조용히 스킵
  autoUpdater.autoDownload = false;                 // 사용자가 선택해야 다운로드
  autoUpdater.autoInstallOnAppQuit = true;          // "나중에" 시 종료할 때 설치

  autoUpdater.on('update-available', async (info) => {
    if (!mainWindow) return;
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'info', buttons: ['지금 업데이트', '나중에'], defaultId: 0, cancelId: 1,
      title: '업데이트 있음',
      message: `새 버전 v${info.version} 이(가) 있습니다.`,
      detail: '지금 다운로드해 업데이트할까요? 다운로드가 끝나면 재시작 시 적용됩니다.',
    });
    if (response === 0) autoUpdater.downloadUpdate().catch(err => console.warn('업데이트 다운로드 실패:', err?.message || err));
  });
  autoUpdater.on('update-downloaded', async (info) => {
    if (!mainWindow) return;
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'info', buttons: ['지금 재시작해 설치', '나중에'], defaultId: 0, cancelId: 1,
      title: '업데이트 준비 완료',
      message: `v${info.version} 다운로드 완료.`,
      detail: '지금 재시작해 설치할까요? "나중에"를 누르면 앱을 종료할 때 자동 설치됩니다.',
    });
    if (response === 0) autoUpdater.quitAndInstall();
  });
  autoUpdater.on('error', (err) => console.warn('autoUpdater 오류:', err?.message || err));

  try { await autoUpdater.checkForUpdates(); }
  catch (err) { console.warn('업데이트 확인 실패:', err?.message || err); }
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}
