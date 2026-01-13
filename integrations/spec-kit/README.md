# Spec Kit Integration

> **Language**: English | [繁體中文](../../locales/zh-TW/integrations/spec-kit/README.md) | [简体中文](../../locales/zh-CN/integrations/spec-kit/README.md)

**Version**: 1.0.0
**Last Updated**: 2025-12-30

This directory contains integration files for [Spec Kit](https://github.com/spec-kit/spec-kit), a lightweight specification tracking tool for spec-driven development.

## Files

| File | Description |
|------|-------------|
| `AGENTS.md` | Instructions for AI assistants using Spec Kit |

## Usage

### Manual Installation

Copy `AGENTS.md` to your project or include its content in your AI assistant's system instructions.

### With Claude Code

If using Claude Code, you can reference this file in your `CLAUDE.md`:

```markdown
## Spec-Driven Development

This project uses Spec Kit for specification management. Follow the guidelines in:
- [Spec Kit Instructions](integrations/spec-kit/AGENTS.md)
```

## Related

- [OpenSpec Integration](../openspec/) - Alternative SDD tool integration
- [Spec-Driven Development Standard](../../core/spec-driven-development.md) - SDD methodology

## Note

Spec Kit and OpenSpec are **specification-driven development tools**, not AI coding assistants. They are not included in the `uds init` AI tools selection, but can be manually integrated as needed.
