// core/quoteGuard.js
// 답변 속 따옴표 인용("...")이 실제 문서 원문에 존재하는지 검사하고,
// 위조(요약·의역을 원문 인용처럼 제시) 인용을 찾아내는 가드.
// 판정 기준은 eval/scripts/check_quotes.mjs 와 동일하게 유지한다:
//   exact   — 공백 정규화 후 본문에 그대로 존재
//   relaxed — 영숫자만 비교 시 존재 (LaTeX·문장부호 변형 허용)
//   fabricated — 둘 다 실패 (본문에 없는 인용)
// 한글 인용(번역)과 영숫자 20자 미만 조각은 검사 대상에서 제외한다.

const normWs = s => (s || '').replace(/\s+/g, ' ').trim();
const normAlnum = s => (s || '').toLowerCase().replace(/[^a-z0-9가-힣]+/g, '');
const hasHangul = s => /[가-힣]/.test(s);

/** 텍스트에서 따옴표 인용 추출: "..." / “...” (10자 이상만) */
export function extractQuotes(text) {
  const quotes = [];
  const patterns = [/"([^"]{10,}?)"/g, /“([^”]{10,}?)”/g];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text || '')) !== null) quotes.push(m[1]);
  }
  return quotes;
}

/** 인용 1건 판정: 'exact' | 'relaxed' | 'fabricated' | 'skip'(짧음) | 'korean' */
export function verifyQuote(quote, docWs, docAlnum) {
  if (hasHangul(quote)) return 'korean';
  // 중략(... / …)으로 나눠 조각별 검사 — 전 조각이 존재해야 인정
  const segs = quote.split(/\.\.\.|…|\[\.\.\.?\]|\(\.\.\.?\)/).map(normWs).filter(Boolean);
  const meaningful = segs.filter(s => normAlnum(s).length >= 20);
  if (!meaningful.length) return 'skip';
  if (meaningful.every(s => docWs.includes(s))) return 'exact';
  if (meaningful.every(s => docAlnum.includes(normAlnum(s)))) return 'relaxed';
  return 'fabricated';
}

/**
 * 답변에서 문서 원문에 없는(위조) 인용 목록을 반환. 없으면 빈 배열.
 * @param {string} answer
 * @param {string} documentText
 * @returns {string[]} 중복 제거된 위조 인용들
 */
export function findFabricatedQuotes(answer, documentText) {
  if (!answer || !documentText) return [];
  const docWs = normWs(documentText);
  const docAlnum = normAlnum(documentText);
  const seen = new Set();
  const fabricated = [];
  for (const q of extractQuotes(answer)) {
    if (seen.has(q)) continue;
    seen.add(q);
    if (verifyQuote(q, docWs, docAlnum) === 'fabricated') fabricated.push(q);
  }
  return fabricated;
}

/**
 * 위조 인용 수선용 프롬프트 생성. 문서를 다시 제공해, 같은 내용의 실제 원문 문장으로
 * 교체하거나(찾을 수 있으면) 따옴표를 제거해 의역임을 드러내게 한다.
 * 사용자 편집용 프롬프트가 아니라 기계적 가드이므로 promptStore 를 거치지 않는다.
 */
export function buildRepairPrompt({ documentText, answer, fabricated }) {
  const list = fabricated.map(q => `- "${q}"`).join('\n');
  return `당신은 답변의 인용 검증 도우미입니다. 아래 "답변"에는 문서 원문에 글자 그대로 존재하지 않는 따옴표 인용이 포함되어 있습니다(요약·의역을 원문 인용처럼 제시한 것).

## 수정 규칙
- "원문에 없는 인용 목록"의 각 인용에 대해:
  - 문서에서 같은 내용을 담은 **실제 문장**을 찾을 수 있으면, 그 문장을 **글자 그대로(verbatim)** 따옴표 인용으로 교체합니다. 원문을 한 글자도 바꾸지 마세요.
  - 실제 문장을 특정할 수 없으면 따옴표를 제거하고, 의역임을 알 수 있게 서술로 바꿉니다(예: "본문 요지: ...").
- 목록에 없는 부분(결론, 구조, 올바른 인용, 위치 표기)은 그대로 유지합니다.
- 새로운 내용을 추가하거나 결론을 바꾸지 마세요.
- **수정된 답변 전문만** 출력하세요. 수정 과정에 대한 설명을 덧붙이지 마세요.

## 문서
${documentText}

## 답변
${answer}

## 원문에 없는 인용 목록
${list}`;
}
