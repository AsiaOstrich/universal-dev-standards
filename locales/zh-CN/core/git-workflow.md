---
source: ../../../core/git-workflow.md
source_version: 1.4.0
translation_version: 1.4.0
last_synced: 2026-02-10
status: current
---

> **语言**: [English](../../../core/git-workflow.md) | [简体中文](../../zh-TW/core/git-workflow.md) | 简体中文

# Git 工作流程标准

**版本**: 1.0.0
**最后更新**: 2025-12-30
**适用范围**: 所有使用 Git 进行版本控制的项目

---

## 目的

本标准定义 Git 分支策略和工作流程，确保团队协作的一致性和代码质量。

---

## 工作流程选择

### 决策矩阵

| 工作流程 | 团队规模 | 发布频率 | 复杂度 | 最适合 |
|---------|---------|---------|--------|-------|
| GitHub Flow | 小型 | 持续 | 低 | SaaS、Web 应用 |
| Git Flow | 中大型 | 定期 | 高 | 产品软件 |
| Trunk-Based | 任意 | 持续 | 中 | DevOps 成熟团队 |
| GitLab Flow | 中型 | 环境驱动 | 中 | 多环境部署 |

---

## GitHub Flow（推荐）

最简单的工作流程，适合持续部署。

```
main ─────●─────●─────●─────●─────●─────
           \         /
feature     ●───●───●
```

### 分支

