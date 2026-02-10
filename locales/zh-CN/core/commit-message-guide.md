---
source: ../../../core/commit-message-guide.md
source_version: 1.2.3
translation_version: 1.2.3
last_synced: 2026-01-08
status: current
---

> **语言**: [English](../../../core/commit-message-guide.md) | [简体中文](../../zh-TW/core/commit-message-guide.md) | 简体中文

# 提交消息指南

**版本**: 1.0.0
**最后更新**: 2025-12-30
**适用范围**: 所有使用 Git 进行版本控制的项目

---

## 目的

本标准定义如何撰写清晰、有意义的 Git 提交消息，以提升项目历史的可读性和可追溯性。

---

## 格式

### 标准格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 组成说明

| 组成 | 必要性 | 说明 |
|------|-------|------|
| type | 必要 | 变更类型 |
| scope | 可选 | 影响范围 |
| subject | 必要 | 简短描述 |
| body | 可选 | 详细说明 |
| footer | 可选 | 引用、破坏性变更 |

---

## 变更类型 (Type)

| 类型 | 说明 | 示例 |
|------|------|------|
| feat | 新功能 | 添加用户登录功能 |
| fix | 错误修复 | 修复支付金额计算错误 |
| docs | 文档变更 | 更新 API 文档 |
| style | 格式调整（不影响代码逻辑） | 调整代码缩进 |
| refactor | 重构（非新功能、非错误修复） | 重构用户认证模块 |
| perf | 性能优化 | 优化数据库查询 |
| test | 测试相关 | 添加单元测试 |
| build | 构建系统变更 | 更新 webpack 配置 |
| ci | CI 配置变更 | 更新 GitHub Actions |
| chore | 其他变更 | 更新依赖版本 |
| revert | 回滚提交 | 回滚上一次提交 |

---

## 示例

### 简单提交

```
feat(auth): add user login functionality
```

### 带正文的提交

```
fix(payment): correct amount calculation

The payment amount was being rounded incorrectly
when processing international transactions.

Closes #123
```

### 破坏性变更

```
feat(api)!: change user endpoint response format

BREAKING CHANGE: The /api/users endpoint now returns
a different JSON structure. See migration guide.
```

---

## 快速参考卡

### 提交类型速查

| 我做了什么？ | 使用类型 |
|-------------|---------|
| 添加新功能 | feat |
| 修复错误 | fix |
| 更新文档 | docs |
| 重构代码 | refactor |
| 优化性能 | perf |
| 添加测试 | test |

### 检查清单

- [ ] 类型正确
- [ ] 主题简洁（50 字符内）
- [ ] 使用祈使句
- [ ] 正文说明"为什么"
- [ ] 引用相关 issue

---

## 相关标准

- [Git 工作流程](git-workflow.md)
- [代码审查指南](code-review-checklist.md)

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
