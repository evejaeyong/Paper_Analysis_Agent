# eval/scripts/export_qasper.py
# 1회성: QASPER validation split에서 평가용 서브셋을 추출해
# eval/data/qasper_v2_subset.json 을 생성한다. (Node 하니스가 소비)
#
# v2 — 파일럿에서 드러난 데이터 문제 반영:
#   1. gold 근거가 표/그림(FLOAT SELECTED)에 의존하는 annotation 제외
#      (QASPER full_text에는 표 내용이 없어 시스템이 답할 수 없음)
#   2. gold 근거 문장·extractive 스팬이 실제로 본문 텍스트에 존재하는지 검증
#   3. 답변 가능한 모든 annotation을 gold_all로 보존 (복수 정답 허용 채점용)
#
# 사용법: python eval/scripts/export_qasper.py
# 의존성: pip install datasets
import json
import os
import re
from collections import Counter

from datasets import load_dataset

TARGET = 150
MAX_PER_PAPER = 3
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "qasper_v2_subset.json")


def norm(s):
    """느슨한 매칭용 정규화: 공백류를 단일 스페이스로."""
    return re.sub(r"\s+", " ", (s or "")).strip()


def build_full_text(row):
    """full_text(섹션별 문단)를 '## {section_name}\\n{paragraphs}' 형식으로 이어붙인다.
    abstract는 full_text에 포함되지 않으므로 '## Abstract' 섹션으로 앞에 둔다
    (QASPER 질문 상당수가 abstract에서 답해지므로 두 시스템 모두에게 공정하게 제공)."""
    parts = []
    abstract = (row.get("abstract") or "").strip()
    if abstract:
        parts.append(f"## Abstract\n{abstract}")
    ft = row.get("full_text") or {}
    names = ft.get("section_name") or []
    paras = ft.get("paragraphs") or []
    for name, ps in zip(names, paras):
        body = "\n\n".join(p.strip() for p in (ps or []) if p and p.strip())
        if not body:
            continue
        title = (name or "").strip() or "(unnamed section)"
        parts.append(f"## {title}\n{body}")
    return "\n\n".join(parts)


def grounded_annotations(answers, norm_text):
    """답변 가능하고 **본문 텍스트에 근거가 실재하는** annotation들을 반환.
    반환 항목: {answer, answer_type, evidence}"""
    out = []
    for ann in answers.get("answer") or []:
        if ann.get("unanswerable"):
            continue
        spans = [s.strip() for s in (ann.get("extractive_spans") or []) if s and s.strip()]
        free = (ann.get("free_form_answer") or "").strip()
        yes_no = ann.get("yes_no")
        evidence = [e.strip() for e in (ann.get("highlighted_evidence") or ann.get("evidence") or []) if e and e.strip()]

        # 근거가 아예 없으면 검증 불가 → 제외
        if not evidence:
            continue
        # 표/그림 의존 gold 제외 (본문에 표 내용이 없음)
        if any(e.startswith("FLOAT SELECTED") for e in evidence):
            continue
        # 근거 문장이 실제 본문에 존재하는지 (전부)
        if not all(norm(e) in norm_text for e in evidence):
            continue

        if free:
            answer, answer_type = free, "free_form"
        elif spans:
            # extractive 스팬도 본문에 실재해야 함
            if not all(norm(s) in norm_text for s in spans):
                continue
            answer, answer_type = "; ".join(spans), "extractive"
        elif yes_no is not None:
            answer, answer_type = ("Yes" if yes_no else "No"), "yes_no"
        else:
            continue

        out.append({"answer": answer, "answer_type": answer_type, "evidence": evidence})
    return out


def main():
    # 원본 repo는 script 기반이라 최신 datasets에서 로드 불가 → parquet 자동 변환 브랜치 사용
    ds = load_dataset("allenai/qasper", revision="refs/convert/parquet", split="validation")
    print(f"validation 논문 수: {len(ds)}")

    total_q = 0
    dropped_unanswerable = 0
    dropped_ungrounded = 0

    # 논문별 후보 수집
    papers = []
    for row in ds:
        full_text = build_full_text(row)
        if not full_text.strip():
            continue
        norm_text = norm(full_text)
        qas = row.get("qas") or {}
        questions = qas.get("question") or []
        answers_list = qas.get("answers") or []
        cands = []
        for q, answers in zip(questions, answers_list):
            q = (q or "").strip()
            if not q:
                continue
            total_q += 1
            answerable = [a for a in (answers.get("answer") or []) if not a.get("unanswerable")]
            if not answerable:
                dropped_unanswerable += 1
                continue
            grounded = grounded_annotations(answers, norm_text)
            if not grounded:
                dropped_ungrounded += 1
                continue
            primary = next((g for g in grounded if g["answer_type"] != "yes_no"), grounded[0])
            cands.append({
                "question": q,
                "gold_answer": primary["answer"],
                "answer_type": primary["answer_type"],
                "evidence": primary["evidence"],
                "gold_all": [{"answer": g["answer"], "answer_type": g["answer_type"]} for g in grounded],
            })
        if cands:
            # 논문 내 우선순위: extractive/free_form 먼저, yes_no는 뒤로
            cands.sort(key=lambda c: c["answer_type"] == "yes_no")
            papers.append((row["id"], (row.get("title") or "").strip(), full_text, cands))

    # 라운드로빈으로 논문당 1문항씩 돌며 뽑아 논문 다양성 최대화 (논문당 최대 3문항)
    selected = []
    for round_idx in range(MAX_PER_PAPER):
        for paper_id, title, full_text, cands in papers:
            if len(selected) >= TARGET:
                break
            if round_idx < len(cands):
                selected.append((paper_id, title, full_text, cands[round_idx]))
        if len(selected) >= TARGET:
            break

    tasks = []
    for i, (paper_id, title, full_text, c) in enumerate(selected, start=1):
        tasks.append({
            "task_id": f"q{i:04d}",
            "paper_id": paper_id,
            "paper_title": title,
            "paper_full_text": full_text,
            "question": c["question"],
            "gold_answer": c["gold_answer"],
            "answer_type": c["answer_type"],
            "evidence": c["evidence"],
            "gold_all": c["gold_all"],
        })

    out_path = os.path.abspath(OUT_PATH)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(tasks, f, ensure_ascii=False, indent=1)

    n_papers = len({t["paper_id"] for t in tasks})
    dist = Counter(t["answer_type"] for t in tasks)
    multi_gold = sum(1 for t in tasks if len(t["gold_all"]) > 1)
    print(f"저장: {out_path}")
    print(f"전체 질문 {total_q}개 중 제외: unanswerable {dropped_unanswerable}, 근거 미검증(표 의존 등) {dropped_ungrounded}")
    print(f"문항 수: {len(tasks)} (복수 gold 주석 보유: {multi_gold})")
    print(f"논문 수: {n_papers} (논문당 최대 {MAX_PER_PAPER})")
    print("answer_type 분포:", dict(dist))
    lens = [len(t["paper_full_text"]) for t in tasks]
    print(f"본문 길이(자): min={min(lens)} / median={sorted(lens)[len(lens)//2]} / max={max(lens)}")


if __name__ == "__main__":
    main()
