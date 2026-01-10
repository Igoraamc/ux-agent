# CLAUDE.md - AI Assistant Guide for ux-agent

## Project Overview

**ux-agent** is an AI-powered autonomous UX testing agent that uses Claude API and Playwright to evaluate user flows through visual element detection.

### How It Works

1. User provides URL, flow description, and expected result
2. Agent navigates and takes annotated screenshots
3. Claude analyzes the screen and decides the next action
4. Agent executes the action via Playwright
5. Process repeats until flow completes, fails, or hits step limit

### Project Status

**Active Development**: Core browser automation, element detection, screenshot annotation, Claude integration, agent loop, API with SSE streaming, database persistence, logging, and unit testing implemented. Frontend pending.

## Repository Structure

```
ux-agent/
├── backend/
│   ├── src/
│   │   ├── agent/
│   │   │   ├── annotator.ts        # Screenshot annotation with Sharp
│   │   │   ├── executor.ts         # Action execution logic
│   │   │   ├── loop.ts             # Agent loop orchestration
│   │   │   └── persistence.ts      # Database persistence
│   │   ├── ai/
│   │   │   ├── actions.ts          # Action type definitions
│   │   │   ├── claude.ts           # Claude API client
│   │   │   ├── guardrails/
│   │   │   │   └── input.ts        # Prompt validation
│   │   │   ├── prompts.ts          # System prompt
│   │   │   └── tools.ts            # Tool definitions
│   │   ├── browser/
│   │   │   ├── browser-service.ts  # Service layer with domain lock
│   │   │   ├── detector.ts         # Element detection
│   │   │   ├── playwright.ts       # Playwright adapter
│   │   │   ├── selectors.ts        # Selector generation
│   │   │   └── types.ts            # Browser adapter interface
│   │   ├── db/
│   │   │   ├── index.ts            # Database client
│   │   │   └── schema.ts           # Drizzle schema
│   │   ├── lib/
│   │   │   └── logger.ts           # Pino logger setup
│   │   ├── middleware/
│   │   │   └── request-logger.ts   # HTTP request logging
│   │   ├── routes/
│   │   │   ├── index.ts            # Route aggregator
│   │   │   ├── agent.ts            # Agent run endpoint with SSE
│   │   │   └── runs.ts             # Run history endpoints
│   │   ├── types/
│   │   │   └── index.ts            # Shared types
│   │   ├── utils/
│   │   │   ├── uuid.ts             # UUID v7 generation
│   │   │   └── validate.ts         # URL validation
│   │   └── index.ts                # Server entry point
│   ├── .env.example                # Environment template
│   ├── package.json
│   └── README.md
├── frontend/                       # SvelteKit (planned)
├── CLAUDE.md
└── README.md
```

## Technology Stack

- **Runtime**: Node.js with tsx
- **Package Manager**: Bun
- **Language**: TypeScript (strict mode)
- **Browser Automation**: Playwright
- **Image Processing**: Sharp
- **AI**: Anthropic Claude API (claude-haiku-4-5)
- **Web Framework**: Hono with @hono/node-server
- **Database**: Drizzle ORM + SQLite
- **Logging**: Pino with pino-pretty (dev)
- **Testing**: Bun test

## Key Files

### AI Layer (`/backend/src/ai/`)

#### `claude.ts`
Claude API client factory. Creates agent that analyzes screenshots and returns next action.

```typescript
const agent = createClaudeAgent();
await agent.getNextAction(screenshot, elements, flowDescription, expectedResult);
```

#### `tools.ts`
Tool definitions for Claude:
- `click` - Click element by index
- `type` - Type into input field
- `scroll` - Scroll up/down/top
- `wait` - Wait for content
- `done` - Mark test complete
- `fail` - Mark test failed

#### `actions.ts`
TypeScript types for agent actions:
```typescript
type AgentAction = ClickAction | TypeAction | ScrollAction | WaitAction | DoneAction | FailAction;
```

#### `prompts.ts`
System prompt with strict security rules for the agent.

#### `guardrails/input.ts`
Validates user prompts before sending to Claude. Blocks:
- Prompts over 10,000 characters
- Injection patterns (`ignore instructions`, `export cookies`, etc.)

### Browser Layer (`/backend/src/browser/`)

#### `browser-service.ts`
High-level browser service with:
- URL validation before navigation
- Domain lock (stays on starting domain)
- Delegates to adapter for actual browser operations

#### `playwright.ts`
Playwright adapter implementing `BrowserAdapter` interface:
- `initialize()` - Launch Chromium
- `goto(url)` - Navigate to URL
- `screenshot()` - Capture page
- `getInteractiveElements()` - Detect elements
- `click(selector)` - Click an element
- `type(selector, text)` - Type into an input
- `scroll(direction)` - Scroll up/down/top
- `waitForLoadState()` - Wait for network idle
- `close()` - Cleanup

#### `detector.ts`
Finds interactive elements on the page and extracts:
- Unique selector
- Tag name
- Text content
- Bounding box
- Attributes

