---
source: ../../../core/refactoring-standards.md
source_version: 2.2.0
translation_version: 2.2.0
last_synced: 2026-10-11
source_hash: e293ee5788ca
status: current
---

# 重構標準

> **語言**: [English](../../../core/refactoring-standards.md) | 繁體中文

**版本**: 2.2.0
**最後更新**: 2026-07-01
**適用性**: 所有進行程式碼改善工作的軟體專案
**範圍**: 部分通用 (Partial)
**業界標準**: ISO/IEC 25010 可維護性

> **詳細模式與教學請參閱 [重構指南](guides/refactoring-guide.md)**

---

## 目的

本標準定義完整的程式碼重構指引，涵蓋從日常 TDD 重構循環到大規模遺留系統現代化的各種情境。

---

## 重構 vs. 重寫決策矩陣

| 因素 | 傾向重構 | 傾向重寫 |
|------|----------|----------|
| **程式碼庫規模** | 大型、複雜 | 小型、獨立 |
| **測試覆蓋率** | 良好（>60%） | 不足或沒有 |
| **業務連續性** | 關鍵 | 可容忍停機 |
| **團隊知識** | 團隊了解程式碼 | 缺乏組織知識 |
| **核心架構** | 健全，只是雜亂 | 根本性缺陷 |
| **時間壓力** | 期限緊迫 | 時程彈性 |
| **風險容忍度** | 低 | 較高 |

---

## 何時重構

| 情境 | 建議策略 |
|------|----------|
| 功能開發受雜亂程式碼阻礙 | 準備性重構（Preparatory Refactoring） |
| 修 bug 時順手碰到程式碼 | 童子軍法則（Boy Scout Rule） |
| 以 TDD 撰寫新程式碼 | 紅-綠-重構（Red-Green-Refactor） |
| 替換整個遺留系統 | 絞殺者模式（Strangler Fig Pattern） |
| 需要與遺留系統整合但不被污染 | 防腐層（Anti-Corruption Layer） |
| 不使用 feature branch 重構共用程式碼 | 抽象分支（Branch by Abstraction） |
| 變更廣泛使用的介面 | 平行變更（Parallel Change，Expand-Migrate-Contract） |
| 處理沒有測試的遺留程式碼 | **先寫**特徵測試（Characterization Tests） |

---

## 策略摘要

| 策略 | 規模 | 風險 | 時程 | 主要使用情境 |
|------|------|------|------|--------------|
| **準備性重構** | 小 | 低 | 數小時 | 功能開發前降低阻力 |
| **童子軍法則** | 極小 | 低 | 數分鐘 | 持續償還技術債 |
| **紅-綠-重構** | 小 | 低 | 5-15 分鐘 | TDD 開發循環 |
| **絞殺者模式** | 大 | 中 | 數月 | 系統替換 |
| **防腐層** | 中 | 低 | 數週 | 新舊系統共存 |
| **抽象分支** | 大 | 中 | 數週 | 在主幹上進行長期重構 |
| **平行變更** | 中 | 低 | 數天至數週 | 介面／schema 遷移 |
| **特徵測試** | — | — | — | **所有遺留程式碼重構的先決條件** |

---

## 安全重構工作流程

### 重構前

- [ ] 定義成功標準（可量測）
- [ ] 確保足夠的測試覆蓋率（建議 >80%）
- [ ] 提交或暫存目前的工作（乾淨的工作目錄）
- [ ] 建立 feature 分支（或在主幹上搭配功能開關）
- [ ] 與團隊溝通以避免衝突

### 重構中

- [ ] 一次只做**一個**小變更
- [ ] **每次**變更後都執行測試
- [ ] 測試失敗時**立即**還原
- [ ] 頻繁提交（每次測試通過都是一個存檔點）
- [ ] 重構時絕不新增功能

### 重構後

- [ ] 所有測試通過（與重構前相同）
- [ ] 程式碼有可量測的改善（複雜度、重複度等）
- [ ] 必要時更新文件
- [ ] 完成團隊審查
- [ ] 沒有新增任何功能

---

## 程式碼品質指標

### 目標指標

| 指標 | 目標 | 工具 |
|------|------|------|
| **循環複雜度（Cyclomatic Complexity）** | 每個函式 < 10 | 靜態分析 |
| **認知複雜度（Cognitive Complexity）** | 越低越好 | SonarQube |
| **程式碼重複（文字）** | < 3% | 靜態分析 |
| **語意重複** | 0 個未受管理的 domain fact | Golden / architecture test（見下文） |
| **測試覆蓋率** | ≥ 80% | 覆蓋率工具 |

