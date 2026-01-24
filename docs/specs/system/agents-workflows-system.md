# Agents & Workflows System Specification / Subagent 與工作流程系統規格

**Feature ID**: CLI-AGENT-001
**Version**: 1.0.0
**Last Updated**: 2026-01-20
**Status**: Implemented (v4.1.0-alpha.1)

---

## Overview / 概述

The Agents & Workflows System provides a comprehensive orchestration framework for AI coding assistants. It enables specialized AI subagents with defined roles, expertise, and tool permissions, along with multi-step workflow definitions for complex development tasks.

Subagent 與工作流程系統為 AI 編程助手提供完整的編排框架。它支援具有定義角色、專業知識和工具權限的專業 AI 子代理，以及用於複雜開發任務的多步驟工作流程定義。

---

## Motivation / 動機

### Problem Statement / 問題陳述

1. AI assistants lack role specialization - they handle all tasks with the same generic approach
2. Complex development workflows require multiple coordinated steps that are hard to track
3. Different AI tools have varying capabilities (Task tool support vs inline context)
4. No standardized way to define reusable AI agent configurations

AI 助手缺乏角色專業化——它們以相同的通用方法處理所有任務。複雜的開發工作流程需要多個協調步驟，難以追蹤。不同的 AI 工具具有不同的能力（Task tool 支援 vs 內聯上下文）。沒有標準化的方式來定義可重用的 AI 代理配置。

### Solution / 解決方案

A hybrid system that:
- Defines specialized agents via AGENT.md format with YAML frontmatter
- Orchestrates multi-step workflows via YAML workflow definitions
- Adapts automatically to AI tool capabilities (task mode, inline mode, manual mode)
- Provides CLI commands for installation and management

混合系統能夠：
- 通過 AGENT.md 格式和 YAML frontmatter 定義專業代理
- 通過 YAML 工作流程定義編排多步驟工作流程
- 自動適應 AI 工具能力（task 模式、inline 模式、manual 模式）
- 提供 CLI 命令進行安裝和管理

---

## User Stories / 使用者故事

### US-1: Agent Installation
```
As a developer using Claude Code,
I want to install specialized agents like code-architect,
So that I can get expert architectural analysis with read-only tool restrictions.

作為使用 Claude Code 的開發者，
我想要安裝像 code-architect 這樣的專業代理，
以便獲得具有唯讀工具限制的專家架構分析。
```

### US-2: Workflow Execution
```
As a developer starting a new feature,
I want to run the feature-dev workflow,
So that I follow a structured process from requirements to documentation.

作為開始新功能的開發者，
我想要執行 feature-dev 工作流程，
以便遵循從需求到文件的結構化流程。
```

### US-3: Cross-Tool Compatibility
```
As a developer using Cursor (which lacks Task tool),
I want agents to work via inline context injection,
So that I can still benefit from specialized agent roles.

作為使用 Cursor（缺少 Task tool）的開發者，
我想要代理通過內聯上下文注入工作，
以便我仍能從專業代理角色中受益。
```

---

## Acceptance Criteria / 驗收條件

### AC-1: Agent Definition Format (AGENT.md)

**Given** an AGENT.md file with YAML frontmatter
**When** parsed by the system
**Then** the following fields are recognized:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Agent identifier |
| `version` | string | Yes | Semantic version |
| `description` | string | Yes | Purpose description |
| `role` | enum | Yes | `orchestrator`, `specialist`, or `reviewer` |
| `expertise` | array | Yes | Areas of expertise |
| `allowed-tools` | array | No | Permitted tools (whitelist) |
| `disallowed-tools` | array | No | Forbidden tools (blacklist) |
| `skills` | array | No | Skill dependencies |
| `model` | string | No | Preferred model (`sonnet`, `opus`, `haiku`) |
| `temperature` | number | No | Response randomness (0.0-1.0) |
| `triggers` | object | No | Keywords and commands for activation |

### AC-2: Built-in Agents

**Given** the UDS CLI is installed
**When** I run `uds agent list`
**Then** 5 built-in agents are available:

