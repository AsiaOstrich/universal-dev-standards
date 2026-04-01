---
source: ../../../core/test-data-standards.md
source_version: "1.0.0"
translation_version: "1.0.0"
last_synced: "2026-04-01"
status: current
---

# 测试数据标准

> 版本: 1.0.0 | 最后更新: 2026-04-01

## 概述

本文件定义跨所有测试层级的测试数据管理标准，涵盖数据策略选择、PII 匿名化、Fixture 与 Schema Migration 同步、测试隔离原则、Factory Pattern 及常见反模式。

---

## 测试数据策略

| 策略 | 说明 | 适用场景 | 测试层级 |
|------|------|---------|---------|
| **Inline Data** | 直接在测试代码中定义数据 | 简单、聚焦的值 | Unit tests |
| **Fixture Files** | 外部 JSON/YAML/SQL 文件 | 共用参考数据、复杂结构 | Integration tests |
| **Seed Scripts** | 填充数据库的可执行脚本 | 完整环境设置、真实数据集 | E2E tests |

### 策略选择指南

```
Unit test?         → Inline data（简单、自包含）
Integration test?  → Fixture files（共用、结构化）
E2E test?          → Seed scripts（完整环境设置）
```

---

## 数据匿名化规则

测试需要拟真数据时，**绝不使用真实 PII**：

| PII 字段 | 匿名化技术 | 示例 |
|----------|-----------|------|
| **姓名** | 使用 Faker 或虚构化名 | `John Smith` → `Jane Doe` |
| **Email** | 替换为 `@example.com` | `john@company.com` → `user1@example.com` |
| **电话** | 格式保留遮罩 | `+1-555-123-4567` → `+1-555-000-0001` |
| **地址** | 泛化为虚构地址 | `123 Main St` → `1 Test Ave, Anytown` |
| **ID** | Hash 或 UUID 生成 | `SSN: 123-45-6789` → `ID: test-uuid-0001` |

---

## Fixture 与 Schema Migration 同步

1. **原子更新**：Migration 变更字段时，同一 commit 更新所有相关 fixture
2. **自动检测**：CI 验证 fixture 与当前 schema 一致
3. **Fixture 版本化**：加入 `_schema_version` 字段
4. **Migration 检查清单**：PR 模板加入「更新测试 fixture」项目

---

## 测试隔离原则

| 测试层级 | 隔离策略 |
|---------|---------|
| **Unit** | 纯函数；mock 外部依赖 |
| **Integration** | Transaction rollback；测试专用 schema |
| **E2E** | 专用测试环境；唯一命名空间数据 |

核心规则：每个测试创建自己的数据、清理自己的数据、无共享可变状态、可并行执行、幂等。

---

## Factory Pattern

Factory 提供合理默认值，可按测试需求覆写：

```
function createUser(overrides = {}) {
  return {
    id: generateUUID(),
    name: 'Default User',
    email: 'default@example.com',
    role: 'viewer',
    ...overrides
  };
}
```

最佳实践：每个实体一个 factory、最小默认值、可组合、无副作用。

---

## 快速参考卡

### 隔离检查清单
```
[ ] 测试创建自己的数据
[ ] 测试清理自己的数据
[ ] 无共享可变状态
[ ] 可安全并行执行
[ ] 每次结果相同
```

---

## 许可

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。
