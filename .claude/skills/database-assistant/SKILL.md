---
source: ../../../../skills/database-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-23
status: current
description: "[UDS] 引導資料庫設計、遷移規劃和查詢最佳化"
name: database
allowed-tools: Read, Grep, Glob
scope: universal
argument-hint: "[schema or migration to review | 要審查的 schema 或遷移]"
---

# 資料庫助手

> **語言**: [English](../../../../skills/database-assistant/SKILL.md) | 繁體中文

引導資料庫設計、遷移規劃和查詢最佳化。

## 核心原則

| 原則 | 說明 |
|------|------|
| 正規化 | 消除冗餘（至少 3NF） |
| 參照完整性 | 強制外鍵約束 |
| 索引策略 | 依查詢模式建立索引 |
| 遷移安全 | 可逆、零停機 |
| 資料保護 | 加密敏感欄位、稽核存取 |

## Schema 設計檢查清單

- [ ] 主鍵已定義（建議 UUID 或 BIGINT）
- [ ] 外鍵含適當的 ON DELETE/UPDATE 策略
- [ ] 必填欄位加 NOT NULL 約束
- [ ] 常查詢欄位建立索引
- [ ] 所有表加建立/更新時間戳
- [ ] 敏感資料靜態加密
- [ ] 命名慣例一致（snake_case）

## 正規化快速參考

| 正規形式 | 規則 |
|----------|------|
| **1NF** | 原子值、無重複群組 |
| **2NF** | 1NF + 無部分相依 |
| **3NF** | 2NF + 無遞移相依 |
| **反正規化** | 僅針對已證實的讀取效能需求 |

## 遷移工作流程

```
PLAN ──► WRITE ──► TEST ──► DEPLOY ──► VERIFY
```

### 1. Plan — 評估影響
識別受影響的表、估算資料量、規劃回滾策略。

### 2. Write — 撰寫遷移
撰寫正向和回滾腳本。使用遞增編號的遷移。

### 3. Test — 驗證遷移
在 staging 環境使用類生產資料執行。驗證遷移後資料完整性。

### 4. Deploy — 執行遷移
在維護窗口執行，或使用線上 Schema 變更工具。

### 5. Verify — 確認成功
檢查列數、約束有效性、應用程式功能。

## 索引策略

| 類型 | 使用場景 |
|------|----------|
| B-tree | 等值、範圍查詢（預設） |
| Hash | 僅精確匹配 |
| GIN | 全文搜尋、JSONB |
| Partial | 過濾子集 |
| Composite | 多欄位查詢 |

## 使用方式

- `/database` - 互動式資料庫設計引導
- `/database schema` - 審查 Schema 設計
- `/database --migration` - 遷移規劃助手

## 下一步引導

`/database` 完成後，AI 助手應建議：

> **資料庫設計完成。建議下一步：**
> - 執行 `/security` 檢查資料保護措施
> - 執行 `/testing` 規劃資料庫測試策略
> - 執行 `/checkin` 確認遷移符合提交規範
> - 產生 API 端點 → 執行 `/api-design`

## 參考

- 核心規範：[database-standards.md](../../../../core/database-standards.md)
