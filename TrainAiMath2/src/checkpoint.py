"""
checkpoint.py - Checkpoint management, saving/loading weights, and resume training utilities.
"""

import os
import torch
import torch.nn as nn
import torch.optim as optim
from typing import Optional, Tuple, Dict, Any


def save_checkpoint(
    path: str,
    epoch: int,
    model: nn.Module,
    optimizer: optim.Optimizer,
    scheduler: Optional[Any],
    loss: float,
    best_val_loss: float,
    config: dict
) -> None:
    """
    Save complete training state checkpoint to disk.
    
    Args:
        path: Filepath where checkpoint .pth will be saved.
        epoch: Current training epoch.
        model: PyTorch model instance.
        optimizer: PyTorch optimizer instance.
        scheduler: PyTorch learning rate scheduler (optional).
        loss: Loss value at current epoch.
        best_val_loss: Lowest validation loss observed so far.
        config: Experiment configuration dictionary.
    """
    os.makedirs(os.path.dirname(path), exist_ok=True)
    checkpoint = {
        "epoch": epoch,
        "model_state_dict": model.state_dict(),
        "optimizer_state_dict": optimizer.state_dict(),
        "scheduler_state_dict": scheduler.state_dict() if scheduler is not None else None,
        "loss": loss,
        "best_val_loss": best_val_loss,
        "config": config,
    }
    torch.save(checkpoint, path)
    print(f"-> Checkpoint saved at epoch {epoch}: {path}")


def load_checkpoint(
    path: str,
    model: nn.Module,
    optimizer: Optional[optim.Optimizer] = None,
    scheduler: Optional[Any] = None,
    device: Optional[torch.device] = None
) -> Tuple[int, float, float, Dict[str, Any]]:
    """
    Load model weights, optimizer state, and training metadata from a checkpoint.
    
    Returns:
        tuple: (start_epoch, last_loss, best_val_loss, config)
    """
    if not os.path.exists(path):
        raise FileNotFoundError(f"Checkpoint file not found: {path}")

    map_location = device if device is not None else "cpu"
    checkpoint = torch.load(path, map_location=map_location, weights_only=False)

    model.load_state_dict(checkpoint["model_state_dict"])

    if optimizer is not None and "optimizer_state_dict" in checkpoint and checkpoint["optimizer_state_dict"] is not None:
        optimizer.load_state_dict(checkpoint["optimizer_state_dict"])

    if scheduler is not None and "scheduler_state_dict" in checkpoint and checkpoint["scheduler_state_dict"] is not None:
        scheduler.load_state_dict(checkpoint["scheduler_state_dict"])

    start_epoch = checkpoint.get("epoch", 0) + 1
    last_loss = checkpoint.get("loss", float("inf"))
    best_val_loss = checkpoint.get("best_val_loss", float("inf"))
    config = checkpoint.get("config", {})

    print(f"-> Successfully loaded checkpoint from {path} (resuming from epoch {start_epoch})")
    return start_epoch, last_loss, best_val_loss, config


def save_best_model(path: str, model: nn.Module, config: dict, val_loss: float) -> None:
    """
    Save best model weights and metadata when validation loss reaches a new minimum.
    """
    os.makedirs(os.path.dirname(path), exist_ok=True)
    payload = {
        "model_state_dict": model.state_dict(),
        "config": config,
        "val_loss": val_loss,
    }
    torch.save(payload, path)
    print(f"★ Saved Best Model (val_loss: {val_loss:.6f}) -> {path}")


def save_final_model(path: str, model: nn.Module, config: dict) -> None:
    """
    Save final model after complete training run.
    """
    os.makedirs(os.path.dirname(path), exist_ok=True)
    payload = {
        "model_state_dict": model.state_dict(),
        "config": config,
    }
    torch.save(payload, path)
    print(f"✔ Final Model saved -> {path}")
