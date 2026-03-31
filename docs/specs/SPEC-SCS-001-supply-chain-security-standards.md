# [SPEC-SCS-001] Feature: Supply Chain Security Standards

- **Status**: Draft
- **Created**: 2026-03-31
- **Author**: AI-assisted
- **Priority**: Critical (P0)
- **Scope**: universal
- **Related**: `core/security-standards.md`, `core/deployment-standards.md`

## Overview

定義軟體供應鏈安全標準，涵蓋 SBOM 格式、依賴審計、SLSA 等級、License 合規、依賴更新策略、CI/CD 整合及依賴健康評估，確保專案依賴的安全性、合規性與可維護性。

## Motivation

### 問題陳述

1. **SBOM 無標準** — 多數專案缺乏 Software Bill of Materials，無法追蹤依賴組成，供應鏈攻擊風險高
2. **依賴審計缺乏系統性** — 依賴漏洞、授權合規、維護狀態、版本過時等檢查維度未統一定義
3. **SLSA 等級未對齊** — 團隊對軟體供應鏈安全成熟度無共識，缺乏逐步改善路線圖
4. **License 相容性判斷困難** — Permissive/Copyleft/AGPL 的相容性規則未標準化，導致法律風險
5. **依賴更新策略不一致** — patch/minor/major 的更新策略無統一指引，造成安全漏洞暴露時間過長或升級頻繁導致不穩定
6. **CI/CD 缺乏供應鏈安全 Gate** — 依賴掃描未整合至 pipeline，Critical 漏洞可能進入生產環境
7. **依賴健康缺乏量化指標** — 引入新依賴時無系統性評估機制

### 與現有標準的關係

| 現有標準 | 本規格的關係 |
|----------|-------------|
| `security-standards` | **擴展**：在安全標準的基礎上聚焦供應鏈安全 |
| `deployment-standards` | **銜接**：部署前的依賴安全驗證 |
| `pipeline-integration-standards` | **整合**：CI/CD pipeline 中的安全 gate |

## Requirements

### REQ-1: SBOM 格式定義

系統 SHALL 提供 SBOM（Software Bill of Materials）的格式選型指引，比較 SPDX 和 CycloneDX 兩種主流格式。

#### Scenario: 選擇 SBOM 格式
- **GIVEN** 團隊需要建立 SBOM
- **WHEN** 團隊查閱 SBOM 格式指引
- **THEN** 能比較 SPDX 和 CycloneDX 的特性差異，並根據場景選擇適合的格式

#### Scenario: SBOM 必要欄位
- **GIVEN** 團隊選定 SBOM 格式
- **WHEN** 團隊建立 SBOM 文件
- **THEN** SBOM 包含套件名稱、版本、供應商、License、相依關係等必要欄位

### REQ-2: 依賴審計 4 個檢查維度

系統 SHALL 定義依賴審計的四個檢查維度：已知漏洞、授權合規、維護狀態、版本過時。

#### Scenario: 已知漏洞檢查
- **GIVEN** 專案有第三方依賴
- **WHEN** 執行依賴審計
- **THEN** 檢查所有依賴是否有已知 CVE 漏洞，並按嚴重程度分類（Critical/High/Medium/Low）

#### Scenario: 授權合規檢查
- **GIVEN** 專案引入新依賴
- **WHEN** 執行授權合規檢查
- **THEN** 驗證依賴的 License 與專案 License 相容

#### Scenario: 維護狀態檢查
- **GIVEN** 專案依賴某套件
- **WHEN** 評估維護狀態
- **THEN** 檢查最後更新日期、維護者數、是否已被標記為 deprecated

#### Scenario: 版本過時檢查
- **GIVEN** 專案使用特定版本的依賴
- **WHEN** 檢查版本過時程度
- **THEN** 識別與最新版本的差距，標記超過閾值的過時依賴

### REQ-3: SLSA 4 個等級定義

