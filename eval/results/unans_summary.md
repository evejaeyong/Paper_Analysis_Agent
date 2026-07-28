# Unanswerable 거절 테스트 (할루시네이션 평가 ②) — qasper_unans (50문항)

CORRECT = 올바른 행동(거절/전제 바로잡음), **INCORRECT = 답을 지어냄(할루시네이션)**.

| 시스템 | 판정 완료 | CORRECT | **할루시네이션(INCORRECT)** | 할루시네이션율 | run 실패 | 미판정 |
|---|---|---|---|---|---|---|
| agent-evidence | 50/50 | 39 (78.0%) | **11** | **22.0%** | 0 | 0 |
| single-llm | 50/50 | 36 (72.0%) | **14** | **28.0%** | 0 | 0 |

## agent-evidence — 할루시네이션 문항 (11건)

### u0007: What does a node in the network approach repesent?
- judge: 시스템이 "노드는 국가(state)"라는 실질적인 답을 단정적으로 제시했으며, 논문에 명시적 정의가 없다는 점을 인정하면서도 추론을 통해 답을 지어냈습니다.
- 출력(앞부분): **결론:** 부분적으로 있음 — 문서에 "노드 = ○○"라는 명시적 정의문은 없지만, 서술 전반에서 **노드는 국가(state)** 이고 엣지는 국가 쌍 간의 (투표/연설) 선호 유사도 연결임이 분명하게 드러납니다.  **근거:**  - "The result is an INLINEFORM0 adjacency matrix INLINEFORM1 where INLINEFORM2 contains the normalized textual similarity score (i.e. weighted edge) for each pair of st

### u0008: How do their results compare to state-of-the-art?
- judge: 시스템이 "확인 불가" 거절 없이 비교 결과를 실질적으로 제시하며 단정적으로 답을 구성했습니다.
- 출력(앞부분): **결론:** 있음 — 문서는 SemEval-2019 Task A 상위 팀들의 결과(최고 F1 82.9%)와 자신들의 결과를 직접 비교하며, 제안한 RKS+Fasttext 방식이 99.53% 정확도로 "벤치마킹 결과"라고 주장합니다.  **근거:**  1. **비교 대상(state-of-the-art) 제시**    - "In Table TABREF19, the list of first 5 participants along with system and f1-score has been shown." — Introduction, 후반부

### u0009: What is the performance reported for the best models in the VLSP 2018 and VLSP 2019 challenges?
- judge: 시스템이 VLSP 2018(4.85% WER)과 VLSP 2019(15.09% WER)의 구체적인 수치를 논문 인용과 함께 단정적으로 제시했습니다.
- 출력(앞부분): **결론:** 있음 — VLSP 2018 최고 성능은 4.85% WER, VLSP 2019 최고 성능은 15.09% WER이며, 두 결과 모두 시스템 결합(system combination)으로 얻어졌습니다.  **근거:** - "Evaluation on the VLSP 2019 ASR challenges showed that our system achieved 4.85% WER on the VLSP 2018 and 15.09% WER on the VLSP 2019 data sets." — Abstract, 마지막 문장 - "The

### u0013: How many layers does their model have?
- judge: 시스템이 "명시적 숫자는 없다"고 단서를 달았지만, 실질적으로 "3개 구성 요소(LSTM/어텐션/소프트맥스)"라는 구체적인 층 수를 단정적으로 제시하여 답을 지어낸 것과 동일하다.
- 출력(앞부분): **결론:** 부분적으로 있음 — 문서에 "몇 개 층"이라는 명시적인 숫자는 없습니다. 다만 Methodology의 서술을 보면 모델은 **LSTM 층 → 어텐션 층(드롭아웃 포함) → 소프트맥스 층**의 3개 구성 요소로 이루어져 있습니다.  **근거:**  - "We extract a set of features from each chunk and we feed them into a recurrent neural network to model the sequential flow of the chunks' tweets. We us

