# gold 감사 — qasper_v2 judge INCORRECT 문항 전수

> 각 문항에 대해 아래 셋 중 하나로 분류해 "감사 결과"를 채우세요.
> - **시스템 오답** — gold가 타당하고 시스템이 실제로 틀림
> - **gold 불량** — gold가 표 수치(입력에 없음)·질문 불일치·주석 누락 등으로 채점 불가
> - **judge 오판** — gold·시스템 답이 사실상 일치하는데 judge가 INCORRECT

총 23개 문항 (agent-evidence 14건, single-llm 20건)

---

## q0001 — Cross-lingual Pre-training Based Transfer for Zero-shot Neural Machine Translation

**질문:** which multilingual approaches do they compare with?

**gold (extractive):** BIBREF19; BIBREF20

**다른 gold 주석:** [object Object],[object Object]

<details><summary>gold evidence</summary>

> We compare our approaches with related approaches of pivoting, multilingual NMT (MNMT) BIBREF19, and cross-lingual transfer without pretraining BIBREF16.
> The results show that our approaches consistently outperform other approaches across languages and datasets, especially surpass pivoting, which is a strong baseline in the zero-shot scenario that multilingual NMT systems often fail to beat BIBREF19, BIBREF20, BIBREF23.

</details>

### agent-evidence — judge INCORRECT

**judge 사유:** 시스템 답변은 BIBREF19는 포함하지만 gold의 BIBREF20 대신 BIBREF22를 비교 대상으로 제시하여 핵심 사실이 일치하지 않습니다.

<details><summary>시스템 출력 전문</summary>

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

</details>

### single-llm — judge INCORRECT

**judge 사유:** 시스템 답변은 gold의 BIBREF20을 누락하고 대신 BIBREF22를 비교 대상으로 제시해 핵심 사실이 일치하지 않습니다.

<details><summary>시스템 출력 전문</summary>

**답:** MNMT (Multilingual NMT, BIBREF19)와 back translation을 도입한 MNMT (BIBREF22, gu2019improved) 두 가지 multilingual NMT 방식과 비교합니다.

**근거:** "We compare our approaches with related approaches of pivoting, multilingual NMT (MNMT) BIBREF19, and cross-lingual transfer without pretraining BIBREF16." 및 "our best MLM+BRLM-SA with back translation outperforms pivoting$_{\rm m}$ by 2.4 BLEU points averagely, and outperforms MNMT BIBREF22 by 4.6 BLEU points averagely. BIBREF22 gu2019improved introduces back translation into MNMT"

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---

## q0004 — Adversarial Learning for Chinese NER from Crowd Annotations

**질문:** What crowdsourcing platform is used?

**gold (free_form):** They did not use any platform, instead they hired undergraduate students to do the annotation.

**다른 gold 주석:** [object Object]

<details><summary>gold evidence</summary>

> With the purpose of obtaining evaluation datasets from crowd annotators, we collect the sentences from two domains: Dialog and E-commerce domain. We hire undergraduate students to annotate the sentences. They are required to identify the predefined types of entities in the sentences. Together with the guideline document, the annotators are educated some tips in fifteen minutes and also provided with 20 exemplifying sentences.

</details>

### single-llm — judge INCORRECT

**judge 사유:** 시스템 답변은 실제 사용한 플랫폼이 없고 학부생을 고용했다는 핵심 정답 대신 Amazon Mechanical Turk를 답으로 제시했습니다.

<details><summary>시스템 출력 전문</summary>

**답:** Amazon Mechanical Turk (관련 연구 인용에서만 언급됨).

**근거:** "snow2008cheap collected labeled results for several NLP tasks from Amazon Mechanical Turk and demonstrated that non-experts annotations were quite useful"

참고: 이는 관련 연구(BIBREF18)에서 언급된 플랫폼이며, 이 논문 저자들의 실제 데이터 수집은 크라우드소싱 플랫폼이 아니라 학부생을 직접 고용해 수행했습니다("We hire undergraduate students to annotate the sentences").

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---

## q0005 — Addressing word-order Divergence in Multilingual Neural Machine Translation for extremely Low Resource Languages

**질문:** How do they match words before reordering them?

**gold (extractive):** CFILT-preorder system

**다른 gold 주석:** [object Object]

<details><summary>gold evidence</summary>

> We use the CFILT-preorder system for reordering English sentences to match the Indian language word order. It contains two re-ordering systems: (1) generic rules that apply to all Indian languages BIBREF17 , and (2) hindi-tuned rules which improve the generic rules by incorporating improvements found through an error analysis of English-Hindi reordering BIBREF28 .

</details>

### agent-evidence — judge INCORRECT

**judge 사유:** 시스템 답변은 핵심 답으로 gold의 “CFILT-preorder system”이 아니라 이중언어 사전 기반 단어 번역을 제시해 정답과 사실적으로 일치하지 않습니다.

<details><summary>시스템 출력 전문</summary>

**결론:** 부분적으로 있음 — 문서는 "reordering(재정렬)" 자체 전에 단어를 정렬/매칭하는 별도 절차를 명시하기보다는, 소스 언어 단어를 **이중언어 사전(Google Translate 단어 번역)으로 영어 단어에 1:1 대응(word-by-word translation)** 시키는 방식을 기술합니다.

**근거:**
- "For representing English and other source languages into a common space, we translate each word in the source language into English using a bilingual dictionary (Google Translate word translation in our case)." — Experimental Setup 〉 Network
- "at test time, the source language sentence is translated using the parent model after performing a word-by-word translation into the assisting language." — Proposed Solution, 첫 문단
- 재정렬은 이렇게 매칭된(영어) 문장에 대해 규칙 기반으로 수행됨: "We use the CFILT-preorder system for reordering English sentences to match the Indian language word order." — Experimental Setup 〉 Network

**보충 설명:**
- 이 논문에서 "matching words"에 해당하는 절차는 **소스 언어 단어 → 영어 단어를 이중언어 사전으로 치환**하는 것입니다. 즉 학습 시에는 영어(assisting) 문장을 소스 언어 어순에 맞게 미리 재정렬(pre-order)하고, 테스트 시에는 소스 언어 문장의 각 단어를 사전으로 영어로 바꿔 부모 모델에 입력합니다.
- 다만, 재정렬 "직전"에 단어들을 정렬(alignment)하는 별도의 단어 정렬 알고리즘 같은 것은 문서에 서술되어 있지 않습니다. 재정렬은 파스 트리 기반 규칙(CFILT-preorder: generic rules 및 Hindi-tuned rules)으로 이루어집니다.

질문의 의도가 "단어 정렬(word alignment)"을 뜻한다면, 문서에서 명시적 단어 정렬 기법은 찾지 못했고, 대신 **이중언어 사전을 통한 단어 단위 번역/치환**이 그 역할을 합니다.

</details>

### single-llm — judge INCORRECT

**judge 사유:** 시스템 답변은 단어 매칭 방식으로 이중언어 사전 번역을 설명하지만, gold 정답인 “CFILT-preorder system”을 제시하지 않아 핵심 사실이 일치하지 않습니다.

<details><summary>시스템 출력 전문</summary>

**답:** 양쪽 언어 단어를 공통 공간에 나타내기 위해 이중언어 사전(구글 번역 단어 번역)으로 원본 언어의 각 단어를 영어로 번역합니다.

**근거:** "For representing English and other source languages into a common space, we translate each word in the source language into English using a bilingual dictionary (Google Translate word translation in our case)."

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---

## q0014 — Improving Implicit Discourse Relation Classification by Modeling Inter-dependencies of Discourse Units in a Paragraph

**질문:** What discourse relations does it work best/worst for?

**gold (extractive):** explicit discourse relations

**다른 gold 주석:** [object Object]

<details><summary>gold evidence</summary>

