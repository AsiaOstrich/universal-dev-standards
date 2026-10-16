---
source: ../../../../core/guides/refactoring-guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: a34c3eab7aca
status: current
---

# 重構指南

> **語言**: [English](../../../../core/guides/refactoring-guide.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-01-29
**相關標準**: [重構標準](../refactoring-standards.md)

---

## 目的

本指南提供程式碼重構的詳細說明、模式與教學。有關可執行的規則、檢查清單與門檻值，請參見[重構標準](../refactoring-standards.md)。

---

## 目錄

1. [戰術性重構策略](#tactical-refactoring-strategies)
2. [戰略性重構策略](#strategic-refactoring-strategies)
3. [遺留程式碼安全策略](#safety-strategies-for-legacy-code)
4. [資料庫重構模式](#database-refactoring-patterns)
5. [團隊協作實踐](#team-collaboration-practices)
6. [技術債管理](#technical-debt-management)
7. [參考資料](#references)

---

## 戰術性重構策略

戰術性策略應用於日常開發工作。它們在分鐘至小時級別的時間尺度上運作，且僅需最少的協調。

### 預備性重構

**定義**：重構現有程式碼，使即將進行的變更更容易實作。

> 「先把改變變容易（這可能很難），然後再做那個容易的改變。」— Kent Beck

**適用情境**：
- 現有架構難以容納你要新增的功能
- 程式碼結構需要調整以適應新需求
- 你希望減少後續變更的阻力

**工作流程**：

```
1. Identify the change you want to make
2. Identify what makes this change difficult
3. Refactor to make the change easy
4. Make the (now easy) change
```

**範例**：
- 變更前：為緊密耦合的服務新增快取非常複雜
- 預備性重構：提取介面、注入依賴
- 變更後：新增快取變得簡單直接

**關鍵原則**：
- 預備性重構是與功能分開的獨立提交
- 每一步都維持測試通過
- 不要在同一個提交中混合重構與功能開發

### 童子軍規則

**定義**：離開時讓程式碼比你發現它時更乾淨。這是一種「機會主義重構」— 不刻意安排重構衝刺，而是在修復 Bug 或新增功能時，順手清理所接觸到的程式碼。

> 「離開營地時，讓它比你來的時候更乾淨。」— Robert C. Martin

**適用情境**：
- 任何維護作業
- Bug 修復
- 功能新增
- 對抗軟體熵（software entropy）

**指導原則**：
- 只做小改進（數分鐘，而非數小時）
- 不可改變行為
- 不可破壞現有測試
- 改動範圍保持在當前任務之內

**童子軍改進的範例**：
- 重新命名令人困惑的變數
- 將幾行程式碼提取為命名良好的方法
- 移除你注意到的死程式碼
- 加入澄清註解
- 修復微小的程式碼風格問題

**應避免的反模式**：
- 把 Bug 修復變成大規模重構專案
- 重構不相關的程式碼
- 在沒有測試覆蓋的情況下修改
- 範圍蔓延超出原始任務

### 紅-綠-重構

測試驅動開發（TDD）循環的一部分。完整細節請參見[測試驅動開發](../test-driven-development.md)。

**特點**：
- 時長：每循環 5-15 分鐘
- 範圍：單一方法或類別
- 測試：重構後必須保持綠燈

**循環**：

```
┌─────────────────────────────────────────┐
│                                         │
│    ┌─────┐     ┌─────┐     ┌─────────┐ │
│    │ RED │ ──► │GREEN│ ──► │REFACTOR │ │
│    └─────┘     └─────┘     └─────────┘ │
│       ▲                          │      │
│       └──────────────────────────┘      │
│                                         │
└─────────────────────────────────────────┘
```

**常見重構技術**：
- 提取方法（Extract Method）
- 重新命名（Rename）
- 內聯變數（Inline Variable）
- 以常數取代魔術數字（Replace Magic Number with Constant）
- 移除重複（Remove Duplication）

---

## 戰略性重構策略

戰略性策略用於重大架構變更。運作時間為週到月級別，需要團隊協調。

### 絞殺榕模式

**定義**：透過逐步將功能路由至新系統，漸進替換遺留系統。

**來源**：得名於絞殺榕樹，它們環繞宿主樹生長，最終取代它。

**適用情境**：
- 漸進替換遺留系統
- 無法承受大爆炸式重寫
- 需要在遷移期間維持服務

**架構**：

```
┌─────────────────────────────────────────────────────────────────┐
│                    Strangler Fig Pattern                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Phase 1: INTERCEPT                                              │
│  ┌─────────┐     ┌─────────┐     ┌─────────────┐               │
│  │ Request │────▶│ Facade  │────▶│ Legacy (100%)│               │
│  └─────────┘     └─────────┘     └─────────────┘               │
│                                                                 │
│  Phase 2: MIGRATE                                                │
│  ┌─────────┐     ┌─────────┐     ┌─────────────┐               │
│  │ Request │────▶│ Facade  │──┬─▶│ New (Feature A)│            │
│  └─────────┘     └─────────┘  │  └─────────────┘               │
│                               └─▶│ Legacy (Rest) │               │
│                                  └─────────────┘               │
│                                                                 │
│  Phase 3: COMPLETE                                               │
│  ┌─────────┐     ┌─────────────┐                               │
│  │ Request │────▶│ New (100%)  │  [Legacy decommissioned]      │
│  └─────────┘     └─────────────┘                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**實作檢查清單**：
- [ ] 識別攔截點（API 閘道、門面、代理）
- [ ] 建立事件捕獲層
- [ ] 在新系統中實作第一個功能
- [ ] 漸進式路由流量
- [ ] 監控並比較結果
- [ ] 下線遺留元件

### 防腐層

**定義**：在遺留系統與新系統之間的翻譯層，防止遺留系統混亂的領域模型「污染」新系統的整潔架構。

**來源**：Eric Evans, Domain-Driven Design (2003)

**適用情境**：
- 新舊系統必須並存且頻繁互動
- 遺留系統有複雜／混亂的領域模型
- 保護新系統的限界上下文（Bounded Context）

**架構**：

```
┌────────────────────────────────────────────────────────────┐
│                    Anti-Corruption Layer (ACL)              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐  │
│  │  New System │────▶│     ACL     │────▶│Legacy System│  │
│  │ (Clean API) │     │             │     │(Messy Model)│  │
│  └─────────────┘     │ ┌─────────┐ │     └─────────────┘  │
│                      │ │ Adapter │ │                      │
│                      │ │ Facade  │ │                      │
│                      │ │Translator││                      │
│                      │ └─────────┘ │                      │
│                      └─────────────┘                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**組件**：

| 組件 | 用途 |
|-----------|---------|
| **Facade** | 簡化複雜的遺留介面 |
| **Adapter** | 將遺留資料格式轉換為新領域模型 |
| **Translator** | 將遺留術語映射到通用語言 |

**實作檢查清單**：
- [ ] 定義 ACL 的清晰介面
- [ ] 將遺留實體映射至新領域模型
- [ ] 處理資料格式轉換
- [ ] 實作錯誤翻譯
- [ ] 加入日誌以便除錯
- [ ] 徹底測試 ACL 隔離性

**與絞殺榕的比較**：

| 面向 | 絞殺榕 | 防腐層 |
|--------|---------------|----------------------|
| **目標** | 取代遺留系統 | 與遺留系統共存 |
| **方向** | 遷移離開遺留系統 | 與遺留系統整合 |
| **最終狀態** | 遺留系統下線 | 兩個系統繼續運作 |

### 抽象分支

**定義**：透過引入抽象層，在不使用長期分支的情況下重構共用程式碼。

**適用情境**：
- 在不使用長期分支的情況下重構共用程式碼
- 需要基於主幹的開發（trunk-based development）
- 變更風險過高，無法以單一 commit 完成

**步驟**：

```
Step 1: Introduce Abstraction
        Client → Abstraction (interface) → Old Implementation

Step 2: Add New Implementation
        Client → Abstraction → Old Implementation
                           └─→ New Implementation (feature-toggled)

Step 3: Switch and Remove
        Client → New Implementation
        [Old Implementation removed]
```

**關鍵原則**：
- 所有變更皆在 main/trunk 上（無長期分支）
- 功能開關（feature toggles）控制哪個實作生效
- 兩個實作可以在過渡期間共存

### 平行變更（Expand-Migrate-Contract）

**定義**：透過三階段方法變更由多個客戶端使用的介面。

**適用情境**：
- 變更多個客戶端使用的介面
- 資料庫 Schema 遷移
- 需要零停機遷移

**階段**：

```
Phase 1: EXPAND
├─ Add new field/method alongside old
├─ New code uses new interface
└─ Old code still works

Phase 2: MIGRATE
├─ Update all clients to use new interface
├─ Verify all clients migrated
└─ Data migration (if needed)

Phase 3: CONTRACT
├─ Remove old field/method
├─ Clean up migration code
└─ Update documentation
```

---

## 遺留程式碼安全策略

基於 Michael Feathers 的《Working Effectively with Legacy Code》。

### 遺留程式碼困境

**定義**：遺留程式碼 = 沒有測試的程式碼（無關年齡）

**困境**：
- 要安全地修改程式碼，我們需要測試
- 要加測試，我們常常需要修改程式碼
- 沒有測試就修改程式碼是有風險的

**解決方案**：使用安全技術在修改前加入測試。

### 特徵測試

**定義**：捕獲現有行為（不是驗證正確性）的測試。

**目的**：在重構遺留程式碼前建立安全網。

**流程**：

```
1. Call the code you want to understand
2. Write an assertion you expect to FAIL
3. Run the test and see what actually happens
4. Update the assertion to match actual behavior
5. Repeat until you've covered the behavior you need to change
```

**範例**：

```javascript
// Step 1: Initial (expected to fail)
test('calculateDiscount returns... something', () => {
  const result = calculateDiscount(100, 'GOLD');
  expect(result).toBe(0); // Guess - will probably fail
});

// Step 2: After running, update with actual value
test('calculateDiscount returns 15 for GOLD customers', () => {
  const result = calculateDiscount(100, 'GOLD');
  expect(result).toBe(15); // Actual behavior
});
```

**關鍵原則**：特徵測試記錄程式碼*做什麼*，而非*應該做什麼*。

### 探針式重構

**定義**：為了理解程式碼而重構，不保留任何變更。

**目的**：透過實際動手修改來探索和理解無文件程式碼。

**工作流程**：

```
1. Create a scratch branch (or use git stash)
2. Aggressively refactor to understand the code
3. Take notes on what you learn
4. Discard all changes (git reset --hard)
5. Apply learnings to write characterization tests
```

**適用情境**：
- 程式碼太複雜，無法透過閱讀理解
- 沒有文件存在
- 需要快速建立心智模型

**關鍵原則**：目標是理解，不是整潔的程式碼。完成後捨棄一切。

### 尋找接縫

**定義**：接縫是可以在不編輯程式碼的情況下改變行為的地方。

| 接縫類型 | 運作方式 | 範例 |
|----------|--------------|---------|
| **物件接縫** | 透過多型覆寫 | 透過介面注入測試替身 |
| **預處理接縫** | 編譯時替換 | 條件編譯、巨集 |
| **連結接縫** | 連結時替換 | 依賴注入、模組替換 |

**目的**：在不修改遺留程式碼的情況下注入測試替身。

### Sprout 與 Wrap 技術

| 技術 | 使用時機 | 做法 |
|-----------|-------------|-----|
| **Sprout Method** | 在現有方法中加入新邏輯 | 建立新方法，從舊方法呼叫 |
| **Sprout Class** | 新邏輯需要獨立演進 | 建立新類別，從舊程式碼參照 |
| **Wrap Method** | 需要在前後加入行為 | 重命名原方法，建立包裝器 |
| **Wrap Class** | 裝飾現有類別 | 裝飾者模式 |

**原則**：新程式碼使用 TDD；遺留程式碼在測試前保持不動。

### 程式碼考古

理解無文件程式碼的技術：

```
1. Scratch Refactoring (see above)
   ├─ Refactor to understand, not to keep
   ├─ Use git stash or branch
   └─ Discard when done (git reset --hard)

2. Trace Variable Flow
   ├─ Follow data from input to output
   ├─ Mark key transformation points
   └─ Document as you discover

3. Runtime Observation
   ├─ Add temporary logging
   ├─ Use debugger step-through
   └─ Build mental model

4. Git Archaeology
   ├─ git log -p <file> (see all changes)
   ├─ git blame (find original author)
   └─ Search commit messages for context
```

---

## 資料庫重構模式

### Schema 變更的 Expand-Contract 模式

```
┌─────────────────────────────────────────────────────────────────┐
│              Database Refactoring (Expand-Contract)              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Phase 1: EXPAND (Add new, keep old)                            │
│  ├─ Add new column/table                                        │
│  ├─ Application writes to BOTH old and new                      │
│  └─ Safe to rollback at this point                              │
│                                                                 │
│  Phase 2: MIGRATE (Move data)                                    │
│  ├─ Copy data from old to new                                   │
│  ├─ Verify data consistency                                     │
│  └─ Application starts reading from new                         │
│                                                                 │
│  Phase 3: CONTRACT (Remove old)                                  │
│  ├─ Confirm old column/table no longer read                     │
│  ├─ Remove old column/table                                     │
│  └─ Clean up dual-write code                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 常見 Schema 重構場景

| 場景 | 策略 | 風險等級 |
|----------|----------|------------|
| **重命名欄位** | 新增新的 → 遷移 → 刪除舊的 | 中 |
| **拆分表格** | 新表 + 外鍵 → 遷移 → 調整應用程式 | 高 |
| **合併表格** | 新表 → 合併資料 → 切換應用程式 | 高 |
| **變更資料型別** | 新欄位 → 轉換 → 切換應用程式 | 中 |
| **新增 NOT NULL** | 填入預設值 → 新增約束 | 低 |

### 資料庫遷移安全檢查清單

```
Pre-Migration:
□ Full backup completed
□ Migration script tested in staging
□ Rollback script prepared
□ Migration time estimated (consider data volume)
□ Maintenance window communicated

During Migration:
□ Monitor database performance
□ Verify data integrity incrementally
□ Application health checks passing

Post-Migration:
□ Data consistency verification
□ Application functionality verification
□ Performance baseline comparison
□ Backup retained for rollback period
```

### 零停機遷移技術

| 技術 | 說明 | 使用場景 |
|-----------|-------------|----------|
| **Online Schema Change** | pt-osc, gh-ost | MySQL 大表變更 |
| **Blue-Green Database** | 雙資料庫切換 | 高可用需求 |
| **Shadow Write** | 同時寫入兩個資料庫並比較 | 驗證遷移正確性 |
| **Feature Flag** | 控制讀取來源 | 漸進式切換 |

---

## 團隊協作實踐

### 重構專案啟動

```
Kickoff Meeting Agenda:
1. Scope Definition
   ├─ What modules/files are in scope
   └─ What is explicitly excluded

2. Success Criteria Alignment
   ├─ Quantitative goals (complexity reduction X%)
   └─ Functional goals (behavior unchanged)

3. Work Division
   ├─ By module (vertical slicing)
   └─ By layer (horizontal slicing)

4. Risk Assessment
   ├─ Highest-risk areas
   └─ Rollback strategy
```

### 分工策略

| 策略 | 使用時機 | 注意事項 |
|------|----------|---------|
| **垂直切片（Vertical Slicing）** | 獨立模組 | 確保介面不變 |
| **水平切片（Horizontal Slicing）** | 跨模組重構（例如命名慣例） | 需要嚴格同步 |
| **絞殺榕分工（Strangler Division）** | 大型系統替換 | 每一絞殺切片一人負責 |
| **暴民程式設計（Mob Programming）** | 核心／高風險區域 | 全員參與，降低風險 |

### 溝通機制

```
Daily Communication:
├─ Sync refactoring progress in standup
├─ Shared Refactoring Board (Kanban)
└─ Dedicated channel (#refactoring-xxx)

PR Standards:
├─ [Refactor] prefix in title
├─ Explain what changed and why
├─ Include before/after complexity comparison
└─ Require Characterization Tests for legacy code

Conflict Resolution:
├─ Small scope: Resolve immediately
├─ Medium scope: Daily sync meeting
└─ Large scope: Consider Branch by Abstraction
```

---

## 技術債管理

### 技術債象限

基於 Martin Fowler 的技術債象限（Technical Debt Quadrant）：

```
                    Deliberate
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        │  Prudent      │  Reckless     │
        │  "We know     │  "We don't    │
        │  this is      │  have time    │
        │  debt"        │  for design"  │
        │               │               │
Prudent ├───────────────┼───────────────┤ Reckless
        │               │               │
        │  Prudent      │  Reckless     │
        │  "Now we      │  "What's      │
        │  know how     │  layering?"   │
        │  we should    │               │
        │  have done it"│               │
        │               │               │
        └───────────────┼───────────────┘
                        │
                   Inadvertent
```

### 追蹤技術債

```
For each debt item, record:
├─ Description: What is the issue?
├─ Impact: How does it affect development?
├─ Estimated Effort: How long to fix?
├─ Risk if Ignored: What happens if not addressed?
└─ Related Code: Links to affected files/modules
```

---

## 參考資料

### 書籍

- Martin Fowler - "Refactoring: Improving the Design of Existing Code" (2nd Edition, 2018)
- Michael Feathers - "Working Effectively with Legacy Code" (2004)
- Joshua Kerievsky - "Refactoring to Patterns" (2004)
- Kent Beck - "Implementation Patterns" (2007)
- Robert C. Martin - "Clean Code" (2008)
- Eric Evans - "Domain-Driven Design" (2003)

### 文章

- Martin Fowler - [Strangler Fig Application](https://martinfowler.com/bliki/StranglerFigApplication.html)
- Martin Fowler - [Branch by Abstraction](https://martinfowler.com/bliki/BranchByAbstraction.html)
- Martin Fowler - [Preparatory Refactoring](https://martinfowler.com/articles/preparatory-refactoring-example.html)
- Pete Hodgson - [Feature Toggles](https://martinfowler.com/articles/feature-toggles.html)
- Martin Fowler - [Technical Debt Quadrant](https://martinfowler.com/bliki/TechnicalDebtQuadrant.html)

### 工具

- [Refactoring Guru](https://refactoring.guru/) - 重構技術目錄
- [SonarQube](https://www.sonarqube.org/) - 程式碼品質與複雜度分析
- [ApprovalTests](https://approvaltests.com/) - Golden Master 測試

---

## 授權條款

本指引依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款釋出。
