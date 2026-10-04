"""
generator.py - Bộ sinh bài tập Vật Lý tự động đa dạng cấp độ, chuyên đề và cấu trúc đề thi.
Hỗ trợ các chuyên đề chuẩn THPT & Tuyển sinh:
1. Cơ học & Động lực học (Mechanics & Dynamics)
2. Dao động & Sóng cơ (Oscillations & Mechanical Waves)
3. Điện học & Mạch xoay chiều RLC (Electricity & Electromagnetism)
4. Quang học & Thấu kính (Optics)
5. Nhiệt học & Khí lý tưởng (Thermodynamics & Ideal Gas)
6. Lượng tử ánh sáng & Vật lý hạt nhân (Quantum & Nuclear Physics)
"""

import random
import math
from typing import Dict, Any, List, Optional


def format_num(val: float) -> str:
    """Định dạng số thực đẹp mắt không dư thừa số 0."""
    if abs(val - round(val)) < 1e-6:
        return str(int(round(val)))
    return f"{val:.4f}".rstrip('0').rstrip('.')


class PhysicsGenerator:
    """Bộ sinh bài tập Vật lý thuật toán thông minh & chính xác."""

    # -------------------------------------------------------------
    # 1. CƠ HỌC & ĐỘNG LỰC HỌC (Mechanics)
    # -------------------------------------------------------------
    @classmethod
    def generate_mechanics(cls, difficulty: str = "medium") -> Dict[str, Any]:
        """Sinh bài tập Cơ học & Động lực học"""
        diff = difficulty.lower()
        if diff in ["easy", "beginner"]:
            v0 = random.choice([0, 5, 10, 15])
            a = random.choice([1.0, 1.5, 2.0, 2.5, 3.0])
            t = random.choice([2, 4, 5, 6, 8, 10])
            v = v0 + a * t
            s = v0 * t + 0.5 * a * (t ** 2)

            mode = random.choice(["velocity", "distance", "force"])
            if mode == "velocity":
                question = f"Một vật chuyển động thẳng nhanh dần đều với vận tốc ban đầu $v_0 = {v0}\\text{{ m/s}}$ và gia tốc $a = {a}\\text{{ m/s}}^2$. Vận tốc của vật sau thời gian $t = {t}\\text{{ s}}$ là bao nhiêu?"
                sol = f"**Phương pháp:** Áp dụng công thức vận tốc của chuyển động thẳng biến đổi đều:\n" \
                      f"$$ v = v_0 + a \\cdot t $$\n" \
                      f"**Thay số:** $v = {v0} + {a} \\times {t} = {format_num(v)}\\text{{ m/s}}$.\n" \
                      f"**Đáp số:** $v = {format_num(v)}\\text{{ m/s}}$."
                ans_str = f"{format_num(v)} m/s"
                num_ans = format_num(v)
                hints = [
                    "Sử dụng công thức vận tốc $v = v_0 + at$.",
                    f"Thay $v_0 = {v0}$, $a = {a}$, $t = {t}$ vào biểu thức.",
                    f"Kết quả là {format_num(v)} m/s."
                ]
                correct_val = format_num(v)
                distractors = [format_num(v + a * 2), format_num(max(0, v - a)), format_num(v0 + a)]
            elif mode == "distance":
                question = f"Một xe ô tô bắt đầu chuyển động ($v_0 = {v0}\\text{{ m/s}}$) với gia tốc $a = {a}\\text{{ m/s}}^2$. Quãng đường ô tô đi được sau $t = {t}\\text{{ s}}$ là:"
                sol = f"**Phương pháp:** Công thức quãng đường trong chuyển động biến đổi đều:\n" \
                      f"$$ s = v_0 t + \\frac{{1}}{{2}} a t^2 $$\n" \
                      f"**Thay số:** $s = {v0} \\times {t} + 0.5 \\times {a} \\times ({t})^2 = {format_num(s)}\\text{{ m}}$.\n" \
                      f"**Đáp số:** $s = {format_num(s)}\\text{{ m}}$."
                ans_str = f"{format_num(s)} m"
                num_ans = format_num(s)
                hints = [
                    "Áp dụng công thức $s = v_0 t + \\frac{1}{2}at^2$.",
                    f"Tính $\\frac{1}{2}at^2 = 0.5 \\times {a} \\times {t}^2 = {format_num(0.5 * a * t * t)}$.",
                    f"Đáp số chuẩn là {format_num(s)} m."
                ]
                correct_val = format_num(s)
                distractors = [format_num(s + 20), format_num(abs(s - 15)), format_num(s * 1.5)]
            else:
                m = random.choice([2, 5, 10, 20])
                F = m * a
                question = f"Tác dụng một lực không đổi $F = {format_num(F)}\\text{{ N}}$ lên một vật có khối lượng $m = {m}\\text{{ kg}}$ đang đứng yên. Bỏ qua ma sát. Gia tốc của vật thu được là:"
                sol = f"**Phương pháp:** Theo định luật II Newton:\n" \
                      f"$$ a = \\frac{{F}}{{m}} $$\n" \
                      f"**Thay số:** $a = \\frac{{{format_num(F)}}}{{{m}}} = {format_num(a)}\\text{{ m/s}}^2$.\n" \
                      f"**Đáp số:** $a = {format_num(a)}\\text{{ m/s}}^2$."
                ans_str = f"{format_num(a)} m/s^2"
                num_ans = format_num(a)
                hints = [
                    "Dùng định luật II Newton: $F = m \\cdot a \\Rightarrow a = F/m$.",
                    f"Chia lực {format_num(F)} cho khối lượng {m}.",
                    f"Đáp số là {format_num(a)} m/s^2."
                ]
                correct_val = format_num(a)
                distractors = [format_num(a * 2), format_num(a + 1.5), format_num(max(0.5, a - 0.8))]

            options = [f"{correct_val} {ans_str.split(' ')[-1]}"] + [f"{d} {ans_str.split(' ')[-1]}" for d in distractors]
            options = list(dict.fromkeys(options))
            while len(options) < 4:
                options.append(f"{format_num(float(correct_val) + len(options) * 3)} {ans_str.split(' ')[-1]}")
            random.shuffle(options)

            return {
                "id": f"phy_mech_{random.randint(10000, 99999)}",
                "category": "mechanics",
                "category_name": "Cơ học & Động lực học",
                "difficulty": "easy",
                "title": "Động học & Định luật II Newton",
                "question": question,
                "hints": hints,
                "solution": sol,
                "final_answer": ans_str,
                "numeric_answer": num_ans,
                "roots": [float(num_ans)],
                "options": options,
                "correct_option": options.index(f"{correct_val} {ans_str.split(' ')[-1]}"),
                "subject_name": "Vật lý"
            }

        elif diff in ["medium", "intermediate"]:
            k = random.choice([50, 100, 200, 400]) # N/m
            m = random.choice([0.1, 0.2, 0.25, 0.4, 0.5]) # kg
            omega = round(math.sqrt(k / m), 2)
            T = round(2 * math.pi / omega, 3)
            A = random.choice([4, 5, 8, 10]) # cm
            W = round(0.5 * k * ((A / 100) ** 2), 4) # Joules

            mode = random.choice(["period", "energy"])
            if mode == "period":
                question = f"Một con lắc lò xo gồm vật nặng khối lượng $m = {m}\\text{{ kg}}$ gắn vào lò xo có độ cứng $k = {k}\\text{{ N/m}}$. Chu kỳ dao động riêng $T$ của con lắc (lấy $\\pi \\approx 3.14$) xấp xỉ bằng:"
                sol = f"**Phương pháp:** Công thức chu kỳ dao động của con lắc lò xo:\n" \
                      f"$$ T = 2\\pi\\sqrt{{\\frac{{m}}{{k}}}} $$\n" \
                      f"**Thay số:** $T = 2 \\times 3.14 \\times \\sqrt{{\\frac{{{m}}}{{{k}}}}} = {T}\\text{{ s}}$.\n" \
                      f"**Đáp số:** $T \\approx {T}\\text{{ s}}$."
                ans_str = f"{T} s"
                num_ans = str(T)
                hints = [
                    "Sử dụng công thức $T = 2\\pi\\sqrt{\\frac{m}{k}}$.",
                    f"Tính $\\frac{m}{k} = \\frac{{{m}}}{{{k}}} = {m/k}$.",
                    f"Chu kỳ dao động xấp xỉ {T} s."
                ]
                correct_val = str(T)
                distractors = [str(round(T * 2, 3)), str(round(T / 2, 3)), str(round(T + 0.35, 3))]
            else:
                question = f"Một con lắc lò xo có độ cứng $k = {k}\\text{{ N/m}}$ dao động điều hòa với biên độ $A = {A}\\text{{ cm}}$. Cơ năng toàn phần của con lắc là:"
                sol = f"**Phương pháp:** Đổi biên độ $A = {A}\\text{{ cm}} = {A/100}\\text{{ m}}$.\n" \
                      f"Công thức cơ năng dao động con lắc lò xo:\n" \
                      f"$$ W = \\frac{{1}}{{2}} k A^2 $$\n" \
                      f"**Thay số:** $W = 0.5 \\times {k} \\times ({A/100})^2 = {W}\\text{{ J}}$.\n" \
                      f"**Đáp số:** $W = {W}\\text{{ J}}$."
                ans_str = f"{W} J"
                num_ans = str(W)
                hints = [
                    f"Đổi biên độ sang mét: $A = {A}\\text{{ cm}} = {A/100}\\text{{ m}}$.",
                    "Áp dụng công thức cơ năng: $W = \\frac{1}{2}kA^2$.",
                    f"Đáp án chính xác là {W} J."
                ]
                correct_val = str(W)
                distractors = [str(round(W * 10, 4)), str(round(W * 0.5, 4)), str(round(W * 4, 4))]

            options = [f"{correct_val} {ans_str.split(' ')[-1]}"] + [f"{d} {ans_str.split(' ')[-1]}" for d in distractors]
            options = list(dict.fromkeys(options))
            while len(options) < 4:
                options.append(f"{format_num(float(correct_val) + len(options) * 0.1)} {ans_str.split(' ')[-1]}")
            random.shuffle(options)

            return {
                "id": f"phy_mech_{random.randint(10000, 99999)}",
                "category": "mechanics",
                "category_name": "Cơ học & Động lực học",
                "difficulty": "medium",
                "title": "Con lắc lò xo & Bảo toàn cơ năng",
                "question": question,
                "hints": hints,
                "solution": sol,
                "final_answer": ans_str,
                "numeric_answer": num_ans,
                "roots": [float(num_ans)],
                "options": options,
                "correct_option": options.index(f"{correct_val} {ans_str.split(' ')[-1]}"),
                "subject_name": "Vật lý"
            }
        else:
            h = random.choice([20, 45, 80, 125]) # m
            g = 10 # m/s^2
            t_fall = round(math.sqrt(2 * h / g), 2)
            v0 = random.choice([10, 15, 20, 25]) # m/s
            L = round(v0 * t_fall, 2) # tầm xa

            question = f"Từ độ cao $h = {h}\\text{{ m}}$ so với mặt đất, một vật được ném theo phương ngang với vận tốc ban đầu $v_0 = {v0}\\text{{ m/s}}$. Lấy $g = 10\\text{{ m/s}}^2$. Bỏ qua sức cản không khí. Tầm bay xa $L$ của vật khi chạm đất là:"
            sol = f"**Bước 1: Tính thời gian rơi chạm đất của vật:**\n" \
                  f"$$ t = \\sqrt{{\\frac{{2h}}{{g}}}} = \\sqrt{{\\frac{{2 \\times {h}}}{{10}}}} = {t_fall}\\text{{ s}} $$\n\n" \
                  f"**Bước 2: Tính tầm bay xa theo phương ngang:**\n" \
                  f"$$ L = v_0 \\cdot t = {v0} \\times {t_fall} = {format_num(L)}\\text{{ m}} $$\n\n" \
                  f"**Đáp số:** $L = {format_num(L)}\\text{{ m}}$."
            ans_str = f"{format_num(L)} m"
            num_ans = format_num(L)
            hints = [
                f"Thời gian rơi phụ thuộc độ cao $h$: $t = \\sqrt{{2h/g}} = {t_fall}\\text{{ s}}$.",
                "Tầm xa bằng vận tốc đầu nhân thời gian rơi: $L = v_0 \\cdot t$.",
                f"Kết quả là {format_num(L)} m."
            ]
            correct_val = format_num(L)
            distractors = [format_num(L + 20), format_num(abs(L - 15)), format_num(L * 1.5)]
            options = [f"{correct_val} m"] + [f"{d} m" for d in distractors]
            options = list(dict.fromkeys(options))
            while len(options) < 4:
                options.append(f"{format_num(float(correct_val) + len(options) * 10)} m")
            random.shuffle(options)

            return {
                "id": f"phy_mech_{random.randint(10000, 99999)}",
                "category": "mechanics",
                "category_name": "Cơ học & Động lực học",
                "difficulty": "hard",
                "title": "Chuyển động ném ngang nâng cao",
                "question": question,
                "hints": hints,
                "solution": sol,
                "final_answer": ans_str,
                "numeric_answer": num_ans,
                "roots": [float(num_ans)],
                "options": options,
                "correct_option": options.index(f"{correct_val} m"),
                "subject_name": "Vật lý"
            }

    # -------------------------------------------------------------
    # 2. DAO ĐỘNG & SÓNG CƠ (Oscillations & Waves)
    # -------------------------------------------------------------
    @classmethod
    def generate_oscillation_wave(cls, difficulty: str = "medium") -> Dict[str, Any]:
        """Sinh bài tập Dao động & Sóng cơ"""
        diff = difficulty.lower()
        if diff in ["easy", "beginner"]:
            A = random.choice([4, 5, 6, 8, 10]) # cm
            f = random.choice([1, 2, 5, 10]) # Hz
            omega = round(2 * math.pi * f, 2)
            vmax = round(omega * A, 2) # cm/s

            question = f"Một chất điểm dao động điều hòa với biên độ $A = {A}\\text{{ cm}}$ và tần số $f = {f}\\text{{ Hz}}$. Tốc độ cực đại $v_{{\\max}}$ của chất điểm trong quá trình dao động (lấy $\\pi \\approx 3.14$) là:"
            sol = f"**Phương pháp:** Tần số góc $\\omega = 2\\pi f = 2 \\times 3.14 \\times {f} = {omega}\\text{{ rad/s}}$.\n" \
                  f"Tốc độ cực đại:\n" \
                  f"$$ v_{{\\max}} = \\omega \\cdot A = {omega} \\times {A} = {vmax}\\text{{ cm/s}} $$\n" \
                  f"**Đáp số:** $v_{{\\max}} = {vmax}\\text{{ cm/s}}$."
            ans_str = f"{vmax} cm/s"
            num_ans = str(vmax)
            hints = [
                "Tính tần số góc $\\omega = 2\\pi f$.",
                "Vận tốc cực đại tại vị trí cân bằng: $v_{\\max} = \\omega A$.",
                f"Đáp số là {vmax} cm/s."
            ]
            correct_val = str(vmax)
            distractors = [str(round(vmax * 2, 2)), str(round(vmax / 2, 2)), str(round(vmax + 12.5, 2))]
            options = [f"{correct_val} cm/s"] + [f"{d} cm/s" for d in distractors]
            options = list(dict.fromkeys(options))
            while len(options) < 4:
                options.append(f"{format_num(float(correct_val) + len(options) * 5)} cm/s")
            random.shuffle(options)

            return {
                "id": f"phy_osc_{random.randint(10000, 99999)}",
                "category": "oscillation_wave",
                "category_name": "Dao động & Sóng cơ",
                "difficulty": "easy",
                "title": "Đặc trưng dao động điều hòa",
                "question": question,
                "hints": hints,
                "solution": sol,
                "final_answer": ans_str,
                "numeric_answer": num_ans,
                "roots": [float(num_ans)],
                "options": options,
                "correct_option": options.index(f"{correct_val} cm/s"),
                "subject_name": "Vật lý"
            }

        elif diff in ["medium", "intermediate"]:
            v = random.choice([20, 40, 60, 100]) # m/s
            f = random.choice([50, 100, 200, 400]) # Hz
            wavelength = round(v / f, 3) # m
            wavelength_cm = round(wavelength * 100, 1) # cm

            question = f"Một sóng cơ hình sin lan truyền trong một môi trường đàn hồi với tốc độ $v = {v}\\text{{ m/s}}$ và tần số $f = {f}\\text{{ Hz}}$. Bước sóng $\\lambda$ của sóng là:"
            sol = f"**Phương pháp:** Công thức tính bước sóng:\n" \
                  f"$$ \\lambda = \\frac{{v}}{{f}} $$\n" \
                  f"**Thay số:** $\\lambda = \\frac{{{v}}}{{{f}}} = {wavelength}\\text{{ m}} = {wavelength_cm}\\text{{ cm}}$.\n" \
                  f"**Đáp số:** $\\lambda = {wavelength_cm}\\text{{ cm}}$ (hoặc ${wavelength}\\text{{ m}}$)."
            ans_str = f"{wavelength_cm} cm"
            num_ans = str(wavelength_cm)
            hints = [
                "Áp dụng công thức liên hệ $\\lambda = v/f = v \\cdot T$.",
                f"Chia vận tốc {v} m/s cho tần số {f} Hz.",
                f"Đáp số bước sóng là {wavelength_cm} cm."
            ]
            correct_val = str(wavelength_cm)
            distractors = [str(round(wavelength_cm * 2, 1)), str(round(wavelength_cm / 2, 1)), str(round(wavelength_cm + 5, 1))]
            options = [f"{correct_val} cm"] + [f"{d} cm" for d in distractors]
            options = list(dict.fromkeys(options))
            while len(options) < 4:
                options.append(f"{format_num(float(correct_val) + len(options) * 4)} cm")
            random.shuffle(options)

            return {
                "id": f"phy_osc_{random.randint(10000, 99999)}",
                "category": "oscillation_wave",
                "category_name": "Dao động & Sóng cơ",
                "difficulty": "medium",
                "title": "Sóng cơ & Truyền sóng",
                "question": question,
                "hints": hints,
                "solution": sol,
                "final_answer": ans_str,
                "numeric_answer": num_ans,
                "roots": [float(num_ans)],
                "options": options,
                "correct_option": options.index(f"{correct_val} cm"),
                "subject_name": "Vật lý"
            }
        else:
            L = random.choice([60, 80, 100, 120]) # cm
            v_wave = random.choice([12, 20, 24, 30]) # m/s
            k_node = random.choice([2, 3, 4, 5]) # số bó sóng
            lam = (2 * L) / k_node # cm
            f_res = round((v_wave * 100) / lam, 1) # Hz

            question = f"Trên một sợi dây đàn hồi dài $L = {L}\\text{{ cm}}$ có hai đầu cố định, người ta tạo ra sóng dừng ổn định với {k_node} bụng sóng (bó sóng). Biết tốc độ truyền sóng trên dây là $v = {v_wave}\\text{{ m/s}}$. Tần số dao động của nguồn sóng là:"
            sol = f"**Bước 1: Xác định bước sóng $\\lambda$:**\n" \
                  f"Điều kiện sóng dừng trên dây 2 đầu cố định: $L = k \\cdot \\frac{{\\lambda}}{{2}}$ (với $k = {k_node}$ là số bụng sóng).\n" \
                  f"$$ \\lambda = \\frac{{2L}}{{k}} = \\frac{{2 \\times {L}}}{{{k_node}}} = {format_num(lam)}\\text{{ cm}} = {format_num(lam/100)}\\text{{ m}} $$\n\n" \
                  f"**Bước 2: Tính tần số dao động $f$:**\n" \
                  f"$$ f = \\frac{{v}}{{\\lambda}} = \\frac{{{v_wave}}}{{{lam/100}}} = {f_res}\\text{{ Hz}} $$\n\n" \
                  f"**Đáp số:** $f = {f_res}\\text{{ Hz}}$."
            ans_str = f"{f_res} Hz"
            num_ans = str(f_res)
            hints = [
                f"Sợi dây 2 đầu cố định có {k_node} bụng sóng $\\Rightarrow L = {k_node} \\frac{{\\lambda}}{{2}}$.",
                f"Tính bước sóng $\\lambda = {lam}\\text{{ cm}} = {lam/100}\\text{{ m}}$.",
                f"Tần số $f = v/\\lambda = {f_res}\\text{{ Hz}}$."
            ]
            correct_val = str(f_res)
            distractors = [str(round(f_res * 1.5, 1)), str(round(f_res * 0.5, 1)), str(round(f_res + 25, 1))]
            options = [f"{correct_val} Hz"] + [f"{d} Hz" for d in distractors]
            options = list(dict.fromkeys(options))
            while len(options) < 4:
                options.append(f"{format_num(float(correct_val) + len(options) * 10)} Hz")
            random.shuffle(options)

            return {
                "id": f"phy_osc_{random.randint(10000, 99999)}",
                "category": "oscillation_wave",
                "category_name": "Dao động & Sóng cơ",
                "difficulty": "hard",
                "title": "Sóng dừng trên dây hai đầu cố định",
                "question": question,
                "hints": hints,
                "solution": sol,
                "final_answer": ans_str,
                "numeric_answer": num_ans,
                "roots": [float(num_ans)],
                "options": options,
                "correct_option": options.index(f"{correct_val} Hz"),
                "subject_name": "Vật lý"
            }

    # -------------------------------------------------------------
    # 3. ĐIỆN HỌC & MẠCH XOAY CHIỀU RLC (Electricity & Electromagnetism)
    # -------------------------------------------------------------
    @classmethod
    def generate_circuits_electromagnetism(cls, difficulty: str = "medium") -> Dict[str, Any]:
        """Sinh bài tập Điện học & Mạch xoay chiều RLC"""
        diff = difficulty.lower()
        if diff in ["easy", "beginner"]:
            U = random.choice([12, 24, 110, 220]) # V
            R = random.choice([10, 20, 40, 50, 100]) # Ohm
            I = round(U / R, 2) # A

            question = f"Đặt một hiệu điện thế không đổi $U = {U}\\text{{ V}}$ vào hai đầu một điện trở thuần $R = {R}\\ \\Omega$. Cường độ dòng điện $I$ chạy qua điện trở là:"
            sol = f"**Phương pháp:** Áp dụng Định luật Ohm cho đoạn mạch thuần trở:\n" \
                  f"$$ I = \\frac{{U}}{{R}} $$\n" \
                  f"**Thay số:** $I = \\frac{{{U}}}{{{R}}} = {I}\\text{{ A}}$.\n" \
                  f"**Đáp số:** $I = {I}\\text{{ A}}$."
            ans_str = f"{I} A"
            num_ans = str(I)
            hints = [
                "Áp dụng định luật Ohm: $I = U/R$.",
                f"Chia {U} cho {R}.",
                f"Đáp số là {I} A."
            ]
            correct_val = str(I)
            distractors = [str(round(I * 2, 2)), str(round(I / 2, 2)), str(round(I + 1.2, 2))]
            options = [f"{correct_val} A"] + [f"{d} A" for d in distractors]
            options = list(dict.fromkeys(options))
            while len(options) < 4:
                options.append(f"{format_num(float(correct_val) + len(options) * 0.5)} A")
            random.shuffle(options)

            return {
                "id": f"phy_elec_{random.randint(10000, 99999)}",
                "category": "circuits_electromagnetism",
                "category_name": "Điện học & Mạch xoay chiều RLC",
                "difficulty": "easy",
                "title": "Định luật Ohm & Mạch điện cơ bản",
                "question": question,
                "hints": hints,
                "solution": sol,
                "final_answer": ans_str,
                "numeric_answer": num_ans,
                "roots": [float(num_ans)],
                "options": options,
                "correct_option": options.index(f"{correct_val} A"),
                "subject_name": "Vật lý"
            }

        elif diff in ["medium", "intermediate"]:
            R = random.choice([30, 40, 60, 80])
            ZL = random.choice([40, 70, 100, 120])
            ZC = random.choice([10, 30, 40, 60])
            Z = round(math.sqrt(R**2 + (ZL - ZC)**2), 2)
            U = random.choice([100, 120, 200, 220])

            question = f"Đặt điện áp xoay chiều $u = {U}\\sqrt{{2}}\\cos(100\\pi t)\\text{{ V}}$ vào hai đầu đoạn mạch RLC nối tiếp gồm $R = {R}\\ \\Omega$, cảm kháng $Z_L = {ZL}\\ \\Omega$ và dung kháng $Z_C = {ZC}\\ \\Omega$. Tổng trở $Z$ của đoạn mạch là:"
            sol = f"**Phương pháp:** Công thức tổng trở của đoạn mạch RLC mắc nối tiếp:\n" \
                  f"$$ Z = \\sqrt{{R^2 + (Z_L - Z_C)^2}} $$\n" \
                  f"**Thay số:** $Z = \\sqrt{{{R}^2 + ({ZL} - {ZC})^2}} = \\sqrt{{{R**2} + {(ZL - ZC)**2}}} = {Z}\\ \\Omega$.\n" \
                  f"**Đáp số:** $Z = {Z}\\ \\Omega$."
            ans_str = f"{Z} Ω"
            num_ans = str(Z)
            hints = [
                "Công thức tổng trở: $Z = \\sqrt{R^2 + (Z_L - Z_C)^2}$.",
                f"Tính $(Z_L - Z_C)^2 = ({ZL} - {ZC})^2 = {(ZL - ZC)**2}$.",
                f"Tổng trở đoạn mạch là {Z} Ω."
            ]
            correct_val = str(Z)
            distractors = [str(round(R + ZL + ZC, 1)), str(round(abs(R + ZL - ZC), 1)), str(round(Z + 20, 1))]
            options = [f"{correct_val} Ω"] + [f"{d} Ω" for d in distractors]
            options = list(dict.fromkeys(options))
            while len(options) < 4:
                options.append(f"{format_num(float(correct_val) + len(options) * 10)} Ω")
            random.shuffle(options)

            return {
                "id": f"phy_elec_{random.randint(10000, 99999)}",
                "category": "circuits_electromagnetism",
                "category_name": "Điện học & Mạch xoay chiều RLC",
                "difficulty": "medium",
                "title": "Tổng trở mạch RLC nối tiếp",
                "question": question,
                "hints": hints,
                "solution": sol,
                "final_answer": ans_str,
                "numeric_answer": num_ans,
                "roots": [float(num_ans)],
                "options": options,
                "correct_option": options.index(f"{correct_val} Ω"),
                "subject_name": "Vật lý"
            }
        else:
            mode = random.choice(["resonance", "transformer"])
            if mode == "resonance":
                R = random.choice([50, 100])
                U = 220
                P_max = round((U ** 2) / R, 1)

                question = f"Đoạn mạch xoay chiều RLC nối tiếp có $R = {R}\\ \\Omega$, cuộn cảm $L$ và tụ điện $C$ thay đổi được. Đặt vào hai đầu mạch điện áp hiệu dụng $U = {U}\\text{{ V}}$. Khi điều chỉnh điện dung $C$ để trong mạch xảy ra hiện tượng cộng hưởng điện, công suất tiêu thụ cực đại $P_{{\\max}}$ của mạch là:"
                sol = f"**Phương pháp:** Khi mạch xảy ra hiện tượng cộng hưởng điện:\n" \
                      f"- Dung kháng bằng cảm kháng: $Z_L = Z_C$.\n" \
                      f"- Tổng trở đạt giá trị nhỏ nhất: $Z_{{\\min}} = R$.\n" \
                      f"- Hệ số công suất $\\cos\\varphi = 1$.\n\n" \
                      f"Công suất cực đại:\n" \
                      f"$$ P_{{\\max}} = \\frac{{U^2}}{{R}} = \\frac{{{U}^2}}{{{R}}} = {P_max}\\text{{ W}} $$\n" \
                      f"**Đáp số:** $P_{{\\max}} = {P_max}\\text{{ W}}$."
                ans_str = f"{P_max} W"
                num_ans = str(P_max)
                hints = [
                    "Khi cộng hưởng điện thì $Z_{\\min} = R$ và $\\cos\\varphi = 1$.",
                    "Công thức công suất cực đại: $P_{\\max} = \\frac{U^2}{R}$.",
                    f"Kết quả là {P_max} W."
                ]
                correct_val = str(P_max)
                distractors = [str(round(P_max / 2, 1)), str(round(P_max * 2, 1)), str(round(P_max + 120, 1))]
                unit = "W"
            else:
                N1 = random.choice([1000, 2000, 2200])
                N2 = random.choice([50, 100, 200])
                U1 = 220
                U2 = round(U1 * (N2 / N1), 2)

                question = f"Một máy biến áp lý tưởng có số vòng dây cuộn sơ cấp $N_1 = {N1}\\text{{ vòng}}$, cuộn thứ cấp $N_2 = {N2}\\text{{ vòng}}$. Đặt vào hai đầu cuộn sơ cấp điện áp xoay chiều hiệu dụng $U_1 = {U1}\\text{{ V}}$. Điện áp hiệu dụng $U_2$ ở hai đầu cuộn thứ cấp để hở là:"
                sol = f"**Phương pháp:** Áp dụng hệ thức máy biến áp lý tưởng:\n" \
                      f"$$ \\frac{{U_2}}{{U_1}} = \\frac{{N_2}}{{N_1}} \\Rightarrow U_2 = U_1 \\cdot \\frac{{N_2}}{{N_1}} $$\n" \
                      f"**Thay số:** $U_2 = {U1} \\times \\frac{{{N2}}}{{{N1}}} = {U2}\\text{{ V}}$.\n" \
                      f"**Đáp số:** $U_2 = {U2}\\text{{ V}}$."
                ans_str = f"{U2} V"
                num_ans = str(U2)
                hints = [
                    "Dùng hệ thức máy biến áp: $\\frac{U_1}{U_2} = \\frac{N_1}{N_2}$.",
                    f"Rút ra $U_2 = U_1 \\cdot \\frac{{{N2}}}{{{N1}}}$.",
                    f"Đáp số là {U2} V."
                ]
                correct_val = str(U2)
                distractors = [str(round(U2 * 2, 2)), str(round(U2 / 2, 2)), str(round(U2 + 5, 2))]
                unit = "V"

            options = [f"{correct_val} {unit}"] + [f"{d} {unit}" for d in distractors]
            options = list(dict.fromkeys(options))
            while len(options) < 4:
                options.append(f"{format_num(float(correct_val) + len(options) * 5)} {unit}")
            random.shuffle(options)

            return {
                "id": f"phy_elec_{random.randint(10000, 99999)}",
                "category": "circuits_electromagnetism",
                "category_name": "Điện học & Mạch xoay chiều RLC",
                "difficulty": "hard",
                "title": "Cộng hưởng điện & Máy biến áp nâng cao",
                "question": question,
                "hints": hints,
                "solution": sol,
                "final_answer": ans_str,
                "numeric_answer": num_ans,
                "roots": [float(num_ans)],
                "options": options,
                "correct_option": options.index(f"{correct_val} {unit}"),
                "subject_name": "Vật lý"
            }

    # -------------------------------------------------------------
    # 4. QUANG HỌC & THẤU KÍNH (Optics)
    # -------------------------------------------------------------
    @classmethod
    def generate_optics(cls, difficulty: str = "medium") -> Dict[str, Any]:
        """Sinh bài tập Quang học & Thấu kính"""
        diff = difficulty.lower()
        if diff in ["easy", "beginner"]:
            n1 = 1.0
            n2 = random.choice([1.33, 1.5, 1.6])
            i_deg = random.choice([30, 45, 60])
            sin_i = math.sin(math.radians(i_deg))
            sin_r = sin_i / n2
            r_deg = round(math.degrees(math.asin(sin_r)), 1)

            question = f"Một tia sáng truyền từ không khí ($n_1 = 1$) vào một khối chất trong suốt có chiết suất $n_2 = {n2}$ với góc tới $i = {i_deg}^\\circ$. Góc khúc xạ $r$ của tia sáng trong môi trường xấp xỉ bằng:"
            sol = f"**Phương pháp:** Áp dụng Định luật khúc xạ ánh sáng (Định luật Snell):\n" \
                  f"$$ n_1 \\sin i = n_2 \\sin r \\Rightarrow \\sin r = \\frac{{n_1 \\sin i}}{{n_2}} $$\n" \
                  f"**Thay số:** $\\sin r = \\frac{{1 \\times \\sin({i_deg}^\\circ)}}{{{n2}}} = \\frac{{{round(sin_i, 4)}}}{{{n2}}} \\approx {round(sin_r, 4)}$.\n" \
                  f"Suy ra $r = \\arcsin({round(sin_r, 4)}) \\approx {r_deg}^\\circ$.\n" \
                  f"**Đáp số:** $r \\approx {r_deg}^\\circ$."
            ans_str = f"{r_deg}°"
            num_ans = str(r_deg)
            hints = [
                "Áp dụng định luật khúc xạ ánh sáng: $n_1 \\sin i = n_2 \\sin r$.",
                f"Tính $\\sin r = \\frac{{\\sin({i_deg}^\\circ)}}{{{n2}}}$.",
                f"Góc khúc xạ tìm được là {r_deg}°."
            ]
            correct_val = str(r_deg)
            distractors = [str(round(r_deg + 10, 1)), str(round(abs(r_deg - 8), 1)), str(round(i_deg - 5, 1))]
            options = [f"{correct_val}°"] + [f"{d}°" for d in distractors]
            options = list(dict.fromkeys(options))
            while len(options) < 4:
                options.append(f"{format_num(float(correct_val) + len(options) * 3)}°")
            random.shuffle(options)

            return {
                "id": f"phy_opt_{random.randint(10000, 99999)}",
                "category": "optics",
                "category_name": "Quang học & Thấu kính",
                "difficulty": "easy",
                "title": "Định luật khúc xạ ánh sáng",
                "question": question,
                "hints": hints,
                "solution": sol,
                "final_answer": ans_str,
                "numeric_answer": num_ans,
                "roots": [float(num_ans)],
                "options": options,
                "correct_option": options.index(f"{correct_val}°"),
                "subject_name": "Vật lý"
            }

        elif diff in ["medium", "intermediate"]:
            f = random.choice([10, 15, 20])
            d = random.choice([30, 40, 60])
            d_prime = round((d * f) / (d - f), 2)
            k = round(-d_prime / d, 2)

            question = f"Một vật sáng phẳng nhỏ $AB$ đặt vuông góc với trục chính của một thấu kính hội tụ có tiêu cự $f = {f}\\text{{ cm}}$, cách thấu kính một khoảng $d = {d}\\text{{ cm}}$. Vị trí ảnh $d'$ của vật qua thấu kính là:"
            sol = f"**Phương pháp:** Áp dụng công thức vị trí ảnh của thấu kính mỏng:\n" \
                  f"$$ \\frac{{1}}{{f}} = \\frac{{1}}{{d}} + \\frac{{1}}{{d'}} \\Rightarrow d' = \\frac{{d \\cdot f}}{{d - f}} $$\n" \
                  f"**Thay số:** $d' = \\frac{{{d} \\times {f}}}{{{d} - {f}}} = \\frac{{{d * f}}}{{{d - f}}} = {d_prime}\\text{{ cm}}$.\n" \
                  f"Vì $d' > 0$ nên đây là ảnh thật hứng được trên màn.\n" \
                  f"**Đáp số:** $d' = {d_prime}\\text{{ cm}}$."
            ans_str = f"{d_prime} cm"
            num_ans = str(d_prime)
            hints = [
                "Sử dụng công thức thấu kính: $\\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d'}$.",
                f"Rút ra $d' = \\frac{{d \\cdot f}}{{d - f}} = \\frac{{{d} \\times {f}}}{{{d - f}}}$.",
                f"Ảnh cách thấu kính {d_prime} cm."
            ]
            correct_val = str(d_prime)
            distractors = [str(round(d_prime * 1.5, 2)), str(round(abs(d_prime - 10), 2)), str(round(d_prime + 15, 2))]
            options = [f"{correct_val} cm"] + [f"{d_opt} cm" for d_opt in distractors]
            options = list(dict.fromkeys(options))
            while len(options) < 4:
                options.append(f"{format_num(float(correct_val) + len(options) * 5)} cm")
            random.shuffle(options)

            return {
                "id": f"phy_opt_{random.randint(10000, 99999)}",
                "category": "optics",
                "category_name": "Quang học & Thấu kính",
                "difficulty": "medium",
                "title": "Vị trí & Tính chất ảnh qua Thấu kính",
                "question": question,
                "hints": hints,
                "solution": sol,
                "final_answer": ans_str,
                "numeric_answer": num_ans,
                "roots": [float(num_ans)],
                "options": options,
                "correct_option": options.index(f"{correct_val} cm"),
                "subject_name": "Vật lý"
            }
        else:
            f = random.choice([20, 25, 50])
            D = round(100 / f, 2)
            d = random.choice([10, 12, 15])
            d_prime = round((d * f) / (d - f), 2)

            question = f"Một thấu kính hội tụ có tiêu cự $f = {f}\\text{{ cm}}$. Một vật thật đặt trước thấu kính cách thấu kính $d = {d}\\text{{ cm}}$. Độ tụ $D$ của thấu kính và tính chất ảnh $d'$ thu được lần lượt là:"
            sol = f"**Bước 1: Tính độ tụ $D$:**\n" \
                  f"$$ D = \\frac{{1}}{{f(\\text{{m}})}} = \\frac{{1}}{{{f/100}}} = +{format_num(D)}\\text{{ dp}} $$\n\n" \
                  f"**Bước 2: Xác định vị trí và tính chất ảnh:**\n" \
                  f"$$ d' = \\frac{{d \\cdot f}}{{d - f}} = \\frac{{{d} \\times {f}}}{{{d} - {f}}} = {d_prime}\\text{{ cm}} $$\n" \
                  f"Do $d' = {d_prime}\\text{{ cm}} < 0$ nên ảnh thu được là **ảnh ảo**, cùng chiều và lớn hơn vật.\n" \
                  f"**Đáp số:** $D = +{format_num(D)}\\text{{ dp}}$ và $d' = {d_prime}\\text{{ cm}}$ (ảnh ảo)."
            ans_str = f"D = +{format_num(D)} dp; d' = {d_prime} cm"
            num_ans = str(D)
            hints = [
                f"Độ tụ $D = 1/f = 100/{f} = {format_num(D)}\\text{{ dp}}$.",
                f"Vì $d < f$ nên $d' = \\frac{{d \\cdot f}}{{d - f}} = {d_prime}\\text{{ cm}} < 0$ (ảnh ảo).",
                f"Kết luận: $D = +{format_num(D)}$ dp; ảnh ảo cách thấu kính {abs(d_prime)} cm."
            ]
            correct_val = f"+{format_num(D)} dp, d' = {d_prime} cm (ảo)"
            distractors = [
                f"-{format_num(D)} dp, d' = {d_prime} cm (ảo)",
                f"+{format_num(D)} dp, d' = {abs(d_prime)} cm (thật)",
                f"+{format_num(D*2)} dp, d' = {d_prime} cm (ảo)"
            ]
            options = [correct_val] + distractors
            random.shuffle(options)

            return {
                "id": f"phy_opt_{random.randint(10000, 99999)}",
                "category": "optics",
                "category_name": "Quang học & Thấu kính",
                "difficulty": "hard",
                "title": "Độ tụ & Ảnh ảo thấu kính nâng cao",
                "question": question,
                "hints": hints,
                "solution": sol,
                "final_answer": ans_str,
                "numeric_answer": num_ans,
                "roots": [float(D)],
                "options": options,
                "correct_option": options.index(correct_val),
                "subject_name": "Vật lý"
            }

    # -------------------------------------------------------------
    # 5. NHIỆT HỌC & KHÍ LÝ TƯỞNG (Thermodynamics & Ideal Gas)
    # -------------------------------------------------------------
    @classmethod
    def generate_thermodynamics(cls, difficulty: str = "medium") -> Dict[str, Any]:
        """Sinh bài tập Nhiệt học & Phương trình trạng thái khí lý tưởng"""
        diff = difficulty.lower()
        if diff in ["easy", "beginner"]:
            P1 = random.choice([1.0, 1.5, 2.0, 3.0])
            V1 = random.choice([4.0, 6.0, 8.0, 10.0])
            V2 = random.choice([2.0, 3.0, 5.0])
            P2 = round((P1 * V1) / V2, 2)

            question = f"Một khối khí lý tưởng xác định ở nhiệt độ không đổi có thể tích $V_1 = {V1}\\text{{ lít}}$ dưới áp suất $P_1 = {P1}\\text{{ atm}}$. Nếu nén đẳng nhiệt khối khí đến thể tích $V_2 = {V2}\\text{{ lít}}$, áp suất $P_2$ của khối khí lúc này là:"
            sol = f"**Phương pháp:** Quá trình đẳng nhiệt tuân theo Định luật Boyle - Mariotte:\n" \
                  f"$$ P_1 V_1 = P_2 V_2 \\Rightarrow P_2 = \\frac{{P_1 V_1}}{{V_2}} $$\n" \
                  f"**Thay số:** $P_2 = \\frac{{{P1} \\times {V1}}}{{{V2}}} = {P2}\\text{{ atm}}$.\n" \
                  f"**Đáp số:** $P_2 = {P2}\\text{{ atm}}$."
            ans_str = f"{P2} atm"
            num_ans = str(P2)
            hints = [
                "Trong quá trình đẳng nhiệt: $P_1 V_1 = P_2 V_2$.",
                f"Rút ra $P_2 = \\frac{{{P1} \\times {V1}}}{{{V2}}}$.",
                f"Áp suất mới là {P2} atm."
            ]
            correct_val = str(P2)
            distractors = [str(round(P2 * 1.5, 2)), str(round(P2 / 2, 2)), str(round(P2 + 1.8, 2))]
            options = [f"{correct_val} atm"] + [f"{d} atm" for d in distractors]
            options = list(dict.fromkeys(options))
            while len(options) < 4:
                options.append(f"{format_num(float(correct_val) + len(options) * 0.8)} atm")
            random.shuffle(options)

            return {
                "id": f"phy_thermo_{random.randint(10000, 99999)}",
                "category": "thermodynamics",
                "category_name": "Nhiệt học & Khí lý tưởng",
                "difficulty": "easy",
                "title": "Quá trình đẳng nhiệt (Định luật Boyle)",
                "question": question,
                "hints": hints,
                "solution": sol,
                "final_answer": ans_str,
                "numeric_answer": num_ans,
                "roots": [float(num_ans)],
                "options": options,
                "correct_option": options.index(f"{correct_val} atm"),
                "subject_name": "Vật lý"
            }

        elif diff in ["medium", "intermediate"]:
            m1 = random.choice([0.2, 0.5, 1.0])
            c1 = 4200
            t1 = random.choice([20, 25, 30])
            m2 = random.choice([0.1, 0.2, 0.3])
            c2 = random.choice([380, 880])
            t2 = random.choice([80, 90, 100])

            t_cb = round((m1 * c1 * t1 + m2 * c2 * t2) / (m1 * c1 + m2 * c2), 2)
            material = "Đồng ($c_2 = 380\\text{ J/kg.K}$)" if c2 == 380 else "Nhôm ($c_2 = 880\\text{ J/kg.K}$)"

            question = f"Thả một miếng {material} có khối lượng $m_2 = {m2}\\text{{ kg}}$ ở nhiệt độ $t_2 = {t2}^\\circ\\text{{C}}$ vào một bình chứa $m_1 = {m1}\\text{{ kg}}$ nước ở nhiệt độ $t_1 = {t1}^\\circ\\text{{C}}$. Biết nhiệt dung riêng của nước là $c_1 = 4200\\text{{ J/(kg.K)}}$. Bỏ qua nhiệt lượng tỏa ra môi trường và bình chứa. Nhiệt độ cân bằng $t_{{\\text{{cb}}}}$ của hệ là:"
            sol = f"**Phương pháp:** Phương trình cân bằng nhiệt:\n" \
                  f"$$ Q_{{\\text{{tỏa}}}} = Q_{{\\text{{thu}}}} \\Leftrightarrow m_2 c_2 (t_2 - t_{{\\text{{cb}}}}) = m_1 c_1 (t_{{\\text{{cb}}}} - t_1) $$\n" \
                  f"**Giải phương trình:**\n" \
                  f"$$ t_{{\\text{{cb}}}} = \\frac{{m_1 c_1 t_1 + m_2 c_2 t_2}}{{m_1 c_1 + m_2 c_2}} = {t_cb}^\\circ\\text{{C}} $$\n" \
                  f"**Đáp số:** $t_{{\\text{{cb}}}} = {t_cb}^\\circ\\text{{C}}$."
            ans_str = f"{t_cb}°C"
            num_ans = str(t_cb)
            hints = [
                "Lập phương trình cân bằng nhiệt: $Q_{\\text{tỏa}} = Q_{\\text{thu}}$.",
                f"Nhiệt lượng tỏa: $Q_2 = {m2} \\times {c2} \\times ({t2} - t_{{\\text{{cb}}}})$.",
                f"Nhiệt độ khi cân bằng là {t_cb}°C."
            ]
            correct_val = str(t_cb)
            distractors = [str(round(t_cb + 5.5, 2)), str(round(t_cb - 4.2, 2)), str(round((t1 + t2)/2, 2))]
            options = [f"{correct_val}°C"] + [f"{d}°C" for d in distractors]
            options = list(dict.fromkeys(options))
            while len(options) < 4:
                options.append(f"{format_num(float(correct_val) + len(options) * 2)}°C")
            random.shuffle(options)

            return {
                "id": f"phy_thermo_{random.randint(10000, 99999)}",
                "category": "thermodynamics",
                "category_name": "Nhiệt học & Khí lý tưởng",
                "difficulty": "medium",
                "title": "Phương trình cân bằng nhiệt",
                "question": question,
                "hints": hints,
                "solution": sol,
                "final_answer": ans_str,
                "numeric_answer": num_ans,
                "roots": [float(num_ans)],
                "options": options,
                "correct_option": options.index(f"{correct_val}°C"),
                "subject_name": "Vật lý"
            }
        else:
            T1_C = random.choice([227, 327, 427])
            T2_C = random.choice([27, 47, 77])
            T1_K = T1_C + 273
            T2_K = T2_C + 273
            eta = round((1 - T2_K / T1_K) * 100, 2)

            question = f"Một động cơ nhiệt lý tưởng hoạt động theo chu trình Carnot nhận nhiệt từ nguồn nóng ở nhiệt độ $t_1 = {T1_C}^\\circ\\text{{C}}$ và truyền nhiệt cho nguồn lạnh ở nhiệt độ $t_2 = {T2_C}^\\circ\\text{{C}}$. Hiệu suất cực đại $\\eta$ của động cơ này là:"
            sol = f"**Bước 1: Chuyển đổi nhiệt độ sang thang Kelvin (K):**\n" \
                  f"$$ T_1 = {T1_C} + 273 = {T1_K}\\text{{ K}} $$\n" \
                  f"$$ T_2 = {T2_C} + 273 = {T2_K}\\text{{ K}} $$\n\n" \
                  f"**Bước 2: Tính hiệu suất chu trình Carnot:**\n" \
                  f"$$ \\eta = 1 - \\frac{{T_2}}{{T_1}} = 1 - \\frac{{{T2_K}}}{{{T1_K}}} = {format_num(eta/100)} = {eta}\\% $$\n\n" \
                  f"**Đáp số:** $\\eta = {eta}\\%$."
            ans_str = f"{eta}%"
            num_ans = str(eta)
            hints = [
                f"Đổi nhiệt độ sang thang Kelvin: $T_1 = {T1_K}\\text{{ K}}$, $T_2 = {T2_K}\\text{{ K}}$.",
                "Áp dụng công thức hiệu suất Carnot: $\\eta = 1 - T_2/T_1$.",
                f"Hiệu suất cực đại là {eta}%."
            ]
            correct_val = str(eta)
            distractors = [str(round(eta * 0.8, 2)), str(round(eta + 12.5, 2)), str(round(100 - (T2_C/T1_C)*100, 2))]
            options = [f"{correct_val}%"] + [f"{d}%" for d in distractors]
            options = list(dict.fromkeys(options))
            while len(options) < 4:
                options.append(f"{format_num(float(correct_val) + len(options) * 5)}%")
            random.shuffle(options)

            return {
                "id": f"phy_thermo_{random.randint(10000, 99999)}",
                "category": "thermodynamics",
                "category_name": "Nhiệt học & Khí lý tưởng",
                "difficulty": "hard",
                "title": "Hiệu suất Động cơ nhiệt Carnot nâng cao",
                "question": question,
                "hints": hints,
                "solution": sol,
                "final_answer": ans_str,
                "numeric_answer": num_ans,
                "roots": [float(num_ans)],
                "options": options,
                "correct_option": options.index(f"{correct_val}%"),
                "subject_name": "Vật lý"
            }

    # -------------------------------------------------------------
    # 6. LƯỢNG TỬ ÁNH SÁNG & VẬT LÝ HẠT NHÂN (Quantum & Nuclear)
    # -------------------------------------------------------------
    @classmethod
    def generate_nuclear_quantum(cls, difficulty: str = "medium") -> Dict[str, Any]:
        """Sinh bài tập Lượng tử ánh sáng & Vật lý hạt nhân"""
        diff = difficulty.lower()
        if diff in ["easy", "beginner"]:
            lam_um = random.choice([0.4, 0.5, 0.6, 0.75])
            h = 6.625e-34
            c = 3e8
            e_charge = 1.6e-19
            E_joules = (h * c) / (lam_um * 1e-6)
            E_eV = round(E_joules / e_charge, 2)

            question = f"Chiếu một bức xạ đơn sắc có bước sóng $\\lambda = {lam_um}\\ \\mu\\text{{m}}$ vào chân không. Cho hằng số Planck $h = 6.625 \\times 10^{{-34}}\\text{{ J.s}}$, tốc độ ánh sáng $c = 3 \\times 10^8\\text{{ m/s}}$ và $1\\text{{ eV}} = 1.6 \\times 10^{{-19}}\\text{{ J}}$. Năng lượng của mỗi photon $\\varepsilon$ theo đơn vị eV xấp xỉ bằng:"
            sol = f"**Phương pháp:** Công thức năng lượng photon của Einstein:\n" \
                  f"$$ \\varepsilon = \\frac{{hc}}{{\\lambda}} $$\n" \
                  f"**Thay số:** $\\varepsilon = \\frac{{6.625 \\times 10^{{-34}} \\times 3 \\times 10^8}}{{{lam_um} \\times 10^{{-6}}}} = {E_joules:.3e}\\text{{ J}}$.\n" \
                  f"Đổi sang eV: $\\varepsilon = \\frac{{{E_joules:.3e}}}{{1.6 \\times 10^{{-19}}}} = {E_eV}\\text{{ eV}}$.\n" \
                  f"**Đáp số:** $\\varepsilon \\approx {E_eV}\\text{{ eV}}$."
            ans_str = f"{E_eV} eV"
            num_ans = str(E_eV)
            hints = [
                "Dùng công thức $\\varepsilon = \\frac{hc}{\\lambda}$.",
                f"Đổi bước sóng $\\lambda = {lam_um}\\ \\mu\\text{{m}} = {lam_um} \\times 10^{{-6}}\\text{{ m}}$.",
                f"Chia năng lượng Joule cho $1.6 \\times 10^{{-19}}$ để ra {E_eV} eV."
            ]
            correct_val = str(E_eV)
            distractors = [str(round(E_eV * 2, 2)), str(round(E_eV / 2, 2)), str(round(E_eV + 0.85, 2))]
            options = [f"{correct_val} eV"] + [f"{d} eV" for d in distractors]
            options = list(dict.fromkeys(options))
            while len(options) < 4:
                options.append(f"{format_num(float(correct_val) + len(options) * 0.5)} eV")
            random.shuffle(options)

            return {
                "id": f"phy_quant_{random.randint(10000, 99999)}",
                "category": "nuclear_quantum",
                "category_name": "Lượng tử & Vật lý hạt nhân",
                "difficulty": "easy",
                "title": "Năng lượng photon ánh sáng",
                "question": question,
                "hints": hints,
                "solution": sol,
                "final_answer": ans_str,
                "numeric_answer": num_ans,
                "roots": [float(num_ans)],
                "options": options,
                "correct_option": options.index(f"{correct_val} eV"),
                "subject_name": "Vật lý"
            }

        elif diff in ["medium", "intermediate"]:
            T_days = random.choice([8, 14, 30, 138])
            n_halves = random.choice([2, 3, 4])
            t_days = T_days * n_halves
            remain_pct = round((1.0 / (2 ** n_halves)) * 100, 2)
            decayed_pct = round(100 - remain_pct, 2)

            question = f"Một đồng vị phóng xạ có chu kỳ bán rã $T = {T_days}\\text{{ ngày}}$. Sau khoảng thời gian $t = {t_days}\\text{{ ngày}}$, tỷ lệ phần trăm số hạt nhân bị phân rã $\\Delta N / N_0$ là:"
            sol = f"**Phương pháp:** Số chu kỳ bán rã đã trôi qua:\n" \
                  f"$$ k = \\frac{{t}}{{T}} = \\frac{{{t_days}}}{{{T_days}}} = {n_halves} $$\n\n" \
                  f"Tỷ lệ số hạt nhân còn lại:\n" \
                  f"$$ \\frac{{N(t)}}{{N_0}} = 2^{{-k}} = 2^{{-{n_halves}}} = \\frac{{1}}{{{2**n_halves}}} = {remain_pct}\\% $$\n\n" \
                  f"Tỷ lệ số hạt nhân bị phân rã:\n" \
                  f"$$ \\frac{{\\Delta N}}{{N_0}} = 1 - \\frac{{N(t)}}{{N_0}} = 100\\% - {remain_pct}\\% = {decayed_pct}\\% $$\n\n" \
                  f"**Đáp số:** $\\frac{{\\Delta N}}{{N_0}} = {decayed_pct}\\%$."
            ans_str = f"{decayed_pct}%"
            num_ans = str(decayed_pct)
            hints = [
                f"Tính số chu kỳ bán rã $k = t/T = {t_days}/{T_days} = {n_halves}$.",
                f"Phần trăm còn lại: $100\\% / 2^{{{n_halves}}} = {remain_pct}\\%$.",
                f"Phần trăm bị phân rã: $100\\% - {remain_pct}\\% = {decayed_pct}\\%."
            ]
            correct_val = str(decayed_pct)
            distractors = [str(remain_pct), str(round(decayed_pct - 12.5, 2)), str(round(decayed_pct / 2, 2))]
            options = [f"{correct_val}%"] + [f"{d}%" for d in distractors]
            options = list(dict.fromkeys(options))
            while len(options) < 4:
                options.append(f"{format_num(float(correct_val) + len(options) * 4)}%")
            random.shuffle(options)

            return {
                "id": f"phy_quant_{random.randint(10000, 99999)}",
                "category": "nuclear_quantum",
                "category_name": "Lượng tử & Vật lý hạt nhân",
                "difficulty": "medium",
                "title": "Định luật phóng xạ hạt nhân",
                "question": question,
                "hints": hints,
                "solution": sol,
                "final_answer": ans_str,
                "numeric_answer": num_ans,
                "roots": [float(num_ans)],
                "options": options,
                "correct_option": options.index(f"{correct_val}%"),
                "subject_name": "Vật lý"
            }
        else:
            n = random.choice([2, 3, 4, 5])
            names = {1: "K", 2: "L", 3: "M", 4: "N", 5: "O"}
            rn_pm = round((n ** 2) * 53, 1)
            E_n = round(-13.6 / (n ** 2), 3)

            question = f"Theo mẫu nguyên tử Bo, bán kính Bo là $r_0 = 5.3 \\times 10^{{-11}}\\text{{ m}}$ và mức năng lượng của nguyên tử hiđrô ở trạng thái dừng thứ $n$ là $E_n = -\\frac{{13.6}}{{n^2}}\\text{{ eV}}$. Khi electron chuyển động trên quỹ đạo dừng **{names[n]}** ($n = {n}$), năng lượng của nguyên tử là:"
            sol = f"**Phương pháp:** Thay số $n = {n}$ vào công thức mức năng lượng nguyên tử hiđrô:\n" \
                  f"$$ E_{{{names[n]}}} = -\\frac{{13.6}}{{{n}^2}} = -\\frac{{13.6}}{{{n**2}}} = {E_n}\\text{{ eV}} $$\n" \
                  f"Bán kính quỹ đạo dừng tương ứng: $r_{{{names[n]}}} = {n}^2 \\cdot r_0 = {n**2} r_0 = {rn_pm}\\text{{ pm}}$.\n" \
                  f"**Đáp số:** $E_{{{names[n]}}} = {E_n}\\text{{ eV}}$."
            ans_str = f"{E_n} eV"
            num_ans = str(E_n)
            hints = [
                f"Quỹ đạo {names[n]} tương ứng với số lượng tử $n = {n}$.",
                f"Áp dụng công thức $E_n = -\\frac{{13.6}}{{{n}^2}}\\text{{ eV}}$.",
                f"Năng lượng trạng thái dừng là {E_n} eV."
            ]
            correct_val = str(E_n)
            distractors = [str(round(E_n * 2, 3)), str(round(abs(E_n), 3)), str(round(-13.6 / (n+1)**2, 3))]
            options = [f"{correct_val} eV"] + [f"{d} eV" for d in distractors]
            options = list(dict.fromkeys(options))
            while len(options) < 4:
                options.append(f"{format_num(float(correct_val) + len(options) * 0.4)} eV")
            random.shuffle(options)

            return {
                "id": f"phy_quant_{random.randint(10000, 99999)}",
                "category": "nuclear_quantum",
                "category_name": "Lượng tử & Vật lý hạt nhân",
                "difficulty": "hard",
                "title": "Mẫu nguyên tử Bo & Mức năng lượng dừng",
                "question": question,
                "hints": hints,
                "solution": sol,
                "final_answer": ans_str,
                "numeric_answer": num_ans,
                "roots": [float(num_ans)],
                "options": options,
                "correct_option": options.index(f"{correct_val} eV"),
                "subject_name": "Vật lý"
            }

    # -------------------------------------------------------------
    # BATCH GENERATOR FOR PHYSICS
    # -------------------------------------------------------------
    @classmethod
    def generate_batch(cls, category: str = "all", difficulty: str = "medium", count: int = 5, elo: Optional[int] = None) -> List[Dict[str, Any]]:
        """Sinh một danh sách bài tập Vật lý theo chuyên đề, độ khó và Elo."""
        generators = {
            "mechanics": cls.generate_mechanics,
            "oscillation_wave": cls.generate_oscillation_wave,
            "circuits_electromagnetism": cls.generate_circuits_electromagnetism,
            "optics": cls.generate_optics,
            "thermodynamics": cls.generate_thermodynamics,
            "nuclear_quantum": cls.generate_nuclear_quantum,
        }

        diff_clean = str(difficulty).lower()
        default_elo = 900 if diff_clean in ["easy", "beginner"] else (1250 if diff_clean in ["hard", "advanced"] else 1050)
        target_elo = int(elo) if elo is not None and int(elo) > 0 else default_elo

        results = []
        for _ in range(count):
            if category == "all" or category not in generators:
                gen_func = random.choice(list(generators.values()))
            else:
                gen_func = generators[category]

            prob = gen_func(difficulty=diff_clean)
            prob["eloRating"] = target_elo
            prob["elo"] = target_elo
            prob["subject_name"] = "Vật lý"
            if "final_answer" in prob:
                if "answer" not in prob:
                    prob["answer"] = prob["final_answer"]
                if "correct_answer" not in prob:
                    prob["correct_answer"] = prob["final_answer"]
            results.append(prob)

        return results


    @classmethod
    def generate(cls, category: str = "all", difficulty: str = "medium", elo: Optional[int] = None) -> Dict[str, Any]:
        """Sinh 1 bài tập Vật lý."""
        return cls.generate_batch(category=category, difficulty=difficulty, count=1, elo=elo)[0]

