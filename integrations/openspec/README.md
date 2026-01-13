# OpenSpec Integration

> **Language**: English | [繁體中文](../../locales/zh-TW/integrations/openspec/README.md) | [简体中文](../../locales/zh-CN/integrations/openspec/README.md)

**Version**: 1.0.0
**Last Updated**: 2025-12-30

This directory contains integration files for [OpenSpec](https://github.com/openspec), a specification management tool for spec-driven development.

## Files

| File | Description |
|------|-------------|
| `AGENTS.md` | Comprehensive instructions for AI assistants using OpenSpec |

## Usage

### Manual Installation

Copy `AGENTS.md` to your project's `openspec/` directory, or include its content in your AI assistant's system instructions.

### With Claude Code

If using Claude Code, you can reference this file in your `CLAUDE.md`:

```markdown
## Spec-Driven Development

This project uses OpenSpec for specification management. Follow the guidelines in:
- [OpenSpec Instructions](openspec/AGENTS.md)
```

## Related

- [Spec Kit Integration](../spec-kit/) - Alternative lightweight SDD tool
- [Spec-Driven Development Standard](../../core/spec-driven-development.md) - SDD methodology

## Note

OpenSpec and Spec Kit are **specification-driven development tools**, not AI coding assistants. They are not included in the `uds init` AI tools selection, but can be manually integrated as needed.