### u0014: What is the performance of their method?
- judge: 시스템이 "논문에 없다"는 단서를 일부 달았으나, 구체적인 성능 수치(ROGUE-1 F1 +0.3점, JAMR 파서 사용 시 ~2점 하락 등)를 실질적인 답으로 단정적으로 제시했습니다.
- 출력(앞부분): **결론:** 부분적으로 있음 — 성능이 **서술 형태로는** 제시되어 있으나(선행 AMR 기반 방법 대비 우수, Lead-1-AMR 대비 +0.3 ROGUE-1 F1 등), **구체적인 수치 표(TABREF13/14/18)의 실제 숫자는 제공된 텍스트에 포함되어 있지 않습니다.**  **근거:**  1. **Proxy report section (AMR Bank) 결과 — 가장 구체적인 수치**    - "All of our methods out-perform BIBREF0's method. We obtain best ROGUE-

### u0022: What argumentation phenomena encounter in actual data are now accounted for by this work?
- judge: 시스템은 "있음"이라고 단정하며 논문에서 설명된 내용을 실질적인 답으로 제시했으나, 질문(실제 데이터에서 마주쳐 이 연구에서 설명된 논증 현상)은 논문에 답이 없는 질문으로 판정되어 있으므로 답을 지어낸 것으로 판단된다.
- 출력(앞부분): **결론:** 있음 — 이 연구가 실제 데이터에서 마주친 논증 현상을 반영해 Toulmin 모델을 "수정(modified Toulmin's model)"한 항목들이 문서에 명시적으로 열거되어 있습니다. 다만 문서는 **일부 현상(감정 호소·비유·서사·오류 등)은 여전히 다루지 못했다**고도 분명히 밝히므로, "반영된 것"과 "반영 못 한 것"을 구분해 정리합니다.  ## 1) 실제 데이터의 현상을 반영해 모델에 수용한 것  **근거:** - "Authors do not state the degree of cogency (the pr

### u0025: What is the algorithm used to create word embeddings?
- judge: 시스템이 "논문에 없다"고 거절하지 않고 SGNS를 주된 알고리즘으로 단정하며 실질적인 답을 제시했습니다.
- 출력(앞부분): **결론:** 있음 — 대부분의 팀이 **skip-gram with negative sampling(SGNS)** 으로 의미 공간(단어 임베딩)을 학습했고, 일부는 **fastText**, 그리고 count/PPMI 기반 벡터도 사용했습니다. 문서에서 "the algorithm"이 하나로 명시되진 않지만, 주된 임베딩 학습 알고리즘은 SGNS입니다.  **근거:**  - "most teams make use of skip-gram with negative sampling (SGNS) based on BIBREF13 to learn 

### u0035: Are humans and machine learning systems fooled by the same kinds of illusions?
- judge: 시스템이 "논문에 없다"고 거절하지 않고, 관련 근거를 제시하며 질문에 대한 실질적인 답(부분적으로 겹친다/겹치지 않는다)을 단정적으로 구성해 제시했습니다.
- 출력(앞부분): **결론:** 부분적으로 있음 — 문서는 이 질문을 직접 표제로 다루지는 않지만, 관련 근거가 세 군데에 흩어져 있습니다. 요지는 **인간의 McGurk 착시는 ML의 adversarial example과 엄밀히 같은 종류가 아니지만**, 일부 착시/적대적 예제는 인간과 기계 양쪽을 속인다는 것입니다.  **근거:**  1. **같지 않다는 쪽 (McGurk ≠ adversarial example)**    - "Strictly speaking, however, our investigation of the density of nat

### u0037: What applicability of their approach is demonstrated by the authors?
- judge: 시스템이 논문 내 근거를 인용하며 "유명 그림에 대해 셰익스피어 풍 산문 생성"이라는 실질적인 답을 단정적으로 제시했습니다.
- 출력(앞부분): **결론:** 있음 — 저자들은 **유명 그림(famous paintings)에 대해 셰익스피어 풍 산문을 생성하는 것**으로 접근법의 적용 가능성을 보여줍니다.  **근거:**  - "We demonstrate the applicability and limitations of our approach by generating Shakespearean prose for famous paintings." — Abstract, 마지막에서 두 번째 문장  - "We perform a qualitative analysis of the Sha

