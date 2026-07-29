# judge 사람 검증 — 무작위 15건 (seed=42)

각 항목의 "사람 판정" 칸을 직접 채워 judge와의 일치율을 계산하세요.

---

## 1. q0059 / single-llm

**질문:** What results do they achieve using their proposed approach?

**gold (free_form):** F-1 score on the OntoNotes is 88%, and it is 53% on Wiki (gold).

**다른 gold 주석:** F-1 score on the OntoNotes is 88%, and it is 53% on Wiki (gold). ⟋ total F-1 score on the OntoNotes dataset is 88%; total F-1 cross-validation score on the 112 class Wiki(gold) dataset is 53%

**시스템 출력:**

**답:** OntoNotes에서 전체 F-1 88%, 112개 클래스 Wiki(gold) 교차검증에서 전체 F-1 53%를 달성했다.

**근거:** "The total F-1 score on the OntoNotes dataset is 88%, and the total F-1 cross-validation score on the 112 class Wiki(gold) dataset is 53%."

**judge 판정:** CORRECT — 시스템 답변은 OntoNotes F-1 88%, Wiki(gold) F-1 53%라는 핵심 사실을 gold 정답과 정확히 일치하게 제시하고 있습니다.

**사람 판정:** [ CORRECT / INCORRECT ] — 

---

## 2. q0091 / single-llm

**질문:** Which text embedding methodologies are used?

**gold (extractive):** Document to Vector (Doc2Vec)

**다른 gold 주석:** Document to Vector (Doc2Vec) ⟋ Doc2Vec; PV-DBOW model

**시스템 출력:**

**답:** Doc2Vec (Paragraph Vectors, PV-DBOW / Distributed Bag of Words) 방식의 딥러닝 텍스트 임베딩을 사용합니다.

**근거:** "we train a paragraph vector model using the Document to Vector (Doc2Vec) framework ... on the whole set (13 million) of preprocessed text records" / "Distributed Bag of Words (DBOW) is a form of Paragraph Vectors (PV), also known as Doc2Vec ... Here, we use the Gensim Python library to train the PV-DBOW model."

**judge 판정:** CORRECT — 시스템 답변은 Doc2Vec(PV-DBOW 모델)을 언급하며 gold 정답과 허용된 주석 모두와 사실적으로 일치합니다.

**사람 판정:** [ CORRECT / INCORRECT ] — 

---

## 3. q0093 / agent-evidence

**질문:** By how much is performance improved with multimodality?

**gold (free_form):** F1 score increased from 0.89 to 0.92

**시스템 출력:**

**결론:** 있음 — 멀티모달을 통해 발화 단위 의도 검출은 최종 **F1 0.92**, 슬롯 필링은 **F1 0.97**까지 향상되었으며, 텍스트 전용 기준선(의도 0.89, 슬롯 0.96) 대비 개선이 있었습니다.

**근거:**
- "F1-score increased from 0.89 to 0.91 for intent recognition, from 0.96 to 0.97 for slot filling." — Experimental Results, 첫 문단(speech embeddings 실험: GloVe에 Word2Vec/Speech2Vec 결합 시)
- "Adding openSMILE/IS10 features from audio, as well as incorporating intermediate CNN/Inception-ResNet-v2 features from video brought slight improvements to our intent models, reaching 0.92 F1-score." — Experimental Results, 둘째 문단(오디오·비디오 추가 실험)
- "we achieved improved overall F1-scores of 0.92 for utterance-level intent detection and 0.97 for word-level slot filling." — Conclusion

**정리(개선 폭):**
- 의도 검출: 0.89(텍스트 전용) → 0.91(텍스트+스피치 임베딩) → **0.92**(+오디오/비디오). 즉 **약 +0.03 F1**.
- 슬롯 필링: 0.96 → **0.97**. 즉 **약 +0.01 F1**.

