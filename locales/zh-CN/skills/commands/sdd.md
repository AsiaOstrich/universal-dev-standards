---
description: [UDS] Create or review specification documents for Spec-Driven Development
allowed-tools: Read, Write, Grep, Glob, Bash(git:*), Bash(npm test:*)
argument-hint: "[create|review|approve|implement|verify] [spec name or file | 规格名称或文件]"
---

# Spec-Driven Development Assistant | 规格驱动开发助手

Create, review, approve, implement, and verify specification documents — full SDD lifecycle management.

创建、审查、批准、实现和验证规格文件 — 完整 SDD 生命周期管理。

## Pre-Flight Checks | 前置检查

Before executing ANY SDD phase, the AI assistant MUST run the applicable checks below. If a check fails, STOP and guide the user to the correct phase.

在执行任何 SDD 阶段前，AI 助手必须执行以下适用的检查。如果检查失败，停止并引导用户到正确的阶段。

### Phase Gate Matrix | 阶段闸门矩阵

| Target Phase | Pre-Flight Check | On Failure |
|-------------|-----------------|------------|
| `discuss` | None (entry point) | — |
| `create` | `ls docs/specs/` → check for existing orphan specs | Warn, offer to close orphans first |
| `review` | Spec file exists AND status = `Draft` | → Guide to `/sdd create` |
| `approve` | Spec file exists AND status = `Review` | → Guide to `/sdd review` |
| `implement` | 1. `ls docs/specs/SPEC-*.md` → at least one spec exists | → Guide to `/sdd create` |
| | 2. Spec status = `Approved` (check `status:` field in spec) | → Guide to `/sdd approve` |
| | 3. Check `.workflow-state/` for active SDD state | Resume if exists |
| `verify` | 1. Spec status = `Implemented` or has implementation commits | → Guide to `/sdd implement` |
| | 2. All AC have code + test references | → List incomplete ACs |

### Check Commands | 检查指令

```bash
# Check for existing specs
ls docs/specs/SPEC-*.md 2>/dev/null

# Check spec status (grep the status field)
grep -m1 "^status:" docs/specs/SPEC-XXX.md

# Check for active workflow state
ls .workflow-state/sdd-*.yaml 2>/dev/null

# Check AC implementation status
grep -E "^- \[(x|X)\]" docs/specs/SPEC-XXX.md
```

### Enforcement Behavior | 执行行为

- **Mode: `enforce`** (default) — 阻止阶段转换，显示引导
- **Mode: `suggest`** — 显示警告但允许覆盖
- **Mode: `off`** — 不检查

检查项目配置：`.uds/config.yaml` → `workflow.enforcement_mode`

---

## SDD Workflow | SDD 工作流程

```
/sdd discuss ──► /sdd create ──► /sdd review ──► /sdd approve ──► /sdd implement ──► /sdd verify
```

### Phase 0.5: Discuss — Capture Gray Areas | 捕捉灰色地带

Before writing a spec, conduct a structured discussion to resolve ambiguities.

在撰写规格前，进行结构化讨论以解决模糊之处。

**Discuss Checklist | 讨论检查清单：**
- [ ] 灰色地带已识别并列出
- [ ] 范围已锁定（范围内/外）
- [ ] 必读参考已收集（read_first 列表）
- [ ] 已检查既有决策（.project-context/）
- [ ] 问题基于实际代码，不是猜测

**Scope Lock Rule**: 讨论中发现的新功能归类为**延后**，另行追踪。不扩大当前范围。

**产出**：一份 `read_first` 清单和范围定义，作为创建阶段的输入。

### Phase 1: Create — Write Spec | 撰写规格

Define requirements, technical design, acceptance criteria, and test plan.

定义需求、技术设计、验收标准和测试计划。

**Orphan Check**: 创建新规格前，检查是否有未关闭的孤儿规格。考虑先关闭或归档它们。

### Phase 2: Review — Validate | 审查验证

Check for completeness, consistency, and feasibility with stakeholders.

与利益相关者检查完整性、一致性和可行性。

### Phase 3: Approve — Sign Off | 批准

Get stakeholder sign-off before implementation begins. Update spec status from Draft/Review to Approved.

在开始实现前取得利益相关者批准。将规格状态从 Draft/Review 更新为 Approved。

**Approval checklist | 批准检查清单：**
- [ ] 所有审查意见已处理
- [ ] 需求完整且无歧义
- [ ] 验收标准可测试
- [ ] 技术设计可行
- [ ] 测试计划涵盖所有 AC

