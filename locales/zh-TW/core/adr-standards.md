---
source: ../../../core/adr-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-26
status: current
---

# 架構決策記錄（ADR）

> **語言**: [English](../../../core/adr-standards.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-26
**適用範圍**: 所有進行架構決策的軟體專案
**範疇**: universal
**產業標準**: ISO/IEC/IEEE 42010（架構描述）、TOGAF ADR
**參考**: [Michael Nygard 的 ADR](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)、[MADR](https://adr.github.io/madr/)

---

## 目的

架構決策記錄捕捉重大技術決策的背景、選項和理由。它們作為決策日誌，幫助當前和未來的團隊成員了解架構為何如此設計。

---

## 何時撰寫 ADR

| 撰寫 ADR | 不需要 ADR |
|----------|-----------|
| 選擇框架、函式庫或平台 | 例行性依賴更新 |
| 定義 API 合約或資料格式 | 現有架構內的 Bug 修復 |
| 變更部署策略 | 程式碼風格或格式決策 |
| 建立編碼模式或慣例 | 瑣碎的實作選擇 |
| 做出具有長期後果的取捨 | 已在其他地方記錄的決策 |
| 偏離既有模式 | 遵循現有 ADR 指引 |

**經驗法則**：如果 6 個月後有人可能會問「為什麼要這樣做？」，就寫一份 ADR。

---

## ADR 模板

```markdown
# ADR-NNN: [決策標題]

- **Status**: [Proposed | Accepted | Deprecated | Superseded by ADR-NNN]
- **Date**: YYYY-MM-DD
- **Deciders**: [參與決策者]
- **Technical Story**: [相關 SPEC-ID、Issue 或 PR]

## Context（背景）

[描述引發此決策的技術或業務背景。
問題或機會是什麼？存在哪些限制？]

## Decision Drivers（決策驅動因素）

- [驅動因素 1：例如效能需求]
- [驅動因素 2：例如團隊專業]
- [驅動因素 3：例如預算限制]

## Considered Options（考慮的選項）

1. [選項 1]
2. [選項 2]
3. [選項 3]

## Decision Outcome（決策結果）

選擇 **[選項 N]**，因為 [理由]。

### Consequences（後果）

**Good:**
- [正面結果 1]
- [正面結果 2]

**Bad:**
- [負面結果或取捨 1]
- [已接受的風險 1]

**Neutral:**
- [非好非壞的副作用]

## Links（相關連結）

- [相關 ADR、SPEC、PR 或外部參考]
```

---

## ADR 編號

- 使用流水編號：`ADR-001`、`ADR-002` 等。
- 編號永不重複使用，即使 ADR 被廢止。
- 多專案組織可加專案前綴：`[PROJECT]-ADR-001`。

---

## 狀態生命週期

```
Proposed ──► Accepted ──► Deprecated
                │
                └──► Superseded by ADR-NNN
```

| 狀態 | 說明 |
|------|------|
| **Proposed** | 討論中，尚未決定 |
| **Accepted** | 決策生效，應遵循 |
| **Deprecated** | 不再適用（例如功能已移除） |
| **Superseded** | 已被更新的 ADR 取代（含連結） |

### 規則

1. **Proposed** 的 ADR 可變為 **Accepted** 或被刪除（若被拒絕）。
2. **Accepted** 的 ADR 可變為 **Deprecated** 或 **Superseded**。
3. **Deprecated** 和 **Superseded** 是終態。
4. 永遠不要將 **Accepted** 的 ADR 改回 **Proposed**。改為建立新 ADR 取代它。

---

## 存放慣例

```
docs/adr/
├── ADR-001-use-postgresql.md
├── ADR-002-adopt-event-sourcing.md
├── ADR-003-migrate-to-kubernetes.md
└── README.md          # ADR 索引（可選）
```

### 檔案命名

- 格式：`ADR-NNN-short-description.md`
- 描述部分使用 kebab-case。
- 描述保持在 5 個字以內。

### 索引檔案（可選）

在 `docs/adr/` 中維護 `README.md` 列出所有 ADR：

```markdown
# 架構決策記錄

| ADR | 標題 | 狀態 | 日期 |
|-----|------|------|------|
| [ADR-001](ADR-001-use-postgresql.md) | 使用 PostgreSQL | Accepted | 2026-01-15 |
| [ADR-002](ADR-002-adopt-event-sourcing.md) | 採用事件溯源 | Superseded by ADR-005 | 2026-02-01 |
```

---

## 取代 ADR

當決策被取代時：

1. 建立新 ADR，包含更新後的決策。
2. 在新 ADR 中加入：`Supersedes [ADR-NNN](ADR-NNN-old-title.md)`。
3. 更新舊 ADR 的狀態為：`Superseded by [ADR-NNN](ADR-NNN-new-title.md)`。
4. 保留舊 ADR 的內容不變，作為歷史脈絡。

---

## 與其他工件的整合

| 工件 | 整合方式 |
|------|---------|
| **SDD 規格** | 在技術設計區段引用 ADR |
| **程式碼註解** | 實作非顯而易見的模式時連結 ADR：`// See ADR-003` |
| **PR 描述** | 架構變更時引用相關 ADR |
| **Commit 訊息** | 在 footer 加入 `ADR-NNN` 以利追溯 |

---

## 品質檢查清單

接受 ADR 前，請確認：

- [ ] **背景**清楚說明問題或機會
- [ ] 至少考慮了 **2 個選項**
- [ ] **決策驅動因素**明確列出
- [ ] **後果**包含正面和負面結果
- [ ] **狀態**設定正確
- [ ] **連結**到相關工件
- [ ] 檔案存放在 `docs/adr/` 且命名正確

---

## 反模式

| 反模式 | 問題 | 修正 |
|--------|------|------|
| 事後才寫 ADR | 遺失真實的背景和替代方案 | 在決策當下或期間撰寫 |
| ADR 太多 | 決策疲勞、雜訊 | 只記錄重大決策 |
| ADR 太少 | 知識遺失、重複辯論 | 遵循上述「6 個月法則」 |
| 沒有後果分析 | 分析不完整 | 一定要列出正面和負面結果 |
| 背景模糊 | 對未來讀者無用 | 包含具體的限制條件和驅動因素 |
| 編輯已接受的 ADR | 歷史遺失 | 改用取代（Supersede）而非編輯 |

---

## 最佳實踐

1. **在決策當下撰寫 ADR** — 不要等到幾週後背景已遺忘。
2. **保持簡短** — 最多 1-2 頁。簡潔鼓勵撰寫和閱讀。
3. **包含被排除的選項** — 知道什麼沒有被選擇與知道什麼被選擇一樣有價值。
4. **雙向連結** — ADR 引用程式碼；程式碼引用 ADR。
5. **定期審查** — 在架構審查時標記過時的 ADR 為 deprecated。
6. **存放在版本控制中** — ADR 應與其管轄的程式碼一起存放。

---

## DEC 借鑲擴充

> **背景**：對於記錄從論文、Repo 或外部來源借鑲方法的跨專案決策紀錄（DEC），在基礎 ADR 模板上新增以下區塊。這些區塊向後相容——現有未填寫這些區塊的 DEC 仍然有效，但新建的借鑲型 DEC 應包含這些區塊。

### 擴充版 DEC 模板

```markdown
# DEC-NNN: [借鑲決策標題]

> **建立日期**: YYYY-MM-DD
> **上游來源**: [來源名稱](URL)
> **上游快照日期**: YYYY-MM-DD
> **用途**: [借鑲目的簡述]

---

## [標準 DEC 區段：背景 / 決策 / 後果]

... （與基礎 ADR 模板相同） ...

---

## 技術雷達狀態

- **狀態**: Trial | Adopt | Assess | Hold
- **最後評估日期**: YYYY-MM-DD
- **下次評估日期**: YYYY-MM-DD（Trial 狀態必填）

## 借鑲假設

- **假設陳述**: 實作 [方法X] 後，[指標Y] 將從 [基準值a] 改善至 [目標值b]
- **測量方式**: [如何量測，例如：人工評分 / 自動化測試通過率 / 工具輸出品質]
- **基準值**: [借鑲前的現狀數據或主觀評分]
- **目標值**: [預期達到的改善幅度]
- **驗證期限**: YYYY-MM-DD
- **成功條件**: [達到目標值的 X% 以上]
- **失敗條件**: [超過期限且低於目標值 Y%，或指標惡化]

## 評估紀錄

| 日期 | 狀態 | 觀察 | 決定 |
|------|------|------|------|
| YYYY-MM-DD | Trial | [初始建立] | 開始評估 |
```

### 技術雷達狀態定義

| 狀態 | 意義 | 行動 |
|------|------|------|
| **Adopt** | 已驗證有效，全面採用 | 列為標準實踐，記錄最佳實踐文件 |
| **Trial** | 正在評估中，有限範圍試行 | 持續測量，維護假設書（必填下次評估日期） |
| **Assess** | 有限條件下有效，需謹慎 | 記錄適用邊界，不擴大採用 |
| **Hold** | 評估無效或有害 | 停止新增採用，規劃移除 |

**預設值**：所有新建借鑲型 DEC 從 `Trial` 開始。

### 診斷流程（觀察到負面結果時）

```
觀察到負面結果
      ↓
Step 1: 對照原始論文/Repo，確認實作是否正確
      ↓ 實作有誤 ──→ 修正實作，重啟假設書計時（不建立 Reversal DEC）
      ↓ 實作正確
Step 2: 確認應用場景是否符合論文假設
      ↓ 場景不符 ──→ 記錄適用邊界，狀態更新為 Assess
      ↓ 場景符合
Step 3: 判定方法本身無效
      ↓
建立 Reversal DEC（DEC-NNN-reversal）→ 移除實作 → TECH-RADAR 更新為 Hold
```

---

## Reversal DEC 格式

當借鑲方法被評定無效時，在原始 DEC 旁建立 `DEC-NNN-reversal.md` 文件：

```markdown
# DEC-NNN-reversal: [原始方法名稱] — 移除決定

> **建立日期**: YYYY-MM-DD
> **原始 DEC**: [DEC-NNN](DEC-NNN-original-title.md)
> **移除原因**: 方法本身無效 | 場景不符 | 有反效果
> **緊急程度**: 正常流程 | 緊急（反效果，立即停用）

---

## 移除原因

[詳述為何判定此方法無效。說明已確認：
1. 實作正確性（已對照原始論文/Repo 確認）
2. 應用場景符合性（已確認場景符合論文假設）
3. 方法在我們環境中的實際表現]

## 診斷過程

| 步驟 | 確認項目 | 結果 |
|------|---------|------|
| Step 1 | 實作是否正確對照原始來源 | ✅ 正確 |
| Step 2 | 應用場景是否符合論文假設 | ✅ 符合 |
| Step 3 | 方法本身有效性 | ❌ 無效 |

## 觀察到的指標

| 指標 | 借鑲前 | 借鑲後 | 預期目標 | 判定 |
|------|-------|-------|---------|------|
| [指標名稱] | [基準值] | [實際值] | [目標值] | ❌ 未達成 |

## 反模式紀錄

> 記錄此方法在我們環境中的反模式，供未來避免相同錯誤。

- [反模式 1: 具體描述]
- [反模式 2: 具體描述]

## 移除步驟

- [ ] 透過 Feature Flag 停用相關功能
- [ ] 移除實作程式碼
- [ ] 更新 TECH-RADAR.md：狀態改為 Hold
- [ ] 更新原始 DEC 狀態為 `Superseded by DEC-NNN-reversal`
- [ ] 在下次 Retrospective 分享學習（緊急情況除外）

## 學習點

[從此次失敗借鑲中學到什麼？對未來借鑲決策的啟示？]

## Links

- 原始 DEC: [DEC-NNN](DEC-NNN-original-title.md)
- 相關 Retrospective: [連結]
- TECH-RADAR: [cross-project/decisions/TECH-RADAR.md](../decisions/TECH-RADAR.md)
```

### Reversal DEC 規則

1. **必須建立** Reversal DEC：當方法本身被確認無效（非實作錯誤）。
2. **不建立** Reversal DEC：若是實作錯誤，修正後重啟假設書計時即可。
3. 原始 DEC 狀態應更新為 `Superseded by DEC-NNN-reversal`。
4. Reversal DEC 是終態，不會再被撤銷。
5. 若方法有反效果（比不使用更差），跳過 Retrospective 等待，立即行動。
