# OpenAI Codex Integration

> **Language**: English | [繁體中文](../../locales/zh-TW/integrations/codex/README.md) | [简体中文](../../locales/zh-CN/integrations/codex/README.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-09

This directory provides resources for integrating Universal Dev Standards with OpenAI Codex CLI.

## Overview

OpenAI Codex is a cloud-based AI coding agent that can run as a CLI, IDE extension, or web interface. It reads AGENTS.md files before executing tasks, making it easy to enforce project standards automatically.

## Resources

- **[AGENTS.md](./AGENTS.md)** (Required):
  Project-level rules file, automatically loaded by Codex.

- **[config.toml.example](./config.toml.example)** (Optional):
  Configuration example for Codex settings.

## Configuration Hierarchy

Codex builds an instruction chain with the following precedence:

| Level | File Location | Description |
|-------|--------------|-------------|
| Global Override | `~/.codex/AGENTS.override.md` | Temporary global override |
| Global Default | `~/.codex/AGENTS.md` | Personal rules for all projects |
| Project Root | `AGENTS.md` | Project-level rules |
| Subdirectory | `services/*/AGENTS.md` | Service-specific rules |
| Subdirectory Override | `services/*/AGENTS.override.md` | Temporary service override |

**Note**: Files closer to the working directory take precedence. Use `AGENTS.override.md` for temporary adjustments without modifying the base file.

## Quick Start

### Option 1: Copy Rules File (Recommended)

```bash
# Copy to your project root
cp integrations/codex/AGENTS.md AGENTS.md

# Optional: Set up global config
mkdir -p ~/.codex
cp integrations/codex/config.toml.example ~/.codex/config.toml
```

### Option 2: Use curl

```bash
curl -o AGENTS.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/codex/AGENTS.md
```

### Option 3: Verify Instructions

After setup, verify Codex loaded your instructions:

```bash
codex --ask-for-approval never "Summarize the current instructions."
```

## Configuration Options

### ~/.codex/config.toml

```toml
# Maximum bytes to read from each AGENTS.md file (default: 32768)
project_doc_max_bytes = 65536

# Fallback filenames when AGENTS.md is missing
project_doc_fallback_filenames = ["TEAM_GUIDE.md", ".agents.md"]
```

**Key Options**:
- `project_doc_max_bytes`: Increase for larger instruction files
- `project_doc_fallback_filenames`: Support alternative filenames

## Rules Merging Behavior

Codex merges instructions from root to working directory:

| Situation | Behavior |
|-----------|----------|
| Global + Project rules both exist | **Merge** both, project rules take precedence |
| Override file exists | **Replace** the base file at that level |
| Instructions truncated | Raise `project_doc_max_bytes` or split into subdirectories |

---

## Related Standards

- [Anti-Hallucination Standards](../../core/anti-hallucination.md)
- [Commit Message Guide](../../core/commit-message-guide.md)
- [Code Review Checklist](../../core/code-review-checklist.md)
- [Spec-Driven Development](../../core/spec-driven-development.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-09 | Initial OpenAI Codex integration |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
