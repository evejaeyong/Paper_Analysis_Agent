# judge 검증 — Claude 세션 잠정 판정 (judge_check.md 15건)

> 판정자: Claude (세션 내 직접 대조). qa_judge.md 채점 규칙을 그대로 적용.
> **사람 확정 판정을 대체하지 않음** — judge_check.md의 "사람 판정" 칸은 사용자가 직접 채우는 것이 최종.
> 목적: judge 일치율의 잠정 추정 + 갈리는 문항의 쟁점 정리.

## 요약

- **일치: 14/15 (93.3%)** — 불일치 1건(#14 q0001/agent-evidence)
- 일치로 센 것 중 3건은 "규칙상 judge가 맞지만 gold 자체가 불량"으로 별도 표시 (#4, #7, #8)
  → judge 신뢰도 문제가 아니라 **gold 품질 문제**이므로 gold_audit에서 처리해야 함.

## 문항별

| # | run | judge | Claude 판정 | 일치 | 비고 |
|---|---|---|---|---|---|
| 1 | q0059 / single | CORRECT | CORRECT | ✓ | 수치(88%/53%) 정확 일치 |
| 2 | q0091 / single | CORRECT | CORRECT | ✓ | Doc2Vec/PV-DBOW — gold 주석과 일치 |
| 3 | q0093 / agent | CORRECT | CORRECT | ✓ | 0.89→0.92 핵심 일치 (중간값 0.91 부연은 추가 정보) |
| 4 | q0088 / agent | INCORRECT | INCORRECT | ✓* | 규칙상(gold와 다른 사실) judge가 맞음. 단 **gold 불량 의심** — 질문은 "체인 선택 방법"인데 gold는 "언어 모델링으로 임베딩 학습"이라 질문과 어긋남. 시스템 답(랜덤워크)이 본문상 타당 |
| 5 | q0147 / single | CORRECT | CORRECT | ✓ | 본문 답은 "SVM 등"이지만 근거 인용에 4개 분류기 전부 포함 — 규칙상 허용(경계 사례) |
| 6 | q0092 / single | CORRECT | CORRECT | ✓ | 감정 차원별 방향까지 gold와 일치 |
| 7 | q0061 / agent | INCORRECT | INCORRECT | ✓* | gold는 "No"인데 시스템은 부분 긍정 쪽 결론 — judge가 맞음. 단 yes/no로 답하기 애매한 질문(경계) |
| 8 | q0005 / agent | INCORRECT | INCORRECT | ✓* | 규칙상 judge가 맞음. 단 **gold 불량** — 파일럿 수동 채점에서도 "gold(CFILT-preorder)가 질문(단어 매칭 방법)과 어긋남"으로 판정된 문항 |
| 9 | q0094 / agent | CORRECT | CORRECT | ✓ | lattice-level combination + weights 모두 언급 |
| 10 | q0004 / agent | CORRECT | CORRECT | ✓ | "플랫폼 없이 학부생 고용" — gold와 정확히 일치 |
| 11 | q0043 / agent | CORRECT | CORRECT | ✓ | 동사에서 번역 등가어 외 정보 포착 — 일치 |
| 12 | q0092 / agent | CORRECT | CORRECT | ✓ | #6과 동일 gold, 일치 |
| 13 | q0062 / single | CORRECT | CORRECT | ✓ | clipped PMI + NNEGPMI 정확 |
| 14 | q0001 / agent | INCORRECT | **CORRECT** | ✗ | **judge 오판 의심.** 허용 gold 주석에 "multilingual NMT (MNMT) BIBREF19" 단독 표현이 있고, 규칙은 "여러 주석 중 하나와 의미 일치하면 CORRECT". 시스템 답은 BIBREF19를 포함(+BIBREF22는 추가 정보로 허용 범위). judge가 대체 주석을 반영하지 못한 것으로 보임 |
| 15 | q0053 / single | CORRECT | CORRECT | ✓ | global=문서 전체, local=섹션/토픽 — 일치 |

## 시사점

1. 잠정 일치율 93%는 양호하나 표본 15는 작음 — 최종 확정은 사람 판정으로.
2. #14 유형(대체 gold 주석 무시)은 judge 프롬프트의 "허용되는 다른 gold 주석들" 처리 강화로 개선 가능
   (예: "주석 목록의 **어느 하나**와만 일치해도 CORRECT임을 먼저 확인하라"를 지시 앞부분에 명시).
3. judge 불신보다 gold 불량이 더 큰 오차원(#4·#8) — `gold_audit.md` 전수 감사에서 분류 확정 필요.
