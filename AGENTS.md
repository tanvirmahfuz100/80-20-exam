# AGENTS.md — Agent Skills & Knowledge Base

> Start here. This file indexes all available knowledge sources.

---

## Quick Navigation

| File | Purpose |
|------|---------|
| [CODEBASE.md](./CODEBASE.md) | Full codebase map: directories, imports, data flow, types, patterns |
| [BUSINESS_RULES.md](./BUSINESS_RULES.md) | Product rules: question types, test modes, scoring, rewards |
| [DESIGN.md](./DESIGN.md) | UI/UX design rules: theme tokens, Tailwind conventions, border/spacing guidelines |
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

| `scripts/generate-codegraph.mjs` | Auto-generates codebase dependency graph |

## How to Use

1. **New to the codebase?** Read [CODEBASE.md](./CODEBASE.md) and [skills/codebase-navigation.md](./skills/codebase-navigation.md)
2. **Adding questions?** Read [skills/html-to-json-extraction.md](./skills/html-to-json-extraction.md) and [skills/adding-new-subject.md](./skills/adding-new-subject.md)
3. **Debugging UI issues?** Read [DESIGN.md](./DESIGN.md)
4. **Understanding product rules?** Read [BUSINESS_RULES.md](./BUSINESS_RULES.md)
5. **Handling errors?** Read [skills/error-handling.md](./skills/error-handling.md)
6. **Working on gamification features (XP, streaks, levels, shop)?** Read [AGENT_LESSONS.md](./AGENT_LESSONS.md) lessons 15-21 — covers weighted XP, level-up detection, active_items pattern, leaderboard/insight opt-out
7. **Extending the Question Bank (bookmarks, fuzzy search, BCS format)?** Read [AGENT_LESSONS.md](./AGENT_LESSONS.md) lessons 18-20 — BCS array-index, fuzzy Levenshtein, bookmark lifecycle
8. **Fixing quiz type errors?** Read [AGENT_LESSONS.md](./AGENT_LESSONS.md) lesson 21 — `NormalizedQuestion` must be defined in `src/types/index.ts`
9. **Building a new feature/page?** Check [specify/](./specify/) for the spec file first, then read relevant codebase docs
10. **Following agent instructions?** Visit [specify/](./specify/) when a task mentions a spec file or when you need detailed requirements
11. **Dev server keeps dying on "go live"?** Read AGENT_LESSONS.md lesson 23 — must use `nohup + disown` to keep vite alive past bash tool timeout

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- **End-of-session rule:** Before any session ends (after the last code modification), always run `graphify update .` then `graphify tree --graph graphify-out/graph.json --output graphify-out/graph.html` to regenerate the graph and HTML. This is mandatory — the hook only runs on commits, not on unstaged work.
