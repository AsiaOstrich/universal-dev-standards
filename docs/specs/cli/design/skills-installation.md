# Skills Installation Specification / Skills 安裝機制規格

**Feature ID**: CLI-SKILLS-001
**Version**: 1.0.0
**Last Updated**: 2026-01-19
**Status**: Archived

## Overview / 概述

UDS Skills provide real-time AI assistance for development tasks. This specification documents the installation mechanisms, directory structures, and priority rules.

UDS Skills 提供開發任務的即時 AI 輔助。本規格記錄安裝機制、目錄結構和優先順序規則。

## Installation Locations / 安裝位置

### Location Hierarchy / 位置層級

| Priority | Location | Path | Management |
|----------|----------|------|------------|
| 1 (Highest) | Plugin Marketplace | `~/.claude/plugins/` | Claude Code auto-managed |
| 2 | User Level | `~/.claude/skills/` | Manual / CLI managed |
| 3 (Lowest) | Project Level | `.claude/skills/` | Manual / CLI managed |

### Installation Methods / 安裝方法

#### Method 1: Plugin Marketplace (Recommended)

Claude Code Plugin Marketplace provides automatic installation and updates.

```
Plugin ID: universal-development-standards
Registry: https://github.com/anthropics/claude-code-plugins
```

#### Method 2: CLI Installation

```bash
# Initialize with Skills
uds init --skills-location user

# Or configure later
uds configure --type skills
```

#### Method 3: Manual Installation

**macOS / Linux:**
```bash
# Copy skills to user-level directory
cp -r skills/* ~/.claude/skills/

# Or copy to project-level directory
cp -r skills/* .claude/skills/
```

**Windows PowerShell:**
```powershell
# Copy skills to user-level directory
Copy-Item -Recurse skills\claude-code\* $env:USERPROFILE\.claude\skills\

# Or copy to project-level directory
Copy-Item -Recurse skills\claude-code\* .claude\skills\
```

## Skills Directory Structure / Skills 目錄結構

```
skills/
├── README.md                          # Skills overview
├── CONTRIBUTING.template.md           # Contribution template
│
├── commit-standards/
│   ├── SKILL.md                       # Primary skill definition
│   ├── conventional-commits.md        # Conventional commits guide
│   └── language-options.md            # Commit language options
│
├── code-review-assistant/
│   ├── SKILL.md
│   ├── review-checklist.md
│   └── comment-prefixes.md
│
├── ai-collaboration-standards/
│   ├── SKILL.md
│   ├── anti-hallucination.md
│   └── evidence-based.md
│
├── tdd-assistant/
│   ├── SKILL.md
│   ├── red-green-refactor.md
│   └── test-first.md
│
├── bdd-assistant/
│   ├── SKILL.md
│   ├── gherkin-syntax.md
│   └── feature-scenarios.md
│
├── atdd-assistant/
│   ├── SKILL.md
│   └── acceptance-criteria.md
│
├── methodology-system/
│   ├── SKILL.md
│   ├── tdd-mode.md
│   ├── bdd-mode.md
│   ├── sdd-mode.md
│   └── checkpoint-system.md
│
├── spec-driven-dev/
│   └── SKILL.md
│
├── reverse-engineer/
│   ├── SKILL.md
│   ├── reverse-spec.md
│   ├── reverse-tdd.md
│   └── reverse-bdd.md
│
├── release-standards/
│   ├── SKILL.md
│   ├── release-workflow.md
│   ├── semantic-versioning.md
│   └── changelog-format.md
│
├── requirement-assistant/
│   ├── SKILL.md
│   ├── invest-criteria.md
│   └── user-story-template.md
│
├── git-workflow-guide/
│   ├── SKILL.md
│   ├── github-flow.md
│   └── gitflow.md
│
├── testing-guide/
│   ├── SKILL.md
│   └── testing-pyramid.md
│
├── documentation-guide/
│   ├── SKILL.md
│   └── doc-templates.md
│
├── checkin-assistant/
│   └── SKILL.md
│
├── refactoring-assistant/
│   └── SKILL.md
│
├── changelog-guide/
│   └── SKILL.md
│
├── error-code-guide/
│   └── SKILL.md
│
├── logging-guide/
│   └── SKILL.md
│
├── test-coverage-assistant/
│   └── SKILL.md
│
├── project-structure-guide/
│   ├── SKILL.md
│   └── file-organization.md
│
└── commands/                          # Slash commands
    ├── commit.md
    ├── review.md
    ├── tdd.md
    ├── bdd.md
    ├── spec.md
    ├── release.md
    └── ... (19 commands total)
```

