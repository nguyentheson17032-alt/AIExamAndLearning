"""
train.py - PyTorch training pipeline for Physics AI Engine.
Run: python src/train.py --task kinematics --epochs 40
"""

from __future__ import annotations
import os
import sys
import argparse


CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

try:
    import torch
    import torch.nn as nn
    HAS_TORCH = True
except ImportError:
    torch = None
    nn = None
    HAS_TORCH = False


try:
    from src.dataset import create_physics_dataloaders
    from src.model import PhysicsMLP
except ImportError:
    from dataset import create_physics_dataloaders
    from model import PhysicsMLP


if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


def train_model(task: str = "kinematics", epochs: int = 40, batch_size: int = 32, lr: float = 1e-3):
    if not HAS_TORCH or torch is None:
        print("[!] PyTorch is not installed in the current Python environment.")
        print("[*] To train PyTorch models, please run:")
        print("    pip install torch numpy")
        return


    print(f"[*] Generating physics dataset for task: {task}...")
    train_loader, val_loader, in_dim = create_physics_dataloaders(task=task, batch_size=batch_size, num_samples=3000)

    model = PhysicsMLP(in_features=in_dim, hidden_dim=64, out_features=1)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    criterion = nn.MSELoss()

    print(f"[*] Training PhysicsMLP on task '{task}' for {epochs} epochs...")
    for epoch in range(1, epochs + 1):
        model.train()
        train_loss = 0.0
        total_samples = 0
        for X_b, y_b in train_loader:
            optimizer.zero_grad()
            pred = model(X_b)
            loss = criterion(pred, y_b)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * len(X_b)
            total_samples += len(X_b)

        train_loss /= total_samples

        if epoch % 10 == 0 or epoch == epochs:
            model.eval()
            val_loss = 0.0
            val_samples = 0
            with torch.no_grad():
                for X_b, y_b in val_loader:
                    pred = model(X_b)
                    loss = criterion(pred, y_b)
                    val_loss += loss.item() * len(X_b)
                    val_samples += len(X_b)
            val_loss /= val_samples
            print(f"Epoch {epoch:02d}/{epochs:02d} | Train MSE: {train_loss:.6f} | Val MSE: {val_loss:.6f}")

    models_dir = os.path.join(os.path.dirname(CURRENT_DIR), "models")
    os.makedirs(models_dir, exist_ok=True)
    save_path = os.path.join(models_dir, f"physics_mlp_{task}.pt")
    torch.save(model.state_dict(), save_path)
    print(f"[+] Successfully trained & saved Physics model to: {save_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Physics AI Neural Network")
    parser.add_argument("--task", type=str, default="kinematics", choices=["kinematics", "pendulum", "rlc", "nuclear"])
    parser.add_argument("--epochs", type=int, default=30)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-3)
    args = parser.parse_args()

    train_model(task=args.task, epochs=args.epochs, batch_size=args.batch_size, lr=args.lr)
