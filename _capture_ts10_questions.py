"""Export the TS10 Word file to PDF and crop each question (stem + options)."""
from __future__ import annotations

import re
import sys
from pathlib import Path

import pymupdf
from PIL import Image

DOCX = Path(r"d:\AIExamAndLearning\thuvienhoclieu.com-Bo-30-De-toan-tuyen-sinh-10-nam-25-26-CTM-giai-chi-tiet.docx")
PDF = Path(r"d:\AIExamAndLearning\_ts10_probe.pdf")
OUT = Path(r"d:\AIExamAndLearning\frontend\public\ts10\q")
ZOOM = 2.0
HEADER_MAX = 24.0
FOOTER_MIN = 805.0
LIMITS = {"I": 12, "II": 4, "III": 6}
PART_FILE = {"I": "i", "II": "ii", "III": "iii"}
SOL_LIMIT = 22
JSON_PATH = Path(r"d:\AIExamAndLearning\Backend\src\main\resources\data\ts10-2025-2026.json")


def export_pdf() -> None:
    if PDF.exists() and PDF.stat().st_size > 1_000_000:
        return
    import win32com.client

    word = win32com.client.Dispatch("Word.Application")
    word.Visible = False
    word.DisplayAlerts = 0
    doc = None
    try:
        doc = word.Documents.Open(str(DOCX), False, True, False)
        doc.ExportAsFixedFormat(str(PDF), 17)
    finally:
        if doc is not None:
            doc.Close(False)
        try:
            word.Quit()
        except Exception:
            pass


def page_lines(page: pymupdf.Page) -> list[tuple[float, float, str]]:
    rows: list[tuple[float, float, str]] = []
    for block in page.get_text("dict")["blocks"]:
        if block.get("type") != 0:
            continue
        for line in block["lines"]:
            text = "".join(span["text"] for span in line["spans"]).strip()
            if not text:
                continue
            y0 = min(span["bbox"][1] for span in line["spans"])
            y1 = max(span["bbox"][3] for span in line["spans"])
            rows.append((y0, y1, text))
    rows.sort(key=lambda row: row[0])
    return rows


def events(doc: pymupdf.Document) -> list[tuple[int, float, str, object]]:
    found: list[tuple[int, float, str, object]] = []
    for index, page in enumerate(doc):
        for y0, _y1, text in page_lines(page):
            if y0 > FOOTER_MIN:
                continue
            compact = re.sub(r"\s+", "", text)
            exam = re.match(r"Đềsố(\d+)$", compact)
            if exam:
                found.append((index, y0, "exam", int(exam.group(1))))
                continue
            if compact.startswith("PHẦNIII"):
                found.append((index, y0, "part", "III"))
                continue
            if compact.startswith("PHẦNII"):
                found.append((index, y0, "part", "II"))
                continue
            if compact.startswith("PHẦNI"):
                found.append((index, y0, "part", "I"))
                continue
            if "HẾT" in text:
                found.append((index, y0, "het", None))
                continue
            question = re.match(r"^Câu\s+(\d+)\s*:", text)
            if question:
                found.append((index, y0, "question", int(question.group(1))))
    return found


def collect_questions(doc: pymupdf.Document) -> list[dict]:
    questions: list[dict] = []
    exam = None
    part = None
    seen: dict[str, set[int]] = {"I": set(), "II": set(), "III": set()}
    pending = None

    def close(end_page: int, end_y: float) -> None:
        nonlocal pending
        if pending is None:
            return
        pending["end_page"] = end_page
        pending["end_y"] = end_y
        questions.append(pending)
        pending = None

    for page_i, y0, kind, value in events(doc):
        if kind == "exam":
            close(page_i, y0)
            exam = int(value)
            part = None
            seen = {"I": set(), "II": set(), "III": set()}
            continue
        if kind == "part":
            close(page_i, y0)
            part = str(value)
            continue
        if kind == "het":
            close(page_i, y0)
            part = None
            continue
        if kind != "question" or exam is None or part is None:
            continue
        number = int(value)
        if number in seen[part] or number < 1 or number > LIMITS[part]:
            continue
        close(page_i, y0)
        seen[part].add(number)
        pending = {
            "exam": exam,
            "part": part,
            "number": number,
            "start_page": page_i,
            "start_y": y0,
        }
    if pending is not None:
        last = doc.page_count - 1
        close(last, FOOTER_MIN)
    return questions


def collect_solutions(doc: pymupdf.Document) -> list[dict]:
    solutions: list[dict] = []
    exam = None
    in_answers = False
    seen: set[int] = set()
    pending = None

    def close(end_page: int, end_y: float) -> None:
        nonlocal pending
        if pending is None:
            return
        pending["end_page"] = end_page
        pending["end_y"] = end_y
        solutions.append(pending)
        pending = None

    for page_i, y0, kind, value in events(doc):
        if kind == "exam":
            close(page_i, y0)
            exam = int(value)
            in_answers = False
            seen = set()
            continue
        if kind == "het":
            close(page_i, y0)
            in_answers = True
            continue
        if kind != "question" or not in_answers or exam is None:
            continue
        number = int(value)
        if number in seen or number < 1 or number > SOL_LIMIT:
            continue
        close(page_i, y0)
        seen.add(number)
        pending = {
            "exam": exam,
            "number": number,
            "start_page": page_i,
            "start_y": y0,
        }
    if pending is not None:
        last = doc.page_count - 1
        close(last, FOOTER_MIN)
    return solutions


