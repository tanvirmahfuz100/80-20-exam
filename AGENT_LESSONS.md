# 80/20 EXAM - AGENT LESSONS LEARNED

**Purpose:** Knowledge base for AI agents working on this project  
**Last Updated:** May 11, 2026  
**Format:** Cumulative lessons - ADD NEW LESSONS, DON'T DELETE OLD ONES

---

## LESSON 1: Gap Filling Questions - Data vs Rendering Issue

**Date Added:** May 11, 2026  
**Category:** Frontend/Data Integration  
**Priority:** HIGH  
**Status:** 🔴 UNRESOLVED (in production)

### Issue
Quiz displays gap filling questions but **multiple choice options don't render in UI**, even though JSON data is complete.

### Root Cause
**Layer Breakdown:**
- ✅ **Data Layer (Backend):** JSON file `/public/ssc/english/gap_filling_with_clues_paper_11.json` has all options with explanations
- ✅ **JSON Structure:** Valid, all blanks have `options` array with 3 choices each
- ❓ **API Response:** Unknown - needs verification
- ❌ **Frontend Component:** Options not rendering/displaying to user

### Key Findings

**Data Validation ✅**
```json
// CORRECT structure exists in file:
{
  "blankId": "a",
  "correct": "biggest",
  "options": [
    { "text": "biggest", "isCorrect": true, "explanationBn": "..." },
    { "text": "big", "isCorrect": false, "explanationBn": "..." },
    { "text": "bigger", "isCorrect": false, "explanationBn": "..." }
  ]
}
```

**Test File Stats:**
- Passages: 2
- Total Blanks: 20 (10 per passage)
- Options per Blank: 3
- Total Options in file: 60 ✅

### Likely Causes (priority order)
1. React/Vue component not mapping `options` array
2. Conditional rendering only shows correct answer
3. CSS hiding options (display: none, opacity: 0)
4. State management issue - options not persisting
5. Backend sending incomplete JSON

### How to Debug (When Encountered Again)

**Step 1: Network Inspection**
```
F12 → Network tab → Reload → Filter XHR → Find JSON request
→ Response tab → Search for "options" field
```
- **If options present:** Problem is React/Vue component
- **If options missing:** Problem is backend API

**Step 2: Component Inspection**
```
Right-click question → Inspect Element
→ Look for .option or .choice elements
→ Check Console for JS errors
```

**Step 3: Console Debug**
```javascript
fetch('/public/ssc/english/gap_filling_with_clues_paper_11.json')
  .then(r => r.json())
  .then(data => console.log(data.questions[0].blanks[0].options))
```

### Files Involved
- **Data:** `/public/ssc/english/gap_filling_with_clues_paper_11.json` ✅ VALID
- **Component:** `/src/pages/Quiz.jsx` (needs review)
- **API Service:** `/src/services/api.js` (needs verification)
- **Styles:** `/src/App.css` (check for CSS hiding)

### What Should Happen
1. Passage displays with blanks as `___` or input fields
2. Below each blank: 3 radio buttons or dropdown options
3. Click option → Show Bengali explanation
4. Next button → proceed

### What's Actually Happening
❌ Options section completely missing/invisible

### Reference: Working Structure
- `/public/ssc/english/changing_sentences.json` - **Works correctly**
  - 30 question sets × 10 subquestions = 300 total
  - All have options with explanations
  - Can compare structure with gap_filling

### Lesson for Future Agents
> **When UI doesn't show data that's in JSON:**
> 1. First verify JSON structure with `wc -l` and file inspection ✅
> 2. Always check Network tab to see what browser receives
> 3. Don't assume API is sending data - verify it
> 4. Compare working vs broken components side-by-side
> 5. Use Console to test if data exists in page context

---

## LESSON 2: JSON File Validation Checklist

**Date Added:** May 11, 2026  
**Category:** Data Quality  
**Priority:** MEDIUM

### Quick Validation Commands
```bash
# Check file size
wc -l <filename.json>

# Validate JSON syntax
python -m json.tool <filename.json> > /dev/null && echo "Valid JSON"

# Count questions
grep -c '"id":' <filename.json>

# Check for required fields
grep -c '"options"' <filename.json>
grep -c '"explanationBn"' <filename.json>
```

### Files Verified This Session ✅
- `/public/ssc/english/gap_filling_with_clues_paper_11.json` - 3797 lines, VALID
- `/public/ssc/english/changing_sentences.json` - Valid, 300 questions

