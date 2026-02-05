# Skills Porting Guide

> **Language**: English | [繁體中文](../../locales/zh-TW/integrations/opencode/skills-mapping.md) | [简体中文](../../locales/zh-CN/integrations/opencode/skills-mapping.md)

**Version**: 1.5.0
**Last Updated**: 2026-02-05

This document maps Claude Code skills to their OpenCode equivalents and implementation methods.

---

## Overview

Claude Code provides 25 skills with 17 slash commands. OpenCode supports skills natively and is **fully compatible** with Claude Code skill format.

### Key Advantage: Native Compatibility

OpenCode searches for skills in this order:
1. `.opencode/skill/<name>/SKILL.md` (project-local)
2. `~/.config/opencode/skill/<name>/SKILL.md` (global)
3. **`.claude/skills/<name>/SKILL.md`** (Claude-compatible ✅)

This means all UDS Claude Code skills work in OpenCode without modification.

---

## Skills Mapping Table

| Claude Code Skill | OpenCode Implementation | Status |
|-------------------|-------------------------|--------|
| **ai-collaboration-standards** | AGENTS.md Section 2 | ✅ Full |
| **commit-standards** | AGENTS.md Section 3 + Skill | ✅ Full |
| **code-review-assistant** | AGENTS.md Section 4 + Skill | ✅ Full |
| **tdd-assistant** | Skill (auto-loaded) | ✅ Full |
| **test-coverage-assistant** | Skill (auto-loaded) | ✅ Full |
| **checkin-assistant** | AGENTS.md Section 5 + Skill | ✅ Full |
| **requirement-assistant** | Skill (auto-loaded) | ✅ Full |
| **spec-driven-dev** | AGENTS.md Section 1 + Skill | ✅ Full |
| **testing-guide** | Skill (auto-loaded) | ✅ Full |
| **release-standards** | Skill (auto-loaded) | ✅ Full |
| **changelog-guide** | Skill (auto-loaded) | ✅ Full |
| **git-workflow-guide** | Skill (auto-loaded) | ✅ Full |
| **documentation-guide** | Skill (auto-loaded) | ✅ Full |
| **methodology-system** | Skill (auto-loaded) | ✅ Full |
| **refactoring-assistant** | Skill (auto-loaded) | ✅ Full |
| **error-code-guide** | Skill (auto-loaded) | ✅ Full |
| **project-structure-guide** | Skill (auto-loaded) | ✅ Full |
| **logging-guide** | Skill (auto-loaded) | ✅ Full |
| **bdd-assistant** | Skill (auto-loaded) | ✅ Full |
| **atdd-assistant** | Skill (auto-loaded) | ✅ Full |
| **docs-generator** | Skill (auto-loaded) | ✅ Full |
| **forward-derivation** | Skill (auto-loaded) | ✅ Full |
| **reverse-engineer** | Skill (auto-loaded) | ✅ Full |
| **ai-friendly-architecture** | Skill (auto-loaded) | ✅ Full |
| **ai-instruction-standards** | Skill (auto-loaded) | ✅ Full |

### Status Legend

| Status | Meaning |
|--------|---------|
| ✅ Full | Skill works identically in OpenCode |
| ⚠️ Partial | Some features differ |
| ❌ None | Cannot be replicated |

---

## Slash Command Equivalents

OpenCode supports the same skill invocation syntax as Claude Code:

| Claude Code | OpenCode | Notes |
|-------------|----------|-------|
| `/commit` | `/commit` or `skill("commit-standards")` | Identical |
| `/review` | `/review` or `skill("code-review-assistant")` | Identical |
| `/tdd` | `/tdd` or `skill("tdd-assistant")` | Identical |
| `/coverage` | `/coverage` or `skill("test-coverage-assistant")` | Identical |
| `/requirement` | `/requirement` or `skill("requirement-assistant")` | Identical |
| `/check` | `/check` or `skill("checkin-assistant")` | Identical |
| `/release` | `/release` or `skill("release-standards")` | Identical |
| `/changelog` | `/changelog` or `skill("changelog-guide")` | Identical |
| `/docs` | `/docs` or `skill("documentation-guide")` | Identical |
| `/spec` | `/spec` or `skill("spec-driven-dev")` | Identical |
| `/methodology` | `/methodology` or `skill("methodology-system")` | Identical |
| `/bdd` | `/bdd` or `skill("bdd-assistant")` | Identical |
| `/atdd` | `/atdd` or `skill("atdd-assistant")` | Identical |
| `/docgen` | `/docgen` or `skill("docs-generator")` | Identical |
| `/derive` | `/derive` or `skill("forward-derivation")` | Identical |
| `/reverse` | `/reverse` or `skill("reverse-engineer")` | Identical |
| `/config` | `/config` or `skill("project-structure-guide")` | Identical |
| `/init` | `/init` (built-in) | OpenCode native |
| `/update` | Manual or via CLI | Use `uds update` |

