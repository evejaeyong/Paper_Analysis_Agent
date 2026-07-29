# 파일럿 리뷰 — qasper 20문항 × 2시스템

각 문항의 두 시스템 출력을 gold와 비교해 직접 판단하세요. (T6 자동 채점 전 게이트)
- 총 run: 40 | 실패(에러/빈 출력): 0 | 미실행: 0
- 게이트 기준: 실패 4건 이하 → **통과**


---

## q0001 — Cross-lingual Pre-training Based Transfer for Zero-shot Neural Machine Translation

**질문:** which multilingual approaches do they compare with?

**gold (extractive):** BIBREF19; BIBREF20

<details><summary>gold evidence</summary>

> We compare our approaches with related approaches of pivoting, multilingual NMT (MNMT) BIBREF19, and cross-lingual transfer without pretraining BIBREF16.
> The results show that our approaches consistently outperform other approaches across languages and datasets, especially surpass pivoting, which is a strong baseline in the zero-shot scenario that multilingual NMT systems often fail to beat BIBREF19, BIBREF20, BIBREF23.

</details>

### agent-evidence (11.9s)

**결론:** 있음 — 이들은 다국어 NMT(MNMT) 접근법으로 **BIBREF19**(단일 encoder-decoder 다국어 NMT)와 **BIBREF22(gu2019improved, back-translation을 도입한 MNMT)** 두 가지와 비교합니다.

**근거:**
- "We compare our approaches with related approaches of pivoting, multilingual NMT (MNMT) BIBREF19, and cross-lingual transfer without pretraining BIBREF16." — Experiments ::: Main Results, 첫 문단

- "When comparing systems consisting of one encoder-decoder model for all zero-shot translation, our approaches performs significantly better than MNMT BIBREF19." — Main Results ::: Results on MultiUN Dataset

- "BIBREF22 gu2019improved introduces back translation into MNMT, while we adopt it in our transfer approaches. ... our best MLM+BRLM-SA with back translation outperforms pivoting$_{\rm m}$ by 2.4 BLEU points averagely, and outperforms MNMT BIBREF22 by 4.6 BLEU points averagely." — Main Results ::: Results on MultiUN Dataset

**보충:**
- MultiUN 실험에서 등장하는 **pivoting$_{\rm m}$** 은 순수 다국어 접근법이라기보다 "MNMT를 이용해 source→pivot→target을 두 단계로 번역하는 pivot 기반 방법"으로 설명됩니다("pivoting$_{\rm m}$, which uses MNMT to translate source to pivot then to target in two separate steps", Results on MultiUN Dataset).

즉, 논문이 명시적으로 비교하는 다국어(MNMT) 접근법은 **BIBREF19**와 **BIBREF22(back-translation 적용 MNMT)** 입니다.

### single-llm (6.3s)

**답:** 그들이 비교한 다중언어(multilingual) 접근법은 Multilingual NMT(MNMT)로, 구체적으로 BIBREF19와 BIBREF22(gu2019improved) 두 시스템입니다.

**근거:** "We compare our approaches with related approaches of pivoting, multilingual NMT (MNMT) BIBREF19, and cross-lingual transfer without pretraining BIBREF16." 그리고 MultiUN 결과에서 "our best MLM+BRLM-SA with back translation outperforms pivoting$_{\rm m}$ by 2.4 BLEU points averagely, and outperforms MNMT BIBREF22 by 4.6 BLEU points averagely."

---

## q0002 — pioNER: Datasets and Baselines for Armenian Named Entity Recognition

**질문:** what ner models were evaluated?

**gold (extractive):** Stanford NER; spaCy 2.0; recurrent model with a CRF top layer

<details><summary>gold evidence</summary>

> In this section we describe a number of experiments targeted to compare the performance of popular named entity recognition algorithms on our data. We trained and evaluated Stanford NER, spaCy 2.0, and a recurrent model similar to BIBREF13 , BIBREF14 that uses bidirectional LSTM cells for character-based feature extraction and CRF, described in Guillaume Genthial's Sequence Tagging with Tensorflow blog post BIBREF15 .
> Stanford NER is conditional random fields (CRF) classifier based on lexical and contextual features such as the current word, character-level n-grams of up to length 6 at its beginning and the end, previous and next words, word shape and sequence features BIBREF16 .
> spaCy 2.0 uses a CNN-based transition system for named entity recognition.
> The main model that we focused on was the recurrent model with a CRF top layer, and the above-mentioned methods served mostly as baselines.

</details>

### agent-evidence (9.8s)

**결론:** 있음 — 세 가지 NER 모델(Stanford NER, spaCy 2.0, Char-biLSTM+biLSTM+CRF 순환 모델)이 평가되었습니다.

**근거:**
- "We trained and evaluated Stanford NER, spaCy 2.0, and a recurrent model similar to BIBREF13, BIBREF14 that uses bidirectional LSTM cells for character-based feature extraction and CRF, described in Guillaume Genthial's Sequence Tagging with Tensorflow blog post" — Experiments 섹션, 첫 문단
- "Stanford NER is conditional random fields (CRF) classifier based on lexical and contextual features..." — Models 섹션 (모델1 설명)
- "spaCy 2.0 uses a CNN-based transition system for named entity recognition." — Models 섹션 (모델2 설명)
- "The main model that we focused on was the recurrent model with a CRF top layer... character-based representation is extracted using a bidirectional LSTM ... a CRF layer labels the sequence" — Models 섹션 (모델3, 논문의 주력 모델; 나머지 둘은 baseline)
- "we provide evaluation results for 3 different named entity recognition systems trained and tested on our datasets." — Conclusion 섹션

**정리:**
1. **Stanford NER** — CRF 기반 (baseline)
2. **spaCy 2.0** — CNN 기반 transition system (baseline)
3. **Char-biLSTM + biLSTM + CRF** 순환 모델 (Guillaume Genthial 구현 기반, 논문의 주력 모델)

### single-llm (7.4s)

**답:** Stanford NER, spaCy 2.0, 그리고 문자 기반 특징 추출에 bidirectional LSTM과 CRF를 사용하는 순환(recurrent) 모델(Char-biLSTM+biLSTM+CRF) 세 가지가 평가되었습니다.

**근거:** "We trained and evaluated Stanford NER, spaCy 2.0, and a recurrent model similar to BIBREF13, BIBREF14 that uses bidirectional LSTM cells for character-based feature extraction and CRF"

---

## q0003 — Identifying Dogmatism in Social Media: Signals and Models

**질문:** what are the topics pulled from Reddit?

**gold (extractive):** politics, business, science, and AskReddit, and 1000 additional posts from the Reddit frontpage.

<details><summary>gold evidence</summary>

> To collect a diverse training dataset, we have randomly sampled 1000 posts each from the subreddits politics, business, science, and AskReddit, and 1000 additional posts from the Reddit frontpage.

</details>

### agent-evidence (10.8s)

**결론:** 있음 — 훈련 데이터셋 수집을 위해 Reddit에서 뽑은 주제(서브레딧)가 명시되어 있습니다.

**근거:**
- "we have randomly sampled 1000 posts each from the subreddits **politics, business, science, and AskReddit**, and 1000 additional posts from the **Reddit frontpage**." — Dogmatism data 섹션, "Data collection" 문단

