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

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/reverse-bdd` | 詢問目標（原始碼目錄或 spec 檔案） |
| `/reverse-bdd <path>` | 直接分析指定路徑 |

### Interaction Script | 互動腳本

1. 判斷輸入類型（原始碼 or spec）
2. 分析行為模式，擷取隱含的 Given-When-Then 流程
3. 為每個場景標記確定性：`[Confirmed]`、`[Inferred]`
4. 生成 Gherkin `.feature` 檔案（含 `[Source: file:line]` 引用）
5. 展示結果

🛑 **STOP**: 展示 `.feature` 內容後等待使用者確認寫入

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| `.feature` 生成後 | 確認場景正確並寫入 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 行為模式模糊無法轉為場景 | 標記 `[Assumption]`，列出需人工確認的場景 |
| 目標無可分析的行為邏輯 | 告知並建議檢查是否為正確的檔案 |

## Reference | 參考

- Parent command: [/reverse](../reverse-engineer/SKILL.md)
- Core standard: [reverse-engineering-standards.md](../../core/reverse-engineering-standards.md)
