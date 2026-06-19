---
source: skills/workflows/README.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# UDS Workflows

> **語言**: [English](../../../../skills/workflows/README.md) | 繁體中文

**Version**: 1.1.0
**Last Updated**: 2026-01-21
**Status**: Experimental

---

## 概觀

UDS Workflows 透過 orchestrate 多個 agent 來完成複雜的開發任務。每個 workflow 定義一連串步驟，其中每個步驟可由 agent 執行，或需要人工介入。

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

### RLM Context 設定 (v1.1.0)

Workflow 可納入受 RLM 啟發的 context 處理機制，以因應大型程式庫：

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

#### Context 繼承模式

| 模式 | 說明 | 使用情境 |
|------|-------------|----------|
| `full` | 將所有先前的 output 傳遞給下一個步驟 | 循序分析 |
| `selective` | 僅傳遞指定的 output | 記憶體效率高的 pipeline |
| `summary` | 傳遞 output 的摘要版本 | 大規模處理 |

#### 步驟的 Context 模式

| 模式 | 說明 | Token 用量 |
|------|-------------|-------------|
| `minimal` | 僅必要的 context | 低 |
| `focused` | 與目前項目相關的 context | 中 |
| `full` | 完整可用的 context | 高 |

#### 平行結果的 Merge 策略

| 策略 | 說明 | Output 格式 |
|----------|-------------|---------------|
| `aggregate` | 將所有結果合併為陣列 | 結果陣列 |
| `sequential` | 維持處理順序 | 有序清單 |
| `summary` | AI 產生的所有結果摘要 | 單一摘要 |

### 步驟類型

| 類型 | 說明 | 執行方式 |
|------|-------------|-----------|
| `agent` | 由 UDS agent 執行 | 自動 |
| `manual` | 需要人工介入 | 互動式 |
| `conditional` | 依條件分支 | 視條件而定 |
| `parallel-agents` | 對多個輸入並行執行 agent | 平行 (v1.1.0) |

#### Parallel-Agents 步驟設定 (v1.1.0)

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

## 內建 Workflows

| Workflow | 步驟數 | 說明 |
|----------|-------|-------------|
| [integrated-flow](../../../../skills/workflows/integrated-flow.workflow.yaml) | 8 | 完整的 ATDD → SDD → BDD → TDD 循環 |
| [feature-dev](../../../../skills/workflows/feature-dev.workflow.yaml) | 6 | 功能開發 workflow |
| [code-review](../../../../skills/workflows/code-review.workflow.yaml) | 4 | 全面性 code review workflow |
| [large-codebase-analysis](../../../../skills/workflows/large-codebase-analysis.workflow.yaml) | 4 | 針對 50+ 檔案專案的 RLM 強化 workflow |

## 用法

### CLI 安裝

```bash
# List available workflows
uds workflow list

# Install specific workflow
uds workflow install integrated-flow

# Install all workflows
uds workflow install --all
```

### 執行

Workflow 採逐步執行。對於支援 Task tool 的工具（Claude Code、OpenCode）：

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

### 不支援 Task 的工具

Workflow 會轉換為引導式檢查清單：

```markdown
## Integrated Development Flow

### Step 1: Specification Workshop
**Agent**: spec-analyst
**Task**: Analyze requirements and identify acceptance criteria

[Copy this to your AI assistant]

### Step 2: Spec Proposal
...
```

## 建立自訂 Workflow

### 1. 建立 Workflow 檔案

```bash
mkdir -p .claude/workflows
touch .claude/workflows/my-workflow.workflow.yaml
```

### 2. 定義 Workflow

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

| 面向 | Workflow | Agent | Skill |
|--------|----------|-------|-------|
| **目的** | orchestrate 多步驟流程 | 執行自主任務 | 提供知識／context |
| **組成** | 包含多個 agent | 使用 skill 作為 context | 獨立運作 |
| **狀態** | 追蹤跨步驟的進度 | 單一任務狀態 | 無狀態 |
| **使用者參與** | 可包含人工步驟 | 最少 | 無 |

