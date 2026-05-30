# Business Rules — 80-20 Exam (Fireman)

---

## Database Architecture

Two separate databases are required: one for questions, one for user data.

If the same question appears across multiple exams or years, it is stored only once. The year and exam columns hold multiple values separated by commas.

---

## Content Quality Control

Review occurs twice a month. AI reviews the question database for duplicates, wrong answers, wrong options, and incorrect questions. The AI flags issues only — it does not change anything itself. A human fixes whatever the AI reports.

---

## Question & Answer Rules

- If a question has no Option E, Option E is not shown in the app at all.
- All possible answer edge cases must have explanations.

### Answer Methods by Question Type

| Question Type | Answer Method |
|--------------|--------------|
| With Clues | Click & Drop |
| Without Clues | Type / MCQ |
| Substitution Table | Drag & Drop |
| Right Forms of Verb | Two-Step Click & Drop with Wheel-Scroller (Double Tap) |
| Tag Question | MCQ |
| Changing Sentence | MCQ |
| Suffix-Prefix | Single Wheel-Scroller |
| Preposition Type | Type (no clue) / Click & Drop (with clue) |
| Punctuation | MCQ, Single-Line Question |
| Completing Sentence | MCQ |
| Connectors | Linkers |
| Narration | Multiple-Step MCQ |
| Modifier | MCQ |

### Question Types Supported

- MCQ
- Fill in the Blanks
- Drag and Drop
- True/False
- Editor's Choice (AI-generated based on patterns from real exam questions)

---

## Test Modes

### Learning Mode
No timer. No question count limit. The user goes through all available questions at their own pace. Each answer gets instant feedback. The user must get a question right before moving to the next one.

### Exam Mode
Questions are randomized based on the exam type and the user's level. Both timed and untimed options are available. Feedback is shown only after the exam ends, not during. Ranking is based on Exam Mode only.

### Test Formats
- Full Test
- Chapter-wise
- Time-based
- Unlimited Timed Test
- Negative marking can be turned on or off per test

---

## Performance & Ranking

- **Accuracy** = Correct Answers / Questions Attempted
- Time is tracked overall, by chapter, and by topic
- **Rank** is calculated using both accuracy and time: the most accurate user in the least time ranks highest
- A note is shown to students: "Cheating here only cheats your future self."

---

## User Growth Tracking

Users are notified when they have improved in a specific area. Their activity and interest data is logged for personalization.

---

## AI Assistance Button

If a user wants to explore a question further, a button redirects them to a popular AI platform with the question text pre-filled so they can continue the conversation there.

---

## Bookmarks

Users can bookmark questions they want to revisit. The system saves only the question ID, not the full content, to keep storage light.

---

## Dashboard

Shows overall progress, current rank, streaks, coins, and level in one place.

---

## Rewards

Coins, levels, and streaks keep users motivated.

---

## Sound Effects

Sound effects are included throughout the experience.

---

## Animations

Animations are on by default. Users can turn them off for a faster experience.

---

## Brand Identity (To Be Defined)

Mascot, color palette, and font selection are needed for the platform's visual identity.

---

## Encouragement Philosophy

Use yellow and stars to show mistakes. Do not use red, error, or warning signs. Do not discourage students from making mistakes. Treat mistakes as points to earn.

---

## Group Subjects

| Level | Groups |
|-------|--------|
| Class 5-8 | Group 1 |
| SSC | Science, Commerce, Arts (all subjects) |
| HSC | Science, Commerce, Arts (all subjects) |

---

## Currency & Paywall

### How to Earn
- 10 hints free per day
- Watch an ad to earn more hints
- *(More ways TBD)*

### Where to Spend
- *(TBD — e.g., unlock hints, premium content, cosmetic items)*

### Paywall
- *(TBD — subscription tiers, feature gates)*
