---
name: ac-coverage
source: ../../../../skills/ac-coverage/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-02
source_hash: f8358fa818e4
scope: universal
status: current
description: "[UDS] 分析验收条件（AC）与测试之间的追踪关系并生成覆盖率报告"
allowed-tools: Read, Grep, Glob
argument-hint: "[规格文件路径]"
---

# AC 覆盖率助手

> **语言**: [English](../../../../skills/ac-coverage/SKILL.md) | 简体中文

分析验收条件（AC）与测试之间的追踪关系，并生成覆盖率报告。

## 与 `/coverage` 的区别

| 方面 | `/coverage` | `/ac-coverage` |
|------|-------------|----------------|
| **范围** | 代码层级（行数／分支／函数） | 需求层级（AC 对应测试） |
| **输入** | 源代码 + 测试运行器 | SPEC 文件 + 测试标注 |
| **问题** | 「代码测试了多少？」 | 「哪些 AC 有测试？」 |
| **输出** | 覆盖率百分比 | 追踪矩阵 + 缺口报告 |

## 工作流程

1. **解析 SPEC** — 从规格文件中抽取 AC 定义（AC-1, AC-2, ...）
2. **扫描测试** — 依标准链接约定搜索测试文件中的 `@AC` 与 `@SPEC` 标注
3. **构建矩阵** — 将每个 AC 对应到其测试引用（文件、测试名称、行号）
4. **分类状态** — 将每个 AC 标记为 ✅ 已覆盖、⚠️ 部分覆盖、或 ❌ 未覆盖
5. **计算覆盖率** — 套用公式：`覆盖率 % = (已覆盖 + 部分覆盖 × 0.5) / 总数 × 100`
6. **生成报告** — 输出标准化的 Markdown 报告

## 链接标注约定

测试**必须**使用 **canonical 合并标注** `@SPEC-<id> @AC-<n>`（单一合并标签、保持同一行；**勿**拆成 `@AC` / `@SPEC` 两行）引用其来源 AC：

```typescript
// TypeScript/JavaScript
describe('AC-1: User login with valid credentials', () => {
  // @SPEC-001 @AC-1
  it('should redirect to dashboard on successful login', () => { ... });
});
```

```python
# Python
class TestAC1_UserLogin:
    """AC-1: User login with valid credentials
    @SPEC-001 @AC-1
    """
    def test_redirect_to_dashboard(self): ...
```

```gherkin
# BDD Feature
@SPEC-001 @AC-1
Scenario: User login with valid credentials
```

## 覆盖率门槛

| 门槛 | 默认值 | 强制等级 |
|------|--------|----------|
| **签入（Check-in）** | 80% | feature branch 合并必要条件 |
| **发布（Release）** | 100% | 生产环境发布必要条件 |
| **警告（Warning）** | 60% | 触发覆盖率警告 |

门槛可通过 `--threshold` 参数或项目配置文件调整。

## 四层追溯（`--full` 模式）

使用 `--full` 标记将追溯从 2 层（AC→Test）扩展为 4 层。

### 追溯层次

```
Layer 0：需求 / 用户故事 (REQ)
    ↓ （定义）
Layer 1：验收条件 (AC)
    ↓ （@SPEC-NNN @AC-N 标注）
Layer 2：测试用例
    ↓ （覆盖）
Layer 3：源代码 (@implements)
```

### 各层标注约定

```typescript
// Layer 3→1：代码引用 AC
// @implements AC-1, AC-2
function authenticate(user: string, pass: string) { ... }
```

```markdown
<!-- Layer 0→1：SPEC 中的需求 -->
## Requirements
### REQ-1：用户验证
- AC-1: 给定有效凭证，当登录时，则验证通过
- AC-2: 给定无效凭证，当登录时，则被拒绝
```

### 完整追溯报告

```markdown
## 四层追溯矩阵

| 需求 | AC | 测试 | 代码 | 状态 |
|------|-----|------|------|------|
| REQ-1 | AC-1 | auth.test.ts:15 | auth.ts:42 | ✅ 完整 |
| REQ-1 | AC-2 | auth.test.ts:30 | auth.ts:58 | ✅ 完整 |
| REQ-2 | AC-3 | — | dashboard.ts:10 | ⚠️ 缺测试 |
| REQ-3 | AC-4 | export.test.ts:5 | — | ⚠️ 缺代码 |

### 缺口摘要
- Layer 0→1: 2 个需求未对应 AC
- Layer 1→2: 1 个 AC 未对应测试
- Layer 2→3: 0 个测试未对应代码
- Layer 3→1: 3 个代码文件未对应 AC
```

### 反向追溯

使用 `--trace-code <path>` 从代码反向追溯到需求。

```bash
/ac-coverage --trace-code src/auth.ts
# 输出：
# src/auth.ts:42 → @implements AC-1 → REQ-1 (SPEC-AUTH-001)
# src/auth.ts:58 → @implements AC-2 → REQ-1 (SPEC-AUTH-001)
```

## 报告格式

生成的报告遵循 `core/acceptance-criteria-traceability.md` 的标准格式：

```markdown
# AC 覆盖率报告

**规格**: SPEC-001 — 功能名称
**生成时间**: 2026-03-18
**覆盖率**: 75% (6/8 AC)

## 摘要

| 状态 | 数量 | 百分比 |
|------|------|--------|
| ✅ 已覆盖 | 5 | 62.5% |
| ⚠️ 部分覆盖 | 2 | 25.0% |
| ❌ 未覆盖 | 1 | 12.5% |

## 追溯矩阵

| AC-ID | 描述 | 状态 | 测试引用 |
|-------|------|------|----------|
| AC-1 | 以有效凭证登录 | ✅ | auth.test.ts:15 |
| AC-2 | 拒绝无效凭证 | ✅ | auth.test.ts:32 |
| ...   | ...           | ... | ... |

## 缺口
- **AC-8**: 社交登录 — 因 OAuth sandbox 未就绪受阻

## 行动项目
1. [ ] AC-8：搭建 OAuth sandbox（预计时间：待定）
```

## 下一步引导

`/ac-coverage` 完成后，AI 助手应建议：

> **AC 覆盖率分析完成。建议下一步：**
> - 覆盖率达标 → 执行 `/checkin` 质量关卡
> - 有未覆盖 AC → 执行 `/derive-tdd` 补齐测试 ⭐ **推荐**
> - 有部分覆盖 AC → 检查缺少的边界情况
> - 需要完整追溯 → 执行 `/ac-coverage --full`
> - 反向追溯 → 执行 `/ac-coverage --trace-code <path>`

## 参考

- 核心标准：[acceptance-criteria-traceability.md](../../../../core/acceptance-criteria-traceability.md)
- SPEC：[SPEC-AC-COVERAGE.md](../../../../docs/specs/skills/SPEC-AC-COVERAGE.md)
- 相关：[test-coverage-assistant](../test-coverage-assistant/SKILL.md)（代码层级覆盖率）
- 相关：[checkin-assistant](../checkin-assistant/SKILL.md)（质量关卡）

## AI 代理行为

> 完整的 AI 行为定义请参阅对应的命令文件：[`/ac-coverage`](../../../../skills/commands/ac-coverage.md#ai-agent-behavior--ai-代理行为)
