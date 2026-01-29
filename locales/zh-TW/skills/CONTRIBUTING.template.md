---
source: ../../../skills/CONTRIBUTING.template.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

> **語言**: [English](../../../skills/CONTRIBUTING.template.md) | 繁體中文

# 貢獻指南範本

> 將此檔案複製到您的專案中並命名為 `CONTRIBUTING.md`，然後根據需要進行自訂。
> 此範本包含 [universal-dev-skills](https://github.com/AsiaOstrich/universal-dev-skills) 的配置區塊。

---

## 停用的技能

<!--
所有技能預設為啟用。
取消註解並列出您想要在此專案中停用的技能。
-->

<!--
- testing-guide
- release-standards
-->

---

## 開發標準

### Commit 訊息語言

此專案使用**英文** commit 類型。
<!-- 選項：English | Traditional Chinese | Bilingual -->

#### 允許的類型

| Type | 說明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 錯誤修復 |
| `refactor` | 程式碼重構 |
| `docs` | 文件 |
| `style` | 格式化 |
| `test` | 測試 |
| `perf` | 效能 |
| `build` | 建置系統 |
| `ci` | CI/CD 變更 |
| `chore` | 維護 |
| `revert` | 還原提交 |
| `security` | 安全性修復 |

#### 允許的範圍

- `auth` - 認證模組
- `api` - API 層
- `ui` - 使用者介面
- `db` - 資料庫
- `core` - 核心功能
<!-- 新增您專案特定的範圍 -->

---

### 確定性標籤語言

此專案使用**英文**確定性標籤。
<!-- 選項：English | 中文 -->

#### 標籤參考

| 標籤 | 使用時機 |
|------|----------|
| `[Confirmed]` | 來自程式碼/文件的直接證據 |
| `[Inferred]` | 從證據進行邏輯推論 |
| `[Assumption]` | 基於常見模式 |
| `[Unknown]` | 資訊不可用 |
| `[Need Confirmation]` | 需要使用者確認 |

---

### Git 工作流程

#### 分支策略

此專案使用 **GitHub Flow**。
<!-- 選項：GitFlow | GitHub Flow | Trunk-Based Development -->

#### 分支命名

格式：`<type>/<description>`

| Type | 用途 | 範例 |
|------|------|------|
| `feature/` | 新功能 | `feature/oauth-login` |
| `fix/` | 錯誤修復 | `fix/memory-leak` |
| `hotfix/` | 緊急修復 | `hotfix/security-patch` |
| `refactor/` | 程式碼重構 | `refactor/extract-service` |
| `docs/` | 文件 | `docs/api-reference` |
| `chore/` | 維護 | `chore/update-deps` |
| `release/` | 發布準備 | `release/v1.2.0` |

#### 合併策略

- Feature 分支：**Squash Merge**
<!-- 選項：Merge Commit | Squash Merge | Rebase -->

---

## 程式碼審查

### 註解前綴

| 前綴 | 需要的動作 |
|------|-----------|
| **BLOCKING** | 必須在合併前修復 |
| **IMPORTANT** | 應該修復 |
| **SUGGESTION** | 可選的改進 |
| **QUESTION** | 需要釐清 |
| **NOTE** | 資訊性 |

---

## 測試

### 最低覆蓋率

| 層級 | 目標 |
|------|------|
| Unit Tests | 80% |
| Integration Tests | 60% |
| E2E Tests | 關鍵路徑 |

---

## Pull Request 流程

1. 從 `main` 建立 feature 分支
2. 進行您的變更
3. 確保所有測試通過
4. 提交 pull request
5. 處理審查意見
6. 核准後合併

---

## 授權

貢獻至此專案即表示您同意您的貢獻將依專案授權進行授權。
