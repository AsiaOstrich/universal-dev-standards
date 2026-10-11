---
source: ../../../../options/git-workflow/trunk-based.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 08f932654363
status: current
---

# Trunk-Based 开发

> **语言**: [English](../../../../options/git-workflow/trunk-based.md) | 简体中文

**上层标准**: [Git 工作流程](../../../../core/git-workflow.md)

---

## 概述

Trunk-Based Development（主干开发）是一种源代码控制分支模型：开发者在名为 "trunk"（main）的单一分支上协作开发，避免创建长期存在的分支，并使用功能开关（feature flag）来管理尚未完成的功能。

## 适用场景

- 持续部署（每天多次）
- 成熟的 CI/CD 流水线
- 经验丰富的开发团队
- 微服务架构

## 分支结构

| 分支 | 用途 | 生命周期 |
|------|------|----------|
| `main` (trunk) | 唯一可信来源，始终可部署 | 永久 |
| `feature/*` | 生命周期极短的功能分支（可选） | 最长 1-2 天 |

## 核心原则

1. **小而频繁的提交** - 每天多次提交到 trunk
2. **功能开关** - 将未完成的功能隐藏在开关之后
3. **trunk 始终保持绿色** - 每次提交都必须通过所有测试
4. **没有长期分支** - 分支最多存在 2 天
5. **快速 CI** - 构建和测试以分钟计，而不是小时

## 工作流程：直接提交

对于小型变更，直接提交到 trunk：

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

对于稍大的变更（仍少于 2 天）：

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

## 功能开关

功能开关对主干开发至关重要：

```javascript
// Example feature flag usage
if (featureFlags.isEnabled('new-checkout-flow')) {
  return <NewCheckout />;
}
return <OldCheckout />;
```

### 功能开关生命周期

1. **创建开关** - 在开始功能开发之前
2. **在开关后开发** - 所有新代码都由开关隐藏
3. **开启开关进行测试** - QA 测试该功能
4. **逐步发布** - 按用户百分比逐步启用
5. **移除开关** - 功能稳定后

## 最佳实践

### 结对编程
- 实时代码审查
- 更高质量的提交
- 知识共享

### 测试驱动开发
- 先写测试
- 对 trunk 稳定性高度有信心
- 快速反馈

### 持续集成
- 每次提交都运行测试
- 自动化部署
- 快速构建（< 10 分钟）

### 监控
- 实时错误追踪
- 快速回滚能力
- 功能开关分析

## 提交指南

```bash
# Good: Small, atomic commits
git commit -m "feat: add user avatar field to schema"
git commit -m "feat: add avatar upload endpoint"
git commit -m "feat: add avatar display component"

# Bad: Large, compound commits
git commit -m "feat: add complete avatar feature with upload, display, and tests"
```

## 优点

- 变更集成速度最快
- 合并冲突极少
- 鼓励小型、易于审查的变更
- 支持持续部署

## 缺点

- 需要成熟的 CI/CD
- 需要功能开关基础设施
- 对技能要求较高
- 并不适合所有规模的团队

## 前提条件

- [ ] 快速、可靠的 CI 流水线（构建 < 10 分钟）
- [ ] 高测试覆盖率
- [ ] 功能开关系统
- [ ] 监控与回滚能力
- [ ] 团队具备 Git 使用经验

## 相关选项

- [GitHub Flow](./github-flow.md) - 较宽松，允许较长的分支
- [GitFlow](./gitflow.md) - 适用于按计划发布

---

## 许可

本文档采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
