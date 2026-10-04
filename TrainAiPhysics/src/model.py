"""
model.py - Deep Neural Network models for Physics AI.
Includes:
- PhysicsMLP: Multi-Layer Perceptron for physical law approximation.
- PhysicsPredictor: Algorithmic & AI Predictor for kinematics, circuits, and wave phenomena.
"""

from __future__ import annotations
try:
    import torch

    import torch.nn as nn
    HAS_TORCH = True
except ImportError:
    torch = None
    nn = None
    HAS_TORCH = False
from typing import Dict, Any


if HAS_TORCH:
    class PhysicsMLP(nn.Module):
        """Mạng nơ-ron sâu học quy luật hàm số vật lý phi tuyến."""

        def __init__(self, in_features: int = 3, hidden_dim: int = 64, out_features: int = 1):
            super().__init__()
            self.net = nn.Sequential(
                nn.Linear(in_features, hidden_dim),
                nn.LayerNorm(hidden_dim),
                nn.GELU(),
                nn.Linear(hidden_dim, hidden_dim * 2),
                nn.LayerNorm(hidden_dim * 2),
                nn.GELU(),
                nn.Dropout(0.05),
                nn.Linear(hidden_dim * 2, hidden_dim),
                nn.GELU(),
                nn.Linear(hidden_dim, out_features)
            )

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            return self.net(x)
else:
    class PhysicsMLP:  # type: ignore
        """Placeholder khi chưa cài PyTorch."""
        def __init__(self, in_features: int = 3, hidden_dim: int = 64, out_features: int = 1):
            pass



class PhysicsPredictor:
    """Bộ giải suy luận trực tiếp dựa trên thuật toán & AI."""

    @staticmethod
    def predict_kinematics(v0: float, a: float, t: float) -> Dict[str, Any]:
        """Dự đoán quãng đường và vận tốc biến đổi đều."""
        v = v0 + a * t
        s = v0 * t + 0.5 * a * (t ** 2)
        return {
            "v0": v0, "a": a, "t": t,
            "velocity": round(v, 4),
            "distance": round(s, 4),
            "formula": "s = v_0 t + 0.5 a t^2"
        }

    @staticmethod
    def predict_rlc_resonance(r: float, l: float, c: float, u: float = 220.0) -> Dict[str, Any]:
        """Dự đoán tần số cộng hưởng và công suất cực đại mạch RLC."""
        omega_res = 1.0 / math.sqrt(l * c)
        f_res = omega_res / (2 * math.pi)
        i_max = u / r
        p_max = (u ** 2) / r
        return {
            "R": r, "L": l, "C": c, "U": u,
            "omega_resonance": round(omega_res, 2),
            "f_resonance": round(f_res, 2),
            "I_max": round(i_max, 3),
            "P_max": round(p_max, 2)
        }
