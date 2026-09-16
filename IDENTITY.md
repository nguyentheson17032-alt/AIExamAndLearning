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

## Phase 19: Restore TS10 Equation Content

**Status:** completed

### Work

- Diagnosed missing question text: extractor only joined Word `w:t`, while formulas live in MathType OLE (`Equation.DSMT4` / WMF); Part I/II/III all restart at Câu 1 so later parts overwrote earlier stems
- Rewrote `_extract_ts10.py` to slice parts before collecting questions, convert WMF/PNG media to `frontend/public/ts10/`, and insert `[[img:/ts10/...]]` markers
- Re-imported the exam set when first stem lacked `[[img:`
- Rendered equation images in take-exam, solutions, paper, and question views; stripped inline A–D from MCQ stems so choices do not overlap the prompt

### User prompts

1. > sao tất cả các câu đều mất đi rất nhiều đoạn vậy

### Skills used

- `identity` — filled this phase after restoring exam content
- `project-todo` — Phase 19 tasks tracked in todo.md

### Rules used

- `karpathy-guidelines.mdc` — extract images instead of inventing formula text
- `identity.mdc` — log the driving prompt and outcome
- User git rule — do not commit unless asked

### Outcome

- All Phase 19 tasks marked `[x]`
- Đề số 1 I.1 is the bậc nhất question with equation images in A–D, not the overwritten Part III stem
- Browser check: I.1 and I.2 show restored formulas; WMF snapshots remain low-resolution because that is how Word stored them

## Phase 20: TS10 Full Question Snapshots

**Status:** completed

### Work

- Exported the Word file to PDF and cropped 660 questions (30 đề × 22 câu) into `frontend/public/ts10/q/`
- Each snapshot includes the full stem and options, matching the original paper layout
- Import JSON stems now start with `[[img:/ts10/q/eXX-...png]]`; take-exam shows that image and MCQ radios as A–D only
- Re-imported the TS10 set so the database uses the snapshots

### User prompts

1. > bạn có thể chụp ảnh cả câu hỏi được mà, ví dụ chụp như trên

### Skills used

- `identity` — logged this phase
- `project-todo` — Phase 20 tasks in todo.md

### Rules used

- `karpathy-guidelines.mdc` — crop original pages instead of reconstructing formulas
- `identity.mdc` — log the driving prompt and outcome
- User git rule — do not commit unless asked

### Outcome

- All Phase 20 tasks marked `[x]`
- Backend tests and frontend unit tests passed
- Browser: Đề số 1 Câu 1 and Câu 2 show the full question image with A–D in the picture

## Phase 21: Solution Snapshots and Score Elo

**Status:** completed

### Work

- Cropped 660 lời giải blocks from the PDF (`e01-sol-01.png` …) and pointed each question `explanation` at that snapshot
- Solutions page shows the lời giải image; Bài làm is the chosen letter (or Đúng/Sai text), not the broken WMF choice image
- Exam-set papers add rounded score to Elo (9 điểm → +9); the header reads live `/api/v1/me` so `Teacher · GOLD 1209` updates after grading
- Re-imported the TS10 set; backend tests and frontend unit tests passed

### User prompts

1. > xem lời giải chi tiết, phần lời giải b cũng chụp ảnh lời giải luôn và chỗ Bài làm:..., chỗ elo nữa(teacher đang có 1200 elo khi làm bài được 9 điểm thì sẽ cộng 9 elo thành 1209 và cập nhật luôn ở Teacher · GOLD 1200)

### Skills used

- `identity` — logged this phase
- `project-todo` — Phase 21 tasks in todo.md

### Rules used

- `karpathy-guidelines.mdc` — crop original lời giải instead of reconstructing formulas
- `identity.mdc` — log the driving prompt and outcome
- User git rule — do not commit unless asked
- User browser rule — verified solutions page and header Elo on localhost:3000

### Outcome

- All Phase 21 tasks marked `[x]`
- Browser: Đề số 1 solutions show `Bài làm: B`, a readable lời giải snapshot, `9 / 10 · Elo 1200 → 1209`, and header `Teacher · GOLD 1209`
- Planned commit: `feat(ts10): solution snapshots and score-based elo`

