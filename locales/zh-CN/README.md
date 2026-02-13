# Universal Development Standards

[![npm version](https://img.shields.io/npm/v/universal-dev-standards.svg)](https://www.npmjs.com/package/universal-dev-standards)
[![License: MIT + CC BY 4.0](https://img.shields.io/badge/License-MIT%20%2B%20CC%20BY%204.0-blue.svg)](../../LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org/)

> **语言**: [English](../../README.md) | [繁體中文](../zh-TW/README.md) | 简体中文

**版本**: 5.0.0-rc.1 (Pre-release) | **发布日期**: 2026-02-13 | **授权**: [双重授权](../../LICENSE) (CC BY 4.0 + MIT)

语言无关、框架无关的软件项目文档标准。通过 AI 原生工作流，确保不同技术栈之间的一致性、质量和可维护性。

---

## 🚀 快速开始

### 通过 npm 安装（推荐）

```bash
# 全局安装（稳定版）
npm install -g universal-dev-standards

# 或安装 beta 获取最新功能
npm install -g universal-dev-standards@beta

# 初始化项目
uds init
```

### 或使用 npx（无需安装）

```bash
npx universal-dev-standards init
```

> **注意**：仅复制标准文件不会启用 AI 协助功能。请使用 `uds init` 自动配置 AI 工具，或手动在工具配置文件中引用标准。

---

## ✨ 功能特色

<!-- UDS_STATS_TABLE_START -->
| 类别 | 数量 | 说明 |
| :--- | :--- | :--- |
| **核心标准** | 32 | 通用开发准则（TDD, BDD, 安全性, 性能等） |
| **AI Skills** | 27 | 适用于 Claude Code, OpenCode 等工具的互动式技能 |
| **斜线命令** | 30 | 快速操作（例如 `/tdd`, `/review`, `/derive`） |
| **CLI 命令** | 6 | `list`, `init`, `configure`, `check`, `update`, `skills` |
<!-- UDS_STATS_TABLE_END -->

### 5.0 Beta 新功能

| 功能 | 说明 |
| :--- | :--- |
| **32 个核心标准** | 新增 10 个标准，包含安全性、性能、无障碍 |
| **26 Skills / 30 Commands** | 新增 `/requirement`、`/security`、`/perf` 命令 |
| **开发者记忆** | 跨工作会话的持久记忆（`.standards/developer-memory.ai.yaml`） |
| **增强 i18n** | 提交语言偏好设置、改进简体中文支持 |

---

## 🏗️ 系统架构

UDS 采用 **双层执行模型 (Dual-Layer Execution Model)**，专为高速互动开发与深度技术合规而设计。

```mermaid
graph TD
    A[AI 助手 / 开发者] --> B{执行层}
    B -- "日常任务" --> C[技能层 Skills (.ai.yaml)]
    B -- "深度审查" --> D[标准层 Standards (.md)]
    
    C --> C1[Token 优化]
    C --> C2[互动式引导]
    
    D --> D1[完整理论与定义]
    D --> D2[工具自动化配置]
    
    C1 -. "回退机制" .-> D1
```

| 面向 | 技能层 Skills (执行层) | 核心标准 Standards (知识库) |
| :--- | :--- | :--- |
| **格式** | YAML 优化 | 完整 Markdown |
| **目标** | 高速互动与快速查询 | 深度理解与理论依据 |
| **Token 使用** | 极小（AI 友好） | 详细（参考文献） |

---

## 🤖 AI 工具支持

| AI 工具 | 状态 | Skills | 斜线命令 | 配置文件 |
| :--- | :--- | :---: | :---: | :--- |
| **Claude Code** | ✅ 完整支持 | **26** | **30** | `CLAUDE.md` |
| **OpenCode** | ✅ 完整支持 | **26** | **30** | `AGENTS.md` |
| **Gemini CLI** | 🧪 预览版 | **18+** | **20+** | `GEMINI.md` |
| **Cursor** | ✅ 完整支持 | **核心** | **模拟支持** | `.cursorrules` |
| **Cline / Roo Code**| 🔶 部分支持 | **核心** | **工作流** | `.clinerules` |
| **Windsurf** | 🔶 部分支持 | ✅ | **规则书** | `.windsurfrules` |

> **状态图例**：✅ 完整支持 | 🧪 預覽版 | 🔶 部分支持 | ⏳ 计划中

---

## 📦 安装方式

### CLI 工具（主要方式）

**npm（推荐）**
```bash
npm install -g universal-dev-standards
uds init    # 交互式初始化
uds check   # 检查采用状态
uds update  # 更新至最新版本
```

### 预发布版本 (Pre-release)

```bash
# 安装最新 RC (Release Candidate)
npm install -g universal-dev-standards@rc

# 安装最新 Beta
npm install -g universal-dev-standards@beta
```

### 源码安装（开发用）

```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards/cli && npm install && npm link
```

---

## ⚙️ 设置

使用 `uds config` 管理您的偏好设置：

| 参数 | 命令示例 | 说明 |
| :--- | :--- | :--- |
| **提交语言** | `uds config --lang zh-CN` | 设置 AI 提交消息的偏好语言 |
| **标准等级** | `uds init --level 2` | 选择采用深度 (1: 基本, 3: 全面) |
| **工具模式** | `uds config --mode skills` | 在 Skills、Standards 或两者之间切换 |

---

## 👥 贡献

1. **建议改进**：开立 issue 说明问题与解决方案。
2. **添加示例**：提交实际使用示例。
3. **扩展标准**：贡献语言/框架/领域扩展。

详细准则请参阅 [CONTRIBUTING.md](../../CONTRIBUTING.md)。

---

## 📄 授权

| 组件 | 授权 |
| :--- | :--- |
| **文档内容** | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| **CLI 工具** | [MIT](../../cli/LICENSE) |

---

**由开源社区用 ❤️ 维护**
