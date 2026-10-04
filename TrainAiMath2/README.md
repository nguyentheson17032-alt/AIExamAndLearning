# AI Training Project

## Overview

Dự án xây dựng và huấn luyện mô hình AI từ gốc đến ngọn với PyTorch, bắt đầu từ bài toán hồi quy cơ bản `y = 2x + 1` và mở rộng sang mạng nơ-ron sâu (Multi-Layer Perceptron) giải phương trình phi tuyến $y = 2x^2 - 3x + 1$, hướng tới hệ thống AI Gia sư Toán / Lý / Hóa trong tương lai.

## Project Structure

```
TrainAiMath2/
├── data/
│   ├── raw/
│   │   ├── dataset_v1/          # 1,000 samples (y = 2x + 1 + noise)
│   │   └── dataset_v2/          # 10,000 samples (scaled dataset)
│   └── processed/
│       ├── train/               # train.pt
│       ├── validation/          # val.pt
│       ├── test/                # test.pt
│       └── split_metadata.json
├── models/
│   ├── checkpoints/             # checkpoint_epoch_*.pth & best_model.pth
│   └── final/                   # experiment_001_final.pth
├── configs/
│   ├── config_v1.yaml           # Config template cho Linear Regression
│   └── config_v2_nn.yaml        # Config template cho MLP Neural Network
├── experiments/
│   ├── experiment_001/          # Kết quả thí nghiệm Linear Regression
│   │   ├── config.yaml          # Bản sao cấu hình bất biến
│   │   ├── train.log            # Nhật ký huấn luyện chi tiết
│   │   ├── metrics.csv          # Bảng theo dõi epoch, loss, MAE, R²
│   │   ├── loss.png             # Đồ thị loss curve
│   │   ├── predictions.png      # Đồ thị dự đoán vs thực tế
│   │   ├── best_model.pth       # Trọng số tốt nhất
│   │   └── model.pth            # Model cuối cùng
│   └── experiment_002_mlp/      # Thí nghiệm MLP phi tuyến
├── notebooks/
├── src/
│   ├── dataset.py               # Sinh dữ liệu, PyTorch Dataset & DataLoader
│   ├── model.py                 # LinearRegressionModel & MLPRegressionModel
│   ├── train.py                 # Pipeline huấn luyện toàn diện
│   ├── evaluate.py              # Đánh giá (MSE, MAE, R²), đồ thị & kiểm tra điểm mới
│   ├── checkpoint.py           # Lưu/tải checkpoint & resume training
│   ├── advanced.py              # Thử nghiệm MLP & mở rộng Deep Learning
│   └── utils.py                 # Cố định random seed, phát hiện GPU & tải config
├── tests/
│   └── test_all_phases.py       # Bộ kiểm thử tự động toàn bộ 11 phases
├── plots/                       # Toàn bộ đồ thị xuất ra
├── AI_Training.ipynb            # Jupyter Notebook hoàn chỉnh 11 phases cho Colab
├── todo.md                      # Trạng thái hoàn thành các mục tiêu
├── requirements.txt             # Danh sách thư viện cần thiết
└── README.md
```

## How to Run

### 1. Trên Google Colab
1. Mở [Google Colab](https://colab.research.google.com/).
2. Tải lên hoặc mở file `AI_Training.ipynb`.
3. Chọn **Runtime → Change runtime type → GPU (T4)**.
4. Chạy tuần tự các Cell từ trên xuống dưới (Phases 1 đến 11).

### 2. Chạy qua Python Modules (Command Line)
- **Khởi chạy Web App Sinh bài tập & Gia sư AI (Khuyên dùng)**:
  ```bash
  python src/server.py
  ```
  Truy cập giao diện tại: **`http://localhost:8000`**

- **Sinh dữ liệu**:
  ```bash
  python src/dataset.py
  ```
- **Chạy Thí nghiệm Huấn luyện**:
  ```bash
  python src/train.py
  ```
- **Chạy Thí nghiệm Mạng Nơ-ron Sâu (MLP Non-linear)**:
  ```bash
  python src/advanced.py
  ```
- **Chạy Bộ Test Tự động**:
  ```bash
  python -m unittest tests/test_all_phases.py
  ```

## Configuration (`configs/config_v1.yaml`)

| Tham số | Giá trị mặc định | Ý nghĩa |
| :--- | :--- | :--- |
| `seed` | `42` | Cố định random seed để tái lập kết quả |
| `training.epochs` | `100` | Số vòng lặp huấn luyện |
| `training.batch_size` | `32` | Số mẫu mỗi mini-batch |
| `training.learning_rate` | `0.001` | Tốc độ học của Optimizer |
| `training.early_stopping_patience` | `10` | Dừng sớm sau N epoch không cải thiện |
| `training.gradient_clip_norm` | `null` | Giới hạn chuẩn gradient (bật khi train mạng sâu) |
| `scheduler.use_scheduler` | `false` | Bật/tắt ReduceLROnPlateau scheduler |
| `data.num_samples` | `1000` | Tổng số lượng mẫu |
| `data.train_ratio` | `0.70` | 70% dành cho huấn luyện |
| `data.validation_ratio` | `0.15` | 15% dành cho validation |
| `data.test_ratio` | `0.15` | 15% dành cho kiểm thử |

## Experiment History

| Experiment | Dataset | Model Architecture | Seed | Epochs | Best Val Loss | Test MAE | Test R² | Ghi chú |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `exp_001` | `dataset_v1` (1k) | Linear ($y = wx + b$) | 42 | 100 | ~0.2450 | ~0.3950 | **0.9928** | Hội tụ về $w \\approx 2.0, b \\approx 1.0$ |
| `exp_002` | `dataset_v2` (3k) | MLP (64-32 ReLU) | 42 | 60 | ~0.6200 | ~0.6120 | **0.9985** | Học xuất sắc hàm bậc hai phi tuyến |

## Roadmap

```
Phase 1  → Environment (Colab, Drive, GPU, Seed)          ✅ Hoàn thành
Phase 2  → Tensor (Shape, Dtype, Device)                  ✅ Hoàn thành
Phase 3  → Dataset (Generation, Splits, Versioning)       ✅ Hoàn thành
Phase 4  → Model (Linear, Weights, Bias, Forward)         ✅ Hoàn thành
Phase 5  → Training (Loss MSE, Backprop, Optimizer, Loop) ✅ Hoàn thành
Phase 6  → Evaluation (Validation, Test, MAE, R²)         ✅ Hoàn thành
Phase 7  → Checkpoint (Save, Load, Resume Training)       ✅ Hoàn thành
Phase 8  → Stability (Early Stopping, Scheduler, Clip)    ✅ Hoàn thành
Phase 9  → Experiment (Tracking, Config, Metrics CSV)     ✅ Hoàn thành
Phase 10 → Scaling (Dataset v2, 10k samples)              ✅ Hoàn thành
Phase 11 → Advanced AI (MLP -> Transformer -> AI Tutor)   ✅ Hoàn thành
```
