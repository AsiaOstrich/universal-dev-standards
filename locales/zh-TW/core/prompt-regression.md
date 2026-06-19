---
source: ../../../core/prompt-regression.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 418f48be7045
status: current
---

# Prompt 回歸測試標準

> **語言**: [English](../../../core/prompt-regression.md) | 繁體中文

---

## 概述

AI 代理的 prompt 即程式碼。未預期的變更會悄悄降低代理行為品質，卻不會觸發型別錯誤或單元測試失敗。Prompt 回歸測試利用 SHA-256 黃金校驗和（golden checksum）偵測任何修改，強制開發者明確確認並記錄每次 prompt 變更。

## 為什麼要使用校驗和

- 僅有 diff 不能阻擋 CI 流程——校驗和可以
- Prompt 是大型 Markdown 檔案；細微的編輯（空白字元、標點符號）都可能改變模型行為
- 校驗和更新 + 說明註解會建立每次 prompt 變更原因的稽核軌跡

## 實作方式

### 1. 計算初始校驗和

```bash
for f in agents/*/prompt.md; do
  echo -n "$f: "
  sha256sum "$f" | cut -d' ' -f1
done
```

### 2. 黃金校驗和測試（Vitest）

```typescript
// SPDX-License-Identifier: AGPL-3.0-only
import { createHash } from "crypto"
import { readFileSync } from "fs"
import { join } from "path"
import { describe, it, expect } from "vitest"

// 僅在 prompt 變更為刻意行為時才更新這些值。
// 在同一行加上說明 WHY prompt 發生變更的註解。
const GOLDEN_CHECKSUMS: Record<string, string> = {
  architect: "98017d39b0e48cda88b796687d21e0f884c810805e534453a23b7ad935e4a5ef",
  builder:   "5c2acda3e48dae771c61f55d3a5b0d5ac7383870054ef71e757714e367c50031",
  // ... 所有代理
}

describe("Agent prompt regression (XSPEC-162)", () => {
  for (const [agent, expected] of Object.entries(GOLDEN_CHECKSUMS)) {
    it(`agents/${agent}/prompt.md checksum matches golden`, () => {
      const filePath = join(__dirname, "..", "..", "agents", agent, "prompt.md")
      const content = readFileSync(filePath)
      const actual = createHash("sha256").update(content).digest("hex")
      expect(actual, `Prompt for '${agent}' changed unexpectedly. If intentional, update GOLDEN_CHECKSUMS with a comment.`).toBe(expected)
    })
  }
})
```

### 3. CI 整合

校驗和測試作為標準 `npm run test:coverage` 閘門的一部分執行（已透過 XSPEC-156 強制執行）。不需要額外的 CI 步驟。

### 4. 更新校驗和

當 prompt 變更為刻意行為時：

```typescript
// 之前：
architect: "98017d39...",  // updated 2026-05-05: added Guardian policy XSPEC-160 reference
```

說明註解是必填的。在程式碼審查時，應拒絕未附說明註解即更新校驗和的 PR。

## 相關標準

- [LLM 輸出驗證](../../../core/llm-output-validation.md) — schema 層級驗證
- [對抗性測試](../../../core/adversarial-test.md) — 紅隊語料庫
- [測試標準](../../../core/testing-standards.md) — 整體測試金字塔


**Scope**: universal
