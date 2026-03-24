---
source: ../../../../integrations/spec-kit/AGENTS.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-03-23
status: current
---

# Spec Kit 指令

> **语言**: [English](../../../../integrations/spec-kit/AGENTS.md) | 简体中文

**版本**: 1.1.0
**最后更新**: 2026-03-23

为使用 Spec Kit 进行规格驱动开发的 AI 编程助手提供指引。

## 使用方式

将此文件复制到您的项目中，或纳入您的 AI 助手系统指令。

---

## 使用 Spec Kit 进行规格驱动开发

当 Spec Kit 在此项目中启用时，您必须遵循**规格驱动开发 (SDD)** 方法论。

### 核心原则：先规格，后代码

**规则**：在没有对应已批准规格的情况下，不得进行任何功能性代码变更。

**例外**：
- 紧急修复（立即恢复服务，事后补文档）
- 微小变更（错别字、注释、格式调整）

---

## Spec Kit 指令

### CLI 指令

| 指令 | 说明 |
|------|------|
| `specify init <project-name>` | 初始化新的 SDD 项目 |
| `specify check` | 验证已安装的工具（git、AI agents） |

**Init 选项：**

| 标志 | 说明 |
|------|------|
| `--ai <agent>` | 选择 AI 助手（claude、gemini、copilot、cursor-agent、windsurf 等） |
| `--ai-skills` | 以 agent skills 而非斜杠命令安装 |
| `--here` | 在当前目录中初始化 |
| `--force` | 合并时跳过确认 |
| `--script ps` | PowerShell 脚本（Windows/跨平台） |
| `--no-git` | 跳过 git 仓库初始化 |
| `--debug` | 启用详细输出 |
| `--branch-numbering timestamp` | 使用时间戳式分支命名 |

### 斜杠命令（工作流程）

当 Spec Kit 可用时，使用以下斜杠命令进行 SDD 工作流程：

| 命令 | 阶段 | 说明 |
|------|------|------|
| `/constitution` | 设定 | 建立项目治理原则 |
| `/specify` | 提案 | 定义需求与用户故事 |
| `/clarify` | 讨论 | 通过结构化问题解决规格歧义 |
| `/plan` | 设计 | 创建技术实现计划 |
| `/tasks` | 规划 | 生成可执行的任务分解 |
| `/analyze` | 审查 | 检查跨产物的一致性 |
| `/implement` | 实现 | 执行任务以构建功能 |

### 命令优先级

**规则**：始终优先使用 Spec Kit 命令，而非手动编辑文件。

**理由**：
- **一致性**：确保规格结构遵循 schema
- **可追溯性**：自动生成 ID 与建立链接
- **验证**：内置检查防止无效状态

---

## SDD 工作流程

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Constitution │───▶│   Specify    │───▶│   Clarify    │
└──────────────┘    └──────────────┘    └──────────────┘
                                               │
                    ┌──────────────┐    ┌───────▼──────┐
                    │  Implement   │◀───│  Plan/Tasks  │
                    └──────────────┘    └──────────────┘
                           │
                    ┌──────▼───────┐
                    │   Analyze    │
                    └──────────────┘
```

### 工作流程阶段

| 阶段 | 说明 | 命令 |
|------|------|------|
| **Constitution** | 定义项目治理原则 | `/constitution` |
| **Specify** | 定义需求与用户故事 | `/specify` |
| **Clarify** | 通过结构化问题解决歧义 | `/clarify` |
| **Plan** | 创建技术实现计划 | `/plan` |
| **Tasks** | 生成可执行的任务分解 | `/tasks` |
| **Implement** | 执行任务以构建功能 | `/implement` |
| **Analyze** | 检查跨产物的一致性 | `/analyze` |

---

## 工作流程强制闸门

**重要**：在执行任何工作流程阶段之前，你**必须**检查先决条件。

### 阶段闸门

| 阶段 | 先决条件 | 失败时 |
|------|----------|--------|
| Specify | Constitution 已建立（首次时） | → 先执行 `/constitution` |
| Plan | 需求已通过 `/specify` 定义 | → 先执行 `/specify` |
| Implement | 计划已批准、任务已生成 | → 先执行 `/plan` 再执行 `/tasks` |
| Commit (feat/fix) | 检查活跃的规格 | → 建议加上 `Refs: SPEC-XXX` |

### 会话启动协议
在会话开始时，检查是否有活跃的工作流程：查找 `.specify/` 目录或活跃的规格文件。
若发现活跃的工作流程 → 告知用户并提供继续的选项。

参考：`.standards/workflow-enforcement.ai.yaml`

---

## 执行任何任务之前

**上下文检查清单**：
- [ ] 检查活跃的规格：查找 `.specify/` 目录
- [ ] 在进行变更前审查相关规格
- [ ] 确认没有冲突的规格存在
- [ ] 若变更非微小则创建规格

**可跳过规格的情况**：
- Bug 修复（恢复预期行为）
- 错别字、格式、注释
- 依赖项更新（非破坏性）
- 配置文件变更

---

## 目录结构

```
.specify/
├── templates/                    # 核心 spec-kit 模板
├── extensions/
│   └── <ext-id>/templates/      # 扩展模板
├── presets/
│   └── <preset-id>/templates/   # 预设自定义
└── templates/overrides/          # 项目本地覆盖（最高优先）
```

---

## 规格文档模板

手动创建规格时，请使用以下结构：

```markdown
# [SPEC-ID] 功能标题

## 摘要
简要描述提议的变更。

## 动机
为何需要此变更？它解决什么问题？

## 详细设计
技术方案、受影响的组件、数据流。

## 验收标准
- [ ] 标准 1
- [ ] 标准 2

## 依赖项
列出对其他规格或外部系统的依赖。

## 风险
潜在风险与缓解策略。
```

---

## 与 Universal Dev Standards 集成

### 提交消息

在提交消息中引用规格 ID：

```
feat(auth): implement login feature

Implements SPEC-001 login functionality with OAuth2 support.

Refs: SPEC-001
```

### 代码审查

审查者应验证：
- [ ] 变更符合已批准的规格
- [ ] 未超出规格范围
- [ ] 规格验收标准已达成

---

## 最佳实践

### 应做

- 保持规格聚焦且原子化（每个规格一个变更）
- 包含明确的验收标准
- 将规格链接到实现 PR
- 使用 `/analyze` 验证一致性
- 完成后归档规格

### 不应做

- 在规格批准前开始写代码
- 在实现期间修改范围却未更新规格
- 让规格处于未决状态（应始终关闭或归档）
- 在需求模糊时跳过 `/clarify` 步骤

---

## 相关标准

- [规格驱动开发](../../../../core/spec-driven-development.md) - SDD 方法论
- [提交消息指南](../../../../core/commit-message-guide.md) - 提交惯例
- [代码签入标准](../../../../core/checkin-standards.md) - 签入要求

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.1.0 | 2026-03-23 | 更新以反映 Spec Kit v0.4.0 实际的 CLI 命令与斜杠命令 |
| 1.0.0 | 2025-12-30 | 初始 Spec Kit 集成 |

---

## 许可协议

本文档依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。
