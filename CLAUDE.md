# CLAUDE.md - AI Assistant Guide for ux-agent

This document provides comprehensive guidance for AI assistants working on the ux-agent codebase.

## Project Overview

**ux-agent** is a TypeScript-based browser automation tool designed to detect interactive UI elements on web pages, capture screenshots, and annotate them with element information. The project is in early development with core browser automation implemented.

### Primary Purpose
- Launch and control browsers using Playwright
- Navigate to web pages programmatically
- Detect interactive UI elements (buttons, links, inputs, etc.)
- Capture and annotate screenshots for UX analysis, testing, or AI training

### Project Status
**Early Development**: Core automation working, API layer and screenshot annotation features in scaffold phase.

## Repository Structure

```
/home/user/ux-agent/
├── backend/                    # TypeScript backend application
│   ├── src/
│   │   ├── agent/             # Screenshot annotation functionality
│   │   │   └── annotator.ts   # Image annotation (SCAFFOLD - not implemented)
│   │   ├── browser/           # Browser automation core
│   │   │   ├── playwright.ts  # Browser lifecycle management
│   │   │   ├── detector.ts    # Element detection engine
│   │   │   └── selectors.ts   # Selector generation utilities
│   │   ├── types/             # TypeScript type definitions
│   │   │   └── index.ts       # Core types (DetectedElement)
│   │   └── screenshot-example.ts  # Working example usage
│   ├── package.json           # Dependencies and scripts
│   ├── tsconfig.json          # TypeScript configuration
│   └── bun.lock               # Lockfile (Bun package manager)
└── CLAUDE.md                  # This file
```

## Technology Stack

### Core Technologies
- **Runtime**: Node.js with ESNext modules
- **Language**: TypeScript 5.7.2 (strict mode enabled)
- **Package Manager**: Bun (npm/yarn also compatible)
- **Module System**: ESM with NodeNext resolution

### Key Dependencies
- **Playwright** (v1.57.0) - Browser automation with Chromium
- **Sharp** (v0.34.5) - Image processing for screenshot manipulation
- **tsx** (v4.21.0) - TypeScript execution and development

### Planned/Unused Dependencies
- **Hono** (v4.11.3) - Web framework (indicates planned HTTP API)
- **Drizzle ORM** (v0.45.1) - Database ORM (indicates planned data persistence)

## Key Files and Their Purposes

### Core Implementation Files

#### `/backend/src/browser/playwright.ts` (48 lines)
**Purpose**: Browser lifecycle management

**Exports**:
- `createBrowser()` - Factory function returning browser control object

**Key Methods**:
- `launch()` - Initializes Chromium in headless mode
- `navigate(url)` - Navigates to URL and detects elements
- `screenshot()` - Captures page screenshot as PNG buffer
- `close()` - Cleanup and browser shutdown

**Important Details**:
- Launches Chromium with `--no-sandbox` and `--disable-setuid-sandbox` for container compatibility
- Uses headless mode by default
- Integrates element detector automatically

#### `/backend/src/browser/detector.ts` (43 lines)
**Purpose**: Interactive element detection engine

**Exports**:
- `createElementDetector(getPage)` - Factory accepting page getter function

**Key Methods**:
- `detectElements()` - Returns array of `DetectedElement` objects

**Detection Strategy**:
- Uses predefined `INTERACTIVE_SELECTORS` from selectors.ts
- Evaluates selectors in browser context for performance
- Extracts: selector, tagName, text content, bounding box, attributes
- Indexes elements sequentially

#### `/backend/src/browser/selectors.ts` (52 lines)
**Purpose**: Selector generation and element utilities

**Exports**:
- `INTERACTIVE_SELECTORS` - Array of CSS selectors for interactive elements
- `getUniqueSelector(element)` - Generates unique CSS selector for element
- `getElementAttributes(element)` - Extracts all element attributes

**Selector Priority** (for unique selector generation):
1. `id` attribute
2. `data-testid` attribute
3. `name` attribute
4. `href` attribute (for links)
5. Tag name with index as fallback

**Interactive Elements Detected**:
- Buttons (`button`, `[role="button"]`)
- Links (`a[href]`)
- Inputs (text, email, password, etc.)
- Textareas
- Selects
- Clickable elements (`[onclick]`, `[role="tab"]`, etc.)

