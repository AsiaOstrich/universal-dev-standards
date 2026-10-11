---
source: ../../../../integrations/opencode/AGENTS.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 2c2beec66174
status: current
---

# 通用开发规范

> **语言**: [English](../../../../integrations/opencode/AGENTS.md) | [繁體中文](../../../zh-TW/integrations/opencode/AGENTS.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-01-09

本项目遵循通用文档规范，以确保高质量、无幻觉的代码与文档。

---

## 核心规范使用规则

> **核心规范使用规则**：
> 在验证规范、检查代码或执行任务时，**优先**读取 `core/` 中的精简规则（例如 `core/testing-standards.md`）。
> **仅在**明确要求教学内容、详细说明或教程时，才读取 `core/guides/` 或 `methodologies/guides/`。
> 这样可确保 token 使用效率并保持上下文聚焦。

---

## 规格驱动开发 (SDD) 优先

**规则**：当项目中集成了 SDD 工具（如 OpenSpec、Spec Kit 等）并提供特定命令（例如 `/openspec` 或 `/sdd` 等斜杠命令）时，你必须优先使用这些命令，而非手动编辑文件。

**检测方式**：
- OpenSpec：检查是否有 `openspec/` 目录或 `openspec.json`
- Spec Kit：检查是否有 `specs/` 目录或 `.speckit` 配置

**原因**：
- **一致性**：工具确保规格结构遵循严格的 schema
- **可追溯性**：命令自动处理日志、ID 和链接
- **安全性**：工具内建验证以防止无效状态

参考：`core/spec-driven-development.md`

---

## 防幻觉协议

参考：`core/anti-hallucination.md`

### 1. 证据基础分析

- 在分析文件之前，你必须先读取文件。
- 不要猜测 API、类名或库版本。
- 如果你还没看过代码，请说明：「我需要读取 [文件] 来确认」。

### 2. 来源标注

每个关于代码的事实陈述都必须标注来源：
- 代码：`[来源: 代码] 路径/文件:行号`
- 外部文档：`[来源: 外部] http://网址 (访问日期: 日期)`

### 3. 确定性分类

使用标签表示信心程度：
- `[已确认]` - 已从来源验证
- `[推论]` - 逻辑推论
- `[假设]` - 合理假设
- `[未知]` - 无法确定

### 4. 建议

当提供选项时，你必须明确说明「推荐」的选择及其理由。

---

## 文档与提交

### Commit 消息

遵循 Conventional Commits 格式（参考：`core/commit-message-guide.md`）：

```
<类型>(<范围>): <主题>

<内文>

<页脚>
```

**类型**：feat、fix、docs、chore、test、refactor、style

### 文件结构

遵循文档结构指南（参考：`core/documentation-structure.md`）。

### 质量检查

完成前，依据 `core/checkin-standards.md` 验证工作：
- [ ] 代码编译成功
- [ ] 所有测试通过
- [ ] 无硬编码的秘密信息
- [ ] 如适用，已更新文档

---

## 工作流强制关卡

**关键**：执行任何工作流阶段命令之前，你必须先检查前置条件。

### 会话开始协议
会话开始时，检查是否有进行中的工作流：`ls .workflow-state/*.yaml 2>/dev/null`
若发现进行中的工作流 → 告知用户并提议继续执行。

### 阶段关卡

| 工作流 | 阶段 | 前置条件 | 未满足时 |
|---------|-------|-------------|------------|
| SDD | implement | 规格状态 = Approved | → `/sdd approve` |
| SDD | verify | 所有 AC 都有代码 + 测试 | → `/sdd implement` |
| TDD | GREEN | 已存在失败的测试 | → 停留在 RED |
| TDD | REFACTOR | 所有测试通过 | → 停留在 GREEN |
| BDD | AUTOMATION | `.feature` 文件已存在 | → FORMULATION |
| Commit | feat/fix | 检查进行中的规格 | → 建议加上 `Refs: SPEC-XXX` |

**绝不**在失败的测试存在之前编写实现代码（TDD）。
**绝不**在 `.feature` 文件存在之前编写步骤定义（BDD）。

参考：`.standards/workflow-enforcement.ai.yaml`

---

## 代码审查规范

参考：`core/code-review-checklist.md`

审查代码时，检查：
1. **功能性** - 是否按预期运作？
2. **安全性** - 无漏洞（OWASP Top 10）？
3. **性能** - 算法和查询是否高效？
4. **可维护性** - 代码是否整洁、易读？
5. **测试** - 测试覆盖率是否足够？

---

## AI 回应导航

**规则**：每个实质性的 AI 回应结尾必须包含导航区块（Navigation Footer），建议下一步行动。

**关键行为**：
- 在完成任务、提供分析、提出问题或回报错误后，附加导航建议
- 提供多个选项时，以 ⭐ 标记推荐选项
- 使用情境模板（任务完成、用户提问、错误/失败、进行中、信息性回复）
- 依情境调整选项数量（1-5 个，绝不超过 5 个）
- 适用时，建议中优先使用斜杠命令

**豁免**：极简短的确认（如「OK」、「Done」）可省略导航。

参考：`.standards/ai-response-navigation.ai.yaml`（或 `core/ai-response-navigation.md`）

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-01-09 | 初始 OpenCode 集成 |

---

## 许可证

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。


## UDS 可用命令

> 为符合 SPEC-INTSYNC-001 同步要求而自动生成的索引。权威描述位于 `skills/commands/*.md` 与 `skills/commands/COMMAND-INDEX.json`。

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
