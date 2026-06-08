# Specification Document: Registration Module

## 1. Overview
This document outlines the functional, validation, and user experience requirements for the Registration flow. Registration is mandatory only for accessing premium/progress features; a limited guest mode is available.

---

## 2. Guest Mode (Unregistered Users)

### 2.1 Access Without Registration
- Users may use the app without creating an account.
- **Content Limitation:** Only the first lesson/level of each subject and chapter is unlocked.
- **Lock Indicator:** Locked content must show a lock icon with a "Register for Free to Unlock" call-to-action.

### 2.2 Conversion Prompts (Nudges)
- **Persistent Banner:** A non-dismissible (but collapsible) banner visible on the home/dashboard screen: "Unlock tracking, AI explanations, and more — completely free."
- **Session Start Popup:** At every new app launch (cold start), display a modal:
    - **Headline:** "Don't Miss Out!"
    - **Body:** "It's free to register. Get access to:"
        - ✅ Track Your Progress
        - ✅ Understand Your Performance Better
        - ✅ Unlock All Features
        - ✅ AI Explanations
    - **Buttons:** [Register Now] [Maybe Later]
- **Annoyance Factor:** The popup must trigger every session start, but never more than once per 30 minutes to prevent rage-clicks.

### 2.3 Social Registration
- Guest users can register via:
    - Google
    - Facebook
    - Apple

---

## 3. Registration Form (Step 1 of 2)

### 3.1 Full Name
- **Field:** Text input.
- **Validation:** Required. Minimum 2 characters. Allow spaces and periods (e.g., "Md. Rahman").

### 3.2 Username
- **Generation:** Auto-generated from the full name in real-time (e.g., `john_doe`).
- **Editable:** User can edit the auto-generated username.
- **Availability Check (Async):**
    - **Green Tick (✅):** Username is unique and available.
    - **Red Cross (❌):** Username is taken. Show inline message: "This username is taken. Try another."
    - **Loading Spinner:** While checking availability, show a spinner.
    - **Constraint:** No duplicate usernames allowed in the database.

### 3.3 Email Address
- **Validation Rules:**
    - Must contain `@` and a valid domain with a period (`.`).
    - **Disposable Email Blocking:** Reject domains from known temporary email providers (e.g., `mailinator.com`, `10minutemail.com`, etc.). Maintain a regularly updated deny-list.
- **Error Message:** "Please enter a valid email address" (generic, do not reveal if the domain is blocked specifically — just treat as invalid).

### 3.4 Phone Number
- **Default Region:** Bangladesh (+880).
- **Input Handling (Server-side formatting):**
    - User types: `01884581816` → Store as: `+8801884581816`
    - User types: `+8801884581816` → Keep as is.
    - User types: `1884581816` → Prefix with `+` → `+8801884581816` (if pattern matches `1XXXXXXXXXX`).
    - Remove hyphens automatically: `01884-581816` → `01884581816`.
- **Digit Logic:** Valid BD numbers are 11 digits excluding country code.
- **Pre-Submission Confirmation:**
    - Before sending the OTP, display a modal:
        - "Is this number correct? We will send a verification code to **+8801884581816**."
        - Buttons: [Edit] [Yes, Send Code]
    - *Rationale:* Preserve SMS budget by preventing typos.

### 3.5 Academic Profile
- **Class/Exam Selection (Dropdown):**
    - Class 1
    - Class 2
    - Class 3
    - Class 4
    - Class 5
    - Class 6
    - Class 7
    - Class 8
    - SSC
    - HSC
    - BCS
    - IBA Admission
    - SAT
    - GMAT
    - GRE

- **Conditional Field: Group** (Visible only if SSC or HSC is selected)
    - Radio Buttons: `Science | Business Studies | Arts`
    - Required.

- **Conditional Field: Medium** (Visible only if Class 1-8, SSC, or HSC is selected)
    - Radio Buttons: `English Medium | Bangla Medium`
    - Required.

### 3.6 Duplicate Detection
- **Trigger:** On form submission (and optionally on email/phone field blur).
- **Logic:** Check database for existing Email OR Phone number.
- **Conflict Handling:**
    - Block registration.
    - Show message: "This email or phone number is already registered."
    - Provide action link: "Forgot Password? Recover your account."

### 3.7 Privacy Policy Consent
- **Checkbox:** "I agree to the [Privacy Policy] and [Terms of Service]."
- **Validation:** Required. Button remains disabled until checked.

### 3.8 Register Button
- Text: "Create Free Account"
- **All fields are required.** Button remains in disabled state until all validations pass.

---

## 4. Verification (Step 2 of 2)

### 4.1 Default Method: Phone SMS
- An OTP is sent to the verified phone number.
- **Page:** Dedicated "Verify Phone Number" screen.

### 4.2 Fallback Method: Email
- **Trigger:** User taps "Verify with Email Instead".
- **Condition:** Available ONLY if SMS service is down, OR user explicitly chooses it.
- **Logic:** If phone is provided, user MUST verify at least one channel. If SMS fails to send after 30 seconds, automatically surface the email option prominently.

### 4.3 OTP Rules
- Apply the same OTP logic defined in the Login/Recovery specification:
    - 3-minute expiry.
    - Resend cooldowns (1 min, 2 min, 5 min).

---

## 5. Post-Registration
- On successful verification, redirect to the Dashboard.
- All previously locked content is immediately accessible.
- Guest data (if any was stored locally) may be merged into the new account.