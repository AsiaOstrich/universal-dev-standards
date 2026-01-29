# [SPEC-AGENT-CREATE-01] Custom Agent Creation / 自訂代理建立

**Priority**: P1
**Status**: Draft
**Last Updated**: 2026-01-28
**Feature ID**: SYS-AGENT-CREATE-001
**Dependencies**: [CLI-AGENT-001 Agents & Workflows System]

---

## Summary / 摘要

The Custom Agent Creation feature provides an interactive wizard (`uds agent create`) that guides users through creating specialized AI agents. It includes template selection, role configuration, tool permission setup, and validation.

自訂代理建立功能提供互動式精靈（`uds agent create`），引導使用者建立專業 AI 代理。包括範本選擇、角色配置、工具權限設定和驗證。

---

## Motivation / 動機

### Problem Statement / 問題陳述

1. **Manual AGENT.md Creation**: Users must manually write YAML frontmatter and markdown content
2. **Format Errors**: Easy to make syntax errors in YAML
3. **Missing Best Practices**: Users don't know optimal tool permission configurations
4. **No Validation**: No immediate feedback on agent configuration errors

### Solution / 解決方案

An interactive CLI wizard that:
- Provides templates for common agent types
- Validates configurations in real-time
- Generates properly formatted AGENT.md files
- Suggests optimal tool permissions based on role

---

## User Stories / 使用者故事

### US-1: Template-Based Creation

```
As a developer creating my first custom agent,
I want to start from a template (e.g., "read-only analyst"),
So that I don't have to understand all configuration options.

作為首次建立自訂代理的開發者，
我想要從範本開始（例如「唯讀分析員」），
讓我不需要理解所有配置選項。
```

### US-2: Interactive Configuration

```
As a developer customizing an agent,
I want an interactive wizard that asks questions,
So that I can configure step-by-step without reading documentation.

作為自訂代理的開發者，
我想要互動式精靈提問，
讓我可以逐步配置而不需閱讀文件。
```

### US-3: Validation Feedback

```
As a developer defining tool permissions,
I want immediate validation feedback,
So that I know if my configuration is valid before saving.

作為定義工具權限的開發者，
我想要即時驗證回饋，
讓我在儲存前知道配置是否有效。
```

---

## Acceptance Criteria / 驗收條件

### AC-1: Template Selection

**Given** I run `uds agent create`
**When** the wizard starts
**Then** I am presented with template options:

| Template | Role | Read-Only | Description |
|----------|------|-----------|-------------|
| `architect` | specialist | Yes | System design analysis |
| `developer` | specialist | No | Full development access |
| `reviewer` | reviewer | Yes | Code review focus |
| `documenter` | specialist | No | Documentation writing |
| `security` | specialist | Yes | Security analysis |
| `blank` | - | - | Empty template |

### AC-2: Interactive Wizard Flow

**Given** I select a template
**When** I proceed through the wizard
**Then** I am prompted for:

1. **Agent Name** (required, slug format)
2. **Description** (required, 1-2 sentences)
3. **Role** (select: orchestrator/specialist/reviewer)
4. **Expertise Areas** (multi-select or free text)
5. **Tool Permissions** (guided configuration)
6. **Model Preference** (optional: sonnet/opus/haiku)
7. **Trigger Keywords** (optional)

### AC-3: Tool Permission Configuration

**Given** I reach the tool permissions step
**When** I configure permissions
**Then**:
- Preset permission groups are offered (read-only, full-access, custom)
- Individual tool toggles are available
- Bash command patterns can be defined (e.g., `git:*`, `npm:test`)
- Conflicts are detected and warned

### AC-4: AGENT.md Generation

**Given** I complete the wizard
**When** the agent is created
**Then**:
- `AGENT.md` file is generated with valid YAML frontmatter
- File is saved to `.claude/agents/{name}.md` (or specified location)
- Success message shows file path and usage instructions

### AC-5: Validation

**Given** I provide configuration values
**When** I proceed to next step
**Then**:
- Name format is validated (lowercase, hyphens only)
- Required fields are enforced
- Tool permission syntax is validated
- Duplicate agent names are detected