**Approval metadata added to spec | 批准元数据：**
```yaml
status: Approved
approved-date: YYYY-MM-DD
approved-by: [approver]
```

### Phase 4: Implement — Code | 实现

Develop following the approved spec, referencing requirements and AC. Track progress per AC.

依照已批准规格开发，追踪每个 AC 的实现进度。

**针对每个 AC 追踪：**
- [ ] 代码已实现
- [ ] 单元测试已编写
- [ ] 测试通过

**Atomic Commits per AC | 每 AC 一个 Commit：**

Prefer one commit per acceptance criterion for better traceability. Tightly coupled ACs may be combined.

建议每个验收标准一个 commit 以提升可追溯性。紧耦合的 AC 可合并。

**建议 commit 格式：**
```
feat(<scope>): implement AC-N — <description>

Implements acceptance criteria AC-N from SPEC-XXX.
See: docs/specs/SPEC-XXX.md#AC-N

Refs: SPEC-XXX, AC-N
```

### Phase 5: Verify — Confirm | 验证

Ensure implementation matches spec, all tests pass, AC satisfied. Generate verification report.

确保实现符合规格、所有测试通过、AC 已满足。生成验证报告。

**验证报告输出：**
```markdown
# Verification Report: SPEC-XXX

## Summary
- Status: PASS / FAIL
- Date: YYYY-MM-DD

## AC Coverage
| AC | Implementation | Test | Status |
|----|---------------|------|--------|
| AC-1 | src/auth.js:42 | tests/auth.test.js:15 | PASS |

## Deviation Report | 偏差报告
| Type | Description | Justification |
|------|-------------|---------------|
| Added | Rate limiting on login endpoint | Security requirement discovered during implementation |
| Modified | AC-3 uses JWT instead of session tokens | Team decision (see PRJ-2026-0042) |
| Omitted | AC-5 social login | Deferred to SPEC-XXX-v2 |
```

**偏差类别：**
- **Added**: 规格中未列出的功能
- **Modified**: 与规格不同的功能
- **Omitted**: 未实现的规格需求

重大偏差必须记录为 `.project-context/` 中的 `decision` 类型条目。

**验证循环上限：**

验证阶段上限为 **3 次迭代**。3 次失败后，停止并选择：

1. 审查规格是否有歧义 — AC 是否不清楚？
2. 重新思考实现方案 — 尝试不同方法
3. 升级处理至利益相关者

迭代次数记录在 `.workflow-state/` 中。

**Traceability Matrix (Recommended) | 追溯矩阵（建议）：**

生成 REQ → AC → Test → Implementation → Commit 追溯矩阵：

```markdown
| REQ-ID | AC | Test | Implementation | Commit |
|--------|-----|------|----------------|--------|
| REQ-001 | AC-1 | auth.test.js:15 | auth.js:42 | abc1234 |
| REQ-002 | AC-2 | auth.test.js:30 | auth.js:67 | def5678 |
```

空栏位标记为 `[INCOMPLETE]`。

## Enhanced Workflow | 增强工作流程

### Phase 0: Scope Evaluation (NEW) | 范围评估（新增）

Before creating a spec, evaluate the change scope:

在创建规格前，先评估变更范围：

**Q1: Scope | 范围**
- [ ] Project-specific (CLAUDE.md only) | 项目专用
- [ ] Universal (Core Standard) | 通用规则

**Q2: Interaction | 交互**
- [ ] Needs AI interaction → Create Skill | 需要 AI 交互 → 创建 Skill
- [ ] Static rule only | 静态规则

**Q3: Trigger | 触发**
- [ ] User-triggered → Create Command | 用户触发 → 创建命令
- [ ] AI applies automatically | AI 自动应用

**Record in spec metadata:**
```yaml
scope: universal|project|utility
sync-to:
  - core-standard: pending|complete|N/A
  - skill: pending|complete|N/A
  - command: pending|complete|N/A
  - translations: pending|complete|N/A
```

### Phase 6: Sync Verification (NEW) | 同步验证（新增）

After implementation, verify all sync targets:

实现后，验证所有同步目标：

- [ ] Core Standard created/updated (if universal)
- [ ] Skill created/updated (if interactive)
- [ ] Command created/updated (if user-triggered)
- [ ] Translations synchronized

## Spec States | 规格状态

| State | Description | 说明 |
|-------|-------------|------|
| Draft | Work in progress | 草稿中 |
| Review | Under review | 审查中 |
| Approved | Ready for implementation | 已批准 |
| Implemented | Code complete | 已实现 |
| Archived | Completed or deprecated | 已归档 |

