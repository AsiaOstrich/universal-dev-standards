---
description: [UDS] Derive all test structures (BDD, TDD, ATDD) from SDD specification
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[spec file path | 規格檔案路徑]"
---

# /derive-all — Full Forward Derivation | 完整正向推演

Derive all test structures (BDD + TDD + optionally ATDD) from an approved SDD specification.

從已核准的 SDD 規格推演所有測試結構（BDD + TDD + 可選 ATDD）。

## Workflow | 工作流程

```
SPEC-XXX.md ──► /derive-bdd ──► /derive-tdd ──► [/derive-atdd] ──► Report
```

1. **Parse** the SDD spec and validate it is approved
2. **Run** `/derive-bdd` to generate Gherkin scenarios
3. **Run** `/derive-tdd` to generate test skeletons
4. **Optionally** run `/derive-atdd` for acceptance test tables
5. **Generate** `DERIVATION-REPORT.md` summarizing all outputs

## Output Files | 輸出檔案

| File | Content | 內容 |
|------|---------|------|
| `features/SPEC-XXX.feature` | BDD Gherkin scenarios | BDD Gherkin 場景 |
| `tests/SPEC-XXX.test.ts` | TDD test skeletons | TDD 測試骨架 |
| `DERIVATION-REPORT.md` | Summary with statistics | 摘要與統計 |

## Usage | 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/derive-all specs/SPEC-001.md` | Full derivation from spec | 從規格完整推演 |
| `/derive-all` | Interactive — ask for spec file | 互動式 — 詢問規格檔案 |

## Typical SDD Workflow | 典型 SDD 工作流程

```bash
/sdd user-authentication          # Step 1: Create spec
/sdd review specs/SPEC-001.md     # Step 2: Review
/derive-all specs/SPEC-001.md     # Step 3: Derive tests
# Step 4: Implement — fill [TODO] markers
```

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/derive-all` | 列出 status=Approved 的 spec 供選擇 |
| `/derive-all <spec-file>` | 直接對指定 spec 執行完整推演 |

### Interaction Script | 互動腳本

1. 讀取並驗證 spec（status = Approved）
2. 依序執行：`/derive-bdd` → `/derive-tdd` → 詢問是否需要 `/derive-atdd`

**Decision: ATDD 推演**
- IF 使用者要求 → 執行 `/derive-atdd`
- ELSE → 跳過 ATDD

🛑 **STOP**: BDD + TDD 推演完成後，詢問是否需要 ATDD 推演

3. 生成 `DERIVATION-REPORT.md` 彙總所有輸出
4. 展示報告摘要

🛑 **STOP**: 展示所有生成檔案清單後等待使用者確認寫入

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| 所有推演完成後 | 確認寫入所有檔案 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| Spec status ≠ Approved | 引導到 `/sdd approve` |
| 子命令推演失敗 | 報告哪個推演失敗，已成功的仍保留，詢問是否繼續 |

## Reference | 參考

- Parent command: [/derive](../forward-derivation/SKILL.md)
- Core standard: [forward-derivation-standards.md](../../core/forward-derivation-standards.md)
- Sub-commands: [/derive-bdd](./derive-bdd.md), [/derive-tdd](./derive-tdd.md), [/derive-atdd](./derive-atdd.md)
