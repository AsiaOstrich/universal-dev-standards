---
source: ../../../core/test-data-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-10
status: current
---

# 測試資料標準

> 版本: 1.0.0 | 最後更新: 2026-04-01

## 概述

本文件定義跨所有測試層級的測試資料管理標準，涵蓋資料策略選擇、PII 匿名化、Fixture 與 Schema Migration 同步、測試隔離原則、Factory Pattern 及常見反模式。

---

## 測試資料策略

| 策略 | 說明 | 適用場景 | 測試層級 |
|------|------|---------|---------|
| **Inline Data** | 直接在測試程式碼中定義資料 | 簡單、聚焦的值 | Unit tests |
| **Fixture Files** | 外部 JSON/YAML/SQL 檔案 | 共用參考資料、複雜結構 | Integration tests |
| **Seed Scripts** | 填充資料庫的可執行腳本 | 完整環境設定、真實資料集 | E2E tests |

### 策略選擇指南

```
Unit test?         → Inline data（簡單、自包含）
Integration test?  → Fixture files（共用、結構化）
E2E test?          → Seed scripts（完整環境設定）
```

---

## 資料匿名化規則

測試需要擬真資料時，**絕不使用真實 PII**：

| PII 欄位 | 匿名化技術 | 範例 |
|----------|-----------|------|
| **姓名** | 使用 Faker 或虛構化名 | `John Smith` → `Jane Doe` |
| **Email** | 替換為 `@example.com` | `john@company.com` → `user1@example.com` |
| **電話** | 格式保留遮罩 | `+1-555-123-4567` → `+1-555-000-0001` |
| **地址** | 泛化為虛構地址 | `123 Main St` → `1 Test Ave, Anytown` |
| **ID** | Hash 或 UUID 產生 | `SSN: 123-45-6789` → `ID: test-uuid-0001` |

---

## Fixture 與 Schema Migration 同步

1. **原子更新**：Migration 變更欄位時，同一 commit 更新所有相關 fixture
2. **自動偵測**：CI 驗證 fixture 與當前 schema 一致
3. **Fixture 版本化**：加入 `_schema_version` 欄位
4. **Migration 檢查清單**：PR 範本加入「更新測試 fixture」項目

---

## 測試隔離原則

| 測試層級 | 隔離策略 |
|---------|---------|
| **Unit** | 純函式；mock 外部依賴 |
| **Integration** | Transaction rollback；測試專用 schema |
| **E2E** | 專用測試環境；唯一命名空間資料 |

核心規則：每個測試建立自己的資料、清理自己的資料、無共用可變狀態、可平行執行、冪等。

---

## Factory Pattern

Factory 提供合理預設值，可按測試需求覆寫：

```
function createUser(overrides = {}) {
  return {
    id: generateUUID(),
    name: 'Default User',
    email: 'default@example.com',
    role: 'viewer',
    ...overrides
  };
}
```

最佳實踐：每個實體一個 factory、最小預設值、可組合、無副作用。

---

## 快速參考卡

### 隔離檢查清單
```
[ ] 測試建立自己的資料
[ ] 測試清理自己的資料
[ ] 無共用可變狀態
[ ] 可安全平行執行
[ ] 每次結果相同
```

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。