## Phase 22: Score Elo and Unused Images

**Status:** completed

### Work

- Elo for exam-set papers now uses the awarded score as a whole number (10 → +10, 9 → +9, 8.50 → +8, 7.25 → +7), not a fixed +9
- Result copy shows `+N Elo theo X điểm`
- Deleted 4911 unused WMF PNGs in `frontend/public/ts10`; kept 1320 question/solution snapshots in `ts10/q`
- Stripped `[[img:/ts10/imageN.png]]` from the import JSON and re-imported the set

### User prompts

1. > số elo được cộng theo số điểm đạt được chứ không phải auto cộng 9 và xóa các ảnh ko dùng đến trong @frontend/public/ts10 đi

### Skills used

- `identity` — logged this phase
- `project-todo` — Phase 22 tasks in todo.md

### Rules used

- `karpathy-guidelines.mdc` — delete unused assets instead of leaving dead WMF files
- `identity.mdc` — log the driving prompt and outcome
- User git rule — do not commit unless asked

### Outcome

- All Phase 22 tasks marked `[x]`
- `Ts10ScoringTest` and `Ts10ExamBankTest` passed
- Planned commit: `fix(ts10): score-based elo and drop unused images`

## Phase 23: Missing Attempt Redirect

**Status:** completed

### Work

- Attempt detail and solutions pages catch 404 and redirect to `/attempts` instead of throwing a runtime ApiError
- Confirmed the deleted demo attempt URL no longer shows the Next.js overlay

### User prompts

1. > Attempt not found: f0216bc5-7b8c-4f26-b9c5-85217620e432

### Skills used

- `identity` — logged this phase
- `project-todo` — Phase 23 tasks in todo.md

### Rules used

- `karpathy-guidelines.mdc` — small redirect helper, no extra error UI
- User browser rule — verified the stale URL lands on Attempts
- User git rule — do not commit unless asked

### Outcome

- All Phase 23 tasks marked `[x]`
- Planned commit: `fix(attempts): redirect missing attempt pages`

## Phase 24: Scoring Rank Elo Map

**Status:** completed

### Work

- Wrote root `SCORING.md`: map of TS10 grading (Part I/II/III), user rank from Elo, two Elo paths (exam-set score delta vs classic K=24), question classification, APIs/UI, and which file to edit

### User prompts

1. > những tiêu chí chấm điểm, xếp hạng, elo, đang nằm ở đâu, làm file md để chỉ rõ

### Skills used

- `identity` — logged this phase
- `project-todo` — Phase 24 in todo.md

### Rules used

- `identity.mdc` — log the driving prompt and outcome
- `karpathy-guidelines.mdc` — one map file, no extra docs
- User git rule — do not commit unless asked

### Outcome

- All Phase 24 tasks marked `[x]`
- Planned commit: `docs: map scoring rank and elo sources`

## Phase 25: Expired Session Refresh

**Status:** completed

### Work

- Stopped `backendFetch` from throwing a runtime overlay on 401
- Refresh now happens in `/api/session/refresh`, which can write cookies (RSC cannot)
- Layout rethrows Next.js redirect errors instead of swallowing them
- Stale sessions without a refresh cookie go to login via `/api/session/clear`

### User prompts

1. Runtime `ApiError` overlay: Unauthorized from `lib/backend.ts` `backendFetch`

### Skills used

- `identity` — logged this phase
- `project-todo` — Phase 25 tasks in todo.md

### Rules used

- `karpathy-guidelines.mdc` — refresh in a route handler, no extra auth library
- User browser rule — verified login and exam-set list without the overlay
- User git rule — do not commit unless asked

### Outcome

- All Phase 25 tasks marked `[x]`
- `npm test` passed
- Planned commit: `fix(auth): refresh expired session without overlay`

## Phase 26: Exam-Set Elo Lock

**Status:** completed

### Work

- Explained that AI Elo adjustment was a second write: heuristic/AI `suggestedElo` then `applyAdjustment` overwrites the user rating
- This attempt is practice paper “AI luyện thi”, already +13 Elo on submit (K=24)
- Removed the AI Elo button from the result page so it cannot double-apply
- Exam-set papers reject `POST /ai/attempts/{id}/elo` with `ELO_LOCKED_TO_SCORE`

