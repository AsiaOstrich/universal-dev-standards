---
source: ../../../../options/git-workflow/trunk-based.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# Trunk-Based 开发

> **语言**: [English](../../../options/git-workflow/trunk-based.md) | 繁体中文

**上层标准**: [Git 工作流程](../../core/git-workflow.md)

---

## 概述

Trunk-Based 开发是一种版本控制管理实践，所有开发者在单一分支（称为「trunk」或「main」）上进行小型、频繁的更新。它最大化持续整合，减少合并问题。

## 适用情境

- 经验丰富的团队
- 强大的 CI/CD 基础设施
- 需要快速发布周期
- 高度自动化测试环境

## 核心原则

| 原则 | 说明 |
|------|------|
| 单一主分支 | 所有开发在 main/trunk 进行 |
| 小型提交 | 频繁提交小变更 |
| 功能标志 | 使用 feature flags 控制功能 |
| 持续整合 | 频繁合并到主分支 |

## 工作流程

### 直接在 trunk 工作

```bash
# 更新本地 main
git checkout main
git pull origin main

# 进行小型变更
git add .
git commit -m "feat: add user avatar display"
git push origin main
```

### 短期功能分支（可选）

```bash
# 建立短期分支（最长 1-2 天）
git checkout -b feat/quick-change
# 进行变更
git checkout main
git merge feat/quick-change
git push origin main
git branch -d feat/quick-change
```

## 功能标志

使用功能标志在生产环境控制未完成功能：

```javascript
// 功能标志范例
if (featureFlags.isEnabled('new-checkout-flow')) {
  return <NewCheckoutFlow />;
} else {
  return <LegacyCheckoutFlow />;
}
```

### 功能标志类型

| 类型 | 用途 | 生命周期 |
|------|------|----------|
| 发布标志 | 隐藏未完成功能 | 短期 |
| 实验标志 | A/B 测试 | 中期 |
| 权限标志 | 功能存取控制 | 长期 |
| 营运标志 | 系统行为控制 | 长期 |

## 前提条件

使用 Trunk-Based 开发需要：

1. **全面的自动化测试**
2. **快速的 CI/CD 管线**
3. **程式码审查文化**
4. **功能标志系统**
5. **即时监控能力**

## 优点

| 优点 | 说明 |
|------|------|
| 最少合并冲突 | 频繁整合减少冲突 |
| 持续整合 | 真正的 CI 实践 |
| 快速反馈 | 问题快速浮现 |
| 简化分支管理 | 无复杂分支策略 |

## 缺点

| 缺点 | 说明 |
|------|------|
| 需要高度纪律 | 团队必须遵守规则 |
| 需要强大的 CI | 测试和建置必须快速 |
| 功能标志复杂性 | 需要管理标志生命周期 |
| 不适合新手团队 | 需要经验和信任 |

## 相关选项

- [GitHub Flow](./github-flow.md) - 带有 PR 的简化流程
- [GitFlow](./gitflow.md) - 适合有排程发布的专案

---

## 授权条款

本文件采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权条款。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
