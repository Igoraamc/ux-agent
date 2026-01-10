# Backend

Hono-based API server for the UX testing agent.

## Setup

```bash
bun install
npx playwright install chromium
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
```

## Scripts

```bash
bun run dev         # Development mode with hot reload
bun run start       # Production mode
bun run screenshot  # Run screenshot example
bun run db:generate # Generate migrations
bun run db:migrate  # Run migrations
bun test            # Run unit tests
bun test --watch    # Watch mode for tests
```

## Project Structure

```
backend/
├── data/                   # SQLite database file
├── drizzle/                # Database migrations
├── src/
│   ├── agent/
│   │   ├── annotator.ts    # Draw numbered boxes on screenshots
│   │   ├── executor.ts     # Agent action execution logic
│   │   ├── executor.test.ts # Executor unit tests
│   │   ├── loop.ts         # Agent loop orchestration
│   │   └── persistence.ts  # Database persistence for runs and steps
│   ├── ai/
│   │   ├── actions.ts      # Action type definitions
│   │   ├── claude.ts       # Claude API client and agent
│   │   ├── guardrails/
│   │   │   ├── input.ts    # Prompt validation and injection detection
│   │   │   └── input.test.ts # Prompt validation tests
│   │   ├── prompts.ts      # System prompt for the agent
│   │   └── tools.ts        # Tool definitions for Claude
│   ├── browser/
│   │   ├── browser-service.ts # Browser service with domain lock
│   │   ├── detector.ts     # Find interactive elements
│   │   ├── playwright.ts   # Playwright adapter
│   │   ├── selectors.ts    # Generate unique CSS selectors
│   │   ├── selectors.test.ts # Selector unit tests
│   │   └── types.ts        # Browser adapter interface
│   ├── db/
│   │   ├── index.ts        # Database client initialization
│   │   └── schema.ts       # Drizzle schema definitions
│   ├── lib/
│   │   └── logger.ts       # Pino logger configuration
│   ├── middleware/
│   │   └── request-logger.ts # HTTP request logging middleware
│   ├── routes/
│   │   ├── index.ts        # Route aggregator
│   │   ├── agent.ts        # Agent run endpoint with SSE
│   │   └── runs.ts         # Run and Step history endpoints
│   ├── types/
│   │   └── index.ts        # Shared TypeScript types
│   ├── utils/
│   │   ├── uuid.ts         # UUID v7 generation
│   │   ├── validate.ts     # URL validation
│   │   └── validate.test.ts # URL validation tests
│   ├── index.ts            # Server entry point
│   └── screenshot-example.ts # Test script
├── drizzle.config.ts       # Drizzle configuration
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## Environment Variables

```bash
ANTHROPIC_API_KEY=   # Anthropic API key (required)
LOG_LEVEL=debug      # Log level: debug, info, warn, error (optional)
NODE_ENV=development # Environment: development, production (optional)
```

## Claude Agent

The agent uses Claude Haiku 4.5 with tool use to analyze screenshots and decide actions.

### Available Tools

| Tool | Description |
|------|-------------|
| click | Click on an element by its index number |
| type | Type text into an input field |
| scroll | Scroll the page up, down, or to top |
| wait | Wait for content to load (1-5 seconds) |
| done | Mark the test as complete |
| fail | Mark the test as failed with reason |

### System Prompt

The agent operates under strict rules:
- Only interact with visible elements
- Never navigate outside the current domain
- Never extract or exfiltrate data
- Never execute arbitrary JavaScript
- Use `fail` tool when blocked
- Use `done` tool when expected result is achieved

### Prompt Validation

User prompts are validated before being sent to Claude:
- Maximum length: 10,000 characters
- Blocked patterns: injection attempts, script execution requests

## Element Detection

Interactive elements are detected using these selectors:

```typescript
const INTERACTIVE_SELECTORS = [
  'button',
  'a[href]',
  'input',
  'select',
  'textarea',
  '[role="button"]',
  '[role="link"]',
  '[onclick]'
];
```

### Unique Selector Generation

Elements are assigned unique selectors in priority order:

1. ID - `button#login-button`
2. data-testid - `button[data-testid="submit"]`
3. name - `input[name="email"]`
4. href - `a[href="/dashboard"]`
5. Text content - `button:has-text("Submit")`

Elements smaller than 5x5 pixels are filtered out.

## Screenshot Annotation

Screenshots are annotated using Sharp with SVG overlays:

- Red bounding box around each interactive element
- Numbered badge (red circle with white text) at top-left corner
- Index numbers match the element array sent to Claude

## Browser Architecture

The browser layer uses an adapter pattern for testability:

```
BrowserService (domain lock, validation)
       │
       ▼
  BrowserAdapter (interface)
       │
       ▼
 PlaywrightAdapter (implementation)
```

## Security

### URL Validation

