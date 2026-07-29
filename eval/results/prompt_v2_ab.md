# 프롬프트 v2 재평가 — 동일 judge(qa_judge v2, claude-sonnet-4-6 low) 쌍대 비교

세 변형을 같은 judge로 판정해 judge 버전 교란 없이 비교:
- **agent_v1**: evidence 프롬프트 v1 출력(기존 run) / **agent_v2**: 프롬프트 v2(<document> 상단 배치)+인용 가드 재실행 / **single_v1**: 베이스라인(불변)

| 변형 | CORRECT | accuracy | 미판정/실패 |
|---|---|---|---|
| agent_v1 | 138/150 | **92.0%** | 0 |
| single_v1 | 133/150 | **88.7%** | 0 |
| agent_v2 | 139/150 | **92.7%** | 0 |

## 쌍대 비교 (같은 문항, 같은 judge)

- **agent_v1 vs agent_v2** (프롬프트 효과): v1만 정답 2 / v2만 정답 3
- **agent_v2 vs single_v1** (구조 효과): v2만 정답 6 / single만 정답 0

<details><summary>갈린 문항</summary>

- v1↔v2: q0005(agent_v1만), q0071(agent_v2만), q0094(agent_v1만), q0129(agent_v2만), q0144(agent_v2만)
- v2↔single: q0004(agent_v2만), q0017(agent_v2만), q0077(agent_v2만), q0100(agent_v2만), q0108(agent_v2만), q0115(agent_v2만)

</details>

## 인용 위조 전수 (agent_v2 150문항, 기계 채점)

- 성공 run 150/150 | 검사 인용 705건 중 fabricated **0건 (0.0%)** | 위조 포함 run **0건 (0.0%)**
- 참고: 가드 도입 전(v1 프롬프트) 전수 측정치는 위조 포함 run 13.3%(20/150), 인용당 3.5%.

판정 오류 0건. 원본 판정: results/judge_v2_full.json (v1 gpt-5.5 판정 파일은 별도 보존).