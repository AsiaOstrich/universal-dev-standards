---
source: ../../../core/workflow-enforcement.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-22
status: current
---

# 工作流程強制執行標準

**適用範圍**：所有使用結構化開發方法論的軟體專案
**範圍**：通用

## 概述

本標準定義了機器可強制執行的工作流程閘門，防止在開發方法論（SDD、TDD、BDD）中跳過階段。除了依賴開發者的自律外，工作流程閘門在階段轉換時提供自動化檢查。

## 核心原則

> **引導而非阻斷。** 當前置條件失敗時，總是提供可操作的指引：缺少什麼、為什麼重要、以及如何修復。

## 執行模式

專案可透過 `.uds/config.yaml` 設定執行行為：

| 模式 | 行為 | 使用場景 |
|------|------|---------|
| `enforce` | 阻斷階段轉換 + 顯示指引 | 承諾流程紀律的團隊 |
| `suggest` | 顯示警告 + 允許覆蓋 | 漸進式採用的團隊 |
| `off` | 不執行任何檢查 | 選擇退出 |

**預設值**：`enforce`

```yaml
# .uds/config.yaml
workflow:
  enforcement_mode: enforce  # enforce | suggest | off
```

## 階段閘門架構

### 運作方式

1. 使用者調用工作流程命令（例如 `/sdd implement`）
2. AI 助手檢查該階段的前置條件
3. 如果前置條件通過 → 正常進行
4. 如果前置條件失敗：
   - **enforce 模式**：停止、解釋、引導到正確階段
   - **suggest 模式**：警告、允許覆蓋
   - **off 模式**：完全跳過檢查

### 閘門類型

| 閘門類型 | 阻斷 | 描述 |
|---------|------|------|
| **硬閘門** | 是 | 必須通過才能繼續（例如：規格必須為已核准才能實作） |
| **軟閘門** | 否 | 建議性警告（例如：建議在 commit 中引用規格） |

## SDD 階段閘門

```
discuss → create → review → approve → implement → verify
```

| 階段 | 前置條件 |
|------|---------|
| discuss | 無（入口點） |
| create | 檢查孤兒規格（軟閘門） |
| review | 規格存在且狀態 = Draft |
| approve | 規格存在且狀態 = Review，所有評論已處理 |
| implement | 規格存在且狀態 = Approved |
| verify | 實作存在，所有 AC 有程式碼 + 測試 |

## TDD 階段閘門

```
RED → GREEN → REFACTOR → (重複)
```

| 階段 | 前置條件 |
|------|---------|
| RED | 功能/行為已明確定義 |
| GREEN | 至少一個失敗的測試存在（不是錯誤，而是斷言失敗） |
| REFACTOR | 所有測試通過 |

**關鍵強制規則**：AI 不得在失敗測試存在之前撰寫實作程式碼。這是 TDD 的基本契約。

## BDD 階段閘門

```
DISCOVERY → FORMULATION → AUTOMATION → LIVING DOCS
```

| 階段 | 前置條件 |
|------|---------|
| DISCOVERY | 行為/功能已識別 |
| FORMULATION | 探索階段產出的具體範例存在 |
| AUTOMATION | 包含 Gherkin 場景的 `.feature` 檔案存在 |
| LIVING DOCS | 步驟定義已實作，所有場景通過 |

## 提交閘門

| 檢查 | 類型 | 觸發 |
|------|------|------|
| 存在已暫存的變更 | 硬閘門 | 所有提交 |
| 無合併衝突 | 硬閘門 | 所有提交 |
| 測試通過 | 硬閘門 | feat/fix 提交 |
| 規格引用 | 軟閘門 | 有活躍規格的 feat/fix 提交 |

## 實作注意事項

### 對於 AI 助手

AI 助手應該：
1. 在執行任何工作流程階段**之前**檢查閘門
2. 使用專案設定中的執行模式
3. 當閘門失敗時提供清晰、可操作的指引
4. 在開始新工作流程前檢查是否有可恢復的工作流程狀態
5. 在 `.workflow-state/` 中追蹤階段轉換

### 對於 CLI 工具

CLI 工具可透過以下方式整合閘門：
1. `WorkflowGate` 模組 — 驗證階段轉換
2. Pre-commit hooks — 警告工作流程合規性
3. `uds check` — 報告工作流程狀態

### 對於 Git Hooks

Git 層級的執行應為**僅警告**（非阻斷），以避免讓開發者感到挫折。AI 層級處理阻斷性執行，因為它可以解釋和引導。

## 與其他標準的關係

| 標準 | 關係 |
|------|------|
| [工作流狀態協議](workflow-state-protocol.md) | 閘門檢查由此協議管理的狀態檔案 |
| [規格驅動開發](spec-driven-development.md) | SDD 階段閘門強制 SDD 工作流程 |
| [測試標準](testing-standards.md) | TDD/BDD 閘門強制測試方法論 |
| [提交訊息指南](commit-message-guide.md) | 提交閘門強制規格追蹤性 |
| [簽入標準](checkin-standards.md) | Pre-commit 閘門補充簽入規則 |