**정리:**
훈련용 5,000개 게시물은 다음 5개 출처에서 각 1,000개씩 무작위 추출되었습니다.
- **politics**(정치)
- **business**(비즈니스)
- **science**(과학)
- **AskReddit**
- **Reddit frontpage**(레딧 프론트페이지)

**보충:** 서론과 데이터 섹션은 Reddit이 climate change, abortion, religion, LGBT, technology, world news, 인공지능 등 다양한 주제의 토론을 담고 있다고 언급하지만, 위 5개가 실제로 훈련 데이터를 위해 "뽑아낸(pulled)" 출처입니다. (이후 대규모 분석 단계에서는 별도로 수백만 개의 게시물을 샘플링합니다.)

### single-llm (4.8s)

**답:** politics, business, science, AskReddit, 그리고 Reddit 프론트페이지(frontpage)입니다.

**근거:** "we have randomly sampled 1000 posts each from the subreddits politics, business, science, and AskReddit, and 1000 additional posts from the Reddit frontpage."

---

## q0004 — Adversarial Learning for Chinese NER from Crowd Annotations

**질문:** What accuracy does the proposed system achieve?

**gold (free_form):** F1 scores of 85.99 on the DL-PS data,  75.15 on the EC-MT data and 71.53 on the EC-UQ data

<details><summary>gold evidence</summary>

> FLOAT SELECTED: Table 2: Main results on the DL-PS data.
> FLOAT SELECTED: Table 3: Main results on the EC-MT and EC-UQ datasets.

</details>

### agent-evidence (12.4s)

**결론:** 부분적으로 있음 — 논문은 "accuracy(정확도)"라는 지표를 사용하지 않고, **entity-level F1 (및 Precision/Recall)** 로 성능을 보고합니다. 제안 시스템(ALCrowd)의 절대 수치는 표(Table 2·3)에 있으나 본문 텍스트에는 없고, 대신 강력한 베이스라인(LSTM-CRF) 대비 **F1 향상폭**이 제시됩니다.

**근거:**
- "we use the entity-level metrics of Precision (P), Recall (R), and their F1 value in our experiments, treating one tagged entity as correct only when it matches the gold entity exactly." — Settings 섹션 (평가지표: accuracy가 아니라 F1)
- "Compared with the strong baseline LSTM-CRF, ALCrowd shows its advantage with +1.08 F1 improvements on DL-PS, +1.24 on EC-MT, and +2.38 on EC-UQ, respectively." — Main Results 섹션 (제안 시스템의 성능 = F1 향상폭)
- "Among all the systems, ALCrowd performs the best, and significantly better than all the other models (the p-value is below $10^{-5}$ by using t-test)." — Main Results 섹션 (최고 성능임을 서술)

**보충 설명:**
- 질문에서 말하는 "accuracy"에 대응하는 지표는 이 논문에 없습니다. 성능은 전부 **entity-level F1**로 측정됩니다.
- ALCrowd의 **F1 절대값**은 "Table 2 shows the experimental results on the DL-PS datasets and Table 3 shows the experiment results on the EC-MT and EC-UQ datasets"라고만 언급되며, 표 자체의 수치는 제공된 텍스트에 포함되어 있지 않아 확인할 수 없습니다.

### single-llm (5.9s)

**답:** 논문에서 확인 불가 (정확도(accuracy)는 보고하지 않으며, 평가는 Precision·Recall·F1로 이루어짐)

**근거:** "we use the entity-level metrics of Precision (P), Recall (R), and their F1 value in our experiments" — 정확도(accuracy) 수치는 제시되지 않았습니다. 다만 성능 향상은 F1 기준으로 "ALCrowd shows its advantage with +1.08 F1 improvements on DL-PS, +1.24 on EC-MT, and +2.38 on EC-UQ"로 보고됩니다.

---

## q0005 — Addressing word-order Divergence in Multilingual Neural Machine Translation for extremely Low Resource Languages

**질문:** How do they match words before reordering them?

**gold (extractive):** CFILT-preorder system

<details><summary>gold evidence</summary>

> We use the CFILT-preorder system for reordering English sentences to match the Indian language word order. It contains two re-ordering systems: (1) generic rules that apply to all Indian languages BIBREF17 , and (2) hindi-tuned rules which improve the generic rules by incorporating improvements found through an error analysis of English-Hindi reordering BIBREF28 .

</details>

### agent-evidence (17.4s)

**결론:** 부분적으로 있음 — 문서는 "단어 매칭"을 별도의 정렬(alignment) 과정으로 서술하기보다, **양방향 사전(bilingual dictionary)을 이용한 단어 단위 번역**으로 원본 언어 단어를 보조 언어(영어) 공간에 대응시키는 방식으로 설명합니다. 다만 "재정렬 전 단어를 어떻게 맞추는가"에 대한 명시적·독립적 매칭 알고리즘 서술은 없습니다.

**근거:**
- "For representing English and other source languages into a common space, we translate each word in the source language into English using a bilingual dictionary (Google Translate word translation in our case)." — Experimental Setup > Network (영어/원본 언어를 공통 공간에 표현하는 부분)
- "at test time, the source language sentence is translated using the parent model after performing a word-by-word translation into the assisting language." — Proposed Solution (첫 문단)
- 재정렬 자체는 영어 문장에 규칙 기반으로 적용됨: "We use the CFILT-preorder system for reordering English sentences to match the Indian language word order." — Experimental Setup > Network

**보충 설명:**
- 즉, 파이프라인은 (원본 언어 문장) → 사전 기반 **단어 대 단어 번역**으로 영어로 매핑 → CFILT-preorder 규칙으로 **재정렬**의 순서입니다. "단어 매칭"에 해당하는 것은 사전 기반 단어 번역이며, 별도의 통계적/임베딩 기반 단어 정렬 기법은 사용하지 않습니다.
- 이상적으로는 bilingual embeddings로 단어 대응을 얻는 것이 좋으나 품질 문제로 사용하지 않았다고 밝힙니다: "it would have been ideal to use bilingual embeddings or obtain word-by-word translations via bilingual embeddings ... the quality of publicly available bilingual embeddings ... is very low" — Experimental Setup > Network.

문서에는 재정렬을 위한 별도의 "단어 정렬(alignment)" 절차는 서술되어 있지 않으며, 위의 사전 기반 단어 번역이 단어를 맞추는 유일한 수단입니다.

### single-llm (5.2s)

**답:** 양방향 사전(bilingual dictionary)을 이용해 원본 언어의 각 단어를 영어로 단어 단위(word-by-word)로 번역하여 매칭합니다.

**근거:** "For representing English and other source languages into a common space, we translate each word in the source language into English using a bilingual dictionary (Google Translate word translation in our case)." 또한 "the source language sentence is translated using the parent model after performing a word-by-word translation into the assisting language."

---

## q0006 — A Corpus for Automatic Readability Assessment and Text Simplification of German

**질문:** Which information about text structure is included in the corpus?

**gold (extractive):** paragraphs; lines; Information on physical page segmentation (for PDFs only), paragraph segmentation, and line segmentation

<details><summary>gold evidence</summary>

> The focus of this publication is on representing information that is valuable for these tasks but that hitherto has largely been ignored in machine learning approaches centering around simplified language, specifically, text structure (e.g., paragraphs, lines), typography (e.g., font type, font style), and image (content, position, and dimensions) information.
> Information on physical page segmentation (for PDFs only), paragraph segmentation, and line segmentation was added as part of a textspan element in the textstructure layer

