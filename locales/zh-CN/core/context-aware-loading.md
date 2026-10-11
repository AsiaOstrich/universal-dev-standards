---
source: ../../../core/context-aware-loading.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 20a78d490360
status: current
---

> **语言**: [English](../../../core/context-aware-loading.md) | 简体中文

# 情境感知标准加载

**版本**: 1.0.0
**最后更新**: 2026-03-16
**适用范围**: 所有使用 AI 优化标准（.ai.yaml）的项目
**范围**: universal

---

## 目的

本标准定义 AI 工具根据当前任务情境选择性加载开发标准的协议。AI 工具不会一次性加载所有标准，而是始终加载核心集合，并按需激活其他标准，从而减少 token 使用并提高聚焦度。

---

## 快速参考

| 概念 | 描述 |
|------|------|
| **域** | 一组命名的相关标准（如 `testing`、`quality`） |
| **始终加载** | 无论任务如何，每个会话都加载的标准 |
| **按需加载** | 仅在任务情境匹配其域触发器时加载的标准 |
| **清单域** | 域→标准映射的唯一真实来源（`manifest.json`） |

---

## 1. 域分类

### 1.1 始终加载的标准

这些标准对每次 AI 交互都是基础性的，必须始终加载：

| 标准 | 原因 |
|------|------|
| `anti-hallucination` | 在每项任务中防止捏造 |
| `commit-message` | 每个会话都可能产生提交 |
| `checkin-standards` | 品质关卡适用于所有变更 |
| `project-context-memory` | 项目决策必须始终被尊重 |
| `developer-memory` | 过去的见解应始终可用 |

### 1.2 按需加载域

| 域 | 标准 | 激活触发器 |
|----|------|-----------|
| `testing` | testing, unit-testing, integration-testing, test-completeness-dimensions, tdd, bdd, atdd | 撰写测试、测试文件编辑、"测试覆盖率"讨论 |
| `specification` | spec-driven-development, forward-derivation, reverse-engineering, requirement-engineering | `/sdd`、`/spec` 命令、规格文件编辑 |
| `quality` | code-review, refactoring, security, performance, accessibility | `/code-review` 命令、PR 审查、"重构"讨论 |
| `documentation` | documentation-structure, documentation-writing, ai-instruction, changelog | 撰写文档、README/CHANGELOG 编辑 |
| `workflow` | git-workflow, github-flow, squash-merge, versioning, deployment | 分支操作、发布准备、合并 |
| `architecture` | ai-friendly-architecture, project-structure, error-codes, logging | 架构决策、项目设置 |

---

## 2. 激活协议

### 2.1 加载决策流程

```
Session Start
  ├─ Load all always-on standards
  ├─ Scan user request for trigger keywords
  ├─ Match file patterns if user is editing files
  ├─ Detect slash commands (/sdd, /code-review, etc.)
  └─ Load matching on-demand standards
```

### 2.2 清单域配置

项目在 `manifest.json` 中配置域映射：

```json
{
  "domains": {
    "always-on": [
      "ai/standards/anti-hallucination.ai.yaml",
      "ai/standards/commit-message.ai.yaml",
      "ai/standards/checkin-standards.ai.yaml",
      "ai/standards/project-context-memory.ai.yaml",
      "ai/standards/developer-memory.ai.yaml"
    ],
    "testing": [
      "ai/standards/testing.ai.yaml",
      "ai/options/testing/unit-testing.ai.yaml",
      "ai/options/testing/integration-testing.ai.yaml",
      "ai/standards/test-completeness-dimensions.ai.yaml",
      "ai/standards/test-driven-development.ai.yaml",
      "ai/standards/behavior-driven-development.ai.yaml",
      "ai/standards/acceptance-test-driven-development.ai.yaml"
    ]
  }
}
```

---

## 3. 自定义域

项目可在 `manifest.json` 中使用 `extensions` 数组定义自定义域。自定义域**仅可新增**——不能覆盖内置域。

### 3.1 扩展格式

```json
{
  "extensions": [
    {
      "type": "custom-domain",
      "domain": "ml-pipeline",
      "description": "Standards for ML pipeline workflows",
      "triggers": ["pipeline", "model training", "dataset", "*.pipeline.*"],
      "standards": ["ai/standards/custom-ml-pipeline.ai.yaml"]
    }
  ]
}
```

### 3.2 自定义域规则

| 规则 | 描述 |
|------|------|
| **仅可新增** | 自定义域不能覆盖或遮蔽内置域 |
| **名称唯一** | 域名称不得与内置域名称冲突 |
| **标准路径** | 引用的标准必须存在于项目中 |
| **触发器格式** | 与内置域触发器格式相同（关键字、文件模式、命令） |

### 3.3 基于 Hook 的强制执行（可选）

对 Claude Code 用户而言，`UserPromptSubmit` hook 可根据用户的提示自动注入相关标准。该 hook 读取提示，将其与清单域触发器（包括内置与自定义）进行匹配，并将匹配的标准文件路径作为上下文输出。

**要求：**
- Hook 执行必须在 < 500ms 内完成
- Hook 失败不得阻塞用户的提示
- 参考实现见 `scripts/hooks/inject-standards.mjs`

---

## 4. 实施指南

### 4.1 给标准作者

- 在 `manifest.json` 中将新标准注册到适当的域下
- 仅对真正适用于每次交互的标准选择 `always-on`
- 在域配置中定义具体、可执行的触发器（而非模糊的关键字）
- 每个标准只分配到一个域

### 4.2 给 AI 工具集成

- 会话开始时，始终加载 `always-on` 域
- 在加载其他标准之前，先解析用户第一条消息中的触发关键字
- 如有疑问，就加载该标准——误报好过缺少上下文
- 在会话期间缓存域归属

### 4.3 向后兼容

- 不含 `domains` 的现有 `manifest.json` 仍可正常运作（加载所有标准）
- `domains` 字段是新增性质的——不会移除现有 `standards` 列表的行为

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-03-16 | 初始标准定义 |

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
