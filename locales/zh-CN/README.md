---
source: ../../README.md
source_version: 3.5.0-beta.13
translation_version: 3.5.0-beta.13
last_synced: 2026-01-13
status: current
---

# 通用开发规范

> **Language**: [English](../../README.md) | [繁體中文](../zh-TW/README.md) | 简体中文

**版本**: 3.5.0-beta.13
**最后更新**: 2026-01-13
**授权**: [双重授权](../../LICENSE) (CC BY 4.0 + MIT)

> **🧪 Beta 通知**: 此版本包含实验性功能。API 可能在稳定版本发布前有所变动。
> 如需稳定版本: `npm install universal-dev-standards@3.4.2`

### 功能可用性

| 功能 | 稳定版 (3.4.2) | Beta 版 (3.5.x) |
|------|:--------------:|:---------------:|
| **核心标准** (16 个文件) | ✅ | ✅ |
| **Claude Code 技能** (15 个技能) | ✅ | ✅ |
| **CLI 工具** (`uds init`, `check`, `update`) | ✅ | ✅ |
| 基于哈希的完整性检查 | ✅ | ✅ |
| Plugin Marketplace 支持 | ✅ | ✅ |
| **方法论系统** | ❌ | ✅ 🧪 |
| `/methodology` 命令 | ❌ | ✅ 🧪 |
| `/bdd` 命令 | ❌ | ✅ 🧪 |
| TDD/BDD/SDD/ATDD 工作流 | ❌ | ✅ 🧪 |

> 🧪 = 实验性功能，API 可能变动

---

## 目的

此储存库提供**与语言无关、与框架无关、与领域无关**的软件项目文档标准。这些标准确保各种技术栈的一致性、质量和可维护性。

---

## 快速开始

### 通过 npm 安装（推荐）

```bash
# 全局安装
npm install -g universal-dev-standards

# 初始化您的项目
uds init
```

### 或使用 npx（无需安装）

```bash
npx universal-dev-standards init
```

### 手动设置

复制必要的标准到您的项目：

```bash
cp core/anti-hallucination.md your-project/.standards/
cp core/checkin-standards.md your-project/.standards/
cp core/commit-message-guide.md your-project/.standards/
```

> **重要**：仅复制规范文件并不会启用 AI 辅助功能。您还必须在 AI 工具的配置文件中引用这些规范（如 `CLAUDE.md`、`.cursorrules`）。建议使用 `uds init` 进行自动配置。

### AI 工具扩展（可选）

安装 UDS 后，可选择为您偏好的工具启用 AI 辅助功能：

| AI 工具 | 配置文件 | Skills 安装 |
|---------|----------|-------------|
| Claude Code | `uds init` → `CLAUDE.md` | `/plugin install universal-dev-standards@asia-ostrich` |
| OpenCode | `uds init` → `AGENTS.md` | `uds init`（自动安装到 `.claude/skills/`） |
| OpenAI Codex | `uds init` → `AGENTS.md` | - |
| Cursor | `uds init` → `.cursorrules` | 即将支持 |
| Windsurf | `uds init` → `.windsurfrules` | 即将支持 |
| Cline | `uds init` → `.clinerules` | 即将支持 |
| GitHub Copilot | `uds init` → `.github/copilot-instructions.md` | - |
| Google Antigravity | `uds init` → `INSTRUCTIONS.md` | - |
| Gemini CLI | `uds init` → `GEMINI.md` | - |

