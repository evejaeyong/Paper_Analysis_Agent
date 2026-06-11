# KPAC (Korean Paper Agent Console)

논문 분석·작성 Electron 앱. LLM은 **Claude Code / Codex CLI를 subprocess로 호출** (API 키·토큰 과금 없음).

## Git 워크플로우
- 새 기능은 **브랜치 → PR → 머지** (main 직접 커밋 금지, v0.4.2부터).
- 커밋 메시지: `@ type(scope): 한국어 요약` (예: `@ feat(latex): ...`). PR 본문도 한국어.
- `gh`는 PATH에 없음 → `& "C:\Program Files\GitHub CLI\gh.exe"` 전체 경로로 실행.

## 릴리즈 (v0.n.n)
1. `npm version 0.n.n --no-git-tag-version` + README 제목의 버전 갱신.
2. 상단바 버전은 `/api/version`(package.json 단일 출처)으로 자동 표시 — **하드코딩 금지**.
3. PR 머지 후 `gh release create v0.n.n` — **dmg/exe는 GitHub Actions가 자동 빌드. 로컬 빌드 금지.**

## 모델 설정
- 모델·effort 목록은 **`core/llmConfig.js`와 `public/app.js` 두 곳에 중복** — 항상 같이 수정.
- 기본값: 오케스트레이터(orchestrator·writeOrchestrator)는 `claude-fable-5`, 나머지는 `claude-opus-4-8`.
- 모델은 CLI 플래그(`--model`, `--effort`)로 전달. Haiku는 effort 미지원(빈 문자열 → 플래그 생략).

## 구조
- `server.js` — Node 내장 http + SSE. Electron이 임의 포트로 부트(`electron-main.mjs`).
- `core/` — CLI 어댑터(claudeClient/codexCli), llmConfig, promptStore, latexProject(ZIP·파일 I/O),
  projectSnapshot(워크스페이스 편집 diff/롤백), latexCompiler.
- `agents/` — 분석팀(pipeline.js 경유)·작성팀(paperWriting.js). `prompts/*.md` 는 런타임 편집 가능.
- `public/` — 바닐라 JS 프런트(app.js 단일 파일, Monaco·PDF.js vendored).

## 프롬프트 추가 시 4곳 동기화
`prompts/<key>.md` + `core/promptStore.js` KEYS + `server.js` allowedPromptKeys
+ `public/index.html` textarea & `public/app.js` PROMPT_FIELDS.

## LaTeX 채팅 편집
- Claude 백엔드: **워크스페이스 편집** — 프로젝트 `src`를 cwd로 에이전트가 직접 수정
  (`runWorkspaceEdit`). 스냅샷 diff로 추적, 텍스트 소스 외 변경·실패 시 롤백 후 멀티에이전트로 폴백.
- Codex 백엔드: 기존 STORM식 멀티에이전트 파이프라인(`runPaperWriting`).

## 검증
- `node --check <수정 파일>` + `node scripts/verify-*.mjs` (스냅샷·latexProject 등).
- better-sqlite3 네이티브 로드 실패 경고는 기존 환경 이슈(JSON 폴백) — 무시.
