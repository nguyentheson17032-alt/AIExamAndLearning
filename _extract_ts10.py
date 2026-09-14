import io
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image

DOCX = Path(r"d:\AIExamAndLearning\thuvienhoclieu.com-Bo-30-De-toan-tuyen-sinh-10-nam-25-26-CTM-giai-chi-tiet.docx")
OUT = Path(r"d:\AIExamAndLearning\Backend\src\main\resources\data\ts10-2025-2026.json")
MEDIA_DIR = Path(r"d:\AIExamAndLearning\frontend\public\ts10")
NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
NSM = "{http://schemas.openxmlformats.org/officeDocument/2006/math}"
NSR = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
NSV = "{urn:schemas-microsoft-com:vml}"
NSA = "{http://schemas.openxmlformats.org/drawingml/2006/main}"

USED_MEDIA: set[str] = set()
SNAPSHOT_PART = {"PART_I": "i", "PART_II": "ii", "PART_III": "iii"}


def with_snapshot(exam_num: int, section: str, group_key: str, stem: str) -> str:
    number = int(group_key.split(".")[1])
    marker = f"[[img:/ts10/q/e{exam_num:02d}-{SNAPSHOT_PART[section]}-{number:02d}.png]]"
    if marker in stem:
        return strip_wmf(stem)
    return strip_wmf(f"{marker} {stem}".strip())


def strip_wmf(text: str) -> str:
    cleaned = re.sub(r"\s*\[\[img:/ts10/image\d+\.png\]\]", "", text or "")
    return re.sub(r"[ \t]{2,}", " ", cleaned).strip()


def with_solution(exam_num: int, cau: int) -> str:
    return f"[[img:/ts10/q/e{exam_num:02d}-sol-{cau:02d}.png]]"



def rels_map(archive: zipfile.ZipFile) -> dict[str, str]:
    root = ET.fromstring(archive.read("word/_rels/document.xml.rels"))
    mapping = {}
    for rel in root:
        rid = rel.get("Id")
        target = rel.get("Target")
        if rid and target:
            mapping[rid] = target.replace("\\", "/")
    return mapping


def zip_media_name(target: str) -> str:
    cleaned = target.lstrip("/")
    if cleaned.startswith("word/"):
        return cleaned
    return "word/" + cleaned


def img_marker(target: str) -> str:
    stem = Path(target).stem
    USED_MEDIA.add(zip_media_name(target))
    return f" [[img:/ts10/{stem}.png]] "


def paragraph_line(p_el, rels: dict[str, str]) -> str:
    chunks = []
    for el in p_el.iter():
        tag = el.tag
        if tag in {NS + "t", NSM + "t"}:
            chunks.append(el.text or "")
            continue
        rid = None
        if tag in {NSV + "imagedata", "{urn:schemas-microsoft-com:office:office}imagedata"} or tag.endswith(
            "}imagedata"
        ):
            rid = el.get(NSR + "id")
        elif tag == NSA + "blip" or tag.endswith("}blip"):
            rid = el.get(NSR + "embed")
        if rid and rid in rels:
            chunks.append(img_marker(rels[rid]))
    return re.sub(r" {2,}", " ", "".join(chunks)).strip()


def paragraphs():
    with zipfile.ZipFile(DOCX) as z:
        root = ET.fromstring(z.read("word/document.xml"))
        rels = rels_map(z)
        paras = []
        for p_el in root.iter(NS + "p"):
            line = paragraph_line(p_el, rels)
            if line:
                paras.append(line)
        # Question/solution snapshots in ts10/q replace these WMF exports.
        write_media(z)
    return paras


def write_media(archive: zipfile.ZipFile) -> None:
    return


def exam_blocks(paras):
    starts = []
    for i, line in enumerate(paras):
        m = re.match(r"^Đề số\s+(\d+)\s*$", line)
        if m:
            starts.append((int(m.group(1)), i))
    blocks = {}
    for i, (num, idx) in enumerate(starts):
        end = starts[i + 1][1] if i + 1 < len(starts) else len(paras)
        blocks[num] = paras[idx:end]
    return blocks


def split_question_answer(block):
    het = next((i for i, line in enumerate(block) if "HẾT" in line), len(block))
    return block[:het], block[het:]


def collect_cau_stems(lines, start_pat, stop_pats):
    items = {}
    current = None
    buf = []
    start = re.compile(start_pat)
    stops = [re.compile(p) for p in stop_pats]
    for line in lines:
        if any(s.search(line) for s in stops) and current is not None:
            items[current] = " ".join(buf).strip()
            current = None
            buf = []
            if start.match(line):
                current = int(start.match(line).group(1))
                rest = start.sub("", line).strip(" :")
                buf = [rest] if rest else []
            continue
        m = start.match(line)
        if m:
            if current is not None:
                items[current] = " ".join(buf).strip()
            current = int(m.group(1))
            rest = start.sub("", line).strip(" :")
            buf = [rest] if rest else []
        elif current is not None:
            if re.match(r"^[A-D]\.", line) or re.match(r"^[a-d]\)", line):
                buf.append(line)
            elif not re.match(r"^PHẦN", line):
                buf.append(line)
    if current is not None:
        items[current] = " ".join(buf).strip()
    return items


