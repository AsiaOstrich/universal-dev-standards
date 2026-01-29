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

## Reference | 參考

- Core Standard: [acceptance-test-driven-development.md](../../core/acceptance-test-driven-development.md)
- Skill: [atdd-assistant](../atdd-assistant/SKILL.md)
- Methodology: [atdd.methodology.yaml](../../methodologies/atdd.methodology.yaml)
- Methodology System: [methodology-system](../methodology-system/SKILL.md)
