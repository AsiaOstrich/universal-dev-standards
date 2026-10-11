---
source: ../../../../skills/agents/README.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-10-11
source_hash: 3783bc43d9d6
status: current
---

# UDS 代理

> **语言**: [English](../../../../skills/agents/README.md) | 简体中文

**版本**: 1.1.0
**最后更新**: 2026-01-21
**状态**: 稳定

---

## 概述

UDS 代理是专门的 AI 子代理，可以协调处理复杂的开发工作流程。与技能（提供上下文/知识）不同，代理是可以执行多步骤任务的自主实体。

## AGENT.md 格式规格

### Frontmatter 架构

```yaml
---
# === REQUIRED FIELDS ===
name: agent-name              # Unique identifier (kebab-case)
version: 1.0.0                # Semantic version
description: |                # Multi-line description for AI matching
  Brief description of the agent's purpose.
  Keywords: keyword1, keyword2, keyword3.

# === ROLE CONFIGURATION ===
role: specialist              # orchestrator | specialist | reviewer
expertise:                    # Domain expertise areas
  - system-design
  - api-design
  - database-modeling

# === TOOL PERMISSIONS (Claude Code Task tool) ===
# Specify which tools this agent can use
allowed-tools:
  - Read                      # File reading
  - Glob                      # Pattern matching
  - Grep                      # Content search
  - Bash(git:*)               # Git commands only
  - WebFetch                  # Web fetching
  - WebSearch                 # Web search
disallowed-tools:             # Explicitly blocked tools
  - Write                     # No file writing
  - Edit                      # No file editing

# === SKILL DEPENDENCIES ===
# Skills that provide context/knowledge to this agent
skills:
  - spec-driven-dev           # Skill name reference
  - testing-guide

# === MODEL PREFERENCES (Claude Code only) ===
model: claude-sonnet-4-20250514  # Preferred model
temperature: 0.3              # Response creativity (0.0-1.0)

# === CONTEXT STRATEGY (RLM-inspired) ===
# Configuration for handling large codebases and long contexts
context-strategy:
  mode: adaptive              # full | chunked | adaptive
  max-chunk-size: 50000       # Maximum tokens per chunk
  overlap: 500                # Token overlap between chunks
  analysis-pattern: hierarchical  # hierarchical | parallel | sequential

# === TRIGGER CONDITIONS ===
triggers:
  keywords:                   # Auto-activate on these keywords
    - architecture
    - system design
    - 架構設計
  commands:                   # Slash commands that invoke this agent
    - /architect
---
```

### 角色类型

| 角色 | 描述 | 使用案例 |
|------|-------------|----------|
| `orchestrator` | 协调多个代理 | 复杂工作流程、功能开发 |
| `specialist` | 特定领域的深度专业 | 架构、测试、文档 |
| `reviewer` | 评估并提供反馈 | 代码审查、规格审查、PR 审查 |

### 工具权限模式

```yaml
# Full tool access (default if not specified)
allowed-tools: [*]

# Read-only agent
allowed-tools: [Read, Glob, Grep]
disallowed-tools: [Write, Edit, Bash]

# Git-only bash access
allowed-tools:
  - Bash(git:*)     # Only git commands
  - Bash(npm:test)  # Only npm test

# Specific file patterns
allowed-tools:
  - Write(*.md)     # Only markdown files
  - Edit(src/**)    # Only src directory
```

### 上下文策略配置（RLM 启发）

`context-strategy` 区段使用 RLM（递归语言模型）原则实现对大型代码库和长上下文的智能处理。

#### 模式选项

| 模式 | 描述 | 使用案例 |
|------|-------------|----------|
| `full` | 一次加载完整上下文 | 小项目、文档任务 |
| `chunked` | 将上下文分成固定大小的区块 | 顺序代码审查、大型文件分析 |
| `adaptive` | 根据内容结构动态调整 | 复杂分析、架构探索 |

#### 分析模式

| 模式 | 描述 | 最适合 |
|---------|-------------|----------|
| `hierarchical` | 先分析高层结构，然后深入细节 | 架构分析、系统设计 |
| `parallel` | 同时处理多个区段 | 独立模块分析、规格审查 |
| `sequential` | 依序处理区段，保留上下文 | 代码审查、逐步分析 |

#### 配置示例

```yaml
# For architecture analysis (need overview first)
context-strategy:
  mode: adaptive
  max-chunk-size: 50000
  overlap: 500
  analysis-pattern: hierarchical

# For code review (sequential processing)
context-strategy:
  mode: chunked
  max-chunk-size: 30000
  overlap: 200
  analysis-pattern: sequential

# For documentation (need full context)
context-strategy:
  mode: full
  analysis-pattern: hierarchical
```

### 代理签名（v1.2.0，DSPy 启发）

可选的 `signatures` 字段为代理操作定义结构化的输入／输出契约，从而能够验证代理输出，并让工作流程中的组合更清晰。

