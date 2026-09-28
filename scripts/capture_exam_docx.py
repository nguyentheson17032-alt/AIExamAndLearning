"""Render a TS10-style Word exam and write question/solution PNGs plus bank.json."""
from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path

import pymupdf
from PIL import Image

ZOOM = 2.0
HEADER_MAX = 24.0
LIMITS = {"I": 40, "II": 8, "III": 12}
SOL_LIMIT = 48
PART_FILE = {"I": "i", "II": "ii", "III": "iii"}
SECTION = {"I": "PART_I", "II": "PART_II", "III": "PART_III"}
QTYPE = {"I": "MULTIPLE_CHOICE", "II": "TRUE_FALSE", "III": "SHORT_ANSWER"}
TITLE = {
    "I": "Phần I. Trắc nghiệm nhiều phương án lựa chọn",
    "II": "Phần II. Trắc nghiệm đúng sai",
    "III": "Phần III. Trắc nghiệm trả lời ngắn",
}
POINTS = {"I": 0.25, "II": 0.25, "III": 0.5}


def fail(message: str, code: int = 2) -> None:
    print(message, file=sys.stderr)
    raise SystemExit(code)


def fold(text: str) -> str:
    stripped = "".join(ch for ch in unicodedata.normalize("NFD", text) if unicodedata.category(ch) != "Mn")
    return re.sub(r"[^A-Z0-9]", "", stripped.upper())


def export_pdf(docx: Path, pdf: Path) -> None:
    try:
        import win32com.client
    except ImportError:
        fail("Máy này chưa có pywin32 để mở Word.")
    word = None
    doc = None
    try:
        word = win32com.client.DispatchEx("Word.Application")
        word.Visible = False
        word.DisplayAlerts = 0
        doc = word.Documents.Open(str(docx), False, True, False)
        doc.ExportAsFixedFormat(str(pdf), 17)
    except Exception as ex:
        fail(f"Không mở được file bằng Microsoft Word. {ex}", 3)
    finally:
        if doc is not None:
            try:
                doc.Close(False)
            except Exception:
                pass
        if word is not None:
            try:
                word.Quit()
            except Exception:
                pass
    if not pdf.exists() or pdf.stat().st_size < 1000:
        fail("Word không xuất được PDF của đề.")


def page_lines(page: pymupdf.Page) -> list[tuple[float, float, str]]:
    rows: list[tuple[float, float, str, float]] = []
    for block in page.get_text("dict")["blocks"]:
        if block.get("type") != 0:
            continue
        for line in block["lines"]:
            text = "".join(span["text"] for span in line["spans"]).strip()
            if not text:
                continue
            y0 = min(span["bbox"][1] for span in line["spans"])
            y1 = max(span["bbox"][3] for span in line["spans"])
            x0 = min(span["bbox"][0] for span in line["spans"])
            rows.append((y0, y1, text, x0))
    rows.sort(key=lambda row: (round(row[0] * 2) / 2, row[3]))
    return [(y0, y1, text) for y0, y1, text, _x0 in rows]


def content_bottom(page: pymupdf.Page) -> float:
    return page.rect.y1 - 28


def part_of(text: str) -> str | None:
    stripped = text.strip()
    if not re.match(r"(?i)^ph[aầ]n\b", stripped):
        return None
    token = fold(stripped)
    if token.startswith("PHANIII") or token.startswith("PHAN3"):
        return "III"
    if token.startswith("PHANII") or token.startswith("PHAN2"):
        return "II"
    if token.startswith("PHANI") or token.startswith("PHAN1"):
        return "I"
    return None


def exam_number(text: str) -> int | None:
    """A line that starts an exam, such as «Đề số 2» or «ĐỀ THAM KHẢO 01»."""
    raw = text.strip().replace("\u00a0", " ")
    if re.match(r"(?i)^(phần\s+)?(đáp\s*án|lời\s*giải|hướng\s*dẫn)", raw):
        return None
    match = re.match(r"(?i)^đề\s*(?:số|tham\s*khảo)\s*(\d+)\b", raw)
    if match is None:
        match = re.match(r"(?i)^đề\s+(\d+)\b", raw)
    if match is None:
        token = fold(raw.replace("Đ", "D").replace("đ", "d"))
        loose = re.match(r"DESO(\d+)", token)
        if loose is None or len(raw) > 48:
            return None
        return int(loose.group(1))
    rest = raw[match.end():].strip(" .:-–—")
    if rest and not re.match(r"(?i)^ph[aầ]n\b", rest) and len(raw) > 60:
        return None
    return int(match.group(1))


