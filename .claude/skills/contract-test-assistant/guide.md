---
description: |
  引導合約測試策略和實作的詳細指南。
  使用時機：詳細的合約測試設定、Pact/OpenAPI 配置、CI 整合。
  關鍵字：contract test, Pact, OpenAPI, 合約測試, API 合約。
source: ../../../../skills/contract-test-assistant/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-26
status: current
---

# 合約測試助手指南

> **語言**: [English](../../../../skills/contract-test-assistant/guide.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-26
**適用範圍**: 所有有 API 整合的專案
**範疇**: universal

---

## 決策指南

```
你同時擁有消費者和提供者嗎？
├── 是 → 消費者驅動 (Pact)
├── 否，提供者是第三方 → 提供者驅動 (OpenAPI)
└── 混合 → 雙向 (Pact + OpenAPI)
```

## 參考

- 詳細標準：[contract-testing.md](../../../../options/testing/contract-testing.md)
- 技能定義：[SKILL.md](./SKILL.md)
