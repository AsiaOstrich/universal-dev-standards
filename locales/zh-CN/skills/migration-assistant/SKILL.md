---
source: ../../../../skills/migration-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
status: current
description: |
  引导代码迁移、框架升级与技术现代化。
  使用时机：框架升级、语言迁移、API 版本更新、依赖现代化。
  关键字：migration, upgrade, modernize, framework, dependency, 迁移, 升级, 现代化。
---

# 迁移助手

> **语言**: [English](../../../../skills/migration-assistant/SKILL.md) | 简体中文

引导系统性代码迁移、框架升级与技术现代化。

## 使用方式

| 命令 | 用途 |
|------|------|
| `/migrate` | 启动交互式迁移引导 |
| `/migrate --assess` | 仅风险评估 |
| `/migrate "Vue 2 to 3"` | 引导特定迁移 |
| `/migrate --deps` | 依赖升级分析 |
| `/migrate --rollback` | 规划回滚策略 |

## 迁移类型

| 类型 | 范例 | 风险 |
|------|------|------|
| **框架升级** | React 17→18, Vue 2→3 | 中高 |
| **语言迁移** | JS→TS, Python 2→3 | 高 |
| **API 版本** | REST v1→v2, GraphQL 更新 | 中 |
| **数据库迁移** | MySQL→PostgreSQL | 极高 |
| **构建工具** | Webpack→Vite | 低中 |
| **包管理器** | npm→pnpm | 低 |

## 风险评估矩阵

| | 低影响 | 中影响 | 高影响 |
|---|--------|--------|--------|
| **低复杂度** | 安全（直接进行） | 谨慎 | 仔细规划 |
| **中复杂度** | 谨慎 | 规划 + 测试 | 分阶段发布 |
| **高复杂度** | 规划 + 测试 | 分阶段发布 | 完整 SDD 规格 |

## 工作流程

1. **评估** - 评估现状、识别破坏性变更
2. **规划** - 建立含依赖关系的迁移清单
3. **准备** - 设定 codemods、兼容层、功能旗标
4. **迁移** - 分阶段执行迁移并测试
5. **验证** - 执行完整测试套件、检查回归
6. **清理** - 移除兼容层、旧依赖

## 回滚策略

| 方式 | 使用时机 |
|------|---------|
| **Git revert** | 小型、原子性变更 |
| **功能旗标** | 需要逐步发布 |
| **双运行** | 关键系统、零停机 |
| **分支冻结** | 一次性完整迁移 |

## 下一步引导

`/migrate` 完成后，AI 助手应建议：

> **迁移分析完成。建议下一步：**
> - 执行 `/reverse` 深入理解现有代码
> - 执行 `/testing` 确保迁移后测试通过
> - 执行 `/commit` 提交迁移变更

## 参考

- 核心规范：[refactoring-standards.md](../../../../core/refactoring-standards.md)
