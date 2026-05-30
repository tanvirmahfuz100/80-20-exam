# 80-20 Exam (Fireman) — Codebase Map

> **Related files:**
> - [AGENTS.md](./AGENTS.md) — Skill index and knowledge base entry point
> - [BUSINESS_RULES.md](./BUSINESS_RULES.md) — Product rules (test modes, scoring, question types)
> - [docs/DESIGN.md](./docs/DESIGN.md) — UI/UX design rules and theme tokens
> - [skills/](./skills/) — Reusable agent skills (extraction, error handling, navigation)

## Quick Reference

| Attribute | Value |
|-----------|-------|
| **Stack** | React 19, TypeScript 6, Vite 7, Tailwind 3.4, Zustand 5, Framer Motion 12, React Router 7 |
| **Package Mgr** | npm 11 |
| **Entry** | `src/main.tsx` → `App.tsx` (HashRouter) |
| **Backend** | localStorage (prototype); mimics Supabase shape `{ data, error }` |
| **Deploy** | GitHub Pages via `gh-pages` + GitHub Actions |
| **Data** | JSON files in `public/{ssc,hsc,bcs,iba,class7}/` |
| **Lint** | ESLint 9 flat config (`eslint.config.js`) |
| **Scripts** | `dev`, `build`, `lint`, `preview`, `deploy`, (`predeploy` runs build) |

## Directory Map

### `src/` — Application Source

| Path | Purpose | Key Exports |
|------|---------|-------------|
| `main.tsx` | Entry — renders `<App />` inside `<ThemeProvider>` + StrictMode | — |
| `App.tsx` | Root — HashRouter, lazy-loaded routes, error boundary, layout | `App` (default) |
| `index.css` | Tailwind base/components/utilities + custom CSS vars | — |
| `vite-env.d.ts` | Vite env type declarations | — |

#### `src/pages/` — Lazy-loaded page components (23 files)

| Route(s) | Component | Key Sub-Components |
|----------|-----------|-------------------|
| `/login`, `/register` | `Login.tsx` | — |
| `/` or `/learn` | `Learn.tsx` | `ExamPathSelector` |
| `/dashboard` | `Dashboard.tsx` | — |
| `/practice` | `PracticeConfig.tsx` | `PracticeConfigComponents` |
| `/quiz/:chapterId` | `Quiz.tsx` | `QuizResultScreen`, `QuizModals`, various exercise components |
| `/levels` | `LevelSelect.tsx` | — |
| `/courses` | `Courses.tsx` | — |
| `/bank` | `QuestionBank.tsx` | — |
| `/mock-tests` | `MockTests.tsx` | — |
| `/shorts` | `VideoFeed.tsx` | — |
| `/analytics` | `Analytics.tsx` | — |
| `/settings` | `Settings.tsx` | — |
| `/admin` | `Admin.tsx` | (protected: `super_admin`/`content_admin`) |
| `/leaderboard` | `Leaderboard.tsx` | — |
| `/quests` | `Quests.tsx` | — |
| `/shop` | `Shop.tsx` | — |
| `/profile` | `Profile.tsx` | — |
| `/help` | `Help.tsx` | — |
| `/stars` | `Stars.tsx` | — |
| `/creative-view` | `CreativeQuestionView.tsx` | — |
| `/bangla-written-view` | `BanglaWrittenView.tsx` | — |
| `/welcome` | `Landing.tsx` | — |
| — | `SubjectSelection.tsx` | (used inline, not a route) |

#### `src/components/` — Reusable UI (26 components)

