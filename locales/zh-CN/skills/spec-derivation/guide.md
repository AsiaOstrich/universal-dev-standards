---
source: ../../../../skills/spec-derivation/guide.md
source_version: 2.0.0
translation_version: 2.0.0
last_synced: 2026-06-10
source_hash: 8c89e24244a5
status: current
scope: partial
description: |
  从已批准的 SDD 规格推演 BDD 场景与 TDD 测试骨架。
  ATDD 验收测试表是面向特定需求的可选输出。
  使用时机：规格已批准、开始 BDD/TDD 实现、生成测试结构。
  关键词：forward derivation, spec to test, BDD generation, TDD skeleton, test derivation, 正向推演, 规格转测试, 测试生成.
---

# 正向推演指南

> **语言**: [English](../../../../skills/spec-derivation/guide.md) | 简体中文

**版本**：2.0.0
**最后更新**：2026-01-25
**适用范围**：Claude Code Skills

> **核心标准**：本 skill 实现 [Forward Derivation Standards](../../core/forward-derivation-standards.md)。如需任何 AI 工具都可访问的完整方法论文档，请参阅核心标准。

---

## 目的

本 skill 引导你从已批准的 SDD 规格推演 BDD 场景与 TDD 测试骨架，并严格遵循防幻觉（Anti-Hallucination）标准。

> **注意**：ATDD 测试表是可选的，可通过 `/derive-atdd` 获取。BDD 场景本身即可作为可执行的验收测试，对大多数使用场景而言 ATDD 表是冗余的。

正向推演（Forward Derivation）是 [逆向工程](../reverse-engineer/SKILL.md) 的对称对应物：
- **逆向工程**：代码 → 规格
- **正向推演**：规格 → 测试

## 快速参考

### 正向推演工作流程

```
┌─────────────────────────────────────────────────────────────────┐
│              Forward Derivation Workflow                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1️⃣  SPEC Parsing (AI Automated)                               │
│      ├─ Read approved specification                             │
│      ├─ Extract Acceptance Criteria (GWT or bullet)             │
│      └─ Validate SPEC structure and completeness                │
│                                                                 │
│  2️⃣  Derivation (AI Automated)                                 │
│      ├─ AC → BDD Gherkin scenarios                             │
│      ├─ AC → TDD test skeletons with TODOs                     │
│      └─ (Optional) AC → ATDD acceptance test tables            │
│                                                                 │
│  3️⃣  Human Review (Required)                                   │
│      ├─ Verify generated scenarios match AC intent              │
│      ├─ Fill in [TODO] sections                                │
│      └─ Refine step definitions if needed                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 命令一览

| 命令 | 输入 | 输出 | 目的 |
|---------|-------|--------|---------|
| `/derive-bdd` | SPEC-XXX.md | .feature | AC → Gherkin 场景 |
| `/derive-tdd` | SPEC-XXX.md | .test.ts | AC → 测试骨架 |
| `/derive-all` | SPEC-XXX.md | .feature + .test.ts | 完整推演流水线 |
| `/derive-atdd` | SPEC-XXX.md | acceptance.md | AC → 验收测试表（可选） |

## 核心原则

### 1. 受规格约束的生成

**关键**：只推演规格中存在的内容。绝不添加任何超出验收条件（Acceptance Criteria）明确定义之外的场景、测试或功能。

```
# Anti-Hallucination Rule
Input:  SPEC with N Acceptance Criteria
Output: Exactly N scenarios (BDD)
        Exactly N test groups (TDD)
        Exactly N acceptance tests (ATDD, if requested)

If output count ≠ input count → VIOLATION
```

### 2. 来源标注

每个生成项都必须包含可追溯性（traceability）：

```gherkin
# Generated from: specs/SPEC-001.md
# AC: AC-1

@SPEC-001 @AC-1
Scenario: User login with valid credentials
```

### 3. 推演标签（来自统一标签系统）

本 skill 使用 **推演标签（Derivation Tags）** 从规格生成新内容。完整的标签参考见 [Anti-Hallucination Standards](../../core/anti-hallucination.md#certainty-classification-tags)。

| 标签 | 使用时机 | 示例 |
|-----|----------|---------|
| `[Source]` | 直接来自 SPEC 的内容 | 功能标题、AC 文本 |
| `[Derived]` | 由 SPEC 内容转换而来 | 从条目式 AC 转出的 GWT |
| `[Generated]` | AI 生成的结构 | 测试骨架 |
| `[TODO]` | 需要人工实现 | 断言、step 定义 |

## 工作流程阶段

### 阶段 1：SPEC 解析

**输入**：已批准的规格文件
**输出**：结构化的验收条件列表

**操作**：
1. 读取规格文件
2. 识别验收条件章节
3. 解析 AC 格式（Given-When-Then 或条目式）
4. 验证 AC 完整性

**验证清单**：
- [ ] SPEC 状态为「Approved」或「Ready」
- [ ] 存在验收条件章节
- [ ] 每个 AC 都有唯一标识符（AC-1、AC-2 等）
- [ ] AC 格式可解析（GWT 或条目式）

### 阶段 2：BDD 推演

**输入**：已解析的验收条件
**输出**：Gherkin .feature 文件

**转换规则**：

| AC 格式 | 转换方式 |
|-----------|----------------|
| Given-When-Then | 直接映射为 Gherkin |
| 条目式 | 使用 GWT 模式匹配进行转换 |
| 清单式 | 将条件 → Given，动作 → When，结果 → Then |

**示例**：
```markdown
# Input AC (Bullet)
- [ ] User can login with email and password
- [ ] Login shows error for invalid credentials
```

```gherkin
# Output BDD
@SPEC-001 @AC-1
Scenario: User login with email and password
  Given a user with valid credentials
  When the user submits login form
  Then the user is logged in successfully