系統 SHALL 定義 SLSA（Supply-chain Levels for Software Artifacts）的 L1-L4 等級，各含要求和適用場景。

#### Scenario: 團隊自評 SLSA 等級
- **GIVEN** 團隊想了解自身供應鏈安全的現狀
- **WHEN** 團隊對照 SLSA 等級定義進行自評
- **THEN** 能確定目前等級（L1-L4），並看到升級到下一等級所需的具體行動

#### Scenario: SLSA 等級選擇
- **GIVEN** 團隊需要決定目標 SLSA 等級
- **WHEN** 查閱各等級的要求和適用場景
- **THEN** 能根據專案風險等級選擇適合的目標等級

### REQ-4: License 合規矩陣

系統 SHALL 提供 License 合規矩陣，涵蓋 Permissive、Copyleft、AGPL 的相容性判斷。

#### Scenario: 判斷 License 相容性
- **GIVEN** 專案使用 MIT License
- **WHEN** 引入使用 GPL-3.0 的依賴
- **THEN** 能根據合規矩陣判斷該組合是否相容，並了解限制條件

#### Scenario: AGPL 特殊處理
- **GIVEN** 專案為 SaaS 服務
- **WHEN** 引入使用 AGPL 的依賴
- **THEN** 能根據標準了解 AGPL 的網路傳播（network copyleft）要求

### REQ-5: 依賴更新策略

系統 SHALL 定義依賴更新策略，包含自動化 patch、手動 minor/major、鎖定策略。

#### Scenario: Patch 版本自動更新
- **GIVEN** 依賴有新的 patch 版本
- **WHEN** 自動化更新機制觸發
- **THEN** 自動建立 PR 並執行測試，通過後自動合併

#### Scenario: Minor/Major 版本手動更新
- **GIVEN** 依賴有新的 minor 或 major 版本
- **WHEN** 開發者收到更新通知
- **THEN** 手動評估變更影響，建立 PR 並進行人工審查

#### Scenario: 版本鎖定策略
- **GIVEN** 專案需要穩定的依賴版本
- **WHEN** 團隊決定鎖定策略
- **THEN** 使用 lockfile（package-lock.json、yarn.lock、Pipfile.lock）確保可重現的建構

### REQ-6: CI/CD 整合

系統 SHALL 定義依賴掃描作為 CI/CD pipeline gate 的整合方式，Critical 漏洞應阻斷部署。

#### Scenario: Pipeline 依賴掃描 Gate
- **GIVEN** CI/CD pipeline 執行中
- **WHEN** 依賴掃描發現 Critical 漏洞
- **THEN** pipeline 被阻斷，通知相關人員

#### Scenario: 不同嚴重程度的處理
- **GIVEN** 依賴掃描完成
- **WHEN** 發現不同嚴重程度的問題
- **THEN** Critical 阻斷、High 警告並要求限期修復、Medium/Low 記錄並排入待辦

### REQ-7: 依賴健康評估指標

系統 SHALL 定義依賴健康評估的量化指標，包含最後更新日期、星數、CVE 數、維護者數。

#### Scenario: 引入新依賴前的健康評估
- **GIVEN** 開發者考慮引入新的第三方依賴
- **WHEN** 使用健康評估指標進行評估
- **THEN** 能系統性地評估依賴的維護活躍度、社群規模、安全紀錄和維護者分散度

#### Scenario: 定期健康檢查
- **GIVEN** 專案已有多個第三方依賴
- **WHEN** 執行定期健康檢查
- **THEN** 能識別健康狀況下降的依賴並制定應對計畫

## Acceptance Criteria

