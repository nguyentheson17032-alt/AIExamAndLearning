"""
utils.py - General utilities for AI Training Project.
Includes random seed fixing, device detection, config loading/saving, and logging helpers.
"""

import os
import random
import yaml
import numpy as np
import torch


def set_seed(seed: int = 42) -> None:
    """
    Fix random seeds for reproducibility across random, numpy, and PyTorch (CPU & CUDA).
    """
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False


def get_device() -> torch.device:
    """
    Detect available computing hardware (CUDA GPU or CPU) and print diagnostic info.
    """
    if torch.cuda.is_available():
        device = torch.device("cuda")
        print(f"Device: CUDA ({torch.cuda.get_device_name(0)})")
        print(f"PyTorch Version: {torch.__version__} | CUDA Version: {torch.version.cuda}")
    else:
        device = torch.device("cpu")
        print(f"Device: CPU | PyTorch Version: {torch.__version__}")
    return device


def load_config(config_path: str) -> dict:
    """
    Load YAML configuration file into a Python dictionary.
    """
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Config file not found: {config_path}")
    with open(config_path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
    return config


def save_config(config: dict, dest_path: str) -> None:
    """
    Save configuration dictionary to a YAML file (used for immutable experiment config).
    """
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    with open(dest_path, "w", encoding="utf-8") as f:
        yaml.dump(config, f, default_flow_style=False, sort_keys=False)
