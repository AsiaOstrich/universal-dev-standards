---
source: ../../../../skills/commands/ac-coverage.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-18
---

---
description: "[UDS] Generate AC-to-test traceability matrix and coverage report"
allowed-tools: Read, Grep, Glob
argument-hint: "[規格檔案路徑 | spec file path]"
---

# AC 覆蓋率

從規格檔案產生驗收條件（AC）與測試的追蹤矩陣及覆蓋率報告。

## 用法

```bash
/ac-coverage specs/SPEC-001.md            # 分析特定 SPEC
/ac-coverage specs/SPEC-001.md --threshold 90   # 自訂門檻
/ac-coverage specs/SPEC-001.md --test-dir tests/ # 指定測試目錄
```

## 工作流程

1. **解析 SPEC** — 讀取規格檔案，擷取所有 AC 定義（AC-1、AC-2、...）
2. **掃描測試** — 搜尋測試檔案中的 `@AC` 和 `@SPEC` 標註
3. **建立矩陣** — 將每個 AC 對應到其測試參考
4. **分類狀態** — ✅ 已覆蓋 | ⚠️ 部分覆蓋 | ❌ 未覆蓋
5. **計算覆蓋率** — `覆蓋率 % = (已覆蓋 + 部分 × 0.5) / 總數 × 100`
6. **產生報告** — 輸出標準化 Markdown 報告

## 與 `/coverage` 的區別

| | `/coverage` | `/ac-coverage` |
|-|-------------|----------------|
| **層級** | 程式碼（行/分支/函數） | 需求（AC 對測試） |
| **問題** | 「多少程式碼被測試？」 | 「哪些 AC 有測試？」 |
| **輸入** | 原始碼 + 測試執行器 | SPEC 檔案 + 測試標註 |

兩者互補 — 使用 `/coverage` 確保程式碼品質，使用 `/ac-coverage` 確保需求驗證。

## 品質門檻

| 情境 | 預設門檻 | 可配置 |
|------|----------|--------|
| **簽入** | 80% | `--threshold N` |
| **發布** | 100% | `--threshold N` |
| **警告** | 60% | `--threshold N` |

## 輸出格式

```markdown
# AC 覆蓋率報告

**規格**: SPEC-001 — 功能名稱
**產生時間**: 2026-03-18
**覆蓋率**: 75% (6/8 AC)

## 摘要

| 狀態 | 數量 | 百分比 |
|------|------|--------|
| ✅ 已覆蓋 | 5 | 62.5% |
| ⚠️ 部分覆蓋 | 2 | 25.0% |
| ❌ 未覆蓋 | 1 | 12.5% |

## 追蹤矩陣

| AC-ID | 描述 | 狀態 | 測試參考 |
|-------|------|------|----------|
| AC-1 | ... | ✅ | test-file.ts:15 |

## 缺口
- **AC-8**: 被外部依賴阻擋

## 行動項目
1. [ ] AC-8: 解決阻擋問題
```

## 下一步引導

> **AC 覆蓋率分析完成。建議下一步：**
> - 覆蓋率達標 → 執行 `/checkin` 品質關卡
> - 有未覆蓋 AC → 執行 `/derive-tdd` 補齊測試
> - 有部分覆蓋 AC → 檢查缺少的邊界情況

## 參考

- [AC 覆蓋率助手技能](../ac-coverage-assistant/SKILL.md)
- [核心規範：驗收條件追蹤](../../core/acceptance-criteria-traceability.md)
- 相關：[/coverage](./coverage.md)（程式碼層級覆蓋率）
- 相關：[/checkin](./checkin.md)（品質關卡）
