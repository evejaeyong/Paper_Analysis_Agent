# KPAC 평가 하니스 (읽기/QA)

KPAC의 논문 읽기(QA) 에이전트를 Electron UI 없이 headless로 배치 평가하는 하니스와 그 결과.
**"에이전트 구조가 단일 LLM 호출 대비 무엇을 얼마나 개선하는가"를 통제된 조건에서 측정**하는 것이 목적이다.

> 평가 실행 로그(`runs/`, 1,000+ JSON)와 논문 전문이 포함된 데이터셋(`data/`)은 용량 문제로
> 커밋하지 않는다. 데이터셋은 `scripts/export_qasper*.py`로 재생성 가능(공개 데이터셋 QASPER 기반).

### `results/` 문서의 출처 3계층

| 계층 | 문서 | 숫자의 출처 |
|---|---|---|
| ① 기계 채점 (LLM 개입 0) | quote_check, perturbed_summary, quote_guard_ab | 문자열 매칭 스크립트 — 결정적, 재실행 시 동일 |
| ② LLM judge 판정의 스크립트 집계 | summary, unans_summary, falseprem_summary, quote_guard_judge_pairs | 집계는 스크립트, 개별 판정은 LLM judge (아래 "채점 신뢰성 관리"로 검증) |
| ③ 분석·감사 문서 (사람+AI 작성) | hallucination_summary 해석부, pilot_manual_scoring, judge_check_claude, gold_audit | 서술 문서 — 각 파일 상단에 작성 주체·잠정 여부 명시 |

각 스크립트 생성 문서는 상단에 생성 스크립트가 명시돼 있고, 원천 데이터(`runs/*.json`, `runs/*.judge.json`)에서
`node eval/scripts/aggregate.mjs` 등으로 LLM 호출 없이 재계산된다.

## 평가 설계

| 요소 | 내용 |
|---|---|
| 피평가 시스템 A | `agent-evidence` — KPAC 근거 탐색 에이전트 (`agents/evidence.js`, long-context 전문 투입 + 근거 인용 강제 + 인용 가드) |
| 피평가 시스템 B | `single-llm` — 동일 모델·동일 truncation의 단일 호출 베이스라인 (**모델 차이가 아닌 구조 차이만 측정**) |
| 모델 | 두 시스템 모두 claude-opus-4-8 (CLI subprocess) |
| 데이터셋 | QASPER validation 150문항 (논문당 최대 3문항, gold 근거가 본문에 실재하는 문항만 — v2에서 표 수치 gold 제거) |
| 채점 | LLM-as-judge. **피평가와 다른 backend**(codex/gpt-5.5)가 원칙, 한도 소진 시 claude-sonnet-4-6 폴백(다른 모델 유지) |
| judge 검증 | 무작위 15건 사람 재채점 절차(`results/judge_check.md`) + judge INCORRECT 전수 gold 감사(`results/gold_audit.md`) |
| 실행 원칙 | 전 호출 순차(rate limit), run당 JSON 1파일, 결정적 run_id로 resume, 실패도 기록 |

## 결과 요약

### ① QA 정확도 — [`results/prompt_v2_ab.md`](results/prompt_v2_ab.md) (프롬프트 v2 재평가)

evidence 프롬프트 v2(롱컨텍스트 배치 교정)와 judge 프롬프트 v2(gold 대체 주석 절차화 + few-shot)
적용 후, **세 변형을 동일 judge로 쌍대 재판정**한 결과:

| 변형 | accuracy (150문항) | 비고 |
|---|---|---|
| agent-evidence (프롬프트 v2 + 인용 가드) | **92.7%** (139/150) | 근거 발췌 + 위치 제시 포함 |
| agent-evidence (프롬프트 v1, 기존 출력) | 92.0% (138/150) | v2와 쌍대 3:2 — 동등 (v2가 정확도 유지) |
| single-llm 베이스라인 | 88.7% (133/150) | |

**agent(v2) vs 베이스라인의 쌍대 비교는 6승 0패**(이항검정 p≈0.03)로, judge가 gold 대체
주석을 올바르게 반영한 v2 기준에서는 구조 우위가 통계적으로 유의하다. 단 이 판정은
claude 계열 judge(sonnet) 단독이므로 교차 backend(gpt-5.5) 재판정으로 확증 예정.
(v1 프롬프트·gpt-5.5 judge 기준의 이전 결과 90.7% vs 86.7%(유의하지 않음)는
[`results/summary.md`](results/summary.md)에 보존.)

