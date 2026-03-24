---
source: ../../../core/forward-derivation-standards.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-03-23
status: current
---

# 正向推演标准 | Forward Derivation Standards

**版本**: 1.2.0
**最后更新**: 2026-03-18
**适用范围**: 所有使用规格驱动开发的项目

> **语言**: [English](../../../core/forward-derivation-standards.md) | 简体中文

---

## 目的

本规范定义正向推演的原则和工作流程——从已批准的 SDD 规格自动生成 BDD 场景、TDD 测试骨架和 ATDD 验收测试。正向推演与[反向工程标准](reverse-engineering-standards.md)互补，形成对称的推演系统。

**主要优点**：
- 一致的测试结构与规格对齐
- 从需求到测试的可追溯性（@SPEC-XXX、@AC-N 标签）
- 从已批准规格更快启动 TDD
- 减少手动转换错误

---

## 正向推演工作流程

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          正向推演工作流程                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌───────────┐  │
│  │ 解析 SPEC   │───▶│ 提取 AC     │───▶│ 生成 BDD   │───▶│ 生成      │  │
│  │             │    │             │    │             │    │ TDD/ATDD  │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └───────────┘  │
│        │                  │                  │                  │        │
│        │                  │                  │                  ▼        │
│        │                  │                  │         ┌───────────────┐ │
│        │                  │                  │         │   人类审查     │ │
│        │                  │                  │         └───────────────┘ │
│        │                  │                  │                  │        │
│        ▼                  ▼                  ▼                  ▼        │
│   [来源]            [已解析]           [已生成]          [已审查]        │
│   SPEC-XXX.md       AC 列表           .feature/.test    可使用          │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 工作流程阶段

| 阶段 | 描述 | 输出 | 确定性等级 |
|------|------|------|-----------|
| **解析 SPEC** | 读取已批准的规格文档 | SPEC 元数据、区块 | [来源] |
| **提取 AC** | 解析验收条件（GWT 或条列） | 结构化 AC 列表 | [推演] |
| **生成 BDD** | 将 AC 转换为 Gherkin 场景 | .feature 文件 | [生成] |
| **生成 TDD** | 从 AC 创建测试骨架 | 带 TODO 的测试文件 | [生成] |
| **生成 ATDD** | 创建验收测试表格 | Markdown 测试表格 | [生成] |
| **人类审查** | 验证生成的输出 | 批准的测试结构 | [已审查] |

---

## 核心原则

### 1. 规格限定生成

**规则**：只推演规格中存在的内容。不添加 AC 未明确定义的功能、场景或测试。

**正确示范**：
```markdown
# SPEC AC
- [ ] 用户可以使用电子邮件和密码登录

# 生成的 BDD（正确）
Scenario: 用户以电子邮件和密码登录
```

**错误示范**：
```markdown
# 生成的 BDD（错误 - 超出规格范围）
Scenario: 用户以电子邮件和密码登录
Scenario: 用户以社交账号登录  # <-- 不在 AC 中
Scenario: 用户密码恢复       # <-- 不在 AC 中
```

### 2. 反幻觉合规

**规则**：本规范严格遵循[反幻觉标准](anti-hallucination.md)：

- **1:1 对应**：每个 AC 产生恰好一个场景/测试群组
- **禁止捏造**：不发明验收条件或测试用例
- **来源标注**：所有生成项目标注来源 SPEC 和 AC 编号

**反幻觉检查**：
```
输入：SPEC 有 N 个验收条件
输出：恰好 N 个场景（BDD）、N 个测试群组（TDD）、N 个验收表格（ATDD）

若输出数量 ≠ 输入数量 → 违规
```

### 3. 来源标注

**规则**：每个生成项目必须包含可追溯性：

```gherkin
# BDD 范例
# Generated from: specs/SPEC-001.md
# AC: AC-1

@SPEC-001 @AC-1
Scenario: 用户以有效凭证登录
```

```typescript
// TDD 范例
/**
 * Generated from: specs/SPEC-001.md
 * AC: AC-1
 */
describe('AC-1: 用户以有效凭证登录', () => {
```

### 4. 确定性标签

使用这些标签标示推演确定性：

