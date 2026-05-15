# UDS Troubleshooting Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/docs/user/TROUBLESHOOTING.md) _(planned)_

Find your problem → follow the fix.

---

## Installation Issues

**Problem: `uds: command not found` after `npm install -g`**

```bash
# Check that npm global bin is in your PATH
npm config get prefix
# Add <prefix>/bin to your PATH in ~/.zshrc or ~/.bashrc
export PATH="$(npm config get prefix)/bin:$PATH"
```

**Problem: `uds init` fails with permission error**

```bash
# Use a Node version manager (nvm/fnm) instead of system Node
# Or fix npm global directory: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally
```

---

## Skills Not Showing in Claude Code

**Problem: I can't see `/sdd`, `/tdd`, or other UDS skills in the Claude Code menu.**

Step 1 — Verify UDS is initialized:
```bash
uds check
```
If this reports missing files, re-run `uds init`.

Step 2 — Verify `.claude/` configuration exists:
```bash
ls .claude/settings.json
```
If missing, `uds init` should create it. Try `uds init --force`.

Step 3 — Skill budget may be exceeded (too many skills → descriptions truncated):
See [skill-budget-tuning.md](../skill-budget-tuning.md) to demote rarely-used skills to Tier 3.

Step 4 — Hard reload Claude Code:
Close and reopen the IDE/terminal window where Claude Code is running.

**Problem: Some skills are visible but others are not.**

This is expected behavior for Tier 3 skills. Tier 3 skills show only their name (no description) to save context budget, and some AI clients may not list them at all.

**Tier 3 skills can still be invoked directly**: type `/<name>` and press Enter.

To make a Tier 3 skill visible, add to your `.claude/settings.json`:
```json
{
  "skillOverrides": {
    "brainstorm-assistant": "on"
  }
}
```

---

## Skills Not Working as Expected

**Problem: Skill activates but gives generic responses, not UDS-specific guidance.**

Likely cause: `.standards/` directory is empty or outdated.
```bash
uds check       # Check what's installed
uds update      # Update to latest standards
```

**Problem: `/commit` generates a commit message that doesn't follow Conventional Commits.**

The commit-standards skill reads your existing commits to learn your project's style. If you have no prior commits in Conventional Commits format, it may deviate.

Add explicit guidance to `CLAUDE.md`:
```markdown
## Commit Format
Always use Conventional Commits: `<type>(<scope>): <subject>`
Types: feat, fix, docs, chore, test, refactor, style, build, ci
```

**Problem: `/sdd` creates a spec but I want a different format.**

Customize the spec template by adding to your `CLAUDE.md`:
```markdown
## Spec Format
When creating specs with /sdd, use this template:
[paste your preferred template here]
```

---

## Using UDS Without Claude Code

**Problem: I'm using Cursor / GitHub Copilot / Windsurf — skills don't work.**

Skills (the `/command` system) are Claude Code-specific. For other AI tools:

1. Run `uds init` and select your tool — it will configure `.cursorrules`, `.github/copilot-instructions.md`, etc.
2. Core Standards in `.standards/` are tool-agnostic and provide context to any AI that reads them
3. Use the quick reference tables below in your AI instruction file

**Quick reference for embedding in any AI tool:**

```markdown
## Commit Messages
Format: <type>(<scope>): <subject>
Types: feat, fix, docs, chore, test, refactor, style

## Testing Pyramid
Unit: 70% | Integration: 20% | System: 7% | E2E: 3%

## User Stories
As a [role], I want [feature], so that [benefit].
INVEST: Independent, Negotiable, Valuable, Estimable, Small, Testable
```

**Skill → Core Standard mapping** (use when skills unavailable):

| Skill | Core Standard to reference |
|-------|---------------------------|
| `commit-standards` | `.standards/commit-message.md` |
| `testing-guide` | `.standards/testing.md` |
| `code-review-assistant` | `.standards/code-review.md` |
| `requirement-assistant` | `.standards/requirement-engineering.md` |
| `spec-driven-dev` | `.standards/spec-driven-development.md` |
| `tdd-assistant` | `.standards/test-driven-development.md` |
| `bdd-assistant` | `.standards/behavior-driven-development.md` |
| `git-workflow-guide` | `.standards/git-workflow.md` |
| `refactoring-assistant` | `.standards/refactoring-standards.md` |

---

## Update Issues

**Problem: `uds update` fails.**

```bash
# Check network / npm registry access
npm ping
# Try with explicit registry
npm install -g universal-dev-standards@latest
# Then re-initialize
uds init --force
```

**Problem: After updating, my skills seem broken.**

The update may have changed skill formats. Try:
```bash
uds check
uds init --force   # Re-installs skill configurations
```

---

## General Diagnostics

Run `uds check` for a full health report:
```
uds check
```

This checks:
- Standards installation status
- Skill configuration
- AI tool compatibility
- Version alignment

---

## Still Stuck?

- **GitHub Issues**: [github.com/AsiaOstrich/universal-dev-standards/issues](https://github.com/AsiaOstrich/universal-dev-standards/issues)
- **FAQ**: [FAQ.md](FAQ.md)
- **Skill Budget tuning**: [../skill-budget-tuning.md](../skill-budget-tuning.md)
