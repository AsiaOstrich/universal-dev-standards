---
source: ../../../../skills/commands/atdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: c056275ece8c
status: experimental
---

---
description: "[UDS] 引導驗收測試驅動開發（ATDD）工作流程"
allowed-tools: Read, Write, Grep, Glob, Bash(npm test:*), Bash(npx:*)
argument-hint: "[user story or feature to define | 要定義的使用者故事或功能]"
status: experimental
---

# ATDD 助手

> **Language**: [English](../../../../skills/commands/atdd.md) | 繁體中文

> [!WARNING]
> **實驗性功能 / Experimental Feature**
>
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。
> This feature is under active development and may change significantly in v4.0.

引導驗收測試驅動開發（ATDD）流程，用於定義和實作使用者故事。

---

## 方法論整合

當調用 `/atdd` 時：
1. **自動啟用 ATDD 方法論**（如果尚未啟用）
2. **將當前階段設為規格工作坊**（定義驗收條件）
3. **追蹤階段轉換**隨著工作進展
4. **在回應中顯示階段指示器**（🤝 工作坊、🧪 提煉、💻 開發、🎬 展示、✅ 完成）

詳見 [methodology-system](../dev-methodology/SKILL.md) 了解完整方法論追蹤。

## ATDD 循環

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

## 工作流程

### 1. 規格工作坊 — 定義驗收條件
- PO 提出使用者故事
- 團隊提出澄清問題
- 共同定義驗收條件
- 記錄超出範圍的項目

### 2. 提煉 — 轉換為測試
- 將 AC 轉換為可執行的測試格式
- 消除模糊性
- 取得 PO 簽署

### 3. 開發 — 實作
- 執行驗收測試（初始應失敗）
- 使用 BDD/TDD 進行實作
- 迭代直到所有測試通過

### 4. 展示 — 向利害關係人展示
- 展示通過的驗收測試
- 展示運作中的功能
- 取得 PO 正式接受

### 5. 完成
- PO 已接受
- 程式碼已合併
- 故事已關閉

## 使用者故事模板

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

## INVEST 準則

| 準則 | Description | 說明 |
|------|-------------|------|
| **I**ndependent | Can be developed independently | 可獨立開發 |
| **N**egotiable | Details can be discussed | 細節可協商 |
| **V**aluable | Delivers business value | 提供商業價值 |
| **E**stimable | Can be estimated | 可估算 |
| **S**mall | Fits in one sprint | 一個 Sprint 可完成 |
| **T**estable | Clear acceptance criteria | 有明確驗收條件 |

## 與 BDD/TDD 整合

```
ATDD Level (Business Acceptance)
  │
  └─▶ BDD Level (Behavior Specification)
         │
         └─▶ TDD Level (Unit Implementation)
```

## 使用方式

- `/atdd` - 啟動互動式 ATDD 會話
- `/atdd "user can reset password"` - 針對特定功能進行 ATDD
- `/atdd US-123` - 針對既有使用者故事進行 ATDD

## 階段檢查清單

### 工作坊階段
- [ ] PO 出席
- [ ] 使用者故事已說明
- [ ] AC 以 Given-When-Then 格式撰寫
- [ ] 已記錄超出範圍項目

### 提煉階段
- [ ] AC 已轉換為可執行測試
- [ ] 測試沒有模糊性
- [ ] PO 已簽署

### 開發階段
- [ ] 驗收測試初始失敗
- [ ] 使用 BDD/TDD 進行實作
- [ ] 所有驗收測試通過

### 展示階段
- [ ] 展示環境已就緒
- [ ] 展示測試通過
- [ ] PO 正式接受

## AI 代理行為

> 遵循 [AI 命令行為標準](../../core/ai-command-behavior.md)

### 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/atdd` | 詢問使用者故事，進入 🤝 WORKSHOP |
| `/atdd "user story"` | 以指定故事為目標，進入 🤝 WORKSHOP |
| `/atdd <story-id>` | 載入現有故事，判斷進入哪個階段 |

### 互動腳本

#### 🤝 WORKSHOP 階段

1. 請使用者描述使用者故事（As a / I want / So that）
2. 引導定義驗收條件（Given-When-Then）
3. 記錄 Out of Scope 項目

**決策：PO 角色**
- IF 使用者是 PO → 直接收集 AC
- IF 使用者是開發者 → AI 模擬 PO 視角提出質疑和補充
- ELSE → 建議邀請 PO 參與，或由 AI 輔助

🛑 **STOP**：AC 定義完成後展示使用者故事文件，等待確認

#### 🧪 DISTILLATION 階段

1. 將 AC 轉換為可執行的測試格式
2. 消除歧義
3. 展示可執行測試

🛑 **STOP**：展示測試後等待使用者（或 PO）簽核

#### 💻 DEVELOPMENT 階段

1. 執行驗收測試（預期失敗）
2. 使用 BDD/TDD 實作功能
3. 迭代直到所有測試通過

🛑 **STOP**：所有測試通過後等待使用者確認進入 DEMO

#### 🎬 DEMO 階段

1. 展示通過的測試結果
2. 展示可運作的功能
3. 等待 PO 正式驗收

🛑 **STOP**：等待使用者確認 PO 已驗收

### 停止點

| 階段 | 停止點 | 等待內容 |
|------|--------|---------|
| WORKSHOP | AC 定義後 | 確認使用者故事 |
| DISTILLATION | 測試轉換後 | PO 簽核 |
| DEVELOPMENT | 所有測試通過後 | 確認進入 DEMO |
| DEMO | 功能展示後 | PO 正式驗收 |

### 錯誤處理

| 錯誤條件 | AI 動作 |
|----------|---------|
| 使用者故事不符合 INVEST 準則 | 指出哪些準則未滿足，建議修改 |
| PO 不在場 | AI 模擬 PO 視角提問，標記 `[Needs PO Confirmation]` |
| 驗收測試無法自動化 | 建議手動測試替代方案，產出測試檢查清單 |
| DEVELOPMENT 階段反覆失敗 | 回到 WORKSHOP 重新審視 AC 是否合理 |

## 參考

- 核心標準：[acceptance-test-driven-development.md](../../core/acceptance-test-driven-development.md)
- Skill：[atdd-assistant](../atdd-assistant/SKILL.md)
- 方法論：[atdd.methodology.yaml](../../../../methodologies/atdd.methodology.yaml)
- 方法論系統：[methodology-system](../dev-methodology/SKILL.md)