| 标签 | 定义 | 范例 |
|------|------|------|
| `[来源]` | 直接来自 SPEC 的内容 | 功能标题、AC 文字 |
| `[推演]` | 从 SPEC 内容转换 | 从条列 AC 推演的 GWT |
| `[生成]` | AI 生成的结构 | 测试骨架、TODO 注释 |
| `[TODO]` | 需要人类实现 | 测试断言、步骤定义 |

---

## 输入格式要求

### 支持的 AC 格式

#### 格式 1：Given-When-Then（推荐）

```markdown
### AC-1: 用户登录
**Given** 已注册的用户有有效凭证
**When** 用户提交含电子邮件和密码的登录表单
**Then** 用户被导向仪表板
**And** 创建会话令牌
```

#### 格式 2：条列式

```markdown
### AC-1: 用户登录
- 用户可以使用电子邮件和密码登录
- 登录成功导向仪表板
- 无效凭证显示错误消息
```

#### 格式 3：勾选清单

```markdown
## 验收条件
- [ ] 用户可以使用电子邮件和密码登录
- [ ] 登录成功时创建会话
- [ ] 无效凭证时显示错误消息
```

---

## 输出格式

### BDD 输出（.feature）

```gherkin
# Generated from: specs/SPEC-001.md
# Generator: forward-derivation v1.0.0
# Generated at: 2026-01-19T10:00:00Z

@SPEC-001
Feature: 用户认证
  作为用户
  我想要登录系统
  以便访问我的仪表板

  @AC-1 @happy-path
  Scenario: 用户以有效凭证登录
    # [来源] 来自 SPEC-001 AC-1
    Given 已注册的用户有有效凭证
    When 用户提交登录表单
    Then 用户被导向仪表板

  @AC-2 @error-handling
  Scenario: 无效凭证登录失败
    # [来源] 来自 SPEC-001 AC-2
    Given 用户有无效凭证
    When 用户提交登录表单
    Then 显示错误消息
```

### TDD 输出（.test.ts）

```typescript
/**
 * Tests for SPEC-001: 用户认证
 * Generated from: specs/SPEC-001.md
 * Generated at: 2026-01-19T10:00:00Z
 * AC Coverage: AC-1, AC-2
 *
 * [生成] 此文件包含测试骨架。
 * [TODO] 实现测试逻辑和断言。
 */

describe('SPEC-001: 用户认证', () => {
  /**
   * AC-1: 用户以有效凭证登录
   * [来源] specs/SPEC-001.md#AC-1
   */
  describe('AC-1: 用户以有效凭证登录', () => {
    it('should redirect to dashboard on successful login', async () => {
      // Arrange
      // [TODO] 设定已注册用户和有效凭证

      // Act
      // [TODO] 提交登录表单

      // Assert
      // [TODO] 验证导向仪表板
      expect(true).toBe(true); // Placeholder
    });
  });
});
```

### ATDD 输出（acceptance.md）

```markdown
# SPEC-001 验收测试

**规格**: [SPEC-001](../specs/SPEC-001.md)
**生成时间**: 2026-01-19
**状态**: 待审查

---

## AT-001: 用户以有效凭证登录

**来源**: SPEC-001 的 AC-1

| 步骤 | 动作 | 预期结果 | 通过/失败 |
|------|------|----------|-----------|
| 1 | 导航到登录页面 | 显示登录表单 | [ ] |
| 2 | 输入有效电子邮件 | 字段接受输入 | [ ] |
| 3 | 输入有效密码 | 字段接受输入（遮蔽） | [ ] |
| 4 | 点击「登录」按钮 | 表单已提交 | [ ] |
| 5 | 验证导向 | 用户在仪表板页面 | [ ] |

**前置条件**: 系统中存在用户账号

**测试人员**: _______________
**日期**: _______________
**结果**: [ ] 通过 / [ ] 失败
```

---

## 条列式转 GWT 转换

当 AC 以条列点撰写时，使用此模式转换：

### 转换规则

