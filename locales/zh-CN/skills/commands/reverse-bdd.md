---
description: [UDS] Transform SDD acceptance criteria to BDD scenarios
allowed-tools: Read, Grep, Glob, Write
argument-hint: "[spec file or source directory | 规格文件或源代码目录]"
---

# /reverse-bdd — Extract BDD Scenarios | 提取 BDD 场景

Transform existing code or SDD acceptance criteria into BDD Gherkin scenarios.

将现有代码或 SDD 验收条件转换为 BDD Gherkin 场景。

## Workflow | 工作流程

```
Source/Spec ──► Analyze Behaviors ──► Generate .feature ──► Review
```

1. **分析**源代码或规格中的行为模式
2. **提取**隐含的 Given-When-Then 流程
3. **生成** Gherkin `.feature` 文件
4. **标记**确定性标签：`[Confirmed]`、`[Inferred]`

## Output Format | 输出格式

```gherkin
# [Source: src/auth/login.js:45]
Feature: User Login [Inferred]

  # [Confirmed] from test/auth.test.js:12
  Scenario: Successful login
    Given a registered user exists
    When they submit valid credentials
    Then they receive an auth token
```

## Usage | 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/reverse-bdd src/auth/` | Extract BDD from auth module | 从 auth 模块提取 BDD |
| `/reverse-bdd specs/SPEC-001.md` | Convert spec AC to BDD | 将规格 AC 转为 BDD |

## Reference | 参考

- Parent command: [/reverse](../reverse-engineer/SKILL.md)
- Core standard: [reverse-engineering-standards.md](../../core/reverse-engineering-standards.md)