> the basic model yields good performance for recognizing explicit discourse relations as well, which is comparable with previous best result (92.05% macro F1-score and 93.09% accuracy as reported in BIBREF11 ).
> After untying parameters in the softmax prediction layer, implicit discourse relation classification performance was improved across all four relations, meanwhile, the explicit discourse relation classification performance was also improved.
> Then we also created ensemble models by applying majority voting to combine results of ten runs. From table 5 , each ensemble model obtains performance improvements compared with single model. The full model achieves performance boosting of (51.84 - 48.82 = 3.02) and (94.17 - 93.21 = 0.96) in macro F1-scores for predicting implicit and explicit discourse relations respectively.

</details>

### agent-evidence — judge INCORRECT

**judge 사유:** gold는 "explicit discourse relations"가 답인데, 시스템 답변은 Temporal/Comparison/Contingency 등 다른 관계들을 제시하여 핵심 사실이 일치하지 않습니다.

<details><summary>시스템 출력 전문</summary>

**결론:** 부분적으로 있음 — 문서는 "어떤 관계에서 가장 잘/못 하는가"를 직접 한 문장으로 명시하진 않지만, 클래스별 성능 개선 양상을 통해 **소수(minority) 클래스인 Temporal·Comparison·Contingency에서 개선 효과가 가장 크게 나타나고**, 이들 세 관계는 절대 성능 자체는 여전히 낮다는 서술이 있습니다.

**근거:**

- "the performance on the three small classes (Comp, Cont and Temp) remains low." — Experimental Results, Multi-way Classification 첫 단락. → 세 소수 클래스(Comparison, Contingency, Temporal)의 절대 성능이 가장 낮음(가장 어려운 대상).

- "this model improved implicit relation classification performance across the three small classes, with clear performance gains of around 2 and 8 percents on contingency and temporal relations respectively" — Experimental Results, Multi-way Classification. → 개선 폭은 **Temporal(약 8%)에서 가장 크고**, Contingency(약 2%)가 뒤따름.

- "the basic model further improved the classification performance on the first three implicit relations. Especially on the contingency relation, the classification performance was improved by another 1.42 percents." — Experimental Results. → 명시적 관계 추가 예측 시 Contingency 개선이 두드러짐.

- "our paragraph-level model with untied parameters in the prediction layer achieves F1-score improvements of 6 points on Comparison and 7 points on Temporal, which demonstrates that paragraph-wide contexts are important in detecting minority discourse relations." — Experimental Results, Binary Classification. → 이진 분류에서 **Comparison(+6), Temporal(+7)** 개선이 가장 큼(소수 관계 탐지에 강점).

**정리 / 빠진 부분:**
- 개선 효과가 가장 큰 관계: **Temporal, Comparison**(그리고 Contingency) — 즉 소수/어려운 관계에서 문단 단위 문맥의 이득이 가장 큼.
- 절대 성능이 여전히 낮은(=가장 어려운) 관계: **Comparison, Contingency, Temporal** 세 소수 클래스.
- 상대적으로 다수 클래스인 **Expansion**에 대해서는 "가장 잘/못한다"는 별도 서술이 없어, "어떤 관계에서 최종적으로 성능이 가장 높은가"를 명시적으로 지목하는 문장은 제공된 텍스트에 없습니다(수치 표 Table 3–4는 본문에 포함되어 있지 않음).

</details>

### single-llm — judge INCORRECT

**judge 사유:** gold는 “explicit discourse relations”라고 답하지만, 시스템 답변은 Expansion/Comparison/Contingency/Temporal 관계별 최고·최저 성능을 제시하여 핵심 사실이 일치하지 않습니다.

<details><summary>시스템 출력 전문</summary>

**답:** 확장(Expansion) 관계에서 성능이 가장 좋고, 세 개의 소수 클래스인 비교(Comparison)·조건(Contingency)·시간(Temporal) 관계에서 성능이 가장 낮습니다. 다만 문단 단위 모델의 개선 효과(이득)는 오히려 소수 관계인 Comparison·Temporal에서 가장 큽니다.

**근거:** 
- "the performance on the three small classes (Comp, Cont and Temp) remains low."
- (이진 분류에서의 개선 폭) "our paragraph-level model with untied parameters in the prediction layer achieves F1-score improvements of 6 points on Comparison and 7 points on Temporal, which demonstrates that paragraph-wide contexts are important in detecting minority discourse relations."

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---

## q0025 — Conflict as an Inverse of Attention in Sequence Relationship

**질문:** Which neural architecture do they use as a base for their attention conflict mechanisms?

**gold (free_form):** GRU-based encoder, interaction block, and classifier consisting of stacked fully-connected layers.

**다른 gold 주석:** [object Object],[object Object]

<details><summary>gold evidence</summary>

> We create two models both of which constitutes of three main parts: encoder, interaction and classifier and take two sequences as input.
> The encoder is shared among the sequences simply uses two stacked GRU layers. The interaction part consists of only attention for one model while for the another one it consists of attention and conflict combined as shown in (eqn.11) . The classifier part is simply stacked fully-connected layers.

</details>

### single-llm — judge INCORRECT

**judge 사유:** 시스템 답변은 GRU 인코더만 언급하고, gold의 핵심 구성요소인 interaction block과 stacked fully-connected classifier를 누락했습니다.

<details><summary>시스템 출력 전문</summary>

**답:** 두 개의 스택된 GRU 계층(two stacked GRU layers)을 인코더로 사용합니다.

**근거:** "The encoder is shared among the sequences simply uses two stacked GRU layers."

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---

## q0048 — Handling Divergent Reference Texts when Evaluating Table-to-Text Generation

**질문:** Ngrams of which length are aligned using PARENT?

**gold (free_form):** Answer with content missing: (Parent subsections) combine precisions for n-gram orders 1-4

**다른 gold 주석:** [object Object]

<details><summary>gold evidence</summary>

> PARENT PARENT evaluates each instance INLINEFORM0 separately, by computing the precision and recall of INLINEFORM1 against both INLINEFORM2 and INLINEFORM3 .

</details>

### agent-evidence — judge INCORRECT

**judge 사유:** gold는 PARENT가 1-4차 n-gram precision을 결합한다고 하지만, 시스템 답변은 구체적 길이를 찾을 수 없다고 했으므로 핵심 답을 누락했습니다.

<details><summary>시스템 출력 전문</summary>

**결론:** 부분적으로 있음(명시적 길이는 제공된 텍스트에 없음) — 문서는 "n-gram(차수 $n$)"을 정렬한다고만 밝히고, 구체적으로 어떤 길이(예: 1~4-gram)인지는 제공된 범위에서 특정하지 않았습니다.

**근거:**
- "PARENT (Precision And Recall of Entailed N-grams from the Table)" — Introduction (PARENT 정의). 정렬 대상이 "n-grams"임을 밝힘.
- "denote the collection of n-grams of order INLINEFORM7 in INLINEFORM8 and INLINEFORM9 ... We use INLINEFORM10 to denote the count of n-gram INLINEFORM11 ..." — Table-to-Text Generation 절. n-gram을 "차수(order) $n$"라는 변수로만 표기하고 특정 길이를 지정하지 않음.
- "PARENT evaluates each instance INLINEFORM0 separately, by computing the precision and recall of INLINEFORM1 against both INLINEFORM2 and INLINEFORM3 ." — PARENT 절. 정렬·계산 방식을 설명하지만, 이 절의 상세 수식(어떤 n 값 범위를 쓰는지)은 제공된 텍스트에서 잘려 있음.

**비고:** 정렬 대상이 "n-gram"이라는 점은 확인되나, **구체적인 n-gram 길이(범위) 값은 제공된 PARENT 절 본문·수식이 생략되어 있어 이 텍스트 범위 내에서는 찾지 못했습니다.** 해당 정보는 잘려나간 PARENT 절의 수식 부분에 있을 가능성이 있습니다.

</details>

### single-llm — judge INCORRECT

**judge 사유:** gold는 PARENT가 n-gram order 1부터 4까지의 precision을 결합한다고 답하지만, 시스템 답변은 확인 불가라고 하여 핵심 정답을 누락했습니다.

