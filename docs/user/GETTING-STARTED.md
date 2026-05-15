# Getting Started with UDS

> **Language**: English | [繁體中文](../../locales/zh-TW/docs/user/GETTING-STARTED.md) _(planned)_

This guide walks you through UDS from zero to your first AI-assisted spec and commit.
Estimated time: **5 minutes**.

---

## Prerequisites

- Node.js ≥ 20.0.0 (`node --version`)
- An AI coding assistant: Claude Code (recommended), Cursor, GitHub Copilot, or similar

---

## Step 1 — Install

```bash
npm install -g universal-dev-standards
uds --version
```

> **No global install?** Use `npx universal-dev-standards init` to run without installing.

---

## Step 2 — Initialize Your Project

Run `uds init` inside your project directory:

```bash
cd your-project
uds init
```

The interactive wizard will:
1. Detect your AI tool (Claude Code, Cursor, etc.)
2. Copy standards to `.standards/`
3. Configure your AI tool's instruction file (e.g., `CLAUDE.md`)
4. Install the skills you selected

After init, you should see:
```
.standards/          ← AI-readable standards
CLAUDE.md            ← Updated with UDS guidance (Claude Code)
```

> **Already have a CLAUDE.md?** `uds init` merges — it won't overwrite your existing content.

---

## Step 3 — Your First Spec (`/sdd`)

Before writing code, create a spec:

1. Open Claude Code in your project
2. Type: `/sdd` and press Enter
3. Describe what you want to build (e.g., "add user login with email + password")
4. Claude creates a spec file at `specs/SPEC-NNN-*.md`

The spec captures:
- **Background** — why this feature exists
- **Acceptance Criteria (AC)** — testable outcomes
- **Out of Scope** — explicit boundaries

> **Why spec first?** AC-driven development reduces scope creep and makes reviews faster.
> `/sdd` follows the UDS Spec-Driven Development standard.

---

## Step 4 — Write Code (with TDD or BDD)

With a spec in place, pick your workflow:

| Workflow | Command | Use when |
|----------|---------|----------|
| Test-Driven Dev | `/tdd` | Writing unit/integration tests |
| Behavior-Driven Dev | `/bdd` | Writing feature scenarios |
| Direct implementation | — | Simple, well-understood tasks |

Example with TDD:
```
/tdd specs/SPEC-001-user-login.md
```
Claude will guide you through RED → GREEN → REFACTOR cycles.

---

## Step 5 — Commit (`/commit`)

When ready to commit:

```
/commit
```

Claude Code will:
1. Review your staged changes
2. Generate a [Conventional Commits](https://www.conventionalcommits.org/)-formatted message
3. Show you the message for approval before committing

> **Safe push?** Use `/push` for additional quality gates before `git push`.

---

## Common Commands at a Glance

| Task | Command |
|------|---------|
| Browse all skills | `/dev-workflow` |
| Create a spec | `/sdd` |
| TDD workflow | `/tdd` |
| BDD workflow | `/bdd` |
| Generate commit | `/commit` |
| Safe push | `/push` |
| Architecture decision | `/adr` |
| Code review | `/review` |

For the full list, see [SKILLS-INDEX.md → When to Use](SKILLS-INDEX.md#觸發時機速查-when-to-use).

---

## Troubleshooting

- **Skill not found**: Type `uds check` to verify installation
- **CLAUDE.md not updated**: Re-run `uds init --force`
- **Skills not showing in Claude Code menu**: See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## Next Steps

- **Explore all skills**: [SKILLS-INDEX.md](SKILLS-INDEX.md)
- **Customize skill visibility**: [../skill-budget-tuning.md](../skill-budget-tuning.md)
- **Daily workflow patterns**: [../../adoption/DAILY-WORKFLOW-GUIDE.md](../../adoption/DAILY-WORKFLOW-GUIDE.md)
- **Understand the architecture**: [GLOSSARY.md](GLOSSARY.md)
