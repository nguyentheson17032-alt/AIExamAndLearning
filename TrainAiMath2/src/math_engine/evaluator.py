"""
evaluator.py - Bộ thẩm định và chấm điểm câu trả lời của học sinh thông minh.
Hỗ trợ:
- Nhận diện số thực, phân số (ví dụ: 3/2, -1/4), số âm, căn bậc hai
- Nhận diện tập nghiệm (ví dụ: {1, 2}, {2, 1}, 1, 2, "x=1 hoặc x=2")
- Nhận diện hệ phương trình (ví dụ: x=1, y=2 hoặc (1, 2))
- Nhận diện trạng thái "Vô nghiệm" (vo nghiem, rỗng, empty, null)
- Phản hồi chi tiết từng bước & chỉ ra lỗi sai phổ biến
"""

import re
import math
from typing import Dict, Any, List, Optional


def parse_math_value(val_str: str) -> Optional[float]:
    """Parse string to float value supporting fractions and simple expressions."""
    s = val_str.strip().lower().replace(" ", "")
    if not s:
        return None
    try:
        # Check fraction like a/b
        if "/" in s:
            parts = s.split("/")
            if len(parts) == 2:
                return float(parts[0]) / float(parts[1])
        # Check sqrt like sqrt(2) or căn 2
        if "sqrt" in s:
            match = re.search(r"sqrt\(([-+]?[0-9]*\.?[0-9]+)\)", s)
            if match:
                return math.sqrt(float(match.group(1)))
        return float(s)
    except Exception:
        return None


def extract_numbers_from_str(s: str) -> List[float]:
    """Trích xuất tất cả các giá trị số trong chuỗi câu trả lời."""
    # Xử lý phân số trước
    tokens = re.findall(r'[-+]?\d+(?:/\d+)?(?:\.\d+)?', s.replace(" ", ""))
    nums = []
    for t in tokens:
        v = parse_math_value(t)
        if v is not None:
            nums.append(round(v, 4))
    return sorted(nums)