#### `/backend/src/types/index.ts` (17 lines)
**Purpose**: Core type definitions

**Key Types**:
```typescript
interface DetectedElement {
  index: number;           // Sequential element index
  selector: string;        // Unique CSS selector
  tagName: string;         // HTML tag name
  text: string;            // Text content
  boundingBox: {           // Position and size
    x: number;
    y: number;
    width: number;
    height: number;
  };
  attributes: Record<string, string>;  // All element attributes
}
```

#### `/backend/src/agent/annotator.ts` (9 lines)
**Status**: ⚠️ SCAFFOLD ONLY - NOT IMPLEMENTED

**Purpose**: Screenshot annotation with element markers

**Current State**: Returns unmodified screenshot buffer

**TODO**: Implement using Sharp library to overlay element markers

#### `/backend/src/screenshot-example.ts` (40 lines)
**Purpose**: Working example demonstrating full workflow

**Usage Pattern**:
```typescript
const browser = createBrowser();
await browser.launch();
const { elements } = await browser.navigate(url);
const screenshot = await browser.screenshot();
const annotated = await annotateScreenshot(screenshot, elements);
await browser.close();
```

### Missing Files (Referenced but Not Created)

#### `/backend/src/index.ts` - NOT IMPLEMENTED
**Status**: ⚠️ Referenced in package.json scripts but does not exist

**Expected Purpose**: Main API server entry point

**Scripts Affected**:
- `npm run dev` - tsx watch src/index.ts
- `npm start` - tsx src/index.ts

**Action Required**: Create this file when implementing the HTTP API layer

## Development Workflows

### Initial Setup

```bash
# Navigate to backend
cd /home/user/ux-agent/backend

# Install dependencies (Bun recommended)
bun install

# Or with npm
npm install

# Playwright will auto-download Chromium on first install
```

### Running the Project

```bash
# Run the example script
npm run screenshot
# Equivalent to: tsx src/screenshot-example.ts

# Development mode with watch (REQUIRES src/index.ts)
npm run dev

# Production start (REQUIRES src/index.ts)
npm start
```

### Development Commands

```bash
# Run any TypeScript file directly
npx tsx src/path/to/file.ts

# TypeScript type checking
npx tsc --noEmit

# Watch mode for development
npx tsx watch src/your-file.ts
```

## Git Workflow

### Branch Naming Convention
**CRITICAL**: All branches MUST follow this pattern:
- Format: `claude/<description>-<session-id>`
- Example: `claude/add-feature-abc123`
- **Session ID is mandatory** - Push will fail with 403 if missing

### Current Working Branch
```
claude/add-claude-documentation-w7ffz
```

### Git Commands with Retry Logic

**For Push Operations**:
```bash
# Always use -u flag for first push
git push -u origin <branch-name>

# If network errors occur, retry up to 4 times with exponential backoff:
# Wait 2s, retry → wait 4s, retry → wait 8s, retry → wait 16s, retry
```

**For Fetch/Pull Operations**:
```bash
# Prefer fetching specific branches
git fetch origin <branch-name>

# For pulls
git pull origin <branch-name>

# Same retry logic: up to 4 times with exponential backoff
```

### Commit Message Style
Based on recent commits, follow conventional commits:
```
feat(backend): add example usage script
feat(backend): implement browser automation with Playwright
chore(backend): initialize project with dependencies
```

**Format**: `<type>(<scope>): <description>`
- Types: feat, fix, chore, docs, refactor, test
- Scope: backend, frontend (when applicable), agent, browser
- Description: lowercase, imperative mood

## Code Conventions

### TypeScript Configuration

**Strict Mode Enabled**:
- All strict type checking options are ON
- No implicit any types
- Strict null checks enforced
- Index signature checks enabled

**Module System**:
- ES Modules (ESM) exclusively
- Import paths must include `.js` extension even for `.ts` files
- Example: `import { foo } from './module.js'`

**Target**: ESNext with NodeNext module resolution

### Code Organization Patterns

#### Factory Pattern
Used for main modules that manage state:

```typescript
// Example from playwright.ts
export function createBrowser() {
  let browser: Browser | null = null;
  let page: Page | null = null;

  return {
    async launch() { /* ... */ },
    async navigate(url) { /* ... */ },
    async close() { /* ... */ }
  };
}
```