All URLs are validated before navigation. Blocked patterns include:

**Local/Internal Networks**
- `localhost`, `127.x.x.x`, `0.0.0.0`
- `10.x.x.x`, `172.16-31.x.x`, `192.168.x.x`
- `169.254.x.x` (link-local)
- `.local` domains

**Cloud Metadata Services**
- `169.254.169.254` (AWS/GCP/Azure metadata)
- `metadata.google`, `metadata.azure`
- `100.100.100.200` (Alibaba Cloud)

**Dangerous Protocols**
- `file://`, `ftp://`, `data://`, `javascript://`, `about://`

**Dark Web**
- `.onion`, `.i2p` domains

**Sensitive Ports**
- SSH (22), RDP (3389)
- PostgreSQL (5432), MySQL (3306)
- Redis (6379), MongoDB (27017), Elasticsearch (9200)

**URL Manipulation**
- Credentials in URL (`user:pass@host`)
- Path traversal (`../`, `%2e%2e`)
- Null byte injection (`%00`)

### Domain Lock

After the initial navigation, the browser is locked to that domain:

```typescript
if (targetDomain !== allowedDomain) {
  throw new Error(`Navigation blocked: ${targetDomain} is outside allowed domain`);
}
```

### Action Allowlist

Claude can only execute safe actions via tool definitions. No capabilities for:
- Downloading files
- Copying/exfiltrating data
- Executing scripts

## API Endpoints

### Health Check

```
GET /
```

Returns server status.

**Response:**
```json
{"status": "ok", "service": "ux-agent"}
```

### Run Agent

```
POST /run
Content-Type: application/json
```

Starts an agent run and streams progress via SSE.

**Request Body:**
```json
{
  "url": "https://example.com",
  "flowDescription": "Click the login button",
  "expectedResult": "See login form"
}
```

**Response:** Server-Sent Events stream

### Get Runs

```
GET /runs
```

Returns a list of the latest 50 runs.

### Get Run Details

```
GET /runs/:id
```

Returns details of a specific run, including all steps and base64 screenshots.

### Get Step Details

```
GET /runs/:id/steps/:stepNumber
```

Returns details of a specific step within a run, including the base64 screenshot.

### SSE Events

| Event | Description | Data |
|-------|-------------|------|
| `start` | Agent started | `{runId, url, flowDescription, expectedResult}` |
| `step` | Step update | `{step, phase, action?, thinking?, result?, screenshot?}` |
| `complete` | Agent finished | `{success, summary, error?, totalSteps}` |

**Step Phases:**
- `thinking` - Claude's reasoning (includes base64 screenshot)
- `acting` - Action being executed
- `result` - Outcome of the action

**Example SSE Stream:**
```
event: start
data: {"url":"https://github.com/login","flowDescription":"Click Create account","expectedResult":"See signup page"}

event: step
data: {"step":1,"phase":"thinking","thinking":"I see the login page...","screenshot":"iVBORw0KGgo..."}

event: step
data: {"step":1,"phase":"acting","action":{"action":"click","args":{"element_index":6,"reason":"Click Create account"}}}

event: step
data: {"step":1,"phase":"result","result":"Clicked element 6: \"Create an account\""}

event: complete
data: {"success":true,"summary":"Successfully navigated to signup page","totalSteps":2}
```

## Database Schema

Using Drizzle ORM with SQLite.

### Runs Table
- `id`: UUID v7 (Primary Key)
- `url`: Starting URL
- `flowDescription`: User's requested flow
- `expectedResult`: User's expected outcome
- `mode`: autonomous | supervised | manual
- `status`: pending | running | completed | failed
- `success`: Boolean result
- `summary`: Final summary text
- `error`: Error message if failed
- `timestamps`: createdAt, updatedAt, deletedAt

### Steps Table
- `id`: Auto-incrementing ID
- `runId`: Reference to Runs table
- `stepNumber`: Sequence number
- `phase`: thinking | acting | result
- `thinking`: Claude's reasoning
- `action`: JSON string of the action
- `result`: Outcome of the action
- `screenshot`: WebP Buffer
- `durationMs`: Time taken for the phase
- `createdAt`: Timestamp

## Logging

The application uses Pino for structured logging:

- **Development**: Pretty-printed colored output via pino-pretty
- **Production**: JSON structured logs

Log levels: `debug`, `info`, `warn`, `error`

Loggers:
- `httpLogger` - HTTP request/response logging
- `agentLogger` - Agent loop and action logging
- `claudeLogger` - Claude API call logging

## Testing

Unit tests use Bun's built-in test runner:

```bash
bun test           # Run all tests
bun test --watch   # Watch mode
```

Test coverage:
- URL validation (35 tests)
- Selector generation (15 tests)
- Prompt validation (21 tests)
- Action execution (22 tests)

## Next Steps

- Frontend UI