<details><summary>시스템 출력 전문</summary>

**답:** 논문에서 확인 불가

**근거:** 논문 본문에는 PARENT가 정렬하는 n-gram의 구체적 길이(order)가 명시되어 있지 않으며, "denote the collection of n-grams of order INLINEFORM7" 처럼 기호로만 표현되어 있어 특정 값을 확인할 수 없습니다.

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---

## q0061 — A matter of words: NLP for quality evaluation of Wikipedia medical articles

**질문:** Is it valid to presume a bad medical wikipedia article should not contain much domain-specific jargon?

**gold (yes_no):** No

**다른 gold 주석:** [object Object]

<details><summary>gold evidence</summary>

> The idea of considering infoboxes is not novel: for example, in BIBREF7 the authors noticed that the presence of an infobox is a characteristic featured by good articles. However, in the specific case of the Medicine Portal, the presence of an infobox does not seem strictly related to the quality class the article belongs to (according to the manual labelling). Indeed, it is recurrent that articles, spanning all classes, have an infobox, containing a schematic synthesis of the article. In particular, pages with descriptions of diseases usually have an infobox with the medical standard code of the disease (i.e., IDC-9 and IDC-10)

</details>

### agent-evidence — judge INCORRECT

**judge 사유:** 시스템 답변은 "타당한 측면도 있다"는 부분적 긍정(Partially yes)을 제시했으나, gold 정답은 명확히 "No"입니다.

<details><summary>시스템 출력 전문</summary>

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

</details>

### single-llm — judge INCORRECT

**judge 사유:** 시스템 답변은 "예(Yes)"라고 답했지만 gold 정답은 "No"이므로 사실이 불일치합니다.

<details><summary>시스템 출력 전문</summary>

**답:** 예. 논문은 도메인 특화 자질(Domain Informativeness)이 최상위 품질 등급 문서에서 큰 효과를 내며, 그 이유가 상위 문서일수록 텍스트가 많아 특정 도메인에 속한 단어를 더 많이 활용할 수 있기 때문이라고 설명합니다. 이는 낮은 품질(나쁜) 문서일수록 도메인 특화 용어가 적음을 함의하므로 해당 presumption과 부합합니다.

**근거:** "Here, the newly introduced features have a predominant effect on the articles of the highest classes. This could be justified by the fact that those articles contain, on average, more text and, then, NLP-based features can exploit more words belonging to a specific domain." / "We can observe how the Domain Informativeness feature has a considerably higher infogain value when compared with Informativeness."

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---

## q0064 — Understanding language-elicited EEG data by predicting it from a fine-tuned language model

**질문:** What datasets are used?

**gold (extractive):** the ERP data: BIBREF0

**다른 gold 주석:** [object Object]

<details><summary>gold evidence</summary>

> This work is most closely related to the paper from which we get the ERP data: BIBREF0 .

</details>

### single-llm — judge INCORRECT

**judge 사유:** 시스템 답변은 ERP 데이터(BIBREF0) 외에 eye-tracking과 self-paced reading time 데이터를 추가로 제시했으나, gold 정답은 ERP 데이터(BIBREF0)만을 답으로 요구한다.

<details><summary>시스템 출력 전문</summary>

**답:** ERP 데이터(BIBREF0에서 가져온 6개 ERP 성분)와 행동 데이터인 시선 추적(eye-tracking), 자기 조절 읽기 시간(self-paced reading time) 데이터를 사용합니다.

**근거:** "the ERP data: BIBREF0" / "we have shown that information can be shared between heterogeneous types of data (eye-tracking, self-paced reading, and ERP components)" / "supplemental results for variants of our primary analysis on multitask learning with eye-tracking, self-paced reading time and ERP data."

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---

## q0071 — A Framework for Evaluation of Machine Reading Comprehension Gold Standards

**질문:** What features are absent from MRC gold standards that can result in potential lexical ambiguity?

**gold (extractive):** Restrictivity; Factivity; Coreference

**다른 gold 주석:** [object Object],[object Object]

<details><summary>gold evidence</summary>

> We recognise features that add ambiguity to the supporting facts, for example when information is only expressed implicitly by using an Ellipsis. As opposed to redundant words, we annotate Restrictivity and Factivity modifiers, words and phrases whose presence does change the meaning of a sentence with regard to the expected answer, and occurrences of intra- or inter-sentence Coreference in supporting facts (that is relevant to the question). Lastly, we mark ambiguous syntactic features, when their resolution is required in order to obtain the answer. Concretely, we mark argument collection with con- and disjunctions (Listing) and ambiguous Prepositions, Coordination Scope and Relative clauses/Adverbial phrases/Appositions.
> We recognise features that add ambiguity to the supporting facts, for example when information is only expressed implicitly by using an Ellipsis. As opposed to redundant words, we annotate Restrictivity and Factivity modifiers, words and phrases whose presence does change the meaning of a sentence with regard to the expected answer, and occurrences of intra- or inter-sentence Coreference in supporting facts (that is relevant to the question). Lastly, we mark ambiguous syntactic features, when their resolution is required in order to obtain the answer. Concretely, we mark argument collection with con- and disjunctions (Listing) and ambiguous Prepositions, Coordination Scope and Relative clauses/Adverbial phrases/Appositions.

</details>

### agent-evidence — judge INCORRECT

**judge 사유:** 시스템 답변은 Symmetry, Dative, Genitive, Prepositions, Scope를 답으로 제시했으나, gold 정답은 Restrictivity, Factivity, Coreference(또는 semantics-altering grammatical modifiers)로 서로 다른 사실을 제시하고 있습니다.

<details><summary>시스템 출력 전문</summary>

**결론:** 있음 — 문서는 표본에서 관찰되지 않은(즉 부재한) "변이·모호성에 기여하는 통사적 특징들"을 명시하고 있습니다.

**근거:**
- "Syntactic features contributing to variety and ambiguity that we did not observe in our samples are the exploitation of verb symmetry, the use of dative and genitive cases or ambiguous prepositions and coordination scope (respectively Symmetry, Dative, Genitive, Prepositions, Scope)." — Application of the Framework → Qualitative Analysis → Linguistic Features (두 번째 문단)

즉, 부재한 특징은 다음 다섯 가지입니다:
- **Symmetry** (동사 대칭성의 활용)
- **Dative** (여격)
- **Genitive** (속격)
- **Prepositions** (모호한 전치사)
- **Scope** (등위 접속 범위 / coordination scope)

**보충(맥락):**
- Abstract에서도 이 발견을 요약합니다: "the absence of features that contribute towards lexical ambiguity ... all of which potentially lower the reading comprehension complexity" — Abstract
- 같은 문단은 그 결과로 "we cannot establish whether models are capable of dealing with those features by evaluating them on those gold standards"라고 밝힙니다. — Qualitative Analysis → Linguistic Features

**참고(구분):** "Semantics-altering grammatical modifiers" 섹션에서 다루는 부재 특징들(Negation, Restrictivity, Factivity, Reasoning 등 distractors)은 문장의 **의미를 바꾸는** 요소로, "어휘적 유사 형태를 유지하면서 의미를 변형"하는 것에 관한 것입니다. 이는 질문에서 말하는 "lexical ambiguity(어휘적 모호성)"에 기여하는 통사적 특징과는 별개 범주이므로, 질문에 가장 직접적으로 해당하는 것은 위의 다섯 가지(Symmetry, Dative, Genitive, Prepositions, Scope)입니다.

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---

## q0074 — Dialog Context Language Modeling with Recurrent Neural Networks

**질문:** How long of dialog history is captured?

**gold (free_form):** two previous turns

**다른 gold 주석:** [object Object],[object Object]

<details><summary>gold evidence</summary>

> A dialog turn from one speaker may not only be a direct response to the other speaker's query, but also likely to be a continuation of his own previous statement. Thus, when modeling turn $k$ in a dialog, we propose to connect the last RNN state of turn $k-2$ directly to the starting RNN state of turn $k$ , instead of letting it to propagate through the RNN for turn $k-1$ .

