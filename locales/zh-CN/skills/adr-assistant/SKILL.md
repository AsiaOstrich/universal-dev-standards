---
source: ../../../../skills/adr-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-26
status: current
description: |
  建立、管理和追踪架构决策记录（ADR）。
  使用时机：架构决策、技术选型、设计取舍。
  关键字：ADR, architecture decision, decision record, 架构决策, 决策记录。
---

# 架构决策记录助手

> **语言**: [English](../../../../skills/adr-assistant/SKILL.md) | 简体中文

建立、管理和追踪架构决策记录。捕捉重大技术决策的背景、选项和理由。

## 工作流程

```
CAPTURE ──► ANALYZE ──► DECIDE ──► RECORD ──► LINK
  捕捉背景    分析选项    做出决策    记录 ADR    建立链接
```

## 指令

| 指令 | 说明 |
|------|------|
| `/adr` | 交互式建立 ADR |
| `/adr create` | 建立新 ADR |
| `/adr list` | 列出所有 ADR 及状态 |
| `/adr search [关键字]` | 依关键字搜索 ADR |
| `/adr supersede [ADR-NNN]` | 取代现有 ADR |
| `/adr review` | 审查过期的 ADR |

## 参考

- 核心规范：[adr-standards.md](../../../../core/adr-standards.md)
- 详细指南：[guide.md](./guide.md)
