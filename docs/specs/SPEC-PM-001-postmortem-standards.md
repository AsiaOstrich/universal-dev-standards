# [SPEC-PM-001] Feature: Blameless Postmortem Standards

- **Status**: Archived
- **Created**: 2026-03-31
- **Author**: AI-assisted
- **Priority**: High (P1)
- **Scope**: universal
- **Related**: `incident-response-assistant` (擴展), SPEC-RUNBOOK-001 (銜接), SPEC-ALERT-001 (銜接)

## Overview

從現有 `incident-response-assistant` 中分離並深化 Postmortem（事後檢討）流程，建立獨立的 `core/postmortem-standards.md` 核心標準。現有 incident-response 中的 Post-Mortem 段落提供了基礎範本，本規格將其擴展為完整的 Blameless Postmortem 方法論，涵蓋觸發條件、執行流程、範本深化、Action Items 追蹤和組織學習機制。

## Motivation

### 問題陳述

1. **觸發條件不明確** — 哪些事故需要完整的 postmortem？現有標準未定義
2. **Blameless 文化缺失** — 缺乏明確的 blameless 原則定義，容易退化為指責大會
3. **範本深度不足** — 現有 incident-response 的 postmortem 範本較簡略，缺乏根因分析方法論
4. **Action Items 追蹤脫節** — Postmortem 產生的改善行動缺乏系統化追蹤直到完成
5. **組織學習未制度化** — 個別事故的學習未能轉化為組織層面的知識和標準改善

### 與現有標準的關係

| 現有標準 | 本規格的關係 |
|----------|-------------|
| `incident-response` (Post-Mortem 段落) | **擴展並獨立**：保留 incident 的流程銜接，深化 postmortem 為獨立標準 |
| `incident-response` (Improve 階段) | **強化**：將 Improve 階段的 action tracking 具體化 |
| `retrospective-standards` | **互補**：retrospective 是週期性流程改善，postmortem 是事件驅動的根因分析 |
| SPEC-RUNBOOK-001 | **銜接**：postmortem action items 可能產生新的或更新的 Runbook |
| SPEC-ALERT-001 | **銜接**：postmortem 可能改善告警規則 |

## Requirements

### REQ-1: Postmortem 觸發條件

系統 SHALL 定義哪些事故需要完整的 Postmortem，以及觸發的判斷標準。

#### Scenario: 強制觸發 Postmortem
- **GIVEN** 事故已解決
- **WHEN** 判斷是否需要 Postmortem
- **THEN** 以下條件 MUST 觸發完整 Postmortem：
  - SEV-1 事故（任何時候）
  - SEV-2 事故且持續時間 > 1 小時
  - 任何涉及資料遺失的事故
  - 任何導致 SLA 違反的事故
  - 任何涉及安全漏洞的事故

#### Scenario: 建議觸發 Postmortem
- **GIVEN** 事故嚴重度較低
- **WHEN** 判斷是否需要 Postmortem
- **THEN** 以下條件 SHOULD 觸發簡化 Postmortem：
  - SEV-2 事故且持續時間 < 1 小時
  - SEV-3 事故且重複發生（30 天內第 2 次以上相同根因）
  - 險些發生的事故（Near-miss）且影響範圍大
  - 團隊成員主動要求

#### Scenario: 免除 Postmortem
- **GIVEN** 事故已解決且嚴重度低
- **WHEN** 判斷是否需要 Postmortem
- **THEN** 以下情況可免除 Postmortem：
  - SEV-3/SEV-4 首次發生且根因明確
  - 已有同類事故的 Postmortem 且 action items 仍在追蹤中
  - 純外部因素導致（如第三方服務中斷），記錄即可

### REQ-2: Blameless 原則

系統 SHALL 定義 Blameless Postmortem 的核心原則和執行規範。

#### Scenario: 理解 Blameless 原則
- **GIVEN** 團隊首次進行 Blameless Postmortem
- **WHEN** 查閱 Blameless 原則
- **THEN** 看到以下核心信條：

