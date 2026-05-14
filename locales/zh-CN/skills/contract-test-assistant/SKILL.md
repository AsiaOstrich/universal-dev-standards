---
source: ../../../../skills/contract-test-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-26
status: current
description: |
  引导 API 和微服务的合约测试策略。
  使用时机：API 合约、微服务、消费者驱动测试。
  关键字：contract test, Pact, OpenAPI, 合约测试。
---

# 合约测试助手

> **语言**: [English](../../../../skills/contract-test-assistant/SKILL.md) | 简体中文

引导 API 和微服务的合约测试策略选择、设置和验证。

## 指令

| 指令 | 说明 |
|------|------|
| `/contract-test` | 交互式策略选择 |
| `/contract-test consumer` | 引导消费者测试设置 |
| `/contract-test provider` | 引导提供者测试设置 |
| `/contract-test verify` | 检查合约覆盖率 |

## 参考

- 详细指南：[contract-testing.md](../../../../options/testing/contract-testing.md)
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