**보충 설명:** 오디오·비디오 특징 추가에 대해서는 본문이 "slight improvements(약간의 향상)"라고만 표현하며, 정확한 수치 증분은 위 F1 값들로부터 유추한 것입니다. 각 모달리티별 세부 수치 표(Table TABREF3, TABREF4)는 제공된 텍스트 범위에 표 자체 내용이 포함되어 있지 않습니다.

**judge 판정:** CORRECT — 시스템 답변은 F1 점수가 0.89에서 0.92로 향상되었다는 핵심 사실을 gold 정답과 동일하게 포함하고 있습니다.

**사람 판정:** [ CORRECT / INCORRECT ] — 

---

## 4. q0088 / agent-evidence

**질문:** How are meaningful chains in the graph selected?

**gold (extractive):** utilize the machinery of language modeling using deep neural networks to learn Dolores embeddings.

**다른 gold 주석:** No ⟋ utilize the machinery of language modeling using deep neural networks to learn Dolores embeddings.

**시스템 출력:**

**결론:** 있음 — 그래프에서 의미 있는 체인(entity-relation chain)은 node2vec의 2차(2nd order) 편향 랜덤워크로 생성/선택되며, 두 파라미터 p와 q로 탐색 방식을 조절합니다.

**근거:**
- "Let S denote the set of entity-relation chains obtained by doing random walks in the knowledge graph. We adopt a component of node2vec to construct S." — Dolores: Path Generator 섹션, 첫 문단
- "we perform a 2nd order random walk with two parameters p and q that determine the degree of breadth-first sampling and depth-first sampling. Specifically ... p controls the likelihood of immediately revisiting a node in the walk whereas q controls whether the walk is biased towards nodes close to starting node or away from starting node." — Path Generator 섹션 (체인 선택의 핵심 메커니즘)
- "we adopt only its first component to generate a corpus of random walks representing paths in knowledge graphs." — Path Generator 섹션 (node2vec의 임베딩 학습 부분이 아니라 랜덤워크 생성 부분만 사용)
- 보조 근거(왜 이런 체인이 의미 있는가): "a truncated random walk of length T starting from a node 'v' is analogous to a sentence and effectively captures the context of 'v' in the network." — Preliminaries 섹션

**보충 설명 (부분적 한계):**
- 체인의 **구체적 생성 설정**은 실험 부분에 있습니다: "We generate 20 chains for each node in the knowledge graph, with the length of each chain being 21 (10 relations and 11 entities appear alternately)." — Experimental Settings for Dolores 섹션
- 다만 문서는 "의미 있는(meaningful)" 체인을 별도 기준으로 **선별·필터링**한다고 명시하지는 않습니다. 대신 p·q로 편향된 랜덤워크를 통해 문맥적으로 유의미한 경로가 **생성**되도록 하는 방식입니다. 즉 별도의 선별 단계가 아니라, 랜덤워크 샘플링 자체가 문맥을 포착하는 방식으로 설계되어 있습니다. (참고로 Das et al.의 PRA 경로처럼 관계와 상관된 경로를 쓰는 방식과 달리, 본 논문은 "generic random walks"만 사용한다고 Related Work에서 구별하고 있습니다.)

**judge 판정:** INCORRECT — 시스템 답변은 node2vec의 2차 편향 랜덤워크(p, q 파라미터)로 체인을 생성한다고 설명하지만, gold 정답은 딥 신경망을 이용한 언어 모델링 기법으로 Dolores 임베딩을 학습한다는 내용으로, 두 답변이 서로 다른 사실을 제시하고 있습니다.

**사람 판정:** [ CORRECT / INCORRECT ] — 

---

## 5. q0147 / single-llm

**질문:** What type of system does the baseline classification use?

**gold (extractive):** support vector machine BIBREF18 , random forest, extra tree and naive bayes classifier BIBREF19

**다른 gold 주석:** support vector machine BIBREF18 , random forest, extra tree and naive bayes classifier BIBREF19 ⟋ Classification system use n-grams, bag-of-words, common words and hashtags as features and SVM, random forest, extra tree and NB classifiers.

