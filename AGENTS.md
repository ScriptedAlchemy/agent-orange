# Repository Guidelines

## Project Structure & Module Organization
- `src/server/` – Hono server, REST routes, CLI session manager, WebSocket bridge.
- `src/pages/` – Route-level React views (e.g., `OperationsHub.tsx`, `GitHubIntegration.tsx`).
- `src/components/` – UI primitives and layout (shadcn/ui + Tailwind v4).
- `src/features/` – Project/worktree/CLI feature modules.
- `test/` – Unit and integration tests (`test/**/*.test.ts[x]`).
- `docs/` – Architecture, env vars, requirements.
- Build output: `server-dist/` (Node server) and `server-dist/web-dist/` (client assets).

## Build, Test, and Development Commands
- `pnpm dev` – Build client (Rsbuild) + server (Rslib) and run at `http://127.0.0.1:3099`.
- `pnpm test` – Run tests via `@rstest/core` (jsdom for React tests).
- Optional watch: `rsbuild dev` (client HMR), `rslib build --watch` (server), and `nodemon --watch server-dist server-dist/index.js`.

## Coding Style & Naming Conventions
- TypeScript + ESM; 2‑space indentation; no semi‑exotic language features.
- Prefer named exports for modules; default exports only for config or pages.
- Files: kebab‑case (`integrated-project-routes.ts`); React components: PascalCase; hooks: `useX`.
- Keep functions small with explicit error handling; use the shared `Log` helper for server logs.
- Linting: ESLint 9 + `@typescript-eslint`; format consistently (Tailwind class sorting supported via Prettier plugin).

## Testing Guidelines
- Frameworks: `@rstest/core`, `@testing-library/react` (+ jest‑dom), jsdom env.
- Naming: `*.test.ts` (server) and `*.test.tsx` (client). Place under `test/` (e.g., `test/integration/...`).
- E2E under `test/e2e` is excluded by default; keep unit/integration tests deterministic and offline.

## Commit & Pull Request Guidelines
- Commit messages (Conventional-ish): `feat(ui): add terminal tabs`, `fix(server): handle WS token errors`.
- PRs must include: clear summary, rationale, screenshots for UI changes, and links to related issues.
- Keep diffs focused; update README/docs when changing routes, env vars, or commands.

## Security & Configuration Tips
- Do not commit secrets. Use env vars: `PORT`, `HOST`, `WS_SECRET`, `AGENT_ORANGE_CONFIG_DIR`, optional `GH_TOKEN`.
- Server restricts file operations to HOME/TMP; do not broaden without review.
- CLI tools are allow‑listed (`codex`, `claude`, `opencode`)—avoid arbitrary process spawns.

## Agent‑Specific Instructions
- Keep patches minimal and style‑consistent; avoid drive‑by refactors.
- If you add an endpoint or route, update types, README, and tests in the same PR.
