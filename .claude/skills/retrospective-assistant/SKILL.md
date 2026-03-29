---
source: ../../../../skills/retrospective-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-26
status: current
description: "[UDS] 引導結構化的團隊回顧，支援 Sprint 和 Release 回顧"
name: retrospective
allowed-tools: Read, Write, Glob, Grep
scope: universal
argument-hint: "[sprint | release | actions | --technique starfish]"
---

# 回顧助手

> **語言**: [English](../../../../skills/retrospective-assistant/SKILL.md) | 繁體中文

引導結構化的團隊回顧，識別改善機會並追蹤行動項目。

## 指令

| 指令 | 說明 |
|------|------|
| `/retrospective` | 互動式 Sprint 回顧（預設） |
| `/retrospective sprint` | Sprint 回顧 |
| `/retrospective release` | Release 回顧（含指標） |
| `/retrospective actions` | 列出未完成行動項目 |
| `/retrospective --technique starfish` | 使用指定技法 |

## 參考

- 核心規範：[retrospective-standards.md](../../../../core/retrospective-standards.md)
- 詳細指南：[guide.md](./guide.md)
