---
source: ../../../core/verification-evidence.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
status: current
---

# 驗證證據標準

> **語言**: [English](../../../core/verification-evidence.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-20
**適用性**: 所有 AI 輔助開發工作流
**範圍**: 通用 (Universal)
**靈感來源**: [Superpowers](https://github.com/obra/superpowers) — verification-before-completion (MIT)

---

## 目的

建立「鐵律」：無驗證證據不可聲稱完成。防止 AI 代理虛構成功結果，確保每個完成聲明都有可執行的證據支持。

---

## 術語表

| 術語 | 定義 |
|------|------|
| 驗證證據 (Verification Evidence) | 驗證指令執行及其結果的結構化記錄 |
| 鐵律 (Iron Law) | 絕對規則：無證據 = 不可聲稱完成 |
| RED-GREEN 循環 | 透過展示修復前測試失敗、修復後測試通過來證明 bug 修復 |
| Exit Code | 指令的數值回傳值（0 = 成功、非零 = 失敗） |

---

## 鐵律

> **無驗證證據 = 不可聲稱完成。**

代理聲稱「已完成」不是證據。驗證必須是可獨立執行且產生可觀察輸出的。

---

## 證據格式

每個完成聲明必須包含以下結構化證據：

```markdown
## 驗證證據

**指令**: `npm test`
**Exit Code**: 0
**摘要**: 全部 42 個測試通過
**時間戳**: 2026-03-24T10:30:00Z
```

## 證據類型

| 類型 | 適用場景 | 範例 |
|------|----------|------|
| **測試結果** | 功能開發、bug 修復 | `npm test` 輸出 |
| **建置成功** | 編譯、打包 | `npm run build` 的 exit code 0 |
| **Lint 通過** | 程式碼品質 | `npm run lint` 無錯誤 |
| **RED-GREEN** | bug 修復 | 修復前失敗 → 修復後通過 |
| **手動驗證** | UI 變更、視覺效果 | 截圖或螢幕錄影 |

## RED-GREEN 循環

修復 bug 時的驗證流程：

1. **RED** — 展示修復前測試失敗
2. **修復** — 套用修復
3. **GREEN** — 展示修復後測試通過
4. **全套** — 執行完整測試套件確認無回歸

## 禁止的完成聲明

以下聲明**不構成**驗證證據：

| 聲明 | 原因 |
|------|------|
| 「已完成」 | 無可觀察的輸出 |
| 「應該可以了」 | 未執行驗證 |
| 「我改了程式碼」 | 修改 ≠ 驗證 |
| 「測試應該會通過」 | 預測 ≠ 事實 |

## 相關標準

- [系統化除錯](systematic-debugging.md)
- [反幻覺標準](anti-hallucination.md)
- [提交規範](checkin-standards.md)
- [代理派遣與並行協調](agent-dispatch.md)
