---
source: ../../../core/retrospective-standards.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-10-11
source_hash: c2c2bb863693
status: current
---

# 回顧標準

> **語言**: [English](../../../core/retrospective-standards.md) | 繁體中文

**版本**: 1.1.0
**最後更新**: 2026-08-24
**適用範圍**: 所有實踐迭代開發的軟體團隊
**範疇**: universal
**產業標準**: Scrum Guide（Sprint 回顧）、CMMI Level 3、ISO/IEC 12207 §6.3.6
**參考資料**: [Scrum Guide](https://scrumguides.org/)、[Fun Retrospectives](https://www.funretrospectives.com/)

---

## 目的

回顧是結構化的團隊反思，識別做得好的、需要改善的，以及具體的改善行動。它們是敏捷方法論的關鍵實踐，也是過程成熟度的要求（CMMI Level 3）。

---

## 何時舉行回顧

| 類型 | 時機 | 時長 | 焦點 |
|------|------|------|------|
| **Sprint** | 每個迭代結束 | 30-60 分鐘 | 團隊流程、協作、工具 |
| **Release** | 每次發布後 | 60-90 分鐘 | 交付品質、循環指標、跨團隊協調 |

### 與事後檢討（Post-Mortem）的區別

| 面向 | 回顧 | 事後檢討（事故） |
|------|------|------------------|
| **觸發** | 計畫性（迭代／發布結束時） | 反應性（事故發生後） |
| **基調** | 以改善為焦點 | 以根因為焦點 |
| **範圍** | 整個流程 | 特定事故 |
| **頻率** | 定期（每 1-4 週） | 視需要 |

---

## 回顧工作流程

```
PREPARE ──► GATHER ──► ANALYZE ──► DECIDE ──► TRACK
  準備資料    蒐集意見    分析歸納    決定行動    追蹤落實
```

### 階段 1：PREPARE（準備）

在會議前蒐集資料，讓討論以事實為基礎。

| 資料來源 | 要蒐集什麼 |
|----------|------------|
| Git log | Commit、已合併的 PR、分支 |
| Issue 追蹤系統 | 完成的故事、發現的 Bug |
| CI/CD | 建置成功率、部署頻率 |
| 指標 | Velocity、循環時間、測試覆蓋率 |

### 階段 2：GATHER（蒐集）

使用結構化技法蒐集團隊觀點（見下文）。

**基本規則：**
- 聚焦於流程，而非人
- 不指責——找出系統性原因
- 每個人都參與
- 每個段落都要控時

### 階段 3：ANALYZE（分析）

將相似項目分組，並找出跨主題的模式。

### 階段 4：DECIDE（決定）

選出前 1-3 項要聚焦的改善。每一項都成為一個行動項目。

**行動項目格式：**

| 欄位 | 說明 |
|------|------|
| **Action** | 具體、可執行的描述 |
| **Owner** | 單一負責人 |
| **Due Date** | 目標完成日期 |
| **Status** | Open → In Progress → Done |
| **Metric** | 如何衡量成功（選填） |

### 階段 5：TRACK（追蹤）

在下一次回顧開始時檢視先前的行動項目。

---

## 引導技法

### Start-Stop-Continue（預設）

最簡單也最常見的技法。適合快速回顧。

| 類別 | 問題 |
|------|------|
| **開始做** | 我們應該開始做什麼？ |
| **停止做** | 我們應該停止做什麼？ |
| **繼續做** | 我們應該繼續做什麼？ |

### Starfish

比 Start-Stop-Continue 更細緻。適合較深入的分析。

| 類別 | 問題 |
|------|------|
| **更多** | 什麼應該做更多？ |
| **保持** | 什麼應該維持現狀？ |
| **減少** | 什麼應該做更少？ |
| **開始** | 什麼應該開始做？ |
| **停止** | 什麼應該停止？ |

### 4Ls

聚焦於情緒與學習。適合團隊建立。

| 類別 | 問題 |
|------|------|
| **喜歡** | 你享受什麼？ |
| **學到** | 你學到了什麼？ |
| **缺少** | 缺少什麼？ |
| **渴望** | 你希望有什麼？ |

### 帆船法

視覺化隱喻。適合富創意的團隊。

| 元素 | 意義 |
|------|------|
| **風** | 推動我們前進的力量（優勢） |
| **錨** | 拖住我們的力量（阻礙） |
| **礁石** | 前方的風險 |
| **島嶼** | 我們的目標／目的地 |

---

## 回顧報告範本

```markdown
# Retrospective: [Sprint N / Release vX.Y.Z]

- **Type**: [Sprint | Release]
- **Date**: YYYY-MM-DD
- **Participants**: [names]
- **Facilitator**: [name]
- **Technique**: [Start-Stop-Continue | Starfish | 4Ls | Sailboat]

## Previous Action Items Review
| # | Action | Owner | Status | Notes |
|---|--------|-------|--------|-------|
| 1 | [from last retro] | [person] | Done/Open | [update] |

## [Technique-specific sections]
(e.g., Start / Stop / Continue for SSC technique)

## Action Items
| # | Action | Owner | Due Date | Status |
|---|--------|-------|----------|--------|
| 1 | [description] | [person] | YYYY-MM-DD | Open |

## Key Learnings
- [learning 1]
- [learning 2]

## Metrics Summary (Release retrospective only)
| Metric | This Release | Previous | Trend |
|--------|-------------|----------|-------|
| Velocity | [value] | [value] | ↑/↓/→ |
| Bug Rate | [value] | [value] | ↑/↓/→ |
| Test Coverage | [%] | [%] | ↑/↓/→ |
| Cycle Time | [days] | [days] | ↑/↓/→ |
```

---

## 存放慣例

```
docs/retrospectives/
├── RETRO-2026-03-15-sprint-12.md
├── RETRO-2026-03-26-release-v5.1.0.md
└── README.md    # Index (optional)
```

### 檔案命名

- 格式：`RETRO-YYYY-MM-DD-[type]-[identifier].md`
- Sprint：`RETRO-2026-03-15-sprint-12.md`
- Release：`RETRO-2026-03-26-release-v5.1.0.md`

---

## 行動項目生命週期

```
Open ──► In Progress ──► Done
  │
  └──► Cancelled（附原因）
```

> Retrospective 記下的**延後項目**（`Action Items`、`Previous Action Items Review` 中仍為 Open 的列、附理由 Cancelled 的項目）適用 [deferred-item-exit](deferred-item-exit.md)。

### 追蹤規則

1. 在每次回顧的**開頭**檢視所有未完成的行動項目。
2. 超過 **2 個回顧循環**仍未完成的項目應重新評估（升級處理、重新定義或取消）。
3. 每次回顧最多 **3 個行動項目**。專注勝過廣度。
4. 每個行動項目必須有**單一負責人**（不能是「整個團隊」）。

---

## 反模式

| 反模式 | 問題 | 修正 |
|--------|------|------|
| 跳過回顧 | 流程債務累積 | 列為不可跳過的儀式 |
| 指責 | 人們不再參與 | 執行「討論流程不討論人」規則 |
| 沒有行動項目 | 回顧變成發洩 | 一定以 1-3 個具體行動結尾 |
| 太多行動項目 | 什麼都做不完 | 最多 3 項，無情地排優先 |
| 從不檢視過去的行動 | 行動被遺忘 | 每次回顧必先檢視先前的行動 |
| 永遠同一位引導者 | 觀點偏誤 | 輪替引導者角色 |
| 只有大聲的人發言 | 遺漏其他觀點 | 討論前先進行靜默書寫 |

---

## 最佳實踐

1. **定期舉行回顧** — 一致性建立信任和習慣。
2. **變化技法** — 同樣的格式會變得無聊；輪替使用不同技法。
3. **嚴格控時** — Sprint 最多 60 分鐘，Release 最多 90 分鐘。
4. **以數據開始** — 用指標而非感覺來引導討論。
5. **以承諾結尾** — 每次回顧產出 1-3 個行動項目。
6. **追蹤落實** — 追蹤並檢視行動；這是價值產生的地方。
7. **建立心理安全** — 回顧中說的留在回顧中。
8. **慶祝勝利** — 不要只關注問題；認可做得好的。
