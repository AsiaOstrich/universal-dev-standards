---
source: ../../../../skills/ac-coverage-assistant/SKILL.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-03-26
status: current
description: |
  分析验收条件（AC）与测试之间的追踪关系，产生覆盖率报告。
  使用时机：验证 AC 覆盖率、检查测试追踪性、发布前审查。
  关键字：AC, acceptance-criteria, coverage, traceability, 验收条件, 覆盖率。
---

# AC 覆盖率助手

> **语言**: [English](../../../../skills/ac-coverage-assistant/SKILL.md) | 简体中文

分析验收条件（AC）与测试之间的追踪关系，并产生覆盖率报告。

## 与 `/coverage` 的区别

| 方面 | `/coverage` | `/ac-coverage` |
|------|-------------|----------------|
| **范围** | 代码级别（行/分支/函数） | 需求级别（AC 到测试） |
| **输入** | 源代码 + 测试运行器 | SPEC 文件 + 测试标注 |
| **问题** | "多少代码被测试了？" | "哪些 AC 有测试？" |
| **输出** | 覆盖率百分比 | 追踪矩阵 + 差距报告 |

## 工作流程

1. **解析 SPEC** — 从规格文件中提取 AC 定义（AC-1、AC-2……）
2. **扫描测试** — 使用标准链接惯例搜索测试文件中的 `@AC` 和 `@SPEC` 标注
3. **构建矩阵** — 将每个 AC 映射到其测试引用（文件、测试名称、行号）
4. **分类状态** — 将每个 AC 标记为 ✅ 已覆盖、⚠️ 部分覆盖 或 ❌ 未覆盖
5. **计算覆盖率** — 套用公式：`覆盖率 % = (已覆盖 + 部分覆盖 × 0.5) / 总计 × 100`
6. **产生报告** — 输出标准化 Markdown 报告

## 标注惯例

测试必须使用标准标注引用其来源 AC：

```typescript
// TypeScript/JavaScript
describe('AC-1: 使用有效凭证登录', () => {
  // @AC AC-1
  // @SPEC SPEC-001
  it('should redirect to dashboard on successful login', () => { ... });
});
```

```python
# Python
class TestAC1_UserLogin:
    """AC-1: 使用有效凭证登录
    @AC AC-1
    @SPEC SPEC-001
    """
    def test_redirect_to_dashboard(self): ...
```

```gherkin
# BDD Feature
@SPEC-001 @AC-1
Scenario: 使用有效凭证登录
```

## 覆盖率门槛

| 门槛 | 默认值 | 执行时机 |
|------|--------|---------|
| **提交** | 80% | 功能分支合并时必须达标 |
| **发布** | 100% | 生产环境发布时必须达标 |
| **警告** | 60% | 触发覆盖率警告 |

门槛可通过 `--threshold` 参数或项目配置自定义。

## 四层追溯（`--full` 模式）

使用 `--full` 标记将追溯从 2 层（AC→Test）扩展为 4 层。

### 追溯层次

```
第 0 层：需求 / 用户故事（REQ）
    ↓ (定义)
第 1 层：验收条件（AC）
    ↓ (@AC 标注)
第 2 层：测试用例
    ↓ (覆盖)
第 3 层：源代码（@implements）
```

### 各层标注惯例

```typescript
// 第 3→1 层：代码引用 AC
// @implements AC-1, AC-2
function authenticate(user: string, pass: string) { ... }
```

```markdown
<!-- 第 0→1 层：SPEC 中的需求 -->
## 需求
### REQ-1: 用户认证
- AC-1: 给定有效凭证，当登录时，则通过认证
- AC-2: 给定无效凭证，当登录时，则拒绝登录
```

### 完整追溯报告

```markdown
## 四层追溯矩阵

| 需求 | AC | 测试 | 代码 | 状态 |
|------|-----|------|------|------|
| REQ-1 | AC-1 | auth.test.ts:15 | auth.ts:42 | ✅ 完整 |
| REQ-1 | AC-2 | auth.test.ts:30 | auth.ts:58 | ✅ 完整 |
| REQ-2 | AC-3 | — | dashboard.ts:10 | ⚠️ 无测试 |
| REQ-3 | AC-4 | export.test.ts:5 | — | ⚠️ 无代码 |

### 差距摘要
- 第 0→1 层：2 个需求缺少 AC
- 第 1→2 层：1 个 AC 缺少测试
- 第 2→3 层：0 个测试缺少代码映射
- 第 3→1 层：3 个代码文件缺少 AC 映射
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

产生的报告遵循 `core/acceptance-criteria-traceability.md` 的标准格式：

```markdown
# AC 覆盖率报告

**规格**: SPEC-001 — 功能名称
**产生日期**: 2026-03-26
**覆盖率**: 75% (6/8 AC)

## 摘要

| 状态 | 数量 | 百分比 |
|------|------|--------|
| ✅ 已覆盖 | 5 | 62.5% |
| ⚠️ 部分覆盖 | 2 | 25.0% |
| ❌ 未覆盖 | 1 | 12.5% |

## 追踪矩阵

| AC-ID | 描述 | 状态 | 测试引用 |
|-------|------|------|---------|
| AC-1 | 使用有效凭证登录 | ✅ | auth.test.ts:15 |
| AC-2 | 拒绝无效凭证 | ✅ | auth.test.ts:32 |
| ...   | ...              | ... | ... |

## 差距

- **AC-8**: 社交登录 — 被 OAuth 沙箱阻塞

## 行动项目

1. [ ] AC-8: 建立 OAuth 沙箱（预计完成时间：待定）
```

## 下一步引导

`/ac-coverage` 完成后，AI 助手应建议：

> **AC 覆盖率分析完成。建议下一步：**
> - 覆盖率达标 → 执行 `/checkin` 品质关卡
> - 有未覆盖 AC → 执行 `/derive-tdd` 补齐测试 ⭐ **推荐**
> - 有部分覆盖 AC → 检查缺少的边界情况
> - 需要完整追溯 → 执行 `/ac-coverage --full`
> - 反向追溯 → 执行 `/ac-coverage --trace-code <path>`

## 参考

- 核心规范：[acceptance-criteria-traceability.md](../../../../core/acceptance-criteria-traceability.md)
- SPEC：[SPEC-AC-COVERAGE.md](../../../../docs/specs/skills/SPEC-AC-COVERAGE.md)
- 相关：[test-coverage-assistant](../test-coverage-assistant/SKILL.md)（代码级别覆盖率）
- 相关：[checkin-assistant](../checkin-assistant/SKILL.md)（品质关卡）
