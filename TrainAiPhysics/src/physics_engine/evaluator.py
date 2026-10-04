"""
evaluator.py - Bộ thẩm định và chấm điểm câu trả lời môn Vật Lý thông minh.
Hỗ trợ:
- Tách số và đơn vị vật lý (m/s, cm, m, s, Hz, rad/s, A, mA, V, Ohm, W, kW, J, kJ, atm, Pa, K, °C, eV, u...)
- Kiểm tra dung sai làm tròn (relative tolerance 2.5%)
- Chấm điểm trắc nghiệm 4 đáp án (A, B, C, D)
- Chấm điểm bài tập số học, định lượng có đơn vị vật lý
- Nhận xét sư phạm chi tiết và chỉ ra nguyên nhân lỗi sai.
"""

import re
import math
from typing import Dict, Any, List, Optional


def parse_physical_value(s: str) -> Optional[float]:
    """Trích xuất giá trị số học từ chuỗi câu trả lời của học sinh."""
    clean = s.strip().lower()
    clean = re.sub(r'[a-zA-Z°\\\/Ω\^\(\)\{\}\%\*]+', ' ', clean).strip()
    tokens = re.findall(r'[-+]?\d+(?:\.\d+)?', clean)
    if tokens:
        try:
            return float(tokens[0])
        except Exception:
            pass
    return None


class PhysicsEvaluator:
    """Bộ chấm điểm bài làm Vật Lý AI"""

    @staticmethod
    def evaluate_answer(problem: Dict[str, Any], user_input: str) -> Dict[str, Any]:
        """Thẩm định câu trả lời môn Vật lý của học sinh."""
        raw_user = (user_input or "").strip()
        solution = problem.get("solution", "")
        options = problem.get("options", [])
        correct_option_idx = problem.get("correct_option")
        final_answer = str(problem.get("final_answer", "")).strip()
        numeric_ans_str = str(problem.get("numeric_answer", "")).strip()

        if not raw_user:
            return {
                "is_correct": False,
                "score": 0,
                "feedback": "⚠️ Bạn chưa nhập câu trả lời. Hãy đọc kỹ gợi ý và thử giải nhé!",
                "user_answer": raw_user,
                "correct_answer": final_answer or (options[correct_option_idx] if options and correct_option_idx is not None else ""),
                "solution": solution
            }

        # 1. Trắc nghiệm có danh sách options (A, B, C, D)
        if options and isinstance(options, list) and len(options) > 0:
            user_clean = raw_user.strip()
            opt_letter = user_clean.upper()
            if len(opt_letter) == 1 and opt_letter in ["A", "B", "C", "D"]:
                letter_idx = ord(opt_letter) - ord("A")
                if correct_option_idx is not None and letter_idx == correct_option_idx:
                    return {
                        "is_correct": True,
                        "score": 100,
                        "feedback": f"🎉 **Chính xác tuyệt đối!** Bạn đã chọn đúng đáp án **{opt_letter}** ({options[letter_idx]}).",
                        "user_answer": f"Đáp án {opt_letter}: {options[letter_idx]}",
                        "correct_answer": f"Đáp án {chr(ord('A') + correct_option_idx)}: {options[correct_option_idx]}",
                        "solution": solution
                    }
                else:
                    corr_letter = chr(ord('A') + (correct_option_idx if correct_option_idx is not None else 0))
                    corr_text = options[correct_option_idx] if correct_option_idx is not None and correct_option_idx < len(options) else ""
                    return {
                        "is_correct": False,
                        "score": 0,
                        "feedback": f"❌ **Chưa chính xác.** Đáp án bạn chọn là **{opt_letter}**. Đáp án đúng phải là **{corr_letter}** ({corr_text}).",
                        "user_answer": f"Đáp án {opt_letter}",
                        "correct_answer": f"Đáp án {corr_letter}: {corr_text}",
                        "solution": solution
                    }

            # Kiểm tra so khớp nội dung lựa chọn
            for idx, opt in enumerate(options):
                if user_clean.lower() == opt.lower() or opt.lower() in user_clean.lower() or user_clean.lower() in opt.lower():
                    if correct_option_idx is not None and idx == correct_option_idx:
                        return {
                            "is_correct": True,
                            "score": 100,
                            "feedback": f"🎉 **Chính xác!** Lựa chọn của bạn khớp với phương án đúng **{opt}**.",
                            "user_answer": user_clean,
                            "correct_answer": opt,
                            "solution": solution
                        }

        # 2. Câu hỏi trắc nghiệm Đúng / Sai
        if "đúng" in final_answer.lower() or "sai" in final_answer.lower():
            user_lower = raw_user.lower()
            if "đ" in user_lower or "s" in user_lower or "đúng" in user_lower or "sai" in user_lower:
                is_match = (user_lower in final_answer.lower() or final_answer.lower() in user_lower)
                if is_match:
                    return {
                        "is_correct": True,
                        "score": 100,
                        "feedback": "🎉 **Tuyệt vời!** Bạn đã nhận định hoàn toàn chính xác tính Đúng / Sai của các mệnh đề.",
                        "user_answer": raw_user,
                        "correct_answer": final_answer,
                        "solution": solution
                    }

        # 3. Câu hỏi Số học có đơn vị & Tính toán
        expected_val = parse_physical_value(numeric_ans_str) or parse_physical_value(final_answer)
        user_val = parse_physical_value(raw_user)

        if expected_val is not None and user_val is not None:
            rel_error = abs(user_val - expected_val) / (abs(expected_val) + 1e-9)
            abs_error = abs(user_val - expected_val)

            if abs_error < 1e-3 or rel_error < 0.025:
                return {
                    "is_correct": True,
                    "score": 100,
                    "feedback": f"🎉 **Đáp số chính xác!** Giá trị bạn tính ra là **{user_val}** (Đáp án chuẩn: **{final_answer}**). Kỹ năng tính toán rất tốt!",
                    "user_answer": raw_user,
                    "correct_answer": final_answer,
                    "solution": solution
                }
            else:
                return {
                    "is_correct": False,
                    "score": 0,
                    "feedback": f"❌ **Đáp số chưa khớp.** Giá trị bạn tính là **{user_val}**, trong khi kết quả đúng là **{final_answer}** (sai lệch {abs_error:.2f}). Hãy xem lại các bước đổi đơn vị và áp dụng công thức trong lời giải bên dưới.",
                    "user_answer": raw_user,
                    "correct_answer": final_answer,
                    "solution": solution
                }

        # 4. So sánh chuỗi trực tiếp
        if raw_user.lower() == final_answer.lower():
            return {
                "is_correct": True,
                "score": 100,
                "feedback": "🎉 **Chính xác!** Câu trả lời của bạn hoàn toàn khớp với đáp án.",
                "user_answer": raw_user,
                "correct_answer": final_answer,
                "solution": solution
            }

        return {
            "is_correct": False,
            "score": 0,
            "feedback": f"❌ **Chưa chính xác.** Câu trả lời của bạn: '{raw_user}'. Đáp án chính xác là: **{final_answer}**.",
            "user_answer": raw_user,
            "correct_answer": final_answer,
            "solution": solution
        }
