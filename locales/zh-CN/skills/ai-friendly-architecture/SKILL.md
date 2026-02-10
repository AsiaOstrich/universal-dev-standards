---
source: ../../../../skills/ai-friendly-architecture/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-05
status: current
scope: uds-specific
description: |
  设计 AI 友善架构，包含明确模式、分层文档和语义边界。
  使用时机：为 AI 协作规划项目结构、优化代码库以利 AI 分析、设置 AI 上下文。
  关键字：architecture, AI-friendly, context, modules, documentation layers, .ai-context.yaml, 架构, AI 友善, 上下文.
---

# AI 友善架构指南

> **语言**: [English](../../../../skills/ai-friendly-architecture/SKILL.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-01-25
**适用范围**: Claude Code Skills

---

> **核心标准**: 本技能实现 [AI 友善架构](../../../../core/ai-friendly-architecture.md)。完整方法论文档请参阅核心标准。

## 目的

本技能协助设计项目架构，通过明确模式、分层文档和语义边界，最大化 AI 协作效能。

## 快速参考

### 核心原则

| 原则 | 描述 | 效益 |
|------|------|------|
| **明确优于隐含** | 明确记录行为 | AI 无需猜测即可理解 |
| **分层上下文** | 多层级文档 | 依任务提供适当细节 |
| **语义边界** | 清晰的模块边界 | 独立分析 |
| **可发现结构** | 自我说明的结构 | 快速定位 |

### 上下文层级

| 层级 | Token 预算 | 内容 |
|------|------------|------|
| **L1: 快速参考** | < 500 | 单行说明、API 签名、入口点 |
| **L2: 详细** | < 5,000 | 完整 API 文档、使用示例 |
| **L3: 示例** | 无限制 | 完整实现、边界案例 |

### 建议结构

```
project/
├── .ai-context.yaml          # AI 上下文配置
├── docs/
│   ├── QUICK-REF.md          # 第 1 层文档
│   └── ARCHITECTURE.md       # 第 2 层文档
├── src/
│   └── auth/
│       ├── index.ts          # 入口点与模块头部
│       ├── QUICK-REF.md      # 模块快速参考
│       └── README.md         # 模块文档
└── CLAUDE.md                 # AI 指令文件
```

## 模块头部模板

```javascript
/**
 * ═══════════════════════════════════════════════════════════
 * 模块: [模块名称]
 * ═══════════════════════════════════════════════════════════
 *
 * 目的: [单句描述]
 *
 * 依赖:
 *   - [dep1]: [原因]
 *   - [dep2]: [原因]
 *
 * 导出:
 *   - [function1](params): [描述]
 *   - [function2](params): [描述]
 *
 * 配置:
 *   - [CONFIG_VAR]: [描述]
 *
 * ═══════════════════════════════════════════════════════════
 */
```

## 详细指南

完整标准请参阅：
- [AI 友善架构标准](../../../../core/ai-friendly-architecture.md)

### AI 优化格式（Token 效率）

AI 助手可使用 YAML 格式文件以减少 Token 使用：
- 基础标准：`ai/standards/ai-friendly-architecture.ai.yaml`

## .ai-context.yaml 配置

```yaml
# .ai-context.yaml - AI 上下文配置
version: 1.0.0

project:
  name: my-project
  type: web-app  # web-app | library | cli | api | monorepo
  primary-language: typescript

modules:
  - name: auth
    path: src/auth/
    entry: index.ts
    description: 验证与授权
    dependencies: [database, crypto]
    priority: high

  - name: api
    path: src/api/
    entry: routes.ts
    description: REST API 端点
    dependencies: [auth, database]
    priority: high

analysis-hints:
  entry-points:
    - src/main.ts
    - src/index.ts
  ignore-patterns:
    - node_modules
    - dist
    - "*.test.ts"
  architecture-type: layered

documentation:
  quick-ref: docs/QUICK-REF.md
  detailed: docs/ARCHITECTURE.md
  examples: docs/examples/
```

## 上下文优先顺序指南

| 优先级 | 内容类型 | 原因 |
|--------|----------|------|
| 1 | 入口点 | 应用程序结构 |
| 2 | .ai-context.yaml | 模块地图和依赖 |
| 3 | QUICK-REF 文件 | 快速 API 理解 |
| 4 | 修改的文件 | 与任务直接相关 |
| 5 | 依赖链 | 变更的上下文 |

## 应避免的反模式

| 反模式 | 问题 | 解决方案 |
|--------|------|----------|
| **魔术字符串** | AI 无法追踪常量 | 带文档的类型常量 |
| **隐式路由** | 隐藏行为 | 明确路由映射 |
| **全局状态** | 不可预测的依赖 | 依赖注入 |
| **循环依赖** | 上下文混乱 | 层级式依赖 |
| **单体文件** | 上下文溢出 | 专注的模块 |

## 实现检查清单

### 快速开始（< 1 小时）

- [ ] 创建 `.ai-context.yaml` 含模块清单
- [ ] 在项目根目录添加 `QUICK-REF.md`
- [ ] 在 README 中记录入口点
- [ ] 为主要文件添加模块头部

### 标准实现（< 1 天）

- [ ] 完成 `.ai-context.yaml` 配置
- [ ] 为每个主要模块添加 `QUICK-REF.md`
- [ ] 记录所有公开 API 及类型信息
- [ ] 为大型文件添加区段分隔

---

## 配置侦测

本技能支持项目特定配置。

### 侦测顺序

1. 检查是否存在 `.ai-context.yaml`
2. 检查是否存在 `QUICK-REF.md` 文件
3. 若未找到，**建议创建 AI 友善结构**

### 首次设置

若未找到配置：

1. 建议：「此项目尚未为 AI 协作进行配置。是否要设置 AI 友善结构？」
2. 创建 `.ai-context.yaml` 模板
3. 在项目根目录创建 `QUICK-REF.md`

---

## 相关标准

- [AI 友善架构](../../../../core/ai-friendly-architecture.md) - 核心架构标准
- [项目结构](../../../../core/project-structure.md) - 目录组织
- [文档结构](../../../../core/documentation-structure.md) - 文档分层
- [反幻觉](../../../../core/anti-hallucination.md) - AI 准确性标准

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-01-25 | 初始发布 |

---

## 授权

本技能以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