</details>

### agent-evidence (10.4s)

**결론:** 있음 — 문서는 텍스트 구조 정보로 **문단(paragraph), 줄(line)**, 그리고 PDF에 한해 **물리적 페이지 분할(page segmentation)** 정보를 포함한다고 명시합니다.

**근거:**
- "text structure (e.g., paragraphs, lines)" — Introduction, 코퍼스의 신규 기여를 소개하는 문단 (텍스트 구조·타이포그래피·이미지 정보를 언급하는 대목)
- "Information on text structure (e.g., paragraphs, lines) and typography (e.g., boldface, italics) was retained." — 3장 Primary Data (웹페이지 처리 설명)
- "Information on physical page segmentation (for PDFs only), paragraph segmentation, and line segmentation was added as part of a textspan element in the textstructure layer" — 3장 Secondary Data (TCF 확장 설명, 텍스트 구조 레이어)

**정리:**
- 문단 분할(paragraph segmentation)
- 줄 분할(line segmentation)
- 물리적 페이지 분할(physical page segmentation) — **PDF에만 해당**

이 정보들은 TCF의 `textstructure` 레이어 안에 `textspan` 요소로 저장됩니다. 또한 Empirical validation 절에서 "number of paragraphs, number of lines" 등이 난이도 예측에 유용한 구조적 특징으로 활용되었다고 언급됩니다.

### single-llm (5.6s)

**답:** 텍스트 구조 정보로 (물리적) 페이지 분할, 문단(paragraph) 분할, 행(line) 분할 정보가 포함됩니다.

**근거:** "Information on text structure (e.g., paragraphs, lines) ... was retained." / "Information on physical page segmentation (for PDFs only), paragraph segmentation, and line segmentation was added as part of a textspan element in the textstructure layer"

---

## q0007 — Improved Neural Relation Detection for Knowledge Base Question Answering

**질문:** On which benchmarks they achieve the state of the art?

**gold (extractive):** SimpleQuestions; WebQSP

<details><summary>gold evidence</summary>

> As shown on the last row of Table 3 , this gives a significant performance boost, resulting in a new state-of-the-art result on SimpleQuestions and a result comparable to the state-of-the-art on WebQSP
> FLOAT SELECTED: Table 3: KBQA results on SimpleQuestions (SQ) and WebQSP (WQ) test sets. The numbers in green color are directly comparable to our results since we start with the same entity linking results.

</details>

### agent-evidence (10.8s)

**결론:** 있음 — 저자들은 **SimpleQuestions**(단일 관계 QA)와 **WebQSP**(다중 관계 QA) 두 벤치마크에서 state-of-the-art를 달성했다고 밝힙니다.

**근거:**
- "it helps our KBQA system to achieve state-of-the-art accuracy for both single-relation (SimpleQuestions) and multi-relation (WebQSP) QA benchmarks." — Abstract 마지막 문장
- "this gives a significant performance boost, resulting in a new state-of-the-art result on SimpleQuestions and a result comparable to the state-of-the-art on WebQSP." — KBQA End-Task Results, 마지막 문단 (Table 3 관련)
- "Our model outperforms the previous methods on KB relation detection tasks and allows our KBQA system to achieve state-of-the-arts." — Conclusion

**보충 설명:**
- **SimpleQuestions**: 명확히 "new state-of-the-art"를 달성했다고 명시.
- **WebQSP**: 표현이 약간 다릅니다. 최종 결과는 "comparable to the state-of-the-art"(최신 수준에 필적)로 기술되어, SimpleQuestions만큼 확실한 신기록 주장은 아닙니다. 다만 Abstract와 Conclusion에서는 두 벤치마크 모두 state-of-the-art를 달성했다고 포괄적으로 서술하고 있습니다.

### single-llm (5.8s)

**답:** SimpleQuestions와 WebQSP 두 벤치마크에서 state-of-the-art를 달성했습니다. (단, WebQSP는 최종적으로 "comparable to the state-of-the-art" 수준입니다.)

**근거:** "it helps our KBQA system to achieve state-of-the-art accuracy for both single-relation (SimpleQuestions) and multi-relation (WebQSP) QA benchmarks." 및 "this gives a significant performance boost, resulting in a new state-of-the-art result on SimpleQuestions and a result comparable to the state-of-the-art on WebQSP."

---

## q0008 — How Contextual are Contextualized Word Representations? Comparing the Geometry of BERT, ELMo, and GPT-2 Embeddings

**질문:** What experiments are proposed to test that upper layers produce context-specific embeddings?

**gold (free_form):** They measure self-similarity, intra-sentence similarity and maximum explainable variance of the embeddings in the upper layers.

<details><summary>gold evidence</summary>

> We measure how contextual a word representation is using three different metrics: self-similarity, intra-sentence similarity, and maximum explainable variance.

</details>

### agent-evidence (20.5s)

**결론:** 부분적으로 있음 — 논문은 "upper layers가 더 context-specific한 표현을 만든다"는 것을 검증하기 위해 별도의 새로운 실험을 "제안"한다기보다는, **세 가지 문맥성 측정 지표(self-similarity, intra-sentence similarity, maximum explainable variance)를 정의하고 이를 각 레이어별로 계산하는 방식**으로 이를 검증합니다. 그중 핵심은 **self-similarity**입니다.

**근거:**

- "We measure how contextual a word representation is using three different metrics: self-similarity, intra-sentence similarity, and maximum explainable variance." — 위치: 3장 Approach, "Measures of Contextuality"

- "the self-similarity of a word $w$ in layer $\ell$ is the average cosine similarity between its contextualized representations across its $n$ unique contexts. ... The more contextualized the representations are for $w$, the lower we would expect its self-similarity to be." — 위치: Approach, Definition 1 (self-similarity가 context-specificity를 측정하는 핵심 지표)

- "In Figure FIGREF24, we plot the average self-similarity of uniformly randomly sampled words in each layer of BERT, ELMo, and GPT-2. ... In all three models, the higher the layer, the lower the self-similarity is on average. In other words, the higher the layer, the more context-specific the contextualized representations." — 위치: 4장 Findings, "Contextualized word representations are more context-specific in higher layers" (실제로 이 명제를 검증한 실험 결과)

- 데이터 측면: "Our input data come from the SemEval Semantic Textual Similarity tasks from years 2012 - 2016 ... We use these datasets because they contain sentences in which the same words appear in different contexts." — 위치: Approach, Data (동일 단어가 여러 문맥에 등장하는 문장을 입력으로 사용해 레이어별 표현을 비교)

- 보조 지표: "the intra-sentence similarity of a sentence is the average cosine similarity between its word representations and the sentence vector" (Definition 2) 및 "$\textit{MEV}_\ell(w)$ is the proportion of variance in $w$'s contextualized representations ... that can be explained by their first principal component" (Definition 3) — 위치: Approach. 이들은 context-specificity가 어떻게 나타나는지(단어들이 수렴하는지)와 정적 임베딩으로 대체 가능한지를 각각 검증.

