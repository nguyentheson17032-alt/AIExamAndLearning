"""
dataset.py - Dataset generation, custom PyTorch Dataset class, and DataLoader utilities.
"""

import os
import json
import yaml
from datetime import datetime
import torch
from torch.utils.data import Dataset, DataLoader
import matplotlib.pyplot as plt


class EquationDataset(Dataset):
    """
    PyTorch Dataset wrapper for equation tensors (x, y).
    """
    def __init__(self, x: torch.Tensor, y: torch.Tensor):
        self.x = x.float()
        self.y = y.float()

    def __len__(self) -> int:
        return len(self.x)

    def __getitem__(self, idx: int):
        return self.x[idx], self.y[idx]


def create_dataloaders(
    project_root: str = ".",
    batch_size: int = 32,
    shuffle_train: bool = True
):
    """
    Load saved train/val/test splits and construct PyTorch DataLoaders.
    """
    train_path = os.path.join(project_root, "data", "processed", "train", "train.pt")
    val_path = os.path.join(project_root, "data", "processed", "validation", "val.pt")
    test_path = os.path.join(project_root, "data", "processed", "test", "test.pt")

    if not (os.path.exists(train_path) and os.path.exists(val_path) and os.path.exists(test_path)):
        generate_and_save_dataset(project_root=project_root)

    train_data = torch.load(train_path, weights_only=True)
    val_data = torch.load(val_path, weights_only=True)
    test_data = torch.load(test_path, weights_only=True)

    train_dataset = EquationDataset(train_data["x"], train_data["y"])
    val_dataset = EquationDataset(val_data["x"], val_data["y"])
    test_dataset = EquationDataset(test_data["x"], test_data["y"])

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=shuffle_train)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)

    return train_loader, val_loader, test_loader, (train_dataset, val_dataset, test_dataset)


def generate_and_save_dataset(project_root: str = ".", version: str = "v1", num_samples: int = 1000, seed: int = 42):
    """
    Generate synthetic dataset for y = 2x + 1 + noise and split into train/val/test sets.
    """
    # Fix seed for dataset generation
    torch.manual_seed(seed)

    config_path = os.path.join(project_root, "configs", "config_v1.yaml")
    if os.path.exists(config_path):
        with open(config_path, "r", encoding="utf-8") as f:
            cfg = yaml.safe_load(f)
            train_ratio = cfg.get("data", {}).get("train_ratio", 0.70)
            val_ratio = cfg.get("data", {}).get("validation_ratio", 0.15)
            test_ratio = cfg.get("data", {}).get("test_ratio", 0.15)
    else:
        train_ratio, val_ratio, test_ratio = 0.70, 0.15, 0.15

    raw_dir = os.path.join(project_root, "data", "raw", f"dataset_{version}")
    train_dir = os.path.join(project_root, "data", "processed", "train")
    val_dir = os.path.join(project_root, "data", "processed", "validation")
    test_dir = os.path.join(project_root, "data", "processed", "test")
    plots_dir = os.path.join(project_root, "plots")

    for d in [raw_dir, train_dir, val_dir, test_dir, plots_dir]:
        os.makedirs(d, exist_ok=True)

    print("=" * 55)
    print(f"Generating Dataset {version} ({num_samples} samples)...")
    print("=" * 55)

    x = torch.empty(num_samples, 1).uniform_(-10.0, 10.0)
    noise = torch.randn(num_samples, 1) * 0.5
    y = 2.0 * x + 1.0 + noise

    # Save raw dataset and metadata
    dataset_pt_path = os.path.join(raw_dir, "dataset.pt")
    torch.save({"x": x, "y": y}, dataset_pt_path)

    metadata = {
        "version": version,
        "formula": "y = 2x + 1 + noise",
        "num_samples": num_samples,
        "x_range": [-10, 10],
        "noise_std": 0.5,
        "seed": seed,
        "x_dtype": str(x.dtype),
        "y_dtype": str(y.dtype),
        "created_at": datetime.now().isoformat(),
    }
    with open(os.path.join(raw_dir, "metadata.json"), "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    # Plot raw data
    plt.figure(figsize=(8, 5))
    plt.scatter(x.numpy(), y.numpy(), alpha=0.3, s=15, color="blue", label="Samples (with noise)")
    plt.plot([-10, 10], [2 * (-10) + 1, 2 * 10 + 1], "r--", linewidth=2, label="True line: y = 2x + 1")
    plt.title(f"Dataset {version}: y = 2x + 1 + noise (N={num_samples})")
    plt.xlabel("x")
    plt.ylabel("y")
    plt.legend()
    plt.grid(True, alpha=0.3)
    raw_plot_path = os.path.join(plots_dir, f"dataset_{version}.png")
    plt.savefig(raw_plot_path, dpi=150, bbox_inches="tight")
    plt.close()

    # Split dataset
    n_train = int(num_samples * train_ratio)
    n_val = int(num_samples * val_ratio)
    n_test = num_samples - n_train - n_val

    indices = torch.randperm(num_samples)
    train_idx = indices[:n_train]
    val_idx = indices[n_train:n_train + n_val]
    test_idx = indices[n_train + n_val:]

    x_train, y_train = x[train_idx], y[train_idx]
    x_val, y_val = x[val_idx], y[val_idx]
    x_test, y_test = x[test_idx], y[test_idx]

    torch.save({"x": x_train, "y": y_train}, os.path.join(train_dir, "train.pt"))
    torch.save({"x": x_val, "y": y_val}, os.path.join(val_dir, "val.pt"))
    torch.save({"x": x_test, "y": y_test}, os.path.join(test_dir, "test.pt"))

    split_metadata = {
        "dataset_version": version,
        "total_samples": num_samples,
        "splits": {
            "train": {"samples": n_train, "ratio": train_ratio},
            "validation": {"samples": n_val, "ratio": val_ratio},
            "test": {"samples": n_test, "ratio": round(n_test / num_samples, 4)},
        },
        "seed": seed,
    }
    with open(os.path.join(project_root, "data", "processed", "split_metadata.json"), "w", encoding="utf-8") as f:
        json.dump(split_metadata, f, indent=2)

    # Plot splits
    plt.figure(figsize=(9, 5))
    plt.scatter(x_train.numpy(), y_train.numpy(), alpha=0.4, s=15, color="blue", label=f"Train ({n_train})")
    plt.scatter(x_val.numpy(), y_val.numpy(), alpha=0.6, s=20, color="orange", label=f"Validation ({n_val})")
    plt.scatter(x_test.numpy(), y_test.numpy(), alpha=0.8, s=25, color="green", label=f"Test ({n_test})")
    plt.title(f"Dataset {version} Splits (Train={n_train}, Val={n_val}, Test={n_test})")
    plt.xlabel("x")
    plt.ylabel("y")
    plt.legend()
    plt.grid(True, alpha=0.3)
    split_plot_path = os.path.join(plots_dir, f"dataset_{version}_split.png")
    plt.savefig(split_plot_path, dpi=150, bbox_inches="tight")
    plt.close()

    print(f"Splits saved: Train ({n_train}) | Val ({n_val}) | Test ({n_test})")
    print(f"Saved plots to {plots_dir}")


if __name__ == "__main__":
    generate_and_save_dataset(project_root=".")
