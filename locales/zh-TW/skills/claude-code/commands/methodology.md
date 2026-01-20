---
source: ../../../../../skills/claude-code/commands/methodology.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-12
status: experimental
---

---
description: 管理開發方法論工作流 | Manage development methodology workflow
allowed-tools: Read, Write, Glob, Grep, Bash(git:*)
argument-hint: "[action] [argument]"
status: experimental
---

# /methodology 命令

> **Language**: [English](../../../../../skills/claude-code/commands/methodology.md) | 繁體中文

> [!WARNING]
> **實驗性功能 / Experimental Feature**
>
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。
> This feature is under active development and may change significantly in v4.0.

管理當前專案的開發方法論。支援 TDD、BDD、SDD、ATDD 和自訂方法論。

---

## 動作

| 動作 | 說明 |
|------|------|
| *(無)* | 顯示當前方法論狀態 |
| `status` | 顯示當前階段和檢查清單 |
| `switch <id>` | 切換到不同方法論 |
| `phase [name]` | 顯示或變更當前階段 |
| `checklist` | 顯示當前階段檢查清單 |
| `skip` | 跳過當前階段（會有警告） |
| `list` | 列出可用方法論 |
| `create` | 建立自訂方法論 |

---

## 使用方式

### 顯示狀態

```bash
/methodology
/methodology status
```

**輸出：**
```
┌────────────────────────────────────────────────┐
│ 📋 啟用的方法論: TDD                            │
│ 📍 當前階段: 🔴 紅燈 (1-5 分鐘)                 │
│ ⏱️  持續時間: 3 分鐘                            │
├────────────────────────────────────────────────┤
│ 檢查清單：                                      │
│   ✅ 測試描述預期行為                           │
│   ✅ 測試名稱清晰                               │
│   ⬜ 測試遵循 AAA 模式                          │
│   ⬜ 測試執行失敗                               │
├────────────────────────────────────────────────┤
│ 下一步：完成檢查清單，然後執行測試              │
└────────────────────────────────────────────────┘
```

### 切換方法論

```bash
/methodology switch sdd
/methodology switch bdd
/methodology switch my-custom-workflow
```

**輸出：**
```
切換方法論：TDD → SDD

⚠️ 警告：您有未提交的變更。
   當前階段：綠燈
   變更的檔案：3

選項：
[1] 先提交變更，然後切換
[2] 暫存變更並切換
[3] 直接切換（保留變更）
[4] 取消

> 1

正在提交變更...
已切換到：SDD（規格驅動開發）
當前階段：提案
```

### 變更階段

```bash
/methodology phase              # 顯示當前階段
/methodology phase green        # 移動到綠燈階段 (TDD)
/methodology phase refactor     # 移動到重構階段
```

### 顯示檢查清單

```bash
/methodology checklist
```

**輸出：**
```
📋 紅燈階段檢查清單 (TDD)

必填：
  ⬜ 測試描述預期行為
  ✅ 測試名稱清楚說明測試內容
  ⬜ 測試遵循 AAA 模式（Arrange-Act-Assert）
  ⬜ 測試執行時失敗
  ⬜ 失敗是正確的原因

選填：
  ⬜ 測試只有一個斷言

進度：1/5 必填項目完成
```

### 跳過階段

```bash
/methodology skip
```

**輸出：**
```
⚠️ 跳過階段警告

您即將跳過紅燈階段，尚未完成：
  ⬜ 測試遵循 AAA 模式
  ⬜ 測試執行時失敗

這是警告前的第 2 次跳過（共 3 次）。

確定要跳過嗎？
[1] 是，跳過此階段
[2] 否，繼續完成檢查清單
```

### 列出方法論

```bash
/methodology list
```

**輸出：**
```
📚 可用的方法論

內建：
  ├─ tdd    測試驅動開發（紅燈 → 綠燈 → 重構）
  ├─ bdd    行為驅動開發（Given-When-Then）
  ├─ sdd    規格驅動開發（規格優先、程式碼其次）
  └─ atdd   驗收測試驅動開發

自訂（.standards/methodologies/）：
  └─ my-team-workflow   我們團隊的開發流程

啟用中：tdd ✓

使用 '/methodology switch <id>' 來變更。
```

### 建立自訂

```bash
/methodology create
```

啟動互動式方法論建立精靈。詳見[建立自訂方法論](../methodology-system/create-methodology.md)。

---

## 配置

方法論設定儲存在 `.standards/manifest.json`：

```json
{
  "methodology": {
    "active": "tdd",
    "available": ["tdd", "bdd", "sdd", "atdd", "my-team-workflow"],
    "config": {
      "tdd": {
        "checkpointsEnabled": true,
        "reminderIntensity": "suggest",
        "skipLimit": 3
      }
    }
  }
}
```

### 透過 /config 配置

您也可以使用以下命令配置方法論設定：

```bash
/config methodology
```

---

## 範例

### 為功能啟動 TDD

```bash
# 啟用 TDD 方法論
/methodology switch tdd

# 或直接使用 TDD 命令（自動啟用 TDD）
/tdd "驗證用戶郵箱格式"
```

### 開發過程中檢查進度

```bash
# 檢查當前狀態
/methodology status

# 檢視檢查清單
/methodology checklist

# 如果準備好了，移動到下一個階段
/methodology phase green
```

### 為重大變更切換到 SDD

```bash
# 切換到規格驅動以進行架構變更
/methodology switch sdd

# 這會啟動 提案 → 審查 → 實作 流程
```

---

## 相關命令

| 命令 | 說明 |
|------|------|
| `/tdd` | 啟動 TDD 工作流（啟用 TDD 方法論） |
| `/spec` | 啟動 SDD 工作流（啟用 SDD 方法論） |
| `/config methodology` | 配置方法論設定 |

---

## 參考

- [方法論系統 Skill](../methodology-system/SKILL.md) - 完整 skill 文檔
- [執行時引導](../methodology-system/runtime.md) - AI 行為規格
- [建立自訂方法論](../methodology-system/create-methodology.md) - 自訂方法論指南

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-01-12 | 初始 /methodology 命令 |