---

## Installation Methods

### Method 1: Use UDS CLI (Recommended)

The easiest way to get skills for both Claude Code and OpenCode:

```bash
# Install UDS CLI globally
npm install -g universal-dev-standards

# Initialize project - select OpenCode as your AI tool
uds init

# Skills will be installed to .claude/skills/
# OpenCode auto-detects this path ✅
```

**New in v3.5.0**: OpenCode is now treated as a skills-compatible tool in the CLI.
When only OpenCode (or Claude Code) is selected, minimal installation with skills is automatically offered.

```bash
# Verify installation status and skills compatibility
uds check
```

### Method 2: Clone from GitHub

```bash
# Clone the repository
git clone https://github.com/AsiaOstrich/universal-dev-standards.git /tmp/uds

# Copy skills to OpenCode directory
cp -r /tmp/uds/skills/* ~/.config/opencode/skill/

# Or copy to project level
cp -r /tmp/uds/skills/* .opencode/skill/

# Clean up
rm -rf /tmp/uds
```

### Method 3: Via Claude Code Plugin (if already installed)

If you've installed UDS via Claude Code Plugin Marketplace:

```bash
# Check where skills are installed
uds skills

# Copy from Claude skills path to OpenCode
cp -r .claude/skills/* ~/.config/opencode/skill/

# Or copy specific skills
cp -r .claude/skills/commit-standards ~/.config/opencode/skill/
```

### Method 4: Direct Download

```bash
# Download specific skills directly
mkdir -p .opencode/skill/commit-standards
curl -o .opencode/skill/commit-standards/SKILL.md \
  https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/skills/commit-standards/SKILL.md
```

### Method 5: Use Claude Path (Zero Config)

If you already have Claude Code skills installed via `uds init`:

```bash
# OpenCode auto-detects .claude/skills/
# No action needed!
```

### Method 6: Community Marketplaces

OpenCode doesn't have an official marketplace like Claude Code, but several community-driven options exist:

