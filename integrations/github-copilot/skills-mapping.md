# Skills Migration Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/integrations/github-copilot/skills-mapping.md) | [简体中文](../../locales/zh-CN/integrations/github-copilot/skills-mapping.md)

**Version**: 1.2.0
**Last Updated**: 2026-02-05

This document maps Claude Code skills to their GitHub Copilot equivalents and workarounds.

---

## Overview

Claude Code provides 25 skills with 17 slash commands. GitHub Copilot doesn't support slash commands, but most functionality can be achieved through Chat prompts and the `copilot-instructions.md` file.

---

## Skills Mapping Table

| Claude Code Skill | Copilot Implementation | Status |
|-------------------|------------------------|--------|
| **ai-collaboration-standards** | Section 1 in copilot-instructions.md | ✅ Full |
| **commit-standards** | Section 2 in copilot-instructions.md | ✅ Full |
| **code-review-assistant** | Section 3 in copilot-instructions.md | ✅ Full |
| **tdd-assistant** | Section 4 in copilot-instructions.md | ✅ Full |
| **test-coverage-assistant** | Section 5 in copilot-instructions.md | ✅ Full |
| **checkin-assistant** | Section 6 in copilot-instructions.md | ✅ Full |
| **requirement-assistant** | Section 7 in copilot-instructions.md | ✅ Full |
| **spec-driven-dev** | Section 8 in copilot-instructions.md | ✅ Full |
| **testing-guide** | Via copilot-instructions.md | ⚠️ Partial |
| **release-standards** | Chat prompt only | ⚠️ Partial |
| **changelog-guide** | Chat prompt only | ⚠️ Partial |
| **git-workflow-guide** | Chat prompt only | ⚠️ Partial |
| **documentation-guide** | Chat prompt only | ⚠️ Partial |
| **methodology-system** | Not available | ❌ None |
| **refactoring-assistant** | COPILOT-CHAT-REFERENCE.md §9 | ✅ Full |
| **error-code-guide** | Chat prompt only | ⚠️ Partial |
| **project-structure-guide** | Chat prompt only | ⚠️ Partial |
| **logging-guide** | Chat prompt only | ⚠️ Partial |
| **bdd-assistant** | Chat prompt only | ⚠️ Partial |
| **atdd-assistant** | Chat prompt only | ⚠️ Partial |
| **docs-generator** | Chat prompt only | ⚠️ Partial |
| **forward-derivation** | Chat prompt only | ⚠️ Partial |
| **reverse-engineer** | Chat prompt only | ⚠️ Partial |
| **ai-friendly-architecture** | Chat prompt only | ⚠️ Partial |
| **ai-instruction-standards** | Chat prompt only | ⚠️ Partial |

### Status Legend

| Status | Meaning |
|--------|---------|
| ✅ Full | Fully implemented in copilot-instructions.md |
| ⚠️ Partial | Available via Chat prompts, not in instructions file |
| ❌ None | Cannot be replicated in Copilot |

---

## Slash Command Equivalents

| Claude Code | Copilot Chat Equivalent |
|-------------|------------------------|
| `/commit` | "Generate commit message following Conventional Commits format" |
| `/review` | "Review this code following the code review checklist" |
| `/tdd` | "Help me implement using TDD (Red-Green-Refactor)" |
| `/coverage` | "Analyze test coverage using the 7 dimensions" |
| `/requirement` | "Write user story following INVEST criteria" |
| `/check` | "Verify pre-commit quality gates" |
| `/release` | "Prepare release following semantic versioning" |
| `/changelog` | "Generate CHANGELOG entry in Keep a Changelog format" |
| `/docs` | "Write documentation for this function/module" |
| `/spec` | "Create spec document for this feature" |
| `/refactor` | "Help me decide whether to refactor or rewrite..." |
| `/refactor tactical` | "Suggest tactical refactoring improvements..." |
| `/refactor legacy` | "Help me safely refactor this legacy code..." |
| `/methodology` | ❌ Not available |
| `/bdd` | "Help me write BDD scenarios in Gherkin format" |
| `/atdd` | "Help me implement ATDD workflow with acceptance tests" |
| `/docgen` | "Generate documentation for this module" |
| `/derive` | "Derive implementation from this specification" |
| `/reverse` | "Reverse engineer documentation from this code" |
| `/config` | "Suggest project structure for this type of application" |
| `/update` | ❌ Not available (manual file update needed) |
| `/init` | ❌ Not available (use UDS CLI instead) |

---

## Feature Limitations

### What Cannot Be Replicated

1. **Automatic Skill Triggering**
   - Claude Code: Skills trigger automatically based on keywords
   - Copilot: Must manually use Chat prompts

2. **Methodology System**
   - Claude Code: Tracks development phase (TDD/BDD/SDD/ATDD)
   - Copilot: No state tracking between sessions

3. **Slash Commands**
   - Claude Code: `/commit`, `/review`, etc.
   - Copilot: Must type full prompts in Chat

4. **MCP Tool Integration**
   - Claude Code: Can connect to external tools via MCP
   - Copilot: No MCP support

5. **Global Configuration**
   - Claude Code: `~/.claude/CLAUDE.md` applies to all projects
   - Copilot: Only project-level `.github/copilot-instructions.md`

6. **Subdirectory Rules**
   - Claude Code: Can have different rules per subdirectory
   - Copilot: Single instruction file for entire project

---

## Recommended Alternatives

### For Methodology Tracking

Use project documentation instead:
```markdown
<!-- In your README.md or CONTRIBUTING.md -->
## Development Methodology
This project uses TDD. Current phase: Implementation

### TDD Checklist
- [x] Write failing test
- [ ] Implement minimum code
- [ ] Refactor
```

### For Global Standards

Create a template repository with pre-configured `.github/copilot-instructions.md`:
```bash
# Create from template
gh repo create my-project --template my-org/project-template
```

### For Automatic Triggers

Use VS Code snippets or keyboard shortcuts:
```json
// .vscode/snippets.code-snippets
{
  "Commit Message": {
    "prefix": "commit",
    "body": "Generate commit message following Conventional Commits format for these changes..."
  }
}
```

---

## Migration Checklist

When migrating from Claude Code to Copilot:

```
□ Copy copilot-instructions.md to .github/
□ Bookmark COPILOT-CHAT-REFERENCE.md for prompt templates
□ Create VS Code snippets for frequently used prompts
□ Update team documentation about Copilot limitations
□ Consider using UDS CLI for initial project setup
```

---

## Hybrid Approach

For teams using both Claude Code and Copilot:

| Task | Recommended Tool |
|------|------------------|
| Complex code generation | Claude Code |
| Quick inline suggestions | Copilot |
| Code review | Either |
| Commit messages | Either |
| Project setup | Claude Code + UDS CLI |
| IDE autocomplete | Copilot |

---

## Related Resources

- [copilot-instructions.md](./copilot-instructions.md) - Full standards
- [COPILOT-CHAT-REFERENCE.md](./COPILOT-CHAT-REFERENCE.md) - Chat prompts
- [Claude Code Skills](../../skills/) - Original skills

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | 2026-02-05 | Updated skills count (18→25), added 7 new skills and 5 new slash commands |
| 1.1.0 | 2026-01-21 | Updated refactoring-assistant to Full status, added /refactor command mappings |
| 1.0.0 | 2026-01-13 | Initial release |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
