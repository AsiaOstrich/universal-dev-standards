---
source: ../../../core/release-readiness-gate.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-07-23
source_hash: 622d8cb59abb
---

# 發布就緒閘門（Release Readiness Gate）

> **語言**：[English](../../../core/release-readiness-gate.md) | 繁體中文

**版本**：1.0.0
**最後更新**：2026-05-05
**適用範圍**：所有準備進行生產環境發布的軟體專案
**Scope**：universal
**業界標準**：ISO/IEC 25010（產品品質）、ISTQB Advanced Test Manager
**參考文件**：`core/release-quality-manifest.md`、`core/flow-based-testing.md`

---

## 目的

本標準定義一個**單一、彙整式的發布就緒閘門（Release Readiness Gate）**，將所有品質維度統一成生產部署前一個明確的 go/no-go 決策。

若沒有這個閘門，品質證據會散落在 16 個以上的獨立標準中。團隊雖然通過了個別檢查，卻在未驗證某些維度的情況下出貨，因為沒有任何一份文件明說「你必須在發布前通過*所有這些項目*」。

發布就緒閘門：
- **彙整（Aggregates）** 16 個品質維度成為一份分級 checklist
- **連結（Connects）** 人工 sign-off（本文件）與機器可讀的證據（`release-quality-manifest.md`）
- **區分（Distinguishes）** 阻擋性條件與建議性警告
- **可伸縮（Scales）** 透過 Tier-1 / Tier-2 / Tier-3 分級，以適應不同類型與風險等級的專案

---

## 與發布品質清單（Release Quality Manifest, RQM）的關係

| 產物 | 格式 | 對象 | 目的 |
|----------|--------|----------|---------|
| **發布就緒 Sign-off**（本文件的範本） | Markdown checklist | 人類（PM、QA、Eng Lead、Business） | Go/no-go 決策、責任歸屬、稽核軌跡 |
| **發布品質清單**（`release-quality-manifest.md`） | YAML/JSON | CI、工具、客戶 | 機器可讀的彙整、自動化閘門強制執行 |

這兩份產物在每次發布時**並行（in parallel）**產生。Sign-off 涵蓋人工驗證的維度；RQM 涵蓋自動化的維度。兩者在生產部署前都必須為 `PASS` / `WARN`（絕不可為 `FAIL`）。

---

## Tier 分級

| Tier | 要求 | 未達標 = ？ | 適用對象 |
|------|-------------|---------|-------------|
| **Tier-1** | 必須通過；若 `FAIL` 則阻擋發布 | 硬性阻擋（Hard block） | 所有專案 |
| **Tier-2** | 應通過；`WARN` 須記錄理由；不阻擋 | 記錄在案的 WARN | 所有專案 |
| **Tier-3** | 當功能集或領域需要時才適用；`N/A` 為有效狀態 | 接受 N/A | 取決於專案類型 |

---

## 16 維度發布就緒矩陣

