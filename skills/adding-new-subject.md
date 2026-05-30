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

## 3. Add to Hardcoded Subject List (for SubjectSelection page)

For the subject to appear on the **HSC home screen** (the subject grid shown after onboarding), you must update two files:

### 3a. Edit `src/config/examPaths.ts`

Add the Bengali subject name to the appropriate exam+group array:
- `HSC-Business` — for management, accounting, finance, economics, entrepreneurship
- `HSC-Science` — for physics, chemistry, biology, higher math
- `HSC-Arts` — for history, geography, civics

**For multi-paper subjects** (subjects with 1st/2nd paper like Bengali, Management):
- Add a SINGLE entry with the generic name (e.g., `'ব্যবস্থাপনা'`) instead of paper-specific names
- The paper picker dialog will let users choose between 1st and 2nd paper after clicking

### 3b. Edit `src/pages/SubjectSelection.tsx`

Add entries for the generic subject name:

1. In `subjectIconMap`: map the Bengali name to a `lucide-react` icon
2. In `subjectNameToId`: map the Bengali name to a short URL-safe ID
3. In `multiPaperSubjects`: add `'বাংলা': true` or `'ব্যবস্থাপনা': true` to enable the paper picker dialog

Use the same icon from PracticeConfigComponents. The ID should be a simple short name (e.g., `'management'` not `'management_1st'`) following the existing pattern.

## 4. Add Paper Picker Options (for multi-paper subjects)

Edit `src/components/PaperPicker.tsx` and add paper options in the `paperOptions` object:

```typescript
hsc: {
    'ব্যবস্থাপনা': [
      { id: 'management_1st', label: 'ব্যবস্থাপনা ১ম পত্র', desc: 'Management 1st Paper' },
      { id: 'management_2nd', label: 'ব্যবস্থাপনা ২য় পত্র', desc: 'Management 2nd Paper' },
    ],
},
```

**Important**: The `id` values must match the `id` fields in `index.json` (e.g., `management_1st`, `management_2nd`). This ensures the paper picker's navigation URL (`/practice?exam=hsc&subjectId=management_1st`) matches the subject IDs in the index, bypassing the pre-existing ID mismatch between `examPaths.ts` and `index.json`.

## 5. Add Icon in PracticeConfigComponents

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

## 6. Add Name Mapping in Dashboard.tsx

Edit `src/pages/Dashboard.tsx` and add an entry in the `subjectMap` object:
```typescript
subject_id: 'Subject Display Name',
```
This maps the URL slug to a human-readable page title.

## 7. Add Name Mapping in useDashboardData.ts

Edit `src/hooks/useDashboardData.ts` and add the same entry in its `subjectMap` object:
```typescript
subject_id: 'Subject Display Name',
```
This maps question file paths to subject names in dashboard statistics.

## 8. Verify

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
- [ ] Bengali name added to `src/config/examPaths.ts` in the right group array
- [ ] Icon + ID mapping added in `src/pages/SubjectSelection.tsx`
- [ ] Multi-paper subject added to `multiPaperSubjects` in `src/pages/SubjectSelection.tsx` (if applicable)
- [ ] Paper picker options added in `src/components/PaperPicker.tsx` (if multi-paper)
- [ ] Each chapter has both `file_bn` and `file_en` keys
- [ ] File paths match actual filenames (Bengali characters OK)
- [ ] Icon added in `src/components/PracticeConfigComponents.tsx`
- [ ] Name mapping added in `src/pages/Dashboard.tsx`
- [ ] Name mapping added in `src/hooks/useDashboardData.ts`
- [ ] `index.json` validated as parseable JSON
- [ ] `npm run dev` confirms UI works
