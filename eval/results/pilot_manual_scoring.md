# 파일럿 수동 채점 — Claude 세션 판정 (T6 자동 judge 아님)

> 판정자: Claude (이 세션에서 직접 40개 출력을 gold와 대조). 기준은 T6 judge와 동일하게
> 언어 무관·형식 무관·의미 일치. **T6의 독립 judge(다른 backend) 채점을 대체하지 않는 참고용.**

## 결과 요약

| 시스템 | CORRECT | 어큐러시 | (문제 문항 4개 제외 시) |
|---|---|---|---|
| agent-evidence | 15/20 | **75%** | 15/16 = **93.8%** |
| single-llm | 15/20 | **75%** | 15/16 = **93.8%** |

문제 문항 = gold가 입력에 없는 표 수치인 2건(q0004, q0009) + gold 자체가 애매한 2건(q0001, q0005).

## 문항별 판정

| 문항 | type | agent-evidence | single-llm | 비고 |
|---|---|---|---|---|
| q0001 | extractive | INCORRECT | INCORRECT | 둘 다 BIBREF19+**22** 답변, gold는 BIBREF19+**20**. 본문 근거상 시스템 답이 오히려 타당 — **gold 애매** |
| q0002 | extractive | CORRECT | CORRECT | 3개 NER 모델 정확히 일치 |
| q0003 | extractive | CORRECT | CORRECT | 5개 출처 모두 일치 |
| q0004 | free_form | INCORRECT | INCORRECT | gold는 Table 2·3의 F1 수치인데 **QASPER full_text에 표가 없음** — 둘 다 "표 없음"을 올바르게 인지 |
| q0005 | extractive | INCORRECT | INCORRECT | 질문은 "단어 매칭 방법", gold는 재정렬 시스템명(CFILT-preorder) — **gold가 질문과 어긋남**. 둘 다 사전 기반 매칭으로 답변 (본문상 타당) |
| q0006 | extractive | CORRECT | CORRECT | 문단/줄/페이지 분할 모두 일치 |
| q0007 | extractive | CORRECT | CORRECT | SimpleQuestions + WebQSP, 둘 다 "comparable" 뉘앙스까지 짚음 |
| q0008 | free_form | CORRECT | CORRECT | 3개 지표 모두 일치 |
| q0009 | free_form | INCORRECT | INCORRECT | q0004와 동일 — gold가 표 수치, 입력에 표 없음 |
| q0010 | free_form | CORRECT | CORRECT | 파일 크기(MB)로 측정 — 일치 |
| q0011 | extractive | CORRECT | CORRECT | 기관 모집 20명 — 일치 |
| q0012 | extractive | CORRECT | CORRECT | 동일 어휘·출력 공간 요구 — 일치 |
| q0013 | extractive | CORRECT | CORRECT | 30,000+ 이미지 — 일치 |
| q0014 | extractive | **INCORRECT** | **CORRECT** | gold는 "explicit 관계에서 최고 성능". single-llm은 explicit≫implicit을 명시, agent는 implicit 소수 클래스 분석에 집중해 explicit 언급 누락 |
| q0015 | extractive | CORRECT | CORRECT | 후보 답변 채점/랭킹 용도 — 일치 |
| q0016 | yes_no | CORRECT | CORRECT | 둘 다 Yes + 근거 |
| q0017 | extractive | **CORRECT** | **INCORRECT** | gold: occupation·industry·profile·language use·gender. agent는 4/5 커버, single은 occupation·profile 누락(2/5) |
| q0018 | extractive | CORRECT | CORRECT | QA PGNet 계열 baseline 일치 (+naive baseline 추가 언급) |
| q0019 | extractive | CORRECT | CORRECT | CSAT/20NG/Fisher — 일치 |
| q0020 | extractive | CORRECT | CORRECT | CrowdFlower — 일치 |

## 관찰

1. **두 시스템 성능이 동률(75%)** — 이 20문항에서는 구조(에이전트 프롬프트) 차이가 정답률 차이로 이어지지 않음.
   갈린 문항은 단 2개로 상쇄: q0014(single 승 — agent가 장황한 분석 속에 정작 gold 핵심을 누락),
   q0017(agent 승 — 더 넓게 긁어서 gold 항목을 더 많이 커버).
2. **오답 5건 중 4건은 시스템 잘못이 아님**: 표 수치 gold 2건(데이터 한계), 애매한 gold 2건.
   이를 제외하면 둘 다 93.8%로 천장에 가까움 → 150문항 본 실험에서 변별력을 보려면
   이런 문항의 처리 방침(제외 또는 별도 집계)을 정해야 함.
3. **비용 차이는 뚜렷**: agent-evidence 평균 13.3초/1,247자 vs single-llm 6.7초/459자.
   정답률이 같다면 evidence 에이전트의 부가가치는 "근거 발췌+위치 제시"의 검증 가능성에 있음.
4. T6 자동 judge 설계 시사점: (a) 표 수치 gold 문항은 "입력에 근거 부재"를 별도 라벨로,
   (b) gold와 다르지만 본문 근거가 있는 답(q0001·q0005)의 처리 기준 필요.