- **AC-1**: Given 團隊需要建立 SBOM, when 查閱 SBOM 章節, then 能找到 SPDX 和 CycloneDX 的比較表和選型指引
- **AC-2**: Given 專案有依賴, when 執行依賴審計, then 涵蓋已知漏洞、授權合規、維護狀態、版本過時 4 個檢查維度
- **AC-3**: Given 團隊自評, when 使用 SLSA 等級定義, then 能明確判定 L1-L4 等級並看到各等級的要求和適用場景
- **AC-4**: Given 引入新依賴, when 檢查 License 合規, then 能使用合規矩陣判斷 Permissive/Copyleft/AGPL 的相容性
- **AC-5**: Given 依賴有新版本, when 決定更新策略, then 能根據版本類型選擇自動化 patch、手動 minor+major 或鎖定策略
- **AC-6**: Given CI/CD pipeline 執行, when 依賴掃描發現 Critical 漏洞, then pipeline 被阻斷
- **AC-7**: Given 引入新依賴, when 使用健康評估指標, then 能量化評估最後更新日期、星數、CVE 數、維護者數

## Technical Design

### 文件結構

```
core/
├── security-standards.md                  ← 保留，新增交叉引用
├── supply-chain-security-standards.md     ← 新建
```

### 章節結構（supply-chain-security-standards.md）

```markdown
# Supply Chain Security Standards

## Overview
## SBOM (Software Bill of Materials)
  ### SBOM Format Comparison (SPDX vs CycloneDX)
  ### Required Fields
## Dependency Audit
  ### Known Vulnerabilities
  ### License Compliance
  ### Maintenance Status
  ### Version Staleness
## SLSA Levels (L1-L4)
## License Compliance Matrix
  ### Permissive Licenses
  ### Copyleft Licenses
  ### AGPL Special Considerations
## Dependency Update Strategy
  ### Automated Patch Updates
  ### Manual Minor/Major Updates
  ### Lockfile Strategy
## CI/CD Integration
  ### Pipeline Security Gate
  ### Severity-Based Actions
## Dependency Health Metrics
  ### Health Score Calculation
  ### Periodic Health Review
## References
```

### 對應 Skill

| 產出物 | 類型 |
|--------|------|
| `core/supply-chain-security-standards.md` | Core 標準 |

### 與其他 SPEC 的依賴

```
SPEC-SCS-001 (本規格)
    ├── security-standards 提供安全標準基礎
    └── pipeline-integration-standards 提供 CI/CD 整合基礎
```

## Test Plan

- [ ] `supply-chain-security-standards.md` 符合 UDS core 標準格式驗證
- [ ] SBOM 章節包含 SPDX 和 CycloneDX 的比較表
- [ ] 依賴審計章節包含 4 個檢查維度的完整定義
- [ ] SLSA 章節包含 L1-L4 共 4 個等級的完整定義
- [ ] License 合規矩陣包含 Permissive/Copyleft/AGPL 相容性判斷
- [ ] 依賴更新策略包含 patch 自動化、minor/major 手動、鎖定策略
- [ ] CI/CD 整合章節包含 Critical 阻斷機制
- [ ] 依賴健康評估包含 4 個量化指標
- [ ] `check-standards-sync.sh` 通過

## Implementation Notes

### SBOM 格式比較

| 特性 | SPDX | CycloneDX |
|------|------|-----------|
| 標準組織 | Linux Foundation | OWASP |
| ISO 標準 | ISO/IEC 5962:2021 | — |
| 主要格式 | Tag-Value, JSON, RDF, YAML | JSON, XML, Protobuf |
| 強項 | License 合規、法律 | 安全分析、漏洞追蹤 |
| 適用場景 | 法規遵循、License 審計 | DevSecOps、安全掃描 |

### SLSA 等級概要

| 等級 | 名稱 | 要求概要 |
|------|------|----------|
| L1 | Build Provenance | 建構流程有文件記錄 |
| L2 | Hosted Build | 使用託管建構服務，有基本防篡改 |
| L3 | Hardened Build | 強化建構環境，防止內部威脅 |
| L4 | Two-Person Review | 所有變更需雙人審查，完整的防篡改鏈 |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-03-31 | 初始草稿 |
