# AGENTS.md — Agent Skills & Knowledge Base

> Start here. This file indexes all available knowledge sources.

---

## Quick Navigation

| File | Purpose |
|------|---------|
| [CODEBASE.md](./CODEBASE.md) | Full codebase map: directories, imports, data flow, types, patterns |
| [BUSINESS_RULES.md](./BUSINESS_RULES.md) | Product rules: question types, test modes, scoring, rewards |
| [docs/DESIGN.md](./docs/DESIGN.md) | UI/UX design rules: theme tokens, Tailwind conventions, border/spacing guidelines |

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
