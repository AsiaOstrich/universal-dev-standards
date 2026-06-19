---
source: skills/workflows/README.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# UDS Workflows

> **语言**: [English](../../../../skills/workflows/README.md) | 简体中文

**Version**: 1.1.0
**Last Updated**: 2026-01-21
**Status**: Experimental

---

## 概览

UDS Workflows 通过 orchestrate 多个 agent 来完成复杂的开发任务。每个 workflow 定义一连串步骤，其中每个步骤可由 agent 执行，或需要人工介入。

## Workflow YAML 格式

### Schema

```yaml
name: workflow-name          # Unique identifier (kebab-case)
version: 1.0.0               # Semantic version
description: |               # Multi-line description
  Brief description of the workflow.

# Workflow metadata
metadata:
  author: universal-dev-standards
  category: development       # development | review | testing | documentation
  difficulty: intermediate    # beginner | intermediate | advanced
  estimated_steps: 6          # Approximate number of steps

# Prerequisites
prerequisites:
  - Project initialized with UDS
  - Git repository configured
  - AI tool with Task support (recommended)

# Steps definition
steps:
  - id: step-1
    name: Step Name
    description: What this step does
    type: agent               # agent | manual | conditional
    agent: agent-name         # Required if type=agent
    inputs:                   # Optional: what this step needs
      - user_requirements
    outputs:                  # Optional: what this step produces
      - analysis_report

  - id: step-2
    name: Manual Step
    type: manual
    description: Human intervention required
    instructions: |
      Detailed instructions for the manual step.
    checklist:
      - [ ] Item 1
      - [ ] Item 2

  - id: step-3
    name: Conditional Step
    type: conditional
    condition: analysis_report.has_issues
    then:
      agent: reviewer
      task: Review and fix issues
    else:
      skip: true

# Output artifacts
outputs:
  - name: final_report
    description: Generated documentation
    format: markdown
```

### RLM Context 配置 (v1.1.0)

Workflow 可纳入受 RLM 启发的 context 处理机制，以应对大型代码库：

```yaml
# === RLM CONTEXT CONFIGURATION ===
context-strategy:
  enable-rlm: true                    # Enable RLM-aware processing
  max-context-per-step: 100000        # Maximum tokens per step
  context-inheritance: selective      # full | selective | summary

steps:
  - id: parallel-analysis
    type: parallel-agents             # NEW: Execute agent on multiple inputs
    agent: code-architect
    foreach: ${modules}               # Dynamic iteration variable
    context-mode: focused             # minimal | focused | full
    merge-strategy: aggregate         # aggregate | sequential | summary
    outputs: [analysis_results]
```

#### Context 继承模式

| 模式 | 说明 | 使用场景 |
|------|-------------|----------|
| `full` | 将所有先前的 output 传递给下一个步骤 | 顺序分析 |
| `selective` | 仅传递指定的 output | 内存效率高的 pipeline |
| `summary` | 传递 output 的摘要版本 | 大规模处理 |

#### 步骤的 Context 模式

| 模式 | 说明 | Token 用量 |
|------|-------------|-------------|
| `minimal` | 仅必要的 context | 低 |
| `focused` | 与当前项目相关的 context | 中 |
| `full` | 完整可用的 context | 高 |

#### 并行结果的 Merge 策略

| 策略 | 说明 | Output 格式 |
|----------|-------------|---------------|
| `aggregate` | 将所有结果合并为数组 | 结果数组 |
| `sequential` | 维持处理顺序 | 有序列表 |
| `summary` | AI 生成的所有结果摘要 | 单一摘要 |

### 步骤类型

| 类型 | 说明 | 执行方式 |
|------|-------------|-----------|
| `agent` | 由 UDS agent 执行 | 自动 |
| `manual` | 需要人工介入 | 交互式 |
| `conditional` | 依条件分支 | 视条件而定 |
| `parallel-agents` | 对多个输入并行执行 agent | 并行 (v1.1.0) |

#### Parallel-Agents 步骤配置 (v1.1.0)

```yaml
- id: parallel-module-analysis
  name: Analyze Modules in Parallel
  type: parallel-agents
  agent: code-architect
  foreach: ${modules}           # Variable containing items to iterate
  context-mode: focused         # minimal | focused | full
  merge-strategy: aggregate     # How to combine results
  max-concurrent: 3             # Optional: limit concurrent executions
  timeout: 300                  # Optional: timeout per item (seconds)
  inputs:                       # Optional: additional inputs
    - project_context
  outputs:
    - module_analysis_results
```

