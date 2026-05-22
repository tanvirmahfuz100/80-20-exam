# BCS JSON Quality Audit Report

**Date:** 2026-05-22
**Scope:** All JSON files under `docs/BCS/` and `public/bcs/`

---

## 1. File Inventory

| Directory | JSON Files Found |
|-----------|-----------------|
| `docs/BCS/` | **0 JSON files** (8 subdirectories: BCS 35-48 — all contain only PDFs) |
| `public/bcs/` | **18 JSON files** (17 question bank files + 1 answer key) |

### `public/bcs/` files:
```
bcs_35.json   bcs_36.json   bcs_37.json   bcs_38.json
bcs_40.json   bcs_41.json   bcs_42.json   bcs_42_med.json
bcs_43.json   bcs_44.json   bcs_45.json   bcs_46.json
bcs_47.json   bcs_48_1.json bcs_48_2.json bcs_49.json
index.json
answers/42_bcs_answers.json
```

---

## 2. JSON Syntax / Parse Errors

**Result: PASS** — All 9,632 lines across 18 files parse without errors.

---

## 3. Record Counts (vs index.json)

**Result: PASS** — All 16 entries in `index.json` match actual record counts exactly.

| File | Index Count | Actual Count | Match |
|------|------------|-------------|-------|
| bcs_35 | 200 | 200 | ✅ |
| bcs_36 | 191 | 191 | ✅ |
| bcs_37 | 191 | 191 | ✅ |
| bcs_38 | 198 | 198 | ✅ |
| bcs_40 | 191 | 191 | ✅ |
| bcs_41 | 192 | 192 | ✅ |
| bcs_42 | 96 | 96 | ✅ |
| bcs_42_med | 100 | 100 | ✅ |
| bcs_43 | 191 | 191 | ✅ |
| bcs_44 | 189 | 189 | ✅ |
| bcs_45 | 179 | 179 | ✅ |
| bcs_46 | 184 | 184 | ✅ |
| bcs_47 | 193 | 193 | ✅ |
| bcs_48_1 | 95 | 95 | ✅ |
| bcs_48_2 | 99 | 99 | ✅ |
| bcs_49 | 92 | 92 | ✅ |
| **Total** | **2,581** | **2,581** | ✅ |

---

## 4. Missing / Empty Required Fields

**Result: FAIL** — Significant issues found.

### 4a. Missing Field Totals

| Field | Missing Count |
|-------|--------------|
| `id` | 0 |
| `question` | **0** |
| `question` (empty/blank) | **0** |
| `options` | 0 |
| `answer` | 0 |
| `explanation` | 0 |
| Duplicate IDs | 0 |

### 4b. Empty Answers (28 records)

Questions with blank `answer` field — **critical defects** (cannot be graded):

| File | Record IDs |
|------|-----------|
| `bcs_35.json` | 107 |
| `bcs_36.json` | 90, 114 |
| `bcs_37.json` | 47, 48, 53, 61, 68, 82, 109, 145, 152, 155, 156, 157, 158, 159, 160, 161, 162, 164, 167, 168, 172, 173, 178, 181, 182 |
| `bcs_38.json` | 26, 57-71 (15 records), 84 |
| `bcs_40.json` | 79, 103, 169, 182-191 (10 records) |
| `bcs_48_1.json` | 19, 26, 86, 89 |

### 4c. Non-Standard Answers (34 records)

Answers that are **not a single A/B/C/D letter** — application-side handling risk:

| File | ID | Non-standard Answer |
|------|-----|-------------------|
| bcs_41 | 60 | `110°` (numeric) |
| bcs_41 | 62 | `৪/৩৩` (fraction) |
| bcs_41 | 64 | `১১.১১% (আসন্ন ১/৯%)` (percentage) |
| bcs_41 | 70 | `প্রশ্নের অপশন ছাড়া নির্ধারণ সম্ভব নয়` (text description) |
| bcs_41 | 79 | `অপশন ও সমীকরণ প্রয়োজন` (text description) |
| bcs_41 | 80 | `উভয় ক্ষেত্র (ক্ষেত্র NOITАРТОА ও ক্ষেত্রবিচ্যুতি)` |
| bcs_41 | 165 | `সঠিক উত্তর সম্পর্কে নিশ্চিত না (সঠিক উত্তর নাই)` |
| bcs_41 | 168 | `সঠিক উত্তর নাই` |
| bcs_42 | 38 | `নাইট্রোজেন, ফসফরাস, পটাশিয়াম, সালফার, জিংক, বোরন` |
| bcs_42 | 62 | **CANCELLED** |
| bcs_42 | 68 | `সঠিক উত্তর নাই` |
| bcs_42 | 78 | `বাংলাদেশ/পাকিস্তান` |
| bcs_42 | 82 | `সঠিক উত্তর সম্পর্কে নিশ্চিত না` |
| bcs_43 | 20 | `সঠিক উত্তর নাই (সবগুলোই ভুল)` |
| bcs_43 | 25 | **CANCELLED** |
| bcs_43 | 64 | `n(n-1)/2 (n বিজোড়; অথবা n জোড়)` |
| bcs_43 | 65 | `সব গুলোই ভুল উত্তর` |
| bcs_43 | 66 | `কোনো ও কোনোটিই নয়` |
| bcs_43 | 68 | `প্রশ্নটির কোনো সঠিক উত্তর নেই (সঠিক উত্তর নাই)` |
| bcs_43 | 169 | `সঠিক উত্তর নাই (কোনোটিই নয়, সবকটি ভুল)` |
| bcs_43 | 173 | `কোনো সঠিক উত্তর নেই, যেকোনো একটি; তবে যুব ...` |
| bcs_44 | 11 | **CANCELLED** |
| bcs_44 | 27 | `সঠিক উত্তর নাই` |
| bcs_44 | 43 | `সঠিক উত্তর নাই/সঠিক উত্তর নির্ধারণ সম্ভব নয়` |
| bcs_44 | 147 | `প্রশ্নটির উত্তর নাই` |
| bcs_45 | 61 | `প্রশ্নটির সঠিক উত্তর নাই; ভুল প্রশ্ন সঠিক উত্তর` |
| bcs_45 | 103 | `সঠিক উত্তর নাই, সবগুলো ভুল` |
| bcs_45 | 106 | `প্রশ্নটির উত্তর নাই` |
| bcs_45 | 109 | **CANCELLED** |
| bcs_46 | 2 | `অনেকগুলো সমাধান সম্ভব, নির্দিষ্ট অপশন প্রয়োজন` |
| bcs_46 | 6 | `প্রশ্নটির উত্তর দেওয়া সম্ভব নয়, কারণ অপর্যাপ্ত তথ্য` |
| bcs_46 | 11 | `সঠিক উত্তর নাই` |
| bcs_46 | 30 | **CANCELLED** |
| bcs_46 | 49 | `সঠিক উত্তর নাই` |
| bcs_46 | 97 | **CANCELLED** |
| bcs_46 | 149 | `Global Stocktake, fossil fuel phase-out, loss and damage fund` |
| bcs_47 | 110 | **CANCELLED** |
| bcs_49 | 64 | **CANCELLED** |

**CANCELLED questions** (7 total): bcs_42:62, bcs_43:25, bcs_44:11, bcs_45:109, bcs_46:30, bcs_46:97, bcs_47:110, bcs_49:64

### 4d. Empty Options (47 occurrences)

Questions with one or more blank option slots:

