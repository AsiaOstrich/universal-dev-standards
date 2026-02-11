# Universal Development Standards

[![npm version](https://img.shields.io/npm/v/universal-dev-standards.svg)](https://www.npmjs.com/package/universal-dev-standards)
[![License: MIT + CC BY 4.0](https://img.shields.io/badge/License-MIT%20%2B%20CC%20BY%204.0-blue.svg)](../../LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org/)

> **语言**: [English](../../README.md) | [繁體中文](../zh-TW/README.md) | 简体中文

**版本**: 5.0.0-beta.10 (Pre-release) | **发布日期**: 2026-02-11 | **授权**: [双重授权](../../LICENSE) (CC BY 4.0 + MIT)

语言无关、框架无关的软件项目文档标准。确保不同技术栈之间的一致性、质量和可维护性。

---

## 功能特色

| 类别 | 数量 | 说明 |
|------|------|------|
| **核心标准** | 22 | 通用开发准则（Markdown） |
| **AI Skills** | 23 | Claude Code 交互式技能 |
| **Slash Commands** | 24 | 快速操作（`/commit`、`/tdd`、`/review` 等） |
| **CLI 命令** | 6 | `list`、`init`、`configure`、`check`、`update`、`skills` |
| **语言支持** | 3 | 英文、繁体中文、简体中文 |

---

## Beta 安装指南

> **这是预发布版本。** 功能可能在正式发布前有所变更。如遇到任何问题，请[报告 issue](https://github.com/AsiaOstrich/universal-dev-standards/issues)。

### 安装 Beta

```bash
# 全局安装最新 beta
npm install -g universal-dev-standards@beta

# 或安装特定 beta 版本
npm install -g universal-dev-standards@5.0.0-beta.10

# 无需安装直接使用
npx universal-dev-standards@beta init
```

### 降级回稳定版

```bash
npm install -g universal-dev-standards@latest
```

### 5.0 Beta 新功能

| 功能 | 说明 |
|------|------|
| **32 个核心标准** | 新增 10 个标准，包含安全性、性能、无障碍、需求工程 |
| **26 Skills / 30 Commands** | 新增 `/requirement`、`/security`、`/perf` 命令 |
| **开发者记忆** | 跨工作会话的持久记忆（`.standards/developer-memory.ai.yaml`） |
| **增强 i18n** | 提交语言偏好设置、改进简体中文支持 |
| **配置统一** | `uds config` 合并偏好设置 + 项目配置 |

完整 beta 版本记录请参阅 [CHANGELOG.md](../../CHANGELOG.md)。

---

## 快速开始

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

### 手动设置

若不使用 npm 的手动设置方式，请参阅下方[安装方式](#安装方式)。

> **注意**：仅复制标准文件不会启用 AI 协助功能。请使用 `uds init` 自动配置 AI 工具，或手动在工具配置文件中引用标准。

---

## 安装方式

### CLI 工具（主要方式）

**npm（推荐）**
```bash
npm install -g universal-dev-standards
uds init    # 交互式初始化
uds check   # 检查采用状态
uds update  # 更新至最新版本
uds skills  # 列出已安装的 skills
```

**npx（无需安装）**
```bash
npx universal-dev-standards init
```

**指定版本**
```bash
npm install -g universal-dev-standards@5.0.0-beta.10  # 最新 beta
npm install -g universal-dev-standards@beta            # 始终获取最新 beta
npm install -g universal-dev-standards@latest           # 稳定版
```

**Clone 并链接（开发用）**

macOS / Linux:
```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards/cli && npm install && npm link
```

Windows (PowerShell):
```powershell
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards\cli; npm install; npm link
```

---

## AI 工具支持

| AI 工具 | 状态 | Skills | Commands | 配置文件 |
|---------|------|:------:|:--------:|----------|
| **Claude Code** | ✅ 完整支持 | ✅ | 内建 | `CLAUDE.md` |
| **OpenCode** | ✅ 完整支持 | ✅ | ✅ | `AGENTS.md` |
| Cline | 🔶 部分支持 | ✅ | - | `.clinerules` |
| GitHub Copilot | 🔶 部分支持 | ✅ | ✅ | `copilot-instructions.md` |
| OpenAI Codex | 🔶 部分支持 | ✅ | - | `AGENTS.md` |
| Gemini CLI | 🧪 预览版 | ✅ | ✅ | `GEMINI.md` |
| Roo Code | ⏳ 计划中 | ✅ | ✅ | `.roorules` |
| Cursor | 📄 基本支持 | - | - | `.cursorrules` |
| Windsurf | 📄 基本支持 | - | - | `.windsurfrules` |
| Antigravity | 📄 基本支持 | - | - | `INSTRUCTIONS.md` |

> **状态图例**（UDS CLI 实现状态）：
> - ✅ 完整支持 = Skills + Commands 完整支持，已测试
> - 🔶 部分支持 = Skills 可用，Commands 受限或不支持
> - 🧪 预览版 = 功能可用但为预览版本
> - ⏳ 计划中 = 代码存在，待测试
> - 📄 基本支持 = 仅规则文件生成，不支持 Skills/Commands

### 平台支持

| 平台 | 状态 | 备注 |
|------|------|------|
| **macOS** | ✅ 已测试 | 主要开发平台 |
| **Linux** | ⚠️ 未测试 | 预期可运行（基于 Node.js） |
| **Windows** | ⚠️ 未测试 | 提供 PowerShell 脚本 |

请参阅 [Windows 指南](../../docs/WINDOWS-GUIDE.md)了解平台特定说明。

---

## Skills 安装

### 方法 1：Claude Code Plugin Marketplace（最简单）

```bash
/plugin install universal-dev-standards@asia-ostrich
```

**优点**：单一命令、自动更新、立即加载全部 23 个 skills。

**从 v3.x 升级？**
```bash
/plugin uninstall universal-dev-standards@universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

### 方法 2：UDS CLI

```bash
npm install -g universal-dev-standards
uds init  # 选择 AI 工具，skills 自动安装
```

使用 `uds check` 验证安装状态。

### 方法 3：手动安装

macOS / Linux:
```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git /tmp/uds
cp -r /tmp/uds/skills/* ~/.claude/skills/    # 全局
# 或: cp -r /tmp/uds/skills/* .claude/skills/  # 项目
rm -rf /tmp/uds
```

Windows (PowerShell):
```powershell
git clone https://github.com/AsiaOstrich/universal-dev-standards.git $env:TEMP\uds
Copy-Item -Recurse $env:TEMP\uds\skills\claude-code\* $env:USERPROFILE\.claude\skills\
Remove-Item -Recurse $env:TEMP\uds
```

### 社区市集

- **[n-skills](https://github.com/numman-ali/n-skills)** - Claude Code、OpenCode、Cursor 精选市集
- **[claude-plugins.dev](https://claude-plugins.dev/skills)** - 自动索引的 skill 探索
- **[agentskills.io](https://agentskills.io)** - 官方 Agent Skills 规范

---

## 使用模式

| 模式 | 最适合 | 主要优势 |
|------|--------|----------|
| **仅 Skills** | 个人开发者 + Claude Code | 最低 token 使用量、最佳交互体验 |
| **仅标准** | 多工具团队 / 企业 | 完整自定义、版本控制 |
| **Skills + 标准** | 完整体验 / 学习 | 100% 功能覆盖 |

### 快速决策指南

- **个人项目使用 Claude Code？** → 仅 Skills
- **团队使用多个 AI 工具？** → Skills + 标准
- **企业合规需求？** → 仅标准

详细分析请参阅[使用模式比较](../../docs/USAGE-MODES-COMPARISON.md)。

---

## 核心标准概览

### Level 1：基本（30 分钟设置）

每个项目必须包含：

| 标准 | 说明 |
|------|------|
| `anti-hallucination.md` | AI 协作准则 |
| `checkin-standards.md` | 提交前质量检查 |
| `commit-message-guide.md` | Conventional Commits 格式 |
| `spec-driven-development.md` | 规格优先方法 |

### Level 2：推荐（2 小时设置）

包含 Level 1 加上：

| 标准 | 说明 |
|------|------|
| `git-workflow.md` | 分支策略（GitHub Flow、GitFlow、Trunk-Based） |
| `code-review-checklist.md` | 系统化审查准则 |
| `versioning.md` | 语义化版本（SemVer） |
| `changelog-standards.md` | Keep a Changelog 格式 |
| `testing-standards.md` | 测试金字塔（70/20/7/3） |
| `test-driven-development.md` | TDD 方法论 |
| `behavior-driven-development.md` | BDD 与 Given-When-Then |

### Level 3：全面（1-2 天设置）

包含 Level 2 加上：

| 标准 | 说明 |
|------|------|
| `documentation-structure.md` | 文档组织 |
| `project-structure.md` | 目录惯例 |
| `acceptance-test-driven-development.md` | ATDD 方法论 |
| `refactoring-standards.md` | 安全重构实务 |

完整指引请参阅[采用指南](../../adoption/ADOPTION-GUIDE.md)。

---

## 自定义

### 自定义文件位置

| 类型 | 文件 | 位置 |
|------|------|------|
| AI 工具规则 | `CLAUDE.md`、`.cursorrules` 等 | 项目根目录 |
| 项目覆盖 | `PROJECT-STANDARDS.md` | 项目根目录 |
| 复制的标准 | `docs/standards/` | 您的项目 |

### 调整标准

1. **语言**：英文、繁体中文或简体中文提交类型
2. **工具**：配置构建命令（`npm`、`dotnet`、`mvn` 等）
3. **阈值**：调整测试覆盖率、方法长度限制
4. **范围**：定义模块允许的提交范围

### 排除标准

- **执行 `uds init` 时**：交互式选择需要的标准
- **选择性采用**：仅复制特定文件
- **AI 工具排除**：在 `CLAUDE.md` 或 `.cursorrules` 中添加模式

---

## 贡献

### 如何贡献

1. **建议改进**：开立 issue 说明问题与解决方案
2. **添加示例**：提交实际使用示例
3. **扩展标准**：贡献语言/框架/领域扩展
4. **翻译**：协助翻译成其他语言

### 准则

- 核心标准保持语言/框架无关性
- 至少在 2 个不同情境中包含示例
- 遵循现有文档结构
- 采用 CC BY 4.0 授权

详细准则请参阅 [CONTRIBUTING.md](../../CONTRIBUTING.md)。

---

## 常见问题

### 如何选择「仅 Skills」还是「仅标准」？

- **仅 Skills**：最适合使用 Claude Code 的个人开发者，想要以最少设置获得交互式 AI 协助
- **仅标准**：最适合使用多个 AI 工具或需要企业合规与完整版本控制的团队

### 可以只采用部分标准吗？

可以！执行 `uds init` 并选择需要的标准。也可以从 `core/` 手动复制特定文件。

### 如何更新已安装的 skills？

Plugin Marketplace：Skills 会自动更新或使用 `/plugin update`。
CLI 安装：执行 `uds update --skills`。

### UDS 支持 Windows 吗？

支持。CLI 基于 Node.js，可在所有平台运行。PowerShell 特定说明请参阅 [Windows 指南](../../docs/WINDOWS-GUIDE.md)。

### 核心标准和 skills 有什么不同？

- **核心标准**：定义最佳实务的文档（Markdown）- 参考资料
- **Skills**：实现这些标准的交互式 AI 命令 - 主动协助

### 为什么有些 AI 工具标示为「计划中」？

我们提供这些工具的配置文件，但完整集成测试尚待进行。配置应该可以运行，但可能存在边缘案例。

---

## 延伸阅读

### 相关标准

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Google Engineering Practices](https://google.github.io/eng-practices/)

### 推荐书籍

- **The Art of Readable Code** - Boswell & Foucher
- **Clean Code** - Robert C. Martin
- **The Pragmatic Programmer** - Hunt & Thomas
- **Accelerate** - Forsgren, Humble & Kim

---

## 版本历史

| 版本 | 日期 | 重点 |
|------|------|------|
| **4.1.0** | 2026-01-21 | 增强重构标准 |
| **4.0.0** | 2026-01-20 | 双向推导；6 个新核心标准 |
| 3.5.0 | 2026-01-15 | 多代理 Skills；Gemini CLI；i18n |
| 3.2.2 | 2026-01-06 | `uds skills` 命令 |
| 3.0.0 | 2025-12-30 | Windows 支持；npm 发布 |

完整历史请参阅 [CHANGELOG.md](../../CHANGELOG.md)。

---

## 4.x 新功能

### 4.1.0 重点

- 增强重构标准，包含战术、策略和遗留代码安全策略
- 选择重构方法的决策矩阵

### 4.0.0 重点

| 功能 | 说明 |
|------|------|
| **双向推导** | Forward Derivation + Reverse Engineering 实现完整规格-代码生命周期 |
| **6 个新核心标准** | BDD、ATDD、Reverse Engineering、Forward Derivation、AI Instructions、Refactoring |
| **23 Skills** | 7 个新 skills 包括 Forward Derivation、BDD/ATDD assistants |
| **24 Slash Commands** | 9 个新命令（`/derive-*`、`/reverse-*`、`/atdd`、`/bdd`） |
| **方法论系统** | TDD/BDD/SDD/ATDD 工作流已达生产就绪 |

---

## 授权

| 组件 | 授权 | 允许 |
|------|------|------|
| 文档 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | 商业使用、修改、带署名的再发布 |
| CLI 工具 | [MIT](../../cli/LICENSE) | 商业使用、修改、再发布 |

完整详情请参阅 [LICENSE](../../LICENSE)。

---

## 目录结构

```
universal-dev-standards/
├── core/                    # 核心标准（22 个文件）
│   ├── anti-hallucination.md
│   ├── commit-message-guide.md
│   ├── testing-standards.md
│   └── ...
├── ai/                      # AI 优化格式（.ai.yaml）
├── skills/                  # AI 工具 skills
│   └── claude-code/         # 23 个 skill 目录
├── extensions/              # 语言/框架扩展
│   ├── languages/           # csharp-style.md、php-style.md
│   └── frameworks/          # fat-free-patterns.md
├── integrations/            # AI 工具配置
│   ├── cursor/              # .cursorrules
│   ├── windsurf/            # .windsurfrules
│   └── ...
├── cli/                     # CLI 工具（uds 命令）
├── locales/                 # 翻译
│   ├── zh-TW/               # 繁体中文
│   └── zh-CN/               # 简体中文
├── templates/               # 文档模板
└── adoption/                # 采用指南
```

---

**准备好提升项目品质了吗？** 从[快速开始](#快速开始)开始！

**由开源社区用 ❤️ 维护**
