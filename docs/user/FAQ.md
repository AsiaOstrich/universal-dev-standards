# UDS Frequently Asked Questions

> **Language**: English | [繁體中文](../../locales/zh-TW/docs/user/FAQ.md) _(planned)_

---

## Installation & Setup

**Q: What is the difference between `uds init` and `uds update`?**

`uds init` is for first-time setup: it copies standards, configures your AI tool, and installs skills.
`uds update` upgrades an already-initialized project to the latest UDS version without reconfiguring.

**Q: Can I use UDS without Claude Code?**

Yes. UDS supports Claude Code, Cursor, GitHub Copilot, Windsurf, and any AI tool that reads instruction files. Run `uds init` and choose your tool — it will configure the appropriate file (`.cursorrules`, `CLAUDE.md`, etc.). Skills are Claude Code-specific; for other tools, standards and CLAUDE.md-equivalent files still apply.

**Q: I already have a `CLAUDE.md`. Will `uds init` overwrite it?**

No. `uds init` merges UDS content into your existing file. It appends a clearly-marked UDS section. Your existing content is preserved.

---

## Skills & Commands

**Q: What is a Skill?**

A Skill is a pre-built AI workflow that activates when you type `/command` in Claude Code. For example, `/sdd` activates the Spec-Driven Development skill, which guides you through creating a spec file. Skills are stored in `skills/<name>/SKILL.md` and loaded by Claude Code automatically.

**Q: What is the difference between a Skill and a Standard?**

A **Standard** is a written guideline (Markdown or YAML) that explains how to do something (e.g., "commit-message" standard defines Conventional Commits format). A **Skill** is an AI workflow that executes a process using those standards. Standards are the knowledge base; Skills are the execution layer.

**Q: Why can't I see a skill in the Claude Code menu?**

There are three possible causes:
1. **UDS not initialized**: Run `uds check` to verify
2. **Skill budget exceeded**: With many skills, Claude Code truncates the list. See [skill-budget-tuning.md](../skill-budget-tuning.md) to tune which skills appear
3. **Tier 3 skill**: Tier 3 skills are hidden by default to save context. They are still callable via `/<name>`. To show them, override in your `settings.json` — see [skill-budget-tuning.md](../skill-budget-tuning.md)

**Q: Can I still use a skill that's not visible in the menu?**

Yes. Every skill is callable by typing `/<name>` directly regardless of whether it appears in the menu. For example, `/brainstorm` works even if `brainstorm-assistant` is Tier 3 and not listed.

**Q: How do I know which command triggers which skill?**

See [COMMANDS-INDEX.md](COMMANDS-INDEX.md) for the complete command-to-skill mapping, or [SKILLS-INDEX.md](SKILLS-INDEX.md) for the skill-centric view.

**Q: How do I disable a skill I never use?**

In your `.claude/settings.json`:
```json
{
  "skillOverrides": {
    "brainstorm-assistant": "disabled"
  }
}
```
See [skill-budget-tuning.md](../skill-budget-tuning.md) for all override options.

---

## Spec-Driven Development

**Q: Do I have to write a spec for every change?**

No. Specs are recommended for features, user stories, and non-trivial changes. For small bug fixes or refactoring, `/commit` and `/review` are sufficient. The rule of thumb: if it would take more than 2 hours to implement, a spec helps.

**Q: Where are specs stored?**

By default, `specs/SPEC-NNN-<slug>.md` in your project root. The format follows the UDS spec-driven-development standard.

**Q: What is an AC (Acceptance Criterion)?**

An Acceptance Criterion is a testable statement that defines when a feature is "done." Example: "Given a registered user, when they log in with correct credentials, then they receive a valid session token." ACs drive test coverage and prevent scope creep.

---

## Updating & Versioning

**Q: How do I update UDS to the latest version?**

```bash
uds update
```

This downloads the latest standards and skills while preserving your project-specific customizations.

**Q: How do I check what version of UDS I have?**

```bash
uds --version
# or
cat .standards/manifest.json | grep version
```

**Q: Will updating UDS break my existing specs or CLAUDE.md?**

No. Standards updates are backward-compatible. Specs are your files and are never touched by `uds update`. CLAUDE.md is only modified if you explicitly run `uds init --force`.

---

## Architecture

**Q: What is the "Dual-Layer Architecture"?**

UDS has two layers:
- **Core Standards** (`.standards/` — Markdown files): Human-readable guidelines, complete theory, edge cases
- **AI Standards** (`.standards/` — `.ai.yaml` files): Token-efficient, AI-optimized versions of the same standards, designed for Claude Code's context window

When a Skill runs, it reads from `.ai.yaml` files. When a developer wants to understand the rationale, they read the `.md` files.

**Q: What is the difference between `skills/` and `.standards/`?**

`skills/` contains SKILL.md files that power `/commands` in Claude Code. They are workflows.
`.standards/` contains the underlying knowledge base (Core Standards + AI Standards). Skills reference standards; standards don't reference skills.

**Q: What are Skill Tiers? (DEC-061)**

Tiers control how much of Claude Code's context budget is used for skill descriptions:
- **Tier 1**: Always listed with full description (13 skills — daily use)
- **Tier 2**: Listed with full description by default (27 skills — weekly use)
- **Tier 3**: Listed with name only by default (14 skills — specialist/event-driven)

All tiers are fully callable via `/<name>`. Tiers only affect _listing_ behavior.