def fold_vi(text: str) -> str:
    """fold() drops Đ because it is not a combining accent. Map it to D first."""
    return fold(text.replace("Đ", "D").replace("đ", "d"))


def is_het(text: str) -> bool:
    stripped = text.strip()
    core = re.sub(r"[\s\-–—_=.*•·]+", "", stripped)
    if fold(core) == "HET":
        return True
    folded = fold_vi(stripped)
    if folded == "DAPAN":
        return False
    if ":" in stripped or re.search(r"\d", stripped) or len(stripped) > 40:
        return False
    return folded.startswith("DAPAN")


def shared_targets(text: str) -> list[int] | None:
    """«Sử dụng các thông tin sau cho Câu 3 và Câu 4» belongs to those later questions."""
    stripped = text.strip()
    if not re.match(r"(?i)^sử\s*dụng\s+các\s+thông\s+tin\s+sau\s+cho\s+câu\s+\d+", stripped):
        return None
    head = re.split(r"[:.]", stripped, maxsplit=1)[0]
    numbers = [int(number) for number in re.findall(r"(?i)câu\s+(\d+)", head)]
    return numbers or None


def is_detail(text: str) -> bool:
    stripped = text.strip()
    token = fold(stripped)
    if token.startswith("LOIGIAICHITIET") or token.startswith("PHANLOIGIAI"):
        return True
    return ":" not in stripped and token.startswith("LOIGIAITHAMKHAO")


def events(doc: pymupdf.Document) -> list[tuple[int, float, str, object]]:
    found: list[tuple[int, float, str, object]] = []
    for index, page in enumerate(doc):
        bottom = content_bottom(page)
        for y0, _y1, text in page_lines(page):
            if y0 > bottom:
                continue
            number = exam_number(text)
            if number is not None:
                found.append((index, y0, "exam", number))
                rest = re.sub(
                    r"(?i)^đề\s*(?:(?:số|tham\s*khảo)\s*)?\d+\b",
                    "",
                    text.strip(),
                    count=1,
                ).strip(" .:-–—")
                part = part_of(rest)
                if part:
                    found.append((index, y0, "part", part))
                continue
            if is_detail(text):
                found.append((index, y0, "detail", None))
                continue
            part = part_of(text)
            if part:
                found.append((index, y0, "part", part))
                continue
            if is_het(text):
                found.append((index, y0, "het", None))
                continue
            targets = shared_targets(text)
            if targets:
                found.append((index, y0, "shared", targets))
                continue
            question = re.match(r"^Câu\s+(\d+)\s*[:.：]", text) or re.match(r"^Câu\s+(\d+)\s*$", text)
            if question:
                found.append((index, y0, "question", int(question.group(1))))
    if found and not any(kind == "exam" for _p, _y, kind, _v in found):
        found.insert(0, (0, 0.0, "exam", 1))
    return found


def collect_questions(doc: pymupdf.Document) -> list[dict]:
    questions: list[dict] = []
    exam = None
    part = None
    in_answers = False
    seen: dict[str, set[int]] = {"I": set(), "II": set(), "III": set()}
    pending = None
    shared = None

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
            in_answers = False
            seen = {"I": set(), "II": set(), "III": set()}
            shared = None
            continue
        if kind in {"het", "detail"}:
            close(page_i, y0)
            part = None
            in_answers = True
            shared = None
            continue
        if in_answers:
            continue
        if kind == "shared":
            close(page_i, y0)
            shared = {
                "start_page": page_i,
                "start_y": y0,
                "end_page": None,
                "end_y": None,
                "targets": {int(number) for number in value},
            }
            continue
        if kind == "part":
            close(page_i, y0)
            part = str(value)
            continue
        if kind != "question" or exam is None:
            continue
        if part is None:
            part = "I"
        number = int(value)
        if number in seen[part] or number < 1 or number > LIMITS[part]:
            continue
        close(page_i, y0)
        seen[part].add(number)
        if shared is not None and shared["end_y"] is None:
            shared["end_page"] = page_i
            shared["end_y"] = y0
        preamble = None
        if shared is not None and shared["end_y"] is not None and number in shared["targets"]:
            preamble = {
                "start_page": shared["start_page"],
                "start_y": shared["start_y"],
                "end_page": shared["end_page"],
                "end_y": shared["end_y"],
            }
        pending = {
            "exam": exam,
            "part": part,
            "number": number,
            "start_page": page_i,
            "start_y": y0,
            "preamble": preamble,
        }
    if pending is not None:
        close(doc.page_count - 1, content_bottom(doc[-1]))
    return questions


