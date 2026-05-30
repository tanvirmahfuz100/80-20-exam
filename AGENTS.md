# AGENTS.md — Codebase Knowledge Base

> **For a complete overview of the codebase, please read [CODEBASE.md](./CODEBASE.md) first.**
> It contains the directory map, module import graph, component tree, data flow, and key patterns.

---

## Reusable Skill: HTML-to-JSON Question Extraction

### Purpose
Extract MCQ questions from saved chorcha.net HTML files (Next.js single-page output) into the app's JSON format using PowerShell 5.1 only (no Node.js/Python 3).

## Input Format
- Saved `.html` files from chorcha.net (read with `[System.IO.File]::ReadAllText` + UTF-8)
- Each board exam in a separate file
- HTML is React-rendered, single-line with newlines for readability
- Questions embedded in `<div class="w-full"><div class="border dark:border-gray-700 rounded-xl p-5 ...">`

## Target JSON Format
```json
[
  {
    "id": 1,
    "question": "প্রশ্ন টেক্সট",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "answer": "A",
    "source": "বোর্ড নাম"
  }
]
```

## Extraction Strategy

### Question Text
Target: Content inside `<div class="...font-medium text-card-foreground">`
Pattern: `text-card-foreground[^>]*><div[^>]*>((?:(?!</div></div>).)*)</div></div>`
Use `(?s)` flag for singleline mode.

Extract text from all `<p>` tags within, using `[System.Net.WebUtility]::HtmlDecode`.
Strip leading numbers like `1. ` or `7. `.

### Option Buttons
Each option is in `<button>` tags inside `<div class="grid grid-cols-1 gap-2 md:grid-cols-2">`.
Find all `<button>` positions after the grid start, then for each:
1. Find matching `</button>` 
2. Extract last non-empty `<p>` text for the option value
3. Position 1=A (ক), 2=B (খ), 3=C (গ), 4=D (ঘ)

### Correct Answer
The correct answer button has `bg-[#017A471A]` CSS class.
Use regex: `bg-\[#017A471A\]`

**Fallback**: Some questions show the answer as text `সঠিক উত্তর: ক)` or `সঠিক উত্তর হলো <strong>খ)` in the explanation section. Extract with: `সঠিক উত্তর[ঃ:\s]*(?:হলো\s*)?<strong>([ক-ঘ])`

### Sub-Questions
If a block contains `<div class="space-y-6">`, extract sub-questions from inner `<div class="px-4 pt-4 pb-6 border rounded-xl">` and prepend parent question text.

## Key HTML Markers
| Element | CSS Class |
|---------|-----------|
| Question block wrapper | `w-full` + `border dark:border-gray-700 rounded-xl p-5` |
| Question text div | `font-medium text-card-foreground` |
| Tags area | `my-3` |
| Options grid | `grid grid-cols-1 gap-2 md:grid-cols-2` |
| Correct answer button | `bg-[#017A471A]` |
| Explanation area | `<div style="display: block;">` |
| Sub-question group | `space-y-6` |
| Sub-question div | `px-4 pt-4 pb-6 border rounded-xl` |

## PowerShell Utilities
- `[System.Net.WebUtility]::HtmlDecode` — HTML decode (NOT `System.Web.HttpUtility`)
- `[System.Text.Encoding]::UTF8` — for reading/writing Unicode files
- `[regex]::Matches` / `[regex]::Match` — regex matching (use `(?s)` for singleline)
- `ConvertFrom-Json` / `ConvertTo-Json` — JSON serialization
- `[ref]$var` — pass-by-reference (avoid variable name collisions with the local copy)
- `IndexOf`, `LastIndexOf`, `Substring` — string operations
- `$text -match 'pattern'` — PowerShell's regex match operator

## Gotchas
1. **Variable naming**: `$correctAnswer` and `$CorrectAnswer` are the SAME variable in PowerShell (case-insensitive). Always use distinct names for `[ref]` parameters.
2. **Newlines in HTML**: The HTML files contain newlines. Use `(?s)` in all regex patterns.
3. **Bengali text**: Console can't display Bengali (renders as `?`) but UTF-8 is preserved in files.
4. **Grid end detection**: The `</div></div>` after the first button may be INSIDE button content (closing inner divs). Use `IndexOf('</button>', buttonStart)` to find each button's end instead.
5. **File numbering**: Unnumbered files and file `10.html` both match regex `(\d+)$` differently. Use string key "unnumbered" for files without trailing digits.
6. **Yellow `#F59E0B1F` is ALSO a valid answer marker**: `bg-[#F59E0B1F]` (yellow) may mark the correct answer in some contexts (e.g., review pages where the correct answer is highlighted in yellow). Some pages use only green `bg-[#017A471A]`, some use only yellow `bg-[#F59E0B1F]`, and some use both (green for correct answer + yellow for user's wrong selection). Always check both markers, with green taking priority when both are present.
7. **Answer text can appear as `সঠিক উত্তর:` or `সঠিক উত্তর হলো`**: The answer may be rendered as text in the explanation section. Pattern: `সঠিক উত্তর[ঃ:\s]*(?:হলো\s*)?<strong>([ক-ঘ])`. The Bengali colon `ঃ` (U+0983) is distinct from ASCII `:`.
8. **Options must be in A/B/C/D key order**: The app uses `Object.values(options)` which follows JSON key insertion order. If keys are `C, A, D, B` instead of `A, B, C, D`, the letter-to-index mapping (`['A','B','C','D'].indexOf(answer)`) will select the wrong option text. Always use `[Ordered]@{}` instead of `@{}` in PowerShell to preserve insertion order.
9. **Console encoding**: Set `[Console]::OutputEncoding = [Text.Encoding]::UTF8` before printing Bengali to console (still may not work in all terminals).

## Adding a New Subject
1. Place JSON files in `public/<exam>/<subject>/`
2. Register in `public/<exam>/index.json` under `subjects` array
3. Add icon entry in `src/pages/PracticeConfig.jsx` `icons` object
4. Use `lucide-react` icons (already imported)

---

## Navigation

| File | What It Contains |
|------|-----------------|
| [CODEBASE.md](./CODEBASE.md) | Complete codebase map: directory descriptions, import graph, component tree, data flow, types, patterns |
| [codegraph.json](./codegraph.json) | Machine-readable dependency graph (generated by `scripts/generate-codegraph.mjs`) |
| `scripts/` | Data tools, organized into: `data-extraction/`, `data-fix/`, `bcs/`, `audit/`, `archive/` |

**To regenerate the graph:**
```bash
node scripts/generate-codegraph.mjs
```