| # | 維度 | Tier | 閘門類型 | 阻擋條件 | 證據 | 標準 | 負責人 |
|---|-----------|------|-----------|-------------------|----------|---------|-------------|
| 1 | **效能 / 負載（Performance / Load）** | 2 | 自動化 | p95 latency 退化 > 10%；headroom < 20% | 負載測試報告 | `performance-standards.md` | Eng Lead + SRE |
| 2 | **安全性（Security）**（SAST/DAST/SCA/secrets） | 1 | 自動化 | 任何 Critical/High CVE、SAST High 未修、diff 中含 secret | SARIF、Trivy、SBOM | `pipeline-security-gates.md` | SecEng / Eng Lead |
| 3 | **無障礙（Accessibility, a11y）** | 2 | 自動化 + 人工 | axe-core critical > 0；鍵盤導覽路徑中斷 | axe 報告、screen reader 紀錄 | `accessibility-standards.md` §Release-Blocking Threshold | QA + UX |
| 4 | **API / 合約測試（Contract Testing）** | 3 | 自動化 | 上游 consumer contract 為紅；N-1 相容性中斷 | Pact broker 報告 | `contract-testing-standards.md` | API owner |
| 5 | **資料庫遷移（Database Migration）** | 1 | 自動化 | up/rollback/idempotency 測試失敗；資料保存測試失敗 | `data-migration-testing.md` 閘門結果 | `data-migration-testing.md` | DB Lead |
| 6 | **跨流程回歸（Cross-flow Regression）** | 2 | 自動化 | 關鍵 user journey 通過率 < 95%；business-critical flow 組合失敗 | 跨流程回歸報告 | `cross-flow-regression.md` | QA Lead |
| 7 | **營運就緒（Operational Readiness）** | 1 | 人工 | 缺少 Runbook；alerting 未設定；無 rollback 程序 | Runbook 連結、alert rule 審查 | `runbook-standards.md`、`alerting-standards.md` | SRE / Ops |
| 8 | **在地化 / i18n（Localization）** | 2 | 自動化 | 發布中有 MISSING 或 MAJOR i18n 落差（semver 落差） | `check-translation-sync.sh` 輸出 | `translation-lifecycle-standards.md` | i18n Lead |
| 9 | **瀏覽器 / 裝置相容性（Browser / Device Compatibility）** | 3 | 自動化 | Tier-1 瀏覽器/裝置通過率 < 100% | Playwright matrix 報告 | `browser-compatibility-standards.md` | Frontend QA |
| 10 | **容量 Sign-off（Capacity Sign-off）** | 3 | 人工 | 預估尖峰時 headroom < 30%；無 Eng+SRE sign-off | 容量預測 + sign-off | `performance-standards.md` §Per-Release Capacity Sign-off | SRE + Eng Lead |
| 11 | **合規 / 隱私（Compliance / Privacy）** | 3 | 人工 | GDPR/CCPA 違規；缺少 audit log；保存政策中斷 | 隱私審查 checklist | `privacy-standards.md` | DPO / Legal |
| 12 | **文件完整性（Documentation Completeness）** | 2 | 人工 | 此次發布缺少 CHANGELOG；面向客戶的文件未更新 | CHANGELOG diff、文件審查 | `changelog-standards.md`、`documentation-lifecycle.md` | Tech Writer / PM |
| 13 | **回滾 / 災難復原（Rollback / Disaster Recovery）** | 1 | 人工 | 此次發布無經測試的 rollback 程序；RTO > 門檻 | DR 演練紀錄；rollback script | `rollback-standards.md`、`disaster-recovery-drill.md` | SRE |
| 14 | **生產 Smoke / Canary（Production Smoke / Canary）** | 1 | 自動化 | 部署後 smoke 失敗；canary error rate > SLO | Smoke 測試結果；canary 儀表板 | `smoke-test.md`、`cd-deployment-strategies.md` | SRE / DevOps |
| 15 | **Feature Flag 治理（Feature Flag Governance）** | 2 | 人工 | 預設狀態未審查；kill-switch 未測試 | Flag 稽核 checklist | `feature-flag-standards.md` | PM + Eng Lead |
| 16 | **多閘門流程驗證（Multi-Gate Flow Verification）** | 2 | 自動化 + 人工 | 任何 ≥ 3 步驟的流程缺少 Gate 0；Gate 3 CI 失敗；缺少 Gate 4 UAT sign-off | `flow_gate_report.json`；UAT sign-off 表 | `flow-based-testing.md` §Multi-Gate | QA Lead + Business |

> **關於 Tier-3 的說明**：不適用時標記為 `N/A`（例如：CLI 工具的瀏覽器 matrix；無 API consumer 的獨立服務的合約測試）。`N/A` 在 sign-off 中需附上理由註解。

---

## 發布就緒 Sign-off 範本

> 每次發布時複製此範本。在 repo 根目錄存為 `.release-readiness/<version>.md`，或附加於發布產物上。