def collect_solutions(doc: pymupdf.Document) -> list[dict]:
    solutions: list[dict] = []
    exam = None
    in_detail = False
    part = None
    seen: dict[str, set[int]] = {"I": set(), "II": set(), "III": set()}
    loose: set[int] = set()
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
            in_detail = False
            part = None
            seen = {"I": set(), "II": set(), "III": set()}
            loose = set()
            continue
        if kind == "detail":
            close(page_i, y0)
            in_detail = True
            part = None
            continue
        if not in_detail or exam is None:
            continue
        if kind == "part":
            close(page_i, y0)
            part = str(value)
            continue
        if kind == "het":
            close(page_i, y0)
            part = None
            continue
        if kind != "question":
            continue
        number = int(value)
        if part is None:
            if number < 1 or number > SOL_LIMIT or number in loose:
                continue
            loose.add(number)
        elif number in seen[part] or number < 1 or number > LIMITS[part]:
            continue
        else:
            seen[part].add(number)
        close(page_i, y0)
        pending = {
            "exam": exam,
            "part": part,
            "number": number,
            "start_page": page_i,
            "start_y": y0,
        }
    if pending is not None:
        close(doc.page_count - 1, content_bottom(doc[-1]))
    return solutions


def clip_page(page: pymupdf.Page, y0: float, y1: float) -> Image.Image | None:
    rect = pymupdf.Rect(page.rect.x0 + 36, y0 + 0.4, page.rect.x1 - 36, y1 - 3)
    if rect.height < 8 or rect.width < 8:
        return None
    pix = page.get_pixmap(matrix=pymupdf.Matrix(ZOOM, ZOOM), clip=rect, alpha=False)
    return Image.frombytes("RGB", (pix.width, pix.height), pix.samples)


def span_pieces(doc: pymupdf.Document, item: dict) -> list[Image.Image]:
    pieces: list[Image.Image] = []
    for page_i in range(item["start_page"], item["end_page"] + 1):
        page = doc[page_i]
        top = item["start_y"] if page_i == item["start_page"] else HEADER_MAX
        bottom = item["end_y"] if page_i == item["end_page"] else content_bottom(page)
        if page_i == item["end_page"] and item["end_page"] != item["start_page"] and bottom - top < 10:
            continue
        if bottom <= top + 6:
            continue
        image = clip_page(page, top, bottom)
        if image is not None:
            pieces.append(image)
    return pieces


def render_region(doc: pymupdf.Document, item: dict) -> Image.Image:
    pieces: list[Image.Image] = []
    preamble = item.get("preamble")
    if preamble is not None:
        pieces.extend(span_pieces(doc, preamble))
    pieces.extend(span_pieces(doc, item))
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


def region_text(doc: pymupdf.Document, item: dict) -> str:
    chunks: list[str] = []
    for page_i in range(item["start_page"], item["end_page"] + 1):
        page = doc[page_i]
        top = item["start_y"] if page_i == item["start_page"] else HEADER_MAX
        bottom = item["end_y"] if page_i == item["end_page"] else content_bottom(page)
        for y0, y1, text in page_lines(page):
            if y1 < top or y0 > bottom:
                continue
            chunks.append(text)
    return "\n".join(chunks)


def letter_from(text: str) -> str | None:
    match = re.search(r"(?i)(?:đáp\s*án|dap\s*an|chọn|chon)\s*[:.]?\s*([A-D])\b", text)
    if match:
        return match.group(1).upper()
    for line in text.splitlines()[:6]:
        if re.fullmatch(r"[A-D]", line.strip()):
            return line.strip()
    return None


def tf_flag(token: str) -> str:
    raw = token.replace("Đ", "D").replace("đ", "D")
    folded = fold(raw)
    return "D" if folded in {"D", "DUNG"} else "S"