**보충 설명:** 
- 질문에서 말하는 "proposed experiments"에 정확히 대응하는 것은 "각 레이어에서 무작위 추출한 단어들의 self-similarity를 계산·비교"하는 실험이며, 이 값이 상위 레이어로 갈수록 낮아짐을 보이는 것이 곧 "upper layers가 더 context-specific하다"는 증거입니다.
- 단, 문서는 이를 향후 수행할 "제안(proposed to test)"이라기보다 이미 수행한 방법·결과로 서술합니다. 만약 "아직 수행되지 않은 향후 실험 제안"을 찾는 것이라면, 그런 목적의 실험 제안은 문서에 없으며 Future Work 섹션은 등방성(isotropy) 페널티 추가나 정적 표현 추출 등 다른 주제를 다룹니다.

### single-llm (10.0s)

**답:** 저자들은 별도의 실험을 "제안(future work)"한 것이 아니라, 세 가지 문맥성(contextuality) 지표 — 자기유사도(self-similarity), 문장 내 유사도(intra-sentence similarity), 최대설명분산(MEV) — 를 각 층마다 계산해 상위 층의 문맥 특수성을 측정했습니다. 특히 상위 층이 더 문맥 특수적이라는 점은 무작위 추출한 단어들의 **층별 평균 자기유사도**를 측정해 확인했습니다.

**근거:** "We measure how contextual a word representation is using three different metrics: self-similarity, intra-sentence similarity, and maximum explainable variance." / "In Figure FIGREF24, we plot the average self-similarity of uniformly randomly sampled words in each layer of BERT, ELMo, and GPT-2. ... In all three models, the higher the layer, the lower the self-similarity is on average. In other words, the higher the layer, the more context-specific the contextualized representations."

---

## q0009 — Sensitive Data Detection and Classification in Spanish Clinical Text: Experiments with BERT

**질문:** What is the performance of BERT on the task?

**gold (free_form):** F1 scores are:
HUBES-PHI: Detection(0.965), Classification relaxed (0.95), Classification strict (0.937)
Medoccan: Detection(0.972), Classification (0.967)

<details><summary>gold evidence</summary>

> To finish with this experiment set, Table also shows the strict classification precision, recall and F1-score for the compared systems.
> FLOAT SELECTED: Table 5: Results of Experiment A: NUBES-PHI
> The results of the two MEDDOCAN scenarios –detection and classification– are shown in Table .
> FLOAT SELECTED: Table 8: Results of Experiment B: MEDDOCAN

</details>

### agent-evidence (17.2s)

**결론:** 있음 — 문서는 두 데이터셋(NUBes-PHI, MEDDOCAN)에서 BERT의 성능을 서술하고 있으며, 핵심은 "다른 시스템 대비 특히 높은 recall로 우수한 성능"입니다. 다만 정확한 수치 표(precision/recall/F1의 전체 값)는 본문 표(Table)에 있으나 제공 텍스트에는 표 자체가 포함되어 있지 않아, 본문에 언급된 수치만 확인됩니다.

**근거:**

**Experiment A: NUBes-PHI**
- Detection(민감/비민감 이진 분류) 시나리오에서 BERT가 경쟁 시스템을 능가:
  - "BERT outperforms its competitors. ... it obtains a remarkably higher recall. Noticeably, it reaches a recall of 0.979, improving by more than 4 points the second-best system, spaCy." — Results ::: Experiment A
  - 단, "BERT achieves a precision lower than the rest of the systems (i.e., it makes more false positive predictions)" (precision는 상대적으로 낮음)
- 엔티티 타입(relaxed) 시나리오: "BERT gaining 2.1 points of F1-score over the CRF based approach." — Results ::: Experiment A
- Strict 분류 시나리오: "BERT's F1-score is 1.9 points higher than the next most competitive result ... the recall obtained by BERT is about 5 points above." — Results ::: Experiment A
- 학습데이터 축소 견고성: "With 1% of the dataset (230 training instances), the BERT-based model only suffers a striking 7-point F1-score loss, in contrast to the 32 and 39 points lost by the CRF and spaCy models." — Results ::: Experiment A

**Experiment B: MEDDOCAN**
- "BERT outperforming both the CRF and spaCy classifiers thanks to its greater recall." — Results ::: Experiment B
- 대회 우승 시스템(NLNDE) 대비: "the BERT-based model has not improved the scores obtained by neither the domain-dependent (S3) nor the domain-independent (S2) NLNDE model. However ... BERT remains only 0.3 F1-score points behind, and would have achieved the second position." — Results ::: Experiment B

**요약 (Conclusions):**
- "the BERT-based model outperforms the other systems without requiring any adaptation or domain-specific feature engineering ... obtains a remarkably higher recall" (NUBes-PHI)
- "the BERT-based model falls 0.3 F1-score points behind the shared task winning system, but it would have achieved the second position" (MEDDOCAN)

**참고(빠진 부분):** precision·recall·F1의 절대 수치 전체는 "Table"들에 정리되어 있다고 서술되나, 해당 표들은 제공된 텍스트에 포함되어 있지 않아 위에 인용된 개별 언급 값(recall 0.979 등)과 상대적 비교치만 확인 가능합니다.

### single-llm (10.6s)

**답:** NUBes-PHI에서는 BERT가 다른 시스템들을 모두 능가했고(탐지 시나리오 recall 0.979, strict F1이 차순위보다 1.9점 높음), MEDDOCAN에서는 우승 시스템(NLNDE)에 F1 0.3점 뒤졌으며, 학습 데이터를 1%(230건)로 줄여도 F1 손실이 7점에 그치는 강건성을 보였습니다.

**근거:**
- "it can be observed that BERT outperforms its competitors ... it reaches a recall of 0.979, improving by more than 4 points the second-best system, spaCy."
- "BERT outperforms them again. BERT's F1-score is 1.9 points higher than the next most competitive result ... the recall obtained by BERT is about 5 points above."
- "the BERT-based model has not improved the scores obtained by neither the domain-dependent (S3) nor the domain-independent (S2) NLNDE model. However ... BERT remains only 0.3 F1-score points behind, and would have achieved the second position."
- "the BERT-based model only suffers a striking 7-point F1-score loss, in contrast to the 32 and 39 points lost by the CRF and spaCy models."

---

## q0010 — Massively Multilingual Neural Grapheme-to-Phoneme Conversion

**질문:** how is model compactness measured?

**gold (free_form):** Using file size on disk

<details><summary>gold evidence</summary>

> Even if LangID-High does not present a more accurate result, it does present a more compact one: LangID-High is 15.4 MB, while the combined wFST high resource models are 197.5 MB.

</details>

### agent-evidence (8.4s)

**결론:** 있음 — 모델의 compactness(간결성)는 **모델 파일의 저장 용량(MB)** 으로 측정됩니다.

**근거:**
- "Even if LangID-High does not present a more accurate result, it does present a more compact one: **LangID-High is 15.4 MB, while the combined wFST high resource models are 197.5 MB.**" — High Resource Results 섹션 마지막 문단
- Abstract에서도 이 지표를 언급: "Our model is also **much more compact** relative to previous approaches." — Abstract

**보충:** compactness는 별도의 정량 지표(예: 파라미터 수)로 정의되지 않고, 두 시스템의 **디스크상 모델 크기(15.4 MB vs. 197.5 MB)** 를 직접 비교하는 방식으로만 제시됩니다.

### single-llm (5.2s)

**답:** 모델 파일 크기(MB)로 측정한다 — LangID-High는 15.4 MB, wFST 고자원 모델 합계는 197.5 MB.

**근거:** "it does present a more compact one: LangID-High is 15.4 MB, while the combined wFST high resource models are 197.5 MB."

---

## q0011 — Abstractive Summarization for Low Resource Data using Domain Transfer and Data Synthesis

