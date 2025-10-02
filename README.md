# Operator Hub

A compact operations hub for managing multiple projects, their Git worktrees, and CLI-based coding agents (Codex CLI, Claude Code, OpenCode) from a single browser UI.

## Quick Start

Prereqs: Node 20+ and pnpm 9+.

```bash
# Install dependencies
pnpm install

# Build client + server and start the app
pnpm dev                      # http://127.0.0.1:3099

# Run tests (if present)
pnpm test
```

Notes
- The `dev` script performs a one-shot build (client via Rsbuild → `server-dist/web-dist`, server via Rslib → `server-dist`) and then starts the server. Re-run `pnpm dev` after code changes, or use the optional watch setup below.
- Default host/port can be changed via `HOST` and `PORT`. See Environment Variables.

### Optional: Faster inner loop (watch mode)
Open three terminals for live development:

```bash
# A: Client with HMR
rsbuild dev

# B: Server build in watch mode
rslib build --watch

# C: Node server with restart on server-dist changes
nodemon --watch server-dist server-dist/index.js
```

## Commands

| Command       | Description                                  | Default Port |
| ------------- | -------------------------------------------- | ------------ |
| `pnpm dev`    | Build client+server, start Node server        | 3099         |
| `pnpm test`   | Run tests via rstest                          | -            |

## Features

- 📂 Project & worktree control across many repos
- 🖥️ CLI agent sessions (Codex, Claude Code, OpenCode) bound to worktrees
- 🔄 Fast context switching between projects, worktrees, and terminals
- 🔌 WebSocket terminal streaming (PTY-backed) per session
- 🐙 GitHub integration view (issues, PRs, status) retained
- 🧱 shadcn/ui + Tailwind CSS v4 for consistent, dense UI

## Worktrees

Each project exposes its primary checkout as the `default` worktree. Additional worktrees let you:

- Launch isolated CLI coding agents per feature branch
- Run git/file automation in a dedicated directory
- Stage follow‑up changes without disturbing the primary checkout

Switch worktrees from the hub; CLI sessions inherit the selected worktree automatically.

## Architecture

Hono server serves the React app and exposes REST/WebSocket endpoints for CLI sessions.

```
Browser → Hono Server (Port 3099)
            ├── /                 → React Operations Hub
            ├── /api/*            → Projects, worktrees, git, GitHub, CLI sessions
            └── /ws/cli?token=…   → WebSocket stream for PTY terminals
```

### Development

- `pnpm dev` builds client+server once and starts the Node server.
- For HMR/watch, use the Optional watch setup above.

### Production

- Client assets are emitted to `server-dist/web-dist`
- Server output is emitted to `server-dist/index.js`
- Serve via `node server-dist/index.js` behind your process manager of choice

## Project Structure

```
src/
├── components/            # UI primitives & app chrome
├── features/              # High‑level UI modules
│   ├── cli/               # Terminal dock components
│   ├── projects/          # Project rail
│   └── worktrees/         # Worktree board
├── pages/                 # Routes
│   ├── OperationsHub.tsx  # Primary dashboard
│   └── GitHubIntegration.tsx
├── server/                # Hono server + API
│   ├── index.ts           # Entrypoint (health, static, mounting)
│   ├── cli-session-manager.ts
│   ├── cli-routes.ts
│   ├── integrated-project-routes.ts
│   └── project-manager.ts
├── stores/                # Zustand stores
└── util/                  # Shared utilities
```

## Routes

- `/` — Operations hub for projects, worktrees, and CLI sessions
- `/github` — Global GitHub integration dashboard (project optional)
- `/projects/:projectId/:worktreeId/github` — Worktree‑scoped GitHub view with automation actions

## API Endpoints

Health
- `GET /api/health` — Overall status
- `GET /api/health/ready` — Reports tool availability
- `GET /api/health/live` — Liveness probe

Projects & Worktrees
- `GET /api/projects` — List projects
- `POST /api/projects` — Register a project (path + optional name)
- `GET /api/projects/:id` — Get project metadata (including worktrees)
- `PATCH /api/projects/:id` — Update project properties
- `DELETE /api/projects/:id` — Remove from hub (does not delete files)
- `GET /api/projects/:id/worktrees` — List worktrees
- `POST /api/projects/:id/worktrees` — Create worktree (branch/base supported)
- `PATCH /api/projects/:id/worktrees/:worktreeId` — Update worktree metadata
- `DELETE /api/projects/:id/worktrees/:worktreeId` — Remove non‑default worktree

CLI Sessions
- `GET /api/cli/tools` — Enumerate available CLI tool presets
- `GET /api/cli/sessions` — List active CLI sessions (includes per‑session WS token)
- `POST /api/cli/sessions` — Launch a session bound to a project/worktree
- `DELETE /api/cli/sessions/:id` — Terminate a session

WebSocket
- `GET /ws/cli?token=…` — PTY stream for an existing session (token required)

## Technology Stack

- Runtime: Node.js (pnpm managed)
- Frontend: React 19 + TypeScript
- Server: Hono + WebSocket bridge (`ws`) + `node-pty`
- Build: Rsbuild (client) + Rslib (server)
- UI: shadcn/ui + Tailwind CSS v4
- State: Zustand + React Query
- Routing: React Router v7
- Terminal streaming: Native WebSockets bound to PTY streams

## Testing

Run the configured test runner (rstest):

```bash
pnpm test
```

For ad‑hoc checks, start the app and create a CLI session from the Operations Hub:

```bash
pnpm dev
# then open http://127.0.0.1:3099
```

## Environment Variables

Primary variables (see `docs/environment-variables.md` for full list):

- `PORT` — Server port (default: 3099)
- `HOST` — Server hostname (default: 127.0.0.1)
- `NODE_ENV` — Environment (`development`/`production`)
- `AGENT_ORANGE_CONFIG_DIR` — Config dir (default: `$HOME/.agent-orange`)
- `AGENT_ORANGE_TEST_MODE` — Enables test behaviors (default: `0`)

## Troubleshooting

### Port Already in Use

If you get a "port in use" error:

```bash
# Find process using port
lsof -i :3099

# Kill process
kill <PID>

# Or use a different port
PORT=3002 pnpm dev
```

### Build Issues

If the build fails:

```bash
# Clean and rebuild
rm -rf server-dist node_modules
pnpm install
pnpm dev
```

### CSS Not Loading

Tailwind CSS v4 runs via PostCSS during build; no manual step required.

## Documentation

- Environment variables: `docs/environment-variables.md`
- Architecture: `docs/architecture.md`
- Requirements & notes: `docs/requirements.md`