> **注意**：`uds init` 可在交互式设置中配置多个 AI 工具。详细的技能安装说明请参阅 [Agent Skills 安装](#agent-skills-安装)。

---

## 安装方式

### CLI 工具（主要安装）

CLI 工具是在项目中采用 UDS 的主要方式。

**npm（推荐）**
```bash
npm install -g universal-dev-standards
uds init    # 交互式初始化
uds check   # 检查采用状态
uds update  # 更新到最新版本
uds skills  # 列出已安装的技能
```

**npx（无需安装）**
```bash
npx universal-dev-standards init
```

**Beta 版本（最新功能）**
```bash
# 全局安装 beta 版
npm install -g universal-dev-standards@beta

# 或安装特定版本
npm install -g universal-dev-standards@3.5.0-beta.13

# 或通过 npx
npx universal-dev-standards@beta init
```

> **注意**：Beta 版本包含实验性功能，例如方法论系统（`/methodology`、`/bdd`）。详见[功能可用性](#功能可用性)。

**克隆并链接（开发用）**

macOS / Linux：
```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards/cli && npm install && npm link
```

Windows (PowerShell)：
```powershell
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards\cli; npm install; npm link
```

详细用法请参阅 [CLI README](../../cli/README.md)，Windows 相关说明请参阅 [Windows 指南](../../docs/WINDOWS-GUIDE.md)，项目维护与开发流程请参阅[作业流程](docs/OPERATION-WORKFLOW.md)。

---

### AI 工具配置

每个 AI 工具使用配置文件来定义项目特定规则。`uds init` 会自动生成这些文件：

| 工具 | 配置文件 | 位置 |
|------|----------|------|
| Claude Code | `CLAUDE.md` | 项目根目录 |
| OpenCode | `AGENTS.md` | 项目根目录 |
| OpenAI Codex | `AGENTS.md` | 项目根目录 |
| Cursor | `.cursorrules` | 项目根目录 |
| Windsurf | `.windsurfrules` | 项目根目录 |
| Cline | `.clinerules` | 项目根目录 |
| GitHub Copilot | `copilot-instructions.md` | `.github/` |
| Google Antigravity | `INSTRUCTIONS.md` | 项目根目录 |
| Gemini CLI | `GEMINI.md` | 项目根目录 |

或从 `integrations/` 目录手动复制。

---

### Agent Skills 安装

Agent Skills 是增强 AI 辅助开发的交互式命令（`/commit`、`/tdd`、`/review` 等）。Skills 遵循 [Agent Skills 标准](https://agentskills.io)，可跨多个 AI 工具使用。

**包含的技能（15 个）：** ai-collaboration-standards、changelog-guide、code-review-assistant、commit-standards、documentation-guide、error-code-guide、git-workflow-guide、logging-guide、project-structure-guide、release-standards、requirement-assistant、spec-driven-dev、tdd-assistant、test-coverage-assistant、testing-guide

#### 支持的工具

| 工具 | Skills 支持 | 推荐方式 |
|------|------------|----------|
| Claude Code | ✅ 完整 | Plugin Marketplace |
| OpenCode | ✅ 完整 | UDS CLI |
| （更多工具即将支持） | - | - |

#### 方法一：Claude Code Plugin Marketplace

Claude Code 用户可通过 Plugin Marketplace 最简单地安装：

```bash
/plugin install universal-dev-standards@asia-ostrich
```

**优势：**
- 单一命令安装
- 新版本发布时自动更新
- 所有 15 个技能即时加载

**从 v3.2.x 迁移？** 如果您使用旧的 marketplace 名称：

```bash
/plugin uninstall universal-dev-standards@universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

#### 方法二：UDS CLI（推荐用于 OpenCode）

OpenCode 和其他工具，请使用 UDS CLI：

```bash
# 全局安装 UDS CLI
npm install -g universal-dev-standards

# 初始化项目 - 选择您的 AI 工具
uds init

# Skills 会安装到 .claude/skills/
# OpenCode 会自动检测此路径 ✅
```

使用 `uds check` 验证安装状态和 skills 兼容性。

#### 方法三：手动安装

克隆并直接复制 skills：

macOS / Linux：
```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git /tmp/uds
cp -r /tmp/uds/skills/claude-code/* ~/.claude/skills/    # 全局
# 或：cp -r /tmp/uds/skills/claude-code/* .claude/skills/  # 项目
rm -rf /tmp/uds
```

Windows (PowerShell)：
```powershell
git clone https://github.com/AsiaOstrich/universal-dev-standards.git $env:TEMP\uds
Copy-Item -Recurse $env:TEMP\uds\skills\claude-code\* $env:USERPROFILE\.claude\skills\
Remove-Item -Recurse $env:TEMP\uds
```

#### 社区 Marketplace

从社区平台发现和安装 skills：

- **[n-skills](https://github.com/numman-ali/n-skills)** - 精选 marketplace，支持 Claude Code、OpenCode、Cursor 等
- **[claude-plugins.dev](https://claude-plugins.dev/skills)** - 从 GitHub 自动索引的技能发现
- **[agentskills.io](https://agentskills.io)** - 官方 Agent Skills 规范

#### 脚本安装（已弃用）

> ⚠️ 脚本安装正在逐步淘汰。请改用 Plugin Marketplace 或 UDS CLI。

macOS / Linux：
```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards/skills/claude-code && ./install.sh
```

Windows (PowerShell)：
```powershell
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards\skills\claude-code; .\install.ps1
```

---

### 多 AI 工具支持

| AI 工具 | 状态 | 路径 | 平台测试 |
|---------|------|------|----------|
| Claude Code | ✅ 完成 | `skills/claude-code/` | macOS ✅ |
| OpenCode | 🧪 测试中 | `integrations/opencode/` | macOS 🧪 |
| GitHub Copilot | 🧪 测试中 | `integrations/github-copilot/` | macOS 🧪 |
| Cursor | ⏳ 规划中 | `integrations/cursor/` | - |
| Windsurf | ⏳ 规划中 | `integrations/windsurf/` | - |
| Cline | ⏳ 规划中 | `integrations/cline/` | - |
| Google Antigravity | ⏳ 规划中 | `integrations/google-antigravity/` | - |
| OpenAI Codex | ⏳ 规划中 | `integrations/codex/` | - |
| Gemini CLI | ⏳ 规划中 | `integrations/gemini-cli/` | - |

### 平台支持

| 平台 | CLI 工具 | Skills | 备注 |
|------|----------|--------|------|
| **macOS** | ✅ 已测试 | ✅ 已测试 | 主要开发平台 |
| **Linux** | ⚠️ 未测试 | ⚠️ 未测试 | 预期可运行（基于 Node.js） |
| **Windows** | ⚠️ 未测试 | ⚠️ 未测试 | 提供 PowerShell 脚本 |

> **注意**：UDS CLI 基于 Node.js，应可在所有平台运行。平台测试指的是在该操作系统上与 AI 工具配合使用的功能验证。详细状态请参阅 [AI Agent 规划](docs/AI-AGENT-ROADMAP.md)。

---

## 核心原则

1. **通用适用性** - 标准适用于任何编程语言、框架或领域
2. **模块化设计** - 选择与您项目相关的标准
3. **可扩展架构** - 可使用语言特定、框架特定或领域特定规则进行扩展
4. **基于证据** - 标准源自行业最佳实践与实际验证
5. **自包含** - 每个标准都可独立使用，无需依赖其他标准

---

## 内容概览

```
universal-dev-standards/
├── core/                    # 核心通用标准（16 个文件）
├── ai/                      # AI 优化标准（.ai.yaml）
├── options/                 # 人类可读选项指南
├── skills/                  # AI 工具技能（Claude Code 等）
├── extensions/              # 语言/框架/领域特定
├── templates/               # 文档模板
├── integrations/            # 工具配置
├── cli/                     # CLI 工具（uds 命令）
├── locales/                 # 翻译（zh-TW、zh-CN）
└── adoption/                # 采用指南
```

参阅下方的[详细目录结构](#详细目录结构)。

---

## 标准等级

### 等级 1：必要（最小可行标准）

**每个项目必须具备**：
- `anti-hallucination.md` - AI 协作指南
- `checkin-standards.md` - 提交前的质量门槛
- `commit-message-guide.md` - 标准化的 commit 格式
- `spec-driven-development.md` - 规格驱动开发标准

**预估设置时间**：30 分钟

---

### 等级 2：推荐（专业质量）

**包含等级 1 +**：
- `git-workflow.md` - 分支策略
- `code-review-checklist.md` - 审查指南
- `versioning.md` - 版本管理
- `changelog-standards.md` - 变更日志撰写指南
- `testing-standards.md` - 测试金字塔（UT/IT/ST/E2E）
- 语言特定的风格指南（例如 `csharp-style.md`）

**预估设置时间**：2 小时

---

### 等级 3：全面（企业级）

**包含等级 2 +**：
- `documentation-structure.md` - 文档组织
- 框架特定标准（例如 `dotnet.md`）
- 领域特定标准（例如 `fintech.md`）
- OpenSpec 集成用于规格驱动开发
- 完整模板套件

**预估设置时间**：1-2 天

---

## AI 优化标准

### 双格式架构

| 格式 | 位置 | 使用场景 | Token 使用量 |
|------|------|----------|--------------|
| **人类可读** | `core/`、`options/` | 文档、入职、参考 | 标准 |
| **AI 优化** | `ai/` | AI 助手、自动化、CLAUDE.md | 减少约 80% |

### 使用 AI 优化标准

```yaml
# 在 CLAUDE.md 或系统提示中引用
standards:
  source: ai/standards/
  options:
    workflow: ai/options/git-workflow/github-flow.ai.yaml
    commit_language: ai/options/commit-message/english.ai.yaml
```

### 可用选项

| 类别 | 选项 |
|------|------|
| **Git 工作流** | `github-flow`、`gitflow`、`trunk-based`、`squash-merge`、`merge-commit`、`rebase-ff` |
| **Commit 语言** | `english`、`traditional-chinese`、`bilingual` |
| **测试层级** | `unit`、`integration`、`system`、`e2e` |
| **项目结构** | `nodejs`、`python`、`dotnet`、`java`、`go` |

---

## 标准覆盖

| 标准 | 技能可用 | 采用方式 |
|------|----------|----------|
| anti-hallucination.md | ai-collaboration-standards | 安装技能 |
| commit-message-guide.md | commit-standards | 安装技能 |
| code-review-checklist.md | code-review-assistant | 安装技能 |
| git-workflow.md | git-workflow-guide | 安装技能 |
| versioning.md + changelog-standards.md | release-standards | 安装技能 |
| testing-standards.md | testing-guide | 安装技能 |
| documentation-structure.md | documentation-guide | 安装技能 |
| requirement templates | requirement-assistant | 安装技能 |
| error-code-standards.md | error-code-guide | 安装技能 |
| logging-standards.md | logging-guide | 安装技能 |
| test-driven-development.md | tdd-assistant | 安装技能 |
| test-completeness-dimensions.md | test-coverage-assistant | 安装技能 |
| **checkin-standards.md** | - | 复制到项目 |
| **spec-driven-development.md** | - | 复制到项目 |
| **project-structure.md** | - | 复制到项目 |
| **documentation-writing-standards.md** | - | 复制到项目 |

> **重要**：对于有技能的标准，使用技能或复制源文档 - **择一即可，不要两者都做**。

详细指导请参阅[采用指南](../../adoption/ADOPTION-GUIDE.md)。

---

## 使用模式比较

使用 UDS 时，您可以选择三种使用模式：

| 模式 | 适合对象 | 主要优势 |
|------|---------|---------|
| **仅使用技能** | 个人开发者 + Claude Code | 最低 token 使用量，最佳交互体验 |
| **仅使用标准** | 多工具团队 / 企业 | 完全自定义，版本控制 |
| **技能 + 标准** | 完整体验 / 学习 | 100% 功能覆盖 |

### 快速决策指南

- **使用 Claude Code 的个人项目？** → 仅使用技能 (`standardsScope: minimal`)
- **使用多个 AI 工具的团队？** → 技能 + 标准 (`standardsScope: full`)
- **企业合规需求？** → 仅使用标准（无技能依赖）

详细分析请参阅 [使用模式比较](../../docs/USAGE-MODES-COMPARISON.md)，包括功能覆盖、token 效率和建议。

---

## 自定义指南

### 自定义内容写在哪里

| 自定义类型 | 文件 | 位置 |
|-----------|------|------|
| AI 工具规则与排除 | `CLAUDE.md`、`.cursorrules` 等 | 项目根目录 |
| 项目标准覆盖 | `PROJECT-STANDARDS.md` | 项目根目录 |
| 复制的核心标准 | `docs/standards/` | 您的项目 |

### 调整标准

1. **语言选择**：英文、繁体中文、简体中文 commit 类型
2. **工具配置**：`npm run build`、`dotnet build`、`mvn package`
3. **阈值调整**：测试覆盖率 80%、最大方法长度 50 行
4. **范围定义**：为您的模块定义允许的 commit 范围

### 排除标准

1. **在 `uds init` 时**：交互式选择仅需要的标准
2. **选择性采用**：仅复制特定文件
3. **AI 工具排除**：在 `CLAUDE.md` 或 `.cursorrules` 中添加排除模式
4. **项目级覆盖**：创建 `PROJECT-STANDARDS.md` 记录偏差

---

## 多语言支持

### Commit 消息语言示例

**英文**：
```
feat(auth): Add OAuth2 support
fix(api): Resolve memory leak
```

**繁体中文**：
```
新增(認證): 實作 OAuth2 支援
修正(API): 解決記憶體洩漏
```

**简体中文**：
```
新增(认证): 实现 OAuth2 支持
修正(API): 解决内存泄漏
```

---

## 工具集成

### Git Hooks

```bash
npm install --save-dev @commitlint/{cli,config-conventional} husky
npx husky install
npx husky add .husky/commit-msg 'npx commitlint --edit $1'
```

### CI/CD 集成

```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx commitlint --from HEAD~1 --to HEAD --verbose
      - run: npm run build
      - run: npm test -- --coverage
      - run: npm run lint
```

### OpenSpec 集成

```bash
cp -r integrations/openspec/ your-project/openspec/
mkdir -p your-project/.claude/commands/
cp integrations/openspec/commands/* your-project/.claude/commands/
```

---

## 示例

### 示例 1：.NET Web API 项目

```
核心标准：anti-hallucination.md、checkin-standards.md、commit-message-guide.md、git-workflow.md（GitFlow）
扩展：languages/csharp-style.md、frameworks/dotnet.md
模板：CLAUDE.md（为 .NET 自定义）、README.md、CONTRIBUTING.md
```

### 示例 2：React SPA 项目

```
核心标准：anti-hallucination.md、checkin-standards.md、commit-message-guide.md、git-workflow.md（GitHub Flow）
扩展：languages/typescript-style.md、frameworks/react.md
工具：ESLint + Prettier、Husky + commitlint、Jest + React Testing Library
```

### 示例 3：Python ML 项目

```
核心标准：anti-hallucination.md、checkin-standards.md、commit-message-guide.md、git-workflow.md（主干开发）
扩展：languages/python-style.md、domains/machine-learning.md
工具：Black、pylint、pytest、mypy
```

---

## 贡献

### 如何贡献

1. **建议改进**：开启 issue 描述问题和建议的解决方案
2. **添加示例**：提交您如何应用这些标准的示例
3. **扩展标准**：贡献新的语言/框架/领域扩展
4. **翻译**：帮助将标准翻译成其他语言

### 贡献指南

所有贡献必须：
- 维持语言/框架/领域无关性（对于核心标准）
- 在至少 2 个不同情境中包含示例
- 遵循现有的文档结构
- 以 CC BY 4.0 授权

---

## 延伸阅读

### 相关标准与框架

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Git Best Practices](https://sethrobertson.github.io/GitBestPractices/)
- [Code Review Best Practices](https://google.github.io/eng-practices/review/)

### 书籍与文章

- **The Art of Readable Code** by Boswell & Foucher
- **Clean Code** by Robert C. Martin
- **The Pragmatic Programmer** by Hunt & Thomas
- **Accelerate** by Forsgren, Humble, and Kim

---

## 版本历史

| 版本 | 日期 | 亮点 |
|------|------|------|
| 3.2.2 | 2026-01-06 | 新增 `uds skills` 命令；弃用手动安装脚本 |
| 3.2.0 | 2026-01-02 | Plugin Marketplace 支持；CLI 增强 |
| 3.0.0 | 2025-12-30 | 完整 Windows 支持；AI 优化标准；npm 发布 |

完整版本历史请参阅 [CHANGELOG.md](CHANGELOG.md)。

---

## 授权

| 组件 | 授权 |
|------|------|
| 文档（`core/`、`extensions/`、`templates/` 等）| [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| CLI 工具（`cli/`）| [MIT](../../cli/LICENSE) |

两种授权都是宽松型授权，允许商业使用、修改与再发布。详情请参阅 [LICENSE](../../LICENSE)。

---

## 社区

- **Issues**：报告错误或建议改进
- **Discussions**：分享您如何使用这些标准
- **Examples**：提交您的项目作为示例

---

## 采用标准检查清单

- [ ] 选择安装方式（Marketplace / npm / 手动）
- [ ] 运行 `uds init` 或复制核心标准
- [ ] 如需要，添加语言/框架扩展
- [ ] 在 CONTRIBUTING.md 中配置项目特定设置
- [ ] 设置 Git hooks（commitlint、pre-commit）
- [ ] 在 CI/CD 中集成质量门槛
- [ ] 对团队进行标准培训
- [ ] 创建第一个遵循标准的 commit

---

**准备好提升项目的质量了吗？** 从上方的快速开始开始！

---

**由开源社区用心维护**

---

## 详细目录结构

```
universal-dev-standards/
├── core/                                  # 核心通用标准（16 个文件）
│   ├── anti-hallucination.md             # AI 协作指南
│   ├── changelog-standards.md            # 变更日志撰写指南
│   ├── checkin-standards.md              # 代码签入质量门槛
│   ├── code-review-checklist.md          # 代码审查指南
│   ├── commit-message-guide.md           # Commit 消息规范
│   ├── documentation-structure.md        # 文档组织
│   ├── documentation-writing-standards.md # 文档撰写指南
│   ├── error-code-standards.md           # 错误码规范
│   ├── git-workflow.md                   # Git 分支策略
│   ├── logging-standards.md              # 日志标准
│   ├── project-structure.md              # 项目目录规范
│   ├── spec-driven-development.md        # SDD 方法论与标准
│   ├── test-completeness-dimensions.md   # 测试完整度维度
│   ├── test-driven-development.md        # TDD 方法论
│   ├── testing-standards.md              # 测试标准（UT/IT/ST/E2E）
│   └── versioning.md                     # 语义化版本控制指南
│
├── ai/                             # AI 优化标准（v2.3.0）
│   ├── standards/                 # Token 高效的 YAML 格式（约 80% 减少）
│   │   ├── git-workflow.ai.yaml
│   │   ├── commit-message.ai.yaml
│   │   ├── testing.ai.yaml
│   │   └── ...
│   └── options/                   # 可配置选项
│       ├── git-workflow/          # github-flow、gitflow、trunk-based 等
│       ├── commit-message/        # english、traditional-chinese、bilingual
│       ├── testing/               # unit、integration、system、e2e
│       └── project-structure/     # nodejs、python、dotnet、java、go
│
├── options/                        # 人类可读选项指南（Markdown）
│   ├── git-workflow/              # 详细工作流文档
│   ├── commit-message/            # Commit 语言指南
│   ├── testing/                   # 测试层级指南
│   └── project-structure/         # 语言特定项目结构
│
├── skills/                         # AI 工具技能（v2.1.0）
│   ├── claude-code/               # Claude Code 技能（15 个技能）
│   ├── cursor/                    # Cursor Rules（规划中）
│   ├── windsurf/                  # Windsurf Rules（规划中）
│   ├── cline/                     # Cline Rules（规划中）
│   ├── copilot/                   # GitHub Copilot（规划中）
│   └── _shared/                   # 共享模板
│
├── extensions/                     # 可选扩展
│   ├── languages/                 # 语言特定标准
│   │   ├── csharp-style.md        # C# 编码规范
│   │   └── php-style.md           # PHP 8.1+ 风格指南
│   ├── frameworks/                # 框架特定标准
│   │   └── fat-free-patterns.md   # Fat-Free Framework 模式
│   ├── locales/                   # 地区特定标准
│   │   └── zh-tw.md               # 繁体中文
│   └── domains/                   # 领域特定标准
│       └── （即将推出）
│
├── templates/                      # 项目文档模板
│   ├── requirement-*.md           # 需求模板
│   └── migration-template.md      # 迁移计划模板
│
├── integrations/                   # 工具配置文件
│   ├── cline/                     # Cline .clinerules
│   ├── cursor/                    # Cursor .cursorrules
│   ├── github-copilot/            # Copilot 指令
│   ├── google-antigravity/        # Antigravity 集成
│   ├── windsurf/                  # Windsurf .windsurfrules
│   └── openspec/                  # OpenSpec 框架
│
├── cli/                           # CLI 工具
│   └── （uds 命令）
│
├── locales/                       # 翻译
│   ├── zh-TW/                     # 繁体中文
│   └── zh-CN/                     # 简体中文
│
└── adoption/                       # 采用指南
    └── ADOPTION-GUIDE.md
```
