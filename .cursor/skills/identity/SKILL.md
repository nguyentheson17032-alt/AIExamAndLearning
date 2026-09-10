---
name: identity
description: Creates and maintains IDENTITY.md, a per-phase log of work done, user prompts, skills, and rules. Use when starting a project, completing a todo.md phase, recording prompts, or when the user mentions IDENTITY.md, nhật ký phase, collaboration log, or which skills/rules were used.
---

# IDENTITY.md

Create `IDENTITY.md` at the project root when creating `todo.md`. Keep it in sync with each phase.

This file records how the user and the AI worked through the project. It is not an authentication Identity module.

## When to Create

Create `IDENTITY.md` when:

- Starting a new project that has `todo.md`
- `todo.md` exists but `IDENTITY.md` is missing

Skip only when the user asks to skip it.

## When to Update

1. **New user prompt** that drives the current phase → append it under that phase's User prompts.
2. **Phase complete** (every task `[x]` or `[~]`) → fill Work, Skills used, Rules used, and Outcome before the phase commit.
3. **New phase added to `todo.md`** → add a matching empty section.

Do not rewrite completed phases unless correcting a factual error.

## Workflow

1. Read `todo.md` and copy its phase headings.
2. Write `IDENTITY.md` with Project plus one section per phase.
3. During a phase, append each driving user prompt.
4. When the phase is done, record work, skills, rules, and the planned commit message in Outcome.
5. Include `IDENTITY.md` in that phase's commit. Do not wait for the git hash; omit it unless already known.

## Required Sections

Write `IDENTITY.md` with these sections in order:

1. `# IDENTITY`
2. `## Project` — name, started date, short goal
3. One `## Phase N: ...` block per `todo.md` phase, using the same titles

Each phase block:

```markdown
## Phase 1: Project Setup

**Status:** pending

### Work

### User prompts

### Skills used

### Rules used

### Outcome
```

Status values: `pending` | `in progress` | `completed` | `skipped`

## How to Fill a Phase

### Work

Bullet what the user and the AI actually did in this phase. Align with completed `todo.md` tasks. Be specific.

Good:

- Created Backend folder and Spring Boot 3 project
- Added User entity, repository, and Flyway migration

Bad:

- Completed the phase
- Did backend work

### User prompts

Record the user's messages that drove this phase, in the original language, in order.

- Short prompt: quote it in a blockquote.
- Long prompt (over ~20 lines): quote the request and key constraints; do not paste huge logs or file dumps.

```markdown
### User prompts

1. > làm backend Spring Boot với JWT login
2. > thêm entity User theo ERD.md
```

### Skills used

List each skill that was **read or followed** in this phase. Use the skill `name`. One line each: name, then what it was used for.

Do not list unused available skills.

```markdown
### Skills used

- `project-todo` — created and updated todo.md
- `erd` — wrote ERD.md before schema work
- `spring-data-jpa` — User entity and repository
```

### Rules used

List each rule that **materially constrained** this phase. Use the `.mdc` filename.

Do not dump every always-apply rule. Include a rule only if it changed what you created, skipped, committed, or how you structured the work.

```markdown
### Rules used

- `project-todo.mdc` — phase task order and todo.md updates
- `erd.mdc` — ERD.md before entities
- `springboot.mdc` — Java/Spring conventions
- `agent-auto-git.mdc` — commit only after the phase
```

### Outcome

- Tasks completed or skipped, matching `todo.md`
- Validation that ran
- Phase commit message (hash only if already known; do not amend to add it)

```markdown
### Outcome

- All Phase 1 tasks marked `[x]`
- `mvn test` passed
- Commit: `feat(setup): complete project setup phase`
```

## Project Start Template

```markdown
# IDENTITY

Log of user–AI collaboration per `todo.md` phase: work done, user prompts, skills, and rules.

## Project

- Name:
- Started: YYYY-MM-DD
- Goal:

## Phase 1: Project Setup

**Status:** pending

### Work

### User prompts

### Skills used

### Rules used

### Outcome
```

Add further phase sections to match `todo.md`.

## Rules

- One file: `IDENTITY.md` at the project root.
- Phase titles must match `todo.md`.
- Record prompts in the user's original wording when practical.
- List only skills and rules that were actually used.
- Update the current phase before committing that phase.
- `IDENTITY.md` belongs in the same commit as the completed phase.
