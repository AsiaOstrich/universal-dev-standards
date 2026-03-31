# [SPEC-CONTAINER-001] Feature: Containerization Standards

- **Status**: Draft
- **Created**: 2026-03-31
- **Author**: AI-assisted
- **Priority**: High (P1)
- **Scope**: universal
- **Related**: `core/deployment-standards.md` (互補), `core/security-standards.md` (銜接), SPEC-ENV-001

## Overview

新增 `core/containerization-standards.md` 核心標準，定義容器映像建置最佳實踐、Image 標籤策略、安全掃描要求、Multi-stage Build 原則和 Registry 管理。這是 Phase 3 中唯一需要新建的標準，因為 `deployment-standards` 和 `changelog-standards` 已涵蓋部署策略和 Release Notes。

## Motivation

### 問題陳述

1. **Dockerfile 品質不一** — 缺乏分層最佳實踐、base image 選擇、.dockerignore 指引
2. **Image 標籤混亂** — `latest` 標籤在生產中使用、無法追溯到原始碼版本
3. **安全漏洞** — Base image 包含已知漏洞、以 root 執行、包含不必要的工具
4. **Image 過大** — 包含開發依賴、未使用 multi-stage build
5. **Registry 管理缺失** — 無清理策略、無存取控制

### 已存在的相關內容

| 現有標準 | 涵蓋內容 | 本規格補充 |
|----------|---------|-----------|
| `deployment-standards` | 部署策略、Feature Flag、Rollback | ❌ 不含容器建置 |
| `environment-standards` | 環境層級、配置管理 | ❌ 不含容器化 |
| `security-standards` | 程式碼安全 | ❌ 不含 image 安全掃描 |

## Requirements

### REQ-1: Dockerfile 最佳實踐

系統 SHALL 定義容器映像建置的最佳實踐原則。

#### Scenario: Base Image 選擇
- **GIVEN** 開發者撰寫 Dockerfile
- **WHEN** 選擇 base image
- **THEN** 遵循以下原則：

| 原則 | 說明 | 範例 |
|------|------|------|
| **使用官方映像** | 優先使用官方維護的 base image | `node:20-slim` 非 `random/node` |
| **使用精簡版** | 選擇 slim/alpine 減少攻擊面和大小 | `python:3.12-slim` 非 `python:3.12` |
| **固定版本** | 指定完整版本號，避免 latest | `golang:1.22.1` 非 `golang:latest` |
| **定期更新** | 定期更新 base image 以修補漏洞 | 每月檢查 |

#### Scenario: 分層最佳實踐
- **GIVEN** 開發者撰寫 Dockerfile
- **WHEN** 設計 image 分層
- **THEN** 遵循以下原則：

| 原則 | 說明 |
|------|------|
| **變化少的在前** | 系統依賴 → 應用依賴 → 原始碼（利用快取） |
| **合併 RUN 指令** | 減少分層數、減少 image 大小 |
| **清理暫存檔** | 同一 RUN 指令中安裝後清理 |
| **使用 .dockerignore** | 排除 node_modules、.git、.env |
| **COPY 精確檔案** | `COPY package.json .` 先於 `COPY . .` |

### REQ-2: Multi-stage Build

系統 SHALL 定義 Multi-stage Build 的使用原則和常見模式。

#### Scenario: 標準 Multi-stage 模式
- **GIVEN** 應用需要建置步驟（編譯、打包）
- **WHEN** 使用 Multi-stage Build
- **THEN** 採用以下模式：

| 階段 | 用途 | 包含 | 不包含 |
|------|------|------|--------|
| **builder** | 編譯/打包 | 開發工具、原始碼、建置產出 | — |
| **production** | 執行應用 | 執行環境、建置產出 | 原始碼、開發工具、測試 |

#### Scenario: 開發 vs 生產 Image
- **GIVEN** 團隊需要開發和生產兩種 image
- **WHEN** 查閱標準
- **THEN** 看到分離策略：
  - 開發 Image：包含偵錯工具、熱重載、測試框架
  - 生產 Image：最小化、僅含執行必需品

### REQ-3: Image 安全

系統 SHALL 定義容器映像的安全要求。

#### Scenario: 安全檢查表
- **GIVEN** Image 準備推送到 Registry
- **WHEN** 執行安全檢查
- **THEN** 驗證以下項目：

| 檢查項 | 說明 |
|--------|------|
| **非 root 執行** | 使用 `USER` 指令切換到非 root 使用者 |
| **無已知漏洞** | 掃描通過（Critical/High = 0） |
| **無硬編碼 Secret** | 不含 API key、密碼、憑證 |
| **最小權限** | 僅開啟必要的 port |
| **唯讀檔案系統** | 執行時使用 `--read-only`（如可能） |
| **無不必要工具** | 不含 curl、wget、ssh（生產 Image） |

