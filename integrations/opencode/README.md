# OpenCode Integration

> **Language**: English | [繁體中文](../../locales/zh-TW/integrations/opencode/README.md) | [简体中文](../../locales/zh-CN/integrations/opencode/README.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-09

This directory provides resources for integrating Universal Dev Standards with OpenCode.

## Overview

OpenCode is an open-source AI coding agent that can run as a terminal interface, desktop app, or IDE extension. This integration helps OpenCode understand your project and follow development standards.

## Resources

- **[AGENTS.md](./AGENTS.md)** (Required):
  Project-level rules file, automatically loaded by OpenCode.

- **[opencode.json](./opencode.json)** (Optional):
  Configuration example with permission settings and custom agents.

## Configuration Levels

OpenCode supports multiple configuration levels:

| Type | File Location | Description |
|------|--------------|-------------|
| Project Rules | `AGENTS.md` | Project root, auto-loaded |
| Global Rules | `~/.config/opencode/AGENTS.md` | Personal rules for all projects |
| Project Config | `opencode.json` | JSON configuration |
| Global Config | `~/.config/opencode/opencode.json` | Global JSON config |
| Custom Agents | `.opencode/agent/*.md` | Project-level agents |
| Global Agents | `~/.config/opencode/agent/*.md` | Global agents |

## Quick Start

### Option 1: Copy Rules File (Recommended)

```bash
# Copy to your project root
cp integrations/opencode/AGENTS.md AGENTS.md

# Optional: Copy config file
cp integrations/opencode/opencode.json opencode.json
```

### Option 2: Use curl

```bash
curl -o AGENTS.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/opencode/AGENTS.md
```

### Option 3: Use /init (Append Mode)

```bash
opencode
/init
```

Note: `/init` will **append** to existing AGENTS.md, not overwrite.

## Rules Merging Behavior

OpenCode's rule merging mechanism:

| Situation | Behavior |
|-----------|----------|
| `/init` with existing AGENTS.md | **Append** new content, don't overwrite |
| Global + Project rules both exist | **Merge** both, project rules take precedence |
| Config files (opencode.json) | **Merge**, only conflicting keys are overwritten |

## Configuration Options

### opencode.json

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": ["AGENTS.md", "CONTRIBUTING.md"],
  "permission": {
    "edit": "ask",
    "bash": "ask"
  },
  "agent": {
    "code-reviewer": {
      "description": "Reviews code following standards",
      "mode": "subagent",
      "tools": {"write": false, "edit": false}
    }
  }
}
```

**Key Options**:
- `instructions`: Reference additional rule files (useful for monorepos)
- `permission`: Require user confirmation for edits and bash
- `agent`: Define custom agents with specific capabilities

---

## Related Standards

- [Anti-Hallucination Standards](../../core/anti-hallucination.md)
- [Commit Message Guide](../../core/commit-message-guide.md)
- [Code Review Checklist](../../core/code-review-checklist.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-09 | Initial OpenCode integration |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