| 原則 | 說明 |
|------|------|
| **人會犯錯** | 錯誤是系統的產物，不是個人的缺陷 |
| **聚焦系統** | 分析系統如何讓錯誤成為可能，而非誰犯了錯 |
| **心理安全** | 參與者可以坦誠分享，不擔心懲罰 |
| **學習導向** | 目標是學習和改善，不是追究責任 |
| **行為描述** | 使用「X 發生了」而非「某人做了 X」 |

#### Scenario: Blameless 語言指引
- **GIVEN** 撰寫 Postmortem 文件
- **WHEN** 描述事故過程
- **THEN** 遵循以下語言規範：
  - ✅ 「部署包含了未覆蓋的邊界條件」
  - ❌ 「工程師 A 部署了有 bug 的程式碼」
  - ✅ 「監控系統未能在 5 分鐘內偵測到異常」
  - ❌ 「值班人員忽略了告警」
  - ✅ 「Code Review 流程未能發現此類問題」
  - ❌ 「Reviewer 沒有仔細審查」

### REQ-3: Postmortem 執行流程

系統 SHALL 定義從事故解決到 Postmortem 完成的完整流程。

#### Scenario: Postmortem 時間線
- **GIVEN** 事故已解決
- **WHEN** 啟動 Postmortem 流程
- **THEN** 按照以下時間線執行：

| 時間點 | 活動 | 負責人 |
|--------|------|--------|
| 事故解決後 24 小時內 | 蒐集時間線和事實 | Incident Commander |
| 事故解決後 48 小時內 | 撰寫 Postmortem 草稿 | Incident Commander |
| 草稿完成後 3 個工作日內 | 舉行 Postmortem 會議 | 全體相關人員 |
| 會議後 24 小時內 | 定稿並發布 | Incident Commander |
| 定稿後持續追蹤 | Action Items 追蹤 | 各 Action Owner |

#### Scenario: Postmortem 會議引導
- **GIVEN** 團隊舉行 Postmortem 會議
- **WHEN** 按照標準流程引導
- **THEN** 會議包含以下環節（建議 60-90 分鐘）：

| 環節 | 時間 | 內容 |
|------|------|------|
| 開場 | 5 min | 重申 Blameless 原則，說明會議目的 |
| 時間線回顧 | 15 min | 逐步走過事故時間線，補充遺漏 |
| 影響評估 | 10 min | 確認影響範圍和業務損失 |
| 根因分析 | 20 min | 使用結構化方法找到根因（見 REQ-4） |
| 改善建議 | 15 min | 提出 Action Items，指定 Owner 和 Due Date |
| 總結 | 5 min | 確認關鍵學習和後續步驟 |

### REQ-4: 根因分析方法論

系統 SHALL 提供多種根因分析方法論，供團隊選擇最適合的方法。

#### Scenario: 選擇根因分析方法
- **GIVEN** 團隊需要找到事故根因
- **WHEN** 查閱根因分析方法
- **THEN** 看到以下方法及其適用場景：

| 方法 | 適用場景 | 步驟摘要 |
|------|----------|----------|
| **5 Whys** | 線性因果鏈、單一根因 | 連問「為什麼？」直到找到系統性原因 |
| **魚骨圖 (Ishikawa)** | 多因素、需分類思考 | 按人、流程、工具、環境分類分析 |
| **故障樹分析 (FTA)** | 複雜系統、多路徑故障 | 從頂層事件向下分解 AND/OR 邏輯 |
| **時間線分析** | 時序相關、多參與者 | 按時間序列排列所有事件和決策 |
| **變更分析** | 近期變更導致的問題 | 比對變更前後的差異 |

