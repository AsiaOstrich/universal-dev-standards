---
source: ../../../core/containerization-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 44899315e9d1
status: current
---

# 容器化標準

> **語言**: [English](../../../core/containerization-standards.md) | 繁體中文

**版本**：1.0.0
**最後更新**：2026-03-31
**適用範圍**：所有使用容器的軟體專案
**範疇**：通用
**業界標準**：OCI Image Spec、Docker Best Practices、CIS Docker Benchmark
**參考資料**：[docs.docker.com](https://docs.docker.com/)、[opencontainers.org](https://opencontainers.org/)

---

## 概述

本文件定義用於建置安全、高效且可重現的容器映像檔標準。內容涵蓋 Dockerfile 最佳實踐、多階段建置、映像檔安全、標籤策略、Registry 管理以及 `.dockerignore` 配置。

關於包含回滾、Feature Flag 與環境管理在內的部署策略，請參閱 [部署標準](deployment-standards.md)。

---

## Dockerfile 最佳實踐

### Base Image 選擇

請謹慎選擇 Base Image——它們構成了容器安全性與大小的基礎。

| 原則 | 說明 | 範例 |
|-----------|-------------|---------|
| **使用官方映像檔** | 優先使用來自受信任來源、官方維護的 Base Image | `node:20-slim` 而非 `random/node` |
| **使用 slim/alpine 變體** | 選擇 slim 或 alpine 變體以減少受攻擊面與映像檔大小 | `python:3.12-slim` 而非 `python:3.12` |
| **固定確切版本** | 指定精確的版本標籤以確保可重現的建置 | `golang:1.22.1` 而非 `golang:latest` |
| **定期更新** | 定期更新 Base Image 以修補已知弱點 | 建議每月審查週期 |

**決策指引：**
```
Need a language runtime?
├─ Yes → Use official slim variant (e.g., node:20-slim, python:3.12-slim)
└─ No, just need OS?
   ├─ Minimal footprint? → alpine:3.19
   └─ Compatibility needed? → debian:bookworm-slim
```

### Layer 最佳化

最佳化 Dockerfile 的 Layer，以最大化建置快取效率並最小化映像檔大小。

| 原則 | 說明 |
|-----------|-------------|
| **最少變動的層優先** | 順序：系統相依套件 → 應用程式相依套件 → 原始碼（善用建置快取） |
| **合併 RUN 指令** | 將相關指令合併在單一 RUN 中，以減少層數並降低映像檔大小 |
| **清理暫存檔案** | 在建立快取與暫存檔案的同一個 RUN 指令中將其刪除 |
| **使用 .dockerignore** | 從建置情境（build context）中排除 node_modules、.git、.env 及其他不必要的檔案 |
| **精確的檔案先 COPY** | 先 `COPY package.json .` 再 `COPY . .` 以善用相依套件快取 |

**範例 — 良好的 Layer 順序：**
```dockerfile
# Layer 1: System dependencies (rarely changes)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Layer 2: Application dependencies (changes occasionally)
COPY package.json package-lock.json ./
RUN npm ci --production

# Layer 3: Source code (changes frequently)
COPY . .
```

### .dockerignore

每個使用 Docker 的專案都**必須**擁有 `.dockerignore` 檔案，以從建置情境中排除不必要的檔案。

**標準 .dockerignore 範本：**

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
coverage/
.nyc_output/
```

> 上述範本包含 14 個項目。請根據專案的具體需求進行調整，但至少務必包含：`.git`、`node_modules`、`.env`、`tests/` 與 `docs/`。

---

## 多階段建置

### 標準模式（builder → production）

使用多階段建置將建置時期的相依套件與執行階段映像檔分離。

| 階段 | 用途 | 包含 | 排除 |
|-------|---------|----------|----------|
| **builder** | 編譯、打包、測試 | 開發工具、原始碼、建置產物 | — |
| **production** | 執行應用程式 | 僅執行階段環境、已編譯產物 | 原始碼、開發工具、測試 |

**範例：**
```dockerfile
# Stage 1: builder
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: production
FROM node:20-slim AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --production
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### 開發 vs 生產映像檔

為開發與生產環境維持分開的映像檔配置：

| 面向 | 開發映像檔 | 生產映像檔 |
|--------|------------------|-----------------|
| **Base** | 包含開發工具的完整映像檔 | Slim/alpine 變體 |
| **相依套件** | 全部（包含 devDependencies） | 僅生產環境相依 |
| **工具** | 偵錯工具、熱重載、測試框架 | 無 |
| **大小** | 較大（可接受） | 最小化 |
| **使用者** | 為求方便可使用 root | **必須**使用非 root |

---

## 映像檔安全

### 安全檢查清單

在將映像檔推送到任何 Registry 之前，請驗證以下項目：

| 檢查項目 | 說明 |
|-------|-------------|
| **Non-root 執行** | 使用 `USER` 指令切換至非 root 使用者 |
| **無已知弱點** | 掃描通過且 Critical/High = 0 |
| **無硬式編碼機密** | 映像檔層中無 API 金鑰、密碼或憑證 |
| **最小權限** | 僅公開必要連接埠；避免使用 `--privileged` |
| **唯讀檔案系統** | 盡可能使用 `--read-only` 旗標執行 |
| **無不必要的工具** | 生產映像檔絕不能包含 curl、wget、ssh 或類似工具 |

### 弱點掃描整合

將弱點掃描整合至 CI/CD 管線中：

| 嚴重程度 | 處置動作 | 範例 |
|----------|--------|---------|
| **Critical** | **阻擋**管線——映像檔**絕不能**被部署 | CVSS >= 9.0 的 CVE |
| **High** | **警告**並建立修復工單——經核准後方可部署 | CVSS 7.0-8.9 的 CVE |
| **Medium/Low** | **記錄**以供追蹤——正常部署 | CVSS < 7.0 的 CVE |

**推薦的掃描工具：**
- Trivy（開源、對 CI 友善）
- Snyk Container
- Docker Scout

**管線整合範例：**
```yaml
# GitHub Actions
- name: Scan image
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: myapp:${{ github.sha }}
    severity: CRITICAL,HIGH
    exit-code: 1  # Fail on Critical/High
```

---

## 映像檔標籤策略

### 標籤類型

使用一致的標籤策略以確保可追溯性與可重現性：

| 標籤類型 | 格式 | 用途 | 範例 |
|----------|--------|---------|---------|
| **語意化版本** | `vX.Y.Z` | 正式發布 | `myapp:v1.2.3` |
| **Commit SHA** | `sha-<short>` | 建置可追溯性 | `myapp:sha-a1b2c3d` |
| **分支** | `<branch-name>` | 開發／測試 | `myapp:feature-auth` |
| **環境** | `<env>-latest` | 環境追蹤 | `myapp:staging-latest` |

### 生產環境標籤要求

> **絕不能**在生產環境部署中使用 `latest` 標籤。`latest` 標籤是可變的，無法提供可追溯性。

**生產環境規則：**
- **必須**使用固定標籤：語意化版本（`vX.Y.Z`）或 Commit SHA（`sha-<short>`）
- **絕不能**使用 `latest` 或任何可變標籤
- **應該**同時以語意化版本與 Commit SHA 標記標籤，以獲得最大程度的可追溯性

**範例：**
```bash
# Good: Fixed, traceable tags
docker tag myapp:build myapp:v1.2.3
docker tag myapp:build myapp:sha-a1b2c3d

# Bad: Mutable, untraceable
docker tag myapp:build myapp:latest  # PROHIBITED in production
```

---

## Registry 管理

### 清理政策

定義保留政策以管理 registry 儲存空間：

| 標籤類型 | 保留規則 |
|----------|---------------|
| **Semantic version 標籤** | 永久保留（所有正式發布） |
| **環境標籤** | 保留最近 N 個版本（例如最近 5 個） |
| **Branch 標籤** | 分支刪除後 7 天清理 |
| **Commit SHA 標籤** | 保留 30 天 |
| **Dangling（未標記）** | 立即清理 |

### 存取控制

遵循 registry 存取的最小權限原則：

| 角色 | 權限 | 範圍 |
|------|------------|-------|
| **CI/CD** | Push + Pull | Build registry |
| **開發者** | 僅 Pull | 生產環境 registry |
| **生產環境** | 僅 Pull | 生產環境 registry |
| **管理員** | 完整存取權限 | 所有 registry |

### Registry 最佳實踐

- 為開發與生產映像檔使用獨立的 registry（或 repository）
- 為生產映像檔啟用映像檔簽署
- 根據保留政策設定自動化清理工作
- 監控 registry 儲存空間使用量並設定告警
- 對於頻繁拉取的 base image 使用 registry 鏡像

---

## 快速參考卡

### Base Image 選擇
```
Official image available?     → Use official (e.g., node, python)
Need minimal size?            → Use alpine variant
Need broader compatibility?   → Use slim variant
Always                        → Pin exact version, never use latest
```

### 多階段建置決策
```
Has build/compile step?       → Use multi-stage (builder → production)
Static files only?            → Multi-stage with nginx final stage
Interpreted language?         → Multi-stage to exclude dev deps
```

### 安全快速檢查
```
Running as root?              → Add USER directive
Contains dev tools?           → Use multi-stage build
Has known CVEs?               → Update base image
Contains secrets?             → Use build args or secrets mount
```

---

## 參考資料

- [Docker Official Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/) — Dockerfile 撰寫指南
- [OCI Image Specification](https://github.com/opencontainers/image-spec) — 容器映像檔標準
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker) — 安全設定指南
- [Trivy](https://trivy.dev/) — 開源弱點掃描工具
- [Snyk Container](https://snyk.io/product/container-vulnerability-management/) — 商業弱點掃描工具

---

**相關標準：**
- [部署標準](deployment-standards.md) — 部署策略、回滾、功能旗標
- [安全標準](security-standards.md) — 應用程式安全要求
- [效能標準](performance-standards.md) — 效能目標與基準

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | 初始版本：Dockerfile 最佳實踐、多階段建置、映像檔安全、標籤策略、Registry 管理、.dockerignore |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。