</details>

### agent-evidence — judge INCORRECT

**judge 사유:** 시스템 답변은 "3턴과 5턴"을 주요 답으로 제시했으나, gold 정답은 "two previous turns(이전 두 턴)" 또는 "160"이므로 사실이 일치하지 않습니다.

<details><summary>시스템 출력 전문</summary>

**결론:** 부분적으로 있음 — 문서는 실험에서 사용한 "대화 히스토리 길이(맥락 턴 수 K)"를 명시하며, 주로 **3턴과 5턴**을 사용했습니다. 다만 "얼마나 긴 히스토리를 포착하는가"에 대한 이론적 상한이나 명시적 최대값은 별도로 규정하지 않습니다.

**근거:**
- "The experiment results on language modeling perplexity for models using different dialog turn size are shown in Table 1. $K$ value indicates the number of turns in the dialog. Perplexity is calculated on the last turn, with preceding turns used as context to the model." — Results and Analysis, 첫 문단 (맥락으로 쓰이는 "이전 턴들"의 개수를 K로 정의)
- "ESIDCLM shows the best language modeling performance under dialog turn size of 3 and 5 ... IDCLM beats all baseline models when using dialog turn size of 5, and produces slightly worse perplexity than DRNNLM when using dialog turn size of 3." — Results and Analysis (실제로 평가한 히스토리 길이는 **3턴, 5턴**)

**보조 근거 (모델 구조상 참조 범위):**
- IDCLM/ESIDCLM은 대화 상호작용을 위해 직전 턴들을 명시적으로 연결합니다: "we propose to connect the last RNN state of turn $k-2$ directly to the starting RNN state of turn $k$ ... The last RNN state of turn $k-1$ serves as the context vector to turn $k$" — Interactive Dialog Context LM (턴 $k-1$, $k-2$를 직접 참조)
- 턴 자체의 길이 상한: "Maximum turn length is set to 160." — Data Set (이는 대화 히스토리 턴 수가 아니라 한 턴 내 단어 길이 제한임에 주의)

**보완 설명:** 문서에서 "대화 히스토리 길이"는 맥락 턴 수(K)로 표현되며 실험은 3턴·5턴 설정으로 수행됩니다. "얼마나 긴 히스토리까지 포착 가능한가"라는 이론적/최대 한계에 대한 명시적 서술은 제공된 텍스트 범위에 없습니다.

</details>

### single-llm — judge INCORRECT

**judge 사유:** 시스템 답변은 K=3과 K=5의 턴 크기를 언급하지만, gold 정답인 "two previous turns(이전 2턴)"와 일치하지 않습니다.

<details><summary>시스템 출력 전문</summary>

**답:** 대화 턴 크기(K) 3과 5까지의 히스토리를 사용해 실험했습니다(마지막 턴의 perplexity를 계산하고 앞선 턴들을 컨텍스트로 사용).

**근거:** "The experiment results on language modeling perplexity for models using different dialog turn size are shown in Table 1. $K$ value indicates the number of turns in the dialog. Perplexity is calculated on the last turn, with preceding turns used as context to the model." / "ESIDCLM shows the best language modeling performance under dialog turn size of 3 and 5"

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---

## q0077 — Table-to-Text Generation with Effective Hierarchical Encoder on Three Dimensions (Row, Column and Time)

**질문:** What is the state-of-the-art model for the task?

**gold (extractive):** OpATT BIBREF6; Neural Content Planning with conditional copy (NCP+CC) BIBREF4

**다른 gold 주석:** [object Object]

<details><summary>gold evidence</summary>

> Also, we compared our models with other existing works on this dataset including OpATT BIBREF6 and Neural Content Planning with conditional copy (NCP+CC) BIBREF4.

</details>

### single-llm — judge INCORRECT

**judge 사유:** gold 정답은 OpATT와 NCP+CC 두 모델을 모두 포함하지만, 시스템 답변은 NCP+CC만 언급하고 OpATT를 누락했습니다.

<details><summary>시스템 출력 전문</summary>

**답:** NCP+CC (Neural Content Planning with conditional copy, Puduppully BIBREF4).

**근거:** "we compared our models with other existing works on this dataset including OpATT BIBREF6 and Neural Content Planning with conditional copy (NCP+CC) BIBREF4." 및 "It also exceeds the state-of-the-art model in terms of those metrics." — 이 논문은 NCP+CC를 기존 최고 성능(SOTA) 신경망 모델로 비교 대상으로 삼고, 이를 능가한다고 밝힙니다.

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---

## q0087 — Contextualize, Show and Tell: A Neural Visual Storyteller

**질문:** What model is used to encode the images?

**gold (extractive):** a Convolutional Neural Network (CNN)

**다른 gold 주석:** [object Object],[object Object]

<details><summary>gold evidence</summary>

> The encoder is a Convolutional Neural Network (CNN) and the decoder is a Long Short-Term Memory (LSTM) network, as presented in Figure 2 . The image is passed through the encoder generating the image representation that is used by the decoder to know the content of the image and generate the description word by word.

</details>

### single-llm — judge INCORRECT

**judge 사유:** 시스템 답변은 "Inception V3"를 제시했으나, gold 정답은 "Convolutional Neural Network (CNN)" 또는 "LSTM"으로, 구체적인 모델명이 gold와 일치하지 않습니다.

<details><summary>시스템 출력 전문</summary>

**답:** Inception V3 (이미지 표현을 얻는 데 사용).

**근거:** "The representation of the images was obtained through Inception V3." / "For each image in the sequence, we obtain its representation $\{e(I_1),...,e(I_5)\}$ using Inception v3."

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---

## q0088 — DOLORES: Deep Contextualized Knowledge Graph Embeddings

**질문:** How are meaningful chains in the graph selected?

**gold (extractive):** utilize the machinery of language modeling using deep neural networks to learn Dolores embeddings.

**다른 gold 주석:** [object Object],[object Object]

<details><summary>gold evidence</summary>

> Having generated a set of paths on knowledge graphs representing local contexts of entities and relations, we are now ready to utilize the machinery of language modeling using deep neural networks to learn Dolores embeddings.
> After having estimated the parameters of the Dolores learner, we now extract the context-independent and context-dependent representations for each entity and relation and combine them to obtain Dolores embeddings. More specifically, Dolores embeddings are task specific combination of the context-dependent and context-independent representations learned by our learner.

</details>

### agent-evidence — judge INCORRECT

**judge 사유:** 시스템 답변은 node2vec의 2차 편향 랜덤워크(p, q 파라미터)로 체인을 생성한다고 설명하지만, gold 정답은 딥 신경망을 이용한 언어 모델링 기법으로 Dolores 임베딩을 학습한다는 내용으로, 두 답변이 서로 다른 사실을 제시하고 있습니다.

<details><summary>시스템 출력 전문</summary>

**결론:** 있음 — 그래프에서 의미 있는 체인(entity-relation chain)은 node2vec의 2차(2nd order) 편향 랜덤워크로 생성/선택되며, 두 파라미터 p와 q로 탐색 방식을 조절합니다.

**근거:**
- "Let S denote the set of entity-relation chains obtained by doing random walks in the knowledge graph. We adopt a component of node2vec to construct S." — Dolores: Path Generator 섹션, 첫 문단
- "we perform a 2nd order random walk with two parameters p and q that determine the degree of breadth-first sampling and depth-first sampling. Specifically ... p controls the likelihood of immediately revisiting a node in the walk whereas q controls whether the walk is biased towards nodes close to starting node or away from starting node." — Path Generator 섹션 (체인 선택의 핵심 메커니즘)
- "we adopt only its first component to generate a corpus of random walks representing paths in knowledge graphs." — Path Generator 섹션 (node2vec의 임베딩 학습 부분이 아니라 랜덤워크 생성 부분만 사용)
- 보조 근거(왜 이런 체인이 의미 있는가): "a truncated random walk of length T starting from a node 'v' is analogous to a sentence and effectively captures the context of 'v' in the network." — Preliminaries 섹션

