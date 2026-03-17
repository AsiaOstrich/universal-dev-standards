---
source: ../../../core/structured-task-definition.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-17
status: current
---

# 结构化任务定义标准

> **语言**: [English](../../../core/structured-task-definition.md) | [繁體中文](../../zh-TW/core/structured-task-definition.md)

**版本**: 1.0.0
**最后更新**: 2026-03-17
**适用范围**: 所有使用 AI 辅助开发的项目
**范围**: universal
**行业标准**: 灵感来自 GSD (Get Shit Done) 任务结构
**参考**: [GSD](https://github.com/gsd-build/get-shit-done)

---

## 摘要

结构化任务定义确保每个 AI 任务都包含可靠执行所需的最低上下文。通过要求四个必填字段 — `read_first`、`action`、`acceptance_criteria` 和 `verification` — 本标准防止幻觉、消除歧义，并确保每个任务结果都可客观验证。

---

## 快速参考

| 方面 | 说明 |
|------|------|
| **核心原则** | 每个任务必须有依据、具体、可测试且可验证 |
| **必填字段** | `read_first`、`action`、`acceptance_criteria`、`verification` |
| **防幻觉** | `read_first` 在执行前建立事实基础 |
| **防歧义** | `action` 指定确切的文件、行号和操作 |
| **防遗漏** | `acceptance_criteria` 使用 GWT 格式确保完整性 |
| **防主观** | `verification` 使用可执行命令，而非主观判断 |

---

## 四个必填字段

### 1. `read_first` — 建立事实基础

在执行任务之前必须读取的文件清单。这防止 AI 对代码结构、API 签名或项目惯例进行幻觉。

**目的**: 从实际代码建立准确的心智模型，而非基于假设。

**格式**:
```yaml
read_first:
  - path: src/auth/login.js
    reason: Contains current login implementation
  - path: tests/auth/login.test.js
    reason: Existing test patterns to follow
  - path: docs/specs/SPEC-042.md
    reason: Approved specification for this change
```

**规则**:
- 所有列出的文件必须存在（在任务执行前验证）
- 同时包含实现文件及其测试
- 包含相关的规格文档（如果 SDD 已启用）
- 包含影响行为的配置文件

### 2. `action` — 具体步骤

包含确切文件路径和行号引用的具体、明确步骤清单。消除模糊指令，如「改进错误处理」或「添加验证」。

**目的**: 移除关于做什么和在哪里做的所有歧义。

**格式**:
```yaml
action:
  - step: 1
    file: src/auth/login.js
    operation: modify
    location: "lines 42-58 (validateCredentials function)"
    description: Add rate limiting check before credential validation
    details: |
      Insert a call to rateLimiter.check(req.ip) before the
      existing validateCredentials() call. If rate limit exceeded,
      throw RateLimitError with 429 status.
  - step: 2
    file: tests/auth/login.test.js
    operation: add
    location: "after line 120 (end of 'validation' describe block)"
    description: Add rate limiting test cases
```

**规则**:
- 每个步骤指定单一文件和操作
- 操作类型为：`add`、`modify`、`delete`、`move`、`rename`
- 行号为近似值（可能会移动），但提供上下文
- 不应有「做任何看起来合适的事」这类步骤

### 3. `acceptance_criteria` — 可衡量的完成条件

以 Given/When/Then 格式定义任务何时完成的条件。每个条件对应一个可验证的结果。

**目的**: 每个条件都是可测试的 — 没有「看起来可以运作」的空间。

**格式**:
```yaml
acceptance_criteria:
  - id: AC-1
    given: A user has made 5 login attempts in the last minute
    when: They attempt a 6th login
    then: The system returns HTTP 429 with "Rate limit exceeded" message
  - id: AC-2
    given: A user has not exceeded the rate limit
    when: They attempt login with valid credentials
    then: Login succeeds as before (no regression)
```

**规则**:
- 使用 GWT 格式（与 SDD 和 BDD 标准一致）
- 每个 AC 必须可独立验证
- 包含回归条件（现有行为得以保留）
- 为可追溯性编号条件（AC-1、AC-2 等）

### 4. `verification` — 可执行检查

客观验证任务已完成的命令或检查。使用 `grep`、`test`、`ls`、`npm test` 或类似工具 — 绝不使用主观判断。

**目的**: 机器可验证的结果消除「我觉得看起来不错」。

**格式**:
```yaml
verification:
  - command: "grep -n 'rateLimiter.check' src/auth/login.js"
    expect: "At least one match found"
  - command: "npm test -- tests/auth/login.test.js"
    expect: "All tests pass (exit code 0)"
  - command: "grep -c 'rate.limit' tests/auth/login.test.js"
    expect: "At least 2 test cases for rate limiting"
```

**规则**:
- 每个 AC 应至少有一个验证命令
- 优先使用确定性检查（grep、test、文件存在）而非语义评估
- 将测试执行纳入验证步骤
- 验证失败 = 任务未完成

---

## 完整任务示例

```yaml
task:
  id: TASK-042
  title: Add rate limiting to login endpoint
  spec_ref: SPEC-042

  read_first:
    - path: src/auth/login.js
      reason: Current login implementation
    - path: src/middleware/rate-limiter.js
      reason: Existing rate limiter utility
    - path: tests/auth/login.test.js
      reason: Test patterns to follow
    - path: docs/specs/SPEC-042.md
      reason: Approved specification

  action:
    - step: 1
      file: src/auth/login.js
      operation: modify
      location: "validateCredentials function (line ~45)"
      description: Add rate limit check before credential validation
    - step: 2
      file: tests/auth/login.test.js
      operation: add
      location: "end of validation describe block"
      description: Add rate limiting test cases

  acceptance_criteria:
    - id: AC-1
      given: A user exceeds 5 login attempts per minute
      when: They attempt another login
      then: HTTP 429 returned with rate limit message
    - id: AC-2
      given: A user is within rate limits
      when: They login with valid credentials
      then: Login succeeds normally (no regression)

  verification:
    - command: "grep -n 'rateLimiter' src/auth/login.js"
      expect: "Rate limiter imported and used"
    - command: "npm test -- tests/auth/login.test.js"
      expect: "All tests pass"
```

---

## 适用时机

| 场景 | 套用完整结构？ | 备注 |
|------|---------------|------|
| 新功能 (SDD) | 是 | 四个字段全部必填 |
| 错误修复 | 是 | `read_first` 包含错误报告和受影响的代码 |
| 重构 | 是 | `acceptance_criteria` 专注于无回归 |
| 琐碎变更 | 否 | 错字、格式化 — 跳过结构 |
| 紧急修复 | 部分 | 至少需要 `read_first` + `verification` |

---

## 与 SDD 集成

与规格驱动开发搭配使用时：
- `read_first` 包含已核准的规格文档
- `acceptance_criteria` 源自规格的 AC 章节
- `verification` 包含规格合规检查
- 任务在实施阶段创建

---

## 最佳实践

### 应该做的

- 在每个任务中包含回归条件
- 使用确切的文件路径（通过 `read_first` 验证）
- 保持任务原子化（一个逻辑变更）
- 适用时引用规格 ID

### 不应该做的

- 不要使用模糊的动作描述（「改进」、「增强」、「重构」）
- 不要跳过 `verification` — 这是最重要的字段
- 不要假设文件结构 — 始终通过 `read_first` 验证
- 不要在未读取目标代码的情况下创建任务

---

## 相关标准

- [规格驱动开发](spec-driven-development.md) — 任务结构与 SDD 工作流程集成
- [防幻觉标准](anti-hallucination.md) — `read_first` 实现证据导向分析
- [测试标准](testing-standards.md) — `verification` 与测试金字塔一致
- [签入标准](checkin-standards.md) — 任务产出可提交的工作单元

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0.0 | 2026-03-17 | 初始标准：4 个必填字段（read_first、action、acceptance_criteria、verification） |

---

## 授权

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
