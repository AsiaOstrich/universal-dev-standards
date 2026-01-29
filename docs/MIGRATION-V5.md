# Migration Guide: Universal Dev Standards V5

> **Language**: English | [繁體中文](../locales/zh-TW/docs/MIGRATION-V5.md)

**Version**: 5.0.0
**Status**: Breaking Change (Token Optimization)

## Overview

Universal Development Standards V5 introduces a significant architectural change designed to **reduce AI token consumption by up to 75%**. We have separated actionable rules from educational content.

## Major Changes

### 1. Rules vs. Guides Separation

In V4, many standard files were massive (e.g., `testing-standards.md` was 141KB). In V5, these have been split:

| Component | Location | Purpose | AI Behavior |
|-----------|----------|---------|-------------|
| **Rules** | `core/*.md` | Actionable rules, checklists, thresholds | **Always Read** |
| **Guides** | `core/guides/*.md` | Detailed explanations, tutorials, examples | **Read on Demand Only** |
| **Methodologies** | `methodologies/guides/*.md` | Full methodology guides (TDD, BDD, etc.) | **Read on Demand Only** |

### 2. File Relocations

The following methodology files have been moved from `core/` to `methodologies/guides/`:
- `test-driven-development.md`
- `acceptance-test-driven-development.md`
- `spec-driven-development.md`
- `behavior-driven-development.md`
- `requirement-engineering.md`

### 3. AI Agent Instructions

New AI tool configurations (`.cursorrules`, `CLAUDE.md`, etc.) now include a **Core Standards Usage Rule** that instructs AI agents to prioritize the lightweight rules in `core/` to save tokens.

## How to Upgrade

### For Existing Projects

If you have already initialized UDS in your project, follow these steps to benefit from the token optimization:

1. **Update CLI**:
   ```bash
   npm install -g universal-dev-standards@alpha
   ```

2. **Sync References**:
   Run the update command to pull the new lightweight rule files and guides:
   ```bash
   uds update --sync-refs
   ```

3. **Update AI Rules**:
   Re-generate or update your AI tool configuration file (e.g., `.cursorrules`) to include the new usage instructions:
   ```bash
   uds configure
   # Select your AI tool and Choose "Update"
   ```

### Backward Compatibility

We have left **Stub Files** in the original `core/` locations. These are small files (~1KB) that provide a summary and a link to the new full guide. This ensures that any existing hardcoded links or references in your documentation will not break.

## FAQ

### Why did you do this?
Modern AI models have context window limits and cost per token. Large documentation files degrade AI performance and increase latency. V5 makes the "always-on" context much smaller while keeping the full knowledge available.

### Do I need to change my code?
No. This change only affects documentation structure and AI agent behavior.