| Component | Location | Used By |
|-----------|----------|---------|
| `Layout` | `Layout.tsx` | `App.tsx` — wraps all routes |
| `Sidebar` | `layout/Sidebar.tsx` | `Layout` |
| `MobileBottomNav` | `layout/MobileBottomNav.tsx` | `Layout` |
| `NotificationCenter` | `layout/NotificationCenter.tsx` | `Layout` |
| `Button`, `Card`, `Badge`, `Modal`, `ConfirmDialog` | `ui/` | Various pages |
| `ErrorBoundary` | `ErrorBoundary.tsx` | `App.tsx` |
| `LoadingScreen` | `LoadingScreen.tsx` | `App.tsx` (Suspense fallback) |
| `Loading` | `Loading.tsx` | `AuthContext` |
| `LottieAnimation` | `LottieAnimation.tsx` | `LoadingScreen`, pages |
| `ExamPathSelector` | `ExamPathSelector.tsx` | `Learn` |
| `ExamChangerDropdown` | `ExamChangerDropdown.tsx` | Layout header (via `Learn`) |
| `ExamOnboarding` | `ExamOnboarding.tsx` | First-time setup flow |
| `PracticeConfigComponents` | `PracticeConfigComponents.tsx` | `PracticeConfig` |
| `QuizModals` | `QuizModals.tsx` | `Quiz` (exit confirm, skip, flag) |
| `QuizResultScreen` | `QuizResultScreen.tsx` | `Quiz` |
| `MistakeReviewModal` | `MistakeReviewModal.tsx` | Modals for review |
| `StarPopup`, `GemPopup`, `StreakPopup` | `*Popup.tsx` | `Layout` |
| `ModelTest` | `ModelTest.tsx` | `MockTests`/`Quiz` |
| `PaperPicker` | `PaperPicker.tsx` | — |
| `GuideModal`, `ReportModal`, `OnboardingModal` | `*Modal.tsx` | Layout / pages |
| `CreativeQuestionViewer` | `CreativeQuestionViewer.tsx` | `CreativeQuestionView` |
| `CreativeQuestionExercise` | `CreativeQuestionExercise.tsx` | `CreativeQuestionView` |
| `GapFillPassage` | `GapFillPassage.tsx` | Quiz exercise |
| `SubstitutionTableExercise` | `SubstitutionTableExercise.tsx` | Quiz exercise |
| `Rearrangement` | `Rearrangement.tsx` | Quiz exercise |
| `Illustrations` | `Illustrations.tsx` | Decorative assets |

#### `src/hooks/` — Custom React hooks (13 hooks)

| Hook | Exports / Purpose | Depends On |
|------|-------------------|------------|
| `useQuizSession` | Main quiz state orchestrator | `useQuizLoader`, `useQuizTimer`, `useQuizAnswer`, `useQuizPersistence` |
| `useQuizLoader` | Fetch questions, compute levels | `api`, `review`, `quizUtils`, `levels` |
| `useQuizAnswer` | Answer validation, review, score | `review`, `sounds`, `mistakeStore` |
| `useQuizTimer` | Elapsed time tracking | none |
| `useQuizPersistence` | Save progress/results | `api`, `review`, `levels` |
| `usePracticeConfig` | Exam/subject/chapter data | `api`, `examPaths` |
| `useExamPath` | User's selected exam path | localStorage |
| `useDashboardData` | Stats for dashboard | `api` |
| `useCountdown` | Countdown timer utility | none |
| `useMediaQuery` | Responsive breakpoint detection | none |
| `useReducedMotion` | Accessibility: prefers-reduced-motion | `useMediaQuery` |
| `useLowEndDevice` | Device capability detection | `useMediaQuery` |

**Barrel exports** (`hooks/index.ts`): `useMediaQuery`, `useReducedMotion`, `useLowEndDevice`

#### `src/services/` — Business logic (6 files)

| File | Purpose | Depends On |
|------|---------|------------|
| `localApi.ts` | LocalStorage-backed API (mimics Supabase) | `storage`, `normalizeQuestion`, `levels` |
| `levels.ts` | Level computation, progress, XP, stars, challenges | `storage` |
| `quizUtils.ts` | Question normalization for quiz | `normalizeQuestion` |
| `review.ts` | Spaced-repetition mistake/star review system | `mistakeStore` |
| `streak.ts` | Daily check-in streak tracking | `storage` |
| `dailyQuiz.ts` | Daily quiz generation (5 seeded questions) | — |