**질문:** Who were the human evaluators used?

**gold (extractive):** 20 evaluators were recruited from our institution and asked to each perform 20 annotations

<details><summary>gold evidence</summary>

> . While automated evaluation metrics like ROUGE measure lexical similarity between machine and human summaries, humans can better measure how coherent and readable a summary is. Our evaluation study investigates whether tuning the PG-net model increases summary coherence, by asking evaluators to select which of three summaries for the same document they like most: the PG-net model trained on CNN/DM; the model trained on student reflections; and finally the model trained on CNN/DM and tuned on student reflections. 20 evaluators were recruited from our institution and asked to each perform 20 annotations. Summaries are presented to evaluators in random order. Evaluators are then asked to select the summary they feel to be most readable and coherent.

</details>

### agent-evidence (8.2s)

**결론:** 있음 — 저자 소속 기관에서 모집한 20명의 평가자입니다.

**근거:**
- "20 evaluators were recruited from our institution and asked to each perform 20 annotations." — Results 장, Human Evaluation Results 문단
- "They choose the summary that is most coherent and readable, regardless of the source of the summary." — 같은 문단 (평가자는 reflection이나 reference summary를 읽지 않고, 세 요약 중 가장 읽기 쉽고 일관된 것을 선택)

**보충:** 문서는 평가자들이 "저자의 소속 기관(our institution)에서 모집"되었다고만 밝히며, 구체적인 신원·전공·자격 등 추가 정보는 제공하지 않습니다.

### single-llm (5.3s)

**답:** 저자들의 소속 기관에서 모집한 평가자 20명 (각자 20건씩 평가 수행)

**근거:** "20 evaluators were recruited from our institution and asked to each perform 20 annotations."

---

## q0012 — Extreme Language Model Compression with Optimal Subwords and Shared Projections

**질문:** Why are prior knowledge distillation techniques models are ineffective in producing student models with vocabularies different from the original teacher models?

**gold (extractive):** While there has been existing work on reducing NLP model vocabulary sizes BIBREF15, distillation techniques cannot utilize these, since they require the student and teacher models to share the same vocabulary and output space. This profoundly limits their potential to further reduce model sizes.

<details><summary>gold evidence</summary>

> However, a significant bottleneck that has been overlooked by previous efforts is the input vocabulary size and its corresponding word embedding matrix, often accounting for a significant proportion of all model parameters. For instance, the embedding table of the BERTBASE model, comprising over 30K WordPiece tokens BIBREF14, accounts for over $21\%$ of the model size. While there has been existing work on reducing NLP model vocabulary sizes BIBREF15, distillation techniques cannot utilize these, since they require the student and teacher models to share the same vocabulary and output space. This profoundly limits their potential to further reduce model sizes.

</details>

### agent-evidence (16.4s)

**결론:** 있음 — 기존 지식 증류(KD) 기법은 학생 모델과 교사 모델이 **동일한 어휘(vocabulary)와 출력 공간(output space)을 공유해야 하는 요구조건**을 전제로 작동하기 때문에, 어휘가 다르면 두 모델의 출력이 정렬(align)되지 않아 적용이 불가능합니다.

**근거:**

- "distillation techniques cannot utilize these, since they require the student and teacher models to share the same vocabulary and output space." — Introduction, 세 번째 문단 (어휘 축소 연구를 언급하며). 
  → 핵심 이유: KD 기법이 학생·교사가 **같은 어휘와 출력 공간을 공유할 것을 요구**하기 때문.

- "since the student vocabulary is not a complete subset of the teacher vocabulary, the two vocabularies may tokenize the same words differently. As a result, the outputs of the teacher and student model for the masked language modeling task may not align. ... the change in embedding dimension precludes existing knowledge distillation techniques, **which rely on the alignment of both models' output spaces.**" — Methodology ::: Optimal Subword Embeddings via Knowledge Distillation, 세 번째 문단.
  → 세부 메커니즘: 어휘가 다르면 같은 단어를 다르게 토큰화해 **교사·학생의 출력이 정렬되지 않으며**, 기존 KD는 이 출력 공간 정렬에 의존하므로 무력화됨. 또한 임베딩 차원 변화도 걸림돌.

- "these approaches are not immediately applicable to our setting **due to incompatible teacher and student model vocabularies**, and do not focus sufficiently on the embedding matrix size." — Related Work, 마지막 문단 (BERT 압축 관련 선행연구 BIBREF33, BIBREF34 논의).
  → 선행 KD 기반 BERT 압축 기법들도 어휘 비호환성 때문에 곧바로 적용 불가.

**요약:** 기존 KD는 교사·학생이 (1) 같은 어휘, (2) 같은 출력 공간을 공유한다는 전제 위에서 소프트 라벨 분포/중간 출력을 정렬시키는 방식이므로, 어휘가 다르면 동일 단어의 토큰화가 달라 출력이 정렬되지 않아 이러한 정렬 기반 기법이 성립하지 않습니다.

### single-llm (5.9s)

**답:** 학생 모델과 교사 모델이 동일한 어휘(vocabulary)와 출력 공간(output space)을 공유해야 하기 때문에, 어휘가 다르면 두 모델의 출력이 정렬되지 않아 기존 지식 증류 기법을 적용할 수 없습니다.

**근거:** "distillation techniques cannot utilize these, since they require the student and teacher models to share the same vocabulary and output space." 또한 "the change in embedding dimension precludes existing knowledge distillation techniques, which rely on the alignment of both models' output spaces."

---

## q0013 — Stereotyping and Bias in the Flickr30K Dataset

**질문:** What is the size of the dataset?

**gold (extractive):** 30,000

<details><summary>gold evidence</summary>

> The Flickr30K dataset BIBREF0 is a collection of over 30,000 images with 5 crowdsourced descriptions each. It is commonly used to train and evaluate neural network models that generate image descriptions (e.g. BIBREF2 ).
> This paper aims to give an overview of linguistic bias and unwarranted inferences resulting from stereotypes and prejudices. I will build on earlier work on linguistic bias in general BIBREF3 , providing examples from the Flickr30K data, and present a taxonomy of unwarranted inferences. Finally, I will discuss several methods to analyze the data in order to detect biases.

</details>

### agent-evidence (9.1s)

**결론:** 있음 — Flickr30K 데이터셋은 3만 장이 넘는 이미지로 구성되며, 각 이미지마다 5개의 크라우드소싱 설명이 붙어 있습니다.

**근거:**
- "The Flickr30K dataset BIBREF0 is a collection of over 30,000 images with 5 crowdsourced descriptions each." — Introduction, 첫 문단
- 초록에서도 동일하게 언급: "the crowdsourced descriptions of the images in the Flickr30K dataset ... over 30,000 images with 5 ... descriptions each" (Abstract / Introduction)

**참고:** 데이터셋 전체 규모는 위와 같이 "3만 장 이상 이미지 × 각 5개 설명"입니다. 다만 본문 중 'baby' 관련 분석에서는 하위 집합으로 "the 697 pictures with the word `baby' in it"(Ethnicity/race 섹션)이라는 부분 규모도 언급되나, 이는 데이터셋 전체 크기가 아니라 특정 분석 대상 이미지 수입니다.

### single-llm (4.7s)

**답:** 30,000장이 넘는 이미지에 각 이미지당 5개의 크라우드소싱 설명이 달린 데이터셋입니다.