### AC-6: Non-Interactive Mode

**Given** I run `uds agent create --name my-agent --role specialist --template reviewer`
**When** all required flags are provided
**Then** agent is created without prompts

---

## Technical Design / 技術設計

### CLI Interface / CLI 介面

```bash
# Interactive mode (recommended)
uds agent create

# Non-interactive mode
uds agent create \
  --name security-analyst \
  --template security \
  --role specialist \
  --description "Analyzes code for security vulnerabilities"

# With custom output location
uds agent create --output ./my-agents/

# From existing agent (clone)
uds agent create --from code-architect --name my-architect
```

### Template Structure / 範本結構

```yaml
# templates/agent-architect.yaml
name: ${name}
version: 1.0.0
description: ${description}
role: specialist
expertise:
  - system design
  - architecture patterns
  - scalability analysis
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash(git:log)
  - Bash(git:show)
disallowed-tools:
  - Write
  - Edit
  - NotebookEdit
model: sonnet
temperature: 0.3
triggers:
  keywords:
    - architecture
    - design
    - structure
```

### Wizard Flow / 精靈流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Agent Creation Wizard                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Step 1: Template Selection                                             │
│   ┌────────────────────────────────────────────────────────┐            │
│   │ ? Select a template:                                    │            │
│   │   ◉ architect (Read-only system analyst)               │            │
│   │   ○ developer (Full development access)                │            │
│   │   ○ reviewer (Code review specialist)                  │            │
│   │   ○ blank (Start from scratch)                         │            │
│   └────────────────────────────────────────────────────────┘            │
│        │                                                                │
│        ▼                                                                │
│   Step 2: Basic Information                                              │
│   ┌────────────────────────────────────────────────────────┐            │
│   │ ? Agent name: my-security-analyst                       │            │
│   │ ? Description: Analyzes code for security issues        │            │
│   └────────────────────────────────────────────────────────┘            │
│        │                                                                │
│        ▼                                                                │
│   Step 3: Tool Permissions                                               │
│   ┌────────────────────────────────────────────────────────┐            │
│   │ ? Permission preset:                                    │            │
│   │   ◉ read-only (Cannot modify files)                    │            │
│   │   ○ full-access (All tools allowed)                    │            │
│   │   ○ custom (Configure individually)                    │            │
│   └────────────────────────────────────────────────────────┘            │
│        │                                                                │
│        ▼                                                                │
│   Step 4: Confirmation & Save                                            │
│   ┌────────────────────────────────────────────────────────┐            │
│   │ ✓ Agent created: .claude/agents/my-security-analyst.md │            │
│   │                                                         │            │
│   │ Usage:                                                  │            │
│   │   • Launch via Task tool with agent name                │            │
│   │   • Or add to workflow step                             │            │
│   └────────────────────────────────────────────────────────┘            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### File Structure / 檔案結構

```
cli/src/
├── commands/
│   └── agent.js              # Extended with 'create' subcommand
├── utils/
│   └── agent-creator.js      # Creation wizard logic
└── templates/
    └── agents/
        ├── architect.yaml
        ├── developer.yaml
        ├── reviewer.yaml
        ├── documenter.yaml
        ├── security.yaml
        └── blank.yaml
```

---

## Risks / 風險

| Risk | Impact | Mitigation |
|------|--------|------------|
| Over-permissive agents | Medium | Warn on full-access, suggest read-only |
| Invalid YAML generation | Low | Template-based generation, validation |
| Naming conflicts | Low | Check existing agents before save |

---

## Out of Scope / 範圍外

- Agent marketplace publishing (separate spec)
- Agent version control (Git handles this)
- Agent testing framework
- Multi-agent composition

---

## Sync Checklist

### Starting from System Spec
- [ ] Extend `agent.js` command with `create` subcommand
- [ ] Create `agent-creator.js` utility module
- [ ] Add agent templates
- [ ] Update translations (zh-TW, zh-CN)
- [ ] Add unit tests for creator

---

## References / 參考資料

- [Agents & Workflows System Spec](./agents-workflows-system.md)
- [AGENT.md Format](../../skills/agents/README.md)

---

## Version History / 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
