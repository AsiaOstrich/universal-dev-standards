---
source: ../../../core/acceptance-criteria-traceability.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-23
status: current
---

# 验收标准可追溯性规范

> **语言**: [English](../../../core/acceptance-criteria-traceability.md) | 简体中文

**适用范围**: 所有使用规格驱动或测试驱动工作流程的软件项目
**Scope**: universal

---

## 概述

验收标准可追溯性规范定义了如何追踪验收标准（AC）、测试实现与覆盖状态之间的关系。本规范确保每个 AC 都可被验证测试，并提供标准化的覆盖率分析报告格式。

## 参考资料

| 标准 / 来源 | 内容 |
|------------|------|
| ISO/IEC/IEEE 29119-3 | 测试文档 — 可追溯性矩阵 |
| IEEE 830 | 软件需求规格 — 可追溯性 |
| ISTQB Foundation | 基于需求的测试 |
| INVEST 原则 | 验收标准品质 |

---

## AC 对测试的可追溯性矩阵

### 标准矩阵格式

| AC-ID | 测试文件 | 测试名称 | 状态 | 备注 |
|-------|---------|---------|------|------|
| AC-1 | `tests/auth.test.ts` | `should login with valid credentials` | ✅ 已覆盖 | |
| AC-2 | `tests/auth.test.ts` | `should reject invalid credentials` | ✅ 已覆盖 | |
| AC-3 | — | — | ❌ 未覆盖 | 被 API 依赖性阻挡 |
| AC-4 | `tests/auth.test.ts` | `should lock account after 5 failures` | ⚠️ 部分覆盖 | 缺少边界情况 |

### 矩阵字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `AC-ID` | 是 | 规格中的唯一标识码（例如 AC-1、AC-2） |
| `Test File` | 是（若已覆盖） | 实现此 AC 的测试文件路径 |
| `Test Name` | 是（若已覆盖） | 测试用例或 describe 区块的名称 |
| `Status` | 是 | 覆盖状态：`covered`、`partial`、`uncovered` |
| `Notes` | 否 | 补充信息（阻挡因素、依赖性等） |

### 连结惯例

测试 **必须** 使用标准注释引用其来源 AC：

```typescript
// TypeScript/JavaScript
describe('AC-1: User login with valid credentials', () => {
  // @AC AC-1
  // @SPEC SPEC-001
  it('should redirect to dashboard on successful login', () => { ... });
});
```

```python
# Python
class TestAC1_UserLogin:
    """AC-1: User login with valid credentials
    @AC AC-1
    @SPEC SPEC-001
    """
    def test_redirect_to_dashboard(self): ...
```

```gherkin
# BDD Feature
@SPEC-001 @AC-1
Scenario: User login with valid credentials
```

---

## 覆盖状态定义

### 状态分类

| 状态 | 符号 | 定义 | 判断标准 |
|------|------|------|---------|
| **已覆盖** | ✅ | AC 已完整测试 | AC 中所有条件都有对应的测试断言 |
| **部分覆盖** | ⚠️ | AC 已部分测试 | 部分条件已测试，但缺少边界情况或执行路径 |
| **未覆盖** | ❌ | AC 没有测试 | 没有任何测试用例引用此 AC |

### 覆盖率计算

```
AC Coverage % = (covered_count / total_ac_count) × 100

Where:
  covered_count = count of AC with status "covered"
  total_ac_count = total number of AC in specification
  partial counts as 0.5 for coverage calculation
```

### 计算范例

```
SPEC-001: 8 AC total
  - 5 covered (✅)
  - 2 partial (⚠️)
  - 1 uncovered (❌)

Coverage = (5 + 2×0.5) / 8 = 6/8 = 75%
```

---

## 品质门槛

### 默认门槛

| 门槛 | 数值 | 强制执行 |
|------|------|---------|
| **最低 AC 覆盖率** | 100% | 正式发布前必须达到 |
| **签入最低要求** | 80% | 功能分支合并前必须达到 |
| **警告级别** | 60% | 触发覆盖率警告 |

### 可配置门槛

项目 **可以** 在配置文件中自定义门槛：

```json
{
  "acCoverage": {
    "minimum": 100,
    "checkinMinimum": 80,
    "warningLevel": 60,
    "partialWeight": 0.5
  }
}
```

### 门槛例外

覆盖率要求的例外情况 **必须** 记录在案：

| 例外类型 | 允许时机 | 必要文件 |
|---------|---------|---------|
| 外部依赖性阻挡 | 第三方 API 无法使用 | Issue 连结 + 时程 |
| 基础设施限制 | 测试环境限制 | 解决方案计划 |
| 延后至下一迭代 | 已与利害关系人确认 | Ticket 引用 |

---

## AC 覆盖率报告格式

### 标准报告结构

