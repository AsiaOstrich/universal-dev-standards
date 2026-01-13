# Gemini CLI Integration

> **Language**: English | [繁體中文](../../locales/zh-TW/integrations/gemini-cli/README.md) | [简体中文](../../locales/zh-CN/integrations/gemini-cli/README.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-09

This directory provides resources for integrating Universal Doc Standards with [Gemini CLI](https://geminicli.com/).

## Overview

Gemini CLI is Google's open-source AI agent that brings the power of Gemini directly into your terminal. This integration helps Gemini CLI utilize the Universal Doc Standards to generate higher quality, hallucination-free code and documentation.

## Resources

- **[GEMINI.md](./GEMINI.md)** (Recommended):
  Project-level context file, automatically loaded by Gemini CLI.

- **[settings-example.json](./settings-example.json)**:
  Example settings file for customizing CLI behavior.

## Configuration Hierarchy

Gemini CLI supports a hierarchical context system:

| Level | File Location | Description |
|-------|--------------|-------------|
| Global | `~/.gemini/GEMINI.md` | Applies to all projects |
| Project | `./GEMINI.md` | Project root directory |
| Subdirectory | `./subdir/GEMINI.md` | Module-specific rules |
| Settings | `.gemini/settings.json` | Behavior configuration |

## Quick Start

### Option 1: Project Context (Recommended)

Copy the context file to your project root:

```bash
# Copy GEMINI.md to project root
cp integrations/gemini-cli/GEMINI.md ./GEMINI.md

# Or use curl
curl -o GEMINI.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/gemini-cli/GEMINI.md
```

### Option 2: Global Context

Add to your global context for all projects:

```bash
# Create global directory if needed
mkdir -p ~/.gemini

# Append or create global GEMINI.md
cat integrations/gemini-cli/GEMINI.md >> ~/.gemini/GEMINI.md
```

### Option 3: Custom Settings

Copy the settings example to customize CLI behavior:

```bash
# Create project settings directory
mkdir -p .gemini

# Copy settings example
cp integrations/gemini-cli/settings-example.json .gemini/settings.json
```

## Special Features

### Modular Imports

Gemini CLI supports importing content from other files:

```markdown
# In GEMINI.md
@./docs/coding-style.md
@./docs/api-guidelines.md
```

### Memory Commands

Manage context at runtime:

- `/memory show` - Display current context
- `/memory refresh` - Reload all GEMINI.md files
- `/memory add <text>` - Add to global context

### Verify Context

Check that standards are loaded:

```
/memory show
```

Ask the agent to confirm:

```
Review this code following anti-hallucination standards.
```

## Relationship with Google Antigravity

Both tools share the global `~/.gemini/` directory:

| Tool | Project Rules Location | Shared |
|------|----------------------|--------|
| Gemini CLI | `./GEMINI.md` | `~/.gemini/GEMINI.md` |
| Antigravity | `.antigravity/rules.md` | `~/.gemini/GEMINI.md` |

They can coexist, using the same global configuration.

---

## Related Standards

- [Anti-Hallucination Standards](../../core/anti-hallucination.md)
- [Commit Message Guide](../../core/commit-message-guide.md)
- [Spec-Driven Development](../../core/spec-driven-development.md)
- [Gemini CLI Official Docs](https://geminicli.com/docs/)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-09 | Initial Gemini CLI integration |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
