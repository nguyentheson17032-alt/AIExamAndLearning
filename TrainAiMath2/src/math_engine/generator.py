"""
generator.py - Bộ sinh bài tập Toán học tự động đa dạng cấp độ và thể loại.
Hỗ trợ:
1. Phương trình bậc 1 (Linear Equations)
2. Phương trình bậc 2 (Quadratic Equations)
3. Hệ phương trình bậc nhất 2 ẩn (Systems of Equations)
4. Phương trình tích & Đa thức / Trùng phương (Polynomials)
5. Bài toán thực tế / Lời văn (Word Problems)
6. Thử nghiệm AI Regression (AI Function Modeling Challenge)
"""

import random
import math
from typing import Dict, Any, List, Optional


def format_num(val: float) -> str:
    """Format float to clean string without trailing .0."""
    if abs(val - round(val)) < 1e-9:
        return str(int(round(val)))
    return f"{val:.4f}".rstrip('0').rstrip('.')


def format_linear(a: float, b: float) -> str:
    """ax + b = 0 format"""
    parts = []
    if a != 0:
        if a == 1:
            parts.append("x")
        elif a == -1:
            parts.append("-x")
        else:
            parts.append(f"{format_num(a)}x")
    if b != 0:
        sign = " + " if b > 0 else " - "
        if not parts:
            sign = "" if b > 0 else "-"
        parts.append(f"{sign}{format_num(abs(b))}")
    if not parts:
        return "0 = 0"
    return f"{''.join(parts).strip()} = 0"


def format_quad(a: float, b: float, c: float) -> str:
    """ax^2 + bx + c = 0 format"""
    parts = []
    if a != 0:
        if a == 1:
            parts.append("x^2")
        elif a == -1:
            parts.append("-x^2")
        else:
            parts.append(f"{format_num(a)}x^2")
    if b != 0:
        sign = " + " if b > 0 else " - "
        if not parts:
            sign = "" if b > 0 else "-"
        if abs(b) == 1:
            parts.append(f"{sign}x")
        else:
            parts.append(f"{sign}{format_num(abs(b))}x")
    if c != 0:
        sign = " + " if c > 0 else " - "
        if not parts:
            sign = "" if c > 0 else "-"
        parts.append(f"{sign}{format_num(abs(c))}")
    if not parts:
        return "0 = 0"
    return f"{''.join(parts).strip()} = 0"


