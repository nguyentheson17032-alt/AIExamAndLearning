"""
Physics Engine Module
Cung cấp bộ tri thức vật lý, sinh đề thi, thẩm định đáp án và gia sư AI Vật Lý.
"""

from .knowledge_base import PhysicsKnowledgeBase, PHYSICAL_CONSTANTS
from .generator import PhysicsGenerator
from .evaluator import PhysicsEvaluator
from .ai_tutor import PhysicsAITutor

__all__ = [
    "PhysicsKnowledgeBase",
    "PHYSICAL_CONSTANTS",
    "PhysicsGenerator",
    "PhysicsEvaluator",
    "PhysicsAITutor"
]
