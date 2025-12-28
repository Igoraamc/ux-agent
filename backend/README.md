# Backend

Hono-based API server for the UX testing agent.

## Setup

```bash
bun install
npx playwright install chromium
```

## Scripts

```bash
bun run dev        # Development mode with hot reload
bun run start      # Production mode
bun run screenshot # Run screenshot example
```

## Project Structure

```
src/
├── agent/
│   └── annotator.ts      # Draw numbered boxes on screenshots
├── browser/
│   ├── playwright.ts     # Browser management + domain lock
│   ├── detector.ts       # Find interactive elements
│   └── selectors.ts      # Generate unique CSS selectors
├── types/
│   └── index.ts          # TypeScript types
├── utils/
│   └── validate.ts       #General validation
└── screenshot-example.ts # Test script
```

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
  '[onclick]',
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

After the initial navigation, the browser is locked to that domain. Attempts to navigate to a different domain throw an error:

```typescript
if (targetDomain !== allowedDomain) {
  throw new Error(`Navigation blocked: ${targetDomain} is outside allowed domain`);
}
```

### Action Allowlist

Claude can only execute these actions via tool definitions:

| Action | Description |
|--------|-------------|
| click | Click on an element by index |
| type | Type text into an input by index |
| scroll | Scroll the page |
| wait | Wait for content to load |

No capabilities for downloading files, copying data, or executing scripts.

## Environment Variables

```bash
# Coming soon
CLAUDE_API_KEY=     # Anthropic API key
DATABASE_URL=       # SQLite database path
```

## API Endpoints

*Coming soon*

```
POST /api/tests           # Start a new test
GET  /api/tests/:id       # Get test status
GET  /api/tests/:id/stream # SSE stream for real-time updates
```

## Database Schema

*Coming soon - using Drizzle ORM with SQLite*
