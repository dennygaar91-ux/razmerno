# AGENTS.md

Practical rules for Codex agents working in the local repository of the Razmerno project.

## 1. Project Identity

- Project: Razmerno.
- Product: online constructor for cabinet furniture.
- User-facing communication language: Russian.
- Source of truth: GitHub repository plus `docs/planning/current-backlog.md`.
- Do not treat old ZIP archives as source of truth unless the user explicitly asks.

## 2. Current Priority Rules

- Do not mark tasks as closed without concrete evidence.
- An open PR, draft PR, or branch-only change is not closure evidence.
- A successful screenshot artifact is not visual closure by itself.
- A Three.js customer preview is not production truth.
- Basis JSON is not the same as `.b3d` generation.
- Main backlog file: `docs/planning/current-backlog.md`.
- Do not create new backlog files unless explicitly requested.

## 3. Must-Not-Touch Rules

- Do not modify GitHub issues.
- Do not use issue update tools.
- Do not change `package.json` or `package-lock.json` without separate explicit permission.
- Do not change `.github/**` workflows without separate explicit permission.
- Do not touch Pricing, API, Production, or UX areas outside the current task scope.
- Do not run `git add`, `git commit`, or `git push` without separate explicit permission.
- Do not run `git reset --hard` without separate explicit permission.
- Do not run `npm audit fix` or `npm audit fix --force`.
- Do not add production dependencies without separate explicit permission.
- Do not commit `node_modules/` or `dist/`.

## 4. Git Workflow

- Always run `git status` before starting work.
- Work only on `task/*`, `docs/*`, or other explicit feature branches.
- Do not work directly on `main`.
- Before editing, confirm the working tree is clean.
- After changes, report files changed and commands run.
- If a large unexpected diff appears, stop and ask.

## 5. Local Environment Notes

- Shell: Windows PowerShell.
- Local repository path is user-specific; run `pwd` / `Get-Location` instead of assuming a path.
- `node_modules` may be noisy locally on Windows; do not add it to diffs.
- Before and after build/test commands, check `git status`.
- If only `node_modules` appears modified, stop and ask before cleanup.

## 6. Standard QA Commands

Use QA commands according to task scope. Do not run every command automatically.

- `npm run` - inspect available scripts.
- `npm run build` - baseline required check for most PRs.
- Targeted scripts - run only when they match the task scope.
- `npm ci` - use only when dependencies are missing or broken.
- Do not run `npm install` unless the task explicitly requires dependency changes.

## 7. Active Backlog Focus

Current open or blocked focus areas from the backlog:

- P0-13 Pricing parity - open.
- P0-16 Reset contract - open.
- P0-17 Smoke test stabilization - open.
- P0-18 Constructor3D Architecture Guard - open.
- P0-19 Dependency Recovery - closed / disputed.
- P2-26 Visual QA follow-ups - open.
- Production Golden Snapshots - open / blocked.
- API notification failure contracts - open.

Do not close these tasks unless the task explicitly asks for that and closure evidence exists.

## 8. Reporting Format

Every Codex response after work should include:

- Summary.
- Files changed.
- Commands run.
- QA result.
- Risks.
- Not done.
- Next recommended step.

## 9. Token Efficiency Rules

- First read `AGENTS.md` and only the relevant section of `docs/planning/current-backlog.md`.
- Do not read the whole `docs/` directory unless necessary.
- Do not retell the whole project.
- Do not paste large files into responses.
- Give a short plan before edits.
- Avoid broad search unless necessary.
- Prefer targeted `rg` / grep / search.
- Stop when task scope is ambiguous.

## 10. Stop Conditions

Stop and ask before continuing if:

- The task requires changing `package.json` or `package-lock.json`.
- The task requires changing workflows.
- The task touches Pricing, API, and Production at the same time.
- The task requires closing or changing backlog status.
- A large diff appears.
- There is risk of affecting P0-13, P0-16, P0-17, or P2-26 outside the current scope.
- Codex needs to install a new dependency.
- Codex needs to modify GitHub issues.
