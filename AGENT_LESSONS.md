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
