# Verifier 정면 평가 — 왜곡 claim 검출 (기계 채점)

원문 문장에서 참 claim(설계상 supported)과, 핵심 요소 하나만 조작한 왜곡 claim
(설계상 unsupported/contradicted)을 쌍으로 생성해(생성: claude-sonnet-4-6, 검증 대상과 다른 모델),
실제 verifier(BM25 top-3 + 배치 판정, claude-opus-4-8)에 참/왜곡 세트를 **별도 호출**로 투입.
기대 라벨이 설계로 정해져 있어 채점은 문자열 비교(LLM judge 불필요).

## 핵심 지표

| 지표 | 값 |
|---|---|
| 평가 쌍 | 86쌍 (논문 20편) |
| **왜곡 검출 recall** (unsupported/contradicted로 판정) | **86/86 (100.0%)** |
| **참 claim 오탐률** (멀쩡한 claim을 깎음) | **0/86 (0.0%)** |
| 세분 일치 (기대 라벨과 정확히 일치) | 82/86 (95.3%) |

## 왜곡 유형별 검출

| 유형 | 검출 | 세분 일치 |
|---|---|---|
| number_change | 19/19 (100.0%) | 19/19 |
| direction_flip | 23/23 (100.0%) | 22/23 |
| condition_change | 11/11 (100.0%) | 10/11 |
| entity_swap | 21/21 (100.0%) | 20/21 |
| unsupported_addition | 12/12 (100.0%) | 11/12 |

## 원인 분해 — 검색 실패 vs 판단 실패 (왜곡 claim)

source_quote가 BM25 top-3 청크에 포함됐는지로 분리 (verifier와 동일한 청크·검색 재현):

| 근거가 검색됨? | 쌍 수 | 검출 | 해석 |
|---|---|---|---|
| 포함 (판단만 문제) | 86 | 86/86 (100.0%) | 놓치면 **판단 실패** |
| 미포함 (검색부터 실패) | 0 | 0/0 (-) | 근거 없이 판정 — 보수 원칙 의존 |

데이터: `eval/data/claim_pairs.json` / run: `eval/runs/verifier-eval-*.json` (로컬).