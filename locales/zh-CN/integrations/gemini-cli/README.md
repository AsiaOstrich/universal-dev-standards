---
source: ../../../../integrations/gemini-cli/README.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-13
status: current
---

# Gemini CLI 集成

本目录提供将通用文档规范与 [Gemini CLI](https://geminicli.com/) 集成的资源。

## 概述

Gemini CLI 是 Google 的开源 AI 代理工具，将 Gemini 模型带入终端环境。此集成帮助 Gemini CLI 利用通用文档规范来生成更高质量、无幻觉的代码与文档。

## 资源

- **[GEMINI.md](./GEMINI.md)**（推荐）：
  项目级指令文件，Gemini CLI 会自动加载。

- **[settings-example.json](../../../../integrations/gemini-cli/settings-example.json)**：
  用于自定义 CLI 行为的设置示例文件。

## 配置层级

Gemini CLI 支持分层配置系统：

| 层级 | 文件位置 | 说明 |
|------|---------|------|
| 全局 | `~/.gemini/GEMINI.md` | 适用于所有项目 |
| 项目 | `./GEMINI.md` | 项目根目录 |
| 子目录 | `./subdir/GEMINI.md` | 模块特定规则 |
| 设置 | `.gemini/settings.json` | 行为配置 |

## 快速开始

### 方式一：项目指令（推荐）

将指令文件复制到项目根目录：

```bash
# 将 GEMINI.md 复制到项目根目录
cp integrations/gemini-cli/GEMINI.md ./GEMINI.md

# 或使用 curl
curl -o GEMINI.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/gemini-cli/GEMINI.md
```

### 方式二：全局指令

添加到全局指令，适用于所有项目：

```bash
# 创建全局目录（如果不存在）
mkdir -p ~/.gemini

# 追加或创建全局 GEMINI.md
cat integrations/gemini-cli/GEMINI.md >> ~/.gemini/GEMINI.md
```

### 方式三：自定义设置

复制设置示例以自定义 CLI 行为：

```bash
# 创建项目设置目录
mkdir -p .gemini

# 复制设置示例
cp integrations/gemini-cli/settings-example.json .gemini/settings.json
```

## 特殊功能

### 模块化导入

Gemini CLI 支持从其他文件导入内容：

```markdown
# 在 GEMINI.md 中
@./docs/coding-style.md
@./docs/api-guidelines.md
```

### 记忆命令

在运行时管理指令：

- `/memory show` - 显示当前指令
- `/memory refresh` - 重新加载所有 GEMINI.md
- `/memory add <text>` - 添加到全局指令

### 验证指令

确认标准已加载：

```
/memory show
```

要求代理确认：

```
遵循防幻觉标准审查此代码。
```

## 与 Google Antigravity 的关系

两个工具共用全局 `~/.gemini/` 目录：

| 工具 | 项目规则位置 | 共用 |
|------|------------|------|
| Gemini CLI | `./GEMINI.md` | `~/.gemini/GEMINI.md` |
| Antigravity | `.antigravity/rules.md` | `~/.gemini/GEMINI.md` |

两者可共存，使用相同的全局配置。

---

## 相关标准

- [防幻觉标准](../../../../core/anti-hallucination.md)
- [Commit 消息指南](../../../../core/commit-message-guide.md)
- [规格驱动开发](../../../../core/spec-driven-development.md)
- [Gemini CLI 官方文档](https://geminicli.com/docs/)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-01-09 | 初始 Gemini CLI 集成 |

---

## 授权

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