**시스템 출력:**

**답:** 지도학습(supervised) 기반 분류 시스템으로, 문자·단어 수준 특징과 SVM 등의 분류기를 사용합니다.

**근거:** "Section 3 summarizes our supervised classification system which includes pre-processing of the tweets in the dataset and the feature extraction followed by the method used to identify humor in tweets." 그리고 "We experimented with four different classifiers, namely, support vector machine, random forest, extra tree and naive bayes classifier" / "We use character level and word level features for the classification".

**judge 판정:** CORRECT — 시스템 답변은 SVM, random forest, extra tree, naive bayes classifier를 언급하여 gold 정답의 핵심 분류기 목록과 일치합니다.

**사람 판정:** [ CORRECT / INCORRECT ] — 

---

## 6. q0092 / single-llm

**질문:** Which race and gender are given higher sentiment intensity predictions?

**gold (free_form):** Females are given higher sentiment intensity when predicting anger, joy or valence, but males are given higher sentiment intensity when predicting  fear.
African American names are given higher score on the tasks of anger, fear, and sadness intensity prediction,  but European American names are given higher scores on joy and valence task.

**다른 gold 주석:** Females are given higher sentiment intensity when predicting anger, joy or valence, but males are given higher sentiment intensity when predicting  fear.
African American names are given higher score on the tasks of anger, fear, and sadness intensity prediction,  but European American names are given higher scores on joy and valence task. ⟋ the number of systems consistently giving higher scores to sentences with female noun phrases; higher scores to sentences with African American names on the tasks of anger, fear, and sadness; joy and valence tasks, most submissions tended to assign higher scores to sentences with European American names

**시스템 출력:**

**답:** 유럽계 미국인(European American)이 아니라 아프리카계 미국인(African American), 그리고 여성(female)이 (감정 차원에 따라 다르지만) 대체로 더 높은 감정 강도 점수를 받았습니다. 단, 감정별로 방향이 달라 단일하게 답하기 어렵습니다.

**근거:**
- 인종: "The majority of the systems assigned higher scores to sentences with African American names on the tasks of anger, fear, and sadness intensity prediction. On the joy and valence tasks, most submissions tended to assign higher scores to sentences with European American names."
- 성별: "When predicting anger, joy, or valence, the number of systems consistently giving higher scores to sentences with female noun phrases (21–25) is markedly higher than the number of systems giving higher scores to sentences with male noun phrases (8–13)... In contrast, on the fear task, most submissions tended to assign higher scores to sentences with male noun phrases (23)."

즉, 논문은 인종·성별 모두 **감정 차원(anger/fear/joy/sadness/valence)에 따라 어느 쪽이 더 높은 점수를 받는지가 달라진다**고 밝히고 있어, 하나의 인종·성별로 단정할 수 없습니다.

**judge 판정:** CORRECT — 시스템 답변은 인종별(African American vs European American)과 성별(female vs male)로 감정 차원에 따라 다른 방향의 차이가 있다는 것을 gold 정답의 핵심 내용과 정확히 일치하게 서술하고 있습니다.

**사람 판정:** [ CORRECT / INCORRECT ] — 

---

## 7. q0061 / agent-evidence

**질문:** Is it valid to presume a bad medical wikipedia article should not contain much domain-specific jargon?

**gold (yes_no):** No

**시스템 출력:**

**결론:** 부분적으로 있음 — 문서는 "좋은(고품질) 의료 기사일수록 도메인 특화 용어(bio-medical 개념)를 더 많이 담고, 그 덕에 NLP 기반 특징이 더 잘 작동한다"고 명시적으로 서술합니다. 이는 "나쁜 기사는 도메인 특화 용어가 적다"는 추정을 **간접적으로 뒷받침**하지만, 문서가 그 명제를 직접적·일반론으로 단언하지는 않습니다.

**근거:**

