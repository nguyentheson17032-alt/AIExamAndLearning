# IDENTITY

Log of user–AI collaboration per `todo.md` phase: work done, user prompts, skills, and rules.

## Project

- Name: AI Exam Warehouse
- Started: 2026-09-11
- Goal: Kho điểm thi — backend Spring Boot + frontend Next.js: upload/ra đề, luyện theo Elo, và AI chấm/xếp hạng/sinh đề

## Phase 1: Project Setup

**Status:** completed

### Work

- Created `Backend/` Spring Boot 3.5.16 Maven project (Java 21) because start.spring.io now only serves Boot 4
- Added web, validation, JPA, Security, Flyway, PostgreSQL, Lombok, Spring AI OpenAI, Testcontainers, JJWT
- Configured `application.yml` plus `JwtProperties`, `EloProperties`, `AiProperties`
- Added RFC 9457 `ProblemDetailExceptionHandler`, domain exceptions, and `PageResponse`
- Added Maven Wrapper and smoke tests; `mvnw.cmd test` passed

### User prompts

1. > xây dựng 1 hệ thống backend cho 1 kho điểm thi
   >
   > • người dùng có thể upload câu hỏi, ra đề thi, ra bài tập
   > • hệ thống có thể tạo đề thi, tạo câu hỏi
   > • người dùng có thể làm bài tập, luyện đề thi dựa trên năng lực của user (elo / rank)
   >
   > ngoài ra: sử dụng 1 hệ thống AI để làm những việc sau
   >
   > • AI để tính rank (elo) cho user
   > • AI để chấm điểm, xếp hạng phân loại câu hỏi, bài tập
   > • AI để gen ra các mẫu bài tập tương tự
   > • AI để gen ra các bộ đề khác nhau để luyện thi, luyện học (kết hợp tăng elo của user).
   >
   > hãy dựa vào folder @.cursor này để làm

### Skills used

- `project-todo` — created todo.md with backend-only phases
- `identity` — created IDENTITY.md
- `erd` — created ERD.md before any schema work

### Rules used

- `project-todo.mdc` — Backend folder only; todo.md before implementation
- `identity.mdc` — IDENTITY.md at project start
- `erd.mdc` — ERD.md before database work
- `karpathy-guidelines.mdc` — backend-only scope, no frontend
- `springboot.mdc` — feature packages, typed config, RFC 9457

### Outcome

- All Phase 1 tasks marked `[x]`
- `./mvnw.cmd test` passed
- Commit: `feat(setup): complete project setup phase`

## Phase 2: Database

**Status:** completed

### Work

- Wrote Flyway V1–V6 for users, catalog, questions, papers, attempts, Elo events, and AI jobs
- Created JPA entities and repositories matching ERD.md (UUID, STRING enums, lazy associations)

### User prompts

1. Same initial backend request as Phase 1

### Skills used

- `erd` — schema matches ERD.md
- `flyway-migrations` — versioned SQL, FK indexes, no seed in Flyway
- `spring-data-jpa` — UUID ids, STRING enums, EntityGraph, no setters on entities

### Rules used

- `erd.mdc` — no tables outside ERD.md
- `springboot.mdc` — feature packages for entities/repos

### Outcome

- All Phase 2 tasks marked `[x]`
- Entities compile with the rest of the module
- Commit: `feat(database): complete database phase`

## Phase 3: Backend

**Status:** completed

### Work

- Implemented catalog, question warehouse (including batch upload), paper generation from Elo range, attempts with auto-grade, EloCalculator/EloService, and PracticeService
- Added ExamAiClient with heuristic implementation used by grading and later AI APIs

### User prompts

1. Same initial backend request as Phase 1

### Skills used

- `transactional-patterns` — `@Transactional` on services, readOnly default
- `spring-ai-integration` — ExamAiClient + structured heuristic/LLM results

### Rules used

- `springboot.mdc` — controllers later; services own rules; constructor injection
- `karpathy-guidelines.mdc` — heuristic fallback instead of requiring a live LLM

### Outcome

- All Phase 3 tasks marked `[x]`
- Commit: `feat(domain): complete backend services phase`

## Phase 4: Authentication

**Status:** completed

### Work

