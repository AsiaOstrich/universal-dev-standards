---
name: ac-coverage
source: ../../../../skills/ac-coverage/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-05-28
scope: universal
description: "[UDS] 分析驗收條件（AC）與測試之間的追蹤關係並產生覆蓋率報告"
allowed-tools: Read, Grep, Glob
argument-hint: "[規格檔案路徑]"
---

# AC 覆蓋率助手

> **語言**: [English](../../../../skills/ac-coverage/SKILL.md) | 繁體中文

分析驗收條件（AC）與測試之間的追蹤關係，並產生覆蓋率報告。

## 與 `/coverage` 的差異

| 面向 | `/coverage` | `/ac-coverage` |
|------|-------------|----------------|
| **範圍** | 程式碼層級（行數／分支／函式） | 需求層級（AC 對應測試） |
| **輸入** | 原始碼 + 測試執行器 | SPEC 檔案 + 測試標註 |
| **問題** | 「程式碼測試了多少？」 | 「哪些 AC 有測試？」 |
| **輸出** | 覆蓋率百分比 | 追溯矩陣 + 缺口報告 |

## 工作流程

1. **解析 SPEC** — 從規格檔案抽取 AC 定義（AC-1, AC-2, ...）
2. **掃描測試** — 依標準連結慣例搜尋測試檔中的 `@AC` 與 `@SPEC` 標註
3. **建立矩陣** — 將每個 AC 對應到其測試引用（檔案、測試名稱、行號）
4. **分類狀態** — 將每個 AC 標記為 ✅ 已覆蓋、⚠️ 部分覆蓋、或 ❌ 未覆蓋
5. **計算覆蓋率** — 套用公式：`覆蓋率 % = (已覆蓋 + 部分覆蓋 × 0.5) / 總數 × 100`
6. **產生報告** — 輸出標準化的 Markdown 報告

## 連結標註慣例

測試**必須**使用標準標註引用其來源 AC：

```typescript
// TypeScript / JavaScript
describe('AC-1: 使用者以有效憑證登入', () => {
  // @AC AC-1
  // @SPEC SPEC-001
  it('登入成功後應導向儀表板', () => { ... });
});
```

```python
# Python
class TestAC1_UserLogin:
    """AC-1: 使用者以有效憑證登入
    @AC AC-1
    @SPEC SPEC-001
    """
    def test_redirect_to_dashboard(self): ...
```

```gherkin
# BDD Feature
@SPEC-001 @AC-1
Scenario: 使用者以有效憑證登入
```

## 覆蓋率門檻

| 門檻 | 預設值 | 強制等級 |
|------|--------|----------|
| **簽入（Check-in）** | 80% | feature branch 合併必要條件 |
| **發布（Release）** | 100% | 正式環境發布必要條件 |
| **警告（Warning）** | 60% | 觸發覆蓋率警告 |

門檻可透過 `--threshold` 參數或專案設定檔調整。

## 四層追溯（`--full` 模式）

使用 `--full` 標記將追溯從 2 層（AC→Test）擴展為 4 層。

### 追溯層次

```
Layer 0：需求 / 使用者故事 (REQ)
    ↓ （定義）
Layer 1：驗收條件 (AC)
    ↓ （@AC 標註）
Layer 2：測試案例
    ↓ （覆蓋）
Layer 3：原始碼 (@implements)
```

### 各層標註慣例

```typescript
// Layer 3→1：程式碼引用 AC
// @implements AC-1, AC-2
function authenticate(user: string, pass: string) { ... }
```

```markdown
<!-- Layer 0→1：SPEC 中的需求 -->
## Requirements
### REQ-1：使用者驗證
- AC-1: 給定有效憑證，當登入時，則驗證通過
- AC-2: 給定無效憑證，當登入時，則被拒絕
```

### 完整追溯報告

```markdown
## 四層追溯矩陣

| 需求 | AC | 測試 | 程式碼 | 狀態 |
|------|-----|------|--------|------|
| REQ-1 | AC-1 | auth.test.ts:15 | auth.ts:42 | ✅ 完整 |
| REQ-1 | AC-2 | auth.test.ts:30 | auth.ts:58 | ✅ 完整 |
| REQ-2 | AC-3 | — | dashboard.ts:10 | ⚠️ 缺測試 |
| REQ-3 | AC-4 | export.test.ts:5 | — | ⚠️ 缺程式碼 |

### 缺口摘要
- Layer 0→1: 2 個需求未對應 AC
- Layer 1→2: 1 個 AC 未對應測試
- Layer 2→3: 0 個測試未對應程式碼
- Layer 3→1: 3 個程式碼檔案未對應 AC
```

### 反向追溯

使用 `--trace-code <path>` 從程式碼反向追溯到需求。

```bash
/ac-coverage --trace-code src/auth.ts
# 輸出：
# src/auth.ts:42 → @implements AC-1 → REQ-1 (SPEC-AUTH-001)
# src/auth.ts:58 → @implements AC-2 → REQ-1 (SPEC-AUTH-001)
```

## 報告格式

產生的報告遵循 `core/acceptance-criteria-traceability.md` 的標準格式：

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

## 追溯矩陣

| AC-ID | 描述 | 狀態 | 測試引用 |
|-------|------|------|----------|
| AC-1 | 以有效憑證登入 | ✅ | auth.test.ts:15 |
| AC-2 | 拒絕無效憑證 | ✅ | auth.test.ts:32 |
| ...   | ...           | ... | ... |

## 缺口
- **AC-8**: 社群登入 — 因 OAuth sandbox 未就緒受阻

## 行動項目
1. [ ] AC-8：設定 OAuth sandbox（預計時程：待定）
```

## 下一步引導

`/ac-coverage` 完成後，AI 助手應建議：

> **AC 覆蓋率分析完成。建議下一步：**
> - 覆蓋率達標 → 執行 `/checkin` 品質關卡
> - 有未覆蓋 AC → 執行 `/derive-tdd` 補齊測試 ⭐ **推薦**
> - 有部分覆蓋 AC → 檢查缺少的邊界情況
> - 需要完整追溯 → 執行 `/ac-coverage --full`
> - 反向追溯 → 執行 `/ac-coverage --trace-code <path>`

## 參考

- 核心標準：[acceptance-criteria-traceability.md](../../../../core/acceptance-criteria-traceability.md)
- SPEC：[SPEC-AC-COVERAGE.md](../../../../docs/specs/skills/SPEC-AC-COVERAGE.md)
- 相關：[test-coverage-assistant](../test-coverage-assistant/SKILL.md)（程式碼層級覆蓋率）
- 相關：[checkin-assistant](../checkin-assistant/SKILL.md)（品質關卡）

## AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/ac-coverage`](../../../../skills/commands/ac-coverage.md#ai-agent-behavior--ai-代理行為)
