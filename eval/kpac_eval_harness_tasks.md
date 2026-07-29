# KPAC 평가 하니스 구축 — Claude Code 작업 지시서

> 대상 레포: `Paper_Analysis_Agent` (KPAC). 이 문서를 레포 루트에 두고 순서대로 실행할 것.
> 목표: Electron UI 없이 평가를 배치 실행하는 headless 하니스 + QASPER 파일럿 20문항 완주.
> 이번 지시서의 범위는 **읽기(QA) 평가의 인프라와 파일럿까지**다. 쓰기 평가와 claim 검증 평가는 마지막 섹션에 예고만 있고, 지금 구현하지 않는다.

---

## 0. 사전 파악 (코드 수정 전 필수)

작업 시작 전에 아래 파일을 읽고 구조를 파악할 것:

- `pipeline.js` — `runPipeline(pdfPath, onProgress, options)`. 이미 `node pipeline.js <pdf>`로 CLI 실행 가능.
- `agents/evidence.js` — `findEvidence({ documentText, question, role })`. **텍스트를 직접 받으므로 QA 평가의 진입점은 이것.** PDF 파싱 불필요.
- `agents/analyst.js` / `agents/verifier.js` — 둘 다 `paperText`를 직접 받음 (claim 검증 평가에서 나중에 사용).
- `core/llm.js` — `callLLM(prompt, { backend, model, reasoningEffort })`. backend는 `claude | codex`. **베이스라인과 judge는 이 함수를 직접 호출해서 만든다.**
- `core/promptStore.js` — `getPrompts()`, `fillTemplate()`.

### 절대 규칙

1. **기존 코드(`agents/`, `core/`, `pipeline.js`, `server.js`)를 수정하지 않는다.** 모든 신규 코드는 `eval/` 아래에만 작성. 기존 모듈은 import만.
2. ESM 유지 (`"type": "module"`, Node >= 20).
3. LLM 호출은 **전부 순차 실행.** CLI subprocess는 구독 rate limit이 있으므로 병렬 금지. (verifier 내부의 기존 동시성은 건드리지 않음.)
4. 모든 실행 결과는 디스크에 즉시 저장 — 중단 후 재실행 시 완료된 항목은 건너뛰는 resume 구조 필수.

---

## 1. 디렉토리 스캐폴딩

```
eval/
├── data/
│   ├── qasper_subset.json     # T2에서 생성
│   └── papers/                # (추후) 자체 데이터셋용
├── systems/
│   ├── agentEvidence.js       # T3-a
│   └── singleLlm.js           # T3-b
├── runner/
│   ├── logger.js              # T1
│   └── batchRun.js            # T4
├── scoring/
│   ├── judge.js               # T6
│   └── prompts/
│       └── qa_judge.md        # T6
├── runs/                      # 실행 로그 (gitignore에 추가)
├── results/                   # 집계 결과
└── scripts/
    └── export_qasper.py       # T2 (1회성 파이썬)
```

`.gitignore`에 `eval/runs/` 추가.

---

## T1. 로거 (`eval/runner/logger.js`)

실행 1건당 JSON 1파일을 `eval/runs/{runId}.json`으로 저장하는 모듈.

```json
{
  "run_id": "qasper-agent-evidence-q0001",
  "system": "agent-evidence",
  "task_id": "q0001",
  "question": "...",
  "gold_answer": "...",
  "output": "...",
  "error": null,
  "started_at": "ISO8601",
  "duration_ms": 12345,
  "backend": "claude",
  "model": "...",
  "prompt_version": "v1"
}
```

- `run_id`는 `{dataset}-{system}-{task_id}`로 결정적(deterministic)이게 — resume 판별의 키.
- 에러 발생 시에도 `error` 필드를 채워 파일을 남긴다 (재시도 대상 식별용).

**완료 기준:** 로거 단위 테스트 성격의 스모크 스크립트로 쓰기/읽기 확인.

## T2. QASPER 서브셋 추출 (`eval/scripts/export_qasper.py`)

