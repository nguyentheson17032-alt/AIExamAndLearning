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

## Phase 15: Exam Set Schema

- [x] Update ERD.md with PAPER_SET and paper question sections
- [x] Add Flyway migration for paper_sets and paper section columns
- [x] Create PaperSet entity and repository
- [x] Extend Paper and PaperQuestion for set membership and sections

## Phase 16: Exam Set Backend

- [x] Add PaperSet list and detail APIs
- [x] Grade TS10 papers on a 10-point scale (MCQ auto, đúng/sai group scale, short answer AI)
- [x] Apply Elo using score divided by 10
- [x] Add graded-attempt solution review API

## Phase 17: TS10 2025-2026 Import

- [x] Extract 30 exams from the Word file into import JSON
- [x] Import the exam set as published papers with parts I–III
- [x] Seed the exam set when the database is empty

## Phase 18: Sequential Exam Frontend

- [x] Add exam-set list and exam-list pages
- [x] Take an exam one part and one question at a time with Next
- [x] Add answer input and submit for AI/auto grading
- [x] Show detailed solutions after the exam is finished

## Phase 19: Restore TS10 Equation Content

- [x] Fix extractor so Part I/II/III question numbers do not overwrite each other
- [x] Extract MathType equation images into question stems
- [x] Render equation images in the take-exam and solution UI
- [x] Re-import the exam set so the database matches the restored JSON

## Phase 20: TS10 Full Question Snapshots

- [x] Capture each TS10 question (stem and options) as a PNG from the Word file
- [x] Reference snapshot images in the import JSON
- [x] Show the full question image in take-exam and solutions
- [x] Re-import the exam set so the database uses the snapshots

## Phase 21: Solution Snapshots and Score Elo

- [x] Capture each TS10 lời giải as a PNG from the PDF
- [x] Reference solution snapshots in the import JSON
- [x] Show the solution image and a letter-only Bài làm on the solutions page
- [x] Add exam score to Elo and refresh the header rating
- [x] Re-import the exam set so explanations use the snapshots

## Phase 22: Score Elo and Unused Images

- [x] Add Elo from the awarded exam score, not a fixed +9
- [x] Delete unused WMF images under frontend/public/ts10
- [x] Strip leftover image markers from the TS10 import JSON

## Phase 23: Missing Attempt Redirect

- [x] Send deleted attempt URLs back to the attempts list

## Phase 24: Scoring Rank Elo Map

- [x] Write SCORING.md mapping grading, rank, and Elo source files

## Phase 25: Expired Session Refresh

- [x] Refresh expired access tokens in a route handler that can set cookies
- [x] Redirect unauthorized API calls instead of throwing a runtime overlay

## Phase 26: Exam-Set Elo Lock

- [x] Hide AI Elo adjustment on exam-set attempts
- [x] Reject AI Elo adjustment for papers in a set
- [x] Document that exam-set Elo stays score-based
- [x] Remove AI Elo adjustment from the attempt result page

## Phase 27: Subject Exam Sets

- [x] List exam sets for a subject on the subject detail page
- [x] Show the 30 TS10 papers when opening Toán

## Phase 28: Subject-First Exam Sets

- [x] Subjects → Toán shows the exam set card only
- [x] Opening the set lists all 30 papers
- [x] Remove the /exam-sets list from navigation

## Phase 29: Subject Page Cleanup

- [x] Hide Topics on the subject detail page
- [x] Remove the Bộ đề heading on the subject detail page

## Phase 30: Hydration-Safe Dates

- [x] Add formatDateTime with a fixed locale and timezone
- [x] Use formatDateTime on attempts and rank pages
- [x] Add formatDateTime tests

## Phase 31: Store TS10 Snapshots in Database

- [x] Update ERD.md with QUESTION_IMAGE and question image FKs
- [x] Add Flyway migration, QuestionImage entity, and repository
- [x] Seed TS10 snapshot PNGs into the database when importing the exam set
- [x] Add authenticated GET API for question images
- [x] Render take-exam and solutions images from the API
- [x] Add tests for snapshot filename parsing and the image API

## Phase 32: Complete Answers Before Submit

- [x] Block submit until every question on the paper has an answer
- [x] Show a progress box of answered and unanswered questions on take-exam
- [x] Add tests for completeness and question nav items
- [x] Submit from React answer state so hidden questions are not dropped

## Phase 33: Generate by Exam Part

- [x] Add generate defaults for Phần I/II/III (count max 99, duration, Elo)
- [x] Update generate form Kind options and auto duration/Elo
- [x] Filter generated papers by question type for the selected part
- [x] Assign TS10 question Elo by part so the default ranges match
- [x] Add tests for generate defaults

## Phase 34: Generate Part II Groups

- [x] Pick complete Phần II groups of 4 ý a–d when generating
- [x] Keep groupKey so take-exam shows 4 Đúng/Sai
- [x] Add tests for grouping 4 items

## Phase 36: Bank Practice and True/False Grading

- [x] Pick AI practice questions at random from the published bank
- [x] Keep TRUE_FALSE practice items in complete 4-ý groups
- [x] Show the correct choice on solutions, not a mismatched answerKey
- [x] Add tests for bank units and complete TRUE_FALSE groups

## Phase 37: Practice Paper Nav Order

- [x] Order AI practice items by Phần I, then II, then III
- [x] Label items I.n, II.na–d, and III.n without duplicate numbers
- [x] Show one progress chip per câu, not one per ý
- [x] Add tests for section order and nav labels

## Phase 38: Exam Countdown

- [x] Show remaining time from the attempt start and paper duration
- [x] Flash the screen red through the last minute
- [x] Auto-submit when time runs out, including unanswered questions
- [x] Accept partial answers on the server only at the deadline
- [x] Add tests for the countdown and the deadline rule

## Phase 39: Clock Warning

- [x] Pulse only the countdown card lightly in red during the last minute
- [x] Remove the full-screen red flash

## Phase 40: Paper Groups

- [x] Split the papers page into tuyển sinh, TNTHPT, practice, and question
- [x] Classify papers from kind and exam-set title
- [x] Add tests for the four groups

## Phase 41: Paper Group Cards

- [x] Show tuyển sinh, TNTHPT, practice, and question as subject-style cards
- [x] Open a group only after its card is clicked

## Phase 42: Paper Update Order

- [x] Order each paper group by the earliest update
- [x] Label that order Đề số 1 through Đề số n+1
