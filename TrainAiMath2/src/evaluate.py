"""
evaluate.py - Evaluation functions, metrics calculation (MSE, MAE, R²), and visualization routines.
"""

import os
import torch
import torch.nn as nn
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score


def evaluate_model(model: nn.Module, data_loader, criterion: nn.Module, device: torch.device):
    """
    Evaluate model performance on a dataset using model.eval() and torch.no_grad().
    
    Returns:
        tuple: (avg_loss, mae, r2, y_true_all, y_pred_all)
    """
    model.eval()  # Switch to evaluation mode
    total_loss = 0.0
    all_y_true = []
    all_y_pred = []

    with torch.no_grad():  # Disable gradient computation to save memory & compute
        for x_batch, y_batch in data_loader:
            x_batch = x_batch.to(device)
            y_batch = y_batch.to(device)

            y_pred = model(x_batch)
            loss = criterion(y_pred, y_batch)

            total_loss += loss.item() * len(x_batch)
            all_y_true.append(y_batch.cpu().numpy())
            all_y_pred.append(y_pred.cpu().numpy())

    total_samples = len(data_loader.dataset)
    avg_loss = total_loss / total_samples if total_samples > 0 else 0.0

    y_true_all = np.vstack(all_y_true).squeeze()
    y_pred_all = np.vstack(all_y_pred).squeeze()

    mae = float(mean_absolute_error(y_true_all, y_pred_all))
    r2 = float(r2_score(y_true_all, y_pred_all))

    return avg_loss, mae, r2, y_true_all, y_pred_all


def test_unseen_points(model: nn.Module, device: torch.device, custom_points=None):
    """
    Test model on unseen test coordinates and print diagnostic comparison table.
    """
    if custom_points is None:
        custom_points = [11.0, 15.0, 20.0, 50.0, -15.0, 0.0]

    model.eval()
    x_tensor = torch.tensor([[pt] for pt in custom_points], dtype=torch.float32).to(device)

    with torch.no_grad():
        preds = model(x_tensor).cpu().numpy().flatten()

    results = []
    print("\n" + "=" * 70)
    print("                 UNSEEN TEST SAMPLES EVALUATION")
    print("=" * 70)
    print(f"{'Input (x)':<12} | {'Expected (2x+1)':<18} | {'Prediction':<16} | {'Abs Error':<12}")
    print("-" * 70)
    for x_val, pred in zip(custom_points, preds):
        expected = 2.0 * x_val + 1.0
        err = abs(pred - expected)
        results.append({"x": x_val, "expected": expected, "prediction": pred, "abs_error": err})
        print(f"{x_val:<12.2f} | {expected:<18.4f} | {pred:<16.4f} | {err:<12.4f}")
    print("=" * 70)
    return results


def plot_training_history(metrics_csv_path: str, save_path: str = None):
    """
    Plot Train/Val Loss, MAE, R², and Learning Rate curves from metrics.csv.
    """
    if not os.path.exists(metrics_csv_path):
        print(f"Metrics file not found: {metrics_csv_path}")
        return

    df = pd.read_csv(metrics_csv_path)
    if df.empty:
        return

    epochs = df["epoch"]
    
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))

    # 1. Loss Curve
    axes[0, 0].plot(epochs, df["train_loss"], label="Train Loss (MSE)", color="royalblue", lw=2)
    if "val_loss" in df.columns:
        axes[0, 0].plot(epochs, df["val_loss"], label="Val Loss (MSE)", color="darkorange", lw=2, linestyle="--")
    axes[0, 0].set_title("Training & Validation Loss")
    axes[0, 0].set_xlabel("Epoch")
    axes[0, 0].set_ylabel("MSE Loss")
    axes[0, 0].legend()
    axes[0, 0].grid(True, alpha=0.3)

    # 2. MAE Curve
    if "val_mae" in df.columns:
        axes[0, 1].plot(epochs, df["val_mae"], label="Validation MAE", color="crimson", lw=2)
        axes[0, 1].set_title("Validation MAE (Mean Absolute Error)")
        axes[0, 1].set_xlabel("Epoch")
        axes[0, 1].set_ylabel("MAE")
        axes[0, 1].legend()
        axes[0, 1].grid(True, alpha=0.3)

    # 3. R2 Score Curve
    if "val_r2" in df.columns:
        axes[1, 0].plot(epochs, df["val_r2"], label="Validation R² Score", color="forestgreen", lw=2)
        axes[1, 0].set_title("Validation R² Score (Target = 1.0)")
        axes[1, 0].set_xlabel("Epoch")
        axes[1, 0].set_ylabel("R² Score")
        axes[1, 0].legend()
        axes[1, 0].grid(True, alpha=0.3)

    # 4. Learning Rate / Gradient Norm Curve
    if "lr" in df.columns:
        axes[1, 1].plot(epochs, df["lr"], label="Learning Rate", color="purple", lw=2)
        axes[1, 1].set_title("Learning Rate Schedule")
        axes[1, 1].set_xlabel("Epoch")
        axes[1, 1].set_ylabel("LR")
        axes[1, 1].set_yscale("log")
        axes[1, 1].legend()
        axes[1, 1].grid(True, alpha=0.3)

    plt.tight_layout()
    if save_path:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        plt.savefig(save_path, dpi=150, bbox_inches="tight")
        print(f"Saved training curves to {save_path}")
    plt.close()


def plot_predictions(model: nn.Module, device: torch.device, data_loader, save_path: str = None):
    """
    Plot model predictions vs actual ground truth line.
    """
    model.eval()
    x_list, y_list, pred_list = [], [], []

    with torch.no_grad():
        for x_b, y_b in data_loader:
            x_b_dev = x_b.to(device)
            p_b = model(x_b_dev)
            x_list.append(x_b.cpu().numpy())
            y_list.append(y_b.cpu().numpy())
            pred_list.append(p_b.cpu().numpy())

    x_all = np.vstack(x_list).flatten()
    y_all = np.vstack(y_list).flatten()
    preds_all = np.vstack(pred_list).flatten()

    plt.figure(figsize=(9, 6))
    plt.scatter(x_all, y_all, alpha=0.4, color="royalblue", label="Actual Data (with noise)", s=20)
    
    sort_idx = np.argsort(x_all)
    plt.plot(x_all[sort_idx], preds_all[sort_idx], color="crimson", linewidth=2.5, label="Model Prediction")
    plt.plot(x_all[sort_idx], 2.0 * x_all[sort_idx] + 1.0, "k--", linewidth=1.5, label="Ideal True Line (y = 2x + 1)")

    plt.title("Model Prediction vs Actual Data", fontsize=14)
    plt.xlabel("x", fontsize=12)
    plt.ylabel("y", fontsize=12)
    plt.legend(fontsize=11)
    plt.grid(True, alpha=0.3)

    if save_path:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        plt.savefig(save_path, dpi=150, bbox_inches="tight")
        print(f"Saved prediction plot to {save_path}")
    plt.close()
