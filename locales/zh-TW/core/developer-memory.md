---
source: ../../core/developer-memory.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-07
status: current
---

# 開發者持久記憶標準

> [English](../../core/developer-memory.md) | **繁體中文**

**版本**: 1.0.0
**最後更新**: 2026-02-07
**適用範圍**: 所有使用 AI 助手的軟體專案
**範圍**: 通用 (Universal)
**產業標準**: 無 (UDS 原創)

---

## 目的

本標準定義了一套結構化系統，用於跨對話和跨專案捕獲、檢索和浮現開發者經驗洞察（陷阱、模式、反模式、心智模型等）。它使 AI 助手能夠主動利用累積的知識，減少重複錯誤並加速問題解決。

---

## 快速參考

### 記憶條目 Schema（必填欄位）

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼（格式：`MEM-YYYY-NNNN`） |
| `insight` | string | 一句話核心洞察 |
| `category` | enum | 9 種分類之一（見 §2） |
| `confidence` | float | 0.0–1.0，根據回饋動態調整 |
| `created_at` | date | ISO 8601 日期 (YYYY-MM-DD) |

### 記憶條目 Schema（選填欄位）

| 欄位 | 類型 | 說明 |
|------|------|------|
| `context` | string | 適用的情境或環境 |
| `anti_pattern` | string | 不應該做的事（錯誤做法） |
| `resolution` | string | 如何修復或避免問題 |
| `example` | object | `{bad: string, good: string}` — 程式碼或方法範例 |
| `tags` | list | 自由搜尋標籤（如 `["async", "race-condition"]`） |
| `applicability` | object | 語言/框架範圍（見 §6） |
| `triggers` | list | 應觸發浮現此記憶的模式 |
| `related` | list | 相關記憶條目的 ID |
| `validity` | object | 生命週期中繼資料（見 §7） |

### 統計欄位（自動管理）

| 欄位 | 類型 | 說明 |
|------|------|------|
| `stats.times_surfaced` | int | 此記憶被顯示的次數 |
| `stats.times_useful` | int | 正面回饋次數 |
| `stats.times_not_useful` | int | 負面回饋次數 |
| `stats.last_surfaced` | date | 最近一次推送時間 |

### 回饋紀錄

| 欄位 | 類型 | 說明 |
|------|------|------|
| `feedback[]` | list | 回饋條目陣列 |
| `feedback[].date` | date | 回饋時間 |
| `feedback[].result` | enum | `valid` / `invalid` / `needs-revision` |
| `feedback[].note` | string | 可選的開發者備註 |

---

## 1. 記憶 Schema

### 1.1 完整 Schema 定義

```yaml
# 記憶條目 - 完整 Schema
id: "MEM-2026-0001"              # 必填：唯一 ID
insight: "..."                    # 必填：一句話核心洞察
category: pitfall                 # 必填：9 種類型之一
confidence: 0.85                  # 必填：0.0–1.0
created_at: "2026-02-07"         # 必填：ISO 日期

# 選填欄位
context: "在 Node.js 串流中使用 async iterators 時..."
anti_pattern: "在未 await 前一個結果的情況下呼叫 next()"
resolution: "始終 await 每個 next() 呼叫，或使用 for-await-of"
example:
  bad: "iterator.next(); iterator.next();"
  good: "for await (const chunk of iterator) { ... }"
tags: ["async", "streams", "node"]
applicability:
  languages: ["javascript", "typescript"]
  frameworks: []
  universal: false
  exclusions: []
triggers:
  - "async iterator"
  - "stream processing"
  - "next() called multiple times"
related: ["MEM-2026-0005"]
validity:
  type: versioned            # evergreen | versioned | temporal
  version_bound: "node >= 18"
  expires_at: null

# 自動管理
stats:
  times_surfaced: 12
  times_useful: 9
  times_not_useful: 1
  last_surfaced: "2026-02-01"
feedback:
  - date: "2026-01-15"
    result: valid
    note: "省了我 30 分鐘的除錯時間"
```

### 1.2 ID 格式