def tf_code(text: str) -> str | None:
    for line in text.splitlines():
        compact = re.sub(r"\s+", "", line)
        match = re.fullmatch(r"(?:Câu\d+[:.])?([ĐDSSđds]{4})", compact)
        if match:
            return "".join(tf_flag(ch) for ch in match.group(1))
    flags = []
    for letter in "abcd":
        found = re.search(rf"(?i){letter}\)\s*(Đúng|Sai|Đ|S)\b", text)
        if not found:
            return None
        flags.append(tf_flag(found.group(1)))
    return "".join(flags)


def answer_box(text: str) -> str:
    """Read a Trả lời digit grid. Each cell is often its own line: 2 / 0 / 4 / 3 or - / 1 / 0."""
    lines = text.splitlines()
    for index, raw in enumerate(lines):
        match = re.match(r"(?i)^tr[aả]\s*l[oờ]i\s*:?\s*(.*)$", raw.strip())
        if not match:
            continue
        chunks: list[str] = []
        first = match.group(1).strip()
        if first:
            chunks.append(first)
        else:
            for follow in lines[index + 1:]:
                token = follow.strip()
                if not token:
                    continue
                if not re.fullmatch(r"[-–−\d,.\s]+", token):
                    break
                chunks.append(token)
        joined = "".join(chunks).replace(" ", "").replace("–", "-").replace("−", "-").replace(".", ",")
        if re.fullmatch(r"-?\d+(?:,\d+)?", joined):
            return joined
    return ""


def leading_number(text: str) -> str:
    compact = text.replace(" ", "").replace("–", "-").replace("−", "-")
    match = re.match(r"-?\d+(?:[.,]\d+)?", compact)
    return match.group(0) if match else ""


def labeled_answer(text: str) -> str:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    for index, line in enumerate(lines):
        match = re.match(r"(?i)^(?:đáp\s*án|dap\s*an|đáp\s*số)\s*[:.]?\s*(.*)$", line)
        if not match:
            continue
        value = match.group(1).strip()
        if not value and index + 1 < len(lines):
            value = lines[index + 1].strip()
        number = leading_number(value)
        if number:
            return number
    return ""


def short_key(text: str) -> str:
    return answer_box(text) or labeled_answer(text)


def table_letters(lines: list[str], count: int) -> list[str]:
    best: list[str] = []
    current: list[str] = []
    for line in lines:
        token = line.strip()
        if re.fullmatch(r"[A-D]", token):
            current.append(token)
            if len(current) >= count:
                return current[:count]
            continue
        if len(current) > len(best):
            best = current
        current = []
    if len(current) > len(best):
        best = current
    return best if len(best) >= max(1, count) else []


def mcq_choices(letter: str) -> list[dict]:
    correct = letter if letter in "ABCD" else "A"
    return [{"label": label, "content": label, "correct": label == correct} for label in "ABCD"]


def tf_choices(flag: str) -> list[dict]:
    is_true = flag == "D"
    return [
        {"label": "Đ", "content": "Đúng", "correct": is_true},
        {"label": "S", "content": "Sai", "correct": not is_true},
    ]


def classify_line(text: str) -> tuple[str, object]:
    number = exam_number(text)
    if number is not None:
        return ("exam", number)
    if is_detail(text):
        return ("detail", None)
    if is_het(text):
        return ("het", None)
    part = part_of(text)
    if part:
        return ("part", part)
    return ("text", text)


def document_rows(doc: pymupdf.Document) -> list[tuple[str, object]]:
    rows: list[tuple[str, object]] = []
    for page in doc:
        bottom = content_bottom(page)
        for y0, _y1, text in page_lines(page):
            if y0 > bottom:
                continue
            rows.append(classify_line(text))
    return rows


def answer_rows_for_exam(rows: list[tuple[str, object]], exam_number_value: int) -> list[tuple[str, object]]:
    """Answer-key lines after this exam's HẾT and before its lời giải or the next đề."""
    if not any(kind == "exam" for kind, _value in rows):
        if exam_number_value != 1:
            return []
        rows = [("exam", 1), *rows]
    exam = None
    started = False
    chosen: list[tuple[str, object]] = []
    for kind, value in rows:
        if kind == "exam":
            if started and exam == exam_number_value:
                break
            exam = int(value)
            started = False
            continue
        if exam != exam_number_value:
            continue
        if kind == "detail":
            break
        if kind == "het":
            started = True
            continue
        if started:
            chosen.append((kind, value))
    return chosen