| Agent | Role | Read-Only | Primary Use Case |
|-------|------|-----------|------------------|
| `code-architect` | specialist | Yes | System design and architecture |
| `test-specialist` | specialist | No | TDD/BDD testing expertise |
| `reviewer` | reviewer | Yes | Code review and quality |
| `doc-writer` | specialist | No | Documentation generation |
| `spec-analyst` | specialist | Yes | Requirements analysis |

### AC-3: Agent Installation

**Given** I am in a project directory
**When** I run `uds agent install code-architect`
**Then**:
- Agent file is copied to `.claude/agents/code-architect.md`
- Manifest file `.manifest.json` is created
- Success message displays installation path

**When** I run `uds agent install code-architect --tool opencode`
**Then**:
- Agent file is copied to `.opencode/agents/code-architect.md`

**When** I run `uds agent install code-architect --global`
**Then**:
- Agent file is copied to `~/.claude/agents/code-architect.md`

### AC-4: Cross-Tool Execution Modes

**Given** an installed agent
**When** used with different AI tools
**Then** execution mode adapts:

| AI Tool | Execution Mode | Behavior |
|---------|---------------|----------|
| Claude Code | `task` | Launches independent subagent via Task tool |
| OpenCode | `task` | Launches independent subagent via Task tool |
| Roo Code | `task` | Launches independent subagent via Task tool |
| Cline | `inline` | Injects agent as context prefix |
| Copilot | `inline` | Injects agent as context prefix |
| Cursor | `inline` | Injects agent as context prefix |
| Antigravity | `manual` | Generates manual instructions |

### AC-5: Workflow Definition Format

**Given** a `.workflow.yaml` file
**When** parsed by the system
**Then** the following structure is recognized:

```yaml
name: workflow-name
version: 1.0.0
description: |
  Multi-line description
metadata:
  category: development|review|testing|documentation
  difficulty: beginner|intermediate|advanced
  estimated_steps: N
prerequisites:
  - Prerequisite 1
  - Prerequisite 2
steps:
  - id: step-id
    name: Step Name
    type: agent|manual|conditional
    agent: agent-name          # if type=agent
    phase: phase-name          # optional grouping
    description: |
      Step description
    inputs:
      - input1
      - input2
    outputs:
      - output1
      - output2
outputs:
  - name: output-name
    description: Output description
    format: markdown|checklist|status
completion_criteria:
  - Criterion 1
  - Criterion 2
```

### AC-6: Built-in Workflows

**Given** the UDS CLI is installed
**When** I run `uds workflow list`
**Then** 3 built-in workflows are available:

| Workflow | Steps | Category | Description |
|----------|-------|----------|-------------|
| `integrated-flow` | 8 | development | ATDD→SDD→BDD→TDD complete flow |
| `feature-dev` | 6 | development | Standard feature development |
| `code-review` | 4 | review | Comprehensive code review |

### AC-7: Workflow Installation

**Given** I am in a project directory
**When** I run `uds workflow install feature-dev`
**Then**:
- Workflow file is copied to `.claude/workflows/feature-dev.workflow.yaml`
- Manifest file `.manifest.json` is created
- Success message displays installation path and execution mode

### AC-8: Agent Info Display

**Given** an agent exists
**When** I run `uds agent info code-architect`
**Then** detailed information is displayed:
- Name, version, role
- Expertise areas
- Tool permissions (allowed/disallowed)
- Skill dependencies
- Trigger keywords and commands

### AC-9: Workflow Info Display

**Given** a workflow exists
**When** I run `uds workflow info feature-dev`
**Then** detailed information is displayed:
- Name, version, category, difficulty
- Prerequisites
- All steps with type, agent, and description
- Expected outputs
- Completion criteria

---

## Technical Design / 技術設計

### File Structure / 檔案結構

```
skills/claude-code/
├── agents/
│   ├── README.md              # Format specification
│   ├── code-architect.md      # Architecture specialist
│   ├── test-specialist.md     # Testing expert
│   ├── reviewer.md            # Code reviewer
│   ├── doc-writer.md          # Documentation writer
│   └── spec-analyst.md        # Specification analyst
└── workflows/
    ├── README.md              # Format specification
    ├── integrated-flow.workflow.yaml
    ├── feature-dev.workflow.yaml
    └── code-review.workflow.yaml

cli/src/
├── commands/
│   ├── agent.js               # uds agent command
│   └── workflow.js            # uds workflow command
├── utils/
│   ├── agents-installer.js    # Agent installation logic
│   ├── agent-adapter.js       # Cross-tool adaptation
│   └── workflows-installer.js # Workflow installation logic
└── config/
    └── ai-agent-paths.js      # Path configuration (extended)
```

