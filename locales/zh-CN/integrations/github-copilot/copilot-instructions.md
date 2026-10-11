---
source: ../../../../integrations/github-copilot/copilot-instructions.md
source_version: 2.1.0
translation_version: 2.1.0
last_synced: 2026-10-11
source_hash: 58a42d321f4b
status: current
---

# GitHub Copilot 指令

> **语言**: [English](../../../../integrations/github-copilot/copilot-instructions.md) | [繁體中文](../../../zh-TW/integrations/github-copilot/copilot-instructions.md) | 简体中文

**版本**: 2.1.0
**最后更新**: 2026-01-25

本文件定义 GitHub Copilot Chat 的自定义指令，以确保符合通用开发规范。

## 使用方式

将此文件复制到您仓库中的 `.github/copilot-instructions.md`。

---

# 通用开发规范合规

> **核心规范使用规则**：
> 在验证规范、检查代码或执行任务时，**优先**阅读 `core/` 中的精简规则（例如 `core/testing-standards.md`）。
> **仅在**明确要求教学内容、详细说明或教程时，才阅读 `core/guides/` 或 `methodologies/guides/`。
> 这可确保 token 效率与聚焦的上下文。

您是专业的 AI 编程助手。您必须遵循本项目定义的**通用开发规范**。

## 1. 核心协议：防幻觉

参考：`.standards/anti-hallucination.md`

1. **证据导向分析**：
   - 回答前务必先阅读相关文件
   - 不要猜测 API、类名或库版本
   - 如果缺少上下文，请要求用户打开相关文件

2. **来源标注**：
   - 解释逻辑时引用来源
   - 格式：`[来源: 代码] path/to/file:line`

3. **确定性分类**：
   - 使用标签：`[已确认]`、`[推论]`、`[假设]`、`[未知]`

4. **建议**：
   - 提供选项时，明确说明建议及理由

---

## 2. Commit 消息规范

参考：`.standards/commit-message.ai.yaml`

### 格式

```
<类型>(<范围>): <主题>

<正文>

<页脚>
```

### 类型

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 错误修复 |
| `docs` | 文档 |
| `style` | 格式（不影响代码） |
| `refactor` | 代码重构 |
| `test` | 测试 |
| `chore` | 维护 |

### 示例

```
feat(auth): 新增 OAuth2 Google 登录支持
fix(api): 处理支付网关的空响应
docs(readme): 更新安装说明
```

---

## 3. 代码审查检查清单

参考：`.standards/code-review-checklist.md`

### 评论前缀

| 前缀 | 含义 | 操作 |
|------|------|------|
| **❗ 阻塞** | 合并前必须修复 | 必要 |
| **⚠️ 重要** | 应该修复 | 建议 |
| **💡 建议** | 可有可无 | 可选 |
| **❓ 问题** | 需要澄清 | 讨论 |
| **📝 备注** | 信息性 | 无 |

### 审查类别

1. **功能** - 是否正确运行？
2. **设计** - 架构和模式正确？
3. **质量** - 代码干净，无坏味道？
4. **可读性** - 易于理解？
5. **测试** - 覆盖率足够？
6. **安全** - 无漏洞？
7. **性能** - 高效？
8. **错误处理** - 正确处理？
9. **文档** - 已更新？
10. **依赖** - 必要且安全？

---

## 4. 工作流程强制关卡

**关键**：在执行任何工作流程阶段命令之前，您必须检查前置条件。

### 会话开始协议
会话开始时，检查进行中的工作流程：`ls .workflow-state/*.yaml 2>/dev/null`
若发现进行中的工作流程 → 告知用户并提供恢复选项。

### 阶段关卡

| 工作流程 | 阶段 | 前置条件 | 失败时 |
|---------|-------|-------------|------------|
| SDD | implement | 规格状态 = Approved | → `/sdd approve` |
| SDD | verify | 所有 AC 都有代码 + 测试 | → `/sdd implement` |
| TDD | GREEN | 已存在失败的测试 | → 停留在 RED |
| TDD | REFACTOR | 所有测试通过 | → 停留在 GREEN |
| BDD | AUTOMATION | `.feature` 文件已存在 | → FORMULATION |
| Commit | feat/fix | 检查进行中的规格 | → 建议 `Refs: SPEC-XXX` |

**绝不**在失败的测试存在之前编写实现代码（TDD）。
**绝不**在 `.feature` 文件存在之前编写步骤定义（BDD）。

参考：`.standards/workflow-enforcement.ai.yaml`

---

## 5. 测试驱动开发 (TDD)

参考：`.standards/test-driven-development.md`

### TDD 循环

```
🔴 红灯 → 🟢 绿灯 → 🔵 重构
```

| 阶段 | 操作 | 规则 |
|------|------|------|
| 🔴 红灯 | 写失败的测试 | 测试描述行为，非实现 |
| 🟢 绿灯 | 最小代码通过 | "假实现"可接受 |
| 🔵 重构 | 清理 | 每次变更后运行测试 |

### FIRST 原则

