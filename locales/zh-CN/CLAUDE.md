---
source: ../../CLAUDE.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-10-16
source_hash: a1de69c3a838
status: current
---

# Universal Development Standards - 项目指南

本文档定义 Universal Development Standards 项目本身的开发标准。作为一个向其他项目提供开发标准的框架，我们身体力行践行自身所倡导的理念（“吃自己的狗粮”）。

## 项目概述

Universal Development Standards 是一个语言无关、框架无关的开发标准框架。它提供：

- **核心标准** (`core/`)：70+ 个基础开发标准
- **AI 技能** (`skills/`)：用于 AI 辅助开发的 Claude Code 技能
- **CLI 工具** (`cli/`)：用于采用标准的 Node.js CLI
- **集成** (`integrations/`)：针对各种 AI 工具的配置
- **本地化** (`locales/`)：多语言支持（英语、繁体中文）

## 技术栈

| 组件 | 技术 | 版本 |
|-----------|------------|---------|
| 运行时 | Node.js | >= 18.0.0 |
| 模块系统 | ES Modules | - |
| 测试 | Vitest | ^4.0.16 |
| 代码检查 | ESLint | ^8.56.0 |
| CLI 框架 | Commander.js | ^12.1.0 |
| 交互式提示 | Inquirer.js | ^9.2.12 |

## 开发标准

> **核心标准使用规则**：
> 在验证标准、检查代码或执行任务时，**优先**阅读 `core/` 中的简明规则（例如 `core/testing-standards.md`）。
> **仅在**明确要求提供教学内容、详细解释或教程时，才阅读 `core/guides/` 或 `methodologies/guides/`。
> 这能确保 token 效率并聚焦上下文。

> **单一事实来源优先级（仅限源码仓库）**：
> 在此 UDS 源码仓库中，`core/*.md` 是**实时单一事实来源**。
> `<!-- UDS:STANDARDS:START -->` 区块内的 `.standards/*.ai.yaml` 文件是由 `npx uds install/update` 维护的**采用者狗粮快照**——根据 DEC-044，`uds update` 不能在源码仓库内运行，因此该快照会滞后于 `core/`。
> 当两者出现分歧时，**始终以 `core/` 为准**。从该仓库 CWD 启动的子代理必须将 `core/*.md` 视为权威依据。

### 1. Commit 信息格式

遵循 `core/commit-message-guide.md` 中定义的 Conventional Commits 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型：**
- `feat`: 新功能或标准
- `fix`: Bug 修复或错误更正
- `docs`: 文档更新
- `chore`: 维护任务
- `test`: 测试相关变更
- `refactor`: 代码重构
- `style`: 格式化变更

**示例：**
```bash
feat(core): add new testing completeness dimensions
docs(skills): update Claude Code skill documentation
fix(cli): resolve path resolution issue on Windows
chore(i18n): sync translations with source files
```

### 2. 分支策略

遵循 `core/git-workflow.md` 中定义的 Git 工作流：

| 分支 | 用途 |
|--------|---------|
| `main` | 稳定、可用于生产环境的发布版本 |
| `feature/*` | 新功能与增强 |
| `fix/*` | Bug 修复 |
| `docs/*` | 文档更新 |
| `chore/*` | 维护任务 |

### 3. 代码风格

**JavaScript：**
- 字符串使用单引号
- 语句以分号结尾
- 使用 ES Module 语法（`import`/`export`）
- 遵循 `cli/.eslintrc.json` 中的 ESLint 配置

**Markdown：**
- 使用 ATX 风格标题（`#`、`##`、`###`）
- 标题前后包含空行
- 使用带有语言说明的围栏式代码块

### 4. 测试要求

- 所有 CLI 功能都必须有对应的测试
- 提交前运行测试：`npm test`（在 `cli/` 目录中）
- 运行代码检查：`npm run lint`（在 `cli/` 目录中）
- 测试覆盖率报告：`npm run test:coverage`

### 5. 翻译同步

修改核心标准时：
1. 先更新英文源文件
2. 将变更同步到 `locales/zh-TW/` 目录
3. 运行翻译检查：`./scripts/check-translation-sync.sh`

## 快捷命令

### macOS / Linux

```bash
# CLI development (run from cli/ directory)
cd cli
npm install          # Install dependencies
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Check code style
npm run test:coverage # Generate coverage report

# Translation sync check (run from root)
./scripts/check-translation-sync.sh

# Version sync check (run from root)
./scripts/check-version-sync.sh

# Standards consistency check (run from root)
./scripts/check-standards-sync.sh

# Pre-release check (run all checks at once)
./scripts/pre-release-check.sh

# Local CLI testing
node cli/bin/uds.js list
node cli/bin/uds.js init --help

# Health score (self-diagnosis)
node cli/bin/uds.js audit --score --self
node cli/bin/uds.js audit --score --self --format json

# External reference check
node scripts/check-external-references.mjs

# Hook statistics analysis (requires opt-in: .uds/config.json {"hookStats": true})
node scripts/analyze-hook-stats.mjs
```

### Windows (PowerShell)

```powershell
# CLI development (run from cli\ directory)
cd cli
npm install          # Install dependencies
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Check code style
npm run test:coverage # Generate coverage report

# Translation sync check (run from root)
.\scripts\check-translation-sync.ps1

# Version sync check (run from root)
.\scripts\check-version-sync.ps1

# Standards consistency check (run from root)
.\scripts\check-standards-sync.ps1

# Pre-release check (run all checks at once)
.\scripts\pre-release-check.ps1

# Local CLI testing
node cli\bin\uds.js list
node cli\bin\uds.js init --help
```

### Windows (Git Bash)

