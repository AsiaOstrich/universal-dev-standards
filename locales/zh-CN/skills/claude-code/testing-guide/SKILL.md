---
source: skills/claude-code/testing-guide/SKILL.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2025-12-29
status: current
name: testing-guide
description: |
  Testing pyramid and test writing standards for UT/IT/ST/E2E.
  Supports ISTQB and Industry Pyramid frameworks.
  Use when: writing tests, discussing test coverage, test strategy, or test naming.
  Keywords: test, unit, integration, e2e, coverage, mock, ISTQB, SIT, 测试, 单元, 整合, 端对端.
---

# 测试指南

> **语言**: [English](../../../../../skills/claude-code/testing-guide/SKILL.md) | 繁体中文

**版本**: 1.1.0
**最后更新**: 2025-12-29
**适用范围**: Claude Code Skills

---

## 目的

本 Skill 提供测试金字塔标准和系统化测试的最佳实践，支援 ISTQB 和业界通行金字塔框架。

## 框架选择

| 框架 | 层级 | 适用场景 |
|-----------|--------|----------|
| **ISTQB** | UT → IT/SIT → ST → AT/UAT | 企业级、合规性、正式 QA |
| **业界通行金字塔** | UT (70%) → IT (20%) → E2E (10%) | 敏捷、DevOps、CI/CD |

**整合测试缩写说明：**
- **IT** (Integration Testing)：敏捷/DevOps 社群常用
- **SIT** (System Integration Testing)：企业/ISTQB 环境常用
- 两者指的是相同的测试层级

## 快速参考

### 测试金字塔（业界标准）

```
              ┌─────────┐
              │   E2E   │  ← 10%（较少、较慢）
             ─┴─────────┴─
            ┌─────────────┐
            │   IT/SIT    │  ← 20%（整合测试）
           ─┴─────────────┴─
          ┌─────────────────┐
          │       UT        │  ← 70%（单元测试）
          └─────────────────┘
```

### 测试层级概览

| 层级 | 范围 | 速度 | 相依性 |
|-------|-------|-------|-------------|
| **UT** | 单一函式/类别 | < 100ms | Mock |
| **IT/SIT** | 元件互动 | 1-10秒 | 真实资料库（容器化） |
| **ST** | 完整系统（ISTQB） | 分钟级 | 类生产环境 |
| **E2E** | 使用者旅程 | 30秒+ | 所有真实环境 |
| **AT/UAT** | 业务验证（ISTQB） | 视情况 | 所有真实环境 |

### 覆盖率目标

| 指标 | 最低要求 | 建议值 |
|--------|---------|-------------|
| 行覆盖率 | 70% | 85% |
| 分支覆盖率 | 60% | 80% |
| 函式覆盖率 | 80% | 90% |

## 详细指南

完整标准请参考：
- [测试金字塔](./testing-pyramid.md)

### AI 优化格式（Token 高效）

供 AI 助理使用，请采用 YAML 格式档案以减少 Token 使用量：
- 基础标准：`ai/standards/testing.ai.yaml`
- 框架选项：
  - ISTQB 框架：`ai/options/testing/istqb-framework.ai.yaml`
  - 业界通行金字塔：`ai/options/testing/industry-pyramid.ai.yaml`
- 测试层级选项：
  - 单元测试：`ai/options/testing/unit-testing.ai.yaml`
  - 整合测试：`ai/options/testing/integration-testing.ai.yaml`
  - 系统测试：`ai/options/testing/system-testing.ai.yaml`
  - E2E 测试：`ai/options/testing/e2e-testing.ai.yaml`

## 命名惯例

### 档案命名

```
[ClassName]Tests.cs       # C#
[ClassName].test.ts       # TypeScript
[class_name]_test.py      # Python
[class_name]_test.go      # Go
```

### 方法命名

```
[MethodName]_[Scenario]_[ExpectedResult]()
should_[behavior]_when_[condition]()
test_[method]_[scenario]_[expected]()
```

## 测试替身

| 类型 | 用途 | 使用时机 |
|------|---------|-------------|
| **Stub** | 回传预定义值 | 固定 API 回应 |
| **Mock** | 验证互动 | 检查方法是否被呼叫 |
| **Fake** | 简化实作 | 记忆体资料库 |
| **Spy** | 记录呼叫、委派 | 部分 Mock |

### 何时使用

- **UT**: 对所有外部相依使用 mock/stub
- **IT**: 资料库使用 fake，外部 API 使用 stub
- **ST**: 真实元件，仅对外部服务使用 fake
- **E2E**: 全部使用真实环境

## AAA 模式

```typescript
test('method_scenario_expected', () => {
    // Arrange - 设定测试资料
    const input = createTestInput();
    const sut = new SystemUnderTest();

    // Act - 执行行为
    const result = sut.execute(input);

    // Assert - 验证结果
    expect(result).toBe(expected);
});
```

## FIRST 原则

- **F**ast（快速） - 测试执行快速
- **I**ndependent（独立） - 测试之间不互相影响
- **R**epeatable（可重复） - 每次执行结果相同
- **S**elf-validating（自我验证） - 明确的通过/失败
- **T**imely（及时） - 与产品代码一起撰写

## 应避免的反模式

- ❌ 测试相依（测试必须按顺序执行）
- ❌ 不稳定测试（有时通过、有时失败）
- ❌ 测试实作细节
- ❌ 过度 Mock
- ❌ 缺少断言
- ❌ 魔术数字/字串

---

## 设定侦测

本 Skill 支援专案特定设定。

### 侦测顺序

1. 检查 `CONTRIBUTING.md` 的「停用 Skills」区段
   - 如果列出此 Skill，则为该专案停用
2. 检查 `CONTRIBUTING.md` 的「测试标准」区段
3. 若未找到，**预设使用标准覆盖率目标**

### 首次设定

若未找到设定且上下文不清楚时：

1. 询问使用者：「此专案尚未设定测试标准。您想要自订覆盖率目标吗？」
2. 使用者选择后，建议在 `CONTRIBUTING.md` 中记录：

```markdown
## Testing Standards

### Coverage Targets
| Metric | Target |
|--------|--------|
| Line | 80% |
| Branch | 70% |
| Function | 85% |
```

### 设定范例

在专案的 `CONTRIBUTING.md` 中：

```markdown
## Testing Standards

### Coverage Targets
| Metric | Target |
|--------|--------|
| Line | 80% |
| Branch | 70% |
| Function | 85% |

### Testing Framework
- Unit Tests: Jest
- Integration Tests: Supertest
- E2E Tests: Playwright
```

---

## 相关标准

- [测试标准](../../core/testing-standards.md)
- [程式码审查检查清单](../../core/code-review-checklist.md)

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|---------|------|---------|
| 1.1.0 | 2025-12-29 | 新增：框架选择（ISTQB/业界通行金字塔）、IT/SIT 缩写说明 |
| 1.0.0 | 2025-12-24 | 新增：标准区段（目的、相关标准、版本历史、授权） |

---

## 授权

本 Skill 以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
