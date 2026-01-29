# Claude Code Integration

> **Language**: English | [繁體中文](../../locales/zh-TW/integrations/claude-code/README.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-29

This directory contains resources for integrating Universal Development Standards with [Claude Code](https://docs.anthropic.com/claude-code).

## Overview

Claude Code is an advanced AI coding agent that can directly interact with your codebase. This integration provides:

1.  **Project Context (`CLAUDE.md`)**: Defines project-specific rules, style guides, and commands.
2.  **Skills (`skills/`)**: Specialized capabilities for TDD, SDD, Code Review, etc.

## Setup

The easiest way to set up is using the UDS CLI:

```bash
npx universal-dev-standards init
# Select "Claude Code" from the list
```

### Manual Setup

1. Copy `CLAUDE.md` to your project root.
2. Ensure the `core/` directory is present in your project.
3. Install skills if needed (see `skills/README.md`).

## Verification

To verify the integration works:

1. Start Claude Code: `claude`
2. Ask: "What are the core standards for this project?"
3. It should read `CLAUDE.md` and reference the files in `core/`.

## Token Optimization

This integration is optimized for token usage:
- **Core Rules**: `core/*.md` (Lightweight rules)
- **Detailed Guides**: `core/guides/*.md` (Loaded only on demand)
