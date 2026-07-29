// eval/systems/singleLlm.js
// 피평가 시스템 B: callLLM 1회 호출 베이스라인.
// 모델 차이가 아니라 구조 차이를 재는 것이므로 backend/model/effort는
// agent-evidence와 동일하게 llmConfig의 evidence 역할 설정을 그대로 사용한다.
// 문서 truncation(400,000자)과 타임아웃(300초)도 agents/evidence.js와 동일 조건.
import { callLLM } from '../../core/llm.js';
import * as llmConfig from '../../core/llmConfig.js';

export const SYSTEM_NAME = 'single-llm';

const MAX_DOC_CHARS = 400000; // agents/evidence.js와 동일 (공정성)
const TIMEOUT_MS = 300_000;   // agents/evidence.js와 동일

/** 로깅용 backend/model 메타 (evidence 역할 설정 공유). */
export function getMeta() {
  const r = llmConfig.getRole('evidence');
  return { backend: r.backend, model: r.model };
}

function buildPrompt(doc, question) {
  return `당신은 과학 논문 QA 어시스턴트입니다. 아래 논문 본문만을 근거로 질문에 답하세요.

## 지시
- 오직 아래 "## 논문" 텍스트에 있는 내용에만 근거해 답합니다. 외부 지식이나 추측으로 답하지 마세요.
- 답은 간결하게: 질문이 요구하는 핵심 값·명칭·사실을 먼저 한 줄로 제시하세요.
- 이어서 근거가 되는 원문 구절을 짧게 따옴표로 인용해 함께 제시하세요.
- 예/아니오로 답할 수 있는 질문이면 "예" 또는 "아니오"로 시작한 뒤 근거를 덧붙이세요.
- 논문에 답이 없으면 정확히 "논문에서 확인 불가"라고 답하세요. 지어내지 마세요.
- 문서 끝에 "(문서가 길어 일부만 표시됨)"이 있으면 보이는 범위 안에서만 판단하세요.

## 출력 형식
**답:** (핵심 답 한 줄)
**근거:** "(원문 발췌)"

## 논문
${doc}

## 질문
${question}`;
}

/**
 * @param {{ paper_full_text:string, question:string }} task qasper_subset.json 항목 1개
 * @returns {Promise<string>}
 */
export async function answer(task) {
  const r = llmConfig.getRole('evidence');

  let doc = task.paper_full_text || '';
  let truncated = false;
  if (doc.length > MAX_DOC_CHARS) { doc = doc.slice(0, MAX_DOC_CHARS); truncated = true; }
  if (truncated) doc += '\n\n…(문서가 길어 일부만 표시됨)';

  const out = await callLLM(buildPrompt(doc, task.question), {
    backend: r.backend, model: r.model, reasoningEffort: r.reasoningEffort, timeoutMs: TIMEOUT_MS,
  });
  return (out || '').trim();
}
