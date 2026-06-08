# Specification Document: New User Onboarding & Experience

## 1. Overview
This document defines the end-to-end first-time user experience (FTUE), including unauthenticated usage, progressive profiling, content unlocking logic, and anti-bot measures. The core philosophy is **"Experience First, Register Later"** — no mandatory registration wall before value delivery.

---

## 2. Entry Point & First Interaction

### 2.1 No Immediate Registration Wall
- Upon first launch (app or website), do **NOT** show a login/registration screen.
- Direct users immediately to the value proposition.

### 2.2 Class/Exam Selection
- **Screen:** Clean, visually engaging selector.
- **Question:** "What are you preparing for?" or "Choose your goal."
- **Options:** Same list as registration (Class 1-8, SSC, HSC, BCS, IBA, SAT, GMAT, GRE).
- **One-Click:** Single tap selects and proceeds. No "Next" button required if design permits.
- **No Account Needed:** Selection is stored locally until registration.

---

## 3. The "Aha!" Moment (First Quiz Experience)

### 3.1 First Question Delivery
- Immediately after class/exam selection, launch a simple, universally understandable quiz question relevant to the chosen category.
- **Design Goal:** 90%+ users should answer correctly.
- **Tone:** Friendly, encouraging, zero intimidation.

### 3.2 Correct Answer Flow
1.  **Visual Reward:** Celebration animation, confetti, or star burst.
2.  **Explanation Card:** Show a concise, well-formatted explanation.
    - Highlight key concepts.
    - Use the moment to demonstrate the quality of your content.
3.  **Impression:** "That felt good. This app is smart."

### 3.3 Incorrect Answer Flow
1.  **Encouragement:** "Almost there! That's how we learn."
2.  **Star System Introduction:** Show a star rating for the attempt (e.g., ⭐ — "Good Try!").
3.  **Explanation Card:** Show the explanation clearly.
4.  **Impression:** "It's okay to fail here. This app supports me."

---

## 4. Product Tour (Post-First Quiz)

After the first quiz question (regardless of outcome), present a concise, swipeable product tour.

### 4.1 Tour Cards (3-4 screens max)
- **Card 1 — Gamified Quizzes:** "Thousands of fun, bite-sized quizzes. Earn XP and Gems as you learn."
- **Card 2 — Bite-Sized Lessons:** "Master concepts fast with short, focused lessons. Unlock new levels as you progress."
- **Card 3 — Leaderboard & Competition:** "See where you stand. Compete with friends and learners nationwide."
- **Card 4 — AI Explanations (Unlocked with Account):** "Stuck? Our AI tutor breaks down any question instantly. (Free with registration)"

### 4.2 Theme Selection
- **Placement:** After the tour, before landing in the app.
- **Prompt:** "Choose your theme:"
    - Default selection: **Dark Mode**
    - Option: Light Mode
- **Toggle:** Simple visual toggle or side-by-side preview.
- Can be changed later in settings.

### 4.3 Registration Call-to-Action
- **Screen:** After theme selection.
- **Primary Button (Highlighted):** "Sign Up Now — It's Free"
- **Secondary Link (Non-Highlighted, Subtle):** "Sign Up Later" (smaller font, lower contrast).
- **Tone:** Benefit-driven, not pushy.

---

## 5. Unauthenticated Usage & Content Unlocking

### 5.1 Content Locking Mechanism
- **Progressive Unlocking:** Level 1 unlocks Level 2. Level 2 unlocks Level 3. Sequential progression only.
- **Scope:** Applied to each subject → chapter → lesson.
- **Unauthenticated Limit:** Same locking logic applies, but without account, progress is stored locally and may be lost.

### 5.2 Lesson Structure
- Each lesson contains Level 1, Level 2, Level 3, etc.
- **Level 1:** Always free and playable without registration.
- **Level 2+:** Requires completion of previous level.

---

## 6. Registration Prompts (Progressive & Timed)

### 6.1 First Attempt — No Popup
- The very first quiz/lesson attempt is uninterrupted. Let them experience the product.

### 6.2 After First Lesson Completion
- **Trigger:** User finishes Level 1 of any lesson.
- **Popup Modal:**
    - **Headline:** "You're on fire! 🔥"
    - **Body:** "Track your progress, earn XP, and unlock AI explanations. Create your free account in 30 seconds."
    - **Buttons:** [Register Now] [Continue Learning]

