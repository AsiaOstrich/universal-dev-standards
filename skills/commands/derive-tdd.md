---
description: [UDS] Derive TDD test skeletons from SDD specification
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[spec file path | 規格檔案路徑]"
---

# /derive-tdd — Derive TDD Skeletons | 推演 TDD 測試骨架

Derive test skeleton files from an approved SDD specification document.

從已核准的 SDD 規格文件推演測試骨架檔案。

## Workflow | 工作流程

```
SPEC-XXX.md ──► Parse AC ──► Generate .test.ts ──► Review
```

1. **Read** the SDD spec and extract acceptance criteria
2. **Map** each AC to a `describe`/`it` block with AAA pattern
3. **Generate** test file with `[TODO]` markers for implementation
4. **Output** derivation summary

## Output Format | 輸出格式

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

## Usage | 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/derive-tdd specs/SPEC-001.md` | Derive TDD from specific spec | 從特定規格推演 TDD |
| `/derive-tdd` | Interactive — ask for spec file | 互動式 — 詢問規格檔案 |

## Reference | 參考

- Parent command: [/derive](../forward-derivation/SKILL.md)
- Core standard: [forward-derivation-standards.md](../../core/forward-derivation-standards.md)
