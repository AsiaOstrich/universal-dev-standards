# AI Instruction File Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/ai-instruction-standards.md) | [简体中文](../locales/zh-CN/core/ai-instruction-standards.md)

**Version**: 1.1.0
**Last Updated**: 2026-05-28
**Applicability**: All projects using AI coding assistants
**Scope**: partial
**Industry Standards**: None (Emerging AI tool practice)

---

## Purpose

This standard defines best practices for creating and maintaining AI instruction files (also known as "system prompt files"). These files guide AI assistants in understanding project-specific conventions, standards, and workflows. This v1.1.0 extends scope to skill-level instruction files (SKILL.md) and adds i18n strategy.

---

## Supported AI Tools

| AI Tool | Instruction File | Format | Skill-Level Instruction |
|---------|-----------------|--------|------------------------|
| Claude Code | `CLAUDE.md` | Markdown | `.claude/skills/{name}/SKILL.md` |
| Cursor | `.cursorrules` | Markdown | n/a |
| Windsurf | `.windsurfrules` | Markdown | n/a |
| Cline | `.clinerules` | Markdown | n/a |
| GitHub Copilot | `.github/copilot-instructions.md` | Markdown | n/a |
| OpenCode | `.opencode/instructions.md` | Markdown | n/a |

---

## Core Principle: Universal vs Project-Specific Separation

### Why Separate?

AI instruction files often mix two types of content:
1. **Universal rules** that apply to any project
2. **Project-specific configurations** unique to your project

Separating these improves:
- **Portability**: Universal sections can be reused across projects
- **Maintainability**: Easier to update without accidental "leakage"
- **Clarity**: Users know what to customize when adopting your standards

---

## File Structure

### Recommended Layout

```markdown
# [Project Name] - AI Instructions

## Universal Standards
<!-- Rules applicable to ANY project -->
- Commit message format
- Code review checklist
- Testing standards
- Anti-hallucination rules

---

## Project-Specific Configuration
<!-- Unique to THIS project - customize when adopting -->

### Tech Stack
[Your technologies here]

### Quick Commands
[Your build/test/deploy commands]

### File Structure
[Your project structure]

### Release Process
[Your release workflow]
```

---

## Content Guidelines

### Universal Content (Do NOT include project-specific details)

| Category | Examples |
|----------|----------|
| **Commit Standards** | Conventional Commits format, message structure |
| **Code Review** | Review checklist, comment prefixes |
| **Testing** | Test pyramid ratios, naming conventions |
| **AI Behavior** | Anti-hallucination rules, source attribution |
| **Documentation** | Writing style, structure guidelines |

**Avoid in Universal Sections:**
- Specific commands (e.g., `npm test`, `pytest`)
- Hardcoded paths (e.g., `cli/src/`, `/var/www/`)
- Version numbers (e.g., `Node.js 18`, `Python 3.11`)
- Project names and URLs

### Project-Specific Content (Clearly label these sections)

| Category | Examples |
|----------|----------|
| **Tech Stack** | Languages, frameworks, versions |
| **Commands** | Build, test, lint, deploy commands |
| **File Structure** | Directory layout, key files |
| **Release Process** | Version files, deployment steps |
| **Team Conventions** | Language preferences, naming patterns |

---

## Labeling Convention

Use clear markers to distinguish content types:

### Option A: Section Headers

```markdown
## Universal Standards
[universal content]

## Project-Specific Configuration
[project-specific content]
```

### Option B: Inline Markers

```markdown
> ⚠️ **Project-Specific**: This section contains configuration unique to this project.

### Tech Stack
...
```

### Option C: Comment Annotations

```markdown
<!-- UNIVERSAL: The following applies to all projects -->
### Commit Message Format
...

<!-- PROJECT-SPECIFIC: Customize for your project -->
### Quick Commands
...
```

---

## Internationalization (i18n)

AI instruction files often need to be available in multiple languages — both for international adopters and for projects with non-English-speaking maintainers. This section defines how to organize, validate, and install multi-language instruction files.

### Scope of AI Instruction Files

This standard covers instruction files at two levels:

