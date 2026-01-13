# Google Antigravity Integration

> **Language**: English | [繁體中文](../../locales/zh-TW/integrations/google-antigravity/README.md) | [简体中文](../../locales/zh-CN/integrations/google-antigravity/README.md)

**Version**: 1.1.0
**Last Updated**: 2026-01-09

This directory provides resources for integrating Universal Doc Standards with Google Antigravity.

## Overview

Google Antigravity is an advanced agentic coding assistant. This integration helps Antigravity agents utilize the Universal Doc Standards to generate higher quality, hallucination-free code and documentation.

## Resources

- **[.antigravity/rules.md](./.antigravity/rules.md)** (Recommended):
  Project-level rules file, automatically loaded by Antigravity.

- **[INSTRUCTIONS.md](./INSTRUCTIONS.md)**:
  System prompt snippets for manual configuration.

## Rules Configuration

Google Antigravity supports two levels of rules:

| Type | File Location | Description |
|------|--------------|-------------|
| Global Rules | `~/.gemini/GEMINI.md` | Applies to all projects |
| Project Rules | `.antigravity/rules.md` | Project-specific rules (auto-loaded) |

## Quick Start

### Option 1: Project Rules (Recommended)

Copy the project rules file to your project:

```bash
# Create directory and copy rules file
mkdir -p .antigravity
cp integrations/google-antigravity/.antigravity/rules.md .antigravity/

# Or use curl
mkdir -p .antigravity
curl -o .antigravity/rules.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/google-antigravity/.antigravity/rules.md
```

### Option 2: Manual Configuration

1. **Install Standards**:
   Ensure `core/` standards are copied to your project (e.g., `.standards/`).

2. **Configure Agent**:
   Copy the content from `INSTRUCTIONS.md` into your Antigravity "User Rules" or specific task instructions.

### Verify Compliance

Ask the agent to "Review this code following anti-hallucination standards".

---

## Related Standards

- [Anti-Hallucination Standards](../../core/anti-hallucination.md)
- [Commit Message Guide](../../core/commit-message-guide.md)
- [INSTRUCTIONS.md](./INSTRUCTIONS.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-09 | Added: `.antigravity/rules.md` project rules file, Rules Configuration section |
| 1.0.1 | 2025-12-24 | Added: Related Standards, Version History, License sections |
| 1.0.0 | 2025-12-23 | Initial Google Antigravity integration |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
