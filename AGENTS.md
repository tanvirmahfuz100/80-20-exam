# AGENTS.md — Agent Skills & Knowledge Base

> Start here. This file indexes all available knowledge sources.

---

## Quick Navigation

| File | Purpose |
|------|---------|
| [CODEBASE.md](./CODEBASE.md) | Full codebase map: directories, imports, data flow, types, patterns |
| [BUSINESS_RULES.md](./BUSINESS_RULES.md) | Product rules: question types, test modes, scoring, rewards |
| [docs/DESIGN.md](./docs/DESIGN.md) | UI/UX design rules: theme tokens, Tailwind conventions, border/spacing guidelines |
| [specify/](./specify/) | Agent instructions & specs — features, pages, ideas, notes written by you |

## Available Skills

| Skill File | What It Covers |
|------------|---------------|
| [skills/html-to-json-extraction.md](./skills/html-to-json-extraction.md) | Extract MCQ questions from chorcha.net HTML using PowerShell |
| [skills/adding-new-subject.md](./skills/adding-new-subject.md) | Steps to add a new exam subject to the question bank |
| [skills/error-handling.md](./skills/error-handling.md) | ErrorBoundary patterns, loading states, data-fetching errors |
| [skills/codebase-navigation.md](./skills/codebase-navigation.md) | How to find files, routes, data flow, and key conventions |

## Scripts

| Directory | Purpose |
|-----------|---------|
| `scripts/data-extraction/` | Scraping/parsing question data from external sources |
| `scripts/data-fix/` | Transforming, fixing, and migrating question data |
| `scripts/audit/` | QA, deduplication, and verification tools |
| `scripts/archive/` | One-off translations and temporary data |
| `scripts/generate-codegraph.mjs` | Auto-generates codebase dependency graph |

## How to Use

1. **New to the codebase?** Read [CODEBASE.md](./CODEBASE.md) and [skills/codebase-navigation.md](./skills/codebase-navigation.md)
2. **Adding questions?** Read [skills/html-to-json-extraction.md](./skills/html-to-json-extraction.md) and [skills/adding-new-subject.md](./skills/adding-new-subject.md)
3. **Debugging UI issues?** Read [docs/DESIGN.md](./docs/DESIGN.md)
4. **Understanding product rules?** Read [BUSINESS_RULES.md](./BUSINESS_RULES.md)
5. **Handling errors?** Read [skills/error-handling.md](./skills/error-handling.md)
6. **Working on gamification features (XP, streaks, levels, shop)?** Read [AGENT_LESSONS.md](./AGENT_LESSONS.md) lessons 15-21 — covers weighted XP, level-up detection, active_items pattern, leaderboard/insight opt-out
7. **Extending the Question Bank (bookmarks, fuzzy search, BCS format)?** Read [AGENT_LESSONS.md](./AGENT_LESSONS.md) lessons 18-20 — BCS array-index, fuzzy Levenshtein, bookmark lifecycle
8. **Fixing quiz type errors?** Read [AGENT_LESSONS.md](./AGENT_LESSONS.md) lesson 21 — `NormalizedQuestion` must be defined in `src/types/index.ts`
9. **Building a new feature/page?** Check [specify/](./specify/) for the spec file first, then read relevant codebase docs
10. **Following agent instructions?** Visit [specify/](./specify/) when a task mentions a spec file or when you need detailed requirements