### ② 할루시네이션 4축 — [`results/hallucination_summary.md`](results/hallucination_summary.md)

| 축 | 방법 | agent-evidence | single-llm |
|---|---|---|---|
| 인용 실재성 | 따옴표 인용을 원문과 문자열 대조 (LLM-free) | 위조 포함 run 13.3% → **가드 도입 후 0%** (150문항 전수, 인용 705건 — 아래 ③) | 5.3% |
| Unanswerable 거절 | 만장일치 unanswerable 50문항 — 답하면 할루시네이션 | **22.0%** | 28.0% |
| 반사실 수치 치환 | 본문 수치를 치환한 변형 논문 26문항 — 학습 지식으로 답하면 실패 | parametric 할루시네이션 **0건** | 0건 |
| 거짓 전제 | 논문에 없는 기법을 전제로 깐 질문 25문항 | 전제 수용 0% (천장 — 문항 난이도 한계 명시) | 0% |

### ③ 평가 → 개선 → 재검증 루프 (인용 가드 사례)

측정이 실제 개선으로 이어진 사례. 평가에서 발견한 약점을 고치고, 같은 하니스로 회귀까지 검증했다.

1. **발견**: ①에서 agent-evidence run의 13.3%(20/150)에 위조 인용 — 대부분 본문 요약·의역을
   원문 인용처럼 따옴표로 제시한 것 (`results/quote_check.md`)