### User prompts

1. > sao sau khi tôi bấm vào AI Elo adjustment trong http://localhost:3000/attempts/bfc437fc-5b5e-448a-953e-96b42d9f147e nó lại cập nhật elo

### Skills used

- `identity` — logged this phase
- `project-todo` — Phase 26 in todo.md

### Rules used

- `karpathy-guidelines.mdc` — remove the double-apply button, no extra Elo UI
- User browser rule — verified the attempt page no longer has AI Elo adjustment
- User git rule — do not commit unless asked

### Outcome

- All Phase 26 tasks marked `[x]`
- `AiExamServiceTest` passed
- Planned commit: `fix(elo): stop second AI rating on graded attempts`

## Phase 27: Subject Exam Sets

**Status:** completed

### Work

- Subject detail listed only topics; Toán did not show the imported TS10 bank
- `GET /api/v1/paper-sets?subjectId=` now returns published sets with papers
- Opening Toán shows “Bộ 30 đề Toán tuyển sinh 10” and đề 1–30 with Làm đề

### User prompts

1. > http://localhost:3000/subjects ở trang này sau khi bấm vào môn toán thì nó hiển thị bộ 30 đề toán tôi đưa b

### Skills used

- `identity` — logged this phase
- `project-todo` — Phase 27 in todo.md

### Rules used

- `karpathy-guidelines.mdc` — reuse exam-set list on the subject page
- User browser rule — verified Toán shows 30 exams
- User git rule — do not commit unless asked

### Outcome

- All Phase 27 tasks marked `[x]`
- `PaperSetControllerTest` passed
- Planned commit: `feat(subjects): show exam set papers on subject page`

## Phase 28: Subject-First Exam Sets

**Status:** completed

### Work

- Subjects is in the nav for every signed-in user; Toán lists the set card only (year, count, title), not the 30 papers
- Clicking “Bộ 30 đề Toán tuyển sinh 10” opens `/subjects/{id}/sets/{setId}` with đề 1–30 and Làm đề
- Nav item “Bộ đề” and the `/exam-sets` list UI are gone; `/exam-sets` redirects to `/subjects`, old set URLs redirect into the subject path
- Home “Bộ đề tuyển sinh 10” goes to `/subjects`

### User prompts

1. > tôi muốn vào Subjects → Toán sẽ thấy Bộ 30 đề Toán tuyển sinh 10 → bấm vào "Bộ 30 đề Toán tuyển sinh 10" thấy đủ 30 đề và bỏ trang http://localhost:3000/exam-sets này đi

### Skills used

- `identity` — logged this phase
- `project-todo` — Phase 28 in todo.md

### Rules used

- `karpathy-guidelines.mdc` — nest papers under the set, do not keep a second catalog page
- User browser rule — verified Toán card → 30 papers; `/exam-sets` lands on Subjects
- User git rule — do not commit unless asked

### Outcome

- All Phase 28 tasks marked `[x]`
- Frontend session tests passed (6)
- Planned commit: `feat(subjects): open exam sets from the subject page`

## Phase 29: Subject Page Cleanup

**Status:** completed

### Work

- Removed the teacher Topics list, Add topic form, and topics API fetch from the subject detail page
- Removed the section heading “Bộ đề”; the exam-set card (title + description) remains

### User prompts

1. > http://localhost:3000/subjects/ec1a2dbc-1d38-4f81-a960-b890a7280db2 trong trang này b hãy bỏ phần Topics đi và bỏ chữ bộ đề đi và giải thích cách làm

### Skills used

- `identity` — logged this phase
- `project-todo` — Phase 29 in todo.md

### Rules used

- `karpathy-guidelines.mdc` — only the subject detail page, no extra cleanup
- User browser rule — verified Toán has no Topics / Bộ đề heading; set link still opens 30 đề
- User git rule — do not commit unless asked

### Outcome

- All Phase 29 tasks marked `[x]`
- Planned commit: `fix(subjects): drop topics and bộ đề heading`

## Phase 30: Hydration-Safe Dates

**Status:** completed

### Work

