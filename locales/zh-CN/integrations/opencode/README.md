---
source: ../../../../integrations/opencode/README.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-13
status: current
---

# OpenCode 集成

本目录提供将通用开发规范与 OpenCode 集成的资源。

## 概述

OpenCode 是开源 AI 编码代理，可作为终端界面、桌面应用或 IDE 扩展。此集成帮助 OpenCode 理解您的项目并遵循开发规范。

## 资源

- **[AGENTS.md](./AGENTS.md)**（必要）：
  项目级规则文件，OpenCode 会自动加载。

- **[opencode.json](../../../../integrations/opencode/opencode.json)**（可选）：
  配置示例，包含权限设置和自定义 agent。

## 配置层级

OpenCode 支持多层配置：

| 类型 | 文件位置 | 说明 |
|------|---------|------|
| 项目规则 | `AGENTS.md` | 项目根目录，自动加载 |
| 全局规则 | `~/.config/opencode/AGENTS.md` | 个人规则，适用所有项目 |
| 项目配置 | `opencode.json` | JSON 格式配置 |
| 全局配置 | `~/.config/opencode/opencode.json` | 全局 JSON 配置 |
| 自定义 Agent | `.opencode/agent/*.md` | 项目级 agent |
| 全局 Agent | `~/.config/opencode/agent/*.md` | 全局 agent |

## 快速开始

### 方式一：复制规则文件（推荐）

```bash
# 复制到项目根目录
cp integrations/opencode/AGENTS.md AGENTS.md

# 可选：复制配置文件
cp integrations/opencode/opencode.json opencode.json
```

### 方式二：使用 curl

```bash
curl -o AGENTS.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/opencode/AGENTS.md
```

### 方式三：使用 /init（追加模式）

```bash
opencode
/init
```

注意：`/init` 会**追加**到现有 AGENTS.md，而非覆盖。

## 规则合并行为

OpenCode 的规则合并机制：

| 情况 | 行为 |
|------|------|
| `/init` 且已有 AGENTS.md | **追加**新内容，不覆盖 |
| 全局 + 项目规则同时存在 | **合并**两者，项目规则优先 |
| 配置文件（opencode.json） | **合并**，只有冲突的键才覆盖 |

---

## 相关规范

- [防幻觉规范](../../core/anti-hallucination.md)
- [Commit 消息指南](../../core/commit-message-guide.md)
- [代码审查清单](../../core/code-review-checklist.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-01-09 | 初始 OpenCode 集成 |

---

## 许可证

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。
