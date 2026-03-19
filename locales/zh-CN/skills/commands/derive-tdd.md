---
source: ../../../../skills/commands/derive-tdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
status: current
---

---
description: [UDS] Derive TDD test skeletons from SDD specification
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[spec file path | 规格文件路径]"
---

# /derive-tdd — 推演 TDD 测试骨架

从已核准的 SDD 规格文件推演测试骨架文件。

## 工作流程

```
SPEC-XXX.md ──► Parse AC ──► Generate .test.ts ──► Review
```

1. **读取** SDD 规格并提取验收标准
2. **映射** 每个 AC 到一个 `describe`/`it` 区块，采用 AAA 模式
3. **生成** 测试文件，包含 `[TODO]` 标记供实作填入
4. **输出** 推演摘要

## 输出格式

```typescript
describe('SPEC-001: [Feature Name]', () => {
  describe('AC-1: [AC description]', () => {
    it('should [expected behavior]', () => {
      // Arrange — [TODO]
      // Act — [TODO]
      // Assert — [TODO]
    });
  });
});
```

## 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/derive-tdd specs/SPEC-001.md` | Derive TDD from specific spec | 从特定规格推演 TDD |
| `/derive-tdd` | Interactive — ask for spec file | 互动式 — 询问规格文件 |

## 参考

- 父命令: [/derive](../forward-derivation/SKILL.md)
- 核心规范: [forward-derivation-standards.md](../../core/forward-derivation-standards.md)
