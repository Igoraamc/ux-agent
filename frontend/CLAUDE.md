# CLAUDE.md - AI Assistant Guide for ux-agent Frontend

## Overview

SvelteKit frontend for the ux-agent autonomous UX testing tool. Provides a mobile-first UI for starting tests, viewing real-time execution, and browsing run history.

## Technology Stack

- **Framework**: SvelteKit 2 with Svelte 5 (runes)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **Package Manager**: Bun
- **Build Tool**: Vite 7

## Project Structure

```
frontend/
├── src/
│   ├── lib/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── icons/           # SVG icon components
│   │   │   ├── AppDrawer.svelte # Navigation drawer
│   │   │   ├── AppHeader.svelte # Page header with back nav
│   │   │   ├── Button.svelte    # Primary button component
│   │   │   ├── Modal.svelte     # Base modal component
│   │   │   └── NewTestModal.svelte # Test creation form
│   │   ├── services/            # API communication
│   │   │   ├── api.ts           # Base fetch wrapper with SSE
│   │   │   ├── agent.ts         # Agent run endpoints
│   │   │   └── runs.ts          # Run history endpoints
│   │   ├── stores/              # Svelte stores
│   │   │   ├── activeRun.ts     # Current run state + SSE handling
│   │   │   ├── navigation.ts    # Drawer open/close state
│   │   │   └── newTestModal.ts  # Modal visibility state
│   │   └── types/               # TypeScript definitions
│   │       └── index.ts         # Shared types (Run, Step, SSE events)
│   ├── routes/
│   │   ├── +layout.svelte       # Root layout with drawer
│   │   ├── +page.svelte         # Home (redirects to /active)
│   │   ├── active/              # Live test execution view
│   │   ├── runs/                # Run history list
│   │   │   └── [id]/            # Individual run details
│   │   └── settings/            # Settings placeholder
│   └── app.css                  # Tailwind imports + theme vars
├── package.json
└── vite.config.ts
```

## Key Files

### Stores (`/src/lib/stores/`)

#### `activeRun.ts`
Manages current test execution state. Handles SSE streaming from backend.

```typescript
import { activeRun } from '$lib/stores/activeRun';

// Start a new run
activeRun.startRun({ url, flowDescription, expectedResult, mode });

// Rerun with same config
activeRun.rerun();

// Approve/reject in manual mode
activeRun.approve(true);

// Reset to idle state
activeRun.reset();
```

**States**: `idle` | `connecting` | `running` | `awaiting_approval` | `completed` | `failed`

### Services (`/src/lib/services/`)

#### `api.ts`
Base API client with SSE streaming support.

```typescript
import { api } from '$lib/services';

// Regular requests
await api.get<Run[]>('/runs');
await api.post<Response>('/endpoint', body);

// SSE streaming (returns raw Response for manual handling)
const response = await api.stream('/run', config);
```

#### `agent.ts`
Agent-specific endpoints.

```typescript
import { agentService } from '$lib/services';

agentService.startRun(config);      // Start new test (SSE)
agentService.approve(runId, true);  // Approve action in manual mode
agentService.getPending(runId);     // Check pending approval status
```

### Components (`/src/lib/components/`)

#### Button
```svelte
<Button onclick={handler} disabled={false} fullWidth={false}>
  {#snippet icon()}<Plus />{/snippet}
  Label
</Button>
```

#### Modal
```svelte
<Modal open={isOpen} onClose={handleClose} title="Title">
  <!-- content -->
  {#snippet footer()}
    <Button>Action</Button>
  {/snippet}
</Modal>
```

## Types

```typescript
// Run modes
type RunMode = 'autonomous' | 'supervised' | 'manual';

// Run status
type RunStatus = 'pending' | 'running' | 'completed' | 'failed';

// Step phases
type StepPhase = 'thinking' | 'acting' | 'result';

// SSE Events from backend
interface SSEStartEvent { runId, url, flowDescription, expectedResult, mode }
interface SSEStepEvent { step, phase, action?, thinking?, result?, screenshot? }
interface SSEApprovalRequiredEvent { step, action, screenshot }
interface SSECompleteEvent { success, summary, error?, totalSteps }
```

## Development

```bash
bun install          # Install dependencies
bun run dev          # Start dev server (localhost:5173)
bun run build        # Production build
bun run check        # Type check with svelte-check
```

## Environment Variables

```bash
VITE_API_URL=http://localhost:3000  # Backend API URL (default if not set)
```

## Code Conventions

### Svelte 5 Runes
```svelte
<script lang="ts">
  let count = $state(0);                    // Reactive state
  const doubled = $derived(count * 2);      // Computed value

  $effect(() => {                           // Side effects
    console.log(count);
  });
</script>
```

### Component Props
```svelte
<script lang="ts">
  interface Props {
    value: string;
    onchange?: (v: string) => void;
  }
  let { value, onchange }: Props = $props();
</script>
```

### Snippets (Svelte 5)
```svelte
<!-- Parent -->
<Button>
  {#snippet icon()}<Plus />{/snippet}
  Label
</Button>

<!-- Child (Button.svelte) -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  interface Props {
    icon?: Snippet;
    children: Snippet;
  }
  let { icon, children }: Props = $props();
</script>

<button>
  {#if icon}{@render icon()}{/if}
  {@render children()}
</button>
```

## Theme

CSS variables defined in `app.css`:
- `--color-background` - Page background
- `--color-surface` - Card/component background
- `--color-text` - Primary text
- `--color-text-secondary` - Muted text
- `--color-border` - Borders
- `--color-primary` - Accent color (indigo)

## Quick Reference

| Task | Location |
|------|----------|
| Add new component | `/src/lib/components/` |
| Add new icon | `/src/lib/components/icons/` |
| Add API endpoint | `/src/lib/services/` |
| Add shared type | `/src/lib/types/index.ts` |
| Add new page | `/src/routes/` |
| Modify theme | `/src/app.css` |
| Add store | `/src/lib/stores/` |
