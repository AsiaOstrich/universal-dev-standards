---
source: ../../../core/agent-behavior-discipline.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: cba231b5622f
status: current
---

# Agent 行為紀律

> **Language**: [English](../../../core/agent-behavior-discipline.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-04-24
**適用範圍**: 所有使用符合 UDS 規範 harness 的 AI agent 實作
**Scope**: universal
**產業標準**: 參考 Karpathy 2026-01 觀察 + andrej-karpathy-skills（MIT）

---

## 目的

本標準定義 AI agent 的四項行為紀律，將表現從「能用」提升到「卓越」。這些紀律針對正式環境 LLM 程式碼 agent 最常見的失敗模式：

1. **在錯誤假設上執行** — agent 未確認方向就繼續進行
2. **過度設計** — 50 行就夠卻寫了 200 行
3. **範圍蔓延** — agent「好心」修改了無關的程式碼
4. **無目標迴圈** — agent 在沒有明確停止條件的情況下不斷迭代

這些紀律設計上可與既有 UDS 標準（`anti-hallucination`、`anti-sycophancy-prompting`、`test-driven-development`）疊加使用，並可在 harness 層級強制執行（例如由採用層實作的 `DisciplineConfig` 形狀）。

---

## 原則 1：Ask — 執行前先揭露假設

### 規則

在任何非瑣碎任務之前，明確陳述所有假設並等待確認。

### 適用時機

| 條件 | 動作 |
|-----------|--------|
| 需求模糊或存在多種有效解讀 | 使用揭露格式（見下方） |
| 信心分數 < 0.7 | 暫停並詢問 |
| 架構變更或多檔案修改 | 一律揭露 |
| 單一檔案的瑣碎變更（信心 ≥ 0.9、< 5 行） | 可略過確認 |

### 揭露格式

```
My assumptions: [explicit list]
Approach considered: [A] vs [B] — choosing A because [reason]
If my understanding is incorrect, please redirect before I proceed.
```

### 為什麼重要

Karpathy 觀察到：*「模型會做出錯誤假設、不尋求澄清，而且有點過於諂媚。」* 走錯方向所耗費的修正 token，遠多於事前 3 秒鐘的確認。

---

## 原則 2：Simple — 最少程式碼，不做臆測性設計

### 規則

以所需的最少程式碼解決問題。絕不加入未被要求的功能。

### 三振規則（DRY 門檻）

只有當完全相同的邏輯出現 **3 次以上**才進行抽象。只用一次的 helper 永遠是過早抽象。

### DO / DO NOT

| DO | DO NOT |
|----|--------|
| ✅ 只寫任務需要的程式碼 | ❌ 加入「以後可能用得到」的功能 |
| ✅ 存在明顯更短的解法時就改寫 | ❌ 建立只用一次的抽象 |
| ✅ 將只使用一次的邏輯 inline | ❌ 加入臆測性的設定掛鉤 |
| ✅ 跳過不可能發生情境的錯誤處理 | ❌ 為內部不變量加入防禦性程式碼 |

### 為什麼重要

Karpathy 觀察到：*「它會實作 1000 行臃腫的程式碼，被質疑時又立刻砍到 100 行。」* 如果 50 行就能做到，一開始就該是 50 行。

---

## 原則 3：Precision — 只碰任務需要的部分

### 規則

將修改範圍限定在宣告的最小檔案與行數集合內。只清理你自己造成的混亂。

### 範圍宣告格式

任何編輯前，先輸出：
```
Modifying: [file list]
Not touching: [related but out-of-scope areas]
Out-of-scope observation (action deferred): [optional — verbal only, no edit]
```

### DO / DO NOT

| DO | DO NOT |
|----|--------|
| ✅ 配合既有的區域程式碼風格 | ❌ 「順手」改善無關的程式碼 |
| ✅ 以口頭標記既存問題 | ❌ 移除不是你產生的死程式碼 |
| ✅ 只移除因「你的」變更而孤立的 import | ❌ 重新命名不在你任務範圍內的符號 |
| ✅ 開始前先宣告範圍 | ❌ 依個人偏好格式化無關的程式碼 |

### 為什麼重要

Karpathy 觀察到有些 agent 會*「修改它不理解的程式碼，然後東西就壞了」*。精準性可避免無法追溯的副作用，並讓 diff 保持可審查。

---

## 原則 4：Test — 定義成功準則，迴圈直到驗證通過

### 規則

在實作前，將每個任務轉化為可量測、可驗證的成功準則。

### TDD 流程

```
Define success criterion → Write failing test (Red) → Implement (Green) → Refactor → Verify
```

### 模糊準則升級

若任務使用主觀語言（「讓它更好」、「改善搜尋品質」）：
> 「這裡用哪個具體指標或可觀察的結果來定義成功？」

絕不在主觀停止條件下繼續進行。

### 自主迴圈協定

| 參數 | 值 |
|-----------|-------|
| max_retries | 5（預設；可透過 DisciplineConfig 設定） |
| 每次迭代記錄 | 記錄 `failureSource`（見 failure-source-taxonomy） |
| 卡住時（相同錯誤指紋） | 附上 failureSource 摘要升級給人類 |

### 為什麼重要

Karpathy 最強的原則：*「LLM 擅長朝特定目標迴圈逼近 —— 提供成功準則而非指令。」* 沒有可驗證的目標，自主 agent 迴圈就沒有自然的停止點。

---

## 與其他 UDS 標準的整合

| 標準 | 關係 |
|----------|-------------|
| `anti-hallucination` | Ask 原則：不確定時揭露而非猜測 |
| `anti-sycophancy-prompting` | Ask 原則：不臆斷，必要時提出異議 |
| `test-driven-development` | Test 原則：TDD 是其操作層面的實作 |
| `change-batching-standards` | Precision 原則：範圍限制強化批次處理邏輯 |
| `failure-source-taxonomy` | Test 原則：迴圈協定使用 failureSource 分類法 |
| `recovery-recipe-registry` | Test 原則：max_retries 對應到 recovery recipe 升級 |

---

## Harness 層級的強制執行（採用層）

harness 層級 `DisciplineConfig` 的參考形狀（實際型別位於你的採用層原始碼中）：

```typescript
interface DisciplineConfig {
  ask_threshold: number;           // Confidence below this triggers Ask disclosure (default: 0.6)
  max_loop_retries: number;        // Autonomous loop ceiling (default: 5)
  precision_scope: 'strict' | 'relaxed'; // strict = always declare scope
}
```

harness 的 orchestrator（例如 `assumptionCheckGate()` 函式）應在派工給 agent 之前，依 `ask_threshold` 評估任務複雜度。

---

## 檢查清單

- [ ] 執行開始前已陳述假設
- [ ] 程式碼以所需的最少行數解決問題
- [ ] 只修改了宣告範圍內的檔案
- [ ] 成功準則可量化且已驗證
- [ ] 自主迴圈已定義 `max_retries` 與升級路徑
