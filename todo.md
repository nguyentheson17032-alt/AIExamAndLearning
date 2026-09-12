# TODO

## Phase 1: Project Setup

- [x] Create Backend folder
- [x] Initialize Spring Boot 3 Maven project with Java 21
- [x] Configure dependencies (web, validation, JPA, Security, Flyway, PostgreSQL, Lombok, Spring AI, Testcontainers)
- [x] Configure application.yml with JWT, Elo, and AI typed properties
- [x] Add RFC 9457 exception handler and PageResponse
- [x] Add Maven Wrapper and a compile smoke test

## Phase 2: Database

- [x] Add Flyway migration for users and refresh_tokens
- [x] Add Flyway migration for subjects and topics
- [x] Add Flyway migration for questions, question_choices, and question_classifications
- [x] Add Flyway migration for papers and paper_questions
- [x] Add Flyway migration for attempts and attempt_answers
- [x] Add Flyway migration for elo_events and ai_generation_jobs
- [x] Create User and RefreshToken entities and repositories
- [x] Create Subject and Topic entities and repositories
- [x] Create Question, QuestionChoice, and QuestionClassification entities and repositories
- [x] Create Paper and PaperQuestion entities and repositories
- [x] Create Attempt and AttemptAnswer entities and repositories
- [x] Create EloEvent and AiGenerationJob entities and repositories

## Phase 3: Backend

- [x] Create catalog service for subjects and topics
- [x] Create question warehouse service (create, update, list, batch upload)
- [x] Create paper service for exams, assignments, and practice sets
- [x] Create attempt service with auto-grade for objective questions
- [x] Create Elo rating and rank service
- [x] Create practice matching service based on user Elo

## Phase 4: Authentication

- [x] Implement JwtProperties, JwtService, and JwtAuthenticationFilter
- [x] Implement SecurityConfig, PasswordEncoder, and UserDetailsService
- [x] Implement refresh-token rotation
- [x] Implement register, login, and refresh APIs
- [x] Add authentication unit tests

## Phase 5: API

- [x] Add subject and topic APIs
- [x] Add question CRUD and batch upload APIs
- [x] Add paper (exam, assignment, practice) APIs
- [x] Add attempt start and submit APIs
- [x] Add practice-by-Elo and user rank APIs
- [x] Add AI classify, grade, similar-question, practice-paper, and Elo APIs

## Phase 6: Testing

- [x] Add question service unit tests
- [x] Add attempt grading unit tests
- [x] Add Elo service unit tests
- [x] Add AI heuristic client unit tests
- [x] Add controller slice tests
- [x] Add authentication API tests

## Phase 7: Documentation

- [x] Write Backend README with run instructions and API overview

## Phase 8: Frontend Setup

- [x] Create Frontend folder
- [x] Initialize Next.js App Router with TypeScript
- [x] Configure backend API URL and server fetch client
- [x] Add app shell layout and global styles

## Phase 9: Frontend Authentication

- [x] Add login, register, and logout session cookies
- [x] Protect authenticated routes
- [x] Add login and register pages
- [x] Show current user in the app shell

## Phase 10: Catalog and Questions

- [x] Add subject list and create subject form
- [x] Add topic list and create topic form
- [x] Add question list, create, and detail pages
- [x] Add question batch upload page

## Phase 11: Papers and Practice

- [x] Add paper list, create, and generate pages
- [x] Add start-attempt and take-exam flow
- [x] Add attempt history and result pages
- [x] Add Elo practice session page
- [x] Add profile and rank page

## Phase 12: AI Features

- [x] Add AI classify and similar-question actions
- [x] Add AI practice-paper generation
- [x] Add AI Elo adjustment on graded attempts

## Phase 13: Frontend Testing

- [x] Add session helper tests
- [x] Add API error parsing tests

## Phase 14: Frontend Documentation

- [x] Write Frontend README with run instructions
