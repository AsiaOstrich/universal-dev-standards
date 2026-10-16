---
source: ../../../core/postmortem-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 4c7e331d2668
status: current
---

# Postmortem 標準（無責事後檢討）

> **語言**: [English](../../../core/postmortem-standards.md) | 繁體中文

**版本**：1.0.0
**最後更新**：2026-03-31
**適用範圍**：所有具備生產環境服務的軟體專案
**範疇**：universal
**業界標準**：Google SRE, Etsy Debriefing, CMMI Level 3
**參考資料**：[sre.google](https://sre.google/), [Etsy Code as Craft](https://www.etsy.com/codeascraft)

---

## 概述

本文件定義在生產環境事件後進行無責 Postmortem 的標準。Postmortem 是一個結構化流程，用於分析發生了什麼事、為什麼會發生，以及如何防止再次發生——不歸咎於個人責任。

事件回應工作流程（偵測 → 分級 → 緩解 → 解決）請參閱 [Incident Response Assistant](../skills/incident-response-assistant/SKILL.md)。

---

## 觸發條件

### 強制執行

以下條件必須（MUST）觸發完整的 Postmortem：

| 條件 | 理由 |
|------|------|
| **SEV-1 事件**（一律） | 任何完全服務中斷都需要徹底分析 |
| **SEV-2 事件持續 > 1 小時** | 延長的部分中斷指出系統性問題 |
| **任何涉及資料遺失的事件** | 資料遺失具有不可逆的後果 |
| **任何造成 SLA 違反的事件** | 違反 SLA 具有合約層面的影響 |
| **任何涉及資安漏洞的事件** | 資安事件需要詳細的鑑識分析 |

### 建議執行

以下條件應（SHOULD）觸發 Postmortem（完整版或簡化版）：

| 條件 | 理由 |
|------|------|
| SEV-2 事件持續 < 1 小時 | 短暫但重大；可能揭示系統性風險 |
| SEV-3 重複事件（30 天內發生 2 次以上且具有相同根因） | 重複發生表示存在未解決的系統性問題 |
| 具有重大潛在影響的 Near-miss | 無實際損害的學習機會 |
| 團隊成員提出要求 | 任何人都應有權提出以學習為目的的檢討要求 |

### 豁免條件

在以下情況下可（MAY）略過 Postmortem：

| 條件 | 理由 |
|------|------|
| SEV-3/SEV-4 首次發生且根因明確 | 修復簡單，學習價值低 |
| 現有 Postmortem 已涵蓋相同根因且行動項目仍在執行中 | 避免重複分析 |
| 純外部因素（第三方服務中斷）且內部無法採取任何行動 | 僅需記錄於事件日誌中 |

---

## 無責原則

### 核心信念

| 原則 | 說明 |
|------|------|
| **人會犯錯** | 犯錯是複雜系統的自然產物，而非個人缺陷 |
| **聚焦系統** | 分析系統如何允許錯誤發生，而非誰犯了錯 |
| **心理安全感** | 參與者可以公開分享，無需擔心受到懲罰 |
| **學習導向** | 目標是學習與改善，而非追究責任 |
| **行為描述** | 使用「發生了 X 事」的語言，而非「某人 Y 做了 X 事」 |

### 語言指南

撰寫 Postmortem 時應使用以系統為中心的語言：

| ✅ 正確（系統聚焦） | ❌ 錯誤（歸咎聚焦） |
|-------------------|-------------------|
| 「部署包含未涵蓋的邊界案例」 | 「工程師 A 部署了有 Bug 的程式碼」 |
| 「監控系統未在 5 分鐘內偵測到異常」 | 「值班工程師忽略了告警」 |
| 「程式碼審查流程未能發現此模式」 | 「審查者沒有仔細審查」 |
| 「Runbook 缺少針對此故障模式的步驟」 | 「維運人員不知道該怎麼做」 |
| 「測試套件未涵蓋此情境」 | 「沒有人為此撰寫測試」 |

### 心理安全感

為維護無責文化：
- 引導者在每次 Postmortem 會議開始時明確聲明無責原則
- 若出現導向指責的語言，引導者應重新導向以系統為中心的框架
- Postmortem 文件在發布前應審查是否符合無責語言原則
- 管理層承諾絕不根據 Postmortem 調查結果採取懲處行動

---

## Postmortem 流程

### 時間線（事件解決 → 最終報告）

| 里程碑 | 截止時間 | 負責人 | 活動 |
|--------|----------|--------|------|
| **收集時間線與事實** | 事件解決後 24 小時內 | 事件指揮官（Incident Commander） | 收集日誌、指標、對話紀錄、所做決策 |
| **撰寫 Postmortem 草稿** | 事件解決後 48 小時內 | 事件指揮官（Incident Commander） | 使用範本起草，包含初步根因 |
| **召開 Postmortem 會議** | 草稿完成後 3 個工作天內 | 所有相關人員 | 審視時間線、執行 RCA、議定行動項目 |
| **定稿並發布** | 會議結束後 24 小時內 | 事件指揮官（Incident Commander） | 納入會議回饋，發布至知識庫 |
| **追蹤行動項目** | 持續進行 | 各行動項目負責人 | 執行、回報進度、驗證成效 |

### 會議引導指南

建議會議時長：**60-90 分鐘**

| 環節 | 時間 | 內容 | 引導者行動 |
|------|------|------|------------|
| **開場** | 5 分鐘 | 重申無責原則；說明會議目的 | 大聲朗讀無責核心信念 |
| **審視時間線** | 15 分鐘 | 逐步檢視事件時間線 | 徵求更正與補充 |
| **影響評估** | 10 分鐘 | 確認受影響使用者、營收影響、SLO 影響 | 用數據量化，而非主觀估計 |
| **根因分析** | 20 分鐘 | 使用結構化 RCA 方法（見下文） | 引導分析，排除責備言論 |
| **改善構想** | 15 分鐘 | 提出行動項目；指派負責人與到期日 | 確保每項均符合 SMART 原則 |
| **總結** | 5 分鐘 | 確認關鍵學習成果與後續步驟 | 複誦行動項目 |

---

## 根因分析方法

### 方法選擇指南

| 方法 | 最適用於 | 步驟 |
|------|----------|------|
| **5 Whys** | 線性因果鏈、單一根因 | 反覆詢問「為什麼？」，直到找出系統性原因 |
| **Ishikawa（魚骨圖）** | 多因素問題，需要分類思考 | 依人員、流程、工具、環境分類原因 |
| **故障樹分析（FTA）** | 複雜系統、多重故障路徑 | 將頂部事件分解為 AND/OR 邏輯樹 |
| **時間線分析（Timeline Analysis）** | 與時間相依的問題、多位參與者 | 依時間先後順序排列所有事件與決策 |
| **變更分析（Change Analysis）** | 疑似由近期變更引起的原因 | 比較變更元件的前後狀態 |

### 5 Whys 範例

```
1. Why did the service go down?
   → Database connection pool exhausted

2. Why did the connection pool exhaust?
   → Slow queries holding connections

3. Why were there slow queries?
   → New feature introduced a full table scan

4. Why didn't code review catch it?
   → No automated query performance analysis in CI

5. Why no automated analysis?
   → ROOT CAUSE: CI/CD pipeline lacks SQL performance analysis step
```

### Root Cause vs Trigger vs Contributing Factor

| 類型 | 定義 | 範例 |
|------|------|------|
| **Root Cause** | 若移除，事件不會發生 | CI/CD 缺乏 SQL 效能分析 |
| **Trigger** | 直接啟動事件的事件 | 新功能部署 |
| **Contributing Factor** | 加重影響但非根因 | 監控告警延遲 10 分鐘 |

---

## Postmortem 範本

### 完整範本

```markdown
# Postmortem: [Incident Title]

## Summary
| Field | Value |
|-------|-------|
| Date | YYYY-MM-DD |
| Severity | SEV-N |
| Duration | Xh Ym |
| Incident Commander | @name |
| Status | Draft / Final |

## Impact Assessment
- **Affected users**: N (X% of total users)
- **Affected features**: [feature list]
- **Revenue impact**: $N (if applicable)
- **SLA impact**: Breached? Remaining Error Budget?
- **Data impact**: Any data loss or corruption?

## Timeline
| Time (UTC) | Event | Detection Method |
|------------|-------|-----------------|
| HH:MM | [Event description] | Alert / User report / Monitoring |

## Root Cause Analysis
### Method: [5 Whys / Ishikawa / FTA / Timeline / Change]
[Analysis process and findings]

### Classification
- **Root Cause**: [description]
- **Trigger**: [description]
- **Contributing Factors**: [description 1], [description 2]

## Detection and Response Review
| Aspect | Performance | Rating | Improvement Area |
|--------|------------|--------|-----------------|
| Detection speed | Alert fired in X min | ⭐⭐⭐ | [if any] |
| Response speed | IC assigned in X min | ⭐⭐⭐ | [if any] |
| Mitigation efficiency | Mitigation in Y min | ⭐⭐ | [if any] |
| Communication quality | Stakeholders notified in X min | ⭐⭐⭐ | [if any] |

## What Went Well
1. [Commendable response behavior]
2. [Effective tool or process]

## What Needs Improvement
1. [Process gap]
2. [Tool deficiency]

## Action Items
| ID | Action | Type | Owner | Due Date | Priority | Status |
|----|--------|------|-------|----------|----------|--------|
| AI-1 | [Description] | Prevent/Detect/Mitigate/Process | @name | YYYY-MM-DD | P0 | Open |

## Related Documents
- Incident ticket: [link]
- Related postmortems: [links]
- Updated runbooks: [links]

## Review Record
| Date | Reviewer | Result |
|------|----------|--------|
| YYYY-MM-DD | @name | Approved |
```

### 簡化範本

適用於不需要完整 Postmortem 的較低嚴重度或重複發生之事件：

```markdown
# Simplified Postmortem: [Incident Title]

- **Date**: YYYY-MM-DD | **Severity**: SEV-N | **Duration**: Xh Ym
- **Root Cause**: [One-line description]
- **Fix**: [One-line description of the fix applied]
- **Action Items**:
  - [ ] [Action] — @owner — YYYY-MM-DD
- **Related**: [Link to full postmortem if exists]
```

---

## 行動項目生命週期

### 分類（Prevent / Detect / Mitigate / Process）

| 類型 | 目的 | 範例 |
|------|------|------|
| **Prevent** | 防止根本原因再次發生 | 加入 SQL 效能 CI 檢查 |
| **Detect** | 下次能更早偵測到問題 | 加入連線池使用率告警 |
| **Mitigate** | 縮小影響範圍與縮短持續時間 | 實作自動斷路器 |
| **Process** | 改善回應流程 | 更新值班交接檢查清單 |

> **移交至技術債追蹤**：屬於長期設計／架構補救措施（而非隨著事件結束而關閉的快速修復）的 Prevent/Mitigate 行動項目，必須依據 [tech-debt-standards](tech-debt-standards.md) 註冊於技術債登記冊中，並標記 `Source = postmortem PM-<id>` — 這樣才能編列預算並加以追蹤，而不是在事件關閉後就遺失。

### 狀態追蹤

```
Open ──► In Progress ──► Done ──► Verified
               │
               └─► Blocked ──────────────►
```

| 狀態 | 說明 |
|------|------|
| **Open** | 已識別，尚未開始 |
| **In Progress** | 處理中 |
| **Done** | 修復已實作 |
| **Verified** | 已確認有效（例如：已測試、在下次事件中安然度過） |
| **Blocked** | 無法繼續推進；需要相依項目或決策 |

### 完成率報告

定期產生行動項目完成率報告：

| 指標 | 目標 |
|------|------|
| 整體完成率（90 天內） | > 80% |
| P0 行動項目於 14 天內完成 | 100% |
| 平均完成時間 | < 30 天 |
| 逾期行動項目 | 降至最低 |

### 逾期處理

| 逾期天數 | 行動 |
|---------|------|
| **7 天** | 通知行動負責人 |
| **14 天** | 通知負責人的主管 |
| **30 天** | 升級至下次回顧會議進行討論 |

---

## 組織學習

### 事件趨勢分析

每季針對以下 5 個維度進行事件趨勢分析：

| 維度 | 分析內容 | 行動 |
|------|----------|------|
| **根本原因類型分佈** | 程式碼缺陷、設定錯誤、容量、外部相依 | 投資於最常見的類別 |
| **服務分佈** | 哪些服務發生最多事件 | 優先考慮可靠性投資 |
| **MTTR 趨勢** | 平均復原時間（Mean Time To Recovery）是否有改善？ | 逐季追蹤 |
| **MTTD 趨勢** | 平均偵測時間（Mean Time To Detection）是否有改善？ | 評估監控有效性 |
| **重複根本原因比例** | 是否出現相同的根本原因？ | 檢視行動項目的有效性 |

### 學習轉化為標準的管道

當趨勢分析揭示系統性問題時：

| 發現 | 產出 |
|------|------|
| 重複出現的程式碼缺陷模式 | 更新核心標準（例如：新增 checkin-standards 檢查） |
| 遇到新的故障模式 | 建立新的 Runbook（請參閱 [Runbook Standards](runbook-standards.md)） |
| 識別出監控缺口 | 修改告警規則（請參閱 [Alerting Standards](alerting-standards.md)） |
| 識別出流程缺口 | 於下次回顧會議中討論（請參閱 [Retrospective Standards](retrospective-standards.md)） |

### Postmortem 知識庫

維護所有 postmortem 的可搜尋知識庫：

```
docs/postmortems/
├── README.md                    # Index by date, service, and root cause
├── 2026-03-15-api-outage.md
├── 2026-03-20-db-pool-exhaustion.md
└── 2026-03-28-payment-timeout.md
```

**索引應支援：**
- 按時間順序排列（最新的排在最前）
- 依服務名稱篩選
- 依根本原因類別篩選
- 依關鍵字搜尋

---

## 整合點

### 事件回應流程

```
Incident occurs
    │
    ▼
Incident Response (Detect → Triage → Mitigate → Resolve)
    │
    ▼ Incident resolved
    │
Postmortem Standards (Analyze → Document → Track → Learn)
    │
    ▼ Action Items
    │
    ├── Runbook Standards (update/create runbooks)
    ├── Alerting Standards (improve alert rules)
    └── Retrospective Standards (process improvement input)
```

### Runbook 更新

在 postmortem 之後，評估：
- 相關的 runbook 是否需要更新？ → 更新它
- 這是否是尚無 runbook 的新故障模式？ → 建立一個
- 將 postmortem 連結至 runbook 的版本歷史紀錄

### 告警改善

在 postmortem 之後，評估：
- 告警是否及時且具備可操作性？ → 若否，更新告警規則
- 嚴重度是否合適？ → 視需要調整
- 是否有遺漏的告警？ → 建立新告警

---

## Quick Reference Card

### 是否需要撰寫 Postmortem？
```
SEV-1?                    → Yes (always)
SEV-2 and > 1 hour?      → Yes
Data loss?                → Yes
SLA breach?               → Yes
Security breach?          → Yes
SEV-2 and < 1 hour?      → Recommended
SEV-3 recurring?          → Recommended (simplified)
SEV-3/4 first time?      → No (document in incident log)
```

### Postmortem 時間線
```
Incident resolved → 24h → Collect facts
                  → 48h → Write draft
                  → +3 biz days → Hold meeting
                  → +24h → Finalize & publish
                  → ongoing → Track action items
```

---

## 參考資料

- [Google SRE — Postmortem Culture](https://sre.google/sre-book/postmortem-culture/) — 無責 Postmortem 哲學
- [Google SRE — Example Postmortem](https://sre.google/sre-book/example-postmortem/) — 真實案例 Postmortem 範本
- [Etsy — Blameless PostMortems](https://www.etsy.com/codeascraft) — Etsy 的無責文化方法
- [John Allspaw — Blameless Post-Mortems](https://www.etsy.com/codeascraft/blameless-postmortems/) — 關於無責性的奠基文章

---

**相關標準：**
- [告警標準](alerting-standards.md) — 告警設計與嚴重度
- [Runbook 標準](runbook-standards.md) — Runbook 建立與維護
- [可觀測性標準](observability-standards.md) — 監控與偵測
- [回顧標準](retrospective-standards.md) — 定期流程改善

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | 初始版本：觸發條件、無責原則、RCA 方法、範本、行動項目生命週期、組織學習 |

---

## 授權條款

本標準依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。
