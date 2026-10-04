"""
ai_tutor.py - AI Gia sư Vật Lý thông minh & Bộ giải thích hiện tượng vật lý.
Hỗ trợ:
- Tóm tắt kiến thức, công thức và bẫy đề thi theo từng chuyên đề Vật lý
- Trả lời thắc mắc và giải thích bản chất vật lý cho học sinh
"""

from typing import Dict, Any, Optional


class PhysicsAITutor:
    """AI Physics Tutor & Concept Explainer"""

    @staticmethod
    def explain_concept(topic_key: str) -> Dict[str, Any]:
        """Giải thích chi tiết các chuyên đề Vật lý trọng tâm."""
        concepts = {
            "mechanics": {
                "title": "Cơ học & Động lực học chất điểm",
                "summary": "Nắm vững các phương trình chuyển động thẳng biến đổi đều, Định luật II Newton ($F = ma$) và Định luật bảo toàn cơ năng ($W = W_d + W_t$).",
                "formulas": [
                    "Vận tốc biến đổi đều: $v = v_0 + at$",
                    "Quãng đường: $s = v_0 t + \\frac{1}{2}at^2$",
                    "Liên hệ độc lập: $v^2 - v_0^2 = 2as$",
                    "Định luật II Newton: $\\vec{F} = m\\vec{a}$",
                    "Cơ năng: $W = \\frac{1}{2}mv^2 + mgz$"
                ],
                "common_traps": "Quên đổi đơn vị thời gian (phút -> giây) hoặc vận tốc (km/h -> m/s chia 3.6); Nhầm dấu gia tốc $a$ khi chuyển động chậm dần đều ($a \\cdot v < 0$)."
            },
            "oscillation_wave": {
                "title": "Dao động điều hòa & Sóng cơ học",
                "summary": "Dao động điều hòa $x = A\\cos(\\omega t + \\varphi)$. Sóng cơ là sự lan truyền dao động trong môi trường vật chất theo thời gian.",
                "formulas": [
                    "Tốc độ cực đại: $v_{\\max} = \\omega A$, Gia tốc cực đại: $a_{\\max} = \\omega^2 A$",
                    "Con lắc lò xo: $\\omega = \\sqrt{k/m} \\Rightarrow T = 2\\pi\\sqrt{m/k}$",
                    "Bước sóng: $\\lambda = v \\cdot T = \\frac{v}{f}$",
                    "Độ lệch pha: $\\Delta\\varphi = \\frac{2\\pi d}{\\lambda}$",
                    "Sóng dừng 2 đầu cố định: $L = k \\frac{\\lambda}{2}$"
                ],
                "common_traps": "Quên đổi biên độ $A$ từ cm sang mét khi tính cơ năng $W = \\frac{1}{2}kA^2$; Nhầm lẫn giữa tốc độ dao động của phần tử vật chất và tốc độ truyền sóng."
            },
            "circuits_electromagnetism": {
                "title": "Dòng điện xoay chiều & Mạch RLC nối tiếp",
                "summary": "Khảo sát mạch RLC nối tiếp với các đại lượng cảm kháng $Z_L = \\omega L$, dung kháng $Z_C = \\frac{1}{\\omega C}$, tổng trở $Z$ và hiện tượng cộng hưởng điện.",
                "formulas": [
                    "Tổng trở: $Z = \\sqrt{R^2 + (Z_L - Z_C)^2}$",
                    "Định luật Ohm: $I = \\frac{U}{Z}$",
                    "Độ lệch pha $u$ so với $i$: $\\tan\\varphi = \\frac{Z_L - Z_C}{R}$",
                    "Hệ số công suất: $\\cos\\varphi = \\frac{R}{Z}$",
                    "Cộng hưởng điện: $Z_L = Z_C \\Leftrightarrow \\omega^2 LC = 1 \\Rightarrow I_{\\max} = \\frac{U}{R}, P_{\\max} = \\frac{U^2}{R}$"
                ],
                "common_traps": "Nhầm giữa giá trị cực đại ($U_0, I_0$) và giá trị hiệu dụng ($U = U_0/\\sqrt{2}, I = I_0/\\sqrt{2}$); Khi cuộn dây có điện trở thuần $r$ phải gộp $R_{td} = R + r$."
            },
            "optics": {
                "title": "Quang hình học & Thấu kính",
                "summary": "Khúc xạ ánh sáng, phản xạ toàn phần và bài toán tạo ảnh qua thấu kính hội tụ / phân kỳ.",
                "formulas": [
                    "Định luật khúc xạ: $n_1 \\sin i = n_2 \\sin r$",
                    "Góc giới hạn phản xạ toàn phần: $\\sin i_{gh} = \\frac{n_2}{n_1}$ ($n_1 > n_2$)",
                    "Công thức thấu kính: $\\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d'}$",
                    "Độ tụ: $D = \\frac{1}{f(\\text{m})}$ (diop)",
                    "Số phóng đại ảnh: $k = -\\frac{d'}{d} = \\frac{\\bar{A'B'}}{\\bar{AB}}$"
                ],
                "common_traps": "Quy ước dấu: Vật thật $d > 0$; Ảnh thật $d' > 0$, ảnh ảo $d' < 0$; Thấu kính hội tụ $f > 0$, phân kỳ $f < 0$."
            },
            "thermodynamics": {
                "title": "Nhiệt học & Khí lý tưởng",
                "summary": "Các đẳng quá trình khí lý tưởng (Boyle, Charles, Gay-Lussac), phương trình trạng thái $PV = nRT$ và nguyên lý nhiệt động lực học.",
                "formulas": [
                    "Đẳng nhiệt (Boyle): $P_1 V_1 = P_2 V_2$",
                    "Đẳng tích (Charles): $\\frac{P_1}{T_1} = \\frac{P_2}{T_2}$",
                    "Phương trình trạng thái: $\\frac{P_1 V_1}{T_1} = \\frac{P_2 V_2}{T_2}$",
                    "Nhiệt lượng: $Q = mc\\Delta T$",
                    "Hiệu suất Carnot: $\\eta = 1 - \\frac{T_2}{T_1}$"
                ],
                "common_traps": "Bắt buộc đổi nhiệt độ độ C sang độ K ($T = t^\\circ\\text{C} + 273$); Đơn vị thể tích $1\\text{ m}^3 = 1000\\text{ lít}$."
            },
            "nuclear_quantum": {
                "title": "Lượng tử ánh sáng & Vật lý hạt nhân",
                "summary": "Thuyết lượng tử ánh sáng của Planck - Einstein, hiện tượng quang điện, năng lượng liên kết hạt nhân và định luật phóng xạ.",
                "formulas": [
                    "Năng lượng photon: $\\varepsilon = hf = \\frac{hc}{\\lambda}$",
                    "Giới hạn quang điện: $\\lambda_0 = \\frac{hc}{A}$",
                    "Độ hụt khối: $\\Delta m = [Z \\cdot m_p + (A - Z)m_n] - m_{hn}$",
                    "Năng lượng liên kết: $\\Delta E = \\Delta m \\cdot c^2$",
                    "Định luật phóng xạ: $N(t) = N_0 \\cdot 2^{-t/T}$"
                ],
                "common_traps": "Đổi đơn vị năng lượng giữa Joule (J) và electron-volt ($1\\text{ eV} = 1.6 \\times 10^{-19}\\text{ J}$, $1\\text{ MeV} = 10^6\\text{ eV}$)."
            }
        }
        return concepts.get(topic_key, concepts["mechanics"])

    @staticmethod
    def answer_physics_query(query: str, current_problem: Optional[Dict[str, Any]] = None) -> str:
        """Trả lời câu hỏi của học sinh về môn Vật lý."""
        q_lower = query.lower()
        if "công thức" in q_lower or "cách tính" in q_lower:
            if "sóng" in q_lower or "bước sóng" in q_lower:
                return "🌊 **Công thức Sóng cơ:**\n- Bước sóng: $\\lambda = v \\cdot T = \\frac{v}{f}$\n- Độ lệch pha giữa 2 điểm cách nhau $d$: $\\Delta\\varphi = \\frac{2\\pi d}{\\lambda}$.\n- Sóng dừng 2 đầu cố định: $L = k \\frac{\\lambda}{2}$ ($k$ là số bó sóng)."
            if "rlc" in q_lower or "tổng trở" in q_lower or "cộng hưởng" in q_lower:
                return "⚡ **Công thức Mạch xoay chiều RLC:**\n- Cảm kháng $Z_L = \\omega L$, Dung kháng $Z_C = \\frac{1}{\\omega C}$\n- Tổng trở: $Z = \\sqrt{R^2 + (Z_L - Z_C)^2}$\n- Cường độ dòng điện $I = \\frac{U}{Z}$\n- Cộng hưởng điện khi $Z_L = Z_C \\Rightarrow Z_{\\min} = R$ và $P_{\\max} = \\frac{U^2}{R}$."
            if "thấu kính" in q_lower or "tiêu cự" in q_lower:
                return "🔍 **Công thức Thấu kính mỏng:**\n- Vị trí ảnh: $\\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d'} \\Rightarrow d' = \\frac{d \\cdot f}{d - f}$\n- Độ tụ: $D = \\frac{1}{f(\\text{m})}$ (diop)\n- Số phóng đại: $k = -\\frac{d'}{d}$."

        if current_problem:
            hints = current_problem.get("hints", [])
            sol = current_problem.get("solution", "")
            hints_text = "\n".join([f"- {h}" for h in hints]) if hints else "Đọc kỹ đề bài và xác định đại lượng cần tìm."
            return f"💡 **Gợi ý giải bài tập hiện tại:**\n{hints_text}\n\n*Nếu bạn muốn xem toàn bộ các bước giải, hãy nhấn nút 'Xem lời giải chi tiết' nhé!*"

        return "Chào bạn! Mình là AI Tutor Vật Lý. Bạn có thể hỏi mình về các định luật vật lý (Newton, Ohm, Boyle, Einstein...), cách giải các dạng bài tập dao động, sóng cơ, điện xoay chiều, thấu kính hoặc quang hạt nhân nhé!"
