---
source: ../../../core/prompt-regression.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 418f48be7045
status: current
---

# Prompt 回归测试标准

> **语言**: [English](../../../core/prompt-regression.md) | [繁體中文](../../zh-TW/core/prompt-regression.md) | 简体中文

---

## 概述

AI 代理的 prompt 即代码。未预期的变更会悄悄降低代理行为质量，却不会触发类型错误或单元测试失败。Prompt 回归测试利用 SHA-256 黄金校验和（golden checksum）检测任何修改，强制开发者明确确认并记录每次 prompt 变更。

## 为什么要使用校验和

- 仅有 diff 不能阻止 CI 流程——校验和可以
- Prompt 是大型 Markdown 文件；细微的编辑（空白字符、标点符号）都可能改变模型行为
- 校验和更新 + 说明注释会建立每次 prompt 变更原因的审计轨迹

## 实现方式

### 1. 计算初始校验和

```bash
for f in agents/*/prompt.md; do
  echo -n "$f: "
  sha256sum "$f" | cut -d' ' -f1
done
```

### 2. 黄金校验和测试（Vitest）

```typescript
// SPDX-License-Identifier: AGPL-3.0-only
import { createHash } from "crypto"
import { readFileSync } from "fs"
import { join } from "path"
import { describe, it, expect } from "vitest"

// 仅在 prompt 变更为刻意行为时才更新这些值。
// 在同一行加上说明 WHY prompt 发生变更的注释。
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

### 3. CI 集成

校验和测试作为标准 `npm run test:coverage` 闸门的一部分执行（已通过 XSPEC-156 强制执行）。不需要额外的 CI 步骤。

### 4. 更新校验和

当 prompt 变更为刻意行为时：

```typescript
// 之前：
architect: "98017d39...",  // updated 2026-05-05: added Guardian policy XSPEC-160 reference
```

说明注释是必填的。在代码审查时，应拒绝未附说明注释即更新校验和的 PR。

## 相关标准

- [LLM 输出验证](../../../core/llm-output-validation.md) — schema 层级验证
- [对抗性测试](../../../core/adversarial-test.md) — 红队语料库
- [测试标准](../../../core/testing.md) — 整体测试金字塔


**Scope**: universal
