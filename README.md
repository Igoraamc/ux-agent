# ux-agent

An AI-powered autonomous UX testing agent that uses Claude API and Playwright to evaluate user flows through visual element detection and real-time streaming feedback.

## How It Works

1. User provides a URL, flow description in natural language, and expected result
2. Agent navigates to the URL and takes a screenshot
3. Playwright detects all interactive elements (buttons, links, inputs, etc.)
4. Agent annotates the screenshot with numbered red boxes around each element
5. Annotated screenshot + element data is sent to Claude API
6. Claude analyzes the screen and decides the next action using tool use
7. Agent executes the action (click, type, scroll, etc.) via Playwright
8. Process repeats until flow completes, fails, or hits 15-step limit
9. All steps stream to frontend in real-time via Server-Sent Events (SSE)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | TypeScript, Hono, Playwright, Sharp, Drizzle ORM, SQLite |
| Frontend | SvelteKit, Tailwind CSS, shadcn-svelte |
| AI | Claude API with tool use |
| Streaming | Server-Sent Events (SSE) |
| Runtime | Bun (package manager) + Node/tsx (runtime)* |

*Playwright has compatibility issues with Bun runtime on Windows

## Project Structure

```
ux-agent/
├── backend/          # Hono API server
├── frontend/         # SvelteKit app (planned)
└── README.md
```

See component READMEs for details:
- [Backend](./backend/README.md)

## Quick Start

### Prerequisites

- Node.js 18+
- Bun (for package management)

### Installation

```bash
cd backend
bun install
npx playwright install chromium
```

### Running

```bash
cd backend
bun run dev
```

## Architecture

### Three-Phase Updates Per Step

Each step shows three phases to the user for granular UX feedback:

| Phase | Description |
|-------|-------------|
| Thinking | Claude's reasoning about what to do |
| Acting | The action being executed |
| Result | Outcome of the action |

This provides clear visibility into agent behavior while keeping costs low (1 API call per step).

### Execution Modes

| Mode | Behavior |
|------|----------|
| Autonomous | Runs full test without pauses |
| Supervised | Shows each step with brief delay before continuing |
| Manual | Waits for user approval before each action |

## Security Overview

The agent has browser access, so multiple security layers are implemented:

- **URL Blocklist** - Blocks local networks, cloud metadata, dangerous protocols
- **Domain Lock** - Agent stays within the starting domain
- **Action Allowlist** - Only safe actions (click, type, scroll, wait)
- **Prompt Validation** - Checks for injection attempts

See [Backend README](./backend/README.md) for detailed security implementation.

## Status

### Implemented

- Playwright browser manager
- Interactive element detection
- Unique selector generation
- Screenshot annotation with numbered badges
- URL blocklist and domain lock security

### Next Steps

- Claude tool use integration
- Agent loop implementation
- SSE streaming
- Database schema + persistence
- Frontend UI

## License

MIT