- "Here, the newly introduced features have a predominant effect on the articles of the highest classes. **This could be justified by the fact that those articles contain, on average, more text and, then, NLP-based features can exploit more words belonging to a specific domain.**" — 5장 Experiments and results / Classification results (마지막 문단 부근)
  → 고품질 기사가 도메인 특화 단어(domain-specific words)를 더 많이 포함한다는 서술. 대우로 보면 저품질 기사는 그런 용어가 적다는 방향을 지지.

- "We can observe how the **Domain Informativeness feature has a considerably higher infogain value** when compared with Informativeness. We anticipate here that this will lead to a more accurate classification results for the highest classes..." — 5장 Classifiers' features
  → 도메인 정보량(도메인 어휘 사용 정도)이 품질 클래스와 유의미하게 연관됨을 뒷받침.

- "The size of an article ... appears a very strong feature, able to discriminate the articles belonging to the highest and lowest quality classes." / 기존 baseline은 "achieving good results for Stub and FA" — 5장 Classification results
  → 텍스트 분량 자체가 최저(Stub)와 최고(FA) 클래스를 구분하는 강한 신호. 도메인 어휘가 텍스트에서 추출되므로, 분량이 적은 저품질 기사는 도메인 용어도 적게 나타남을 함축.

**보충 설명 (한계):**
- 문서의 논리는 "저품질 기사 = 도메인 용어가 적다"라기보다 "**분량이 적어서** 도메인 용어가 적게 추출된다"에 가깝습니다. 즉 도메인 용어 부족이 저품질의 *원인/정의*라기보다, 분량과 상관된 *부산물*로 서술됩니다.
- 또한 저자들은 도메인 특화 특징이 주로 **최고 품질 클래스** 판별에 효과적이라고 하며, 중간 클래스(C 등) 구분은 여전히 어렵다고 밝혀(“the newly introduced features have a predominant effect on the articles of the highest classes”), "도메인 용어 부족 → 나쁜 기사"라는 단순 추정이 모든 등급에 일반화된다고는 주장하지 않습니다.

**judge 판정:** INCORRECT — 시스템 답변은 "타당한 측면도 있다"는 부분적 긍정(Partially yes)을 제시했으나, gold 정답은 명확히 "No"입니다.

**사람 판정:** [ CORRECT / INCORRECT ] — 

---

## 8. q0005 / agent-evidence

**질문:** How do they match words before reordering them?

**gold (extractive):** CFILT-preorder system

**시스템 출력:**

**결론:** 부분적으로 있음 — 문서는 "reordering(재정렬)" 자체 전에 단어를 정렬/매칭하는 별도 절차를 명시하기보다는, 소스 언어 단어를 **이중언어 사전(Google Translate 단어 번역)으로 영어 단어에 1:1 대응(word-by-word translation)** 시키는 방식을 기술합니다.

**근거:**
- "For representing English and other source languages into a common space, we translate each word in the source language into English using a bilingual dictionary (Google Translate word translation in our case)." — Experimental Setup 〉 Network
- "at test time, the source language sentence is translated using the parent model after performing a word-by-word translation into the assisting language." — Proposed Solution, 첫 문단
- 재정렬은 이렇게 매칭된(영어) 문장에 대해 규칙 기반으로 수행됨: "We use the CFILT-preorder system for reordering English sentences to match the Indian language word order." — Experimental Setup 〉 Network

**보충 설명:**
- 이 논문에서 "matching words"에 해당하는 절차는 **소스 언어 단어 → 영어 단어를 이중언어 사전으로 치환**하는 것입니다. 즉 학습 시에는 영어(assisting) 문장을 소스 언어 어순에 맞게 미리 재정렬(pre-order)하고, 테스트 시에는 소스 언어 문장의 각 단어를 사전으로 영어로 바꿔 부모 모델에 입력합니다.
- 다만, 재정렬 "직전"에 단어들을 정렬(alignment)하는 별도의 단어 정렬 알고리즘 같은 것은 문서에 서술되어 있지 않습니다. 재정렬은 파스 트리 기반 규칙(CFILT-preorder: generic rules 및 Hindi-tuned rules)으로 이루어집니다.