@SPEC-001 @AC-2
Scenario: Login shows error for invalid credentials
  Given a user with invalid credentials
  When the user submits login form
  Then an error message is displayed
```

### 阶段 3：TDD 推演

**输入**：已解析的验收条件
**输出**：测试骨架文件

**操作**：
1. 为 SPEC 创建 describe 块
2. 为每个 AC 创建 describe 块
3. 生成带有描述性名称的 it 块
4. 添加带 TODO 注释的 AAA 结构
5. 包含占位断言

**参数**：
| 参数 | 选项 | 默认值 |
|-----------|---------|---------|
| `--lang` | typescript, javascript, python, java, go | typescript |
| `--framework` | vitest, jest, pytest, junit, go-test | vitest |

### 阶段 4：ATDD 推演（可选）

> **注意**：ATDD 测试表是可选的。BDD 场景本身即可作为可执行的验收测试。仅在以下情况使用 ATDD 表：
> - 需要手动测试工作流程
> - 利益相关者偏好表格形式的测试文档
> - 法规合规要求特定格式的测试证据

**输入**：已解析的验收条件
**输出**：验收测试表文档

**操作**：
1. 为每个 AC 创建测试表
2. 生成逐步操作列
3. 添加预期结果列
4. 包含通过/失败复选框
5. 添加测试员签核章节

### 阶段 5：人工审查

**输入**：已生成的文件
**输出**：经审查并优化后的文件

**审查清单**：
- [ ] 生成的场景与 AC 意图相符
- [ ] 没有超出 AC 数量的多余场景
- [ ] 来源标注正确
- [ ] 已识别出待实现的 [TODO] 章节
- [ ] step 语言为业务层级（而非技术性的）

## 输出格式

### BDD Feature 文件

```gherkin
# Generated from: specs/SPEC-001.md
# Generator: /derive-bdd v1.0.0
# Generated at: 2026-01-19T10:00:00Z

@SPEC-001
Feature: User Authentication
  [Source] From SPEC-001 Summary

  @AC-1 @happy-path
  Scenario: User login with valid credentials
    # [Source] From SPEC-001 AC-1
    Given a registered user with valid credentials
    When the user submits login form
    Then the user is redirected to dashboard

  @AC-2 @error-handling
  Scenario: Login fails with invalid credentials
    # [Source] From SPEC-001 AC-2
    Given a user with invalid credentials
    When the user submits login form
    Then an error message is displayed
```

### TDD 测试骨架

```typescript
/**
 * Tests for SPEC-001: User Authentication
 * Generated from: specs/SPEC-001.md
 * Generated at: 2026-01-19T10:00:00Z
 * AC Coverage: AC-1, AC-2
 */

