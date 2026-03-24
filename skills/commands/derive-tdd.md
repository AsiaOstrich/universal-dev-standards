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

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/derive-tdd` | 列出 status=Approved 的 spec 供選擇 |
| `/derive-tdd <spec-file>` | 直接從指定 spec 推演 TDD 骨架 |

### Interaction Script | 互動腳本

1. 讀取 spec，擷取所有 AC
2. 偵測專案語言和測試框架

**Decision: 語言/框架偵測**
- IF 找到 `vitest.config` / `jest.config` → 使用對應框架
- IF 找到 `pytest.ini` / `pyproject.toml` → 使用 pytest
- IF 無法偵測 → 詢問使用者

3. 將每個 AC 映射為 `describe`/`it` block（含 AAA 註解和 `[TODO]` 標記）
4. 展示生成的測試檔案內容

🛑 **STOP**: 展示測試骨架後等待使用者確認寫入

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| 測試骨架生成後 | 確認內容正確並寫入 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| AC 過於抽象無法轉為測試 | 標記 `[TODO: AC needs refinement]`，繼續其餘 AC |
| 無法偵測語言/框架 | 詢問使用者指定 |
| Spec 無 AC | 告知並引導修改 spec |

## Reference | 參考

- Parent command: [/derive](../forward-derivation/SKILL.md)
- Core standard: [forward-derivation-standards.md](../../core/forward-derivation-standards.md)