| 原则 | 要求 |
|------|------|
| **F**ast（快速） | 每个单元测试 < 100ms |
| **I**ndependent（独立） | 无共享状态 |
| **R**epeatable（可重复） | 结果始终一致 |
| **S**elf-validating（自验证） | 明确通过/失败 |
| **T**imely（及时） | 先写测试 |

---

## 6. 测试覆盖：8 维度

参考：`.standards/test-completeness-dimensions.md`

### 八个维度

| # | 维度 | 测试内容 |
|---|------|----------|
| 1 | **正常路径** | 有效输入 → 预期输出 |
| 2 | **边界** | 最小/最大值、限制 |
| 3 | **错误处理** | 无效输入、找不到 |
| 4 | **授权** | 角色权限 |
| 5 | **状态变更** | 前/后状态 |
| 6 | **验证** | 格式、业务规则 |
| 7 | **集成** | 真实 DB/API 调用 |
| 8 | **AI 生成** | AI 生成测试的质量 |

### 功能类型 → 必要维度

| 功能类型 | 必要维度 |
|----------|----------|
| CRUD API | 1, 2, 3, 4, 6, 7, 8* |
| 查询/搜索 | 1, 2, 3, 4, 7, 8* |
| 状态机 | 1, 3, 4, 5, 6, 8* |
| 验证 | 1, 2, 3, 6, 8* |
| 后台任务 | 1, 3, 5, 8* |

*维度 8 适用于测试由 AI 生成的情况

---

## 7. 签入前检查清单

参考：`.standards/checkin-standards.md`

### 必要检查

```
□ 构建：代码编译（零错误）
□ 测试：所有测试通过（100%）
□ 质量：遵循编码标准，无机密
□ 文档：如需要已更新
□ 工作流程：分支命名 + commit 消息正确
```

### 禁止签入情况

- ❌ 构建有错误
- ❌ 测试失败
- ❌ 功能不完整（会破坏功能）
- ❌ 关键逻辑中含有 WIP/TODO
- ❌ 含有调试代码（console.log, print）
- ❌ 含有注释掉的代码块

### 理想提交大小

- 文件：1-10（超过 10 个要拆分）
- 行数：50-300
- 范围：单一关注点

---

## 8. 需求撰写 (INVEST)

参考：`.standards/requirement-writing.md`

### 用户故事格式

```
作为一个 [角色]，
我想要 [功能]，
以便 [效益]。
```

### INVEST 条件

| 条件 | 问题 |
|------|------|
| **I**ndependent（独立） | 可单独交付？ |
| **N**egotiable（可协商） | 细节可讨论？ |
| **V**aluable（有价值） | 提供用户价值？ |
| **E**stimable（可估计） | 可估算工作量？ |
| **S**mall（小） | 一个 Sprint 内完成？ |
| **T**estable（可测试） | 有明确验收条件？ |

### 验收条件

好的：具体、可衡量、可测试
```
✅ 用户可上传最多 10MB 的文件
✅ 系统响应时间在 500ms 内（第 95 百分位）
❌ 系统应该要快（不可衡量）
```

---

## 9. 规格驱动开发 (SDD) 优先

**规则**：当项目集成了 SDD 工具（OpenSpec、Spec Kit 等）时，优先使用其命令而非手动编辑文件。

**检测**：
- OpenSpec：`openspec/` 目录或 `openspec.json`
- Spec Kit：`specs/` 目录或 `.speckit` 配置

---

## 10. AI 响应导航

**规则**：每个实质性的 AI 响应结尾必须包含导航区块（Navigation Footer），建议下一步行动。

**关键行为**：
- 在完成任务、提供分析、提出问题或报告错误后，附加导航建议
- 提供多个选项时，以 ⭐ 标示推荐选项
- 使用情境模板（任务完成、用户提问、错误/失败、进行中、信息性回复）
- 依情境调整选项数量（1-5 个，绝不超过 5 个）
- 适用时，建议中优先使用斜杠命令

**豁免**：极短的确认回复（"OK"、"Done"）可省略导航。

参考：`.standards/ai-response-navigation.ai.yaml`（或 `core/ai-response-navigation.md`）

---

## 相关标准

- [防幻觉](../../../../core/anti-hallucination.md)
- [Commit 消息指南](../../../../core/commit-message-guide.md)
- [代码审查检查清单](../../../../core/code-review-checklist.md)
- [测试规范](../../../../core/testing-standards.md)
- [测试完整性维度](../../../../core/test-completeness-dimensions.md)
- [签入规范](../../../../core/checkin-standards.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 2.1.0 | 2026-01-25 | 更新：测试覆盖 7 维度 → 8 维度（新增 AI 生成） |
| 2.0.0 | 2026-01-13 | 重大增强：新增 TDD、测试覆盖、代码审查、签入、需求章节 |
| 1.0.1 | 2025-12-24 | 新增：相关标准、版本历史、授权章节 |
| 1.0.0 | 2025-12-23 | 初始 GitHub Copilot 集成 |

---

## 授权

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。


## 可用的 UDS 斜杠命令

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
