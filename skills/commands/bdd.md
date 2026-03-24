---
description: [UDS] Guide through Behavior-Driven Development workflow
allowed-tools: Read, Write, Grep, Glob, Bash(npm test:*), Bash(npx:*)
argument-hint: "[behavior or scenario to implement | 要實作的行為或場景]"
status: experimental
---

# BDD Assistant | BDD 助手

> [!WARNING]
> **Experimental Feature / 實驗性功能**
>
> This feature is under active development and may change significantly in v4.0.
> 此功能正在積極開發中，可能在 v4.0 中有重大變更。

Guide through the Behavior-Driven Development (BDD) workflow using Given-When-Then format.

引導行為驅動開發（BDD）流程，使用 Given-When-Then 格式。

## Pre-Flight Checks | 前置檢查

Before executing BDD phases, the AI assistant MUST verify prerequisites. If a check fails, STOP and guide the user.

在執行 BDD 階段前，AI 助手必須驗證前置條件。如果檢查失敗，停止並引導使用者。

### Phase Gate Matrix | 階段閘門矩陣

| Target Phase | Pre-Flight Check | On Failure |
|-------------|-----------------|------------|
| `DISCOVERY` | 1. Feature/behavior clearly identified | → Ask user to describe the desired behavior |
| | 2. If SDD project: spec exists | → Guide to `/sdd` |
| `FORMULATION` | 1. Discovery output exists (examples, edge cases) | → Guide back to DISCOVERY |
| | 2. At least one concrete example collected | → Collect examples first |
| `AUTOMATION` | 1. `.feature` file exists with scenarios | → Guide to FORMULATION |
| | 2. Scenarios follow Given-When-Then format | → Fix scenario format |
| `LIVING DOCS` | 1. Step definitions implemented | → Guide to AUTOMATION |
| | 2. All scenarios passing | → Fix failing scenarios first |

### Feature-Before-Step Enforcement | 功能檔優先強制

```
🔍 DISCOVERY: Collect examples → identify edge cases
   ↓ (only proceed with concrete examples)
📝 FORMULATION: Write .feature file → Given/When/Then
   ↓ (only proceed with valid Gherkin scenarios)
🤖 AUTOMATION: Implement step definitions → run
   ↓ (only proceed when all scenarios pass)
📚 LIVING DOCS: Maintain and share
```

**Critical Rule**: The AI MUST NOT write step definitions before `.feature` files with Gherkin scenarios exist. Discovery must produce concrete examples before formulation begins.

**關鍵規則**：AI 不得在 `.feature` 檔案存在前撰寫步驟定義。探索階段必須產出具體範例才能進入制定階段。

---

## Methodology Integration | 方法論整合

When `/bdd` is invoked:
1. **Automatically activate BDD methodology** if not already active
2. **Set current phase to DISCOVERY** (exploring behavior)
3. **Track phase transitions** as work progresses
4. **Show phase indicators** in responses (🔍 Discovery, 📝 Formulation, 🤖 Automation, 📚 Living Docs)

當調用 `/bdd` 時：
1. **自動啟用 BDD 方法論**（如果尚未啟用）
2. **將當前階段設為探索**（探索行為）
3. **追蹤階段轉換**隨著工作進展
4. **在回應中顯示階段指示器**（🔍 探索、📝 制定、🤖 自動化、📚 活文件）

See [methodology-system](../methodology-system/SKILL.md) for full methodology tracking.

