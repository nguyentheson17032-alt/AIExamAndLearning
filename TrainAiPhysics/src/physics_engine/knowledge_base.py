"""
knowledge_base.py - Cơ sở dữ liệu tri thức Vật Lý toàn diện và chuyên sâu.
Bao gồm:
1. Bảng hằng số vật lý chuẩn quốc tế (SI)
2. Hệ thống công thức & định luật trọng tâm cho từng chuyên đề
3. Phân tích phương pháp giải & các cạm bẫy thường gặp
4. Bảng chuyển đổi đơn vị và thang đo
"""

from typing import Dict, Any, List


# -------------------------------------------------------------
# 1. BẢNG HẰNG SỐ VẬT LÝ QUỐC TẾ
# -------------------------------------------------------------
PHYSICAL_CONSTANTS: Dict[str, Dict[str, Any]] = {
    "g": {"name": "Gia tốc trọng trường tiêu chuẩn", "value": 9.8, "unit": "m/s^2", "symbol": "g", "approx": 10.0},
    "c": {"name": "Tốc độ ánh sáng trong chân không", "value": 3.0e8, "unit": "m/s", "symbol": "c"},
    "h": {"name": "Hằng số Planck", "value": 6.62607015e-34, "unit": "J.s", "symbol": "h"},
    "hbar": {"name": "Hằng số Dirac (h-bar)", "value": 1.054571817e-34, "unit": "J.s", "symbol": "ħ"},
    "e": {"name": "Điện tích nguyên tố", "value": 1.602176634e-19, "unit": "C", "symbol": "e"},
    "m_e": {"name": "Khối lượng nghỉ của electron", "value": 9.1093837e-31, "unit": "kg", "symbol": "m_e"},
    "m_p": {"name": "Khối lượng nghỉ của proton", "value": 1.67262192e-27, "unit": "kg", "symbol": "m_p"},
    "m_n": {"name": "Khối lượng nghỉ của neutron", "value": 1.67492749e-27, "unit": "kg", "symbol": "m_n"},
    "N_A": {"name": "Hằng số Avogadro", "value": 6.02214076e23, "unit": "mol^-1", "symbol": "N_A"},
    "R": {"name": "Hằng số khí lý tưởng", "value": 8.314462618, "unit": "J/(mol.K)", "symbol": "R"},
    "k_B": {"name": "Hằng số Boltzmann", "value": 1.380649e-23, "unit": "J/K", "symbol": "k_B"},
    "epsilon_0": {"name": "Hằng số điện môi chân không", "value": 8.8541878128e-12, "unit": "F/m", "symbol": "ε_0"},
    "mu_0": {"name": "Hằng số từ thẩm chân không", "value": 1.25663706212e-6, "unit": "N/A^2", "symbol": "μ_0"},
    "G": {"name": "Hằng số hấp dẫn", "value": 6.67430e-11, "unit": "N.m^2/kg^2", "symbol": "G"},
    "u": {"name": "Đơn vị khối lượng nguyên tử", "value": 1.66053906660e-27, "unit": "kg", "symbol": "u", "energy_MeV": 931.5},
    "r_0": {"name": "Bán kính Bo quỹ đạo cơ bản (n=1)", "value": 5.3e-11, "unit": "m", "symbol": "r_0"},
    "sigma": {"name": "Hằng số Stefan-Boltzmann", "value": 5.670374419e-8, "unit": "W/(m^2.K^4)", "symbol": "σ"},
}