def parse_part1_keys(answer_lines):
    keys = []
    for i, line in enumerate(answer_lines):
        if line.strip() == "Chọn":
            for nxt in answer_lines[i + 1 :]:
                if re.fullmatch(r"[A-D]", nxt.strip()):
                    keys.append(nxt.strip())
                elif keys:
                    break
            if len(keys) >= 12:
                return keys[:12]
    return keys[:12]


def parse_part2_keys(answer_lines):
    # Prefer "Câu 13: SDSD" style from lời giải
    found = {}
    for line in answer_lines:
        m = re.match(r"^Câu\s+(1[3-6])\s*:\s*([ĐDS]{4})\s*$", line.replace(" ", ""))
        if not m:
            m = re.match(r"^Câu\s+(1[3-6]):\s*([ĐDS]{4})\s*$", line)
        if m:
            found[int(m.group(1))] = m.group(2).replace("Đ", "D")
    if len(found) == 4:
        return [found[n] for n in range(13, 17)]
    # table: a) then 4 letters per row
    rows = []
    current = None
    for line in answer_lines:
        if re.match(r"^[a-d]\)", line):
            current = []
            rows.append(current)
            continue
        if current is not None and re.fullmatch(r"[ĐDS]", line):
            current.append("D" if line == "Đ" else line)
            if len(current) == 4 and len(rows) == 4:
                break
    if len(rows) == 4 and all(len(r) == 4 for r in rows):
        # rows are a,b,c,d; columns are câu 13-16
        return ["".join(rows[r][c] for r in range(4)) for c in range(4)]
    return ["????"] * 4


def parse_part3_keys(answer_lines):
    found = {}
    for line in answer_lines:
        m = re.match(r"^Câu\s+(1[7-9]|2[0-2]):\s*(.+)$", line)
        if m:
            found[int(m.group(1))] = m.group(2).strip()
    if len(found) >= 6:
        return [found[n] for n in range(17, 23)]
    keys = []
    in_part3 = False
    after_chon = False
    for line in answer_lines:
        if "Phần 3" in line or "PHẦN 3" in line or "trả lời ngắn" in line.lower():
            in_part3 = True
            continue
        if in_part3 and line.strip() == "Chọn":
            after_chon = True
            continue
        if after_chon:
            if line.startswith("PHẦN") or line.startswith("Câu 1:") or line.startswith("Câu 17"):
                break
            if re.match(r"^\d+$", line) or re.match(r"^-?\d+[.,]?\d*$", line) or len(keys) < 6:
                if not re.fullmatch(r"Câu", line) and not re.fullmatch(r"\d{2}", line) or True:
                    if re.fullmatch(r"1[7-9]|2[0-2]", line):
                        continue
                    if line in {"Câu"}:
                        continue
                    keys.append(line)
            if len(keys) >= 6:
                break
    return (keys + ["?"] * 6)[:6]


def parse_explanations(answer_lines):
    expl = {}
    current = None
    buf = []
    for line in answer_lines:
        m = re.match(r"^Câu\s+(\d+)\s*:\s*(.*)$", line)
        if m:
            if current is not None:
                expl[current] = "\n".join(buf).strip()
            current = int(m.group(1))
            rest = m.group(2).strip()
            buf = [rest] if rest else []
            continue
        if line.startswith("Lời giải"):
            continue
        if current is not None:
            buf.append(line)
    if current is not None:
        expl[current] = "\n".join(buf).strip()
    return expl


def choices_from_stem(stem, correct_letter):
    found = {}
    for m in re.finditer(r"([A-D])\.\s*(.*?)(?=(?:[A-D]\.|$))", stem):
        found[m.group(1)] = strip_wmf(m.group(2)) or f"Phương án {m.group(1)}"
    out = []
    for label in "ABCD":
        out.append({
            "label": label,
            "content": found.get(label, f"Phương án {label}"),
            "correct": label == correct_letter,
        })
    return out


def tf_choices(correct_true):
    return [
        {"label": "Đ", "content": "Đúng", "correct": correct_true},
        {"label": "S", "content": "Sai", "correct": not correct_true},
    ]


def split_abcd(stem):
    parts = re.split(r"(?=\b[a-d]\))", stem)
    head = parts[0].strip() if parts else stem
    items = {}
    for part in parts[1:]:
        m = re.match(r"([a-d])\)\s*(.*)", part, re.S)
        if m:
            items[m.group(1)] = m.group(2).strip()
    return head, items


