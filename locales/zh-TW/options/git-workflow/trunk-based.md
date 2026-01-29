---
source: ../../../options/git-workflow/trunk-based.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# Trunk-Based 開發

> **語言**: [English](../../../options/git-workflow/trunk-based.md) | 繁體中文

**上層標準**: [Git 工作流程](../../core/git-workflow.md)

---

## 概述

Trunk-Based 開發是一種版本控制管理實踐，所有開發者在單一分支（稱為「trunk」或「main」）上進行小型、頻繁的更新。它最大化持續整合，減少合併問題。

## 適用情境

- 經驗豐富的團隊
- 強大的 CI/CD 基礎設施
- 需要快速發布週期
- 高度自動化測試環境

## 核心原則

| 原則 | 說明 |
|------|------|
| 單一主分支 | 所有開發在 main/trunk 進行 |
| 小型提交 | 頻繁提交小變更 |
| 功能標誌 | 使用 feature flags 控制功能 |
| 持續整合 | 頻繁合併到主分支 |

## 工作流程

### 直接在 trunk 工作

```bash
# 更新本地 main
git checkout main
git pull origin main

# 進行小型變更
git add .
git commit -m "feat: add user avatar display"
git push origin main
```

### 短期功能分支（可選）

```bash
# 建立短期分支（最長 1-2 天）
git checkout -b feat/quick-change
# 進行變更
git checkout main
git merge feat/quick-change
git push origin main
git branch -d feat/quick-change
```

## 功能標誌

使用功能標誌在生產環境控制未完成功能：

```javascript
// 功能標誌範例
if (featureFlags.isEnabled('new-checkout-flow')) {
  return <NewCheckoutFlow />;
} else {
  return <LegacyCheckoutFlow />;
}
```

### 功能標誌類型

| 類型 | 用途 | 生命週期 |
|------|------|----------|
| 發布標誌 | 隱藏未完成功能 | 短期 |
| 實驗標誌 | A/B 測試 | 中期 |
| 權限標誌 | 功能存取控制 | 長期 |
| 營運標誌 | 系統行為控制 | 長期 |

## 前提條件

使用 Trunk-Based 開發需要：

1. **全面的自動化測試**
2. **快速的 CI/CD 管線**
3. **程式碼審查文化**
4. **功能標誌系統**
5. **即時監控能力**

## 優點

| 優點 | 說明 |
|------|------|
| 最少合併衝突 | 頻繁整合減少衝突 |
| 持續整合 | 真正的 CI 實踐 |
| 快速反饋 | 問題快速浮現 |
| 簡化分支管理 | 無複雜分支策略 |

## 缺點

| 缺點 | 說明 |
|------|------|
| 需要高度紀律 | 團隊必須遵守規則 |
| 需要強大的 CI | 測試和建置必須快速 |
| 功能標誌複雜性 | 需要管理標誌生命週期 |
| 不適合新手團隊 | 需要經驗和信任 |

## 相關選項

- [GitHub Flow](./github-flow.md) - 帶有 PR 的簡化流程
- [GitFlow](./gitflow.md) - 適合有排程發布的專案

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
