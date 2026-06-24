# AGENT_LESSONS.md

## Project: 80-20 Exam — HSC Management 1st Paper Question Bank

### Architecture Lessons

1. **Subject registration requires 4 separate files**:
   - `public/hsc/index.json` — subject + topic + chapter entries with `file_bn`/`file_en` dual keys
   - `src/components/PracticeConfigComponents.tsx` — icon mapping in `icons` object
   - `src/pages/Dashboard.tsx` — subject name → display name mapping in `subjectMap`
   - `src/hooks/useDashboardData.ts` — same subject name mapping duplicated for dashboard stats

2. **`index.json` structure**:
   - Root: `{ "subjects": [...] }`
   - Each subject: `{ "id", "name", "icon", "topics": [...] }`
   - Topics: `{ "id": "year_YYYY", "name", "name_bn", "name_en", "chapters": [...] }`
   - Chapters: `{ "id", "name", "name_bn", "name_en", "file_bn", "file_en" }`
   - Chapters use Bengali-named JSON file paths (e.g., `/hsc/management_1st/ঢাকা বোর্ড ২০২৩.json`)
   - Both `file_bn` and `file_en` keys are required (loading code checks them in different orders)

3. **File path conventions**:
   - Bengali Unicode filenames work fine with `fetch()` (browser handles URL encoding)
   - File paths in index.json start with `/` relative to `public/`
   - Do NOT use numeric filenames (e.g., `1.json`) for board questions — use descriptive Bengali names

### Extraction Lessons

4. **PowerShell extraction from chorcha.net HTML**:
   - HTML is React-rendered, may be single-line — always use `(?s)` regex flag
   - Board name is in a `<div class="...font-bold...">` — extract via regex
   - Some HTML files lack the header div entirely — these must be skipped
   - Bengali digits (০-৯) need Unicode conversion to English (0-9): `[char]([int][char]$c - 0x09E6 + 0x0030)`
   - Source filename (minus `.html`) becomes the JSON output filename

5. **Question structure in HTML**:
   - Question text: `<div class="...font-medium text-card-foreground">`
   - Options: `<button>` tags inside `grid grid-cols-1 gap-2 md:grid-cols-2`
   - Correct answer: `bg-[#017A471A]` (green) or `bg-[#F59E0B1F]` (yellow)
   - Fallback answer text: `সঠিক উত্তর[ঃ:\s]*(?:হলো\s*)?<strong>([ক-ঘ])`

### Index.json Pitfalls

6. **The `index.json` is fragile — manual edits must be careful**:
   - The file is large (~6600+ lines, ~250KB)
   - Subjects array close `]` and root close `}` are easy to accidentally cut/break
   - Trailing commas are NOT allowed in JSON (but `ConvertFrom-Json` may tolerate them)
   - `ConvertFrom-Json` in PowerShell fails silently on invalid JSON with "Invalid JSON primitive" errors
   - Always validate with `JSON.parse()` or `ConvertFrom-Json` after edits

7. **Chorcha.net HTML page variations**: Some saved pages have `<h1 class="header">` while others use `<h1 class="block">` for the board name header. The extraction regex was originally `<h1 class="header">([^<]+)</h1>` and missed the `block` variant. Always use `<h1[^>]*>([^<]+)</h1>` to match both. Additionally, some pages have the header but 0 question blocks (dynamic JS-loaded content) — these can't be statically extracted.

8. **When adding entries to `index.json` subjects array**:
   - Find the last subject's closing `}` in the subjects array
   - Insert the new subject entry BEFORE the `]` that closes the subjects array
   - Do NOT leave placeholder text like `<NEW_ENTRY_HERE>` — this breaks JSON parsing
   - Do NOT close the subjects array prematurely

### Loading Code Variations