#### Scenario: 5 Whys 執行範例
- **GIVEN** 使用 5 Whys 分析事故
- **WHEN** 按照標準流程執行
- **THEN** 產生如下分析鏈：
  1. 為什麼服務中斷？→ 資料庫連線池耗盡
  2. 為什麼連線池耗盡？→ 慢查詢佔用連線不釋放
  3. 為什麼出現慢查詢？→ 新功能引入了全表掃描
  4. 為什麼 Code Review 沒發現？→ 沒有查詢效能的自動化檢查
  5. 為什麼沒有自動化檢查？→ **根因：CI/CD 缺少 SQL 效能分析步驟**

#### Scenario: 區分根因 vs 觸發因素 vs 貢獻因素
- **GIVEN** 分析事故的多個原因
- **WHEN** 分類各個原因
- **THEN** 按照以下定義分類：

| 類型 | 定義 | 範例 |
|------|------|------|
| **根因** (Root Cause) | 若移除則事故不會發生 | CI/CD 缺少 SQL 效能分析 |
| **觸發因素** (Trigger) | 直接引發事故的事件 | 新功能部署 |
| **貢獻因素** (Contributing) | 加劇影響但非根因 | 監控告警延遲 10 分鐘 |

### REQ-5: 深化的 Postmortem 範本

系統 SHALL 提供比現有 incident-response 更完整的 Postmortem 範本。

#### Scenario: 使用深化範本
- **GIVEN** Incident Commander 撰寫 Postmortem
- **WHEN** 使用深化範本
- **THEN** 範本包含以下段落：

```markdown
# Postmortem: [事故標題]

## 摘要
| 欄位 | 值 |
|------|---|
| 日期 | YYYY-MM-DD |
| 嚴重程度 | SEV-N |
| 持續時間 | Xh Ym |
| Incident Commander | @name |
| 狀態 | Draft / Final |

## 影響評估
- **受影響用戶數**: N（佔總用戶 X%）
- **受影響功能**: [功能列表]
- **營收影響**: $N（如適用）
- **SLA 影響**: 是否違反 SLA？剩餘 Error Budget？
- **資料影響**: 是否有資料遺失或損壞？

## 時間線
| 時間 (UTC) | 事件 | 偵測方式 |
|------------|------|----------|
| HH:MM | [事件描述] | 告警 / 用戶回報 / 監控 |

## 根因分析
### 方法：[5 Whys / 魚骨圖 / FTA / 其他]
[分析過程]

### 分類
- **根因**: [description]
- **觸發因素**: [description]
- **貢獻因素**: [description 1], [description 2]

## 偵測與回應評估
| 面向 | 表現 | 評分 | 改善空間 |
|------|------|------|----------|
| 偵測速度 | 告警在 X 分鐘內觸發 | ⭐⭐⭐ | [如有] |
| 回應速度 | IC 在 X 分鐘內就位 | ⭐⭐⭐ | [如有] |
| 緩解效率 | Y 分鐘內套用緩解措施 | ⭐⭐ | [如有] |
| 溝通品質 | 利害關係人在 X 分鐘內收到通知 | ⭐⭐⭐ | [如有] |

## 做得好的地方
1. [值得肯定的回應行為]
2. [有效的工具或流程]

## 需要改善的地方
1. [流程缺陷]
2. [工具不足]

## Action Items
| ID | 行動 | 類型 | Owner | Due Date | 優先級 | 狀態 |
|----|------|------|-------|----------|--------|------|
| AI-1 | [行動描述] | 預防/偵測/緩解/流程 | @name | YYYY-MM-DD | P0 | Open |

## 關聯文件
- Incident ticket: [link]
- Related postmortems: [links]
- Updated runbooks: [links]

## 審查記錄
| 日期 | 審查者 | 結果 |
|------|--------|------|
| YYYY-MM-DD | @name | Approved |
```

### REQ-6: Action Items 生命週期追蹤

系統 SHALL 定義 Postmortem Action Items 的完整生命週期追蹤機制。

#### Scenario: Action Item 分類
- **GIVEN** Postmortem 產生改善行動
- **WHEN** 分類 Action Items
- **THEN** 按照以下類型分類：

