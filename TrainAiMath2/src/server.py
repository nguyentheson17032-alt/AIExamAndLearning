import os
import sys
import json
import random
from typing import Dict, Any, List, Optional

# Đảm bảo đường dẫn module
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from math_engine.generator import ExerciseGenerator
from math_engine.evaluator import MathEvaluator
from math_engine.ai_tutor import AITutor

from physics_engine.generator import PhysicsGenerator
from physics_engine.evaluator import PhysicsEvaluator
from physics_engine.ai_tutor import PhysicsAITutor

STATIC_DIR = os.path.join(os.path.dirname(CURRENT_DIR), "web")

PHYSICS_CATEGORIES = {
    "mechanics",
    "oscillation_wave",
    "circuits_electromagnetism",
    "optics",
    "thermodynamics",
    "nuclear_quantum",
    "physics_true_false",
    "physics_short_answer",
}

def is_physics_subject_or_category(subject_name: Optional[str], category: Optional[str]) -> bool:
    if category and (category.lower() in PHYSICS_CATEGORIES or category.lower().startswith("phy")):
        return True
    if subject_name:
        s = subject_name.lower()
        if any(k in s for k in ["vật", "vat", "phys", "lý", "ly", "lí", "li", "phy"]):
            return True
    return False


try:
    from fastapi import FastAPI, Request
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse, JSONResponse
    USE_FASTAPI = True
except ImportError:
    USE_FASTAPI = False
    from starlette.applications import Starlette
    from starlette.middleware import Middleware
    from starlette.middleware.cors import CORSMiddleware
    from starlette.staticfiles import StaticFiles
    from starlette.responses import FileResponse, JSONResponse
    from starlette.routing import Route, Mount


