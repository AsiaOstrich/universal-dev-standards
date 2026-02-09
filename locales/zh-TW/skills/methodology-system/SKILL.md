---
source: ../../../../skills/methodology-system/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-10
status: current
description: |
  管理當前專案的開發方法論，支援 SDD 和雙迴圈 TDD 兩個獨立系統。
  使用時機：切換方法論、檢視當前階段、管理開發流程。
  關鍵字：methodology, SDD, TDD, BDD, ATDD, 方法論, 開發流程。
---

# 方法論系統

> **語言**: [English](../../../../skills/methodology-system/SKILL.md) | 繁體中文

> [!WARNING]
> **實驗性功能**
>
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。

管理當前專案的開發方法論，支援兩個獨立系統。

**兩個獨立系統：**
- **系統 A：SDD** - 規格驅動開發（AI 時代、規格優先）
- **系統 B：雙迴圈 TDD** - BDD（外部迴圈）+ TDD（內部迴圈）（傳統）

**可選輸入：** ATDD - 驗收測試驅動開發（可作為任一系統的輸入）

## 動作

| 動作 | 說明 |
|------|------|
| *(無)* / `status` | 顯示當前階段和檢查清單 |
| `switch <id>` | 切換到不同方法論 |
| `phase [name]` | 顯示或變更當前階段 |
| `checklist` | 顯示當前階段檢查清單 |
| `skip` | 跳過當前階段（會有警告） |
| `list` | 列出可用方法論 |
| `create` | 建立自訂方法論 |

## 可用方法論

| 系統 | ID | 工作流程 |
|------|-----|---------|
| A：SDD | `sdd` | /spec -> 審查 -> /derive-all -> 實作 |
| B：BDD | `bdd` | 探索 -> 制定 -> 自動化 |
| B：TDD | `tdd` | 紅 -> 綠 -> 重構 |
| 輸入 | `atdd` | 工作坊 -> 範例 -> 測試 |

## 使用範例

```
/methodology                    # 顯示當前狀態
/methodology switch sdd         # 切換到規格驅動開發
/methodology phase green        # 移至 GREEN 階段（TDD）
/methodology checklist          # 顯示當前階段檢查清單
/methodology list               # 列出所有可用方法論
/methodology skip               # 跳過當前階段（會有警告）
/methodology create             # 啟動自訂方法論精靈
```

## 配置

方法論設定儲存在 `.standards/manifest.json`：

```json
{
  "methodology": {
    "active": "sdd",
    "available": ["tdd", "bdd", "sdd", "atdd"]
  }
}
```

## 參考

- 詳細指南：[guide.md](./guide.md)