| 組成 | 格式 | 範例 |
|------|------|------|
| 前綴 | `MEM` | `MEM` |
| 年份 | `YYYY` | `2026` |
| 序號 | `NNNN` | `0001` |
| 完整 | `MEM-YYYY-NNNN` | `MEM-2026-0001` |

ID 全域唯一。序號每年重置。

---

## 2. 記憶分類

| 分類 | 說明 | 範例 |
|------|------|------|
| `pitfall` | 常見錯誤或陷阱 | 「以 0 為基礎的 API 分頁中的差一錯誤」 |
| `pattern` | 已驗證的解決方案或最佳實踐 | 「使用 Builder 模式建構複雜物件」 |
| `anti-pattern` | 已知的不良實踐 | 「處理所有業務邏輯的上帝物件」 |
| `mental-model` | 理解概念的框架 | 「將 React state 視為快照，而非變數」 |
| `workaround` | 已知問題的臨時修復 | 「為 npm 7+ 的 peer 衝突添加 `--legacy-peer-deps`」 |
| `performance` | 效能洞察或優化 | 「頻繁查詢時使用 `Map` 取代 `Object`」 |
| `debugging-strategy` | 診斷問題的方法 | 「使用 `git bisect` 二分搜尋 git 歷史」 |
| `tool-usage` | 工具/函式庫技巧 | 「使用 `npx tsc --noEmit` 進行類型檢查而不建構」 |
| `decision-rationale` | 做出特定決策的原因 | 「因交易支援而選擇 PostgreSQL 而非 MongoDB」 |

---

## 3. 四項操作

### 3.1 記錄 (Record)

#### 輸入流程

1. 開發者以自然語言描述洞察
2. AI 將其結構化為記憶 schema
3. 開發者確認或編輯結構化條目
4. 條目儲存至記憶庫

#### 30 秒規則

每個記憶條目必須回答三個問題：

| 問題 | 對應欄位 |
|------|---------|
| 具體問題是什麼？ | `insight` |
| 為什麼會發生？ | `context` + `anti_pattern` |
| 如何修復/避免？ | `resolution` |

#### 記錄層級

| 層級 | 欄位 | 使用時機 |
|------|------|---------|
| 層級 1：快速 | `insight`, `category`, `tags` | 快速筆記，稍後完善 |
| 層級 2：情境 | 層級 1 + `context`, `anti_pattern`, `resolution` | 標準記錄 |
| 層級 3：完善 | 層級 2 + `example`, `triggers`, `applicability` | 重要且頻繁使用的洞察 |

#### 去識別化

儲存前，移除專案特定細節：

| 移除 | 保留 |
|------|------|
| API 金鑰、密鑰 | 技術模式 |
| 專案名稱、內部 URL | 框架/函式庫名稱 |
| 團隊成員名稱 | 語言/版本資訊 |
| 專有業務邏輯 | 通用業務邏輯模式 |

### 3.2 查詢 (Query)

#### 搜尋方法

| 方法 | 說明 | 範例 |
|------|------|------|
| 關鍵字 | 跨 `insight`、`context`、`tags` 的自由文字搜尋 | `"async race condition"` |
| 標籤 | `tags` 欄位的精確匹配 | `tags: ["react", "hooks"]` |
| 分類 | 依分類類型篩選 | `category: pitfall` |
| 語言 | 依 `applicability.languages` 篩選 | `languages: ["python"]` |
| 信心度 | 依信心度閾值篩選 | `confidence >= 0.7` |
| 組合 | 多重篩選組合 | `category: pitfall AND tags: ["react"]` |

#### 查詢結果排序

| 優先順序 | 標準 |
|---------|------|
| 1 | 與目前情境的相關性 |
| 2 | 信心度分數（最高優先） |
| 3 | 命中率 (`times_useful / times_surfaced`) |
| 4 | 近期性 (`created_at` 最新優先) |

### 3.3 回饋 (Feedback)

#### 回饋動作

