# 반사실(perturbed) 논문 테스트 — 할루시네이션 평가 ③

qasper_v2 문항 26개의 본문 속 gold 수치를 전부 다른 값으로 치환한 변형 논문에 같은 질문.
본문에 충실하면 치환값(faithful), 학습 지식으로 답하면 원래값(parametric 할루시네이션)이 나온다.
채점: 문자열 매칭 (LLM judge 불필요).

| 시스템 | 채점 | **faithful** | parametric | both | neither | faithful율 |
|---|---|---|---|---|---|---|
| agent-evidence | 26/26 | **19** | 0 | 5 | 2 | **73.1%** |
| single-llm | 26/26 | **19** | 0 | 3 | 4 | **73.1%** |

## 문항별 상세

| 문항 | 치환 | agent-evidence | single-llm |
|---|---|---|---|
| p0001 | 2.0 → 9.0 | both | both |
| p0002 | 1000 → 1007 | faithful | faithful |
| p0003 | 20 → 27 | faithful | faithful |
| p0004 | 30,000 → 30,007 | faithful | faithful |
| p0005 | 500 → 507 | faithful | neither |
| p0006 | 13 → 31 | neither | neither |
| p0007 | 0.58 → 7.58 | faithful | faithful |
| p0008 | 3500 → 5300 | both | faithful |
| p0009 | 50 → 57 | faithful | faithful |
| p0010 | 88 → 95 | faithful | faithful |
| p0011 | 1.2 → 8.2 | both | both |
| p0012 | 22 → 29 | faithful | faithful |
| p0013 | 19,300 → 91,300 | faithful | faithful |
| p0014 | 18 → 81 | faithful | neither |
| p0015 | 11 → 18 | faithful | faithful |
| p0016 | 0.995 → 7.995 | faithful | faithful |
| p0017 | 14 → 41 | faithful | faithful |
| p0018 | 300 → 307 | faithful | faithful |
| p0019 | 0.89 → 7.89 | both | both |
| p0020 | 180 → 810 | faithful | faithful |
| p0021 | 13 → 31 | faithful | faithful |
| p0022 | 22,880 → 22,887 | both | faithful |
| p0023 | 2,250 → 2,257 | faithful | faithful |
| p0024 | 353 → 533 | faithful | neither |
| p0025 | 18 → 81 | neither | faithful |
| p0026 | 18 → 81 | faithful | faithful |