```bash
# Same commands as macOS / Linux work in Git Bash
./scripts/check-translation-sync.sh
./scripts/check-version-sync.sh
./scripts/check-standards-sync.sh
./scripts/pre-release-check.sh
```

## Testing Workflow / 测试工作流程

### When to Run Tests / 何时运行测试

| Timing | Command | Purpose |
|--------|---------|---------|
| 开发期间 | `npm run test:watch` | 即时反馈 |
| 提交前 | 自动（git hook） | 防止回归 |
| PR 之前 | `./scripts/pre-release-check.sh` | 完整验证 |
| CI/CD | 自动（GitHub Actions） | 持续集成 |

### Git Hooks (Automatic) / Git Hooks（自动运行）

Pre-commit hook (`cli/.husky/pre-commit`) 自动运行：
- `npm run test:unit` - 仅单元测试，不包含 E2E（快速，< 5 秒）
- `eslint --fix` - 通过 lint-staged 自动修复代码风格
- `check-standards-sync.sh` - 如果修改了 core/*.md 文件
- `check-cli-docs-sync.sh` - 如果修改了 cli/bin/*.js 文件

> **Note**：如果任何检查失败，提交将被中止。

### Manual Testing Commands / 手动测试命令

```bash
# In cli/ directory
npm test              # Run all tests once
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report
npm run lint          # Check code style
```

### AI Assistant Testing Guidelines / AI 助手测试指南

> **Important**：本节为 AI 助手（Claude Code 等）提供关于如何在此项目中高效运行测试的指导。

**Test Suite Characteristics / 测试套件特性：**
- 完整测试套件：跨 30+ 个文件的约 1,000 个测试（单元测试 + E2E）
- 单元测试：< 10 秒运行时间
- E2E 测试：约 6 分钟（启动 CLI 子进程）
- 完整套件运行时间：约 6 分钟

**🚀 Recommended AI Agent Commands / 推荐的 AI Agent 命令：**

| Scenario | Command | Execution Time |
|----------|---------|----------------|
| **快速开发** | `cd cli && npm run test:quick` | < 6 秒（864 个测试） |
| **测试发现** | `cd cli && npm run test:discover` | < 1 秒 |
| **仅单元测试** | `cd cli && npm run test:unit` | < 3 秒 |
| **排除 E2E 测试** | `cd cli && npm run test:fast` | < 5 秒 |
| **特定变更** | `npm test -- tests/unit/core/ tests/commands/` | < 2 秒 |

**📋 Test Discovery Tool / 测试发现工具：**
```bash
# Discover all tests and get execution commands
cd cli && npm run test:discover

# Show commands for different scenarios
cd cli && node scripts/test-discovery.mjs commands development
```

**⚠️ Avoid / 避免：**
- 使用 `--reporter=summary` 或自定义 reporter（兼容性问题）
- 在未检查当前工作目录的情况下运行测试

**✅ Best Practice / 最佳实践：**
```bash
# ✅ Recommended: Quick development testing
cd cli && npm run test:quick

# ✅ Good: Test specific modules
npm test -- tests/commands/ai-context.test.js tests/unit/utils/workflows-installer.test.js

# ✅ Good: Use test discovery for targeted testing
cd cli && npm run test:discover

# ✅ Full test suite is now fast enough to run directly
cd cli && npm test  # ~6 minutes
```

### Test Certificate System (Optional) / 测试凭证系统（可选）

测试凭证系统可用于高级工作流程，但由于完整测试套件运行迅速（约 6 分钟），默认情况下未在预发布检查中使用。

**Commands / 命令：**
```bash
# Generate certificate after passing tests (optional)
cd cli && npm run test:with-cert

# Verify existing certificate
cd cli && npm run test:verify
```

> **Note**：预发布检查（`pre-release-check.sh`）始终运行完整的测试套件。如果需要，凭证系统可用于自定义 CI/CD 工作流程。

## Code Check-in Standards (Mandatory) / 代码签入规范（强制）

每次提交在 commit 之前必须通过以下质量门禁：

### Core Philosophy / 核心理念

每次提交应当：
- ✅ 是一个完整的逻辑工作单元
- ✅ 使代码库保持在可用状态
- ✅ 可回滚且不破坏功能
- ✅ 包含其自身的测试（针对新功能）

### Mandatory Checklist / 强制检查清单

在每次提交之前，务必验证：

1. **构建验证**
   - [ ] 代码成功编译（零错误）
   - [ ] 满足所有依赖项

2. **测试验证**
   - [ ] 所有现有测试均通过（100% 通过率）
   - [ ] 新代码具有对应的测试
   - [ ] 测试覆盖率未降低

3. **代码质量**
   - [ ] 遵循编码规范
   - [ ] 无硬编码机密（密码、API 密钥）
   - [ ] 无安全漏洞

4. **文档**
   - [ ] API 文档已更新（如适用）
   - [ ] 仅在预发布时更新 CHANGELOG，而非每次提交都更新（遵循 [changelog-standards.md](core/changelog-standards.md)）

5. **工作流合规性**
   - [ ] 分支命名正确（`feature/`、`fix/`、`docs/`、`chore/`）
   - [ ] 提交信息遵循 Conventional Commits 规范
   - [ ] 与目标分支同步

### ❌ Never Commit When / 绝不在以下情况提交

- 构建存在错误
- 测试失败
- 功能未完成且会破坏功能性
- 包含针对关键逻辑的 WIP/TODO 注释
- 包含调试代码（console.log、print 语句）
- 包含被注释掉的代码块

### Quick Verification Commands / 快速验证命令

```bash
# In cli/ directory
npm run lint         # Check code style
npm test             # Run all tests
npm run build        # Verify build (if applicable)
```

### Reference / 参考

完整签入规范请参阅 [core/checkin-standards.md](core/checkin-standards.md)

---

## AI 协作指南

在此项目中使用 AI 助手（Claude Code、Cursor 等）时：

### Conversation Language / 对话语言

- **与 AI 助手的所有对话均应使用繁体中文（繁体中文）进行**
- AI 助手应以繁体中文回复用户的问题与请求

### 应该做的：
- 参考 `core/` 中现有标准以保持一致性
- 文档遵循双语格式（英文 + 繁体中文）
- 修改核心规范后检查翻译同步
- 提交前执行测试和代码检查

### 不应该做的：
- 创建新标准时不遵循现有模板结构
- 修改翻译文件而不更新源文件
- 跳过 PR 的代码审查检查清单
- 在核心规范中引入特定语言或特定框架的内容
- 未先阅读代码便对其做出断言（参见反幻觉规范）
- 未先运行测试便提交代码

### 专案特定脉络：
- 本项目使用 ES Modules（非 CommonJS）
- 所有核心规范应保持语言/框架无关
- 需要双语文档（英文为主，zh-TW 翻译）
- CLI 工具是主要代码组件；大部分内容是 Markdown

### BDD/TDD Output Directories / BDD/TDD 输出目录

从 SDD 规格生成 BDD 和 TDD 文件时：

| 类型 | 目录 | 说明 |
|------|-----------|-------------|
| BDD Features | `tests/features/` | Gherkin .feature 文件 |
| TDD Unit Tests | `cli/tests/unit/` | Vitest 单元测试 |
| SDD Specs | `docs/specs/` | 规格文档 |

**BDD Feature 文件格式：**
- 包含 `@SPEC-XXX` 和 `@AC-N` 标签以供追溯
- 包含 `# [Source: path:AC-N]` 注释以标明来源
- 每个 AC 一个 Scenario（1:1 映射）

**TDD 测试文件格式：**
- 嵌套 describe：SPEC 层级 → AC 层级
- AAA 模式注释（Arrange-Act-Assert）
- 使用 `[TODO]` 标记作为实现的占位符

### Anti-Hallucination Standards / 反幻觉规范

在此项目上工作时，AI 助手必须遵循 [core/anti-hallucination.md](core/anti-hallucination.md)：

| 要求 | 说明 |
|-------------|-------------|
| **基于证据** | 仅分析已明确阅读的内容 |
| **来源归属** | 使用包含 file:line 引用的 `[Source: Code]`、`[Source: Docs]` 标签 |
| **确定性分类** | 使用 `[Confirmed]`、`[Inferred]`、`[Assumption]`、`[Unknown]` 标签 |
| **提供建议** | 提供选择时始终包含推荐选项及理由 |
| **绝不捏造** | 未经核实绝不捏造 API、配置或需求 |

### Code Review Standards / 代码审查规范

审查代码或 PR 时，请遵循 [core/code-review-checklist.md](core/code-review-checklist.md)：

**审查清单类别：**
1. 功能性 - 是否正确运行？
2. 设计与架构 - 是否遵循项目模式？
3. 代码质量 - 是否整洁、符合 DRY、SOLID 原则？
4. 可读性 - 是否易于理解？
5. 测试 - 覆盖率是否充分？
6. 安全性 - 是否无安全漏洞？
7. 性能 - 是否高效？
8. 错误处理 - 是否得到妥善处理？
9. 文档 - 是否已更新？
10. 依赖项 - 是否合理必要？

**评论前缀：**

| 前缀 | 含义 |
|--------|---------|
| ❗ BLOCKING | 合并前必须修复 |
| ⚠️ IMPORTANT | 应该修复 |
| 💡 SUGGESTION | 优化建议（有则更好） |
| ❓ QUESTION | 需要进一步澄清 |

### Testing Standards / 测试规范

有关测试要求，请遵循 [core/testing-standards.md](core/testing-standards.md)：

**测试金字塔（默认比例）：**

| 层级 | 比例 | 目的 |
|-------|-------|---------|
| 单元测试 (UT) | 70% | 测试单个函数/方法 |
| 集成测试 (IT) | 20% | 测试组件交互 |
| E2E 测试 | 10% | 测试用户工作流程 |

**关键要求：**
- 所有新功能必须具有对应的测试
- 提交前运行测试
- 保持或提高测试覆盖率
- 使用遵循 `should_[expected]_when_[condition]` 模式的描述性测试名称

### Standards Compliance Reference / 规范合规参考

| 任务 | 必须遵循 | 参考 |
|------|-------------|-----------|
| 代码分析 | 反幻觉标准 | [core/anti-hallucination.md](core/anti-hallucination.md) |
| PR 审查 | 代码审查清单 | [core/code-review-checklist.md](core/code-review-checklist.md) |
| 新增功能 | 测试标准 | [core/testing-standards.md](core/testing-standards.md) |
| 任何提交 | 提交规范 | [core/checkin-standards.md](core/checkin-standards.md) |
| 新功能设计 | 规格驱动开发 | [core/spec-driven-development.md](core/spec-driven-development.md) |
| 新增/修改 Core↔Skill | /sdd + Sync Check | 参见下方的“Core↔Skill 同步规则” |
| 追溯性规格追踪 | /sdd-retro | 参见下方的“规格追踪” |
| 撰写 AI 指令 | AI 指令标准 | [core/ai-instruction-standards.md](core/ai-instruction-standards.md) |
| 撰写文档 | 文档撰写标准 | [core/documentation-writing-standards.md](core/documentation-writing-standards.md) |
| 面向 AI 的项目架构 | AI 友好架构 | [core/ai-friendly-architecture.md](core/ai-friendly-architecture.md) |
| 标准加载策略 | 上下文感知加载 | [core/context-aware-loading.md](core/context-aware-loading.md) |
| 跨会话状态 | 项目上下文记忆 | [core/project-context-memory.md](core/project-context-memory.md) |

---

## 采用层整合策略

UDS 定位为**纯标准库**（Standards Definition Library）。它定义“该做什么”，并通过 `.standards/` 由任意采用层（Adapters / Pipelines / Agents / IDE）读取与执行。UDS 本身**不绑定**任何特定下游产品、不提供 runtime、不指定授权模式。

```
UDS（标准定义；MIT + CC BY 4.0）──→ 采用层（任意 Adapter / Pipeline / Agent / IDE）
```

### UDS 的角色

1. **标准来源**：UDS 定义 70+ 项标准供任意采用层消费
2. **工具无关**：UDS 支持 12+ 种 AI 工具与一般 CI / IDE 整合
3. **授权独立**：UDS 采 MIT + CC BY 4.0；采用层的授权选择与 UDS 无关

### 标准如何流向采用层

| 流向 | 机制 | 说明 |
|------|------|------|
| UDS → 采用层 | `.standards/` copy-once | 采用层通过 `uds init` 安装标准，于 Quality Gate / Agent prompt / IDE rule 中读取 |
| UDS → CI 整合 | `.standards/` 引用 | CI / pre-commit hook 读取对应 `.ai.yaml` 进行验证 |
| UDS → 采用层 bridges | 例如 TestPolicy 格式 | 采用层在 UDS 之上建立特定 bridge（如 test-governance → TestPolicy）|

### 对 UDS 开发的影响

- 新增/修改标准时，需考虑**通用采用场景**（不假设特定下游产品的内部结构）
- 标准格式需保持中性、可携（不嵌入采用层的实现细节）
- 标准的 scope 标记（universal/partial/uds-specific）影响可携性

---

<!-- UDS:STANDARDS:START -->
<!-- WARNING: This block is managed by UDS (universal-dev-standards). DO NOT manually edit. Use 'npx uds install' or 'npx uds update' to modify. -->
<!-- WARNING: This block is managed by UDS (universal-dev-standards). DO NOT manually edit. Use 'npx uds install' or 'npx uds update' to modify. -->
## Commit 消息语言
以**双语**格式（英文 + 繁体中文）编写 commit 消息。
格式：`<type>(<scope>): <English>. <中文>.`
正文必须为双语：英文在前 → 空行 → 中文在后。切勿在同一段落中混用语言。

## 规范合规说明

**MUST follow**（每次都要遵守）：
| 任务 | 标准 | 何时 |
|------|----------|------|
| 编写 commit | [commit-message.ai.yaml](../../.standards/commit-message.ai.yaml) | 每次 commit |
| 项目上下文 | [project-context-memory.ai.yaml](../../.standards/project-context-memory.ai.yaml) | 规划与编码 |

**SHOULD follow**（相关任务时参考）：
| 任务 | 标准 | 何时 |
|------|----------|------|
| Git 工作流 | [git-workflow.ai.yaml](../../.standards/git-workflow.ai.yaml) | 分支/合并决策 |
| 编写测试 | [testing.ai.yaml](../../.standards/testing.ai.yaml) | 创建测试时 |
| 开发者记忆 | [developer-memory.ai.yaml](../../.standards/developer-memory.ai.yaml) | 始终（协议） |

## 已安装标准索引

本项目采用 UDS 标准。所有规范位于 `.standards/`：

### 核心 (55 个标准)
- `anti-hallucination.ai.yaml` - anti-hallucination.ai.yaml
- `ai-friendly-architecture.ai.yaml` - ai-friendly-architecture.ai.yaml
- `commit-message.ai.yaml` - 提交信息格式
- `english.ai.yaml` - english.ai.yaml
- `checkin-standards.ai.yaml` - checkin-standards.ai.yaml
- `spec-driven-development.ai.yaml` - spec-driven-development.ai.yaml
- `code-review.ai.yaml` - code-review.ai.yaml
- `git-workflow.ai.yaml` - Git 工作流程
- `github-flow.ai.yaml` - github-flow.ai.yaml
- `squash-merge.ai.yaml` - squash-merge.ai.yaml
- `versioning.ai.yaml` - versioning.ai.yaml
- `changelog.ai.yaml` - changelog.ai.yaml
- `testing.ai.yaml` - 测试标准
- `unit-testing.ai.yaml` - unit-testing.ai.yaml
- `integration-testing.ai.yaml` - integration-testing.ai.yaml
- `documentation-structure.ai.yaml` - documentation-structure.ai.yaml
- `documentation-writing-standards.ai.yaml` - documentation-writing-standards.ai.yaml
- `ai-instruction-standards.ai.yaml` - ai-instruction-standards.ai.yaml
- `project-structure.ai.yaml` - project-structure.ai.yaml
- `error-codes.ai.yaml` - error-codes.ai.yaml
- `logging.ai.yaml` - logging.ai.yaml
- `test-completeness-dimensions.ai.yaml` - test-completeness-dimensions.ai.yaml
- `test-driven-development.ai.yaml` - test-driven-development.ai.yaml
- `behavior-driven-development.ai.yaml` - behavior-driven-development.ai.yaml
- `acceptance-test-driven-development.ai.yaml` - acceptance-test-driven-development.ai.yaml
- `reverse-engineering-standards.ai.yaml` - reverse-engineering-standards.ai.yaml
- `forward-derivation-standards.ai.yaml` - forward-derivation-standards.ai.yaml
- `ai-agreement-standards.ai.yaml` - ai-agreement-standards.ai.yaml
- `virtual-organization-standards.ai.yaml` - virtual-organization-standards.ai.yaml
- `refactoring-standards.ai.yaml` - refactoring-standards.ai.yaml
- `requirement-engineering.ai.yaml` - requirement-engineering.ai.yaml
- `security-standards.ai.yaml` - security-standards.ai.yaml
- `performance-standards.ai.yaml` - performance-standards.ai.yaml
- `accessibility-standards.ai.yaml` - accessibility-standards.ai.yaml
- `requirement-checklist.md` - requirement-checklist.md
- `requirement-template.md` - requirement-template.md
- `requirement-document-template.md` - requirement-document-template.md
- `deployment-standards.ai.yaml` - deployment-standards.ai.yaml
- `developer-memory.ai.yaml` - 开发者持久记忆
- `project-context-memory.ai.yaml` - 项目情境记忆
- `context-aware-loading.ai.yaml` - context-aware-loading.ai.yaml
- `test-governance.ai.yaml` - test-governance.ai.yaml
- `structured-task-definition.ai.yaml` - structured-task-definition.ai.yaml
- `acceptance-criteria-traceability.ai.yaml` - acceptance-criteria-traceability.ai.yaml
- `api-design-standards.ai.yaml` - api-design-standards.ai.yaml
- `database-standards.ai.yaml` - database-standards.ai.yaml
- `systematic-debugging.ai.yaml` - systematic-debugging.ai.yaml
- `model-selection.ai.yaml` - model-selection.ai.yaml
- `git-worktree.ai.yaml` - git-worktree.ai.yaml
- `verification-evidence.ai.yaml` - verification-evidence.ai.yaml
- `ai-command-behavior.ai.yaml` - ai-command-behavior.ai.yaml
- `ai-response-navigation.ai.yaml` - ai-response-navigation.ai.yaml
- `documentation-lifecycle.ai.yaml` - documentation-lifecycle.ai.yaml
- `adr-standards.ai.yaml` - adr-standards.ai.yaml
- `retrospective-standards.ai.yaml` - retrospective-standards.ai.yaml
- `dual-phase-output.ai.yaml` - 双阶段 LLM 输出标准（<analysis> 丢弃 + <summary> 保留）
- `circuit-breaker.ai.yaml` - 通用断路器（三态 CLOSED/HALF_OPEN/OPEN，防 API 雪崩）
- `token-budget.ai.yaml` - Token 阈值四区模型（安全/警告/危险/阻塞）
- `security-decision.ai.yaml` - 安全决策铁律（deny > ask > allow 优先级仲裁）
- `capability-declaration.ai.yaml` - Fail-Closed 能力声明（工具/Adapter 默认不安全）
<!-- UDS:STANDARDS:END -->

---

## Post-Modification Verification / 修改后验证

**重要提示**：完成以下任何修改后，AI 助手必须验证所有相关文件是否已更新（具体内容见下文各节）。完整的维护工作流在 AsiaOstrich dev-platform 规划中心（`cross-project/ops/uds-operation.md`）内部进行跟踪。

| 修改类型 | 关键检查项 |
|---|---|
| 添加/修改核心标准 | 更新 registry、翻译、Related Standards 章节 |
| 添加/修改 skill | 更新 skillFiles 映射、skill 数量测试 |
| 添加/修改 AI 工具集成 | 更新 ai-agent-paths.js、CLAUDE.md 的 integrations 列表 |
| 准备发布 | 运行 bump-version.mjs、更新 CHANGELOG、验证同步脚本 |
| 任何多文件变更 | 运行 check-standards-sync.sh + check-translation-sync.sh |
| 添加/修改安装命令 | 跨平台命令同步（见下文） |

### 快速验证（所有变更）

在进行任何修改后，运行：
```bash
# Run all checks at once (recommended)
./scripts/pre-release-check.sh

# Or run individual checks:
./scripts/check-standards-sync.sh
./scripts/check-translation-sync.sh
./scripts/check-version-sync.sh
./scripts/check-ai-agent-sync.sh
./scripts/check-spec-sync.sh        # Core↔Skill sync
./scripts/check-scope-sync.sh       # Scope universality check
./scripts/check-docs-integrity.sh   # Documentation integrity
./scripts/check-orphan-specs.sh     # Orphan spec detection
npx tsx scripts/check-ai-behavior-sync.ts # AI Agent Behavior coverage
cd cli && npm test && npm run lint
```

> **AI Agent 同步检查 SOP**：AI Agent 同步 SOP 在 dev-platform 规划中心（`cross-project/ops/uds-ai-agent-sync-sop.md`）内部进行维护。

### Core↔Skill Sync Rules (UDS-specific) / Core↔Skill 同步规则

> ⚠️ 本节专属于 UDS 项目。UDS 项目维护 Core Standard、Skill 与 Command 之间的双向关系。

#### Sync Architecture / 同步架构

```
Core Standard ◄──────────► Skill ◄──────────► Command
      │                       │                   │
      └───────────────────────┴───────────────────┘
                          ▼
                    Translations
```

#### Sync Matrix / 同步矩阵

| 变更来源 | 必须评估同步至 |
|---|---|
| Core Standard | → Skill, Command, AI YAML, Translations |
| Skill | → Core Standard（如适用）, Command, Translations |
| Command | → Skill, Translations |

#### Core↔Skill Mapping / Core↔Skill 对应

| 类别 | 描述 | 示例 |
|---|---|---|
| **Has Core Standard** | Skill 实现了一项 Core Standard | `commit-standards` ↔ `commit-message-guide.md` |
| **Utility Skill** | 无需 Core Standard（工具/生成器） | `docs-generator`, `code-formatter` |
| **Static Skill** | 仅供参考，无交互 | 仅链接至标准的 Skill |

#### Mandatory /sdd Workflow | 强制 /sdd 工作流程

**以下任何变更必须首先使用 `/sdd`：**

1. **Adding Features | 新增功能**
   - 新增 Core Standard
   - 新增 Skill
   - 新增 Slash Command

2. **Modifying Features | 修改功能**
   - 修改 Core Standard 内容
   - 修改 Skill 行为
   - 修改 Command 功能

3. **Removing Features | 移除功能**
   - 移除标准
   - 移除 Skill/Command

**例外情况（可跳过 /sdd）：**
- 错别字修复
- 格式调整
- 纯翻译更新
- 紧急热修复（必须事后补充文档记录）

#### Sync Check Script / 同步检查脚本

**macOS / Linux:**
```bash
./scripts/check-spec-sync.sh
```

**Windows PowerShell:**
```powershell
.\scripts\check-spec-sync.ps1
```

预期输出：
```
✓ commit-standards ↔ core/commit-message-guide.md
✓ testing-guide ↔ core/testing-standards.md
⚠ docs-generator (utility, no core standard required)
✓ All Skills synced with Core Standards
```

### Spec Tracking / Spec 追踪

三种机制确保 spec 的可追溯性：

1. **`/commit` spec 评估** — 对于 `feat`/`fix` 提交，AI 会建议创建或关联 spec。详情见 [`skills/commands/commit.md`](skills/commands/commit.md)。
2. **`/sdd-retro`** — 为未跟踪的提交（例如紧急热修复）事后补充创建 spec。详情见 [`skills/commands/sdd-retro.md`](skills/commands/sdd-retro.md)。
3. **孤立 spec 检测** — `check-orphan-specs.sh` 会标记停滞在非终态的 spec。已作为步骤 15 集成到 `pre-release-check.sh` 中（仅警告）。

### Scope Universality System / Scope 通用性标记系统

所有 Core Standard 与 Skill 均带有 `scope` 字段标记，以指明其通用性：

| Scope | 描述 | 用法 |
|---|---|---|
| `universal` | 完全通用，可用于任何项目 | 可直接原样采用 |
| `partial` | 概念通用，但包含 UDS 特有的细节 | 采用前需审查 |
| `uds-specific` | UDS 项目特有的工具或工作流 | 仅供内部使用 |

#### Scope Distribution / 分布统计

**当前分布：**
- **Core Standards**：14 个 universal (61%)，7 个 partial (30%)，2 个 uds-specific (9%)
- **Skills**：12 个 universal (48%)，10 个 partial (40%)，3 个 uds-specific (12%)

#### Where to Find Scope Markers / 标记位置

- **Skills**：位于 `SKILL.md` 的 YAML frontmatter 中
  ```yaml
  ---
  name: skill-name
  scope: universal
  description: ...
  ---
  ```

- **Core Standards**：位于 markdown 元数据中
  ```markdown
  **Applicability**: All software projects
  **Scope**: universal
  ```

#### Scope Check Script / 范围检查脚本

**macOS / Linux:**
```bash
./scripts/check-scope-sync.sh
```

**Windows PowerShell:**
```powershell
.\scripts\check-scope-sync.ps1
```

### Cross-Platform Command Sync (UDS-specific) / 跨平台指令同步

> ⚠️ 本节专属于 UDS 项目。并非所有项目都需要维护带有跨平台命令的双语翻译。

#### When to Check / 何时检查

修改以下这些 UDS 项目文件后，请验证跨平台命令同步：
- 采用指南（`adoption/`）
- Skill 安装说明（`skills/*/README.md`）
- 维护指南（`ai/MAINTENANCE.md`）
- 检查清单（`adoption/checklists/`）

#### Files Requiring Sync / 需要同步的文件

有 33 个文件需要维护跨平台命令：
- 英文源文件：11 个文件
- zh-TW 翻译：11 个文件
- zh-CN 翻译：11 个文件

#### Standard Command Equivalents / 标准指令对照

| Bash | PowerShell | Purpose / 用途 |
|---|---|---|
| `cp file dest/` | `Copy-Item file dest\` | Copy file / 复制文件 |
| `cp -r dir/ dest/` | `Copy-Item -Recurse dir\ dest\` | Recursive copy / 递归复制 |
| `mkdir -p dir` | `New-Item -ItemType Directory -Force -Path dir` | Create directory / 创建目录 |
| `~/` | `$env:USERPROFILE\` | User home / 用户目录 |
| `./script.sh` | `.\script.ps1` | Run script / 执行脚本 |

#### Labeling Convention / 标签惯例

对平台特定的代码块使用以下标签：
- `**macOS / Linux:**` 后接 bash 代码块
- `**Windows PowerShell:**` 后接 powershell 代码块

---

## 发布流程

准备发布或协助进行版本管理时：

### 参考文档

- **完整发布工作流**：[skills/release-standards/release-workflow.md](skills/release-standards/release-workflow.md)
- **语义化版本**：[skills/release-standards/semantic-versioning.md](skills/release-standards/semantic-versioning.md)
- **版本规范**：[core/versioning.md](core/versioning.md)
- **CHANGELOG 格式**：[skills/release-standards/changelog-format.md](skills/release-standards/changelog-format.md)

### AI 助手关键要点

1. **绝不要手动运行 `npm publish`**：GitHub Actions 会自动处理此操作
2. **版本检测是自动的**：`.github/workflows/publish.yml` 会检测版本类型并使用正确的 npm 标签
3. **始终遵循检查清单**：release-workflow.md 中的预发布检查
4. **CHANGELOG 优先**：在创建发布之前更新 CHANGELOG.md

### 发布类型

| 类型 | 版本模式 | npm 标签 | 自动检测 |
|------|----------------|---------|---------------|
| Stable | `X.Y.Z` | `@latest` | ✅ 是 |
| Beta | `X.Y.Z-beta.N` | `@beta` | ✅ 是 |
| Alpha | `X.Y.Z-alpha.N` | `@alpha` | ✅ 是 |
| RC | `X.Y.Z-rc.N` | `@rc` | ✅ 是 |

### AI 助手工作流

当用户要求准备发布时：

1. **询问发布类型**：beta、alpha、rc 或 stable
2. **运行预发布检查**：测试、代码检查（linting）、git 状态
3. **运行 `bump-version.mjs`** —— 原子化更新所有版本文件（请参阅下方的 UDS 专属小节）
4. **更新 CHANGELOG.md**（EN + zh-TW + zh-CN）：遵循 release-workflow.md 中的格式
5. **提交、打标签、推送**：`git add -A && git commit && git tag vX.Y.Z && git push origin main vX.Y.Z`
6. **创建 GitHub Release**：使用 `gh release create` 命令

> ⚠️ **绝不要手动更新单个版本文件**。始终使用 `node scripts/bump-version.mjs`（或其 macOS/Linux 包装脚本 `scripts/bump-version.sh`）以避免遗漏文件。

### UDS 项目特定发布步骤

> ⚠️ **重要**：本节包含除标准发布工作流之外必须遵循的 UDS 特定要求。

#### 步骤 0：运行 bump-version.mjs（强制）

**始终使用版本更新脚本** —— 它会以原子方式更新所有文件并运行验证：

```bash
# Cross-platform (macOS / Linux / Windows) — the only copy of the bump logic
node scripts/bump-version.mjs 5.2.0-beta.1   # Pre-release
node scripts/bump-version.mjs 5.2.0          # Stable