class MathEvaluator:
    """Intelligent Student Answer Evaluator"""

    @staticmethod
    def _deduce_correct_option(options: List[str], problem: Dict[str, Any]) -> Optional[int]:
        """Tự động suy luận vị trí đáp án đúng trong options nếu correct_option bị thiếu."""
        if not options:
            return None

        # 1. So sánh trực tiếp theo final_answer / numeric_answer / answerKey
        for key in ["final_answer", "finalAnswer", "numeric_answer", "numericAnswer", "answerKey", "answer_key"]:
            ans_val = problem.get(key)
            if ans_val is not None:
                clean_target = re.sub(r'[^a-zA-Z0-9\-\+]', '', str(ans_val).lower())
                if clean_target:
                    for idx, opt in enumerate(options):
                        clean_opt = re.sub(r'[^a-zA-Z0-9\-\+]', '', opt.lower())
                        if clean_opt == clean_target or clean_opt.endswith(clean_target) or clean_target.endswith(clean_opt):
                            return idx

        # 2. So sánh theo roots (giữ nguyên thứ tự trước)
        raw_roots = problem.get("roots")
        if raw_roots is not None and isinstance(raw_roots, list) and len(raw_roots) > 0:
            expected_ordered = [round(float(r), 4) for r in raw_roots]
            for idx, opt in enumerate(options):
                tokens = re.findall(r'[-+]?\d+(?:/\d+)?(?:\.\d+)?', opt.replace(" ", ""))
                nums = [round(v, 4) for t in tokens if (v := parse_math_value(t)) is not None]
                if nums and len(nums) == len(expected_ordered):
                    if all(abs(e - u) < 1e-3 for e, u in zip(expected_ordered, nums)):
                        return idx

            # So sánh theo sorted roots
            expected_sorted = sorted(expected_ordered)
            for idx, opt in enumerate(options):
                opt_nums = extract_numbers_from_str(opt)
                if opt_nums and len(opt_nums) == len(expected_sorted):
                    if all(abs(e - u) < 1e-3 for e, u in zip(expected_sorted, opt_nums)):
                        return idx

        # 3. So sánh theo vô nghiệm
        sol_str = str(problem.get("solution", "")).lower()
        if "vô nghiệm" in sol_str or "\\emptyset" in sol_str or "∅" in sol_str:
            for idx, opt in enumerate(options):
                opt_lower = opt.lower()
                if any(t in opt_lower for t in ["∅", "emptyset", "vô nghiệm", "vo nghiem", "rỗng"]):
                    return idx

        return None

    @staticmethod
    def evaluate_answer(problem: Dict[str, Any], user_input: str) -> Dict[str, Any]:
        """
        Chấm điểm câu trả lời của người dùng so với đáp án của problem.
        Trả về:
        - is_correct (bool)
        - score (int: 0-100)
        - feedback (str)
        - user_answer (str)
        - correct_answer (str)
        - solution (str)
        """
        raw = str(user_input).strip()
        lower_input = raw.lower()

        options = problem.get("options") or []
        correct_opt_idx = problem.get("correct_option")
        if correct_opt_idx is None:
            correct_opt_idx = problem.get("correctOption")
        if correct_opt_idx is None and options:
            correct_opt_idx = MathEvaluator._deduce_correct_option(options, problem)

        opt_map = {"a": 0, "b": 1, "c": 2, "d": 3, "0": 0, "1": 1, "2": 2, "3": 3}
        user_chosen_idx: Optional[int] = None
        effective_input = lower_input

        # Chuẩn hóa nếu user_input là dạng "A.", "B:", "C)", "Phương án A", "Đáp án B"
        cleaned_letter = re.sub(r'^(phương án|đáp án|câu|chọn)?\s*([a-d])[\.\:\)\s-].*$', r'\2', lower_input).strip()
        if cleaned_letter in opt_map:
            lower_input = cleaned_letter

        if options:
            if lower_input in opt_map and opt_map[lower_input] < len(options):
                user_chosen_idx = opt_map[lower_input]
                effective_input = options[user_chosen_idx].lower()
            else:
                # 1. Exact match
                clean_user = re.sub(r'[^a-zA-Z0-9\-\+]', '', lower_input)
                for idx, opt in enumerate(options):
                    clean_opt = re.sub(r'[^a-zA-Z0-9\-\+]', '', opt.lower())
                    if clean_user == clean_opt:
                        user_chosen_idx = idx
                        effective_input = opt.lower()
                        break

                # 2. Number value match
                if user_chosen_idx is None:
                    u_nums = extract_numbers_from_str(lower_input)
                    if u_nums:
                        for idx, opt in enumerate(options):
                            opt_nums = extract_numbers_from_str(opt)
                            if opt_nums == u_nums:
                                user_chosen_idx = idx
                                effective_input = opt.lower()
                                break

                # 3. Fuzzy match (only if prefix like "x = ")
                if user_chosen_idx is None and clean_user:
                    for idx, opt in enumerate(options):
                        clean_opt = re.sub(r'[^a-zA-Z0-9\-\+]', '', opt.lower())
                        # Check prefix like "x=" stripped
                        if clean_opt.startswith("x") and clean_opt[1:] == clean_user:
                            user_chosen_idx = idx
                            effective_input = opt.lower()
                            break
                        if clean_user.startswith("x") and clean_user[1:] == clean_opt:
                            user_chosen_idx = idx
                            effective_input = opt.lower()
                            break

        # 1. Trắc nghiệm: Nếu đã xác định được correct_option và phương án người dùng chọn
        if options and correct_opt_idx is not None and 0 <= int(correct_opt_idx) < len(options):
            correct_idx = int(correct_opt_idx)
            correct_opt_text = options[correct_idx]
            correct_label = chr(65 + correct_idx)

            if user_chosen_idx is not None:
                is_correct = (user_chosen_idx == correct_idx)
                return {
                    "is_correct": is_correct,
                    "score": 100 if is_correct else 0,
                    "feedback": "🎉 Chính xác! Bạn đã chọn đúng phương án." if is_correct else f"❌ Chưa chính xác. Đáp án đúng là {correct_label}: {correct_opt_text}",
                    "user_answer": raw,
                    "correct_answer": f"{correct_label}: {correct_opt_text}",
                    "solution": problem.get("solution", "")
                }

        # 2. Xử lý trường hợp bài toán thực sự "Vô nghiệm"
        final_ans_str = str(problem.get("final_answer", problem.get("finalAnswer", ""))).lower()
        sol_str = str(problem.get("solution", "")).lower()
        is_empty_case = (
            "vô nghiệm" in final_ans_str or 
            "vo nghiem" in final_ans_str or 
            "∅" in final_ans_str or 
            "\\emptyset" in final_ans_str or
            "\\emptyset" in sol_str or
            ("roots" in problem and isinstance(problem.get("roots"), list) and len(problem["roots"]) == 0 and "vô nghiệm" in sol_str)
        )

        if is_empty_case:
            user_claims_empty = any(term in effective_input for term in ["vô nghiệm", "vo nghiem", "rong", "rỗng", "empty", "null", "none", "∅", "emptyset"])
            if user_claims_empty:
                return {
                    "is_correct": True,
                    "score": 100,
                    "feedback": "🎉 Chính xác tuyệt đối! Phương trình thực sự vô nghiệm ($S = \\emptyset$).",
                    "user_answer": raw,
                    "correct_answer": problem.get("final_answer", "Vô nghiệm"),
                    "solution": problem.get("solution", "")
                }
            else:
                cat = str(problem.get("category", "")).lower()
                reason = "có biệt thức $\\Delta < 0$ nên " if "quad" in cat else ""
                return {
                    "is_correct": False,
                    "score": 0,
                    "feedback": f"❌ Chưa đúng! Phương trình này {reason}vô nghiệm trên tập số thực ($S = \\emptyset$).",
                    "user_answer": raw,
                    "correct_answer": problem.get("final_answer", "Vô nghiệm"),
                    "solution": problem.get("solution", "")
                }

        # 3. Xử lý so sánh nghiệm số (Roots matching)
        raw_roots = problem.get("roots")
        if raw_roots is not None and isinstance(raw_roots, list) and len(raw_roots) > 0:
            expected_roots = sorted([round(float(r), 4) for r in raw_roots])
            user_nums = extract_numbers_from_str(effective_input)

            if user_nums:
                # So sánh tập hợp nghiệm
                if len(expected_roots) == len(user_nums):
                    all_match = True
                    for exp, usr in zip(expected_roots, sorted(user_nums)):
                        if abs(exp - usr) > 1e-3:
                            all_match = False
                            break
                    if all_match:
                        return {
                            "is_correct": True,
                            "score": 100,
                            "feedback": "🎉 Xuất sắc! Tất cả các nghiệm đều hoàn toàn chính xác.",
                            "user_answer": raw,
                            "correct_answer": problem.get("final_answer", str(expected_roots)),
                            "solution": problem.get("solution", "")
                        }
                elif len(user_nums) < len(expected_roots):
                    # Thiếu nghiệm
                    matched_count = sum(1 for usr in user_nums if any(abs(usr - exp) < 1e-3 for exp in expected_roots))
                    if matched_count > 0:
                        score = int((matched_count / len(expected_roots)) * 70)
                        return {
                            "is_correct": False,
                            "score": score,
                            "feedback": f"⚠️ Bạn đã tìm đúng {matched_count}/{len(expected_roots)} nghiệm, nhưng vẫn còn sót nghiệm! Hãy kiểm tra lại các bước biến đổi.",
                            "user_answer": raw,
                            "correct_answer": problem.get("final_answer", str(expected_roots)),
                            "solution": problem.get("solution", "")
                        }

        # 4. So sánh chuỗi trực tiếp hoặc text chuẩn hóa
        target_ans = str(problem.get("numeric_answer", problem.get("numericAnswer", problem.get("final_answer", ""))))
        clean_user = re.sub(r'[^a-zA-Z0-9\-\+]', '', effective_input)
        clean_ans = re.sub(r'[^a-zA-Z0-9\-\+]', '', target_ans.lower())

        if clean_ans and (clean_ans == clean_user or clean_ans.endswith(clean_user) or clean_user.endswith(clean_ans)):
            return {
                "is_correct": True,
                "score": 100,
                "feedback": "🎉 Tuyệt vời! Kết quả hoàn toàn khớp với đáp án chuẩn.",
                "user_answer": raw,
                "correct_answer": problem.get("final_answer", target_ans),
                "solution": problem.get("solution", "")
            }

        return {
            "is_correct": False,
            "score": 0,
            "feedback": "❌ Kết quả chưa chính xác. Bạn hãy xem lại từng bước biến đổi và so sánh với lời giải chi tiết bên dưới nhé!",
            "user_answer": raw,
            "correct_answer": problem.get("final_answer", target_ans),
            "solution": problem.get("solution", "")
        }