```yaml
---
name: spec-analyst
# ... other fields ...

signatures:
  forward-analysis:
    description: Transform requirements into a specification document
    inputs:
      - name: feature_request
        type: text
        required: true
        description: User's feature request or requirement description
      - name: codebase_context
        type: file_list
        required: false
        description: Relevant source files for context
    outputs:
      - name: spec_document
        type: markdown
        validation: "Contains Summary, Motivation, Acceptance Criteria sections"
      - name: read_first_list
        type: yaml_list
        validation: "Each entry has path and reason fields"

  reverse-analysis:
    description: Extract specification from existing code
    inputs:
      - name: source_files
        type: file_list
        required: true
    outputs:
      - name: reverse_spec
        type: markdown
        validation: "Contains Discovered Behaviors, Business Rules, Gaps sections"
      - name: certainty_report
        type: table
        validation: "Each item tagged [Confirmed], [Inferred], [Assumption], or [Unknown]"
---
```

#### 签名字段

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| `inputs[].name` | string | 输入参数名称 |
| `inputs[].type` | string | `text`、`markdown`、`file_list`、`yaml_list`、`json` |
| `inputs[].required` | boolean | 此输入是否为必填 |
| `outputs[].name` | string | 输出产物名称 |
| `outputs[].type` | string | 输出格式类型 |
| `outputs[].validation` | string | 人类可读的验证标准 |

#### 好处

- **可组合性**：工作流程可验证某一步骤的输出是否符合下一步骤预期的输入
- **文档化**：签名可作为代理能力的 API 契约
- **验证**：输出验证标准使确定性的质量检查成为可能

---

### 跨工具执行模式

| AI 工具 | 执行模式 | 运作方式 |
|---------|---------------|--------------|
| Claude Code | `task` | 使用 Task 工具生成独立的子代理 |
| OpenCode | `task` | 类似的 Task 工具支持 |
| Cursor / Windsurf | `inline` | 将 AGENT.md 作为上下文前缀注入 |
| Copilot / Gemini | `inline` | 转换为提示词片段 |

## 内建代理

| 代理 | 角色 | 描述 |
|-------|------|-------------|
| [code-architect](./code-architect.md) | specialist | 软件架构和系统设计 |
| [test-specialist](./test-specialist.md) | specialist | 测试策略和测试实现 |
| [reviewer](./reviewer.md) | reviewer | 代码审查和质量评估 |
| [doc-writer](./doc-writer.md) | specialist | 文档和技术写作 |
| [spec-analyst](./spec-analyst.md) | specialist | 规格分析和需求萃取 |

## 使用方式

### CLI 安装

```bash
# List available agents
uds agent list

# Install specific agent to project
uds agent install code-architect

# Install all agents
uds agent install all

# Install to user directory (global)
uds agent install code-architect --global
```

### 在 Claude Code 中直接调用

```
/architect [task description]
```

或通过自然语言触发：

```
Please help me design the architecture for a new authentication system.
```

## 创建自定义代理

### 1. 创建 AGENT.md 文件

```bash
# In your project
mkdir -p .claude/agents
touch .claude/agents/my-agent.md
```

### 2. 定义 Frontmatter

```yaml
---
name: my-custom-agent
version: 1.0.0
description: |
  Custom agent for specific project needs.
  Keywords: custom, specific, project.

role: specialist
expertise: [domain-specific]

allowed-tools: [Read, Glob, Grep, Edit]
skills: [relevant-skill]

triggers:
  commands: [/myagent]
---
```

### 3. 撰写代理指令

```markdown
# My Custom Agent

## Purpose

Describe what this agent does.

## Workflow

1. Step one
2. Step two
3. Step three

## Guidelines

- Guideline 1
- Guideline 2
```

## 代理 vs 技能比较

| 方面 | 技能 | 代理 |
|--------|-------|-------|
| **目的** | 提供知识/上下文 | 执行自主任务 |
| **执行** | 作为上下文加载 | 作为子代理生成（或内嵌） |
| **状态** | 无状态 | 可维护任务状态 |
| **工具访问** | 无（仅上下文） | 可配置权限 |
| **触发** | 手动加载 | 关键字、命令、工作流程 |
| **组合** | 由代理引用 | 可使用技能作为上下文 |

## 与工作流程整合

代理可通过工作流程定义进行协调：

```yaml
# workflows/feature-dev.workflow.yaml
name: feature-development
steps:
  - agent: spec-analyst
    task: Analyze requirements
  - agent: code-architect
    task: Design solution
  - agent: test-specialist
    task: Define test strategy
  - manual: Implementation
  - agent: reviewer
    task: Code review
```

请参阅 [workflows/README.md](../workflows/README.md) 获取工作流程文档。

---

## 相关资源

- [技能文档](../README.md)
- [工作流程文档](../workflows/README.md)
- [AI 代理路径配置](../../../../cli/src/config/ai-agent-paths.js)

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.2.0 | 2026-03-17 | 添加代理签名（DSPy 启发的结构化输入／输出契约） |
| 1.1.0 | 2026-01-21 | 添加 RLM 启发的 context-strategy 配置 |
| 1.0.0 | 2026-01-20 | 初始发布 |

---

## 授权

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
