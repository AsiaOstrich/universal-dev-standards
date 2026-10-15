---
source: ../../../../skills/adr-assistant/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 77b62e5cf96f
status: current
---

# 架構決策記錄助手指南

> **語言**: [English](../../../../skills/adr-assistant/guide.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-26
**適用範圍**: 所有軟體專案
**範疇**: universal
**類型**: 標準支援技能（核心標準：adr-standards.md）

---

## 目的

開發過程中的技術決策常常遺失——埋在 Slack 對話、會議記錄中，或完全被遺忘。當新成員加入或數月後重新審視系統時，「為什麼要這樣做？」這個問題沒有明確的答案。

架構決策記錄透過建立輕量級、版本控制的決策日誌來解決這個問題：

```
做出決策 → 撰寫 ADR → 存入版本庫 → 永久可查
```

此技能將 ADR 整合進 UDS 工作流程：

```
/brainstorm → /sdd → /adr → Implementation
                ▲       ▲
            Existing   (NEW)
```

---

## 詳細工作流程

### 階段 1：CAPTURE — 定義決策背景

在分析選項之前，清楚闡述需要決定什麼以及為什麼。

**步驟：**

1. **識別觸發因素** — 什麼事件或需求促成了這個決策？
   - 新功能需求
   - 效能瓶頸
   - 技術終止支援
   - 擴展挑戰

2. **定義限制條件** — 什麼限制了解決方案的空間？
   - 預算/時程
   - 團隊技能與產能
   - 現有系統相容性
   - 法規要求

3. **列出決策驅動因素** — 哪些標準最重要？
   - 效能 vs. 開發速度
   - 一致性 vs. 彈性
   - 成本 vs. 功能

**範例：**

```markdown
## Context

Our API response times have degraded to 2s p95 as the user base grew
from 10K to 100K. The current monolithic architecture processes all
requests synchronously. We need to decide how to address this before
the next growth milestone (500K users, Q3 2026).

## Decision Drivers

- Must reduce p95 latency to < 500ms
- Team has strong experience in Python, limited in Go
- Budget for infrastructure is capped at $5K/month
- Must be implementable within 6 weeks
```

---

### 階段 2：ANALYZE — 評估選項

至少探索 2 個選項。對每個選項記錄：

| 面向 | 需捕捉的內容 |
|------|-------------|
| **描述** | 此選項涉及什麼？ |
| **優點** | 好處與優勢 |
| **缺點** | 缺點與風險 |
| **成本** | 實作工作量與持續成本 |
| **風險** | 可能出什麼問題？ |

**比較矩陣模板：**

```markdown
| 標準 | 選項 1：快取 | 選項 2：CQRS | 選項 3：微服務 |
|------|------------|-------------|--------------|
| 延遲改善 | 中等 | 高 | 高 |
| 實作工作量 | 低（2 週） | 中（4 週） | 高（8+ 週） |
| 團隊熟悉度 | 高 | 中 | 低 |
| 維運複雜度 | 低 | 中 | 高 |
| 未來可擴展性 | 有限 | 良好 | 優秀 |
```

---

### 階段 3：DECIDE — 選擇並論證

選擇最符合決策驅動因素的選項。論證應：

1. **引用驅動因素** — 說明選定方案如何滿足標準
2. **承認取捨** — 坦誠你放棄了什麼
3. **解釋為何排除替代方案** — 幫助未來讀者理解推理

**範例：**

```markdown
## Decision Outcome

Chosen option: **Option 2: CQRS**, because it provides the best
balance of latency improvement and implementation feasibility.

- Meets the < 500ms p95 target (estimated 200ms with read replicas)
- Implementable within 4 weeks by the existing team
- Option 1 (caching) was rejected: insufficient for 500K users
- Option 3 (microservices) was rejected: exceeds 6-week timeline
```

---

### 階段 4：RECORD — 撰寫 ADR 檔案

依照 `core/adr-standards.md` 的標準模板產生 ADR。

**檔案命名：** `ADR-NNN-short-description.md`

**決定下一個編號：**
1. 檢查 `docs/adr/` 中現有的 ADR
2. 使用下一個流水號
3. 若無現有 ADR，從 `ADR-001` 開始

---

### 階段 5：LINK — 交叉引用

在 ADR 與相關工件之間建立雙向連結：

| 來源 | 目標 | 方式 |
|------|------|------|
| ADR | SPEC | 在 ADR 的 `Technical Story` 欄位加入 SPEC-ID |
| SPEC | ADR | 在 SPEC 的技術設計區段加入 ADR 引用 |
| ADR | 程式碼 | 在程式碼註解中加入：`// See ADR-003` |
| 程式碼 | ADR | 在 ADR 的 Links 區段加入程式碼檔案路徑 |
| ADR | PR | 在 PR 描述中引用 ADR |
| ADR | ADR | 連結相關或取代關係的 ADR |

---

## 範例

### 範例 1：資料庫選型

```markdown
# ADR-001: Use PostgreSQL for Primary Database

- **Status**: Accepted
- **Date**: 2026-03-15
- **Deciders**: Backend team
- **Technical Story**: SPEC-CORE-001

## Context

We are starting a new e-commerce platform and need to select a primary
database. The system will handle product catalog, user accounts, orders,
and inventory with an expected initial load of 10K concurrent users.

## Decision Drivers

- ACID compliance for financial transactions
- JSON support for flexible product attributes
- Team experience and hiring pool
- Managed service availability on AWS

## Considered Options

1. PostgreSQL
2. MySQL 8.0
3. MongoDB

## Decision Outcome

Chosen option: **PostgreSQL**, because it provides the best combination
of ACID compliance, JSON support (JSONB), and team familiarity.

### Consequences

**Good:**
- Native JSONB support eliminates need for separate document store
- Strong ecosystem (PostGIS, full-text search, extensions)
- Available as managed service (RDS, Aurora)

**Bad:**
- Slightly higher memory usage than MySQL for simple queries
- Team needs training on PostgreSQL-specific features (CTEs, window functions)

## Links

- [SPEC-CORE-001](../specs/SPEC-CORE-001-platform-architecture.md)
```

### 範例 2：取代既有決策

```markdown
# ADR-005: Migrate from REST to GraphQL for Mobile API

- **Status**: Accepted
- **Date**: 2026-06-01
- **Deciders**: Mobile team, Backend team
- **Technical Story**: SPEC-MOBILE-003
- **Supersedes**: [ADR-002](ADR-002-rest-api-design.md)

## Context

ADR-002 established REST as our API standard. After 6 months of mobile
development, we're experiencing significant over-fetching and
under-fetching issues, requiring multiple round-trips per screen.

[... rest of ADR ...]
```

---

## 常見錯誤

| 錯誤 | 影響 | 修正 |
|------|------|------|
| 決策後過了數週才寫 ADR | 背景與替代方案已遺忘 | 在決策期間或決策後立即撰寫 |
| 只列選定的方案 | 沒有記錄排除了什麼、為何排除 | 一律至少包含 2 個替代方案 |
| 編輯已接受的 ADR | 歷史脈絡遺失 | 建立新 ADR 取代舊的 |
| ADR 過於詳細 | 沒人會讀 | 保持 1-2 頁；連結到詳細文件 |
| 未連結到程式碼 | ADR 與實作脫節 | 在 Links 區段加入程式碼引用 |

---

## 常見問題

**Q：ADR 和 SDD 規格有什麼不同？**
A：SDD 規格定義*要建什麼*和*怎麼建*。ADR 記錄*為什麼*選擇了某個方案而非其他。兩者互補——一份 SDD 可能引用多個 ADR。

**Q：每個技術決策都需要 ADR 嗎？**
A：不需要。只有具有長期影響的重大決策。使用「6 個月法則」：如果 6 個月後有人可能問「為什麼？」，就寫一份 ADR。

**Q：ADR 可以被拒絕嗎？**
A：可以。如果提議的 ADR 未被接受，可以直接刪除。只有已接受的決策需要保留。

**Q：誰應該撰寫 ADR？**
A：任何參與決策的人。實務上通常由技術負責人或架構師起草，再由團隊審查。

---

## 參考

- 核心規範：[adr-standards.md](../../../../core/adr-standards.md)
- 技能定義：[SKILL.md](./SKILL.md)
