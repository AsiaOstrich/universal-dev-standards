---
source: ../../CLAUDE.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2025-12-30
status: current
---

# 通用开发标准 - 专案规范

本文件定义 Universal Development Standards 专案本身的开发规范。作为一个提供开发标准给其他专案的框架，我们实践自己所倡导的理念（「吃自己的狗粮」）。

## 专案概述

Universal Development Standards 是一个语言无关、框架无关的文件化标准框架。它提供：

- **核心规范** (`core/`)：13 个基础开发标准
- **AI 技能** (`skills/`)：用于 AI 辅助开发的 Claude Code 技能
- **CLI 工具** (`cli/`)：用于采用标准的 Node.js CLI
- **整合** (`integrations/`)：各种 AI 工具的配置
- **本地化** (`locales/`)：多语言支援（英文、繁体中文）

## 技术栈

| 元件 | 技术 | 版本 |
|------|------|------|
| 运行环境 | Node.js | >= 18.0.0 |
| 模组系统 | ES Modules | - |
| 测试框架 | Vitest | ^4.0.16 |
| 程式码检查 | ESLint | ^8.56.0 |
| CLI 框架 | Commander.js | ^12.1.0 |
| 互动式提示 | Inquirer.js | ^9.2.12 |

## 开发规范

### 1. Commit 讯息格式

遵循 `core/commit-message-guide.md` 中定义的 Conventional Commits 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型：**
- `feat`：新功能或标准
- `fix`：错误修复或纠正
- `docs`：文件更新
- `chore`：维护任务
- `test`：测试相关变更
- `refactor`：程式码重构
- `style`：格式变更

**范例：**
```bash
feat(core): 新增测试完整度维度标准
docs(skills): 更新 Claude Code 技能文件
fix(cli): 修复 Windows 路径解析问题
chore(i18n): 同步翻译与原始档案
```

### 2. 分支策略

遵循 `core/git-workflow.md` 中定义的 Git 工作流：

| 分支 | 用途 |
|------|------|
| `main` | 稳定、生产就绪的版本 |
| `feature/*` | 新功能和增强 |
| `fix/*` | 错误修复 |
| `docs/*` | 文件更新 |
| `chore/*` | 维护任务 |

### 3. 程式码风格

**JavaScript：**
- 使用单引号作为字串
- 语句以分号结尾
- 使用 ES Module 语法（`import`/`export`）
- 遵循 `cli/.eslintrc.json` 中的 ESLint 配置

**Markdown：**
- 使用 ATX 风格标题（`#`、`##`、`###`）
- 标题前后包含空行
- 使用带语言规范的围栏式程式码区块

### 4. 测试要求

- 所有 CLI 功能必须有对应的测试
- 提交前执行测试：`npm test`（在 `cli/` 目录）
- 执行程式码检查：`npm run lint`（在 `cli/` 目录）
- 测试覆盖率报告：`npm run test:coverage`

### 5. 翻译同步

修改核心规范时：
1. 先更新英文原始档案
2. 同步变更到 `locales/zh-TW/` 目录
3. 执行翻译检查：`./scripts/check-translation-sync.sh`

## 快速指令

### macOS / Linux

```bash
# CLI 开发（在 cli/ 目录执行）
cd cli
npm install          # 安装依赖
npm test             # 执行测试
npm run test:watch   # 以 watch 模式执行测试
npm run lint         # 检查程式码风格
npm run test:coverage # 产生覆盖率报告

# 翻译同步检查（从根目录执行）
./scripts/check-translation-sync.sh

# 本地 CLI 测试
node cli/bin/uds.js list
node cli/bin/uds.js init --help
```

### Windows (PowerShell)

```powershell
# CLI 开发（在 cli\ 目录执行）
cd cli
npm install          # 安装依赖
npm test             # 执行测试
npm run test:watch   # 以 watch 模式执行测试
npm run lint         # 检查程式码风格
npm run test:coverage # 产生覆盖率报告

# 翻译同步检查（从根目录执行）
.\scripts\check-translation-sync.ps1

# 本地 CLI 测试
node cli\bin\uds.js list
node cli\bin\uds.js init --help
```

### Windows (Git Bash)

```bash
# 与 macOS / Linux 相同的指令在 Git Bash 中可用
./scripts/check-translation-sync.sh
```

## AI 协作指南

在此专案中使用 AI 助手（Claude Code、Cursor 等）时：

### 应该做的：
- 参考 `core/` 中现有标准以保持一致性
- 文件遵循双语格式（英文 + 繁体中文）
- 修改核心规范后检查翻译同步
- 提交前执行测试和程式码检查

### 不应该做的：
- 建立新标准时不遵循现有范本结构
- 修改翻译档案而不更新原始档案
- 跳过 PR 的程式码审查检查清单
- 在核心规范中引入特定语言或框架的内容

### 专案特定脉络：
- 本专案使用 ES Modules（非 CommonJS）
- 所有核心规范应保持语言/框架无关
- 需要双语文件（英文主版本，zh-TW 翻译）
- CLI 工具是主要程式码元件；大部分内容是 Markdown

## 档案结构参考

```
universal-dev-standards/
├── core/                  # 核心规范（13 个档案）
├── skills/                # AI 工具技能
│   └── claude-code/       # Claude Code 技能（14 个技能）
├── cli/                   # Node.js CLI 工具
│   ├── src/               # 原始码
│   ├── tests/             # 测试档案
│   └── package.json       # 依赖
├── locales/               # 翻译
│   └── zh-TW/             # 繁体中文
├── integrations/          # AI 工具配置
├── templates/             # 文件范本
├── adoption/              # 采用指南
└── scripts/               # 维护脚本
```

## 贡献

详细的贡献指南请参阅 [CONTRIBUTING.md](../../CONTRIBUTING.md)。

## 授权

- 文件（Markdown）：CC BY 4.0
- 程式码（JavaScript）：MIT
