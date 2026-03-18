---
source: ../../../core/database-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-18
status: current
---

# 資料庫標準

> **語言**: [English](../../../core/database-standards.md) | 繁體中文

> 版本: 1.0.0 | 最後更新: 2026-03-18

**適用性**: 所有軟體專案
**範圍**: universal
**產業標準**: ISO/IEC 9075 (SQL)、ACID 特性、BASE 定理
**參考資源**: [use-the-index-luke.com](https://use-the-index-luke.com/)、[sqlstyle.guide](https://www.sqlstyle.guide/)

---

## 目的

本標準定義資料庫設計、查詢、遷移與維運的指導方針，涵蓋關聯式與非關聯式資料庫。包含 Schema 設計原則、索引策略、遷移工作流程、查詢最佳化、交易管理與資料完整性 — 確保資料庫具備高效能、可維護且安全的特性。

**參考標準**:
- [ISO/IEC 9075 — SQL 標準](https://www.iso.org/standard/76583.html)
- [Use The Index, Luke — SQL 索引與調校](https://use-the-index-luke.com/)
- [Martin Fowler — 演進式資料庫設計](https://martinfowler.com/articles/evodb.html)
- [Designing Data-Intensive Applications (Martin Kleppmann)](https://dataintensive.net/)

---

## 核心原則

| 原則 | 說明 |
|------|------|
| **資料完整性優先** | 約束、驗證與參照完整性在資料庫層級強制執行，而非僅在應用程式碼 |
| **Schema 即程式碼** | 資料庫 Schema 透過遷移腳本進行版本控制且可重現 |
| **最小權限** | 資料庫帳號使用其功能所需的最低權限 |
| **先量測再調校** | 使用 EXPLAIN 計畫與指標後再進行最佳化；避免過早最佳化 |
| **縱深防禦** | 在多個層級使用加密、遮罩與存取控制來保護敏感資料 |
| **向後相容** | Schema 變更必須在部署視窗期間維持向後相容 |

---

## Schema 設計原則

### 正規化

套用正規化以消除冗餘並確保資料完整性。以第三正規形式（3NF）作為交易系統的基準。

| 正規形式 | 規則 | 違反範例 |
|----------|------|----------|
| **1NF** | 僅原子值；無重複群組 | 單一欄位中 `tags = "java,python,go"` |
| **2NF** | 1NF + 複合鍵無部分相依 | 非鍵欄位僅依賴複合主鍵的一部分 |
| **3NF** | 2NF + 無遞移相依 | `order.customer_name` 透過 `customer_id` 從 `customer.name` 衍生 |

### 反正規化決策矩陣

反正規化以完整性換取讀取效能。需刻意為之並記錄權衡考量。

| 判斷條件 | 正規化 | 反正規化 |
|----------|--------|----------|
| 讀寫比例 | 寫入密集或平衡 | 讀取密集（>90% 讀取） |
| 資料一致性 | 關鍵（財務、醫療） | 可接受最終一致性 |
| 查詢複雜度 | 可接受的 JOIN 效能 | JOIN 導致不可接受的延遲 |
| 資料異動頻率 | 經常更新 | 建立後很少變更 |
| 儲存成本 | 最小化重複 | 儲存便宜；速度是優先考量 |

**進行反正規化時：**
- 記錄資料來源（source of truth）與同步機制
- 加入註解說明選擇反正規化的原因
- 實作一致性檢查或校正排程

### 命名慣例

| 元素 | 慣例 | 範例 |
|------|------|------|
| 資料表 | `snake_case`，單數 | `user_account`、`order_item` |
| 欄位 | `snake_case` | `first_name`、`created_at` |
| 主鍵 | `id` | `user_account.id` |
| 外鍵 | `<被參照資料表>_id` | `order.user_account_id` |
| 布林欄位 | `is_` 或 `has_` 前綴 | `is_active`、`has_verified_email` |
| 時間戳記 | `_at` 後綴 | `created_at`、`updated_at`、`deleted_at` |
| 索引 | `idx_<資料表>_<欄位>` | `idx_user_account_email` |
| 唯一約束 | `uq_<資料表>_<欄位>` | `uq_user_account_email` |
| 檢查約束 | `ck_<資料表>_<描述>` | `ck_order_positive_amount` |

### 保留字

- 避免使用 SQL 保留字作為識別符號（`order`、`user`、`group`、`select`）
- 若無法避免，加上實體類型後綴：`user_account`、`order_record`、`user_group`

---

## 資料型別

### 選擇適當型別

| 場景 | 建議 | 避免 |
|------|------|------|
| 金額值 | `DECIMAL(19,4)` 或 `NUMERIC` | `FLOAT`、`DOUBLE`（精度損失） |
| 日期時間 | `TIMESTAMPTZ`（含時區） | `VARCHAR` 儲存日期 |
| 布林旗標 | `BOOLEAN` | `INT` (0/1)、`CHAR(1)` ('Y'/'N') |
| 短文字 (< 255) | `VARCHAR(n)` 含適當長度 | `TEXT` 用於已知長度欄位 |
| 長文字 | `TEXT` | `VARCHAR(MAX)` 或過大的 `VARCHAR` |
| IP 位址 | 原生 IP 型別或 `INET` | `VARCHAR(45)` |
| JSON 資料 | `JSONB` (PostgreSQL) 或原生 JSON | `TEXT` 儲存 JSON 字串 |
| 列舉值 | `ENUM` 型別或查詢表 | 字串化的值 |

### UUID vs 自動遞增

| 因素 | 自動遞增 | UUID |
|------|----------|------|
| 儲存大小 | 4-8 bytes | 16 bytes |
| 索引效能 | 較佳（循序寫入） | 較差（隨機插入造成 B-tree 碎片） |
| 分散式生成 | 需要協調 | 無需協調 |
| 安全性 | 可預測（可列舉） | 不可猜測 |
| URL 暴露 | 揭露記錄數量 | 可安全用於公開 URL |
| 合併/複寫 | 容易衝突 | 無衝突 |

**建議：**
- 單一資料庫系統的內部 ID 使用**自動遞增**
- 分散式系統或公開暴露的 ID 使用 **UUIDv7**（時間排序）
- 新專案考慮以 **UUIDv7** 為預設 — 兼具可排序性與唯一性

```sql
-- PostgreSQL：UUIDv7 作為主鍵
CREATE TABLE user_account (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email      VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 自動遞增替代方案
CREATE TABLE user_account (
    id         BIGSERIAL PRIMARY KEY,
    public_id  UUID NOT NULL DEFAULT gen_random_uuid(),
    email      VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

---

## 索引策略

### 何時建立索引

| 建立索引的時機 | 避免建立索引的時機 |
|---------------|-------------------|
| 欄位經常出現在 `WHERE` 子句中 | 資料表少於 1,000 列 |
| 欄位用於 `JOIN` 條件 | 欄位基數極低（如布林值） |
| 欄位用於 `ORDER BY` | 資料表為寫入密集且很少讀取 |
| 欄位用於 `GROUP BY` | 欄位經常更新 |
| 需要唯一約束 | 每張資料表已超過 8 個索引 |

### 複合索引欄位順序

複合索引的欄位順序影響重大。遵循**等值優先、範圍最後**規則：

```sql
-- 查詢模式：
-- WHERE status = 'active' AND created_at > '2026-01-01' ORDER BY created_at

-- 正確：等值欄位在前，範圍/排序欄位在後
CREATE INDEX idx_order_status_created ON order_record (status, created_at);

-- 錯誤：範圍欄位在前，削弱等值篩選效果
CREATE INDEX idx_order_created_status ON order_record (created_at, status);
```

**欄位順序規則：**
1. 等值條件（`=`）優先
2. `IN` 條件其次
3. 範圍條件（`>`、`<`、`BETWEEN`）最後
4. `ORDER BY` 欄位放末端（若符合排序方向）

### 覆蓋索引

覆蓋索引包含查詢所需的所有欄位，實現僅索引掃描：

```sql
-- 查詢：SELECT email, first_name FROM user_account WHERE status = 'active';

-- 覆蓋索引 — 無需回表查詢
CREATE INDEX idx_user_account_status_covering
    ON user_account (status) INCLUDE (email, first_name);
```

### 部分索引

對資料列的子集建立索引，以減少索引大小並改善寫入效能：

```sql
-- 僅索引活躍記錄（90% 的查詢篩選 active）
CREATE INDEX idx_order_active
    ON order_record (created_at)
    WHERE status = 'active';

-- 僅索引非 NULL 值
CREATE INDEX idx_user_account_phone
    ON user_account (phone_number)
    WHERE phone_number IS NOT NULL;
```

### 索引反模式

| 反模式 | 問題 | 解決方案 |
|--------|------|----------|
| **過度索引** | 拖慢寫入、浪費儲存空間 | 每季審查索引；移除未使用的 |
| **未使用的索引** | 有維護成本但無讀取收益 | 監控 `pg_stat_user_indexes` 或同等工具 |
| **重複索引** | 多餘的開銷 | 索引 `(a, b)` 已涵蓋 `(a)` 的查詢 |
| **低基數欄位索引** | 全表掃描通常更快 | 改用部分索引或 Bitmap 索引 |
| **FK 缺少索引** | CASCADE 刪除與 JOIN 變慢 | 務必為外鍵欄位建立索引 |
| **索引欄位上使用函式** | 索引被繞過 | 建立函式/表達式索引 |

```sql
-- 反模式：函式阻止索引使用
SELECT * FROM user_account WHERE LOWER(email) = 'test@example.com';

-- 解決方案：表達式索引
CREATE INDEX idx_user_account_email_lower ON user_account (LOWER(email));
```

---

## 遷移策略

### 原則

| 原則 | 說明 |
|------|------|
| **版本控制** | 所有遷移與應用程式碼一同儲存在版本控制系統 |
| **循序執行** | 遷移以確定性順序執行 |
| **冪等性** | 執行兩次遷移產生相同結果 |
| **已測試** | 遷移在部署前以類生產資料量進行測試 |
| **有文件** | 每次遷移包含變更內容與原因的說明 |

### 命名慣例

```
YYYYMMDDHHMMSS_description.sql

範例：
20260318120000_create_user_account_table.sql
20260318120100_add_email_index_to_user_account.sql
20260318120200_add_phone_column_to_user_account.sql
```

### 正向遷移 vs 可逆遷移

| 方式 | 優點 | 缺點 | 適用時機 |
|------|------|------|----------|
| **可逆** (up/down) | 容易回滾、較安全 | 需維護更多程式碼、部分變更不可逆 | 開發環境、非破壞性變更 |
| **正向** | 較簡單、符合現實 | 需另外的回滾遷移 | 生產環境、破壞性變更 |

**建議：** 預設使用可逆遷移。對於破壞性操作（刪除欄位、刪除資料表），使用正向遷移並搭配獨立的回滾遷移檔案。

### 零停機遷移模式（Expand-Contract）

適用於無法容忍停機的系統 Schema 變更：

**第一階段 — Expand（向後相容）**
```sql
-- 新增欄位（可為 NULL，尚無約束）
ALTER TABLE user_account ADD COLUMN phone VARCHAR(20);
```

**第二階段 — Migrate（雙寫）**
```sql
-- 回填現有資料
UPDATE user_account SET phone = legacy_phone WHERE phone IS NULL;
```

**第三階段 — Contract（所有消費者更新後）**
```sql
-- 所有資料已填入後加入約束
ALTER TABLE user_account ALTER COLUMN phone SET NOT NULL;
-- 移除舊欄位（僅在確認無消費者使用後）
ALTER TABLE user_account DROP COLUMN legacy_phone;
```

### 回滾策略

| 場景 | 回滾方式 |
|------|----------|
| 新增欄位 | 移除該欄位 |
| 新增索引 | 移除該索引 |
| 新增資料表 | 移除該資料表 |
| 移除欄位 | 無法復原 — 需從備份還原或重新新增 |
| 資料轉換 | 執行反向轉換（若有設計） |
| 重新命名欄位 | 重新命名回來 |

**關鍵規則：** 絕不在停止寫入的同一次部署中移除欄位或資料表。使用 Expand-Contract 模式。

---

## 查詢最佳實踐

### N+1 查詢預防

N+1 問題發生在程式碼執行一個查詢取得清單，再對每個項目額外執行 N 個查詢。

```sql
-- N+1 問題（應用程式發出 N 個查詢）
-- 查詢 1：SELECT * FROM order_record WHERE user_id = 42;
-- 查詢 2..N：SELECT * FROM order_item WHERE order_id = ?;  (對每筆訂單)

-- 解決方案：JOIN 或子查詢
SELECT o.*, oi.*
FROM order_record o
JOIN order_item oi ON oi.order_id = o.id
WHERE o.user_id = 42;

-- 或批次載入
SELECT * FROM order_item
WHERE order_id IN (SELECT id FROM order_record WHERE user_id = 42);
```

### EXPLAIN 計畫使用

對以下查詢務必分析執行計畫：
- 每分鐘執行超過 100 次的查詢
- 執行時間 > 100ms 的查詢
- 涉及超過 10,000 列的查詢
- 部署前的任何新查詢

```sql
-- PostgreSQL
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM order_record WHERE status = 'pending' AND created_at > '2026-01-01';

-- 需關注的指標：
-- 大型資料表的 Seq Scan     → 缺少索引
-- 高列數的 Nested Loop      → 考慮 Hash Join
-- 高成本的 Sort             → 加入符合 ORDER BY 的索引
-- 列數（估計 vs 實際）       → 統計資料過時，執行 ANALYZE
```

### 分頁

| 方法 | 優點 | 缺點 | 適用時機 |
|------|------|------|----------|
| **Offset 分頁** | 簡單、支援隨機頁面存取 | 大 Offset 時效能差、並行寫入時結果不一致 | 小型資料集、管理後台 |
| **Keyset（游標）分頁** | 效能一致、結果穩定 | 無法隨機跳頁、多欄排序時較複雜 | API、無限捲動、大型資料集 |

```sql
-- Offset 分頁（大型資料表應避免）
SELECT * FROM order_record ORDER BY id LIMIT 20 OFFSET 10000;
-- 效能劣化：資料庫須掃描並丟棄 10,000 列

-- Keyset 分頁（建議使用）
SELECT * FROM order_record
WHERE id > :last_seen_id
ORDER BY id
LIMIT 20;
-- 無論頁面深度，效能一致
```

### 查詢反模式

| 反模式 | 問題 | 解決方案 |
|--------|------|----------|
| `SELECT *` | 取得不必要的資料、Schema 變更時可能中斷 | 明確列出所需欄位 |
| 查詢中的字串串接 | SQL 注入漏洞 | 使用參數化查詢 / Prepared Statement |
| 不同欄位的 `OR` | 阻止索引使用 | 使用 `UNION ALL` 或重構查詢 |
| `NOT IN` 含 NULL | 非預期的空結果 | 改用 `NOT EXISTS` |
| 隱含型別轉換 | 繞過索引、結果錯誤 | 明確轉型 |
| `LIKE '%prefix'` | 前導萬用字元阻止索引使用 | 使用全文搜索或反向索引 |

```sql
-- 反模式：SQL 注入風險
query = "SELECT * FROM user_account WHERE email = '" + email + "'";

-- 正確：參數化查詢
query = "SELECT * FROM user_account WHERE email = $1";
params = [email];
```

---

## 交易管理

### ACID 特性

| 特性 | 說明 | 實施方式 |
|------|------|----------|
| **原子性 (Atomicity)** | 所有操作成功或全部失敗 | 使用交易；避免部分提交 |
| **一致性 (Consistency)** | 資料庫從一個有效狀態轉移到另一個 | 在資料庫層級強制約束 |
| **隔離性 (Isolation)** | 並行交易不互相干擾 | 選擇適當的隔離等級 |
| **持久性 (Durability)** | 已提交的資料在系統故障後存活 | 使用 WAL（預寫日誌）；確認同步寫入 |

### 隔離等級

| 等級 | 髒讀 | 不可重複讀 | 幻讀 | 效能 | 使用場景 |
|------|------|-----------|------|------|----------|
| **Read Uncommitted** | 可能 | 可能 | 可能 | 最快 | 不建議使用 |
| **Read Committed** | 防止 | 可能 | 可能 | 快 | 大多數 RDBMS 的預設；一般用途查詢 |
| **Repeatable Read** | 防止 | 防止 | 可能 | 中等 | 財務報表、庫存檢查 |
| **Serializable** | 防止 | 防止 | 防止 | 最慢 | 金錢轉帳、訂位系統 |

**建議：** 使用 **Read Committed** 作為預設。僅在需要嚴格一致性的操作（如帳戶餘額更新、座位預訂）時提升至 **Repeatable Read** 或 **Serializable**。

### 死鎖預防

| 策略 | 實施方式 |
|------|----------|
| **一致的鎖定順序** | 在所有交易中以相同順序取得資料表/列的鎖定 |
| **短交易** | 盡可能保持交易簡短；將非資料庫工作移出交易外 |
| **鎖定逾時** | 設定 `lock_timeout` 以快速失敗而非無限等待 |
| **重試邏輯** | 對死鎖錯誤（SQLSTATE 40P01）實作指數退避重試 |
| **避免使用者互動** | 絕不在等待使用者輸入時保持交易開啟 |

```sql
-- 設定鎖定逾時以防止無限等待
SET lock_timeout = '5s';

-- 保持交易簡短
BEGIN;
    UPDATE account SET balance = balance - 100 WHERE id = 1;
    UPDATE account SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

### 樂觀鎖定 vs 悲觀鎖定

| 因素 | 樂觀鎖定 | 悲觀鎖定 |
|------|----------|----------|
| 機制 | 寫入時檢查版本欄位/時間戳記 | `SELECT ... FOR UPDATE` 取得列鎖定 |
| 衝突率 | 低衝突環境 | 高衝突環境 |
| 效能 | 衝突罕見時較佳 | 衝突頻繁時較佳 |
| 使用者體驗影響 | 使用者可能看到「其他人已修改」錯誤 | 使用者可能等待鎖定釋放 |
| 死鎖風險 | 無 | 可能 |

```sql
-- 樂觀鎖定
UPDATE order_record
SET status = 'shipped', version = version + 1
WHERE id = 42 AND version = 3;
-- 若受影響列數 = 0，表示另一個交易已修改 → 重試或錯誤

-- 悲觀鎖定
BEGIN;
SELECT * FROM order_record WHERE id = 42 FOR UPDATE;
-- 列已鎖定；其他交易等待
UPDATE order_record SET status = 'shipped' WHERE id = 42;
COMMIT;
```

---

## SQL vs NoSQL 決策矩陣

| 判斷條件 | 關聯式 (SQL) | 文件型 (NoSQL) | 鍵值型 | 圖形型 |
|----------|-------------|---------------|--------|--------|
| **資料結構** | 結構化、明確定義的 Schema | 半結構化、彈性 Schema | 簡單的 key→value 配對 | 高度連結的實體 |
| **一致性** | 強一致（ACID） | 最終一致（BASE），部分支援 ACID | 最終一致 | 依實作而異 |
| **查詢複雜度** | 複雜 JOIN、聚合 | 簡單查詢、巢狀文件 | 單鍵查詢 | 關係遍歷 |
| **擴展模式** | 垂直擴展（scale-up） | 水平擴展（scale-out） | 水平擴展 | 依實作而異 |
| **Schema 變更** | 需要遷移 | 無 Schema / 彈性 | 無 Schema | Schema 可選 |
| **範例用途** | 財務系統、ERP、CRM | 內容管理、使用者檔案、產品目錄 | 快取、Session、速率限制 | 社交網路、推薦、詐騙偵測 |
| **範例資料庫** | PostgreSQL、MySQL、SQL Server | MongoDB、CouchDB、DynamoDB | Redis、Memcached、DynamoDB | Neo4j、Amazon Neptune |

### 決策指南

```
你的資料是否高度關聯且需要複雜查詢？
├── 是 → 關聯式 (SQL)
└── 否 → 你的資料是否為簡單的鍵值配對？
          ├── 是 → 鍵值型儲存
          └── 否 → 關係是否為主要的查詢模式？
                    ├── 是 → 圖形資料庫
                    └── 否 → 文件型資料庫
```

**Polyglot Persistence（多語言持久化）：** 許多系統受益於使用多種資料庫類型。範例：
- **PostgreSQL** 用於交易資料（訂單、帳戶）
- **Redis** 用於快取與 Session
- **Elasticsearch** 用於全文搜索
- **Neo4j** 用於推薦引擎

---

## 連線管理

### 連線池

每個應用程式都必須使用連線池。每次請求建立新的資料庫連線代價極高（TCP 握手、認證、SSL 協商）。

| 參數 | 建議預設值 | 說明 |
|------|-----------|------|
| **最小池大小** | 2-5 | 維持的最少閒置連線數 |
| **最大池大小** | 10-20 | 最大並行連線數 |
| **連線逾時** | 5 秒 | 等待從池取得連線的時間 |
| **閒置逾時** | 10 分鐘 | 超過此時間關閉閒置連線 |
| **最大存活時間** | 30 分鐘 | 回收連線以防止狀態過時 |
| **驗證查詢** | `SELECT 1` | 返回連線前的健康檢查 |

### 池大小公式

最大連線池大小的常用公式：

```
pool_size = (core_count * 2) + effective_spindle_count

範例：
- 4 核心伺服器，SSD：    (4 * 2) + 1 = 9-10 個連線
- 8 核心伺服器，SSD：    (8 * 2) + 1 = 17 個連線
- 4 核心伺服器，4 HDD：  (4 * 2) + 4 = 12 個連線
```

**重要：** 更多連線不一定更好。過多連線會導致：
- 資料庫中的執行緒競爭
- 記憶體壓力（每個連線使用約 5-10 MB）
- 增加上下文切換

### 健康檢查

```sql
-- 基本健康檢查
SELECT 1;

-- 進階健康檢查（驗證讀寫能力）
SELECT NOW();

-- 使用前的連線驗證
SET statement_timeout = '2s';
SELECT 1;
```

---

## 資料完整性

### 約束

務必在資料庫層級強制資料完整性。應用程式層級的驗證是補充，不是替代。

| 約束 | 用途 | 範例 |
|------|------|------|
| `NOT NULL` | 防止缺少必要資料 | `email VARCHAR(255) NOT NULL` |
| `UNIQUE` | 防止重複值 | `UNIQUE (email)` |
| `CHECK` | 驗證值範圍/格式 | `CHECK (amount > 0)` |
| `FOREIGN KEY` | 強制參照完整性 | `REFERENCES user_account(id)` |
| `DEFAULT` | 提供合理的預設值 | `DEFAULT NOW()` |
| `EXCLUSION` | 防止範圍重疊 | `EXCLUDE USING gist (room WITH =, period WITH &&)` |

```sql
CREATE TABLE order_record (
    id              BIGSERIAL PRIMARY KEY,
    user_account_id BIGINT       NOT NULL REFERENCES user_account(id),
    amount          DECIMAL(19,4) NOT NULL CHECK (amount > 0),
    status          VARCHAR(20)   NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

### 串聯規則

| 規則 | 行為 | 適用時機 |
|------|------|----------|
| `CASCADE` | 自動刪除/更新子列 | 強擁有權關係（order → order_items） |
| `SET NULL` | 父列刪除時將 FK 設為 NULL | 可選關係（文章 → 作者刪除時） |
| `SET DEFAULT` | 父列刪除時將 FK 設為預設值 | 重新指派至預設值 |
| `RESTRICT` | 若存在子列則阻止父列刪除 | 保護關鍵參照（user → audit_log） |
| `NO ACTION` | 與 RESTRICT 相同（可延遲檢查） | 預設行為 |

**建議：** 預設使用 `RESTRICT`。僅在父子生命週期緊密耦合時使用 `CASCADE`。

### 軟刪除 vs 硬刪除

| 因素 | 軟刪除 | 硬刪除 |
|------|--------|--------|
| 實作方式 | `deleted_at TIMESTAMPTZ` 欄位 | `DELETE FROM table` |
| 資料復原 | 簡單 — 設定 `deleted_at = NULL` | 需從備份還原 |
| 查詢複雜度 | 每處都須加 `WHERE deleted_at IS NULL` | 查詢較簡單 |
| 儲存 | 隨時間增長 | 回收空間 |
| 合規性 | 保留稽核軌跡 | 可能違反保留要求 |
| 效能 | 大量軟刪除列的大型資料表 | 更乾淨的表統計資料 |

```sql
-- 軟刪除實作
ALTER TABLE user_account ADD COLUMN deleted_at TIMESTAMPTZ;

-- 為活躍記錄建立部分索引
CREATE INDEX idx_user_account_active ON user_account (email) WHERE deleted_at IS NULL;

-- 應用程式查詢模式
SELECT * FROM user_account WHERE deleted_at IS NULL AND email = $1;
```

**建議：** 對面向使用者的資料和任何需要稽核軌跡的內容使用軟刪除。對暫時性資料（Session、臨時 Token、超過保留期的日誌）使用硬刪除。

---

## 備份與復原

### 備份策略類型

| 策略 | 說明 | 備份速度 | 還原速度 | 儲存成本 |
|------|------|----------|----------|----------|
| **完整備份** | 整個資料庫的完整複本 | 最慢 | 最快 | 最高 |
| **增量備份** | 自上次備份以來的變更 | 最快 | 最慢（需完整鏈） | 最低 |
| **差異備份** | 自上次完整備份以來的變更 | 中等 | 中等（完整 + 差異） | 中等 |

### RPO 與 RTO

| 指標 | 定義 | 目標範例 |
|------|------|----------|
| **RPO**（復原點目標） | 可接受的最大資料損失（時間） | 1 小時：每小時備份；0：持續複寫 |
| **RTO**（復原時間目標） | 可接受的最大停機時間 | 15 分鐘：自動容錯切換；4 小時：手動還原 |

### 備份排程建議

| 層級 | RPO | RTO | 策略 |
|------|-----|-----|------|
| **關鍵**（財務、醫療） | < 1 分鐘 | < 15 分鐘 | 同步複寫 + 持續 WAL 歸檔 |
| **重要**（電子商務、SaaS） | < 1 小時 | < 1 小時 | 串流複寫 + 每小時 WAL 歸檔 |
| **標準**（內部工具） | < 24 小時 | < 4 小時 | 每日完整 + 每小時增量 |
| **低**（開發、預備環境） | < 1 週 | < 1 天 | 每週完整備份 |

### 備份測試

| 要求 | 頻率 |
|------|------|
| 還原測試至獨立環境 | 每月 |
| 還原後驗證資料完整性 | 每次還原測試 |
| 量測實際 RTO vs 目標 | 每季 |
| 測試時間點復原 | 每半年 |
| 更新文件與執行手冊 | 每次測試後 |

---

## 敏感資料處理

### 欄位層級加密

```sql
-- 寫入時加密
INSERT INTO user_account (email, ssn_encrypted)
VALUES ($1, pgp_sym_encrypt($2, $encryption_key));

-- 讀取時解密（僅授權角色可執行）
SELECT email, pgp_sym_decrypt(ssn_encrypted, $encryption_key) AS ssn
FROM user_account WHERE id = $1;
```

### 資料分級

| 等級 | 說明 | 範例 | 處理方式 |
|------|------|------|----------|
| **公開** | 無敏感性 | 行銷內容、公開 API | 無特殊處理 |
| **內部** | 業務敏感 | 營收資料、產品路線圖 | 存取控制、禁止公開暴露 |
| **機密** | 個人識別資訊 | Email、電話、地址 | 靜態加密、存取日誌 |
| **限制** | 高度敏感 | 身分證號、信用卡、密碼 | 欄位加密、資料遮罩、嚴格稽核 |

### 資料遮罩

```sql
-- 基於 View 的遮罩，供客服人員使用
CREATE VIEW user_account_masked AS
SELECT
    id,
    LEFT(email, 2) || '***@' || SPLIT_PART(email, '@', 2) AS email,
    '***-**-' || RIGHT(ssn, 4) AS ssn_masked,
    first_name,
    created_at
FROM user_account;

-- 僅授予客服團隊存取遮罩 View 的權限
GRANT SELECT ON user_account_masked TO support_role;
```

### PII 管理檢查清單

- [ ] 識別並編目所有資料表中的 PII 欄位
- [ ] 靜態加密 PII（欄位層級或表空間加密）
- [ ] 傳輸中加密 PII（所有連線使用 TLS）
- [ ] 非生產環境實施資料遮罩
- [ ] 定義並執行保留政策
- [ ] 支援資料主體請求（GDPR 刪除權、存取權）
- [ ] 記錄所有對 PII 欄位的存取
- [ ] 在開發與預備環境中匿名化資料

### 稽核日誌

```sql
-- 稽核日誌資料表
CREATE TABLE audit_log (
    id          BIGSERIAL PRIMARY KEY,
    table_name  VARCHAR(100)  NOT NULL,
    record_id   BIGINT        NOT NULL,
    action      VARCHAR(10)   NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values  JSONB,
    new_values  JSONB,
    changed_by  VARCHAR(100)  NOT NULL,
    changed_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 基於觸發器的稽核（PostgreSQL 範例）
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
        CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END,
        current_user
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

---

## 效能監控

### 慢查詢日誌

| 資料庫 | 設定 | 建議閾值 |
|--------|------|----------|
| PostgreSQL | `log_min_duration_statement` | 200ms（開發）、1000ms（生產） |
| MySQL | `slow_query_log`、`long_query_time` | 1 秒 |
| SQL Server | Extended Events 或 Query Store | 1 秒 |

### 關鍵監控指標

| 指標 | 警告閾值 | 嚴重閾值 | 工具 |
|------|----------|----------|------|
| **活躍連線數** | > 最大值的 70% | > 最大值的 90% | 資料庫儀表板 |
| **快取/緩衝命中率** | < 95% | < 90% | `pg_stat_bgwriter`、InnoDB buffer pool |
| **複寫延遲** | > 1 秒 | > 10 秒 | 複寫監控 |
| **交易速率** | 偏離基線 > 20% | 偏離 > 50% | 應用程式指標 |
| **鎖定等待時間** | 平均 > 1 秒 | > 5 秒 | 鎖定監控查詢 |
| **每分鐘死鎖數** | > 1 | > 5 | 資料庫日誌 |
| **資料表膨脹** | > 20% 死元組 | > 40% 死元組 | `pg_stat_user_tables` |
| **查詢執行時間 (p95)** | > 500ms | > 2 秒 | APM 工具 |

### 查詢計畫分析工作流程

```
1. 識別慢查詢（慢查詢日誌或 APM）
   ↓
2. 在預備環境以類生產資料執行 EXPLAIN ANALYZE
   ↓
3. 查找：
   - 大型資料表的循序掃描 → 加入索引
   - 實際與估計列數差距大 → 執行 ANALYZE（更新統計資料）
   - 大量迭代的 Nested Loop → 重構查詢或加入索引
   - 高成本的排序操作 → 加入符合排序順序的索引
   ↓
4. 套用修正（加入索引、改寫查詢、更新統計資料）
   ↓
5. 重新執行 EXPLAIN ANALYZE 驗證改善
   ↓
6. 部署並在生產環境監控執行時間
```

---

## 快速參考卡

### Schema 設計

```
✅ 所有識別符號使用 snake_case
✅ 單數資料表名稱（user_account，非 user_accounts）
✅ 外鍵使用 _id 後綴
✅ 必有 id、created_at、updated_at 欄位
✅ 在資料庫層級強制約束
✅ 正規化至 3NF，反正規化須有文件記載的理由
```

### 查詢

```
✅ 務必使用參數化查詢
✅ 明確列出所需欄位，而非 SELECT *
✅ 使用 EXPLAIN ANALYZE 進行查詢最佳化
✅ 大型資料集優先使用 Keyset 分頁而非 Offset
✅ 批次操作以預防 N+1 查詢
✅ 設定 statement_timeout 以防止失控查詢
```

### 維運

```
✅ 使用連線池（絕不建立每次請求的連線）
✅ 版本控制所有遷移
✅ 以類生產資料測試遷移
✅ 使用 Expand-Contract 模式進行零停機 Schema 變更
✅ 監控慢查詢、連線數、快取命中率
✅ 定期測試備份還原
```

---

## 相關標準

- [安全標準](../../../core/security-standards.md) — 資料加密、存取控制、PII 處理
- [效能標準](../../../core/performance-standards.md) — 應用程式層級的效能最佳化
- [日誌標準](../../../core/logging-standards.md) — 資料庫操作的結構化日誌
- [部署標準](../../../core/deployment-standards.md) — 資料庫遷移作為部署管線的一部分

---

## 版本歷程

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-03-18 | 初始發布 |

---

## 參考資源

- [ISO/IEC 9075 — SQL 標準](https://www.iso.org/standard/76583.html)
- [Use The Index, Luke](https://use-the-index-luke.com/) — SQL 索引與調校
- [SQL Style Guide](https://www.sqlstyle.guide/) — 一致的 SQL 格式
- [Martin Fowler — 演進式資料庫設計](https://martinfowler.com/articles/evodb.html)
- [Designing Data-Intensive Applications](https://dataintensive.net/) — Martin Kleppmann
- [PostgreSQL 文件](https://www.postgresql.org/docs/)

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
