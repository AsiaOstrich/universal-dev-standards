# [SPEC-RELEASE-01] Feature: Manual Deployment Release Mode

> **Language**: English | 繁體中文

**Status**: Implemented
**Author**: Albert
**Created**: 2026-03-25
**Spec Type**: System Design
**Scope**: universal
**Priority**: P1

---

## Overview | 概述

新增「手動打包部署」Release 模式，讓未使用 CI/CD 自動發布的專案也能透過 UDS 管理版本生命週期。此模式採用 RC（Release Candidate）制，搭配 Build Manifest，完整追蹤從打包到測試到正式部署的全流程。

Add a "Manual Deployment" release mode so projects without CI/CD pipelines can still manage their version lifecycle through UDS. This mode uses RC (Release Candidate) versioning with Build Manifest for full traceability from packaging to testing to production deployment.

---

## Motivation | 動機

### Problem | 問題

現有的 UDS Release 流程預設 CI/CD 自動發布（GitHub Actions → npm publish），但許多真實專案的發布流程是：

1. 手動打包產生安裝檔
2. 將安裝檔部署到測試機
3. 在測試機上執行驗收測試
4. 測試通過後，將同一包或從同一 commit 重新打包部署到正式機

這類專案無法直接套用現有的 `/release` 流程，因為：
- 沒有 CI/CD pipeline 自動偵測版本類型並發布
- 「打包」與「部署」是分離的手動活動，需要獨立追蹤
- 需要管理「候選版本在不同環境間晉升」的生命週期

### Why RC over Beta | 為什麼選擇 RC 而非 Beta

| 面向 | Beta | RC |
|------|------|-----|
| 語意 | 功能可能還會變 | 這就是候選正式版，只差驗證 |
| 與手動送測的匹配度 | 中 | **高** — 送測就是驗證能否上正式 |
| 失敗後動作 | 模糊 | 明確（修 bug → rc.2） |
| 成功後動作 | 要經過 rc？直接 stable？ | 直接打 stable，語意清晰 |

### Goal | 目標

- 讓 `/release` 能根據專案設定自動切換 CI/CD 或手動模式
- 提供 RC 版本管理 + Build Manifest 機制
- 保留現有 CI/CD 流程完全不受影響

---

## Requirements | 需求

### Requirement 1: Release Mode Configuration | 發布模式設定

系統 SHALL 支援在 `uds init` 時選擇發布模式，並將設定持久化到 `.standards/release-config.yaml`。

#### Scenario: 初次初始化選擇手動模式

- **GIVEN** 使用者執行 `uds init`
- **WHEN** 流程進行到發布模式選擇步驟
- **THEN** 系統顯示三個選項：CI/CD 自動發布、手動打包部署、混合模式
- **AND** 使用者選擇「手動打包部署」
- **AND** 系統產生 `.standards/release-config.yaml` 包含 `mode: manual`

#### Scenario: 已初始化專案切換模式

- **GIVEN** 專案已執行過 `uds init`
- **WHEN** 使用者執行 `uds config release-mode`
- **THEN** 系統顯示目前模式並允許切換
- **AND** 更新 `.standards/release-config.yaml`

#### Scenario: 非互動模式使用預設值

- **GIVEN** 使用者執行 `uds init --yes`
- **WHEN** 流程自動執行
- **THEN** 發布模式預設為 `ci-cd`（向後相容）

### Requirement 2: RC Version Lifecycle | RC 版本生命週期

系統 SHALL 支援 RC 版本的完整生命週期：建立、迭代、晉升為 Stable。

#### Scenario: 建立 RC 版本

- **GIVEN** 開發完成，程式碼已合併到發布分支
- **WHEN** 使用者執行 `/release start 1.2.0-rc.1`
- **THEN** 系統更新版本檔案為 `1.2.0-rc.1`
- **AND** 建立 Git tag `v1.2.0-rc.1`
- **AND** 提示使用者執行打包指令

