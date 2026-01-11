# UX Agent Frontend

SvelteKit frontend for the UX Agent autonomous testing tool. Provides a mobile-first UI for starting tests, viewing real-time execution progress, and browsing run history.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| SvelteKit 2 | Framework |
| Svelte 5 | UI with runes reactivity |
| TypeScript | Type safety |
| Tailwind CSS 4 | Styling |
| Bun | Package manager |
| Vite 7 | Build tool |

## Features

- **Live Test Execution** - Real-time streaming updates via SSE
- **Run History** - Browse and view past test runs
- **Three Execution Modes** - Autonomous, supervised, and manual approval
- **Mobile-First Design** - Responsive layout with navigation drawer
- **New Test Modal** - Quick test creation with URL, flow description, and expected result

## Project Structure

```
frontend/
├── src/
│   ├── lib/
│   │   ├── components/     # Reusable UI components
│   │   ├── services/       # API communication
│   │   ├── stores/         # Svelte stores (activeRun, navigation)
│   │   └── types/          # TypeScript definitions
│   └── routes/
│       ├── active/         # Live test execution view
│       ├── runs/           # Run history + details
│       └── settings/       # Settings page
├── CLAUDE.md               # Detailed development guide
└── package.json
```

## Development

```bash
# Install dependencies
bun install

# Start dev server (localhost:5173)
bun run dev

# Type check
bun run check

# Production build
bun run build
```

## Environment Variables

```bash
VITE_API_URL=http://localhost:3000  # Backend API URL
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Redirects to /active |
| `/active` | Live test execution view |
| `/runs` | Run history list |
| `/runs/:id` | Individual run details |
| `/settings` | Settings page |

## Documentation

See [CLAUDE.md](./CLAUDE.md) for detailed development documentation including:
- Component API reference
- Store usage patterns
- Service layer details
- Code conventions for Svelte 5