- Implemented JWT access/refresh, rotating hashed refresh tokens, SecurityConfig, register/login/refresh APIs
- Added JwtService and AuthController tests

### User prompts

1. Same initial backend request as Phase 1

### Skills used

- `spring-security-jwt` — filter, SecurityConfig, refresh type, Problem Details 401/403
- `testing-pyramid` — JwtService unit tests and AuthController slice tests

### Rules used

- `springboot.mdc` — JwtProperties record; RFC 9457 on filter errors
- `agent-auto-git.mdc` — commit after the phase, not after each task

### Outcome

- All Phase 4 tasks marked `[x]`
- `./mvnw.cmd test` passed
- Commit: `feat(auth): complete authentication phase`

## Phase 5: API

**Status:** completed

### Work

- Added REST controllers for subjects, questions, papers, attempts, practice, `/me`, and AI classify/similar/practice/elo
- Spring AI client with prompt templates and heuristic fallback; optional `APP_AI_ENABLED`

### User prompts

1. Same initial backend request as Phase 1

### Skills used

- `rest-api-conventions` — `/api/v1`, Pageable, 201/204, no success envelope
- `problem-details-rfc9457` — domain exceptions mapped to ProblemDetail
- `spring-ai-integration` — ChatClient structured output + external prompts

### Rules used

- `springboot.mdc` — DTO records, no entities from controllers
- `karpathy-guidelines.mdc` — AI optional; no extra RAG/vector store

### Outcome

- All Phase 5 tasks marked `[x]`
- Commit: `feat(api): complete exam warehouse APIs`

## Phase 6: Testing

**Status:** completed

### Work

- Added unit tests for Elo, rank, heuristic AI, question service, attempts, JWT
- Added WebMvc slice tests for auth and question validation

### User prompts

1. Same initial backend request as Phase 1

### Skills used

- `testing-pyramid` — MockitoExtension unit tests, `@WebMvcTest` + `@MockitoBean`

### Rules used

- `springboot.mdc` — `method_condition_expected`, AssertJ, `@MockitoBean`

### Outcome

- All Phase 6 tasks marked `[x]`
- `./mvnw.cmd test` — 18 tests, BUILD SUCCESS
- Commit: `test: complete testing phase`

## Phase 7: Documentation

**Status:** completed

### Work

- Wrote `Backend/README.md` with stack, run steps, dev seed accounts, and API table

### User prompts

1. Same initial backend request as Phase 1

### Skills used

- `project-todo` — documentation phase completion

### Rules used

- `project-todo.mdc` — README as the documentation task, not extra unsolicited docs

### Outcome

- All Phase 7 tasks marked `[x]`
- Commit: `docs: complete documentation phase`

## Phase 8: Frontend Setup

**Status:** completed

### Work

- Created `Frontend/` Next.js 15 App Router app (TypeScript, Tailwind CSS, React 19)
- Added `BACKEND_URL` via `.env.example` and a server `backendFetch` client
- Added app shell, page header, empty/problem UI, and global styles
- Production `npm run build` succeeds (Next 16.3 `_global-error` prerender bug on mixed-case Windows paths; pinned Next 15.5.9)

### User prompts

1. > @.cursor dựa vào folder này để làm frontend cho dự án

### Skills used

- `project-todo` — added frontend phases 8–14
- `identity` — added matching IDENTITY.md sections
- `vercel-react-best-practices` — App Router, parallel fetches, no extra data library
- `git-auto-commit-push` — phase commit after setup

### Rules used

- `project-todo.mdc` — Frontend folder; new phases appended
- `react.mdc` — Next.js in Frontend; no React Query/SWR/UI kit
- `karpathy-guidelines.mdc` — no extra libraries beyond Next/Tailwind
- `agent-auto-git.mdc` — commit after the phase

### Outcome

- All Phase 8 tasks marked `[x]`
- `npm run build` passed
- Commit: `feat(frontend): complete frontend setup phase`

## Phase 9: Frontend Authentication

**Status:** completed

### Work

- httpOnly cookies for access/refresh/user snapshot; login/register/logout server actions
- middleware protects app routes; login/register remain public
- Login and register pages; shell shows name, rank, Elo, logout

