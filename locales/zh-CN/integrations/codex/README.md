---
source: ../../../../integrations/codex/README.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-13
status: current
---

# OpenAI Codex 集成

本目录提供将通用开发规范与 OpenAI Codex CLI 集成的资源。

## 概述

OpenAI Codex CLI 是一个 AI 驱动的终端编码助手。此集成帮助 Codex 理解您的项目并遵循开发规范。

## 资源

- **[AGENTS.md](./AGENTS.md)**（必要）：
  项目级规则文件，Codex 会自动加载。

## 配置层级

OpenAI Codex CLI 支持多层配置：

| 类型 | 文件位置 | 说明 |
|------|---------|------|
| 项目规则 | `AGENTS.md` | 项目根目录，自动加载 |
| 全局规则 | `~/.codex/instructions.md` | 个人规则，适用所有项目 |

## 快速开始

### 方式一：复制规则文件（推荐）

```bash
# 复制到项目根目录
cp integrations/codex/AGENTS.md AGENTS.md

# 或使用 curl
curl -o AGENTS.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/codex/AGENTS.md
```

### 方式二：手动配置

将 `AGENTS.md` 的内容复制到您的 Codex 配置或系统指令中。

---

## 相关规范

- [防幻觉规范](../../core/anti-hallucination.md)
- [Commit 消息指南](../../core/commit-message-guide.md)
- [代码审查清单](../../core/code-review-checklist.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-01-09 | 初始 OpenAI Codex 集成 |

---

## 许可证

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。
