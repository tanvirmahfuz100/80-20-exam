# Specification Document: Daily Quiz Segment

## 1. Overview
This document defines the Daily Quiz feature — a time-bound, cohort-based daily challenge appearing on the home screen. All users within the same Exam + Group + Medium cohort receive identical questions, refreshed at midnight Bangladesh Standard Time. The feature is designed to build a daily learning habit with intelligent, non-intrusive notifications.

---

## 2. Cohort Segmentation

### 2.1 Quiz Uniqueness Rule
- **Same Quiz For:** All users sharing identical:
    - Exam/Class (e.g., SSC)
    - Group (e.g., Business Studies)
    - Medium (e.g., Bangla Medium)
- **Example:** Every SSC → Business Studies → Bangla Medium user receives the exact same 5-question daily quiz.

### 2.2 Subject Distribution
- The 5 daily questions are drawn from **5 different subjects** relevant to the cohort's curriculum.
- **Selection Logic:** Rotate subjects daily to ensure balanced coverage across the syllabus over time.
- **No Repeats:** A question must not repeat within a rolling 30-day window for the same cohort.

---

## 3. Home Page Placement

### 3.1 Visual Location
- **Position:** Prominent, on the home screen.
- **Card/Section Design:**
  
    - Question count indicator: "5 Questions"
    - Time remaining: Countdown to next reset (e.g., "Resets in 14h 32m").
   

### 3.2 States
| State | Display |
|---|---|
| **Not Started** | "Start Today's Quiz" button, full brightness/color. |
| **In Progress** | "Continue Quiz" button with progress (e.g., "2/5 completed"). |
| **Completed** | Checkmark + "Completed! +45 XP" with faded/satisfied styling. |
| **Expired (Next Day)** | Locked/greyed out. Shows yesterday's result if completed, or "Missed" if skipped. |

---

## 4. Reset Schedule

### 4.1 Timezone
- **Reset Time:** 12:00 AM (midnight) **Bangladesh Standard Time (BST, UTC+6)** every day.
- **Rationale:** The majority user base is in Bangladesh. Resets align with the local calendar day.

### 4.2 Behavior at Reset
- Previous day's quiz is archived and no longer accessible for answering.
- New set of 5 questions is generated and deployed to all cohort members.
- Streak counters update based on whether yesterday's quiz was completed.

---

## 5. Scoring & Rewards

### 5.1 XP Awarded
- **Correct Answer:** +10 XP per question.
- **Maximum per Day:** +50 XP (5 questions × 10 XP).
- **Incorrect Answer:** 0 XP. No penalty, no negative scoring.

### 5.2 Star System Exclusion
- **Review Stars are NOT assigned** in Daily Quiz, regardless of performance.
- Stars remain exclusive to the Learning Mode progression system.
- **Rationale:** Keep Daily Quiz lightweight and low-stakes. Stars measure mastery over time; daily quizzes are engagement tools.

### 5.3 Streak Bonus
- **Consecutive Days:** Users completing the daily quiz for consecutive days earn bonus XP.
    - 3-day streak: +5 bonus XP
    - 7-day streak: +15 bonus XP
    - 30-day streak: +50 bonus XP
    - 100-day streak: Special badge + 100 bonus XP
- **Streak Freeze:** If a user misses a day, streak resets to 0. (Optional: Offer a "Streak Freeze" item purchasable with Gems, max 1 per week.)

### 5.4 Post-Completion Screen
- Summary of correct/incorrect per question.
- Total XP earned.
- Current streak counter with visual flame/streak icon.
- "Come back tomorrow!" message with next reset time.

---

## 6. Notifications

### 6.1 Notification Philosophy
- **Default:** Do not annoy. Respect user attention.
- **Goal:** Reinforce habit for interested users; do not harass disinterested users.

### 6.2 Notification Logic (Adaptive)

```

User's Daily Quiz Attendance (Last 7 Days)    →    Notification Behavior
─────────────────────────────────────────────────────────────────────
0-1 days attended     →    No push notification sent.
2 days attended       →    One notification at 9:00 AM BST.
3+ days attended      →    One notification at 9:00 AM BST + 
optional reminder at 6:00 PM BST if not yet completed.

```

### 6.3 Time Restrictions
- **No Midnight Notifications:** Notifications must never be sent between **10:00 PM and 8:00 AM BST**, unless the user explicitly opts in to "Night Owl" mode in settings.
- **Default Delivery Window:** 9:00 AM – 9:00 PM BST.

### 6.4 Notification Content
- **Title:** "Your Daily Quiz is Ready!"
- **Body:** "5 new questions are waiting. Keep your {streak_count}-day streak alive!"
- **Deep Link:** Tapping opens the app directly to the Daily Quiz section on the home page.

### 6.5 User Override (Settings)
Users may configure in Settings:
- Daily Quiz Notifications: **On (Smart)** | Off | Always (includes evenings)
- "On (Smart)" is the default adaptive behavior described in 6.2.

---

## 7. Edge Cases & Accessibility

### 7.1 Fresh Users (No History)
- First-time users see the daily quiz immediately.
- No streak counter displayed until they complete at least one daily quiz.

### 7.2 App Installed Mid-Day
- User sees the current day's quiz regardless of when they open the app.
- Full time remaining until midnight BST is shown.

### 7.3 Timezone Difference (Users Outside Bangladesh)
- Reset always follows BST (UTC+6), regardless of user's device timezone.
- The countdown timer on the UI must reflect the actual BST midnight, not the user's local midnight.

### 7.4 Offline Access
- Daily Quiz questions are pre-cached if possible.
- If no connection at submission time, queue answers locally and sync when online.
- XP awarded upon successful server sync, not local computation, to prevent manipulation.

---

## 8. Anti-Cheating & Integrity

### Question Pool Security
- Questions are served server-side and never fully exposed in client code.
- Answer validation happens server-side; client only sends selected option IDs.

---