**근거:** "The Flickr30K dataset BIBREF0 is a collection of over 30,000 images with 5 crowdsourced descriptions each."

---

## q0014 — Improving Implicit Discourse Relation Classification by Modeling Inter-dependencies of Discourse Units in a Paragraph

**질문:** What discourse relations does it work best/worst for?

**gold (extractive):** explicit discourse relations

<details><summary>gold evidence</summary>

> the basic model yields good performance for recognizing explicit discourse relations as well, which is comparable with previous best result (92.05% macro F1-score and 93.09% accuracy as reported in BIBREF11 ).
> After untying parameters in the softmax prediction layer, implicit discourse relation classification performance was improved across all four relations, meanwhile, the explicit discourse relation classification performance was also improved.
> Then we also created ensemble models by applying majority voting to combine results of ten runs. From table 5 , each ensemble model obtains performance improvements compared with single model. The full model achieves performance boosting of (51.84 - 48.82 = 3.02) and (94.17 - 93.21 = 0.96) in macro F1-scores for predicting implicit and explicit discourse relations respectively.

</details>

### agent-evidence (21.8s)

**결론:** 부분적으로 있음 — 문서에 각 관계별 절대 성능(정확한 최고/최저) 수치표(Table 3~5)는 본문에 포함돼 있지 않지만, **어떤 관계에서 성능이 낮고/개선이 큰지**에 대한 서술은 있습니다.

**근거:**

- **성능이 낮은(어려운) 관계 — 세 개의 소수 클래스:**
  - "the performance on the three small classes (Comp, Cont and Temp) remains low." — Experimental Results(Multi-way Classification, 첫 문단)
  - 즉 Comparison·Contingency·Temporal이 성능이 낮은(worst) 쪽이며, 반대로 큰 클래스인 **Expansion**이 상대적으로 잘 되는 관계로 시사됩니다. (단, Expansion을 "가장 잘 된다"고 명시한 문장은 없음.)

- **모델이 개선 효과를 가장 크게 내는 관계:**
  - "improved implicit relation classification performance across the three small classes, with clear performance gains of around **2 and 8 percents on contingency and temporal relations** respectively" — Experimental Results(Multi-way, 세 번째 문단)
  - "on the **contingency relation**, the classification performance was improved by another 1.42 percents" — 같은 절
  - "the CRF layer further improved implicit discourse relation recognition performance on **the three small classes**." — 같은 절

- **이진 분류에서의 개선 폭(가장 큰 향상):**
  - "achieves F1-score improvements of **6 points on Comparison and 7 points on Temporal**, which demonstrates that paragraph-wide contexts are important in detecting minority discourse relations." — Experimental Results(Binary Classification)

**정리 / 빠진 부분:**
- "가장 잘 되는/못 되는 관계"를 **절대 F1 값으로 순위 매긴 표(Table 3·4)** 자체는 제공된 텍스트에 수치로 나타나 있지 않습니다.
- 본문 서술 기준으로는, **Comparison·Contingency·Temporal**(소수 클래스)이 절대 성능은 낮고 어려운 관계이며, 동시에 이 모델(문단 단위 문맥)이 **가장 큰 향상**을 보이는 관계이기도 합니다. **Expansion**(다수 클래스)은 상대적으로 성능이 높은 것으로 시사되지만 명시적 언급은 없습니다.

### single-llm (11.2s)

**답:** 임플리시트 관계 중에서는 다수 클래스인 Expansion에서 가장 좋고, 소수 클래스인 Comparison·Contingency·Temporal에서 상대적으로 성능이 낮으며, 문단 단위 모델의 개선 효과는 이 소수 클래스(특히 Comparison과 Temporal)에서 가장 크게 나타납니다. 전체로 보면 explicit 관계 예측이 implicit보다 훨씬 좋습니다.

**근거:**
- "the performance on the three small classes (Comp, Cont and Temp) remains low."
- "this model improved implicit relation classification performance across the three small classes, with clear performance gains of around 2 and 8 percents on contingency and temporal relations respectively"
- 이진 분류에서: "our paragraph-level model with untied parameters in the prediction layer achieves F1-score improvements of 6 points on Comparison and 7 points on Temporal, which demonstrates that paragraph-wide contexts are important in detecting minority discourse relations."
- explicit이 implicit보다 훨씬 높음: implicit 최고 "macro-average F1-score of 48.82%", explicit는 "comparable with previous best result (92.05% macro F1-score and 93.09% accuracy)".

(참고: 논문은 Comp/Cont/Temp를 "small/minority classes"로, Expansion을 다수 클래스로 취급하나, Expansion 자체의 절대 성능 최고 여부를 명시적 수치로 단정하지는 않습니다.)

---

## q0015 — Knowledge Based Machine Reading Comprehension

**질문:** Where is a question generation model used?

**gold (extractive):** The question generation model provides each candidate answer with a score by measuring semantic relevance between the question and the generated question based on the semantics of the candidate answer.

<details><summary>gold evidence</summary>

> The question generation model provides each candidate answer with a score by measuring semantic relevance between the question and the generated question based on the semantics of the candidate answer.

</details>

### agent-evidence (15.1s)

**결론:** 있음 — 질문 생성(question generation) 모델은 본 논문에서 제안하는 프레임워크의 두 축 중 하나로, **후보 답변을 채점(랭킹)하는 데** 사용됩니다.

**근거:**

- "Our framework consists of a question answering model and a question generation model." — Approach Overview, 첫 문장. (전체 프레임워크의 구성 요소로 사용됨)

- "The question generation model provides each candidate answer with a score by measuring semantic relevance between the question and the generated question based on the semantics of the candidate answer." — Introduction, 프레임워크 설명 문단. (후보 답변 채점에 사용)

- "We then implement a generation-based model. The motivation to design this model is that we want to associate natural language phrases with knowledge based representation. It takes semantics of a candidate answer as the input and generates a question $\hat{q}$. Then a paraphrasing model gives a score $f_{qg}(q,\hat{q})$ ... as the ranking score." — Approach Overview, 세 번째 문단. (후보 답변의 의미를 입력으로 질문을 생성하고, 그 결과를 랭킹 점수로 사용)

- 최종 랭킹 점수 $S(q,a) = \lambda f_{qa}(q, a) + (1-\lambda ) f_{qg}(q,\hat{q})$ — Approach Overview, (Eq. 7). (질문 생성 모델의 점수 $f_{qg}$가 최종 답변 랭킹에 결합됨)

- "In this section, we present the generation model which generates a question based on the semantics of a candidate answer." — The Question Generation Model 섹션 도입부.

**보충:** 실험에서는 이 모델이 QGNet(질문 생성 모델 + paraphrasing 모델)으로 평가되며, "combining outcomes with them could generate 1.5% and 0.8% absolute gains"처럼 QA 모델과 결합해 정확도를 높이는 데 사용됩니다(Analysis: Generative Models 섹션).

요약하면, 질문 생성 모델은 **문서 기반 지식 MRC 프레임워크 안에서 후보 답변에 점수를 매겨(생성된 질문과 원 질문의 의미적 유사도를 통해) 답변 랭킹에 기여하는 용도**로 사용됩니다.

### single-llm (8.8s)

**답:** 저자들이 구현한 프레임워크에서, 후보 답의 의미를 입력받아 질문을 생성하고 이를 원 질문과 비교해 후보 답의 순위를 매기는 랭킹 점수 계산에 사용됩니다.