| Level | Examples | i18n Pattern |
|-------|----------|--------------|
| **Root-level** | `CLAUDE.md`, `.cursorrules`, `.windsurfrules`, `.opencode/instructions.md` | Single file with inline language sections (e.g., `## 中文` / `## English`) |
| **Skill-level** | Claude Code `.claude/skills/{name}/SKILL.md`, OpenCode plugin instructions | Canonical (English) + `locales/{lang}/` variants |

> Note: skill-level multi-file structure is most relevant to Claude Code. Other tools use single root files; for them, only the layered language strategy (below) and the chimera-prevention rules apply.

### Layered Language Strategy

Every AI instruction file conceptually has **four layers**, each with different language responsibilities:

| Layer | Content | Canonical (en) | Locale ({lang}) | Why |
|-------|---------|---------------|----------------|-----|
| **L1 — Metadata** | YAML frontmatter `description`, `argument-hint`, `allowed-tools` | **Must be English** | **Must match locale** | AI-trigger signal; English has highest training-data density and token efficiency |
| **L2 — Instructions** | Imperative rules for the AI (steps, behavior, allowed-tools rationale) | **Must be English** | Locale language (optional; may stay English) | AI reads English instructions most precisely; locale only useful if maintainers need to read instructions in their language |
| **L3 — Output Templates** | Example outputs, response formats, scenario templates | English (locale-pinned to English in canonical) | **Mandatory locale match** | **Only layer that directly controls AI output language** — AI inherits the language of templates it sees |
| **L4 — Human Docs** | Comments for maintainers, walkthroughs, contributor notes | English | Locale language (strongly recommended) | Read by human maintainers, not by AI |

**Critical insight**: L1 (description) is the trigger signal AI uses to decide *whether to invoke* a skill — it does **not** affect what the AI says afterwards. L3 (output templates) is the only layer that controls AI output language, because AI mirrors the language of templates it sees. **i18n enforcement should focus on L3 — strengthening L1 enforcement is a common mistake that solves the wrong problem.**

### Canonical / Locale File Structure

For UDS standards and skills with locale variants:

```text
core/{name}.md                              ← canonical (English) — single source of truth
core/{name}.ai.yaml                         ← canonical structured (English)
locales/{lang}/core/{name}.md               ← locale variant (matches lang)
locales/{lang}/ai/standards/{name}.ai.yaml  ← locale .ai.yaml (matches lang)
skills/{name}/SKILL.md                      ← canonical skill (English)
locales/{lang}/skills/{name}/SKILL.md       ← locale skill variant
```

**Naming convention**: use BCP 47 language tags — `zh-TW`, `zh-CN`, `ja`, `ko`, `en-US`, etc.

### Locale Variant Frontmatter Requirements

Every locale variant must include traceability frontmatter so drift can be detected:

```yaml
---
name: {same name as canonical}
source: {relative path back to canonical}
source_version: {version of canonical at time of translation}
translation_version: {version of this translation}
---
```

When canonical is updated (bumping `source_version`), locale maintainers should re-sync and bump `translation_version`. A `source_version` gap of more than 2 minor versions triggers a drift warning (see Chimera Prevention).

### Responsibility Boundaries

| Role | Owns | Must do |
|------|------|---------|
| **Canonical owner** | `core/{name}.md`, `core/{name}.ai.yaml`, `skills/{name}/SKILL.md` | Keep L1/L2/L3/L4 in English; bump `source_version` on every breaking change |
| **Locale maintainer** | `locales/{lang}/...` files | Keep `translation_version` aligned with `source_version`; translate L1 (required) / L2 (optional) / L3 (required) / L4 (recommended) |
| **Adopter (downstream project)** | Their own `.claude/skills/`, `CLAUDE.md`, etc. | Install via `uds install --locale {lang}`; **never** manually modify canonical files (always edit locale variants or use overlays) |

### Chimera Prevention

A **chimera** is a file that mixes languages in violation of layer rules. Common chimera patterns:

