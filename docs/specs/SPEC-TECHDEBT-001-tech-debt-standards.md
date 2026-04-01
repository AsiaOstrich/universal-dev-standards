# [SPEC-TECHDEBT-001] Feature: Tech Debt Management Standards

- **Status**: Archived
- **Created**: 2026-03-31
- **Author**: AI-assisted
- **Priority**: Critical (P0)
- **Scope**: universal
- **Related**: `core/refactoring-standards.md` (互補), SPEC-PM-001 (銜接)

## Overview

新增 `core/tech-debt-standards.md` 核心標準，定義技術債的分類法、登記簿格式、預算機制、量化指標和影響評估矩陣。讓技術債從「隱性負擔」轉化為「可見可管理的資產」。

## Motivation

### 問題陳述

1. **債務不可見** — 技術債散落在程式碼註解、口頭討論、心理記憶中，無法量化
2. **無分類體系** — 不區分設計債、程式碼債、測試債，無法分配正確的償還策略
3. **無償還計畫** — 缺乏「技術債預算」概念，債務只增不減
4. **事故後未登記** — Postmortem 發現的技術債未系統化追蹤
5. **與重構脫節** — `refactoring-standards` 定義了「如何重構」，但缺少「重構什麼、按什麼順序」

### 與現有標準的關係

| 現有標準 | 本規格的關係 |
|----------|-------------|
| `refactoring-standards` | **互補**：refactoring 定義重構方法，tech-debt 定義重構對象和優先級 |
| SPEC-PM-001 | **銜接**：postmortem action items 可產生新的技術債登記 |
| `checkin-standards` | **擴展**：commit 時可標記引入或償還技術債 |
| `metrics-dashboard-assistant` | **資料來源**：技術債指標可整合進指標儀表板 |

## Requirements

### REQ-1: 技術債分類法

系統 SHALL 定義技術債的分類體系，含各類型的定義、常見來源和影響。

#### Scenario: 識別技術債類型
- **GIVEN** 開發者發現一筆技術債
- **WHEN** 使用分類法進行分類
- **THEN** 能歸入以下類型之一：

| 類型 | 定義 | 常見來源 | 影響 |
|------|------|---------|------|
| **設計債** (Design) | 架構或設計決策導致的債務 | 趕工跳過設計、需求變更後未調整架構 | 系統可維護性、擴展性 |
| **程式碼債** (Code) | 程式碼品質問題 | 重複程式碼、複雜條件、不良命名 | 可讀性、修改成本 |
| **測試債** (Test) | 測試覆蓋或品質不足 | 跳過測試、脆弱測試、缺少邊界測試 | 回歸風險、修改信心 |
| **文件債** (Documentation) | 文件缺失或過時 | 未同步更新、API 文件缺失 | 上手時間、知識傳承 |
| **依賴債** (Dependency) | 過時或有風險的依賴 | 未更新套件、已棄用 API | 安全漏洞、相容性 |
| **基礎設施債** (Infrastructure) | 基礎設施配置問題 | 手動部署、缺乏 IaC、環境不一致 | 部署效率、穩定性 |

#### Scenario: 區分有意識 vs 無意識債務
- **GIVEN** 團隊分析技術債來源
- **WHEN** 評估債務的產生方式
- **THEN** 區分：
  - **有意識（Deliberate）**：明確決定「先交付，日後改善」（需記錄決策原因）
  - **無意識（Inadvertent）**：因經驗不足或疏忽產生（需加強 review）

### REQ-2: 技術債登記簿

系統 SHALL 定義技術債登記簿的格式和維護流程。

#### Scenario: 登記新的技術債
- **GIVEN** 開發者識別一筆技術債
- **WHEN** 在登記簿中建立條目
- **THEN** 條目包含以下欄位：

| 欄位 | 說明 | 範例 |
|------|------|------|
| ID | 唯一識別碼 | TD-042 |
| 標題 | 簡短描述 | `PaymentService 缺乏重試機制` |
| 類型 | 分類 | Design |
| 來源 | 如何發現的 | Postmortem PM-2026-03-15 |
| 影響 | 影響範圍和嚴重度 | 支付失敗率 0.5%，影響營收 |
| 估計償還成本 | Story Points 或時間 | 5 SP / 2 天 |
| 利息 | 每週/月不償還的額外成本 | 每月 3h 人工重試處理 |
| 優先級 | P0-P3 | P1 |
| Owner | 負責人 | @backend-team |
| 建立日期 | 登記日期 | 2026-03-31 |
| 目標償還日期 | 計畫償還期限 | 2026-Q2 |
| 狀態 | 生命週期狀態 | Open |

#### Scenario: 登記簿存放結構
- **GIVEN** 團隊維護技術債登記簿
- **WHEN** 決定存放方式
- **THEN** 標準提供兩種選項：
  - **檔案式**：`docs/tech-debt/registry.md`（適合小團隊）
  - **Issue 式**：GitHub Issues / Linear / Jira（適合大團隊，支援過濾和報告）

### REQ-3: 技術債預算

系統 SHALL 定義技術債預算的設定和執行機制。

#### Scenario: 設定技術債預算
- **GIVEN** 團隊規劃 Sprint
- **WHEN** 分配工時
- **THEN** 標準建議分配 10-20% 的開發時間用於技術債償還：

| 團隊狀態 | 建議比例 | 理由 |
|----------|---------|------|
| 新專案（< 6 個月） | 10% | 債務較少，維護為主 |
| 成熟專案（穩定） | 15% | 持續償還，防止累積 |
| 高債務專案（事故頻繁） | 20-30% | 需要積極償還 |

