"""Paragraph-level checks: a Word file of many Đề số N stays many exams."""
import unittest
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

from capture_exam_docx import (
    answer_rows_for_exam,
    classify_line,
    duration_minutes,
    exam_number,
    is_detail,
    is_het,
    labeled_answer,
    parse_answer_tables,
    part1_keys_from,
    part_iii_points,
    shared_targets,
)

DOCX = Path(__file__).resolve().parents[1] / (
    "thuvienhoclieu.com-Bo-30-De-toan-tuyen-sinh-10-nam-25-26-CTM-giai-chi-tiet.docx"
)
TN_DOCX = Path.home() / "Downloads" / "thuvienhoclieu.com-10-de-on-thi-TN-THPT-2025-mon-Toan (1).docx"
PHYSICS_DOCX = Path.home() / "Downloads" / "thuvienhoclieu.com-De-thi-TN-THPT-2026-mon-Vat-Li-Li-Bo-GD-ma-de-0211.docx"
NGHE_AN_DOCX = Path.home() / "Downloads" / "thuvienhoclieu.com-De-thi-thu-Tot-Nghiep-2026-Vat-Li-Lien-Truong-Nghe-An-Lan-5.docx"


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
    def test_official_subject_scores(self):
        self.assertEqual(duration_minutes(12, 4, 6), 90)
        self.assertEqual(part_iii_points(12, 4, 6), 0.5)
        self.assertEqual(duration_minutes(18, 4, 6), 50)
        self.assertEqual(part_iii_points(18, 4, 6), 0.25)
        self.assertEqual(duration_minutes(24, 4, 0), 50)
        self.assertEqual(duration_minutes(40, 0, 0), 50)

    def test_markers_ignore_chia_het_and_keep_section_headers(self):
        self.assertIsNone(exam_number("C. Là một số chia hết cho 4"))
        self.assertFalse(is_het("C. Là một số chia hết cho     D. Là số nguyên dương"))
        self.assertTrue(is_het("-------------- HẾT ---------------"))
        self.assertTrue(is_het("ĐÁP ÁN THAM KHẢO"))
        self.assertFalse(is_het("Đáp án"))
        self.assertFalse(is_het("Đáp án: 5,7 mN"))
        self.assertFalse(is_het("Đáp án cần chọn là: C"))
        self.assertEqual(shared_targets("Sử dụng các thông tin sau cho câu 1 và Câu 2: Có hai cái ống"), [1, 2])
        self.assertEqual(shared_targets("Sử dụng các thông tin sau cho Câu 5 và Câu 6: Một dây dẫn"), [5, 6])
        self.assertIsNone(shared_targets("Câu 4. Một người đang luyện tập"))
        self.assertEqual(labeled_answer("Đáp án: 5,7 mN"), "5,7")
        self.assertEqual(labeled_answer("Đáp án: 163 A"), "163")
        self.assertEqual(labeled_answer("Đáp án: 21 lần/phút"), "21")
        self.assertEqual(labeled_answer("Đáp án: 1,3 lít/s"), "1,3")
        two_rows = [
            "Câu", "1", "2", "3", "4", "5", "6", "7", "8", "9",
            "Đáp án", "D", "B", "C", "C", "A", "A", "B", "D", "A",
            "Câu", "10", "11", "12", "13", "14", "15", "16", "17", "18",
            "Đáp án", "D", "B", "C", "A", "B", "B", "D", "C", "A",
        ]
        self.assertEqual(part1_keys_from(two_rows), list("DBCCAABDADBCABB DCA".replace(" ", "")))
        self.assertTrue(is_detail("PHẦN LỜI GIẢI"))
        self.assertTrue(is_detail("LỜI GIẢI THAM KHẢO"))
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

    @unittest.skipUnless(PHYSICS_DOCX.is_file(), "physics 0211 docx is not in Downloads")
    def test_official_physics_answer_table(self):
        rows = [classify_line(line) for line in paragraphs(PHYSICS_DOCX)]
        part1, part2, part3 = parse_answer_tables(rows, 1)
        self.assertEqual(
            part1,
            list("DCCD AADBBC ADCC DABA".replace(" ", "")),
        )
        self.assertEqual(part2, ["DDSD", "DDSS", "SSSD", "DSSD"])
        self.assertEqual(part3, ["2,52 mA", "0,16 mW", "11,6%", "10,4%", "0,11 kJ", "6,19"])

    @unittest.skipUnless(NGHE_AN_DOCX.is_file(), "Nghệ An physics docx is not in Downloads")
    def test_nghe_an_answer_table_and_short_answers(self):
        rows = [classify_line(line) for line in paragraphs(NGHE_AN_DOCX)]
        part1, part2, part3 = parse_answer_tables(rows, 1)
        self.assertEqual(part1, list("BCDADBAACBBDDBABBA"))
        self.assertEqual(part2, ["SSDD", "DDSD", "SSDD", "SDDS"])
        self.assertEqual(part3, ["3,0", "1,3", "9,7", "21", "163", "5,7"])


if __name__ == "__main__":
    unittest.main()