## Detection Logic / 偵測邏輯

The CLI detects installed Skills using the following process:

```
1. Check Plugin Marketplace
   └── Read ~/.claude/plugins/installed_plugins.json
   └── Look for "universal-development-standards"

2. Scan User-Level Directory
   └── Check ~/.claude/skills/
   └── Look for SKILL.md files in subdirectories

3. Scan Project-Level Directory
   └── Check ./.claude/skills/
   └── Look for SKILL.md files in subdirectories
```

### Implementation / 實作

```javascript
// cli/src/utils/skills-installer.js

function getInstalledSkillsInfoForAgent(agent, level, projectPath) {
  // Returns { installed: boolean, version: string, skillCount: number }
}

// cli/src/utils/github.js
function getMarketplaceSkillsInfo() {
  // Returns { installed: boolean, version: string }
}
```

## Coexistence Rules / 共存規則

Multiple installation sources can coexist:

| Scenario | Behavior |
|----------|----------|
| Marketplace + User-level | Both active, Marketplace takes precedence |
| Marketplace + Project-level | Both active, Marketplace takes precedence |
| User-level + Project-level | Both active, User-level takes precedence |
| All three | All active, precedence: Marketplace > User > Project |

## CLI Commands / CLI 指令

### Check Skills Status

```bash
uds skills
```

### Configure Skills

```bash
# Interactive mode
uds configure --type skills

# Non-interactive mode
uds configure --type skills --ai-tool claude-code --skills-location user
```

### Update Skills

```bash
uds update --skills
```

## Manifest Tracking / Manifest 追蹤

Skills installations are tracked in `.standards/manifest.json`:

```json
{
  "skills": {
    "installations": [
      {
        "agent": "claude-code",
        "level": "user"
      }
    ]
  },
  "declinedFeatures": {
    "skills": []
  }
}
```

## Supported AI Tools / 支援的 AI 工具

| Tool | Skills Support | Commands Support |
|------|---------------|------------------|
| Claude Code | Yes | No (uses Plugin) |
| OpenCode | Yes | Yes |
| Copilot | Yes | Yes |
| Gemini CLI | Yes | Yes |
| Roo Code | Yes | Yes |
| Cursor | Yes | No |
| Windsurf | Yes | No |
| Cline | Yes | No |

## Test Cases / 測試案例

### TC-001: Manual installation creates correct structure

```bash
# Action:
cp -r skills/* ~/.claude/skills/

# Verify:
ls ~/.claude/skills/commit-standards/SKILL.md
# Expected: File exists
```

### TC-002: CLI detects manually installed skills

```bash
# Setup: Manual installation complete
# Action:
uds skills
# Expected: Shows installed skills count
```

### TC-003: Marketplace coexists with file-based

```bash
# Setup: Plugin Marketplace installed
# Action:
uds configure --type skills --ai-tool claude-code --skills-location project

# Verify:
uds skills
# Expected: Shows both Marketplace and project-level installation
```

## Changelog / 變更記錄

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-19 | Initial specification documenting installation mechanisms |

## References / 參考資料

- [Skills Installation Utility](../../../../cli/src/utils/skills-installer.js)
- [AI Agent Paths Configuration](../../../../cli/src/config/ai-agent-paths.js)
- [Skills Directory](../../skills/)
