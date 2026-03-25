---
source: ../../../../skills/ac-coverage-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
status: current
description: "[UDS] 分析 AC 與測試的追蹤關係及覆蓋率"
name: ac-coverage
allowed-tools: Read, Grep, Glob
scope: universal
argument-hint: "[spec file path | 規格檔案路徑]"
---

# AC 覆蓋率助手

> **語言**: [English](../../../../skills/ac-coverage-assistant/SKILL.md) | 繁體中文

分析驗收條件（AC）與測試之間的追蹤關係，並產生覆蓋率報告。

## 與 `/coverage` 的區別

| 面向 | `/coverage` | `/ac-coverage` |
|------|-------------|----------------|
| **範圍** | 程式碼層級（行/分支/函式） | 需求層級（AC 對測試） |
| **輸入** | 原始碼 + 測試執行器 | SPEC 檔案 + 測試標註 |
| **問題** | 「有多少程式碼被測試？」 | 「哪些 AC 有測試？」 |
| **輸出** | 覆蓋率百分比 | 追蹤矩陣 + 缺口報告 |

## 工作流程

1. **解析 SPEC** — 從規格檔案中擷取 AC 定義（AC-1、AC-2、...）
2. **掃描測試** — 使用標準連結慣例搜尋測試檔案中的 `@AC` 和 `@SPEC` 標註
3. **建立矩陣** — 將每個 AC 對應到其測試參考（檔案、測試名稱、行號）
4. **分類狀態** — 將每個 AC 標記為 ✅ 已覆蓋、⚠️ 部分覆蓋 或 ❌ 未覆蓋
5. **計算覆蓋率** — 套用公式：`覆蓋率 % = (已覆蓋 + 部分 × 0.5) / 總計 × 100`
6. **產生報告** — 輸出標準化 Markdown 報告

## 標註慣例

測試必須使用標準標註來參考其來源 AC：

```typescript
// TypeScript/JavaScript
describe('AC-1: 使用有效憑證登入', () => {
  // @AC AC-1
  // @SPEC SPEC-001
  it('成功登入後應重導至儀表板', () => { ... });
});
```

```python
# Python
class TestAC1_UserLogin:
    """AC-1: 使用有效憑證登入
    @AC AC-1
    @SPEC SPEC-001
    """
    def test_redirect_to_dashboard(self): ...
```

```gherkin
# BDD Feature
@SPEC-001 @AC-1
Scenario: 使用有效憑證登入
```

## 覆蓋率門檻

| 門檻 | 預設值 | 強制執行 |
|------|--------|----------|
| **提交時** | 80% | 功能分支合併必要條件 |
| **發布時** | 100% | 正式發布必要條件 |
| **警告** | 60% | 觸發覆蓋率警告 |

門檻可透過 `--threshold` 參數或專案設定進行配置。

## 報告格式

產生的報告遵循 `core/acceptance-criteria-traceability.md` 中的標準格式：

```markdown
# AC 覆蓋率報告

**規格**: SPEC-001 — 功能名稱
**產生日期**: 2026-03-24
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
| AC-1 | 使用有效憑證登入 | ✅ | auth.test.ts:15 |
| AC-2 | 拒絕無效憑證 | ✅ | auth.test.ts:32 |
| ...   | ...            | ... | ... |

## 缺口

- **AC-8**: 社群登入 — 受 OAuth 沙盒環境限制

## 待辦事項

1. [ ] AC-8: 建立 OAuth 沙盒環境（預計完成：待定）
```

## 使用方式

- `/ac-coverage` - 分析當前專案的 AC 覆蓋率
- `/ac-coverage path/to/SPEC.md` - 分析特定規格檔案的 AC 覆蓋率

## 下一步引導

`/ac-coverage` 完成後，AI 助手應建議：

> **AC 覆蓋率分析完成。建議下一步：**
> - 覆蓋率達標 → 執行 `/checkin` 通過品質關卡
> - 有未覆蓋 AC → 執行 `/derive-tdd` 補齊測試
> - 有部分覆蓋 AC → 檢查缺少的邊界情況

## 參考

- 核心規範：[acceptance-criteria-traceability.md](../../../../core/acceptance-criteria-traceability.md)
- 相關：[test-coverage-assistant](../test-coverage-assistant/SKILL.md)（程式碼層級覆蓋率）
- 相關：[checkin-assistant](../checkin-assistant/SKILL.md)（品質關卡）
