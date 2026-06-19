---
source: skills/dev-methodology/create-methodology.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# 创建自定义 Methodology 指南

> **语言**: [English](../../../../skills/dev-methodology/create-methodology.md) | 简体中文

> [!WARNING]
> **实验性功能**
>
> 此功能正在积极开发中，可能在 v4.0 中有重大变更。

**版本**: 1.0.0
**最后更新**: 2026-01-12

---

## 总览

本指南帮助你为团队或项目创建自定义的开发 methodology。自定义 methodology 存储在 `.standards/methodologies/`，并遵循与内置 methodology 相同的 YAML schema。

---

## 交互式创建向导

使用 `/methodology create` 启动交互式向导：

### 步骤 1：基本信息

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

### 步骤 2：定义 Phase

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

### 步骤 3：配置 Checkpoint

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

### 步骤 4：审查并保存

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

## 手动创建

你也可以手动创建 methodology 文件：

### 1. 创建目录

```bash
mkdir -p .standards/methodologies
```

### 2. 创建 YAML 文件

创建 `.standards/methodologies/my-workflow.methodology.yaml`：

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

### 3. 激活 Methodology

```bash
/methodology switch my-workflow
```

或手动更新 manifest：

```json
// .standards/manifest.json
{
  "methodology": {
    "active": "my-workflow"
  }
}
```

---

## Schema 参考

### 必填字段

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| `id` | string | 唯一标识符（小写、连字符） |
| `name` | string | 显示名称 |
| `version` | string | 语义化版本 |
| `phases` | array | 至少需要一个 phase |

### Phase 字段

| 字段 | 类型 | 必填 | 描述 |
|-------|------|----------|-------------|
| `id` | string | 是 | Phase 标识符 |
| `name` | string | 是 | 显示名称 |
| `description` | string | 是 | 此 phase 进行的内容 |
| `checklist` | array | 否 | 待验证项目 |
| `triggers` | object | 否 | 进入／离开条件 |
| `guidance` | object | 否 | AI 提示词 |
| `duration` | string | 否 | 预估时长 |
| `emoji` | string | 否 | 视觉标示 |

### Checklist 项目字段

| 字段 | 类型 | 必填 | 描述 |
|-------|------|----------|-------------|
| `id` | string | 是 | 项目标识符 |
| `text` | string | 是 | 项目描述 |
| `required` | boolean | 否 | 必须完成才能继续 |
| `textZh` | string | 否 | 中文翻译 |

### Trigger 字段

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| `condition` | string | 触发条件 |
| `fromPhase` | string | 要求的前一个 phase |
| `nextPhase` | string | 触发后的目标 phase |

---

## 最佳实践

### 1. 让 Phase 聚焦

每个 phase 都应有清楚、单一的目的。如果某个 phase 的 checklist 项目超过 5–6 个，请考虑拆分。

### 2. 使用有意义的 ID

```yaml
# Good
id: code-review
id: integration-test

# Avoid
id: phase1
id: step-a
```

### 3. 让 Checklist 可执行

```yaml
# Good
text: Tests cover edge cases
text: Error handling implemented

# Avoid
text: Code is good
text: Everything works
```

### 4. 提供有帮助的指引

在你的 phase guidance 中纳入实用提示：

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

### 5. 考虑本地化

务必为双语团队提供 `nameZh`、`textZh`、`promptZh`。

---

## 示例

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

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2026-01-12 | 初始创建指南 |
