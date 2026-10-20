# Quiziz Frontend

React 19 + TypeScript SPA for creating, browsing, and playing quizzes.

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
src/features/quiz-list/      library page, store, split dialog
src/features/quiz-create/    controlled add-quiz form
src/features/quiz-play/      detail, gameplay, result
src/shared/api/              typed API client
src/shared/components/       reusable UI components
src/shared/lib/              shuffle and answer helpers
```

## Library behavior

- Server-side search by title
- Folder filter (all, unfiled, specific folder)
- Sorting by date, title, or question count
- Server-side pagination
- Separate loading, error, empty-library, and no-results states