```markdown
# AC Coverage Report

**Specification**: SPEC-001 — User Authentication
**Generated**: 2026-03-23
**Coverage**: 75% (6/8 AC)

## Summary

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Covered | 5 | 62.5% |
| ⚠️ Partial | 2 | 25.0% |
| ❌ Uncovered | 1 | 12.5% |

## Traceability Matrix

| AC-ID | Description | Status | Test Reference |
|-------|-------------|--------|----------------|
| AC-1 | Login with valid credentials | ✅ | auth.test.ts:15 |
| AC-2 | Reject invalid credentials | ✅ | auth.test.ts:32 |
| AC-3 | Rate limit login attempts | ⚠️ | auth.test.ts:48 (missing edge case) |
| ...   | ...                        | ... | ... |

## Gaps

### Uncovered AC
- **AC-8**: Social login integration — Blocked by OAuth provider sandbox

### Partial AC
- **AC-3**: Rate limit — Missing test for concurrent requests
- **AC-6**: Session timeout — Missing test for background tab behavior

## Action Items
1. [ ] AC-8: Set up OAuth sandbox environment (ETA: 2026-03-25)
2. [ ] AC-3: Add concurrent request test
3. [ ] AC-6: Add background tab test
```

### 机器可读格式

```json
{
  "specId": "SPEC-001",
  "specName": "User Authentication",
  "generatedAt": "2026-03-23T10:00:00Z",
  "coverage": {
    "percentage": 75,
    "covered": 5,
    "partial": 2,
    "uncovered": 1,
    "total": 8
  },
  "matrix": [
    {
      "acId": "AC-1",
      "description": "Login with valid credentials",
      "status": "covered",
      "testFile": "tests/auth.test.ts",
      "testName": "should login with valid credentials",
      "testLine": 15
    }
  ]
}
```

---

## 自动规格生成品质规则

### AC 品质要求

当从 PRD、用户故事或需求自动生成规格时，所生成的 AC **必须** 符合以下品质标准：

| 标准 | 说明 | 验证方式 |
|------|------|---------|
| **具体（Specific）** | AC 描述具体、可观察的行为 | 不使用模糊用语（「应该运作正常」、「够快」） |
| **可衡量（Measurable）** | AC 有可量化或可验证的结果 | 包含预期数值、状态或行为 |
| **可达成（Achievable）** | AC 在技术上可行 | 引用已知的 API、数据或能力 |
| **相关（Relevant）** | AC 与功能目的相关 | 对应用户需求或业务需求 |
| **可测试（Testable）** | AC 可通过测试验证 | 可以用 Given-When-Then 表达 |

### 规格生成 I/O 契约

#### 输入格式

| 输入类型 | 必要字段 | 范例 |
|---------|---------|------|
| PRD | 标题、说明、用户故事 | 产品需求文档 |
| 用户故事 | As a / I want / So that | 「As a user, I want to login...」 |
| 功能简报 | 功能名称、目标、限制 | 功能说明文档 |

#### 输出格式

生成的规格 **必须** 包含：

| 区段 | 必填 | 说明 |
|------|------|------|
| SPEC ID | 是 | 唯一标识码（例如 SPEC-001） |
| 标题 | 是 | 功能名称 |
| 说明 | 是 | 功能描述 |
| 验收标准 | 是 | 编号 AC 清单（AC-1、AC-2、…） |
| AC 格式 | 是 | Given-When-Then 或结构化条列 |
| 可测试性标记 | 是 | 每个 AC 标记为可测试 / 不可测试 |

#### 验证规则

1. **AC 数量**：生成的规格 **必须** 至少有 1 个 AC
2. **AC 唯一性**：不可有重复的 AC 描述
3. **AC 完整性**：正常路径 + 至少 1 个错误或边界情况
4. **AC 可测试性**：100% 的 AC 必须可测试
5. **可追溯性**：每个 AC 都连结回来源需求

---

## 反模式

| 反模式 | 影响 | 正确做法 |
|-------|------|---------|
| 测试无法追溯 | 无法验证规格覆盖率 | 测试中一律标注 AC-ID |
| 将部分覆盖视为完整覆盖 | 对覆盖率产生错误信心 | 使用诚实的状态分类 |
| 忽略未覆盖的 AC | 验证存在缺口 | 追踪并规划所有 AC 的覆盖工作 |
| AC 缺乏可测试性 | 无法验证 | 确保所有 AC 都可测试 |
| 覆盖但缺乏断言 | 测试执行但不验证任何内容 | 确认测试含有有意义的断言 |

---

## 相关规范

- [正向推演规范](forward-derivation-standards.md) — 从 AC 生成测试
- [规格驱动开发](spec-driven-development.md) — AC 定义格式
- [测试规范](testing-standards.md) — 测试实现规范
- [签入规范](checkin-standards.md) — 签入的覆盖率门槛
- [测试治理](test-governance.md) — 完成标准

---

## 版本历程

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| 1.0.0 | 2026-03-18 | 初始版本 — 可追溯性矩阵、覆盖率计算、规格生成规则 |
