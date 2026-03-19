---
source: ../../../../skills/commands/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
status: current
---

---
name: guide
description: [UDS] Access Universal Development Standards guides and references.
---

# /guide 命令

> **语言**: [English](../../../../skills/commands/guide.md) | 简体中文

`/guide` 命令是访问所有 Universal Development Standards 参考资料和指南的中央入口。

## 用法

```bash
/guide [topic]
```

## 可用主题

| 主题 | 说明 | 来源 |
|------|------|------|
| `git` | Git 工作流与分支策略 | `skills/git-workflow-guide/` |
| `testing` | 测试金字塔与策略 | `skills/testing-guide/` |
| `errors` | 错误码设计规范 | `skills/error-code-guide/` |
| `logging` | 结构化日志规范 | `skills/logging-guide/` |
| `structure` | 专案结构约定 | `skills/project-structure-guide/` |
| `ai-arch` | AI 友好的架构 | `skills/ai-friendly-architecture/` |
| `ai-collab` | AI 协作与防幻觉 | `skills/ai-collaboration-standards/` |
| `ai-instruct` | AI 指令文件规范 | `skills/ai-instruction-standards/` |

## 范例

- `/guide git` - 显示 Git 分支与命名约定
- `/guide testing` - 显示测试金字塔与最佳实践
- `/guide structure` - 显示推荐的专案文件夹结构
- `/guide` - 列出所有可用指南

## AI 实作说明

当用户调用 `/guide [topic]` 时：
1.  识别请求的主题。
2.  读取对应的规范/技能文件（例如 `skills/git-workflow-guide/SKILL.md`）。
3.  向用户摘要或呈现该文件的关键信息。
4.  如果主题缺失或无效，列出可用主题。