# macOS / Linux convenience wrapper (thin exec into the .mjs above):
./scripts/bump-version.sh 5.2.0-beta.1
./scripts/bump-version.sh 5.2.0

# After bump-version.mjs:
# → Update CHANGELOG.md (EN + zh-TW + zh-CN) manually
# → git add -A && git commit -m "chore(release): X.Y.Z"
# → git tag vX.Y.Z && git push origin main vX.Y.Z
```

该脚本会自动处理这些文件：

| 文件 | 字段 | Alpha/Beta/RC | Stable |
|------|-------|---------------|--------|
| `cli/package.json` | `"version"` | ✅ 自动 | ✅ 自动 |
| `cli/package-lock.json` | `"version"` + `packages[""].version` | ✅ 自动 | ✅ 自动 |
| `cli/standards-registry.json` | `"version"`（3 处） | ✅ 自动 | ✅ 自动 |
| `uds-manifest.json` | `"version"` + `"last_updated"` | ✅ 自动 | ✅ 自动 |
| `README.md` | `**Version**:` | ✅ 自动 | ✅ 自动 |
| `locales/zh-TW/README.md` | `**版本**:` | ✅ 自动 | ✅ 自动 |
| `locales/zh-CN/README.md` | `**版本**:` | ✅ 自动 | ✅ 自动 |
| `locales/zh-TW/CHANGELOG.md` | frontmatter | ✅ 自动 | ✅ 自动 |
| `locales/zh-CN/CHANGELOG.md` | frontmatter | ✅ 自动 | ✅ 自动 |
| `.claude-plugin/plugin.json` | `"version"` | ❌ 跳过 | ✅ 自动 |
| `.claude-plugin/marketplace.json` | `"version"` | ❌ 跳过 | ✅ 自动 |

> **Marketplace 版本策略**：`.claude-plugin/` 文件仅在稳定版发布时更新。这可以防止 beta/alpha 版本被自动推送到 Claude Plugin Marketplace 用户。Marketplace 用户将仅接收稳定版本。

#### 预发布验证脚本

```bash
# macOS / Linux
./scripts/pre-release-check.sh