| 条列模式 | 对应到 | 范例 |
|----------|--------|------|
| 条件/状态 | Given | 「用户已登录」→ Given 用户已登录 |
| 用户动作 | When | 「用户点击按钮」→ When 用户点击按钮 |
| 系统响应 | Then | 「显示消息」→ Then 显示消息 |
| 「可以/应该/必须」 | When + Then | 「用户可以删除项目」→ When 用户删除项目 Then 项目已移除 |

---

## 与开发方法论的整合

### 正向推演管道

```
┌───────────────────────────────────────────────────────────────────────┐
│                        对称推演系统                                     │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  反向工程                                 正向推演                      │
│  (代码 → 规格)                          (规格 → 测试)                 │
│                                                                       │
│  ┌───────────────┐                      ┌───────────────┐            │
│  │ 现有代码       │                      │ 已批准 SPEC   │            │
│  └───────┬───────┘                      └───────┬───────┘            │
│          │                                      │                     │
│          ▼                                      ▼                     │
│  ┌───────────────┐                      ┌───────────────┐            │
│  │ /reverse-spec │                      │  /derive-bdd  │            │
│  │ /reverse-bdd  │◀─────SPEC-XXX───────▶│  /derive-tdd  │            │
│  │ /reverse-tdd  │                      │  /derive-atdd │            │
│  └───────┬───────┘                      └───────┬───────┘            │
│          │                                      │                     │
│          ▼                                      ▼                     │
│  ┌───────────────┐                      ┌───────────────┐            │
│  │ 初稿 SPEC     │                      │ .feature      │            │
│  │ [已确认]      │                      │ .test.ts      │            │
│  │ [推断]        │                      │ acceptance.md │            │
│  │ [未知]        │                      │ [生成]        │            │
│  └───────────────┘                      └───────────────┘            │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### 与整合流程方法论

正向推演位于 `spec-review` 和 `discovery` 阶段之间：

```yaml
spec-review → forward-derivation → discovery
```

1. **规格审查 (SDD)**：规格已批准
2. **正向推演**：自动生成 BDD 场景、TDD 骨架
3. **探索 (BDD)**：与利害关系人审查和精炼生成的场景
4. **TDD 红灯**：使用生成的骨架开始实现测试

---

## 命令

### 命令参考

| 命令 | 输入 | 输出 | 目的 |
|------|------|------|------|
| `/derive-bdd` | SPEC-XXX.md | .feature | AC → Gherkin 场景 |
| `/derive-tdd` | SPEC-XXX.md | .test.ts | AC → 测试骨架 |
| `/derive-atdd` | SPEC-XXX.md | acceptance.md | AC → 验收测试表格 |
| `/derive-all` | SPEC-XXX.md | 以上全部 | 完整推演管道 |

### 命令参数

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--lang` | string | typescript | 目标语言: ts, js, python, java, go |
| `--framework` | string | vitest | 框架: vitest, jest, pytest, junit, go-test |
| `--output-dir` | string | ./generated | 输出目录 |
| `--dry-run` | boolean | false | 预览不创建文件 |

### 使用范例

```bash
# 从规格生成 BDD 场景
/derive-bdd specs/SPEC-001.md

# 使用 Python/pytest 生成 TDD 测试骨架
/derive-tdd specs/SPEC-001.md --lang python --framework pytest

# 生成所有输出
/derive-all specs/SPEC-001.md --output-dir ./generated

# 预览不创建文件
/derive-all specs/SPEC-001.md --dry-run
```

---

## Pipeline 整合

### 自动 TDD 转换

当正向推演由自动化 Pipeline 触发时（参见 [Pipeline 整合标准](pipeline-integration-standards.md)），以下规则适用于转换至 TDD 循环：

#### Auto-TDD 进入规则

| 规则 | 说明 |
|------|------|
| **推演完整性** | 所有推演输出（BDD、TDD、ATDD）必须在进入 TDD 前完成生成 |
| **RED 状态初始化** | Pipeline 在生成测试骨架后将 TDD 状态设为 RED |
| **测试骨架验证** | 生成的测试文件必须能编译/解析无误后才能进入 RED |
| **AC 计数验证** | 进入转换前验证输出测试数量与 AC 数量匹配 |

#### Pipeline Hooks

推演步骤可通过 Pipeline 事件自动触发：