**근거:** "Our framework consists of a question answering model and a question generation model." / "It takes semantics of a candidate answer as the input and generates a question $\hat{q}$. Then a paraphrasing model gives a score $f_{qg}(q,\hat{q})$ ... as the ranking score."

---

## q0016 — Assessing BERT's Syntactic Abilities

**질문:** Were any of these tasks evaluated in any previous work?

**gold (yes_no):** Yes

<details><summary>gold evidence</summary>

> All cases exhibit high scores—in the vast majority of the cases substantially higher than reported in previous work.
> In particular, in BIBREF1 we assess the ability of LSTMs to learn subject-verb agreement patterns in English, and evaluate on naturally occurring wikipedia sentences.
> BIBREF2 also consider subject-verb agreement, but in a “colorless green ideas” setting in which content words in naturally occurring sentences are replaced with random words with the same part-of-speech and inflection, thus ensuring a focus on syntax rather than on selectional-preferences based cues.
> BIBREF3 consider a wider range of syntactic phenomena (subject-verb agreement, reflexive anaphora, negative polarity items) using manually constructed stimuli, allowing for greater coverage and control than in the naturally occurring setting.

</details>

### agent-evidence (15.5s)

**결론:** 있음 — 본 논문이 사용한 세 가지 과제(자연 발생 주술 일치, "colorless green ideas" 주술 일치, 수작업 제작 주술 일치·재귀 대용어 자극)는 모두 이전 연구(BIBREF1, BIBREF2, BIBREF3)에서 먼저 평가되었습니다. 다만 이전 연구들은 LSTM/RNN 등 단방향 언어모델로 수행한 것이고, 본 논문은 그 자극(stimuli)을 BERT용으로 적응시켜 재평가했습니다.

**근거:**
- "I use the stimuli provided by BIBREF1 , BIBREF2 , BIBREF3 , but change the experimental protocol to adapt it to the bidirectional nature of the BERT model." — Methodology (본 연구가 이전 연구의 자극을 그대로 사용함을 명시)

- "in BIBREF1 we assess the ability of LSTMs to learn subject-verb agreement patterns in English, and evaluate on naturally occurring wikipedia sentences." — Introduction, 두 번째 문단 (자연 발생 주술 일치 과제의 선행 평가)

- "BIBREF2 also consider subject-verb agreement, but in a 'colorless green ideas' setting in which content words in naturally occurring sentences are replaced with random words with the same part-of-speech and inflection" — Introduction, 두 번째 문단 (colorless green ideas 과제의 선행 평가)

- "BIBREF3 consider a wider range of syntactic phenomena (subject-verb agreement, reflexive anaphora, negative polarity items) using manually constructed stimuli" — Introduction, 두 번째 문단 (수작업 자극 과제의 선행 평가)

- "All three previous work use uni-directional language-model-like models." — Previous setups, 첫 문장 (세 과제 모두 이전 연구에서 단방향 모델로 평가되었음을 요약)

**보충:** 결과는 직접 비교 가능하지 않습니다 — "The BERT results are not directly comparable to the numbers reported in previous work."(Adaptation to the BERT model). 즉 과제 자체는 이전 연구에서 평가되었으나, 양방향성·자극 일부 제외·상이한 학습 코퍼스 때문에 수치를 1:1로 비교할 수는 없습니다.

### single-llm (6.3s)

**답:** 예 — 이 과제들(주어-동사 일치, 재귀 대용어 등)은 모두 이전 연구(BIBREF1, BIBREF2, BIBREF3)에서 이미 평가되었습니다.

**근거:** "I use the stimuli provided by BIBREF1 , BIBREF2 , BIBREF3 , but change the experimental protocol"; "In particular, in BIBREF1 we assess the ability of LSTMs to learn subject-verb agreement patterns... BIBREF2 also consider subject-verb agreement... BIBREF3 consider a wider range of syntactic phenomena (subject-verb agreement, reflexive anaphora, negative polarity items)"

---

## q0017 — Stateology: State-Level Interactive Charting of Language, Feelings, and Values

**질문:** Which demographic dimensions of people do they obtain?

**gold (extractive):** occupation; industry; profile information; language use; gender

<details><summary>gold evidence</summary>

> Starting with this list, we can locate the profile page for a user, and subsequently extract additional information, which includes fields such as name, email, occupation, industry, and so forth.
> We also generate two maps that delineate the gender distribution in the dataset.
> Our dataset provides mappings between location, profile information, and language use, which we can leverage to generate maps that reflect demographic, linguistic, and psycholinguistic properties of the population represented in the dataset.

</details>

### agent-evidence (12.7s)

**결론:** 있음 — 문서는 블로거의 **거주 지역(주/도시), 성별, 산업(Industry) 분야, 직업(occupation)** 등의 인구통계학적 차원을 확보합니다.

**근거:**

- **위치(주/도시 밀도)**: "The first map we generate depicts the distribution of the bloggers in our dataset across the U.S. ... the density of users in our dataset in each of the 50 states." 및 "the cities mentioned most often in our dataset" — *People Maps, 첫·둘째 문단*

- **성별(Gender)**: "We also generate two maps that delineate the gender distribution in the dataset. ... out of 153,209 users who self-reported their gender, only 52,725 are men and 100,484 are women." — *People Maps, 셋째 문단*

- **산업(Industry) 분야**: "Another profile element that can lead to interesting maps is the Industry field ... we created different maps that plot the geographical distribution of industries across the country." — *People Maps, 넷째 문단*

- **직업(occupation) 등 프로필 필드**: "we can locate the profile page for a user, and subsequently extract additional information, which includes fields such as name, email, occupation, industry, and so forth." — *Data Collection, 둘째 문단*

**참고:** 프로필에서 name, email 등도 추출되지만, 실제로 인구통계 **지도(map)로 시각화·분석**한 차원은 위치(주/도시), 성별, 산업 분야입니다(People Maps 섹션). Introduction에서도 "maps of the U.S. that reflect user demographics, language use, and distributions of psycholinguistic and semantic word classes"라고 명시합니다.

### single-llm (5.3s)

**답:** 성별(gender), 산업 분야(Industry), 그리고 지리적 위치/거주 주(state location).

**근거:** "out of 153,209 users who self-reported their gender, only 52,725 are men and 100,484 are women" / "Another profile element that can lead to interesting maps is the Industry field ... the percentage of the users in each state working in the automotive and tourism industries" / "we identified 197,527 bloggers with state location information."

---

## q0018 — Medication Regimen Extraction From Clinical Conversations

**질문:** What is the baseline?

**gold (extractive):** QA PGNet; Multi-decoder QA PGNet with lookup table embedding

<details><summary>gold evidence</summary>

> We consider QA PGNet and Multi-decoder QA PGNet with lookup table embedding as baseline models and improve on the baselines with other variations described below.

</details>

### agent-evidence (12.9s)

**결론:** 있음 — 논문의 baseline은 크게 두 종류로, ① 룩업테이블 임베딩을 쓴 QA PGNet / Multi-decoder QA PGNet(학습 기반 baseline)과 ② Dosage·Frequency 각각에 대한 naive baseline(`Nearest Number`, `Random Top-3`)입니다.

**근거:**

