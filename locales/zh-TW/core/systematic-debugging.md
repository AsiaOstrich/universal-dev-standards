---
source: ../../../core/systematic-debugging.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 7f591022723b
status: current
---

# 系統化除錯工作流程

> **語言**: [English](../../../core/systematic-debugging.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-20
**適用性**: 所有使用 AI 輔助開發的軟體專案
**範圍**: 通用 (Universal)
**靈感來源**: [Superpowers](https://github.com/obra/superpowers) — systematic-debugging (MIT)

---

## 目的

定義結構化的四階段除錯工作流，防止常見的「猜測修復」反模式。強制要求在嘗試修復前先進行根因分析，並包含 **3-Strike Rule** 以提早發現架構問題。

---

## 術語表

| 術語 | 定義 |
|------|------|
| 根因 (Root Cause) | 缺陷存在的根本原因，而非僅僅是表徵 |
| 3-Strike Rule | 連續 3 次修復嘗試失敗後，懷疑存在架構問題 |
| 反向追蹤 (Backward Tracing) | 從錯誤表徵追溯到源頭 |
| 元件邊界 (Component Boundary) | 兩個模組或子系統之間的介面 |

---

## 核心原則 — 鐵律

> **禁止跳過根因分析直接修復。**

如果你發現自己在說「快速修復」、「試試看」或「應該可以了」— **停下來**，回到階段 1。

---

## 四個階段

### 階段 1：根因調查（Root Cause Investigation）

分析錯誤訊息並追蹤最近變更，形成初步假設。

1. **仔細閱讀錯誤訊息** — 確認失敗的確切位置與類型
2. **追蹤最近變更** — 使用 `git log`、`git diff`、`git blame` 找出變更內容
3. **在元件邊界加入診斷** — 在模組之間的介面插入日誌／中斷點
4. **記錄觀察** — 記下所見，並形成初步假設

### 階段 2：模式分析（Pattern Analysis）

比對失敗程式碼與類似的成功實作。

1. **在程式碼庫中搜尋類似的成功實作**
2. **找出差異** — 比較失敗與正常運作的程式碼
3. **檢查缺少的前置條件** — 初始化、設定、執行順序

### 階段 3：假設測試（Hypothesis Testing）

以最小、隔離的修改驗證假設。

1. **做最小可能的修改** 來測試假設
2. **每次只改一個變數** — 絕不同時進行多項修改
3. **記錄每次嘗試** — 記下假設、修改內容與結果

### 階段 4：修復實作（Fix Implementation）

確認根因後才實作修復。

1. **確認根因** 已經由假設測試驗證
2. **實作修復**，並做好適當的錯誤處理
3. **執行完整測試套件** — 確保沒有回歸
4. **驗證修復未引入新問題**

---

## 3-Strike Rule

> 連續 **3 次修復嘗試失敗** 後，停止猜測並質疑架構設計。

3-Strike Rule 觸發時：

1. 從具體的 bug 中抽身
2. 檢視整體模組／元件設計
3. 思考架構是否支援預期行為
4. 找出讓這類 bug 得以發生的設計缺陷
5. 在嘗試下一次修復前先考慮重構

---

## 規則

| ID | 觸發條件 | 動作 | 優先級 |
|----|---------|------|--------|
| SD-001 | 連續 3 次修復失敗 | 停止猜測，質疑架構設計 | Critical |
| SD-002 | 出現「快速修復」、「試試看」、「應該可以了」等措辭 | 回到階段 1 根因分析 | High |
| SD-003 | 多元件互動錯誤 | 在每個元件邊界加入診斷觀察 | Medium |

---

## 應避免的反模式

| 反模式 | 為何有害 |
|-------|---------|
| 散彈式除錯（Shotgun debugging） | 隨機修改浪費時間，且可能引入新 bug |
| 從 Stack Overflow 複製貼上修復 | 未經理解，修復可能沒有處理到真正的根因 |
| 壓制錯誤 | 隱藏表徵並不能解決問題 |
| 「在我的機器上可以跑」 | 環境差異是線索，不是推託的理由 |

---

## 範例

### 好的做法：結構化除錯

```
Phase 1: TypeError at line 42 in parser.ts — reading property of undefined
         git log shows parser.ts was modified 2 commits ago
         Added console.log at module boundary → input is null when empty array passed

Phase 2: Similar parser in legacy/ handles empty arrays with early return

Phase 3: Added early return for empty array → test passes
         Changed only one thing, recorded result

Phase 4: Implemented fix, ran full test suite (47/47 pass), no regressions
```

### 不好的做法：猜測修復

```
"Hmm, let me try adding a null check... nope.
 Maybe wrapping in try-catch... still broken.
 Let me just change the type to any... 🤦"
```

---

## 參考資料

- **Superpowers**：[systematic-debugging](https://github.com/obra/superpowers) (MIT)
- **The Pragmatic Programmer**：除錯相關章節
- **Debugging by Thinking**：A Multidisciplinary Approach（Robert Charles Metzger）