| Hook | 触发条件 | 动作 |
|------|---------|------|
| `on-spec-approved` | Spec 状态变更为「已批准」 | 启动推演 Pipeline |
| `on-derivation-complete` | 所有推演输出已生成 | 转换至 TDD RED 阶段 |
| `on-tdd-green` | 所有推演测试通过 | 触发审查阶段 |

#### Auto-TDD 进入工作流程

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Spec Approved│───▶│  Derive All  │───▶│ Verify Count │───▶│  TDD RED     │
│ (hook)       │    │  BDD+TDD+ATDD│    │ AC = Tests   │    │  (auto-set)  │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

1. **Spec 批准**：Pipeline 检测到 Spec 批准（通过 hook 或轮询）
2. **完整推演**：Pipeline 以项目配置的语言/框架执行 `/derive-all`
3. **计数验证**：Pipeline 验证输出数量与 AC 数量匹配（反幻觉）
4. **RED 状态**：Pipeline 将 TDD 状态设为 RED；测试骨架存在但 assertion 为 [TODO]

#### 与 Pipeline 阶段的整合

正向推演对应 [Pipeline 整合标准](pipeline-integration-standards.md) 6 阶段模型中的 **DERIVE** 阶段：

| Pipeline 阶段 | 正向推演角色 |
|--------------|------------|
| SPEC | 输入：已批准的规格 |
| **DERIVE** | 执行：解析 AC → 生成 BDD/TDD/ATDD 输出 |
| BUILD | 输出：测试骨架进入 TDD RED→GREEN 循环 |

---

## 应避免的反模式

### 生成反模式

| 反模式 | 影响 | 正确做法 |
|--------|------|----------|
| **添加额外场景** | 测试膨胀、误导覆盖率 | 严格 1:1 AC 对应 |
| **发明测试用例** | 虚假信心 | 只从明确的 AC 推演 |
| **跳过来源标注** | 失去可追溯性 | 永远包含 @SPEC-XXX、@AC-N |
| **过度指定步骤** | 脆弱的测试 | 保持步骤在业务层级 |
| **缺少 TODO 标记** | 实现不完整 | 标记所有生成代码为 [TODO] |

### 流程反模式

| 反模式 | 影响 | 正确做法 |
|--------|------|----------|
| **从草稿 SPEC 推演** | 无效输出 | 只使用已批准的规格 |
| **跳过人类审查** | 品质问题 | 永远审查生成的输出 |
| **将骨架视为完整** | 缺少断言 | 填写 [TODO] 区块 |
| **忽略语言惯例** | 不一致的代码 | 使用适当的语言模板 |

---

## 最佳实践

### 应该做的

- ✅ 只从已批准的规格推演
- ✅ 维持严格的 1:1 AC 到输出对应
- ✅ 在所有输出中包含来源标注
- ✅ 使用 [TODO] 标记需要实现的区块
- ✅ 使用前审查生成的输出
- ✅ 保持生成的步骤在业务/领域层级
- ✅ 使用适当的语言/框架模板

### 不应该做的

- ❌ 添加 AC 未定义的场景
- ❌ 从草稿或未批准的规格推演
- ❌ 跳过对生成输出的人类审查
- ❌ 将生成的骨架视为完整测试
- ❌ 移除来源标注注释
- ❌ 在生成的代码中过度指定实现细节

---

## 相关规范

- [反向工程标准](reverse-engineering-standards.md) - 对称对应（代码 → 规格）
- [规格驱动开发](spec-driven-development.md) - 输入规格格式
- [行为驱动开发](../../../core/behavior-driven-development.md) - BDD 输出格式
- [测试驱动开发](test-driven-development.md) - TDD 输出用法
- [验收测试驱动开发](../../../core/acceptance-test-driven-development.md) - ATDD 输出格式
- [反幻觉指南](anti-hallucination.md) - 生成合规

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.2.0 | 2026-03-18 | 新增：Pipeline 整合章节 — auto-TDD 转换、pipeline hooks、auto-TDD 进入工作流程 |
| 1.0.0 | 2026-01-19 | 初始发布 |

---

## 授权

本规范采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权。
