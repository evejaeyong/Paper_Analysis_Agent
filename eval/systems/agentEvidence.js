// eval/systems/agentEvidence.js
// 피평가 시스템 A: KPAC의 근거 탐색 에이전트(agents/evidence.js)를 그대로 감싼 어댑터.
// evidence 프롬프트는 한국어 답변을 지시하지만 수정하지 않는다 — 언어 차이는 T6 judge가 처리.
import { findEvidence } from '../../agents/evidence.js';
import * as llmConfig from '../../core/llmConfig.js';

export const SYSTEM_NAME = 'agent-evidence';

/** 로깅용 backend/model 메타 (evidence 역할 설정). */
export function getMeta() {
  const r = llmConfig.getRole('evidence');
  return { backend: r.backend, model: r.model };
}

/**
 * @param {{ paper_full_text:string, question:string }} task qasper_subset.json 항목 1개
 * @returns {Promise<string>}
 */
export async function answer(task) {
  return findEvidence({
    documentText: task.paper_full_text,
    question: task.question,
  });
}
