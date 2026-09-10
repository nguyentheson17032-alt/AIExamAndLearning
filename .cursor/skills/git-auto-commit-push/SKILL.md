# Git Auto Commit Push

## Purpose

Automatically commit and push completed work.

When `todo.md` exists, commit and push only after a phase is complete (every task in that phase is `[x]` or `[~]`). Fill that phase in `IDENTITY.md` before committing. Do not commit after each individual task.

When work is not tracked as a `todo.md` phase, commit and push after the completed development step.

## Procedure

When a `todo.md` phase or a non-todo development step is complete:

### 1. Inspect

Run:

git status

git diff

Determine which files belong to the completed phase or step.

For a `todo.md` phase, include `todo.md` and `IDENTITY.md` with the phase files.

### 2. Validate

Run the project's relevant validation commands.

Examples:

mvn test

mvn clean verify

npm test

npm run build

Use the commands appropriate for the project.

### 3. Stage

Stage only files belonging to the completed phase or step.

Do not blindly use:

git add .

### 4. Commit

Generate a Conventional Commit message.

Format:

type(scope): description

Create the commit.

### 5. Push

Push the current branch to its configured GitHub remote.

If `git remote -v` is empty, or push fails because `origin` does not exist, create the repo first. Do not leave commits only on the local machine.

1. Confirm `gh auth status` succeeds. If it fails, stop and report the exact error.
2. Create the repo from the project folder name. Default private:

   `gh repo create <folder-name> --private --source=. --remote=origin --push`

   Use `--public` only when the user asked for a public repo.
3. If the repo was created without `--push`, add origin and push:

   `git remote add origin <url>`

   `git push -u origin HEAD`
4. If the name is already taken, stop and report the exact `gh` error. Do not invent a remote URL.

### 6. Verify

Confirm that the push succeeded and the current branch tracks `origin`.

Do not continue if the push failed.

## Safety

Never commit:

.env
.env.*
credentials
passwords
API keys
private keys
secrets

Never force push.

Never discard unrelated user changes.

Never amend an existing commit unless explicitly requested.

Never continue to another phase or development step after a failed commit or push.
