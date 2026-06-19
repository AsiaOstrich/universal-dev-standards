---
name: sweep
source: ../../../../skills/sweep/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-05-28
scope: universal
description: |
  [UDS] 掃描程式庫的除錯殘留與程式碼品質問題；可自動修正安全模式。
  Use when: before committing, during PR review, or periodic codebase cleanup.
  Keywords: sweep, debug cleanup, console.log, debugger, TODO, ts-any, code quality, 掃描, 清理.
allowed-tools: Read, Grep, Glob, Bash(find:*), Edit, Write
argument-hint: "[--fix] [--report] [--path <dir>] [--exclude <pattern>]"
---

# 掃碼助手

> **語言**: [English](../../../../skills/sweep/SKILL.md) | 繁體中文

掃描程式庫的除錯殘留、程式碼品質問題與技術債標記。
可選擇性自動修正安全模式（console.log、debugger 等語句）。

---

## 掃描模式

| Pattern ID | 名稱 | 可自動修正 | 說明 |
|------------|------|-----------|------|
| `console-log` | console.log / console.debug / console.trace | ✅ 是 | 留在正式環境的除錯輸出 |
| `debugger` | debugger 語句 | ✅ 是 | 留在程式碼中的中斷點 |
| `todo-fixme` | TODO / FIXME / HACK / XXX | ❌ 僅回報 | 技術債標記 |
| `ts-any` | TypeScript `any` 型別 | ❌ 僅回報 | 型別安全違規 |

---

## 使用方式

```bash
/sweep                        # 掃描目前目錄，回報發現
/sweep --fix                  # 掃描並自動修正可修復項目
/sweep --report               # 掃描並將報告寫入 .uds/sweep-report.json
/sweep --path src/            # 掃描指定目錄
/sweep --exclude "**/*.test.ts"  # 排除模式（glob）
```

---

## 執行工作流程

### Step 1：搜尋檔案
使用 Glob tool 找出目標路徑下所有原始碼檔案。
預設排除：`node_modules/`、`dist/`、`.git/`、`*.min.js`、`coverage/`。

### Step 2：逐 Pattern 掃描
對每個 pattern 使用 Grep 在所有檔案中尋找比對結果。
彙整發現：`{ file, line, column, pattern_id, label, fixable, content }`。

### Step 3：回報發現
輸出結構化摘要：
```
📊 掃描結果
─────────────────────────────────────
console-log:   12 筆  （可自動修正）
debugger:       2 筆  （可自動修正）
todo-fixme:    28 筆  （僅回報）
ts-any:         5 筆  （僅回報）
─────────────────────────────────────
合計：47 筆  |  可修正：14 筆
```

### Step 4：HITL 閘門（--fix 且發現數 > 20）
若設定 `--fix` **且**可修正發現總數超過 20：
**暫停並要求使用者明確確認**才套用修正。
顯示將被修改的檔案清單。

### Step 5：套用修正（確認 --fix 後）
對每筆可修正發現：
- `console-log`：若該行僅含 console 語句則刪除該行
- `debugger`：若該行僅含 debugger 語句則刪除該行

使用 Edit tool 逐檔套用變更。
回報：「已修正 N 筆，影響 M 個檔案。」

### Step 6：儲存報告（--report）
將發現寫入 `.uds/sweep-report.json`：
```json
{
  "timestamp": "<ISO8601>",
  "total_findings": 47,
  "fixable": 14,
  "fixed": 14,
  "findings_by_pattern": { "console-log": 12, "debugger": 2, "todo-fixme": 28, "ts-any": 5 },
  "files_modified": ["src/auth.ts", "src/utils.ts"]
}
```

---

## 設定

透過 `uds.project.yaml` 設定：

```yaml
sweep:
  default_path: "src/"
  exclude_patterns:
    - "**/*.test.ts"
    - "**/*.spec.ts"
    - "**/fixtures/**"
  hitl_threshold: 20       # 可修正項目超過此值時需確認
  patterns:
    enabled:
      - console-log
      - debugger
      - todo-fixme
      - ts-any
```

---

## 下一步引導

`/sweep` 完成後建議：

> - 執行 `/checkin` 在提交前驗證整體程式碼品質
> - 執行 `/code-review` 審查清理後的變更
> - 執行 `/commit` 提交修正

---

## 相關標準

- [Checkin Standards](../../../../.standards/checkin-standards.ai.yaml) — Pre-commit 品質閘門
- [Code Review](../code-review-assistant/SKILL.md) — 程式碼審查助手
- [Testing Guide](../testing-guide/SKILL.md) — 測試標準

---

## 版本歷程

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-04-28 | 初始版本 — XSPEC-097 Phase 1（從上游遷移） |

---

## 授權

本 Skill 採用 [MIT License](https://opensource.org/licenses/MIT) 與 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 雙重授權發布。