def clip_page(page: pymupdf.Page, y0: float, y1: float) -> Image.Image:
    rect = pymupdf.Rect(page.rect.x0 + 36, y0 + 0.4, page.rect.x1 - 36, y1 - 3)
    if rect.height < 8 or rect.width < 8:
        raise ValueError("empty clip")
    pix = page.get_pixmap(matrix=pymupdf.Matrix(ZOOM, ZOOM), clip=rect, alpha=False)
    return Image.frombytes("RGB", (pix.width, pix.height), pix.samples)


def render_question(doc: pymupdf.Document, item: dict) -> Image.Image:
    start_page = item["start_page"]
    end_page = item["end_page"]
    start_y = item["start_y"]
    end_y = item["end_y"]
    pieces: list[Image.Image] = []
    for page_i in range(start_page, end_page + 1):
        page = doc[page_i]
        top = start_y if page_i == start_page else HEADER_MAX
        bottom = end_y if page_i == end_page else FOOTER_MIN
        if page_i == end_page and end_page != start_page and bottom - top < 10:
            continue
        if bottom <= top + 6:
            continue
        pieces.append(clip_page(page, top, bottom))
    if not pieces:
        raise ValueError("no pieces")
    if len(pieces) == 1:
        return pieces[0]
    width = max(image.width for image in pieces)
    height = sum(image.height for image in pieces)
    combined = Image.new("RGB", (width, height), (255, 255, 255))
    y = 0
    for image in pieces:
        combined.paste(image, (0, y))
        y += image.height
    return combined


def filename(item: dict) -> str:
    return f"e{item['exam']:02d}-{PART_FILE[item['part']]}-{item['number']:02d}.png"


def sol_filename(item: dict) -> str:
    return f"e{item['exam']:02d}-sol-{item['number']:02d}.png"


def sol_cau(item: dict) -> int:
    label = str(item.get("itemLabel") or "")
    section = str(item.get("section") or "")
    if section == "PART_I":
        return int(label.split(".")[1])
    if section == "PART_II":
        return 12 + int(re.match(r"II\.(\d+)", label).group(1))
    if section == "PART_III":
        return 16 + int(label.split(".")[1])
    raise ValueError(label)


def patch_explanations() -> None:
    import json

    bank = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    for exam in bank["exams"]:
        number = int(exam["number"])
        for item in exam["questions"]:
            cau = sol_cau(item)
            item["explanation"] = f"[[img:/ts10/q/e{number:02d}-sol-{cau:02d}.png]]"
    JSON_PATH.write_text(json.dumps(bank, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def render_all(doc: pymupdf.Document, items: list[dict], name_fn) -> list[tuple[str, str]]:
    missing = []
    for item in items:
        dest = OUT / name_fn(item)
        try:
            render_question(doc, item).save(dest, "PNG", optimize=True)
        except Exception as ex:
            missing.append((name_fn(item), str(ex)))
    return missing


def main() -> None:
    export_pdf()
    doc = pymupdf.open(PDF)
    OUT.mkdir(parents=True, exist_ok=True)
    questions = collect_questions(doc)
    solutions = collect_solutions(doc)
    q_missing = []
    s_missing = render_all(doc, solutions, sol_filename)
    q_counts: dict[tuple[int, str], int] = {}
    for item in questions:
        key = (item["exam"], item["part"])
        q_counts[key] = q_counts.get(key, 0) + 1
    s_counts: dict[int, int] = {}
    for item in solutions:
        s_counts[item["exam"]] = s_counts.get(item["exam"], 0) + 1
    q_bad = []
    s_bad = []
    for exam in range(1, 31):
        for part, limit in LIMITS.items():
            got = q_counts.get((exam, part), 0)
            if got != limit:
                q_bad.append(f"e{exam:02d}-{part}:{got}/{limit}")
        got_sol = s_counts.get(exam, 0)
        if got_sol != SOL_LIMIT:
            s_bad.append(f"e{exam:02d}-sol:{got_sol}/{SOL_LIMIT}")
    patch_explanations()
    print("questions", len(questions), "solutions", len(solutions), "files", len(list(OUT.glob("e*.png"))))
    print("question_mismatch", "; ".join(q_bad) if q_bad else "none")
    print("solution_mismatch", "; ".join(s_bad) if s_bad else "none")
    print("question_fail", q_missing[:10], "count", len(q_missing))
    print("solution_fail", s_missing[:10], "count", len(s_missing))
    if solutions:
        print("first_sol", sol_filename(solutions[0]), solutions[0])


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
