"""
server.py - Dedicated Physics AI Exercise Generator & Tutor API Microservice.
Default Port: 8001
Framework: FastAPI (with Starlette fallback)
"""

import os
import sys
import json
import random
from typing import Dict, Any, List, Optional

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

try:
    from src.physics_engine.knowledge_base import PhysicsKnowledgeBase, PHYSICAL_CONSTANTS
    from src.physics_engine.generator import PhysicsGenerator
    from src.physics_engine.evaluator import PhysicsEvaluator
    from src.physics_engine.ai_tutor import PhysicsAITutor
    from src.model import PhysicsPredictor
except ImportError:
    from physics_engine.knowledge_base import PhysicsKnowledgeBase, PHYSICAL_CONSTANTS
    from physics_engine.generator import PhysicsGenerator
    from physics_engine.evaluator import PhysicsEvaluator
    from physics_engine.ai_tutor import PhysicsAITutor
    from model import PhysicsPredictor


try:
    from fastapi import FastAPI, Request
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    USE_FASTAPI = True
except ImportError:
    USE_FASTAPI = False
    from starlette.applications import Starlette
    from starlette.middleware import Middleware
    from starlette.middleware.cors import CORSMiddleware
    from starlette.responses import JSONResponse
    from starlette.routing import Route


def classify_physics_question(stem: str) -> Dict[str, Any]:
    """Phân tích độ khó, cấp độ Bloom và ước tính Elo cho câu hỏi Vật lý."""
    text = stem.lower()
    if any(k in text for k in ["cộng hưởng", "carnot", "phóng xạ", "mẫu nguyên tử bo", "thấu kính", "sóng dừng", "ném ngang"]):
        difficulty = "HARD"
        elo = 1250
        bloom = "APPLY"
        category = "Vật lý nâng cao & Ứng dụng thực nghiệm"
    elif any(k in text for k in ["con lắc", "bước sóng", "tổng trở", "cân bằng nhiệt", "định luật"]):
        difficulty = "MEDIUM"
        elo = 1050
        bloom = "UNDERSTAND"
        category = "Vật lý đại cương & Hiện tượng"
    else:
        difficulty = "EASY"
        elo = 900
        bloom = "REMEMBER"
        category = "Khái niệm & Công thức Vật lý"

    return {
        "tags": ["Vật lý", category, "AI Evaluated"],
        "difficulty": difficulty,
        "eloRating": elo,
        "category": category,
        "bloomLevel": bloom,
        "confidence": 0.98,
        "modelName": "PhysicsAiEngine-v2.1"
    }


async def get_json_body(req: Any) -> Dict[str, Any]:
    try:
        raw_bytes = await req.body()
        if raw_bytes:
            text = raw_bytes.decode("utf-8")
            parsed = json.loads(text)
            if isinstance(parsed, dict):
                return parsed
            if isinstance(parsed, str):
                return json.loads(parsed)
    except Exception:
        pass
    try:
        body = await req.json()
        if isinstance(body, dict):
            return body
    except Exception:
        pass
    return {}


