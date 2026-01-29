---
source: ../../CHANGELOG.md
source_version: 3.5.0-beta.13
translation_version: 3.5.0-beta.13
last_synced: 2026-01-13
status: current
---

# 变更日志

> **语言**: [English](../../CHANGELOG.md) | [简体中文](../zh-TW/CHANGELOG.md) | 简体中文

本项目的所有重要变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/)，
并遵循[语义化版本](https://semver.org/)。

## [Unreleased]

## [3.5.0-beta.13] - 2026-01-13

### 新增
- **CLI**：将 OpenCode 加入 skills 兼容工具
  - `uds init` 现在将 OpenCode 视为 Claude Code 处理，提供精简安装
  - `uds check` 显示 OpenCode skills 兼容性状态
  - Skills 自动安装到 `.claude/skills/`（OpenCode 自动检测此路径）
- **文档**：在 skills-mapping.md 新增跨工具兼容性章节
  - 7 个 AI Agent 的路径对照表（Claude Code、OpenCode、Cursor、OpenAI Codex、GitHub Copilot、Windsurf、Cline）
  - 说明 UDS 为何使用 `.claude/skills/` 作为默认路径
  - 不兼容工具的跨工具安装说明
- **文档**：重构 README 建立独立的 Agent Skills 安装章节
  - 将 skills 安装方法整合在一处
  - 新增社区 marketplace（n-skills、claude-plugins.dev、agentskills.io）
- **文档**：新增 beta 版本安装说明
  - `npm install -g universal-dev-standards@beta`
  - `npx universal-dev-standards@beta init`

### 变更
- **文档**：更新 integrations/opencode/ 文档
  - 版本 1.4.0 包含跨工具兼容性信息
  - 双语翻译同步（zh-TW、zh-CN）

## [3.5.0-beta.12] - 2026-01-13

### 新增
- **文档**：新增使用模式比较文档
  - 比较仅 Skills vs 仅规范文件 vs 两者并用
  - 包含功能覆盖率、Token 效率、和建议
  - 双语支持（英文和繁体中文）
  - 参见 `docs/USAGE-MODES-COMPARISON.md`
- **文档**：重构 README 安装文档
  - npm CLI 作为主要安装方式
  - AI 工具扩充作为可选功能
  - 完整列出 9 个支持的 AI 工具及正确状态

### 修复
- **CLI**：修复 detector.js 缺失的 AI 工具检测
  - 现在可检测全部 9 个 AI 工具：Claude Code、Cursor、Windsurf、Cline、GitHub Copilot、Antigravity、Codex、OpenCode、Gemini CLI
  - 修复 `uds init` 时的自动检测功能

## [3.5.0-beta.11] - 2026-01-12

### 新增
- **文档**：在 README 新增功能可用性表格
  - 清楚比较稳定版 (3.4.2) 与 beta 版 (3.5.x) 功能
  - 以 🧪 标记实验性功能
  - 双语支持（英文和繁体中文）

### 修复
- **i18n**：为 6 个翻译文件新增缺失的 YAML front matter
  - `docs/CLI-INIT-OPTIONS.md`
  - `skills/commands/bdd.md`
  - `skills/commands/methodology.md`
  - `skills/methodology-system/SKILL.md`
  - `skills/methodology-system/create-methodology.md`
  - `skills/methodology-system/runtime.md`
- **文档**：更新稳定版本参考从 3.3.0 至 3.4.2

## [3.5.0-beta.10] - 2026-01-12

### 新增
- **方法论系统**：新增完整开发方法论支持
  - 内置方法论：TDD、BDD、SDD、ATDD
  - YAML 格式方法论定义，含 JSON Schema 验证
  - 阶段追踪、检查清单和检查点
  - 自定义方法论模板，支持团队特定工作流
  - `/methodology` 命令：状态、切换、阶段管理
  - CLI 整合：`uds init` 和 `uds configure` 方法论选择
- **命令**：新增 `/bdd` 行为驱动开发命令
  - 完整 BDD 工作流：探索 → 制定 → 自动化 → 活文档
  - Gherkin 格式范例和三剑客会议引导
  - 阶段检查清单和指示器
- **命令**：整合 `/tdd` 与方法论系统
  - 调用时自动启用 TDD 方法论
  - 显示阶段指示器（🔴 红灯、🟢 绿灯、🔵 重构）
- **文档**：新增方法论系统双语文档
  - 英文和繁体中文翻译
  - SKILL.md、runtime.md、create-methodology.md

### 变更
- **Skills**：更新安装脚本以包含 methodology-system（共 16 个 skills）
- **Registry**：在 standards-registry.json 新增 methodologies 区块

## [3.5.0-beta.9] - 2026-01-11

### 新增
- **脚本**：新增统一预发布检查脚本
  - `scripts/pre-release-check.sh` 适用于 Unix/macOS
  - `scripts/pre-release-check.ps1` 适用于 Windows PowerShell
  - 单一指令执行所有 7 项验证检查
  - 选项：`--fail-fast`、`--skip-tests`
- **CI**：在 GitHub Actions 发布工作流程中新增预发布验证
  - 在 npm publish 前执行版本同步、标准同步、linting 和测试
  - 任何检查失败则阻止发布

### 变更
- **文档**：在 release-workflow.md 新增「自动化预发布检查」区块
- **文档**：在 CLAUDE.md 的快速指令中加入 pre-release-check.sh

## [3.5.0-beta.8] - 2026-01-11

### 修复
- **CLI**：修复 `standards-registry.json` 版本不一致问题
  - 同步 `standards-registry.json` 版本与 `package.json`（之前停留在 3.5.0-beta.5）
  - 这导致 `uds update` 显示过时的「最新版本」信息

### 变更
- **发布**：将版本同步检查加入预发布检查清单
  - 在自动化验证区块新增 `./scripts/check-version-sync.sh` 验证步骤
  - 防止未来版本不一致问题

## [3.5.0-beta.7] - 2026-01-11

### 修复
- **CLI**：修复 Windows 未追踪文件检测的路径分隔符问题
  - 在 `scanDirectory` 函数中标准化路径分隔符为正斜线
  - 确保比对 manifest 路径时的跨平台一致性

## [3.5.0-beta.6] - 2026-01-11

### 新增
- **文档**：新增 18 个 `options/` 目录的人类可读 Markdown 文件
  - `options/changelog/`：keep-a-changelog.md、auto-generated.md
  - `options/code-review/`：pr-review.md、pair-programming.md、automated-review.md
  - `options/documentation/`：api-docs.md、markdown-docs.md、wiki-style.md
  - `options/project-structure/`：kotlin.md、php.md、ruby.md、rust.md、swift.md
  - `options/testing/`：contract-testing.md、industry-pyramid.md、istqb-framework.md、performance-testing.md、security-testing.md
  - 完成双格式架构：`ai/options/*.ai.yaml` 供 AI 工具使用，`options/*.md` 供人类开发者使用
- **AI 标准**：新增 `ai/standards/test-driven-development.ai.yaml`
  - AI 优化的 TDD 标准，含 Red-Green-Refactor 循环
  - FIRST 原则与适用性指南
- **文档**：新增完整的 CLI init 选项指南（三语支持）
  - `docs/CLI-INIT-OPTIONS.md` - 完整的 `uds init` 选项文档
  - 涵盖：AI 工具、技能位置、标准范围、采用等级、格式、标准选项、扩展、集成配置、内容模式
  - 包含使用案例、决策流程和 CLI 参数参考
  - 三语版本：英文、繁体中文 (`locales/zh-TW/`)、简体中文 (`locales/zh-CN/`)
- **发布**：将 CLI 文档新增至预发布检查清单
  - `release-workflow.md` 现在包含 CLI-INIT-OPTIONS.md 验证
- **发布**：将标准一致性检查新增至预发布检查清单
  - 验证 `core/` ↔ `ai/standards/` 内容对齐
  - 验证 `options/` ↔ `ai/options/` 双格式完整性
- **脚本**：新增自动化标准一致性检查脚本
  - `scripts/check-standards-sync.sh` 用于 Unix/macOS
  - `scripts/check-standards-sync.ps1` 用于 Windows PowerShell
  - 检查 `core/` ↔ `ai/standards/` 和 `options/` ↔ `ai/options/` 一致性

### 变更
- **CLI**：改进集成生成器的 minimal 内容模式
  - Minimal 模式现在包含简化的标准参考清单
  - 确保 AI 工具即使在 minimal 模式下也知道有哪些标准可用
  - 新增 `generateMinimalStandardsReference()` 函数
- **CLI**：优化 `uds init` 提示信息
  - 统一所有提示的标题格式
  - 改善术语：Starter/Professional/Complete（等级）、Compact/Detailed（格式）、Standard（内容模式）、Lean（标准范围）
  - 增强颜色标示：推荐选项使用绿色
  - 简化选择后的说明文字

## [3.5.0-beta.5] - 2026-01-09

### 新增
- **CLI**：增强 AI 工具集成，自动符合标准
  - 支持 9 个 AI 工具：Claude Code、Cursor、Windsurf、Cline、GitHub Copilot、Google Antigravity、OpenAI Codex、Gemini CLI、OpenCode
  - 新增内容模式选择：`full`、`index`（推荐）、`minimal`
  - 生成标准合规指示，含 MUST/SHOULD 优先级
  - 生成标准索引，列出所有已安装标准
  - 处理 Codex 和 OpenCode 之间的 `AGENTS.md` 共享
- **CLI**：增强 `uds configure` 命令
  - 新选项：AI 工具 - 新增/移除 AI 工具集成
  - 新选项：采用等级 - 变更 Level 1/2/3
  - 新选项：内容模式 - 变更 full/index/minimal
  - 设置变更时自动重新生成集成文件
- **CLI**：增强 `uds update` 命令
  - 新标志：`--integrations-only` - 只更新集成文件
  - 新标志：`--standards-only` - 只更新标准文件
  - 标准更新时自动同步集成文件
- **CLI**：增强 `uds check` 命令
  - 新区段：AI 工具集成状态
  - 验证集成文件存在且正确参考标准
  - 报告缺少的标准参考并提供修复建议
- **Skills**：新增 `/config` 斜线命令用于标准配置

### 变更
- **CLI**：集成文件现在默认包含合规指示和标准索引（index 模式）

## [3.5.0-beta.4] - 2026-01-09

### 新增
- **CLI**：AI 集成文件的参考同步功能
  - `uds check` 现在显示「参考同步状态」区段
    - 检测孤立参考（集成文件中的参考不在 manifest 中）
    - 报告缺少参考（manifest 中的标准未被参考）
  - `uds update --sync-refs` 根据 manifest 标准重新生成集成文件
  - manifest 中新增 `integrationConfigs` 字段以保存生成设置
- **Utils**：新增 `reference-sync.js` 模块，含类别对标准的映射

### 变更
- **CLI**：Manifest 版本从 3.1.0 升级至 3.2.0
  - 新增 `integrationConfigs` 字段存储集成文件生成设置
  - 允许 `uds update --sync-refs` 使用相同选项重新生成（类别、详细等级、语言）

## [3.5.0-beta.3] - 2026-01-09

### 修复
- **CLI**：修复 `uds update` 显示错误版本号
  - `standards-registry.json` 版本与 `package.json` 未同步
  - 现在显示正确的当前和最新版本信息

### 新增
- **脚本**：新增版本同步检查脚本
  - `scripts/check-version-sync.sh` 用于 Unix/macOS
  - `scripts/check-version-sync.ps1` 用于 Windows PowerShell
  - 验证 `standards-registry.json` 版本与 `package.json` 一致
- **文档**：将版本同步检查新增至 `release-workflow.md` 预发布检查清单

## [3.5.0-beta.2] - 2026-01-09

### 新增
- **集成**：OpenAI Codex CLI 集成，使用 `AGENTS.md`
- **集成**：Gemini CLI 集成，使用 `GEMINI.md`
- **集成**：OpenCode 集成，使用 `AGENTS.md`
- **集成**：Google Antigravity 项目级规则文件 (`.antigravity/rules.md`)

### 移除
- **CLI**：从 `uds check` 移除未追踪文件扫描
  - `uds check` 现在只验证 manifest 中记录的文件
  - 不再提示追踪 `.standards/` 目录中的未知文件

## [3.5.0-beta.1] - 2026-01-09

### 新增
- **CLI**：新增 `uds configure` 命令用于后安装配置
  - 子命令：`add-tool`、`remove-tool`、`set-level`
  - 交互模式支持
- **CLI**：改进 `uds init` 流程
  - 新增 AI 工具选择提示
  - 新增集成文件配置选项
- **CLI**：manifest 版本升级至 3.2.0
  - 新增 `aiTools` 字段追踪选择的 AI 工具
  - 新增 `integrations` 字段列出生成的集成文件

### 变更
- **CLI**：重构集成生成器以支持多 AI 工具
- **CLI**：改进错误处理和用户反馈

## [3.4.1] - 2026-01-08

### 修复
- **CLI**：修复 `uds update` 建议从较新版本降级的问题
  - 新增正确的语义版本比较，支持预发布版本（alpha/beta/rc）
  - 现在能正确识别当前版本比 registry 版本更新的情况
  - 当用户版本比 registry 更新时显示提示信息
- **CLI**：更新 `standards-registry.json` 版本与 package.json 一致

## [3.4.0] - 2026-01-08

### 新增
- **CLI**：`uds check` 新增基于哈希值的文件完整性检查
  - 通过比较 SHA-256 哈希值检测修改的文件
  - 新增选项：`--diff`、`--restore`、`--restore-missing`、`--no-interactive`、`--migrate`
  - 交互模式：检测到问题时提示操作（查看差异、还原、保留、跳过）
  - 旧版 manifest 迁移：`uds check --migrate` 升级至基于哈希值的追踪
- **CLI**：manifest 中存储文件哈希值（版本 3.1.0）
  - `uds init` 在安装时计算并存储文件哈希值
  - `uds update` 在更新文件后重新计算哈希值
- **Utils**：新增 `hasher.js` 工具模块用于 SHA-256 文件哈希

### 变更
- **CLI**：manifest 版本从 3.0.0 升级至 3.1.0
  - 新增 `fileHashes` 字段追踪文件完整性
  - 向后兼容旧版 manifest

### 修复
- **CLI**：修复 `uds check` 错误显示「Skills 已标记为已安装但找不到」警告
  - 现在正确识别 Plugin Marketplace 安装路径（`~/.claude/plugins/cache/`）
- **CLI**：修复 `uds update` 命令失败并显示「undefined」错误
  - 为异步 `copyStandard()` 和 `copyIntegration()` 调用新增遗漏的 `await`

## [3.3.0] - 2026-01-08

### 新增
- **Skills**：新增 9 个斜线命令，用于手动触发工作流程
  - `/commit` - 生成 conventional commit message
  - `/review` - 执行系统性代码审查
  - `/release` - 引导发布流程
  - `/changelog` - 更新 CHANGELOG.md
  - `/requirement` - 撰写用户故事和需求
  - `/spec` - 创建规格文档
  - `/tdd` - 测试驱动开发工作流程
  - `/docs` - 创建/更新文档
  - `/coverage` - 分析测试覆盖率
- **Core**：新增测试驱动开发 (TDD) 标准
  - 新增 `core/test-driven-development.md`，涵盖 Red-Green-Refactor 循环
  - SDD + TDD 集成工作流程指南
- **Skills**：新增 `tdd-assistant` 技能（第 15 个技能）

### 变更
- **Skills**：简化斜线命令格式，从 `/uds:xxx` 改为 `/xxx`
  - 移除 `uds:` 命名空间前缀，使命令调用更简洁
- **Plugin Marketplace**：将 marketplace 名称从 `universal-dev-standards` 改为 `asia-ostrich`
  - 新安装命令：`/plugin install universal-dev-standards@asia-ostrich`

### 修复
- **CLI**：`uds skills` 现在优先检测新的 `@asia-ostrich` marketplace
- **CLI**：将 `tdd-assistant` 添加至 standards-registry.json

### 迁移指南
如果你使用旧的 marketplace 名称安装，请进行迁移：

```bash
/plugin uninstall universal-dev-standards@universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

## [3.3.0-beta.5] - 2026-01-07

### 新增
- **Skills**：新增 9 个斜线命令，用于手动触发工作流程
  - `/commit` - 产生 commit message
  - `/review` - 执行代码审查
  - `/release` - 引导发布流程
  - `/changelog` - 更新变更日志
  - `/requirement` - 撰写用户故事
  - `/spec` - 建立规格文件
  - `/tdd` - TDD 工作流程
  - `/docs` - 文档撰写
  - `/coverage` - 测试覆盖率
  - 命令与技能的差异：命令为手动触发，技能为自动触发

### 修复
- **CLI**：`uds skills` 现在优先检测新的 `@asia-ostrich` marketplace
  - 当检测到旧版 `@universal-dev-standards` marketplace 时显示迁移提示
  - 确保迁移期间的兼容性

## [3.3.0-beta.4] - 2026-01-07

### 变更
- **Plugin Marketplace**：将 marketplace 名称从 `universal-dev-standards` 改为 `asia-ostrich`
  - 新安装命令：`/plugin install universal-dev-standards@asia-ostrich`
  - 这提供与 AsiaOstrich 组织更好的品牌一致性

### 迁移指南
如果你使用旧的 marketplace 名称安装，请进行迁移：

```bash
# 1. 卸载旧版本
/plugin uninstall universal-dev-standards@universal-dev-standards

# 2. 安装新版本
/plugin install universal-dev-standards@asia-ostrich
```

## [3.3.0-beta.3] - 2026-01-07

### 修复
- **CLI**：将 `tdd-assistant` 新增至 standards-registry.json
  - 新增 TDD 的技能文件列表和标准项目
  - `uds skills` 现在正确显示 15/15 个技能

## [3.3.0-beta.2] - 2026-01-07

### 新增
- **Core**：新增测试驱动开发 (TDD) 标准
  - 新增 `core/test-driven-development.md` 涵盖 Red-Green-Refactor 循环、FIRST 原则、TDD vs BDD vs ATDD
  - SDD + TDD 集成工作流程指引
  - ML 测试边界（模型准确度 vs 数据工程）
  - 遗留系统的 Golden Master 测试
- **Skills**：为 Claude Code 新增 `tdd-assistant` 技能（第 15 个技能）
  - `skills/tdd-assistant/SKILL.md` - TDD 工作流程指引
  - `skills/tdd-assistant/tdd-workflow.md` - 逐步 TDD 流程
  - `skills/tdd-assistant/language-examples.md` - 6 种语言范例
  - 所有 TDD 文件的完整繁体中文翻译

### 变更
- **核心标准**：更新相关标准中的交叉引用
  - `spec-driven-development.md` - 新增 TDD 集成引用
  - `testing-standards.md` - 新增 TDD 交叉引用
  - `test-completeness-dimensions.md` - 新增 TDD 交叉引用
- **发布流程**：扩展预发布检查清单，加入完整的文件验证
  - 新增版本文件检查清单，涵盖所有版本相关文件
  - 重新命名为文档验证检查清单，加入正确性验证
  - 新增内容正确性验证区块，包含 grep 指令
  - 使用 `locales/*` 通配符涵盖所有语言版本

## [3.2.2] - 2026-01-06

### 新增
- **CLI**：新增 `uds skills` 指令列出已安装的 Claude Code skills
  - 显示来自 Plugin Marketplace、用户级别和项目级别的安装
  - 显示每个安装的版本、路径和 skill 数量
  - 对已弃用的手动安装显示警告
- **CLI**：根据安装位置改善 Skills 更新指示

### 弃用
- **Skills**：通过 `install.sh` / `install.ps1` 手动安装现已弃用
  - 建议：使用 Plugin Marketplace 以获得自动更新
  - 脚本将显示弃用警告并要求确认
  - 将在未来的主要版本中移除

### 变更
- **CLI**：`uds update` 现在对手动安装的 Skills 显示弃用警告
  - 建议迁移至 Plugin Marketplace
- **Skills**：更新 README.md 将手动安装标记为弃用

### 修复
- **CLI**：更新标准注册表版本至 3.2.2

## [3.2.2-beta.2] - 2026-01-05

### 新增
- **CLI**：根据安装位置改善 Skills 更新指示
  - Marketplace：通过 Plugin Marketplace UI 更新的指引
  - 用户级别：`cd ~/.claude/skills/... && git pull`
  - 项目级别：`cd .claude/skills/... && git pull`

### 修复
- **CLI**：更新标准注册表版本至 3.2.2
  - 让 `uds update` 能检测现有项目的新版本

## [3.2.2-beta.1] - 2026-01-05

### 新增
- **Skills**：新增发布流程指南，提供完整的发布流程
  - 新增 `skills/release-standards/release-workflow.md` 包含逐步发布指示
  - 涵盖 beta、alpha、rc 和稳定版发布工作流程
  - 包含 npm dist-tag 策略、疑难排解和 AI 助理指南
  - 在 CLAUDE.md 中新增发布流程章节供 AI 助理参考
- **CLI**：为 AI 工具集成新增对话语言设定
  - 所有 AI 工具集成文件现在都包含对话语言指示
  - 支持英文、繁体中文和双语模式
  - 为 Claude Code 用户生成包含语言设定的 CLAUDE.md
- **CLI**：为 prompts 和 utils 模块新增完整测试
  - 测试覆盖率从 42.78% 提升至 72.7%
  - 总测试数从 94 增加至 210

### 修复
- **CLI**：仅在 Claude Code 是唯一选择的 AI 工具时才询问 Skills
  - 修复选择多个 AI 工具与 Skills 时可能导致其他工具遗漏完整标准的问题
- **CI/CD**：修复 npm 发布工作流程，正确标记 beta/alpha/rc 版本
  - 在 `.github/workflows/publish.yml` 中新增自动版本检测
  - Beta 版本现在使用 `@beta` 标签而非 `@latest`
  - 用户现在可以使用 `npm install -g universal-dev-standards@beta` 安装 beta 版本

### 变更
- **核心规范**：为 5 个核心标准新增业界参考标准
  - `error-code-standards.md` v1.0.0 → v1.1.0: RFC 7807, RFC 9457, HTTP Status Codes
  - `logging-standards.md` v1.0.0 → v1.1.0: OWASP Logging, RFC 5424, OpenTelemetry, 12 Factor App
  - `code-review-checklist.md` v1.1.0 → v1.2.0: SWEBOK v4.0 Ch.10 (Software Quality)
  - `checkin-standards.md` v1.2.5 → v1.3.0: SWEBOK v4.0 Ch.6 (Configuration Management)
  - `spec-driven-development.md` v1.1.0 → v1.2.0: IEEE 830-1998, SWEBOK v4.0 Ch.1 (Requirements)
- **测试标准**：新增 SWEBOK v4.0 参考和新章节
  - `testing-standards.md` v2.0.0 → v2.1.0: Testing Fundamentals, Test-Related Measures, Pairwise/Data Flow Testing
- **文档**：更新 MAINTENANCE.md 加入 npm dist-tag 策略
  - 新增不同版本模式的 dist-tag 表格
  - 新增手动修正标签的指令说明

## [3.2.1-beta.1] - 2026-01-02

### 新增
- **CLI**：在 Skills 安装流程中新增 Plugin Marketplace 支持
  - 在 Skills 安装提示中新增「Plugin Marketplace (推荐)」选项
  - CLI 在 manifest 中追踪通过 marketplace 安装的 Skills，不尝试本地安装
  - `uds check` 指令现在会显示 marketplace 安装状态

### 修复
- **CLI**：修复 standards registry 中通配符路径处理导致 404 错误
  - 将 `templates/requirement-*.md` 通配符替换为明确文件路径
  - 为 requirement-checklist.md、requirement-template.md、requirement-document-template.md 新增明确条目
- **CLI**：修复 `uds init`、`uds configure` 和 `uds update` 指令执行后程序未退出的问题
  - 新增明确的 `process.exit(0)` 以防止 inquirer readline interface 阻挡程序终止

## [3.2.0] - 2026-01-02

### 新增
- **Claude Code Plugin Marketplace 支持**：启用通过 Plugin Marketplace 分发
  - 新增 `.claude-plugin/plugin.json` - Plugin manifest 配置
  - 新增 `.claude-plugin/marketplace.json` - Marketplace 分发配置
  - 新增 `.claude-plugin/README.md` - Plugin 文档和维护指南
  - 更新 `skills/README.md` 新增方法 1：Marketplace 安装（推荐）

### 优点
- 用户可以用单一指令安装所有 14 个技能：`/plugin install universal-dev-standards@universal-dev-standards`
- 新版本发布时自动更新
- 通过 Claude Code marketplace 提升可发现性
- 保持与脚本安装的向后兼容性（方法 2 和 3）

### 变更
- 在 `CLAUDE.md` 新增 AI 助手对话语言要求（繁体中文）

### 修复
- 修复 CLI 版本读取，改用 `package.json` 而非硬编码值

## [3.1.0] - 2025-12-30

### 新增
- **简体中文 (zh-CN) 翻译**：为简体中文用户提供完整本地化
  - 新增 `locales/zh-CN/README.md` - 完整 README 翻译
  - 新增 `locales/zh-CN/CLAUDE.md` - 项目指南翻译
  - 新增 `locales/zh-CN/docs/WINDOWS-GUIDE.md` - Windows 指南翻译
- 在所有 README 版本中新增语言切换链接（EN, zh-TW, zh-CN）

- **完整 Windows 支持**：为 Windows 用户提供完整的跨平台兼容性
  - 新增 `.gitattributes` 确保跨平台换行符一致性
  - 新增 `scripts/check-translation-sync.ps1` - 翻译检查器 PowerShell 版本
  - 新增 `skills/install.ps1` - Skills 安装器 PowerShell 版本
  - 新增 `scripts/setup-husky.js` - 跨平台 Husky 设定脚本
  - 新增 `docs/WINDOWS-GUIDE.md` - 完整的 Windows 开发指南
- **5 个新 Claude Code 技能**：技能库从 9 个扩充至 14 个
  - `spec-driven-dev` - SDD 工作流程指引（触发词：spec, proposal, 提案）
  - `test-coverage-assistant` - 7 维度测试完整性框架（触发词：test coverage, dimensions, 测试覆盖）
  - `changelog-guide` - 变更日志撰写标准（触发词：changelog, release notes, 变更日志）
  - `error-code-guide` - 错误码设计模式（触发词：error code, 错误码）
  - `logging-guide` - 结构化日志标准（触发词：logging, log level, 日志）
- 新增**双重性质标准**分类至 `STATIC-DYNAMIC-GUIDE.md` - 同时具有静态和动态组件的标准
- 新增**动态 vs 静态分类**章节至 `MAINTENANCE.md` - 标准分类指南
- 将 `checkin-standards` 核心规则加入 `CLAUDE.md` 作为静态标准
- 新增 5 个新技能的完整繁体中文翻译（共 10 个文件）

### 变更
- 更新 `cli/package.json` 的 prepare 脚本使用跨平台 `setup-husky.js`
- 更新 `README.md`、`cli/README.md`、`CLAUDE.md` 添加 Windows 安装说明
- 更新 `STATIC-DYNAMIC-GUIDE.md` 至 v1.1.0 - 引入双重性质标准概念，更新至 14 个技能
- 更新 `MAINTENANCE.md` - 新增 `STATIC-DYNAMIC-GUIDE.md` 交叉引用，扩展 Workflow 4 分类检查清单
- 更新 `MAINTENANCE.md` 技能表格从 9 个扩充至 14 个（35 个技能文件 + 10 个共用/README = 45 个文件）
- 同步 `MAINTENANCE.md` 和 `STATIC-DYNAMIC-GUIDE.md` 的繁体中文翻译

## [3.0.0] - 2025-12-30

### 新增
- **AI 优化标准架构**：新增 `.ai.yaml` 双格式支持
- 新增 `ai/standards/` 目录，包含 15 个 AI 优化标准文件
- 新增 `ai/options/` 目录，包含语言特定和工作流程选项
- 新增 `MAINTENANCE.md` - 项目维护指南与文件结构概览
- 新增 `ai/MAINTENANCE.md` - AI 标准维护工作流程指南
- 新增 `STANDARDS-MAPPING.md` - 标准与技能对应矩阵
- 新增 6 个 AI 优化标准：
  - `anti-hallucination.ai.yaml` - AI 协作标准
  - `checkin-standards.ai.yaml` - 代码签入标准
  - `documentation-writing-standards.ai.yaml` - 文档撰写指南
  - `spec-driven-development.ai.yaml` - SDD 工作流程
  - `test-completeness-dimensions.ai.yaml` - 7 维度测试框架
  - `versioning.ai.yaml` - 语义化版本标准
- 新增所有新标准和技能的完整繁体中文翻译（共 78 个文件）

### 变更
- 统一核心标准的版本格式为 `**Version**: x.x.x`
- 为所有 zh-TW 翻译的 YAML front matter 新增 `source` 字段以追踪同步
- 更新翻译同步脚本，改进验证功能

### 修正
- 修正 `core/error-code-standards.md` 和 `core/logging-standards.md` 的版本格式不一致
- 修正 zh-TW 技能翻译中的来源路径

## [2.3.0] - 2025-12-25

### 新增
- **多语言支持**：新增 `locales/` 目录结构用于国际化
- 新增所有文档的繁体中文 (zh-TW) 翻译（44 个文件）
  - `locales/zh-TW/core/` - 13 个核心规范翻译
  - `locales/zh-TW/skills/` - 25 个 skill 文件翻译
  - `locales/zh-TW/adoption/` - 5 个采用指南翻译
  - `locales/zh-TW/README.md` - 完整的中文 README
- 为所有英文文档新增语言切换器
- 新增 `scripts/check-translation-sync.sh` - 翻译同步检查脚本
- 为 Skills 文档新增静态与动态规范分类说明
- 新增 `templates/CLAUDE.md.template` - 静态规范集成范本
- 新增 `adoption/STATIC-DYNAMIC-GUIDE.md` - 详细分类指南

### 变更
- 将双语内容分离到专用语言文件（AI 工具减少约 50% token 消耗）
- 英文版本现在仅包含英文内容并带有语言切换器
- 更新 `skills/README.md` - 新增静态与动态区块及触发关键字

## [2.2.0] - 2025-12-24

### 新增
- 为所有 Skills 文档新增标准区段（23 个文件）
  - 8 个 SKILL.md 文件：新增目的、相关标准、版本历史、授权区段
  - 15 个支持文档：新增双语标题、metadata 及标准区段

### 变更
- 统一 Skills 文档格式与 Core 标准
- 新增 Skills 与 Core 文档之间的交叉引用

## [2.1.0] - 2025-12-24

### 新增
- **集成 Skills**：将 `universal-dev-skills` 合并至 `skills/` 目录
- 新增 `skills/` - 所有 Claude Code Skills 现已包含在主仓库中
- 新增 `skills/_shared/` - 用于多 AI 工具支持的共享模板
- 为未来 AI 工具新增占位目录：`skills/cursor/`、`skills/windsurf/`、`skills/cline/`、`skills/copilot/`

### 变更
- CLI 现在从本地 `skills/` 安装技能，而非从远程仓库获取
- 更新 `standards-registry.json` 以反映集成的 skills 架构

### 迁移指南
- 如果您之前单独使用 `universal-dev-skills`，现在可以使用本仓库中包含的 skills
- 执行 `cd skills && ./install.sh` 从集成位置重新安装 skills

## [2.0.0] - 2025-12-24

### 变更

**破坏性变更**：项目从 `universal-doc-standards` 更名为 `universal-dev-standards`

这反映了项目扩展的范围，涵盖所有开发标准，而不仅仅是文档。

#### 迁移指南

- 从新的仓库重新 clone：`git clone https://github.com/AsiaOstrich/universal-dev-standards.git`
- 如果使用全局安装，请在 CLI 目录重新执行 `npm link`
- 使用 `npx universal-dev-standards` 取代 `npx universal-doc-standards`
- `uds` 命令保持不变

### 新增
- 新增 `extensions/languages/php-style.md` - 基于 PSR-12 的 PHP 8.1+ 编码风格指南
- 新增 `extensions/frameworks/fat-free-patterns.md` - Fat-Free Framework v3.8+ 开发模式

## [1.3.1] - 2025-12-19

### 新增
- 新增 Mock 限制章节至 `testing-standards.md` - Mock 需要集成测试的指南
- 新增测试数据管理模式至 `testing-standards.md` - 识别码区分与复合键指南
- 新增「何时需要集成测试」表格至 `testing-standards.md` - 6 种必须集成测试的情境

## [1.3.0] - 2025-12-16

### 新增
- 新增 `changelog-standards.md` - 完整的变更日志撰写指南
- 新增决策树和选择矩阵至 `git-workflow.md`，协助工作流程策略选择
- 新增语言选择指南至 `commit-message-guide.md`，协助选择提交信息语言

### 变更
- 更新 `versioning.md` - 新增交叉引用至 changelog-standards.md
- 更新 `git-workflow.md` - 在发布准备中新增 CHANGELOG 更新指南
- 更新 `zh-cn.md` - 新增术语：变更日志、发布说明、破坏性变更、弃用、语义化版本
- 更新 `changelog-standards.md` - 与 versioning.md 统一排除规则，新增交叉引用
- 更新 `checkin-standards.md` - 阐明 CHANGELOG 更新仅适用于用户可感知的变更
- 更新 `code-review-checklist.md` - 与 changelog-standards.md 统一 CHANGELOG 区段

### 修正
- 修正 `commit-message-guide.md` 和 `documentation-writing-standards.md` 标头格式不一致问题
- 统一交叉引用使用 markdown 链接格式而非反引号

## [1.2.0] - 2025-12-11

### 新增
- 新增 `project-structure.md` - 项目目录结构规范
- 在 `documentation-structure.md` 新增实体 DFD 层

### 变更
- 更新 `documentation-structure.md` - 阐明流程/图表分离，改进文件命名规范
- 更新 `checkin-standards.md` - 新增目录卫生指南
- 改进通用性，将项目特定范例替换为通用占位符

## [1.1.0] - 2025-12-05

### 新增
- 新增 `testing-standards.md` - 完整测试金字塔标准（单元/集成/系统/端对端测试）
- 新增 `documentation-writing-standards.md` - 文档内容需求标准

### 变更
- 更新 `anti-hallucination.md` - 强化出处标示指南
- 更新 `zh-cn.md` - 与 commit-message-guide.md v1.2.0 同步

## [1.0.0] - 2025-11-12

### 新增
- 初始发布，包含核心标准
- 核心标准：反幻觉、签入标准、提交信息指南、Git 工作流程、代码审查检查清单、版本标准、文档结构
- 扩充：C# 风格指南、繁体中文本地化
- 范本：需求文档范本
- 集成：OpenSpec 框架

[Unreleased]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v3.0.0...HEAD
[3.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.3.0...v3.0.0
[2.3.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.3.1...v2.0.0
[1.3.1]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/releases/tag/v1.0.0