#### Dependency Injection
Pass dependencies as function parameters:

```typescript
// Example from detector.ts
export function createElementDetector(getPage: () => Page | null) {
  return {
    async detectElements() { /* uses getPage() */ }
  };
}
```

#### Pure Utility Functions
For stateless operations:

```typescript
// Example from selectors.ts
export function getUniqueSelector(element: Element): string {
  // Pure function - no side effects
}
```

### File Naming
- Use lowercase with hyphens: `screenshot-example.ts`
- Match module name to primary export when possible
- Group related files in directories

### Import Organization
```typescript
// 1. External dependencies
import { chromium } from 'playwright';

// 2. Internal modules (with .js extension)
import { INTERACTIVE_SELECTORS } from './selectors.js';
import type { DetectedElement } from '../types/index.js';

// 3. Type-only imports use 'type' keyword
```

## Key Conventions for AI Assistants

### When Adding Features

1. **Read Before Writing**: Always read existing files before modifying
2. **Follow Existing Patterns**: Use factory pattern for stateful modules, pure functions for utilities
3. **Type Safety**: Leverage TypeScript strictly - define types in `/backend/src/types/`
4. **Modularity**: Keep browser, agent, and utility concerns separated
5. **Error Handling**: Add try-catch blocks for async operations, especially Playwright calls

### When Implementing Missing Features

#### Screenshot Annotation (`annotator.ts`)
- Use Sharp library (already installed)
- Accept screenshot buffer and DetectedElement[]
- Overlay numbered markers or bounding boxes
- Return annotated buffer
- Reference: Sharp documentation for drawing operations

#### API Server (`index.ts`)
- Use Hono framework (already installed)
- Create RESTful endpoints for browser operations
- Consider routes:
  - POST `/screenshot` - Take screenshot with annotation
  - POST `/detect` - Detect elements without screenshot
  - GET `/health` - Health check
- Add error handling middleware

#### Database Integration (Future)
- Drizzle ORM is installed but unused
- Create schema in `/backend/src/db/schema.ts`
- Possible uses: Store screenshots, element history, sessions

### Testing Strategy (Currently Missing)

**Recommended Setup**:
1. Install Vitest or Jest
2. Create `/backend/src/__tests__/` directory
3. Test files: `*.test.ts` naming convention
4. Add scripts to package.json:
   ```json
   "test": "vitest",
   "test:watch": "vitest watch",
   "test:coverage": "vitest --coverage"
   ```

**Priority Tests**:
- Element detection accuracy (detector.ts)
- Selector uniqueness (selectors.ts)
- Browser lifecycle (playwright.ts)
- Screenshot capture format validation

### Documentation Standards

**When Adding Code**:
1. Add JSDoc comments for public functions
2. Document parameters and return types
3. Include usage examples for complex functions
4. Update this CLAUDE.md when adding major features

**JSDoc Example**:
```typescript
/**
 * Detects all interactive elements on the current page.
 *
 * @returns Array of detected elements with selectors and positions
 * @throws Error if page is not initialized
 *
 * @example
 * const detector = createElementDetector(getPage);
 * const elements = await detector.detectElements();
 */
async detectElements(): Promise<DetectedElement[]> {
  // Implementation
}
```

## Common Tasks and Solutions

### Task: Add New Interactive Element Type

**Location**: `/backend/src/browser/selectors.ts`

**Steps**:
1. Add selector to `INTERACTIVE_SELECTORS` array
2. Test with screenshot-example.ts
3. Verify element detection works

**Example**:
```typescript
export const INTERACTIVE_SELECTORS = [
  // Existing selectors...
  '[role="menuitem"]',  // Add new selector
];
```

### Task: Modify Browser Launch Options

**Location**: `/backend/src/browser/playwright.ts`

**Modify**: `launch()` method chromium.launch() call

**Common Options**:
```typescript
browser = await chromium.launch({
  headless: true,              // false for debugging
  args: ['--no-sandbox'],      // Keep for containers
  slowMo: 0,                   // Add delay for debugging
  devtools: false,             // true to open DevTools
});
```

### Task: Change Screenshot Format

**Location**: `/backend/src/browser/playwright.ts`

**Modify**: `screenshot()` method options