**보충 설명 (부분적 한계):**
- 체인의 **구체적 생성 설정**은 실험 부분에 있습니다: "We generate 20 chains for each node in the knowledge graph, with the length of each chain being 21 (10 relations and 11 entities appear alternately)." — Experimental Settings for Dolores 섹션
- 다만 문서는 "의미 있는(meaningful)" 체인을 별도 기준으로 **선별·필터링**한다고 명시하지는 않습니다. 대신 p·q로 편향된 랜덤워크를 통해 문맥적으로 유의미한 경로가 **생성**되도록 하는 방식입니다. 즉 별도의 선별 단계가 아니라, 랜덤워크 샘플링 자체가 문맥을 포착하는 방식으로 설계되어 있습니다. (참고로 Das et al.의 PRA 경로처럼 관계와 상관된 경로를 쓰는 방식과 달리, 본 논문은 "generic random walks"만 사용한다고 Related Work에서 구별하고 있습니다.)

</details>

### single-llm — judge INCORRECT

**judge 사유:** 시스템 답변은 node2vec의 랜덤 워크 방식으로 체인을 선택한다고 답했으나, gold 정답은 딥 뉴럴 네트워크를 이용한 언어 모델링으로 Dolores 임베딩을 학습하는 것이라고 명시하고 있어 사실이 일치하지 않습니다.

<details><summary>시스템 출력 전문</summary>

**답:** 의미 있는 체인(경로)은 node2vec의 첫 번째 구성요소를 이용해, 파라미터 p와 q로 제어되는 2차(2nd order) 랜덤 워크를 지식 그래프 상에서 수행하여 생성·선택합니다. p는 노드 즉시 재방문 가능성을, q는 시작 노드에 가깝거나 먼 쪽으로의 편향(너비/깊이 우선 샘플링 정도)을 조절합니다.

**근거:** "We adopt a component of node2vec to construct S. In particular, we perform a 2nd order random walk with two parameters p and q that determine the degree of breadth-first sampling and depth-first sampling. Specifically ... p controls the likelihood of immediately revisiting a node in the walk whereas q controls whether the walk is biased towards nodes close to starting node or away from starting node."

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---

## q0094 — VAIS ASR: Building a conversational speech recognition system using language model combination

**질문:** What is the language model combination technique used in the paper?

**gold (extractive):** system combination on the decoding lattice level; combination weights

**다른 gold 주석:** [object Object],[object Object]

<details><summary>gold evidence</summary>

> To further improve the performance, we adopt system combination on the decoding lattice level. By combining systems, we can take advantage of the strength of each model that is optimized for different domains.
> The best result for vlsp2018 of 4.85% WER is obtained by the combination weights 0.6:0.4 where 0.6 is given to the general language model and 0.4 is given to the conversation one. On the vlsp2019 set, the ratio is change slightly by 0.7:0.3 to deliver the best result of 15.09%.

</details>

### single-llm — judge INCORRECT

**judge 사유:** 시스템 답변은 n-gram 언어 모델의 perplexity 기반 결합을 설명하고 있으나, gold 정답은 "system combination on the decoding lattice level"이라는 다른 기법을 요구합니다.

<details><summary>시스템 출력 전문</summary>

**답:** 도메인별로 학습한 n-gram 언어 모델들을, 최적화하려는 도메인의 소량 텍스트에 대해 계산한 perplexity를 기준으로 결합(combine)하는 기법입니다.

**근거:** "For each domain text data, we train an n-gram language model... These language models are combined based on perplexity calculated on a small text of a domain that we want to optimize for."

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---

## q0097 — Exploiting Out-of-Domain Parallel Data through Multilingual Transfer Learning for Low-Resource Neural Machine Translation

**질문:** what was the baseline?

**gold (extractive):** pivot-based translation relying on a helping language BIBREF10; nduction of phrase tables from monolingual data BIBREF14; attentional RNN-based model (RNMT) BIBREF2; Transformer model BIBREF18; bi-directional model BIBREF11; multi-to-multi (M2M) model BIBREF8; back-translation BIBREF17

**다른 gold 주석:** [object Object]

<details><summary>gold evidence</summary>

> We began with evaluating standard MT paradigms, i.e., PBSMT BIBREF3 and NMT BIBREF1 . As for PBSMT, we also examined two advanced methods: pivot-based translation relying on a helping language BIBREF10 and induction of phrase tables from monolingual data BIBREF14 .  As for NMT, we compared two types of encoder-decoder architectures: attentional RNN-based model (RNMT) BIBREF2 and the Transformer model BIBREF18 . In addition to standard uni-directional modeling, to cope with the low-resource problem, we examined two multi-directional models: bi-directional model BIBREF11 and multi-to-multi (M2M) model BIBREF8 .  After identifying the best model, we also examined the usefulness of a data augmentation method based on back-translation BIBREF17 .

</details>

### agent-evidence — judge INCORRECT

**judge 사유:** 시스템 답변은 M2M Transformer NMT 모델과 back-translation 기반 강한 baseline만 언급했지만, gold 정답은 pivot-based translation, phrase table induction, RNMT, Transformer, bi-directional model, M2M, back-translation 등 7가지 baseline을 모두 포함하고 있어 핵심 요소들이 누락되었습니다.

<details><summary>시스템 출력 전문</summary>

**결론:** 있음 — 이 논문의 baseline은 **M2M(multi-to-multi) Transformer NMT 모델**이며, "약한 baseline(단일 언어 데이터 미사용, (b3))"과 "강한 baseline(단일 언어 데이터로 강화한 back-translation 모델, #10)" 두 가지로 구분됩니다. 최종 성능 개선(+3.7 BLEU 이상)은 **강한 baseline** 기준입니다.

**근거:**

- "the final models of our multistage fine-tuning, i.e., V and VII, achieved significantly higher BLEU scores than **(b3) in Table TABREF27, a weak baseline without using any monolingual data**, and **#10 in Table TABREF33, a strong baseline established with monolingual data**." — Results 섹션, 다단계 fine-tuning 결과 문단

- "Given that the **M2M Transformer NMT model (b3) achieved best results** for most of the translation directions ... we further explored it through back-translation." — Augmentation with Back-translation 섹션 도입부 (baseline이 되는 (b3)가 M2M Transformer 모델임을 명시)

- "we proposed a multilingual multistage fine-tuning approach and observed that it substantially improves Ja–Ru translation by **over 3.7 BLEU points compared to a strong baseline**" — Conclusion 섹션

**보충:** (b3)는 "M2M models (a3) and (b3)" 표기에서 알 수 있듯이 Transformer 기반 M2M 모델을 가리키며(Results 섹션), "강한 baseline #10"은 여섯 방향 pseudo-parallel(back-translation) 데이터를 모두 사용해 학습한 모델입니다("the use of all six-way pseudo-parallel data (#10) significantly improved the base model", Augmentation with Back-translation 섹션).

</details>

### single-llm — judge INCORRECT

**judge 사유:** 시스템 답변은 M2M Transformer 기반의 약한/강한 기준선 두 가지만 언급했으나, gold 정답은 pivot 번역, 구문 테이블 유도, RNMT, Transformer, 양방향 모델, M2M 모델, 역번역 등 7가지 기준선 방법을 포함하고 있어 핵심 요소 대부분이 누락되었습니다.

<details><summary>시스템 출력 전문</summary>

**답:** 두 가지 기준선(baseline)이 있습니다 — 단일지역 데이터만 쓴 "약한 기준선"인 M2M Transformer NMT 모델 (b3), 그리고 단일지역 단일어 데이터까지 활용해 만든 "강한 기준선"인 #10(6방향 pseudo-parallel 데이터로 증강한 M2M Transformer 모델)입니다.

