---
source: ../../../core/runbook-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 1edd254d08d6
status: current
---

# Runbook 標準

> **語言**: [English](../../../core/runbook-standards.md) | 繁體中文

**版本**：1.0.0
**最後更新**：2026-03-31
**適用範圍**：所有具備正式環境服務的軟體專案
**範圍**：通用
**業界標準**：PagerDuty Runbook Best Practices、Google SRE
**參考資料**：[PagerDuty](https://www.pagerduty.com/)、[sre.google](https://sre.google/)

---

## 概述

本文件定義 Runbook（維運操作程序）的撰寫、組織、維護與驗證標準。Runbook 是一套有文件記錄的步驟，供操作人員遵循以診斷並解決特定問題，或執行例行維運操作。

---

## Runbook 類型

| 類型 | 用途 | 範例 | 觸發條件 |
|------|------|------|---------|
| **告警回應** | 診斷並修復特定告警 | `api-latency-high.md` | 告警觸發 |
| **標準操作** | 例行維運程序 | `database-backup-restore.md` | 排程或依需求 |
| **緊急程序** | 重大事件快速回應 | `full-service-outage.md` | SEV-1 事件 |
| **變更程序** | 計畫性變更執行步驟 | `database-migration.md` | 變更時段 |
| **故障排除指南** | 一般問題調查方法 | `memory-leak.md` | 臨時調查 |

---

## 標準範本

### 必要章節

每個 Runbook 都必須包含以下 7 個章節：

```markdown
# Runbook: [Problem Name]

## Overview
- **Alert Name**: [alert name or N/A]
- **Severity**: P1/P2/P3/P4
- **Related Services**: [service names]
- **Last Updated**: YYYY-MM-DD
- **Owner**: @owner
- **Last Drilled**: YYYY-MM-DD

## Symptoms
[What does the user see? How does the system behave?]
- [Observable symptom 1]
- [Observable symptom 2]

## Impact Assessment
- **Affected users**: [scope]
- **Business impact**: [revenue, reputation, compliance]
- **Upstream/downstream effects**: [cascading impact]

## Diagnostic Steps
1. **Check [component]**
   ```bash
   # Specific command to run
   kubectl get pods -n production | grep payment
   ```
   Expected output: [what to look for]

2. **Verify [metric]**
   Dashboard: [link]
   Normal range: [X-Y]

3. **Determine root cause**
   - If [condition A] → go to Fix Steps: Scenario A
   - If [condition B] → go to Fix Steps: Scenario B

## Fix Steps
### Scenario A: [Root Cause A]
1. [Step with specific command]
   ```bash
   kubectl rollout restart deployment/payment-service -n production
   ```
2. **Verify fix**: [how to confirm it worked]
   ```bash
   curl -s https://api.example.com/health | jq .status
   ```
   Expected: `"healthy"`
3. **Estimated time**: 2-5 minutes

### Scenario B: [Root Cause B]
1. [Alternative fix steps]

## Escalation
- If above steps don't resolve within [time]:
  - Contact: [team/person] via [channel]
  - Escalation phone: [number]
  - Backup contact: [person]

## Post-Actions
- [ ] Update this runbook if new information found
- [ ] Create postmortem if P1/P2 (see [Postmortem Standards](postmortem-standards.md))
- [ ] Notify stakeholders via [channel]
- [ ] Record incident metrics (MTTD, MTTR)
```

### 選填章節

| 章節 | 何時納入 |
|------|---------|
| **Prerequisites** | 需要特殊存取權限或工具時 |
| **Rollback Steps** | 修復步驟具有副作用時 |
| **Related Runbooks** | 問題經常同時發生時 |
| **Changelog** | 適用於頻繁更新的 Runbook |

---

## 撰寫品質指引

### 六大原則

撰寫在壓力下依然有效的 Runbook —— 當值班工程師在凌晨 3 點感到疲憊、面臨壓力時：

| 原則 | 說明 | 良好範例 | 不良範例 |
|------|------|---------|---------|
| **可重現** | 步驟具體明確，可直接複製貼上並執行 | `kubectl rollout restart deployment/payment-service -n production` | 「重啟付款服務」 |
| **明確無歧義** | 每個步驟都只有唯一一種解讀方式 | 「重啟 `production` 命名空間中的 `payment-service` Pod」 | 「重啟服務」 |
| **決策點** | 分支條件明確且具備清楚的判定標準 | 「若 CPU > 90%，執行方案 A；否則執行方案 B」 | 「若伺服器看起來負載過重……」 |
| **回滾** | 修復步驟若失敗備有後備計畫 | 「若復原失敗，執行緊急程序：full-service-outage.md」 | （未提及回滾） |
| **驗證** | 每個修復步驟都有確認成功的方法 | 「執行 `curl health-check` 並驗證 HTTP 200 回應」 | 「確認其運作正常」 |
| **時限性** | 註明預期完成時間 | 「此步驟通常耗時 2-5 分鐘」 | （無預估時間） |

### 常見反模式

| 反模式 | 問題 | 改善方式 |
|--------|------|---------|
| 「聯繫團隊」 | 哪個團隊？哪個頻道？ | 指名具體的人員與頻道 |
| 「檢查日誌」 | 哪些日誌？何處？要搜尋什麼？ | 提供精確的日誌查詢語句 |
| 「必要時擴展」 | 何時才算必要？擴展到多少？ | 定義明確的門檻值與目標 |
| 過時指令 | 指令引用了已移除的服務 | 建立定期審查週期 |

---

## 組織與存放

### 目錄結構

```
docs/runbooks/
├── README.md                          # Index and search guide
├── alerts/                            # Alert Response runbooks
│   ├── api-latency-high.md
│   ├── disk-space-low.md
│   └── database-connection-pool.md
├── operations/                        # Standard Operation runbooks
│   ├── database-backup-restore.md
│   └── secret-rotation.md
├── emergency/                         # Emergency Procedure runbooks
│   ├── full-service-outage.md
│   └── data-breach-response.md
├── changes/                           # Change Procedure runbooks
│   ├── database-migration.md
│   └── major-version-upgrade.md
└── troubleshooting/                   # Troubleshooting Guide runbooks
    ├── memory-leak.md
    └── performance-degradation.md
```

### 命名慣例

使用描述**問題**而非解決方案的 kebab-case 檔名：

- ✅ `api-latency-high.md` — 描述問題
- ✅ `disk-space-low.md` — 描述問題
- ✅ `database-connection-pool.md` — 描述問題領域
- ❌ `restart-api-server.md` — 描述的是解決方案，而非問題
- ❌ `runbook-001.md` — 無意義的流水號
- ❌ `RUNBOOK_API.md` — 錯誤的大小寫慣例

### 索引

在 runbooks 目錄中維護一份 `README.md` 索引：

```markdown
# Runbooks Index

## Alert Response
| Runbook | Severity | Services | Last Updated |
|---------|----------|----------|-------------|
| [API Latency High](alerts/api-latency-high.md) | P2 | api-gateway | 2026-03-15 |

## Emergency Procedures
| Runbook | Services | Last Updated |
|---------|----------|-------------|
| [Full Service Outage](emergency/full-service-outage.md) | all | 2026-03-01 |
```

---

## 有效性管理

### 審查週期

每種 Runbook 類型都有強制性的審查週期：

| 類型 | 審查週期 | 審查者 |
|------|-------------|----------|
| 告警回應 | 每季（每 3 個月） | 值班團隊 |
| 緊急程序 | 每月 | 工程主管 |
| 標準操作 | 每半年（每 6 個月） | 維運團隊 |
| 變更程序 | 每次使用後 | 變更執行者 |
| 故障排除指南 | 每半年（每 6 個月） | 領域專家 |

### 過期偵測

當符合以下條件時，Runbook 會被視為**過期**（stale）：
- `Last Updated` 日期超過其類型的審查週期
- Runbook 未在其演練週期內完成演練

過期的 Runbook 應（SHOULD）在索引中標記為 ⚠️ 並優先進行審查。

### 架構變更觸發條件

當發生以下任何變更時，必須（MUST）審查相關的 Runbook：

| 變更類型 | 受影響的 Runbook |
|-------------|------------------|
| 服務拆分／合併 | 所有引用該服務的 Runbook |
| 資料庫遷移 | 資料庫相關的 Runbook |
| 基礎設施變更（雲端區域、提供商） | 所有緊急 + 操作 Runbook |
| 監控／告警工具變更 | 所有告警回應 Runbook |
| 團隊重組 | 所有 Runbook 的 Escalation 章節 |

---

## 演練程序

### 排程

| 優先級 | 條件 | 演練頻率 |
|----------|-----------|-----------------|
| 最高 | P1 告警 Runbook | 每月 |
| 高 | P2 告警 Runbook | 每季 |
| 中 | 緊急程序 | 每季 |
| 低 | 其他 Runbook | 每半年 |

### 記錄

每次演練後，記錄結果：

```markdown
## Drill Record: [Runbook Name]

- **Date**: YYYY-MM-DD
- **Participants**: @name1, @name2
- **Runbook**: [link]
- **Result**: ✅ Pass / ⚠️ Partial Pass / ❌ Fail
- **Estimated Repair Time**: X minutes (per runbook)
- **Actual Repair Time**: Y minutes (during drill)
- **Issues Found**:
  - [Issue 1: description]
  - [Issue 2: description]
- **Runbook Updates Required**:
  - [ ] [Update description]
```

### 失敗處理

當演練顯示 Runbook 步驟無法執行時：

1. **立即**將 Runbook 標記為需要更新
2. 建立指派擁有者與截止日期的行動項目
3. 套用更新後重新演練
4. 在重新演練通過之前，不要將該 Runbook 視為有效

---

## 整合點

### 告警與 Runbook 連結

每個告警規則應（SHOULD）包含 `runbook_url` 註解：

```yaml
annotations:
  runbook_url: "https://wiki.example.com/runbooks/alerts/api-latency-high"
```

當告警觸發時，通知會自動包含 Runbook 連結。

### 事後檢討至 Runbook 流程

在事後檢討（參見 [Postmortem 標準](postmortem-standards.md)）之後：
- 若事件揭露既有 Runbook 中的缺口 → 更新 Runbook
- 若事件屬於新的故障模式 → 建立新的 Runbook
- 將事後檢討連結至 Runbook 的變更日誌

### 覆蓋率報告

定期產生 Runbook 覆蓋率報告：

| 告警層級 | 告警總數 | 具備 Runbook | 覆蓋率 | 目標 |
|-------------|-------------|-------------|---------|--------|
| P1/P2 | N | N | 100% | 100% |
| P3/P4 | N | N | X% | > 80% |

**沒有 Runbook 的告警**（需要採取行動）：
- `[P2] database-replication-lag` — 需要 Runbook
- `[P3] disk-io-high` — 需要 Runbook

---

## Quick Reference Card

### Runbook 檢查清單
```
□ 具有 Overview 與中繼資料（告警、嚴重度、擁有者）
□ 具有 Symptoms 章節
□ 具有 Impact Assessment
□ 具有編號的 Diagnostic Steps（含指令）
□ 具有 Fix Steps（每步驟後有驗證）
□ 具有 Escalation（含具體聯繫人）
□ 具有 Post-Actions 檢查清單
□ 使用 kebab-case 檔名（問題，非解決方案）
□ Last Updated 日期為最新
□ 已在週期內完成演練
```

---

## 參考資料

- [PagerDuty Runbook Authoring Guide](https://www.pagerduty.com/) — Runbook 撰寫的業界最佳實踐
- [Google SRE — Managing Incidents](https://sre.google/sre-book/managing-incidents/) — 事件管理背景
- [Incident.io — Runbook Best Practices](https://incident.io/) — 現代 Runbook 模式

---

**相關標準：**
- [告警標準](alerting-standards.md) — 告警設計與 Runbook 連結要求
- [Postmortem 標準](postmortem-standards.md) — 事件後審查與行動項目
- [日誌標準](logging-standards.md) — 用於診斷的結構化日誌
- [可觀測性標準](observability-standards.md) — 監控與儀表板

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | 初始發布：範本、類型、有效性、演練、整合 |

---

## 授權條款

本標準依據 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 發布。