#### Scenario: RC 測試失敗後迭代

- **GIVEN** `v1.2.0-rc.1` 在測試機上發現問題
- **WHEN** 修復完成後使用者執行 `/release start 1.2.0-rc.2`
- **THEN** 系統更新版本檔案為 `1.2.0-rc.2`
- **AND** 建立 Git tag `v1.2.0-rc.2`

#### Scenario: RC 晉升為 Stable

- **GIVEN** `v1.2.0-rc.2` 在測試機上驗證通過
- **WHEN** 使用者執行 `/release promote 1.2.0`
- **THEN** 系統從最新 RC 的同一 commit 更新版本檔案為 `1.2.0`
- **AND** 建立 Git tag `v1.2.0`
- **AND** 提示使用者從此 commit 重新打包或執行升版腳本
- **AND** 記錄晉升來源（`promoted_from: 1.2.0-rc.2`）

### Requirement 3: Build Manifest | 打包資訊清單

系統 SHOULD 在打包時產生 `build-manifest.json`，隨產物一起交付，用於追溯性驗證。

#### Scenario: 打包時自動產生 Manifest

- **GIVEN** 使用者執行打包流程（專案自訂的 build 腳本）
- **WHEN** 打包腳本呼叫 `uds release manifest` 或手動建立
- **THEN** 產生 `build-manifest.json` 包含：version、commit hash、build date、builder、checksum

#### Scenario: 部署前驗證 Manifest

- **GIVEN** 準備將產物部署到正式機
- **WHEN** 使用者執行 `uds release verify`
- **THEN** 系統驗證 manifest 中的 commit hash 與目前 Git tag 一致
- **AND** 顯示此產物在測試機上的驗證狀態

### Requirement 4: Deployment Tracking | 部署追蹤

系統 SHOULD 提供部署紀錄機制，追蹤版本在各環境的部署歷史。

#### Scenario: 記錄部署到測試機

- **GIVEN** 使用者將 `v1.2.0-rc.1` 部署到測試機
- **WHEN** 使用者執行 `/release deploy staging`
- **THEN** 系統在 `deployments.yaml` 記錄：版本、環境、日期、部署者

#### Scenario: 記錄測試結果

- **GIVEN** 測試機上的驗證完成
- **WHEN** 使用者執行 `/release deploy staging --result passed`
- **THEN** 系統更新 `deployments.yaml` 中對應紀錄的測試結果

#### Scenario: 記錄部署到正式機

- **GIVEN** 使用者將 stable 版本部署到正式機
- **WHEN** 使用者執行 `/release deploy production`
- **THEN** 系統記錄部署紀錄
- **AND** 若該版本未在 staging 標記為 passed，顯示警告

### Requirement 5: `/release` Mode-Aware Behavior | `/release` 模式感知行為

`/release` 命令 SHALL 根據 `.standards/release-config.yaml` 中的模式設定，自動切換行為。

#### Scenario: CI/CD 模式下行為不變

- **GIVEN** `.standards/release-config.yaml` 設定 `mode: ci-cd`
- **WHEN** 使用者執行 `/release`
- **THEN** 行為與現有完全一致（無任何變更）

#### Scenario: 手動模式下引導 RC 流程

- **GIVEN** `.standards/release-config.yaml` 設定 `mode: manual`
- **WHEN** 使用者執行 `/release`
- **THEN** 系統檢查目前狀態並引導：
  - 無進行中的 RC → 引導建立 RC（`/release start X.Y.Z-rc.1`）
  - 有 RC 尚未測試 → 提醒部署到測試機
  - RC 已測試通過 → 引導晉升為 Stable（`/release promote X.Y.Z`）

#### Scenario: 混合模式

- **GIVEN** `.standards/release-config.yaml` 設定 `mode: hybrid`
- **WHEN** 使用者執行 `/release`
- **THEN** 系統詢問此次發布要使用 CI/CD 還是手動流程
- **AND** 根據選擇執行對應流程

