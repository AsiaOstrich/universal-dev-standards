# GitHub Copilot Integration

> **Language**: English | [繁體中文](../../locales/zh-TW/integrations/github-copilot/README.md) | [简体中文](../../locales/zh-CN/integrations/github-copilot/README.md)

**Version**: 2.0.0
**Last Updated**: 2026-01-13

This directory provides resources for integrating Universal Dev Standards with [GitHub Copilot](https://github.com/features/copilot).

## Overview

GitHub Copilot is an AI coding assistant built into GitHub and popular IDEs. This integration provides custom instructions to help Copilot generate higher quality, standards-compliant code and documentation.

## Resources

| File | Description |
|------|-------------|
| **[copilot-instructions.md](./copilot-instructions.md)** | Custom instructions for Copilot Chat |
| **[COPILOT-CHAT-REFERENCE.md](./COPILOT-CHAT-REFERENCE.md)** | Chat prompt templates |
| **[skills-mapping.md](./skills-mapping.md)** | Claude Code skills mapping |

## Quick Start

### Option 1: Project Level (Recommended)

Copy the instructions file to your project:

```bash
# Create .github directory if needed
mkdir -p .github

# Copy instructions file
cp integrations/github-copilot/copilot-instructions.md .github/copilot-instructions.md
```

### Option 2: Download via curl

```bash
mkdir -p .github
curl -o .github/copilot-instructions.md \
  https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/github-copilot/copilot-instructions.md
```

### Option 3: UDS CLI

```bash
# Install UDS CLI
npm install -g universal-dev-standards

# Initialize with Copilot integration
uds init
# Select "GitHub Copilot" when prompted
```

## Configuration

### VS Code

1. Install [GitHub Copilot Extension](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)
2. Ensure `.github/copilot-instructions.md` exists in project root
3. Copilot Chat will automatically use the instructions

### GitHub Web (github.com)

1. Navigate to your repository
2. Ensure `.github/copilot-instructions.md` exists
3. Use Copilot Chat in the GitHub web interface

### JetBrains IDEs

1. Install GitHub Copilot plugin
2. Ensure `.github/copilot-instructions.md` exists in project root
3. Copilot Chat will automatically use the instructions

## Limitations

GitHub Copilot has certain limitations compared to other AI coding tools:

### Configuration Hierarchy

| Level | Location | Support |
|-------|----------|---------|
| Project | `.github/copilot-instructions.md` | ✅ Supported |
| Global | User settings | ❌ Not supported |
| Subdirectory | N/A | ❌ Not supported |
| Runtime override | N/A | ❌ Not supported |

### Feature Comparison

| Feature | Copilot | Claude Code | Gemini CLI |
|---------|---------|-------------|------------|
| Project instructions | ✅ | ✅ | ✅ |
| Global configuration | ❌ | ✅ | ✅ |
| Slash commands | ❌ | ✅ (18 skills) | ❌ |
| MCP support | ❌ | ✅ | ❌ |
| Custom skills | ❌ | ✅ | ✅ |
| Multi-file context | ⚠️ Limited | ✅ | ✅ |
| Code generation | ✅ | ✅ | ✅ |
| Chat interface | ✅ | ✅ | ✅ |

### Workarounds

Since Copilot doesn't support slash commands, use Chat prompts instead:

```
Claude Code: /commit
Copilot:     "Generate a commit message following Conventional Commits..."

Claude Code: /review
Copilot:     "Review this code following the code review checklist..."

Claude Code: /tdd
Copilot:     "Help me implement using TDD (Red-Green-Refactor)..."
```

See [COPILOT-CHAT-REFERENCE.md](./COPILOT-CHAT-REFERENCE.md) for complete prompt templates.

## Included Standards

The `copilot-instructions.md` file includes these standards:

| Standard | Description |
|----------|-------------|
| Anti-Hallucination | Evidence-based analysis, source attribution |
| Commit Standards | Conventional Commits format |
| Code Review | 10-category checklist, comment prefixes |
| TDD Guidelines | Red-Green-Refactor cycle, FIRST principles |
| Test Coverage | 7 dimensions framework |
| Check-in Standards | Pre-commit quality gates |
| Requirement Writing | INVEST criteria, user story format |

## Verify Integration

To verify the instructions are loaded:

1. Open Copilot Chat in your IDE
2. Ask: "What standards should I follow for commit messages?"
3. Copilot should reference Conventional Commits format

---

## Related Standards

- [Anti-Hallucination Standards](../../core/anti-hallucination.md)
- [Commit Message Guide](../../core/commit-message-guide.md)
- [Code Review Checklist](../../core/code-review-checklist.md)
- [Testing Standards](../../core/testing-standards.md)
- [Checkin Standards](../../core/checkin-standards.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-01-13 | Major enhancement: Added README, Chat reference, skills mapping; Enhanced instructions with TDD, coverage, review sections |
| 1.0.1 | 2025-12-24 | Added: Related Standards, Version History, License sections |
| 1.0.0 | 2025-12-23 | Initial GitHub Copilot integration |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
