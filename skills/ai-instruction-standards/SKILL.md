---
scope: partial
description: |
  Create and maintain AI instruction files (CLAUDE.md, .cursorrules, etc.) with proper structure.
  Use when: creating AI instruction files, separating universal vs project-specific rules, configuring AI tools.
  Keywords: CLAUDE.md, cursorrules, windsurfrules, clinerules, AI instructions, system prompt, 指令檔案, AI 設定.
---

# AI Instruction File Standards Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/ai-instruction-standards/SKILL.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-25
**Applicability**: Claude Code Skills

---

> **Core Standard**: This skill implements [AI Instruction File Standards](../../core/ai-instruction-standards.md). For comprehensive methodology documentation, refer to the core standard.

## AI Skills Hierarchy | AI 技能層級

This skill is part of a three-layer AI collaboration system:

| Layer | Skill | Question it Answers | 回答的問題 |
|-------|-------|-------------------|-----------|
| **Behavior** (Immediate) | `/ai-collaboration` | "How should AI respond accurately?" | 「AI 如何準確回應？」 |
| **Configuration** (Session) | `/ai-instruction-standards` (this) | "What to write in CLAUDE.md?" | 「CLAUDE.md 該寫什麼？」 |
| **Architecture** (Long-term) | `/ai-friendly-architecture` | "How to structure code for AI?" | 「如何讓專案對 AI 友善？」 |

## Purpose

This skill helps create and maintain AI instruction files with proper separation between universal standards and project-specific configurations.

## Quick Reference

### Supported AI Tools

| AI Tool | Instruction File | Format |
|---------|-----------------|--------|
| Claude Code | `CLAUDE.md` | Markdown |
| Cursor | `.cursorrules` | Markdown |
| Windsurf | `.windsurfrules` | Markdown |
| Cline | `.clinerules` | Markdown |
| GitHub Copilot | `.github/copilot-instructions.md` | Markdown |
| OpenCode | `.opencode/instructions.md` | Markdown |

### Core Principle: Universal vs Project-Specific

| Type | Contains | Example |
|------|----------|---------|
| **Universal** | Generic rules | "Run tests before committing" |
| **Project-Specific** | Concrete commands | "Run `npm test` before committing" |

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
<!-- Unique to THIS project -->

### Tech Stack
[Your technologies here]

### Quick Commands
[Your build/test/deploy commands]

### File Structure
[Your project structure]
```

## Detailed Guidelines

For complete standards, see:
- [AI Instruction File Standards](../../core/ai-instruction-standards.md)

### AI-Optimized Format (Token-Efficient)

For AI assistants, use the YAML format file for reduced token usage:
- Base standard: `ai/standards/ai-instruction-standards.ai.yaml`

## Content Guidelines

### Universal Content (Keep Generic)

| Category | Good Examples |
|----------|---------------|
| **Commit Standards** | "Follow Conventional Commits format" |
| **Code Review** | "Use BLOCKING, IMPORTANT, SUGGESTION prefixes" |
| **Testing** | "Maintain 80% coverage minimum" |
| **AI Behavior** | "Always read code before analyzing" |

**Avoid in Universal Sections:**
- Specific commands (`npm test`, `pytest`)
- Hardcoded paths (`cli/src/`, `/var/www/`)
- Version numbers (`Node.js 18`, `Python 3.11`)
- Project names and URLs

### Project-Specific Content

| Category | Examples |
|----------|----------|
| **Tech Stack** | Node.js 18, React 18, PostgreSQL 15 |
| **Commands** | `npm run lint`, `./scripts/deploy.sh` |
| **File Structure** | `src/`, `cli/`, `tests/` |
| **Team Conventions** | Traditional Chinese comments |

## Labeling Convention

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

## Multi-Tool Configuration

When using multiple AI tools, maintain consistency:

```
project/
├── CLAUDE.md              # Claude Code instructions
├── .cursorrules           # Cursor instructions (can import from CLAUDE.md)
├── .windsurfrules         # Windsurf instructions
└── .github/
    └── copilot-instructions.md  # Copilot instructions
```

**Best Practice**: Create a shared `docs/ai-standards.md` and reference it from each tool's file to avoid duplication.

## Maintenance Checklist

Before committing changes to AI instruction files:

- [ ] Universal sections contain no project-specific paths, commands, or versions
- [ ] Project-specific sections are clearly marked
- [ ] Cross-references to standards documents are correct
- [ ] Format matches existing sections

---

## Configuration Detection

This skill supports project-specific configuration.

### Detection Order

1. Check for existing `CLAUDE.md` or equivalent files
2. Analyze content structure for universal/project-specific separation
3. If not found, **suggest creating structured AI instruction file**

### First-Time Setup

If no AI instruction file found:

1. Ask: "This project doesn't have an AI instruction file. Would you like to create one?"
2. Determine project type and tech stack
3. Generate template with appropriate sections
4. Add to `.gitignore` if contains sensitive info

---

## Next Steps Guidance | 下一步引導

After `/ai-instructions` completes, the AI assistant should suggest:

> **AI 指令檔案標準已掌握。建議下一步 / AI instruction file standards understood. Suggested next steps:**
> - 建立或更新專案的 `CLAUDE.md`（或對應的 AI 指令檔案） ⭐ **Recommended / 推薦** — 立即將標準應用到專案中 / Apply standards to the project immediately
> - 執行 `/ai-friendly-architecture` 從架構層面優化 AI 協作 — 配合指令檔案提升 AI 理解力 / Enhance AI understanding alongside instruction files
> - 執行 `/ai-collaboration` 複習 AI 行為準則 — 確保指令檔案中的規則與行為標準一致 / Ensure instruction file rules align with behavior standards

---

## Related Standards

- [AI Instruction File Standards](../../core/ai-instruction-standards.md) - Core standard
- [Documentation Writing Standards](../../core/documentation-writing-standards.md) - Writing guidelines
- [Anti-Hallucination Guidelines](../../core/anti-hallucination.md) - AI accuracy rules
- [AI-Friendly Architecture](../../core/ai-friendly-architecture.md) - Context optimization

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-25 | Initial release |

---

## License

This skill is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
