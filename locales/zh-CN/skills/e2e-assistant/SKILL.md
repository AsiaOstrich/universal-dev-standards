---
source: ../../../../skills/e2e-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-10
status: current
description: "[UDS] 从 BDD 场景生成 E2E 测试骨架，支持框架检测与覆盖差距分析"
---

# E2E 助手

> **语言**: [English](../../../../skills/e2e-assistant/SKILL.md) | 简体中文

> [!WARNING]
> **实验性功能 / Experimental Feature**
>
> 此功能正在积极开发中，可能在 v4.0 中有重大变更。
> This feature is under active development and may change significantly in v4.0.

从 BDD `.feature` 场景生成 E2E 测试骨架，支持框架检测与覆盖差距分析。

## 工作流程

```
/derive bdd → .feature 场景
    ↓
/e2e → 分析 AC 适用性 → 检测框架 → 参考既有模式 → 生成骨架
    ↓
手动执行验证
```

## 模式

### 1. 生成模式（默认）

分析 BDD 场景、分类 AC 适用性、检测框架、生成 E2E 测试骨架。

### 2. 分析模式（--analyze）

扫描 BDD feature 与既有 E2E 测试之间的覆盖差距。

## AC 分类

| 类别 | 条件 | 示例 |
|------|------|------|
| `e2e-suitable` | 多步骤用户流程或 UI 交互 | 登录 → 操作 → 验证 |
| `integration-suitable` | 跨组件但无 UI | API 调用 → DB 写入 |
| `unit-suitable` | 纯逻辑或计算 | 排序、验证、格式化 |

## 支持框架

| 框架 | 自动检测 | 模板 |
|------|:--------:|------|
| Playwright | ✅ | `@playwright/test` |
| Cypress | ✅ | `cy.*` 指令 |
| Vitest | ✅ | `describe/it` + async |

## 使用方式

```
/e2e <feature-file>            - 从 BDD 场景生成 E2E 骨架
/e2e <spec-file>               - 委派 /derive e2e 处理 SDD 规格
/e2e --analyze                 - 扫描所有 feature 的 E2E 覆盖差距
/e2e --analyze <feature-file>  - 分析特定 feature 的 AC 适用性
```

## 下一步引导

`/e2e` 完成后，AI 助手应建议：

> **E2E 骨架已生成。建议下一步：**
> - 执行 `/tdd` 填入 `[TODO]` 标记的测试实现 ⭐ **推荐** — 实现测试逻辑
> - 执行 `/checkin` 质量关卡（若功能完成）
> - 执行 `/e2e --analyze` 检查整体 E2E 覆盖状况

## 参考

- 规格：[SPEC-E2E-001](../../../../docs/specs/skills/SPEC-E2E-001-e2e-skill.md)
- 核心规范：[testing-standards.md](../../../../core/testing-standards.md)
- 工具程序：`cli/src/utils/e2e-analyzer.js`、`cli/src/utils/e2e-detector.js`

## AI 代理行为

> 完整的 AI 行为定义请参阅对应的命令文件：[`/e2e`](../../commands/e2e.md#ai-agent-behavior--ai-代理行为)
