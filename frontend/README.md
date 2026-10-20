# Quiziz Frontend

React 19 + TypeScript SPA for creating, browsing, and playing quizzes, styled with Tailwind CSS and shadcn/ui.

## Scripts

```bash
pnpm dev       # local development
pnpm build     # type-check + production build
pnpm lint      # oxlint
pnpm preview   # preview the production build
```

## Environment

Copy `.env.example` to `.env`:

```text
VITE_API_BASE_URL=http://localhost:8000
```

The backend must be running for the app to load quizzes.

## Structure

```text
src/app/                     React Router setup
src/components/ui/           shadcn/ui primitives
src/features/quiz-create/    controlled add-quiz form
src/features/quiz-list/      library page, store, split dialog
src/features/quiz-play/      detail, gameplay, result
src/lib/                     shadcn utility helpers
src/shared/api/              typed API client
src/shared/components/       reusable UI components
src/shared/lib/              shuffle and answer helpers
```

Styling uses Tailwind utilities and shadcn/ui components. `src/index.css` only contains the Tailwind/shadcn theme setup; do not add custom component classes.

## Library behavior

- Server-side search by title
- Folder filter (all, unfiled, specific folder)
- Sorting by date, title, or question count
- Server-side pagination
- Separate loading, error, empty-library, and no-results states

## Railway deployment

Deploy this directory as a separate Railway service with **Root Directory** set
to `/frontend`. Railpack detects Vite, runs `pnpm build`, and serves `dist` with
Caddy. The generated Caddy config handles SPA fallback for React Router and
responds to `/health`.

Service settings:

- Healthcheck Path: `/health`
- Watch Paths: `/frontend/**`
- Wait for CI: enabled

Variables:

```text
VITE_API_BASE_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}
RAILPACK_SPA_OUTPUT_DIR=dist
RAILPACK_NODE_VERSION=24
```

`VITE_API_BASE_URL` is embedded during the build. Changing it requires a new
deployment.
