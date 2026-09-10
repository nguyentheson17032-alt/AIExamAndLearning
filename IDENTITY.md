# IDENTITY

Log of user–AI collaboration per `todo.md` phase: work done, user prompts, skills, and rules.

## Project

- Name: AI Exam Warehouse
- Started: 2026-09-11
- Goal: Backend kho điểm thi — upload/ra đề, luyện theo Elo, và AI chấm/xếp hạng/sinh đề

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
