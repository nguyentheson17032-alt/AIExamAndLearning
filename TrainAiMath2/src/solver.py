"""
solver.py - Module giải phương trình bậc hai (ax^2 + bx + c = 0) chuẩn giáo khoa.
In chi tiết từng bước giải: xác định hệ số, tính Delta, thế số vào công thức nghiệm và kết luận tập nghiệm S.
"""

import math
import cmath
import sys
from typing import Dict, Any, Tuple

# Ensure UTF-8 printing on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def format_number(val: float) -> str:
    """Định dạng số: nếu là số nguyên thì in dạng int, ngược lại in tối đa 4 chữ số thập phân."""
    if val == int(val):
        return str(int(val))
    return f"{val:.4f}".rstrip('0').rstrip('.')


def format_num_with_paren(val: float) -> str:
    """Nếu số âm thì đóng mở ngoặc (ví dụ: (-1)), số dương giữ nguyên."""
    formatted = format_number(val)
    if val < 0:
        return f"({formatted})"
    return formatted


def format_equation(a: float, b: float, c: float) -> str:
    """Tạo chuỗi biểu diễn phương trình ax^2 + bx + c = 0 đẹp mắt."""
    parts = []

    # Hệ số a (x^2)
    if a != 0:
        if a == 1:
            parts.append("x²")
        elif a == -1:
            parts.append("-x²")
        else:
            parts.append(f"{format_number(a)}x²")

    # Hệ số b (x)
    if b != 0:
        b_str = format_number(abs(b))
        sign = " + " if b > 0 else " - "
        if not parts:  # Nếu là phần tử đầu tiên (khi a = 0)
            sign = "" if b > 0 else "-"
        
        if abs(b) == 1:
            parts.append(f"{sign}x" if parts else ("x" if b > 0 else "-x"))
        else:
            parts.append(f"{sign}{b_str}x" if parts else f"{format_number(b)}x")

    # Hệ số c (hằng số)
    if c != 0:
        c_str = format_number(abs(c))
        sign = " + " if c > 0 else " - "
        if not parts:
            sign = "" if c > 0 else "-"
        parts.append(f"{sign}{c_str}" if parts else f"{format_number(c)}")

    if not parts:
        return "0 = 0"

    eq_left = "".join(parts).strip()
    return f"{eq_left} = 0"