### Cross-Tool Adaptation Logic / 跨工具適配邏輯

```javascript
function getExecutionMode(aiTool) {
  if (supportsTask(aiTool)) {
    return 'task';      // Full subagent execution
  }
  if (supportsAgents(aiTool)) {
    return 'inline';    // Context injection
  }
  return 'manual';      // Manual instructions
}
```

### Tool Permissions Pattern / 工具權限模式

```yaml
# Pattern: Bash(scope:pattern)
allowed-tools:
  - Read                    # Full access
  - Glob                    # Full access
  - Grep                    # Full access
  - Bash(git:*)             # Only git commands
  - Bash(npm:test)          # Only npm test
  - WebFetch                # Full access

disallowed-tools:
  - Write                   # Cannot write files
  - Edit                    # Cannot edit files
```

---

## CLI Commands / CLI 命令

### Agent Commands / 代理命令

```bash
# List available agents
uds agent list
uds agent list --installed    # Show installation status

# Install agents
uds agent install                        # Interactive mode
uds agent install code-architect         # Install specific agent
uds agent install all                    # Install all agents
uds agent install code-architect -t opencode  # Target specific tool
uds agent install code-architect -g      # Install to user level

# Show agent details
uds agent info code-architect
```

### Workflow Commands / 工作流程命令

```bash
# List available workflows
uds workflow list
uds workflow list --installed    # Show installation status

# Install workflows
uds workflow install                     # Interactive mode
uds workflow install feature-dev         # Install specific workflow
uds workflow install all                 # Install all workflows
uds workflow install feature-dev -t opencode  # Target specific tool
uds workflow install feature-dev -g      # Install to user level

# Show workflow details
uds workflow info feature-dev
```

---

## Dependencies / 相依性

| Package | Version | Purpose |
|---------|---------|---------|
| `js-yaml` | ^4.1.0 | YAML parsing for workflow files |
| `inquirer` | ^9.2.12 | Interactive CLI prompts |
| `chalk` | ^5.3.0 | Terminal output styling |

---

## Testing / 測試

### Unit Tests / 單元測試

| Test File | Coverage |
|-----------|----------|
| `agents-installer.test.js` | Agent CRUD operations |
| `agent-adapter.test.js` | Cross-tool adaptation |
| `workflows-installer.test.js` | Workflow CRUD operations |

**Total**: 91 new tests (602 total in CLI)

### Test Scenarios / 測試場景

1. **Agent Installation**
   - Install to project level
   - Install to user level
   - Install for different AI tools
   - Handle non-existent agents
   - Handle unsupported tools

2. **Workflow Installation**
   - Install to project level
   - Install to user level
   - Preserve YAML structure
   - Handle non-existent workflows

3. **Cross-Tool Adaptation**
   - Task mode for Claude Code/OpenCode
   - Inline mode for Cline/Copilot
   - Manual mode for Antigravity

---

## Future Enhancements / 未來增強

### Phase 2 (v4.2.0)

1. **Workflow Execution Engine**
   - Auto-execute workflows with Task tool
   - Track step completion status
   - Handle conditional branching

2. **Agent Composition**
   - Combine multiple agents into teams
   - Define inter-agent communication

3. **Custom Agent Creation**
   - `uds agent create` wizard
   - Template-based agent scaffolding

### Phase 3 (v4.3.0)

1. **Marketplace Integration**
   - Publish agents to Claude Code marketplace
   - Download community agents

2. **Workflow Visualization**
   - Generate Mermaid diagrams from workflows
   - Interactive step navigation

---

## References / 參考資料

- [AGENT.md Format Specification](../skills/claude-code/agents/README.md)
- [Workflow Format Specification](../skills/claude-code/workflows/README.md)
- [AI Agent Paths Configuration](../cli/src/config/ai-agent-paths.js)
- [CHANGELOG v4.1.0-alpha.1](../CHANGELOG.md)
