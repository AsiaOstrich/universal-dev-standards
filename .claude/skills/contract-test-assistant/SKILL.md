---
source: ../../../../skills/contract-test-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-26
status: current
description: "[UDS] 引導 API 和微服務的合約測試策略"
name: contract-test
allowed-tools: Read, Write, Glob, Grep
scope: universal
argument-hint: "[verify | consumer | provider | 策略選擇]"
---

# 合約測試助手

> **語言**: [English](../../../../skills/contract-test-assistant/SKILL.md) | 繁體中文

引導 API 和微服務的合約測試策略選擇、設定和驗證。

## 策略選擇

| 策略 | 適用場景 | 工具 |
|------|---------|------|
| **消費者驅動** | 內部微服務，團隊同時擁有兩端 | Pact |
| **提供者驅動** | 公開 API，OpenAPI 優先設計 | OpenAPI + Prism |
| **雙向** | 混合所有權，漸進採用 | Pact + OpenAPI |

## 工作流程

```
ASSESS ──► CHOOSE ──► DEFINE ──► IMPLEMENT ──► VERIFY
  評估架構    選擇策略    定義合約     實作測試      驗證合約
```

## 指令

| 指令 | 說明 |
|------|------|
| `/contract-test` | 互動式策略選擇 |
| `/contract-test consumer` | 引導消費者測試設定 |
| `/contract-test provider` | 引導提供者測試設定 |
| `/contract-test verify` | 檢查合約覆蓋率 |

## 下一步引導

> **合約測試引導完成。建議下一步：**
> - 執行 `/ci-cd` 將合約驗證加入 CI 管線
> - 執行 `/api-design` 完善 API 設計
> - 執行 `/testing` 整合到整體測試策略

## 參考

- 詳細指南：[contract-testing.md](../../../../options/testing/contract-testing.md)
- 技能指南：[guide.md](./guide.md)
