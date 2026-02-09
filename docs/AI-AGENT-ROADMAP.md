# AI Agent Integration Guide

> **Language**: English | [繁體中文](../locales/zh-TW/docs/AI-AGENT-ROADMAP.md) | [简体中文](../locales/zh-CN/docs/AI-AGENT-ROADMAP.md)

**Version**: 2.5.0
**Last Updated**: 2026-02-09

This document provides a comprehensive reference for AI Agent support in Universal Development Standards (UDS).

---

## 2026 Industry Changes Summary

> **February 2026 Update**: All 10 AI coding tools tracked by UDS now support SKILL.md. The industry has achieved 100% Skills coverage.
>
> *Research date: 2026-02-09. Sources: Official documentation and changelogs for each tool.*

### Key Developments

| Change | Impact | Date | Source |
|--------|--------|------|--------|
| **Cursor SKILL.md Support** | Cursor v2.4 natively supports SKILL.md via agentskills.io standard | Jan 22, 2026 | [cursor.com/changelog/2-4](https://cursor.com/changelog/2-4) |
| **SKILL.md Industry Standard** | All major AI coding tools now support the same Skills format | Dec 2025 - Jan 2026 | [agentskills.io](https://agentskills.io) |
| **Skills/Commands Merge** | Claude Code merged Skills and Commands in v2.1.3+ | Jan 9, 2026 | [Claude Code Changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md) |
| **Gemini CLI Skills Stable** | Skills promoted from preview to stable in v0.27.0 | Feb 3, 2026 | [geminicli.com/docs/changelogs/latest](https://geminicli.com/docs/changelogs/latest/) |
| **Antigravity Skills** | Google Antigravity supports SKILL.md and slash commands | Nov 18, 2025 | [antigravity.google/docs/skills](https://antigravity.google/docs/skills) |
| **Windsurf Acquired by Cognition** | Windsurf (Devin) now has full Skills + Workflows support | Jul 2025 | [TechCrunch](https://techcrunch.com/2025/07/14/cognition-maker-of-the-ai-coding-agent-devin-acquires-windsurf/) |
| **Codex Desktop App** | OpenAI Codex desktop app launched with Skills support | Feb 2, 2026 | [openai.com/index/introducing-the-codex-app](https://openai.com/index/introducing-the-codex-app/) |
| **Vibe Coding Era** | Natural language → code generation becoming mainstream | 2026 | - |

### Universal Skills Coverage

As of February 2026, SKILL.md is supported by **all 10 tracked AI tools**:
- ✅ Claude Code (native, reference implementation, Oct 2025)
- ✅ OpenCode (full support, v1.1.53)
- ✅ Cursor (full support, v2.4, Jan 2026)
- ✅ GitHub Copilot (full support, Dec 2025)
- ✅ Cline (full support, v3.48.0, Jan 2026)
- ✅ Roo Code (full support, v3.47.3)
- ✅ OpenAI Codex (full support, CLI v0.98.0)
- ✅ Windsurf (full support, Jan 2026)
- ✅ Gemini CLI (stable, v0.27.0, Feb 2026)
- ✅ Antigravity (full support, Nov 2025)

### Implications for UDS

1. **Cross-Platform Portability**: Skills written once work across all 10 AI tools (100% coverage)
2. **Simplified Maintenance**: No need for tool-specific conversions
3. **Unified Workflow**: Same `/commit`, `/review`, `/tdd` commands everywhere

---

## Table of Contents

1. [UDS CLI Implementation Status](#1-uds-cli-implementation-status)
2. [Quick Reference](#2-quick-reference)
3. [Integration Levels](#3-integration-levels)
4. [Skills System](#4-skills-system)
5. [Configuration Reference](#5-configuration-reference)
6. [Resources](#6-resources)
7. [Appendix: Future Development](#appendix-future-development)

---

## 1. UDS CLI Implementation Status

> **Important**: This section describes UDS CLI's implementation status for each tool, NOT the tool's native capabilities. For native capabilities, see [Quick Reference](#2-quick-reference).

### Status Definitions

| Status | Definition |
|--------|------------|
| `complete` | Full Skills + Commands support, tested and production-ready |
| `partial` | Skills work, Commands limited or unsupported |
| `preview` | Functional but in preview, may have edge cases |
| `planned` | Code exists in CLI but not fully tested |
| `minimal` | Rules file generation only, no Skills/Commands |

### Implementation Matrix

| AI Tool | UDS Status | Skills | Commands | Config File | Notes |
|---------|:----------:|:------:|:--------:|-------------|-------|
| **Claude Code** | ✅ complete | ✅ | Built-in | `CLAUDE.md` | Marketplace + User + Project levels |
| **OpenCode** | ✅ complete | ✅ | ✅ | `AGENTS.md` | Full implementation, reads Claude rules |
| Cline | 🔶 partial | ✅ | - | `.clinerules` | Skills via fallback, Commands use Workflow |
| GitHub Copilot | 🔶 partial | ✅ | ✅ | `copilot-instructions.md` | Complements Copilot Chat |
| OpenAI Codex | 🔶 partial | ✅ | - | `AGENTS.md` (shared) | Skills available |
| Gemini CLI | 🧪 preview | ✅ | ✅ (TOML) | `GEMINI.md` | Commands auto-converted to TOML |
| Roo Code | ⏳ planned | ✅ | ✅ | - | Implementation exists, testing pending |
| Cursor | ✅ complete | ✅ | ✅ | `.cursorrules` | Skills support since v2.4 (Jan 22, 2026) |
| Windsurf | 🔶 partial | ✅ | ✅ | `.windsurfrules` | Skills + Workflows (Jan 2026) |
| Antigravity | 📄 minimal | - | - | `INSTRUCTIONS.md` | UDS CLI not yet updated (tool supports Skills natively) |

### Two Types of "Support"

| Concept | Definition | Documented In |
|---------|------------|---------------|
| **Tool Native Capabilities** | What the AI tool itself supports | [Quick Reference](#2-quick-reference) |
| **UDS CLI Implementation** | How UDS CLI implements support | This section |

Example: Cursor now natively supports SKILL.md (since v2.4, Jan 22, 2026), and UDS CLI provides full integration with Skills, Commands, and `.cursorrules` generation.

---

## 2. Quick Reference

### 2.1 Configuration Files

| AI Agent | Project Config | Global Config | Notes |
|----------|----------------|---------------|-------|
| Claude Code | `.claude/CLAUDE.md` | `~/.claude/CLAUDE.md` | ~100KB limit |
| OpenCode | `.opencode/AGENTS.md` | `~/.config/opencode/AGENTS.md` | No limit |
| GitHub Copilot | `.github/copilot-instructions.md` | Personal settings | ~8KB limit |
| Cline | `.clinerules/` | `~/.cline-rules/` | Folder or single file |
| Roo Code | `.roo/rules/*.md` | `~/.roo/rules/` | Mode-specific: `.roo/rules-{mode}/` |
| OpenAI Codex | `.codex/AGENTS.md` | `~/.codex/AGENTS.md` | 32KB limit |
| Windsurf | `.windsurfrules` | Settings UI | 6K/file, 12K total |
| Gemini CLI | `.gemini/GEMINI.md` | `~/.gemini/GEMINI.md` | Supports `@import` |
| Cursor | `.cursor/skills/` | `~/.cursor/skills/` | SKILL.md + Rules supported |
| Antigravity | `.antigravity/` | `~/.antigravity/` | Minimal support, manual mode |

### 2.2 Skills Paths

| AI Agent | Skills | Project Path | Global Path | Notes |
|----------|:------:|--------------|-------------|-------|
| Claude Code | ✅ Native | `.claude/skills/` | `~/.claude/skills/` | Reference implementation |
| OpenCode | ✅ Full | `.opencode/skill/` | `~/.config/opencode/skill/` | Also reads `.claude/skills/` |
| GitHub Copilot | ✅ Full | `.github/skills/` | `~/.copilot/skills/` | Legacy: `.claude/skills/` |
| Cline | ✅ Full | `.claude/skills/` | `~/.claude/skills/` | Uses Claude paths directly |
| Roo Code | ✅ Full | `.roo/skills/` | `~/.roo/skills/` | Mode-specific: `.roo/skills-{mode}/` |
| OpenAI Codex | ✅ Full | `.codex/skills/` | `~/.codex/skills/` | Also reads `.claude/skills/` |
| Windsurf | ✅ Full | `.windsurf/rules/` | Settings UI | Skills since 2026/01 |
| Gemini CLI | ✅ Preview | `.gemini/skills/` | `~/.gemini/skills/` | v0.23+ preview |
| Cursor | ✅ Full (NEW) | `.cursor/skills/` | `~/.cursor/skills/` | SKILL.md support since v2.3.35 |
| Antigravity | ✅ Full | `.agent/skills/` | `~/.gemini/antigravity/skills/` | Skills since Nov 2025 |

### 2.3 Slash Commands

| AI Agent | Support | Type | Examples | Custom Path |
|----------|:-------:|------|----------|-------------|
| Claude Code | ✅ | Skill triggers | `/commit`, `/review`, `/tdd` | Built-in only |
| OpenCode | ✅ | User-defined | Configurable | `.opencode/command/*.md` |
| GitHub Copilot | ✅ | Built-in | `/fix`, `/tests`, `/explain` | `.github/prompts/*.prompt.md` |
| Cline | ✅ | Built-in + Workflows | `/smol`, `/plan`, `/newtask` | Workflow files |
| Roo Code | ✅ | Mode commands | `/code`, `/architect`, `/init` | `.roo/commands/*.md` |
| OpenAI Codex | ✅ | System commands | `/model`, `/diff`, `/skills` | Custom prompts |
| Windsurf | ✅ | Rulebook | Auto-generated | From `.windsurfrules` |
| Gemini CLI | ✅ | System + Custom | `/clear`, `/memory`, `/mcp` | `.gemini/commands/*.toml` |
| Cursor | ✅ | Built-in + Custom + Skills | `/summarize`, `/models`, `/rules`, `/mcp` | `.cursor/skills/`, `.cursor/commands/*.md` |
| Antigravity | ✅ | Slash commands | `/deslop`, `/refactor`, `/write-tests` | Community-driven repos |

### 2.4 Platform Support

| Platform | CLI Tool | Skills |
|----------|:--------:|:------:|
| macOS | Tested | Tested |
| Linux | Expected | Expected |
| Windows | PowerShell provided | Expected |

---

## 3. Integration Levels

> **Note**: As of January 2026, Agent Skills (SKILL.md) has become an industry standard. Most major AI coding tools now support the same Skills format.

### Native Skills (Reference Implementation)

**Tools**: Claude Code

- Reference implementation of Agent Skills standard
- 25 built-in UDS Skills + Marketplace
- 37 slash commands (25 Skill-based + 12 Commands-only)
- Full slash command support (`/commit`, `/review`, `/tdd`, etc.)
- Auto-trigger on keywords

### Full Skills Support

**Tools**: OpenCode, Cursor, GitHub Copilot, Cline, Roo Code, OpenAI Codex, Windsurf, Gemini CLI

- Can read and execute SKILL.md files
- Cross-compatible with `.claude/skills/` directory
- Most also have their own native paths (see Skills Path column)

### Minimal UDS CLI Support

**Tools**: Antigravity

- Tool natively supports SKILL.md and slash commands (since Nov 2025)
- UDS CLI integration not yet updated — currently generates `INSTRUCTIONS.md` only
- Planned: Upgrade UDS CLI to generate Skills for Antigravity

---

## 4. Skills System

### 4.1 UDS Skills Compatibility

| # | Skill | Slash Command | Claude | OpenCode | Cursor | Copilot |
|---|-------|---------------|:------:|:--------:|:------:|:-------:|
| 1 | ai-collaboration-standards | - | Full | Full | Full | Full |
| 2 | checkin-assistant | `/check` | Full | Full | Partial | Partial |
| 3 | commit-standards | `/commit` | Full | Full | Partial | Partial |
| 4 | code-review-assistant | `/review` | Full | Full | Partial | Partial |
| 5 | testing-guide | - | Full | Full | Full | Full |
| 6 | tdd-assistant | `/tdd` | Full | Full | Partial | Partial |
| 7 | release-standards | `/release` | Full | Full | Partial | No |
| 8 | git-workflow-guide | - | Full | Full | Full | Full |
| 9 | documentation-guide | `/docs` | Full | Full | Partial | No |
| 10 | requirement-assistant | `/requirement` | Full | Full | Partial | Partial |
| 11 | changelog-guide | `/changelog` | Full | Full | Partial | No |
| 12 | spec-driven-dev | `/sdd` | Full | Full | Partial | Partial |
| 13 | test-coverage-assistant | `/coverage` | Full | Full | Partial | Partial |
| 14 | refactoring-assistant | - | Full | Full | Full | Full |
| 15 | error-code-guide | - | Full | Full | Full | Full |
| 16 | methodology-system | `/methodology` | Full | Full | Partial | No |
| 17 | project-structure-guide | `/config` | Full | Full | Partial | No |
| 18 | logging-guide | - | Full | Full | Full | Full |

### 4.2 Skills Paths & Activation

#### Skills Discovery Paths

| AI Agent | Project Path | Global Path | Reads `.claude/skills/` |
|----------|--------------|-------------|:-----------------------:|
| Claude Code | `.claude/skills/` | `~/.claude/skills/` | Native |
| OpenCode | `.opencode/skill/` | `~/.config/opencode/skill/` | ✅ Yes |
| GitHub Copilot | `.github/skills/` | `~/.copilot/skills/` | ✅ Yes (legacy) |
| Cline | `.claude/skills/` | `~/.claude/skills/` | ✅ Yes |
| Roo Code | `.roo/skills/` | `~/.roo/skills/` | ✅ Yes |
| OpenAI Codex | `.codex/skills/` | `~/.codex/skills/` | ✅ Yes |
| Windsurf | `.windsurf/rules/` | Settings UI | ✅ Yes |
| Gemini CLI | `.gemini/skills/` | `~/.gemini/skills/` | ✅ Yes |
| Cursor | `.cursor/skills/` | `~/.cursor/skills/` | ✅ Yes |
| Antigravity | `.agent/skills/` | `~/.gemini/antigravity/skills/` | ✅ Yes |

#### Activation Methods

| AI Agent | Activation |
|----------|------------|
| Claude Code | Slash command, Auto-trigger, Mention |
| OpenCode | Slash command, Tab switch |
| GitHub Copilot | Auto-load, `applyTo` pattern |
| Cline | Auto-load from directory |
| Roo Code | Auto-load, Mode-specific (`.roo/skills-{mode}/`) |
| OpenAI Codex | `/skills` command, Auto-trigger |
| Windsurf | Manual (@mention), Always On, Model Decision |
| Gemini CLI | Auto-trigger, Enable/Disable via settings |
| Cursor | Slash command, Glob pattern, `alwaysApply` flag |
| Antigravity | Slash command, Semantic triggering |

**Recommendation**: Use `.claude/skills/` as the default installation path — most tools can read it for cross-tool compatibility.

### 4.3 Cross-Platform Portability

> **Industry Standard**: As of December 2025, SKILL.md has been adopted by OpenAI, GitHub, Google, and the broader AI coding ecosystem.

| Platform | SKILL.md Support | Adoption Date |
|----------|:----------------:|---------------|
| Claude Code | ✅ Native | Oct 2025 |
| OpenCode | ✅ Full | Nov 2025 |
| GitHub Copilot | ✅ Full | Dec 18, 2025 |
| OpenAI Codex | ✅ Full | Dec 2025 |
| Cline | ✅ Full | v3.48.0 |
| Roo Code | ✅ Full | Dec 27, 2025 |
| Windsurf | ✅ Full | Jan 9, 2026 |
| Gemini CLI | ✅ Stable | Feb 3, 2026, v0.27.0 |
| Cursor | ✅ Full | Jan 22, 2026, v2.4 |
| Antigravity | ✅ Full | Nov 18, 2025 |

**Cross-platform installers**:
- [skilz](https://github.com/skilz-ai/skilz) - Universal Skills installer (14+ platforms)
- [openskills](https://github.com/numman-ali/openskills) - Universal skills loader
- UDS CLI (`uds init`) - Generates configs for multiple AI tools

---

## 5. Configuration Reference

### 5.1 Configuration Files

| AI Agent | Project Config | Global Config | Character Limit |
|----------|----------------|---------------|-----------------|
| Claude Code | `CLAUDE.md` | `~/.claude/CLAUDE.md` | ~100KB |
| OpenCode | `AGENTS.md` | `~/.config/opencode/AGENTS.md` | No limit |
| Cursor | `.cursor/skills/`, `.cursor/rules/*.mdc` | `~/.cursor/skills/` | Per file |
| Windsurf | `.windsurfrules` | Settings UI | 6K/file, 12K total |
| Cline | `.clinerules` | `~/.cline-rules/` | No limit |
| Roo Code | `.roorules` | `~/.roo/rules/` | No limit |
| GitHub Copilot | `.github/copilot-instructions.md` | Personal settings | ~8KB |
| OpenAI Codex | `AGENTS.md` | `~/.codex/AGENTS.md` | 32KB |
| Gemini CLI | `GEMINI.md` | `~/.gemini/GEMINI.md` | 1M tokens |
| Antigravity | `INSTRUCTIONS.md` | `~/.antigravity/` | Skills + Slash commands |

### 5.2 Configuration Merge Behavior

| AI Agent | Merge Strategy | Priority (High to Low) |
|----------|----------------|------------------------|
| Claude Code | Concatenate | Directory-scoped > Project > Personal |
| OpenCode | Concatenate | Project > Global |
| Cursor | Replace/Selective | `.mdc` by glob, alwaysApply flag |
| Windsurf | Truncate at limit | Global > Workspace > Mode-specific |
| Cline | Append | Project directory > Root file |
| GitHub Copilot | Combine | Personal > Repository > Organization |
| OpenAI Codex | Concatenate | Override files > Base, closer wins |
| Gemini CLI | Concatenate | All files with `@import` support |
| Antigravity | Concatenate | Workspace > Global |

### 5.3 Skills File Format

> **Standard Format**: SKILL.md with YAML frontmatter is the universal format supported by most tools.

| AI Agent | Skills Format | Config Format | Frontmatter |
|----------|:-------------:|---------------|-------------|
| Claude Code | ✅ SKILL.md | `CLAUDE.md` | YAML (`---`) |
| OpenCode | ✅ SKILL.md | `AGENTS.md` | YAML |
| GitHub Copilot | ✅ SKILL.md | `copilot-instructions.md` | YAML |
| Cline | ✅ SKILL.md | `.clinerules/` | YAML |
| Roo Code | ✅ SKILL.md | `.roo/rules/` | YAML |
| OpenAI Codex | ✅ SKILL.md | `AGENTS.md` | YAML |
| Windsurf | ✅ SKILL.md | `.windsurfrules` | YAML |
| Gemini CLI | ✅ SKILL.md | `GEMINI.md` | YAML |
| Cursor | ✅ SKILL.md | `.cursor/skills/`, `.cursor/rules/` | YAML (globs, alwaysApply) |
| Antigravity | ✅ SKILL.md | `INSTRUCTIONS.md` | YAML |

---

## 6. Resources

### Official Documentation

| Tool | Documentation |
|------|---------------|
| Claude Code | [docs.anthropic.com/claude-code](https://docs.anthropic.com/claude-code) |
| OpenCode | [opencode.ai/docs](https://opencode.ai/docs) |
| Cursor | [docs.cursor.com](https://docs.cursor.com) |
| GitHub Copilot | [docs.github.com/copilot](https://docs.github.com/copilot) |
| Windsurf | [docs.windsurf.com](https://docs.windsurf.com/) |
| OpenAI Codex | [developers.openai.com/codex](https://developers.openai.com/codex/guides/agents-md/) |
| Gemini CLI | [github.com/google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) |

### Skills Marketplaces

| Platform | URL |
|----------|-----|
| n-skills | [github.com/numman-ali/n-skills](https://github.com/numman-ali/n-skills) |
| claude-plugins.dev | [claude-plugins.dev/skills](https://claude-plugins.dev/skills) |
| agentskills.io | [agentskills.io](https://agentskills.io) |

### Contributing

1. Research the tool's configuration format
2. Create integration directory under `integrations/<tool-name>/`
3. Add README.md with setup instructions
4. Update this document
5. Submit PR following [CONTRIBUTING.md](../CONTRIBUTING.md)

**Issues**: [GitHub Issues](https://github.com/anthropics-tw/universal-dev-standards/issues)

---

## Appendix: Future Development

### Potential New Tools

| Tool | Priority | Notes |
|------|----------|-------|
| Aider | High | Git-aware, auto-commit, local model support |
| Continue.dev | High | Community-driven, open source |
| Amazon Q Developer | Medium | AWS ecosystem |
| JetBrains AI Assistant | Medium | JetBrains ecosystem |
| Sourcegraph Cody | Medium | Enterprise features |

### Feature Enhancement Roadmap

| Feature | Description | Status |
|---------|-------------|--------|
| SKILL.md Standard | Universal Skills format | ✅ Achieved (Dec 2025) |
| Cross-tool compatibility | Most tools read `.claude/skills/` | ✅ Achieved |
| Skills marketplace | Publish and discover Skills | ✅ Multiple platforms |
| Multi-Agent Installation | Install Skills to multiple agents at once | ✅ v3.5.0 |
| Gemini CLI TOML | Auto-convert commands to TOML format | ✅ v3.5.0 |
| Cursor Skills Support | Native SKILL.md support | ✅ v2.4 (Jan 22, 2026) |
| Antigravity Skills | Native SKILL.md + slash commands | ✅ Nov 2025 |
| Gemini CLI Skills Stable | Skills promoted from preview to stable | ✅ v0.27.0 (Feb 3, 2026) |
| Windsurf Full Skills | Skills + Workflows (owned by Cognition) | ✅ Jan 2026 |
| 100% SKILL.md Coverage | All 10 tracked AI tools support SKILL.md | ✅ Achieved (Feb 2026) |
| CLI auto-detect | Detect installed AI tools | Planned |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.5.0 | 2026-02-09 | Research update: Antigravity supports Skills + slash commands (was incorrectly marked as unsupported); Gemini CLI Skills promoted to stable (v0.27.0); Windsurf upgraded to partial (Skills + Workflows); Cursor version corrected to v2.4; Added source URLs to Key Developments; All 10 AI tools now support SKILL.md (100% coverage) |
| 2.4.0 | 2026-01-27 | Updated Cursor to complete/full Skills support (v2.3.35); Added "2026 Industry Changes Summary" section; Removed "Rules Only" category (Cursor upgraded) |
| 2.3.0 | 2026-01-22 | Added UDS CLI Implementation Status section with status definitions; Added Antigravity to all tables for CLI consistency |
| 2.2.0 | 2026-01-15 | Added Multi-Agent Installation, Gemini CLI TOML conversion |
| 2.1.0 | 2026-01-15 | Updated Skills support status for all tools (industry-wide adoption) |
| 2.0.0 | 2026-01-15 | Major restructure: consolidated content, reduced tables |
| 1.1.0 | 2026-01-15 | Added Configuration File Matrix, Skills System Configuration |
| 1.0.0 | 2026-01-14 | Initial release |
