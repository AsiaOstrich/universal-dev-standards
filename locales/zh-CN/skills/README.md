---
source: ../../../skills/README.md
source_version: 1.1.0
translation_version: 1.2.0
last_synced: 2026-06-20
status: current
---

# 通用开发 Skills

> **语言**: [English](../../../skills/README.md) | 简体中文

本目录收录通用开发标准（UDS）skill 的参考实现。这些 skill 尽可能设计为与工具无关，作为 AI 编程助手的「真实来源（Source of Truth）」。

> 衍生自 [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards) 核心标准。

> **完整的索引式 skill 列表**（按 Tier、分类与使用场景）请见 **[docs/user/SKILLS-INDEX.md](../../../docs/user/SKILLS-INDEX.md)**（自动生成）。
> 斜线命令参考请见 **[docs/user/COMMANDS-INDEX.md](../../../docs/user/COMMANDS-INDEX.md)**。

## 目录结构

```
skills/
├── commands/          # 通用斜线命令定义（.md）
├── agents/            # 通用 Agent 定义（.md）
├── workflows/         # 通用 Workflow 定义（.yaml）
├── tools/             # 工具专属的 adapter 与配置
│   ├── cline/         # Cline (.clinerules)
│   ├── cursor/        # Cursor (.cursorrules)
│   ├── windsurf/      # Windsurf (.windsurfrules)
│   └── copilot/       # GitHub Copilot (instructions.md)
├── _shared/           # 共用模板与工具
└── [skill-name]/      # 单个 skill 定义（例如 git-workflow-guide/）
```

## 通用 Skills 与命令

这些 skill 提供标准指引与工作流。在支持的工具中（如 Claude Code、OpenCode）可通过斜线命令访问，也可手动引用。

| Skill（文件夹） | 命令 | 描述 |
|----------------|---------|-------------|
| `guide` | `/guide` | [UDS] 访问所有标准指南 |
| `checkin-assistant` | `/checkin` | [UDS] 提交前质量门禁 |
| `commit-standards` | `/commit` | [UDS] Conventional Commits 格式 |
| `code-review-assistant` | `/code-review` | [UDS] 系统化代码审查 |
| `tdd-assistant` | `/tdd` | [UDS] 测试驱动开发 |
| `bdd-assistant` | `/bdd` | [UDS] 行为驱动开发 |
| `atdd-assistant` | `/atdd` | [UDS] 验收测试驱动开发 |
| `e2e-assistant` | `/e2e` | [UDS] 从 BDD 场景生成 E2E 测试骨架 |
| `journey-test-assistant` | `/journey-test` | [UDS] 连贯用户旅程测试计划（TESTPLAN）＋ E2E 骨架生成 |
| `release-standards` | `/release` | [UDS] 发行与 Changelog 管理 |
| `documentation-guide` | `/docs` | [UDS] 文档管理 |
| `requirement-assistant` | `/requirement` | [UDS] 需求撰写 |
| `reverse-engineer` | `/reverse` | [UDS] 逆向工程代码 |
| `spec-derivation` | `/derive` | [UDS] 从 spec 推导 BDD/TDD/ATDD 产物 |
| `spec-driven-dev` | `/sdd` | [UDS] 规格驱动开发 |
| `test-coverage-assistant` | `/coverage` | [UDS] 测试覆盖率分析 |
| `dev-methodology` | `/methodology` | [UDS] 开发方法论 |
| `refactoring-assistant` | `/refactor` | [UDS] 重构指引 |
| `project-discovery` | `/discover` | [UDS] 评估项目健康度与风险 |
| `brainstorm-assistant` | `/brainstorm` | [UDS] 结构化 AI 辅助构思 |
| `changelog-guide` | `/changelog` | [UDS] 生成 changelog 条目 |
| `dev-workflow-guide` | `/dev-workflow` | [UDS] 将开发阶段对应到 UDS 命令 |
| `docs-generator` | `/docgen` | [UDS] 生成使用文档 |
| `security-assistant` | `/security` | [UDS] 安全审查与漏洞评估 |
| `security-scan-assistant` | `/scan` | [UDS] 自动化安全扫描与依赖审计 |
| `api-design-assistant` | `/api-design` | [UDS] API 设计（REST、GraphQL、gRPC）|
| `database-assistant` | `/database` | [UDS] 数据库设计、迁移、查询优化 |
| `ci-cd-assistant` | `/ci-cd` | [UDS] CI/CD 管线设计与优化 |
| `incident-response-assistant` | `/incident` | [UDS] 事故响应与事后复盘 |
| `pr-automation-assistant` | `/pr` | [UDS] Pull request 创建与审查自动化 |
| `metrics-dashboard-assistant` | `/metrics` | [UDS] 开发指标与项目健康度 |
| `durable-execution-assistant` | `/durable` | [UDS] 工作流故障恢复与回滚 |
| `migration-assistant` | `/migrate` | [UDS] 代码迁移与框架升级 |
| `audit-assistant` | `/audit` | [UDS] 标准合规审计 |
| `observability-assistant` | `/observability` | [UDS] 可观测性配置、指标、告警 🆕 |
| `slo-assistant` | `/slo` | [UDS] SLI 选择、SLO 设定、Error Budget 🆕 |
| `runbook-assistant` | `/runbook` | [UDS] Runbook 创建、演练、覆盖率 🆕 |
| `skill-builder` | `/skill-builder` | [UDS] 识别重复流程并以正确的开发深度构建 Skill |