| 動作 | 對 `confidence` 的影響 | 對 `stats` 的影響 |
|------|----------------------|------------------|
| `valid` | +0.05（上限 1.0） | `times_useful += 1` |
| `invalid` | -0.15（下限 0.0） | `times_not_useful += 1` |
| `needs-revision` | -0.05（下限 0.0） | 無變更 |

#### 信心度調整規則

| 條件 | 動作 |
|------|------|
| 連續 3 次 `valid` | 額外 +0.05 |
| 連續 3 次 `invalid` | 標記待審查 |
| `confidence < 0.2` | 標記待退役 |
| `confidence > 0.9` 且使用 10+ 次 | 標記為「已驗證」 |

### 3.4 審查 (Review)

AI 掃描記憶庫並產生審查報告，涵蓋：

#### 合併建議

| 觸發條件 | 動作 |
|---------|------|
| 兩個條目語意相似度 >80% | 建議合併 |
| 相同 `tags` + 相同 `category` + 相似 `insight` | 建議合併 |
| 合併後繼承最高 `confidence` | 保留兩者回饋紀錄 |

#### 退役建議

| 觸發條件 | 動作 |
|---------|------|
| `confidence < 0.2` | 建議退役 |
| 超過 180 天未浮現且 `confidence < 0.5` | 建議退役 |
| 5+ 筆 `invalid` 回饋 | 建議退役 |

#### 過時偵測

| 觸發條件 | 動作 |
|---------|------|
| `validity.type == "versioned"` 且版本已過時 | 標記為過時 |
| `validity.type == "temporal"` 且 `expires_at` 已過 | 標記為已過期 |
| `validity.type == "evergreen"` | 跳過版本檢查 |

#### 修訂建議

| 觸發條件 | 動作 |
|---------|------|
| 2+ 筆 `needs-revision` 回饋 | 建議修訂 |
| 高 `times_surfaced` 但低 `times_useful` 比率 | 建議修訂 |

---

## 4. 主動行為協議

### 4.1 記憶浮現（主動浮現）

#### 何時浮現

| 時機 | 行為 |
|------|------|
| 對話開始 | 掃描記憶庫，顯示與所述任務最相關的前 3 個 |
| 開發過程中 | 偵測程式碼模式、錯誤訊息或技術決策是否匹配 `triggers` |
| 提交前 | 浮現與已變更檔案/模式相關的陷阱 |

#### 浮現規則

| 規則 | 值 | 理由 |
|------|---|------|
| 相關性閾值 | > 0.7 | 避免鬆散相關記憶的雜訊 |
| 冷卻期 | 每條目 7 天 | 防止重複建議 |
| 每次觸發上限 | 3–5 條 | 防止資訊過載 |
| 溢出處理 | AI 歸納為分組洞察 | 當 > 5 個匹配時 |

#### 浮現格式

```
💡 記憶匹配 [MEM-2026-0042]（信心度：0.85）
分類：pitfall | 標籤：async, promise
洞察：Promise.all 在第一個失敗時就會拒絕 — 使用 Promise.allSettled 取得部分結果
情境：處理批次 API 呼叫且可接受部分成功時
```

### 4.2 記憶萃取（主動萃取）

#### 觸發信號

AI 應偵測這些開發者信號並建議記錄：

| 信號 | 範例 |
|------|------|
| 重複修改 | 同一程式碼區塊被編輯 3+ 次 |
| 還原 | `git revert` 或手動復原 |
| 洞察語言 | 「喔！」、「我懂了」、「原來」、「終於」、「the trick is...」 |
| 長時間除錯 | 同一錯誤超過 10 分鐘 |
| 掙扎後的解決方案 | 錯誤 → 多次嘗試 → 解決 |

#### 萃取流程

```
1. AI 偵測信號
2. AI 提議：「看起來你發現了某些東西。要記錄這個洞察嗎？」
3. AI 根據對話情境預先結構化條目
4. 開發者確認/編輯/跳過
5. 若確認 → 儲存至記憶庫
```

### 4.3 記憶聚合（主動聚合）

#### 聚合觸發

| 觸發條件 | 動作 |
|---------|------|
| 3+ 個相關的 `pitfall` 條目 | 建議歸納為 `mental-model` |
| 5+ 個相同標籤的條目 | 建議建立主題摘要 |
| 關於同一概念的分散片段 | 建議整合 |