2. **개선**: 출력 시점 인용 가드(`core/quoteGuard.js`) — 따옴표 인용을 원문 대조, 위조 발견 시
   1회 수선 호출로 실제 원문 문장으로 교체 ([PR #27](https://github.com/evejaeyong/Paper_Analysis_Agent/pull/27))
3. **재측정**: 위조가 있던 20문항 재실행 → 위조 인용 **22건 → 0건** (`results/quote_guard_ab.md`)
4. **회귀 검증**: 가드 전/후 출력 40건을 **동일 judge로 쌍대 판정** → 정답률 17/20 → 17/20,
   **회귀 0건** (`results/quote_guard_judge_pairs.md`)

### 채점 신뢰성 관리

- judge는 피평가와 다른 backend가 원칙. sonnet 폴백 판정은 gpt-5.5 원판정과 표본 20건에서 20/20 일치.
- judge 무작위 15건 재채점(잠정 14/15 일치, `results/judge_check_claude.md` — 사람 확정 대기)과
  judge INCORRECT 23문항 전수 gold 감사(`results/gold_audit.md`)로 "시스템 오답 vs gold 불량 vs judge 오판"을 분리.
- 파일럿 20문항을 사람이 전부 읽는 리뷰 게이트(`results/pilot_review.md`)를 자동 채점 구현 **전에** 통과시켜
  프롬프트·gold 문제를 선제 발견 (gold가 표 수치인 문항 → v2 데이터셋에서 제거).

## 한계 (알고 있는 것)

- **표본·judge**: v2 재평가에서 베이스라인 대비 쌍대 6:0(p≈0.03)으로 유의하나, 판정이 claude 계열
  judge(sonnet) 단독 — 교차 backend(gpt-5.5) 재판정 전까지는 단정 수위를 낮춰 서술.
- **단일 데이터셋·도메인**: QASPER(NLP 논문)만 — 타 분야 일반화 미검증.
- **1회 실행**: LLM 비결정성 대비 반복 실행 분산 미측정.
- **judge**: 사람 확정 판정 진행 중(잠정 93% 일치). 거짓 전제 축은 천장 효과로 변별력 없음(문항 재생성 필요).
- **쓰기(작성팀) 평가 부재**: 컴파일 성공률·지시 이행률 등 기계 채점 속성부터 별도 하니스 예정.

## 구조

```
eval/
├── kpac_eval_harness_tasks.md # 하니스 구축 작업 지시서 (설계 원칙 원문)
├── data/                      # (gitignore) QASPER 서브셋 — scripts/export_qasper*.py로 재생성
├── systems/                   # 피평가 어댑터: agentEvidence.js / singleLlm.js
├── runner/                    # logger.js (run=JSON 1파일, resume) / batchRun.js (순차 배치)
├── scoring/                   # judge.js + prompts/ (qa_judge, unans_judge, falseprem_judge)
├── runs/                      # (gitignore) 실행 로그 1,000+ 파일
├── results/                   # 집계·감사 문서 (아래 재현 명령의 산출물)
└── scripts/                   # 데이터 생성·집계·검증 스크립트
```

## 재현 방법

```bash
# 0) 데이터셋 재생성 (1회성, python + pip install datasets)
python eval/scripts/export_qasper.py

# 1) 스모크 (LLM 호출 없음 / 1문항 단발)
node eval/scripts/smoke_logger.mjs
node eval/scripts/smoke.mjs --task q0007 --system single-llm

# 2) 배치 실행 — 순차, 중단돼도 재실행하면 성공 run은 자동 skip (resume)
node eval/runner/batchRun.js --dataset eval/data/qasper_v2_subset.json --systems agent-evidence,single-llm
node eval/runner/batchRun.js --retry-errors        # 에러 run만 재실행

# 3) 채점 (judge는 피평가와 다른 backend/model — 기본 codex/gpt-5.5)
node eval/scoring/judge.js --dataset eval/data/qasper_v2_subset.json --systems agent-evidence,single-llm
#    codex 한도 소진 시 폴백 (같은 backend라도 반드시 다른 모델):
node eval/scoring/judge.js --judge-backend claude --judge-model claude-sonnet-4-6 --retry-errors

# 4) 집계·검증 문서 생성
node eval/scripts/aggregate.mjs                    # → results/summary.md
node eval/scripts/make_judge_check.mjs             # → results/judge_check.md (사람 재채점용)
node eval/scripts/make_gold_audit.mjs              # → results/gold_audit.md (INCORRECT 전수 감사)

# 5) 할루시네이션 4축
node eval/scripts/check_quotes.mjs                 # ① 인용 실재성 (LLM-free) → results/quote_check.md
python eval/scripts/export_qasper_unans.py         # ② unanswerable 50문항 생성
node eval/runner/batchRun.js --dataset eval/data/qasper_unans_subset.json
node eval/scoring/judge.js --dataset eval/data/qasper_unans_subset.json --judge-prompt eval/scoring/prompts/unans_judge.md
node eval/scripts/aggregate_judged.mjs --dataset eval/data/qasper_unans_subset.json --out eval/results/unans_summary.md --title "Unanswerable 거절 테스트"
node eval/scripts/make_perturbed.mjs               # ③ 반사실 치환 생성 → 실행 → 문자열 매칭 채점
node eval/runner/batchRun.js --dataset eval/data/qasper_perturbed_subset.json
node eval/scripts/score_perturbed.mjs
node eval/scripts/make_falseprem.mjs               # ④ 거짓 전제 생성 → 실행 → 판정
node eval/runner/batchRun.js --dataset eval/data/qasper_falseprem_subset.json
node eval/scoring/judge.js --dataset eval/data/qasper_falseprem_subset.json --judge-prompt eval/scoring/prompts/falseprem_judge.md
node eval/scripts/aggregate_judged.mjs --dataset eval/data/qasper_falseprem_subset.json --out eval/results/falseprem_summary.md --title "거짓 전제 테스트"

# 6) 인용 가드 A/B (위조 인용 문항 재실행 + 동일 judge 쌍대 판정)
node eval/scripts/rerun_quote_guard.mjs            # → results/quote_guard_ab.md
node eval/scripts/judge_qg_pairs.mjs               # → results/quote_guard_judge_pairs.md
```

## 데이터셋 버전

- `qasper_subset.json` (v1) — 파일럿용. gold가 표 수치인 문항이 섞여 있음 (파일럿 리뷰 게이트에서 발견).
- `qasper_v2_subset.json` (v2, 본 실험) — gold 근거가 본문 텍스트에 실재하는 문항만
  (FLOAT SELECTED 표/그림 의존 제외, 근거·스팬 본문 존재 검증, 복수 gold 주석 `gold_all` 보존).
  run_id의 dataset 부분이 달라(`qasper` vs `qasper_v2`) 두 버전의 run이 섞이지 않는다.

## 다음 단계

- verifier 정면 평가: claim을 의도적으로 왜곡한 perturbed claim 세트로 검출 recall / 오탐률 측정.
- 쓰기(작성팀) 평가: 컴파일 성공률·지시 이행률·보존성·인용 실재성(기계 채점) → 블라인드 쌍대 선호.
- 거짓 전제 문항 재생성(난이도 상향), judge 사람 확정 판정, 표본 확대.
