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

## Releases

Releases are driven by `release/v<semver>` branches, not Git tags. The version after `release/v` selects the dist-tag used on npm and GitHub Packages:

| Version          | Dist-tag |
| ---------------- | -------- |
| `1.2.3`          | `latest` |
| `1.2.3-alpha.1`  | `alpha`  |
| `1.2.3-beta.1`   | `beta`   |
| `1.2.3-rc.1`     | `rc`     |
| Other prerelease | `next`   |

The branch version must exactly match the `version` declared by every publishable package under `packages/*/package.json`. The workflow verifies this before installing dependencies and stops with an error if any package disagrees.

Create a branch such as `release/v1.2.3` or `release/v1.2.3-beta.1`. Branch names use lowercase letters, digits, hyphens, and dots only. The version after `release/v` must be valid semver and match every publishable package; CI rejects branches that don't.

Pushing the release branch builds and publishes all publishable workspaces to npm and GitHub Packages. Publishing is never triggered by Git tags.

## Editor setup

Formatting and linting are enforced by OXC. Editor settings are in `.editorconfig`.

- **Zed:** `.zed/settings.json` auto-installs the EditorConfig extension (by Peter Tripp).
- **VS Code:** `.vscode/extensions.json` recommends the EditorConfig extension.
