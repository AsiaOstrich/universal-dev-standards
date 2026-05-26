# Self-Review Protocol（自我審查協議）

> [English](../../../core/self-review-protocol.md) | **繁體中文**

**版本**: 1.0.0
**最後更新**: 2026-05-26
**適用範圍**: 所有軟體專案（新建、重構、遷移、維護）
**範圍**: partial
**業界標準**: ISO/IEC 25010（文件可維護性）、IEEE 1063-2001（軟體使用者文件）
**參考**: 受 Google Engineering Practices 程式碼審查實踐啟發；專為大型 markdown 物件編輯特化

---

## 目的

本標準規範大型 markdown 編輯**commit 前**必跑 **self-review**，捕捉內部 cross-reference 不一致 — 這類問題慣性被內部推理忽略，但完整 re-read 一次即可 surface。

**與其他標準的關係**：
- 與 [code-review.md](code-review.md) 互補（後者涵蓋程式碼變更）
- 與 [documentation-writing-standards.md](documentation-writing-standards.md) 互補（後者涵蓋內容創作）
- 本標準專注於**大型 markdown 文件**（DEC、ADR、XSPEC、SKILL.md、規格文件、runbook 等）的**編輯後驗證**

---

## 背景

多次 Claude 輔助編輯 session（如 `dev-platform/.claude/skills/eval-source/SKILL.md` v1.1.0 → v1.1.1、v1.2.0 → v1.2.1）觀察到一致模式：**每次大型 markdown 編輯都引入 3-6 處小型內部不一致**，內部推理看不出來，但完整 re-read 立刻 surface。

這些不一致歸納為 **6 大類**，且固定觸發後續 patch commit。在 commit 前加入強制 re-read 步驟後，此模式消失（eval-source v1.3.0 為首次無 patch follow-up 的 SKILL.md 變更）。

---

## 觸發條件

| 變更規模 | 是否必跑 self-review？ |
|---|---|
| commit 修改 **> 50 行** markdown | **必跑** |
| commit 修改 ≤ 50 行 markdown | 可選（小修常無 cross-ref 風險）|
| 純 code / config 變更 | 不適用（另有 lint / test / code review）|

適用文件類型：
- ADR（架構決策記錄）
- 跨專案規格（XSPEC）與 SDD Delta
- SKILL.md（Claude Code 自訂 skill）
- ARCHITECTURE.md、API.md、DEPLOYMENT.md、MIGRATION.md 等長型專案文件
- Runbook、playbook
- README.md（修改主要 section 時）

---

## 6 類常見內部不一致

### 1. Diagram / Flow 與 step list 不同步
**範例**：工作流程圖 7 格但文件實際定義 8 步驟
**檢查**：數每個 diagram 節點數量 vs `## Step N:` / `## N.` heading

### 2. Changelog 引用編號錯位
**範例**：Changelog 寫「Step 1 新增 X」但 X 實際在 Step 0
**檢查**：對每條 changelog 描述，grep 其引用的 anchor 位置

### 3. 計數錯位
**範例**：文件說「自我審計 4 題」但實際 list 有 7 題
**檢查**：grep 「N 題」「N 列」「N 點」等明確數字並對照實際 count

### 4. Stale 範本
**範例**：commit 範本寫死 `Claude Sonnet 4.6` 但實際模型隨環境變動
**檢查**：找硬編碼的模型名、工具版本、日期；改為 placeholder 或更新

### 5. 錯誤工具 / 命令引用
**範例**：建議用 `claude --version` 取得模型名，但該命令只顯示 CLI 版本
**檢查**：對每個提及的 CLI 命令做 mental check 或 `which X` / `--help` 驗證

### 6. Placeholder 與 rule 不對齊
**範例**：example 寫「D1/D2/D3」但 rule 明說 D3 不強制，且當前案例正好把 D3 降為後續追蹤
**檢查**：example 中每個具體值是否與當前 rule 一致；example 不應與最新案例經驗矛盾

---

## 流程

1. **edit 完成後、commit 前**，用 file-reading 工具重新讀過**完整檔案**（不只 diff）
2. 依上方 6 類逐項對照
3. **發現問題** → 直接 Edit 修補後再 commit（同一 commit 包含修正，不要分開 ship）
4. **若已 commit 才發現** → 新增 patch commit（如 v1.2.1 對 v1.2.0）

---

## 紀錄格式（按文件類型）

### SKILL.md
在 frontmatter 附近 changelog 追加一行：
```
> **v{X.Y.(Z+1)} Self-review pass {YYYY-MM-DD}**：找到 {N} 處 issue，{M} 處於同 commit 修正；或「0 issues found」
```

### ADR / DEC
在 `## 後續追蹤` 表格新增一行：
```
| Self-review pass | 本 DEC | ✅ YYYY-MM-DD (6 類無 issue) |
```

### XSPEC SDD Delta
在「不改動清單」section（如 §N.6）後追加：
```
> Self-review pass: YYYY-MM-DD (6 類無 issue)
```

### Commit message body
最後一行附：
```
Self-review (protocol v1.0.0): N issues found, M applied in same commit / 0 found.
```

---

## 與其他審查實踐的區別

| 實踐 | 涵蓋面向 | 觸發時機 |
|---|---|---|
| **Code Review**（[code-review.md](code-review.md)）| 程式碼正確性、設計、安全 | code PR merge 前 |
| **內容自我審計**（如 eval-source skill 7 題）| 內容完整性（是否包含所有必要 section）| 每次文件產出 |
| **Self-Review Protocol**（本標準）| 內部 cross-reference 一致性（形式，非內容）| 大型 markdown 編輯後、commit 前 |
| **同儕審查** | 獨立視角、blast radius 評估 | 重要變更 |

三層審查互補：
- **內容審計** 問：*是否包含所有必要的部分？*
- **Self-review** 問：*包含的部分內部一致嗎？*
- **同儕審查** 問：*從另一個角度看，這個變更合理嗎？*

---

## 反模式

1. **因為「diff 看起來不大」就跳過 self-review** — 大檔案的小 diff 常引入其他位置的 cross-ref 錯誤
2. **只 review diff 而非整檔** — cross-ref 錯誤可能在未變動的 section 中（引用了已變動內容）
3. **記錄 protocol 但不執行** — 紀律在於實踐，不在於文件本身
4. **把 self-review 當 peer review 的替代品** — self-review 抓不一致，不抓設計缺陷

---

## 驗證

採納本標準的驗證方式：

- **Patch commit 比例**：採納後，同一物件 `v1.X.0 → v1.X.1` 後續 patch 比例應顯著下降（eval-source 從 v1.3.0 前的 100% 降至之後的 0%）
- **Issue surface 時間**：self-review 抓到的 issue（pre-commit）vs 下一個 reader 抓到的 issue（post-commit）— 前者應上升、後者應下降

---

## 實踐案例

- **dev-platform** `eval-source` skill v1.3.0 — 首次 SKILL.md 變更在 commit 前 self-review pass（commit `6b45c5d`）；前有兩次 patch 週期（v1.1.0→v1.1.1 3 處、v1.2.0→v1.2.1 6 處）促成本標準誕生

---

## Self-Review Pass

> Self-review pass: 2026-05-26 (6 類無 issue；本標準首稿同步 self-review)
