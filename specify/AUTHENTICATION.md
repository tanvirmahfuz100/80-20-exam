# Specification Document: Authentication Module (Login & Recovery)

## 1. Overview
This document outlines the functional and non-functional requirements for the user authentication layer, covering Sign-In, Registration, Password Recovery, and Technical Support escalation.

---

## 2. Login Page (Sign-In)

### 2.1 Identifier Input
- **Accepted Credentials:** Email address or Phone number.
- **Username Restriction:** Login via Username is disabled by default.
    - *Rationale:* Usernames are public. Allowing login via username creates a vulnerability vector where an attacker only needs to guess a password.
    - *Exception:* Users may enable "Allow username login" manually in Account Settings. This is off by default.

### 2.2 Password Field & Visibility Toggle
- **Mechanism:** A visibility toggle (Eye icon) must be present inside the password field.
- **Interaction Model (Press & Hold):**
    - The password remains hidden by default (masked characters).
    - To view the password, the user must **press and hold** the Eye icon.
    - **Do NOT** implement a single-tap toggle. A tap-to-toggle risks accidental exposure of the password.
    - Releasing the icon immediately re-masks the password.

### 2.3 Error Handling & Feedback
- **Vague Error Messaging:** If the identifier or password is incorrect, the system must display a single, static error message:
    - `"Email or Phone Number or Password is incorrect"`
- **Information Leakage Prevention:** The system must never reveal which part of the credential set is wrong. Do not say "Email not found" or "Password is wrong" specifically. This prevents enumeration attacks.

### 2.4 Rate Limiting & Lockout Policy
- **Trigger:** 5 consecutive failed attempts from a single fingerprint/IP.
- **Window:** 2 minutes.
- **Penalty:** Login prevention for 5 minutes.
    - Existing sessions on other devices remain active. Only new login attempts are blocked.
- **Reset:** Successful login or timeout expiration.

### 2.5 Session & Device Management
- **Device Limit:** Maximum of 2 active concurrent sessions per account.
- **Overflow Logic (FIFO):** If a 3rd device attempts to log in successfully:
    1. The oldest active session is automatically invalidated (logged out).
    2. The new device and the remaining old device are kept active.
    3. User does not receive a prompt; the oldest device simply loses its token.

### 2.6 Social Sign-In (OAuth)
Users must be able to authenticate via the following providers:
- Google
- Facebook
- Apple

### 2.7 Password Recovery Prompt
- On a failed login attempt, highlight the "Forgot Password?" link visually (e.g., change color or add a subtle animation) to guide the user, without confirming that the identifier existed.

---

## 3. Password Recovery Flow

### 3.1 Step 1: Identifier Submission
- **Page:** Dedicated "Forgot Password" page.
- **Input:** Email or Phone Number.
- **Action:** "Send OTP".

### 3.2 Step 2: OTP Verification
- **Delivery:** OTP sent via email or SMS based on the provided identifier.
- **OTP Validity:** 3 minutes.
- **Page:** Dedicated "Enter OTP" page.
- **Resend Logic (Cooldowns):**
    - 1st Resend: 1 minute wait.
    - 2nd Resend: 2 minutes wait.
    - 3rd Resend: 5 minutes wait (Final attempt).
- **Rate Limit (Short-term):** Maximum 3 resend requests per recovery session.
- **Rate Limit (Long-term/Bot Mitigation):** 3 distinct "Forgot Password" requests per day.
    - If a 4th request is triggered, display: `"Contact Tech Support to proceed."` Ban the user from the automated flow for 1 week to prevent SMS/Email bombing costs.

### 3.3 Step 3: Password Reset
- **Page:** Dedicated "Create New Password" page (accessible only after valid OTP).
- **Input Fields:**
    - New Password
    - Confirm New Password
- **Validation:** Passwords must match. Standard strength requirements apply (min 8 chars, alphanumeric + special).

---

## 4. Technical Support Escalation

### 4.1 Access
- Available via the "Contact Tech Support" link shown during lockouts or bans.

### 4.2 Form Schema
The support form must capture the following explicitly:
- **Text Input:** Username (optional, for context)
- **Text Input:** Email or Phone (mandatory for reply)
- **Drop Down:** Issue Category (Login Issue, Account Ban, OTP Not Received, etc.)
- **Text Area:** Problem Description

### 4.3 Implicit Data Collection (System Metadata)
The following must be attached to the submission payload automatically to diagnose the issue:
- Device Information (OS, Model)
- Browser User-Agent
- App Version (if applicable)
- Timestamp (UTC)
- Network IP Address

### 4.4 Response Mechanism
- **Online Users (Active Browser/App):** Initiate a tech support chat session via in-app notification.
- **Offline Users:** Response is sent manually via Email to the provided address.
- **Internal Notification:** Support form submissions trigger an email to `tech-support@company.com`.

---

## 5. Registration Page

### 5.1 Visibility
- The registration option must be clearly distinct from the Login UI ("Don't have an account? Sign Up").
- The registration flow is a separate page, not a modal, to ensure clarity.

---

## 6. Architecture Standards
- **Page Separation:** Login, Registration, Forgot Password (Identifier input), OTP Verification, and Reset Password are distinct, separate routes/endpoints. No dynamic switching of components on a single route.