---

## Acceptance Criteria | 驗收條件

| AC | Given | When | Then |
|----|-------|------|------|
| AC-1 | `uds init` 執行中 | 進入發布模式選項 | 顯示 ci-cd / manual / hybrid 三選項，產生 `release-config.yaml` |
| AC-2 | 手動模式已設定 | `/release start X.Y.Z-rc.1` | 更新版本檔案、建立 Git tag、提示打包 |
| AC-3 | RC 測試通過 | `/release promote X.Y.Z` | 從同一 commit 更新為 stable 版本、記錄 promoted_from |
| AC-4 | 打包完成 | `uds release manifest` | 產生 `build-manifest.json` 含 version/commit/checksum |
| AC-5 | 部署完成 | `/release deploy <env>` | 記錄到 `deployments.yaml` |
| AC-6 | 未經 staging 驗證 | `/release deploy production` | 顯示警告 |
| AC-7 | CI/CD 模式 | `/release` | 行為完全不變（向後相容） |
| AC-8 | `uds init --yes` | 自動初始化 | 發布模式預設 `ci-cd`（向後相容） |

---

## Technical Design | 技術設計

### 設定檔格式

```yaml
# .standards/release-config.yaml
release:
  mode: manual          # ci-cd | manual | hybrid
  versioning: semver
  pre_release_tag: rc   # rc | beta | alpha（手動模式預設 rc）

  manual:
    manifest: true
    manifest_path: build-manifest.json
    deployment_log: deployments.yaml

  environments:
    - name: staging
      type: testing
      approval_required: false
    - name: production
      type: production
      approval_required: true
      requires_staging_pass: true
```

### Build Manifest 格式

```json
{
  "version": "1.2.0-rc.1",
  "commit": "a1b2c3d",
  "branch": "release/1.2.0",
  "build_date": "2026-03-25T10:30:00+08:00",
  "builder": "albert",
  "checksum": {
    "package": "sha256:abc123..."
  },
  "promotion": {
    "promoted_from": null,
    "tested_on": null,
    "test_result": null,
    "test_date": null
  }
}
```

### 部署紀錄格式

```yaml
# deployments.yaml
deployments:
  - version: "1.2.0-rc.1"
    environment: staging
    date: "2026-03-25T10:30:00+08:00"
    deployer: albert
    result: passed
    notes: "所有驗收測試通過"

  - version: "1.2.0"
    environment: production
    date: "2026-03-25T14:00:00+08:00"
    deployer: albert
    promoted_from: "1.2.0-rc.1"
    result: deployed
```

### 影響範圍

| 元件 | 變更類型 | 說明 |
|------|----------|------|
| `cli/src/flows/init-flow.js` | 修改 | 新增發布模式選項步驟 |
| `cli/src/prompts/init.js` | 修改 | 新增發布模式問題 |
| `cli/src/commands/release.js` | 新增 | Release 命令實作（或擴充現有） |
| `skills/release-standards/SKILL.md` | 修改 | 新增手動模式文件 |
| `skills/commands/release.md` | 修改 | 新增 promote / deploy / manifest 子命令 |
| `core/deployment-standards.md` | 修改 | 新增手動部署模式章節 |
| `.standards/release-config.yaml` | 新增 | 設定檔模板 |
| `locales/zh-TW/` | 新增 | 相關翻譯 |

### `/release` 命令擴充

| 子命令 | 模式 | 說明 |
|--------|------|------|
| `start` | 全部 | 開始發布（現有，不變） |
| `finish` | ci-cd | 完成發布、push tag（現有，不變） |
| `promote` | manual / hybrid | **新增**：RC → Stable 晉升 |
| `deploy` | manual / hybrid | **新增**：記錄部署紀錄 |
| `manifest` | manual / hybrid | **新增**：產生 Build Manifest |
| `verify` | manual / hybrid | **新增**：驗證產物與 manifest 一致性 |
| `changelog` | 全部 | 更新 CHANGELOG（現有，不變） |
| `check` | 全部 | 預發布檢查（現有，不變） |

