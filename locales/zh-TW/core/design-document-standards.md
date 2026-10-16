---
source: ../../../core/design-document-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 984cb17b9a3f
status: current
---

# 設計文件標準

> **語言**: [English](../../../core/design-document-standards.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-04-01
**適用範圍**: 所有軟體專案
**範疇**: universal
**業界標準**: C4 Model, ADR (Architecture Decision Records), IEEE 1016
**參考資料**: [c4model.com](https://c4model.com/), [adr.github.io](https://adr.github.io/)

---

## 概述

本文件定義軟體專案中建立、維護與審查設計文件的標準。涵蓋高階設計（HLD）與低階設計（LLD）結構、文件生命週期管理、採用 C4 Model 的架構圖慣例、設計決策記錄以及系統性設計審查。

良好的設計文件既是溝通工具，也是隨著系統演進的動態產物。

---

## 高階設計（HLD）

高階設計文件記錄全系統層級的架構與策略決策。每份 HLD 應（SHALL）包含以下 6 個章節：

### 1. 概述

**目的**: 定義問題陳述、專案目標與成功標準。

**內容指引**:
- 正在解決的問題及其商業情境
- 範圍內（In-scope）與範圍外（out-of-scope）邊界
- 關鍵成功指標
- 本文件的目標受眾

### 2. 架構

**目的**: 描述系統架構決策與元件關係。

**內容指引**:
- 架構風格（微服務、單體架構、無伺服器等）
- 關鍵元件及其職責
- 技術堆疊選型及其理由
- 架構圖（請參閱 C4 Model 章節）

### 3. 資料流

**目的**: 描述資料如何在系統中流動。

**內容指引**:
- 顯示輸入、轉換與輸出的資料流程圖
- 資料儲存位置與持久化策略
- 資料同步機制（若適用）
- 資料量與吞吐量預估

### 4. API 介面

**目的**: 定義系統對外暴露的外部介面。

**內容指引**:
- API 端點或介面合約
- 驗證與授權模型
- 版本控制策略
- 速率限制與配額政策

### 5. 非功能性需求

**目的**: 定義品質屬性與限制條件。

**內容指引**:
- 效能目標（延遲、吞吐量）
- 可擴展性需求（水平、垂直）
- 可用性與可靠性目標（SLA/SLO）
- 安全性需求與合規限制

### 6. 里程碑

**目的**: 定義實作時程與交付階段。

**內容指引**:
- 各階段劃分與可交付成果
- 各階段之間的相依性
- 風險因素與緩解計畫
- 每個里程碑的 Go/no-go 準則

---

## 低階設計（LLD）

低階設計文件記錄特定元件或模組的詳細實作設計。每份 LLD 應（SHALL）包含以下 5 個章節：

### 1. 元件設計

**目的**: 定義元件的內部結構。

**內容指引**:
- 類別／模組階層與關係
- 介面定義與合約
- 套用的設計模式與理由
- 相依性注入與設定

### 2. 資料模型

**目的**: 定義資料 Schema 與關係。

**內容指引**:
- 實體關聯圖（Entity-relationship diagrams）
- 資料庫 Schema 定義（資料表、欄位、型別、條件約束）
- 索引策略與查詢最佳化考量
- 資料遷移策略（若修改現有 Schema）

### 3. 演算法細節

**目的**: 描述關鍵演算法與其複雜度。

**內容指引**:
- 演算法虛擬碼或逐步說明
- 時間與空間複雜度分析（Big-O 符號）
- 極端案例與邊界條件
- 效能基準或預期指標

### 4. 錯誤處理

**目的**: 定義錯誤情境與復原策略。

**內容指引**:
- 錯誤分類（暫態、永久、部分）
- 重試政策與斷路器（circuit breaker）設定
- 備援行為與溫和降級（graceful degradation）
- 錯誤傳遞與對使用者顯示的錯誤訊息

### 5. 測試策略

**目的**: 定義元件的測試方法。

**內容指引**:
- 單元測試範疇與關鍵測試案例
- 整合測試邊界
- 外部相依性的 Mock/stub 策略
- 效能測試情境（若適用）

---

## 文件生命週期

設計文件應（SHALL）遵循具備明確狀態與轉換的管理生命週期。

### 生命週期狀態

```
Draft → In Review → Approved → Implemented → Archived
```

| 狀態 | 定義 | 進入條件 | 退出條件 | 負責人 |
|-------|-----------|-----------------|----------------|-------------|
| **Draft** | 初始建立與迭代 | 作者開始撰寫 | 作者提交審查 | 作者 |
| **In Review** | 進行同儕審查與回饋 | 已提交審查 | 所有審查者核准或拒絕 | 審查者 |
| **Approved** | 接受進行實作 | 審查通過 | 實作開始 | 技術主管／架構師 |
| **Implemented** | 設計已實現於程式碼中 | 程式碼符合設計 | 系統於生產環境穩定運作 | 開發團隊 |
| **Archived** | 不再活躍；保留供參考 | 系統退役或設計被取代 | 不適用 | 作者／技術主管 |

### 轉換規則

- **Draft → In Review**: 作者確認文件完整度已足以進行有意義的審查
- **In Review → Draft**: 審查者要求大幅修改；作者進行修訂
- **In Review → Approved**: 所有必要的審查者皆已核准；無遺留的阻擋問題（blocking issues）
- **Approved → Implemented**: 實作符合已核准的設計
- **Implemented → Archived**: 系統退役或新設計取代此文件
- **任何狀態 → Archived**: 文件廢棄放棄（必須記錄原因）

---

## 架構圖

### C4 Model

設計文件應（SHALL）採用 C4 Model 繪製架構圖，提供四個抽象層次。

| 層次 | 名稱 | 範疇 | 適用情境 | 必要元素 |
|-------|------|-------|---------------------|-------------------|
| **L1** | **Context** | 系統與外部參與者 | 利害關係人溝通、專案啟動 | 系統邊界、使用者、外部系統、關聯性 |
| **L2** | **Container** | 應用程式與資料存放區 | 技術概覽、部署規劃 | 應用程式、資料庫、訊息佇列、通訊協定 |
| **L3** | **Component** | 內部元件 | 開發者上手引導、詳細設計 | 類別／模組、介面、相依性 |
| **L4** | **Code** | 類別／模組層級細節 | 複雜演算法文件說明 | UML 類別圖、循序圖 |

### 圖表指引

- **從 L1 開始**: 在深入探討之前，一律先從 Context 圖開始
- **並非所有層次皆為必要**: 大多數專案使用 L1 與 L2 即可；僅在複雜度需要時才使用 L3 與 L4
- **保持圖表最新**: 架構變更時應同步更新圖表
- **使用一致的表示法**: 遵循形狀、顏色與標籤的 C4 Model 慣例

---

## 設計決策記錄

每個重要的設計決策皆應採用以下格式記錄。

### 必要欄位

| 欄位 | 目的 | 內容 |
|-------|---------|---------|
| **Options** | 已考慮的可用替代方案 | 列出每個選項並附上簡要描述、優點與缺點 |
| **Decision** | 所選選項 | 說明選中了哪個選項 |
| **Rationale** | 決策背後的理由 | 解釋為何選擇此選項而非其他替代方案 |

### 補充欄位

| 欄位 | 目的 | 內容 |
|-------|---------|---------|
| **Constraints** | 影響決策的限制條件 | 技術、業務、法規或資源限制 |
| **Consequences** | 該決策的預期結果 | 正面與負面影響；所需的後續行動 |
| **Status** | 決策的當前狀態 | Proposed、Accepted、Deprecated、Superseded |
| **Date** | 做成決策的時間 | ISO 8601 日期格式 |

### 範例格式

```markdown
## DD-001: Database Selection

**Status**: Accepted
**Date**: 2026-04-01

### Options
1. **PostgreSQL** — Mature RDBMS, strong JSON support. Pros: ecosystem, reliability. Cons: scaling complexity.
2. **MongoDB** — Document store, flexible schema. Pros: developer velocity. Cons: transaction limitations.
3. **DynamoDB** — Managed NoSQL. Pros: zero ops, auto-scaling. Cons: vendor lock-in, cost at scale.

### Decision
PostgreSQL

### Rationale
Our data model is relational with well-defined schemas. PostgreSQL provides ACID transactions required by our financial domain, strong JSON support for semi-structured data, and the team has extensive experience.

### Constraints
- Must support ACID transactions (regulatory requirement)
- Team has limited NoSQL experience
- Budget does not allow managed database services initially

### Consequences
- (+) Leverages existing team expertise
- (+) Strong ecosystem of tools and extensions
- (-) Requires manual scaling configuration for high traffic
- (-) Need to invest in connection pooling (PgBouncer)
```

---

## 設計審查清單

設計文件應使用涵蓋 5 個維度的以下檢查清單進行審查。每個維度包含具體的檢查項目。

### 1. 正確性

- [ ] 設計符合所有陳述的功能需求
- [ ] 邊緣案例與邊界條件皆已處理
- [ ] 資料流完整——無孤立的輸入或輸出
- [ ] 錯誤情境皆有適當處理

### 2. 擴展性

- [ ] 設計支援預期的負載增長（10 倍、100 倍）
- [ ] 識別瓶頸並附帶緩解計畫
- [ ] 定義水平擴展策略（若適用）
- [ ] 考慮資料分割（partitioning）或分片（sharding）策略

### 3. 安全性

- [ ] 身分驗證與授權設計得當
- [ ] 規範待處理與傳輸中資料的加密
- [ ] 處理輸入驗證與清理（sanitization）
- [ ] 符合合規性需求（GDPR、SOC2 等）

### 4. 可維護性

- [ ] 元件具有明確的邊界與職責
- [ ] 相依性最小化且妥善管理
- [ ] 設定已外部化（非寫死）
- [ ] 內建記錄（logging）與除錯支援設計

### 5. 可操作性

- [ ] 定義部署策略（藍綠部署、金絲雀部署等）
- [ ] 規劃監控與告警
- [ ] 規範備份與災難復原程序
- [ ] 記錄回滾策略

---

## 參考資料

- Brown, S. (2018). *The C4 Model for Visualising Software Architecture*. [c4model.com](https://c4model.com/)
- Nygard, M. (2011). *Documenting Architecture Decisions*. [cognitect.com](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- IEEE 1016-2009. *IEEE Standard for Information Technology — Systems Design — Software Design Descriptions*.
- Clements, P. et al. (2010). *Documenting Software Architectures: Views and Beyond*. Addison-Wesley.

---

## 授權

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權。