### Standard Structure for Quiz Questions
```json
{
  "testId": "unique_test_id",
  "title": "Display Title",
  "description": "Bengali description",
  "questions": [
    {
      "id": 1,
      "passage": "Question text or passage",
      "blanks": [
        {
          "blankId": "a",
          "correct": "answer",
          "options": [
            { "text": "option1", "isCorrect": true, "explanationBn": "Bengali explanation" },
            { "text": "option2", "isCorrect": false, "explanationBn": "Bengali explanation" }
          ]
        }
      ]
    }
  ]
}
```

### Validation Checklist
- [ ] File is valid JSON (no syntax errors)
- [ ] All questions have unique IDs
- [ ] All options have required fields: text, isCorrect, explanationBn
- [ ] At least one option per blank is marked isCorrect: true
- [ ] Explanations are in Bengali
- [ ] No duplicate questions

---

## LESSON 3: Project Structure Overview

**Date Added:** May 11, 2026  
**Category:** Project Knowledge  
**Priority:** HIGH - READ FIRST

### Key Directories
```
/media/tanvir/Project/80-20-exam/
├── public/
│   ├── ssc/
│   │   ├── english/
│   │   │   ├── gap_filling_with_clues_paper_11.json ⚠️ NO OPTIONS SHOWING
│   │   │   ├── changing_sentences.json ✅ WORKING
│   │   │   └── grammar_noun.json
│   │   ├── math/, analytical/
│   ├── gre/, gmat/, iba/, sat/
│
├── src/
│   ├── pages/
│   │   ├── Quiz.jsx 🔍 PRIMARY COMPONENT
│   │   ├── PracticeConfig.jsx
│   │   └── Dashboard.jsx
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── Loading.jsx
│   │   ├── ReportModal.jsx
│   │   └── ... (other components)
│   ├── services/
│   │   └── api.js 🔍 DATA FETCHING
│   └── context/
│       └── AuthContext.jsx
│
├── docs/
│   └── README.md, English_Syllabus_Guide.md
│
└── AGENT_LESSONS.md ← YOU ARE HERE
```

### Tech Stack (Inferred)
- Frontend: React/Vue
- Build: Vite
- Styling: Tailwind CSS
- CSS Preprocessing: PostCSS

### Main Components to Know
1. **Quiz.jsx** - Renders questions and options
2. **api.js** - Fetches JSON files from /public
3. **PracticeConfig.jsx** - Quiz setup/initialization
4. **ReportModal.jsx** - Shows results/feedback

---

## LESSON 4: Data Files Status Matrix

**Date Added:** May 11, 2026  
**Category:** Data Inventory  
**Priority:** MEDIUM

| File | Questions | Status | Notes |
|------|-----------|--------|-------|
| changing_sentences.json | 300 (30×10) | ✅ VERIFIED | All transformations covered |
| gap_filling_with_clues_paper_11.json | 20 blanks | ⚠️ DATA OK, UI BROKEN | Options not rendering |
| grammar_noun.json | ? | ? | Not reviewed |
| Other English files | ? | ? | Not reviewed |
| Math/Analytical/Other subjects | ? | ? | Not reviewed |

### For Future Agents
- Before making changes, run validation on target JSON
- Compare working file structure with broken one
- Document any structural differences

---

## HOW TO ADD LESSONS

**Format for new lessons:**

```markdown
## LESSON N: [Title - Be Specific]

**Date Added:** [Date]  
**Category:** [Frontend/Backend/Data/DevOps/Other]  
**Priority:** [HIGH/MEDIUM/LOW]  
**Status:** [🟢 RESOLVED / 🟡 IN PROGRESS / 🔴 UNRESOLVED]

### Issue
Clear description of problem

### Root Cause
Why it happened

### Solution (if resolved)
How it was fixed / How to fix

### Files Involved
List relevant files

### How to Avoid This Mistake
Actionable steps for future agents

### Reference/Related
Links to similar issues or examples
```

**When to Add:**
- ✅ When solving a problem that might repeat
- ✅ When discovering a quirk in the codebase
- ✅ When a mistake could cause hours of debugging
- ✅ When comparing working vs broken implementations

