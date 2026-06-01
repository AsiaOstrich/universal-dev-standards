---
source: ../../../../skills/reverse-engineer/SKILL.md
source_version: 1.2.0
source_hash: d543b24b2422
translation_version: 1.2.0
last_synced: 2026-06-01
status: current
description: |
  系统考古——跨逻辑、数据、运行时三维度逆向工程代码。
  使用时机：从代码提取规格、分析数据模型、分析运行时基准、生成 Gherkin 场景、分析测试覆盖率。
  关键字：reverse engineering, spec, data, runtime, bdd, tdd, 逆向工程, 规格, 覆盖率。
---

# 逆向工程助手

> **语言**: [English](../../../../skills/reverse-engineer/SKILL.md) | 简体中文

系统考古框架：从三个维度逆向工程既有系统——**逻辑**、**数据**、**运行时**。

## 三大维度

```
┌─────────────────────────────────────────────────────────┐
│              System Archeology Framework                   │
├──────────┬──────────────┬────────────────────────────────┤
│  Logic   │     Data     │          Runtime               │
│ (spec)   │    (data)    │         (runtime)              │
├──────────┼──────────────┼────────────────────────────────┤
│ APIs     │ DB Schemas   │ Logs & Error Patterns          │
│ Modules  │ ORMs/Models  │ Config & Environment           │
│ Flows    │ Migrations   │ Metrics & Performance          │
│ Tests    │ Seed Data    │ Infra & Deployment             │
└──────────┴──────────────┴────────────────────────────────┘
```

## 子命令

| 子命令 | 维度 | 输入 | 输出 | 说明 |
|--------|------|------|------|------|
| *(无)* | 全部 | 项目根目录 | 完整考古报告 | 三维度全面分析 |
| `spec` | 逻辑 | 代码文件/目录 | `SPEC-XXX.md` | 从代码提取规格 |
| `data` | 数据 | DB 结构、ORM、迁移文件 | 数据模型规格 | 分析数据模型与结构 |
| `runtime` | 运行时 | 日志、配置、指标 | 运行时基准 | 分析运行时基准 |
| `bdd` | — | `SPEC-XXX.md` | `.feature` | 将 AC 转为 Gherkin |
| `tdd` | — | `.feature` | 覆盖率报告 | 分析测试覆盖率 |

## 全面分析模式

当 `/reverse` 在未带子命令的情况下被调用时，依序执行全部三个维度：

1. **数据（Data）** → 扫描结构、ORM、迁移文件
2. **运行时（Runtime）** → 分析日志、配置、部署
3. **逻辑（Logic / spec）** → 提取 API、流程、测试 → 生成 SPEC

输出：整合三个维度的 **系统考古报告（System Archeology Report）**。

## 维度详情

### spec：逻辑维度（既有）

1. **扫描** - 读取源代码文件，识别公开 API、数据流与业务逻辑
2. **分类** - 将每个发现标记为 `[Confirmed]`、`[Inferred]` 或 `[Unknown]`
3. **结构化** - 整理为 SDD 规格格式，包含验收条件
4. **引用来源** - 每项逆向结果皆以 `file:line` 引用来源

### data：数据维度（新增）

1. **探索** - 找出数据库结构、ORM 模型、迁移文件、种子数据
2. **映射** - 从代码证据建立实体关联模型
3. **分类** - 将关联标记为 `[Confirmed]`（FK 约束）或 `[Inferred]`（代码模式）
4. **报告** - 输出数据模型规格，包含：
   - 含字段与类型的实体清单
   - 关联映射（1:1、1:N、M:N）
   - 索引与约束清单
   - 迁移历史摘要
   - 数据流路径（写入 → 读取）

**证据来源**：`schema.prisma`、`*.migration.*`、`models/`、`entities/`、`knexfile.*`、`sequelize`、`typeorm`、SQL 文件、`docker-compose.yml`（DB 服务）

### runtime：运行时维度（新增）

1. **扫描配置** - 环境变量、配置文件、功能开关
2. **分析日志** - 日志模式、错误频率、日志级别
3. **检查基础设施** - Docker 配置、CI/CD 流水线、部署清单
4. **建立基准** - 输出运行时基准，包含：
   - 环境变量清单（仅名称，**绝不含值/密钥**）
   - 配置文件映射与层级
   - 外部服务依赖（API、队列、缓存）
   - 部署拓扑（容器、服务）
   - 健康检查与监控端点

**证据来源**：`.env.example`、`docker-compose.yml`、`Dockerfile`、`*.config.*`、CI/CD 文件、`k8s/`、日志文件（仅模式）

**安全性**：绝不输出实际密钥值。仅列出变量名称并描述其用途。

## 防幻觉规则

| 规则 | 要求 |
|------|------|
| **确定性标签** | 所有发现须使用 `[Confirmed]`、`[Inferred]`、`[Unknown]` 标注 |
| **来源引用** | 每项逆向结果须引用 `file:line` 来源 |
| **禁止捏造** | 不得捏造代码中不存在的 API 或行为 |
| **禁止密钥** | 不得输出配置文件或环境变量的密钥值 |

## 使用方式

```
/reverse                              - 三维度全面分析
/reverse spec src/auth/               - 逻辑：提取规格
/reverse data                         - 数据：分析结构与模型
/reverse runtime                      - 运行时：分析配置与基础设施
/reverse bdd specs/SPEC-AUTH.md       - 将规格 AC 转为 Gherkin
/reverse tdd features/auth.feature    - 分析测试覆盖率
```

## 下一步引导

`/reverse`（完整或 `spec`）完成后，AI 助手应建议：

> **系统考古完成。建议下一步：**
> - 执行 `/sdd` 审查并核准此规格 ⭐ **推荐** — 审查并核准生成的规格
> - 执行 `/derive` 从规格推导测试 — 从规格推导测试（须先核准）
> - 审查规格中的 `[Inferred]` 和 `[Unknown]` 标记 — 手动审查不确定性标签

## 参考

- 详细指南：[guide.md](./guide.md)
- 核心规范：[reverse-engineering-standards.md](../../../../core/reverse-engineering-standards.md)

## AI 代理行为

> 完整的 AI 行为定义请参阅对应的命令文件：[`/reverse`](../commands/reverse.md#ai-agent-behavior--ai-代理行为)