def build_exam(num, block):
    questions_lines, answer_lines = split_question_answer(block)
    p1_keys = parse_part1_keys(answer_lines)
    p2_keys = parse_part2_keys(answer_lines)
    p3_keys = parse_part3_keys(answer_lines)
    expl = parse_explanations(answer_lines)

    part1_start = next((i for i, line in enumerate(questions_lines) if line.startswith("PHẦN I")), 0)
    part2_start = next((i for i, line in enumerate(questions_lines) if line.startswith("PHẦN II")), None)
    part3_start = next((i for i, line in enumerate(questions_lines) if line.startswith("PHẦN III")), None)
    p1_lines = questions_lines[part1_start:part2_start]
    p2_lines = questions_lines[part2_start:part3_start] if part2_start is not None else []
    p3_lines = questions_lines[part3_start:] if part3_start is not None else []
    p1_stems = collect_cau_stems(p1_lines, r"^Câu\s+(\d+)\s*:", [r"^PHẦN II", r"^PHẦN III"])
    p2_stems = collect_cau_stems(p2_lines, r"^Câu\s+(\d+)\s*:", [r"^PHẦN III"])
    p3_stems = collect_cau_stems(p3_lines, r"^Câu\s+(\d+)\s*:", [])

    items = []
    sort = 1
    for i in range(1, 13):
        letter = p1_keys[i - 1] if i - 1 < len(p1_keys) else "A"
        stem = p1_stems.get(i) or f"Câu {i} (Phần I) — xem đề gốc nếu công thức bị thiếu."
        items.append({
            "type": "MULTIPLE_CHOICE",
            "section": "PART_I",
            "sectionTitle": "Phần I. Trắc nghiệm nhiều phương án lựa chọn",
            "itemLabel": f"I.{i}",
            "groupKey": f"I.{i}",
            "stem": with_snapshot(num, "PART_I", f"I.{i}", stem),
            "choices": choices_from_stem(stem, letter),
            "answerKey": letter,
            "explanation": with_solution(num, i),
            "points": 0.25,
            "sortOrder": sort,
        })
        sort += 1

    for g in range(1, 5):
        code = p2_keys[g - 1] if g - 1 < len(p2_keys) else "????"
        stem = p2_stems.get(g) or f"Câu {g} (Phần II)."
        head, abcd = split_abcd(stem)
        for idx, letter in enumerate("abcd"):
            flag = code[idx] if idx < len(code) else "?"
            is_true = flag in {"D", "Đ"}
            item_stem = abcd.get(letter)
            if item_stem:
                full = f"{head}\n{letter}) {item_stem}".strip()
            else:
                full = f"{head}\nÝ {letter})".strip()
            items.append({
                "type": "TRUE_FALSE",
                "section": "PART_II",
                "sectionTitle": "Phần II. Trắc nghiệm đúng sai",
                "itemLabel": f"II.{g}{letter}",
                "groupKey": f"II.{g}",
                "stem": with_snapshot(num, "PART_II", f"II.{g}", full),
                "choices": tf_choices(is_true),
                "answerKey": "Đúng" if is_true else "Sai",
                "explanation": with_solution(num, 12 + g),
                "points": 0.25,
                "sortOrder": sort,
            })
            sort += 1

    for i in range(1, 7):
        key = p3_keys[i - 1] if i - 1 < len(p3_keys) else ""
        stem = p3_stems.get(i) or f"Câu {i} (Phần III)."
        items.append({
            "type": "SHORT_ANSWER",
            "section": "PART_III",
            "sectionTitle": "Phần III. Trắc nghiệm trả lời ngắn",
            "itemLabel": f"III.{i}",
            "groupKey": f"III.{i}",
            "stem": with_snapshot(num, "PART_III", f"III.{i}", stem),
            "choices": [],
            "answerKey": key,
            "explanation": with_solution(num, 16 + i),
            "points": 0.5,
            "sortOrder": sort,
        })
        sort += 1

    return {
        "number": num,
        "title": f"Đề số {num}",
        "durationMinutes": 90,
        "questions": items,
        "meta": {
            "part1Keys": p1_keys,
            "part2Keys": p2_keys,
            "part3Keys": p3_keys,
        },
    }


def main():
    paras = paragraphs()
    blocks = exam_blocks(paras)
    exams = [build_exam(n, blocks[n]) for n in range(1, 31)]
    payload = {
        "title": "Bộ 30 đề Toán tuyển sinh 10",
        "academicYear": "2025-2026",
        "description": "Bộ đề Toán tuyển sinh lớp 10 năm học 2025-2026 (CTM), thang điểm 10: Phần I 3 điểm, Phần II 4 điểm, Phần III 3 điểm.",
        "exams": exams,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    missing_p1 = sum(1 for e in exams if len(e["meta"]["part1Keys"]) < 12)
    weird_p2 = sum(1 for e in exams if any(len(k) != 4 for k in e["meta"]["part2Keys"]))
    print("wrote", OUT, "bytes", OUT.stat().st_size)
    print("exams", len(exams), "missing_p1", missing_p1, "weird_p2", weird_p2)
    print("exam1 p1", exams[0]["meta"]["part1Keys"])
    print("exam1 p2", exams[0]["meta"]["part2Keys"])
    print("exam1 p3", exams[0]["meta"]["part3Keys"])
    print("qcount", len(exams[0]["questions"]))
    print("I.1", exams[0]["questions"][0]["stem"][:180])
    print("media", len(USED_MEDIA))


if __name__ == "__main__":
    main()
