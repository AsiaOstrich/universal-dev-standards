---
source: skills/dev-methodology/create-methodology.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# 建立自訂 Methodology 指南

> **語言**: [English](../../../../skills/dev-methodology/create-methodology.md) | 繁體中文

> [!WARNING]
> **實驗性功能**
>
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。

**版本**: 1.0.0
**最後更新**: 2026-01-12

---

## 總覽

本指南協助你為團隊或專案建立自訂的開發 methodology。自訂 methodology 儲存在 `.standards/methodologies/`，並遵循與內建 methodology 相同的 YAML schema。

---

## 互動式建立精靈

使用 `/methodology create` 啟動互動式精靈：

### 步驟 1：基本資訊

```
╔════════════════════════════════════════════════╗
║         Create Custom Methodology              ║
╠════════════════════════════════════════════════╣
║                                                ║
║  What is the name of your methodology?         ║
║  > My Team Workflow                            ║
║                                                ║
║  Brief description:                            ║
║  > Our iterative development process with      ║
║  > planning and review phases                  ║
║                                                ║
║  ID (auto-generated): my-team-workflow         ║
║                                                ║
╚════════════════════════════════════════════════╝
```

### 步驟 2：定義 Phase

```
╔════════════════════════════════════════════════╗
║         Define Phases (1/?)                    ║
╠════════════════════════════════════════════════╣
║                                                ║
║  Phase 1:                                      ║
║  ─────────────────────────────────────         ║
║  Name: Planning                                ║
║  Description: Plan the approach                ║
║  Duration estimate: 15-30 minutes              ║
║  Emoji: 📋                                     ║
║                                                ║
║  Checklist items (one per line):               ║
║  Prefix with * for required items              ║
║  ─────────────────────────────────────         ║
║  * Requirements understood                     ║
║  * Design approach reviewed                    ║
║  Dependencies identified                       ║
║                                                ║
║  What triggers exit from this phase?           ║
║  > User confirms planning complete             ║
║                                                ║
║  Next phase after exit?                        ║
║  > Implementation                              ║
║                                                ║
║  [Add another phase] [Done with phases]        ║
║                                                ║
╚════════════════════════════════════════════════╝
```

### 步驟 3：設定 Checkpoint

```
╔════════════════════════════════════════════════╗
║         Configure Checkpoints                  ║
╠════════════════════════════════════════════════╣
║                                                ║
║  Select checkpoint reminders:                  ║
║  ─────────────────────────────────────         ║
║  [x] Remind at phase transitions               ║
║  [x] Warn after 3 skipped check-ins            ║
║  [ ] Remind after 200+ lines changed           ║
║  [ ] Remind after 30 minutes without commit    ║
║                                                ║
║  Reminder intensity:                           ║
║  ( ) Suggest - gentle reminders                ║
║  (•) Warning - more prominent                  ║
║  ( ) Strict - block until addressed            ║
║                                                ║
╚════════════════════════════════════════════════╝
```

### 步驟 4：審查並儲存

```
╔════════════════════════════════════════════════╗
║         Review Methodology                     ║
╠════════════════════════════════════════════════╣
║                                                ║
║  Name: My Team Workflow                        ║
║  ID: my-team-workflow                          ║
║                                                ║
║  Phases:                                       ║
║  ─────────────────────────────────────         ║
║  1. 📋 Planning                                ║
║     └─ Checklist: 3 items (2 required)         ║
║  2. 💻 Implementation                          ║
║     └─ Checklist: 4 items (3 required)         ║
║  3. 👀 Review                                  ║
║     └─ Checklist: 3 items (2 required)         ║
║                                                ║
║  Checkpoints: 2 active                         ║
║  Intensity: Warning                            ║
║                                                ║
║  [Save] [Edit] [Cancel]                        ║
║                                                ║
╚════════════════════════════════════════════════╝

Methodology created!

Saved to: .standards/methodologies/my-team-workflow.methodology.yaml

To activate: /methodology switch my-team-workflow
```

---

## 手動建立

你也可以手動建立 methodology 檔案：

### 1. 建立目錄

```bash
mkdir -p .standards/methodologies
```

### 2. 建立 YAML 檔案

建立 `.standards/methodologies/my-workflow.methodology.yaml`：

