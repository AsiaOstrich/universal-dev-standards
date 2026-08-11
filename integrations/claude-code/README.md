# Claude Code Integration

> **Language**: English | [繁體中文](../../locales/zh-TW/integrations/claude-code/README.md)

**Version**: 1.1.0
**Last Updated**: 2026-08-12

This directory contains resources for integrating Universal Development Standards with [Claude Code](https://docs.anthropic.com/claude-code).

## Overview

Claude Code is an advanced AI coding agent that can directly interact with your codebase. This integration provides:

1.  **Project Context (`CLAUDE.md`)**: Defines project-specific rules, style guides, and commands.
2.  **Skills (`skills/`)**: Specialized capabilities for TDD, SDD, Code Review, etc.
3.  **Model tier × effort mapping**: the host-layer half of `core/model-selection.md`.
4.  **Reference subagent definitions**: `.claude/agents/*.md`, one per model tier.
5.  **Cross-repository dispatch template**: what a subagent prompt must carry when the target repository is not the one your session is running in.

## Model selection on this host (XSPEC-362 R5)

`core/model-selection.md` is vendor-neutral by rule — it defines tiers (`fast` / `standard` /
`capable`) and effort levels (`low` … `max`) as labels, and states that it cannot say which effort
levels a given model accepts. The files below answer that for Claude Code, and are the **only**
place in this repository where concrete model identifiers belong.

| File | What it is |
|---|---|
| [`model-selection-mapping.md`](model-selection-mapping.md) | tier → `model`, effort → `effort`, the resolved tier × effort grid, and the hard-boundary register |
| [`model-selection-mapping.ai.yaml`](model-selection-mapping.ai.yaml) | the same mapping, machine-readable |
| [`.claude/agents/`](.claude/agents/) | four reference subagent definitions, one per tier plus a long-horizon variant |
| [`dispatch-template.md`](dispatch-template.md) | the cross-repository dispatch template and the measurement that motivates it |

Two facts from that mapping are worth knowing before you read anything else:

- **UDS `very-high` is spelled `xhigh` in Claude Code.** It is the only renamed level. The standard
  is not bent to match the tool; the rename is absorbed here.
- **The `fast` tier has no effort axis on this host.** Its model accepts no effort level, so the
  standard's "raise effort before escalating the tier" rule has nothing to raise there.

Dispatch mechanics — parallel safety, independent domains, the status protocol — are **not** covered
by these files. They belong to [`core/agent-dispatch.md`](../../core/agent-dispatch.md), which these
files cite rather than restate.

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