> **注意**：参考型指南（如 Git Workflow、Logging、Error Codes）请使用 `/guide` 命令。

## Skill Tier（列出预算优化）

> 背景：Claude Code 通过 `skillListingBudgetFraction` 保留一小部分 context（默认 1%）用于列出 skill。当有 40+ 个 UDS skill 加上采用者安装的 plugin 时，描述可能被截断。UDS 将 skill 组织为三个 tier，让采用者可选择性抑制较少用的描述，同时保持 skill 仍可通过 `/<name>` 调用。
>
> 决策与权衡见 [DEC-061](https://github.com/AsiaOstrich/dev-platform/blob/main/cross-project/decisions/DEC-061-uds-skill-listing-budget.md)。参考配置位于 [`examples/skill-overrides-recommended.json`](../../../examples/skill-overrides-recommended.json)。详细调整：[`docs/skill-budget-tuning.md`](../../../docs/skill-budget-tuning.md)。

### Tier 1 — Core（每日使用）
**列出默认**：`"on"`（显示完整描述）。永远可自动发现。

`commit-standards`、`push`、`git-workflow-guide`、`tdd-assistant`、`bdd-assistant`、`testing-guide`、`code-review-assistant`、`refactoring-assistant`、`requirement-assistant`、`spec-driven-dev`、`adr-assistant`、`dev-workflow-guide`、`checkin-assistant`

### Tier 2 — Advanced（每周使用）
**列出默认**：`"on"`（显示完整描述）。

`atdd-assistant`、`e2e-assistant`、`journey-test-assistant`、`contract-test-assistant`、`security-assistant`、`deploy-assistant`、`ci-cd-assistant`、`error-code-guide`、`logging-guide`、`documentation-guide`、`api-design-assistant`、`database-assistant`、`project-structure-guide`、`ai-instruction-standards`、`release-standards`、`changelog-guide`、`test-coverage-assistant`、`pr-automation-assistant`、`spec-derivation`、`reverse-engineer`、`project-discovery`、`dev-methodology`、`audit-assistant`、`docs-generator`

### Tier 3 — Specialist（每月或事件驱动）
**列出默认**：在参考覆写中为 `"name-only"`——节省 token；**仍可通过 `/<name>` 调用**。

`incident-response-assistant`、`observability-assistant`、`slo-assistant`、`runbook-assistant`、`retrospective-assistant`、`durable-execution-assistant`、`metrics-dashboard-assistant`、`migration-assistant`、`security-scan-assistant`、`brainstorm-assistant`、`skill-builder`

> Tier 的理由与准则：[`flows/skill-tiering-rationale.md`](../../../flows/skill-tiering-rationale.md)。采用者可自由覆写参考配置（若每日使用某个 Tier 3 skill 可升为 `"on"`，或将任一 skill 降为 `"name-only"`）。

## Tool Adapters

各种 AI 工具的专属配置位于 `skills/tools/`。

### Claude Code / OpenCode
`skills/` 根目录下的文件（commands、agents、workflows）可直接兼容于 Claude Code 与 OpenCode。

**安装（Plugin Marketplace）：**
```bash
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

### Cursor
位于 `skills/tools/cursor/`。
```bash
cp skills/tools/cursor/.cursorrules .cursorrules
```

### Windsurf
位于 `skills/tools/windsurf/`。
```bash
cp skills/tools/windsurf/.windsurfrules .windsurfrules
```

### Cline
位于 `skills/tools/cline/`。
```bash
cp skills/tools/cline/.clinerules .clinerules
```

### GitHub Copilot
位于 `skills/tools/copilot/`。
```bash
mkdir -p .github
cp skills/tools/copilot/copilot-instructions.md .github/copilot-instructions.md
```

## 贡献

新增 skill 或支持更多 AI 工具的指引，请见 [CONTRIBUTING.template.md](CONTRIBUTING.template.md)。

## 许可

双重许可：CC BY 4.0（文档）＋ MIT（代码）