## 内置 Workflows

| Workflow | 步骤数 | 说明 |
|----------|-------|-------------|
| [integrated-flow](../../../../skills/workflows/integrated-flow.workflow.yaml) | 8 | 完整的 ATDD → SDD → BDD → TDD 循环 |
| [feature-dev](../../../../skills/workflows/feature-dev.workflow.yaml) | 6 | 功能开发 workflow |
| [code-review](../../../../skills/workflows/code-review.workflow.yaml) | 4 | 全面性 code review workflow |
| [large-codebase-analysis](../../../../skills/workflows/large-codebase-analysis.workflow.yaml) | 4 | 针对 50+ 文件项目的 RLM 强化 workflow |

## 用法

### CLI 安装

```bash
# List available workflows
uds workflow list

# Install specific workflow
uds workflow install integrated-flow

# Install all workflows
uds workflow install --all
```

### 执行

Workflow 采逐步执行。对于支持 Task tool 的工具（Claude Code、OpenCode）：

```
User: Start the integrated-flow workflow for user authentication

AI: Starting Integrated Development Flow...

Step 1/8: Specification Workshop (spec-analyst)
[Agent executes analysis...]

Step 2/8: Spec Proposal (spec-analyst)
[Agent drafts proposal...]

Step 3/8: Spec Review (manual)
Please review the specification:
- [ ] Requirements are clear
- [ ] Acceptance criteria defined
- [ ] Risks identified

[User confirms...]

Step 4/8: Discovery (test-specialist)
[Agent identifies test scenarios...]

...continues...
```

### 不支持 Task 的工具

Workflow 会转换为引导式检查清单：

```markdown
## Integrated Development Flow

### Step 1: Specification Workshop
**Agent**: spec-analyst
**Task**: Analyze requirements and identify acceptance criteria

[Copy this to your AI assistant]

### Step 2: Spec Proposal
...
```

## 创建自定义 Workflow

### 1. 创建 Workflow 文件

```bash
mkdir -p .claude/workflows
touch .claude/workflows/my-workflow.workflow.yaml
```

### 2. 定义 Workflow

```yaml
name: my-custom-workflow
version: 1.0.0
description: Custom workflow for my project

steps:
  - id: analyze
    name: Analyze Requirements
    type: agent
    agent: spec-analyst
    outputs: [requirements_doc]

  - id: implement
    name: Implementation
    type: manual
    description: Implement based on analysis

  - id: review
    name: Code Review
    type: agent
    agent: reviewer
    inputs: [code_changes]
```

## Workflow vs Agent vs Skill

| 维度 | Workflow | Agent | Skill |
|--------|----------|-------|-------|
| **目的** | orchestrate 多步骤流程 | 执行自主任务 | 提供知识／context |
| **组成** | 包含多个 agent | 使用 skill 作为 context | 独立运作 |
| **状态** | 追踪跨步骤的进度 | 单一任务状态 | 无状态 |
| **用户参与** | 可包含人工步骤 | 最少 | 无 |

## 以 Wave 为基础的并行执行 (v1.2.0)

Workflow 中的步骤可分组为 **wave** 以进行并行执行。同一 wave 中的步骤彼此独立，可由不同的 sub-agent 并行执行。Wave 之间顺序执行——wave N 中的所有步骤都必须完成，wave N+1 才会开始。

### Wave 配置

```yaml
steps:
  # Wave 1: Independent analysis steps (run in parallel)
  - id: analyze-requirements
    name: Analyze Requirements
    type: agent
    agent: spec-analyst
    wave: 1
    outputs: [requirements_analysis]

  - id: analyze-architecture
    name: Analyze Architecture
    type: agent
    agent: code-architect
    wave: 1
    outputs: [architecture_analysis]

  # Wave 2: Depends on wave 1 outputs (barrier point)
  - id: design
    name: Design Solution
    type: agent
    agent: code-architect
    wave: 2
    inputs: [requirements_analysis, architecture_analysis]
    outputs: [design_doc]

  # Manual steps are automatic barrier points
  - id: review
    name: Review Design
    type: manual
    wave: 3
```

### Wave 规则