질문의 의도가 "단어 정렬(word alignment)"을 뜻한다면, 문서에서 명시적 단어 정렬 기법은 찾지 못했고, 대신 **이중언어 사전을 통한 단어 단위 번역/치환**이 그 역할을 합니다.

**judge 판정:** INCORRECT — 시스템 답변은 핵심 답으로 gold의 “CFILT-preorder system”이 아니라 이중언어 사전 기반 단어 번역을 제시해 정답과 사실적으로 일치하지 않습니다.

**사람 판정:** [ CORRECT / INCORRECT ] — 

---

## 9. q0094 / agent-evidence

**질문:** What is the language model combination technique used in the paper?

**gold (extractive):** system combination on the decoding lattice level; combination weights

**다른 gold 주석:** system combination on the decoding lattice level; combination weights ⟋ system combination on the decoding lattice level

**시스템 출력:**

**결론:** 부분적으로 있음 — 논문은 도메인별 n-gram 언어모델들을 **퍼플렉서티(perplexity) 기반으로 결합**하며, 디코딩 단계에서는 **래티스 레벨의 시스템 결합(가중치 보간)**을 사용한다고 밝힙니다. 다만 "combination"의 수학적 정의나 표준 기법 명칭은 제시되지 않습니다.

**근거:**
- "For each domain text data, we train an n-gram language model ... As the results, we have more than 10 language models. **These language models are combined based on perplexity calculated on a small text of a domain that we want to optimize for.**" — Language Model 섹션
- "In the first pass, the language model is combined with acoustic and lexicon model to form a full decoding graph. ... In the second stage, we use a un-pruned language model to rescore decoded lattices." — Language Model 섹션 (2-pass 디코딩)
- "To further improve the performance, we adopt **system combination on the decoding lattice level.** By combining systems, we can take advantage of the strength of each model that is optimized for different domains." — Experiments ::: System combination 섹션
- "The best result for vlsp2018 of 4.85% WER is obtained by the **combination weights 0.6:0.4** where 0.6 is given to the general language model and 0.4 is given to the conversation one. On the vlsp2019 set, the ratio is change slightly by 0.7:0.3 ..." — Experiments ::: System combination 섹션

**보충 설명:**
- 핵심 기법은 두 가지입니다: (1) 학습 단계에서 **도메인별 n-gram 모델을 퍼플렉서티 기준으로 결합**, (2) 디코딩 단계에서 **래티스 레벨 시스템 결합**을 통해 일반(general) 언어모델과 대화(conversation) 언어모델을 특정 가중치 비율(예: 0.6:0.4)로 조합.
- 다만 문서는 이 결합의 구체적 알고리즘(예: 선형 보간의 수식, 가중치 최적화 방법 등)이나 표준 명칭은 상세히 서술하지 않습니다. 이 점이 제공된 텍스트 범위에서 빠진 부분입니다.

**judge 판정:** CORRECT — 시스템 답변은 "system combination on the decoding lattice level"과 "combination weights"를 모두 명시적으로 언급하여 gold 정답과 사실적으로 일치합니다.

**사람 판정:** [ CORRECT / INCORRECT ] — 

---

## 10. q0004 / agent-evidence

**질문:** What crowdsourcing platform is used?

**gold (free_form):** They did not use any platform, instead they hired undergraduate students to do the annotation.

**시스템 출력:**

**결론:** 없음(부분적으로만 언급) — 이 논문의 크라우드소싱은 특정 온라인 플랫폼이 아니라 **학부생을 직접 고용**하여 수행했으며, 저자들이 사용한 "크라우드소싱 플랫폼"의 이름은 문서에 명시되어 있지 않습니다.

**근거:**
- "We hire undergraduate students to annotate the sentences." — Data Sets 절 첫 문단 (평가 데이터 수집 방법 설명)
- "we randomly select 20K sentences as our pool and hire **43 students** to annotate the sentences." — Data Sets 절, DL-PS 데이터 설명
- "**Five students** participate the annotations for this domain..." — Data Sets 절, EC 데이터 설명

