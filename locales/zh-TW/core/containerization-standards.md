---
source: ../../../core/containerization-standards.md
source_version: "1.0.0"
translation_version: "1.0.0"
last_synced: "2026-04-01"
status: current
---

# 容器化標準

> 版本: 1.0.0 | 最後更新: 2026-04-01

## 概述

本文件定義建置安全、高效且可重現的容器映像檔標準。涵蓋 Dockerfile 最佳實踐、多階段建置、映像檔安全、標籤策略、Registry 管理及 `.dockerignore` 配置。

## Dockerfile 最佳實踐

### Base Image 選擇

| 原則 | 說明 | 範例 |
|------|------|------|
| 使用官方映像檔 | 優先使用受信任的官方維護映像檔 | `node:20-slim` |
| 使用 slim/alpine 變體 | 減少攻擊面和映像檔大小 | `python:3.12-slim` |
| 固定版本號 | 確保可重現的建置 | `golang:1.22.1` |
| 定期更新 | 修補已知漏洞 | 建議每月審查 |

### Layer 最佳化

| 原則 | 說明 |
|------|------|
| 最少變動的層優先 | 順序：系統依賴 → 應用依賴 → 原始碼 |
| 合併 RUN 指令 | 減少層數和映像檔大小 |
| 清理暫存檔案 | 在同一 RUN 指令中清理 |
| 使用 .dockerignore | 排除 node_modules、.git、.env 等 |
| 精確 COPY | 先 `COPY package.json .` 再 `COPY . .` |

## 多階段建置

### 標準模式（builder → production）

| 階段 | 用途 | 包含 |
|------|------|------|
| **builder** | 編譯、打包、測試 | 開發工具、原始碼 |
| **production** | 執行應用程式 | 僅執行環境、編譯產物 |

### 開發 vs 生產映像檔

| 面向 | 開發映像檔 | 生產映像檔 |
|------|----------|----------|
| Base | 完整映像檔 | slim/alpine 變體 |
| 依賴 | 全部（含 devDependencies） | 僅生產依賴 |
| 使用者 | 可使用 root | **必須**使用 non-root |

## 映像檔安全

### 安全檢查表

| 檢查項目 | 說明 |
|---------|------|
| Non-root 執行 | 使用 `USER` 指令切換到非 root 使用者 |
| 無已知漏洞 | 掃描通過，Critical/High = 0 |
| 無硬編碼機密 | 映像檔層中無 API Key、密碼 |
| 最小權限 | 僅暴露必要 Port，避免 `--privileged` |
| 唯讀檔案系統 | 盡可能使用 `--read-only` |

### 漏洞掃描

| 嚴重性 | 動作 |
|--------|------|
| **Critical** | **阻擋** Pipeline，禁止部署 |
| **High** | **警告**並建立修復工單 |
| **Medium/Low** | **記錄**追蹤 |

## 映像檔標籤策略

| 標籤類型 | 格式 | 用途 |
|---------|------|------|
| Semantic Version | `vX.Y.Z` | 正式發布 |
| Commit SHA | `sha-<short>` | 建置追溯 |
| Branch | `<branch-name>` | 開發/測試 |
| Environment | `<env>-latest` | 環境追蹤 |

> **生產環境禁止使用 `latest` 標籤**。必須使用固定標籤（Semantic Version 或 Commit SHA）。

## Registry 管理

### 清理政策

| 標籤類型 | 保留規則 |
|---------|---------|
| Semantic Version 標籤 | 永久保留 |
| 環境標籤 | 保留最近 N 個版本 |
| Branch 標籤 | 分支刪除後 7 天清理 |
| Commit SHA 標籤 | 保留 30 天 |
| 未標記（Dangling） | 立即清理 |

## 快速參考卡

```
有官方映像檔？          → 使用官方版本
需要最小體積？          → 使用 alpine 變體
需要更廣泛的相容性？     → 使用 slim 變體
永遠                   → 固定確切版本，不使用 latest
```

---

**相關標準：**
- [部署標準](deployment-standards.md)
- [安全標準](security-standards.md)
- [效能標準](performance-standards.md)

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。
