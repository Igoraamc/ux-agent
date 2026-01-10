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
| AI | Claude API (claude-haiku-4-5) with tool use |
| Streaming | Server-Sent Events (SSE) |
| Logging | Pino with pino-pretty (dev) |
| Testing | Bun test |
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
- Anthropic API key

### Installation

```bash
cd backend
bun install
npx playwright install chromium
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
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

### Agent Tools

The Claude agent can perform these actions:

| Tool | Description |
|------|-------------|
| click | Click on an element by index |
| type | Type text into an input field |
| scroll | Scroll the page up, down, or to top |
| wait | Wait for content to load |
| done | Mark test as complete |
| fail | Mark test as failed with reason |

## Security Overview

The agent has browser access, so multiple security layers are implemented:

- **URL Blocklist** - Blocks local networks, cloud metadata, dangerous protocols
- **Domain Lock** - Agent stays within the starting domain
- **Action Allowlist** - Only safe actions via Claude tool definitions
- **Prompt Validation** - Checks for injection attempts
- **System Prompt Guardrails** - Claude instructed to refuse data extraction

See [Backend README](./backend/README.md) for detailed security implementation.

## Status

### Implemented

- Playwright browser manager with adapter pattern
- Interactive element detection
- Unique selector generation
- Screenshot annotation with numbered badges
- URL blocklist and domain lock security
- Claude agent with tool use integration
- Agent tools (click, type, scroll, wait, done, fail)
- Prompt validation and injection detection
- System prompt with security guardrails
- Agent loop with action execution
- Hono API server with SSE streaming
- Database schema + persistence (SQLite + Drizzle)
- API Endpoints:
    - `POST /run` - Start agent run
    - `GET /runs` - List runs
    - `GET /runs/:id` - Get run details
    - `GET /runs/:id/steps/:stepNumber` - Get step details

### Next Steps

- Frontend UI

### Recently Completed

- Scroll to top action (scroll direction: "top")
- Structured logging with Pino
- Unit tests with Bun test (93 tests)

## License

MIT
