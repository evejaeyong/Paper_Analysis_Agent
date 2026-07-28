# 평가 결과 요약 — qasper_v2 (150문항 × 2시스템)

- judge: 판정 파일(`*.judge.json`) 기준. CORRECT/INCORRECT만 accuracy 분모에 포함.

## 시스템별 결과

| 시스템 | 판정 완료 | CORRECT | accuracy | run 실패 | 미판정 | 평균 duration | 평균 출력 길이 |
|---|---|---|---|---|---|---|---|
| agent-evidence | 150/150 | 136 | **90.7%** | 0 | 0 | 13.5s | 1228자 |
| single-llm | 150/150 | 130 | **86.7%** | 0 | 0 | 7.1s | 445자 |

## answer_type별 accuracy

| answer_type | 문항 수 | agent-evidence | single-llm |
|---|---|---|---|
| extractive | 107 | 90.7% (97/107) | 88.8% (95/107) |
| free_form | 39 | 92.3% (36/39) | 82.1% (32/39) |
| yes_no | 4 | 75.0% (3/4) | 75.0% (3/4) |

## 두 시스템의 판정이 갈린 문항

| 문항 | 질문 | agent-evidence | single-llm |
|---|---|---|---|
| q0004 | What crowdsourcing platform is used? | CORRECT | INCORRECT |
| q0025 | Which neural architecture do they use as a base for their at | CORRECT | INCORRECT |
| q0064 | What datasets are used? | CORRECT | INCORRECT |
| q0071 | What features are absent from MRC gold standards that can re | INCORRECT | CORRECT |
| q0077 | What is the state-of-the-art model for the task? | CORRECT | INCORRECT |
| q0087 | What model is used to encode the images? | CORRECT | INCORRECT |
| q0094 | What is the language model combination technique used in the | CORRECT | INCORRECT |
| q0100 | How larger are the training sets of these versions of ELMo c | CORRECT | INCORRECT |
| q0108 | What are labels in car speak language dataset? | CORRECT | INCORRECT |
| q0119 | Which evaluation methods are used? | CORRECT | INCORRECT |
| q0129 | For how many probe tasks the shallow-syntax-aware contextual | INCORRECT | CORRECT |
| q0144 | How big is their created dataset? | INCORRECT | CORRECT |
