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
