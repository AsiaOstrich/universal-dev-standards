---
source: ../../../../skills/commands/derive-bdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 5459d9acd8e8
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
Feature: [Feature Name]

  @SPEC-001 @AC-1
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

## AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/derive-bdd` | 列出 status=Approved 的 spec 供选择 |
| `/derive-bdd <spec-file>` | 直接从指定 spec 推演 BDD 场景 |

### 交互脚本

1. 读取 spec，提取所有 AC
2. 将每个 AC 映射为一个 Gherkin Scenario（1:1）
3. 加入 `@SPEC-XXX` 和 `@AC-N` tags
4. 展示生成的 `.feature` 内容

**Decision: 输出位置**
- IF 项目有 `tests/features/` 目录 → 输出到该目录
- IF 项目有 `features/` 目录 → 输出到该目录
- ELSE → 询问用户输出位置

🛑 **STOP**: 展示 `.feature` 内容后等待用户确认写入

### 停止点

| 停止点 | 等待内容 |
|--------|---------|
| `.feature` 生成后 | 确认内容正确并写入 |

### 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| AC 非 GWT 格式 | 尝试转换并标记 `[Derived]`，展示供确认 |
| Spec 无 AC | 告知并引导修改 spec |
| 生成的 Gherkin 语法无效 | 自动修正语法，标记修正处 |

## 参考

- 父命令: [/derive](../spec-derivation/SKILL.md)
- 核心规范: [forward-derivation-standards.md](../../core/forward-derivation-standards.md)