### User prompts

1. > @.cursor dựa vào folder này để làm frontend cho dự án

### Skills used

- `vercel-react-best-practices` — authenticate mutations in server actions
- `vercel-composition-patterns` — login/register as separate forms, not boolean modes

### Rules used

- `react.mdc` — no SWR; cookies versioned `ew_*_v1`
- `agent-auto-git.mdc` — phase commit

### Outcome

- All Phase 9 tasks marked `[x]`
- Commit: `feat(auth): complete frontend authentication phase`

## Phase 10: Catalog and Questions

**Status:** completed

### Work

- Subject list/create and topic create on subject detail
- Question list, create, detail, archive, JSON batch upload

### User prompts

1. > @.cursor dựa vào folder này để làm frontend cho dự án

### Skills used

- `vercel-react-best-practices` — RSC pages, server actions for mutations

### Rules used

- `react.mdc` — feature pages in Frontend only

### Outcome

- All Phase 10 tasks marked `[x]`
- Commit: `feat(questions): complete catalog and questions UI`

## Phase 11: Papers and Practice

**Status:** completed

### Work

- Paper list/create/generate; start attempt; take-exam form; results
- Elo practice session; profile/rank and Elo history

### User prompts

1. > @.cursor dựa vào folder này để làm frontend cho dự án

### Skills used

- `vercel-react-best-practices` — Promise.all for independent page data

### Rules used

- `react.mdc` — native forms, no UI kit

### Outcome

- All Phase 11 tasks marked `[x]`
- Commit: `feat(papers): complete papers and practice UI`

## Phase 12: AI Features

**Status:** completed

### Work

- Classify and similar-question actions on question detail
- AI practice paper generator
- AI Elo adjustment on graded attempts

### User prompts

1. > @.cursor dựa vào folder này để làm frontend cho dự án

### Skills used

- `vercel-react-best-practices` — useTransition for AI button actions

### Rules used

- `react.mdc` — teacher-only AI paper/classify routes

### Outcome

- All Phase 12 tasks marked `[x]`
- Commit: `feat(ai): complete frontend AI features`

## Phase 13: Frontend Testing

**Status:** completed

### Work

- Node test runner coverage for RFC 9457 problem parsing and staff-role helper

### User prompts

1. > @.cursor dựa vào folder này để làm frontend cho dự án

### Skills used

- `project-todo` — testing phase tasks

### Rules used

- `agent-auto-git.mdc` — tests before the phase commit

### Outcome

- All Phase 13 tasks marked `[x]`
- `npm test` — 3 tests passed
- Commit: `test(frontend): complete frontend testing phase`

## Phase 14: Frontend Documentation

**Status:** completed

### Work

- Wrote `Frontend/README.md` with stack, run steps, seed accounts, and feature list

### User prompts

1. > @.cursor dựa vào folder này để làm frontend cho dự án

### Skills used

- `project-todo` — documentation phase
- `git-auto-commit-push` — phase commit and push

### Rules used

- `project-todo.mdc` — README as the documentation task

### Outcome

- All Phase 14 tasks marked `[x]`
- Commit: `docs(frontend): complete frontend documentation phase`

## Phase 15: Exam Set Schema

**Status:** completed

### Work

- Updated `ERD.md` with `PAPER_SET` (academic year, title, subject, author) and `PAPER.paper_set_id` / `exam_number`
- Added `PAPER_QUESTION` section fields: `section_code`, `section_title`, `item_label`, `group_key` for TS10 parts I–III
- Added Flyway `V7__create_paper_sets.sql`
- Created `PaperSet` entity and `PaperSetRepository`
- Extended `Paper` and `PaperQuestion` with set membership and section metadata; added `PaperSection` enum

### User prompts

1. > tôi muốn đưa vào hệ thống học/thi,khi học sinh chọn 1 bộ đề thì sẽ hiện từng đề, khi học sinh chọn làm 1 đề thì hiện lần lượt từng phần,từng câu và bấm nút Next để sang câu tiếp theo,có ô để học sinh điền đáp án, phần đáp án để AI tự chấm điểm trên thang điểm 10 và cộng elo theo công thức lấy điểm chia 10, phần lời giải khi học sinh làm xong 1 đề rồi bấm xem chi tiết lời giải thì xem được và đây là bộ đề toán tuyển sinh 10 năm học 2025-2026, bạn hãy làm dựa vào @.cursor và giải thích

