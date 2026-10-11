---
source: ../../../../skills/commands/derive-tdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 455bbcab0e1a
status: current
---

---
description: "[UDS] 從 SDD 規格推演 TDD 測試骨架"
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[spec file path | 規格檔案路徑]"
---

# /derive-tdd — 推演 TDD 測試骨架

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

## AI 代理行為

> 遵循 [AI 命令行為標準](../../core/ai-command-behavior.md)

### 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/derive-tdd` | 列出 status=Approved 的 spec 供選擇 |
| `/derive-tdd <spec-file>` | 直接從指定 spec 推演 TDD 骨架 |

### 互動腳本

1. 讀取 spec，擷取所有 AC
2. 偵測專案語言和測試框架

**決策：語言／框架偵測**
- IF 找到 `vitest.config` / `jest.config` → 使用對應框架
- IF 找到 `pytest.ini` / `pyproject.toml` → 使用 pytest
- IF 無法偵測 → 詢問使用者

3. 將每個 AC 映射為 `describe`/`it` 區塊（含 AAA 註解和 `[TODO]` 標記）
4. 展示生成的測試檔案內容

🛑 **STOP**：展示測試骨架後等待使用者確認寫入

### 停止點

| 停止點 | 等待內容 |
|--------|---------|
| 測試骨架生成後 | 確認內容正確並寫入 |

### 錯誤處理

| 錯誤情況 | AI 動作 |
|----------|---------|
| AC 過於抽象無法轉為測試 | 標記 `[TODO: AC needs refinement]`，繼續其餘 AC |
| 無法偵測語言/框架 | 詢問使用者指定 |
| Spec 無 AC | 告知並引導修改 spec |

## 參考

- 父指令：[/derive](../spec-derivation/SKILL.md)
- 核心規範：[forward-derivation-standards.md](../../core/forward-derivation-standards.md)
