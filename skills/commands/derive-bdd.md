---
description: [UDS] Derive BDD Gherkin scenarios from SDD specification
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[spec file path | 規格檔案路徑]"
---

# /derive-bdd — Derive BDD Scenarios | 推演 BDD 場景

Derive Gherkin `.feature` files from an approved SDD specification document.

從已核准的 SDD 規格文件推演 Gherkin `.feature` 檔案。

## Workflow | 工作流程

```
SPEC-XXX.md ──► Parse AC ──► Generate .feature ──► Review
```

1. **Read** the SDD spec and extract acceptance criteria
2. **Map** each AC to a Gherkin Scenario (1:1)
3. **Generate** `.feature` file with `@SPEC-XXX` and `@AC-N` tags
4. **Output** derivation summary

## Output Format | 輸出格式

```gherkin
@SPEC-001
Feature: [Feature Name]

  @AC-1
  Scenario: [AC-1 description]
    Given [context]
    When [action]
    Then [expected result]
```

## Usage | 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/derive-bdd specs/SPEC-001.md` | Derive BDD from specific spec | 從特定規格推演 BDD |
| `/derive-bdd` | Interactive — ask for spec file | 互動式 — 詢問規格檔案 |

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/derive-bdd` | 列出 status=Approved 的 spec 供選擇 |
| `/derive-bdd <spec-file>` | 直接從指定 spec 推演 BDD 場景 |

### Interaction Script | 互動腳本

1. 讀取 spec，擷取所有 AC
2. 將每個 AC 映射為一個 Gherkin Scenario（1:1）
3. 加入 `@SPEC-XXX` 和 `@AC-N` tags
4. 展示生成的 `.feature` 內容

**Decision: 輸出位置**
- IF 專案有 `tests/features/` 目錄 → 輸出到該目錄
- IF 專案有 `features/` 目錄 → 輸出到該目錄
- ELSE → 詢問使用者輸出位置

🛑 **STOP**: 展示 `.feature` 內容後等待使用者確認寫入

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| `.feature` 生成後 | 確認內容正確並寫入 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| AC 非 GWT 格式 | 嘗試轉換並標記 `[Derived]`，展示供確認 |
| Spec 無 AC | 告知並引導修改 spec |
| 生成的 Gherkin 語法無效 | 自動修正語法，標記修正處 |

## Reference | 參考

- Parent command: [/derive](../forward-derivation/SKILL.md)
- Core standard: [forward-derivation-standards.md](../../core/forward-derivation-standards.md)
