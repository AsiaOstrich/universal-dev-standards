---
source: ../../../core/changelog-standards.md
source_version: 1.0.2
translation_version: 1.0.2
last_synced: 2026-01-08
status: current
---

> **语言**: [English](../../core/changelog-standards.md) | [简体中文](../../zh-TW/core/changelog-standards.md) | 简体中文

# 变更日志标准

**版本**: 1.0.0
**最后更新**: 2025-12-30
**适用范围**: 所有需要记录版本变更的项目

---

## 目的

本标准定义如何编写清晰、有用的变更日志，帮助用户和开发者了解版本之间的变化。

---

## 格式

### 文件结构

```markdown
# Changelog

所有重要变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/)，
本项目遵循 [语义化版本](https://semver.org/)。

## [Unreleased]

### Added
- 新功能 X

### Changed
- 变更 Y

## [1.0.0] - 2025-01-15

### Added
- 初始发布
```

---

## 变更类型

| 类型 | 说明 | 示例 |
|------|------|------|
| Added | 新功能 | 添加用户登录功能 |
| Changed | 现有功能变更 | 更新 API 响应格式 |
| Deprecated | 即将移除的功能 | 弃用 v1 API |
| Removed | 已移除的功能 | 移除旧版认证 |
| Fixed | 错误修复 | 修复支付计算错误 |
| Security | 安全相关变更 | 修复 XSS 漏洞 |

---

## 编写指南

### 良好的变更日志条目

```markdown
### Added
- 添加用户可以导出数据为 CSV 格式的功能 (#123)
- 添加深色模式支持

### Fixed
- 修复在 Safari 浏览器中登录按钮无响应的问题 (#456)
```

### 避免的写法

```markdown
### Changed
- 更新了一些东西
- 修复了 bug
- 代码重构
```

---

## 排除规则

### 不记录的内容

| 类别 | 示例 | 原因 |
|------|------|------|
| 构建输出 | dist/, build/ | 不在版本控制中 |
| 依赖目录 | node_modules/, vendor/ | 不在版本控制中 |
| 环境文件 | .env, secrets.* | 包含敏感信息 |
| 本地配置 | *.local.json | 个人配置 |
| AI 工具 | .claude/, .cursor/ | 本地开发辅助 |

---

## 版本链接

在文件末尾添加版本比较链接：

```markdown
[Unreleased]: https://github.com/user/repo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/user/repo/releases/tag/v1.0.0
```

---

## 快速参考卡

### 变更类型速查

| 做了什么？ | 类型 |
|-----------|-----|
| 添加新功能 | Added |
| 修改现有功能 | Changed |
| 计划移除功能 | Deprecated |
| 已移除功能 | Removed |
| 修复错误 | Fixed |
| 安全修复 | Security |

### 检查清单

- [ ] 使用正确的变更类型
- [ ] 描述清晰具体
- [ ] 包含相关 issue 链接
- [ ] 按重要性排序
- [ ] 保持一致的格式

---

## 相关标准

- [版本标准](versioning.md)
- [提交消息指南](commit-message-guide.md)

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
