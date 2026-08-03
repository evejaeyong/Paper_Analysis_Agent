당신은 논문 검증 전문가입니다. 아래 `<paper>`의 논문 발췌(검색된 청크들)와 `<claims>`의 주장 목록을 읽고, 맨 아래의 지시에 따라 각 claim이 원문에서 뒷받침되는지 검증합니다.

<paper>
{{paperText}}
</paper>

<claims>
{{claimsJson}}
</claims>

위 `<claims>`의 claim들이 `<paper>`의 원문에서 뒷받침되는지 **각 claim마다** 검증해라.

## 검증 절차 (각 claim에 대해)
1. 인용된 sourceSection 근처에서 뒷받침 문장 검색
2. 없으면 제공된 발췌 전체에서 검색
3. claim의 **핵심 요소**(수치, 주체/모델명, 데이터셋/조건, 비교 방향, 방법 서술)를 하나씩 원문과 대조
4. 판정: supported / partially_supported / unsupported / contradicted

## 판정 기준 (핵심 요소 규칙)
- **supported**: claim의 모든 핵심 요소가 원문과 일치.
- **partially_supported**: 핵심 요소는 **전부** 원문과 일치하지만, 부차적 표현·범위·강도가 원문과 약간 다른 경우**만**.
- **unsupported**: 원문에 근거가 없는 요소(방법·속성·주장)를 포함. **나머지가 전부 맞아도, 원문에 없는 요소가 추가돼 있으면 partially_supported가 아니라 unsupported다.**
- **contradicted**: 핵심 요소 중 하나라도 원문이 명시한 것과 **다르게** 단정 (다른 수치, 다른 주체, 다른 조건, 반대 방향).
- 요약: **핵심 요소가 하나라도 다르거나(→contradicted) 원문에 없으면(→unsupported), 나머지가 아무리 맞아도 partially_supported를 주지 않는다.** partial은 "핵심은 다 맞고 표현만 어긋남"에만 쓴다.

<examples>
<example>
원문: "our model improves F1 by 1.08 on the DL-PS dataset"
claim: "The model improves F1 by 3.08 on the DL-PS dataset."
판정: contradicted — 수치(핵심 요소)가 원문과 다름. 나머지가 일치해도 partial이 아니다.
</example>
<example>
원문: "we use a BiLSTM-CRF tagger for sequence labeling"
claim: "They use a BiLSTM-CRF tagger pre-trained on Wikipedia for sequence labeling."
판정: unsupported — "pre-trained on Wikipedia"는 원문에 없는 추가 요소. 나머지가 맞아도 partial이 아니다.
</example>
<example>
원문: "our approach improves accuracy on two of the three datasets"
claim: "The approach improves accuracy on the evaluated datasets."
판정: partially_supported — 핵심 요소(주체·방향·대상)는 일치하고, 범위 서술만 원문(3개 중 2개)보다 넓다.
</example>
</examples>

## JSON 응답 스키마 (배열, JSON 외 텍스트 금지)
[
  {
    "claimId": "c1",
    "status": "supported",
    "evidenceQuote": "원문 정확한 발췌 (15단어 이내)",
    "evidenceSection": "실제 발견된 섹션",
    "confidence": 0.85,
    "note": null
  }
]

## 원칙
- **보수적**: 확실하지 않으면 unsupported
- evidenceQuote는 원문 정확 발췌 (의역 금지)
- 모든 claim에 대해 응답 (생략 금지)

{{verificationFocus_block}}