> **文字重複 vs. 語意重複**：`程式碼重複` 指標只能偵測*文字*重複（幾乎相同的 token 序列），無法偵測*語意*重複——同一個 domain fact 在多處被重新實作，或 derived aggregate 被持久化卻沒有與來源的強制綁定。並非逐位元組相同的 copy（改寫過的邏輯、一處正確另一處錯誤的公式）會通過靜態分析，卻仍持續各自漂移。語意重複必須由 golden test 與 architecture test 治理（見[語意重複與 Copy-Drift](#語意重複與-copy-drift)），而非上述靜態分析門檻。

### ISO/IEC 25010 可維護性目標

| 子特性 | 指標 | 目標 |
|--------|------|------|
| **模組化（Modularity）** | 耦合度、檔案大小 | 減少相依 |
| **可重用性（Reusability）** | 程式碼重複 | 提取方法、DRY |
| **可分析性（Analysability）** | 循環複雜度 | 簡化邏輯 |
| **可修改性（Modifiability）** | 內聚度、測試覆蓋率 | 單一職責 |
| **可測試性（Testability）** | 分支覆蓋率 | 依賴注入 |

---

## 語意重複與 Copy-Drift

文字重複指標能抓到複製貼上，卻漏掉更危險的情況：**同一個 domain fact 在多處被實作**。當這些實作不是逐位元組相同時——改寫過的分類邏輯、一個 call site 正確而另一個有細微錯誤的公式、與其彙總的 rows 分開儲存的 total——它們會通過靜態分析，然後**各自獨立地漂移**，產生看似無關、實則同源的 bug。

### 反模式：Copy-Drift

Copy-Drift 發生於下列任一情況：

- 單一 domain fact（分類、規則、計算）被**在多個 call site 重複實作**，而非由單一共用單元計算；或
- **derived value 被持久化**（stored aggregate、counter 或 denormalized 欄位）**卻沒有與來源的強制關係**，使每條 write path 都能各自更新它。

因為這些 copy 並非逐字相同，文字重複工具什麼都不會回報。漂移會在稍後以不一致的形式浮現：list view 與 detail view 對不上、stored counter 因某條更新路徑的 decrement 分支被註解掉而重複計數、或同一條公式在不同模組給出不同答案。

### 模式：Single Source of Truth / Derive-Don't-Duplicate

- **每個 fact 只有一個單元**：把每個 domain fact 抽成**唯一**的 classifier / calculator / resolver；所有 call site 都呼叫它——不重新實作、不改寫。
- **Derive，不要 store**：優先在讀取時計算，而非持久化第二份 copy；永遠被 derive 的值不會漂移。
- **若 aggregate 一定要儲存**，把它當成其 detail rows 的 **projection**，並在**單一 choke point**（例如 `SaveChanges` interceptor，或單一共用 `recompute()` 函式）重算，讓**每一條** write path（含 async job 與 failure write-back）都經過同一個重算而保持一致。**絕不**讓個別 path 對 stored aggregate 套用 incremental `col = col + delta` 調整；incremental 調整正是 decrement/rollback 分支被略過、counter 發生漂移的原因。
- **用測試鎖定**：用 **golden test** 鎖定 single source of truth，並加上 **architecture test**——若規則在別處被重新定義就 fail，讓未來的 copy 在 CI 被擋下，而非在 production 才被發現。

### 遷移推論——Intentional-Divergence Registry（刻意偏離登記）

當新系統**刻意**偏離 legacy 行為時，必須記錄下來——否則日後某次「修正」會靜默地把它回退。port 過程中常見的情況：legacy *函式*回傳 X，但下游的 legacy *pipeline* 把它調和成 Y；port 把這個調和折進單一單元，讓函式直接回傳 Y。

- 把每個刻意偏離登記在 **intentional-divergence registry**（legacy 行為、新行為、理由、所屬 fact）。
- 用 **golden test** 鎖定新行為，讓未來「修正」回 legacy 時 build 會失敗。
- 把 registry 餵給任何對 legacy 的 **differential test**，使該偏離被視為*預期*，而非被標記為 regression。

### 給採用者的註記

- per-function 的 legacy-vs-new diffing 產出的是**候選，而非裁決**。每個候選都必須對照**整條** legacy pipeline（而不只是那一個函式）裁決後，才能稱為 bug——legacy pipeline 可能已在下游調和了表面上的差異。
- 以 **programmatic / token-based** 方式（而非手抄）抽取 legacy 函式本體，避免在調查抄寫錯誤時又重新引入抄寫錯誤。

---

## PR 大小指引

| 大小 | 變更行數 | 審查時間 | 建議 |
|------|----------|----------|------|
| 小 | < 200 | < 30 分鐘 | ✅ 理想 |
| 中 | 200-500 | < 1 小時 | ⚠️ 可接受 |
| 大 | > 500 | — | ❌ **應拆分** |

**原則**：多個小 PR > 一個大 PR

---

## 技術債優先順序

| 優先級 | 判斷標準 | 行動 |
|--------|----------|------|
| **高** | 阻礙開發、頻繁造成 bug | 立即處理 |
| **中** | 拖慢開發、增加複雜度 | 規劃至下個 sprint |
| **低** | 輕微困擾、影響範圍有限 | 伺機處理 |

---

## 資料庫重構安全

### 遷移前檢查清單

- [ ] 已完成完整備份
- [ ] 遷移腳本已在 staging 測試
- [ ] 已準備回滾腳本
- [ ] 已估算遷移時間
- [ ] 已公告維護時段

### 遷移後檢查清單

- [ ] 資料一致性驗證
- [ ] 應用程式功能驗證
- [ ] 效能基準比較
- [ ] 備份保留至回滾期結束

---

## 相關標準

- [測試驅動開發](test-driven-development.md) - 包含重構階段的 TDD 循環
- [測試標準](testing-standards.md) - 以 golden test 與 architecture test 鎖定 single source of truth
- [測試治理](test-governance.md) - 在 CI 治理語意重複與 intentional-divergence 檢查
- [程式碼審查清單](code-review-checklist.md) - 重構 PR 審查指引
- [Commit Message 指南](commit-message-guide.md) - `refactor` 提交類型
- [程式碼簽入標準](checkin-standards.md) - 提交前要求

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 2.2.0 | 2026-07-01 | 新增「語意重複與 Copy-Drift」（issue #142）：Copy-Drift 反模式、Single Source of Truth / Derive-Don't-Duplicate 模式、Intentional-Divergence Registry 遷移推論；將重複指標拆分為文字重複與語意重複 |
| 2.1.0 | 2026-01-29 | 重構：拆分為規則 + 指南，詳細模式移至指南 |
| 2.0.0 | 2026-01-21 | 重大重組：新增戰術性策略、防腐層 |
| 1.0.0 | 2026-01-12 | 初始重構標準定義 |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
