---
source: ../../../core/refactoring-standards.md
source_version: 2.2.0
translation_version: 2.2.0
last_synced: 2026-07-01
status: current
---

# 重構標準

> **語言**: [English](../../../core/refactoring-standards.md) | 繁體中文

**版本**: 2.2.0
**最後更新**: 2026-07-01
**適用性**: 所有軟體專案
**範圍**: 通用 (Universal)

---

## 目的

本標準定義重構的時機、安全規則與決策矩陣。關於具體重構模式（如 Extract Method, Strangler Fig）的詳細教學，請參閱 **[重構指南](guides/refactoring-guide.md)**。

---

## 核心規則

1. **紅-綠-重構**: 只有在測試通過 (綠燈) 時才進行重構。
2. **不改變行為**: 重構應改善結構，而非改變外部行為。
3. **小步前進**: 偏好頻繁的小重構，而非大規模的「重寫」。
4. **童子軍法則**: 離開程式碼時，要比你發現它時更乾淨。

---

## 何時重構 (觸發點)

| 觸發點 | 說明 | 建議行動 |
|--------|------|----------|
| **三次法則** | 發現重複程式碼三次 | 提取共用方法或元件 |
| **難以測試** | 程式碼依賴性太高或副作用太多 | 依賴注入、純函式化 |
| **新增功能受阻** | 現有結構難以擴充 | 準備性重構 (Preparatory Refactoring) |
| **Code Review** | 被指出可讀性差或複雜度高 | 修正後再合併 |

---

## 程式碼異味 (Code Smell) 檢查清單

- [ ] **長函式 (Long Method)**: 超過 20-30 行？
- [ ] **大類別 (Large Class)**: 承擔太多責任？
- [ ] **重複程式碼 (Duplicated Code)**: 違反 DRY 原則？
- [ ] **過多參數 (Long Parameter List)**: 超過 3-4 個參數？
- [ ] **特徵依戀 (Feature Envy)**: 一個方法過度使用另一個類別的資料？
- [ ] **魔法數字 (Magic Numbers)**: 未解釋的常數？

---

## 重構安全網

在重構遺留程式碼 (Legacy Code) 前，必須建立安全網：

1. **確認現有測試**: 如果沒有測試，先寫測試（特徵測試 Characterization Tests）。
2. **自動化執行**: 確保測試可以一鍵執行且快速回饋。
3. **版本控制**: 確保在乾淨的 Git 狀態下開始。

---

## 語意重複與 Copy-Drift（語意重複）

文字重複（textual duplication）指標只能抓到逐字複製，卻抓不到更危險的情況：**同一個 domain fact 在多處被重複實作**。當這些實作不是逐字相同時（改寫過的分類邏輯、同一條公式在一處對一處錯、把 total 與它彙總的 rows 分開儲存），它們會通過靜態分析，然後**各自獨立地漂移**，產生看似無關、實則同源的一叢 bug。

### 反模式：Copy-Drift

Copy-Drift 發生於下列任一情況：

- 單一 domain fact（分類、規則、計算）被**在多個 call site 重複實作**，而非由單一共用單元計算；或
- **derived value 被持久化**（stored aggregate、counter、denormalized 欄位）**卻無與來源綁定的強制關係**，使每條 write path 都能各自更新它。

因為這些 copy 並非逐字相同，文字重複工具一個都抓不到。漂移會在稍後以不一致的形式浮現：list view 與 detail view 對不上、stored counter 因某條更新路徑的 decrement/rollback 分支被略過或被註解掉而重複計數、或同一條公式在不同模組給出不同答案。

### 模式：Single Source of Truth / Derive-Don't-Duplicate

- **每個 fact 只有一個單元**：把每個 domain fact 抽成**唯一**的 classifier / calculator / resolver；所有 call site 都呼叫它——不重實作、不改寫。
- **優先 derive，不要 store**：優先在 read 時計算，而非持久化第二份 copy；永遠被 derive 的值不會漂移。
- **若 aggregate 一定要存**，把它當成 detail rows 的 **projection**，並在**單一 choke point**（例如 `SaveChanges` interceptor，或單一共用 `recompute()` 函式）重算，讓**每一條** write path（含 async job 與 failure write-back）都走同一個重算路徑而保持一致。**絕不**讓個別 path 對 stored aggregate 做 incremental `col = col + delta` 調整；incremental 調整正是 decrement/rollback 分支被略過、counter 發生漂移的原因。
- **用測試鎖定**：用 **golden test** 鎖定 single source of truth，並加一個 **architecture test**——若規則在別處被重新定義就 fail，讓未來的 copy 在 CI 被擋下，而非在 production 才發現。

### 遷移推論——Intentional-Divergence Registry（刻意偏離登記）

當新系統**刻意**偏離 legacy 行為時，必須登記——否則未來某次「修正」會靜默地把它回退掉。port 過程中常見的情況：legacy *函式*回傳 X，但 legacy *pipeline* 在下游把它調和成 Y；port 把這個調和折進單一單元，讓函式直接回傳 Y。

- 把每個刻意偏離登記在 **intentional-divergence registry**（legacy 行為、new 行為、rationale、所屬 fact）。
- 用 **golden test** 鎖定 new 行為，讓未來「修正」回 legacy 會讓 build fail。
- 把 registry 餵給對 legacy 的任何 **differential test**，使該偏離被視為**預期**而非 regression。

### 給採用者的註記

- per-function 的 legacy-vs-new diffing 只產出**候選**，非裁決；每個候選都要對照**整條** legacy pipeline（下游可能已調和該差異）裁決後，才能稱為 bug。
- 用 programmatic / token-based 方式抽取 legacy 函式本體（不要手抄），避免在調查抄寫錯誤時又重新引入抄寫錯誤。

---

## 相關標準

- [重構指南](guides/refactoring-guide.md) - 詳細模式與教學
- [測試標準](testing-standards.md) - golden test 與 architecture test 鎖定 single source of truth
- [測試治理](test-governance.md) - 在 CI 治理語意重複與 intentional-divergence 檢查
- [程式碼審查清單](code-review-checklist.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 2.2.0 | 2026-07-01 | 新增「語意重複與 Copy-Drift」（issue #142）：Copy-Drift 反模式、Single Source of Truth / Derive-Don't-Duplicate 模式、Intentional-Divergence Registry 遷移推論。 |
| 2.0.0 | 2026-01-29 | **重大重構**：拆分為規則（本文件）和指南（refactoring-guide.md）。 |
| 1.0.0 | 2025-12-15 | 初始版本 |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
