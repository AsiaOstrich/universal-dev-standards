---
source: ../../../../options/git-workflow/trunk-based.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 08f932654363
status: current
---

# Trunk-Based 開發

> **語言**: [English](../../../../options/git-workflow/trunk-based.md) | 繁體中文

**上層標準**: [Git 工作流程](../../../../core/git-workflow.md)

---

## 概述

Trunk-Based 開發是一種版本控制分支模型：開發者在稱為「trunk」（main）的單一分支上協作，避免建立長期分支，並使用功能標誌（feature flags）管理未完成的功能。

## 適用情境

- 持續部署（每天多次）
- 成熟的 CI/CD 管線
- 經驗豐富的開發團隊
- 微服務架構

## 分支架構

| 分支 | 用途 | 生命週期 |
|------|------|----------|
| `main`（trunk） | 唯一的事實來源，隨時可部署 | 永久 |
| `feature/*` | 極短期的功能分支（可選） | 最多 1-2 天 |

## 核心原則

1. **小型、頻繁的提交** - 每天多次提交到 trunk
2. **功能標誌** - 將未完成的功能隱藏在標誌之後
3. **Trunk 永遠保持綠燈** - 每次提交都必須通過所有測試
4. **沒有長期分支** - 分支最多存活 2 天
5. **快速 CI** - 建置與測試以分鐘計，而非小時

## 工作流程：直接提交

小型變更直接提交到 trunk：

```bash
# Start from latest trunk
git checkout main
git pull origin main

# Make small, focused changes
# ... edit files ...

# Commit and push
git add .
git commit -m "feat: add email validation"
git pull --rebase origin main
git push origin main
```

## 工作流程：短期分支

稍大的變更（仍少於 2 天）：

```bash
# Create short-lived branch
git checkout main
git pull origin main
git checkout -b feature/add-avatar

# Make changes (complete within 1-2 days)
git commit -m "feat: add avatar upload"
git commit -m "test: add avatar tests"

# Merge quickly
git checkout main
git pull origin main
git merge --ff-only feature/add-avatar
git push origin main
git branch -d feature/add-avatar
```

## 功能標誌

功能標誌是 Trunk-Based 開發不可或缺的要素：

```javascript
// Example feature flag usage
if (featureFlags.isEnabled('new-checkout-flow')) {
  return <NewCheckout />;
}
return <OldCheckout />;
```

### 功能標誌生命週期

1. **建立標誌** - 在開始功能開發之前
2. **在標誌後開發** - 所有新程式碼都由標誌隱藏
3. **開啟標誌測試** - QA 測試該功能
4. **逐步推出** - 對一定比例的使用者啟用
5. **移除標誌** - 功能穩定後移除

## 最佳實踐

### 結對程式設計
- 即時程式碼審查
- 更高品質的提交
- 知識共享

### 測試驅動開發
- 先寫測試
- 對 trunk 穩定性有高度信心
- 快速回饋

### 持續整合
- 每次提交都執行測試
- 自動化部署
- 快速建置時間（< 10 分鐘）

### 監控
- 即時錯誤追蹤
- 快速回滾能力
- 功能標誌分析

## 提交準則

```bash
# Good: Small, atomic commits
git commit -m "feat: add user avatar field to schema"
git commit -m "feat: add avatar upload endpoint"
git commit -m "feat: add avatar display component"

# Bad: Large, compound commits
git commit -m "feat: add complete avatar feature with upload, display, and tests"
```

## 優點

- 最快速的變更整合
- 合併衝突最少
- 鼓勵小型、易審查的變更
- 支援持續部署

## 缺點

- 需要成熟的 CI/CD
- 需要功能標誌基礎設施
- 技能要求較高
- 不適用於所有團隊規模

## 前提條件

- [ ] 快速、可靠的 CI 管線（建置 < 10 分鐘）
- [ ] 高測試覆蓋率
- [ ] 功能標誌系統
- [ ] 監控與回滾能力
- [ ] 團隊具備 Git 經驗

## 相關選項

- [GitHub Flow](./github-flow.md) - 較寬鬆，允許較長的分支
- [GitFlow](./gitflow.md) - 適用於排程發布

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
