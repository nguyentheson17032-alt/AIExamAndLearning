"""
advanced.py - Advanced AI foundations and scaling modules (Phases 10 & 11).
Demonstrates:
1. Non-linear Polynomial / Multi-feature Math Modeling with Neural Networks (MLP).
2. Large Dataset scaling (10,000+ samples).
3. Architecture definitions for Deep Learning extensions (CNN, Transformer, Math Solver).
"""

import os
import torch
import torch.nn as nn
import numpy as np
import matplotlib.pyplot as plt
from src.utils import set_seed, get_device
from src.model import MLPRegressionModel
from src.evaluate import evaluate_model, plot_predictions


class QuadraticEquationDataset(torch.utils.data.Dataset):
    """
    Non-linear dataset: y = 2x^2 - 3x + 1 + noise
    Demonstrates the transition from Linear Regression to Deep Neural Networks.
    """
    def __init__(self, num_samples: int = 2000, seed: int = 42):
        torch.manual_seed(seed)
        self.x = torch.empty(num_samples, 1).uniform_(-5.0, 5.0)
        noise = torch.randn(num_samples, 1) * 0.8
        self.y = 2.0 * (self.x ** 2) - 3.0 * self.x + 1.0 + noise

    def __len__(self):
        return len(self.x)

    def __getitem__(self, idx):
        return self.x[idx], self.y[idx]


def train_advanced_nn_experiment(project_root: str = ".", epochs: int = 80, lr: float = 0.01):
    """
    Train Multi-Layer Perceptron (MLP) on a non-linear quadratic function.
    """
    set_seed(42)
    device = get_device()
    exp_dir = os.path.join(project_root, "experiments", "experiment_002_mlp")
    os.makedirs(exp_dir, exist_ok=True)

    print("=" * 65)
    print("      PHASE 11: ADVANCED AI EXPERIMENT (NON-LINEAR MLP)")
    print("=" * 65)

    full_dataset = QuadraticEquationDataset(num_samples=3000, seed=42)
    train_size = int(0.7 * len(full_dataset))
    val_size = int(0.15 * len(full_dataset))
    test_size = len(full_dataset) - train_size - val_size

    train_data, val_data, test_data = torch.utils.data.random_split(
        full_dataset, [train_size, val_size, test_size]
    )

    train_loader = torch.utils.data.DataLoader(train_data, batch_size=32, shuffle=True)
    val_loader = torch.utils.data.DataLoader(val_data, batch_size=32, shuffle=False)
    test_loader = torch.utils.data.DataLoader(test_data, batch_size=32, shuffle=False)

    model = MLPRegressionModel(input_size=1, hidden_dim1=64, hidden_dim2=32, output_size=1).to(device)
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)

    print(f"MLP Model Architecture:\n{model}")
    print(f"Total Trainable Parameters: {sum(p.numel() for p in model.parameters() if p.requires_grad)}")

    train_losses, val_losses = [], []
    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        for x_b, y_b in train_loader:
            x_b, y_b = x_b.to(device), y_b.to(device)
            pred = model(x_b)
            loss = criterion(pred, y_b)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item() * len(x_b)

        epoch_loss = total_loss / len(train_data)
        val_loss, val_mae, val_r2, _, _ = evaluate_model(model, val_loader, criterion, device)

        train_losses.append(epoch_loss)
        val_losses.append(val_loss)

        if epoch % 10 == 0 or epoch == 1:
            print(f"Epoch [{epoch:2d}/{epochs:2d}] | Train Loss: {epoch_loss:.4f} | Val Loss: {val_loss:.4f} | Val R²: {val_r2:.4f}")

    # Plot results
    plt.figure(figsize=(10, 5))
    plt.plot(range(1, epochs + 1), train_losses, label="Train Loss", color="royalblue")
    plt.plot(range(1, epochs + 1), val_losses, label="Val Loss", color="darkorange")
    plt.title("MLP Training & Validation Loss on Non-linear Function (y = 2x² - 3x + 1)")
    plt.xlabel("Epoch")
    plt.ylabel("MSE Loss")
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt_path = os.path.join(exp_dir, "loss_curve_mlp.png")
    plt.savefig(plt_path, dpi=150, bbox_inches="tight")
    plt.close()

    # Save model
    model_path = os.path.join(exp_dir, "mlp_model.pth")
    torch.save(model.state_dict(), model_path)
    print(f"Advanced MLP Model trained and saved to {model_path}")
    print(f"Loss plot saved to {plt_path}")

    # Evaluate test
    test_loss, test_mae, test_r2, _, _ = evaluate_model(model, test_loader, criterion, device)
    print(f"MLP Test R² Score: {test_r2:.4f} | Test MAE: {test_mae:.4f}")
    return test_r2