- Added `formatDateTime` with `en-GB` + `Asia/Ho_Chi_Minh` so SSR and the browser emit the same date string
- Replaced `toLocaleString()` on Attempts and Rank (`/me`)
- Added unit tests and wired them into `npm test`

### User prompts

1. > A tree hydrated but some attributes of the server rendered HTML didn't match the client properties... lỗi gì đây
2. > b hãy sửa luôn

### Skills used

- `identity` — logged this phase
- `project-todo` — Phase 30 in todo.md

### Rules used

- `karpathy-guidelines.mdc` — one formatter, only the two `toLocaleString` call sites
- `agent-auto-git.mdc` / user git rule — do not commit unless asked

### Outcome

- All Phase 30 tasks marked `[x]`
- `npm test` passed (8)
- Planned commit: `fix(frontend): format dates without hydration mismatch`

## Phase 31: Store TS10 Snapshots in Database

**Status:** completed

### Work

- Added `question_images` / `question_image_refs` (Flyway V8) instead of altering `questions` (user `exam` is not table owner)
- Seed/backfill reads cropped PNGs from `frontend/public/ts10/q` and stores BYTEA; Part II a–d share one stem and one lời giải file
- `GET /api/v1/question-images/{id}` plus Next.js `/api/question-images/[id]` proxy
- Take-exam, papers, questions, and solutions render `stemImageId` / `explanationImageId`
- Startup log: attached 1320 unique files to 1020 questions; browser verified đề 1 stem + lời giải from `/api/question-images/{uuid}`

### User prompts

1. > bây h tôi muốn cho tất cả ảnh b chụp từ @thuvienhoclieu.com-Bo-30-De-toan-tuyen-sinh-10-nam-25-26-CTM-giai-chi-tiet.docx vào database thì phải làm như thế nào

### Skills used

- `erd` — QUESTION_IMAGE / QUESTION_IMAGE_REF before Flyway
- `identity` — logged this phase
- `project-todo` — Phase 31 in todo.md

### Rules used

- `erd.mdc` — schema in ERD.md before tables
- `karpathy-guidelines.mdc` — separate image tables, no `questions` ALTER
- User browser rule — verified take-exam and solutions PNGs load from the API
- User git rule — do not commit unless asked

### Outcome

- All Phase 31 tasks marked `[x]`
- Take-exam: 22 API images loaded; solutions: 44 API images loaded (stem + lời giải), none from `/ts10/q/`
- Planned commit: `feat(images): store TS10 snapshots in postgres`

## Phase 32: Complete Answers Before Submit

**Status:** completed

### Work

- Take-exam shows a **Tiến độ làm bài** grid: teal = done, orange = unanswered; click jumps to that câu
- **Nộp bài** stays disabled until all 34 items have an answer; form submit also jumps to the first unanswered câu
- Server action and backend `INCOMPLETE_ATTEMPT` reject partial submits
- Tests: `exam-steps` nav items + `AttemptCompletenessTest`
- Submit builds FormData from React state (hidden sections were dropping radio values; React then reset the form)
- Draft answers persist in sessionStorage; successful submit navigates on the client instead of `redirect()` (avoids a blank Application error)

### User prompts

1. > thếm luật là ko trả lời full tất cả các câu không được nộp bài và làm 1 ô để hiện thị những câu đã làm và chưa làm
2. > tôi làm hết nhưng không nhấn nộp bài được rồi các đáp tôi chọn bị biến mất, tôi nhấn nộp bài tiếp nó hiện còn 34 câu chưa làm

### Skills used

- `identity` — logged this phase
- `project-todo` — Phase 32 in todo.md

### Rules used

- `karpathy-guidelines.mdc` — progress helpers on exam-steps, no extra components
- User browser rule — đề 2: 0/34 then 1/34 after answering I.2; Nộp bài disabled
- User git rule — do not commit unless asked

### Outcome

- All Phase 32 tasks marked `[x]`
- `npm test` passed (11); `AttemptCompletenessTest` passed
- Planned commit: `feat(attempts): require every question before submit`
- Submit-from-state verified on Đề số 3: 34/34 persisted across reload, Nộp bài graded 1.75/10 with no blank Application error

