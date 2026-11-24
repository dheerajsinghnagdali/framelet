# Contributing to Framelet

Thanks for your interest! This project uses npm workspaces, TypeScript, OXC, and tsdown.

## Setup

```bash
git clone https://github.com/<org>/framelet.git
cd framelet
npm install
```

## Scripts

- `npm run typecheck` — TypeScript project build
- `npm run lint` — OXC lint
- `npm run format` / `npm run format:check` — OXC format
- `npm test` — Vitest
- `npm run build` — tsdown bundle all packages

## Commit convention

Use Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, …).

## Pull requests

- Keep changes focused.
- Add/update tests for behavior changes.
- Ensure all gates pass locally (pre-commit runs format + lint).

## Editor setup

Formatting and linting are enforced by OXC. Editor settings are in `.editorconfig`.

- **Zed:** `.zed/settings.json` auto-installs the EditorConfig extension (by Peter Tripp).
- **VS Code:** `.vscode/extensions.json` recommends the EditorConfig extension.
