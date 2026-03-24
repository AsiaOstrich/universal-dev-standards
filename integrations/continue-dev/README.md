# Continue.dev Integration

**Version**: 1.0.0
**Last Updated**: 2026-03-24

This directory provides resources for integrating Universal Dev Standards with Continue.dev.

## Overview

Continue.dev is an open-source AI code assistant that runs as a VS Code and JetBrains extension. It provides inline chat, autocomplete, and slash commands powered by any LLM. Continue.dev supports context providers and custom configurations, making it well-suited for enforcing project standards.

## Resources

- **[AGENTS.md](./AGENTS.md)** (Required):
  Project-level rules file. Load as context in Continue.dev sessions.

## Quick Start

### Option 1: Configure Context Provider (Recommended)

Add UDS standards to `.continue/config.json` in your project:

```json
{
  "contextProviders": [
    {
      "name": "file",
      "params": {
        "file": "AGENTS.md"
      }
    }
  ]
}
```

Then copy the rules file:

```bash
cp integrations/continue-dev/AGENTS.md AGENTS.md
```

### Option 2: System Message

Add UDS rules as a system message in `.continue/config.json`:

```json
{
  "models": [
    {
      "title": "Your Model",
      "provider": "anthropic",
      "model": "claude-sonnet-4-20250514",
      "systemMessage": "You follow Universal Development Standards. Always use evidence-based analysis, cite sources with [Source: Code] tags, and follow Conventional Commits format."
    }
  ]
}
```

### Option 3: Use curl

```bash
curl -o AGENTS.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/continue-dev/AGENTS.md
```

## Configuration Reference

### .continue/config.json

| Setting | Purpose |
|---------|---------|
| `contextProviders` | Load AGENTS.md as project context |
| `models[].systemMessage` | Embed UDS rules in system prompt |
| `slashCommands` | Define custom commands for UDS workflows |
| `customCommands` | Create project-specific UDS commands |

### Key Continue.dev Features

| Feature | UDS Integration | Description |
|---------|----------------|-------------|
| `@file AGENTS.md` | Context loading | Reference standards in any chat |
| `/edit` | Implementation | Edit code with standards context |
| `/comment` | Documentation | Add standards-compliant comments |
| Inline chat | Code review | Review code against UDS checklist |
| Autocomplete | Code quality | Standards-aware completions |

### Custom Slash Commands

Add UDS-specific commands to `.continue/config.json`:

```json
{
  "customCommands": [
    {
      "name": "commit-msg",
      "description": "Generate a Conventional Commits message",
      "prompt": "Generate a commit message for the staged changes using Conventional Commits format: <type>(<scope>): <subject>. Types: feat, fix, docs, chore, test, refactor, style."
    },
    {
      "name": "review",
      "description": "Review code against UDS standards",
      "prompt": "Review the selected code against these criteria: 1) Functionality 2) Security (OWASP Top 10) 3) Performance 4) Maintainability 5) Test coverage. Use [Source: Code] tags for references."
    }
  ]
}
```

## How UDS Standards Apply

1. **Anti-Hallucination**: Context providers ensure the AI has access to actual project files
2. **Commit Standards**: Custom slash commands enforce Conventional Commits format
3. **Quality Gates**: System messages reinforce check-in standards
4. **Code Review**: Inline chat enables standards-based code review

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
| 1.0.0 | 2026-03-24 | Initial Continue.dev integration |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
