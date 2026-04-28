---
name: ai-instruction-standards
scope: partial
description: |
  Create and maintain AI instruction files (CLAUDE.md, AGENTS.md, .cursor/rules/, etc.) with proper structure.
  Use when: creating AI instruction files, separating universal vs project-specific rules, configuring AI tools.
  Keywords: CLAUDE.md, AGENTS.md, cursorrules, windsurfrules, clinerules, AI instructions, system prompt, 指令檔案, AI 設定.
---

# AI Instruction File Standards Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/ai-instruction-standards/SKILL.md)

**Version**: 2.0.0
**Last Updated**: 2026-04-28
**Applicability**: All AI coding tools

---

> **Core Standard**: This skill implements [AI Instruction File Standards](../../core/ai-instruction-standards.md). For comprehensive methodology documentation, refer to the core standard.

## AI Skills Hierarchy | AI 技能層級

This skill is part of a three-layer AI collaboration system:

| Layer | Skill | Question it Answers |
|-------|-------|-------------------|
| **Behavior** (Immediate) | `/ai-collaboration` | "How should AI respond accurately?" |
| **Configuration** (Session) | `/ai-instruction-standards` (this) | "What to write in CLAUDE.md / AGENTS.md?" |
| **Architecture** (Long-term) | `/ai-friendly-architecture` | "How to structure code for AI?" |

## Purpose

This skill helps create and maintain AI instruction files with proper separation between universal standards and project-specific configurations, across all major AI coding tools.

---

## Quick Reference

### Supported AI Tools (2026-04-28)

#### CLI / Agent Tools (Terminal)

| Tool | Primary File | Workflow Mechanism | MCP |
|------|-------------|-------------------|-----|
| **Claude Code** | `CLAUDE.md` + `.claude/rules/*.md` | Skills (`.claude/skills/` → `/{name}`) | ✅ |
| **Gemini CLI** | `GEMINI.md` | `.gemini/commands/*.toml` → `/{name}` | ✅ |
| **OpenAI Codex CLI** | `AGENTS.md` (+ `AGENTS.override.md`) | Team commands; `/review` built-in | ✅ |
| **OpenCode** | `AGENTS.md` (CLAUDE.md compatible) | Built-in only (`/init` `/undo` `/share`) | ✅ |

#### AI-native IDE / Editor Integration

| Tool | Primary File | Workflow Mechanism | MCP |
|------|-------------|-------------------|-----|
| **Cursor** | `.cursor/rules/*.mdc` ⚠️ | `@`-mentions; `/multitask` | ✅ |
| **GitHub Copilot** | `.github/copilot-instructions.md` | `.github/prompts/*.prompt.md` → `/{name}` | ✅ |
| **Windsurf** | `.windsurfrules` / `.windsurf/rules/*.md` | `.windsurf/workflows/*.md` → `/{name}` | ✅ |
| **Cline** | `.clinerules` | None | ✅ |

> ⚠️ **Cursor**: `.cursorrules` is **deprecated** — migrate to `.cursor/rules/*.mdc`

---

### Cross-Tool Universal Standard: `AGENTS.md`

`AGENTS.md` is the emerging de-facto cross-tool instruction standard:

**Supported by**: Gemini CLI, OpenAI Codex CLI, OpenCode, GitHub Copilot, Windsurf, Cursor
**Not supported by**: Claude Code (uses `CLAUDE.md`), Cline (uses `.clinerules`)

**Recommendation**: Use `AGENTS.md` as the universal baseline for cross-tool projects, then add tool-specific files for advanced features (Skills, Workflows, Prompts).

---

### Core Principle: Universal vs Project-Specific

| Type | Contains | Example |
|------|----------|---------|
| **Universal** | Generic rules | "Run tests before committing" |
| **Project-Specific** | Concrete commands | "Run `npm test` before committing" |

---

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

---

## Tool-Specific Setup Guides

### Claude Code

```
CLAUDE.md                        # Main instructions (hierarchical: global → project → subdir)
.claude/rules/                   # Glob-scoped additional rules
.claude/skills/{name}/SKILL.md   # Custom slash commands → /{name}
.claude/agents/{name}.md         # Subagent definitions
```

### Gemini CLI

```
GEMINI.md                          # Main instructions
.gemini/commands/{name}.toml       # Custom slash commands → /{name}
.gemini/agents/{name}.yaml         # Subagent definitions
```

Example `.gemini/commands/review.toml`:
```toml
description = "Run code review checklist"
prompt = "Review the following changes: !{git diff HEAD}"
```

