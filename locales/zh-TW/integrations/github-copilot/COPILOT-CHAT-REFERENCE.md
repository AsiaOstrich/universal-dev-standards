---
source: ../../../../integrations/github-copilot/COPILOT-CHAT-REFERENCE.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-13
status: current
---

# Copilot Chat 參考指南

本文件提供 GitHub Copilot Chat 的提示範本，以實現類似 Claude Code 斜線命令的功能。

---

## 為什麼需要這份文件？

GitHub Copilot 不支援像 Claude Code 那樣的斜線命令。此參考提供標準化提示，讓您在 Copilot Chat 中實現類似效果。

---

## 提示範本

### 1. 產生 Commit 訊息

**Claude Code**：`/commit`

**Copilot Chat 提示**：
```
為這些變更產生 commit 訊息，遵循 Conventional Commits 格式：
- 類型：feat, fix, docs, style, refactor, test 或 chore
- 格式：type(scope): description
- 主題行保持在 50 字元以內
```

**範例**：
```
為我剛才對認證模組的變更產生 commit 訊息。
使用 Conventional Commits 格式：type(scope): description
```

---

### 2. 程式碼審查

**Claude Code**：`/review`

**Copilot Chat 提示**：
```
依照程式碼審查檢查清單審查此程式碼：

1. 功能 - 是否正確運作？
2. 設計 - 架構正確？
3. 品質 - 程式碼乾淨，無壞味道？
4. 安全 - 無漏洞？
5. 測試 - 覆蓋率足夠？
6. 效能 - 高效？

使用這些評論前綴：
- ❗ 阻擋：必須修復
- ⚠️ 重要：應該修復
- 💡 建議：可有可無
- ❓ 問題：需要澄清
```

---

### 3. TDD 指導

**Claude Code**：`/tdd`

**Copilot Chat 提示**：
```
使用 TDD（測試驅動開發）幫我實作 [功能]：

1. 紅燈：先寫失敗的測試
   - 測試應描述行為，非實作
   - 使用 AAA 模式（Arrange-Act-Assert）

2. 綠燈：寫最小程式碼通過測試
   - 「假實作」可接受
   - 不要過度設計

3. 重構：保持測試通過的同時清理程式碼
   - 每次變更後執行測試

遵循 FIRST 原則：快速、獨立、可重複、自驗證、及時
```

---

### 4. 測試覆蓋分析

**Claude Code**：`/coverage`

**Copilot Chat 提示**：
```
使用 7 維度分析 [功能] 的測試覆蓋：

1. 正常路徑 - 正常預期行為
2. 邊界 - 最小/最大值、限制
3. 錯誤處理 - 無效輸入、例外
4. 授權 - 角色存取控制
5. 狀態變更 - 前/後驗證
6. 驗證 - 格式、業務規則
7. 整合 - 真實 DB/API 查詢

哪些維度缺失？我應該新增什麼測試？
```

---

### 5. 需求撰寫

**Claude Code**：`/requirement`

**Copilot Chat 提示**：
```
幫我依照 INVEST 條件撰寫使用者故事：

格式：
作為一個 [角色]，
我想要 [功能]，
以便 [效益]。

INVEST 檢查清單：
- 獨立：可單獨交付？
- 可協商：細節可討論？
- 有價值：提供使用者價值？
- 可估計：可估算工作量？
- 小：一個 Sprint 內完成？
- 可測試：有明確驗收條件？

包含具體、可衡量的驗收條件。
```

---

### 6. 簽入前檢查

**Claude Code**：`/check`

**Copilot Chat 提示**：
```
在我提交前，驗證這些品質關卡：

□ 建置：程式碼編譯無錯誤？
□ 測試：所有測試通過？
□ 品質：程式碼遵循標準？有機密嗎？
□ 文件：已更新文件？
□ 工作流程：分支命名和 commit 訊息正確？

如果有以下情況，我不應該提交：
- 建置錯誤
- 測試失敗
- 功能不完整
- 含有除錯程式碼（console.log）
- 含有註解掉的程式碼
```

---

### 7. 發布準備

**Claude Code**：`/release`

**Copilot Chat 提示**：
```
幫我依照語義化版本準備發布：

版本格式：MAJOR.MINOR.PATCH
- MAJOR：破壞性變更
- MINOR：新功能（向後相容）
- PATCH：錯誤修復

任務：
1. 這應該是什麼版本？
2. 產生 CHANGELOG 條目，包含：
   - Added：新功能
   - Changed：既有功能變更
   - Fixed：錯誤修復
   - Deprecated：即將移除的功能
   - Removed：已移除的功能
   - Security：安全修復
```

---

### 8. 文件撰寫

**Claude Code**：`/docs`

**Copilot Chat 提示**：
```
幫我為這個 [函式/模組/API] 撰寫文件：

包含：
1. 目的 - 它做什麼？
2. 參數 - 輸入參數與型別
3. 回傳值 - 它回傳什麼
4. 範例 - 使用範例
5. 錯誤 - 可能的錯誤情況
6. 相關 - 相關函式/模組
```

---

## 快速參考卡

| 任務 | Copilot Chat 提示開頭 |
|------|----------------------|
| Commit | "產生 commit 訊息，遵循 Conventional Commits..." |
| 審查 | "依照檢查清單審查此程式碼..." |
| TDD | "使用 TDD 幫我實作..." |
| 覆蓋 | "使用 7 維度分析測試覆蓋..." |
| 需求 | "依照 INVEST 撰寫使用者故事..." |
| 簽入前 | "在提交前驗證這些品質關卡..." |
| 發布 | "依照語義化版本準備發布..." |
| 文件 | "為此撰寫文件..." |

---

## 最佳實踐

### 1. 具體明確

```
❌ "審查此程式碼"
✅ "審查此認證模組的安全漏洞和測試覆蓋"
```

### 2. 提供上下文

```
❌ "寫測試"
✅ "為 calculateDiscount 函式寫單元測試，涵蓋邊界值和錯誤情況"
```

### 3. 參考標準

```
"遵循專案的防幻覺標準，先閱讀實際程式碼再驗證你的建議"
```

### 4. 要求說明理由

```
"用 [已確認] 或 [假設] 標籤解釋你為什麼做這個建議"
```

---

## 相關資源

- [copilot-instructions.md](./copilot-instructions.md) - 完整規範參考
- [skills-mapping.md](./skills-mapping.md) - Claude Code skills 對照

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-01-13 | 初始發布 |

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