#### `selectors.ts`
Generates unique CSS selectors in priority order:
1. ID
2. data-testid
3. name
4. href
5. Text content

#### `types.ts`
`BrowserAdapter` interface for dependency injection.

### Agent Layer (`/backend/src/agent/`)

#### `annotator.ts`
Draws red boxes and numbered badges on screenshots using Sharp SVG overlays.

#### `loop.ts`
Agent loop orchestration. Runs the test flow until completion, failure, or step limit.

```typescript
const result = await runAgentLoop(url, flowDescription, expectedResult, onStepUpdate);
// result: { success, steps, summary, error? }
```

Key features:
- 15-step maximum limit
- Three-phase updates per step (thinking, acting, result)
- Action history passed to Claude for context
- Handles terminal actions (done/fail)

### API Layer (`/backend/src/routes/`)

#### `index.ts`
Route aggregator. Mounts all routes and provides health check endpoint.

#### `agent.ts`
Agent run endpoint with SSE streaming.

```typescript
POST /run
// Request: { url, flowDescription, expectedResult }
// Response: SSE stream with events: start, step, complete
```

### Server (`/backend/src/index.ts`)

Entry point. Sets up Hono app with CORS and routes, starts Node.js server.

### Utils (`/backend/src/utils/`)

#### `validate.ts`
URL blocklist validation. Blocks local networks, cloud metadata, dangerous protocols, etc.

## Code Patterns

### Factory Pattern
```typescript
export function createBrowser() {
  let browser: Browser | null = null;
  return {
    async initialize() { /* ... */ },
    async close() { /* ... */ }
  };
}
```

### Adapter Pattern
```typescript
interface BrowserAdapter {
  initialize(): Promise<void>;
  goto(url: string): Promise<void>;
  screenshot(path?: string): Promise<Buffer>;
  close(): Promise<void>;
  getInteractiveElements(): Promise<DetectedElement[]>;
  click(selector: string): Promise<void>;
  type(selector: string, text: string): Promise<void>;
  scroll(direction: "up" | "down" | "top"): Promise<void>;
  waitForLoadState(): Promise<void>;
}
```

### Service Layer
```typescript
function createBrowserService(adapter: BrowserAdapter) {
  // Adds validation and domain lock on top of adapter
}
```

## Development

### Setup
```bash
cd backend
bun install
npx playwright install chromium
cp .env.example .env
# Add ANTHROPIC_API_KEY to .env
```

### Run
```bash
bun run dev        # Watch mode
bun run start      # Production mode
bun run screenshot # Test script
bun test           # Run unit tests
bun test --watch   # Watch mode for tests
```

### Environment Variables
```
ANTHROPIC_API_KEY=   # Required
LOG_LEVEL=debug      # Optional (debug, info, warn, error)
NODE_ENV=development # Optional (development, production)
```

## Code Conventions

- ESM modules with `.js` extension in imports
- Strict TypeScript
- Factory functions for stateful modules
- Pure functions for utilities
- Types in `/backend/src/types/`

### Imports
```typescript
// External
import { chromium } from 'playwright';

// Internal (always .js extension)
import { validateUrl } from '../utils/validate.js';
import type { DetectedElement } from '../types/index.js';
```

### Commits
Format: `<type>(<scope>): <description>`
```
feat(backend): add claude integration
fix(browser): handle navigation timeout
```

## Security Layers

1. **URL Blocklist** - Blocks dangerous URLs before navigation
2. **Domain Lock** - Prevents cross-domain navigation
3. **Tool Allowlist** - Only safe actions exposed to Claude
4. **System Prompt** - Instructs Claude to refuse malicious requests
5. **Prompt Validation** - Blocks injection attempts in user input

## Pending Implementation

- [x] Agent loop (iterate until done/fail/limit)
- [x] Action execution (click, type, scroll, wait)
- [x] SSE streaming for real-time updates
- [x] Hono API endpoints
- [x] Database persistence with Drizzle
- [x] Scroll to top action
- [x] Logging with Pino
- [x] Unit tests with Bun test
- [ ] Frontend UI

## Quick Reference

| Task | Location |
|------|----------|
| Add new tool | `/backend/src/ai/tools.ts` |
| Modify system prompt | `/backend/src/ai/prompts.ts` |
| Add action type | `/backend/src/ai/actions.ts` |
| Add element selector | `/backend/src/browser/selectors.ts` |
| Add URL block pattern | `/backend/src/utils/validate.ts` |
| Add prompt block pattern | `/backend/src/ai/guardrails/input.ts` |
| Modify agent loop | `/backend/src/agent/loop.ts` |
| Add API route | `/backend/src/routes/` |
| Modify server config | `/backend/src/index.ts` |
| Configure logging | `/backend/src/lib/logger.ts` |
| Add HTTP middleware | `/backend/src/middleware/` |
| Add unit tests | `*.test.ts` files next to source |
