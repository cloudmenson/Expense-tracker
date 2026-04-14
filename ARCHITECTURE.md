# Architecture

## Principles

- Feature behavior first: no visual or business regressions during refactors.
- Thin pages, reusable components, centralized domain logic.
- One source of truth for state transitions in `src/lib/store.ts`.
- API routes for server concerns, UI components for rendering only.

## Layering

### 1) App layer (`src/app`)

- Route composition and page-specific orchestration.
- No complex business logic in pages.
- Server endpoints are isolated under `src/app/api/**`.

### 2) UI layer (`src/components`)

- `src/components/ui/*`: primitive design system components (`Button`, `Input`, `Modal`, `Select`, `Toast`).
- Feature components (`expense-form`, `expense-detail`, etc.) consume primitives.
- Visual behavior only; data mutations delegated to store/actions.

### 3) Domain / state layer (`src/lib`)

- `src/lib/store.ts` contains domain mutations and optimistic updates.
- Mutations return normalized result shape:
  - `{ ok: true }`
  - `{ ok: false, error: string }`
- `src/lib/utils.ts` stores pure helpers only.

### 4) Contracts (`src/types`, `src/models`)

- `src/types/*`: client/domain contracts used across UI and store.
- `src/models/*`: persistence models (Mongo/Mongoose).
- Keep mapping explicit when moving between model and domain type.

## UI System Conventions

- Use shared primitives only (avoid raw duplicated buttons/inputs in new code).
- Modals:
  - use `closeOnOverlay`, `closeOnEscape` explicitly for critical forms.
  - prefer internal scrolling (`overflow-y-auto`) for long content.
- Keep mobile-safe behavior (`safe-area`, touch scrolling, no accidental text selection on long-press).

## Error Handling & UX

- Every mutation path should show semantic toast feedback (`success | error | info`).
- Never silently fail API/store operations.
- Keep user-facing copy in Ukrainian consistently.

## Validation Checklist (required before merge)

1. `npm run lint`
2. `npm run typecheck`
3. Manual smoke checks:
   - create/edit/delete expense
   - create/edit/delete category
   - trash restore/permanent delete
   - unlock flow
   - mobile modal interactions (date picker + emoji picker)

## Near-term roadmap

- Extract repeated page-level filtering logic into reusable hooks:
  - `useExpenseFilters`
  - `useDateRangeFilter`
- Introduce API client boundary for all remote calls (`src/lib/api-client.ts`) and avoid direct `fetch` in components.
- Add lightweight test coverage for store mutations and critical formatters.