#### `src/context/` — React context providers (2)

| Context | Provides | Used By |
|---------|----------|---------|
| `AuthContext` | `user`, `profile`, `role`, `signIn`, `signOut`, `updateProfileFields` | All pages, Layout, hooks |
| `ThemeContext` | `theme`, `isDark`, `toggleTheme`, `fontSize`, `setFontSize` | `main.tsx` wraps App |

#### `src/stores/` — Zustand state stores (1)

| Store | State | Used By |
|-------|-------|---------|
| `mistakeStore` | `mistakeCount`, `starBalance`, `refreshKey` | `Layout`, `review`, `useQuizAnswer` |

#### `src/types/` — TypeScript type definitions

| File | Key Types |
|------|-----------|
| `index.ts` | `User`, `Profile`, `AuthSession`, `Question`, `RawQuestion`, `QuizResult`, `Mistake`, `Level`, `DailyChallenge`, `WeeklyChallenge`, `PracticeSession`, `Course`, `MockTest`, `ShortVideo`, `SoundName`, `Theme`, `FontSize` |

#### `src/config/` — App configuration

| File | Content |
|------|---------|
| `examPaths.ts` | Exam/subject/group/class definitions — single source of truth |
| `report.ts` | WhatsApp number for report modal |

#### `src/utils/` — Utility functions (4 files)

| File | Exports |
|------|---------|
| `storage.ts` | `readStorage<T>(key, fallback)`, `writeStorage(key, data)` |
| `sounds.ts` | `playSound(name)`, `preloadSounds()` |
| `normalizeQuestion.ts` | `normalizeQuizQuestion`, `resolveOptions`, `pickQuestionText`, `pickExplanation` |
| `validateQuestion.ts` | `validateQuestion(q)` — data validation |

### `public/` — Static Assets & Question Data

| Directory | Content |
|-----------|---------|
| `ssc/` | SSC subjects: math, bangla, english, accounting, agriculture, business_entrepreneurship, finance, general_science, ict, islam |
| `hsc/` | HSC subjects: bangla_1st, bangla_2nd, english 2nd, accounting_1st/2nd, economics_1st/2nd, finance_1st/2nd, production_1st/2nd, social studies, islamic history, logic, clauses-phrases |
| `bcs/` | BCS datasets: 40 exams (bcs_10 through bcs_49) + answer key scripts |
| `iba/` | IBA subjects: english, math, analytical |
| `class7/` | Class 1-8: english (placeholder) |
| `audio/` | MP3 sound effects (6 files) |
| `animations/` | Lottie JSON animations |
| Each exam dir has `index.json` defining subjects → topics → chapters → file paths |

### `scripts/` — Data tools

| Directory | Purpose | Count |
|-----------|---------|-------|
| `data-extraction/` | Scraping/parsing question data from external sources (chorcha.net, PDFs) | 22 |
| `data-fix/` | Transforming, fixing, deduplicating, and migrating data | 41 |
| `audit/` | QA, verification, duplicate checking | 14 |
| `bcs/` | BCS exam-specific parsing | 4 |
| `archive/` | One-off translations, temp data, old experiments | 7 |

Key files:
- `generate-codegraph.mjs` — Auto-generates the codebase dependency graph (`npm run codegraph`)

## Module Import Graph

```
main.tsx```


## Data Flow

```
  JSON Data (public/*/index.json)
       │
       ▼
  services/localApi.ts (fetch + parse → Question[])
       │
       ├──→ hooks/usePracticeConfig.ts (exam/subject/chapter listing)
       ├──→ hooks/useQuizLoader.ts (load + normalize + compute levels)
       ├──→ hooks/useDashboardData.ts (stats aggregation)
       └──→ pages/QuestionBank.tsx (search)
       
  hooks/useQuizSession.ts
       ├── useQuizLoader.ts → normalizes via quizUtils.ts → computeLevels.ts
       ├── useQuizAnswer.ts → validates answer → review.ts (spaced rep)
       ├── useQuizTimer.ts → tracks elapsed seconds
       └── useQuizPersistence.ts → saves via localApi.ts → localStorage
       
  context/AuthContext.tsx ↔ localStorage (exam_local_auth)
  stores/mistakeStore.ts ↔ review.ts (mistake/star balance)
  context/ThemeContext.tsx ↔ localStorage (duo-theme, fireman-font-size)
```

