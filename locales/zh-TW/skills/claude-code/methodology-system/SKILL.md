# 方法論系統 Skill

> **Language**: [English](../../../../../skills/claude-code/methodology-system/SKILL.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-01-12

---

## 概述

方法論系統讓採用此規範的專案能夠選擇、配置並遵循特定的開發方法論。內建支援 TDD、BDD、SDD 和 ATDD，並可建立自訂方法論。

---

## 功能

### 核心功能

1. **方法論選擇** - 從內建方法論中選擇或建立自訂方法論
2. **階段追蹤** - 追蹤當前開發階段，提供階段特定的引導
3. **檢查點系統** - 在關鍵時刻自動提醒和驗證
4. **檢查清單** - 每個階段都有必須完成的檢查項目
5. **AI 引導** - 根據當前階段提供上下文感知的 AI 引導

### 內建方法論

| 方法論 | 說明 | 階段 |
|--------|------|------|
| **TDD** | 測試驅動開發 | 紅燈 → 綠燈 → 重構 |
| **BDD** | 行為驅動開發 | 探索 → 制定 → 自動化 → 活文件 |
| **SDD** | 規格驅動開發 | 提案 → 審查 → 實作 → 驗證 → 歸檔 |
| **ATDD** | 驗收測試驅動開發 | 工作坊 → 提煉 → 開發 → 展示 |

---

## 命令

| 命令 | 說明 |
|------|------|
| `/methodology` | 顯示當前方法論狀態 |
| `/methodology status` | 顯示當前階段和檢查清單 |
| `/methodology switch <id>` | 切換到不同方法論 |
| `/methodology phase [name]` | 顯示或變更當前階段 |
| `/methodology checklist` | 顯示當前階段檢查清單 |
| `/methodology skip` | 跳過當前階段（會有警告） |
| `/methodology list` | 列出可用方法論 |
| `/methodology create` | 建立自訂方法論 |

---

## 配置

在 `.standards/manifest.json` 中配置方法論：

```json
{
  "methodology": {
    "active": "tdd",
    "available": ["tdd", "bdd", "sdd", "atdd"],
    "config": {
      "checkpointsEnabled": true,
      "reminderIntensity": "suggest",
      "skipLimit": 3
    }
  }
}
```

### 配置選項

| 選項 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `active` | string | null | 當前啟用的方法論 ID |
| `available` | string[] | all | 可用的方法論清單 |
| `checkpointsEnabled` | boolean | true | 是否啟用檢查點提醒 |
| `reminderIntensity` | string | "suggest" | 提醒強度：suggest、warn、block |
| `skipLimit` | number | 3 | 連續跳過幾次後顯示警告 |

---

## AI 行為

當方法論啟用時，AI 會：

1. **顯示階段指示器** - 使用表情符號標示當前階段（如 🔴 RED）
2. **提供階段引導** - 根據當前階段建議適當的行動
3. **追蹤檢查清單** - 自動追蹤和更新檢查項目狀態
4. **顯示檢查點** - 在階段轉換或大量變更時提醒用戶
5. **建議提交** - 根據變更累積量建議適當的提交時機

---

## 自訂方法論

可以建立自訂方法論來符合團隊需求：

1. 使用 `/methodology create` 啟動互動式建立精靈
2. 或手動在 `.standards/methodologies/` 建立 YAML 檔案

詳見 [建立自訂方法論](create-methodology.md)。

---

## 相關文件

- [命令文檔](../commands/methodology.md) - `/methodology` 命令詳細文檔
- [執行時引導](runtime.md) - AI 行為規格
- [建立自訂方法論](create-methodology.md) - 建立指南

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-01-12 | 初始方法論系統 |
