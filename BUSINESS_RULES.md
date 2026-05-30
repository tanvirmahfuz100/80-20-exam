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

### Keeping Students Motivated
- Users (students) gets overwhelmed seeing 200-300 questions to solve. That is why we implemented Leveling system. Instead of solving 300 questions at one sitting, students will see questions are properly and logically segmented into levels. After completing each levels, users would be able to collect rewards, that will keep them do finish more levels, eventually finishing 300 questions on their own pace.

- But we will give students challenges such as completing so and so levels on so and so time. If completed, they will receive rewards such as XP (XP will increase their rank) and Gems (but gems are rarer, they would mostly collect gems through purchasing or watching ad. maybe sometimes we would offer them to watch an ad and doubling their XP and getting a gem or two. we will never force them to watch ad even though it is our main revenue models.).

- Students should never feel bored. They should feel engaged and motivated by learning. For 3 correct answers in a row, give them XP. For 5 correct answers in a row, give them more xp. For 10 or more correct answers, give them more XP.

- We do not even discourage students to make mistakes. Mistakes are not shown in red or X. We show it yellow star. A star has to be collected. A mistake has to be reviewed. Mistakes are oppurtnuities to learn. A star balance can be accessed from home page or menu, notifications will remind of stars. stars are collected through spaced repeatation methods (day 1, day 3, day 7, day 14, day 30). stars will be a bit annoying for a good reason. incompleted stars will prevent from accessing further lessons to a limit. We do not want students to pilling up massive amounts of stars which led them to be afraid and never return or touch the app again. We want them to give stars, but also keep them in managable poisition.

- The stars can be also accessed from subject grids. Users will be able to see if they have stars pending for each subjects. Give them a friendly pop up message, very small, just to encourage them to collect stars on time. Without completing that day's review, they should not be able to access anything that day. Opening the app would make them review their pending stars first. But hey, if there are many many stars like 50+, you know it is overwhelming too. Let them review, 5 stars first and give them a Review Later button.

- Be annoying but to keep them motivated. Be anoying as long as it helps them. Be annyoing as long as it is helping them. Users love instant feedbacks, instant support. Make sure you give them clues here and there, obviously when they are in the Learning mode.