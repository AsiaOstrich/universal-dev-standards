---
source: ../../../../skills/dev-methodology/create-methodology.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-12
status: experimental
---

# 建立自訂方法論指南

> **Language**: [English](../../../../skills/dev-methodology/create-methodology.md) | 繁體中文

> [!WARNING]
> **實驗性功能 / Experimental Feature**
>
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。
> This feature is under active development and may change significantly in v4.0.

**版本**: 1.0.0
**最後更新**: 2026-01-12

---

## 概述

本指南幫助您為團隊或專案建立自訂開發方法論。自訂方法論儲存在 `.standards/methodologies/` 目錄中，並遵循與內建方法論相同的 YAML 結構。

---

## 互動式建立精靈

使用 `/methodology create` 啟動互動式精靈：

### 步驟 1：基本資訊

```
╔════════════════════════════════════════════════╗
║         建立自訂方法論                          ║
╠════════════════════════════════════════════════╣
║                                                ║
║  您的方法論名稱是什麼？                         ║
║  > 我的團隊工作流                               ║
║                                                ║
║  簡短描述：                                     ║
║  > 我們團隊的迭代開發流程，包含規劃和審查階段   ║
║                                                ║
║  ID（自動產生）: my-team-workflow               ║
║                                                ║
╚════════════════════════════════════════════════╝
```

### 步驟 2：定義階段

```
╔════════════════════════════════════════════════╗
║         定義階段 (1/?)                          ║
╠════════════════════════════════════════════════╣
║                                                ║
║  階段 1：                                       ║
║  ─────────────────────────────────────         ║
║  名稱：規劃                                     ║
║  描述：規劃實作方法                             ║
║  預估時間：15-30 分鐘                           ║
║  表情符號：📋                                   ║
║                                                ║
║  檢查清單項目（每行一項）：                     ║
║  在必填項目前加上 *                             ║
║  ─────────────────────────────────────         ║
║  * 需求已理解                                   ║
║  * 設計方法已審查                               ║
║  相依性已識別                                   ║
║                                                ║
║  什麼觸發離開此階段？                           ║
║  > 用戶確認規劃完成                             ║
║                                                ║
║  離開後的下一個階段？                           ║
║  > 實作                                         ║
║                                                ║
║  [新增另一個階段] [階段定義完成]                ║
║                                                ║
╚════════════════════════════════════════════════╝
```

### 步驟 3：配置檢查點

```
╔════════════════════════════════════════════════╗
║         配置檢查點                              ║
╠════════════════════════════════════════════════╣
║                                                ║
║  選擇檢查點提醒：                               ║
║  ─────────────────────────────────────         ║
║  [x] 在階段轉換時提醒                           ║
║  [x] 跳過 3 次簽入後警告                        ║
║  [ ] 變更超過 200 行後提醒                      ║
║  [ ] 30 分鐘沒有提交後提醒                      ║
║                                                ║
║  提醒強度：                                     ║
║  ( ) 建議 - 溫和提醒                            ║
║  (•) 警告 - 更明顯                              ║
║  ( ) 嚴格 - 阻止直到處理                        ║
║                                                ║
╚════════════════════════════════════════════════╝
```

### 步驟 4：審查並儲存

```
╔════════════════════════════════════════════════╗
║         審查方法論                              ║
╠════════════════════════════════════════════════╣
║                                                ║
║  名稱：我的團隊工作流                           ║
║  ID：my-team-workflow                           ║
║                                                ║
║  階段：                                         ║
║  ─────────────────────────────────────         ║
║  1. 📋 規劃                                     ║
║     └─ 檢查清單：3 項（2 項必填）               ║
║  2. 💻 實作                                     ║
║     └─ 檢查清單：4 項（3 項必填）               ║
║  3. 👀 審查                                     ║
║     └─ 檢查清單：3 項（2 項必填）               ║
║                                                ║
║  檢查點：2 個啟用                               ║
║  強度：警告                                     ║
║                                                ║
║  [儲存] [編輯] [取消]                           ║
║                                                ║
╚════════════════════════════════════════════════╝

方法論已建立！

儲存到：.standards/methodologies/my-team-workflow.methodology.yaml

啟用：/methodology switch my-team-workflow
```

