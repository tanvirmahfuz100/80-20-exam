# Skill: Adding a New Subject

Steps to add a new exam subject to the app's question bank. After extracting question JSON files, register the subject across 4 files.

## 1. Add Question JSON Files

Place JSON files in `public/<exam>/<subject>/`.
Each file contains an array of question objects. Use the original Bengali name as the filename (e.g., `ঢাকা বোর্ড ২০২৩.json`).

**Question format:**
```json
[
  {
    "id": 1,
    "question": "প্রশ্নের টেক্সট",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "answer": "A",
    "source": "উৎস"
  }
]
```

## 2. Register in Index

Edit `public/hsc/index.json`. Add a new subject entry in the `subjects` array with a unique `id` field matching the folder name:

```json
{
    "id": "subject_id",
    "name": "Subject Display Name",
    "icon": "IconName",
    "topics": [
        {
            "id": "year_2023",
            "name": "2023",
            "name_bn": "২০২৩ সাল",
            "name_en": "2023",
            "chapters": [
                {
                    "id": "hsc_subj_1",
                    "name": "ঢাকা বোর্ড ২০২৩",
                    "name_bn": "ঢাকা বোর্ড ২০২৩",
                    "name_en": "ঢাকা বোর্ড ২০২৩",
                    "file_bn": "/hsc/subject_id/ঢাকা বোর্ড ২০২৩.json",
                    "file_en": "/hsc/subject_id/ঢাকা বোর্ড ২০২৩.json"
                }
            ]
        }
    ]
}
```

**IMPORTANT**: Each chapter must have BOTH `file_bn` and `file_en` keys (even if they point to the same file). The app's loading code checks `chapter.file_bn || chapter.file || chapter.file_en` in that order (depending on the language version). Using dual keys ensures compatibility with all loading paths.

**Filename convention**: Use Bengali filenames matching the original HTML source files. The file paths must begin with `/` and be relative to the `public/` directory.

**Topic IDs**: Use `year_YYYY` format for year-based grouping. Valid topic IDs include: `year_2015`, `year_2016`, `year_2017`, `year_2018`, `year_2019`, `year_2020`, `year_2021`, `year_2022`, `year_2023`, `year_2024`, `year_2025`, `year_2026`.

**Chapter IDs**: Use a unique prefix like `hsc_subjectname_N` (e.g., `hsc_mgt1_1`). IDs must be unique across all chapters in the subject.

## 3. Add Icon in PracticeConfigComponents

Edit `src/components/PracticeConfigComponents.tsx` and add an icon entry in the `icons` object:
```typescript
'subject_id': Briefcase,
```
Use icons from `lucide-react` (already imported in the project). Import new icons at the top import line if needed.

Icon choices by subject type:
- **Language**: `BookOpen`
- **Business/Economics**: `Briefcase`
- **Science**: `FlaskConical`
- **Math**: `Calculator`
- **Agriculture**: `Sprout`
- **ICT**: `Monitor`

## 4. Add Name Mapping in Dashboard.tsx

Edit `src/pages/Dashboard.tsx` and add an entry in the `subjectMap` object:
```typescript
subject_id: 'Subject Display Name',
```
This maps the URL slug to a human-readable page title.

## 5. Add Name Mapping in useDashboardData.ts

Edit `src/hooks/useDashboardData.ts` and add the same entry in its `subjectMap` object:
```typescript
subject_id: 'Subject Display Name',
```
This maps question file paths to subject names in dashboard statistics.

## 6. Verify

### Validate JSON
Ensure `index.json` is valid JSON by running one of:
```powershell
# PowerShell
$json = Get-Content -LiteralPath "public/hsc/index.json" -Encoding UTF8 -Raw
$data = $json | ConvertFrom-Json
$data.subjects.Count
```

```bash
# Node.js
node -e "console.log(JSON.parse(require('fs').readFileSync('public/hsc/index.json','utf8')).subjects.length)"
```

### Check file paths
Ensure every `file_bn` / `file_en` path in `index.json` points to an actual JSON file on disk.

### Run lint
```bash
npm run lint
```

### Run dev server
```bash
npm run dev
```
Open the browser, navigate to the HSC exam practice, and verify:
- The subject card appears in the subject selection list
- Clicking into a topic shows the expected chapters
- Loading a chapter displays questions correctly

## Registration Checklist

- [ ] Question JSON files in `public/hsc/<subject_id>/`
- [ ] Subject entry added to `public/hsc/index.json` subjects array
- [ ] Each chapter has both `file_bn` and `file_en` keys
- [ ] File paths match actual filenames (Bengali characters OK)
- [ ] Icon added in `src/components/PracticeConfigComponents.tsx`
- [ ] Name mapping added in `src/pages/Dashboard.tsx`
- [ ] Name mapping added in `src/hooks/useDashboardData.ts`
- [ ] `index.json` validated as parseable JSON
- [ ] `npm run dev` confirms UI works