#### 升級路徑

```
多個陷阱 → 模式 → 心智模型
（片段）    （解決方案）  （理解）
```

---

## 5. 雜訊控制

### 推送層級

| 層級 | 名稱 | 行為 |
|------|------|------|
| 0 | 靜默 | 從不推送；僅回應查詢 |
| 1 | 摘要 | 顯示計數：「找到 3 個相關記憶。要查看嗎？」 |
| 2 | 主動（預設） | 顯示前 3 個及一行摘要 |
| 3 | 詳細 | 顯示完整條目，含情境和範例 |

### 雜訊降低規則

| 規則 | 說明 |
|------|------|
| 回饋驅動 | 若使用者標記 3+ 個浮現記憶為 `invalid`，降至層級 1 |
| 會話尊重 | 使用者說「現在不要」後，當前會話切換至層級 0 |
| 信心度篩選 | 僅浮現 `confidence >= 0.5` 的條目 |
| 已驗證偏好 | 優先顯示「已驗證」狀態的條目（confidence > 0.9，10+ 次使用） |

---

## 6. 跨語言適用性

### 適用性 Schema

```yaml
applicability:
  languages: ["javascript", "typescript"]  # 適用語言（空 = 通用）
  frameworks: ["react", "next.js"]          # 適用框架（空 = 任何）
  universal: false                           # true = 適用所有語言
  exclusions: ["rust"]                       # 明確不適用的語言
```

### 適用性規則

| 情境 | `universal` | `languages` | `exclusions` |
|------|-------------|-------------|--------------|
| 適用所有語言 | `true` | `[]` | `[]` |
| 特定語言 | `false` | `["python", "ruby"]` | `[]` |
| 除部分語言外全部適用 | `true` | `[]` | `["c", "assembly"]` |
| 特定框架 | `false` | `["javascript"]` | `[]` |

---

## 7. 知識生命週期

### 有效性類型

| 類型 | 說明 | 過時檢查 |
|------|------|---------|
| `evergreen` | 始終適用（如演算法洞察） | 無 |
| `versioned` | 綁定特定版本（如 API 行為） | 檢查 `version_bound` |
| `temporal` | 有時效（如 bug 的暫時修復） | 檢查 `expires_at` |

### 有效性 Schema

```yaml
validity:
  type: versioned          # evergreen | versioned | temporal
  version_bound: "react >= 18"  # 用於 versioned 類型
  expires_at: "2026-12-31"      # 用於 temporal 類型
```

### 信心度生命週期

```
新條目：confidence = 0.5（預設）
    ↓ valid 回饋
成長中：0.5 → 0.7 → 0.85
    ↓ 持續正面使用
已驗證：0.9+（經過 10+ 次浮現）
    ↓ invalid 回饋 / 過時
下降中：0.85 → 0.6 → 0.3
    ↓ 退役閾值
已退役：confidence < 0.2
```

### 退役條件

條目在以下任何條件下被標記為退役：

- `confidence < 0.2`
- 超過 180 天未浮現且 `confidence < 0.5`
- 5+ 筆 `invalid` 回饋
- `validity.type == "temporal"` 且 `expires_at` 已過
- `validity.type == "versioned"` 且版本不再使用

已退役條目被封存（非刪除）以供歷史參考。

---

## 8. 指標

### 關鍵指標

| 指標 | 公式 | 健康範圍 |
|------|------|---------|
| 命中率 | `times_useful / times_surfaced` | > 0.6 |
| 回饋率 | `(valid + invalid) / times_surfaced` | > 0.3 |
| 庫增長 | 每月新增條目 | 5–20 |
| 退役率 | 每月退役條目 | < 新增的 20% |
| 覆蓋率 | 有 5+ 條目的分類數 | 9 種分類中 6+ |

### 健康指標

