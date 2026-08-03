# Verifier 홀드아웃 검증 — 판정 기준 강화(v0.6.14)의 일반화 확인

> **홀드아웃 세트**: 개선(프롬프트 강화)에 사용된 20편과 **논문 단위로 겹치지 않는** 새 논문
> 10편(21~30번째)에서 동일 파이프라인으로 생성한 46쌍. 강화된 verifier가 **처음 보는** 데이터다.
> 진단 세트 재측정 100%(`verifier_eval-p2.md`)가 과적합이 아닌지 확인하는 용도.

원문 문장에서 참 claim(설계상 supported)과, 핵심 요소 하나만 조작한 왜곡 claim
(설계상 unsupported/contradicted)을 쌍으로 생성해(생성: claude-sonnet-4-6, 검증 대상과 다른 모델),
실제 verifier(BM25 top-3 + 배치 판정, claude-opus-4-8)에 참/왜곡 세트를 **별도 호출**로 투입.
기대 라벨이 설계로 정해져 있어 채점은 문자열 비교(LLM judge 불필요).

## 핵심 지표

| 지표 | 값 |
|---|---|
| 평가 쌍 | 46쌍 (논문 10편) |
| **왜곡 검출 recall** (unsupported/contradicted로 판정) | **45/46 (97.8%)** |
| **참 claim 오탐률** (멀쩡한 claim을 깎음) | **0/46 (0.0%)** |
| 세분 일치 (기대 라벨과 정확히 일치) | 41/46 (89.1%) |

## 왜곡 유형별 검출

| 유형 | 검출 | 세분 일치 |
|---|---|---|
| number_change | 11/11 (100.0%) | 11/11 |
| direction_flip | 9/9 (100.0%) | 9/9 |
| condition_change | 8/8 (100.0%) | 7/8 |
| unsupported_addition | 8/8 (100.0%) | 5/8 |
| entity_swap | 9/10 (90.0%) | 9/10 |

## 원인 분해 — 검색 실패 vs 판단 실패 (왜곡 claim)

source_quote가 BM25 top-3 청크에 포함됐는지로 분리 (verifier와 동일한 청크·검색 재현):

| 근거가 검색됨? | 쌍 수 | 검출 | 해석 |
|---|---|---|---|
| 포함 (판단만 문제) | 45 | 44/45 (97.8%) | 놓치면 **판단 실패** |
| 미포함 (검색부터 실패) | 1 | 1/1 (100.0%) | 근거 없이 판정 — 보수 원칙 의존 |

<details><summary>놓친 왜곡 claim (1건)</summary>

- p23_4 [entity_swap] → partially_supported (검색 됨)

</details>

**결론**: recall 97.8%(45/46)·오탐 0% — 진단 세트의 100%가 홀드아웃에서도 유지돼 개선이
과적합이 아님을 확인. 유일한 놓침(p23_4)은 개선 전과 같은 partial 후퇴 패턴의 잔여 1건.

데이터: `eval/data/claim_pairs_holdout.json` / run: `eval/runs/verifier-eval-holdout-*.json` (로컬).