### u0039: what are the state of the art methods?
- judge: 시스템이 "논문에 없다"고 거절하지 않고 SOTA 방법들을 PRPN, ON, DIORA, URNNG 등으로 실질적으로 특정하며 단정적인 답을 제시했습니다.
- 출력(앞부분): **결론:** 부분적으로 있음 — 논문은 비교 대상인 "recent state-of-the-art methods"를 **최근 신경망 기반 문법 귀납(grammar induction) 방법들**(BIBREF14–BIBREF17)로 지목하고 Related Work에서 각각의 성격을 서술합니다. 다만 인용이 `BIBREF` 번호로 익명화되어 있어 **정식 논문명·저자는 제공된 텍스트로 특정할 수 없고**, 본문 곳곳에 등장하는 이름(PRPN, ON, DIORA, URNNG)으로만 부분적으로 식별됩니다.  **근거:**  1. SOTA 비

### u0044: How do they measure style transfer success?
- judge: 시스템이 사람 평가(RMSE, 유창성, 의미 보존 등)를 근거로 스타일 전이 성공 측정 방법을 구체적으로 단정하여 답을 제시했습니다.
- 출력(앞부분): **결론:** 있음 — 스타일 전이 성공은 **자동 지표가 아니라 사람 평가(human evaluation)** 로 측정합니다. 100문장(OpenSubtitles 50 + Europarl 50)을 반대 스타일로 번역해 3명의 평가자가 ① 변화 여부 ② 유창성(1–4) ③ 의미 보존 ④ 스타일 방향(더 격식/덜 격식/변화없음) ⑤ 차이의 종류를 판정했고, 스타일 전이 자체는 평가자 점수와 목표값(+1/−1) 사이의 **RMSE**로 수치화했습니다.  **근거:**  - **평가 설계 (Style Transfer 평가 파트, 인간 평

## single-llm — 할루시네이션 문항 (14건)

### u0002: What evaluations methods do they take?
- judge: 시스템이 평가 방법을 구체적으로 나열하며 실질적인 답을 단정적으로 제시했습니다.
- 출력(앞부분): **답:** 별도의 정량적 성능 평가 실험은 없고, 편향을 "탐지·분석"하는 방법들로 (1) 이미지와 설명을 함께 훑어보는 브라우저 기반 주석 도구, (2) 인종 표지(black/white/asian 등) 사용 빈도를 세어 상한값을 구하고 'baby' 이미지 697장을 수작업 분류해 비교하는 방식, (3) 품사(POS) 태깅으로 특정 명사에 자주 쓰이는 형용사 확인, (4) Flickr30K Entities의 상호참조 주석으로 coreference graph를 만들고 Louvain 클러스터링을 적용해 지시 표현 군집을 관찰하는 방법

### u0004: What type of inflections are considered?
- judge: 시스템이 "형태통사적 굴절(MSD로 기술되는)"이라는 실질적 답을 제시하고 예시까지 인용하며 단정적으로 답변했으므로, 논문에 답이 없다는 거절이 아닌 답을 지어낸 경우에 해당한다.
- 출력(앞부분): **답:** 문맥 기반 형태론적 굴절(morphological inflection in context) — 즉 어휘의 lemma와 그것이 등장하는 문맥이 주어졌을 때 굴절형(inflected word form)을 생성하는 것으로, MSD(morphosyntactic description)로 기술되는 형태통사적 굴절입니다. 특정 굴절 범주(시제·수·격 등)의 목록은 논문에 명시되어 있지 않으나, 예시로 PRO;NOM;SG;1(대명사·주격·단수·1인칭)과 같은 태그 구성이 언급됩니다.  **근거:** "Task 2 focuses on 

### u0007: What does a node in the network approach repesent?
- judge: 시스템이 "노드는 국가(state)를 나타낸다"고 단정적으로 답을 제시했습니다.
- 출력(앞부분): **답:** 노드는 국가(state)를 나타냅니다 — 즉 UN에서 투표하고 General Debate 연설을 한 각 국가가 하나의 노드이며, 엣지는 국가 쌍 간의 (투표·연설) 선호 유사성입니다.  **근거:** "The result is an INLINEFORM0 adjacency matrix INLINEFORM1 where INLINEFORM2 contains the normalized textual similarity score (i.e. weighted edge) for each pair of states INLINEFORM

### u0008: How do their results compare to state-of-the-art?
- judge: 시스템이 "최대 정확도 99.53%"와 SemEval 1위 팀 점수를 구체적으로 제시하며 실질적인 비교 답변을 단정적으로 제공했습니다.
- 출력(앞부분): **답:** 제안한 RKS + fastText 방식이 Fasttext 특징을 1000차원으로 매핑했을 때 최대 정확도 99.53%를 얻어, 논문 저자들은 이를 기존 문헌 대비 "benchmarking(기준이 되는)" 결과라고 평가합니다. 참고로 SemEval-2019 Task 6 Sub-task A의 1위 팀은 f1-score 82.9%였고, 저자들의 베이스라인(Google 문장 인코더 + SVM linear/로지스틱 회귀)은 정확도 82.44~82.56% 수준이었습니다.  **근거:** - "team BIBREF3 obtained

### u0009: What is the performance reported for the best models in the VLSP 2018 and VLSP 2019 challenges?
- judge: 시스템이 구체적인 WER 수치(4.85%, 15.09%)를 근거 인용과 함께 단정적으로 제시했으므로 답을 지어낸 것으로 판정.
- 출력(앞부분): **답:** VLSP 2018 테스트셋에서 4.85% WER, VLSP 2019 테스트셋에서 15.09% WER (모두 시스템 결합 결과)  **근거:** "Evaluation on the VLSP 2019 ASR challenges showed that our system achieved 4.85% WER on the VLSP 2018 and 15.09% WER on the VLSP 2019 data sets." / "The best result for vlsp2018 of 4.85% WER is obtained by the co

### u0014: What is the performance of their method?
- judge: 시스템이 "논문에 없다"는 거절 없이 구체적인 성능 수치와 비교 결과를 실질적인 답으로 제시했다.
- 출력(앞부분): **답:** 제안 방법은 AMR 기반 요약 기법 중 최고 성능(state-of-the-art)을 달성했으며, 구체적으로 Proxy report section에서 first co-occurrence+first 모델이 최고 ROUGE-1 F1 점수를 얻어 Lead-1-AMR 베이스라인을 0.3 ROUGE-1 F1 포인트 앞섰고, CNN-Dailymail에서는 first-3 모델이 Lead-3-AMR 베이스라인과 대등한 수준입니다. (구체적 수치 표는 본문에 표시되지 않아 확인 불가)  **근거:** "Our proposed method

### u0022: What argumentation phenomena encounter in actual data are now accounted for by this work?
- judge: 시스템이 논문에 없다고 거절하지 않고, 실질적인 답(6가지 현상 목록)을 구체적인 근거 인용과 함께 단정적으로 제시했습니다.
- 출력(앞부분): **답:** 이 연구는 수정된 Toulmin 모델을 통해 실제 데이터에서 나타나는 다음 현상들을 반영했습니다 — (1) qualifier(확실성 정도)가 명시되지 않는 점, (2) warrant가 거의 명시되지 않는 점(둘 다 모델에서 제외), (3) 저자가 반론(rebuttal)을 다시 공격하는 refutation(procatalepsis)의 존재(새 요소로 추가), (4) claim이 암묵적으로 남아 독자가 추론해야 하는 경우(implicit claim 허용), (5) 한 문서에서 양측 입장 각각에 대한 복수의 argument가

### u0024: Is the discriminator's reward made available at each step to the generator?
- judge: 시스템이 "아니오"라는 실질적인 답을 단정적으로 제시하였으며, 논문에 해당 정보가 없다고 거절하지 않았습니다.
- 출력(앞부분): **답:** 아니오 — ARAML의 판별자는 각 단계마다 보상을 주지 않습니다. 논문에서 단계별(dense) 보상을 제공하는 것은 비교 대상인 LeakGAN과 IRL(inverse reinforcement learning)로 소개됩니다.  **근거:** "LeakGAN BIBREF11 guided the generator with reward signals leaked from the discriminator at all generation steps to deal with long text generation task." / "I

### u0025: What is the algorithm used to create word embeddings?
- judge: 시스템이 "skip-gram with negative sampling(SGNS)"이라는 실질적인 답을 단정적으로 제시하고 근거 인용까지 붙였으므로, 논문에 답이 없다는 거절 없이 답을 지어낸 것으로 판정.
- 출력(앞부분): **답:** skip-gram with negative sampling (SGNS) — 대부분의 팀이 사용했으며, 최고 성능 모델도 SGNS 기반입니다. (fastText를 쓴 팀도 일부 있음)  **근거:** "most teams make use of skip-gram with negative sampling (SGNS) based on BIBREF13 to learn the semantic spaces of the two time periods and orthogonal procrustes (OP) to align these v

### u0035: Are humans and machine learning systems fooled by the same kinds of illusions?
- judge: 시스템은 "부분적으로 그렇다"는 실질적인 답을 제시하며 두 시스템이 겹치는 사례를 단정적으로 나열했으므로, 논문에 없는 답을 지어낸 것으로 판단됩니다.
- 출력(앞부분): **답:** 부분적으로만 그렇습니다 — 논문은 인간의 McGurk 착시가 ML의 적대적 예제와 "엄밀히 말해" 같은 것은 아니라고 선을 긋지만, 동시에 두 시스템이 겹치는 사례(신경망도 McGurk 효과와 음성인식 적대적 예제에 취약하고, 일부 시각 적대적 예제는 인간도 속임)를 제시합니다.  **근거:** - 같지 않다는 쪽: "Strictly speaking, however, our investigation of the density of natural language for which McGurk illusions can be

### u0037: What applicability of their approach is demonstrated by the authors?
- judge: 시스템이 논문 본문의 인용을 제시하며 질문에 대한 실질적인 답을 단정적으로 제시했습니다.
- 출력(앞부분): **답:** 저자들은 유명 그림(famous paintings)에 대해 셰익스피어풍 산문을 생성함으로써 접근법의 적용 가능성과 한계를 보여줍니다.  **근거:** "We demonstrate the applicability and limitations of our approach by generating Shakespearean prose for famous paintings."

### u0039: what are the state of the art methods?
- judge: 시스템이 "확인 불가" 거절 대신 PRPN, ON, DIORA, URNNG 등 구체적인 최신 방법들을 실질적인 답으로 단정하여 제시했습니다.
- 출력(앞부분): **답:** 최근의 신경망 기반 문법 귀납 방법들(BIBREF14, BIBREF15, BIBREF16, BIBREF17)이며, 본문에서 이름이 확인되는 것은 PRPN, ON, DIORA, (U)RNNG입니다.  **근거:** - "the proposed approach is found to perform favorably against recent neural network-based approaches to grammar induction BIBREF14 , BIBREF15 , BIBREF16 , BIBREF17 ." - "BIB

### u0044: How do they measure style transfer success?
- judge: 시스템이 RMSE 수치(영어 0.78, 에스토니아어 0.89)까지 인용하며 스타일 전환 성공 측정 방법을 구체적으로 단정 제시했습니다.
- 출력(앞부분): **답:** 사람(인간) 평가로 측정합니다. 100문장(OpenSubtitles 50 + Europarl 50)을 반대 스타일로 번역해 평가자 3인에게 (1) 문장 차이 유무, (2) 유창성(1~4점), (3) 의미 유사도(4단계), (4) 스타일 방향(더 격식/덜 격식/차이 없음), (5) 구체적 차이 유형을 묻고, 스타일 전환 자체는 평가자 3인의 평균 점수(격식 +1, 비격식 −1, 없음 0)와 목표값(+1/−1) 사이의 **RMSE**로 정량화했습니다. (영어 0.78, 에스토니아어 0.89)  **근거:** "Each se

### u0046: What is the meta knowledge specifically?
- judge: 시스템이 "논문에 명시된 정의는 없다"고 인정하면서도 감정 표현 뉴런, 경동사 구문 감지 뉴런 등 구체적 예시를 들어 메타 지식의 내용을 실질적으로 답변했으므로, 단순한 거절이 아닌 답을 제시한 것으로 판단된다.
- 출력(앞부분): **답:** 논문은 "meta-knowledge"를 서로 다른 합성 규칙(compositional rules) 전반에 걸쳐 공유되는 지식으로만 규정하며, 그 구체적 내용은 메타 네트워크가 암묵적으로 추출·표현하는 것으로 서술됩니다. 정성 분석에서 그 일부가 드러나는데, 감정 표현 용어에 반응하는 뉴런이나 경동사(light-verb) 구문을 감지하는 뉴런처럼 과제별 의미 정보와 구문 정보가 여기에 해당합니다.  **근거:** "The role of meta-network is to capture the metaknowledge acr
