# Skill: Error Handling Patterns

## React ErrorBoundary

The app uses a class-based `ErrorBoundary` component (`src/components/ErrorBoundary.tsx`):
- Wraps all routes in `App.tsx` to catch rendering errors
- Displays a yellow warning card with error message and a "Reload Page" button
- Does **not** use red/critical styling — follows the "mistakes are points to earn" philosophy

## Data Fetching Errors

All API calls go through `services/localApi.ts` which returns `{ data, error }` (mimicking Supabase).
Pages and hooks should handle both paths:
```typescript
const { data, error } = await api.getQuestions(filters);
if (error) { /* show friendly message */ }
// use data...
```

## Loading States

- `LoadingScreen` component shown as `Suspense` fallback during lazy page loading
- Shows randomized study tips to keep users engaged during wait
- `Loading` component (simpler) used in `AuthContext` during session init

## Empty / Missing Data

Various components use conditional rendering patterns:
- `Illustrations` component for decorative empty states
- Fallback messages like "No questions available for this subject yet"

## Quiz Error States

- `QuizModals` handles exit confirmation, skip, and flag modals
- The quiz hook chain (`useQuizSession` → `useQuizLoader`) returns an `error` string rendered in the UI
- Invalid chapter IDs redirect to home via the catch-all route

## Network / Storage Errors

- `utils/storage.ts` wraps `localStorage` in try/catch, returns fallback on failure
- `localApi.ts` catches fetch errors silently (logs nothing to console)
- All `JSON.parse` operations in services use try/catch with fallback arrays/objects

## Best Practices

1. Never show red error indicators for user mistakes — use yellow stars instead
2. Always provide a fallback UI for loading states
3. Wrap async data in try/catch with meaningful fallbacks
4. Use `ErrorBoundary` at the route level, not inside individual components
5. Prefer graceful degradation over crash-or-nothing patterns