**근거:** "the final models of our multistage fine-tuning, i.e., V and VII, achieved significantly higher BLEU scores than (b3) in Table TABREF27 , a weak baseline without using any monolingual data, and #10 in Table TABREF33 , a strong baseline established with monolingual data." / "the use of all six-way pseudo-parallel data (#10) significantly improved the base model for all the translation directions"

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---

## q0099 — Crowdsourcing for Beyond Polarity Sentiment Analysis A Pure Emotion Lexicon

**질문:** How do they compare lexicons?

**gold (free_form):** Human evaluators were asked to evaluate on a scale from 1 to 5 the validity of the lexicon annotations made by the experts and crowd contributors.

**다른 gold 주석:** [object Object],[object Object]

<details><summary>gold evidence</summary>

> We perform a direct comparison of expert and crowd contributors, for 1000 term groups based on the number of total annotations(200 term groups with 2 total annotations, 200 term groups with 3 total annotations, and so on up to term groups with 6 total annotations).
> Evaluators were given a summary of the annotations received for the term group in the form of:The term group "inequality inequity" received annotations as 50.0% sadness, 33.33% disgust, 16.67% anger. Then, they were asked to evaluate on a scale from 1 to 5, how valid these annotations were considered.

</details>

### agent-evidence — judge INCORRECT

**judge 사유:** 시스템 답변은 렉시콘 비교를 용어 겹침 비율과 감정 분포로 설명했으나, gold 정답인 "인간 평가자가 전문가와 군중 기여자의 렉시콘 주석 타당성을 1~5점 척도로 평가"하는 방식을 누락했습니다.

<details><summary>시스템 출력 전문</summary>

**결론:** 부분적으로 있음 — 문서는 자신들의 렉시콘(PEL)을 기존 렉시콘(특히 NRC)과 **용어 겹침(overlap) 비율**로 비교하고, 감정 분포(가장 많이 붙은 감정)를 기존 연구와 대조합니다. 다만 체계적인 렉시콘 성능/정확도 비교는 아닙니다.

**근거:**
- "Comparisons with existing lexicons, such as NRC BIBREF21 indicate a moderate overlap with 40% common terms." — Limitations 섹션 (기존 NRC 렉시콘과 40% 공통 용어로 중간 정도 겹침)
- "In comparison, the most annotated emotion in BIBREF21 was fear in 18% of the total terms." — Assessment 섹션 (자신들 렉시콘은 joy가 우세한 반면, 비교 대상(NRC/BIBREF21)에서는 fear가 18%로 가장 많음 — 감정 분포 대조)

**보충 설명:**
- 위 두 곳이 "다른 렉시콘과의 직접 비교"에 해당합니다. 비교 방식은 ① **공통 용어 비율(40% overlap)** 과 ② **최다 주석 감정 분포(joy vs fear)** 두 가지입니다.
- 참고로 문서의 "Crowd and experts comparison" 섹션은 렉시콘 간 비교가 아니라 **동일 렉시콘에 대한 군중(crowd)과 전문가(expert)의 평가 비교**이므로, 질문이 "렉시콘끼리 비교"를 뜻한다면 이는 해당하지 않습니다.

만약 질문이 "군중 vs 전문가 평가 비교"를 의도한 것이라면 알려주시면 해당 섹션 근거로 답변드리겠습니다.

</details>

### single-llm — judge INCORRECT

**judge 사유:** 시스템 답변은 NRC 렉시콘과의 용어 중첩률(40%)을 비교 방법으로 제시했으나, gold 정답은 인간 평가자가 1~5점 척도로 어노테이션의 유효성을 평가했다는 내용이므로 사실이 일치하지 않습니다.

<details><summary>시스템 출력 전문</summary>

**답:** 기존 렉시콘(NRC)과의 용어 중첩률을 비교했으며, 약 40%의 공통 용어로 중간 정도의 중첩을 보였습니다.

**근거:** "Comparisons with existing lexicons, such as NRC BIBREF21 indicate a moderate overlap with 40% common terms." (또한 감정 분포 비교로 "the most annotated emotion in BIBREF21 was fear in 18% of the total terms"와 대비되게, 본 렉시콘의 지배적 감정은 joy였음을 언급함.)

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---

## q0100 — High Quality ELMo Embeddings for Seven Less-Resourced Languages

**질문:** How larger are the training sets of these versions of ELMo compared to the previous ones?

**gold (free_form):** By 14 times.

**다른 gold 주석:** [object Object]

<details><summary>gold evidence</summary>

> They used 20-million-words data randomly sampled from the raw text released by the CoNLL 2017 Shared Task - Automatically Annotated Raw Texts and Word Embeddings BIBREF8, which is a combination of Wikipedia dump and common crawl.
> For example, we compared the Latvian model by ELMoForManyLangs with a model we trained on a complete (wikidump + common crawl) Latvian corpus, which has about 280 million tokens.

</details>

### single-llm — judge INCORRECT

**judge 사유:** 시스템 답변은 약 13.5배라고 했으나, gold 정답은 14배입니다.

<details><summary>시스템 출력 전문</summary>

**답:** 라트비아어 기준으로 이전(ELMoForManyLangs)은 2천만(20 million) 토큰, 새 모델은 2억 7천만(270 million) 토큰을 사용해 약 13.5배 큽니다. (ELMoForManyLangs는 언어별로 CoNLL 2017에서 무작위 추출한 2천만 단어를 사용했습니다.)

**근거:** "ELMoForManyLangs uses only 20 million tokens and we use the whole corpus of 270 million tokens." / "They used 20-million-words data randomly sampled from the raw text released by the CoNLL 2017 Shared Task"

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---

## q0108 — Understanding Car-Speak: Replacing Humans in Dealerships

**질문:** What are labels in car speak language dataset?

**gold (extractive):** car

**다른 gold 주석:** [object Object],[object Object]

<details><summary>gold evidence</summary>

> We label each review vector with the car it reviews.

</details>

### single-llm — judge INCORRECT

**judge 사유:** 시스템 답변은 "자동차 모델(예: Acura ILX)"이라고 구체적인 예시를 포함하여 정확한 사실을 설명하고 있으나, gold 정답은 단순히 "car"(자동차)이며 시스템 답변은 이보다 더 구체적인 "car model"을 레이블로 제시하여 gold와 정확히 일치하지 않습니다. Wait, let me reconsider. CORRECT 시스템 답변은 레이블이 "자동차(car)"임을 설명하고 있으며, 구체적 예시(Acura ILX)는 부연 설명일 뿐 핵심 답변인 "car"와 사실적으로 일치합니다.

<details><summary>시스템 출력 전문</summary>

**답:** 리뷰가 다루는 자동차 모델(예: Acura ILX)이 각 리뷰 벡터의 레이블입니다.

**근거:** "We label each review vector with the car it reviews. We ignore the year of the car being reviewed and focus specifically on the model (i.e Acura ILX, not 2013 Acura ILX)."

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---

## q0119 — Text Summarization using Abstract Meaning Representation

**질문:** Which evaluation methods are used?

**gold (free_form):** Quantitative evaluation methods using ROUGE, Recall, Precision and F1.

**다른 gold 주석:** [object Object],[object Object]

<details><summary>gold evidence</summary>

> For the evaluation of summaries we use the standard ROGUE metric. For comparison with previous AMR based summarization methods, we report the Recall, Precision and INLINEFORM0 scores for ROGUE-1.

</details>

### single-llm — judge INCORRECT

**judge 사유:** 시스템 답변은 ROUGE 지표 외에 human evaluation(사람 평가)을 추가로 평가 방법으로 제시했으나, gold 정답에는 human evaluation이 포함되어 있지 않아 핵심 사실이 일치하지 않습니다.

<details><summary>시스템 출력 전문</summary>

**답:** ROGUE(ROUGE) 지표(ROGUE-1의 Recall·Precision·F 점수, ROGUE-2, ROGUE-L)와 사람에 의한 평가(human evaluation)를 사용합니다.

