---
source: ../../../core/spec-driven-development.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-01-05
status: current
---

# 規格驅動開發 (SDD) 標準

**版本**: 1.2.0
**最後更新**: 2026-01-05
**適用範圍**: 所有採用規格驅動開發的專案

> **語言**: [English](../../../core/spec-driven-development.md) | [繁體中文](../locales/zh-TW/core/spec-driven-development.md)

---

## 目的

本標準定義規格驅動開發 (SDD) 的原則與工作流程，確保變更在實作前已經過規劃、記錄並透過規格核准。

**主要效益**:
- 減少利害關係人與開發者之間的溝通誤解
- 為所有變更提供清晰的審計軌跡
- 新成員更容易上手

---

## SDD 工作流程

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│     提案     │───▶│     審查     │───▶│     實作     │
└──────────────┘    └──────────────┘    └──────────────┘
                                               │
                                               ▼
                    ┌──────────────┐    ┌──────────────┐
                    │     歸檔     │◀───│     驗證     │
                    └──────────────┘    └──────────────┘
```

### 工作流程階段

| 階段 | 說明 | 產出物 |
|------|------|--------|
| **提案** | 定義變更內容與原因 | `proposal.md` |
| **審查** | 利害關係人核准 | 審查意見、核准紀錄 |
| **實作** | 執行已核准的規格 | 程式碼、測試、文件 |
| **驗證** | 確認實作符合規格 | 測試結果、審查 |
| **歸檔** | 關閉並歸檔規格 | 已歸檔的規格與 commits/PRs 連結 |

---

## 核心原則

### 1. SDD 工具命令優先

**規則**: 當專案整合了 SDD 工具（如 OpenSpec, Spec Kit 等）且該工具提供特定命令（例如 `/openspec` 或 `/spec` 等斜線命令）時，AI 助手**必須優先使用這些命令**，而非直接手動編輯檔案。

**理由**:
- **一致性**: 工具確保規格結構遵循嚴格的架構。
- **可追溯性**: 命令通常會自動處理日誌、ID 和連結。
- **安全性**: 工具可能有內建驗證以防止無效狀態。

**範例**:
- ✅ 使用 `/openspec proposal "新增登入"` 取代手動建立 `changes/add-login/proposal.md`。

---

### 2. 方法論優於工具

**規則**: SDD 是一種方法論，不綁定於單一工具。雖然 OpenSpec 是常見的實作，但本標準適用於任何 SDD 工具（例如 Spec Kit）。

**指引**:
- **通用流程**: 提案 -> 審查 -> 實作 -> 驗證 -> 歸檔。
- **工具適應**: 適應工作區中啟用之 SDD 工具的特定命令與模式。

---

### 3. 先規格，後程式碼

**規則**: 在沒有經核准的規格或變更提案的情況下，不得進行功能性的程式碼變更。

**例外情況**:
- 關鍵熱修復（立即恢復服務，隨後補文件）。
- 瑣碎變更（錯字、註解、格式調整）。

---

## 規格文件範本

### 提案範本

```markdown
# [SPEC-ID] 功能標題

## 摘要
簡述提議的變更。

## 動機
為何需要此變更？解決什麼問題？

## 詳細設計
技術方法、影響的元件、資料流程。

## 驗收條件
- [ ] 條件 1
- [ ] 條件 2

## 相依性
列出對其他規格或外部系統的相依性。

## 風險
潛在風險及緩解策略。
```

---

## 與其他標準整合

### 與 Commit 訊息指南整合

實作已核准的規格時，在 commit 訊息中引用規格 ID：

```
feat(auth): implement login feature

Implements SPEC-001 login functionality with OAuth2 support.

Refs: SPEC-001
```

### 與簽入標準整合

在為規格簽入程式碼前：

1. ✅ 規格已核准
2. ✅ 實作符合規格
3. ✅ 測試涵蓋驗收條件
4. ✅ PR 中引用規格 ID

### 與程式碼審查清單整合

審查者應驗證：

- [ ] 變更符合已核准的規格
- [ ] 無超出規格範圍的變更
- [ ] 規格驗收條件已達成

---

## 常見 SDD 工具

| 工具 | 說明 | 命令範例 |
|------|------|----------|
| **OpenSpec** | 規格管理 | `/openspec proposal`, `/openspec approve` |
| **Spec Kit** | 輕量級規格追蹤 | `/spec create`, `/spec close` |
| **手動** | 無工具，基於檔案 | 手動建立 `specs/SPEC-XXX.md` |

---

## 最佳實踐

### 應該做的

- ✅ 保持規格專注且原子化（每個規格一個變更）
- ✅ 包含明確的驗收條件
- ✅ 將規格連結到實作 PR
- ✅ 完成後歸檔規格

### 不應該做的

- ❌ 在規格核准前開始編碼
- ❌ 實作期間修改範圍而不更新規格
- ❌ 讓規格處於懸而未決狀態（始終關閉或歸檔）
- ❌ 跳過驗證步驟

---

## 相關標準

- [測試驅動開發](test-driven-development.md) - TDD 工作流程與 SDD 整合
- [測試標準](testing-standards.md) - 測試框架與最佳實踐（或使用 `/testing-guide` 技能）
- [測試完整性維度](test-completeness-dimensions.md) - 7 維度測試覆蓋
- [Commit 訊息指南](../../../core/commit-message-guide.md) - Commit 訊息規範
- [程式碼簽入標準](../../../core/checkin-standards.md) - 程式碼簽入標準
- [程式碼審查清單](../../../core/code-review-checklist.md) - 程式碼審查清單
- [文件結構標準](../../../core/documentation-structure.md) - 文件結構標準

---

## 版本歷史

| 版本 | 日期 | 變更內容 |
|------|------|----------|
| 1.2.0 | 2026-01-05 | 新增：IEEE 830-1998 和 SWEBOK v4.0 第 1 章（軟體需求）至參考資料 |
| 1.1.0 | 2025-12-24 | 新增：工作流程圖、規格範本、整合指南、最佳實踐、相關標準、授權 |
| 1.0.0 | 2025-12-23 | 初始 SDD 標準定義 |

---

## 參考資料

- [OpenSpec Documentation](https://github.com/openspec)
- [Design Documents Best Practices](https://www.industrialempathy.com/posts/design-docs-at-google/)
- [ADR (Architecture Decision Records)](https://adr.github.io/)
- [IEEE 830-1998 - 軟體需求規格](https://standards.ieee.org/ieee/830/1222/) - 需求文件標準
- [SWEBOK v4.0 - 第 1 章：軟體需求](https://www.computer.org/education/bodies-of-knowledge/software-engineering) - IEEE Computer Society

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