# -------------------------------------------------------------
# 2. HỆ THỐNG TRI THỨC THEO CHUYÊN ĐỀ VẬT LÝ
# -------------------------------------------------------------
class PhysicsKnowledgeBase:
    """Kho tri thức và lý thuyết Vật lý THPT & ĐH"""

    @classmethod
    def get_all_topics(cls) -> List[Dict[str, str]]:
        return [
            {"id": "mechanics", "name": "Cơ học & Động lực học chất điểm"},
            {"id": "oscillation_wave", "name": "Dao động điều hòa & Sóng cơ"},
            {"id": "circuits_electromagnetism", "name": "Dòng điện xoay chiều & Mạch RLC"},
            {"id": "optics", "name": "Quang hình học & Thấu kính"},
            {"id": "thermodynamics", "name": "Nhiệt học & Khí lý tưởng"},
            {"id": "nuclear_quantum", "name": "Lượng tử ánh sáng & Vật lý hạt nhân"},
            {"id": "physics_true_false", "name": "Trắc nghiệm Đúng / Sai (Phần II)"},
            {"id": "physics_short_answer", "name": "Trắc nghiệm Trả lời ngắn (Phần III)"},
        ]

    @classmethod
    def get_topic_detail(cls, topic_id: str) -> Dict[str, Any]:
        topics = {
            "mechanics": {
                "title": "Cơ học & Động lực học chất điểm (Mechanics & Dynamics)",
                "overview": "Nghiên cứu quy luật chuyển động của vật thể dưới tác dụng của các lực, các định luật Newton và các định luật bảo toàn cơ năng, động lượng.",
                "core_laws": [
                    "Định luật I Newton (Quán tính): Vật giữ nguyên trạng thái đứng yên hoặc chuyển động thẳng đều khi không chịu lực tác dụng hoặc hợp lực bằng 0.",
                    "Định luật II Newton: Gia tốc cùng hướng với hợp lực tác dụng và tỉ lệ thuận với độ lớn lực: $\\vec{F} = m\\vec{a}$.",
                    "Định luật III Newton: Lực và phản lực luôn xuất hiện đồng thời, cùng phương, ngược chiều, cùng độ lớn và đặt vào 2 vật khác nhau: $\\vec{F}_{AB} = -\\vec{F}_{BA}$."
                ],
                "formulas": [
                    {"name": "Vận tốc biến đổi đều", "formula": "v = v_0 + at"},
                    {"name": "Quãng đường biến đổi đều", "formula": "s = v_0 t + \\frac{1}{2}at^2"},
                    {"name": "Hệ thức độc lập thời gian", "formula": "v^2 - v_0^2 = 2as"},
                    {"name": "Lực ma sát trượt", "formula": "F_{ms} = \\mu N"},
                    {"name": "Độ biến thiên động năng", "formula": "\\Delta W_d = W_{d2} - W_{d1} = A"},
                    {"name": "Định luật bảo toàn cơ năng", "formula": "W = W_d + W_t = \\frac{1}{2}mv^2 + mgz = \\text{hằng số}"},
                    {"name": "Công & Công suất", "formula": "A = F s \\cos\\alpha, \\quad P = \\frac{A}{t} = F v \\cos\\alpha"}
                ],
                "key_methods": [
                    "Phương pháp động lực học: Chọn hệ quy chiếu -> Biểu diễn các lực -> Viết phương trình vector Định luật II Newton -> Chiếu lên trục toạ độ Ox, Oy để giải.",
                    "Phương pháp năng lượng: Dùng khi bài toán không yêu cầu tìm thời gian $t$ hoặc lực phức tạp -> Áp dụng định luật bảo toàn cơ năng hoặc định lý biến thiên động năng."
                ],
                "traps": [
                    "Quên đổi đơn vị km/h sang m/s (chia cho 3.6).",
                    "Chuyển động chậm dần đều thì gia tốc và vận tốc trái dấu: $a \\cdot v < 0$.",
                    "Góc $\\alpha$ trong công thức tính công $A = F s \\cos\\alpha$ là góc hợp bởi vector lực $\\vec{F}$ và vector vận tốc $\\vec{v}$."
                ]
            },

            "oscillation_wave": {
                "title": "Dao động điều hòa & Sóng cơ (Oscillations & Mechanical Waves)",
                "overview": "Nghiên cứu các dao động tuần hoàn, con lắc lò xo, con lắc đơn và quá trình lan truyền dao động (sóng cơ, giao thoa, sóng dừng, sóng âm).",
                "core_laws": [
                    "Dao động điều hòa: Li độ là hàm cosin (hoặc sin) của thời gian: $x = A\\cos(\\omega t + \\varphi)$.",
                    "Nguyên lý truyền sóng: Sóng cơ truyền pha dao động và năng lượng, không truyền phần tử vật chất.",
                    "Điều kiện giao thoa: Hai nguồn sóng kết hợp cùng phương, cùng tần số và có hiệu số pha không đổi theo thời gian."
                ],
                "formulas": [
                    {"name": "Vận tốc dao động", "formula": "v = x' = -\\omega A\\sin(\\omega t + \\varphi) = \\omega A\\cos(\\omega t + \\varphi + \\frac{\\pi}{2})"},
                    {"name": "Gia tốc dao động", "formula": "a = v' = -\\omega^2 x = \\omega^2 A\\cos(\\omega t + \\varphi + \\pi)"},
                    {"name": "Hệ thức độc lập", "formula": "A^2 = x^2 + \\frac{v^2}{\\omega^2} = \\frac{a^2}{\\omega^4} + \\frac{v^2}{\\omega^2}"},
                    {"name": "Con lắc lò xo", "formula": "\\omega = \\sqrt{\\frac{k}{m}}, \\quad T = 2\\pi\\sqrt{\\frac{m}{k}}, \\quad W = \\frac{1}{2}kA^2"},
                    {"name": "Con lắc đơn", "formula": "\\omega = \\sqrt{\\frac{g}{l}}, \\quad T = 2\\pi\\sqrt{\\frac{l}{g}}"},
                    {"name": "Bước sóng", "formula": "\\lambda = v \\cdot T = \\frac{v}{f}"},
                    {"name": "Độ lệch pha giữa 2 điểm", "formula": "\\Delta\\varphi = \\frac{2\\pi d}{\\lambda}"},
                    {"name": "Sóng dừng 2 đầu cố định", "formula": "L = k \\frac{\\lambda}{2} \\quad (k \\text{ là số bó sóng})"},
                    {"name": "Sóng dừng 1 đầu cố định 1 đầu tự do", "formula": "L = (2k+1) \\frac{\\lambda}{4}"}
                ],
                "key_methods": [
                    "Sử dụng vòng tròn lượng giác để tìm thời gian, quãng đường, số lần vật đi qua vị trí xác định.",
                    "Phương pháp vector quay Fresnel để tổng hợp hai dao động điều hòa cùng phương cùng tần số."
                ],
                "traps": [
                    "Vận tốc sớm pha $\\pi/2$ so với li độ; gia tốc ngược pha với li độ ($a = -\\omega^2 x$).",
                    "Khoảng cách giữa hai nút sóng hoặc hai bụng sóng liên tiếp là $\\lambda/2$.",
                    "Khoảng cách giữa một nút và một bụng liên tiếp là $\\lambda/4$."
                ]
            },

            "circuits_electromagnetism": {
                "title": "Dòng điện xoay chiều & Mạch RLC (Electricity & Electromagnetism)",
                "overview": "Khảo sát dòng điện xoay chiều hình sin, mạch nối tiếp RLC, hiện tượng cộng hưởng, máy biến áp và truyền tải điện năng.",
                "core_laws": [
                    "Hiện tượng cảm ứng điện từ (Faraday): Suất điện động cảm ứng tỉ lệ với tốc độ biến thiên từ thông: $e = -\\frac{d\\Phi}{dt}$.",
                    "Định luật Lenz: Dòng điện cảm ứng có chiều sao cho từ trường do nó sinh ra chống lại nguyên nhân sinh ra nó.",
                    "Hiện tượng cộng hưởng điện: Khi $Z_L = Z_C$, dòng điện cùng pha với điện áp, tổng trở đạt cực tiểu $Z_{\\min} = R$ và công suất đạt cực đại $P_{\\max} = U^2/R$."
                ],
                "formulas": [
                    {"name": "Cảm kháng & Dung kháng", "formula": "Z_L = \\omega L, \\quad Z_C = \\frac{1}{\\omega C}"},
                    {"name": "Tổng trở mạch RLC", "formula": "Z = \\sqrt{R^2 + (Z_L - Z_C)^2}"},
                    {"name": "Định luật Ohm cho mạch xoay chiều", "formula": "I = \\frac{U}{Z}, \\quad I_0 = \\frac{U_0}{Z}"},
                    {"name": "Độ lệch pha u so với i", "formula": "\\tan\\varphi = \\frac{Z_L - Z_C}{R}, \\quad \\cos\\varphi = \\frac{R}{Z}"},
                    {"name": "Công suất tiêu thụ", "formula": "P = U I \\cos\\varphi = I^2 R = \\frac{U^2 R}{Z^2}"},
                    {"name": "Máy biến áp lý tưởng", "formula": "\\frac{U_1}{U_2} = \\frac{N_1}{N_2} = \\frac{I_2}{I_1}"},
                    {"name": "Công suất hao phí truyền tải", "formula": "\\Delta P = \\frac{P^2 R}{U^2 \\cos^2\\varphi}"}
                ],
                "key_methods": [
                    "Phương pháp giản đồ vector (Fresnel): Biểu diễn $U_R, U_L, U_C$ trên hệ trục tọa độ để giải nhanh các bài toán độ lệch pha và cực trị.",
                    "Phương pháp số phức trong máy tính Casio: $i = \\frac{u}{R + (Z_L - Z_C)j}$."
                ],
                "traps": [
                    "Giá trị hiệu dụng bằng giá trị cực đại chia cho $\\sqrt{2}$: $U = U_0 / \\sqrt{2}$, $I = I_0 / \\sqrt{2}$.",
                    "Cuộn dây không thuần cảm có điện trở thuần $r$: Khi đó $R_{\\text{toàn mạch}} = R + r$ và $Z = \\sqrt{(R+r)^2 + (Z_L - Z_C)^2}$."
                ]
            },

            "optics": {
                "title": "Quang hình học & Thấu kính (Optics)",
                "overview": "Nghiên cứu sự truyền thẳng, phản xạ, khúc xạ ánh sáng và tạo ảnh qua gương phẳng, lăng kính, thấu kính mỏng.",
                "core_laws": [
                    "Định luật khúc xạ ánh sáng (Snell): $n_1 \\sin i = n_2 \\sin r$.",
                    "Phản xạ toàn phần: Xảy ra khi ánh sáng truyền từ môi trường chiết quang hơn sang môi trường kém chiết quang ($n_1 > n_2$) với góc tới $i \\ge i_{gh}$ (với $\\sin i_{gh} = n_2/n_1$)."
                ],
                "formulas": [
                    {"name": "Công thức thấu kính mỏng", "formula": "\\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d'}"},
                    {"name": "Độ tụ thấu kính", "formula": "D = \\frac{1}{f(\\text{m})} \\quad (\\text{diop - dp})"},
                    {"name": "Số phóng đại ảnh", "formula": "k = -\\frac{d'}{d} = \\frac{f}{f - d} = \\frac{f - d'}{f}"},
                    {"name": "Khoảng cách vật - ảnh", "formula": "L = |d + d'|"}
                ],
                "key_methods": [
                    "Quy ước dấu quang học: Vật thật $d > 0$; Ảnh thật $d' > 0$, ảnh ảo $d' < 0$; Thấu kính hội tụ $f > 0, D > 0$; Thấu kính phân kỳ $f < 0, D < 0$.",
                    "Số phóng đại $k > 0$: Ảnh cùng chiều vật (ảnh ảo); $k < 0$: Ảnh ngược chiều vật (ảnh thật)."
                ],
                "traps": [
                    "Thấu kính phân kỳ luôn cho ảnh ảo, cùng chiều và nhỏ hơn vật thật ($|d'| < d$).",
                    "Khi tính độ tụ $D = 1/f$, tiêu cự $f$ bắt buộc phải đổi sang đơn vị mét (m)."
                ]
            },

            "thermodynamics": {
                "title": "Nhiệt học & Khí lý tưởng (Thermodynamics & Ideal Gas)",
                "overview": "Nghiên cứu cấu tạo chất theo thuyết động học phân tử, các đẳng quá trình và hai nguyên lý nhiệt động lực học.",
                "core_laws": [
                    "Thuyết động học phân tử: Các chất cấu tạo từ các phân tử chuyển động hỗn loạn không ngừng; nhiệt độ càng cao phân tử chuyển động càng nhanh.",
                    "Nguyên lý I Nhiệt động lực học: Độ biến thiên nội năng bằng tổng công và nhiệt lượng hệ nhận được: $\\Delta U = A + Q$.",
                    "Nguyên lý II Nhiệt động lực học (Clausius & Kelvin): Nhiệt không thể tự truyền từ vật lạnh sang vật nóng hơn. Động cơ nhiệt không thể chuyển hóa toàn bộ nhiệt lượng nhận được thành công cơ học."
                ],
                "formulas": [
                    {"name": "Đẳng nhiệt (Boyle-Mariotte)", "formula": "P_1 V_1 = P_2 V_2 = \\text{hằng số}"},
                    {"name": "Đẳng tích (Charles)", "formula": "\\frac{P_1}{T_1} = \\frac{P_2}{T_2} = \\text{hằng số}"},
                    {"name": "Đẳng áp (Gay-Lussac)", "formula": "\\frac{V_1}{T_1} = \\frac{V_2}{T_2} = \\text{hằng số}"},
                    {"name": "Phương trình trạng thái khí lý tưởng", "formula": "\\frac{P_1 V_1}{T_1} = \\frac{P_2 V_2}{T_2} \\quad \\text{hoặc} \\quad P V = n R T = \\frac{m}{M} R T"},
                    {"name": "Nhiệt lượng tỏa / thu", "formula": "Q = m c \\Delta T = m c (T_2 - T_1)"},
                    {"name": "Hiệu suất động cơ nhiệt Carnot", "formula": "\\eta = \\frac{A}{Q_1} = \\frac{Q_1 - Q_2}{Q_1} = 1 - \\frac{T_2}{T_1}"}
                ],
                "key_methods": [
                    "Phương pháp lập bảng trạng thái: Ghi rõ $(P_1, V_1, T_1)$ và $(P_2, V_2, T_2)$ rồi xác định quá trình biến đổi để áp dụng đúng định luật.",
                    "Phương pháp cân bằng nhiệt: $Q_{\\text{tỏa}} = Q_{\\text{thu}}$."
                ],
                "traps": [
                    "Nhiệt độ $T$ trong các phương trình khí bắt buộc là nhiệt độ tuyệt đối Kelvin: $T = t(^\\circ\\text{C}) + 273$.",
                    "Quy ước dấu nguyên lý I: $Q > 0$ (hệ nhận nhiệt), $Q < 0$ (hệ tỏa nhiệt); $A > 0$ (hệ nhận công/bị nén), $A < 0$ (hệ sinh công/dãn khí)."
                ]
            },

            "nuclear_quantum": {
                "title": "Lượng tử ánh sáng & Vật lý hạt nhân (Quantum & Nuclear Physics)",
                "overview": "Thuyết lượng tử Einstein, hiện tượng quang điện, mẫu Bo, cấu trúc hạt nhân, phản ứng hạt nhân và phóng xạ.",
                "core_laws": [
                    "Thuyết lượng tử ánh sáng: Ánh sáng gồm các hạt gọi là photon. Với mỗi ánh sáng đơn sắc, các photon đều mang năng lượng như nhau $\\varepsilon = hf$.",
                    "Định luật bảo toàn trong phản ứng hạt nhân: Bảo toàn số khối $A$, bảo toàn điện tích $Z$, bảo toàn động lượng và bảo toàn năng lượng toàn phần (không có bảo toàn khối lượng nghỉ)."
                ],
                "formulas": [
                    {"name": "Năng lượng photon", "formula": "\\varepsilon = h f = \\frac{h c}{\\lambda}"},
                    {"name": "Giới hạn quang điện", "formula": "\\lambda_0 = \\frac{h c}{A_0} \\quad (A_0 \\text{ là công thoát})"},
                    {"name": "Mẫu nguyên tử Bo", "formula": "r_n = n^2 r_0, \\quad E_n = -\\frac{13.6}{n^2} \\text{ eV}"},
                    {"name": "Độ hụt khối", "formula": "\\Delta m = [Z m_p + (A - Z)m_n] - m_{hn}"},
                    {"name": "Năng lượng liên kết", "formula": "W_{lk} = \\Delta m \\cdot c^2, \\quad W_{lkr} = \\frac{W_{lk}}{A}"},
                    {"name": "Định luật phóng xạ", "formula": "N(t) = N_0 \\cdot 2^{-t/T} = N_0 e^{-\\lambda t}, \\quad m(t) = m_0 \\cdot 2^{-t/T}"}
                ],
                "key_methods": [
                    "Năng lượng tỏa ra hoặc thu vào trong phản ứng hạt nhân: $\\Delta E = (m_{\\text{trước}} - m_{\\text{sau}})c^2 = \\Delta m_{\\text{sau}}c^2 - \\Delta m_{\\text{trước}}c^2 = W_{lk(\\text{sau})} - W_{lk(\\text{trước})}$.",
                    "Nếu $\\Delta E > 0$: Phản ứng tỏa năng lượng; Nếu $\\Delta E < 0$: Phản ứng thu năng lượng."
                ],
                "traps": [
                    "Chuyển đổi năng lượng: $1\\text{ eV} = 1.6 \\times 10^{-19}\\text{ J}$, $1\\text{ MeV} = 10^6\\text{ eV} = 1.6 \\times 10^{-13}\\text{ J}$.",
                    "Khối lượng nguyên tử tính bằng $u$: $1\\text{ u} \\cdot c^2 \\approx 931.5\\text{ MeV}$."
                ]
            }
        }
        return topics.get(topic_id, topics["mechanics"])
