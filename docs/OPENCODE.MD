# 80-20 Exam Platform - Technical Analysis

## System Overview

This is a React-based exam preparation platform built with Vite, Tailwind CSS, and Supabase backend. It serves as a comprehensive learning management system for students preparing for various competitive exams (IBA, BCS, Bank Jobs, Medical, Engineering).

### Technology Stack

| Category | Technology |
|----------|------------|
| Frontend | React 19, Vite 7, React Router DOM 7 |
| Styling | Tailwind CSS 3.4, Lucide React icons |
| Backend | Supabase (Auth, Database, Realtime) |
| Build | npm, gh-pages for deployment |
| Utilities | PapaParse (CSV), clsx, tailwind-merge |

---

## How The System Works

### Authentication Flow

1. **Supabase Auth** handles user registration/login via email
2. **AuthContext** (`src/context/AuthContext.jsx`) manages auth state globally
3. On login, profile is fetched/created in `profiles` table
4. Role-based access: `student`, `content_admin`, `super_admin`
5. Special hardcoded admin: `tanvirmahfuz100@gmail.com` auto-assigned `super_admin`

### Core Features

| Feature | Implementation |
|---------|---------------|
| **Question Bank** | Filterable questions from Supabase with pagination |
| **Quiz/Practice** | JSON-based or DB-based questions with timed mode option |
| **Mock Tests** | Full-length tests with timer, auto-submit |
| **Video Shorts** | TikTok-style vertical video feed |
| **Analytics** | User stats: accuracy, time spent, practice count |
| **Admin Panel** | CRUD for courses, questions, videos, users, bulk CSV upload |

### Data Flow

```
User → AuthContext → API Layer (api.js) → Supabase → Database
                                   ↓
                            Role Checks → ProtectedRoute
```

---

## Missing Features & Gaps

### High Priority

1. **No Password Strength Validation** - Register accepts any password (minimum 6 chars)
2. **No Email Verification** - Email confirmations not enforced
3. **Incomplete Quiz Submission** - `time_spent` always 0, no per-question timer tracking
4. **Mock Test Results Not Saved** - Results displayed but not persisted to DB
5. **No Leaderboard** - Analytics shows "global rank" placeholder but no real data
6. **No Notification System** - In-app notifications are static/hardcoded
7. **No Subscription/Payment Integration** - Premium content checks exist but no payment flow

### Medium Priority

8. **Hardcoded Admin Email** - Security anti-pattern in `AuthContext.jsx:32`
9. **No Input Sanitization** - XSS vulnerable in quiz explanations (`Quiz.jsx:363-368`)
10. **Missing Pagination** - Question bank limits to 100, no server-side pagination
11. **No Search Functionality** - Question bank search is client-side only (filter after fetch)
12. **Video Feed Missing Real Data** - Falls back to static sample videos
13. **No Progress Tracking** - Course progress table exists but not used fully

### Low Priority

14. **No Two-Factor Authentication**
15. **No Password Reset Email Customization**
16. **No Activity Logging for Users** - Only admin logs exist
17. **No Data Export** - Users cannot export their progress

---

## Security Loopholes to Check & Fix

### Critical (Fix Immediately)

| Issue | Location | Risk |
|-------|----------|------|
| **Hardcoded Admin** | `AuthContext.jsx:32,107` | Anyone can know the admin email |
| **XSS in Quiz Explanations** | `Quiz.jsx:363-368` | User-provided HTML rendered unsanitized |
| **No RLS Policies Check** | Database | Potential data leaks |
| **Admin Role Escalation** | `Admin.jsx:120-130` | Any admin can escalate any user to super_admin |

### High Priority

| Issue | Location | Risk |
|-------|----------|------|
| **No Rate Limiting** | API calls | Brute force attacks possible |
| **Weak Password Policy** | Register | 6-char minimum too weak |
| **Missing CSRF Tokens** | Supabase | Should use Supabase's built-in |
| **Console Logging Sensitive Data** | Multiple files | Leaks user info in browser console |

### Medium Priority

| Issue | Location | Risk |
|-------|----------|------|
| **No Input Validation** | Admin bulk upload | CSV injection possible |
| **Missing Error Boundaries** | React components | App crashes leak info |
| **JWT Tokens in Memory** | Supabase client | Memory-only (ok, but should rotate) |

---

## Recommendations for Improvement

### Immediate Actions

1. **Remove hardcoded admin email** - Use database role assignment only
2. **Sanitize HTML in quiz** - Use DOMPurify or strip all HTML tags
3. **Add RLS policies** - Ensure Supabase row-level security is properly configured
4. **Fix quiz time tracking** - Implement per-question timer

### Short-term (1-2 months)

5. Implement proper password requirements (8+ chars, mixed case, numbers, symbols)
6. Add email verification enforcement
7. Build subscription/payment flow (Stripe integration)
8. Implement server-side search with proper pagination
9. Add comprehensive activity logging for all user actions

### Long-term (3-6 months)

10. Build AI-powered recommendation engine using activity_logs
11. Create real-time leaderboard with WebSocket updates
12. Implement spaced repetition algorithm for question scheduling
13. Add collaborative features (study groups, challenges)
14. Build mobile app (React Native) with offline mode

### Code Quality

- Add TypeScript for type safety
- Implement error boundaries on all pages
- Add unit tests (Vitest/Jest) for critical flows
- Set up ESLint with security plugins
- Add proper loading states and error handling throughout

---

## Database Schema (Implied Tables)

```sql
-- Likely tables based on code analysis
profiles, questions, options, courses, lessons
course_progress, user_responses, mock_tests
mock_test_questions, mock_test_results, short_videos
video_engagement, subscriptions, activity_logs
admin_logs, reports
```

---

## Conclusion

The platform is functional and well-structured with modern React patterns. The main concerns are security (hardcoded admin, XSS, RLS) and missing features (payments, real leaderboard, proper analytics). Focus first on hardening security, then implementing the missing core features before adding advanced functionality.

Generated: April 2026