---

## 手動建立

您也可以手動建立方法論檔案：

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
    triggers:
      exit:
        - condition: user_confirms_plan_complete
          nextPhase: implement
```

### 3. 啟用方法論

```bash
/methodology switch my-workflow
```

---

## Schema 參考

### 必填欄位

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼（小寫、連字號） |
| `name` | string | 顯示名稱 |
| `version` | string | 語意化版本 |
| `phases` | array | 至少一個階段 |

### 階段欄位

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `id` | string | 是 | 階段識別碼 |
| `name` | string | 是 | 顯示名稱 |
| `description` | string | 是 | 此階段的說明 |
| `checklist` | array | 否 | 驗證項目 |
| `triggers` | object | 否 | 進入/離開條件 |
| `guidance` | object | 否 | AI 提示 |
| `duration` | string | 否 | 預估時間 |
| `emoji` | string | 否 | 視覺指示器 |

---

## 最佳實踐

### 1. 保持階段專注

每個階段應有明確、單一的目的。如果一個階段有超過 5-6 個檢查項目，考慮拆分。

### 2. 使用有意義的 ID

```yaml
# 好的
id: code-review
id: integration-test

# 避免
id: phase1
id: step-a
```

### 3. 使檢查清單可操作

```yaml
# 好的
text: 測試涵蓋邊界情況
text: 錯誤處理已實作

# 避免
text: 程式碼很好
text: 一切正常
```

### 4. 提供有幫助的引導

在階段引導中包含實用提示：

```yaml
guidance:
  prompt: |
    ## 審查階段

    重點領域：
    - 安全漏洞
    - 效能影響
    - API 契約變更

    {{ checklist | format_checklist }}
```

### 5. 考慮本地化

始終為雙語團隊提供 `nameZh`、`textZh`、`promptZh`。

---

## 範例

### 熱修復工作流

```yaml
id: hotfix
name: Hotfix Workflow
nameZh: 熱修復工作流
phases:
  - id: reproduce
    name: Reproduce Issue
    nameZh: 重現問題
    checklist:
      - id: issue-reproduced
        text: Issue reproduced locally
        textZh: 問題已在本地重現
        required: true
  - id: fix
    name: Apply Fix
    nameZh: 應用修復
    checklist:
      - id: minimal-fix
        text: Fix is minimal and targeted
        textZh: 修復是最小且針對性的
        required: true
  - id: verify
    name: Verify Fix
    nameZh: 驗證修復
    checklist:
      - id: issue-resolved
        text: Original issue is resolved
        textZh: 原始問題已解決
        required: true
```

### 功能旗標工作流

```yaml
id: feature-flag
name: Feature Flag Development
nameZh: 功能旗標開發
phases:
  - id: design-flag
    name: Design Flag
    nameZh: 設計旗標
    checklist:
      - id: flag-named
        text: Flag has descriptive name
        textZh: 旗標有描述性名稱
        required: true
  - id: implement-behind-flag
    name: Implement Behind Flag
    nameZh: 在旗標後實作
    checklist:
      - id: default-off
        text: Flag defaults to off
        textZh: 旗標預設為關閉
        required: true
  - id: gradual-rollout
    name: Gradual Rollout
    nameZh: 漸進式推出
    checklist:
      - id: metrics-monitored
        text: Metrics being monitored
        textZh: 正在監控指標
        required: true
  - id: cleanup
    name: Cleanup
    nameZh: 清理
    checklist:
      - id: flag-removed
        text: Flag code removed after full rollout
        textZh: 完全推出後移除旗標程式碼
        required: true
```

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-01-12 | 初始建立指南 |