class ExerciseGenerator:
    """AI & Algorithmic Math Problem Generator"""

    @staticmethod
    def generate_linear(difficulty: str = "medium") -> Dict[str, Any]:
        """Sinh bài tập phương trình bậc nhất ax + b = 0 hoặc ax + b = cx + d"""
        if difficulty == "easy":
            a = random.choice([i for i in range(-5, 6) if i != 0])
            root = random.randint(-10, 10)
            b = -a * root
            eq_str = format_linear(a, b)
            question = f"Giải phương trình: $${eq_str}$$"
            sol = f"**Bước 1:** Chuyển vế hằng số tự do:\n" \
                  f"$$ {a}x = {-b} $$\n\n" \
                  f"**Bước 2:** Chia cả hai vế cho ${a}$:\n" \
                  f"$$ x = \\frac{{{-b}}}{{{a}}} = {root} $$\n\n" \
                  f"**Kết luận:** Tập nghiệm của phương trình là $$S = \\{{{root}\\}}$$"
            hints = [
                f"Chuyển số hạng tự do sang vế phải và đổi dấu: ${a}x = {-b}$",
                f"Chia cả 2 vế cho hệ số đi kèm với $x$ (là ${a}$).",
                f"Đáp số là số nguyên $x = {root}$."
            ]
            ans_str = str(root)
            roots = [float(root)]
            plot_info = {"type": "linear", "a": a, "b": b, "roots": roots}
        elif difficulty == "medium":
            # ax + b = cx + d
            x = random.randint(-8, 8)
            a = random.choice([i for i in range(-7, 8) if i != 0])
            c = random.choice([i for i in range(-7, 8) if i != 0 and i != a])
            b = random.randint(-15, 15)
            d = (a - c) * x + b
            eq_str = f"{a}x + {b} = {c}x + {d}".replace("+ -", "- ")
            question = f"Giải phương trình bậc nhất một ẩn:\n$${eq_str}$$"
            sol = f"**Bước 1:** Chuyển các hạng tử chứa $x$ sang vế trái và hằng số sang vế phải:\n" \
                  f"$$ {a}x - ({c}x) = {d} - ({b}) $$\n" \
                  f"$$ ({a - c})x = {d - b} $$\n\n" \
                  f"**Bước 2:** Chia cả 2 vế cho hệ số ${a - c}$:\n" \
                  f"$$ x = \\frac{{{d - b}}}{{{a - c}}} = {x} $$\n\n" \
                  f"**Kết luận:** Tập nghiệm $$S = \\{{{x}\\}}$$"
            hints = [
                f"Nhóm các đơn thức chứa $x$ về vế trái: $({a} - {c})x = {d} - ({b})$",
                f"Rút gọn thành: ${a - c}x = {d - b}$",
                f"Chia 2 vế để tìm ra $x = {x}$"
            ]
            ans_str = str(x)
            roots = [float(x)]
            plot_info = {"type": "linear", "a": a - c, "b": b - d, "roots": roots}
        else:
            # Phân thức hoặc phân số
            x = random.randint(-6, 6)
            m = random.choice([2, 3, 4, 5])
            n = random.choice([2, 3, 5])
            p = random.randint(-5, 5)
            q = random.randint(-5, 5)
            # (x - p)/m + (x - q)/n = C
            lhs_val = (x - p) * n + (x - q) * m
            question = f"Giải phương trình có mẫu số:\n$$\\frac{{x - {p}}}{{{m}}} + \\frac{{x - {q}}}{{{n}}} = \\frac{{{lhs_val}}}{{{m * n}}}$$".replace("- -", "+ ")
            sol = f"**Bước 1:** Quy đồng mẫu số chung là ${m * n}$:\n" \
                  f"$$ {n}(x - {p}) + {m}(x - {q}) = {lhs_val} $$\n\n" \
                  f"**Bước 2:** Khai triển và rút gọn:\n" \
                  f"$$ {n}x - {n * p} + {m}x - {m * q} = {lhs_val} $$\n" \
                  f"$$ ({n + m})x - {n * p + m * q} = {lhs_val} $$\n" \
                  f"$$ {n + m}x = {lhs_val + n * p + m * q} $$\n\n" \
                  f"**Bước 3:** Tìm $x$:\n" \
                  f"$$ x = {x} $$\n\n" \
                  f"**Kết luận:** Nghiệm của phương trình là $x = {x}$."
            hints = [
                f"Mẫu số chung là ${m * n}$. Hãy nhân cả 2 vế với ${m * n}$.",
                f"Phương trình tương đương: ${n}(x - {p}) + {m}(x - {q}) = {lhs_val}$",
                f"Thu gọn đa thức và giải phương trình bậc nhất nhận được $x = {x}$."
            ]
            ans_str = str(x)
            roots = [float(x)]
            plot_info = {"type": "linear", "a": n + m, "b": -(lhs_val + n * p + m * q), "roots": roots}

        # Sinh 4 phương án trắc nghiệm phân biệt
        correct_val = roots[0]
        distractors = set()
        for offset in [-1, 1, -2, 2, 3, -3, 4, -4, 5]:
            cand = correct_val + offset
            if cand != correct_val:
                distractors.add(cand)
            if len(distractors) >= 2:
                break
        if -correct_val != correct_val:
            distractors.add(-correct_val)
        
        distractor_list = list(distractors)
        i = 1
        while len(distractor_list) < 3:
            cand = correct_val + i * 2 + 1
            if cand != correct_val and cand not in distractor_list:
                distractor_list.append(cand)
            i += 1

        options = [f"x = {format_num(correct_val)}"] + [f"x = {format_num(d)}" for d in distractor_list[:3]]
        random.shuffle(options)
        correct_idx = options.index(f"x = {format_num(correct_val)}")

        return {
            "id": f"lin_{random.randint(10000, 99999)}",
            "category": "linear",
            "category_name": "Phương trình bậc nhất",
            "difficulty": difficulty,
            "title": f"Phương trình bậc nhất một ẩn ({difficulty.upper()})",
            "question": question,
            "hints": hints,
            "solution": sol,
            "final_answer": f"x = {ans_str}",
            "numeric_answer": ans_str,
            "roots": roots,
            "options": options,
            "correct_option": correct_idx,
            "plot_info": plot_info
        }

    @staticmethod
    def generate_quadratic(difficulty: str = "medium") -> Dict[str, Any]:
        """Sinh bài tập phương trình bậc hai ax^2 + bx + c = 0"""
        a = random.choice([1, -1, 2, -2, 3])
        
        if difficulty == "easy":
            # 2 nghiệm nguyên đẹp
            x1 = random.randint(-4, 4)
            x2 = random.randint(-4, 4)
            while x2 == x1:
                x2 = random.randint(-5, 5)
            # a(x - x1)(x - x2) = a(x^2 - (x1+x2)x + x1*x2) = 0
            b = -a * (x1 + x2)
            c = a * (x1 * x2)
            delta = b**2 - 4*a*c
            sqrt_delta = int(math.isqrt(int(delta)))
            roots = sorted([float(x1), float(x2)])
            
            eq_str = format_quad(a, b, c)
            question = f"Giải phương trình bậc hai sau trên tập số thực:\n$${eq_str}$$"
            sol = f"**Bước 1: Xác định các hệ số**\n" \
                  f"$$ a = {a}, \\quad b = {b}, \\quad c = {c} $$\n\n" \
                  f"**Bước 2: Tính biệt thức $\\Delta$**\n" \
                  f"$$ \\Delta = b^2 - 4ac = ({b})^2 - 4 \\cdot ({a}) \\cdot ({c}) = {b**2} - ({4*a*c}) = {delta} $$\n\n" \
                  f"Vì $\\Delta = {delta} > 0$ nên phương trình có **2 nghiệm phân biệt**:\n" \
                  f"$$ \\sqrt{{\\Delta}} = \\sqrt{{{delta}}} = {sqrt_delta} $$\n\n" \
                  f"**Bước 3: Áp dụng công thức nghiệm**\n" \
                  f"$$ x_1 = \\frac{{-b + \\sqrt{{\\Delta}}}}{{2a}} = \\frac{{-({b}) + {sqrt_delta}}}{{2 \\cdot ({a})}} = {roots[1]} $$\n" \
                  f"$$ x_2 = \\frac{{-b - \\sqrt{{\\Delta}}}}{{2a}} = \\frac{{-({b}) - {sqrt_delta}}}{{2 \\cdot ({a})}} = {roots[0]} $$\n\n" \
                  f"**Kết luận:** Tập nghiệm của phương trình là $$S = \\{{{roots[0]}, {roots[1]}\\}}$$"
            hints = [
                f"Xác định hệ số $a = {a}, b = {b}, c = {c}$.",
                f"Tính biệt thức $\\Delta = b^2 - 4ac = {delta} > 0$.",
                f"Công thức nghiệm: $x_{{1,2}} = \\frac{{-b \\pm \\sqrt{{\\Delta}}}}{{2a}}$. Hai nghiệm là {roots[0]} và {roots[1]}."
            ]
            ans_str = f"{format_num(roots[0])}, {format_num(roots[1])}"
            plot_info = {"type": "quadratic", "a": a, "b": b, "c": c, "roots": roots, "vertex": [-b / (2 * a), -delta / (4 * a)]}

        elif difficulty == "medium":
            # Nghiệm kép hoặc vô nghiệm thực
            case = random.choice(["double", "no_real", "two_roots"])
            if case == "double":
                x0 = random.randint(-4, 4)
                a = random.choice([1, -1, 2, 4])
                b = -2 * a * x0
                c = a * (x0 ** 2)
                delta = 0
                roots = [float(x0)]
                eq_str = format_quad(a, b, c)
                question = f"Giải phương trình bậc hai:\n$${eq_str}$$"
                sol = f"**Bước 1: Xác định các hệ số**\n" \
                      f"$$ a = {a}, \\quad b = {b}, \\quad c = {c} $$\n\n" \
                      f"**Bước 2: Tính biệt thức $\\Delta$**\n" \
                      f"$$ \\Delta = ({b})^2 - 4 \\cdot ({a}) \\cdot ({c}) = {b**2} - {4*a*c} = 0 $$\n\n" \
                      f"Vì $\\Delta = 0$ nên phương trình có **nghiệm kép**:\n" \
                      f"$$ x_1 = x_2 = -\\frac{{b}}{{2a}} = -\\frac{{{b}}}{{2 \\cdot ({a})}} = {x0} $$\n\n" \
                      f"**Kết luận:** Tập nghiệm $$S = \\{{{x0}\\}}$$"
                hints = [
                    f"Tính biệt thức $\\Delta = b^2 - 4ac$.",
                    f"Nhận xét $\\Delta = 0$ nên có nghiệm kép $x = -b / (2a)$.",
                    f"Nghiệm kép là $x = {x0}$."
                ]
                ans_str = f"{x0}"
                plot_info = {"type": "quadratic", "a": a, "b": b, "c": c, "roots": roots, "vertex": [float(x0), 0.0]}
            elif case == "no_real":
                a = random.choice([1, 2, 3])
                b = random.randint(-3, 3)
                c = random.randint(max(1, int(b**2 / (4*a)) + 1), 10)
                delta = b**2 - 4*a*c
                roots = []
                eq_str = format_quad(a, b, c)
                question = f"Giải phương trình bậc hai trên tập số thực $\\mathbb{{R}}$:\n$${eq_str}$$"
                sol = f"**Bước 1:** Xác định hệ số: $a = {a}, b = {b}, c = {c}$.\n\n" \
                      f"**Bước 2:** Tính biệt thức $\\Delta$:\n" \
                      f"$$ \\Delta = b^2 - 4ac = ({b})^2 - 4({a})({c}) = {delta} < 0 $$\n\n" \
                      f"**Kết luận:** Vì $\\Delta < 0$, phương trình **vô nghiệm trên tập số thực $\\mathbb{{R}}$**.\n" \
                      f"Tập nghiệm: $$S = \\emptyset$$"
                hints = [
                    f"Hệ số $a = {a}, b = {b}, c = {c}$.",
                    f"Biệt thức $\\Delta = ({b})^2 - 4 \\cdot {a} \\cdot {c} = {delta}$.",
                    "Do $\\Delta < 0$ nên kết luận phương trình vô nghiệm thực ($S = \\emptyset$)."
                ]
                ans_str = "Vô nghiệm"
                plot_info = {"type": "quadratic", "a": a, "b": b, "c": c, "roots": [], "vertex": [-b / (2 * a), -delta / (4 * a)]}
            else:
                x1 = random.randint(-5, 5)
                x2 = random.randint(-5, 5)
                while x1 == x2:
                    x2 = random.randint(-5, 5)
                b = -a * (x1 + x2)
                c = a * (x1 * x2)
                delta = b**2 - 4*a*c
                roots = sorted([float(x1), float(x2)])
                eq_str = format_quad(a, b, c)
                question = f"Giải phương trình bậc hai:\n$${eq_str}$$"
                sol = f"Phương trình có $a = {a}, b = {b}, c = {c}$.\n" \
                      f"Biệt thức $\\Delta = {delta} > 0$.\n" \
                      f"Hai nghiệm phân biệt: $x_1 = {roots[0]}, x_2 = {roots[1]}$.\n" \
                      f"Tập nghiệm $S = \\{{{roots[0]}, {roots[1]}\\}}$."
                hints = [f"Tính $\\Delta = {delta}$", f"Áp dụng công thức nghiệm", f"Nghiệm là {roots[0]} và {roots[1]}"]
                ans_str = f"{format_num(roots[0])}, {format_num(roots[1])}"
                plot_info = {"type": "quadratic", "a": a, "b": b, "c": c, "roots": roots, "vertex": [-b / (2 * a), -delta / (4 * a)]}
        else:
            # Dạng nâng cao: Đặt ẩn phụ hoặc hệ số chứa căn
            # ax^4 + bx^2 + c = 0 (Phương trình trùng phương)
            t1 = random.choice([1, 4, 9])
            t2 = random.choice([0, 1, 4])
            while t2 == t1:
                t2 = random.choice([2, 3, 5])
            # (t - t1)(t - t2) = t^2 - (t1+t2)t + t1*t2
            A = 1
            B = -(t1 + t2)
            C = t1 * t2
            eq_str = f"x^4 {format_num(B)}x^2 + {format_num(C)} = 0".replace(" -", " - ").replace(" +", " + ").replace("+-", "- ")
            if B > 0:
                eq_str = f"x^4 + {B}x^2 + {C} = 0"
            else:
                eq_str = f"x^4 - {abs(B)}x^2 + {C} = 0"
            
            real_roots = []
            if t1 >= 0:
                r1 = math.isqrt(t1)
                real_roots.extend([float(-r1), float(r1)])
            if t2 >= 0 and t2 in [0, 1, 4, 9]:
                r2 = math.isqrt(t2)
                if r2 == 0:
                    real_roots.append(0.0)
                else:
                    real_roots.extend([float(-r2), float(r2)])
            real_roots = sorted(list(set(real_roots)))

            question = f"Giải phương trình trùng phương:\n$${eq_str}$$"
            sol = f"**Bước 1: Đặt ẩn phụ**\n" \
                  f"Đặt $t = x^2$ (điều kiện $t \\ge 0$). Phương trình trở thành:\n" \
                  f"$$ t^2 {B:+}t {C:+} = 0 $$\n\n" \
                  f"**Bước 2: Giải phương trình bậc 2 theo $t$**\n" \
                  f"Ta được 2 nghiệm: $t_1 = {t1}$ (nhận), $t_2 = {t2}$ (nhận).\n\n" \
                  f"**Bước 3: Trả về ẩn $x$**\n" \
                  f"- Với $t = {t1} \\implies x^2 = {t1} \\implies x = \\pm {math.isqrt(t1)}$\n" \
                  f"- Với $t = {t2} \\implies x^2 = {t2} \\implies x = \\pm \\sqrt{{{t2}}}$\n\n" \
                  f"**Kết luận:** Tập nghiệm $S = \\{{{', '.join(map(str, real_roots))}\\}}$"
            hints = [
                "Đặt ẩn phụ $t = x^2$ với điều kiện $t \\ge 0$.",
                f"Phương trình bậc 2 theo $t$ có nghiệm $t = {t1}$ và $t = {t2}$.",
                f"Khai căn $x = \\pm \\sqrt{{t}}$ để tìm các nghiệm của $x$."
            ]
            ans_str = ", ".join(map(format_num, real_roots))
            roots = real_roots
            plot_info = {"type": "quartic", "a": A, "b": B, "c": C, "roots": roots}

        # Trắc nghiệm options
        if roots:
            correct_txt = f"S = {{{', '.join(map(format_num, roots))}}}"
            w1 = f"S = {{{', '.join([format_num(-r) for r in roots])}}}"
            w2 = f"S = {{{', '.join([format_num(r + 1) for r in roots])}}}"
            w3 = "S = ∅"
            options = [correct_txt, w1, w2, w3]
        else:
            correct_txt = "S = ∅ (Vô nghiệm)"
            options = [correct_txt, "S = {0}", "S = {1, -1}", "S = ℝ"]
        random.shuffle(options)
        correct_idx = options.index(correct_txt)

        return {
            "id": f"quad_{random.randint(10000, 99999)}",
            "category": "quadratic",
            "category_name": "Phương trình bậc hai",
            "difficulty": difficulty,
            "title": f"Phương trình bậc hai ({difficulty.upper()})",
            "question": question,
            "hints": hints,
            "solution": sol,
            "final_answer": correct_txt,
            "numeric_answer": ans_str,
            "roots": roots,
            "options": options,
            "correct_option": correct_idx,
            "plot_info": plot_info
        }

    @staticmethod
    def generate_system(difficulty: str = "medium") -> Dict[str, Any]:
        """Sinh bài tập Hệ 2 phương trình bậc nhất 2 ẩn"""
        x = random.randint(-5, 5)
        y = random.randint(-5, 5)
        
        a1 = random.choice([1, 2, 3, -1, -2])
        b1 = random.choice([1, -1, 2, 3])
        c1 = a1 * x + b1 * y
        
        a2 = random.choice([2, 3, 4, -2, -3])
        while a1 * 1.0 / a2 == b1 / 1.0 if a2 != 0 else False:
            a2 = random.choice([1, 5, -1])
        b2 = random.choice([1, -1, -2, 2, 3])
        while a1 * b2 == a2 * b1:
            b2 = random.choice([4, -3, 5])
        c2 = a2 * x + b2 * y

        eq1 = f"{a1}x + {b1}y = {c1}".replace("+ -", "- ")
        eq2 = f"{a2}x + {b2}y = {c2}".replace("+ -", "- ")

        question = f"Giải hệ phương trình bậc nhất hai ẩn sau:\n$$\\begin{{cases}} {eq1} \\\\ {eq2} \\end{{cases}}$$"
        
        # Phương pháp cộng đại số
        det = a1 * b2 - a2 * b1
        det_x = c1 * b2 - c2 * b1
        det_y = a1 * c2 - a2 * c1

        sol = f"**Cách 1: Phương pháp định thức Cramer (hoặc cộng đại số)**\n" \
              f"- Tính $D = a_1 b_2 - a_2 b_1 = ({a1})({b2}) - ({a2})({b1}) = {det} \\neq 0$\n" \
              f"- Tính $D_x = c_1 b_2 - c_2 b_1 = ({c1})({b2}) - ({c2})({b1}) = {det_x}$\n" \
              f"- Tính $D_y = a_1 c_2 - a_2 c_1 = ({a1})({c2}) - ({a2})({c1}) = {det_y}$\n\n" \
              f"**Nghiệm duy nhất của hệ phương trình:**\n" \
              f"$$ x = \\frac{{D_x}}{{D}} = \\frac{{{det_x}}}{{{det}}} = {x} $$\n" \
              f"$$ y = \\frac{{D_y}}{{D}} = \\frac{{{det_y}}}{{{det}}} = {y} $$\n\n" \
              f"**Kết luận:** Hệ có nghiệm duy nhất $$(x; y) = ({x}; {y})$$"

        hints = [
            f"Có thể dùng phương pháp thế hoặc cộng đại số để triệt tiêu một ẩn.",
            f"Nhân phương trình (1) và (2) với hệ số thích hợp để cân bằng hệ số của $y$.",
            f"Nghiệm tìm được là $(x; y) = ({x}; {y})$."
        ]

        correct_txt = f"(x; y) = ({x}; {y})"
        w1 = f"(x; y) = ({y}; {x})"
        w2 = f"(x; y) = ({x + 1}; {y - 1})"
        w3 = f"(x; y) = ({-x}; {-y})"
        options = [correct_txt, w1, w2, w3]
        random.shuffle(options)
        correct_idx = options.index(correct_txt)

        return {
            "id": f"sys_{random.randint(10000, 99999)}",
            "category": "system",
            "category_name": "Hệ phương trình bậc nhất",
            "difficulty": difficulty,
            "title": f"Hệ 2 phương trình bậc nhất 2 ẩn ({difficulty.upper()})",
            "question": question,
            "hints": hints,
            "solution": sol,
            "final_answer": correct_txt,
            "numeric_answer": f"x={x}, y={y}",
            "roots": [float(x), float(y)],
            "options": options,
            "correct_option": correct_idx,
            "plot_info": {
                "type": "system",
                "line1": {"a": a1, "b": b1, "c": c1},
                "line2": {"a": a2, "b": b2, "c": c2},
                "intersection": [float(x), float(y)]
            }
        }

    @staticmethod
    def generate_word_problem(difficulty: str = "medium") -> Dict[str, Any]:
        """Sinh bài toán thực tế lập phương trình (Toán chuyển động, năng suất, hình học)"""
        templates = [
            {
                "type": "motion",
                "gen": lambda: ExerciseGenerator._gen_motion_problem()
            },
            {
                "type": "geometry",
                "gen": lambda: ExerciseGenerator._gen_geometry_problem()
            }
        ]
        chosen = random.choice(templates)
        return chosen["gen"]()

    @staticmethod
    def _gen_motion_problem() -> Dict[str, Any]:
        v_can = random.randint(15, 30) # Vận tốc xuôi / cano
        v_dong = random.randint(2, 5)   # Vận tốc dòng nước
        v_xuoi = v_can + v_dong
        v_nguoc = v_can - v_dong
        s = v_xuoi * v_nguoc # Quãng đường km để thời gian là số nguyên
        t_xuoi = s // v_xuoi
        t_nguoc = s // v_nguoc
        t_tong = t_xuoi + t_nguoc

        question = f"Một ca nô xuôi dòng khúc sông dài ${s}\\text{{ km}}$ rồi ngược dòng quay trở lại hết tổng cộng ${t_tong}\\text{{ giờ}}$. " \
                   f"Biết vận tốc của dòng nước là ${v_dong}\\text{{ km/h}}$. " \
                   f"Tính vận tốc thực của ca nô khi nước yên lặng."

        sol = f"**Bước 1: Gọi ẩn và đặt điều kiện**\n" \
              f"Gọi vận tốc thực của ca nô là $x\\text{{ (km/h)}}$, điều kiện $x > {v_dong}$.\n" \
              f"- Vận tốc ca nô khi xuôi dòng: $x + {v_dong}\\text{{ (km/h)}}$\n" \
              f"- Vận tốc ca nô khi ngược dòng: $x - {v_dong}\\text{{ (km/h)}}$\n\n" \
              f"**Bước 2: Lập phương trình theo thời gian**\n" \
              f"- Thời gian xuôi dòng: $\\frac{{{s}}}{{x + {v_dong}}}\\text{{ (giờ)}}$\n" \
              f"- Thời gian ngược dòng: $\\frac{{{s}}}{{x - {v_dong}}}\\text{{ (giờ)}}$\n" \
              f"Theo bài ra ta có phương trình:\n" \
              f"$$ \\frac{{{s}}}{{x + {v_dong}}} + \\frac{{{s}}}{{x - {v_dong}}} = {t_tong} $$\n\n" \
              f"**Bước 3: Giải phương trình**\n" \
              f"Quy đồng khử mẫu:\n" \
              f"$$ {s}(x - {v_dong}) + {s}(x + {v_dong}) = {t_tong}(x^2 - {v_dong**2}) $$\n" \
              f"$$ 2 \\cdot {s} x = {t_tong} x^2 - {t_tong * (v_dong**2)} $$\n" \
              f"$$ {t_tong} x^2 - {2 * s} x - {t_tong * (v_dong**2)} = 0 $$\n" \
              f"Giải phương trình bậc hai trên, ta thu được nghiệm thỏa mãn điều kiện $x > {v_dong}$ là: $$x = {v_can}$$\n\n" \
              f"**Kết luận:** Vận tốc thực của ca nô là **${v_can}\\text{{ km/h}}$**."

        hints = [
            f"Gọi vận tốc thực của ca nô là $x$ ($x > {v_dong}$). Vận tốc xuôi dòng là $x + {v_dong}$, ngược dòng là $x - {v_dong}$.",
            f"Lập phương trình tổng thời gian: $\\frac{{{s}}}{{x + {v_dong}}} + \\frac{{{s}}}{{x - {v_dong}}} = {t_tong}$.",
            f"Quy đồng và giải phương trình bậc hai tìm được $x = {v_can}\\text{{ km/h}}$."
        ]

        correct_txt = f"{v_can} km/h"
        w1 = f"{v_can + 5} km/h"
        w2 = f"{v_can - 4} km/h"
        w3 = f"{v_can + 10} km/h"
        options = [correct_txt, w1, w2, w3]
        random.shuffle(options)

        return {
            "id": f"word_{random.randint(10000, 99999)}",
            "category": "word_problem",
            "category_name": "Toán thực tế / Chuyển động",
            "difficulty": "medium",
            "title": "Bài toán thực tế: Ca nô chuyển động theo dòng nước",
            "question": question,
            "hints": hints,
            "solution": sol,
            "final_answer": f"{v_can} km/h",
            "numeric_answer": str(v_can),
            "roots": [float(v_can)],
            "options": options,
            "correct_option": options.index(correct_txt),
            "plot_info": None
        }

    @staticmethod
    def _gen_geometry_problem() -> Dict[str, Any]:
        w = random.randint(5, 20)
        diff = random.randint(3, 10)
        l = w + diff
        area = w * l
        peri = 2 * (w + l)

        question = f"Một mảnh vườn hình chữ nhật có chu vi bằng ${peri}\\text{{ m}}$ và diện tích bằng ${area}\\text{{ m}}^2$. " \
                   f"Tính chiều dài và chiều rộng của mảnh vườn."

        sol = f"**Bước 1: Nửa chu vi và đặt ẩn**\n" \
              f"Nửa chu vi hình chữ nhật là: $P = {peri} : 2 = {w + l}\\text{{ (m)}}$.\n" \
              f"Gọi chiều rộng là $x\\text{{ (m)}}$ ($0 < x < {w + l}$). Khi đó chiều dài là ${w + l} - x\\text{{ (m)}}$.\n\n" \
              f"**Bước 2: Lập phương trình diện tích**\n" \
              f"$$ x({w + l} - x) = {area} $$\n" \
              f"$$ x^2 - {w + l}x + {area} = 0 $$\n\n" \
              f"**Bước 3: Giải phương trình bậc 2**\n" \
              f"Biệt thức $\\Delta = (-{w + l})^2 - 4(1)({area}) = {(w+l)**2 - 4*area} = {(l - w)**2} > 0$.\n" \
              f"Phương trình có 2 nghiệm: $x_1 = {w}$ và $x_2 = {l}$.\n\n" \
              f"**Kết luận:** Chiều rộng là **${w}\\text{{ m}}$**, chiều dài là **${l}\\text{{ m}}$**."

        hints = [
            f"Nửa chu vi là ${w + l}\\text{{ m}}$. Nếu chiều rộng là $x$ thì chiều dài là ${w + l} - x$.",
            f"Lập phương trình diện tích $x({w + l} - x) = {area}$.",
            f"Giải phương trình bậc 2 tìm được chiều rộng là ${w}\\text{{ m}}$ và chiều dài là ${l}\\text{{ m}}$."
        ]

        correct_txt = f"Dài {l}m, Rộng {w}m"
        w1 = f"Dài {l + 2}m, Rộng {w - 2}m"
        w2 = f"Dài {l - 1}m, Rộng {w + 1}m"
        w3 = f"Dài {l + 5}m, Rộng {w - 3}m"
        options = [correct_txt, w1, w2, w3]
        random.shuffle(options)

        return {
            "id": f"word_{random.randint(10000, 99999)}",
            "category": "word_problem",
            "category_name": "Toán thực tế / Hình học",
            "difficulty": "medium",
            "title": "Bài toán thực tế: Kích thước hình chữ nhật",
            "question": question,
            "hints": hints,
            "solution": sol,
            "final_answer": f"Dài {l}m, Rộng {w}m",
            "numeric_answer": f"{l}, {w}",
            "roots": [float(w), float(l)],
            "options": options,
            "correct_option": options.index(correct_txt),
            "plot_info": None
        }

    @staticmethod
    def generate_ai_challenge() -> Dict[str, Any]:
        """Bài toán thử nghiệm mô hình AI (Linear Regression y = 2x + 1 & MLP y = 2x^2 - 3x + 1)"""
        task_type = random.choice(["linear_ai", "mlp_ai"])
        if task_type == "linear_ai":
            x_test = round(random.uniform(-5.0, 5.0), 2)
            # Hàm chuẩn của phase 1: y = 2x + 1
            y_true = round(2.0 * x_test + 1.0, 4)
            # Giả lập sai số nhẹ của AI đã train (MAE ~ 0.005)
            y_ai = round(y_true + random.gauss(0, 0.008), 4)

            question = f"**[Thử thách AI Model - Tuyến tính]**\n" \
                       f"Mô hình AI Linear Regression được huấn luyện trên hàm ẩn $y = w x + b$.\n" \
                       f"Khi đưa vào đầu vào thực nghiệm $x = {x_test}$, giá trị dự báo chính xác theo hàm số lý thuyết là bao nhiêu? " \
                       f"(Hàm chuẩn: $y = 2x + 1$)."

            sol = f"**Phân tích mô hình AI:**\n" \
                  f"- Hàm mục tiêu: $y = 2x + 1$\n" \
                  f"- Đầu vào: $x = {x_test}$\n" \
                  f"- Giá trị chuẩn lý thuyết: $$y = 2 \\cdot ({x_test}) + 1 = {y_true}$$\n" \
                  f"- Giá trị mô hình PyTorch dự đoán: $\\hat{{y}} \\approx {y_ai}$ (Sai số tuyệt đối: $|y - \\hat{{y}}| \\approx {abs(round(y_true - y_ai, 5))}$)."

            hints = [
                f"Thay trực tiếp $x = {x_test}$ vào phương trình $y = 2x + 1$.",
                f"Tính $2 \\times {x_test} + 1$.",
                f"Đáp án chính xác là ${y_true}$."
            ]
            ans_str = str(y_true)
            options = [str(y_true), str(round(y_true + 1.5, 4)), str(round(y_true - 2.0, 4)), str(round(y_true * 1.2, 4))]
            random.shuffle(options)
            return {
                "id": f"ai_{random.randint(10000, 99999)}",
                "category": "ai_challenge",
                "category_name": "AI Model Challenge",
                "difficulty": "medium",
                "title": "AI Regression: Dự đoán giá trị hàm số tuyến tính",
                "question": question,
                "hints": hints,
                "solution": sol,
                "final_answer": f"y = {y_true}",
                "numeric_answer": ans_str,
                "roots": [y_true],
                "options": options,
                "correct_option": options.index(str(y_true)),
                "plot_info": {"type": "linear", "a": 2, "b": 1, "roots": [-0.5], "ai_point": [x_test, y_true]}
            }
        else:
            x_test = round(random.uniform(-3.0, 3.0), 2)
            # Hàm MLP: y = 2x^2 - 3x + 1
            y_true = round(2.0 * (x_test**2) - 3.0 * x_test + 1.0, 4)
            y_ai = round(y_true + random.gauss(0, 0.02), 4)

            question = f"**[Thử thách AI Model - Phi tuyến MLP]**\n" \
                       f"Mô hình mạng nơ-ron sâu MLP Regression xấp xỉ hàm phi tuyến $y = 2x^2 - 3x + 1$.\n" \
                       f"Tại điểm $x = {x_test}$, hãy tính giá trị chuẩn $y$ và so sánh với phản hồi của AI."

            sol = f"**Phân tích hàm phi tuyến:**\n" \
                  f"- Hàm số: $y = 2x^2 - 3x + 1$\n" \
                  f"- Thay $x = {x_test}$:\n" \
                  f"$$ y = 2 \\cdot ({x_test})^2 - 3 \\cdot ({x_test}) + 1 = 2 \\cdot ({round(x_test**2, 4)}) - ({round(3*x_test, 4)}) + 1 = {y_true} $$\n" \
                  f"- Mô hình Deep MLP ước lượng $\\hat{{y}} = {y_ai}$."

            hints = [
                f"Tính $x^2 = {round(x_test**2, 4)}$.",
                f"Thay vào công thức $2(x^2) - 3x + 1$.",
                f"Đáp án chính xác là ${y_true}$."
            ]
            ans_str = str(y_true)
            options = [str(y_true), str(round(y_true + 3.0, 4)), str(round(y_true - 4.5, 4)), str(round(-y_true, 4))]
            random.shuffle(options)
            return {
                "id": f"ai_{random.randint(10000, 99999)}",
                "category": "ai_challenge",
                "category_name": "AI Model Challenge",
                "difficulty": "hard",
                "title": "AI Deep MLP: Dự đoán hàm số phi tuyến bậc 2",
                "question": question,
                "hints": hints,
                "solution": sol,
                "final_answer": f"y = {y_true}",
                "numeric_answer": ans_str,
                "roots": [0.5, 1.0],
                "options": options,
                "correct_option": options.index(str(y_true)),
                "plot_info": {"type": "quadratic", "a": 2, "b": -3, "c": 1, "roots": [0.5, 1.0], "ai_point": [x_test, y_true]}
            }

    @classmethod
    def generate_batch(cls, category: str = "all", difficulty: str = "medium", count: int = 5, elo: Optional[int] = None, subject_name: str = "Toán học") -> List[Dict[str, Any]]:
        """Sinh một bộ nhiều câu hỏi theo danh mục, độ khó, môn học và Elo"""
        results = []
        generators = {
            "linear": cls.generate_linear,
            "quadratic": cls.generate_quadratic,
            "system": cls.generate_system,
            "word_problem": cls.generate_word_problem,
            "ai_challenge": cls.generate_ai_challenge,
        }

        diff_clean = str(difficulty).lower()
        default_elo = 900 if diff_clean in ["easy", "beginner"] else (1250 if diff_clean in ["hard", "advanced"] else 1050)
        target_elo = int(elo) if elo is not None and int(elo) > 0 else default_elo

        for _ in range(count):
            if category == "all" or category not in generators:
                gen_func = random.choice(list(generators.values()))
            else:
                gen_func = generators[category]
            
            if gen_func in [cls.generate_word_problem, cls.generate_ai_challenge]:
                prob = gen_func()
            else:
                prob = gen_func(difficulty=diff_clean)
            
            prob["eloRating"] = target_elo
            prob["elo"] = target_elo
            prob["subject_name"] = subject_name
            results.append(prob)

        return results
