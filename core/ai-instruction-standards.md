# AI Instruction File Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/ai-instruction-standards.md) | [简体中文](../locales/zh-CN/core/ai-instruction-standards.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-14
**Applicability**: All projects using AI coding assistants
**Scope**: partial
**Industry Standards**: None (Emerging AI tool practice)

---

## Purpose

This standard defines best practices for creating and maintaining AI instruction files (also known as "system prompt files"). These files guide AI assistants in understanding project-specific conventions, standards, and workflows.

---

## Supported AI Tools

| AI Tool | Instruction File | Format |
|---------|-----------------|--------|
| Claude Code | `CLAUDE.md` | Markdown |
| Cursor | `.cursorrules` | Markdown |
| Windsurf | `.windsurfrules` | Markdown |
| Cline | `.clinerules` | Markdown |
| GitHub Copilot | `.github/copilot-instructions.md` | Markdown |
| OpenCode | `.opencode/instructions.md` | Markdown |

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

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
