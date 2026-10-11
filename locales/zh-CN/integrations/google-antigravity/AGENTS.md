---
source: ../../../../integrations/google-antigravity/AGENTS.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: dcee96a2ef3b
status: current
---

# Antigravity 系统指令

> **语言**: [English](../../../../integrations/google-antigravity/AGENTS.md) | [繁體中文](../../../zh-TW/integrations/google-antigravity/AGENTS.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-01-09

本文档包含 Google Antigravity (Gemini Advanced Agent) 的推荐系统指令，以确保符合通用文档规范。

## 系统提示词片段

请将以下内容添加至您的代理系统指令或全局上下文中：

```markdown
<universal_doc_standards_compliance>
你必须遵循本项目定义的 **通用文档规范**。

### 核心规范使用规则

> **核心规范使用规则**：
> 在验证规范、检查代码或执行任务时，**优先**阅读 `core/` 中的精简规则（例如 `core/testing-standards.md`）。
> **仅在**明确要求教学内容、详细说明或教程时，才阅读 `core/guides/` 或 `methodologies/guides/`。
> 这可确保 token 效率与上下文聚焦。

### 规格驱动开发 (SDD) 优先

**规则**：当项目中集成了 SDD 工具（如 OpenSpec、Spec Kit 等）并提供特定命令（例如 `/openspec` 或 `/sdd` 等斜杠命令）时，你必须优先使用这些命令，而非手动编辑文件。

**检测方式**：
- OpenSpec：检查是否有 `openspec/` 目录或 `openspec.json`
- Spec Kit：检查是否有 `specs/` 目录或 `.speckit` 配置

**原因**：
- **一致性**：工具确保规格结构遵循严格的 schema
- **可追溯性**：命令自动处理日志、ID 和链接
- **安全性**：工具内建验证以防止无效状态

参考：`core/spec-driven-development.md`

### 核心协议：防幻觉
参考：`core/anti-hallucination.md`

1. **证据基础分析**：
   - 在分析文件之前，你必须先读取文件。
   - 不要猜测 API、类名或库版本。
   - 如果你还没看过代码，请说明「我需要读取 [文件] 来确认」。

2. **来源标注**：
   - 每个关于代码的事实陈述都必须标注来源。
   - 格式：`[来源: 代码] 路径/文件:行号`
   - 外部文档：`[来源: 外部] http://网址 (访问日期: 日期)`

3. **确定性分类**：
   - 使用标签表示信心程度：`[已确认]`、`[推论]`、`[假设]`、`[未知]`。

4. **建议**：
   - 当提供选项时，你必须明确说明「推荐」的选择及其理由。

### AI 响应导航

**规则**：每个实质性的 AI 响应结尾都必须包含导航区块（Navigation Footer），建议下一步行动。

**关键行为**：
- 在完成任务、提供分析、提出问题或报告错误后，附加导航建议
- 提供多个选项时，以 ⭐ 标记推荐选项
- 使用情境模板（任务完成、用户提问、错误/失败、进行中、信息性回复）
- 依情境调整选项数量（1-5 个，绝不超过 5 个）
- 适用时，建议中优先使用斜杠命令

**豁免**：极短的确认（"OK"、"Done"）可省略导航。

参考：`.standards/ai-response-navigation.ai.yaml`（或 `core/ai-response-navigation.md`）

### 文档与提交
1. **Commit 消息**：遵循 Conventional Commits —— `<type>(<scope>): <subject>`。
   **类型**：feat、fix、docs、chore、test、refactor、style、perf、ci、build、revert。
   完整规则：`core/commit-message-guide.md`。
2. **文件结构**：遵循 `core/documentation-structure.md`。
3. **质量检查**：完成前依据 `core/checkin-standards.md` 验证工作。

</universal_doc_standards_compliance>
```

---

## Available UDS Slash Commands | UDS 可用命令

> 为 SPEC-INTSYNC-001 同步合规自动生成的索引。权威描述位于 `skills/commands/*.md` 与 `skills/commands/COMMAND-INDEX.json`。

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
