---
source: ../../../../../skills/claude-code/commands/bdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-12
status: experimental
---

---
description: 引導行为驅动开发流程 | Guide through Behavior-Driven Development workflow
allowed-tools: Read, Write, Grep, Glob, Bash(npm test:*), Bash(npx:*)
argument-hint: [要实作的行为或場景 | behavior or scenario to implement]
status: experimental
---

# BDD 助手

> [!WARNING]
> **实驗性功能 / Experimental Feature**
>
> 此功能正在積極开发中，可能在 v4.0 中有重大变更。
> This feature is under active development and may change significantly in v4.0.

引導行为驅动开发（BDD）流程，使用 Given-When-Then 格式。

## 方法論集成

當調用 `/bdd` 时：
1. **自动啟用 BDD 方法論**（如果尚未啟用）
2. **將當前阶段设为探索**（探索行为）
3. **追蹤阶段转换**隨著工作进展
4. **在响应中顯示阶段指示器**（🔍 探索、📝 制定、🤖 自动化、📚 活文件）

詳見 [methodology-system](../methodology-system/SKILL.md) 了解完整方法論追蹤。

## BDD 循環

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│  ┌────┐   ┌────┐   ┌──────┐   ┌──────┐               │
│  │探索│ ► │制定│ ► │自动化│ ► │活文件│               │
│  └────┘   └────┘   └──────┘   └──────┘               │
│    ▲                              │                   │
│    └──────────────────────────────┘                   │
│                                                       │
└───────────────────────────────────────────────────────┘
```

## 工作流程

### 1. 探索 - 探索行为
- 与利害关系人討論
- 識别範例和邊界情况
- 理解功能背後的「为什麼」

### 2. 制定 - 撰写場景
- 撰写 Gherkin 場景（Given-When-Then）
- 使用通用语言
- 讓場景具体且明确

### 3. 自动化 - 实作测试
- 实作步骤定義
- 撰写最小程序码以通過
- 在自动化中遵循 TDD 循環

### 4. 活文件 - 維護
- 保持場景最新
- 作为文件使用
- 与利害关系人分享

## Gherkin 格式

```gherkin
功能: 用戶登入
  作为一个註冊用戶
  我想要登入我的帳戶
  以便我可以訪問我的个人儀表板

  場景: 使用有效憑证成功登入
    假设 我在登入页面
    而且 我有一个註冊帳戶，郵箱为 "user@example.com"
    當 我输入郵箱 "user@example.com"
    而且 我输入密码 "correctpassword"
    而且 我点擊登入按鈕
    那麼 我应該被重定向到我的儀表板
    而且 我应該看到歡迎消息

  場景: 使用無效密码登入失败
    假设 我在登入页面
    當 我输入郵箱 "user@example.com"
    而且 我输入密码 "wrongpassword"
    而且 我点擊登入按鈕
    那麼 我应該看到错误消息 "無效的憑证"
    而且 我应該留在登入页面
```

## 三劍客会議

BDD 最適合协作：

| 角色 | 关注点 |
|------|--------|
| 业务 | 什麼和为什麼 |
| 开发 | 如何实現 |
| 测试 | 假设情况 |

## 使用方式

- `/bdd` - 啟动互动式 BDD 会話
- `/bdd "用戶可以重设密码"` - 針对特定功能的 BDD
- `/bdd login-feature.feature` - 使用現有功能文件

## 阶段检查清单

### 探索阶段
- [ ] 已識别利害关系人
- [ ] 已討論用戶故事
- [ ] 已收集範例
- [ ] 已識别邊界情况

### 制定阶段
- [ ] 場景遵循 Given-When-Then
- [ ] 语言是通用的（共享詞彙）
- [ ] 場景具体且明确
- [ ] 場景中無实作細节

### 自动化阶段
- [ ] 已实作步骤定義
- [ ] 测试可执行
- [ ] 程序码通過所有場景
- [ ] 重構完成

### 活文件阶段
- [ ] 場景是最新的
- [ ] 文件可訪問
- [ ] 利害关系人可阅读和理解

## 參考

- 方法論: [bdd.methodology.yaml](../../../../../methodologies/bdd.methodology.yaml)
- 方法論系统: [methodology-system](../methodology-system/SKILL.md)