```markdown
# Release Readiness Sign-off

**Release**: [tag/version]
**Date**: [YYYY-MM-DD]
**Environment**: Pre-Production → Production
**RQM Artifact**: [link or commit SHA]

## Tier-1 Gates (ALL must be PASS)

| # | Dimension | Status | Evidence | Sign-off |
|---|-----------|--------|----------|---------|
| 2 | Security (SAST/DAST/SCA) | PASS / FAIL | [link] | [name] |
| 5 | Database Migration | PASS / FAIL | [link] | [name] |
| 7 | Operational Readiness | PASS / FAIL | [link] | [name] |
| 13 | Rollback / DR | PASS / FAIL | [link] | [name] |
| 14 | Production Smoke/Canary | PASS / FAIL | [link] | [name] |

## Tier-2 Gates (WARN must have rationale)

| # | Dimension | Status | Evidence | Rationale (if WARN) | Sign-off |
|---|-----------|--------|----------|---------------------|---------|
| 1 | Performance / Load | PASS / WARN / FAIL | [link] | | [name] |
| 3 | Accessibility | PASS / WARN / FAIL | [link] | | [name] |
| 6 | Cross-flow Regression | PASS / WARN / FAIL | [link] | | [name] |
| 8 | Localization / i18n | PASS / WARN / FAIL | [link] | | [name] |
| 12 | Documentation | PASS / WARN / FAIL | [link] | | [name] |
| 15 | Feature Flag Governance | PASS / WARN / FAIL | [link] | | [name] |
| 16 | Multi-Gate Flow Verification | PASS / WARN / FAIL | [link] | | [name] |

## Tier-3 Gates (N/A with rationale allowed)

| # | Dimension | Status | Evidence | Rationale (if N/A) | Sign-off |
|---|-----------|--------|----------|---------------------|---------|
| 4 | API / Contract Testing | PASS / WARN / N/A | [link] | | [name] |
| 9 | Browser / Device Compat | PASS / WARN / N/A | [link] | | [name] |
| 10 | Capacity Sign-off | PASS / WARN / N/A | [link] | | [name] |
| 11 | Compliance / Privacy | PASS / WARN / N/A | [link] | | [name] |

## Overall Decision

- [ ] **GO** — All Tier-1 PASS; all WARN documented; all N/A have rationale
- [ ] **NO-GO** — One or more Tier-1 FAIL, or undocumented WARN

**Decision made by**: [name, role]
**Date**: [YYYY-MM-DD]
```

---

## 狀態語意（Status Semantics）

| 狀態 | 意義 | 對發布的影響 |
|--------|---------|----------------|
| `PASS` | 符合或超越所有條件 | 無 |
| `WARN` | 低於目標但高於硬性最低標；已記錄理由 | 允許；記錄在案 |
| `FAIL` | 低於硬性最低標；尚未解決 | **阻擋發布** |
| `N/A` | 此維度不適用於本專案/本次發布；已記錄理由 | 允許 |

---

## 何時建立 Sign-off

| 里程碑 | 動作 |
|-----------|--------|
| Release candidate 已 tag | 依範本建立 `.release-readiness/<version>.md`；填入證據連結 |
| Pre-UAT 部署 | 填入 Gate 3 CI 結果；驗證 Tier-1 自動化閘門 |
| UAT sign-off（Gate 4） | 完成 Tier-3 人工閘門；定案 Multi-Gate Flow 列 |
| 生產部署決策 | 由 release owner 簽署整體 GO/NO-GO 決策 |

Sign-off **不是**事後補做的——Gate 0（PRD 完整性）與 Gate 1（PR 層級測試）必須在 sign-off 文件建立之前很久就已滿足。Sign-off 彙整的是整個發布週期中持續蒐集的證據。

---

## 反模式（Anti-Patterns）

- **在部署當天才建立 sign-off** — 證據應在整個發布週期中漸進蒐集
- **未附理由就標記 WARN** — 沒有記錄理由的 WARN，在功能上等同於無視該閘門
- **完全略過 Tier-3 而未附 N/A 理由** — 若 web app 省略瀏覽器測試，必須明確說明理由
- **把 Sign-off 當成橡皮圖章** — 每一列都需要一位具名的 sign-off 負責人；匿名的集體所有權代表沒有真正的責任歸屬
- **多個發布共用一份 sign-off** — 每個發布 tag 一份 sign-off；不可跨版本重複使用

---

## 另請參閱（See Also）

- `release-quality-manifest.md` — 機器可讀的 RQM（本 sign-off 的自動化對應物）
- `flow-based-testing.md` — Multi-Gate Flow Model（維度 16）
- `branch-completion.md` — 分支層級閘門（前置條件；不等同於發布就緒）
- `verification-evidence.md` — 證據標準（所有證據連結都必須符合此標準）
- `deployment-standards.md` — 部署後閘門整合

---

## 版本歷史（Version History）

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.0.0 | 2026-05-05 | 首次發布：16 維度矩陣、分級 sign-off 範本、RQM 整合 |

---

## 授權（License）

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源（Source）**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
