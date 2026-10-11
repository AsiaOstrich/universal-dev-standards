---
source: ../../../../skills/commands/methodology.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 0850287f7a70
status: current
---

---
description: [UDS] 管理開發方法論工作流程
allowed-tools: Read, Write, Glob, Grep, Bash(git:*)
argument-hint: "[action] [argument]"
status: experimental
---

# /methodology 命令

> **Language**: [English](../../../../skills/commands/methodology.md) | 繁體中文

> [!WARNING]
> **實驗性功能 / Experimental Feature**
>
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。
> This feature is under active development and may change significantly in v4.0.

管理當前專案的開發方法論。

**兩個獨立系統：**
- **系統 A：SDD** - 規格驅動開發（AI 時代，規格優先）
- **系統 B：雙迴圈 TDD** - BDD（外迴圈）+ TDD（內迴圈）（傳統）

**可選輸入：**
- **ATDD** - 驗收測試驅動開發（工作坊方法，可作為任一系統的輸入）

---

## 動作

| 動作 | Description | 說明 |
|------|-------------|------|
| *(無)* | Show current methodology status | 顯示當前方法論狀態 |
| `status` | Show current phase and checklist | 顯示當前階段和檢查清單 |
| `switch <id>` | Switch to different methodology | 切換到不同方法論 |
| `phase [name]` | Show or change current phase | 顯示或變更當前階段 |
| `checklist` | Show current phase checklist | 顯示當前階段檢查清單 |
| `skip` | Skip current phase (with warning) | 跳過當前階段（會有警告） |
| `list` | List available methodologies | 列出可用方法論 |
| `create` | Create custom methodology | 建立自訂方法論 |

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
📚 可用的方法論系統

系統 A：SDD（AI 時代）
  └─ sdd    規格驅動開發
            /sdd → 審查 → /derive-all → 實作

系統 B：雙迴圈 TDD（傳統）
  ├─ bdd    BDD 外迴圈（探索 → 制定）
  └─ tdd    TDD 內迴圈（紅燈 → 綠燈 → 重構）

可選輸入（可作為任一系統的輸入）：
  └─ atdd   ATDD 工作坊（利害關係人協作）

自訂（.standards/methodologies/）：
  └─ my-team-workflow   我們團隊的開發流程

啟用中：sdd（系統 A）✓

使用 '/methodology switch <id>' 來變更。
```

### 建立自訂

```bash
/methodology create
```

啟動互動式方法論建立精靈。詳見[建立自訂方法論](../dev-methodology/create-methodology.md)。

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
/tdd "驗證使用者電子郵件格式"
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

# 這會啟動 討論 → 提案 → 審查 → 實作 流程
```

---

## 相關命令

| 命令 | 系統 | 說明 |
|------|------|------|
| `/sdd` | A：SDD | 啟動 SDD 規格提案 |
| `/derive-all` | A：SDD | 從規格產生測試 |
| `/bdd` | B：雙迴圈 TDD | 啟動 BDD 外迴圈 |
| `/tdd` | B：雙迴圈 TDD | 啟動 TDD 內迴圈 |
| `/atdd` | 輸入（兩者皆可） | 啟動 ATDD 工作坊 |
| `/config methodology` | - | 配置方法論設定 |

---

## AI Agent Behavior | AI 代理行為

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| 輸入 | AI 動作 | AI 行為 |
|------|---------|---------|
| `/methodology` | 顯示當前方法論狀態和 checklist | 顯示當前狀態 |
| `/methodology status` | 同上 | 同上 |
| `/methodology switch <id>` | 檢查未提交變更 → 切換方法論 | 檢查未提交變更 → 切換 |
| `/methodology phase` | 顯示當前階段 | 顯示當前階段 |
| `/methodology phase <name>` | 移動到指定階段 | 移動到指定階段 |
| `/methodology checklist` | 顯示當前階段的 checklist | 顯示階段檢查清單 |
| `/methodology skip` | 跳過當前階段（含警告） | 跳過階段（含警告） |
| `/methodology list` | 列出所有可用方法論 | 列出可用方法論 |
| `/methodology create` | 啟動自訂方法論建立精靈 | 啟動建立精靈 |

### Interaction Script | 互動腳本

#### Status / Checklist

1. 讀取 `.standards/manifest.json` 中的 methodology 配置
2. 顯示狀態面板（方法論、階段、checklist 進度）

#### Switch

1. 檢查是否有未提交變更（`git status`）

**決策：未提交變更**
- IF 有未提交變更 → 顯示警告，提供 4 選項：Commit first / Stash / Switch anyway / Cancel
- IF 無變更 → 直接切換

🛑 **STOP**: 有未提交變更時等待使用者選擇處理方式

2. 更新 manifest 中的 active methodology
3. 顯示切換結果和新方法論的第一個階段

#### Skip

1. 檢查當前 checklist 未完成項目
2. 顯示警告（含已跳過次數）

🛑 **STOP**: 顯示跳過警告後等待使用者確認

**決策：跳過限制**
- IF 已達跳過上限（skipLimit） → 強制顯示嚴重警告
- ELSE → 記錄跳過，進入下一階段

#### Create

1. 啟動互動式精靈，引導使用者定義自訂方法論

🛑 **STOP**: 定義完成後展示方法論結構，等待確認寫入

### Stop Points | 停止點

| 停止點 | 等待內容 |
|--------|---------|
| Switch 有未提交變更 | 使用者選擇處理方式 |
| Skip 確認 | 使用者確認跳過 |
| Create 完成 | 使用者確認寫入自訂方法論 |

### Error Handling | 錯誤處理

| 錯誤條件 | AI 動作 |
|----------|---------|
| 方法論未啟用 | 提示執行 `/methodology switch <id>` |
| 指定的方法論不存在 | 列出可用方法論（`/methodology list`） |
| 指定的階段在當前方法論中不存在 | 列出可用階段 |
| manifest 無 methodology 配置 | 提示透過 `/config methodology` 啟用 |

## 參考

- [方法論系統 Skill](../dev-methodology/SKILL.md) - 完整 Skill 文件
- [執行時引導](../dev-methodology/runtime.md) - AI 行為規格
- [建立自訂方法論](../dev-methodology/create-methodology.md) - 自訂方法論指南

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.1.0 | 2026-01-25 | 更新以反映兩個獨立系統的架構 |
| 1.0.0 | 2026-01-12 | 初始 /methodology 命令 |
