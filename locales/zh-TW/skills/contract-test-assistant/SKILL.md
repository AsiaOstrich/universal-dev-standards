---
name: contract-test-assistant
source: ../../../../skills/contract-test-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-26
status: current
description: "[UDS] 引導 API 和微服務的合約測試策略"
---

# 合約測試助手

> **語言**: [English](../../../../skills/contract-test-assistant/SKILL.md) | 繁體中文

引導 API 和微服務的合約測試策略選擇、設定和驗證。

## 指令

| 指令 | 說明 |
|------|------|
| `/contract-test` | 互動式策略選擇 |
| `/contract-test consumer` | 引導消費者測試設定 |
| `/contract-test provider` | 引導提供者測試設定 |
| `/contract-test verify` | 檢查合約覆蓋率 |

## 參考

- 詳細指南：[contract-testing.md](../../../../options/testing/contract-testing.md)
- 技能指南：[guide.md](./guide.md)


## Next Steps Guidance | 下一步引導

After `/contract-test` completes:

> **合約測試引導完成。建議下一步：**
> - 執行 `/ci-cd` 將合約驗證加入 CI 管線
> - 執行 `/api-design` 完善 API 設計
> - 執行 `/testing` 整合到整體測試策略

## Reference | 參考

- Detailed guide: [contract-testing.md](../../options/testing/contract-testing.md)
- Related: [api-design-assistant](../api-design-assistant/SKILL.md)

## AI Agent Behavior | AI 代理行為

When `/contract-test` is invoked:
1. **Assess** — Ask about architecture (monolith, microservices, number of APIs)
2. **Recommend** — Suggest strategy based on architecture
3. **Guide** — Walk through setup for chosen strategy
4. **Generate** — Create example contract test files
5. **Verify** — If `verify` subcommand, scan for contracts and report coverage
