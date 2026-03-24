---
description: [UDS] Guide through Acceptance Test-Driven Development workflow
allowed-tools: Read, Write, Grep, Glob, Bash(npm test:*), Bash(npx:*)
argument-hint: "[user story or feature to define | 要定義的使用者故事或功能]"
status: experimental
---

# ATDD Assistant | ATDD 助手

> [!WARNING]
> **Experimental Feature / 實驗性功能**
>
> This feature is under active development and may change significantly in v4.0.
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。

Guide through the Acceptance Test-Driven Development (ATDD) workflow for defining and implementing user stories.

引導驗收測試驅動開發（ATDD）流程，用於定義和實作使用者故事。

## Methodology Integration | 方法論整合

When `/atdd` is invoked:
1. **Automatically activate ATDD methodology** if not already active
2. **Set current phase to SPECIFICATION-WORKSHOP** (defining acceptance criteria)
3. **Track phase transitions** as work progresses
4. **Show phase indicators** in responses (🤝 Workshop, 🧪 Distillation, 💻 Development, 🎬 Demo, ✅ Done)

當調用 `/atdd` 時：
1. **自動啟用 ATDD 方法論**（如果尚未啟用）
2. **將當前階段設為規格工作坊**（定義驗收條件）
3. **追蹤階段轉換**隨著工作進展
4. **在回應中顯示階段指示器**（🤝 工作坊、🧪 提煉、💻 開發、🎬 展示、✅ 完成）

See [methodology-system](../methodology-system/SKILL.md) for full methodology tracking.

## ATDD Cycle | ATDD 循環

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌──────┐  ┌──────┐│
│  │ WORKSHOP │► │ DISTILL   │► │ DEVELOP   │► │ DEMO │► │ DONE ││
│  └──────────┘  └───────────┘  └───────────┘  └──────┘  └──────┘│
│       ▲                              │              │           │
│       │                              │              │           │
│       └──────────────────────────────┴──────────────┘           │
│                  (Refinement needed)                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Workflow | 工作流程

### 1. SPECIFICATION WORKSHOP - Define AC | 定義驗收條件
- PO presents user story
- Team asks clarifying questions
- Define acceptance criteria together
- Document out of scope items

### 2. DISTILLATION - Convert to Tests | 轉換為測試
- Convert AC to executable test format
- Remove ambiguity
- Get PO sign-off

### 3. DEVELOPMENT - Implement | 實作
- Run acceptance tests (should fail initially)
- Use BDD/TDD for implementation
- Iterate until all tests pass

### 4. DEMO - Present to Stakeholders | 向利害關係人展示
- Show passing acceptance tests
- Demonstrate working functionality
- Get formal PO acceptance

### 5. DONE - Complete | 完成
- PO accepted
- Code merged
- Story closed

## User Story Template | 使用者故事模板

```markdown
## User Story: [Title]

**As a** [role]
**I want** [feature]
**So that** [benefit]

## Acceptance Criteria

### AC-1: [Happy path]
**Given** [precondition]
**When** [action]
**Then** [expected result]

### AC-2: [Error scenario]
**Given** [precondition]
**When** [invalid action]
**Then** [error handling]

## Out of Scope
- [Things explicitly not included]

## Technical Notes
- [Implementation hints]
```

## INVEST Criteria | INVEST 準則

| Criteria | Description | 描述 |
|----------|-------------|------|
| **I**ndependent | Can be developed independently | 可獨立開發 |
| **N**egotiable | Details can be discussed | 細節可協商 |
| **V**aluable | Delivers business value | 提供商業價值 |
| **E**stimable | Can be estimated | 可估算 |
| **S**mall | Fits in one sprint | 一個 Sprint 可完成 |
| **T**estable | Clear acceptance criteria | 有明確驗收條件 |

## Integration with BDD/TDD | 與 BDD/TDD 整合

```
ATDD Level (Business Acceptance)
  │
  └─▶ BDD Level (Behavior Specification)
         │
         └─▶ TDD Level (Unit Implementation)
```

## Usage | 使用方式

- `/atdd` - Start interactive ATDD session
- `/atdd "user can reset password"` - ATDD for specific feature
- `/atdd US-123` - ATDD for existing user story

## Phase Checklist | 階段檢查清單

### Workshop Phase
- [ ] PO present
- [ ] User story explained
- [ ] AC in Given-When-Then
- [ ] Out of scope documented

### Distillation Phase
- [ ] AC converted to executable tests
- [ ] Tests are unambiguous
- [ ] PO signed off

### Development Phase
- [ ] Acceptance tests fail initially
- [ ] BDD/TDD used for implementation
- [ ] All acceptance tests pass

### Demo Phase
- [ ] Demo environment ready
- [ ] Tests shown passing
- [ ] PO formally accepts

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/atdd` | 詢問使用者故事，進入 🤝 WORKSHOP |
| `/atdd "user story"` | 以指定故事為目標，進入 🤝 WORKSHOP |
| `/atdd <story-id>` | 載入現有故事，判斷進入哪個階段 |

### Interaction Script | 互動腳本

#### 🤝 WORKSHOP Phase

1. 請使用者描述使用者故事（As a / I want / So that）
2. 引導定義驗收條件（Given-When-Then）
3. 記錄 Out of Scope 項目

**Decision: PO 角色**
- IF 使用者是 PO → 直接收集 AC
- IF 使用者是開發者 → AI 模擬 PO 視角提出質疑和補充
- ELSE → 建議邀請 PO 參與，或由 AI 輔助

🛑 **STOP**: AC 定義完成後展示使用者故事文件，等待確認

#### 🧪 DISTILLATION Phase

1. 將 AC 轉換為可執行的測試格式
2. 消除歧義
3. 展示可執行測試

🛑 **STOP**: 展示測試後等待使用者（或 PO）簽核

#### 💻 DEVELOPMENT Phase

1. 執行驗收測試（預期失敗）
2. 使用 BDD/TDD 實作功能
3. 迭代直到所有測試通過

🛑 **STOP**: 所有測試通過後等待使用者確認進入 DEMO

#### 🎬 DEMO Phase

1. 展示通過的測試結果
2. 展示可運作的功能
3. 等待 PO 正式驗收

🛑 **STOP**: 等待使用者確認 PO 已驗收

### Stop Points | 停止點

| Phase | Stop Point | 等待內容 |
|-------|-----------|---------|
| WORKSHOP | AC 定義後 | 確認使用者故事 |
| DISTILLATION | 測試轉換後 | PO 簽核 |
| DEVELOPMENT | 所有測試通過後 | 確認進入 DEMO |
| DEMO | 功能展示後 | PO 正式驗收 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 使用者故事不符合 INVEST 準則 | 指出哪些準則未滿足，建議修改 |
| PO 不在場 | AI 模擬 PO 視角提問，標記 `[Needs PO Confirmation]` |
| 驗收測試無法自動化 | 建議手動測試替代方案，產出測試檢查清單 |
| DEVELOPMENT 階段反覆失敗 | 回到 WORKSHOP 重新審視 AC 是否合理 |

## Reference | 參考

- Core Standard: [acceptance-test-driven-development.md](../../core/acceptance-test-driven-development.md)
- Skill: [atdd-assistant](../atdd-assistant/SKILL.md)
- Methodology: [atdd.methodology.yaml](../../methodologies/atdd.methodology.yaml)
- Methodology System: [methodology-system](../methodology-system/SKILL.md)