### OpenAI Codex CLI

```
AGENTS.md                  # Main instructions (Git root → cwd traversal)
AGENTS.override.md         # Temporary override (highest priority)
~/.codex/AGENTS.md         # Global fallback
.codex/agents/             # Custom agent definitions
```

### OpenCode

```
AGENTS.md                       # Primary (auto-recognized)
CLAUDE.md                       # Also recognized (migration compatibility)
.opencode/agents/               # Custom agent definitions
opencode.json (instructions)    # Glob-pattern file references
```

### Cursor

```
.cursor/rules/                  # MDC format rules (replaces .cursorrules)
  {name}.mdc                    # Frontmatter: description, globs, alwaysApply
AGENTS.md                       # Also supported for agent context
```

MDC frontmatter example:
```yaml
---
description: "TypeScript coding standards"
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: false
---
```

> **Migration**: If you have `.cursorrules`, move content to `.cursor/rules/*.mdc`.

### GitHub Copilot

```
.github/copilot-instructions.md         # Always-on, all chats
.github/instructions/*.instructions.md  # File-glob scoped (applyTo frontmatter)
.github/prompts/*.prompt.md             # Reusable templates → /{name} slash commands
.github/agents/*.agent.md               # Custom agents with tool access control
AGENTS.md                               # Also recognized
```

### Windsurf

```
.windsurfrules                   # Project rules (team-shareable)
.windsurf/rules/*.md             # MDC frontmatter structured rules
.windsurf/workflows/*.md         # Reusable task sequences → /{name}
AGENTS.md                        # Also recognized
```

Workflow example (`.windsurf/workflows/review.md`):
```markdown
Run a code review:
1. Run `git diff HEAD`
2. Check for BLOCKING issues (security, correctness)
3. Check for IMPORTANT issues (design, tests)
4. Output findings with BLOCKING/IMPORTANT/SUGGESTION prefixes
```

---

## Multi-Tool Project Configuration

When a project uses multiple AI tools:

```
project/
├── AGENTS.md                            # Universal baseline (cross-tool)
├── CLAUDE.md                            # Claude Code (extends AGENTS.md)
├── GEMINI.md                            # Gemini CLI
├── .cursor/rules/
│   └── standards.mdc                    # Cursor
├── .windsurf/
│   └── workflows/                       # Windsurf workflows
│       ├── review.md
│       └── checkin.md
└── .github/
    ├── copilot-instructions.md          # Copilot always-on
    └── prompts/
        └── review.prompt.md             # Copilot slash command
```

**Best Practice**: Write universal content in `AGENTS.md` once, then import/reference it from tool-specific files to avoid duplication.

---

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

---

## Maintenance Checklist

Before committing changes to AI instruction files:

- [ ] Universal sections contain no project-specific paths, commands, or versions
- [ ] Project-specific sections are clearly marked
- [ ] Cross-references to standards documents are correct
- [ ] Format matches existing sections
- [ ] If using Cursor: `.cursorrules` migrated to `.cursor/rules/*.mdc`
- [ ] If multi-tool project: `AGENTS.md` covers the universal baseline

---

## Configuration Detection

### Detection Order

1. Check for existing `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, or equivalent files
2. Detect which AI tools are in use (check for `.cursor/`, `.windsurf/`, `.github/copilot-instructions.md`, etc.)
3. Analyze content structure for universal/project-specific separation
4. If not found, **suggest creating structured AI instruction file**

### First-Time Setup

If no AI instruction file found:

1. Ask: "This project doesn't have an AI instruction file. Which AI tools do you use?"
2. Recommend `AGENTS.md` for cross-tool projects, `CLAUDE.md` for Claude Code only
3. Determine project type and tech stack
4. Generate template with appropriate sections
5. Add to `.gitignore` if contains sensitive info

---

## Next Steps Guidance

After `/ai-instructions` completes, suggest:

> - Create or update project's `CLAUDE.md` / `AGENTS.md` ⭐ **Recommended** — Apply standards immediately
> - Run `/ai-friendly-architecture` to optimize AI collaboration at the architecture level
> - Run `/ai-collaboration` to review AI behavior guidelines

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
| 2.0.0 | 2026-04-28 | Add Gemini CLI, OpenAI Codex CLI; update Cursor (MDC format, deprecated .cursorrules); update OpenCode (AGENTS.md primary); update Copilot (multiple file types); update Windsurf (Workflows); add AGENTS.md cross-tool standard section |
| 1.0.0 | 2026-01-25 | Initial release |

---

## License

This skill is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