#### Scenario: 預算使用追蹤
- **GIVEN** Sprint 結束
- **WHEN** 回顧技術債預算使用情況
- **THEN** 報告包含：
  - 預算使用率（實際/計畫）
  - 償還的技術債清單
  - 新增的技術債清單
  - 淨債務變化（新增 - 償還）

### REQ-4: 影響評估矩陣

系統 SHALL 定義技術債優先級排序的評估方法。

#### Scenario: 使用影響矩陣排序
- **GIVEN** 登記簿中有多筆技術債
- **WHEN** 進行優先級排序
- **THEN** 使用影響範圍 × 修復難度矩陣：

|  | 修復容易 (< 1天) | 修復中等 (1-5天) | 修復困難 (> 5天) |
|--|-----------------|-----------------|-----------------|
| **影響大**（用戶可見、安全、效能） | P0：立即修復 | P1：下個 Sprint | P2：規劃排程 |
| **影響中**（開發效率、維護成本） | P1：下個 Sprint | P2：規劃排程 | P2：規劃排程 |
| **影響小**（程式碼美觀、慣例） | P3：機會修復 | P3：機會修復 | P3：不優先 |

#### Scenario: 利息概念
- **GIVEN** 技術債未被償還
- **WHEN** 評估「利息」（不償還的持續成本）
- **THEN** 標準定義利息類型：
  - **時間利息**：每次修改該模組額外花費的時間
  - **風險利息**：因缺乏測試而增加的回歸風險
  - **人才利息**：新成員上手困難、知識集中風險

### REQ-5: 技術債指標

系統 SHALL 定義量化追蹤技術債的指標。

#### Scenario: 追蹤技術債趨勢
- **GIVEN** 團隊使用登記簿管理技術債
- **WHEN** 產生季度報告
- **THEN** 包含以下指標：

| 指標 | 定義 | 目標趨勢 |
|------|------|----------|
| 債務總量 | 未償還技術債的總 Story Points | 穩定或下降 |
| 債務比率 | 新增 SP / 償還 SP（每 Sprint） | < 1.0 |
| 平均年齡 | 未償還債務的平均存在天數 | < 90 天 |
| 類型分布 | 各類型債務的比例 | 無單一類型 > 40% |
| 高優先級比例 | P0+P1 / 總債務 | < 20% |

### REQ-6: 與開發工作流整合

系統 SHALL 定義技術債與日常開發流程的整合方式。

#### Scenario: Commit 標記技術債
- **GIVEN** 開發者提交程式碼
- **WHEN** commit 引入或償還技術債
- **THEN** 在 commit message footer 中標記：
  - 引入：`Tech-Debt: TD-043 (introduced: Design debt in PaymentService)`
  - 償還：`Tech-Debt: TD-042 (resolved: Added retry mechanism)`

#### Scenario: Postmortem 產生技術債
- **GIVEN** Postmortem 完成，action items 包含技術改善
- **WHEN** 改善項目屬於技術債性質
- **THEN** 自動建議在登記簿中建立條目，連結 Postmortem ID

#### Scenario: Code Review 識別技術債
- **GIVEN** Code Review 中發現品質問題但不阻斷合併
- **WHEN** Reviewer 使用 `💡 SUGGESTION` 或 `⚠️ IMPORTANT` 標記
- **THEN** 標準建議將其登記為技術債，而非遺忘

## Acceptance Criteria

- **AC-1**: Given 開發者發現技術債, when 使用分類法, then 能歸入 6 種類型之一（設計/程式碼/測試/文件/依賴/基礎設施）
- **AC-2**: Given 開發者登記技術債, when 使用範本, then 條目包含 ID/標題/類型/來源/影響/成本/利息/優先級/Owner/日期/狀態共 11 個欄位
- **AC-3**: Given 團隊規劃 Sprint, when 查閱預算指引, then 能找到 3 種團隊狀態的建議比例（10%/15%/20-30%）
- **AC-4**: Given 多筆技術債, when 使用影響矩陣排序, then 能得到 P0-P3 的優先級（3×3 矩陣）
- **AC-5**: Given 季度報告, when 查閱指標定義, then 能找到 5 個量化指標及其目標趨勢
- **AC-6**: Given commit 涉及技術債, when 使用標記格式, then 能在 footer 中標記引入或償還

## Technical Design

### 文件結構

```
core/
├── tech-debt-standards.md        ← 新建
├── refactoring-standards.md      ← 現有，新增交叉引用
```

### 章節結構

```markdown
# Tech Debt Management Standards
## Overview
## Tech Debt Taxonomy
  ### Six Types
  ### Deliberate vs Inadvertent
## Tech Debt Registry
  ### Entry Template
  ### Storage Options
  ### Lifecycle (Open → Scheduled → In Progress → Resolved → Verified)
## Tech Debt Budget
  ### Allocation Guidelines
  ### Usage Tracking
## Impact Assessment Matrix
  ### Priority Matrix (Impact × Effort)
  ### Interest Concept
## Metrics
  ### Five Tracking Metrics
  ### Quarterly Reporting
## Integration with Development Workflow
  ### Commit Marking
  ### Postmortem Integration
  ### Code Review Integration
## Quick Reference Card
## References
```

## Test Plan

- [ ] 分類法包含 6 種類型的完整定義
- [ ] 登記簿範本包含 11 個欄位
- [ ] 預算指引包含 3 種團隊狀態的建議比例
- [ ] 影響矩陣為 3×3 格式含 P0-P3
- [ ] 指標定義包含 5 個量化指標
- [ ] Commit 標記格式有引入和償還兩種範例
- [ ] `check-standards-sync.sh` 通過

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-03-31 | 初始草稿 |
