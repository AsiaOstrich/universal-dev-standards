---
source: ../../../../skills/commands/check.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Verify standards adoption status
allowed-tools: Read, Bash(uds check:*), Bash(npx:*), Bash(ls:*)
argument-hint: "[--offline | --restore | --summary]"
---

# 檢查標準

> **Language**: [English](../../../../skills/commands/check.md) | 繁體中文

驗證當前專案的 Universal Development Standards 採用狀態。

---

## 快速開始

```bash
# 基本檢查（問題時進入互動模式）
uds check

# 精簡摘要以快速瀏覽狀態
uds check --summary

# 不使用網路進行檢查
uds check --offline

# 還原遺失或被修改的檔案
uds check --restore
```

## 輸出模式

### 摘要模式 (--summary)

顯示精簡狀態供快速瀏覽：

```
UDS Status Summary
──────────────────────────────────────────────────
  Version: 3.5.1-beta.16 → 3.5.1-beta.18 ⚠
  Level: 2 - Professional (專業)
  Files: 12 ✓
  Skills: Claude Code ✓ | OpenCode ○
  Commands: OpenCode ✓
──────────────────────────────────────────────────
```

### 完整模式（預設）

顯示詳細資訊，包括：
- 採用狀態（等級、版本、安裝日期）
- 檔案完整性（未變更/已修改/遺失數量）
- Skills 完整性（如果 manifest 中有追蹤）
- Commands 完整性（如果 manifest 中有追蹤）
- 整合區塊完整性
- 參考同步狀態
- AI 工具整合檔案覆蓋率
- 覆蓋率報告

## 互動模式

當偵測到問題（修改/遺失檔案）時，CLI 自動進入互動模式：

```
──────────────────────────────────────────────────
⚠ Modified: .standards/commit-message.ai.yaml

? What would you like to do?
❯ View diff
  Restore original
  Keep current (update hash)
  Skip
```

**可用動作：**

| 動作 | 說明 |
|------|------|
| **View diff** | 顯示當前與原始版本之間的差異 |
| **Restore original** | 以上游版本取代 |
| **Keep current** | 接受修改並更新 hash |
| **Skip** | 對此檔案不做任何操作 |

遺失檔案的動作：

| 動作 | 說明 |
|------|------|
| **Restore** | 從上游下載並還原 |
| **Remove from tracking** | 從 manifest 中移除 |
| **Skip** | 對此檔案不做任何操作 |

## 選項

| 選項 | 說明 |
|------|------|
| `--summary` | 顯示精簡狀態摘要 |
| `--offline` | 跳過 npm registry 檢查 |
| `--diff` | 顯示修改檔案的差異 |
| `--restore` | 還原所有修改和遺失的檔案 |
| `--restore-missing` | 僅還原遺失的檔案 |
| `--migrate` | 遷移舊版 manifest 至 hash 追蹤 |

## 輸出區段

### 採用狀態

- 採用等級（1-3）
- 安裝日期
- 已安裝版本
- 更新可用性

### 檔案完整性

顯示每個追蹤檔案的狀態：

| 符號 | 意義 |
|------|------|
| ✓（綠色）| 未變更 |
| ⚠（黃色）| 已修改 |
| ✗（紅色）| 遺失 |
| ?（灰色）| 存在但無 hash |

摘要格式：`{unchanged} 未變更、{modified} 已修改、{missing} 遺失`

### Skills 完整性（v3.3.0+）

如果 manifest 中存在 `skillHashes`，則檢查：
- 檔案是否存在於預期路徑
- hash 比對以檢測修改

### Commands 完整性（v3.3.0+）

如果 manifest 中存在 `commandHashes`，則檢查：
- 檔案是否存在於預期路徑
- hash 比對以檢測修改

### 整合區塊完整性（v3.3.0+）

如果 manifest 中存在 `integrationBlockHashes`，則檢查：
- UDS 標記區塊是否存在
- 區塊內容 hash（使用者在區塊外的自訂修改會被保留）

### Skills 狀態

顯示每個已配置 AI 工具的安裝狀態：

```
Skills Status
  Claude Code:
    ✓ Skills installed:
      - User level: ~/.claude/skills/
        Version: 3.5.1
    ✓ Commands: 7 installed
      Path: .opencode/commands/
```

狀態指示器：
- ✓ installed（綠色）- Skills/Commands 已安裝
- ○ not installed（灰色）- 未安裝

### 覆蓋率摘要

顯示標準覆蓋率：
- 當前等級所需的標準
- 由 Skills 涵蓋的標準
- 由參考文件涵蓋的標準

## 狀態指示

| 符號 | 意義 |
|------|------|
| ✓（綠色）| 一切正常 |
| ⚠（黃色）| 警告，建議採取行動 |
| ✗（紅色）| 錯誤，需要採取行動 |
| ○（灰色）| 未安裝/配置 |

## 常見問題

**「Standards not initialized」**
- 執行 `/init` 初始化標準

**「Update available」**
- 執行 `/update` 取得最新版本

**「Missing files」**
- 執行 `/check --restore` 或 `/update` 還原

**「Modified files detected」**
- 執行 `/check --diff` 查看變更
- 執行 `/check --restore` 重置為原始版本
- 或使用互動模式逐一處理

**「Skills not installed」**
- 執行 `/update` 安裝缺少的 Skills
- 或執行 `/config skills` 管理 Skills

**「Legacy manifest detected」**
- 執行 `uds check --migrate` 升級至 hash 追蹤

## 使用方式

```bash
/check                  # 完整檢查並啟用互動模式
/check --summary        # 快速狀態概覽
/check --offline        # 不使用網路進行檢查
/check --restore        # 還原修改/遺失的檔案
/check --diff           # 顯示檔案差異
/check --migrate        # 升級 manifest 格式
```

## 參考

- CLI 文件：`uds check --help`
- 初始化命令：[/init](./init.md)
- 更新命令：[/update](./update.md)
- 配置命令：[/config](./config.md)
