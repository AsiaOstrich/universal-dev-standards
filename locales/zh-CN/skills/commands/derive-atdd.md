---
source: ../../../../skills/commands/derive-atdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Derive ATDD acceptance tests from SDD specification
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[规格文件路径 | spec file path]"
---

# /derive-atdd — 推演 ATDD 验收测试

从已核准的 SDD 规格文档推演 ATDD 验收测试表格。

## 工作流程

```
SPEC-XXX.md ──► Parse AC ──► Generate acceptance.md ──► Review
```

1. **读取** SDD 规格并提取验收条件
2. **映射** 每个 AC 到验收测试表格（Given-When-Then 列）
3. **生成** `acceptance.md`，包含测试数据和预期结果
4. **输出** 推演摘要

## 输出格式

```markdown
# Acceptance Tests: SPEC-001

## AC-1: [Description]

| # | Given | When | Then | Status |
|---|-------|------|------|--------|
| 1 | [precondition] | [action] | [expected] | ⬜ |
| 2 | [precondition] | [action] | [expected] | ⬜ |
```

## 使用方式

| 命令 | 用途 |
|------|------|
| `/derive-atdd specs/SPEC-001.md` | 从特定规格推演 ATDD |
| `/derive-atdd` | 互动式 — 询问规格文件 |

> **注意**: BDD 场景已经作为可执行的验收测试。`/derive-atdd` 适用于专门的手动测试工作流程。

## 参考

- 父命令: [/derive](../forward-derivation/SKILL.md)
- 核心规范: [forward-derivation-standards.md](../../core/forward-derivation-standards.md)