def print_detailed_quadratic_solution(a: float, b: float, c: float, allow_complex: bool = False):
    """
    In lời giải chi tiết từng bước chuẩn giáo khoa Toán học cho phương trình ax^2 + bx + c = 0.
    """
    eq_str = format_equation(a, b, c)

    print("\n" + "=" * 70)
    print(f"ĐỀ BÀI: Tìm tập nghiệm của phương trình {eq_str}")
    print("=" * 70)
    print("CÁCH GIẢI CHI TIẾT:")
    print("-" * 70)

    # ----------------------------------------------------
    # Trường hợp 1: a = 0 (Phương trình bậc nhất bx + c = 0)
    # ----------------------------------------------------
    if a == 0:
        print(f"Vì hệ số a = 0, phương trình trở thành phương trình bậc nhất:")
        print(f"    {format_equation(0, b, c)} (*)")

        if b == 0:
            if c == 0:
                print("  Ta có: 0x = 0 (luôn đúng với mọi x).")
                print(f"👉 Vậy tập nghiệm của phương trình là: S = ℝ")
            else:
                print(f"  Ta có: 0x = {-c} (vô lý).")
                print(f"👉 Vậy phương trình vô nghiệm. Tập nghiệm: S = ∅")
        else:
            x_val = -c / b
            print(f"  <=> {format_number(b)}x = {format_number(-c)}")
            print(f"  <=> x = {format_number(-c)} / {format_num_with_paren(b)}")
            print(f"  <=> x = {format_number(x_val)}")
            print(f"\n👉 Vậy tập nghiệm của phương trình {eq_str} là: S = {{{format_number(x_val)}}}")
        print("=" * 70)
        return

    # ----------------------------------------------------
    # Trường hợp 2: a != 0 (Phương trình bậc hai chuẩn)
    # ----------------------------------------------------
    print(f"Phương trình {eq_str} (*) có các hệ số:")
    print(f"    a = {format_number(a)};  b = {format_number(b)};  c = {format_number(c)}.\n")

    delta = b**2 - 4 * a * c
    b_sq = b**2
    ac_4 = 4 * a * c

    # Dòng tính Delta
    b_part = f"{format_num_with_paren(b)}²"
    ac_part = f"4.{format_num_with_paren(a)}.{format_num_with_paren(c)}"
    delta_str = format_number(delta)

    if delta > 0:
        delta_sign = "> 0"
    elif delta == 0:
        delta_sign = "= 0"
    else:
        delta_sign = "< 0"

    print(f"Ta có: Δ = b² - 4ac = {b_part} - {ac_part} = {format_number(b_sq)} - ({format_number(ac_4)}) = {delta_str} {delta_sign}.\n")

    # Xử lý theo giá trị Delta
    if delta > 0:
        sqrt_d = math.sqrt(delta)
        x1 = (-b - sqrt_d) / (2 * a)
        x2 = (-b + sqrt_d) / (2 * a)

        # Kiểm tra xem căn bậc 2 có phải số chính phương hay không
        is_perfect_square = (sqrt_d == int(sqrt_d))
        sqrt_str = format_number(sqrt_d) if is_perfect_square else f"√{delta_str}"

        print("Phương trình (*) có hai nghiệm phân biệt:\n")

        # Bước thế số x1
        step_x1_sub = f"(-({format_number(b)}) - {sqrt_str}) / (2.{format_num_with_paren(a)})"
        val_x1_str = format_number(x1)
        print(f"  x₁ = (-b - √Δ) / (2a) = {step_x1_sub}")
        if not is_perfect_square:
            print(f"     = (-{format_number(b)} - √{delta_str}) / {format_number(2*a)}  (≈ {val_x1_str})")
        else:
            print(f"     = {val_x1_str}")

        print()

        # Bước thế số x2
        step_x2_sub = f"(-({format_number(b)}) + {sqrt_str}) / (2.{format_num_with_paren(a)})"
        val_x2_str = format_number(x2)
        print(f"  x₂ = (-b + √Δ) / (2a) = {step_x2_sub}")
        if not is_perfect_square:
            print(f"     = (-{format_number(b)} + √{delta_str}) / {format_number(2*a)}  (≈ {val_x2_str})")
        else:
            print(f"     = {val_x2_str}")

        # Kết luận
        print(f"\n👉 Vậy tập nghiệm của phương trình {eq_str} là:")
        if not is_perfect_square:
            exact_1 = f"(-{format_number(b)} - √{delta_str})/{format_number(2*a)}"
            exact_2 = f"(-{format_number(b)} + √{delta_str})/{format_number(2*a)}"
            print(f"   S = {{ {exact_1};  {exact_2} }}")
            print(f"   (hoặc xấp xỉ: S ≈ {{ {val_x1_str}; {val_x2_str} }})")
        else:
            print(f"   S = {{ {val_x1_str}; {val_x2_str} }}")

    elif delta == 0:
        x0 = -b / (2 * a)
        x0_str = format_number(x0)
        print("Phương trình (*) có nghiệm kép:\n")
        print(f"  x₁ = x₂ = -b / (2a) = -({format_number(b)}) / (2.{format_num_with_paren(a)}) = {x0_str}\n")
        print(f"👉 Vậy tập nghiệm của phương trình {eq_str} là: S = {{{x0_str}}}")

    else:  # delta < 0
        if not allow_complex:
            print("Do Δ < 0 nên phương trình (*) vô nghiệm trong tập số thực ℝ.\n")
            print(f"👉 Vậy tập nghiệm của phương trình {eq_str} là: S = ∅")
        else:
            sqrt_d_c = cmath.sqrt(delta)
            x1_c = (-b - sqrt_d_c) / (2 * a)
            x2_c = (-b + sqrt_d_c) / (2 * a)
            print("Do Δ < 0, phương trình (*) có hai nghiệm phức liên hợp:\n")
            print(f"  x₁ = (-b - i√|Δ|) / (2a) = {x1_c.real:.4f} - {abs(x1_c.imag):.4f}i")
            print(f"  x₂ = (-b + i√|Δ|) / (2a) = {x2_c.real:.4f} + {abs(x2_c.imag):.4f}i\n")
            print(f"👉 Vậy tập nghiệm phức của phương trình là: S = {{ {x1_c.real:.4f} - {abs(x1_c.imag):.4f}i;  {x2_c.real:.4f} + {abs(x2_c.imag):.4f}i }}")

    print("=" * 70)


def input_coefficients() -> Tuple[float, float, float]:
    """Hàm nhập a, b, c từ bàn phím với kiểm tra lỗi."""
    while True:
        try:
            val = input("\n👉 Nhập hệ số a (hoặc 'q' để thoát): ").strip()
            if val.lower() in ['q', 'exit', 'quit']:
                return None
            a = float(val)
            b = float(input("👉 Nhập hệ số b: ").strip())
            c = float(input("👉 Nhập hệ số c: ").strip())
            return a, b, c
        except ValueError:
            print("❌ Lỗi: Vui lòng nhập số thực hợp lệ!\n")


if __name__ == "__main__":
    print("=" * 70)
    print("   CHƯƠNG TRÌNH GIẢI CHI TIẾT PHƯƠNG TRÌNH BẬC 2: ax² + bx + c = 0")
    print("=" * 70)

    # Chạy ví dụ minh họa x^2 + 3x - 1 = 0 giống như đề bài mẫu
    print("\n[VÍ DỤ MẪU TỰ ĐỘNG CHẠY]:")
    print_detailed_quadratic_solution(1, 3, -1)

    while True:
        coeffs = input_coefficients()
        if coeffs is None:
            print("\nĐã thoát chương trình. Tạm biệt!")
            break

        a, b, c = coeffs
        print_detailed_quadratic_solution(a, b, c, allow_complex=False)