| 分支 | 用途 | 生命周期 |
|-----|------|---------|
| main | 生产就绪代码 | 永久 |
| feature/* | 新功能开发 | 临时 |

### 流程

1. 从 main 创建功能分支
2. 开发并提交变更
3. 创建 Pull Request
4. 代码审查
5. 合并到 main
6. 自动部署

---

## Git Flow

适合有定期发布周期的项目。

```
main     ─────●─────────────────●─────
              │                 │
develop  ─────●───●───●───●─────●─────
               \     /   \     /
feature         ●───●     \   /
                           \ /
release                     ●
```

### 分支

| 分支 | 用途 | 生命周期 |
|-----|------|---------|
| main | 生产版本 | 永久 |
| develop | 开发集成 | 永久 |
| feature/* | 新功能 | 临时 |
| release/* | 发布准备 | 临时 |
| hotfix/* | 紧急修复 | 临时 |

---

## Trunk-Based Development

适合高部署频率的成熟团队。

```
main ─────●───●───●───●───●───●───●─────
           \   /   \   /
short       ●─●     ●─●
branches
```

### 特点

- 分支生命周期 < 1 天
- 频繁集成到 main
- 依赖功能开关
- 需要强大的 CI/CD

---

## Trunk-Based Development + Feature Flags

### 功能开关整合

Trunk-Based Development 依赖功能开关安全地集成未完成功能：

```javascript
// 功能开关示例
if (featureFlags.isEnabled('new-checkout-flow', user)) {
  return newCheckoutFlow(cart);
} else {
  return legacyCheckout(cart);
}
```

### 功能开关生命周期

| 阶段 | 状态 | 动作 |
|------|------|------|
| 开发中 | 关闭 | 仅开发环境启用 |
| 测试中 | 部分启用 | 内部测试者启用 |
| 灰度发布 | 百分比推出 | 5% → 25% → 50% → 100% |
| 全量发布 | 完全启用 | 移除开关代码 |

### 最佳实践

- 开关不超过 2 周
- 追踪开关的创建日期和负责人
- 定期清理过期开关

---

## Ship/Show/Ask 决策模型

### 模型说明

决定代码变更如何合并到主分支：

| 模式 | 动作 | 适用场景 |
|------|------|---------|
| **Ship** | 直接合并 | 微小修复、文档、配置 |
| **Show** | 合并后审查 | 非关键功能、重构 |
| **Ask** | 审查后合并 | 核心功能、API 变更、安全相关 |

### 决策流程图

```
开始
  │
  ▼
是否涉及核心逻辑/安全？ ──是──► ASK（审查后合并）
  │
  否
  ▼
是否需要知识共享？ ──────是──► SHOW（合并后审查）
  │
  否
  ▼
SHIP（直接合并）
```

---

## Stacked PRs 工作流程

### 概念

将大型变更拆分为可独立审查的小型连续 PR：

```
main ────●───────────────────●─────
          \                 /
PR #1      ●──────●        /    (数据模型)
                   \      /
PR #2               ●────●      (API 端点)
                          \
PR #3                      ●    (前端整合)
```

### 建立步骤

```bash
# 1. 第一个 PR
git checkout main
git checkout -b feature/data-model
# ... 开发数据模型 ...
git push -u origin feature/data-model
# 创建 PR #1: main ← feature/data-model

# 2. 第二个 PR（基于第一个）
git checkout -b feature/api-endpoints
# ... 开发 API ...
git push -u origin feature/api-endpoints
# 创建 PR #2: feature/data-model ← feature/api-endpoints

# 3. 第三个 PR（基于第二个）
git checkout -b feature/frontend
# ... 开发前端 ...
git push -u origin feature/frontend
# 创建 PR #3: feature/api-endpoints ← feature/frontend
```

### 合并顺序

1. PR #1 合并后，更新 PR #2 的 base 到 main
2. PR #2 合并后，更新 PR #3 的 base 到 main
3. 依此类推

---

## Conventional PR 标题

### 格式

```
<type>(<scope>): <description>

Examples:
feat(auth): add OAuth2 login support
fix(api): resolve rate limiting issue
docs(readme): update installation guide
```

### 类型参考

| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | 错误修复 |
| docs | 文档变更 |
| style | 格式变更 |
| refactor | 重构 |
| test | 测试相关 |
| chore | 维护任务 |

### GitHub Actions 验证

```yaml
name: PR Title Check
on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: amannn/action-semantic-pull-request@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 分支命名规范

### 格式

```
<type>/<ticket>-<description>
```

### 类型

| 类型 | 用途 | 示例 |
|-----|------|------|
| feature | 新功能 | feature/PROJ-123-user-login |
| fix | 错误修复 | fix/PROJ-456-payment-error |
| hotfix | 紧急修复 | hotfix/PROJ-789-security-patch |
| release | 发布准备 | release/v2.0.0 |
| docs | 文档更新 | docs/api-documentation |
| refactor | 重构 | refactor/auth-module |

---

## Pull Request 规范

### 标题格式

```
<type>(<scope>): <description>
```

### 描述模板

```markdown
## 概述
简要描述这个 PR 的目的

## 变更内容
- 变更 1
- 变更 2

## 测试方案
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动测试完成

## 相关 Issue
Closes #123
```

---

## 快速参考卡

### 工作流程选择

| 问题 | 答案 | 推荐 |
|------|------|------|
| 持续部署？ | 是 | GitHub Flow |
| 定期发布？ | 是 | Git Flow |
| 多环境？ | 是 | GitLab Flow |
| DevOps 成熟？ | 是 | Trunk-Based |

### 分支命名

| 做什么？ | 分支前缀 |
|---------|---------|
| 新功能 | feature/ |
| 修复错误 | fix/ |
| 紧急修复 | hotfix/ |
| 发布准备 | release/ |

---

## 相关标准

- [提交消息指南](commit-message-guide.md)
- [代码审查清单](code-review-checklist.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.3.0 | 2026-01-24 | 新增：Trunk-Based + Feature Flags、Ship/Show/Ask、Stacked PRs、Conventional PR 标题 |
| 1.2.1 | 2026-01-08 | 修复：翻译同步 |
| 1.2.0 | 2026-01-05 | 新增：工作流程选择决策矩阵 |
| 1.0.0 | 2025-12-30 | 初始 Git 工作流程标准 |

---

## 参考资料

- [Ship/Show/Ask](https://martinfowler.com/articles/ship-show-ask.html) - Martin Fowler 文章
- [Feature Flags Best Practices](https://launchdarkly.com/blog/best-practices-for-feature-flags/) - LaunchDarkly
- [Stacked Diffs](https://newsletter.pragmaticengineer.com/p/stacked-diffs) - The Pragmatic Engineer
- [Conventional Commits](https://www.conventionalcommits.org/) - 提交消息规范
- [Trunk-Based Development](https://trunkbaseddevelopment.com/) - 官方指南

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