**근거:** "For the evaluation of summaries we use the standard ROGUE metric... we report the Recall, Precision and INLINEFORM0 scores for ROGUE-1... we also report INLINEFORM2 scores for ROGUE-2 and ROGUE-L for our method." 및 "we decided to do get the above summaries evaluated by humans" / "We perform human evaluation to check whether the drop in ROGUE scores is because of drop in information contained, and human readability"

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---

## q0127 — A Neural Approach to Irony Generation

**질문:** What experiments are conducted?

**gold (extractive):** Irony Classifier; Sentiment Classifier for Irony; Sentiment Classifier for Non-irony; transformation from ironic sentences to non-ironic sentences

**다른 gold 주석:** [object Object]

<details><summary>gold evidence</summary>

> Irony Classifier: We implement a CNN classifier trained with our irony dataset.
> Sentiment Classifier for Irony: We first implement a one-layer LSTM network to classify ironic sentences in our dataset into positive and negative ironies.
> Sentiment Classifier for Non-irony: Similar to the training process of the sentiment classifier for irony, we first implement a one-layer LSTM network trained with the dataset for the sentiment analysis of common twitters to classify the non-ironies into positive and negative non-ironies.
> In this section, we describe some additional experiments on the transformation from ironic sentences to non-ironic sentences.

</details>

### agent-evidence — judge INCORRECT

**judge 사유:** 시스템 답변은 비아이러니→아이러니 및 아이러니→비아이러니 변환 실험만 언급하고 있으며, gold 정답에 포함된 Irony Classifier, Sentiment Classifier for Irony, Sentiment Classifier for Non-irony 실험은 누락되었습니다.

<details><summary>시스템 출력 전문</summary>

**결론:** 있음 — 논문은 주 실험으로 "비아이러니→아이러니" 변환에 대한 자동·인간 평가 실험을, 추가 실험으로 "아이러니→비아이러니" 변환 실험을 수행합니다.

**근거:**

- "Table TABREF35 shows the automatic evaluation results of the models in the transformation from non-ironic sentences to ironic sentences." — Results and Discussions 섹션 첫 문단 (주 실험: 비아이러니→아이러니 자동 평가)

- "And from human evaluation results shown in Table TABREF36, our model gets the best average rank in irony accuracy." — Results and Discussions 섹션 두 번째 문단 (인간 평가 실험)

- 평가 지표: "we use the absolute value of the difference between the standardized sentiment score ... (senti delta). Besides, we report the sentiment accuracy (Senti ACC) ... The BLEU score ... geometric mean (G2) and harmonic mean (H2) ... As for the irony accuracy, we only report it in human evaluation results" — Evaluation Metrics 섹션 (senti delta, Senti ACC, BLEU, G2, H2, 그리고 인간 평가로 irony accuracy)

- 인간 평가 방식: "We first sample 50 non-ironic input sentences ... we ask four annotators who are proficient in English to evaluate ... rank the output sentences ... in terms of irony accuracy (Irony), Sentiment preservation (Senti) and content preservation (Content)." — Evaluation Metrics 섹션 (50개 문장, 4명 평가자 랭킹)

- 비교 대상(베이스라인) 실험: "We compare our model with the following state-of-art generative models: BackTrans, Unpaired, CrossAlign, CPTG, DualRL" — Baselines 섹션

- 사례 분석: "we present some example outputs of different models. Table TABREF37 shows the results of the transformation from non-ironic sentences to ironic sentences." — Case Study 섹션 (정성적 예시 비교)

- 추가 실험: "In this section, we describe some additional experiments on the transformation from ironic sentences to non-ironic sentences. ... we also conduct automatic evaluations ... As for human evaluation results in Table TABREF47 ..." — Additional Experiments 섹션 (아이러니→비아이러니 변환에 대한 자동·인간 평가)

**요약:** ① 비아이러니→아이러니 변환의 자동 평가(senti delta, Senti ACC, BLEU, G2, H2), ② 동일 변환에 대한 인간 평가(50문장·4명 랭킹, irony/senti/content), ③ 5개 베이스라인과의 비교, ④ 사례(정성) 분석, ⑤ 아이러니→비아이러니 변환에 대한 추가 자동·인간 평가 실험이 수행되었습니다.

</details>

### single-llm — judge INCORRECT

**judge 사유:** 시스템 답변은 변환 실험(비아이러니→아이러니, 아이러니→비아이러니)만 언급하고, gold에서 요구하는 Irony Classifier, Sentiment Classifier for Irony, Sentiment Classifier for Non-irony 실험들을 누락했습니다.

<details><summary>시스템 출력 전문</summary>

**답:** 비아이러니→아이러니 변환에 대한 자동 평가 및 인간 평가 실험을 주로 수행하고, 추가로 아이러니→비아이러니 변환 실험도 수행했습니다.

**근거:** "Table TABREF35 shows the automatic evaluation results of the models in the transformation from non-ironic sentences to ironic sentences.", "from human evaluation results shown in Table TABREF36", 그리고 "In this section, we describe some additional experiments on the transformation from ironic sentences to non-ironic sentences ... we also conduct automatic evaluations ... As for human evaluation results in Table TABREF47"

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---

## q0129 — Shallow Syntax in Deep Water

**질문:** For how many probe tasks the shallow-syntax-aware contextual embedding perform better than ELMo’s embedding?

**gold (extractive):** performance of baseline ELMo-transformer and mSynC are similar, with mSynC doing slightly worse on 7 out of 9 tasks

**다른 gold 주석:** [object Object]

<details><summary>gold evidence</summary>

> Results in Table TABREF13 show ten probes. Again, we see the performance of baseline ELMo-transformer and mSynC are similar, with mSynC doing slightly worse on 7 out of 9 tasks.

</details>

### agent-evidence — judge INCORRECT

**judge 사유:** gold 정답은 mSynC가 9개 중 7개에서 더 나빴다는 사실이 핵심이나, 시스템 답변은 이를 포함하면서도 질문("더 나은 태스크 수")에 대해 "3개"라는 추론값을 제시하였는데, gold는 이 숫자를 직접 답으로 제시하지 않으며 gold의 핵심 사실(7 out of 9 tasks에서 더 나쁨)과 일치하는 직접적 답변을 제공하지 못했다.

<details><summary>시스템 출력 전문</summary>

**결론:** 부분적으로만 명시됨 — 문서는 "10개 probe 중 mSynC가 9개 중 7개에서 약간 더 나빴다"고만 밝히므로, **더 나은 태스크 수를 직접적으로 명시하지는 않습니다.** 다만 서술을 종합하면 mSynC가 더 나은 것은 **3개**(9개 중 나빴던 7개를 제외한 2개 + chunk 태스크)로 추론됩니다.

**근거:**
- "Again, we see the performance of baseline ELMo-transformer and mSynC are similar, with mSynC doing slightly worse on 7 out of 9 tasks." — Experiments ::: Linguistic Probes, 결과 문단 (Table TABREF13 설명)
- "As we would expect, on the probe for predicting chunk tags, mSynC achieves 96.9 $F_1$ vs. 92.2 $F_1$ for ELMo-transformer, indicating that mSynC is indeed encoding shallow syntax." — 같은 문단 (chunk 태스크에서는 mSynC가 더 우수)

**보충 설명:**
- 사용된 probe는 총 10개("Results in Table TABREF13 show ten probes")입니다.
- 문서는 "9개 중 7개에서 더 나빴다"고만 하고, **더 나은 태스크 수를 직접 숫자로 제시하지 않습니다.** 따라서 "9개 중 나머지 2개 + chunk 태스크 = 3개에서 더 나음"은 서술로부터의 추론이며, 정확한 값은 제공된 텍스트 범위 내 Table TABREF13(표 자체는 본문에 표시되지 않음)에 있을 수 있습니다.

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---

## q0142 — Adversarial NLI: A New Benchmark for Natural Language Understanding