9. **4 different code paths load chapter files**, each with slightly different fallback order:
   - `src/hooks/usePracticeConfig.ts` (lines 26-27): `chapter.file_bn || chapter.file || chapter.file_en`
   - `src/services/dailyQuiz.ts` (line 166): `ch.file || ch.file_bn || ch.file_en`
   - `src/services/localApi.ts` (line 195): `chapter.file || chapter.file_bn || chapter.file_en`
   - `src/pages/QuestionBank.tsx` (line 237): `ch.file || ch.file_bn || ch.file_en || null` (ORIGINALLY MISSING `file_en` — FIXED)

   **Lesson**: Always provide ALL THREE keys (`file`, `file_bn`, `file_en`) in each chapter entry to be safe.

### Testing

10. **`npm run dev` starts Vite dev server** — the only way to verify UI changes
   - Node.js portable location: `C:\Users\BD-0217-PFEC\.node-portable\`
   - Needs to be in PATH for `npm` / `node` to work from PowerShell

### Subject Display Systems

11. **Two separate subject display systems exist**:
    - **SubjectSelection page** (`/subject-selection` after onboarding): Uses hardcoded arrays in `src/config/examPaths.ts`. A new HSC subject must be added to the appropriate group array AND to `SubjectSelection.tsx` (icon map + name-to-ID map).
    - **PracticeConfig page** (`/practice?exam=hsc`): Loads dynamically from `public/hsc/index.json`. Registration in JSON alone only affects this page.
    - **Both systems must be updated** for a new subject to appear on the HSC home screen.
    - The two systems use different ID conventions: `examPaths.ts` → `SubjectSelection.tsx` uses short IDs (e.g., `'management'`), while `index.json` uses suffixed IDs (e.g., `'management_1st'`). This mismatch is pre-existing and does not break functionality — users just see the full subject list after navigation.

12. **Paper picker pattern for multi-paper subjects** (Bengali, Management):
    - Instead of listing `'ব্যবস্থাপনা ১ম পত্র'` directly in `examPaths.ts`, use a single entry `'ব্যবস্থাপনা'` and mark it as multi-paper in `multiPaperSubjects` in `SubjectSelection.tsx`.
    - Add paper options in `PaperPicker.tsx` `paperOptions` under the appropriate exam and subject name.
    - Paper picker IDs must match `index.json` subject `id` values (e.g., `management_1st`, `management_2nd`) — this avoids the pre-existing ID mismatch.
    - The icon map in `SubjectSelection.tsx` should use the single entry name (`'ব্যবস্থাপনা'`), not the paper-specific entry.
    - When navigating from the paper picker, the URL uses `subjectId=management_1st` (matching `index.json`), which works directly with `usePracticeConfig.ts` without needing a lookup table.

13. **JSON array elements require commas between them**:
    - When inserting a new subject entry into `index.json`'s `subjects` array, the closing `}` of the previous subject MUST be followed by a `,` before the new subject's opening `{`.
    - Missing this comma causes the entire `index.json` to fail JSON parsing, making the whole HSC exam invisible (no subjects load → exam appears inactive).
    - Always validate `index.json` after insertion with `ConvertFrom-Json` or `JSON.parse`.
    - Example of correct separator between adjacent subjects:
      ```
                        },    ← note the comma
                        {
                            "id": "new_subject",
      ```

14. **Never `Promise.all` hundreds of fetch calls at once**:
    - `usePracticeConfig.ts` `hydrateChapterCounts` flatMaps ALL exams → ALL subjects → ALL chapters and fires `Promise.all` over every chapter file simultaneously.
    - Adding ~124 management_2nd files pushed the total past the browser's resource limit, causing `ERR_INSUFFICIENT_RESOURCES` across ALL subjects (not just management).
    - Fix: filter `chapterEntries` to only the currently `selectedExam` instead of `data.exams`. On the practice page, you only need counts for the visible exam, not all 5 exams at once.
    - Pattern to use:
      ```typescript
      const chapterEntries = (selectedExam ? [selectedExam] : data.exams || [])
        .flatMap((exam) => exam.subjects || [])
      ```
     - Pre-emptively check total fetch volume when adding new subjects. If a single exam would exceed ~100 files, consider concurrency batching (e.g., 10-at-a-time).

15. **Weighted XP + streak bonus**:
    - Difficulty-weighted XP (easy=5, medium=10, hard=20) is computed in the quiz *session* hook (`useQuizSession`) so it has access to per-answer results. The persistence hook (`useQuizPersistence`) just receives the final `earnedXp` number — keeps persistence generic.
    - Streak bonus is additive: 3→+5, 5→+10, 10+→+20. Tracked as `consecutiveCorrect` counter in `useQuizAnswer`.
    - XP is combined (difficulty + streak) before passing to persistence.

16. **Level-up detection**:
    - Compute `prevLevel = Math.floor(prevXp / 100) + 1` and `newLevel = Math.floor(newXp / 100) + 1` in `useQuizPersistence`. If `newLevel > prevLevel`, award `newLevel * 10` gems and write `exam_leveled_up` JSON to localStorage.
    - A global `LevelUpModal` component reads this flag on mount and clears it after display.

17. **Shop `active_items` array pattern**:
    - Store all consumable items as a single `active_items: ActiveItem[]` array on Profile with each item having `{ itemId, expiresAt: ISO string }`.
    - XP boosts merge/replace logic: if a new boost extends beyond the existing expiry, replace; otherwise keep the longer one.
    - `itemId` encodes both the type and duration: `xp_boost_15min`, `xp_boost_30min`, `streak_freeze`, `streak_repair`, `timer_freeze`.

18. **BCS index.json is an array, not an object**:
    - Unlike SSC/HSC/IBA which have `{ subjects: [...] }`, BCS's `index.json` is a bare array of `[{ id, name }, ...]` (42 items).
    - Question Bank loading code must detect this: `if (exam.id === 'bcs' && Array.isArray(idx))`.
    - Subject/topic/chapter structure is virtual: subject = 'BCS Questions', topic = 'All BCS Exams', chapter = `item.name`.

19. **Question per-subject grouping from mistake `source.file`**:
    - Extract subject slugs from `m.source.file` path segments: split by `/`, take `segments[1]`.
    - Capitalize and format as display label. Fallback to 'অন্যান্য' if no subject identified.
    - `getPendingMistakesBySubject()` in `review.ts` groups pending (due now) mistakes by subject for Dashboard pills and Stars breakdown.

20. **Fuzzy search with Levenshtein distance**:
    - Simple sliding-window Levenshtein: slide search term across text, count mismatches, normalize to 0-1 score.
    - Threshold at 0.55 for non-exact search. Results sorted by score descending.
    - Used in Question Bank when `exactMatch` toggle is OFF.

21. **`NormalizedQuestion` type must be defined**:
    - The three quiz hooks (`useQuizAnswer`, `useQuizLoader`, `useQuizPersistence`) all import `NormalizedQuestion` from `'../types'`.
    - This type was never defined in `src/types/index.ts` — a silent TS error that would block building.
    - Define it as a flat interface with `options: string[]` (not `NormalizedOption[]`), matching the shape returned by `normalizeQuizQuestions`.

22. **Shared Zustand store for cross-component state sync**:
    - When a hook with `useState` + `localStorage` is used in multiple component instances (e.g., `HomepageLayout` + `HomepageCustomizer` + `Settings`), each instance gets independent state — changes in one don't reflect in others until a full re-mount/refresh.
    - Fix: use a Zustand store (`create()`) to hold the state. Every component that subscribes via the hook re-renders from the single source of truth.
    - The pattern: store loads from `localStorage` on init, persists on every mutation, and all consumers read/write through the same store. No stale state.

23. **Dev server dies after 120s because bash tool kills it**:
    - The `bash` tool has a default 120s timeout. Running `npm run dev` directly kills the server when the timeout fires.
    - **Fix**: start with `nohup npx vite --host 0.0.0.0 > /tmp/vite-dev.log 2>&1 & disown` and a short timeout so the tool exits before the server is killed.
    - Check logs with `tail -5 /tmp/vite-dev.log`.
    - Verify with `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/`.

24. **Kill stale vite before restarting**:
    - `pkill -f "vite"` kills all vite processes.
    - Always run this before starting a new dev server to avoid port conflicts.