**참고(플랫폼과 혼동 주의):**
- 문서에서 유일하게 등장하는 크라우드소싱 플랫폼 이름은 **Amazon Mechanical Turk**이지만, 이는 저자들이 사용한 것이 아니라 **선행 연구(Snow 2008)를 인용**하며 관련 연구 맥락에서 언급된 것입니다.
  - "BIBREF18 snow2008cheap collected labeled results for several NLP tasks from **Amazon Mechanical Turk**..." — Related Work 절, Crowdsourcing 문단

즉, 본 연구 자체가 사용한 크라우드소싱 플랫폼(예: AMT 등)의 이름은 **문서에서 찾지 못했습니다.** 저자들은 학부생을 직접 고용하는 방식을 택했습니다.

**judge 판정:** CORRECT — 시스템 답변은 특정 플랫폼을 사용하지 않고 학부생을 고용해 주석을 수행했다는 gold 정답과 사실적으로 일치합니다.

**사람 판정:** [ CORRECT / INCORRECT ] — 

---

## 11. q0043 / agent-evidence

**질문:** What useful information does attention capture?

**gold (extractive):** it captures other information rather than only the translational equivalent in the case of verbs

**다른 gold 주석:** it captures other information rather than only the translational equivalent in the case of verbs ⟋ Alignment points of the POS tags.

**시스템 출력:**

**결론:** 있음 — 문서는 attention이 정렬(alignment)만이 아니라 **현재 단어 번역에 영향을 주는 문맥(context) 단어들** 및 **구문적 관계(의존 관계)** 정보를 포착한다고 밝힙니다. 특히 동사(verb) 번역 시 이런 정보가 두드러집니다.

**근거:**

- "We provide evidence showing that the difference between attention and alignment is due to attention model capability to **attend the context words influencing the current word translation**." — Introduction, 기여(contributions) 4번 항목

- "attention agrees with traditional alignments to a high degree in the case of nouns. However, it **captures other information rather than only the translational equivalent in the case of verbs**." — Introduction, 분석 요약 문단

- "The low correlation for verbs confirms that **attention to other parts of source sentence rather than the aligned word is necessary for translating verbs** ... attention does not necessarily have to follow alignments." — Alignment Quality Impact on Translation

- 문맥 정보의 구체적 종류(의존 관계): "the most attended roles when translating to nouns include **adjectives and determiners** and in the case of translating to verbs, it includes **auxiliary verbs, adverbs (including negation), subjects, and objects**." — Attention Distribution, 마지막 부분 (Table TABREF33 설명)

- 대명사·불변화사(PRON/PRT)의 경우: "it deliberately pays attention to multiple, somehow relevant, places to be able to produce a better translation. The latter is supported by the relatively low word prediction losses." — Attention Concentration

- 결론부 요약: "the large portion of attention being paid to words other than alignment points, is already **capturing other relevant information**. Training attention with alignments in this case will force the attention model to forget these useful information." — Conclusion

**요약:** attention이 포착하는 유용한 정보는 (정렬된 단어를 넘어) **번역 중인 단어에 영향을 주는 주변 문맥 단어**이며, 구체적으로는 명사 번역 시 **형용사·한정사**, 동사 번역 시 **조동사·부사(부정 포함)·주어·목적어** 같은 **의존 관계 기반 문맥 정보**입니다.

**judge 판정:** CORRECT — 시스템 답변은 attention이 특히 동사의 경우 번역 등가어뿐 아니라 다른 문맥/구문 정보를 포착한다는 gold의 핵심 사실과 일치합니다.

**사람 판정:** [ CORRECT / INCORRECT ] — 

---

## 12. q0092 / agent-evidence

**질문:** Which race and gender are given higher sentiment intensity predictions?

