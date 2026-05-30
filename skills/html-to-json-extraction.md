# Skill: HTML-to-JSON Question Extraction

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

1. **Variable naming**: `$correctAnswer` and `$CorrectAnswer` are the same variable in PowerShell (case-insensitive). Use distinct names for `[ref]` parameters.
2. **Newlines in HTML**: The HTML files contain newlines. Use `(?s)` in all regex patterns.
3. **Bengali text**: Console can't display Bengali (renders as `?`) but UTF-8 is preserved in files.
4. **Grid end detection**: The `</div></div>` after the first button may be inside button content. Use `IndexOf('</button>', buttonStart)` instead.
5. **File numbering**: Use string key "unnumbered" for files without trailing digits.
6. **Yellow `#F59E0B1F` is also a valid answer marker**: Always check both markers, with green taking priority.
7. **Answer text can appear as `সঠিক উত্তর:` or `সঠিক উত্তর হলো`**: Pattern: `সঠিক উত্তর[ঃ:\s]*(?:হলো\s*)?<strong>([ক-ঘ])`.
8. **Options must be in A/B/C/D key order**: Always use `[Ordered]@{}` in PowerShell to preserve insertion order.
9. **Console encoding**: Set `[Console]::OutputEncoding = [Text.Encoding]::UTF8` before printing Bengali.