| Pattern | Severity | Detection |
|---------|----------|-----------|
| Canonical file with CJK in `description` field | ❌ Error | Lint: `canonical:description-must-be-ascii` |
| Locale variant with ASCII-only `description` field | ❌ Error | Lint: `locale:description-must-match-language` |
| Locale variant missing `source:` frontmatter | ❌ Error | Lint: `locale:must-have-source-frontmatter` |
| Canonical L3 output template containing non-English example response | ⚠️ Warn | Lint: `canonical:l3-language-consistency` |
| Adopter file in `.claude/skills/` differs from both canonical and any locale variant | ⚠️ Warn | Sync check: `adopter:must-match-installed-locale` |
| `translation_version` lag > 2 minor versions behind `source_version` | ⚠️ Warn | Drift check |

Pre-commit / CI lint should enforce error-level rules; warn-level rules surface in dashboards but don't block.

### Adopter Installation Model

Adopters install instruction files via the UDS CLI:

```bash
uds install --locale zh-TW   # install skills + standards in Traditional Chinese
```

**Locale resolution order**:
1. `--locale` CLI flag (highest priority)
2. `.uds/install.yaml` field `locale:`
3. Environment variable `UDS_LOCALE`
4. Fallback: `en`

**Missing locale fallback**: when a requested locale variant doesn't exist for a specific skill, the CLI:
- Installs the canonical (English) file
- Emits a WARN listing skills that fell back
- Does **not** block installation

This keeps installation usable for adopters even when locale coverage is incomplete. Adopters can consult `locales/COVERAGE.md` for the canonical list of what is and isn't translated.

### Migration: Adopters With Existing Chimera

If an adopter has already manually modified canonical files in their project (e.g. translated descriptions in `.claude/skills/`):

1. **Identify the chimera**: compare adopter files against UDS canonical and canonical's locale variants.
2. **Install proper variants**: run `uds install --locale {lang}` to replace chimera files with locale variants.
3. **Preserve project-specific customization**: if the chimera contained legitimate project-specific customization (not just translation), extract it into an overlay or document it in the adopter's customization log (e.g. `UDS-CUSTOMIZATION.md`).
4. **Discard pure translations**: chimera changes that were only translations should be discarded — the proper locale variant supersedes them.

### Quick Reference

| Action | When | Tool / File |
|--------|------|-------------|
| Add new language | Want to support a new locale | Create `locales/{lang}/...` mirroring canonical structure |
| Update canonical | Improving English source | Bump `source_version`; notify locale maintainers |
| Translate / sync locale | Adding or updating locale content | Bump `translation_version`; reference current `source_version` |
| Check coverage | Periodic review | View auto-generated `locales/COVERAGE.md` |
| Install with locale | Adopter setup or re-sync | `uds install --locale {lang}` |
| Lint i18n rules | Before commit / in CI | `uds lint --i18n` |

---

## Maintenance Checklist

Before committing changes to AI instruction files:

- [ ] **Universal sections**: No project-specific paths, commands, or versions
- [ ] **Project-specific sections**: Clearly marked with labels
- [ ] **Cross-references**: Links to standards documents are correct
- [ ] **Consistency**: Format matches existing sections

### Leakage Detection

Run this check to find potential leaks of project-specific content in universal sections:

```bash
# Example: Find hardcoded commands in universal sections
grep -n "npm\|yarn\|pip\|cargo" CLAUDE.md | head -20
```

Review each match to ensure it's in a project-specific section.

---

## Quick Reference Card

### Universal vs Project-Specific

| Type | Contains | Example |
|------|----------|---------|
| **Universal** | Generic rules | "Run tests before committing" |
| **Project-Specific** | Concrete commands | "Run `npm test` before committing" |

### Section Markers

| Marker | Meaning |
|--------|---------|
| `## Universal` | Applicable to any project |
| `## Project-Specific` | Unique to this project |
| `> ⚠️ Project-Specific` | Inline warning for specific section |

---

## Related Standards

- [Documentation Structure](documentation-structure.md)
- [Documentation Writing Standards](documentation-writing-standards.md)
- [Anti-Hallucination Guidelines](anti-hallucination.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-14 | Initial release |
| 1.1.0 | 2026-05-28 | Add i18n section; extend scope to skill-level files |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