### Skills used

- `project-todo` — added Phases 15–18 for exam sets
- `identity` — this phase log
- `erd` — PAPER_SET and section columns before schema work

### Rules used

- `project-todo.mdc` — new requirements go into todo.md phases
- `erd.mdc` — ERD.md before entities/migrations
- `identity.mdc` — record the driving prompt and fill Outcome before commit
- `agent-auto-git.mdc` — commit only when the phase is complete

### Outcome

- All Phase 15 tasks marked `[x]`
- Planned commit: `feat(schema): add paper sets and exam section columns`

## Phase 16: Exam Set Backend

**Status:** completed

### Work

- Added `GET /api/v1/paper-sets` and `GET /api/v1/paper-sets/{id}` for published exam sets
- Graded TS10 papers on a 10-point scale: Phần I auto MCQ (0.25), Phần II official đúng/sai group scale, Phần III AI/heuristic short answer
- Applied Elo with `score / 10` via `Ts10Scoring.eloScore`
- Added `GET /api/v1/attempts/{id}/solutions` after the attempt is graded
- Added `PaperSetControllerTest` and `Ts10ScoringTest`

### User prompts

1. Same TS10 học/thi request as Phase 15 (bộ đề → đề → từng câu, thang 10, Elo = điểm/10, lời giải)

### Skills used

- `identity` — fill this phase before commit
- `project-todo` — Phase 16 tasks

### Rules used

- `project-todo.mdc` — implement the phase tasks, then commit
- `karpathy-guidelines.mdc` — reuse existing attempt grading instead of a new subsystem
- `agent-auto-git.mdc` — commit only when the phase is complete

### Outcome

- All Phase 16 tasks marked `[x]`
- `./mvnw.cmd test` passed (22 tests)
- Planned commit: `feat(papers): add exam-set APIs and TS10 grading`

## Phase 17: TS10 2025-2026 Import

**Status:** completed

### Work

- Extracted 30 TS10 2025–2026 exams from the Word file into `data/ts10-2025-2026.json` (34 items each: 12 MCQ, 16 đúng/sai, 6 short answer)
- Added `Ts10ExamSetImporter` to create a published paper set with parts I–III
- Seeded the set on startup when `app.seed.ts10-exam-set` is true (`SEED_TS10`, default true; tests set false)
- Added `Ts10ExamBankTest` asserting 30 exams and Đề 1 Phần I keys

### User prompts

1. Same TS10 học/thi request as Phase 15

### Skills used

- `identity` — fill this phase before commit
- `project-todo` — Phase 17 tasks

### Rules used

- `project-todo.mdc` — import as its own phase
- `agent-auto-git.mdc` — commit only when the phase is complete

### Outcome

- All Phase 17 tasks marked `[x]`
- Planned commit: `feat(seed): import TS10 2025-2026 exam set`

## Phase 18: Sequential Exam Frontend

**Status:** completed

### Work

- Added `/exam-sets` and `/exam-sets/[id]` so students pick a bộ đề then a đề
- Take-exam wizard: one phần/câu (or Phần II group) at a time, Next/Trước, answer inputs, submit on the last step
- After GRADED, "Xem chi tiết lời giải" at `/attempts/[id]/solutions`
- Added `examSteps` helper + unit test; Home/nav link "Bộ đề"

### User prompts

1. Same TS10 học/thi request as Phase 15

### Skills used

- `identity` — fill this phase before commit
- `project-todo` — Phase 18 tasks
- `vercel-react-best-practices` — hidden form sections still submit all answers; QuestionPrompt is not nested inside TakeExamForm

### Rules used

- `project-todo.mdc` — frontend last
- `karpathy-guidelines.mdc` — sequential UI without extra libraries
- `agent-auto-git.mdc` — commit only when the phase is complete

### Outcome

- All Phase 18 tasks marked `[x]`
- `npm test` and `npm run build` passed
- Planned commit: `feat(frontend): sequential exam-set taking and solutions`
