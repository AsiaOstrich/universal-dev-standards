# Aider Integration

**Version**: 1.0.0
**Last Updated**: 2026-03-24

This directory provides resources for integrating Universal Dev Standards with Aider.

## Overview

Aider is an AI pair programming tool that runs in the terminal. It connects to LLMs (GPT-4, Claude, etc.) to help edit code in your local git repository. Aider automatically creates git commits for its changes, making it easy to track and review AI-assisted edits.

## Resources

- **[AGENTS.md](./AGENTS.md)** (Required):
  Project-level rules file. Load as read-only context for Aider sessions.

## Quick Start

### Option 1: Add to Aider Config (Recommended)

Create or update `.aider.conf.yml` in your project root:

```yaml
# Load UDS standards as read-only context
read:
  - AGENTS.md

# Enforce Conventional Commits
commit-prompt: "Generate a commit message using Conventional Commits format: <type>(<scope>): <subject>"

# Auto-run quality checks
auto-lint: true
auto-test: true
lint-cmd: "npm run lint"
test-cmd: "npm test"
```

Then copy the rules file:

```bash
cp integrations/aider/AGENTS.md AGENTS.md
```

### Option 2: CLI Flags

```bash
# Start Aider with UDS standards loaded
aider --read AGENTS.md
```

### Option 3: Use curl

```bash
curl -o AGENTS.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/aider/AGENTS.md
```

## Configuration Reference

### .aider.conf.yml

| Setting | Value | Purpose |
|---------|-------|---------|
| `read` | `["AGENTS.md"]` | Load UDS rules as read-only context |
| `commit-prompt` | Conventional Commits template | Enforce commit format |
| `auto-lint` | `true` | Run linter after each edit |
| `auto-test` | `true` | Run tests after each edit |
| `lint-cmd` | Project lint command | Linter command to run |
| `test-cmd` | Project test command | Test command to run |

### Key Aider Commands

| Aider Command | UDS Equivalent | Description |
|---------------|---------------|-------------|
| `/read AGENTS.md` | - | Load standards mid-session |
| `/lint` | Quality gate | Run linter |
| `/test` | Quality gate | Run tests |
| `/commit` | Commit standards | Create a commit |
| `/diff` | Code review | Review pending changes |
| `/undo` | - | Revert last change |

## How UDS Standards Apply

1. **Anti-Hallucination**: Aider reads actual files; AGENTS.md reinforces evidence-based analysis
2. **Commit Standards**: The `commit-prompt` config enforces Conventional Commits format
3. **Quality Gates**: `auto-lint` and `auto-test` enforce check-in standards automatically
4. **Code Review**: Use `/diff` to review changes against UDS code review checklist

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
| 1.0.0 | 2026-03-24 | Initial Aider integration |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