**gold (free_form):** Females are given higher sentiment intensity when predicting anger, joy or valence, but males are given higher sentiment intensity when predicting  fear.
African American names are given higher score on the tasks of anger, fear, and sadness intensity prediction,  but European American names are given higher scores on joy and valence task.

**다른 gold 주석:** Females are given higher sentiment intensity when predicting anger, joy or valence, but males are given higher sentiment intensity when predicting  fear.
African American names are given higher score on the tasks of anger, fear, and sadness intensity prediction,  but European American names are given higher scores on joy and valence task. ⟋ the number of systems consistently giving higher scores to sentences with female noun phrases; higher scores to sentences with African American names on the tasks of anger, fear, and sadness; joy and valence tasks, most submissions tended to assign higher scores to sentences with European American names

**시스템 출력:**

**결론:** 있음 — 문서에 따르면 단일한 답은 없고 **감정 차원(task)에 따라 다릅니다.** 성별은 대체로 여성, 인종은 대체로 African American이 더 높은 점수를 받는 경향이 있으나 과제별로 방향이 달라집니다.

**근거 (성별):**
- "When predicting anger, joy, or valence, the number of systems consistently giving higher scores to sentences with female noun phrases (21–25) is markedly higher than the number of systems giving higher scores to sentences with male noun phrases (8–13)." — Gender Bias Results 섹션
- "In contrast, on the fear task, most submissions tended to assign higher scores to sentences with male noun phrases (23) as compared to the number of systems giving higher scores to sentences with female noun phrases (12)." — 같은 섹션
- "When predicting sadness, the number of submissions that mostly assigned higher scores to sentences with female noun phrases (18) is close to the number of submissions that mostly assigned higher scores to sentences with male noun phrases (16)." — 같은 섹션
- 요약: "These results are in line with some common stereotypes, such as females are more emotional, and situations involving male agents are more fearful."

**근거 (인종):**
- "The majority of the systems assigned higher scores to sentences with African American names on the tasks of anger, fear, and sadness intensity prediction. On the joy and valence tasks, most submissions tended to assign higher scores to sentences with European American names." — Race Bias Results 섹션
- "These tendencies reflect some common stereotypes that associate African Americans with more negative emotions." — 같은 섹션

**정리 (과제별 방향):**
| 과제 | 더 높은 점수 (성별) | 더 높은 점수 (인종) |
|---|---|---|
| anger | 여성 | African American |
| fear | 남성 | African American |
| joy | 여성 | European American |
| sadness | 여성≈남성(비슷) | African American |
| valence(sentiment) | 여성 | European American |

따라서 "어느 한 인종/성별이 항상 더 높다"가 아니라, **감정 유형에 따라 다르며**, 부정 감정(anger/fear/sadness)에서는 African American·(주로)여성이, 긍정 감정(joy/valence)에서는 European American·여성이 더 높은 경향을 보인다는 것이 문서의 결론입니다.

**judge 판정:** CORRECT — 시스템 답변은 성별(anger/joy/valence에서 여성, fear에서 남성)과 인종(anger/fear/sadness에서 African American, joy/valence에서 European American) 모두 gold 정답과 사실적으로 일치하는 내용을 포함하고 있습니다.

**사람 판정:** [ CORRECT / INCORRECT ] — 

---

## 13. q0062 / single-llm

**질문:** What novel PMI variants are introduced?

**gold (free_form):** clipped PMI; NNEGPMI

**다른 gold 주석:** clipped PMI; NNEGPMI ⟋ clipped $\mathit {PMI}$; $\mathit {NNEGPMI}$

**시스템 출력:**

**답:** clipped PMI ($\mathit{CPMI_z}$)와 $\mathit{NNEGPMI}$ 두 가지 변형을 새로 제안합니다.

**근거:** "Our secondary contributions are the proposal of two $PMI$ variants that account for the spectrum of $\mathit{\texttt{-}PMI}$" / "To deal with negative values, we propose clipped $\mathit{PMI}$ ... which is equivalent to $\mathit{PPMI}$ when $z = 0$." / "we introduce a variant called $\mathit{NNEGPMI}$ which only normalizes $\mathit{\texttt{-}PMI}$"

