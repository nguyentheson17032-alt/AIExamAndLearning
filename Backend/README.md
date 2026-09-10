# Exam Warehouse Backend

Spring Boot API for a question bank, exams/assignments, Elo-ranked practice, and AI-assisted grading/generation.

## Stack

- Java 21, Spring Boot 3.5.16
- PostgreSQL + Flyway
- Spring Security JWT (access + rotating refresh tokens)
- Spring AI OpenAI (optional; heuristic fallback when disabled)

## Run

1. Create a PostgreSQL database `exam_warehouse`.
2. Copy `.env.example` values into your environment (or export them).
3. Start the API:

```bash
cd Backend
./mvnw.cmd spring-boot:run
```

Dev seed (`--spring.profiles.active=dev`):

- `teacher@exam.local` / `Teacher123!`
- `student@exam.local` / `Student123!`

Enable live LLM calls with `APP_AI_ENABLED=true` and a real `OPENAI_API_KEY`. When disabled, classify/grade/generate still work via a deterministic heuristic client.

## Main APIs

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/v1/auth/register` | Register student |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Rotate refresh token |
| POST | `/api/v1/subjects` | Create subject (teacher) |
| POST | `/api/v1/questions` | Create question |
| POST | `/api/v1/questions/upload` | Batch upload questions |
| POST | `/api/v1/papers` | Create exam/assignment |
| POST | `/api/v1/papers/generate` | Auto-build a paper from Elo range |
| POST | `/api/v1/practice/sessions` | Adaptive practice by user Elo |
| POST | `/api/v1/papers/{id}/attempts` | Start attempt |
| POST | `/api/v1/attempts/{id}/submit` | Submit + grade + Elo |
| GET | `/api/v1/me` | Current user rank |
| POST | `/api/v1/ai/questions/{id}/classify` | AI classify question |
| POST | `/api/v1/ai/questions/{id}/similar` | AI similar questions |
| POST | `/api/v1/ai/papers/practice` | AI practice set (slightly above Elo) |
| POST | `/api/v1/ai/attempts/{id}/elo` | AI Elo adjustment |

Errors follow RFC 9457 `application/problem+json`.