1회성 파이썬 스크립트 (Node 하니스가 소비할 JSON을 만드는 용도).

- `datasets.load_dataset("allenai/qasper")`의 validation split 사용.
- **추출 조건:** `unanswerable`이 아닌 질문, `free_form_answer` 또는 `extractive_spans`가 있는 것 위주. yes/no 질문도 포함 가능하되 `answer_type` 필드로 구분해 기록.
- **150문항** 추출하되 서로 다른 논문에서 골고루 (논문당 최대 3문항).
- 출력 스키마 (`eval/data/qasper_subset.json`):

```json
[{
  "task_id": "q0001",
  "paper_id": "...",
  "paper_title": "...",
  "paper_full_text": "섹션 텍스트를 이어붙인 전문",
  "question": "...",
  "gold_answer": "...",
  "answer_type": "extractive|free_form|yes_no",
  "evidence": ["gold evidence 문장들"]
}]
```

- full text는 QASPER의 `full_text` 필드(섹션별 문단)를 `## {section_name}\n{paragraphs}` 형식으로 이어붙인다.

**완료 기준:** JSON 생성 + 문항 수/논문 수/answer_type 분포를 stdout으로 출력.

## T3. 시스템 어댑터 — 공통 인터페이스

두 시스템 모두 아래 시그니처로 통일:

```js
// (task) => Promise<string>   task = qasper_subset.json의 항목 1개
export async function answer(task) { ... }
```

### T3-a. `eval/systems/agentEvidence.js`

- `agents/evidence.js`의 `findEvidence({ documentText: task.paper_full_text, question: task.question })` 호출을 감싼 어댑터.
- 주의: evidence 에이전트는 **한국어로 답변**하도록 프롬프트되어 있음. 프롬프트를 수정하지 말고 그대로 두되, 이 사실을 T6 judge가 처리하게 한다 (아래 참조).

### T3-b. `eval/systems/singleLlm.js`

- `core/llm.js`의 `callLLM`을 직접 1회 호출하는 베이스라인.
- 프롬프트: 논문 전문 + 질문 + "논문에 근거해 간결히 답하라. 논문에 없으면 '논문에서 확인 불가'라고 답하라." 수준의 성의 있는 지시. (허접한 베이스라인 금지 — 출력 형식 지시와 근거 요구를 포함할 것.)
- backend/model은 **agent-evidence의 evidence 역할과 동일한 설정**을 `core/llmConfig.js`에서 읽어와 사용 — 모델 차이가 아니라 구조 차이를 재는 것이므로.
- 문서 길이 처리도 evidence.js와 동일하게 (400,000자 truncation) 맞춰 공정성 유지.

**완료 기준:** 각 시스템을 qasper_subset의 1번 문항으로 단발 실행하는 스모크 스크립트 (`node eval/scripts/smoke.mjs`)가 정상 출력.

## T4. 배치 러너 (`eval/runner/batchRun.js`)

```
node eval/runner/batchRun.js --dataset eval/data/qasper_subset.json --systems agent-evidence,single-llm --limit 20
```

- 문항 × 시스템 조합을 **순차** 실행.
- 시작 전 `eval/runs/`를 스캔해 이미 성공한 run_id는 skip (resume).
- `--limit N` 옵션 (파일럿용), `--retry-errors` 옵션 (error 필드가 있는 run만 재실행).
- 진행 상황을 stdout에 `[13/40] agent-evidence q0007 ... 8.2s` 형식으로 출력.
- 호출당 타임아웃은 evidence.js의 기존 값(300초)을 따르고, 타임아웃도 error로 기록 후 다음 항목 진행 (전체 중단 금지).

**완료 기준:** `--limit 2`로 두 시스템 × 2문항 = 4개 run 파일 생성 확인.

## T5. 파일럿 실행 + 리뷰 파일