```yaml
$schema: "https://raw.githubusercontent.com/anthropics/universal-dev-standards/main/methodologies/methodology-schema.json"
id: my-workflow
name: My Custom Workflow
nameZh: 我的自訂工作流
version: 1.0.0
description: A custom development workflow for our team

phases:
  - id: plan
    name: Planning
    nameZh: 規劃
    description: Plan the implementation approach
    duration: "15-30 minutes"
    emoji: "📋"
    checklist:
      - id: requirements-clear
        text: Requirements are clearly understood
        textZh: 需求已清楚理解
        required: true
      - id: design-reviewed
        text: Design approach reviewed with team
        textZh: 設計方法已與團隊審查
        required: false
    triggers:
      entry:
        - condition: feature_start
      exit:
        - condition: user_confirms_plan_complete
          nextPhase: implement
    guidance:
      prompt: |
        ## Planning Phase

        Before implementation, ensure:
        {{ checklist | format_checklist }}

  - id: implement
    name: Implementation
    nameZh: 實作
    description: Write the code
    duration: "Variable"
    emoji: "💻"
    checklist:
      - id: follows-patterns
        text: Code follows team patterns
        required: true
      - id: tests-written
        text: Tests written alongside code
        required: true
    triggers:
      entry:
        - condition: plan_complete
      exit:
        - condition: implementation_complete
          nextPhase: review
    guidance:
      prompt: |
        ## Implementation Phase

        Writing code for: {{feature_description}}

        {{ checklist | format_checklist }}

  - id: review
    name: Review
    nameZh: 審查
    description: Self-review and prepare for PR
    duration: "15-30 minutes"
    emoji: "👀"
    checklist:
      - id: self-reviewed
        text: Code self-reviewed
        required: true
      - id: tests-pass
        text: All tests pass
        required: true
      - id: docs-updated
        text: Documentation updated
        required: false
    triggers:
      entry:
        - condition: implementation_complete
      exit:
        - condition: ready_for_pr
          nextPhase: done

  - id: done
    name: Done
    nameZh: 完成
    description: Ready for PR
    emoji: "✅"
    checklist: []
    triggers:
      entry:
        - condition: ready_for_pr
      exit: []

checkpoints:
  - id: phase-complete
    trigger: phase_transition
    intensity: suggest
    action: "Phase complete. Consider committing."

commands:
  - name: workflow
    description: Start team workflow
    usage: "/workflow [feature]"
    action: start_workflow

aiGuidance:
  autoDetect: true
  proactiveReminders: true
  contextKeywords:
    - "team workflow"
    - "our process"
```

### 3. 啟用 Methodology

```bash
/methodology switch my-workflow
```

或手動更新 manifest：

```json
// .standards/manifest.json
{
  "methodology": {
    "active": "my-workflow"
  }
}
```

---

## Schema 參考

### 必填欄位

| 欄位 | 型別 | 描述 |
|-------|------|-------------|
| `id` | string | 唯一識別碼（小寫、連字號） |
| `name` | string | 顯示名稱 |
| `version` | string | 語意化版本 |
| `phases` | array | 至少需要一個 phase |

### Phase 欄位

| 欄位 | 型別 | 必填 | 描述 |
|-------|------|----------|-------------|
| `id` | string | 是 | Phase 識別碼 |
| `name` | string | 是 | 顯示名稱 |
| `description` | string | 是 | 此 phase 進行的內容 |
| `checklist` | array | 否 | 待驗證項目 |
| `triggers` | object | 否 | 進入／離開條件 |
| `guidance` | object | 否 | AI 提示詞 |
| `duration` | string | 否 | 預估時長 |
| `emoji` | string | 否 | 視覺標示 |

### Checklist 項目欄位

| 欄位 | 型別 | 必填 | 描述 |
|-------|------|----------|-------------|
| `id` | string | 是 | 項目識別碼 |
| `text` | string | 是 | 項目描述 |
| `required` | boolean | 否 | 必須完成才能繼續 |
| `textZh` | string | 否 | 中文翻譯 |

### Trigger 欄位

| 欄位 | 型別 | 描述 |
|-------|------|-------------|
| `condition` | string | 觸發條件 |
| `fromPhase` | string | 要求的前一個 phase |
| `nextPhase` | string | 觸發後的目標 phase |

---

## 最佳實踐

### 1. 讓 Phase 聚焦

每個 phase 都應有清楚、單一的目的。如果某個 phase 的 checklist 項目超過 5–6 個，請考慮拆分。

### 2. 使用有意義的 ID

```yaml
# Good
id: code-review
id: integration-test

# Avoid
id: phase1
id: step-a
```

### 3. 讓 Checklist 可執行

```yaml
# Good
text: Tests cover edge cases
text: Error handling implemented

# Avoid
text: Code is good
text: Everything works
```

### 4. 提供有幫助的指引

在你的 phase guidance 中納入實用提示：

```yaml
guidance:
  prompt: |
    ## Review Phase

    Focus areas:
    - Security vulnerabilities
    - Performance implications
    - API contract changes

    {{ checklist | format_checklist }}
```

### 5. 考慮在地化

務必為雙語團隊提供 `nameZh`、`textZh`、`promptZh`。

---

## 範例

### Hotfix 工作流

```yaml
id: hotfix
name: Hotfix Workflow
phases:
  - id: reproduce
    name: Reproduce Issue
    checklist:
      - id: issue-reproduced
        text: Issue reproduced locally
        required: true
  - id: fix
    name: Apply Fix
    checklist:
      - id: minimal-fix
        text: Fix is minimal and targeted
        required: true
  - id: verify
    name: Verify Fix
    checklist:
      - id: issue-resolved
        text: Original issue is resolved
        required: true
      - id: no-regression
        text: No regressions introduced
        required: true
```

### Feature Flag 工作流

```yaml
id: feature-flag
name: Feature Flag Development
phases:
  - id: design-flag
    name: Design Flag
    checklist:
      - id: flag-named
        text: Flag has descriptive name
        required: true
  - id: implement-behind-flag
    name: Implement Behind Flag
    checklist:
      - id: default-off
        text: Flag defaults to off
        required: true
  - id: gradual-rollout
    name: Gradual Rollout
    checklist:
      - id: metrics-monitored
        text: Metrics being monitored
        required: true
  - id: cleanup
    name: Cleanup
    checklist:
      - id: flag-removed
        text: Flag code removed after full rollout
        required: true
```

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.0.0 | 2026-01-12 | 初始建立指南 |