## Acceptance Criteria Format | 验收标准格式

All new acceptance criteria **MUST** use Given/When/Then (GWT) format:

所有新的验收标准**必须**使用 Given/When/Then (GWT) 格式：

```
Given [precondition],
When [action],
Then [expected outcome].
```

**示例：**
- `Given a logged-in user, When they click 'Export', Then a CSV file is downloaded`
- `Given an empty cart, When the user adds an item, Then the cart count shows 1`

**好处：**
- 支持通过 `/derive-bdd` 进行结构化 BDD 推导
- 减少验收标准的模糊性
- 与测试场景一对一对应

**注意**：现有规格不需要回溯更新为 GWT 格式。

## Session Boundaries | Session 分界建议

For long SDD workflows, consider starting a new AI session at natural phase boundaries to prevent context degradation:

对于长时间的 SDD 工作流程，建议在自然阶段边界开启新的 AI session 以防止上下文退化：

| Boundary | Phases Before | Phases After |
|----------|--------------|--------------|
| 1 | Create + Review | Implement |
| 2 | Implement | Verify |
| 3 | Verify | Archive |

使用 `workflow-state` 文件和 `.project-context/` 在 session 间持久化状态。这是建议而非强制要求。

## Spec Document Structure | 规格文件结构

```markdown
# Feature: [Feature Name]

## Overview
Brief description of the feature.

## Requirements
- REQ-001: [Requirement description]
- REQ-002: [Requirement description]

## Technical Design
### Architecture
[Design details]

### API Changes
[API specifications]

### Database Changes
[Schema changes]

## Acceptance Criteria
- AC-1: Given [precondition], When [action], Then [expected outcome]
- AC-2: Given [precondition], When [action], Then [expected outcome]

## Test Plan
- [ ] Unit tests for [component]
- [ ] Integration tests for [flow]

## Rollout Plan
[Deployment strategy]
```

## Usage | 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/sdd` | Interactive spec creation wizard | 交互式规格创建向导 |
| `/sdd discuss` | Start discuss phase for a feature | 启动功能讨论阶段 |
| `/sdd discuss auth-flow` | Discuss specific feature | 讨论特定功能 |
| `/sdd auth-flow` | Create spec for specific feature | 为特定功能创建规格 |
| `/sdd create auth-flow` | Explicit create phase | 明确指定创建阶段 |
| `/sdd review` | Review existing specs | 审查现有规格 |
| `/sdd review specs/SPEC-001.md` | Review specific spec | 审查指定规格 |
| `/sdd approve` | List specs pending approval | 列出待批准规格 |
| `/sdd approve specs/SPEC-001.md` | Approve specific spec | 批准指定规格 |
| `/sdd implement` | List approved specs | 列出已批准规格 |
| `/sdd implement specs/SPEC-001.md` | Track implementation for spec | 追踪指定规格的实现 |
| `/sdd verify` | List implemented specs | 列出已实现规格 |
| `/sdd verify specs/SPEC-001.md` | Verify implementation for spec | 验证指定规格的实现 |
| `/sdd --evaluate` | Run scope evaluation only | 仅执行范围评估 |
| `/sdd --sync-check` | Check sync status | 检查同步状态 |

## Typical SDD Workflow | 典型 SDD 工作流程

```bash
/sdd discuss user-authentication      # Phase 0.5: 讨论灰色地带
/sdd user-authentication              # Phase 1: 创建规格
/sdd review specs/SPEC-001.md         # Phase 2: 审查
/sdd approve specs/SPEC-001.md        # Phase 3: 批准
/derive-all specs/SPEC-001.md         # 生成测试结构
/sdd implement specs/SPEC-001.md      # Phase 4: 追踪实现
/sdd verify specs/SPEC-001.md         # Phase 5: 验证（最多 3 次迭代）
```

## Sync Checklist Template | 同步检查清单模板

Include in every spec:

```markdown
## Sync Checklist

### From Core Standard
- [ ] Skill created/updated?
- [ ] Command created?
- [ ] Translations synced?

### From Skill
- [ ] Core Standard exists? (or marked as [Scope: Utility])
- [ ] Command created?
- [ ] Translations synced?

### From Command
- [ ] Skill documentation updated?
- [ ] Translations synced?
```

## Reference | 参考

- Full standard: [spec-driven-dev](../spec-driven-dev/SKILL.md)
- Core standard: [spec-driven-development.md](../../core/spec-driven-development.md)
