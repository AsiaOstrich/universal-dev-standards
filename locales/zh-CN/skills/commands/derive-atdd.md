---
source: ../../../../skills/commands/derive-atdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 160981bc6d4d
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

## AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/derive-atdd` | 列出 status=Approved 的 spec 供选择 |
| `/derive-atdd <spec-file>` | 直接从指定 spec 推演 ATDD 表格 |

### 交互脚本

1. 读取 spec，提取所有 AC
2. 将每个 AC 映射为验收测试表格（Given-When-Then 列）
3. 为每个 AC 生成多笔测试数据（正向 + 反向 + 边界值）
4. 展示生成的 `acceptance.md` 内容

🛑 **STOP**: 展示表格后等待用户确认写入

### 停止点

| 停止点 | 等待内容 |
|--------|---------|
| 验收测试表格生成后 | 确认内容正确并写入 |

### 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| AC 缺乏具体的输入/输出描述 | 标记 `[TODO: needs test data]`，继续其余 AC |
| Spec 无 AC | 告知并引导修改 spec |

## 参考

- 父命令: [/derive](../spec-derivation/SKILL.md)
- 核心规范: [forward-derivation-standards.md](../../core/forward-derivation-standards.md)
