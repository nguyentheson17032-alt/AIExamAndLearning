# Exam Warehouse Frontend

Next.js App Router UI for the Spring Boot exam warehouse API.

## Stack

- Next.js 15, React 19, TypeScript
- Server Actions + httpOnly session cookies
- No React Query, SWR, or UI kit

## Run

1. Start PostgreSQL and the API (`Backend/`, port 8080).
2. Copy `.env.example` to `.env.local` if needed (`BACKEND_URL=http://localhost:8080`).
3. Install and start:

```bash
cd Frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Dev seed accounts (backend `--spring.profiles.active=dev`):

- `teacher@exam.local` / `Teacher123!`
- `student@exam.local` / `Student123!`

## Scripts

```bash
npm run dev
npm run build
npm test
```

## What it covers

- Register / login / logout with rotating refresh tokens
- Subjects and topics (teacher)
- Question bank, create, JSON upload, archive, AI classify/similar
- Papers: create, Elo generate, AI practice paper
- Start attempt, take exam, submit, results
- Elo practice sessions and rank history
