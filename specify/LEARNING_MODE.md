```markdown
# Specification Document: Learning Mode

## 1. Overview
This document defines the core Learning Mode experience — a structured, gamified learning path combining bite-sized video/text content with immediate-feedback quizzing. The design draws inspiration from Khan Academy's content structure and Duolingo's roadmap visualization, with a reward system that sustains motivation without predatory monetization.

---

## 2. The Learning Path (Roadmap Visualization)

### 2.1 Visual Design
- **Inspiration:** Duolingo-style roadmap.
- **Layout:** A linear, scrollable path representing the user's journey through a subject/chapter.
- **Nodes:** Each node represents one unit, consisting of two sub-levels:
    - **Level 1: Watch & Read** (Learn)
    - **Level 2: Test Yourself** (Practice)
- **Progression Direction:** Top to bottom, with completed nodes visually distinct (e.g., filled/colored) and upcoming nodes greyed out or locked.

### 2.2 Unit Structure
Each unit on the roadmap follows this exact sequence:

```

┌─────────────────────────────────┐
│  UNIT N                         │
│  ┌───────────────────────────┐  │
│  │ Level 1: Watch & Read 📖  │  │
│  └───────────────────────────┘  │
│            ⬇                    │
│  ┌───────────────────────────┐  │
│  │ Level 2: Test Yourself ✏️ │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘

```

### 2.3 Unlocking Logic
- **Level 1 (Watch & Read):** Always accessible (with gem cost, see Section 4).
- **Level 2 (Test Yourself):** Unlocked only after completing Level 1 of the same unit.
- **Next Unit:** Unlocked after completing Level 2 of the previous unit.
- **Sequential Only:** No skipping ahead on the roadmap without completing prerequisites.

---

## 3. Level 1: Watch & Read

### 3.1 Content Format
- **Video:** A short, bite-sized instructional video.
    - **Duration:** 2-5 minutes maximum.
    - **Controls:** Play, pause, rewind 10s, playback speed (0.75x, 1x, 1.25x, 1.5x), captions.
    - **Orientation:** Auto-rotate to landscape when video is fullscreen.
- **Text Summary:** Displayed below the video after it ends (or collapsible during playback).
    - **Format:** Bullet points, key formulas, vocabulary, or concept summaries.
    - **Purpose:** Reinforce video content; accessible for reading-preferred learners.

### 3.2 Completion Criteria
- Video must be watched to at least 80% completion, OR user manually marks "I'm ready" if they scroll through the text summary.
- A checkmark appears on the unit node upon completion.

### 3.3 Quiz Option Without Learning
- **Allowed:** User can navigate directly to Level 2 (Test Yourself) without completing Watch & Read first.
- **Friction Mechanism (Soft Nudge):**
    - On tapping Level 2 without completing Level 1, display a modal:
        - **Icon:** 📚
        - **Message:** "Hey! You haven't watched the lesson yet. You'll do much better if you learn first."
        - **Primary Button (Prominent):** [Watch Lesson Now]
        - **Secondary Button (Subtle, lower opacity):** [Skip to Quiz Anyway]
    - **Tone:** Encouraging, not guilt-tripping. Never use aggressive language like "Are you sure you're smart enough?"
- **Rationale:** Frustration should be mild — enough to nudge learning-first behavior, but never to the point of app abandonment. Educational integrity balanced with user autonomy.

---

## 4. Gem Economy & Access Cost

### 4.1 Watch & Read Cost
- Accessing Level 1 (Watch & Read) costs **1 Gem** per unit.
- **Insufficient Gems:** Display "Need 1 Gem to unlock this lesson. Earn gems by completing quizzes!"

### 4.2 Test Yourself Cost
- **Free:** Level 2 (Test Yourself) costs zero Gems.
- **Rationale:** Quizzing is the core engagement loop; removing friction here maximizes learning repetitions.

### 4.3 Gem Acquisition
- Completing Level 2 (Test Yourself) rewards Gems.
- Opt-in rewarded ads (see Section 7).

---

## 5. Level 2: Test Yourself (Quiz)

### 5.1 Feedback Model: Instant
- **Per-Question Feedback:** Immediately after submitting each answer.
- **Correct Answer:**
    - Green highlight/checkmark animation.
    - Brief positive reinforcement: "Correct! ✅"
    - Show explanation (expandable/collapsible).
- **Incorrect Answer:**
    - Red highlight on wrong selection.
    - Green highlight on correct answer.
    - Message: "Not quite. Here's why..."
    - Show full explanation.
- **No Timer:** Learning mode is untimed. User can take as long as needed.

### 5.2 Question Format
- Multiple choice (default).
- True/False.
- Fill in the blank (single word/number).
- **No long-form typing** in learning mode (reserved for exam mode).

### 5.3 Progression Within Quiz
- Fixed set of questions per unit (e.g., 5-10 questions).
- Progress bar showing current question out of total.
- All questions must be answered to complete Level 2.

---

## 6. Inter-Level Rewards

### 6.1 Between Levels (Within Same Unit)
- After completing Level 1, before entering Level 2:
    - Small animation: Gem +1 added to balance.
    - Message: "Lesson complete! +1 Gem 💎"

### 6.2 After Level 2 Completion (Unit Complete)
- **Reward Screen:**
    - XP earned (calculated based on accuracy and speed).
    - Gems earned.
    - Streak indicator (if applicable).
    - Progress on roadmap updates visually.

### 6.3 Double Reward Offer (Opt-In Ad)
- **Trigger:** After completing Level 2 of any unit.
- **Prompt:**
    - "🎉 Great job! Watch a short educational ad to **double your XP and Gems** for this unit."
    - **Button 1:** [Watch Ad & Double Rewards] (prominent)
    - **Button 2:** [Claim Regular Rewards] (subtle)
- **Ad Content Rule:** All ads shown within the app must be **educational** in nature (e.g., other learning apps, educational tools, scholarship announcements, academic services). No gaming, gambling, or unrelated consumer ads.

---

## 7. Advertising Policy (Learning Mode Specific)

### 7.1 Ad Standards
- **Educational Only:** Ads must promote learning products, educational services, academic tools, or skill development programs.
- **No Interruptions:** Ads are never forced or interstitial.
- **Opt-In Only:** Every ad view is a conscious user choice tied to a clear reward.

### 7.2 Ad Placements
| Placement | Trigger | Reward |
|---|---|---|
| Post-Unit Completion | After Level 2 results screen | 2x XP + 2x Gems for that unit |
| Gem Shop (future) | User actively requests | Bonus Gems |

### 7.3 Unregistered Users
- See Section 6.4 and 10.2 of the Onboarding Specification. Ad buttons visible but disabled with registration prompt.

---

## 8. Contrast: Learning Mode vs. Exam Mode

| Feature | Learning Mode | Exam Mode |
|---|---|---|
| **Content Delivery** | One question at a time | All questions visible, scrollable top to bottom |
| **Feedback Timing** | Instant (per question) | Delayed (after full submission) |
| **Timer** | None | Timed |
| **Purpose** | Practice & learn | Assess & simulate real exam |
| **Navigation** | Sequential, locked path | Free navigation between questions |
| **Pause/Resume** | Allowed | Not allowed (or strict time penalty) |

---

## 9. User Experience Principles (Learning Mode)

1.  **Frustration-Free by Design:** Nudges toward learning-first behavior must be gentle. The user should never feel punished or shamed.
2.  **Instant Gratification:** Feedback loops are immediate. Every action has a visible, satisfying response.
3.  **Transparent Economy:** Gem costs and rewards are clearly displayed. No hidden costs or surprise paywalls.
4.  **Educational Integrity:** Even monetization (ads) must align with the app's educational mission.
5.  **Progress Visibility:** The roadmap always shows where the user is, where they've been, and what's next.
```