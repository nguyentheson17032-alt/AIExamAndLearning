"""
train.py - Core training pipeline for AI Training Project.
Implements complete training loop, validation, optimizer, scheduler, gradient clipping,
early stopping, metrics logging (metrics.csv & train.log), and checkpointing.
"""

import os
import sys
import csv
import shutil
import torch
import torch.nn as nn
import torch.optim as optim

from src.utils import set_seed, get_device, load_config, save_config
from src.dataset import create_dataloaders
from src.model import LinearRegressionModel, MLPRegressionModel, get_model_parameters
from src.evaluate import evaluate_model, test_unseen_points, plot_training_history, plot_predictions
from src.checkpoint import save_checkpoint, load_checkpoint, save_best_model, save_final_model


def train_model(
    config_path: str = "configs/config_v1.yaml",
    experiment_name: str = "experiment_001",
    project_root: str = ".",
    resume_checkpoint_path: str = None
):
    """
    Execute full training pipeline based on configuration.
    """
    # 1. Load config
    config = load_config(os.path.join(project_root, config_path))
    seed = config.get("seed", 42)
    set_seed(seed)
    device = get_device()

    # 2. Setup Experiment directory and immutable config copy
    exp_dir = os.path.join(project_root, "experiments", experiment_name)
    os.makedirs(exp_dir, exist_ok=True)
    immutable_config_path = os.path.join(exp_dir, "config.yaml")
    save_config(config, immutable_config_path)

    log_path = os.path.join(exp_dir, "train.log")
    metrics_csv_path = os.path.join(exp_dir, "metrics.csv")
    checkpoints_dir = os.path.join(project_root, "models", "checkpoints")
    final_model_dir = os.path.join(project_root, "models", "final")
    os.makedirs(checkpoints_dir, exist_ok=True)
    os.makedirs(final_model_dir, exist_ok=True)

    # 3. Create DataLoaders
    batch_size = config.get("training", {}).get("batch_size", 32)
    train_loader, val_loader, test_loader, _ = create_dataloaders(
        project_root=project_root,
        batch_size=batch_size,
        shuffle_train=True
    )

    # 4. Instantiate Model
    model_type = config.get("model", {}).get("type", "linear")
    input_size = config.get("model", {}).get("input_size", 1)
    output_size = config.get("model", {}).get("output_size", 1)

    if model_type == "mlp":
        model = MLPRegressionModel(input_size=input_size, output_size=output_size).to(device)
    else:
        model = LinearRegressionModel(input_size=input_size, output_size=output_size).to(device)

    # 5. Loss Function and Optimizer
    criterion = nn.MSELoss()
    lr = config.get("training", {}).get("learning_rate", 0.001)
    optimizer_name = config.get("training", {}).get("optimizer", "adam").lower()

    if optimizer_name == "sgd":
        optimizer = optim.SGD(model.parameters(), lr=lr)
    else:
        optimizer = optim.Adam(model.parameters(), lr=lr)

    # 6. Learning Rate Scheduler (optional)
    scheduler_cfg = config.get("scheduler", {})
    use_scheduler = scheduler_cfg.get("use_scheduler", False)
    scheduler = None
    if use_scheduler:
        scheduler_patience = scheduler_cfg.get("scheduler_patience", 5)
        scheduler_factor = scheduler_cfg.get("scheduler_factor", 0.5)
        scheduler = optim.lr_scheduler.ReduceLROnPlateau(
            optimizer, mode="min", patience=scheduler_patience, factor=scheduler_factor
        )

    # 7. Checkpoint / Resume Handling
    start_epoch = 1
    best_val_loss = float("inf")
    epochs_no_improve = 0
    early_stopping_patience = config.get("training", {}).get("early_stopping_patience", 10)
    clip_norm = config.get("training", {}).get("gradient_clip_norm", None)
    total_epochs = config.get("training", {}).get("epochs", 100)

    if resume_checkpoint_path and os.path.exists(resume_checkpoint_path):
        start_epoch, _, best_val_loss, _ = load_checkpoint(
            resume_checkpoint_path, model, optimizer, scheduler, device=device
        )

    # Initialize metrics CSV file if starting from scratch
    if start_epoch == 1 or not os.path.exists(metrics_csv_path):
        with open(metrics_csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["epoch", "train_loss", "val_loss", "val_mae", "val_r2", "lr", "grad_norm"])

    log_file = open(log_path, "a", encoding="utf-8")

    def log_print(msg: str):
        print(msg)
        log_file.write(msg + "\n")
        log_file.flush()

    log_print("=" * 65)
    log_print(f"       STARTING TRAINING: {experiment_name.upper()}")
    log_print("=" * 65)
    log_print(f"Device: {device} | Total Epochs: {total_epochs} | Batch Size: {batch_size} | Initial LR: {lr}")
    log_print(f"Model Architecture:\n{model}")
    log_print("-" * 65)

    # 8. Main Training Loop
    for epoch in range(start_epoch, total_epochs + 1):
        model.train()  # Switch to training mode
        running_train_loss = 0.0
        last_grad_norm = 0.0

        for x_batch, y_batch in train_loader:
            x_batch = x_batch.to(device)
            y_batch = y_batch.to(device)

            # --- FORWARD PASS ---
            y_pred = model(x_batch)

            # --- LOSS COMPUTATION ---
            loss = criterion(y_pred, y_batch)

            # --- BACKPROPAGATION ---
            optimizer.zero_grad()  # Reset gradients from previous step
            loss.backward()        # Compute dLoss/dWeight & dLoss/dBias

            # --- GRADIENT CLIPPING (Optional) ---
            if clip_norm is not None:
                last_grad_norm = torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=clip_norm).item()
            else:
                # Compute gradient norm for tracking
                total_norm = 0.0
                for p in model.parameters():
                    if p.grad is not None:
                        total_norm += p.grad.data.norm(2).item() ** 2
                last_grad_norm = total_norm ** 0.5

            # --- OPTIMIZER STEP ---
            optimizer.step()       # Update weights: w = w - lr * grad

            running_train_loss += loss.item() * len(x_batch)

        epoch_train_loss = running_train_loss / len(train_loader.dataset)

        # --- VALIDATION LOOP (torch.no_grad() & model.eval()) ---
        val_loss, val_mae, val_r2, _, _ = evaluate_model(model, val_loader, criterion, device)

        # --- LR SCHEDULER STEP ---
        current_lr = optimizer.param_groups[0]["lr"]
        if scheduler is not None:
            scheduler.step(val_loss)

        # Record metrics to CSV
        with open(metrics_csv_path, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([epoch, epoch_train_loss, val_loss, val_mae, val_r2, current_lr, last_grad_norm])

        # Logging periodic progress
        if epoch % 10 == 0 or epoch == 1 or epoch == total_epochs:
            params = get_model_parameters(model)
            if "weight_val" in params and "bias_val" in params:
                param_str = f"w: {params['weight_val']:.4f}, b: {params['bias_val']:.4f}"
            else:
                param_str = f"params: {params['total_parameters']}"
            log_print(
                f"Epoch [{epoch:3d}/{total_epochs:3d}] | "
                f"Train Loss: {epoch_train_loss:.6f} | "
                f"Val Loss: {val_loss:.6f} | "
                f"Val MAE: {val_mae:.4f} | "
                f"Val R²: {val_r2:.4f} | "
                f"{param_str}"
            )

        # --- CHECKPOINT SAVING ---
        if epoch % 20 == 0:
            ckpt_file = os.path.join(checkpoints_dir, f"checkpoint_epoch_{epoch}.pth")
            save_checkpoint(ckpt_file, epoch, model, optimizer, scheduler, epoch_train_loss, best_val_loss, config)

        # --- BEST MODEL TRACKING & EARLY STOPPING ---
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            epochs_no_improve = 0
            best_model_path = os.path.join(exp_dir, "best_model.pth")
            ckpt_best_path = os.path.join(checkpoints_dir, "best_model.pth")
            save_best_model(best_model_path, model, config, val_loss)
            save_best_model(ckpt_best_path, model, config, val_loss)
        else:
            epochs_no_improve += 1
            if epochs_no_improve >= early_stopping_patience:
                log_print(f"⚠ Early Stopping triggered at epoch {epoch} (No improvement for {early_stopping_patience} epochs).")
                break

    log_print("-" * 65)
    log_print("Training complete.")

    # 9. Save final experiment model
    final_model_exp_path = os.path.join(exp_dir, "model.pth")
    final_model_global_path = os.path.join(final_model_dir, f"{experiment_name}_final.pth")
    save_final_model(final_model_exp_path, model, config)
    save_final_model(final_model_global_path, model, config)

    # 10. Generate Training Plots
    loss_png_exp = os.path.join(exp_dir, "loss.png")
    loss_png_global = os.path.join(project_root, "plots", f"{experiment_name}_loss.png")
    plot_training_history(metrics_csv_path, save_path=loss_png_exp)
    plot_training_history(metrics_csv_path, save_path=loss_png_global)

    pred_png_exp = os.path.join(exp_dir, "predictions.png")
    plot_predictions(model, device, test_loader, save_path=pred_png_exp)

    # 11. Final Test Evaluation
    log_print("\n" + "=" * 65)
    log_print("               FINAL TEST SET EVALUATION")
    log_print("=" * 65)
    test_loss, test_mae, test_r2, _, _ = evaluate_model(model, test_loader, criterion, device)
    log_print(f"Test Loss (MSE): {test_loss:.6f}")
    log_print(f"Test MAE:        {test_mae:.6f}")
    log_print(f"Test R² Score:   {test_r2:.6f}")

    # Unseen points test
    test_unseen_points(model, device)

    log_file.close()
    return {
        "best_val_loss": best_val_loss,
        "test_loss": test_loss,
        "test_mae": test_mae,
        "test_r2": test_r2,
        "exp_dir": exp_dir
    }


if __name__ == "__main__":
    train_model()