**질문:** What are the weaknesses found by non-expert annotators of current state-of-the-art NLI models?

**gold (extractive):** state-of-the-art models learn to exploit spurious statistical patterns in datasets; human annotators—be they seasoned NLP researchers or non-experts—might easily be able to construct examples that expose model brittleness

**다른 gold 주석:** [object Object]

<details><summary>gold evidence</summary>

> A growing body of evidence shows that state-of-the-art models learn to exploit spurious statistical patterns in datasets BIBREF12, BIBREF13, BIBREF14, BIBREF15, BIBREF16, BIBREF17, instead of learning meaning in the flexible and generalizable way that humans do. Given this, human annotators—be they seasoned NLP researchers or non-experts—might easily be able to construct examples that expose model brittleness.

</details>

### agent-evidence — judge INCORRECT

**judge 사유:** 시스템 답변은 6가지 추론 유형(수치·참조·기본·어휘·트릭·외부지식)을 핵심 약점으로 제시했으나, gold 정답은 "모델이 데이터셋의 허위 통계 패턴을 이용하며, 비전문가도 이 취약성을 드러내는 예시를 쉽게 만들 수 있다"는 것으로, 시스템 답변은 이를 부차적 참고사항으로만 언급했을 뿐 핵심 답변으로 제시하지 않았다.

<details><summary>시스템 출력 전문</summary>

**결론:** 문서에 관련 근거가 있음 — 비전문가 주석자들은 특히 **수치·정량 추론, 참조/이름(대명사·고유명사 코어퍼런스), 기본 추론(부정·인과·비교급 등), 어휘 추론(동의어·반의어), 까다로운 추론(말장난·구문 재배열·의도 추론), 외부 지식/사실 기반 추론** 등의 유형을 이용해 최신 NLI 모델을 속였습니다. 이는 모델이 이러한 추론 유형에 취약함을 보여줍니다.

**근거:**

- 추론 유형(취약점) 온톨로지 — "The inference ontology contains six types of inference: **Numerical & Quantitative** (...), **Reference & Names** (...), **Basic Inferences** (conjunctions, negations, cause-and-effect, comparatives and superlatives etc.), **Lexical Inference** (... synonyms, antonyms, etc.), **Tricky Inferences** (wordplay, ... syntactic transformations/reorderings, or inferring writer intentions ...), and **reasoning from outside knowledge or additional facts**" — 위치: Analysis ::: Reasoning types

- 라운드별 취약점 활용 비중 — "both round 1 and 2 writers **rely heavily on numerical and quantitative reasoning** in over 30% ... while round 3 writers use numerical or quantitative reasoning for only 17%" / "For round 3, ... the model ... appears to be **more susceptible to Basic, Lexical, and Tricky inference types**" — 위치: Analysis ::: Reasoning types

- 비전문가가 약점을 잘 찾아낸다는 점 — "non-expert annotators are successful at finding their weaknesses" (Abstract) / "even untrained annotators can fool ensembles of state-of-the-art models with relative ease" — 위치: Abstract, Dataset statistics

- 취약점이 특정 단일 모델이 아닌 모델 클래스 전반의 것임 — "workers did not find vulnerabilities specific to a single model, but **generally applicable ones for that model class**" — 위치: Results ::: Base model performance is low

**참고(부분적 관련):**
- 문서는 별도로 **스퍼리어스 통계 패턴/가설(hypothesis)만으로 예측하는 편향**도 모델의 약점으로 다루지만("state-of-the-art models learn to exploit spurious statistical patterns", Introduction), ANLI에서는 hypothesis-only 모델 성능이 낮게 나와 이 편향이 완화됨을 보입니다(Results ::: Hypothesis-only). 즉 "비전문가가 찾은 약점"의 핵심은 위의 **6가지 추론 유형**입니다.

</details>

### single-llm — judge INCORRECT

**judge 사유:** 시스템 답변은 비전문 주석자가 발견한 약점을 추론 유형별 세부 분류로 설명했으나, gold가 요구하는 핵심 내용(최신 모델이 데이터셋의 허위 통계 패턴을 이용하며, 주석자들이 모델의 취약성을 드러내는 예시를 쉽게 만들 수 있다는 점)을 언급하지 않았습니다.

<details><summary>시스템 출력 전문</summary>

**답:** 논문은 비전문 주석자가 모델을 속이는 데 사용한 추론 유형(inference types)으로 모델의 약점을 분석했으며, 온톨로지의 6가지 추론 유형 — 수치·양적 추론(Numerical & Quantitative), 참조·이름(Reference & Names), 기본 추론(Basic Inferences), 어휘 추론(Lexical Inference), 까다로운 추론(Tricky Inferences), 외부 지식/추가 사실 기반 추론 — 이 이에 해당합니다. 특히 라운드 3의 모델은 Basic·Lexical·Tricky 추론 유형에 더 취약한 것으로 나타났습니다.

**근거:** "The inference ontology contains six types of inference: Numerical & Quantitative ..., Reference & Names ..., Basic Inferences ..., Lexical Inference ..., Tricky Inferences ..., and reasoning from outside knowledge or additional facts" / "For round 3, we observe that the model used to collect it appears to be more susceptible to Basic, Lexical, and Tricky inference types."

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---

## q0144 — Fast Prototyping a Dialogue Comprehension System for Nurse-Patient Conversations on Symptom Monitoring

**질문:** How big is their created dataset?

**gold (extractive):** 353 conversations from 40 speakers (11 nurses, 16 patients, and 13 caregivers); we build templates and expression pools using linguistic analysis

**다른 gold 주석:** [object Object]

<details><summary>gold evidence</summary>

> The dataset comprises a total of 353 conversations from 40 speakers (11 nurses, 16 patients, and 13 caregivers) with consent to the use of anonymized data for research.
> In Section SECREF16 , we build templates and expression pools using linguistic analysis followed by manual verification.

</details>

### agent-evidence — judge INCORRECT

**judge 사유:** 시스템 답변의 주된 결론은 "최적 규모 100k 샘플"로 제시하고 있으며, gold 정답인 "353개 대화, 40명 화자"는 부차적인 참고 정보로만 언급되어 질문의 핵심 답과 일치하지 않습니다.

<details><summary>시스템 출력 전문</summary>

**결론:** 있음 — 저자가 "만든(생성한)" 데이터셋은 **시뮬레이션 학습 데이터**이며, 실험상 최적 규모는 **10만(100k) 샘플**입니다. (기반이 된 실제 seed 데이터는 별도로 353개 대화·41시간 규모)

**근거:**

- 시뮬레이션 데이터의 크기(핵심 답):
  - "both EM and F1 score increase with training sample size growing and **the optimal size in our setting is 100k**." — Results 섹션, 첫 문단
- 시뮬레이션 데이터로부터 held-out한 평가셋 규모:
  - "(1) Base Set (**1,264 samples**) held out from the simulated data. (2) Augmented Set (**1,280 samples**) ... (3) Real-World Set (**944 samples**)" — Evaluation Setup 섹션
- 시뮬레이션의 토대가 된 실제(seed) 데이터 규모(참고):
  - "The dataset comprises a total of **353 conversations from 40 speakers** (11 nurses, 16 patients, and 13 caregivers) ... amount to **41 hours**." — Data Preparation 섹션
  - "we randomly sampled a seed dataset consisting of **1,200 turns**" — Linguistic Characterization on Seed Data 섹션

**보충 설명:**
- 질문의 "created dataset"이 **직접 생성한 시뮬레이션 학습 데이터**를 의미한다면 → 최적 규모 **100k 샘플**(문서는 총 생성 가능한 상한 수치는 별도로 명시하지 않고, 학습에 사용한 최적 크기만 제시).
- 만약 **수집한 실제 대화 데이터**를 의미한다면 → **353개 대화, 40명 화자, 41시간**.

</details>

**감사 결과:** [ 시스템 오답 / gold 불량 / judge 오판 ] — 

---