| 指標 | 良好 | 警告 | 需要處理 |
|------|------|------|---------|
| 平均信心度 | > 0.6 | 0.4–0.6 | < 0.4 |
| 命中率 | > 0.6 | 0.3–0.6 | < 0.3 |
| 過時條目 | < 10% | 10–25% | > 25% |
| 孤立條目（從未浮現） | < 15% | 15–30% | > 30% |

---

## 9. 儲存格式

### 推薦：依分類 YAML

```
.memory/
├── pitfall.yaml
├── pattern.yaml
├── anti-pattern.yaml
├── mental-model.yaml
├── workaround.yaml
├── performance.yaml
├── debugging-strategy.yaml
├── tool-usage.yaml
├── decision-rationale.yaml
└── _index.yaml          # ID 登錄與交叉參考
```

#### 檔案大小建議

| 每檔條目數 | 建議 |
|-----------|------|
| < 100 | 每分類一個 YAML 檔 |
| 100–500 | 依分類內子主題分割 |
| > 500 | 考慮 JSONL 格式 |

### 替代方案：JSONL

大型記憶庫可使用每分類一個 JSONL 檔：

```
.memory/
├── pitfall.jsonl
├── pattern.jsonl
└── ...
```

每行是一個代表一個記憶條目的完整 JSON 物件。

### 索引檔 (`_index.yaml`)

```yaml
# 記憶索引
last_id: "MEM-2026-0042"
total_entries: 42
by_category:
  pitfall: 12
  pattern: 8
  anti-pattern: 5
  mental-model: 3
  workaround: 4
  performance: 3
  debugging-strategy: 2
  tool-usage: 3
  decision-rationale: 2
```

---

## 相關標準

- [反幻覺標準](anti-hallucination.md) — 證據導向分析適用於記憶來源
- [AI 指令標準](ai-instruction-standards.md) — Token 效率優化的記憶系統指令格式
- [AI 友善架構](ai-friendly-architecture.md) — 支援記憶整合的專案結構
- [文件撰寫標準](documentation-writing-standards.md) — 記憶條目的撰寫品質

---

## 10. 架構決策：Always-On Protocol

### 分類

開發者持久記憶被分類為 **Always-On Protocol**，而非使用者觸發的工作流。

| 模式 | 特性 | 範例 | 需要 Skill？ |
|------|------|------|------------|
| **使用者觸發** | 使用者明確調用、多步驟引導式工作流 | `/commit`、`/review`、`/spec` | 是 |
| **Always-On Protocol** | AI 載入 ai.yaml 後持續遵循規則 | 反幻覺、開發者記憶 | 否 |

### 理由：不需要 CLI / Skill / 斜線命令

| 元件 | 決策 | 理由 |
|------|------|------|
| CLI 命令 (`uds memory ...`) | **不需要** | 核心操作（語意匹配、洞察萃取、信心度調整）需要 LLM 智能；CLI 只能做字串匹配 |
| Skill (`skills/developer-memory/`) | **不需要** | `developer-memory.ai.yaml` 已自足，包含完整 schema + 規則 + 主動協議 |
| `/memory add`、`/memory search` | **不需要** | 與「主動行為」設計理念矛盾 — AI 應自動萃取和浮現 |
| `/memory review` | **延後** | 唯一可能有用的命令；延後至使用者回饋表明需要時 |

### 無需額外工具即可運作

```
AI 載入 developer-memory.ai.yaml
    ↓
規則自動啟動：
  - proactive-surfacing：在情境匹配時浮現相關記憶
  - proactive-extraction：偵測洞察時刻，提議記錄
  - proactive-aggregation：建議合併相關條目
  - noise-control：尊重推送層級和冷卻期
    ↓
不需要明確的使用者觸發
```

### 未來考量

如果使用者回饋揭示：
- **發現性不足**：考慮輕量級 Skill（配置偵測 + 發現性）
- **明確的審查需求**：考慮 `/memory review` 斜線命令
- **永遠不需要**：`uds memory add/search` CLI 命令 — 這些操作本質上需要 LLM

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-02-07 | 初始標準：schema、4 項操作、主動協議、雜訊控制、架構決策（Always-On Protocol） |

---

## 授權

本標準依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 發布。
