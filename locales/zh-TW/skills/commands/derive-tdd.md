---
source: ../../../../skills/commands/derive-tdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Derive TDD test skeletons from SDD specification
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[spec file path | 規格檔案路徑]"
---

# 推演 TDD 測試骨架

> **Language**: [English](../../../../skills/commands/derive-tdd.md) | 繁體中文

從已核准的 SDD 規格文件推演測試骨架檔案。

## 工作流程

```
SPEC-XXX.md ──► Parse AC ──► Generate .test.ts ──► Review
```

1. **讀取** SDD 規格並萃取驗收條件
2. **對應** 每個 AC 到一個 `describe`/`it` 區塊，使用 AAA 模式
3. **產生** 測試檔案，包含 `[TODO]` 標記供實作填入
4. **輸出** 推演摘要

## 輸出格式

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

| 指令 | 用途 |
|------|------|
| `/derive-tdd specs/SPEC-001.md` | 從特定規格推演 TDD |
| `/derive-tdd` | 互動式 — 詢問規格檔案 |

## 參考

- 父指令：[/derive](../forward-derivation/SKILL.md)
- 核心規範：[forward-derivation-standards.md](../../core/forward-derivation-standards.md)
