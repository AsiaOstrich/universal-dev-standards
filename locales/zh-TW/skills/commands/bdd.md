---
source: ../../../../skills/commands/bdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: f3e5c2af38e5
status: experimental
---

---
description: [UDS] Guide through Behavior-Driven Development workflow
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

## 前置檢查

在執行 BDD 階段前，AI 助手必須驗證前置條件。如果檢查失敗，停止並引導使用者。

### 階段閘門矩陣

| 目標階段 | 前置檢查 | 失敗時 |
|-------------|-----------------|------------|
| `DISCOVERY` | 1. 已明確識別功能／行為 | → 請使用者描述期望的行為 |
| | 2. 若為 SDD 專案：規格已存在 | → 引導至 `/sdd` |
| `FORMULATION` | 1. 探索產出已存在（範例、邊界情況） | → 引導回 DISCOVERY |
| | 2. 至少已收集一個具體範例 | → 先收集範例 |
| `AUTOMATION` | 1. 含場景的 `.feature` 檔案已存在 | → 引導至 FORMULATION |
| | 2. 場景遵循 Given-When-Then 格式 | → 修正場景格式 |
| `LIVING DOCS` | 1. 已實作步驟定義 | → 引導至 AUTOMATION |
| | 2. 所有場景皆通過 | → 先修正失敗的場景 |

### 功能檔優先強制

```
🔍 DISCOVERY: Collect examples → identify edge cases
   ↓ (only proceed with concrete examples)
📝 FORMULATION: Write .feature file → Given/When/Then
   ↓ (only proceed with valid Gherkin scenarios)
🤖 AUTOMATION: Implement step definitions → run
   ↓ (only proceed when all scenarios pass)
📚 LIVING DOCS: Maintain and share
```

**關鍵規則**：AI 不得在含 Gherkin 場景的 `.feature` 檔案存在前撰寫步驟定義。探索階段必須產出具體範例才能進入制定階段。

---

## 方法論整合

當調用 `/bdd` 時：
1. **自動啟用 BDD 方法論**（如果尚未啟用）
2. **將當前階段設為探索**（探索行為）
3. **追蹤階段轉換**隨著工作進展
4. **在回應中顯示階段指示器**（🔍 探索、📝 制定、🤖 自動化、📚 活文件）

詳見 [methodology-system](../dev-methodology/SKILL.md) 了解完整方法論追蹤。

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
功能: 使用者登入
  作為一個已註冊的使用者
  我想要登入我的帳戶
  以便我可以存取我的個人儀表板

  場景: 使用有效憑證成功登入
    假設 我在登入頁面
    而且 我有一個已註冊帳戶，電子郵件為 "user@example.com"
    當 我輸入電子郵件 "user@example.com"
    而且 我輸入密碼 "correctpassword"
    而且 我點擊登入按鈕
    那麼 我應該被重新導向到我的儀表板
    而且 我應該看到歡迎訊息

  場景: 使用無效密碼登入失敗
    假設 我在登入頁面
    當 我輸入電子郵件 "user@example.com"
    而且 我輸入密碼 "wrongpassword"
    而且 我點擊登入按鈕
    那麼 我應該看到錯誤訊息 "無效的憑證"
    而且 我應該留在登入頁面
```

## 三劍客會議

BDD 最適合協作：

| Role | Focus | 角色 | 關注點 |
|------|-------|------|--------|
| Business | What & Why | 業務 | 什麼和為什麼 |
| Development | How | 開發 | 如何實現 |
| Testing | What if | 測試 | 假設情況 |

## 使用方式

- `/bdd` - 啟動互動式 BDD 會話
- `/bdd "使用者可以重設密碼"` - 針對特定功能的 BDD
- `/bdd login-feature.feature` - 使用現有功能檔案

## 階段檢查清單

### 探索階段
- [ ] 已識別利害關係人
- [ ] 已討論使用者故事
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
- [ ] 文件可存取
- [ ] 利害關係人可閱讀和理解

## AI 代理行為

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### 進入路由

| 輸入 | AI 動作 |
|-------|-----------|
| `/bdd` | 詢問要探索的行為，進入 🔍 DISCOVERY |
| `/bdd "feature description"` | 以指定功能為目標，進入 🔍 DISCOVERY |
| `/bdd <feature-file>` | 載入現有 `.feature` 檔案，判斷進入哪個階段 |

### 互動腳本

#### 🔍 DISCOVERY 階段

1. 與使用者討論功能行為
2. 收集具體範例和邊界案例
3. 以 Three Amigos 視角提問（Business / Dev / Testing）

🛑 **STOP**: 收集足夠範例後展示摘要，等待確認進入 FORMULATION

#### 📝 FORMULATION 階段

1. 將範例轉為 Gherkin 場景（Given-When-Then）
2. 使用領域語言（ubiquitous language）
3. 展示生成的 `.feature` 內容

**Decision: 場景品質**
- IF 場景包含實作細節 → 自動抽離，改用業務語言
- IF 場景過於模糊 → 要求更具體的範例

🛑 **STOP**: 展示 `.feature` 後等待使用者確認寫入

#### 🤖 AUTOMATION 階段

1. 為每個場景實作 step definitions
2. 執行場景，確認結果
3. 場景內部使用 TDD 循環實作

🛑 **STOP**: 所有場景通過後等待使用者確認

#### 📚 LIVING DOCS 階段

1. 確認所有場景是最新狀態
2. 建議文件可分享給利害關係人

### 停止點

| 階段 | 停止點 | 等待內容 |
|-------|-----------|---------|
| DISCOVERY | 範例收集完成後 | 確認進入 FORMULATION |
| FORMULATION | `.feature` 生成後 | 確認寫入 |
| AUTOMATION | 所有場景通過後 | 確認進入 LIVING DOCS |

### 錯誤處理

| 錯誤情況 | AI 動作 |
|-----------------|-----------|
| 使用者要求跳過 DISCOVERY 直接寫場景 | 提醒需要具體範例，但允許 override |
| `.feature` 語法無效 | 自動修正 Gherkin 語法 |
| Step definition 實作失敗 | 報告哪個 step 失敗，嘗試修復，3 次後 STOP |
| 無 BDD 測試框架（Cucumber 等） | 建議安裝，或改用 TDD 方式實作場景邏輯 |

## 參考

- 方法論: [bdd.methodology.yaml](../../../../methodologies/bdd.methodology.yaml)
- 方法論系統: [methodology-system](../dev-methodology/SKILL.md)
