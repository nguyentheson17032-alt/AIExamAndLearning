"""Paragraph-level checks: a Word file of many Đề số N stays many exams."""
import unittest
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

from capture_exam_docx import (
    answer_rows_for_exam,
    classify_line,
    exam_number,
    is_detail,
    is_het,
    parse_answer_tables,
)

DOCX = Path(__file__).resolve().parents[1] / (
    "thuvienhoclieu.com-Bo-30-De-toan-tuyen-sinh-10-nam-25-26-CTM-giai-chi-tiet.docx"
)
TN_DOCX = Path.home() / "Downloads" / "thuvienhoclieu.com-10-de-on-thi-TN-THPT-2025-mon-Toan (1).docx"


def paragraphs(path: Path) -> list[str]:
    root = ET.fromstring(zipfile.ZipFile(path).read("word/document.xml"))
    lines = []
    for paragraph in root.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p"):
        text = "".join(
            node.text or ""
            for node in paragraph.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t")
        ).strip()
        if text:
            lines.append(text)
    return lines


class CaptureSplitTest(unittest.TestCase):
    def test_markers_ignore_chia_het_and_keep_section_headers(self):
        self.assertIsNone(exam_number("C. Là một số chia hết cho 4"))
        self.assertFalse(is_het("C. Là một số chia hết cho     D. Là số nguyên dương"))
        self.assertTrue(is_het("-------------- HẾT ---------------"))
        self.assertTrue(is_detail("PHẦN LỜI GIẢI"))
        self.assertFalse(is_detail("Lời giải:"))
        self.assertEqual(exam_number("Đề số 2"), 2)
        self.assertEqual(exam_number("Đề số 12 PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn."), 12)
        self.assertEqual(exam_number("ĐỀ THAM KHẢO 01"), 1)
        self.assertEqual(exam_number("ĐỀ THAM KHẢO 06"), 6)
        self.assertIsNone(exam_number("LỜI GIẢI CHI TIẾT ĐỀ SỐ 1"))
        self.assertIsNone(exam_number("PHẦN ĐÁP ÁN ĐỀ 1"))
        self.assertIsNone(exam_number("PHẦN LỜI GIẢI CHI TIẾT ĐỀ 2"))

    @unittest.skipUnless(DOCX.is_file(), "sample multi-exam docx is not in the repo")
    def test_thirty_exams_keep_their_own_answer_keys(self):
        rows = [classify_line(line) for line in paragraphs(DOCX)]
        exams = [int(value) for kind, value in rows if kind == "exam"]
        self.assertEqual(exams, list(range(1, 31)))
        first = parse_answer_tables(rows, 1)
        second = parse_answer_tables(rows, 2)
        self.assertEqual(first[0][:3], ["B", "D", "B"])
        self.assertEqual(len(first[0]), 12)
        self.assertEqual(first[1][0], "SDSD")
        self.assertEqual(first[2][0], "34")
        self.assertTrue(answer_rows_for_exam(rows, 2))
        self.assertNotEqual(first, second)
        self.assertEqual(len(second[0]), 12)

    @unittest.skipUnless(TN_DOCX.is_file(), "TN THPT sample is not in Downloads")
    def test_tham_khao_file_splits_each_practice_exam(self):
        rows = [classify_line(line) for line in paragraphs(TN_DOCX)]
        exams = [int(value) for kind, value in rows if kind == "exam"]
        self.assertEqual(exams, [1, 2, 3, 4, 5, 6])
        first = parse_answer_tables(rows, 1)
        second = parse_answer_tables(rows, 2)
        self.assertEqual(first[0][:3], ["B", "D", "A"])
        self.assertEqual(len(first[0]), 12)
        self.assertEqual(len(first[1]), 4)
        self.assertNotEqual(first[0], second[0])


if __name__ == "__main__":
    unittest.main()
