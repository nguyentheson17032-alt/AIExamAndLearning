"""
model.py - Model definitions: Linear Regression and Multi-Layer Perceptron (MLP).
"""

import torch
import torch.nn as nn


class LinearRegressionModel(nn.Module):
    """
    Linear Regression model: y = x * weight + bias
    
    Args:
        input_size (int): Number of input features (default: 1)
        output_size (int): Number of output targets (default: 1)
    """
    def __init__(self, input_size: int = 1, output_size: int = 1):
        super(LinearRegressionModel, self).__init__()
        self.linear = nn.Linear(in_features=input_size, out_features=output_size)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.linear(x)


class MLPRegressionModel(nn.Module):
    """
    Multi-Layer Perceptron (Neural Network) with non-linear activations (ReLU).
    Used for Phase 10 & 11 to approximate non-linear formulas and complex math functions.
    
    Architecture:
        Input Layer -> Hidden Layer 1 (64) -> ReLU -> Hidden Layer 2 (32) -> ReLU -> Output Layer
    """
    def __init__(self, input_size: int = 1, hidden_dim1: int = 64, hidden_dim2: int = 32, output_size: int = 1):
        super(MLPRegressionModel, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(input_size, hidden_dim1),
            nn.ReLU(),
            nn.Linear(hidden_dim1, hidden_dim2),
            nn.ReLU(),
            nn.Linear(hidden_dim2, output_size)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


def get_model_parameters(model: nn.Module) -> dict:
    """
    Extract weights and bias values from a linear model or summarize parameter count.
    """
    total_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    res = {"total_parameters": total_params}
    if hasattr(model, "linear"):
        weight = model.linear.weight.data.clone()
        bias = model.linear.bias.data.clone()
        res.update({
            "weight": weight,
            "bias": bias,
            "weight_val": weight.item() if weight.numel() == 1 else weight.tolist(),
            "bias_val": bias.item() if bias.numel() == 1 else bias.tolist(),
        })
    return res


if __name__ == "__main__":
    torch.manual_seed(42)
    lin_model = LinearRegressionModel()
    mlp_model = MLPRegressionModel()
    
    x_test = torch.tensor([[1.0], [2.0], [10.0]])
    print("Linear model output:", lin_model(x_test).squeeze())
    print("MLP model output:", mlp_model(x_test).squeeze())
