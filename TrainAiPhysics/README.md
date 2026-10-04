# TrainAiPhysics - Hệ Thống AI & Động Cơ Sinh Đề Môn Vật Lý Chuyên Sâu

Hệ thống AI chuyên biệt dành riêng cho môn **Vật Lý** (THPT, Tuyển sinh 10, THPT Quốc Gia và Luyện thi Đánh giá năng lực).

## 🚀 Tính Năng Chính
1. **Physics Knowledge Base (`knowledge_base.py`)**: Hệ tri thức vật lý toàn diện gồm lý thuyết, hệ thống công thức, hằng số vật lý chuẩn, phương pháp giải toán và các cạm bẫy thường gặp.
2. **Algorithmic & AI Generator (`generator.py`)**: Sinh đề thi Vật Lý đa dạng chuyên đề:
   - Cơ học & Động lực học chất điểm (Mechanics)
   - Dao động điều hòa & Sóng cơ (Oscillations & Waves)
   - Dòng điện xoay chiều & Mạch RLC (Electricity & Electromagnetism)
   - Quang học & Thấu kính (Optics)
   - Nhiệt học & Khí lý tưởng (Thermodynamics)
   - Lượng tử ánh sáng & Vật lý hạt nhân (Quantum & Nuclear)
3. **Intelligent Answer Evaluator (`evaluator.py`)**: Thẩm định câu trả lời, bóc tách số học & đơn vị đo lường (m/s, rad/s, A, V, Ω, J, W, eV, atm, °C...), đánh giá sai số làm tròn số học và nhận xét sư phạm chi tiết.
4. **Interactive AI Physics Tutor (`ai_tutor.py`)**: Hỗ trợ giải thích bản chất vật lý, hướng dẫn giải bài tập và tra cứu nhanh công thức.
5. **PyTorch Physics Neural Network (`model.py` & `train.py`)**: Mô hình Deep Learning xấp xỉ các quy luật vật lý phi tuyến (động học, cộng hưởng, khúc xạ, bán rã).
6. **FastAPI Microservice (`server.py`)**: Cung cấp REST API hiệu năng cao tại cổng `8001`.

## 🛠️ Chạy Máy Chủ Physics AI
```bash
cd d:\ProjectAnhAn\TrainAiPhysics
python src/server.py
```
Dịch vụ sẽ khởi chạy tại: `http://localhost:8001`
