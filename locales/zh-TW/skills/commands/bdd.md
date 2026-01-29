---
source: ../../../../skills/commands/bdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-12
status: experimental
---

---
description: 引導行為驅動開發流程 | Guide through Behavior-Driven Development workflow
allowed-tools: Read, Write, Grep, Glob, Bash(npm test:*), Bash(npx:*)
argument-hint: "[要實作的行為或場景 | behavior or scenario to implement]"
status: experimental
---

# BDD 助手

> [!WARNING]
> **實驗性功能 / Experimental Feature**
>
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。
> This feature is under active development and may change significantly in v4.0.

引導行為驅動開發（BDD）流程，使用 Given-When-Then 格式。

## 方法論整合

當調用 `/bdd` 時：
1. **自動啟用 BDD 方法論**（如果尚未啟用）
2. **將當前階段設為探索**（探索行為）
3. **追蹤階段轉換**隨著工作進展
4. **在回應中顯示階段指示器**（🔍 探索、📝 制定、🤖 自動化、📚 活文件）

詳見 [methodology-system](../methodology-system/SKILL.md) 了解完整方法論追蹤。

## BDD 循環

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│  ┌────┐   ┌────┐   ┌──────┐   ┌──────┐               │
│  │探索│ ► │制定│ ► │自動化│ ► │活文件│               │
│  └────┘   └────┘   └──────┘   └──────┘               │
│    ▲                              │                   │
│    └──────────────────────────────┘                   │
│                                                       │
└───────────────────────────────────────────────────────┘
```

## 工作流程

### 1. 探索 - 探索行為
- 與利害關係人討論
- 識別範例和邊界情況
- 理解功能背後的「為什麼」

### 2. 制定 - 撰寫場景
- 撰寫 Gherkin 場景（Given-When-Then）
- 使用通用語言
- 讓場景具體且明確

### 3. 自動化 - 實作測試
- 實作步驟定義
- 撰寫最小程式碼以通過
- 在自動化中遵循 TDD 循環

### 4. 活文件 - 維護
- 保持場景最新
- 作為文件使用
- 與利害關係人分享

## Gherkin 格式

```gherkin
功能: 用戶登入
  作為一個註冊用戶
  我想要登入我的帳戶
  以便我可以訪問我的個人儀表板

  場景: 使用有效憑證成功登入
    假設 我在登入頁面
    而且 我有一個註冊帳戶，郵箱為 "user@example.com"
    當 我輸入郵箱 "user@example.com"
    而且 我輸入密碼 "correctpassword"
    而且 我點擊登入按鈕
    那麼 我應該被重定向到我的儀表板
    而且 我應該看到歡迎訊息

  場景: 使用無效密碼登入失敗
    假設 我在登入頁面
    當 我輸入郵箱 "user@example.com"
    而且 我輸入密碼 "wrongpassword"
    而且 我點擊登入按鈕
    那麼 我應該看到錯誤訊息 "無效的憑證"
    而且 我應該留在登入頁面
```

## 三劍客會議

BDD 最適合協作：

| 角色 | 關注點 |
|------|--------|
| 業務 | 什麼和為什麼 |
| 開發 | 如何實現 |
| 測試 | 假設情況 |

## 使用方式

- `/bdd` - 啟動互動式 BDD 會話
- `/bdd "用戶可以重設密碼"` - 針對特定功能的 BDD
- `/bdd login-feature.feature` - 使用現有功能檔案

## 階段檢查清單

### 探索階段
- [ ] 已識別利害關係人
- [ ] 已討論用戶故事
- [ ] 已收集範例
- [ ] 已識別邊界情況

### 制定階段
- [ ] 場景遵循 Given-When-Then
- [ ] 語言是通用的（共享詞彙）
- [ ] 場景具體且明確
- [ ] 場景中無實作細節

### 自動化階段
- [ ] 已實作步驟定義
- [ ] 測試可執行
- [ ] 程式碼通過所有場景
- [ ] 重構完成

### 活文件階段
- [ ] 場景是最新的
- [ ] 文件可訪問
- [ ] 利害關係人可閱讀和理解

## 參考

- 方法論: [bdd.methodology.yaml](../../../../methodologies/bdd.methodology.yaml)
- 方法論系統: [methodology-system](../methodology-system/SKILL.md)
