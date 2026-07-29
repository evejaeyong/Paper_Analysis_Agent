# 근거 인용 실재성 검증 — qasper_v2 (할루시네이션 평가 ①)

시스템 출력의 따옴표 인용("...")이 실제 논문 본문에 존재하는지 문자열 매칭으로 검사.
- **exact**: 공백 정규화 후 본문에 그대로 존재 / **relaxed**: 영숫자만 비교 시 존재(LaTeX·부호 변형)
- **fabricated**: 본문에 없음(지어낸 인용) — 영숫자 20자 미만 조각·한글(번역) 인용은 분모 제외

| 시스템 | 성공 run | 인용 포함 run | 검사 인용 수 | exact | relaxed | **fabricated** | 인용당 위조율 | 위조 포함 run |
|---|---|---|---|---|---|---|---|---|
| agent-evidence | 150 | 145 | 622 | 473 | 127 | **22** | **3.5%** | 20 (13.3%) |
| single-llm | 150 | 150 | 286 | 257 | 19 | **10** | **3.5%** | 8 (5.3%) |

참고: 한글(번역) 인용 — agent-evidence: 117건, single-llm: 7건 / 짧아서 제외 — agent-evidence: 41건, single-llm: 6건

## agent-evidence — fabricated 인용 예시 (최대 15건)

- **q0009**: "our BERT implementation is compared to several systems that participated in the MEDDOCAN challenge: a CRF classifier, a spaCy entity recogniser, and NLNDE, the winner of the shared task... we include …"
- **q0027**: "We downloaded the **PubMed, PMC and CORD-19** corpora from: ... [PMC 68GB], [PubMed 24GB], [CORD-19 2GB]"
- **q0055**: "second-order co-occurrence matrix"
- **q0056**: "word level and character level model baselines"
- **q0060**: "We built neural end-to-end machine translation systems ... using state-of-the-art **Transformer architecture** BIBREF14 ... We train ... using **Byte-Pair Encoding** (5000 subwords), ... five layers .…"
- **q0075**: "outperforms previous best model (row (f)) ... by **2% EM score** and over **1.5% F1 score**."
- **q0078**: "let the self-coverage ... be the fraction of content words uttered by [side] in round ... that are among their own talking points ...; and the opponent-coverage ... be the fraction of its content word…"
- **q0082**: "We used the gensim implementation of the CBOW and PV-DM models."
- **q0083**: "we measure BLEU, NIST, METEOR, ROUGE-L and CIDEr metrics on the 2018 E2E NLG Challenge test data"
- **q0088**: "Let S denote the set of entity-relation chains obtained by doing random walks in the knowledge graph. We adopt a component of node2vec to construct S."
- **q0091**: "we train a paragraph vector model using the Document to Vector (Doc2Vec) framework BIBREF7 on the whole set (13 million) of preprocessed text records"
- **q0097**: "we proposed a multilingual multistage fine-tuning approach and observed that it substantially improves Ja–Ru translation by **over 3.7 BLEU points compared to a strong baseline**"
- **q0100**: "much larger corpora / much larger training sets"
- **q0116**: "B2. The second baseline assigns the value relevant to a pair, if and only if [entity] appears in the title of [news article]."
- **q0116**: "S1: Pick the section from template with the highest lexical similarity to [news article]"

## single-llm — fabricated 인용 예시 (최대 15건)

- **q0001**: "our best MLM+BRLM-SA with back translation outperforms pivoting$_{\rm m}$ by 2.4 BLEU points averagely, and outperforms MNMT BIBREF22 by 4.6 BLEU points averagely. BIBREF22 gu2019improved introduces b…"
- **q0009**: "our BERT implementation is compared to several systems that participated in the MEDDOCAN challenge: a CRF classifier, a spaCy entity recogniser, and NLNDE... Finally, we include the results obtained b…"
- **q0020**: "we used the crowdsourcing platform CrowdFlower (CF) for our data collection. A CF worker gets a task instructing them to use our chat-like interface to help the system with a question which is randoml…"
- **q0087**: "For each image in the sequence, we obtain its representation $\{e(I_1),...,e(I_5)\}$ using Inception v3."
- **q0088**: "We adopt a component of node2vec to construct S. In particular, we perform a 2nd order random walk with two parameters p and q that determine the degree of breadth-first sampling and depth-first sampl…"
- **q0091**: "we train a paragraph vector model using the Document to Vector (Doc2Vec) framework ... on the whole set (13 million) of preprocessed text records"
- **q0091**: "Distributed Bag of Words (DBOW) is a form of Paragraph Vectors (PV), also known as Doc2Vec ... Here, we use the Gensim Python library to train the PV-DBOW model."
- **q0126**: "The most frequent attack is to call a person an animal name, and the most used animals were كلب ('dog'), حمار ('donkey'), and بهيم ('beast')"
- **q0126**: "Not all animal names are used as insults. For example, animals such as أسد ('lion'), صقر ('falcon'), and غزال ('gazelle') are typically used for praise."
- **q0147**: "We experimented with four different classifiers, namely, support vector machine, random forest, extra tree and naive bayes classifier"
