# Skill: Codebase Navigation

How to find your way around the 80-20 Exam (Fireman) codebase.

## Entry Points

| File | What It Does |
|------|-------------|
| `src/main.tsx` | App bootstrap — renders App inside ThemeProvider + StrictMode |
| `src/App.tsx` | Root component: HashRouter, lazy routes, Layout wrapper |
| `index.html` | HTML shell with font preloads and meta tags |

## Key Architectural Layers

```
public/ (JSON question data)
    ↓ fetch
src/services/localApi.ts (localStorage API)
    ↓
src/hooks/* (data fetching, quiz state, etc.)
    ↓
src/pages/* (route-level components)
    ↓
src/components/* (reusable UI)
```

## Quick File Finder

| What You Need | Look In |
|--------------|---------|
| Route/page component | `src/pages/*.tsx` (23 files) |
| Reusable UI component | `src/components/*.tsx` |
| Layout (sidebar, header, nav) | `src/components/Layout.tsx` + `src/components/layout/` |
| API calls (localStorage) | `src/services/localApi.ts` |
| Quiz logic | `src/hooks/useQuizSession.ts` (orchestrator) |
| Level/progress/challenges | `src/services/levels.ts` |
| Mistake review (spaced rep) | `src/services/review.ts` |
| Streak tracking | `src/services/streak.ts` |
| Auth | `src/context/AuthContext.tsx` |
| Theme | `src/context/ThemeContext.tsx` |
| TypeScript types | `src/types/index.ts` |
| Exam/subject config | `src/config/examPaths.ts` |
| Zustand store | `src/stores/mistakeStore.ts` |
| CSS / theme tokens | `src/index.css` |
| Question data (JSON) | `public/{ssc,hsc,bcs,iba,class7}/` |

## Routes

| Path | Page Component |
|------|---------------|
| `/` or `/learn` | Learn (home) |
| `/dashboard` | Dashboard |
| `/login` | Login |
| `/practice` | PracticeConfig |
| `/quiz/:chapterId` | Quiz |
| `/levels` | LevelSelect |
| `/bank` | QuestionBank |
| `/mock-tests` | MockTests |
| `/shorts` | VideoFeed |
| `/settings` | Settings |
| `/admin` | Admin (protected) |
| `/stars` | Stars (mistake review) |

## Data Flow for Quiz

```
User clicks chapter → PracticeConfig starts quiz
  → useQuizSession hook (orchestrator)
    → useQuizLoader: fetches JSON from public/, normalizes via quizUtils, computes levels
    → useQuizAnswer: validates answer, adds mistakes via review.ts
    → useQuizTimer: tracks elapsed time
    → useQuizPersistence: saves progress/results to localStorage
  → QuizResultScreen: shows score, XP, stars
```

## Key Conventions

1. **Bengali-first**: All UI labels in Bengali, Bangla font stack
2. **LocalStorage API**: `{ data, error }` return shape mimics Supabase
3. **Lazy loading**: All 23 pages are `React.lazy()` loaded
4. **Gamification**: Duolingo-inspired (gems, streaks, XP, stars)
5. **Spaced repetition**: 5-stage review (0→3→7→14→30 days)
6. **Mobile-first**: Responsive from 320px to 3840px (TV support)