## Phase 33: Generate by Exam Part

**Status:** completed

### Work

- Kind on `/papers/generate` is Phần I / II / III (not Exam/Assignment/Practice)
- Question count max 99; duration is count × 2 / 6 / 3 and read-only
- Elo defaults: 1000–1100, 1100–1200, 1200–3000
- Generate picks published questions of the matching type in that Elo range as a PRACTICE paper
- TS10 question Elo backfilled by part (1050 / 1150 / 1250) so the default ranges find them

### User prompts

1. > http://localhost:3000/papers/generate
   > bây h tôi chọn
   > - Kind nếu chọn Phần I - Trắc nghiệm thì Question count: điền <100, Duration (minutes): = Question count * 2, Elo: mặc định từ 1000 - 1100,
   > - Kind nếu chọn Phần II - Đúng/sai, 4 nhóm × 4 ý a–d thì Question count: điền <100, Duration (minutes): = Question count * 6, Elo: mặc định từ 1100 - 1200,
   > - Kind nếu chọn Phần III -Tự luận ngắn thì Question count: điền <100, Duration (minutes): = Question count * 3, Elo: mặc định từ 1200 trở lên,

### Skills used

- `project-todo` — Phase 33 in todo.md
- `identity` — logged this phase

### Rules used

- `karpathy-guidelines.mdc` — defaults in PaperGenerateRules / paper-generate.ts, no extra form components
- User browser rule — Kind I/II/III defaults; generated Đề Phần III tự động 5 SHORT_ANSWER, 15 min, Elo 1200–3000
- User git rule — do not commit unless asked

### Outcome

- All Phase 33 tasks marked `[x]`
- `npm test` passed (15); `PaperGenerateRulesTest` passed
- Planned commit: `feat(papers): generate by TS10 exam part`

## Phase 34: Generate Part II Groups

**Status:** completed

### Work

- Generate Phần II now picks complete groups of 4 TRUE_FALSE items (ý a–d) instead of single statements
- Paper items get `groupKey` `II.n` and labels `II.na`–`II.nd` so take-exam shows one stem and 4 Đúng/Sai radios
- `completePartTwoGroups` drops incomplete groups and dedupes by questionId (JOIN FETCH choices had cartesian-duplicated rows)
- Browser check: generated paper with count 2 → 8 items; attempt shows Câu 1/2 with II.1a–d

### User prompts

1. > tôi generate Phần II thì phải có 4 ý chọn chứ

### Skills used

- identity
- project-todo

### Rules used

- project-todo.mdc
- identity.mdc
- karpathy-guidelines.mdc

### Outcome

- All Phase 34 tasks marked `[x]`
- Take-exam for a new Phần II paper shows 4 ý a–d per câu
- Planned commit: `feat(papers): generate Part II as 4-item groups`

## Phase 35: AI Practice Paper Flow

**Status:** completed

### Work

- AI practice form caps question count at 99 and sets duration to count × 2.5 (read-only)
- Backend `AiPracticeRules` computes the same duration and, for TRUE_FALSE seeds, generates 4 ý a–d per câu with `groupKey` and Đúng/Sai choices
- Submitting "AI practice paper" creates the paper, starts an attempt, and redirects to take-exam
- Browser: count 2 → duration 5; attempt shows Câu 1/2 with II.1a–d Đúng/Sai

### User prompts

1. > http://localhost:3000/papers/ai
   > - Question count: điền dưới 100
   > - Duration (minutes): = question count * 2.5
   > - Generate ra câu hỏi đúng sai thì phải đủ 4 ý chọn đúng sai
   > - Bấm "AI practice paper" thì phải vào làm đề luôn

### Skills used

- identity
- project-todo
- git-auto-commit-push

### Rules used

- project-todo.mdc
- identity.mdc
- karpathy-guidelines.mdc
- agent-auto-git.mdc

### Outcome

- All Phase 35 tasks marked `[x]`
- Frontend tests passed (17); `AiPracticeRulesTest` and `HeuristicExamAiClientTest` passed
- Browser: generate with count 2 opened `/attempts/...` with 4 ý a–d per câu
- Planned commit: `feat(ai): start practice paper and group true/false items`
