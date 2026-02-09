---
description: [UDS] Transform SDD acceptance criteria to BDD scenarios
allowed-tools: Read, Grep, Glob, Write
argument-hint: "[spec file or source directory | 規格檔案或原始碼目錄]"
---

# /reverse-bdd — Extract BDD Scenarios | 擷取 BDD 場景

Transform existing code or SDD acceptance criteria into BDD Gherkin scenarios.

將現有程式碼或 SDD 驗收條件轉換為 BDD Gherkin 場景。

## Workflow | 工作流程

```
Source/Spec ──► Analyze Behaviors ──► Generate .feature ──► Review
```

1. **Analyze** source code or spec for behavioral patterns
2. **Extract** implicit Given-When-Then flows
3. **Generate** Gherkin `.feature` file
4. **Tag** with certainty labels: `[Confirmed]`, `[Inferred]`

## Output Format | 輸出格式

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
| `/reverse-bdd src/auth/` | Extract BDD from auth module | 從 auth 模組擷取 BDD |
| `/reverse-bdd specs/SPEC-001.md` | Convert spec AC to BDD | 將規格 AC 轉為 BDD |

## Reference | 參考

- Parent command: [/reverse](../reverse-engineer/SKILL.md)
- Core standard: [reverse-engineering-standards.md](../../core/reverse-engineering-standards.md)