#### Scenario: 漏洞掃描整合
- **GIVEN** CI/CD pipeline 建置 Image
- **WHEN** 建置完成後
- **THEN** 自動執行漏洞掃描：
  - Critical 漏洞：**阻斷** pipeline
  - High 漏洞：**警告** + 建立修復工單
  - Medium/Low：**記錄**

### REQ-4: Image 標籤策略

系統 SHALL 定義 Image 標籤的命名和管理策略。

#### Scenario: 標籤命名規則
- **GIVEN** 建置完成新的 Image
- **WHEN** 設定 Image 標籤
- **THEN** 使用以下標籤策略：

| 標籤類型 | 格式 | 用途 | 範例 |
|---------|------|------|------|
| **語義化版本** | `vX.Y.Z` | 正式發布 | `myapp:v1.2.3` |
| **Commit SHA** | `sha-<short>` | 可追溯性 | `myapp:sha-a1b2c3d` |
| **Branch** | `<branch>` | 開發/測試 | `myapp:feature-auth` |
| **環境** | `<env>-latest` | 環境追蹤 | `myapp:staging-latest` |

#### Scenario: 禁止 latest 用於生產
- **GIVEN** 部署到生產環境
- **WHEN** 指定 Image 標籤
- **THEN** MUST 使用固定標籤（語義化版本或 commit SHA），MUST NOT 使用 `latest`

### REQ-5: Registry 管理

系統 SHALL 定義 Image Registry 的管理策略。

#### Scenario: Registry 清理策略
- **GIVEN** Registry 累積大量 Image
- **WHEN** 執行清理
- **THEN** 按以下規則：

| 規則 | 保留策略 |
|------|---------|
| 語義化版本標籤 | 永久保留（所有正式發布） |
| 環境標籤 | 保留最近 N 個（如最近 5 個） |
| Branch 標籤 | Branch 刪除後 7 天清理 |
| Commit SHA | 保留最近 30 天 |
| 無標籤 (dangling) | 立即清理 |

#### Scenario: Registry 存取控制
- **GIVEN** 團隊使用 Image Registry
- **WHEN** 設定存取控制
- **THEN** 遵循最小權限：
  - CI/CD：Push + Pull
  - 開發者：Pull only（生產 registry）
  - 生產環境：Pull only

### REQ-6: .dockerignore 標準

系統 SHALL 定義 .dockerignore 的最佳實踐。

#### Scenario: 標準 .dockerignore 內容
- **GIVEN** 專案使用 Docker
- **WHEN** 建立 .dockerignore
- **THEN** MUST 包含以下項目：

```
.git
.gitignore
node_modules
.env
.env.*
*.md
tests/
docs/
.dockerignore
Dockerfile
docker-compose*.yml
.github/
.vscode/
```

## Acceptance Criteria

- **AC-1**: Given Dockerfile 撰寫, when 查閱 base image 選擇, then 有 4 個選擇原則（官方/精簡/固定版本/定期更新）
- **AC-2**: Given 分層設計, when 查閱最佳實踐, then 有至少 5 個分層原則
- **AC-3**: Given Multi-stage Build, when 查閱模式, then 有 builder/production 兩階段定義和開發/生產 Image 分離策略
- **AC-4**: Given Image 安全, when 查閱檢查表, then 有至少 6 個安全檢查項
- **AC-5**: Given 漏洞掃描, when 查閱整合方式, then 有 Critical/High/Medium 三級處理策略
- **AC-6**: Given Image 標籤, when 查閱策略, then 有 4 種標籤類型（語義化/SHA/Branch/環境）且禁止生產用 latest
- **AC-7**: Given Registry 管理, when 查閱清理策略, then 有 5 種標籤的保留規則
- **AC-8**: Given .dockerignore, when 查閱範本, then 有至少 10 個必要 ignore 項目

## Technical Design

### 文件結構

```
core/
├── containerization-standards.md  ← 新建
├── deployment-standards.md        ← 現有，新增交叉引用
```

### 章節結構

```markdown
# Containerization Standards
## Overview
## Dockerfile Best Practices
  ### Base Image Selection
  ### Layer Optimization
  ### .dockerignore
## Multi-stage Build
  ### Standard Pattern (builder → production)
  ### Dev vs Production Images
## Image Security
  ### Security Checklist
  ### Vulnerability Scanning Integration
## Image Tagging Strategy
  ### Tag Types
  ### Production Tag Requirements
## Registry Management
  ### Cleanup Policies
  ### Access Control
## Quick Reference Card
## References
```

## Test Plan

- [ ] Base image 選擇有 4 個原則
- [ ] 分層最佳實踐有至少 5 個原則
- [ ] Multi-stage Build 有兩階段定義
- [ ] 安全檢查表有至少 6 個項目
- [ ] 漏洞掃描有三級處理策略
- [ ] 標籤策略有 4 種類型
- [ ] Registry 清理有 5 種保留規則
- [ ] .dockerignore 有至少 10 個項目
- [ ] `check-standards-sync.sh` 通過

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-03-31 | 初始草稿 |
