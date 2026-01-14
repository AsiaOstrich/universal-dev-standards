# AI Agent Integration Roadmap

> **Language**: English | [繁體中文](../locales/zh-TW/docs/AI-AGENT-ROADMAP.md) | [简体中文](../locales/zh-CN/docs/AI-AGENT-ROADMAP.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-14

This document records the current AI Agent support status and future development plans for Universal Development Standards (UDS).

---

## Table of Contents

1. [Current Support Status](#1-current-support-status)
2. [Integration Depth Classification](#2-integration-depth-classification)
3. [Skills Compatibility Matrix](#3-skills-compatibility-matrix)
4. [Skills Storage Locations](#4-skills-storage-locations)
5. [Future Development](#5-future-development)
6. [Community Resources](#6-community-resources)
7. [Contributing](#7-contributing)

---

## 1. Current Support Status

UDS currently supports **11 AI Agents/Tools**, categorized by integration depth:

| Level | AI Agent | Integration Type | Directory | Status | Platform Tested |
|-------|----------|-----------------|-----------|--------|-----------------|
| **Level 1** | Claude Code | 18 Native Skills | `skills/claude-code/` | ✅ Complete | macOS ✅ |
| **Level 1** | OpenCode | Skills + AGENTS.md | `integrations/opencode/` | ✅ Complete | macOS 🧪 |
| **Level 2** | Cursor | Can read `.claude/skills/` | `skills/cursor/`, `integrations/cursor/` | ✅ Complete | - |
| **Level 2** | GitHub Copilot | Partial Skills support | `skills/copilot/`, `integrations/github-copilot/` | ✅ Complete | macOS 🧪 |
| **Level 3** | Windsurf | .windsurfrules | `skills/windsurf/`, `integrations/windsurf/` | ✅ Complete | - |
| **Level 3** | Cline | .clinerules | `skills/cline/`, `integrations/cline/` | ✅ Complete | - |
| **Level 4** | OpenAI Codex | AGENTS.md | `integrations/codex/` | ✅ Complete | - |
| **Level 4** | OpenSpec | AGENTS.md | `integrations/openspec/` | ✅ Complete | - |
| **Level 4** | Spec Kit | AGENTS.md | `integrations/spec-kit/` | ✅ Complete | - |
| **Level 5** | Google Gemini CLI | GEMINI.md | `integrations/gemini-cli/` | ✅ Complete | - |
| **Level 5** | Google Antigravity | rules.md | `integrations/google-antigravity/` | ✅ Complete | - |

### Platform Support Status

| Platform | CLI Tool | Skills | Notes |
|----------|----------|--------|-------|
| **macOS** | ✅ Tested | ✅ Tested | Primary development platform |
| **Linux** | ⚠️ Untested | ⚠️ Untested | Expected to work (Node.js based) |
| **Windows** | ⚠️ Untested | ⚠️ Untested | PowerShell scripts provided |

**Legend**: ✅ Tested | 🧪 Testing | ⚠️ Untested | - Not applicable

---

## 2. Integration Depth Classification

### Level 1: Native Skills Support
- **Full Skills compatibility**: Can directly use all 18 Claude Code Skills
- **Slash command support**: Supports `/commit`, `/review`, `/tdd` etc.
- **Auto-trigger**: Keywords automatically invoke relevant Skills
- **Tools**: Claude Code, OpenCode

### Level 2: Skills Compatible
- **Readable Skills**: Can read `.claude/skills/` directory
- **Limited slash commands**: Some tools don't support all commands
- **Manual invocation required**: Some features need explicit calls
- **Tools**: Cursor, GitHub Copilot

### Level 3: Rules File Format
- **Dedicated rule files**: Use tool-specific formats
- **Static rules**: Rules loaded at startup, no dynamic Skills
- **Cross-tool generation**: UDS CLI can generate rule files for these tools
- **Tools**: Windsurf (.windsurfrules), Cline (.clinerules)

### Level 4: Agent Rules
- **AGENTS.md format**: Follow OpenAI Codex agent specification
- **SDD tool support**: Includes Spec-Driven Development tools
- **Static configuration**: Rules defined in markdown files
- **Tools**: OpenAI Codex, OpenSpec, Spec Kit

### Level 5: Instruction Files
- **Custom formats**: Each tool has its own instruction format
- **Basic integration**: Provide core development standards
- **Limited functionality**: No Skills or slash command support
- **Tools**: Google Gemini CLI (GEMINI.md), Google Antigravity (rules.md)

---

## 3. Skills Compatibility Matrix

### 18 Claude Code Skills

| # | Skill | Slash Command | Claude | OpenCode | Cursor | Copilot |
|---|-------|---------------|--------|----------|--------|---------|
| 1 | ai-collaboration-standards | - | ✅ | ✅ | ✅ | ✅ |
| 2 | checkin-assistant | `/check` | ✅ | ✅ | ⚠️ | ⚠️ |
| 3 | commit-standards | `/commit` | ✅ | ✅ | ⚠️ | ⚠️ |
| 4 | code-review-assistant | `/review` | ✅ | ✅ | ⚠️ | ⚠️ |
| 5 | testing-guide | - | ✅ | ✅ | ✅ | ✅ |
| 6 | tdd-assistant | `/tdd` | ✅ | ✅ | ⚠️ | ⚠️ |
| 7 | release-standards | `/release` | ✅ | ✅ | ⚠️ | ❌ |
| 8 | git-workflow-guide | - | ✅ | ✅ | ✅ | ✅ |
| 9 | documentation-guide | `/docs` | ✅ | ✅ | ⚠️ | ❌ |
| 10 | requirement-assistant | `/requirement` | ✅ | ✅ | ⚠️ | ⚠️ |
| 11 | changelog-guide | `/changelog` | ✅ | ✅ | ⚠️ | ❌ |
| 12 | spec-driven-dev | `/spec` | ✅ | ✅ | ⚠️ | ⚠️ |
| 13 | test-coverage-assistant | `/coverage` | ✅ | ✅ | ⚠️ | ⚠️ |
| 14 | refactoring-assistant | - | ✅ | ✅ | ✅ | ✅ |
| 15 | error-code-guide | - | ✅ | ✅ | ✅ | ✅ |
| 16 | methodology-system | `/methodology` | ✅ | ✅ | ⚠️ | ❌ |
| 17 | project-structure-guide | `/config` | ✅ | ✅ | ⚠️ | ❌ |
| 18 | logging-guide | - | ✅ | ✅ | ✅ | ✅ |

**Legend**: ✅ Full support | ⚠️ Partial/Manual | ❌ Not supported

---

## 4. Skills Storage Locations

### Project-Level Paths

| AI Agent | Primary Path | Alternative Path | Claude Compatible |
|----------|-------------|------------------|-------------------|
| Claude Code | `.claude/skills/` | - | ✅ Native |
| OpenCode | `.opencode/skill/` | `.claude/skills/` | ✅ Yes |
| Cursor | `.cursor/skills/` | `.claude/skills/` | ✅ Yes |
| GitHub Copilot | `.github/skills/` | `.claude/skills/` (Legacy) | ✅ Yes |
| OpenAI Codex | `.codex/skills/` | - | ❌ Independent |
| Windsurf | `.windsurf/skills/` | - | ❌ Independent |
| Cline | `.cline/skills/` | - | ❌ Independent |

### User-Level Paths

| AI Agent | User Path |
|----------|-----------|
| Claude Code | `~/.claude/skills/` |
| OpenCode | `~/.config/opencode/skill/` |
| Cursor | `~/.cursor/skills/` |
| GitHub Copilot | `~/.copilot/skills/` |
| OpenAI Codex | `~/.codex/skills/` |
| Windsurf | `~/.codeium/windsurf/skills/` |
| Cline | `~/.cline/skills/` |

### Recommendation

**Use `.claude/skills/` as default installation path** for maximum cross-tool compatibility. Most Skills-compatible tools support reading from this location.

---

## 5. Future Development

### 5.1 Potential New Tools

| Tool | Type | Priority | Notes |
|------|------|----------|-------|
| Amazon Q Developer | IDE Plugin | Medium | AWS ecosystem integration |
| JetBrains AI Assistant | IDE Plugin | Medium | JetBrains ecosystem |
| Tabnine | Code Completion | Low | Privacy-focused option |
| Sourcegraph Cody | Code Search + AI | Medium | Enterprise features |
| Continue.dev | Open Source | High | Community-driven, open |

### 5.2 Feature Enhancement Roadmap

| Feature | Description | Target Tools |
|---------|-------------|--------------|
| Skills v2 Format | Enhanced metadata, dependencies | All Level 1-2 |
| Cross-tool sync | Automatic rule file generation | Level 3-5 |
| CLI auto-detect | Detect installed AI tools | All |
| Skills marketplace | Publish and discover Skills | Level 1-2 |

### 5.3 Integration Improvements

- **Windsurf/Cline**: Explore Skills format adoption
- **Copilot**: Deeper Chat integration
- **Codex**: Monitor for Skills support
- **OpenCode**: Continue as reference implementation

---

## 6. Community Resources

### Skills Marketplaces

| Platform | URL | Supported Tools |
|----------|-----|-----------------|
| n-skills | https://github.com/numman-ali/n-skills | Claude, Cursor, Windsurf, Cline, OpenCode, Codex |
| claude-plugins.dev | https://claude-plugins.dev/skills | Claude, Cursor, OpenCode, Codex |
| agentskills.io | https://agentskills.io | All Skills-compatible tools |

### Official Documentation

| Tool | Documentation |
|------|---------------|
| Claude Code | https://docs.anthropic.com/claude-code |
| OpenCode | https://opencode.ai/docs |
| Cursor | https://docs.cursor.com |
| GitHub Copilot | https://docs.github.com/copilot |

---

## 7. Contributing

### Adding Support for New AI Tools

1. Research the tool's configuration format
2. Create integration directory under `integrations/<tool-name>/`
3. Add README.md with setup instructions
4. If Skills-compatible, add skills-mapping.md
5. Update this roadmap document
6. Submit PR following [CONTRIBUTING.md](../CONTRIBUTING.md)

### Reporting Issues

- Integration issues: [GitHub Issues](https://github.com/anthropics-tw/universal-dev-standards/issues)
- Feature requests: Use `enhancement` label
- Documentation: Use `documentation` label

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-14 | Initial release |
