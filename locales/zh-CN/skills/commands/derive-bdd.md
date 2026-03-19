---
source: ../../../../skills/commands/derive-bdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
status: current
---

---
description: [UDS] Derive BDD Gherkin scenarios from SDD specification
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[spec file path | 规格文件路径]"
---

# /derive-bdd — 推演 BDD 场景

从已核准的 SDD 规格文件推演 Gherkin `.feature` 文件。

## 工作流程

```
SPEC-XXX.md ──► Parse AC ──► Generate .feature ──► Review
```

1. **读取** SDD 规格并提取验收标准
2. **映射** 每个 AC 到一个 Gherkin Scenario（1:1）
3. **生成** `.feature` 文件，包含 `@SPEC-XXX` 和 `@AC-N` 标签
4. **输出** 推演摘要

## 输出格式

```gherkin
@SPEC-001
Feature: [Feature Name]

  @AC-1
  Scenario: [AC-1 description]
    Given [context]
    When [action]
    Then [expected result]
```

## 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/derive-bdd specs/SPEC-001.md` | Derive BDD from specific spec | 从特定规格推演 BDD |
| `/derive-bdd` | Interactive — ask for spec file | 互动式 — 询问规格文件 |

## 参考

- 父命令: [/derive](../forward-derivation/SKILL.md)
- 核心规范: [forward-derivation-standards.md](../../core/forward-derivation-standards.md)
