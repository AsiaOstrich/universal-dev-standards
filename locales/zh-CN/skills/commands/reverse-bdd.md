---
source: ../../../../skills/commands/reverse-bdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: ed76cb2e8db5
status: current
---

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

## AI Agent Behavior | AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/reverse-bdd` | 询问目标（源代码目录或 spec 文件） |
| `/reverse-bdd <path>` | 直接分析指定路径 |

### Interaction Script | 交互脚本

1. 判断输入类型（源代码 or spec）
2. 分析行为模式，提取隐含的 Given-When-Then 流程
3. 为每个场景标记确定性：`[Confirmed]`、`[Inferred]`
4. 生成 Gherkin `.feature` 文件（含 `[Source: file:line]` 引用）
5. 展示结果

🛑 **STOP**: 展示 `.feature` 内容后等待用户确认写入

### Stop Points | 停止点

| 停止点 | 等待内容 |
|--------|---------|
| `.feature` 生成后 | 确认场景正确并写入 |

### Error Handling | 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 行为模式模糊无法转为场景 | 标记 `[Assumption]`，列出需人工确认的场景 |
| 目标无可分析的行为逻辑 | 告知并建议检查是否为正确的文件 |

## Reference | 参考

- Parent command: [/reverse](../reverse-engineer/SKILL.md)
- Core standard: [reverse-engineering-standards.md](../../core/reverse-engineering-standards.md)
