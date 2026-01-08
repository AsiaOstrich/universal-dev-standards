---
source: ../../../core/git-workflow.md
source_version: 1.2.1
translation_version: 1.2.1
last_synced: 2026-01-08
status: current
---

> **语言**: [English](../../../core/git-workflow.md) | [繁體中文](../../zh-TW/core/git-workflow.md) | 简体中文

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
| develop | 开发整合 | 永久 |
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
- [代码审查指南](code-review-guide.md)

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
