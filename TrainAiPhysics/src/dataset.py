"""
dataset.py - Dataset generation and custom PyTorch Dataset for Physics AI.
Supports regression datasets for key physical laws:
1. Kinematics: s = v0*t + 0.5*a*t^2
2. Pendulum: T = 2*pi*sqrt(L/g)
3. RLC Circuits: Z = sqrt(R^2 + (wL - 1/(wC))^2)
4. Nuclear Decay: N = N0 * 2^(-t/T)
"""

from __future__ import annotations
try:
    import numpy as np
    import torch
    from torch.utils.data import Dataset, DataLoader
    HAS_DEPS = True
except ImportError:

    np = None
    torch = None
    Dataset = object  # type: ignore
    DataLoader = None  # type: ignore
    HAS_DEPS = False
from typing import Tuple, Any


class PhysicsDataset(Dataset):
    """PyTorch Dataset cho các mô hình hồi quy quy luật Vật Lý."""


    def __init__(self, task: str = "kinematics", num_samples: int = 2000, noise_std: float = 0.01):
        super().__init__()
        self.task = task
        self.num_samples = num_samples
        self.noise_std = noise_std
        self.X, self.y = self._generate_data()

    def _generate_data(self) -> Tuple[torch.Tensor, torch.Tensor]:
        np.random.seed(42)
        if self.task == "kinematics":
            # Input: [v0, a, t], Output: s = v0*t + 0.5*a*t^2
            v0 = np.random.uniform(0, 20, (self.num_samples, 1))
            a = np.random.uniform(0.5, 5, (self.num_samples, 1))
            t = np.random.uniform(0, 10, (self.num_samples, 1))
            X = np.hstack([v0, a, t])
            y = v0 * t + 0.5 * a * (t ** 2)
        elif self.task == "pendulum":
            # Input: [L, g], Output: T = 2*pi*sqrt(L/g)
            L = np.random.uniform(0.1, 2.0, (self.num_samples, 1))
            g = np.random.uniform(9.6, 10.0, (self.num_samples, 1))
            X = np.hstack([L, g])
            y = 2 * np.pi * np.sqrt(L / g)
        elif self.task == "rlc":
            # Input: [R, L, C, omega], Output: Z
            R = np.random.uniform(10, 100, (self.num_samples, 1))
            L = np.random.uniform(0.1, 1.0, (self.num_samples, 1))
            C = np.random.uniform(1e-6, 100e-6, (self.num_samples, 1))
            w = np.random.uniform(100, 1000, (self.num_samples, 1))
            X = np.hstack([R, L, C * 1e5, w / 100.0])
            ZL = w * L
            ZC = 1.0 / (w * C)
            y = np.sqrt(R ** 2 + (ZL - ZC) ** 2)
        elif self.task == "nuclear":
            # Input: [N0, t, T], Output: N = N0 * 2^(-t/T)
            N0 = np.random.uniform(100, 1000, (self.num_samples, 1))
            t = np.random.uniform(0, 50, (self.num_samples, 1))
            T = np.random.uniform(5, 20, (self.num_samples, 1))
            X = np.hstack([N0 / 100.0, t / 10.0, T / 10.0])
            y = N0 * (2 ** (-t / T))
        else:
            t = np.random.uniform(0, 10, (self.num_samples, 1))
            X = t
            y = 0.5 * 9.8 * (t ** 2)

        if self.noise_std > 0:
            noise = np.random.normal(0, self.noise_std * np.std(y), y.shape)
            y = y + noise

        X_tensor = torch.from_numpy(X.astype(np.float32))
        y_tensor = torch.from_numpy(y.astype(np.float32))
        return X_tensor, y_tensor

    def __len__(self) -> int:
        return self.num_samples

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        return self.X[idx], self.y[idx]


def create_physics_dataloaders(task: str = "kinematics", batch_size: int = 32, num_samples: int = 2000):
    dataset = PhysicsDataset(task=task, num_samples=num_samples)
    train_size = int(0.8 * len(dataset))
    val_size = len(dataset) - train_size
    train_ds, val_ds = torch.utils.data.random_split(dataset, [train_size, val_size])
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)
    return train_loader, val_loader, dataset.X.shape[1]
