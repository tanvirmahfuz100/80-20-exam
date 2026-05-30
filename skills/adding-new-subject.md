# Skill: Adding a New Subject

Steps to add a new exam subject to the app's question bank.

## 1. Add Question JSON Files

Place numbered JSON files in `public/<exam>/<subject>/`.
Each file contains an array of question objects.

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

Edit `public/<exam>/index.json`. Add a new entry in the `subjects` array:

```json
{
  "name": "Subject Name",
  "topics": [
    {
      "name": "Topic Name",
      "chapters": [
        { "name": "Chapter 1", "file": "<exam>/<subject>/1.json" }
      ]
    }
  ]
}
```

## 3. Add Icon in PracticeConfig

Edit `src/pages/PracticeConfig.tsx` and add an icon entry in the `icons` object:
```typescript
'subject-name': BookOpen,
```
Use icons from `lucide-react` (already imported in the project).

## 4. Verify

- Run `npm run dev` to check the subject appears in the UI
- Ensure `index.json` is valid JSON
- Check that file paths in `index.json` match actual files in `public/`
