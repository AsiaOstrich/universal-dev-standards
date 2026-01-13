---
source: ../../../../integrations/google-antigravity/README.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-01-13
status: current
---

# Google Antigravity 集成

本目录提供将通用文档规范与 Google Antigravity 集成的资源。

## 概述

Google Antigravity 是一个先进的代理程序代码开发助理。此集成帮助 Antigravity 代理利用通用文档规范来生成更高质量、无幻觉的代码与文档。

## 资源

- **[.antigravity/rules.md](../../../../integrations/google-antigravity/.antigravity/rules.md)**（推荐）：
  项目级规则文件，Antigravity 会自动加载。

- **[INSTRUCTIONS.md](./INSTRUCTIONS.md)**：
  用于手动配置的系统提示词片段。

## 规则配置

Google Antigravity 支持两层规则配置：

| 类型 | 文件位置 | 说明 |
|------|---------|------|
| 全局规则 | `~/.gemini/GEMINI.md` | 适用于所有项目 |
| 项目规则 | `.antigravity/rules.md` | 项目特定规则（自动加载） |

## 快速开始

### 方式一：项目规则（推荐）

将项目规则文件复制到您的项目：

```bash
# 创建目录并复制规则文件
mkdir -p .antigravity
cp integrations/google-antigravity/.antigravity/rules.md .antigravity/

# 或使用 curl
mkdir -p .antigravity
curl -o .antigravity/rules.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/google-antigravity/.antigravity/rules.md
```

### 方式二：手动配置

1. **安装规范**：
   确保 `core/` 规范已复制到您的项目（例如 `.standards/`）。

2. **配置代理**：
   将 `INSTRUCTIONS.md` 的内容复制到您的 Antigravity「用户规则」或特定任务指令中。

### 验证合规性

要求代理「遵循防幻觉规范审查此代码」。

---

## 相关规范

- [防幻觉规范](../../core/anti-hallucination.md)
- [Commit 消息指南](../../core/commit-message-guide.md)
- [INSTRUCTIONS.md](./INSTRUCTIONS.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.1.0 | 2026-01-09 | 新增：`.antigravity/rules.md` 项目规则文件、规则配置章节 |
| 1.0.1 | 2025-12-24 | 新增：相关规范、版本历史、许可证章节 |
| 1.0.0 | 2025-12-23 | 初始 Google Antigravity 集成 |

---

## 许可证

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。