| 规则 | 说明 |
|------|-------------|
| **独立性** | 同一 wave 中的步骤不得彼此相依 |
| **Barrier** | wave N 中的所有步骤必须完成，wave N+1 才会开始 |
| **Manual barrier** | `manual` 类型步骤为自动 barrier 点 |
| **选填字段** | `wave` 字段为选填；若未指定，步骤将顺序执行 |
| **向后兼容** | 没有 wave 字段的 workflow 仍如以往运作 |

---

## 步骤验证 Pipeline (v1.2.0)

每个 workflow 步骤可包含两层验证，灵感来自 CrewAI 的验证 pipeline 与 DSPy 的 metric 函数。

### 两层验证

```yaml
steps:
  - id: generate-spec
    name: Generate Specification
    type: agent
    agent: spec-analyst
    outputs: [spec_document]
    validation:
      # Layer 1: Deterministic (always runs first)
      deterministic:
        - check: file_exists
          path: "docs/specs/{{spec_id}}.md"
        - check: contains_sections
          sections: [Summary, Motivation, "Acceptance Criteria"]
        - check: ac_format
          pattern: "Given .+, When .+, Then .+"

      # Layer 2: Semantic (only runs if Layer 1 passes)
      semantic:
        - check: consistency
          description: AC covers all requirements mentioned in Motivation
        - check: completeness
          description: No TODO or placeholder sections remain
```

### 验证规则

| Layer | 类型 | 执行时机 | 失败时 |
|-------|------|-------------|------------|
| **Layer 1** | Deterministic | 永远最先执行 | 立即停止，显示修正选项 |
| **Layer 2** | Semantic | Layer 1 通过后 | 警告，建议改善 |

**Fail-fast 原则**：若 deterministic 验证失败，semantic 检查将完全跳过。这可避免在根本上已损坏的 output 上浪费时间进行质量评估。

---

## Agent Communication Protocol (v1.2.0)

定义 agent 在 workflow 内如何交换数据。

### 三个通信层

| Layer | 机制 | 说明 |
|-------|-----------|-------------|
| **Artifact passing** | 以文件为基础 | 步骤产生文件作为 output；下游步骤通过文件路径读取 |
| **Reducer patterns** | append / replace / merge | 多个 output 如何合并 |
| **Context isolation** | 每步骤干净启动 | 每个 agent 步骤以干净 context 启动，仅接收指定的 input |

### Reducer 模式

```yaml
steps:
  - id: collect-reviews
    type: parallel-agents
    agent: reviewer
    foreach: ${modules}
    outputs: [review_results]
    reducer: append        # Collect all results into array

  - id: merge-configs
    type: agent
    agent: code-architect
    inputs: [review_results]
    reducer: merge         # Deep merge results into single object
```

| 模式 | 说明 | 使用场景 |
|---------|-------------|----------|
| `append` | 将所有结果收集为有序列表 | 并行 review、多模块分析 |
| `replace` | 后到的 output 覆写先前的 | Config 覆写、最新者胜 |
| `merge` | 将结果深度合并为单一对象 | 结合部分分析 |

### Context Isolation

每个 agent 步骤以**干净 context** 启动，仅包含：
1. 该步骤声明的 `inputs`（来自前一步骤的 output）
2. 该 agent 的 skill（来自 AGENT.md 的 `skills` 字段）
3. Workflow 共享的 `prerequisites`

这可防止 context 污染，并确保 agent 行为可重现。

---

## 最佳实践

### 该做的

- 将复杂任务拆解为离散步骤
- 为关键决策纳入人工检查点
- 为每个步骤定义清楚的 input／output
- 使用 conditional 步骤进行错误处理
- 清楚记录 prerequisites

### 不该做的

- 不要创建过长的 workflow（>10 步骤）
- 不要跳过 review／verification 步骤
- 不要假设所有工具都支持自动执行
- 不要把步骤切得太细

---

## 相关资源

- [Agents 文档](../agents/README.md)
- [Skills 文档](../README.md)
- [方法论系统](../dev-methodology/SKILL.md)

---

## 版本历史

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | 2026-03-17 | Added wave-based parallel execution, step validation pipeline, agent communication protocol |
| 1.1.0 | 2026-01-21 | Added RLM context configuration, parallel-agents step type, large-codebase-analysis workflow |
| 1.0.0 | 2026-01-20 | Initial release |

---

## License

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 释出。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