**What NOT to Do:**
- ❌ Don't delete old lessons
- ❌ Don't assume knowledge (explain for fresh agent)
- ❌ Don't mix multiple lessons into one
- ❌ Don't skip the "How to Avoid" section

---

## QUICK REFERENCE

### Common Tasks

**Check if JSON is valid:**
```bash
python -m json.tool /path/to/file.json > /dev/null && echo "✅ Valid" || echo "❌ Invalid"
```

**Count objects in quiz:**
```bash
grep -c '"id":' /public/ssc/english/file.json
```

**View file structure:**
```bash
head -100 /public/ssc/english/file.json
```

**Find a problem:**
- DevTools Network tab → verify data
- Check component markup → verify rendering
- Console → test JavaScript execution

### Important Git Notes
- This file is pushed to GitHub (unlike debugging notes)
- Update regularly as lessons are learned
- Use clear, actionable language
- Keep structure consistent

---

## LESSON 4: SSC Multi-Exam Discovery Pattern (RESOLVED)

**Date Added:** May 11, 2026  
**Category:** Architecture/Data Integration  
**Priority:** HIGH - Use for all new exams  
**Status:** ✅ RESOLVED & DEPLOYED

### The Problem
- Had 30 gap-filling questions in raw file, but only 1 was accessible in UI
- IBA questions loaded, but SSC, HSC, BCS were missing
- Quiz only showed IBA content
- No multi-exam discovery system

### The Solution (Implementation Pattern)

**Step 1: Create Exam Index Structure**
```json
// /public/ssc/index.json (follows IBA pattern)
{
  "subjects": [
    {
      "id": "english",
      "name": "English",
      "icon": "Book",
      "topics": [
        {
          "id": "grammar",
          "name": "Grammar",
          "chapters": [
            {
              "id": "ssc_gap_filling",
              "name": "Gap Filling With Clues",
              "file": "/ssc/english/gap_filling_with_clues_paper_11.json"
            }
          ]
        }
      ]
    }
  ]
}
```

**Step 2: Update API Service (`src/services/api.js`)**

CRITICAL: Fetch ALL exam indexes, not just IBA
```javascript
const getAllJsonQuestions = async () => {
    const indexPaths = ['/iba/index.json', '/ssc/index.json', '/sat/index.json'];  // ⭐ Add new exams here
    const indexJsons = [];

    for (const p of indexPaths) {
        try {
            const res = await fetch(p);
            if (!res.ok) continue;
            const j = await res.json();
            indexJsons.push(j);
        } catch { /* ignore */ }
    }

    // Aggregate all chapters from all exams
    const chapterFiles = [];
    for (const indexJson of indexJsons) {
        for (const subject of indexJson.subjects || []) {
            for (const topic of subject.topics || []) {
                for (const chapter of topic.chapters || []) {
                    chapterFiles.push({ 
                        file: chapter.file, 
                        subject: subject.name, 
                        topic: topic.name, 
                        chapter: chapter.name 
                    });
                }
            }
        }
    }
    // ... rest of function
};
```

**Step 3: Dynamic Exam Category Extraction**

CRITICAL: Don't hardcode 'IBA' - extract from file path
```javascript
const toQuestionRecord = (questionFile, chapter) => {
    // Extract exam from file path: /ssc/english/... → SSC
    const parts = (chapter?.file || '').split('/').filter(Boolean);
    const exam_category = (parts[0] || 'IBA').toUpperCase();  // ⭐ Dynamic!
    
    return (questionFile.questions || []).map((q) => ({
        id: q.id,
        question_text: q.text,
        exam_category,  // ✅ Will be SSC, IBA, SAT, etc.
        // ... rest of record
    }));
};
```

**Step 4: Update PracticeConfig (`src/pages/PracticeConfig.jsx`)**

Merge subjects from multiple indexes
```javascript
useEffect(() => {
    const paths = ['/iba/index.json', '/ssc/index.json'];  // ⭐ All exams
    Promise.all(paths.map(p => 
        fetch(p).then(r => r.ok ? r.json() : null).catch(() => null)
    ))
    .then(results => {
        // Flatten all subjects from all exams
        const subjects = results.filter(Boolean).flatMap(r => r.subjects || []);
        setData({ subjects });
        if (subjects.length > 0) setSelectedSubject(subjects[0]);
    });
}, []);
```

### Key Principles

1. **Index as Single Source of Truth**
   - Each exam has `/public/{exam}/index.json`
   - Don't hardcode file paths in components
   - Add new exams by creating index.json