- "We consider QA PGNet and Multi-decoder QA PGNet with lookup table embedding as baseline models and improve on the baselines with other variations described below." — Experiments ::: Model variations (첫 문단). → 룩업테이블 임베딩 기반 모델이 baseline.

- "Apart from learning-based baselines, we also create two naive baselines, one each for the Dosage and Frequency extraction tasks. For Dosage extraction, the baseline we consider is `Nearest Number', where we take the number nearest to the Medication Name as the prediction... For Frequency extraction, the baseline we consider is `Random Top-3' where we predict a random Frequency tag, from top-3 most frequent ones from our dataset - {`none', `daily', `twice a day'}." — Experiments ::: Model variations (둘째 문단). → 두 개의 naive baseline(작업별 1개씩).

- (참고) baseline 성능 수치: "improve our baseline's dosage and frequency extractions ROUGE-1 F1 scores from 54.28 and 37.13 to 89.57 and 45.94, respectively." — Abstract 및 Introduction. → baseline의 Dosage/Frequency ROUGE-1 F1이 각각 54.28, 37.13.

**요약:** "baseline"은 (1) **룩업테이블 임베딩을 사용한 QA PGNet 및 Multi-decoder QA PGNet**(학습 기반 baseline)과 (2) **Dosage용 `Nearest Number`, Frequency용 `Random Top-3`** 라는 두 개의 naive baseline을 가리킵니다.

### single-llm (7.6s)

**답:** 학습 기반 베이스라인은 lookup table 임베딩을 사용한 QA PGNet 및 Multi-decoder QA PGNet이며, 그 외에 도지지(Dosage)용 `Nearest Number`와 빈도(Frequency)용 `Random Top-3` 두 개의 나이브(naive) 베이스라인이 있습니다.

**근거:** "We consider QA PGNet and Multi-decoder QA PGNet with lookup table embedding as baseline models" / "For Dosage extraction, the baseline we consider is `Nearest Number' ... For Frequency extraction, the baseline we consider is `Random Top-3' where we predict a random Frequency tag, from top-3 most frequent ones from our dataset - {`none', `daily', `twice a day'}."

---

## q0019 — Hierarchical Transformers for Long Document Classification

**질문:** What datasets did they use for evaluation?

**gold (extractive):** CSAT dataset; 20 newsgroups; Fisher Phase 1 corpus

<details><summary>gold evidence</summary>

> We evaluated our models on 3 different datasets:  CSAT dataset for CSAT prediction, consisting of spoken transcripts (automatic via ASR).  20 newsgroups for topic identification task, consisting of written text;  Fisher Phase 1 corpus for topic identification task, consisting of spoken transcripts (manual);

</details>

### agent-evidence (9.8s)

**결론:** 있음 — 세 개의 데이터셋(CSAT, 20 Newsgroups, Fisher Phase 1)을 평가에 사용했습니다.

**근거:**
- "We evaluated our models on 3 different datasets: CSAT dataset for CSAT prediction, consisting of spoken transcripts (automatic via ASR). 20 newsgroups for topic identification task, consisting of written text; Fisher Phase 1 corpus for topic identification task, consisting of spoken transcripts (manual);" — **Experiments 섹션 도입부**
- "We evaluated our experiments on two classification tasks - customer satisfaction prediction and topic identification - using 3 datasets: CSAT, 20newsgroups and Fisher." — **Conclusions, 두 번째 문장**

**세부 정리:**
- **CSAT** — 콜센터 영어 전화 음성의 ASR 전사문. 고객 만족도(CSAT) 예측용 이진 분류. 총 4,331통(학습 2,866 / 검증 362 / 테스트 1,103). *(Experiments ::: CSAT)*
- **20 Newsgroups** — 20개 주제의 영어 문서 약 20,000건(학습 11,314 / 테스트 7,532). 주제 식별용. *(Experiments ::: 20 newsgroups)*
- **Fisher Phase 1** — 두 사람 간 10분 길이 전화 대화의 (수동) 전사문, 40개 주제 식별. 학습 1,374 / 테스트 1,372. *(Experiments ::: Fisher)*

### single-llm (5.6s)

**답:** CSAT, 20 newsgroups, Fisher Phase 1 세 개의 데이터셋을 평가에 사용했습니다.

**근거:** "We evaluated our models on 3 different datasets: CSAT dataset for CSAT prediction, consisting of spoken transcripts (automatic via ASR). 20 newsgroups for topic identification task, consisting of written text; Fisher Phase 1 corpus for topic identification task, consisting of spoken transcripts (manual);"

---

## q0020 — Data Collection for Interactive Learning through the Dialog

**질문:** How was this data collected?

**gold (extractive):** CrowdFlower

<details><summary>gold evidence</summary>

> Therefore, we used the crowdsourcing platform CrowdFlower (CF) for our data collection.

</details>

### agent-evidence (14.2s)

**결론:** 있음 — 데이터는 크라우드소싱 플랫폼 CrowdFlower(CF)에서 작업자들이 챗봇형 인터페이스를 통해 3단계 대화(질문 패러프레이즈 → 설명 → 답변)를 수행하는 방식으로 수집되었고, 이후 전문 주석자가 라벨링했습니다.

**근거:**

- "However, getting access to systems with real users is usually hard. Therefore, we used the crowdsourcing platform CrowdFlower (CF) for our data collection." — Dataset Collection Process, 두 번째 문단

- "A CF worker gets a task instructing them to use our chat-like interface to help the system with a question which is randomly selected from training examples of Simple questions ... dataset." — Dataset Collection Process, 세 번째 문단

- "To complete the task user has to communicate with the system through the three phase dialog discussing question paraphrase ..., explanation ... and answer of the question ..." — Dataset Collection Process, 세 번째 문단 (3단계: Question Paraphrasing / Question Explanation / Question Answer)

- "To avoid poor English level of dialogs we involved CF workers from English speaking countries only. The collected dialogs has been annotated ... by expert annotators afterwards." — Dataset Collection Process, 세 번째 문단

**보충 세부사항 (문서 내 근거):**
- 대화 주제(질문)는 Simple questions 데이터셋의 학습 예시에서 무작위로 선택 ("Topics discussed in dialogs are questions randomly chosen from training examples of Simple questions ... dataset." — Dataset Properties).
- 수집된 최종 규모는 1900개 대화, 8533턴 ("We collected the dataset with 1900 dialogs and 8533 turns." — Dataset Properties).
- 수집 중 사용자 발화의 dialog act 인식은 수작업 규칙(템플릿·키워드 스포팅)으로 처리 ("Parsing of the dialog acts is made by hand written rules using templates and keyword spotting." — NLU).
- 최종 데이터셋은 Creative Commons 4.0 BY-SA 라이선스로 lindat에 공개 (Conclusion).

### single-llm (7.3s)

**답:** 크라우드소싱 플랫폼 CrowdFlower(CF)에서 영어권 국가 작업자들이 채팅형 인터페이스로 시스템과 3단계 대화(패러프레이즈·설명·답변)를 진행하여 수집했고, 이후 전문 annotator가 주석을 달았습니다.

**근거:** "we used the crowdsourcing platform CrowdFlower (CF) for our data collection. A CF worker gets a task instructing them to use our chat-like interface to help the system with a question which is randomly selected from training examples of Simple questions ... communicate with the system through the three phase dialog discussing question paraphrase ..., explanation ... and answer of the question ... we involved CF workers from English speaking countries only. The collected dialogs has been annotated ... by expert annotators afterwards."