| 類型 | 說明 | 範例 |
|------|------|------|
| **預防** (Prevent) | 防止根因再次出現 | 加入 SQL 效能 CI 檢查 |
| **偵測** (Detect) | 更早發現問題 | 新增連線池使用率告警 |
| **緩解** (Mitigate) | 減少影響範圍和時間 | 實作自動 circuit breaker |
| **流程** (Process) | 改善回應流程 | 更新 on-call 交接清單 |

#### Scenario: Action Item 狀態追蹤
- **GIVEN** Action Items 已建立
- **WHEN** 追蹤執行進度
- **THEN** 使用以下狀態流轉：

```
Open ──► In Progress ──► Done ──► Verified
                │                     │
                └─► Blocked ──────────┘
```

#### Scenario: Action Item 完成率報告
- **GIVEN** 多個 Postmortem 的 Action Items
- **WHEN** 產生完成率報告
- **THEN** 報告包含：
  - 總體完成率（目標：90 天內 > 80%）
  - 按類型分組的完成率
  - 逾期 Action Items 清單
  - 平均完成天數

#### Scenario: Action Item 逾期處理
- **GIVEN** Action Item 超過 Due Date
- **WHEN** 系統偵測到逾期
- **THEN** 執行以下動作：
  - 逾期 7 天：通知 Owner
  - 逾期 14 天：通知 Owner 的主管
  - 逾期 30 天：在下次 Retrospective 中討論

### REQ-7: 組織學習機制

系統 SHALL 定義從個別 Postmortem 提煉組織學習的機制。

#### Scenario: 事故趨勢分析
- **GIVEN** 累積了多份 Postmortem
- **WHEN** 進行季度事故趨勢分析
- **THEN** 分析以下維度：
  - 按根因類型分布（程式碼缺陷、配置錯誤、容量不足、外部依賴）
  - 按服務分布（哪些服務事故最多）
  - MTTR 趨勢（是否在改善）
  - MTTD 趨勢（偵測速度是否在加快）
  - 重複根因比例（相同根因是否持續出現）

#### Scenario: 學習轉化為標準改善
- **GIVEN** 趨勢分析發現系統性問題
- **WHEN** 問題涉及開發流程或標準
- **THEN** 建議：
  - 更新相關 Core 標準（如 `checkin-standards` 加入新的檢查項）
  - 建立新的 Runbook（如 SPEC-RUNBOOK-001）
  - 修改告警規則（如 SPEC-ALERT-001）
  - 在 Retrospective 中討論流程改善

#### Scenario: Postmortem 知識庫
- **GIVEN** 團隊累積了多份 Postmortem
- **WHEN** 維護 Postmortem 知識庫
- **THEN** 知識庫包含：
  - 依時間排序的 Postmortem 索引
  - 依服務分類的索引
  - 依根因分類的索引
  - 搜尋功能（按關鍵字、服務名、時間範圍）

### REQ-8: 簡化 Postmortem（輕量版）

系統 SHALL 提供簡化版 Postmortem 範本，適用於低嚴重度或重複性事故。

#### Scenario: 使用簡化範本
- **GIVEN** SEV-3 事故重複發生
- **WHEN** 使用簡化 Postmortem 範本
- **THEN** 只需填寫：

```markdown
# 簡化 Postmortem: [事故標題]

- **日期**: YYYY-MM-DD | **嚴重程度**: SEV-N | **持續時間**: Xh Ym
- **根因**: [一句話描述]
- **修復**: [一句話描述修復方式]
- **Action Items**:
  - [ ] [行動] — @owner — YYYY-MM-DD
- **關聯**: [完整 Postmortem 連結（如有）]
```

## Acceptance Criteria

