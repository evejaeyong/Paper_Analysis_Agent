# 할루시네이션 평가 종합 — 읽기(QA) (2026-07-15)

피평가 시스템: `agent-evidence`(근거 탐색 에이전트) vs `single-llm`(callLLM 1회 베이스라인),
둘 다 **claude-opus-4-8**. judge·거짓 전제 생성: **claude-sonnet-4-6** (codex/gpt-5.5 한도 소진으로
README 폴백 규정 적용 — 피평가 모델과 다른 모델 유지, judge effort low).

| # | 방법 | 지표 | agent-evidence | single-llm |
|---|---|---|---|---|
| ① | 근거 인용 실재성 (150문항 재활용) | 인용당 위조율 | 3.5% (22/622) | 3.5% (10/286) |
|   |  | 위조 인용 포함 run | **13.3%** (20/150) | **5.3%** (8/150) |
| ② | Unanswerable 거절 (50문항) | 할루시네이션율 | **22.0%** (11/50) | **28.0%** (14/50) |
| ③ | 반사실 수치 치환 (26문항) | faithful율 | 73.1% (19/26) | 73.1% (19/26) |
|   |  | parametric 할루시네이션 | **0건** | **0건** |
| ④ | 거짓 전제 (25문항) | 전제 수용(confabulation) | **0.0%** (0/25) | **0.0%** (0/25) |

## 해석

- **② unanswerable이 핵심 비교**: 에이전트가 답 없는 질문에서 할루시네이션이 6%p 적음.
  쌍대 비교 — agent만 올바르게 거절 4문항, single만 거절 1문항, 둘 다 실패 10, 둘 다 거절 35.
  (표본 50으로 차이가 크진 않음 — 방향은 에이전트 우위, 단정은 곤란)
- **① 인용 위조**: 인용 1건당 위조율은 동률(3.5%)이지만, 에이전트는 인용을 2배 이상 많이 달아
  run 단위 위조 노출은 오히려 높음(13.3% vs 5.3%). 위조 인용 대부분은 무근거 창작이 아니라
  **본문 내용의 요약·의역을 따옴표 원문 인용처럼 제시**한 것 (예: q0009 — 내용은 맞지만 그런
  문장은 본문에 없음). "출력이 길수록 인용 검증 부담이 커진다"는 비용으로 해석.
- **③ 반사실**: 두 시스템 모두 원래값(학습 지식)을 답한 사례 **0건** — opus-4-8은 문서가
  주어지면 파라메트릭 지식보다 본문을 따름. 실패는 both(치환값·원래값 동시 언급: 문서 내
  다른 수치와의 계산·비교 과정에서 발생)와 neither(다른 수치로 답하거나 우회).
- **④ 거짓 전제**: 둘 다 25/25 전제를 바로잡음 — 천장 효과. 생성된 전제가 전부
  "Why did the authors choose {BERT류 모델}...?" 패턴으로 단조로워 난이도가 낮았음.
  더 어려운 전제(논문이 실제로 쓴 것과 미묘하게 다른 변형 등)로 재생성 필요.

## 주의(caveat)

- ②의 gold(만장일치 unanswerable)에도 노이즈 있음: INCORRECT 판정 일부(u0009, u0037 등)는
  본문에 사실상 답이 있어 보이는 문항 — 절대 수치는 과대추정일 수 있으나 두 시스템에 동일
  조건이므로 **상대 비교는 유효**.
- ②·④ judge는 claude-sonnet-4-6 — 피평가와 같은 backend(claude)라는 한계. codex 한도 복구
  후 gpt-5.5로 재판정해 교차 검증 가능 (`--retry-errors`가 아니라 judge 파일 삭제 후 재실행).

## 산출물

- ① `eval/results/quote_check.md` (`scripts/check_quotes.mjs`)
- ② `eval/results/unans_summary.md` (`data/qasper_unans_subset.json`, 50문항)
- ③ `eval/results/perturbed_summary.md` (`data/qasper_perturbed_subset.json`, 26문항)
- ④ `eval/results/falseprem_summary.md` (`data/qasper_falseprem_subset.json`, 25문항)
