# Project Todo Management

## Purpose

Manage project development through a root-level `todo.md` file and a per-phase `IDENTITY.md` collaboration log.

## When Starting a Project

Check whether `todo.md` exists.

If it does not exist:

1. Analyze the project requirements.
2. Identify major phases.
3. Break each phase into small executable tasks.
4. Create `todo.md`.
5. Create `IDENTITY.md` at the project root with the same phase headings. Follow the `identity` skill.
6. If the project persists data, create `ERD.md` at the project root before any database, entity, or migration work. Follow the `erd` skill.
7. Order tasks according to their dependencies.

Do not begin implementation before creating the initial `todo.md` and `IDENTITY.md`.

Do not implement schema, ORM entities, repositories, or migrations before `ERD.md` exists, unless the project has no persistent data or the user asks to skip the ERD.

## Project Folder Structure

When creating a new project, create application folders at the project root based on what the user requested:

- Frontend only → create a `Frontend` folder
- Backend only → create a `Backend` folder
- Both backend and frontend → create both `Frontend` and `Backend` folders

Do not create a folder the user did not request.

Add a corresponding setup task in Phase 1 of `todo.md` for each folder that is required.

Create `IDENTITY.md` at the project root after `todo.md`. Do not put "create IDENTITY.md" as a later task; update it during each phase.

If the project persists data, create `ERD.md` at the project root after `todo.md` and before Phase 2 implementation. Do not put "create ERD.md" as a later database task; the file must already exist.

Example:

- User asks for a frontend app → Phase 1 includes `Create Frontend folder` and frontend setup tasks only.
- User asks for a backend app → Phase 1 includes `Create Backend folder` and backend setup tasks only.
- User asks for both → Phase 1 includes creating both `Frontend` and `Backend` folders.

## Example

For a Japanese vocabulary learning application:

# TODO

## Phase 1: Project Setup

- [ ] Initialize Spring Boot backend
- [ ] Configure project dependencies
- [ ] Configure application properties

## Phase 2: Database

- [ ] Create database
- [ ] Configure database connection
- [ ] Create Vocabulary entity from ERD.md
- [ ] Create VocabularyRepository

## Phase 3: Vocabulary

- [ ] Create VocabularyService
- [ ] Create VocabularyController
- [ ] Implement create vocabulary API
- [ ] Implement update vocabulary API
- [ ] Implement delete vocabulary API
- [ ] Implement vocabulary list API

## Phase 4: Testing

- [ ] Test vocabulary APIs
- [ ] Test validation
- [ ] Test error handling

## During Development

Always read `todo.md` before starting a task.

Select the next incomplete task.

Implement only the selected task.

After implementation:

1. Run validation.
2. Fix validation errors.
3. Mark the task as completed in `todo.md`.
4. Append the driving user prompt and work notes to the current phase in `IDENTITY.md`.
5. If the current phase still has incomplete tasks (`[ ]`), continue with the next incomplete task. Do not commit or push yet.
6. If every task in the current phase is `[x]` or `[~]`, finish that phase in `IDENTITY.md`, then commit and push the completed phase, then continue to the next phase.

## Phase Git Integration

Do not commit or push after each individual task.

Commit and push only when a phase is complete.

A phase is complete when every task under that phase heading is `[x]` or `[~]`.

When a phase is complete:

1. Confirm every task in that phase is marked `[x]` or `[~]` in `todo.md`.
2. Fill Work, Skills used, Rules used, and Outcome for that phase in `IDENTITY.md`.
3. Inspect the changes for that phase.
4. Run relevant validation.
5. Stage only files related to the completed phase, including `todo.md` and `IDENTITY.md`.
6. Create one Conventional Commit for the phase.
7. Push to the current Git branch.
8. Continue to the next incomplete phase.

Example:

Phase 3: Vocabulary is complete.

Commit:

feat(vocabulary): complete vocabulary phase

The `todo.md` and `IDENTITY.md` updates for that phase belong in the same commit.

Do not start the next phase until the completed phase has been committed and pushed.

## Task Status

Use:

- [ ] Not started
- [x] Completed
- [~] Blocked or no longer required

## Task Granularity

Tasks should be small and focused.

Good:

- [ ] Create Vocabulary entity
- [ ] Create VocabularyRepository
- [ ] Create VocabularyService
- [ ] Add vocabulary creation API

Bad:

- [ ] Build entire vocabulary feature

## Changes to Requirements

If the user adds a new requirement:

1. Add the requirement to `todo.md`.
2. Place it in the appropriate phase.
3. If a new phase was added, add the matching section to `IDENTITY.md`.
4. Implement it according to task order.

Do not silently remove existing tasks.

## Completion Rule

Never claim a task is complete unless:

- The implementation exists.
- Relevant validation passes.
- The task is marked `[x]`.

Never claim a phase is complete unless:

- Every task in that phase is `[x]` or `[~]`.
- That phase in `IDENTITY.md` has Work, prompts, skills, rules, and Outcome filled.
- Relevant validation for the phase passes.
- The phase changes are committed.
- The commit has been pushed successfully.