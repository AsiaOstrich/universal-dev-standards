---
source: ../../../../skills/database-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-23
status: current
description: |
  引导数据库设计、迁移规划和查询优化。
  使用时机：schema 设计、迁移规划、查询优化、索引策略。
  关键字：database, schema, migration, SQL, index, query, 数据库, 迁移, 查询。
---

# 数据库助手

> **语言**: [English](../../../../skills/database-assistant/SKILL.md) | 简体中文

引导数据库设计、迁移规划和查询优化。

## 核心原则

| 原则 | 说明 |
|------|------|
| 规范化 | 消除冗余（至少 3NF） |
| 参照完整性 | 强制外键约束 |
| 索引策略 | 依查询模式建立索引 |
| 迁移安全 | 可逆、零停机 |
| 数据保护 | 加密敏感字段、审计访问 |

## Schema 设计检查清单

- [ ] 主键已定义（建议 UUID 或 BIGINT）
- [ ] 外键含适当的 ON DELETE/UPDATE 策略
- [ ] 必填字段加 NOT NULL 约束
- [ ] 常查询字段建立索引
- [ ] 所有表加创建/更新时间戳
- [ ] 敏感数据静态加密
- [ ] 命名惯例一致（snake_case）

## 规范化快速参考

| 范式 | 规则 |
|------|------|
| **1NF** | 原子值、无重复组 |
| **2NF** | 1NF + 无部分依赖 |
| **3NF** | 2NF + 无传递依赖 |
| **反规范化** | 仅针对已证实的读取性能需求 |

## 迁移工作流程

```
PLAN ──► WRITE ──► TEST ──► DEPLOY ──► VERIFY
```

### 1. Plan — 评估影响
识别受影响的表、估算数据量、规划回滚策略。

### 2. Write — 编写迁移
编写正向和回滚脚本。使用递增编号的迁移。

### 3. Test — 验证迁移
在 staging 环境使用类生产数据执行。验证迁移后数据完整性。

### 4. Deploy — 执行迁移
在维护窗口执行，或使用在线 Schema 变更工具。

### 5. Verify — 确认成功
检查行数、约束有效性、应用程序功能。

## 索引策略

| 类型 | 使用场景 |
|------|----------|
| B-tree | 等值、范围查询（默认） |
| Hash | 仅精确匹配 |
| GIN | 全文搜索、JSONB |
| Partial | 过滤子集 |
| Composite | 多字段查询 |

## 使用方式

- `/database` - 交互式数据库设计引导
- `/database schema` - 审查 Schema 设计
- `/database --migration` - 迁移规划助手

## 下一步引导

`/database` 完成后，AI 助手应建议：

> **数据库设计完成。建议下一步：**
> - 执行 `/security` 检查数据保护措施
> - 执行 `/testing` 规划数据库测试策略
> - 执行 `/checkin` 确认迁移符合提交规范
> - 生成 API 端点 → 执行 `/api-design`

## 参考

- 核心规范：[database-standards.md](../../../../core/database-standards.md)