---

## Test Plan | 測試計畫

### Unit Tests

- [ ] `release-config.yaml` 解析與預設值
- [ ] RC 版本號格式驗證（`X.Y.Z-rc.N`）
- [ ] `promote` 版本號轉換（rc → stable）
- [ ] `build-manifest.json` 產生與驗證
- [ ] `deployments.yaml` 讀寫操作
- [ ] 模式偵測邏輯（ci-cd / manual / hybrid）
- [ ] 未經 staging 驗證的 production 部署警告

### Integration Tests

- [ ] `uds init` 新增發布模式選項的互動流程
- [ ] `/release start` 在手動模式下的完整流程
- [ ] `/release promote` 從 RC 晉升到 Stable
- [ ] `/release deploy` 記錄部署紀錄
- [ ] 模式切換（`uds config release-mode`）

### E2E Tests

- [ ] 手動模式完整生命週期：init → start rc → deploy staging → promote → deploy production
- [ ] CI/CD 模式向後相容性（行為無變更）

---

## Migration & Compatibility | 遷移與相容性

| 面向 | 策略 |
|------|------|
| 現有專案 | 無 `release-config.yaml` 時預設 `ci-cd` 模式，完全向後相容 |
| `uds init --yes` | 預設 `ci-cd`，不影響自動化腳本 |
| 現有 `/release` 行為 | CI/CD 模式下零變更 |
| 新增檔案 | `release-config.yaml`、`deployments.yaml`、`build-manifest.json` 皆為 opt-in |

---

## Resolved Questions | 已解決問題

### 1. `deployments.yaml` 是否應納入 Git 追蹤？

**決議**：**預設納入 Git 追蹤**。

- 部署紀錄是版本生命週期的一部分，應具備可追溯性
- 紀錄中不包含敏感資訊（僅版本號、環境名稱、日期、部署者名稱）
- 若專案有特殊安全需求，使用者可自行加入 `.gitignore`
- `build-manifest.json` 也一併納入追蹤，因為它是產物溯源的依據

### 2. 混合模式的具體行為

**決議**：**混合模式為「整體專案層級」，非模組層級**。

- 混合模式意指：CI 負責建置產物（打包），但部署是手動的
- 不支援同一專案內「某模組 CI/CD、某模組手動」的場景
- 若有多模組需求，建議各模組獨立設定自己的 `release-config.yaml`
- `/release` 執行時會詢問此次使用哪種流程（CI/CD 或手動）

### 3. `promote` 是否應自動重新打包？

**決議**：**不自動打包，僅更新版本檔案並提示使用者**。

- 打包流程因專案而異（make、gradle、docker build 等），UDS 不應假設
- `promote` 只負責：更新版本號、建立 Git tag、記錄晉升來源
- 輸出中會提示使用者後續步驟（重新打包、部署）
- 未來可透過 hook 機制讓使用者自訂打包腳本

### 4. Build Manifest 的 checksum 來源

**決議**：**由使用者的 build 腳本提供，UDS 不計算**。

- `uds release manifest --checksum <hash>` 接受外部提供的 checksum
- 若未提供，`checksum.package` 設為 `null`（不強制）
- 理由：checksum 應由實際打包工具計算（確保涵蓋完整產物），UDS 不知道哪些檔案構成「產物」
- 驗證時（`uds release verify`）僅檢查 commit hash 一致性，不驗證 checksum

---

## References | 參考

- [Release Standards Skill](../../skills/release-standards/SKILL.md)
- [/release Command](../../skills/commands/release.md)
- [Deployment Standards](../../core/deployment-standards.md)
- [Versioning Standards](../../core/versioning.md)
- [npm Release Spec (PUBLISH-00)](../cli/publishing/npm-release.md)