## Component Tree (Simplified)

```
<ThemeProvider>
  <App>                          (HashRouter)
    <AuthProvider>
      <Layout>                   (header, sidebar, bottom nav, popups)
        ├── Sidebar              (navigation links)
        ├── header               (search, streak/gems/stars, theme toggle, notifications)
        ├── MobileBottomNav      (mobile-only: 5 nav items)
        ├── main content         (<Suspense fallback=<LoadingScreen>>)
        │   └── <page>           (lazy-loaded page component)
        ├── StreakPopup          (conditional)
        ├── GemPopup             (conditional)
        └── StarPopup            (conditional)
```

## Key Data Structures

### Question JSON (in `public/` files)
```typescript
interface Question {
  id: string | number;
  question_text: string;
  options: { id: string; text: string; isCorrect: boolean; }[];
  difficulty: string;
  exam_category: string;
  exam_type: string;
  explanation: string;
  explanation_bn: string;
  explanation_en: string;
}
```

### Exam Index (`public/*/index.json`)
```typescript
interface Subject { name: string; topics: { name: string; chapters: { name: string; file: string; }[] }[] }
```
Exam slug → subjects → topics → chapters → file paths

### Storage keys (localStorage)
| Key | Type | Content |
|-----|------|---------|
| `exam_local_auth` | JSON | `AuthSession` (user + profile) |
| `exam_profiles` | `Profile[]` | User profiles |
| `exam_user_responses` | `QuizResponse[]` | All quiz answers |
| `exam_practice_sessions` | `PracticeSession[]` | Practice history |
| `exam_course_progress` | progress rows | Course lesson progress |
| `exam_mock_results` | results | Mock test results |
| `exam_levels_progress` | `Record<userId_chapterId, LevelProgress>` | Level-by-level progress |
| `exam_user_stats` | `Record<userId, { total_xp, total_stars }>` | XP & star totals |
| `exam_challenges` | `ChallengeState` | Daily/weekly challenges |
| `exam_streak_data` | `Record<userId, StreakData>` | Check-in history |
| `quiz_mistakes` | `Mistake[]` | Spaced-repetition mistake queue |
| `quiz_review_session` | `Question[]` | Current review session questions |
| `user_exam_path` | `{ exam, group, class, medium }` | Selected exam path |
| `duo-theme` | `"dark" | "light"` | Theme preference |
| `fireman-font-size` | key string | Font size preference |
| `daily_quiz_cache_v2` | cached questions | Daily quiz cache |
| `quiz_star_balance` | number | Star balance |

## Key Patterns

1. **Lazy loading**: All pages use `React.lazy()` + `Suspense` with `LoadingScreen` fallback
2. **Prototype API**: `localApi.ts` returns `{ data, error }` to mimic Supabase. Comment says "Replace with Supabase before launch"
3. **Spaced repetition**: `review.ts` implements 5-stage review (0→3→7→14→30 days) for wrong answers (see [skills/error-handling.md](./skills/error-handling.md))
4. **Seeded randomization**: `dailyQuiz.ts` uses deterministic shuffle based on date string
5. **Bengali-first**: UI labels in Bengali, Bengali font stack (Hind Siliguri, Noto Sans Bengali)
6. **Duolingo-style gamification**: Gems, streaks, XP, stars, daily/weekly challenges
7. **Mobile-first responsive**: Tailwind breakpoints for mobile/tablet/desktop/TV (3840px) (see [docs/DESIGN.md](./docs/DESIGN.md))
8. **CSS custom properties**: Theme colors via `--bg`, `--text`, `--surface` etc., swapped with `data-theme="dark"` attribute