### 6.3 Before Subsequent Attempts
- **Trigger:** User taps "Start" on any new quiz/lesson (from second attempt onward).
- **Soft Interruption:** A gentle popup reminding them:
    - "Register to save your progress and earn rewards!"
    - **Buttons:** [Register Now (prominent)] [Try Without Saving (subtle)]

### 6.4 XP & Gems for Unregistered Users
- **XP:** Cannot be accumulated without account. Display a lock icon on XP indicators with tooltip: "Register to earn XP."
- **Gems:** Same treatment.
- **Rewarded Ads:** Mention "Watch an ad to earn 2x XP (requires account)" — but do NOT show ads to unregistered users.

---

## 7. Progressive Profiling (Reluctant Users)

For users who consistently decline full registration, collect data incrementally.

### 7.1 Step 1: Name Collection
- **Trigger:** After completing several lessons (e.g., 3-5).
- **Prompt:** "Let's personalize your experience! What should we call you?"
- **Input:** Single text field — Full Name.
- **Auto-Username:** System auto-generates a username. No user choice required at this stage.
- **Username Change Policy:** Users may request username change via Tech Support. All requests reviewed manually.

### 7.2 Step 2: Contact Collection
- **Trigger:** After further engagement.
- **Prompt:** "Almost done! Add your phone or email so you never lose your progress."
- **Input:** Phone Number or Email Address.
- **Verification:** Follow same validation rules as Registration Module.

### 7.3 Database Tracking
Maintain verification status flags for all users:
| Status | Description |
|---|---|
| `unverified` | Neither email nor phone verified |
| `email_verified` | Only email verified |
| `phone_verified` | Only phone verified |
| `both_verified` | Both email and phone verified |

---

## 8. Content Moderation & Username Policy

### 8.1 Bad Word Detection
- **Real-time Filter:** Scan all submitted names and usernames against a profanity/bad-word dictionary (English + Bangla).
- **Auto-Flag:** Flagged accounts are queued for admin review.

### 8.2 Violation Handling
- **Temporary Lock:** Account is locked immediately upon admin confirmation of violation.
- **Resolution:** User must contact Tech Support to appeal or request a name change.
- **Policy:** Zero tolerance for offensive names. Lock requires admin approval; not automatic.

---

## 9. Anti-Bot & Security Measures

### 9.1 Suspicious Activity Detection
Monitor for the following patterns:
- Rapid, repeated screenshots of question pages.
- High-frequency copy events (Ctrl+C / long-press copy) on question content.
- Web scraping signatures (unusual request patterns, missing referrers, headless browser indicators).
- Erratic or non-human mouse movements (instant teleportation, perfectly linear paths).

### 9.2 Graduated Response
| Level | Trigger | Action |
|---|---|---|
| **1** | First suspicious signal | Serve a silent CAPTCHA challenge (e.g., reCAPTCHA v3). No user friction. |
| **2** | Repeated signals or failed Level 1 | Display a visible CAPTCHA (checkbox or image challenge). |
| **3** | Multiple failed CAPTCHAs or persistent high-risk behavior | **Lock account.** Requires admin approval to unlock. |
| **4** | Confirmed bot/scraper | Permanent ban. |

### 9.3 User Experience Protection
- **Do NOT challenge regular users.** Minimize false positives.
- Use passive detection (Level 1) as the primary defense.
- Only escalate to visible CAPTCHA when risk score is high.
- Locked accounts must be manually reviewed by an admin before action is taken.
- Contacting Tech Support is the only resolution path for locked accounts.

---

## 10. Monetization & Ads Policy

### 10.1 No Forced Ads
- Users will **never** see forced interstitial or banner ads.
- Ads are strictly **opt-in** and reward-based.

### 10.2 Rewarded Ads (Opt-In)
- **Placement:** "Watch an ad to double your XP" or "Watch an ad to earn 5 Gems."
- **User Choice:** A clearly labeled button. User must consciously tap to trigger.
- **Unregistered Users:** Button is visible but disabled/greyed out with tooltip: "Register to earn rewards."

---

## 11. In-App Tips & Guidance

- **Contextual Tooltips:** Use subtle tooltips to highlight features during first-time interactions.
    - Example: First time on quiz result screen → tooltip pointing to XP indicator: "Earn XP for every correct answer!"
- **Dismissible:** All tips are one-tap dismissible.
- **Never Intrusive:** Tips should guide, not interrupt.