## 以 Wave 為基礎的平行執行 (v1.2.0)

Workflow 中的步驟可分組為 **wave** 以進行平行執行。同一 wave 中的步驟彼此獨立，可由不同的 sub-agent 並行執行。Wave 之間循序執行——wave N 中的所有步驟都必須完成，wave N+1 才會開始。

### Wave 設定

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

### Wave 規則

| 規則 | 說明 |
|------|-------------|
| **獨立性** | 同一 wave 中的步驟不得彼此相依 |
| **Barrier** | wave N 中的所有步驟必須完成，wave N+1 才會開始 |
| **Manual barrier** | `manual` 類型步驟為自動 barrier 點 |
| **選填欄位** | `wave` 欄位為選填；若未指定，步驟將循序執行 |
| **向後相容** | 沒有 wave 欄位的 workflow 仍如以往運作 |

---

## 步驟驗證 Pipeline (v1.2.0)

每個 workflow 步驟可包含兩層驗證，靈感來自 CrewAI 的驗證 pipeline 與 DSPy 的 metric 函式。

### 兩層驗證

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

### 驗證規則

| Layer | 類型 | 執行時機 | 失敗時 |
|-------|------|-------------|------------|
| **Layer 1** | Deterministic | 永遠最先執行 | 立即停止，顯示修正選項 |
| **Layer 2** | Semantic | Layer 1 通過後 | 警告，建議改善 |

**Fail-fast 原則**：若 deterministic 驗證失敗，semantic 檢查將完全跳過。這可避免在根本上已損壞的 output 上浪費時間進行品質評估。

---

## Agent Communication Protocol (v1.2.0)

定義 agent 在 workflow 內如何交換資料。

### 三個通訊層

| Layer | 機制 | 說明 |
|-------|-----------|-------------|
| **Artifact passing** | 以檔案為基礎 | 步驟產生檔案作為 output；下游步驟透過檔案路徑讀取 |
| **Reducer patterns** | append / replace / merge | 多個 output 如何合併 |
| **Context isolation** | 每步驟乾淨啟動 | 每個 agent 步驟以乾淨 context 啟動，僅接收指定的 input |

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

| 模式 | 說明 | 使用情境 |
|---------|-------------|----------|
| `append` | 將所有結果收集為有序清單 | 平行 review、多模組分析 |
| `replace` | 後到的 output 覆寫先前的 | Config 覆寫、最新者勝 |
| `merge` | 將結果深度合併為單一物件 | 結合部分分析 |

### Context Isolation

每個 agent 步驟以**乾淨 context** 啟動，僅包含：
1. 該步驟宣告的 `inputs`（來自前一步驟的 output）
2. 該 agent 的 skill（來自 AGENT.md 的 `skills` 欄位）
3. Workflow 共享的 `prerequisites`

這可防止 context 污染，並確保 agent 行為可重現。

---

## 最佳實踐

### 該做的

- 將複雜任務拆解為離散步驟
- 為關鍵決策納入人工檢查點
- 為每個步驟定義清楚的 input／output
- 使用 conditional 步驟進行錯誤處理
- 清楚記錄 prerequisites

### 不該做的

- 不要建立過長的 workflow（>10 步驟）
- 不要跳過 review／verification 步驟
- 不要假設所有工具都支援自動執行
- 不要把步驟切得太細

---

## 相關資源

- [Agents 文件](../agents/README.md)
- [Skills 文件](../README.md)
- [方法論系統](../dev-methodology/SKILL.md)

---

## 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | 2026-03-17 | Added wave-based parallel execution, step validation pipeline, agent communication protocol |
| 1.1.0 | 2026-01-21 | Added RLM context configuration, parallel-agents step type, large-codebase-analysis workflow |
| 1.0.0 | 2026-01-20 | Initial release |

---

## License

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