- **AC-1**: Given 事故已解決, when 判斷是否需要 Postmortem, then 有明確的強制/建議/免除三級觸發條件
- **AC-2**: Given Blameless 原則, when 查閱標準, then 有 5 個核心信條和具體的語言範例（✅/❌ 對照）
- **AC-3**: Given Postmortem 流程, when 啟動執行, then 有從事故解決到定稿的完整時間線（5 個里程碑）
- **AC-4**: Given 會議引導, when 舉行 Postmortem 會議, then 有 6 個環節的議程和時間分配
- **AC-5**: Given 根因分析, when 選擇方法, then 有至少 5 種方法及其適用場景
- **AC-6**: Given 深化範本, when 撰寫 Postmortem, then 包含摘要、影響、時間線、根因、偵測評估、好的地方、改善空間、Action Items、關聯文件、審查記錄共 10 個段落
- **AC-7**: Given Action Items, when 追蹤執行, then 有 4 種分類（預防/偵測/緩解/流程）、5 種狀態、逾期處理機制
- **AC-8**: Given 組織學習, when 進行趨勢分析, then 有 5 個分析維度和學習轉化機制
- **AC-9**: Given 低嚴重度事故, when 使用簡化範本, then 只需填寫 5 個欄位

## Technical Design

### 文件結構

```
core/
├── postmortem-standards.md           ← 新建

skills/
├── incident-response-assistant/
│   └── SKILL.md                      ← 擴展，加入 --postmortem 深化引用
```

### 章節結構（postmortem-standards.md）

```markdown
# Postmortem Standards (Blameless Post-Incident Review)

## Overview
## Trigger Conditions
  ### Mandatory
  ### Recommended
  ### Exempt
## Blameless Principles
  ### Core Beliefs
  ### Language Guidelines
  ### Psychological Safety
## Postmortem Process
  ### Timeline (Incident → Final Report)
  ### Meeting Facilitation Guide
## Root Cause Analysis Methods
  ### 5 Whys
  ### Ishikawa (Fishbone)
  ### Fault Tree Analysis (FTA)
  ### Timeline Analysis
  ### Change Analysis
  ### Root Cause vs Trigger vs Contributing Factor
## Postmortem Template
  ### Full Template
  ### Simplified Template
## Action Items Lifecycle
  ### Classification (Prevent/Detect/Mitigate/Process)
  ### Status Tracking
  ### Completion Rate Reporting
  ### Overdue Handling
## Organizational Learning
  ### Incident Trend Analysis
  ### Learning-to-Standards Pipeline
  ### Postmortem Knowledge Base
## Integration Points
  ### Incident Response Flow
  ### Runbook Updates
  ### Alert Improvements
  ### Retrospective Input
## Quick Reference Card
## References
```

### 對應 Skill

| 產出物 | 類型 |
|--------|------|
| `core/postmortem-standards.md` | Core 標準 |
| 擴展 `skills/incident-response-assistant/SKILL.md` | 現有 Skill |
| `.standards/postmortem.ai.yaml` | AI YAML |

### 與 incident-response 的分工

```
事故發生
    │
    ▼
incident-response (DETECT → TRIAGE → MITIGATE → RESOLVE)
    │
    ▼ 事故解決
    │
postmortem-standards (ANALYZE → DOCUMENT → TRACK → LEARN)
    │
    ▼ Action Items
    │
    ├── runbook-standards (更新/新增 Runbook)
    ├── alerting-standards (改善告警規則)
    └── retrospective (流程改善輸入)
```

## Test Plan

- [ ] `postmortem-standards.md` 符合 UDS core 標準格式
- [ ] 觸發條件有強制/建議/免除三級定義
- [ ] Blameless 原則有 5 個核心信條和語言範例
- [ ] 執行流程有 5 個里程碑的完整時間線
- [ ] 會議引導有 6 個環節和時間分配
- [ ] 根因分析包含至少 5 種方法
- [ ] 深化範本包含 10 個段落
- [ ] Action Items 有 4 種分類和 5 種狀態
- [ ] 組織學習有 5 個趨勢分析維度
- [ ] 簡化範本適用於低嚴重度事故
- [ ] `check-standards-sync.sh` 通過

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-03-31 | 初始草稿 |
