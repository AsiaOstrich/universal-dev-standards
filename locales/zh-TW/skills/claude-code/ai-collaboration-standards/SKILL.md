---
source: ../../../../../skills/claude-code/ai-collaboration-standards/SKILL.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-01-25
status: current
---

# AI 協作標準

> **語言**: [English](../../../../../skills/claude-code/ai-collaboration-standards/SKILL.md) | 繁體中文

**版本**: 1.1.0
**最後更新**: 2026-01-25
**適用範圍**: Claude Code Skills

---

## 目的

此技能確保 AI 助理提供準確、基於證據的回應，避免產生幻覺。

## 快速參考

### 確定性標籤

| 標籤 | 使用時機 |
|-----|----------|
| `[Confirmed]` | 來自程式碼/文件的直接證據 |
| `[Inferred]` | 基於證據的邏輯推論 |
| `[Assumption]` | 基於常見模式（需要驗證） |
| `[Unknown]` | 資訊不可用 |
| `[Need Confirmation]` | 需要使用者澄清 |

### 來源類型

| 來源類型 | 標籤 | 可靠性 |
|-------------|-----|-------------|
| 專案程式碼 | `[Source: Code]` | ⭐⭐⭐⭐⭐ 最高 |
| 專案文件 | `[Source: Docs]` | ⭐⭐⭐⭐ 高 |
| 外部文件 | `[Source: External]` | ⭐⭐⭐⭐ 高 |
| 網路搜尋 | `[Source: Search]` | ⭐⭐⭐ 中等 |
| AI 知識 | `[Source: Knowledge]` | ⭐⭐ 低 |
| 使用者提供 | `[Source: User]` | ⭐⭐⭐ 中等 |

### 核心規則

1. **僅基於證據**: 只分析已明確讀取的內容
2. **引用來源**: 包含程式碼參考的檔案路徑和行號
3. **分類確定性**: 為所有陳述標記確定性等級
4. **永遠提供建議**: 在呈現選項時，包含建議選擇及其理由

## 詳細指南

完整標準請參閱：
- [防幻覺指南](./anti-hallucination.md)
- [確定性標籤參考](./certainty-labels.md)

## 範例

### ✅ 正確回應

```
[Confirmed] src/auth/service.ts:45 - JWT 驗證使用 'jsonwebtoken' 函式庫
[Inferred] 基於 src/repositories/ 中的儲存庫模式，可能使用依賴注入
[Need Confirmation] 新功能是否應支援多租戶？
```

### ❌ 錯誤回應

```
系統使用 Redis 進行快取（程式碼未審查）
UserService 應該有 authenticate() 方法（API 未驗證）
```

### ✅ 正確選項呈現

```
有三個選項：
1. Redis 快取
2. 記憶體快取
3. 檔案快取

**建議：選項 1 (Redis)**：鑑於專案已有 Redis 基礎設施
且需要跨實例快取共享，Redis 是最合適的選擇。
```

### ❌ 錯誤選項呈現

```
有三個選項：
1. Redis 快取
2. 記憶體快取
3. 檔案快取

請選擇一個。
```

## 檢查清單

在做出任何陳述之前：

- [ ] 來源已驗證 - 我是否已讀取實際檔案/文件？
- [ ] 來源類型已標記 - 我是否指定了 `[Source: Code]`、`[Source: External]` 等？
- [ ] 參考已引用 - 我是否包含了檔案路徑和行號？
- [ ] 確定性已分類 - 我是否標記為 `[Confirmed]`、`[Inferred]` 等？
- [ ] 無捏造 - 我是否避免了虛構 API、設定或需求？
- [ ] 包含建議 - 在呈現選項時，我是否包含了建議選擇？

---

## 設定檢測

此技能支援專案特定的確定性標籤語言設定。

### 檢測順序

1. 檢查 `CONTRIBUTING.md` 中的「Certainty Tag Language」章節
2. 如果找到，使用指定的語言（English / 中文）
3. 如果未找到，**預設使用英文**標籤

### 首次設定

如果未找到設定且情境不明確：

1. 詢問使用者：「此專案尚未設定確定性標籤語言偏好。您想使用哪一種？（English / 中文）」
2. 使用者選擇後，建議在 `CONTRIBUTING.md` 中記錄：

```markdown
## Certainty Tag Language

This project uses **[English / 中文]** certainty tags.
<!-- Options: English | 中文 -->
```

### 設定範例

在專案的 `CONTRIBUTING.md` 中：

```markdown
## Certainty Tag Language

This project uses **English** certainty tags.

### Tag Reference
- [Confirmed] - Direct evidence from code/docs
- [Inferred] - Logical deduction from evidence
- [Assumption] - Based on common patterns
- [Unknown] - Information not available
- [Need Confirmation] - Requires user clarification
```

---

## 相關標準

- [防幻覺標準](../../core/anti-hallucination.md)
- [程式碼審查檢查清單](../../core/code-review-checklist.md)
- [測試標準](../../core/testing-standards.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | 新增：標準章節（目的、相關標準、版本歷史、授權） |

---

## 授權

此技能依據 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
