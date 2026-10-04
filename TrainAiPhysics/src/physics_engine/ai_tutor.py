"""
ai_tutor.py - AI Gia sư Vật Lý thông minh & Trợ lý học tập tương tác.
Hỗ trợ:
- Trả lời câu hỏi học sinh về bản chất vật lý, công thức và phương pháp giải
- Tra cứu nhanh kiến thức từ PhysicsKnowledgeBase
- Đưa ra gợi ý thông minh không lộ trực tiếp đáp án
"""

from typing import Dict, Any, Optional
from .knowledge_base import PhysicsKnowledgeBase, PHYSICAL_CONSTANTS


class PhysicsAITutor:
    """AI Physics Tutor & Interactive Mentor"""

    @staticmethod
    def explain_topic(topic_id: str) -> Dict[str, Any]:
        """Tra cứu chi tiết lý thuyết và công thức từ Knowledge Base."""
        return PhysicsKnowledgeBase.get_topic_detail(topic_id)

    @staticmethod
    def get_constant_info(constant_key: str) -> Optional[Dict[str, Any]]:
        """Tra cứu giá trị và đơn vị của hằng số vật lý."""
        return PHYSICAL_CONSTANTS.get(constant_key.lower())

    @staticmethod
    def answer_physics_query(query: str, current_problem: Optional[Dict[str, Any]] = None) -> str:
        """Trả lời câu hỏi của học sinh về môn Vật lý."""
        q_lower = query.lower()

        # 1. Tra cứu hằng số
        for k, v in PHYSICAL_CONSTANTS.items():
            if k in q_lower or v["name"].lower() in q_lower:
                return f"🔬 **Hằng số vật lý [{v['name']} ({v['symbol']})]:**\n- Giá trị: **{v['value']} {v['unit']}**\n- Ký hiệu: `{v['symbol']}`"

        # 2. Tra cứu công thức
        if "công thức" in q_lower or "cách tính" in q_lower or "lý thuyết" in q_lower:
            if "sóng" in q_lower or "bước sóng" in q_lower:
                return "🌊 **Công thức Sóng cơ:**\n- Bước sóng: $\\lambda = v \\cdot T = \\frac{v}{f}$\n- Độ lệch pha giữa 2 điểm cách nhau $d$: $\\Delta\\varphi = \\frac{2\\pi d}{\\lambda}$.\n- Sóng dừng 2 đầu cố định: $L = k \\frac{\\lambda}{2}$ ($k$ là số bó sóng)."
            if "rlc" in q_lower or "tổng trở" in q_lower or "cộng hưởng" in q_lower or "xoay chiều" in q_lower:
                return "⚡ **Công thức Mạch xoay chiều RLC:**\n- Cảm kháng $Z_L = \\omega L$, Dung kháng $Z_C = \\frac{1}{\\omega C}$\n- Tổng trở: $Z = \\sqrt{R^2 + (Z_L - Z_C)^2}$\n- Cường độ dòng điện $I = \\frac{U}{Z}$\n- Cộng hưởng điện khi $Z_L = Z_C \\Rightarrow Z_{\\min} = R$ và $P_{\\max} = \\frac{U^2}{R}$."
            if "thấu kính" in q_lower or "tiêu cự" in q_lower or "độ tụ" in q_lower:
                return "🔍 **Công thức Thấu kính mỏng:**\n- Vị trí ảnh: $\\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d'} \\Rightarrow d' = \\frac{d \\cdot f}{d - f}$\n- Độ tụ: $D = \\frac{1}{f(\\text{m})}$ (diop)\n- Số phóng đại: $k = -\\frac{d'}{d}$."
            if "khí" in q_lower or "nhiệt" in q_lower or "carnot" in q_lower:
                return "🔥 **Công thức Nhiệt học & Khí lý tưởng:**\n- Phương trình trạng thái: $\\frac{P_1 V_1}{T_1} = \\frac{P_2 V_2}{T_2}$ (nhớ $T = t^\\circ\\text{C} + 273$)\n- Cân bằng nhiệt: $Q_{\\text{tỏa}} = Q_{\\text{thu}} \\Leftrightarrow m c \\Delta t_1 = m c \\Delta t_2$\n- Hiệu suất Carnot: $\\eta = 1 - \\frac{T_2}{T_1}$."
            if "hạt nhân" in q_lower or "phóng xạ" in q_lower or "bo" in q_lower:
                return "⚛️ **Công thức Lượng tử & Vật lý hạt nhân:**\n- Photon: $\\varepsilon = hf = \\frac{hc}{\\lambda}$\n- Mức năng lượng Bo: $E_n = -\\frac{13.6}{n^2}\\text{ eV}$, bán kính $r_n = n^2 r_0$\n- Phóng xạ: $N(t) = N_0 \\cdot 2^{-t/T}$, khối lượng $m(t) = m_0 \\cdot 2^{-t/T}$."

        # 3. Hỗ trợ bài tập hiện tại
        if current_problem:
            hints = current_problem.get("hints", [])
            sol = current_problem.get("solution", "")
            hints_text = "\n".join([f"- {h}" for h in hints]) if hints else "Đọc kỹ đề bài và xác định đại lượng cần tìm."
            return f"💡 **Gợi ý giải bài tập hiện tại:**\n{hints_text}\n\n*Nếu bạn muốn xem toàn bộ các bước giải, hãy nhấn nút 'Xem lời giải chi tiết' nhé!*"

        return "Chào bạn! Mình là AI Tutor Vật Lý chuyên sâu. Bạn có thể hỏi mình về lý thuyết các định luật vật lý (Newton, Ohm, Faraday, Boyle, Einstein...), cách giải các bài toán Cơ học, Dao động, Sóng, Mạch RLC, Quang học hoặc Vật lý hạt nhân!"
