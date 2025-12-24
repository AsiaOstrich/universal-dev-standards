---
source: /skills/claude-code/code-review-assistant/checkin-checklist.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# Pre-Commit Checklist（提交前檢查清單）

> **語言**: [English](../../../../../skills/claude-code/code-review-assistant/checkin-checklist.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2025-12-24
**適用範圍**: Claude Code Skills

---

## 目的

本文件提供開發者在提交程式碼變更前需要驗證的檢查清單。

---

## 必要檢查

### 1. 建置驗證

- [ ] **程式碼編譯成功**
  - 零建置錯誤
  - 零建置警告（或已記錄的例外情況）

- [ ] **依賴套件已滿足**
  - 所有套件依賴已安裝
  - 依賴版本已鎖定
  - 無缺少的 imports

---

### 2. 測試驗證

- [ ] **所有現有測試通過**
  - 單元測試：100% 通過率
  - 整合測試：100% 通過率

- [ ] **新程式碼已測試**
  - 新功能有對應的測試
  - Bug 修復包含回歸測試

- [ ] **測試覆蓋率已維持**
  - 覆蓋率百分比未降低
  - 關鍵路徑已測試

---

### 3. 程式碼品質

- [ ] **遵循編碼標準**
  - 遵守命名慣例
  - 程式碼格式一致
  - 需要時有註解

- [ ] **無程式碼異味**
  - 方法 ≤50 行
  - 巢狀深度 ≤3 層
  - 循環複雜度 ≤10
  - 無重複程式碼區塊

- [ ] **安全性已檢查**
  - 無硬編碼的密鑰
  - 無 SQL 注入漏洞
  - 無 XSS 漏洞
  - 無不安全的依賴套件

---

### 4. 文件

- [ ] **API 文件已更新**
  - 公開 API 有文件註解
  - 參數已說明
  - 回傳值已記錄

- [ ] **README 已更新（如需要）**
  - 新功能已記錄
  - 重大變更已註記

- [ ] **CHANGELOG 已更新（如適用）**
  - 面向使用者的變更已加入 `[Unreleased]`
  - 重大變更已標記

---

### 5. 工作流程合規性

- [ ] **分支命名正確**
  - 遵循專案慣例（`feature/`、`fix/`）

- [ ] **提交訊息已格式化**
  - 遵循 conventional commits 或專案標準

- [ ] **與目標分支同步**
  - 已合併目標分支的最新變更
  - 無合併衝突

---

## 提交時機指南

### ✅ 適當的提交時機

1. **完成的功能單元**
   - 功能完全實作
   - 測試已撰寫並通過
   - 文件已更新

2. **特定 Bug 已修復**
   - Bug 已重現並修復
   - 已加入回歸測試

3. **獨立的重構**
   - 重構完成
   - 無功能變更
   - 所有測試仍通過

4. **可執行狀態**
   - 程式碼編譯無錯誤
   - 應用程式可執行/啟動
   - 核心功能未損壞

### ❌ 不適當的提交時機

1. **建置失敗**
   - 存在編譯錯誤
   - 未解決的依賴問題

2. **測試失敗**
   - 一個或多個測試失敗
   - 新程式碼尚未撰寫測試

3. **未完成的功能**
   - 功能部分實作
   - 會破壞現有功能

4. **實驗性程式碼**
   - 散佈 TODO 註解
   - 遺留除錯程式碼
   - 註解掉的程式碼區塊

---

## 提交粒度

### 理想的提交大小

| 指標 | 建議 |
|--------|-------------|
| 檔案數量 | 1-10 個檔案 |
| 變更行數 | 50-300 行 |
| 範圍 | 單一關注點 |

### 拆分原則

**合併為一個提交**：
- 功能實作 + 對應的測試
- 緊密相關的多檔案變更

**分開提交**：
- 功能 A + 功能 B → 分開
- 重構 + 新功能 → 分開
- Bug 修復 + 附帶重構 → 分開

---

## 特殊情境

### 緊急離開（WIP）

**選項 1：Git Stash（推薦）**
```bash
git stash save "WIP: description of incomplete work"
# Resume later
git stash pop
```

**選項 2：WIP 分支**
```bash
git checkout -b wip/feature-temp
git commit -m "WIP: progress save (do not merge)"
```

### Hotfix

1. 從 main 建立 hotfix 分支
2. 最小化變更（僅修復問題）
3. 快速驗證（確保測試通過）
4. 在提交訊息中標記緊急性：
   ```
   fix(module): [URGENT] fix critical issue
   ```

---

## 常見違規

### ❌ "WIP" 提交

```
git commit -m "WIP"
git commit -m "save work"
git commit -m "trying stuff"
```

**解決方案**：使用 `git stash` 或在合併前 squash

### ❌ 註解掉的程式碼

**問題**：使程式碼庫雜亂，混淆未來的開發者

**解決方案**：刪除它。Git 歷史會保留舊程式碼。

### ❌ 混合關注點

```
git commit -m "fix bug and refactor and add feature"
```

**解決方案**：分開為多個提交：
```
git commit -m "fix(module-a): resolve null pointer error"
git commit -m "refactor(module-b): extract validation logic"
git commit -m "feat(module-c): add export feature"
```

---

## 相關標準

- [Checkin Standards](../../../../../core/checkin-standards.md)
- [Code Review Checklist](./review-checklist.md)
- [Commit Message Guide](../../../../../core/commit-message-guide.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | 新增：標準章節（目的、相關標準、版本歷史、授權） |

---

## 授權

本文件依據 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