| File | IDs | Affected Options |
|------|-----|-----------------|
| bcs_35 | 97 | B, C |
| bcs_36 | 5, 149 | B |
| bcs_36 | 179 | D |
| bcs_38 | 20, 164 | B |
| bcs_40 | 71, 77, 122 | B |
| bcs_40 | 98 | A, B, C |
| bcs_40 | 102 | A |
| bcs_42 | 40 | C, D |
| bcs_42_med | 35 | A |
| bcs_42_med | 82 | C |
| bcs_43 | 65 | A, B, C |
| bcs_43 | 66 | A, B |
| bcs_43 | 69 | A, C, D |
| bcs_44 | 92 | B |
| bcs_44 | 94 | C |
| bcs_44 | 99 | A, B, C |
| bcs_44 | 100 | A, B, C |
| bcs_45 | 101 | A, C, D |
| bcs_45 | 111 | A, B, C |
| bcs_46 | 79 | D |
| bcs_46 | 123 | B |
| bcs_48_1 | 3 | D |
| bcs_48_1 | 19 | A, B |
| bcs_48_1 | 89 | A, B |

### 4e. Empty Explanations (massive — ~1,143 records)

- `bcs_35.json`: **200/200** records have empty explanation
- `bcs_36.json`: **191/191** records have empty explanation
- `bcs_38.json`: **198/198** records have empty explanation
- `bcs_40.json`: **191/191** records have empty explanation
- Other files have **sporadic** empty explanations (bcs_37:1, bcs_41:2, bcs_42:4, bcs_43:6, bcs_44:4, bcs_45:5, bcs_46:3, bcs_49:3)

---

## 5. Duplicate IDs

**Result: PASS** — No duplicate IDs found within any file or across the dataset.

---

## 6. `index.json` Issues

**Result: WARN** — Minor data quality issues:

- The `code` field contains Bengali text for some entries (e.g., `????????` for bcs_46) or empty strings for others (bcs_35-40, bcs_48-49). The `id` field is the reliable identifier and correctly maps to filenames.
- All 16 entries have `id`, `name`, `questionCount` populated correctly.

---

## 7. `answers/42_bcs_answers.json` Issues

**Result: FAIL** — Contains **99 entries** (keys 1–100, missing key 83) while `bcs_42.json` only has **96 records** (IDs 1–96) with their own `answer` fields. The standalone answer file has keys **97–100** that have no corresponding questions in `bcs_42.json`.

This file appears to be a **redundant/outdated** artifact that disagrees with the primary data.

---

## 8. Sync: `docs/BCS/` vs `public/bcs/`

**Result: FAIL** — `docs/BCS/` contains **zero** JSON files. All source PDFs are in `docs/BCS/` but the derived JSON output lives exclusively in `public/bcs/`. There is **no automated or documented sync** pipeline between the two directories.

---

## 9. Overall Quality Score

| Category | Verdict |
|----------|---------|
| JSON Parse Validity | ✅ PASS |
| Record Count Consistency | ✅ PASS |
| Required Fields Present | ✅ PASS |
| Duplicate IDs | ✅ PASS |
| Empty Answers | ❌ FAIL (28 records — **ungradable**) |
| Non-Standard Answers | ❌ FAIL (34 records — **app code risk**) |
| Empty Options | ❌ FAIL (47 occurrences in 13 files) |
| Empty Explanations | ❌ FAIL (≈1,143 records — **severe data gap**) |
| index.json Quality | ⚠️ WARN (code field issues) |
| Standalone Answers File | ❌ FAIL (out of sync) |
| docs/BCS ↔ public/bcs Sync | ❌ FAIL (no JSONs in docs/) |
| **OVERALL** | **❌ FAIL** |

### Critical blockers for a PASS:
1. **28 questions have blank answers** — cannot be used in any quiz.
2. **34 questions have non-standard answers** — backend likely expects single-letter keys.
3. **~1,143 records (44%) lack explanations** — significantly degrades study value.
4. **docs/BCS has no JSONs** — the source-of-truth directory is out of sync with the distribution directory.
5. **Standalone answers file** is a detached, semi-conflicting artifact.
