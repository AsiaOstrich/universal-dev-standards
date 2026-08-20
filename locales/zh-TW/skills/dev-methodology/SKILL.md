---
name: methodology
source: ../../../../skills/dev-methodology/SKILL.md
source_version: 1.0.0
translation_version: 1.1.0
last_synced: 2026-08-17
scope: partial
description: |
  [UDS] 為專案選擇並追蹤當前採用的開發方法論（SDD、BDD、TDD）。
  Use when: 決定專案該遵循哪一套方法論、切換方法論、查詢目前方法論處於哪個階段。
  Not for: 查詢某個開發階段該執行哪個指令——請用 /dev-workflow；執行方法論本身——請用 /sdd、/bdd 或 /tdd。
  Keywords: methodology, SDD, BDD, TDD, phase tracking, methodology selection, 方法論, 開發方法選擇, 階段追蹤.
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[動作] [參數]"
---

# 方法論系統

> **語言**: [English](../../../../skills/dev-methodology/SKILL.md) | 繁體中文

> [!WARNING]
> **實驗性功能**
>
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。

選擇並管理當前專案啟用的開發方法論。本技能專注於**選擇使用哪種方法論**（SDD、BDD、TDD），並追蹤所選方法論內的階段進度。

> **相關**：如需查詢開發階段對應的 UDS 指令，請改用 `/dev-workflow`。

### 何時使用 `/methodology` 與 `/dev-workflow`

| 情境 | `/methodology` | `/dev-workflow` |
|------|---------------|-----------------|
| 在 SDD / BDD / TDD 之間選擇 | ✅ | ❌ |
| 切換不同方法論 | ✅ | ❌ |
| 追蹤目前階段進度 | ✅ | ❌ |
| 找出某個任務該用的 UDS 指令 | ❌ | ✅ |
| 取得新功能 / Bug 修復的逐步流程 | ❌ | ✅ |
| 巡覽 8 個開發階段 | ❌ | ✅ |

**兩個獨立系統：**
- **System A：SDD** — 規格驅動開發（AI 時代，spec-first）
- **System B：雙迴圈 TDD** — BDD（外圈）+ TDD（內圈）（傳統）

**選用輸入：** ATDD — 驗收測試驅動開發（可餵入任一系統）

## 動作

| 動作 | 說明 |
|------|------|
| *(無)* / `status` | 顯示當前階段與檢查清單 |
| `switch <id>` | 切換到不同方法論 |
| `phase [name]` | 顯示或變更當前階段 |
| `checklist` | 顯示當前階段檢查清單 |
| `skip` | 跳過當前階段（會出現警告） |
| `list` | 列出可用方法論 |
| `create` | 建立自訂方法論 |

## 可用方法論

| 系統 | ID | 工作流程 | 說明 |
|------|-----|----------|------|
| A: SDD | `sdd` | /sdd → 審查 → /derive-all → 實作 | 規格優先 |
| B: BDD | `bdd` | Discovery → Formulation → Automation | 外部迴圈 |
| B: TDD | `tdd` | Red → Green → Refactor | 內部迴圈 |
| 輸入 | `atdd` | Workshop → Examples → Tests | 驗收測試驅動 |

## 使用範例

```bash
/methodology                    # 顯示目前狀態
/methodology switch sdd         # 切換至規格驅動開發
/methodology phase green        # 移動到 GREEN 階段（TDD）
/methodology checklist          # 顯示當前階段檢查清單
/methodology list               # 列出所有可用方法論
/methodology skip               # 跳過當前階段（會出現警告）
/methodology create             # 啟動自訂方法論精靈
```

## 配置

方法論設定儲存於 `.standards/manifest.json`：

```json
{
  "methodology": {
    "active": "sdd",
    "available": ["tdd", "bdd", "sdd", "atdd"]
  }
}
```

## 下一步引導

`/methodology` 完成後，AI 助手應依所選方法論建議下一步：

> **方法論已設定。建議下一步：**
> - SDD 方法論 → 執行 `/sdd` 建立規格 ⭐ **推薦**
> - BDD 方法論 → 執行 `/bdd` 開始場景探索
> - TDD 方法論 → 執行 `/tdd` 開始紅綠重構
> - ATDD 方法論 → 執行 `/atdd` 定義驗收條件

## 參考

- 詳細指南：[guide.md](./guide.md)

## AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/methodology`](../../../../skills/commands/methodology.md#ai-agent-behavior--ai-代理行為)