## BDD Cycle | BDD 循環

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│  ┌─────────┐   ┌───────────┐   ┌──────────┐   ┌────┐ │
│  │DISCOVERY│ ► │FORMULATION│ ► │AUTOMATION│ ► │DOCS│ │
│  └─────────┘   └───────────┘   └──────────┘   └────┘ │
│       ▲                                    │          │
│       └────────────────────────────────────┘          │
│                                                       │
└───────────────────────────────────────────────────────┘
```

## Workflow | 工作流程

### 1. DISCOVERY - Explore Behavior | 探索行為
- Discuss with stakeholders
- Identify examples and edge cases
- Understand the "why" behind features

### 2. FORMULATION - Write Scenarios | 制定場景
- Write Gherkin scenarios (Given-When-Then)
- Use ubiquitous language
- Make scenarios concrete and specific

### 3. AUTOMATION - Implement Tests | 自動化測試
- Implement step definitions
- Write minimal code to pass
- Follow the TDD cycle within automation

### 4. LIVING DOCUMENTATION - Maintain | 活文件維護
- Keep scenarios up to date
- Use as documentation
- Share with stakeholders

## Gherkin Format | Gherkin 格式

```gherkin
Feature: User Login
  As a registered user
  I want to log in to my account
  So that I can access my personal dashboard

  Scenario: Successful login with valid credentials
    Given I am on the login page
    And I have a registered account with email "user@example.com"
    When I enter my email "user@example.com"
    And I enter my password "correctpassword"
    And I click the login button
    Then I should be redirected to my dashboard
    And I should see a welcome message

  Scenario: Failed login with invalid password
    Given I am on the login page
    When I enter my email "user@example.com"
    And I enter my password "wrongpassword"
    And I click the login button
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page
```

## Three Amigos | 三劍客會議

BDD works best with collaboration:

| Role | Focus | 角色 | 關注點 |
|------|-------|------|--------|
| Business | What & Why | 業務 | 什麼和為什麼 |
| Development | How | 開發 | 如何實現 |
| Testing | What if | 測試 | 假設情況 |

## Usage | 使用方式

- `/bdd` - Start interactive BDD session
- `/bdd "user can reset password"` - BDD for specific feature
- `/bdd login-feature.feature` - Work with existing feature file

## Phase Checklist | 階段檢查清單

### Discovery Phase
- [ ] Stakeholders identified
- [ ] User stories discussed
- [ ] Examples collected
- [ ] Edge cases identified

### Formulation Phase
- [ ] Scenarios follow Given-When-Then
- [ ] Language is ubiquitous (shared vocabulary)
- [ ] Scenarios are specific and concrete
- [ ] No implementation details in scenarios

### Automation Phase
- [ ] Step definitions implemented
- [ ] Tests are executable
- [ ] Code passes all scenarios
- [ ] Refactoring complete

### Living Documentation Phase
- [ ] Scenarios are current
- [ ] Documentation is accessible
- [ ] Stakeholders can read and understand

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/bdd` | 詢問要探索的行為，進入 🔍 DISCOVERY |
| `/bdd "feature description"` | 以指定功能為目標，進入 🔍 DISCOVERY |
| `/bdd <feature-file>` | 載入現有 `.feature` 檔案，判斷進入哪個階段 |

### Interaction Script | 互動腳本

#### 🔍 DISCOVERY Phase

1. 與使用者討論功能行為
2. 收集具體範例和邊界案例
3. 以 Three Amigos 視角提問（Business / Dev / Testing）

🛑 **STOP**: 收集足夠範例後展示摘要，等待確認進入 FORMULATION

#### 📝 FORMULATION Phase

1. 將範例轉為 Gherkin 場景（Given-When-Then）
2. 使用領域語言（ubiquitous language）
3. 展示生成的 `.feature` 內容

**Decision: 場景品質**
- IF 場景包含實作細節 → 自動抽離，改用業務語言
- IF 場景過於模糊 → 要求更具體的範例

🛑 **STOP**: 展示 `.feature` 後等待使用者確認寫入

#### 🤖 AUTOMATION Phase

1. 為每個場景實作 step definitions
2. 執行場景，確認結果
3. 場景內部使用 TDD 循環實作

🛑 **STOP**: 所有場景通過後等待使用者確認

#### 📚 LIVING DOCS Phase

1. 確認所有場景是最新狀態
2. 建議文件可分享給利害關係人

### Stop Points | 停止點

| Phase | Stop Point | 等待內容 |
|-------|-----------|---------|
| DISCOVERY | 範例收集完成後 | 確認進入 FORMULATION |
| FORMULATION | `.feature` 生成後 | 確認寫入 |
| AUTOMATION | 所有場景通過後 | 確認進入 LIVING DOCS |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 使用者要求跳過 DISCOVERY 直接寫場景 | 提醒需要具體範例，但允許 override |
| `.feature` 語法無效 | 自動修正 Gherkin 語法 |
| Step definition 實作失敗 | 報告哪個 step 失敗，嘗試修復，3 次後 STOP |
| 無 BDD 測試框架（Cucumber 等） | 建議安裝，或改用 TDD 方式實作場景邏輯 |

## Reference | 參考

- Methodology: [bdd.methodology.yaml](../../methodologies/bdd.methodology.yaml)
- Methodology System: [methodology-system](../methodology-system/SKILL.md)