def short_answer_token(text: str) -> str | None:
    """A filled-in short answer such as ``2,52 mA`` or ``11,6%``. Bare question numbers are not answers."""
    raw = text.strip().replace("–", "-").replace("−", "-")
    match = re.fullmatch(r"(-?\d+(?:[.,]\d+)?)(\s*%|%|\s+[A-Za-zµμΩ°/]+)?", raw)
    if not match:
        return None
    number = match.group(1)
    unit = (match.group(2) or "").strip()
    if re.fullmatch(r"\d{1,2}", number) and not unit:
        return None
    if unit == "%":
        return f"{number}%"
    if unit:
        return f"{number} {unit}"
    return number


def letter_run_after(lines: list[str], start: int) -> list[str]:
    run: list[str] = []
    for line in lines[start:]:
        token = line.strip()
        if re.fullmatch(r"[A-D]", token):
            run.append(token)
            continue
        if run:
            break
    return run


def part1_keys_from(lines: list[str]) -> list[str]:
    part1: list[str] = []
    choosing = False
    for line in lines:
        if line.strip() == "Chọn":
            choosing = True
            part1 = []
            continue
        if choosing and re.fullmatch(r"[A-D]", line.strip()):
            part1.append(line.strip())
        elif choosing and part1:
            break
    if part1:
        return part1
    collected: list[str] = []
    for index, line in enumerate(lines):
        if fold_vi(line) not in {"DAPAN", "DA"}:
            continue
        run = letter_run_after(lines, index + 1)
        if run:
            collected.extend(run)
    if len(collected) >= 4:
        return collected
    return longest_letter_run(lines)


def longest_letter_run(lines: list[str]) -> list[str]:
    best: list[str] = []
    current: list[str] = []
    for line in lines:
        token = line.strip()
        if re.fullmatch(r"[A-D]", token):
            current.append(token)
            continue
        if len(current) > len(best):
            best = current
        current = []
    if len(current) > len(best):
        best = current
    return best


def part2_keys_from(lines: list[str]) -> list[str]:
    buckets: dict[str, list[str]] = {"a": [], "b": [], "c": [], "d": []}
    column = None
    for line in lines:
        stripped = line.strip()
        inline = re.match(r"^([a-d])\)\s*(Đúng|Sai|Đ|S)\b", stripped, re.IGNORECASE)
        if inline:
            buckets[inline.group(1).lower()].append(tf_flag(inline.group(2)))
            column = None
            continue
        header = re.match(r"^([a-d])\)\s*$", stripped, re.IGNORECASE)
        if header:
            column = header.group(1).lower()
            continue
        if column and re.fullmatch(r"(?i)(Đúng|Sai|Đ|S)", stripped):
            buckets[column].append(tf_flag(stripped))
            continue
        column = None
    width = max((len(flags) for flags in buckets.values()), default=0)
    if width:
        return [
            "".join(buckets[letter][index] if index < len(buckets[letter]) else "S" for letter in "abcd")
            for index in range(width)
        ]
    flags = [tf_flag(line.strip()) for line in lines if re.fullmatch(r"(?i)(Đúng|Sai|Đ|S)", line.strip())]
    if len(flags) < 4 or len(flags) % 4 != 0:
        return []
    return ["".join(flags[index:index + 4]) for index in range(0, len(flags), 4)]


def integer_answer(text: str) -> str | None:
    raw = text.strip().replace(" ", "").replace("–", "-").replace("−", "-")
    if re.fullmatch(r"-?\d+(?:[.,]\d+)?", raw):
        return raw
    return short_answer_token(text)


def paired_answer_column(lines: list[str]) -> bool:
    """Official tables alternate «1 / 2,52 mA / 2 / 0,16 mW». A bare 21 is then a real answer, not an index."""
    tokens = [line.strip() for line in lines if line.strip()]
    if len(tokens) < 4 or len(tokens) % 2 != 0:
        return False
    indexes = []
    for index in range(0, len(tokens), 2):
        if not re.fullmatch(r"\d{1,2}", tokens[index]):
            return False
        indexes.append(int(tokens[index]))
    return indexes == list(range(1, len(indexes) + 1))