2. **Dynamic Categorization**
   - Extract exam name from file path, not metadata
   - Path: `/ssc/english/file.json` → exam = `SSC`
   - Prevents sync issues between data and category labels

3. **Aggregate Discovery**
   - Services fetch ALL indexes in a loop
   - Components merge results
   - New exams automatically appear without component changes

4. **Schema Mismatch Resolution**
   - SSC gap-filling has `blanks` array (not standard `options`)
   - Quiz.jsx has `normalizeSSCQuestions()` to convert blanks → MCQ on-the-fly
   - Never modify raw data; normalize at render layer

### Files Modified
- ✅ `/public/ssc/index.json` - Created
- ✅ `/public/ssc/english/gap_filling_with_clues_paper_11.json` - 30 questions restored
- ✅ `/src/services/api.js` - Multi-index fetch + dynamic exam_category
- ✅ `/src/pages/PracticeConfig.jsx` - Merged subject discovery
- ✅ `/src/pages/Quiz.jsx` - Already had SSC normalizer

### How to Add Next Exam (e.g., HSC)

```bash
# 1. Create index
mkdir -p /public/hsc/english
touch /public/hsc/index.json

# 2. Add HSC path to getAllJsonQuestions()
indexPaths = [..., '/hsc/index.json']

# 3. Add HSC path to PracticeConfig
paths = [..., '/hsc/index.json']

# Done! HSC subjects auto-appear
```

### Lesson for Future Agents
> **Multi-exam systems must:**
> - Use indexes as single source of truth (not hardcoded paths)
> - Extract metadata from file paths (not labels)
> - Aggregate discovery in services (not hardcode categories)
> - Handle schema differences at render layer (not data layer)
> - Document new exam additions for consistency

---

**Created by:** AI Agent  
**For:** Future AI Agents working on 80-20 Exam platform  
**Last Verified:** May 11, 2026

## LESSON 5: Removing External Services & Deployment Pitfalls

**Date Added:** May 11, 2026  
**Category:** DevOps / Frontend / Project Hygiene  
**Priority:** HIGH  
**Status:** 🟢 RESOLVED (process + checklist added)

### Issue

Removed Supabase from source code but production site and some environments still served a bundle that expected `supabaseUrl`, causing runtime errors. Separately, serving source `.jsx` files with a generic static server produced MIME-type errors.

### Root Cause

- The live GitHub Pages site was serving an older build (stale bundle) that still included Supabase usage.  
- Developer searches omitted ignored files (e.g., `node_modules/.vite/deps`) so traces in bundled metadata were missed.  
- A simple static server served source files (`*.jsx`) directly with MIME type `text/jsx`; browsers require transpiled `application/javascript` for module scripts.

### Fixes Applied

- Rebuilt the app and redeployed `dist` to GitHub Pages (`npm run build && npm run deploy`).  
- Advised using Vite dev/preview or a static server that serves built `dist` with correct MIME types (`npx serve -s dist`).  
- Verified source no longer references Supabase; searched ignored paths with `includeIgnoredFiles` to confirm any residual bundle metadata.

### Preventative Checklist (Add to PRs / Release Steps)

1. Remove package from `package.json` and run `npm install` to update `node_modules` and lockfile.  
2. Run a full build: `npm run build`.  
3. Search the built `dist` and `node_modules/.vite/deps` for the removed package name: `grep -R "supabase" dist node_modules/.vite -n || true`.  
4. Deploy the `dist` directory (GitHub Pages or provider) and verify the deployed assets' timestamps.  
5. Hard-refresh or clear CDN/Browser cache after deploy.  
6. Test the live site, open DevTools → Console & Network → check for runtime errors and that served JS files use `application/javascript`.

### Quick Commands

```bash
# rebuild and redeploy
npm run build
npm run deploy

# serve built site locally with correct MIME types
npx serve -s dist

# search ignored/bundled metadata for residual references
grep -R "supabase|supabaseUrl" dist node_modules/.vite -n || true
```

### Notes for Future Agents

- Always inspect the deployed assets (not just source) when debugging runtime mismatches.  
- Use `includeIgnoredFiles=true` when searching for removed dependencies to catch Vite/rollup metadata.  
- Avoid serving raw source `.jsx` files; use the project's dev server or a proper static server for `dist`.