**judge 판정:** CORRECT — 시스템 답변은 clipped PMI와 NNEGPMI 두 가지 변형을 정확히 언급하며 gold 정답과 사실적으로 일치합니다.

**사람 판정:** [ CORRECT / INCORRECT ] — 

---

## 14. q0001 / agent-evidence

**질문:** which multilingual approaches do they compare with?

**gold (extractive):** BIBREF19; BIBREF20

**다른 gold 주석:** BIBREF19; BIBREF20 ⟋ multilingual NMT (MNMT) BIBREF19

**시스템 출력:**

**결론:** 있음 — 저자들은 다국어(multilingual NMT, MNMT) 접근법으로 **BIBREF19**(Google식 단일 encoder-decoder 다국어 NMT)와 **BIBREF22**(back translation을 도입한 개선된 MNMT, gu2019improved)를 비교 대상으로 사용합니다.

**근거:**
- "We compare our approaches with related approaches of pivoting, multilingual NMT (MNMT) BIBREF19, and cross-lingual transfer without pretraining BIBREF16." — Experiments ::: Main Results, 첫 문단
- "When comparing systems consisting of one encoder-decoder model for all zero-shot translation, our approaches performs significantly better than MNMT BIBREF19." — Main Results ::: Results on MultiUN Dataset
- "our best MLM+BRLM-SA with back translation outperforms pivoting$_{\rm m}$ by 2.4 BLEU points averagely, and outperforms MNMT BIBREF22 by 4.6 BLEU points averagely. ... BIBREF22 gu2019improved introduces back translation into MNMT" — Main Results ::: Results on MultiUN Dataset

**보충 설명:**
- 두 데이터셋 모두에서 기본 MNMT 기준선은 **BIBREF19**입니다.
- MultiUN에서는 추가로 back translation을 적용한 **BIBREF22(gu2019improved)** MNMT와도 비교합니다.
- 참고로 MultiUN의 pivoting$_{\rm m}$는 "MNMT를 이용해 source→pivot→target을 두 단계로 번역"하는 방식이라, MNMT를 활용한 pivot 기반 비교도 함께 제시됩니다.

문서에 구체적 논문명은 나오지 않고 인용 표기(BIBREF19, BIBREF22)로만 표시되어 있어, 실제 논문 제목은 제공된 텍스트 범위에 없습니다.

**judge 판정:** INCORRECT — 시스템 답변은 BIBREF19는 포함하지만 gold의 BIBREF20 대신 BIBREF22를 비교 대상으로 제시하여 핵심 사실이 일치하지 않습니다.

**사람 판정:** [ CORRECT / INCORRECT ] — 

---

## 15. q0053 / single-llm

**질문:** What do they mean by global and local context?

**gold (extractive):** global (the whole document); local context (e.g., the section/topic)

**다른 gold 주석:** global (the whole document); local context (e.g., the section/topic) ⟋ global (the whole document) and the local context (e.g., the section/topic)

**시스템 출력:**

**답:** 전역 문맥(global context)은 문서 전체(the whole document)의 분산 표현을 뜻하고, 지역 문맥(local context)은 해당 문장이 속한 토픽/섹션(topic/section)의 문맥 정보를 뜻합니다.

**근거:** "we propose to capture a distributed representation of both the global (the whole document) and the local context (e.g., the section/topic) when deciding if a sentence should be included in the summary" / "the local context of that sentence is captured by applying LSTM-Minus at the document level, to represent the sub-sequence of sentences of the document (i.e., the topic/section) the target sentence belongs to" / "B. Document representation The document representation provides global information on the whole document."

**judge 판정:** CORRECT — 시스템 답변은 global을 문서 전체, local context를 섹션/토픽 문맥으로 설명해 gold와 사실적으로 일치합니다.

**사람 판정:** [ CORRECT / INCORRECT ] — 