def part3_keys_from(lines: list[str]) -> list[str]:
    part3: list[str] = []
    choosing = False
    for line in lines:
        if line.strip() == "Chọn":
            choosing = True
            part3 = []
            continue
        token = line.strip().replace(" ", "")
        if choosing and re.fullmatch(r"-?\d+(?:[.,]\d+)?", token):
            part3.append(token)
        elif choosing and part3:
            break
    if part3:
        return part3
    for index, line in enumerate(lines):
        if fold_vi(line) != "DAPAN":
            continue
        tail = lines[index + 1:]
        if paired_answer_column(tail):
            break
        values = []
        for follow in tail:
            token = integer_answer(follow)
            if token:
                values.append(token)
            elif values:
                break
        if values:
            return values
    values: list[str] = []
    for line in lines:
        token = short_answer_token(line)
        if token:
            values.append(token)
    return values


def duration_minutes(part1_count: int, group_count: int, part3_count: int) -> int:
    """Toán 12/4/6 là 90 phút. Lý, Hóa, Sinh, Địa, Sử, Giáo dục, Công nghệ và Ngoại ngữ là 50 phút."""
    if part1_count == 12 and group_count == 4 and part3_count == 6:
        return 90
    return 50


def part_iii_points(part1_count: int, group_count: int, part3_count: int) -> float:
    """Toán (12/4/6) là 0,5 điểm/câu. Lý, Hóa, Sinh, Địa (18/4/6) là 0,25. Sử và Ngoại ngữ không có Phần III."""
    if part3_count <= 0:
        return POINTS["III"]
    remainder = 10 - 0.25 * part1_count - group_count
    each = remainder / part3_count
    quarter = round(each * 4) / 4
    if each > 0 and abs(each - quarter) < 1e-9:
        return quarter
    return POINTS["III"]


def parse_answer_tables(rows: list[tuple[str, object]], exam_number_value: int) -> tuple[list[str], list[str], list[str]]:
    sections: dict[str, list[str]] = {"I": [], "II": [], "III": []}
    current = None
    for kind, value in answer_rows_for_exam(rows, exam_number_value):
        if kind == "part":
            current = str(value)
            continue
        if current and kind == "text":
            sections[current].append(str(value))
    return part1_keys_from(sections["I"]), part2_keys_from(sections["II"]), part3_keys_from(sections["III"])


def save_image(doc: pymupdf.Document, item: dict, dest: Path) -> bool:
    try:
        render_region(doc, item).save(dest, "PNG", optimize=True)
        return True
    except Exception as ex:
        print(f"Không chụp được {dest.name}: {ex}", file=sys.stderr)
        return False


def local_solution(item: dict, counts: list[tuple[str, int]]) -> dict | None:
    """Lời giải numbered Câu 1…22 maps onto Phần I, then II, then III."""
    if item.get("part"):
        return item
    number = int(item["number"])
    cursor = 0
    for part, size in counts:
        if size <= 0:
            continue
        if number <= cursor + size:
            mapped = dict(item)
            mapped["part"] = part
            mapped["number"] = number - cursor
            return mapped
        cursor += size
    return None


