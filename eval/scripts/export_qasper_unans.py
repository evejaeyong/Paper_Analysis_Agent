# eval/scripts/export_qasper_unans.py
# 할루시네이션 평가 ②용 데이터셋: QASPER validation에서 **unanswerable 문항만** 추출.
# 모든 annotator가 만장일치로 unanswerable로 표시한 질문만 사용 (경계 사례 배제).
# 정답 행동 = "논문에서 확인 불가/찾지 못함" (거절). 답을 제시하면 할루시네이션.
#
# 사용법: python eval/scripts/export_qasper_unans.py
# 의존성: pip install datasets
import json
import os
import re

from datasets import load_dataset

TARGET = 50
MAX_PER_PAPER = 2
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "qasper_unans_subset.json")


def build_full_text(row):
    """export_qasper.py와 동일한 본문 구성 (Abstract + 섹션별 문단)."""
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


def main():
    ds = load_dataset("allenai/qasper", revision="refs/convert/parquet", split="validation")
    print(f"validation 논문 수: {len(ds)}")

    papers = []
    total_unans = 0
    for row in ds:
        full_text = build_full_text(row)
        if not full_text.strip():
            continue
        qas = row.get("qas") or {}
        questions = qas.get("question") or []
        answers_list = qas.get("answers") or []
        cands = []
        for q, answers in zip(questions, answers_list):
            q = (q or "").strip()
            if not q:
                continue
            anns = answers.get("answer") or []
            if not anns:
                continue
            # 만장일치 unanswerable만 (annotator 간 이견이 있는 문항 배제)
            if not all(a.get("unanswerable") for a in anns):
                continue
            total_unans += 1
            cands.append(q)
        if cands:
            papers.append((row["id"], (row.get("title") or "").strip(), full_text, cands))

    # 라운드로빈으로 논문 다양성 최대화 (논문당 최대 2문항)
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
    for i, (paper_id, title, full_text, q) in enumerate(selected, start=1):
        tasks.append({
            "task_id": f"u{i:04d}",
            "paper_id": paper_id,
            "paper_title": title,
            "paper_full_text": full_text,
            "question": q,
            "gold_answer": "(unanswerable — 논문 본문에 답이 없음. 정답 행동은 '확인 불가' 거절)",
            "answer_type": "unanswerable",
            "gold_all": [],
        })

    out_path = os.path.abspath(OUT_PATH)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(tasks, f, ensure_ascii=False, indent=1)

    n_papers = len({t["paper_id"] for t in tasks})
    print(f"저장: {out_path}")
    print(f"만장일치 unanswerable 질문 전체: {total_unans}개 → 선택 {len(tasks)}문항 / 논문 {n_papers}개")
    lens = [len(t["paper_full_text"]) for t in tasks]
    print(f"본문 길이(자): min={min(lens)} / median={sorted(lens)[len(lens)//2]} / max={max(lens)}")


if __name__ == "__main__":
    main()