describe('SPEC-001: User Authentication', () => {
  describe('AC-1: User login with valid credentials', () => {
    it('should redirect to dashboard on successful login', async () => {
      // Arrange
      // [TODO] Set up registered user with valid credentials

      // Act
      // [TODO] Submit login form

      // Assert
      // [TODO] Verify redirect to dashboard
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('AC-2: Login fails with invalid credentials', () => {
    it('should display error message', async () => {
      // Arrange
      // [TODO] Set up user with invalid credentials

      // Act
      // [TODO] Submit login form

      // Assert
      // [TODO] Verify error message is displayed
      expect(true).toBe(true); // Placeholder
    });
  });
});
```

### ATDD 验收测试表（可选）

> 当需要 ATDD 测试表时，通过 `/derive-atdd` 生成。

```markdown
# SPEC-001 Acceptance Tests

**Specification**: SPEC-001
**Generated**: 2026-01-19
**Status**: Pending

## AT-001: User login with valid credentials
**Source**: AC-1

| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 1 | Navigate to login page | Login form displayed | [ ] |
| 2 | Enter valid credentials | Fields accept input | [ ] |
| 3 | Click Login | Form submitted | [ ] |
| 4 | Verify redirect | Dashboard displayed | [ ] |

**Tester**: _______________
**Date**: _______________
**Result**: [ ] Pass / [ ] Fail
```

## 与其他 Skill 的集成

### 与 /sdd（规格驱动开发）

1. 使用 `/sdd` 工作流程完成 SPEC
2. 经审查使 SPEC 获批准
3. 运行 `/derive-all` 生成测试结构
4. 在 BDD/TDD 工作流程中使用生成的输出

### 与 /bdd（行为驱动开发）

1. 使用 `/derive-bdd` 生成 BDD 场景
2. 与利益相关者一起审查并优化场景
3. 使用 `/bdd` 继续进行 BDD 表述
4. 实现 step 定义

### 与 /tdd（测试驱动开发）

1. 使用 `/derive-tdd` 生成 TDD 骨架
2. 用实际断言填充 [TODO] 章节
3. 以生成的测试结构进入 TDD 红灯阶段
4. 实现代码使测试通过

### 与集成流程（Integrated Flow）

正向推演契合于集成流程（Integrated Flow）方法论：

```
spec-review (approved) → forward-derivation → discovery (BDD)
                              │
                              ├─→ .feature files for BDD
                              └─→ .test.ts skeletons for TDD

Optional: /derive-atdd → acceptance.md for manual testing
```

## 完整推演流水线

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Complete Forward Derivation Pipeline                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Approved SPEC                                                         │
│        │                                                                │
│        ▼                                                                │
│   /derive-all specs/SPEC-XXX.md                                        │
│        │                                                                │
│        ├─→ /derive-bdd                                                  │
│        │    └─→ features/SPEC-XXX.feature                              │
│        │                                                                │
│        └─→ /derive-tdd                                                  │
│             └─→ tests/SPEC-XXX.test.ts                                 │
│                                                                         │
│   Optional: /derive-atdd specs/SPEC-XXX.md                              │
│        └─→ acceptance/SPEC-XXX-acceptance.md                           │
│                                                                         │
│   Human Review                                                          │
│        │                                                                │
│        ├─→ Verify 1:1 AC mapping                                       │
│        ├─→ Fill [TODO] sections                                        │
│        └─→ Refine step definitions                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 使用示例

```bash
# Generate BDD scenarios
/derive-bdd specs/SPEC-001.md

# Generate TDD skeleton with Python/pytest
/derive-tdd specs/SPEC-001.md --lang python --framework pytest

# Generate all test structures
/derive-all specs/SPEC-001.md

# Preview without creating files
/derive-all specs/SPEC-001.md --dry-run

# Specify output directory
/derive-all specs/SPEC-001.md --output-dir ./generated
```

## 应避免的反模式

### ❌ 不要这样做

1. **添加多余场景**
   - 错误：SPEC 有 3 个 AC，却生成了 5 个场景
   - 正确：SPEC 有 3 个 AC，恰好生成 3 个场景

2. **从草稿 SPEC 推演**
   - 错误：对未批准的规格运行 `/derive-all`
   - 正确：只从已批准的规格推演

3. **跳过来源标注**
   - 错误：场景没有 @SPEC-XXX 标签
   - 正确：每个场景都标注来源 SPEC 与 AC

4. **过度指定技术细节**
   - 错误：`Given database connection is established using PostgreSQL driver`
   - 正确：`Given user data exists in the system`

5. **将骨架视为已完成**
   - 错误：未填充 [TODO] 就使用生成的测试
   - 正确：运行测试前填完所有 [TODO] 章节

## 最佳实践

### 应该做的

- ✅ 只从已批准的规格推演
- ✅ 保持严格的 AC 与输出 1:1 映射
- ✅ 在所有输出中包含来源标注
- ✅ 为实现章节使用 [TODO] 标记
- ✅ 与利益相关者一起审查生成的输出
- ✅ 将 step 语言保持在业务层级

### 不应该做的

- ❌ 添加超出 AC 定义的场景
- ❌ 从草稿或未批准的规格推演
- ❌ 跳过对生成输出的人工审查
- ❌ 将生成的骨架视为完整的测试
- ❌ 移除来源标注注释
- ❌ 过度指定实现细节

---

## 配置检测

本 skill 会自动检测项目配置：

1. 检查现有的 `specs/` 目录结构
2. 从 package.json/pyproject.toml 检测测试框架
3. 识别首选的输出目录
4. 配置特定语言的模板

---

## 相关标准

- [Forward Derivation Standards](../../core/forward-derivation-standards.md) - **核心方法论标准（主要参考）**
- [Reverse Engineering Standards](../../core/reverse-engineering-standards.md) - 对称对应物
- [Spec-Driven Development](../../core/spec-driven-development.md) - 输入规格格式
- [Behavior-Driven Development](../../core/behavior-driven-development.md) - BDD 输出格式
- [Test-Driven Development](../../core/test-driven-development.md) - TDD 输出用法
- [Anti-Hallucination Guidelines](../../core/anti-hallucination.md) - 生成合规

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 2.0.0 | 2026-01-25 | ATDD 从必需输出改为可选输出；/derive-all 现仅输出 BDD + TDD |
| 1.1.0 | 2026-01-25 | 新增：对统一标签系统的引用 |
| 1.0.0 | 2026-01-19 | 初始发布 |

---

## 许可

本 skill 以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
