"""
build_full_notebook.py - Assemble complete 11-phase AI_Training.ipynb notebook.
"""

import json
import os

def build_notebook():
    existing_nb_path = "AI_Training.ipynb"
    with open(existing_nb_path, "r", encoding="utf-8") as f:
        nb = json.load(f)

    # Filter cells up to Phase 4 (keep existing well-crafted Phase 1-4 cells)
    # Let's inspect where Phase 4 ends
    cells = []
    for c in nb["cells"]:
        cells.append(c)
        if c.get("id") == "section-20-phase4-summary" or c.get("id") == "cell-phase4-summary":
            pass

    # Let's create all new cells for Phases 5 to 11
    new_cells = [
        # ==========================================
        # PHASE 5: TRAINING
        # ==========================================
        {
            "cell_type": "markdown",
            "id": "header-phase5",
            "metadata": {},
            "source": [
                "---\n",
                "# Phase 5 — Training (Quá trình Huấn luyện)\n",
                "\n",
                "**Mục tiêu của Phase 5**:\n",
                "- Hiểu bản chất toán học và lập trình của quá trình huấn luyện AI.\n",
                "- Nắm vững 5 bước cốt lõi: Forward -> Loss -> Zero Grad -> Backward -> Step.\n",
                "- Hiểu Loss (MSE), Gradient, Backpropagation, Optimizer, Learning Rate, Epoch, Batch, DataLoader.\n",
                "- Phân biệt `model.train()` và `model.eval()`, cùng vai trò bắt buộc của `torch.no_grad()` khi đánh giá."
            ]
        },
        {
            "cell_type": "markdown",
            "id": "section-21-loss-and-optimizer-explanation",
            "metadata": {},
            "source": [
                "### 1. Loss Function & Optimizer (Hàm Mất mát và Bộ Tối ưu hóa)\n",
                "\n",
                "**WHAT**:\n",
                "- **Loss Function (MSELoss)**: Đo lường độ sai lệch giữa giá trị dự đoán $\\hat{y}$ và thực tế $y$.\n",
                "  $$\\text{MSE} = \\frac{1}{N} \\sum_{i=1}^{N} (\\hat{y}_i - y_i)^2$$\n",
                "- **Optimizer (SGD / Adam)**: Thuật toán cập nhật trọng số ($w, b$) dựa trên gradient để giảm Loss.\n",
                "  $$w_{\\text{new}} = w_{\\text{old}} - \\eta \\cdot \\frac{\\partial L}{\\partial w}$$\n",
                "  trong đó $\\eta$ là Learning Rate.\n",
                "\n",
                "**WHY**:\n",
                "- Nếu không có Loss, model không biết mình đang đoán đúng hay sai.\n",
                "- Nếu không có Optimizer, model không biết phải điều chỉnh $w$ và $b$ theo hướng nào để tiến bộ.\n",
                "\n",
                "**HOW**:\n",
                "- `criterion = nn.MSELoss()`\n",
                "- `optimizer = torch.optim.Adam(model.parameters(), lr=0.01)`\n",
                "\n",
                "**WHEN**: Khởi tạo trước khi bước vào Training Loop."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "id": "cell-21-loss-optimizer-init",
            "metadata": {},
            "outputs": [],
            "source": [
                "# ============================================================\n",
                "# CELL 21: Loss Function and Optimizer Initialization\n",
                "# ============================================================\n",
                "import torch\n",
                "import torch.nn as nn\n",
                "import torch.optim as optim\n",
                "from src.model import LinearRegressionModel\n",
                "from src.utils import set_seed\n",
                "\n",
                "set_seed(42)\n",
                "model = LinearRegressionModel(input_size=1, output_size=1)\n",
                "criterion = nn.MSELoss()\n",
                "optimizer = optim.Adam(model.parameters(), lr=0.05)\n",
                "\n",
                "print(\"Model:\", model)\n",
                "print(\"Loss Function:\", criterion)\n",
                "print(\"Optimizer:\", optimizer)\n"
            ]
        },
        {
            "cell_type": "markdown",
            "id": "section-22-single-step-walkthrough",
            "metadata": {},
            "source": [
                "### 2. Chi tiết 1 bước học (Single Training Step)\n",
                "\n",
                "Mỗi bước học diễn ra tuần tự 5 dòng code quan trọng bậc nhất:\n",
                "1. `y_pred = model(x)`: **Forward Pass** — Tính toán đầu ra.\n",
                "2. `loss = criterion(y_pred, y)`: **Compute Loss** — Tính sai số.\n",
                "3. `optimizer.zero_grad()`: **Zero Gradients** — Xóa gradient cũ tích lũy từ bước trước.\n",
                "4. `loss.backward()`: **Backpropagation** — Tính đạo hàm $\\frac{\\partial L}{\\partial w}$ và $\\frac{\\partial L}{\\partial b}$.\n",
                "5. `optimizer.step()`: **Update Parameters** — Cập nhật $w$ và $b$ theo chiều dốc giảm của Loss."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "id": "cell-22-single-training-step",
            "metadata": {},
            "outputs": [],
            "source": [
                "# ============================================================\n",
                "# CELL 22: Single Training Step Detailed Walkthrough\n",
                "# ============================================================\n",
                "sample_x = torch.tensor([[2.0]], dtype=torch.float32)\n",
                "sample_y = torch.tensor([[5.0]], dtype=torch.float32)  # 2*2 + 1 = 5\n",
                "\n",
                "print(f\"Initial Weight (w): {model.linear.weight.item():.4f}\")\n",
                "print(f\"Initial Bias   (b): {model.linear.bias.item():.4f}\")\n",
                "\n",
                "# 1. Forward pass\n",
                "y_pred = model(sample_x)\n",
                "print(f\"1. Forward Pass Prediction: {y_pred.item():.4f} (Expected: 5.0)\")\n",
                "\n",
                "# 2. Compute Loss\n",
                "loss = criterion(y_pred, sample_y)\n",
                "print(f\"2. MSE Loss: {loss.item():.4f}\")\n",
                "\n",
                "# 3. Zero Grad\n",
                "optimizer.zero_grad()\n",
                "\n",
                "# 4. Backward Pass (Compute Gradients)\n",
                "loss.backward()\n",
                "print(f\"4. Gradient dL/dw: {model.linear.weight.grad.item():.4f}\")\n",
                "print(f\"   Gradient dL/db: {model.linear.bias.grad.item():.4f}\")\n",
                "\n",
                "# 5. Step (Update weights)\n",
                "optimizer.step()\n",
                "print(f\"5. Updated Weight (w): {model.linear.weight.item():.4f}\")\n",
                "print(f\"   Updated Bias   (b): {model.linear.bias.item():.4f}\")\n"
            ]
        },
        {
            "cell_type": "markdown",
            "id": "section-23-full-training-loop",
            "metadata": {},
            "source": [
                "### 3. Vòng lặp huấn luyện hoàn chỉnh (Full Training Loop với DataLoader)\n",
                "\n",
                "Trong thực tế, dữ liệu được chia theo **Batch** qua `DataLoader` và lặp lại qua nhiều **Epoch**."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "id": "cell-23-full-training-loop-code",
            "metadata": {},
            "outputs": [],
            "source": [
                "# ============================================================\n",
                "# CELL 23: Complete Training Loop Execution\n",
                "# ============================================================\n",
                "from src.dataset import create_dataloaders\n",
                "from src.evaluate import evaluate_model\n",
                "\n",
                "train_loader, val_loader, test_loader, _ = create_dataloaders(project_root=\".\", batch_size=32)\n",
                "epochs = 50\n",
                "train_loss_history = []\n",
                "val_loss_history = []\n",
                "\n",
                "for epoch in range(1, epochs + 1):\n",
                "    model.train()  # Set model to training mode\n",
                "    running_loss = 0.0\n",
                "    for x_b, y_b in train_loader:\n",
                "        pred = model(x_b)\n",
                "        loss = criterion(pred, y_b)\n",
                "        \n",
                "        optimizer.zero_grad()\n",
                "        loss.backward()\n",
                "        optimizer.step()\n",
                "        \n",
                "        running_loss += loss.item() * len(x_b)\n",
                "    \n",
                "    epoch_train_loss = running_loss / len(train_loader.dataset)\n",
                "    val_loss, val_mae, val_r2, _, _ = evaluate_model(model, val_loader, criterion, torch.device('cpu'))\n",
                "    \n",
                "    train_loss_history.append(epoch_train_loss)\n",
                "    val_loss_history.append(val_loss)\n",
                "    \n",
                "    if epoch % 10 == 0 or epoch == 1:\n",
                "        w = model.linear.weight.item()\n",
                "        b = model.linear.bias.item()\n",
                "        print(f\"Epoch [{epoch:2d}/{epochs:2d}] | Train Loss: {epoch_train_loss:.6f} | Val Loss: {val_loss:.6f} | w: {w:.4f} (target 2.0) | b: {b:.4f} (target 1.0)\")\n"
            ]
        },
        # ==========================================
        # PHASE 6: EVALUATION & METRICS
        # ==========================================
        {
            "cell_type": "markdown",
            "id": "header-phase6",
            "metadata": {},
            "source": [
                "---\n",
                "# Phase 6 — Evaluation & Metrics (Đánh giá Mô hình)\n",
                "\n",
                "**Mục tiêu của Phase 6**:\n",
                "- Đánh giá mô hình trên tập Test chưa từng xuất hiện trong quá trình train.\n",
                "- Hiểu các chỉ số: **MSE** (Mean Squared Error), **MAE** (Mean Absolute Error), **R²** (Coefficient of Determination).\n",
                "- Đảm bảo luôn sử dụng `model.eval()` và `with torch.no_grad():`."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "id": "cell-24-evaluation-test-metrics",
            "metadata": {},
            "outputs": [],
            "source": [
                "# ============================================================\n",
                "# CELL 24: Test Set Evaluation and Metrics\n",
                "# ============================================================\n",
                "from src.evaluate import evaluate_model, test_unseen_points\n",
                "\n",
                "test_loss, test_mae, test_r2, y_true, y_pred = evaluate_model(model, test_loader, criterion, torch.device('cpu'))\n",
                "\n",
                "print(\"=\" * 55)\n",
                "print(\"           FINAL TEST SET PERFORMANCE\")\n",
                "print(\"=\" * 55)\n",
                "print(f\"Test MSE Loss : {test_loss:.6f}\")\n",
                "print(f\"Test MAE      : {test_mae:.6f} (Mean Absolute Error)\")\n",
                "print(f\"Test R² Score : {test_r2:.6f} (Target: 1.0 = Perfect fit)\")\n",
                "print(\"=\" * 55)\n",
                "\n",
                "# Evaluate custom unseen coordinates\n",
                "test_unseen_points(model, torch.device('cpu'), custom_points=[11.0, 15.0, 20.0, 50.0, -15.0, 0.0])\n"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "id": "cell-25-visualization-plots",
            "metadata": {},
            "outputs": [],
            "source": [
                "# ============================================================\n",
                "# CELL 25: Visualization of Predictions vs Ground Truth\n",
                "# ============================================================\n",
                "import matplotlib.pyplot as plt\n",
                "from src.evaluate import plot_predictions\n",
                "\n",
                "plot_predictions(model, torch.device('cpu'), test_loader, save_path='plots/test_predictions.png')\n",
                "\n",
                "# Display inline in notebook\n",
                "img = plt.imread('plots/test_predictions.png')\n",
                "plt.figure(figsize=(10, 6))\n",
                "plt.imshow(img)\n",
                "plt.axis('off')\n",
                "plt.title('Prediction vs Ground Truth Verification')\n",
                "plt.show()\n"
            ]
        },
        # ==========================================
        # PHASE 7: CHECKPOINT & RESUME TRAINING
        # ==========================================
        {
            "cell_type": "markdown",
            "id": "header-phase7",
            "metadata": {},
            "source": [
                "---\n",
                "# Phase 7 — Checkpoint & Resume Training (Lưu & Tiếp tục Huấn luyện)\n",
                "\n",
                "**Mục tiêu của Phase 7**:\n",
                "- Hiểu cách lưu trạng thái đầy đủ (`model_state_dict`, `optimizer_state_dict`, `scheduler_state_dict`, `epoch`, `best_val_loss`).\n",
                "- Resume training khi Colab bị ngắt kết nối mà không cần train lại từ đầu.\n",
                "- Phân biệt `best_model.pth` và `checkpoint_epoch_N.pth`."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "id": "cell-26-checkpoint-save-load",
            "metadata": {},
            "outputs": [],
            "source": [
                "# ============================================================\n",
                "# CELL 26: Save & Load Checkpoint Test\n",
                "# ============================================================\n",
                "from src.checkpoint import save_checkpoint, load_checkpoint, save_best_model\n",
                "\n",
                "ckpt_file = 'models/checkpoints/checkpoint_epoch_50.pth'\n",
                "save_checkpoint(\n",
                "    path=ckpt_file,\n",
                "    epoch=50,\n",
                "    model=model,\n",
                "    optimizer=optimizer,\n",
                "    scheduler=None,\n",
                "    loss=train_loss_history[-1],\n",
                "    best_val_loss=val_loss_history[-1],\n",
                "    config={'seed': 42, 'lr': 0.05}\n",
                ")\n",
                "\n",
                "# Simulate runtime disconnect by initializing a fresh model\n",
                "fresh_model = LinearRegressionModel(input_size=1, output_size=1)\n",
                "fresh_optimizer = optim.Adam(fresh_model.parameters(), lr=0.05)\n",
                "\n",
                "start_epoch, last_loss, best_val, loaded_cfg = load_checkpoint(\n",
                "    ckpt_file, fresh_model, fresh_optimizer, device=torch.device('cpu')\n",
                ")\n",
                "\n",
                "print(f'Resuming from Epoch: {start_epoch}')\n",
                "print(f'Restored Model Weight: {fresh_model.linear.weight.item():.4f}')\n",
                "print(f'Restored Model Bias  : {fresh_model.linear.bias.item():.4f}')\n"
            ]
        },
        # ==========================================
        # PHASE 8: STABILITY & REGULARIZATION
        # ==========================================
        {
            "cell_type": "markdown",
            "id": "header-phase8",
            "metadata": {},
            "source": [
                "---\n",
                "# Phase 8 — Stability: Early Stopping, LR Scheduler & Gradient Clipping\n",
                "\n",
                "**Mục tiêu của Phase 8**:\n",
                "- **Early Stopping**: Tự động dừng huấn luyện khi validation loss không giảm sau `patience` epochs để chống overfitting.\n",
                "- **Learning Rate Scheduler (`ReduceLROnPlateau`)**: Giảm tốc độ học khi loss đi vào vùng bão hòa.\n",
                "- **Gradient Clipping (`clip_grad_norm_`)**: Chặn hiện tượng bùng nổ gradient (Exploding Gradients)."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "id": "cell-27-stability-features",
            "metadata": {},
            "outputs": [],
            "source": [
                "# ============================================================\n",
                "# CELL 27: Training with Early Stopping & LR Scheduler\n",
                "# ============================================================\n",
                "from torch.optim.lr_scheduler import ReduceLROnPlateau\n",
                "\n",
                "model_stable = LinearRegressionModel()\n",
                "optimizer_stable = optim.Adam(model_stable.parameters(), lr=0.1)\n",
                "scheduler = ReduceLROnPlateau(optimizer_stable, mode='min', patience=3, factor=0.5)\n",
                "\n",
                "patience = 5\n",
                "best_val = float('inf')\n",
                "no_improve = 0\n",
                "\n",
                "print('Starting stable training loop with patience = 5...')\n",
                "for ep in range(1, 40):\n",
                "    model_stable.train()\n",
                "    for xb, yb in train_loader:\n",
                "        pred = model_stable(xb)\n",
                "        l = criterion(pred, yb)\n",
                "        optimizer_stable.zero_grad()\n",
                "        l.backward()\n",
                "        torch.nn.utils.clip_grad_norm_(model_stable.parameters(), max_norm=1.0)\n",
                "        optimizer_stable.step()\n",
                "    \n",
                "    val_l, _, _, _, _ = evaluate_model(model_stable, val_loader, criterion, torch.device('cpu'))\n",
                "    scheduler.step(val_l)\n",
                "    \n",
                "    if val_l < best_val:\n",
                "        best_val = val_l\n",
                "        no_improve = 0\n",
                "    else:\n",
                "        no_improve += 1\n",
                "        if no_improve >= patience:\n",
                "            print(f'Early stopping triggered at epoch {ep}! Best Val Loss: {best_val:.6f}')\n",
                "            break\n"
            ]
        },
        # ==========================================
        # PHASE 9: EXPERIMENT TRACKING
        # ==========================================
        {
            "cell_type": "markdown",
            "id": "header-phase9",
            "metadata": {},
            "source": [
                "---\n",
                "# Phase 9 — Experiment Tracking (Quản lý Thí nghiệm)\n",
                "\n",
                "**Mục tiêu của Phase 9**:\n",
                "- Tự động hóa toàn bộ quá trình chạy experiment qua module `src/train.py`.\n",
                "- Lưu cấu hình bất biến (`config.yaml`), nhật ký huấn luyện (`train.log`), bảng đo lường (`metrics.csv`), và đồ thị (`loss.png`)."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "id": "cell-28-run-experiment",
            "metadata": {},
            "outputs": [],
            "source": [
                "# ============================================================\n",
                "# CELL 28: Run Experiment 001 Pipeline\n",
                "# ============================================================\n",
                "from src.train import train_model\n",
                "\n",
                "exp_results = train_model(\n",
                "    config_path='configs/config_v1.yaml',\n",
                "    experiment_name='experiment_001',\n",
                "    project_root='.'\n",
                ")\n",
                "\n",
                "print('\\nExperiment 001 completed successfully!')\n",
                "print(f'Results: {exp_results}')\n"
            ]
        },
        # ==========================================
        # PHASE 10: SCALING
        # ==========================================
        {
            "cell_type": "markdown",
            "id": "header-phase10",
            "metadata": {},
            "source": [
                "---\n",
                "# Phase 10 — Scaling (Mở rộng Dữ liệu và Quy mô)\n",
                "\n",
                "**Mục tiêu của Phase 10**:\n",
                "- Khả năng scale dữ liệu từ 1,000 -> 10,000 -> 100,000 samples mà không cần đổi kiến trúc code.\n",
                "- Quản lý dataset versions (`dataset_v1`, `dataset_v2`)."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "id": "cell-29-scaling-dataset",
            "metadata": {},
            "outputs": [],
            "source": [
                "# ============================================================\n",
                "# CELL 29: Generate Large Dataset (10,000 samples)\n",
                "# ============================================================\n",
                "from src.dataset import generate_and_save_dataset\n",
                "\n",
                "generate_and_save_dataset(\n",
                "    project_root='.',\n",
                "    version='v2',\n",
                "    num_samples=10000,\n",
                "    seed=42\n",
                ")\n"
            ]
        },
        # ==========================================
        # PHASE 11: ADVANCED AI & NEURAL NETWORKS
        # ==========================================
        {
            "cell_type": "markdown",
            "id": "header-phase11",
            "metadata": {},
            "source": [
                "---\n",
                "# Phase 11 — Advanced AI: Neural Networks & Math/Science Solver\n",
                "\n",
                "**Mục tiêu của Phase 11**:\n",
                "- Chuyển tiếp từ Linear Model sang **Multi-Layer Perceptron (Neural Network)** để giải bài toán phi tuyến: $y = 2x^2 - 3x + 1$.\n",
                "- Kiến trúc mạng Deep Learning mở rộng cho CNN (thị giác), NLP / Transformer (xử lý ngôn ngữ), LLM Fine-tuning (LoRA/QLoRA), và AI Gia sư Toán/Lý/Hóa."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "id": "cell-30-mlp-nonlinear-experiment",
            "metadata": {},
            "outputs": [],
            "source": [
                "# ============================================================\n",
                "# CELL 30: Train Multi-Layer Perceptron on Non-linear Formula\n",
                "# Formula: y = 2x^2 - 3x + 1 + noise\n",
                "# ============================================================\n",
                "from src.advanced import train_advanced_nn_experiment\n",
                "\n",
                "test_r2 = train_advanced_nn_experiment(project_root='.', epochs=60, lr=0.01)\n",
                "print(f'\\nAdvanced Non-linear MLP Model achieved R² Score: {test_r2:.4f}')\n"
            ]
        },
        {
            "cell_type": "markdown",
            "id": "section-project-completion-summary",
            "metadata": {},
            "source": [
                "---\n",
                "## Project Completion Summary (Tổng kết Dự án)\n",
                "\n",
                "Toàn bộ 11 Phases đã được triển khai hoàn chỉnh:\n",
                "- **Phase 1**: Environment, Google Colab & Google Drive, CUDA/GPU, Random Seed.\n",
                "- **Phase 2**: Tensors, Shapes, Dtypes, Device mapping.\n",
                "- **Phase 3**: Dataset Generation & Versioning, Train/Validation/Test Split.\n",
                "- **Phase 4**: Linear Model, Weights, Bias, Forward Pass.\n",
                "- **Phase 5**: Training Loop, MSE Loss, Backpropagation, Optimizer, `model.train()` / `model.eval()`.\n",
                "- **Phase 6**: Evaluation Metrics (MSE, MAE, R²), Unseen coordinate predictions, Visualization.\n",
                "- **Phase 7**: Checkpoint Save/Load, Resume Training, Best Model.\n",
                "- **Phase 8**: Early Stopping, LR Scheduler, Gradient Clipping.\n",
                "- **Phase 9**: Experiment Tracking (`config.yaml`, `train.log`, `metrics.csv`, `loss.png`).\n",
                "- **Phase 10**: Scaling to 10,000+ samples and large datasets.\n",
                "- **Phase 11**: Multi-Layer Perceptron (MLP) for non-linear equations & roadmap to Transformer, LoRA, and Math/Science AI Tutor."
            ]
        }
    ]

    # Combine original Phase 1-4 cells with new Phase 5-11 cells
    # Let's find index where phase 4 ended
    final_cells = []
    found_p4 = False
    for c in cells:
        final_cells.append(c)
        if c.get("id") == "section-20-phase4-summary":
            found_p4 = True
            break

    if not found_p4:
        final_cells = cells

    final_cells.extend(new_cells)
    nb["cells"] = final_cells

    with open("AI_Training.ipynb", "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=1, ensure_ascii=False)

    print(f"Successfully assembled complete AI_Training.ipynb with {len(final_cells)} cells!")

if __name__ == "__main__":
    build_notebook()
