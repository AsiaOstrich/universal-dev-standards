---
name: guide
description: [UDS] Access Universal Development Standards guides and references.
---

# /guide Command

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/commands/guide.md)

The `/guide` command is the central entry point for accessing all Universal Development Standards reference materials and guidelines.

## Usage

```bash
/guide [topic]
```

## Available Topics

| Topic | Description | Source |
|-------|-------------|--------|
| `git` | Git workflow & branching strategies | `skills/git-workflow-guide/` |
| `testing` | Testing pyramid & strategy | `skills/testing-guide/` |
| `errors` | Error code design standards | `skills/error-code-guide/` |
| `logging` | Structured logging standards | `skills/logging-guide/` |
| `structure` | Project structure conventions | `skills/project-structure-guide/` |
| `ai-arch` | AI-friendly architecture | `skills/ai-friendly-architecture/` |
| `ai-collab` | AI collaboration & anti-hallucination | `skills/ai-collaboration-standards/` |
| `ai-instruct` | AI instruction file standards | `skills/ai-instruction-standards/` |

## Examples

- `/guide git` - Show Git branching and naming conventions
- `/guide testing` - Show testing pyramid and best practices
- `/guide structure` - Show recommended project folder structure
- `/guide` - List all available guides

## Implementation Note for AI

When the user invokes `/guide [topic]`:
1.  Identify the requested topic.
2.  Read the corresponding standard/skill file (e.g., `skills/git-workflow-guide/SKILL.md`).
3.  Summarize or present the key information from that file to the user.
4.  If the topic is missing or invalid, list the available topics.