**Options**:
```typescript
const screenshot = await page.screenshot({
  type: 'png',              // or 'jpeg'
  fullPage: true,           // Capture full scrollable page
  quality: 80,              // JPEG quality (if type: 'jpeg')
});
```

### Task: Filter Detected Elements

**Location**: `/backend/src/browser/detector.ts`

**Modify**: `detectElements()` method return statement

**Example** (filter out hidden elements):
```typescript
return elements.filter(el =>
  el.boundingBox.width > 0 && el.boundingBox.height > 0
);
```

## Known Issues and TODOs

### High Priority
1. ⚠️ **Implement screenshot annotation** (`/backend/src/agent/annotator.ts`)
   - Currently returns unmodified screenshot
   - Use Sharp to overlay element markers

2. ⚠️ **Create main API server** (`/backend/src/index.ts`)
   - Referenced by npm scripts but doesn't exist
   - Use Hono framework

### Medium Priority
3. **Add testing infrastructure**
   - No tests currently exist
   - Need test framework (Vitest recommended)

4. **Create README.md**
   - Project lacks user-facing documentation
   - Should include setup, usage, API docs

5. **Error handling improvements**
   - Add graceful error handling in browser operations
   - Validate URLs before navigation
   - Handle timeout scenarios

### Low Priority
6. **Database integration**
   - Drizzle ORM installed but unused
   - Define schema and use cases

7. **Configuration management**
   - Hardcoded browser options
   - Consider environment variables

## Dependencies Reference

### Production Dependencies
```json
{
  "playwright": "1.57.0",      // Browser automation
  "sharp": "0.34.5",           // Image processing
  "hono": "4.11.3",            // Web framework (unused)
  "drizzle-orm": "0.45.1"      // Database ORM (unused)
}
```

### Development Dependencies
```json
{
  "typescript": "5.7.2",       // Type system
  "tsx": "4.21.0",             // TS execution
  "@types/node": "*",          // Node.js types
  "drizzle-kit": "0.31.4"      // Drizzle migrations (unused)
}
```

## Environment Setup

### System Requirements
- Node.js 18+ (ESNext support)
- 200MB+ disk space (for Chromium)
- Linux/macOS/Windows supported

### Container/Docker Considerations
Browser launch uses `--no-sandbox` flags for container compatibility. If running in Docker:

```dockerfile
# Install Playwright browsers
RUN npx playwright install chromium --with-deps

# Or use official Playwright image
FROM mcr.microsoft.com/playwright:v1.57.0
```

### Environment Variables (Future)
Consider adding:
- `HEADLESS` - Toggle headless mode
- `BROWSER_TIMEOUT` - Page load timeout
- `PORT` - API server port
- `DATABASE_URL` - Database connection string

## Useful Resources

### Documentation Links
- [Playwright Docs](https://playwright.dev/)
- [Sharp Docs](https://sharp.pixelplumbing.com/)
- [Hono Docs](https://hono.dev/)
- [Drizzle Docs](https://orm.drizzle.team/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Example Usage Pattern
See `/backend/src/screenshot-example.ts` for complete working example.

### Debugging Tips
1. Set `headless: false` in playwright.ts to see browser
2. Add `slowMo: 100` to slow down operations
3. Use `console.log(elements)` to inspect detected elements
4. Check screenshot output in filesystem

## Version Information

**Last Updated**: 2025-12-28
**Git Commit**: 70b9dea (feat(backend): add example usage script)
**Branch**: claude/add-claude-documentation-w7ffz

---

## Quick Start for AI Assistants

When working on this codebase:

1. ✅ **Check this file first** for conventions and patterns
2. ✅ **Read existing code** before making changes
3. ✅ **Follow the factory pattern** for stateful modules
4. ✅ **Use strict TypeScript** - no shortcuts
5. ✅ **Test with screenshot-example.ts** after changes
6. ✅ **Update this file** when adding major features
7. ✅ **Follow git branch naming**: `claude/<desc>-<session-id>`
8. ✅ **Use conventional commits**: `feat(scope): description`

**Need to implement something?** Check the "Known Issues and TODOs" section above for guidance.

**Confused about a file?** Check the "Key Files and Their Purposes" section for detailed explanations.

**Ready to code?** Follow the existing patterns, write tests (when framework is added), and keep it simple.
