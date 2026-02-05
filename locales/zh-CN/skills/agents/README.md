---
source: ../../../../skills/agents/README.md
source_version: 1.1.0
translation_version: 1.0.0
last_synced: 2026-02-05
status: current
---

# UDS 代理

> **语言**: [English](../../../../skills/agents/README.md) | 简体中文

**版本**: 1.1.0
**最后更新**: 2026-01-21
**状态**: 稳定

---

## 概述

UDS 代理是专门的 AI 子代理，可以协调处理复杂的开发工作流程。与技能（提供上下文/知识）不同，代理是可以执行多步骤任务的自主实体。

## AGENT.md 格式规格

### Frontmatter 架构

```yaml
---
# === 必填字段 ===
name: agent-name              # 唯一标识符（kebab-case）
version: 1.0.0                # 语义版本
description: |                # 用于 AI 匹配的多行描述
  代理目的的简要描述。
  关键字: keyword1, keyword2, keyword3.

# === 角色配置 ===
role: specialist              # orchestrator | specialist | reviewer
expertise:                    # 领域专长
  - system-design
  - api-design
  - database-modeling

# === 工具权限（Claude Code Task 工具）===
# 指定此代理可以使用哪些工具
allowed-tools:
  - Read                      # 文件读取
  - Glob                      # 模式匹配
  - Grep                      # 内容搜索
  - Bash(git:*)               # 仅 Git 命令
  - WebFetch                  # 网页抓取
  - WebSearch                 # 网页搜索
disallowed-tools:             # 明确封锁的工具
  - Write                     # 不可写入文件
  - Edit                      # 不可编辑文件

# === 技能依赖 ===
# 为此代理提供上下文/知识的技能
skills:
  - spec-driven-dev           # 技能名称引用
  - testing-guide

# === 模型偏好（仅 Claude Code）===
model: claude-sonnet-4-20250514  # 偏好模型
temperature: 0.3              # 响应创造性（0.0-1.0）

# === 上下文策略（RLM 启发）===
# 处理大型代码库和长上下文的配置
context-strategy:
  mode: adaptive              # full | chunked | adaptive
  max-chunk-size: 50000       # 每个区块的最大 token 数
  overlap: 500                # 区块间的 token 重叠
  analysis-pattern: hierarchical  # hierarchical | parallel | sequential

# === 触发条件 ===
triggers:
  keywords:                   # 这些关键字自动启动
    - architecture
    - system design
    - 架构设计
  commands:                   # 调用此代理的斜线命令
    - /architect
---
```

### 角色类型

| 角色 | 描述 | 使用案例 |
|------|------|---------|
| `orchestrator` | 协调多个代理 | 复杂工作流程、功能开发 |
| `specialist` | 特定领域的深度专业 | 架构、测试、文档 |
| `reviewer` | 评估并提供反馈 | 代码审查、规格审查、PR 审查 |

### 工具权限模式

```yaml
# 完全工具访问（未指定时的默认）
allowed-tools: [*]

# 只读代理
allowed-tools: [Read, Glob, Grep]
disallowed-tools: [Write, Edit, Bash]

# 仅限 Git 的 bash 访问
allowed-tools:
  - Bash(git:*)     # 仅 git 命令
  - Bash(npm:test)  # 仅 npm test

# 特定文件模式
allowed-tools:
  - Write(*.md)     # 仅 markdown 文件
  - Edit(src/**)    # 仅 src 目录
```

### 上下文策略配置（RLM 启发）

`context-strategy` 区段使用 RLM（递归语言模型）原则实现对大型代码库和长上下文的智能处理。

#### 模式选项

| 模式 | 描述 | 使用案例 |
|------|------|---------|
| `full` | 一次加载完整上下文 | 小项目、文档任务 |
| `chunked` | 将上下文分成固定大小的区块 | 顺序代码审查、大型文件分析 |
| `adaptive` | 根据内容结构动态调整 | 复杂分析、架构探索 |

#### 分析模式

| 模式 | 描述 | 最适合 |
|------|------|--------|
| `hierarchical` | 先分析高层结构，然后深入细节 | 架构分析、系统设计 |
| `parallel` | 同时处理多个区段 | 独立模块分析、规格审查 |
| `sequential` | 依序处理区段，保留上下文 | 代码审查、逐步分析 |

## 内建代理

| 代理 | 角色 | 描述 |
|------|------|------|
| [code-architect](./code-architect.md) | specialist | 软件架构和系统设计 |
| [test-specialist](./test-specialist.md) | specialist | 测试策略和测试实现 |
| [reviewer](./reviewer.md) | reviewer | 代码审查和质量评估 |
| [doc-writer](./doc-writer.md) | specialist | 文档和技术写作 |
| [spec-analyst](./spec-analyst.md) | specialist | 规格分析和需求萃取 |

## 使用方式

### CLI 安装

```bash
# 列出可用的代理
uds agent list

# 将特定代理安装到项目
uds agent install code-architect

# 安装所有代理
uds agent install --all

# 安装到用户目录（全局）
uds agent install code-architect --global
```

### 在 Claude Code 中直接调用

```
/architect [任务描述]
```

或通过自然语言触发：

```
请帮我设计新认证系统的架构。
```

## 创建自定义代理

### 1. 创建 AGENT.md 文件

```bash
# 在你的项目中
mkdir -p .claude/agents
touch .claude/agents/my-agent.md
```

### 2. 定义 Frontmatter

```yaml
---
name: my-custom-agent
version: 1.0.0
description: |
  针对特定项目需求的自定义代理。
  关键字: custom, specific, project.

role: specialist
expertise: [domain-specific]

allowed-tools: [Read, Glob, Grep, Edit]
skills: [relevant-skill]

triggers:
  commands: [/myagent]
---
```

### 3. 撰写代理指令

```markdown
# 我的自定义代理

## 目的

描述此代理的功能。

## 工作流程

1. 步骤一
2. 步骤二
3. 步骤三

## 指南

- 指南 1
- 指南 2
```

## 代理 vs 技能比较

| 方面 | 技能 | 代理 |
|------|------|------|
| **目的** | 提供知识/上下文 | 执行自主任务 |
| **执行** | 作为上下文加载 | 作为子代理生成（或内嵌） |
| **状态** | 无状态 | 可维护任务状态 |
| **工具访问** | 无（仅上下文） | 可配置权限 |
| **触发** | 手动加载 | 关键字、命令、工作流程 |
| **组合** | 由代理引用 | 可使用技能作为上下文 |

## 与工作流程整合

代理可通过工作流程定义进行协调：

```yaml
# workflows/feature-dev.workflow.yaml
name: feature-development
steps:
  - agent: spec-analyst
    task: 分析需求
  - agent: code-architect
    task: 设计解决方案
  - agent: test-specialist
    task: 定义测试策略
  - manual: 实现
  - agent: reviewer
    task: 代码审查
```

请参阅 [workflows/README.md](../workflows/README.md) 获取工作流程文档。

---

## 相关资源

- [技能文档](../README.md)
- [工作流程文档](../workflows/README.md)
- [AI 代理路径配置](../../cli/src/config/ai-agent-paths.js)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.1.0 | 2026-01-21 | 添加 RLM 启发的 context-strategy 配置 |
| 1.0.0 | 2026-01-20 | 初始发布 |

---

## 授权

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
