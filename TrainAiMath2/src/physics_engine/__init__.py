"""
Physics Engine Package
Chuyên cung cấp bộ sinh đề, giải bài tập và chấm điểm môn Vật Lý tự động.
"""

from .generator import PhysicsGenerator
from .evaluator import PhysicsEvaluator
from .ai_tutor import PhysicsAITutor

__all__ = ["PhysicsGenerator", "PhysicsEvaluator", "PhysicsAITutor"]