def build_bank(doc: pymupdf.Document, out: Path, questions: list[dict], solutions: list[dict]) -> dict:
    by_exam: dict[int, list[dict]] = {}
    for item in questions:
        by_exam.setdefault(item["exam"], []).append(item)
    sols_by_exam: dict[int, list[dict]] = {}
    for item in solutions:
        sols_by_exam.setdefault(item["exam"], []).append(item)
    rows = document_rows(doc)

    exams = []
    for number in sorted(by_exam):
        grouped = {part: [] for part in "I II III".split()}
        for item in by_exam[number]:
            grouped[item["part"]].append(item)
        for part in grouped:
            grouped[part].sort(key=lambda item: item["number"])
        ordered = grouped["I"] + grouped["II"] + grouped["III"]
        counts = [(part, grouped[part][-1]["number"] if grouped[part] else 0) for part in ("I", "II", "III")]
        part_counts = (len(grouped["I"]), len(grouped["II"]), len(grouped["III"]))
        short_points = part_iii_points(*part_counts)
        minutes = duration_minutes(*part_counts)
        raw_sols = sols_by_exam.get(number, [])
        mapped_sols = []
        for item in raw_sols:
            local = item if item.get("part") else local_solution(item, counts)
            if local is not None:
                mapped_sols.append(local)
        sol_index = {(item["part"], item["number"]): item for item in mapped_sols}
        part1_keys, part2_keys, part3_keys = parse_answer_tables(rows, number)
        items = []
        sort = 1
        for question in ordered:
            part = question["part"]
            image_name = f"e{number:02d}-{PART_FILE[part]}-{question['number']:02d}.png"
            if not save_image(doc, question, out / image_name):
                continue
            solution = sol_index.get((part, question["number"]))
            sol_name = None
            sol_text = ""
            if solution is not None:
                sol_name = f"e{number:02d}-sol-{PART_FILE[part]}-{question['number']:02d}.png"
                if save_image(doc, solution, out / sol_name):
                    sol_text = region_text(doc, solution)
                else:
                    sol_name = None
            marker = f"[[img:{image_name}]]"
            expl = f"[[img:{sol_name}]]" if sol_name else ""
            qn = question["number"]
            if part == "I":
                letter = (part1_keys[qn - 1] if qn - 1 < len(part1_keys) else None) or letter_from(sol_text) or "A"
                items.append({
                    "type": QTYPE[part],
                    "section": SECTION[part],
                    "sectionTitle": TITLE[part],
                    "itemLabel": f"I.{question['number']}",
                    "groupKey": f"I.{question['number']}",
                    "stem": marker,
                    "choices": mcq_choices(letter),
                    "answerKey": letter,
                    "explanation": expl,
                    "points": POINTS[part],
                    "sortOrder": sort,
                })
                sort += 1
                continue
            if part == "II":
                code = (part2_keys[qn - 1] if qn - 1 < len(part2_keys) else None) or tf_code(sol_text) or "SSSS"
                code = (code + "SSSS")[:4]
                for offset, statement in enumerate("abcd"):
                    items.append({
                        "type": QTYPE[part],
                        "section": SECTION[part],
                        "sectionTitle": TITLE[part],
                        "itemLabel": f"II.{question['number']}{statement}",
                        "groupKey": f"II.{question['number']}",
                        "stem": marker,
                        "choices": tf_choices(code[offset]),
                        "answerKey": "Đúng" if code[offset] == "D" else "Sai",
                        "explanation": expl,
                        "points": POINTS[part],
                        "sortOrder": sort,
                    })
                    sort += 1
                continue
            items.append({
                "type": QTYPE[part],
                "section": SECTION[part],
                "sectionTitle": TITLE[part],
                "itemLabel": f"III.{question['number']}",
                "groupKey": f"III.{question['number']}",
                "stem": marker,
                "choices": [],
                "answerKey": (part3_keys[qn - 1] if qn - 1 < len(part3_keys) else "") or short_key(sol_text),
                "explanation": expl,
                "points": short_points,
                "sortOrder": sort,
            })
            sort += 1
        if items:
            exams.append({
                "number": number,
                "title": f"Đề số {number}",
                "durationMinutes": minutes,
                "questions": items,
            })
    return {
        "title": "Đề đã tải",
        "academicYear": None,
        "description": (
            "Tổng 10 điểm. Phần I: 0,25/câu. "
            "Phần II: đúng 1 ý 0,1; 2 ý 0,25; 3 ý 0,5; 4 ý 1,0. "
            "Phần III: 0,5 (Toán) hoặc 0,25 (Lý, Hóa, Sinh, Địa)."
        ),
        "exams": exams,
    }


def main() -> None:
    if len(sys.argv) != 3:
        fail("Cách dùng: capture_exam_docx.py <file.docx> <thư-mục-ra>", 1)
    docx = Path(sys.argv[1]).resolve()
    out = Path(sys.argv[2]).resolve()
    if not docx.is_file():
        fail("Không thấy file Word.")
    out.mkdir(parents=True, exist_ok=True)
    pdf = out / "exam.pdf"
    export_pdf(docx, pdf)
    doc = pymupdf.open(pdf)
    questions = collect_questions(doc)
    if not questions:
        fail("Không thấy câu hỏi. File cần Phần I/II/III, dòng Câu N, và lời giải sau HẾT.")
    solutions = collect_solutions(doc)
    bank = build_bank(doc, out, questions, solutions)
    if not bank["exams"]:
        fail("Không chụp được câu hỏi nào trong file.")
    dest = out / "bank.json"
    dest.write_text(json.dumps(bank, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"BANK {dest}")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    main()