# Windows PowerShell
.\scripts\pre-release-check.ps1
```

这将运行 19 项检查，包括：
1. Git 工作目录状态
2. 版本同步（`check-version-sync.sh`）
3. 标准同步（`check-standards-sync.sh`）
4. 翻译同步（`check-translation-sync.sh`）
5-11. CLI-docs、docs、AI agent、usage docs、spec、scope、commands 同步检查
12. 文档完整性（`check-docs-integrity.sh`）
13. Skill 后续步骤同步（`check-skill-next-steps-sync.sh`）
14. 代码检查（Linting）
15. 孤儿规格检测（`check-orphan-specs.sh`）
16. AI Agent 行为覆盖率（`check-ai-behavior-sync.ts`）
17. 工作流合规性
18. 单元测试
19. E2E 测试（缺陷回归）

#### 翻译同步（稳定版发布）

对于稳定版发布，确保翻译已同步：
```bash
./scripts/check-translation-sync.sh      # zh-TW
./scripts/check-translation-sync.sh zh-CN # zh-CN
```

#### UDS 三阶段发布工作流（Alpha→Beta→Stable）

> **注意**：此工作流专用于 UDS 项目。通用发布工作流（参见 `release-workflow.md`）使用适合大多数项目的更简单的 Beta→Stable 模式。

**工作流理念**：先定版本，后验证。在测试前指定版本号，以确保验证针对的是确切的发布版本。

**阶段概述：**

| 阶段 | 版本模式 | npm 标签 | 目的 |
|-------|-----------------|---------|---------|
| 阶段 1：Alpha | `X.Y.Z-alpha.N` | `@alpha` | 内部验证、预发布检查 |
| 阶段 2：Beta | `X.Y.Z-beta.N` | `@beta` | 公开测试、早期采用者反馈 |
| 阶段 3：Stable | `X.Y.Z` | `@latest` | 生产发布 |

**详细步骤：**

**阶段 1：Alpha 发布（内部）**
1. 将版本更新为 alpha：`npm version X.Y.Z-alpha.1 --no-git-tag-version`
2. 仅更新 CLI 版本文件（2 个文件）：
   - `cli/package.json`
   - `cli/standards-registry.json`
3. **不要更新** `.claude-plugin/` 文件（保留先前的稳定版本）
4. 运行预发布检查：`./scripts/pre-release-check.sh`
5. 使用 alpha 说明更新 CHANGELOG
6. 提交：`chore(release): X.Y.Z-alpha.1`
7. 创建标签：`vX.Y.Z-alpha.1`
8. 推送并创建 GitHub Release（标记为 pre-release）

**阶段 2：Beta 发布（公开测试）**
1. Alpha 验证通过后，更新为 beta：`npm version X.Y.Z-beta.1 --no-git-tag-version`
2. 仅更新 CLI 版本文件（2 个文件）：
   - `cli/package.json`
   - `cli/standards-registry.json`
3. **不要更新** `.claude-plugin/` 文件（保留先前的稳定版本）
4. 运行完整测试套件
5. 使用 beta 说明更新 CHANGELOG
6. 提交：`chore(release): X.Y.Z-beta.1`
7. 创建标签：`vX.Y.Z-beta.1`
8. 推送并创建 GitHub Release（标记为 pre-release）
9. 向早期采用者公布以获取反馈

**阶段 3：Stable 发布（生产环境）**
1. Beta 测试完成后，更新为 stable：`npm version X.Y.Z --no-git-tag-version`
2. 更新**所有**版本文件（5 个文件）：
   - `cli/package.json`
   - `cli/standards-registry.json`
   - `.claude-plugin/plugin.json` ← 在此处更新 Marketplace
   - `.claude-plugin/marketplace.json` ← 在此处更新 Marketplace
   - `README.md`
3. 定稿 CHANGELOG（移除 beta 警告，添加 stable 说明）
4. 同步翻译：`./scripts/check-translation-sync.sh`
5. 运行最终预发布检查
6. 提交：`chore(release): X.Y.Z`
7. 创建标签：`vX.Y.Z`
8. 推送并创建 GitHub Release
9. 验证 npm 发布：`npm view universal-dev-standards dist-tags`

**何时使用此工作流：**
- 包含破坏性变更的重大发布
- 需要大量测试的功能
- 需要早期采用者验证的发布

**何时跳过 Alpha（仅 Beta→Stable）：**
- 补丁发布（仅缺陷修复）
- 包含低风险变更的次要发布
- 紧急安全修复

### 交互示例

```
User: "我想发布 beta 版本"