if USE_FASTAPI:
    app = FastAPI(
        title="Physics AI Engine & Tutor API",
        description="Backend API chuyên dụng sinh đề thi môn Vật Lý, chấm điểm đáp số & trợ lý AI Physics Tutor",
        version="2.1.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/api/health")
    async def health_check():
        return {
            "status": "online",
            "service": "Physics AI Engine & Tutor",
            "subject": "Vật lý",
            "port": 8001,
            "version": "2.1.0"
        }

    @app.post("/api/generate")
    async def generate_exercises(req: Request):
        body = await get_json_body(req)
        category = body.get("category", "all")
        difficulty = body.get("difficulty", "medium")
        count = max(1, min(int(body.get("count", 3)), 20))
        elo = body.get("elo") or body.get("eloRating")

        exercises = PhysicsGenerator.generate_batch(
            category=category,
            difficulty=difficulty,
            count=count,
            elo=int(elo) if elo is not None and str(elo).isdigit() else None
        )

        return {
            "success": True,
            "count": len(exercises),
            "category": category,
            "difficulty": difficulty,
            "elo": elo,
            "subject_name": "Vật lý",
            "exercises": exercises
        }

    @app.post("/api/evaluate")
    async def evaluate_answer(req: Request):
        body = await get_json_body(req)
        problem = body.get("problem", {})
        if isinstance(problem, str):
            try:
                problem = json.loads(problem)
            except Exception:
                problem = {}
        user_answer = (
            body.get("user_answer") or
            body.get("userAnswer") or
            body.get("answer") or
            body.get("choice") or
            ""
        )
        result = PhysicsEvaluator.evaluate_answer(problem=problem, user_input=str(user_answer))
        return {"success": True, "result": result}

    @app.post("/api/ai/chat")
    async def ai_chat(req: Request):
        body = await get_json_body(req)
        query = body.get("query", "")
        current_prob = body.get("current_problem", None)
        reply = PhysicsAITutor.answer_physics_query(query=query, current_problem=current_prob)
        return {"success": True, "reply": reply}

    @app.post("/api/ai/classify")
    async def classify_api(req: Request):
        body = await get_json_body(req)
        stem = body.get("stem", "")
        res = classify_physics_question(stem)
        return {"success": True, "data": res}

    @app.post("/api/ai/similar")
    async def similar_api(req: Request):
        body = await get_json_body(req)
        count = max(1, min(int(body.get("count", 3)), 10))
        stem = body.get("stem", "").lower()
        cat = "mechanics"
        if "dao động" in stem or "sóng" in stem:
            cat = "oscillation_wave"
        elif "rlc" in stem or "điện" in stem or "tổng trở" in stem:
            cat = "circuits_electromagnetism"
        elif "thấu kính" in stem or "khúc xạ" in stem:
            cat = "optics"
        elif "khí" in stem or "nhiệt" in stem:
            cat = "thermodynamics"
        elif "hạt nhân" in stem or "quang điện" in stem:
            cat = "nuclear_quantum"

        exercises = PhysicsGenerator.generate_batch(category=cat, count=count)
        return {"success": True, "exercises": exercises}

    @app.get("/api/knowledge/topics")
    async def get_topics():
        return {"success": True, "topics": PhysicsKnowledgeBase.get_all_topics()}

    @app.get("/api/knowledge/topics/{topic_id}")
    async def get_topic_detail(topic_id: str):
        return {"success": True, "data": PhysicsKnowledgeBase.get_topic_detail(topic_id)}

    @app.get("/api/knowledge/constants")
    async def get_constants():
        return {"success": True, "constants": PHYSICAL_CONSTANTS}

    @app.get("/api/ai/predict")
    async def predict_physics(v0: float = 0.0, a: float = 2.0, t: float = 5.0):
        res = PhysicsPredictor.predict_kinematics(v0, a, t)
        return {"success": True, "data": res}

else:
    # Starlette Fallback Implementation
    async def health_check(request):
        return JSONResponse({
            "status": "online",
            "service": "Physics AI Engine & Tutor",
            "subject": "Vật lý",
            "port": 8001
        })

    async def generate_exercises(request):
        body = await get_json_body(request)
        category = body.get("category", "all")
        difficulty = body.get("difficulty", "medium")
        count = max(1, min(int(body.get("count", 3)), 20))
        elo = body.get("elo") or body.get("eloRating")

        exercises = PhysicsGenerator.generate_batch(
            category=category,
            difficulty=difficulty,
            count=count,
            elo=int(elo) if elo is not None and str(elo).isdigit() else None
        )
        return JSONResponse({
            "success": True,
            "count": len(exercises),
            "category": category,
            "difficulty": difficulty,
            "elo": elo,
            "subject_name": "Vật lý",
            "exercises": exercises
        })

    async def evaluate_answer(request):
        body = await get_json_body(request)
        problem = body.get("problem", {})
        user_answer = body.get("user_answer", "")
        result = PhysicsEvaluator.evaluate_answer(problem=problem, user_input=str(user_answer))
        return JSONResponse({"success": True, "result": result})

    async def ai_chat(request):
        body = await get_json_body(request)
        query = body.get("query", "")
        current_prob = body.get("current_problem", None)
        reply = PhysicsAITutor.answer_physics_query(query=query, current_problem=current_prob)
        return JSONResponse({"success": True, "reply": reply})

    async def classify_api(request):
        body = await get_json_body(request)
        stem = body.get("stem", "")
        res = classify_physics_question(stem)
        return JSONResponse({"success": True, "data": res})

    routes = [
        Route("/api/health", health_check, methods=["GET"]),
        Route("/api/generate", generate_exercises, methods=["POST"]),
        Route("/api/evaluate", evaluate_answer, methods=["POST"]),
        Route("/api/ai/chat", ai_chat, methods=["POST"]),
        Route("/api/ai/classify", classify_api, methods=["POST"]),
    ]

    middleware = [
        Middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
    ]

    app = Starlette(debug=True, routes=routes, middleware=middleware)


if __name__ == "__main__":
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass
    import uvicorn
    print(f"[*] Physics AI Server starting at http://localhost:8001 (Framework: {'FastAPI' if USE_FASTAPI else 'Starlette'})...")
    uvicorn.run(app, host="127.0.0.1", port=8001)
