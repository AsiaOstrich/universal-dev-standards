---
source: ../../../../skills/code-review-assistant/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 8255f4464f62
status: current
scope: universal
description: |
  系統化的程式碼審查檢查清單和提交前品質關卡。
  使用時機：審查 pull request、檢查程式碼品質、提交程式碼前。
  關鍵字：review, PR, pull request, checklist, quality, commit, 審查, 檢查, 簽入。
---

# 程式碼審查助理

> **語言**: [English](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/skills/code-review-assistant/guide.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2025-12-24
**適用範圍**: Claude Code Skills

---

> **核心標準**：此技能實作 [Code Review Checklist](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/locales/zh-TW/core/code-review-checklist.md)。完整的方法論文件請參閱核心標準。

## 目的

此技能提供系統化的程式碼審查和提交前驗證檢查清單。

## 快速參考

### 註解前綴

| 前綴 | 意義 | 需要採取的行動 |
|--------|---------|------------------|
| **❗ BLOCKING** | 合併前必須修正 | 🔴 必要 |
| **⚠️ IMPORTANT** | 應該修正，但不阻擋合併 | 🟡 建議 |
| **💡 SUGGESTION** | 可改進之處 | 🟢 選擇性 |
| **❓ QUESTION** | 需要釐清 | 🔵 討論 |
| **📝 NOTE** | 資訊性質，無需行動 | ⚪ 資訊 |

### 審查檢查清單類別

1. **功能性** - 是否正常運作？
2. **設計** - 架構是否正確？
3. **品質** - 程式碼是否乾淨？
4. **可讀性** - 是否容易理解？
5. **測試** - 涵蓋率是否足夠？
6. **安全性** - 是否有漏洞？
7. **效能** - 是否高效？
8. **錯誤處理** - 是否妥善處理？
9. **文件** - 是否更新？
10. **依賴項** - 是否必要？

### 提交前檢查清單

- [ ] 建置成功（零錯誤、零警告）
- [ ] 所有測試通過
- [ ] 程式碼符合專案標準
- [ ] 無安全漏洞
- [ ] 文件已更新
- [ ] 分支已與目標同步

## 詳細指南

完整標準請參閱：
- [審查檢查清單](./review-checklist.md)
- [提交前檢查清單](./checkin-checklist.md)

### AI 最佳化格式（節省 Token）

AI 助手可使用 YAML 格式檔案以減少 token 用量：
- 基礎標準：`ai/standards/code-review.ai.yaml`

## 審查註解範例

```markdown
❗ BLOCKING: 此處有潛在的 SQL injection 漏洞。
請使用參數化查詢而非字串串接。

⚠️ IMPORTANT: 此方法做太多事情了（120 行）。
考慮將驗證邏輯提取到獨立方法。

💡 SUGGESTION: 考慮在此使用 Map 而非陣列以達到 O(1) 查找。

❓ QUESTION: 為什麼這裡使用 setTimeout 而不是 async/await？

📝 NOTE: 這是個聰明的解決方案！很好地運用了 reduce。
```

## 核心原則

1. **保持尊重** - 審查程式碼，而非審查人
2. **保持徹底** - 檢查功能性，而非僅檢查語法
3. **保持及時** - 在 24 小時內完成審查
4. **保持清晰** - 解釋「為什麼」，而非僅「是什麼」

---

## 簽入品質關卡（YAML 壓縮格式）

```yaml
# === 強制檢查清單 ===
build:
  - code_compiles: "零錯誤、零警告"
  - dependencies: "全部已安裝、版本已鎖定"
  verify: "在本機執行建置，退出碼為 0"

test:
  - existing_pass: "100% 通過率（unit/integration/e2e）"
  - new_code_tested: "功能→測試、錯誤修復→迴歸測試"
  - coverage: "未降低、關鍵路徑已測試"
  verify: "執行所有測試套件，檢視覆蓋率報告"

quality:
  - standards: "命名、格式、註解"
  - no_smells: "方法≤50 行、巢狀≤3 層、複雜度≤10、無重複"
  - security: "無寫死的密鑰、無 SQLi、無 XSS、無不安全的依賴套件"
  verify: "執行 linter、靜態分析、安全掃描器"

docs:
  - api_docs: "公開 API 已記錄"
  - readme: "如需要已更新"
  - changelog: "使用者可見變更 → [Unreleased]"

workflow:
  - branch_naming: "feature/, fix/, docs/, chore/"
  - commit_message: "conventional commits 格式"
  - synced: "已與目標分支合併/rebase"

# === 絕不在以下情況提交 ===
blockers:
  - "建置有錯誤"
  - "測試失敗"
  - "功能不完整（會破壞功能）"
  - "關鍵邏輯中包含 WIP/TODO"
  - "包含除錯程式碼（console.log, print）"
  - "包含被註解掉的程式碼區塊"

# === 提交時機 ===
good_times:
  - "完成的功能單元"
  - "特定錯誤已修復並附迴歸測試"
  - "獨立重構（所有測試通過）"
  - "可執行狀態"

bad_times:
  - "建置失敗"
  - "測試失敗"
  - "功能不完整"
  - "含有 TODO 的實驗性程式碼"

# === 粒度 ===
ideal_size:
  files: "1-10（超過 10 則拆分）"
  lines: "50-300"
  scope: "單一關注點"

split_principle:
  combine: ["功能 + 其測試", "緊密相關的多檔案變更"]
  separate: ["功能 A + 功能 B", "重構 + 新功能", "錯誤修復 + 順便重構"]
```

---

## 配置偵測

此技能支援專案特定配置。

### 偵測順序

1. 檢查 `CONTRIBUTING.md` 的「Disabled Skills」區段
   - 如果此技能被列出，則在此專案中停用
2. 檢查 `CONTRIBUTING.md` 的「Code Review Language」區段
3. 若未找到，**預設使用英文**

### 首次設定

如果未找到配置且情境不明確：

1. 詢問使用者：「此專案尚未配置程式碼審查語言。您想使用哪個選項？（English / 中文）」
2. 使用者選擇後，建議在 `CONTRIBUTING.md` 中記錄：

```markdown
## Code Review Language

This project uses **[chosen option]** for code review comments.
<!-- Options: English | 中文 -->
```

### 配置範例

在專案的 `CONTRIBUTING.md` 中：

```markdown
## Code Review Language

This project uses **English** for code review comments.
<!-- Options: English | 中文 -->

### Comment Prefixes
BLOCKING, IMPORTANT, SUGGESTION, QUESTION, NOTE
```

---

## 相關標準

- [Code Review Checklist](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/locales/zh-TW/core/code-review-checklist.md) - 核心程式碼審查標準
- [Checkin Standards](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/locales/zh-TW/core/checkin-standards.md) - 提交前品質關卡
- [Testing Standards](https://github.com/AsiaOstrich/universal-dev-standards/blob/main/locales/zh-TW/core/testing-standards.md) - 測試要求

---

## 版本歷史

| 版本 | 日期 | 變更內容 |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | 新增：標準區段（目的、相關標準、版本歷史、授權） |

---

## 授權

此技能依據 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