**[n-skills](https://github.com/numman-ali/n-skills)** - Curated marketplace:
- Works with Claude Code, Cursor, Windsurf, Cline, OpenCode, and Codex
- Only high-quality, value-add skills are accepted

**[claude-plugins.dev](https://claude-plugins.dev/skills)** - Auto-indexed discovery:
- Automatically indexes all public Agent Skills on GitHub
- Supports Claude, Cursor, OpenCode, Codex, and other AI coding assistants

**[agentskills.io](https://agentskills.io)** - Open standard:
- The Agent Skills specification by Anthropic (December 2024)
- Adopted by OpenCode, Codex, Cursor, and many others

---

## Feature Comparison

### Identical Features

| Feature | Claude Code | OpenCode |
|---------|-------------|----------|
| Skill format | YAML frontmatter + Markdown | ✅ Same |
| Skill search paths | `.claude/skills/` | ✅ + `.opencode/skill/` |
| Slash commands | `/commit`, `/review`, etc. | ✅ Same |
| Auto-triggering | Keyword-based | ✅ Same |
| Skill permissions | Per-skill | ✅ Same |

### OpenCode Advantages

| Feature | Claude Code | OpenCode |
|---------|-------------|----------|
| Built-in agents | ❌ None | ✅ `build`, `plan`, `general`, `explore` |
| Agent definition | ❌ Not native | ✅ Markdown files |
| Glob patterns | ❌ Not supported | ✅ `instructions: ["**/*.md"]` |
| Subagent invocation | ❌ Not native | ✅ `@agent-name` |
| Multiple LLM providers | ❌ Claude only | ✅ Claude, OpenAI, Google, local |

### Claude Code Advantages

| Feature | Claude Code | OpenCode |
|---------|-------------|----------|
| MCP integration | ✅ Full | ⚠️ Limited |
| Subdirectory rules | ✅ Per-folder CLAUDE.md | ❌ Single AGENTS.md |
| Tool ecosystem | ✅ Anthropic tools | ⚠️ Community tools |

---

## Cross-Tool Compatibility

### Skills Path Reference

The [Agent Skills specification](https://agentskills.io/specification) does NOT prescribe a standard installation path. Each tool implements its own discovery mechanism.

#### Path Comparison Table

| AI Agent | Project Path | User Path | Claude Compatible |
|----------|-------------|-----------|-------------------|
| Claude Code | `.claude/skills/` | `~/.claude/skills/` | ✅ Native |
| OpenCode | `.opencode/skill/`<br>`.claude/skills/` | `~/.config/opencode/skill/` | ✅ Supported |
| Cursor | `.cursor/skills/`<br>`.claude/skills/` | `~/.cursor/skills/`<br>`~/.claude/skills/` | ✅ Supported |
| OpenAI Codex | `.codex/skills/` | `~/.codex/skills/` | ❌ Independent |
| GitHub Copilot | `.github/skills/`<br>`.claude/skills/` (legacy) | `~/.copilot/skills/`<br>`~/.claude/skills/` (legacy) | ✅ Supported |
| Windsurf | `.windsurf/skills/` | `~/.codeium/windsurf/skills/` | ❌ Independent |
| Cline | `.cline/skills/` | `~/.cline/skills/` | ❌ Independent |

#### Why `.claude/skills/`?

UDS installs skills to `.claude/skills/` because:

1. **Widest Compatibility**: Most tools support this path (Cursor, Copilot, OpenCode)
2. **De Facto Standard**: Claude Code originated the Agent Skills concept
3. **Single Installation**: One install works across multiple tools

#### Future Considerations

- GitHub Copilot recommends `.github/skills/` (marking `.claude/` as legacy)
- A neutral path like `.agent-skills/` may emerge as the standard
- UDS will adapt when community consensus is reached

#### Cross-Tool Installation

For tools that don't read `.claude/skills/`:

| Tool | Solution |
|------|----------|
| OpenAI Codex | `cp -r .claude/skills/* ~/.codex/skills/` |
| Windsurf | `cp -r .claude/skills/* .windsurf/skills/` |
| Cline | `cp -r .claude/skills/* .cline/skills/` |

---

## Custom Agents for Skills

OpenCode allows creating specialized agents for specific skills:

### Code Review Agent

```markdown
<!-- .opencode/agent/reviewer.md -->
---
description: Reviews code following UDS code review checklist
mode: subagent
temperature: 0.3
tools:
  write: false
  edit: false
  bash: false
---

# Code Review Agent

You are a code review specialist. Follow these guidelines:

1. Use the code-review-assistant skill
2. Apply the review checklist from core/code-review-checklist.md
3. Use comment prefixes: ❗ BLOCKING, ⚠️ IMPORTANT, 💡 SUGGESTION, ❓ QUESTION
4. Check all 10 review categories

Invoke with: @reviewer
```

### TDD Coach Agent

```markdown
<!-- .opencode/agent/tdd-coach.md -->
---
description: Guides through TDD workflow (Red-Green-Refactor)
mode: subagent
temperature: 0.5
---

# TDD Coach Agent

You are a TDD coach. Help developers with:

1. Red Phase: Writing failing tests
2. Green Phase: Minimum code to pass
3. Refactor Phase: Clean up while green

Always use the tdd-assistant skill.

Invoke with: @tdd-coach
```

---

## Skills Configuration

### Permission Control

```json
// opencode.json
{
  "permission": {
    "skill": {
      "*": "allow",
      "methodology-system": "ask",
      "release-standards": "ask"
    }
  }
}
```

### Disable Specific Skills

```json
// opencode.json
{
  "permission": {
    "skill": {
      "methodology-system": "deny"
    }
  }
}
```

---

## Verification Checklist

After setting up skills:

```
□ Run `opencode` and type `/commit` to test skill loading
□ Verify skill auto-completion works (type `/` to see available)
□ Test custom agents with `@agent-name`
□ Check AGENTS.md is loaded (view with `/show rules`)
□ Confirm glob patterns work (if using in opencode.json)
```

---

## Troubleshooting

### Skills Not Loading

1. **Check file name**: Must be `SKILL.md` (all caps)
2. **Verify frontmatter**: `name` and `description` required
3. **Check path**: Should be `.opencode/skill/<name>/SKILL.md`
4. **Review permissions**: Check `opencode.json` skill permissions

### Slash Commands Not Working

1. **Verify skill exists**: Check skill directory
2. **Check name match**: Slash command uses skill `name` field
3. **Try full syntax**: `skill("skill-name")` instead of `/skill-name`

---

## Related Resources

- [AGENTS.md](./AGENTS.md) - Core rules file
- [opencode.json](./opencode.json) - Configuration example
- [Claude Code Skills](../../skills/) - Original skills
- [GitHub Copilot Skills Mapping](../github-copilot/skills-mapping.md) - Copilot equivalent

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.5.0 | 2026-02-05 | Updated skills count (18→25), added 7 new skills and 5 new slash commands |
| 1.4.0 | 2026-01-13 | Added Cross-Tool Compatibility section with path comparison table |
| 1.3.0 | 2026-01-13 | Added community marketplaces section (n-skills, claude-plugins.dev, agentskills.io) |
| 1.2.0 | 2026-01-13 | Updated CLI method; OpenCode now skills-compatible in UDS CLI |
| 1.1.0 | 2026-01-13 | Fixed installation methods; removed incorrect npm paths |
| 1.0.0 | 2026-01-13 | Initial release |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
