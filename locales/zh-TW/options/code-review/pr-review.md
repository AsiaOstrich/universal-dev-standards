---
source: options/code-review/pr-review.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Pull Request 審查

> **語言**: [English](../../../../options/code-review/pr-review.md) | 繁體中文

**上層標準**: [Code Review Checklist](../../core/code-review-checklist.md)

---

## 概觀

Pull Request（PR）審查是傳統的非同步程式碼審查流程，在合併前先提交變更以供審查。它提供有文件記錄的稽核軌跡，並且很適合分散式團隊。

## 最適用於

- 橫跨不同時區的分散式團隊
- 非同步工作流程
- 需要稽核軌跡的專案
- 開源專案
- 合規與法規要求

## 工作流程

### 1. 建立 Pull Request

**作者職責：**
- 撰寫清楚、具描述性的 PR 標題
- 加入完整的描述
- 連結相關 issue
- 指派適當的 reviewer
- 確保 CI 檢查通過

### 2. 審查

**Reviewer 職責：**
- 檢查功能與正確性
- 審查程式碼品質與風格
- 驗證安全考量
- 必要時在本機執行測試
- 提供建設性的回饋

### 3. 回應回饋

**作者職責：**
- 處理所有回饋意見
- 以新的 commit 推送修正
- 回覆評論
- 準備好後請求重新審查

### 4. Approve 並合併

**最後步驟：**
- 取得必要的 approval
- 確保所有檢查通過
- 使用約定的策略合併
- 刪除 feature 分支

## 審查檢查清單

### 功能

- [ ] 程式碼是否正常運作？
- [ ] 是否處理了邊界案例？
- [ ] 錯誤處理是否適當？

### 程式碼品質

- [ ] 程式碼是否易讀？
- [ ] 函式是否聚焦（單一職責）？
- [ ] 是否有程式碼重複？
- [ ] 命名是否具描述性？

### 安全

- [ ] 是否有 injection 漏洞？
- [ ] 輸入是否經過驗證？
- [ ] 是否有憑證外洩？
- [ ] 相依套件是否安全？

### 測試

- [ ] 是否有足夠的測試？
- [ ] 測試是否涵蓋邊界案例？
- [ ] 測試是否易讀且易維護？

## 評論慣例

### 前綴風格

| 前綴 | 意義 | 是否阻擋 |
|--------|---------|----------|
| `[REQUIRED]` | 合併前必須修正 | 是 |
| `[SUGGESTION]` | 考慮修改 | 否 |
| `[QUESTION]` | 需要釐清 | 否 |
| `[NIT]` | 細微的風格問題 | 否 |
| `[PRAISE]` | 做得好 | 否 |

### Emoji 風格

| Emoji | 意義 |
|-------|---------|
| ❗ | 阻擋性問題 |
| ⚠️ | 建議 |
| 💡 | 想法 |
| ❓ | 問題 |
| 👍 | 讚賞 |

## PR 範本

```markdown
## Summary
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated if needed
```

## 規則

| 規則 | 描述 | 優先級 |
|------|-------------|----------|
| 及時審查 | 在 24 小時內審查 | Recommended |
| 建設性回饋 | 說明原因，而不只是說明內容 | Required |
| Approve 前先測試 | 確保所有測試通過 | Required |
| 最少 reviewer 數 | 至少需要一個 approval | Required |

## 與其他方法的比較

| 面向 | PR Review | Pair Programming |
|--------|-----------|------------------|
| 時機 | 非同步 | 即時 |
| 回饋 | 延遲 | 立即 |
| 知識分享 | 中等 | 高 |
| 文件記錄 | 較高（PR 評論） | 較低 |
| 可擴展性 | 高 | 有限 |
| 遠端友善度 | 容易 | 具挑戰性 |

## 相關選項

- [Pair Programming](./pair-programming.md) - 即時協作審查
- [Automated Review](./automated-review.md) - 工具輔助審查

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