AI:
我会协助你准备 beta 版本发布。

首先，让我执行预发布检查：
1. ✅ 执行测试
2. ✅ 执行 linting
3. ✅ 检查 git 状态

请提供以下信息：
1. 版本号是多少？（例如：3.2.2-beta.1）
2. 主要包含哪些变更？

确认后，我会：
1. 更新 cli/package.json 版本号
2. 更新 CHANGELOG.md
3. 创建 git tag (vX.Y.Z-beta.N)
4. 提交并推送变更
5. 提供创建 GitHub Release 的步骤

**重要**：创建 GitHub Release 后，GitHub Actions 会自动：
- 检测版本类型（beta）
- 发布到 npm 并标记为 @beta
- 无需手动执行 npm publish
```

---

## 文件结构参考

```
universal-dev-standards/
├── core/                  # Core standards (71 files)
├── skills/                # AI tool skills
│   └── claude-code/       # Claude Code skills (26 skills)
├── cli/                   # Node.js CLI tool
│   ├── src/               # Source code
│   ├── tests/             # Test files
│   └── package.json       # Dependencies
├── locales/               # Translations
│   └── zh-TW/             # Traditional Chinese
├── integrations/          # AI tool configurations
├── templates/             # Document templates
├── adoption/              # Adoption guides
└── scripts/               # Maintenance scripts
```

## 贡献

详细的贡献指南请参阅 [CONTRIBUTING.md](../../CONTRIBUTING.md)。

## 授权

- 文档（Markdown）：CC BY 4.0
- 代码（JavaScript）：MIT


## 可用的 UDS 斜杠命令 | UDS 可用命令

> 为 SPEC-INTSYNC-001 同步合规自动生成的索引。权威描述位于 `skills/commands/*.md` 与 `skills/commands/COMMAND-INDEX.json`。

> 为 SPEC-INTSYNC-001 同步合规自动生成的索引。权威描述位于 `skills/commands/*.md` 与 `COMMAND-INDEX.json`。

### core

- `/commit`
- `/code-review`
- `/sdd`
- `/check`
- `/init`
- `/update`
- `/config`

### testing

- `/tdd`
- `/bdd`
- `/atdd`
- `/e2e`
- `/coverage`
- `/ac-coverage`
- `/derive`
- `/derive-bdd`
- `/derive-tdd`
- `/derive-atdd`
- `/derive-all`
- `/journey-test`

### quality

- `/checkin`
- `/refactor`
- `/scan`
- `/security`
- `/reverse`
- `/reverse-sdd`
- `/reverse-bdd`
- `/reverse-tdd`

### docs

- `/docs`
- `/docgen`
- `/changelog`
- `/requirement`
- `/brainstorm`
- `/sdd-retro`
- `/pr`

### ops

- `/observability`
- `/slo`
- `/runbook`
- `/incident`
- `/metrics`
- `/durable`
- `/ci-cd`

### methodology

- `/methodology`
- `/dev-workflow`
- `/discover`
- `/release`
- `/audit`
- `/migrate`
- `/skill-builder`

### reference

- `/database`
- `/api-design`