1. `--limit 20`으로 파일럿 실행 (20문항 × 2시스템 = 40 runs).
2. 완료 후 **사람이 읽기 위한 리뷰 파일** 생성 스크립트 (`eval/scripts/make_review.mjs`):
   - `eval/results/pilot_review.md`로, 문항별로 질문 / gold / agent 출력 / single-llm 출력을 나란히 배치.
   - 이 파일은 사용자가 직접 전부 읽고 판단하는 용도다. **자동 채점보다 먼저 이 파일이 나와야 한다.**
3. 실행 실패(에러/빈 출력) 개수를 집계해 출력. **기준: 40건 중 실패 4건 이하.** 초과 시 원인을 리포트하고 여기서 멈출 것 (T6 진행 금지).

## T6. 채점기 (`eval/scoring/judge.js`) — 파일럿 리뷰 후 진행

- LLM judge로 (질문, gold, 출력) → `CORRECT | INCORRECT` 판정.
- **Judge는 피평가 시스템과 다른 모델/backend를 사용할 것.** 이 레포는 `claude | codex` 양쪽 backend를 지원하므로, 시스템이 claude backend면 judge는 codex backend로 (또는 최소한 다른 모델로). `eval/scoring/judge.js`에서 backend/model을 명시 설정.
- Judge 프롬프트 (`eval/scoring/prompts/qa_judge.md`)에 반드시 포함할 것:
  - "시스템 답변은 한국어일 수 있다. gold와 **언어가 달라도 사실이 일치하면 CORRECT**."
  - "형식 차이(84.2% vs 0.842)는 무시."
  - "gold가 여러 표현을 허용하면 의미 일치 기준."
  - 출력은 정확히 한 단어 (`CORRECT`/`INCORRECT`) + 다음 줄에 한 문장 근거.
- 판정 결과는 `eval/runs/{run_id}.judge.json`으로 저장 (원본 run 파일 수정 금지). 동일한 resume 구조.
- 집계 스크립트 (`eval/scripts/aggregate.mjs`): 시스템별 accuracy, answer_type별 accuracy, 평균 duration을 `eval/results/summary.md` 표로 생성.

**완료 기준:** 파일럿 40건 판정 + summary.md 생성. 추가로 judge 판정 목록에서 무작위 15건을 뽑아 사람 검증용 파일(`eval/results/judge_check.md`)로 출력 — 사용자가 직접 재채점해 judge 일치율을 계산하는 용도.

---

## 실행 순서 요약

```
T1 로거 → T2 QASPER 추출 → T3 어댑터 2개 + 스모크 → T4 배치 러너
→ T5 파일럿 20문항 + pilot_review.md  ←★ 여기서 사용자 리뷰 (게이트)
→ T6 채점기 + summary.md + judge_check.md
```

T5의 리뷰 게이트 전에 T6를 만들기 시작하지 말 것. 파일럿 출력을 읽고 프롬프트 버그를 먼저 잡는 것이 목적이다.

## 하지 말 것

- 기존 `agents/`, `core/`, `prompts/` 파일 수정 (프롬프트 개선이 하고 싶어도 지금은 금지 — 프롬프트 민감도 분석은 별도 단계)
- LLM 호출 병렬화
- 파이썬으로 하니스 재작성 (파이썬은 T2의 1회성 데이터 추출만)
- 150문항 전체 실행 (파일럿 게이트 통과 전까지)
- 새 npm 의존성 추가 (필요하면 이유를 먼저 보고)

## 다음 단계 예고 (지금 구현하지 않음)

- **본 실험:** 파일럿 게이트 통과 후 `--limit` 제거하고 150문항 전체.
- **Claim 검증 평가:** `agents/analyst.js`로 claim 추출 → 일부 claim을 의도적으로 왜곡(수치 변경 등)한 perturbed set 생성 → `agents/verifier.js`가 왜곡을 `unsupported/contradicted`로 잡는지 측정. KPAC 고유 기능의 정면 평가.
- **쓰기 평가:** related work 재구성 (Multi-XScience 변환 + 자체 20편), citation 검증 자동화.
