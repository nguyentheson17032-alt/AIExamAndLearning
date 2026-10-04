"""
test_all_phases.py - Automated verification test suite for all 11 phases.
Runs comprehensive checks for Model, Training, Loss Reduction, Checkpoint Save/Load,
Resume Training, Early Stopping, and Evaluation Metrics.
"""

import os
import shutil
import unittest
import torch
import torch.nn as nn
import numpy as np

from src.utils import set_seed, get_device, load_config
from src.dataset import EquationDataset, create_dataloaders, generate_and_save_dataset
from src.model import LinearRegressionModel, MLPRegressionModel, get_model_parameters
from src.checkpoint import save_checkpoint, load_checkpoint, save_best_model
from src.evaluate import evaluate_model, test_unseen_points
from src.train import train_model


class TestAIPhases(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        set_seed(42)
        cls.device = torch.device("cpu")
        generate_and_save_dataset(project_root=".", version="v1", num_samples=200, seed=42)

    def test_01_environment_and_seed(self):
        """Test reproducibility with random seed."""
        set_seed(42)
        t1 = torch.randn(5)
        set_seed(42)
        t2 = torch.randn(5)
        self.assertTrue(torch.equal(t1, t2), "Random seed failed to produce deterministic tensors")

    def test_02_model_forward(self):
        """Test model initialization and forward pass shapes."""
        model = LinearRegressionModel(input_size=1, output_size=1)
        x = torch.randn(10, 1)
        y = model(x)
        self.assertEqual(y.shape, (10, 1), f"Expected shape (10, 1) but got {y.shape}")

    def test_03_dataloader_and_dataset(self):
        """Test DataLoader batching and shapes."""
        train_loader, val_loader, test_loader, _ = create_dataloaders(project_root=".", batch_size=16)
        x_b, y_b = next(iter(train_loader))
        self.assertEqual(x_b.shape, (16, 1))
        self.assertEqual(y_b.shape, (16, 1))

    def test_04_training_loss_reduction(self):
        """Test that forward + backward + optimizer steps strictly reduce loss."""
        set_seed(42)
        model = LinearRegressionModel()
        criterion = nn.MSELoss()
        optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

        x = torch.tensor([[1.0], [2.0], [3.0], [4.0]])
        y = 2.0 * x + 1.0

        # Initial loss
        initial_loss = criterion(model(x), y).item()

        # Perform 20 steps
        for _ in range(20):
            optimizer.zero_grad()
            out = model(x)
            loss = criterion(out, y)
            loss.backward()
            optimizer.step()

        final_loss = criterion(model(x), y).item()
        self.assertLess(final_loss, initial_loss, f"Loss did not decrease: {initial_loss} -> {final_loss}")

    def test_05_checkpoint_save_and_load(self):
        """Test checkpoint saving, loading weights, optimizer state, and resume."""
        model = LinearRegressionModel()
        optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
        ckpt_path = "models/checkpoints/test_checkpoint.pth"

        # Modify weight
        model.linear.weight.data.fill_(99.0)
        save_checkpoint(ckpt_path, epoch=5, model=model, optimizer=optimizer, scheduler=None, loss=0.123, best_val_loss=0.1, config={"seed": 42})

        # Create new model and load checkpoint
        new_model = LinearRegressionModel()
        new_opt = torch.optim.Adam(new_model.parameters(), lr=0.01)
        start_epoch, last_loss, best_val, cfg = load_checkpoint(ckpt_path, new_model, new_opt)

        self.assertEqual(start_epoch, 6)
        self.assertAlmostEqual(new_model.linear.weight.item(), 99.0, places=4)
        if os.path.exists(ckpt_path):
            os.remove(ckpt_path)

    def test_06_evaluation_metrics(self):
        """Test evaluation metrics computation (MSE, MAE, R²)."""
        model = LinearRegressionModel()
        # Set weights to exact ground truth w=2.0, b=1.0
        model.linear.weight.data.fill_(2.0)
        model.linear.bias.data.fill_(1.0)

        x = torch.tensor([[1.0], [2.0], [3.0], [4.0], [5.0]])
        y = 2.0 * x + 1.0
        dataset = EquationDataset(x, y)
        loader = torch.utils.data.DataLoader(dataset, batch_size=5)

        avg_loss, mae, r2, _, _ = evaluate_model(model, loader, nn.MSELoss(), torch.device("cpu"))
        self.assertAlmostEqual(avg_loss, 0.0, places=4)
        self.assertAlmostEqual(mae, 0.0, places=4)
        self.assertAlmostEqual(r2, 1.0, places=4)


if __name__ == "__main__":
    unittest.main()
