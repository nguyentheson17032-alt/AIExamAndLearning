# ============================================================
# CELL 1: Check Environment
# Purpose: Verify Python, PyTorch, CUDA, and GPU availability
# Run this cell first every time you open Colab
# ============================================================

import sys
import torch

print("=" * 50)
print("ENVIRONMENT CHECK")
print("=" * 50)

# --- Python version ---
print(f"Python version : {sys.version}")

# --- PyTorch version ---
print(f"PyTorch version: {torch.__version__}")

# --- CUDA availability ---
cuda_available = torch.cuda.is_available()
print(f"CUDA available : {cuda_available}")

# --- CUDA version ---
if cuda_available:
    print(f"CUDA version   : {torch.version.cuda}")
else:
    print("CUDA version   : N/A (no GPU detected)")

# --- Device selection ---
device = torch.device("cuda" if cuda_available else "cpu")
print(f"Device selected: {device}")

# --- GPU name ---
if cuda_available:
    gpu_name = torch.cuda.get_device_name(0)
    print(f"GPU name       : {gpu_name}")

    # GPU memory info
    total_mem = torch.cuda.get_device_properties(0).total_memory / (1024 ** 3)
    print(f"GPU memory     : {total_mem:.2f} GB")
else:
    print("GPU name       : N/A (running on CPU)")

print("=" * 50)
print("Environment check complete.")
print("=" * 50)