def classify_question_heuristic(stem: str) -> Dict[str, Any]:
    """Phân tích độ khó, cấp độ Bloom và ước tính Elo cho câu hỏi Toán & Vật lý."""
    text = stem.lower()
    # Kiểm tra nếu là câu hỏi Vật lý
    if any(k in text for k in [
        "vận tốc", "gia tốc", "lực", "con lắc", "lò xo", "dao động", "sóng", "tần số",
        "tổng trở", "cảm kháng", "dung kháng", "thấu kính", "tiêu cự", "chiết suất",
        "khúc xạ", "nhiệt độ", "khí lý tưởng", "áp suất", "carnot", "photon",
        "quang điện", "hạt nhân", "phóng xạ", "m/s", "rad/s", "ohm", "rlc", "diop"
    ]):
        if any(k in text for k in ["cộng hưởng", "carnot", "phóng xạ", "mẫu nguyên tử bo", "thấu kính", "sóng dừng"]):
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

        tags = ["Vật lý", category, "AI Evaluated"]
        return {
            "tags": tags,
            "difficulty": difficulty,
            "eloRating": elo,
            "category": category,
            "bloomLevel": bloom,
            "confidence": 0.96,
            "modelName": "PhysicsAiEngine-v2.0"
        }

    # Nếu là câu hỏi Toán học
    if any(k in text for k in ["x^4", "trùng phương", "parabol", "căn", "thực tế", "chuyển động", "diện tích"]):
        difficulty = "HARD"
        elo = 1250
        bloom = "APPLY"
        category = "Đại số & Toán thực tế nâng cao"
    elif any(k in text for k in ["x^2", "bậc hai", "delta", "hệ phương trình", "nghiệm phân biệt"]):
        difficulty = "MEDIUM"
        elo = 1050
        bloom = "UNDERSTAND"
        category = "Phương trình & Hệ phương trình"
    else:
        difficulty = "EASY"
        elo = 900
        bloom = "REMEMBER"
        category = "Phương trình bậc nhất"

    tags = ["Toán học", category, "AI Evaluated"]
    return {
        "tags": tags,
        "difficulty": difficulty,
        "eloRating": elo,
        "category": category,
        "bloomLevel": bloom,
        "confidence": 0.96,
        "modelName": "MathAiEngine-v2.0"
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
    except Exception as e:
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
        title="AI Math & Physics Exercise Generator & Tutor API",
        description="Backend API sinh bài tập Toán học & Vật lý tự động, chấm điểm tương tác và hỗ trợ AI Tutor",
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
            "framework": "FastAPI",
            "service": "AI Math & Physics Exercise Generator & Tutor",
            "subjects": ["Toán học", "Vật lý"],
            "models": ["Linear Regression (y=2x+1)", "MLP Neural Network (y=2x^2-3x+1)", "Physics Engine v2.1"]
        }

    @app.post("/api/generate")
    async def generate_exercises(req: Request):
        body = await get_json_body(req)
        category = body.get("category", "all")
        difficulty = body.get("difficulty", "medium")
        count = max(1, min(int(body.get("count", 3)), 20))
        elo = body.get("elo") or body.get("eloRating")
        subject_name = body.get("subject_name") or body.get("subjectName") or "Toán học"

        if is_physics_subject_or_category(subject_name, category):
            exercises = PhysicsGenerator.generate_batch(
                category=category,
                difficulty=difficulty,
                count=count,
                elo=int(elo) if elo is not None and str(elo).isdigit() else None
            )
            resolved_subject = "Vật lý"
        else:
            exercises = ExerciseGenerator.generate_batch(
                category=category,
                difficulty=difficulty,
                count=count,
                elo=int(elo) if elo is not None and str(elo).isdigit() else None,
                subject_name=subject_name
            )
            resolved_subject = "Toán học"

        return {
            "success": True,
            "count": len(exercises),
            "category": category,
            "difficulty": difficulty,
            "elo": elo,
            "subject_name": resolved_subject,
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
        
        # Phân loại thẩm định theo môn học
        prob_subject = str(problem.get("subject_name", "")).lower()
        prob_cat = str(problem.get("category", "")).lower()
        prob_id = str(problem.get("id", "")).lower()
        
        if "vật lý" in prob_subject or "physics" in prob_subject or prob_cat in PHYSICS_CATEGORIES or prob_id.startswith("phy_"):
            result = PhysicsEvaluator.evaluate_answer(problem=problem, user_input=str(user_answer))
        else:
            result = MathEvaluator.evaluate_answer(problem=problem, user_input=str(user_answer))

        return {"success": True, "result": result}

    @app.post("/api/ai/chat")
    async def ai_chat(req: Request):
        body = await get_json_body(req)
        query = body.get("query", "")
        current_prob = body.get("current_problem", None)
        
        is_phy = False
        if current_prob and isinstance(current_prob, dict):
            s_name = str(current_prob.get("subject_name", "")).lower()
            cat = str(current_prob.get("category", "")).lower()
            if "vật lý" in s_name or "physics" in s_name or cat in PHYSICS_CATEGORIES:
                is_phy = True
        if any(w in query.lower() for w in ["vật lý", "physics", "sóng", "lò xo", "tổng trở", "thấu kính", "nhiệt độ", "photon"]):
            is_phy = True

        if is_phy:
            reply = PhysicsAITutor.answer_physics_query(query=query, current_problem=current_prob)
        else:
            reply = AITutor.answer_student_query(query=query, current_problem=current_prob)
            
        return {"success": True, "reply": reply}

    @app.get("/api/ai/predict")
    async def predict_models(x: float = 2.0):
        predictions = AITutor.predict_ai_models(x_val=x)
        return {"success": True, "data": predictions}

    @app.post("/api/ai/classify")
    async def classify_api(req: Request):
        body = await get_json_body(req)
        stem = body.get("stem", "")
        res = classify_question_heuristic(stem)
        return {"success": True, "data": res}

    @app.post("/api/ai/similar")
    async def similar_api(req: Request):
        body = await get_json_body(req)
        count = max(1, min(int(body.get("count", 3)), 10))
        stem = body.get("stem", "").lower()
        
        if any(k in stem for k in ["vận tốc", "gia tốc", "lò xo", "dao động", "sóng", "rlc", "thấu kính", "khí lý tưởng"]):
            cat = "mechanics"
            if "dao động" in stem or "sóng" in stem:
                cat = "oscillation_wave"
            elif "rlc" in stem or "điện" in stem or "tổng trở" in stem:
                cat = "circuits_electromagnetism"
            elif "thấu kính" in stem or "khúc xạ" in stem:
                cat = "optics"
            elif "khí" in stem or "nhiệt" in stem:
                cat = "thermodynamics"
            exercises = PhysicsGenerator.generate_batch(category=cat, count=count)
        else:
            category = "linear"
            if "x^2" in stem or "bậc hai" in stem or "delta" in stem:
                category = "quadratic"
            elif "hệ phương trình" in stem:
                category = "system"
            elif "km" in stem or "diện tích" in stem:
                category = "word_problem"
            exercises = ExerciseGenerator.generate_batch(category=category, count=count)
            
        return {"success": True, "exercises": exercises}

    @app.get("/")
    async def serve_index():
        if os.path.exists(os.path.join(STATIC_DIR, "index.html")):
            return FileResponse(os.path.join(STATIC_DIR, "index.html"))
        return {"message": "AI Math & Physics Engine API is running"}

    if os.path.exists(STATIC_DIR):
        app.mount("/static", StaticFiles(directory=STATIC_DIR, html=True), name="static")

else:
    # Starlette Fallback Implementation
    async def health_check(request):
        return JSONResponse({
            "status": "online",
            "framework": "Starlette",
            "service": "AI Math & Physics Exercise Generator & Tutor",
            "subjects": ["Toán học", "Vật lý"],
            "models": ["Linear Regression (y=2x+1)", "MLP Neural Network (y=2x^2-3x+1)", "Physics Engine v2.1"]
        })

    async def generate_exercises(request):
        body = await get_json_body(request)
        category = body.get("category", "all")
        difficulty = body.get("difficulty", "medium")
        count = max(1, min(int(body.get("count", 3)), 20))
        elo = body.get("elo") or body.get("eloRating")
        subject_name = body.get("subject_name") or body.get("subjectName") or "Toán học"

        if is_physics_subject_or_category(subject_name, category):
            exercises = PhysicsGenerator.generate_batch(
                category=category,
                difficulty=difficulty,
                count=count,
                elo=int(elo) if elo is not None and str(elo).isdigit() else None
            )
            resolved_subject = "Vật lý"
        else:
            exercises = ExerciseGenerator.generate_batch(
                category=category,
                difficulty=difficulty,
                count=count,
                elo=int(elo) if elo is not None and str(elo).isdigit() else None,
                subject_name=subject_name
            )
            resolved_subject = "Toán học"

        return JSONResponse({
            "success": True,
            "count": len(exercises),
            "category": category,
            "difficulty": difficulty,
            "elo": elo,
            "subject_name": resolved_subject,
            "exercises": exercises
        })

    async def evaluate_answer(request):
        body = await get_json_body(request)
        problem = body.get("problem", {})
        user_answer = body.get("user_answer", "")
        
        prob_subject = str(problem.get("subject_name", "")).lower()
        prob_cat = str(problem.get("category", "")).lower()
        prob_id = str(problem.get("id", "")).lower()
        
        if "vật lý" in prob_subject or "physics" in prob_subject or prob_cat in PHYSICS_CATEGORIES or prob_id.startswith("phy_"):
            result = PhysicsEvaluator.evaluate_answer(problem=problem, user_input=str(user_answer))
        else:
            result = MathEvaluator.evaluate_answer(problem=problem, user_input=user_answer)
            
        return JSONResponse({"success": True, "result": result})

    async def ai_chat(request):
        body = await get_json_body(request)
        query = body.get("query", "")
        current_prob = body.get("current_problem", None)
        
        is_phy = False
        if current_prob and isinstance(current_prob, dict):
            s_name = str(current_prob.get("subject_name", "")).lower()
            cat = str(current_prob.get("category", "")).lower()
            if "vật lý" in s_name or "physics" in s_name or cat in PHYSICS_CATEGORIES:
                is_phy = True
        if any(w in query.lower() for w in ["vật lý", "physics", "sóng", "lò xo", "tổng trở", "thấu kính", "nhiệt độ", "photon"]):
            is_phy = True

        if is_phy:
            reply = PhysicsAITutor.answer_physics_query(query=query, current_problem=current_prob)
        else:
            reply = AITutor.answer_student_query(query=query, current_problem=current_prob)
            
        return JSONResponse({"success": True, "reply": reply})

    async def predict_models(request):
        try:
            x_val = float(request.query_params.get("x", 2.0))
        except Exception:
            x_val = 2.0
        predictions = AITutor.predict_ai_models(x_val=x_val)
        return JSONResponse({"success": True, "data": predictions})

    async def classify_api(request):
        body = await get_json_body(request)
        stem = body.get("stem", "")
        res = classify_question_heuristic(stem)
        return JSONResponse({"success": True, "data": res})

    async def similar_api(request):
        body = await get_json_body(request)
        count = max(1, min(int(body.get("count", 3)), 10))
        stem = body.get("stem", "").lower()
        
        if any(k in stem for k in ["vận tốc", "gia tốc", "lò xo", "dao động", "sóng", "rlc", "thấu kính", "khí lý tưởng"]):
            cat = "mechanics"
            if "dao động" in stem or "sóng" in stem:
                cat = "oscillation_wave"
            elif "rlc" in stem or "điện" in stem or "tổng trở" in stem:
                cat = "circuits_electromagnetism"
            elif "thấu kính" in stem or "khúc xạ" in stem:
                cat = "optics"
            elif "khí" in stem or "nhiệt" in stem:
                cat = "thermodynamics"
            exercises = PhysicsGenerator.generate_batch(category=cat, count=count)
        else:
            category = "linear"
            if "x^2" in stem or "bậc hai" in stem or "delta" in stem:
                category = "quadratic"
            elif "hệ phương trình" in stem:
                category = "system"
            elif "km" in stem or "diện tích" in stem:
                category = "word_problem"
            exercises = ExerciseGenerator.generate_batch(category=category, count=count)
            
        return JSONResponse({"success": True, "exercises": exercises})

    routes = [
        Route("/api/health", health_check, methods=["GET"]),
        Route("/api/generate", generate_exercises, methods=["POST"]),
        Route("/api/evaluate", evaluate_answer, methods=["POST"]),
        Route("/api/ai/chat", ai_chat, methods=["POST"]),
        Route("/api/ai/predict", predict_models, methods=["GET"]),
        Route("/api/ai/classify", classify_api, methods=["POST"]),
        Route("/api/ai/similar", similar_api, methods=["POST"]),
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
    print(f"[*] AI Math & Physics Server starting at http://localhost:8000 (Framework: {'FastAPI' if USE_FASTAPI else 'Starlette'})...")
    uvicorn.run(app, host="127.0.0.1", port=8000)
