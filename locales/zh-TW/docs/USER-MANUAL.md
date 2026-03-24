---
source: docs/USER-MANUAL.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# 使用者手冊

**Version**: 1.0.0
**Last Updated**: 2026-03-24

> **Language**: [English](../../../docs/USER-MANUAL.md) | 繁體中文 | [简体中文](../../zh-CN/docs/USER-MANUAL.md)

本手冊引導軟體開發者從安裝到日常高效使用 Universal Development Standards (UDS)。

---

## 目錄

- [什麼是 UDS？](#什麼是-uds)
- [為什麼要用 UDS？](#為什麼要用-uds)
- [架構](#架構)
- [安裝](#安裝)
- [安裝後驗證](#安裝後驗證)
- [你的第一個指令：/discover](#你的第一個指令discover)
- [日常開發流程地圖](#日常開發流程地圖)
- [工作流程 A：規格驅動開發 (SDD)](#工作流程-a規格驅動開發-sdd)
- [工作流程 B：TDD 紅綠重構](#工作流程-btdd-紅綠重構)
- [選擇正確的工作流程](#選擇正確的工作流程)
- [Legacy Code 策略](#legacy-code-策略)
- [品質指令](#品質指令)
- [所有 Slash Commands 參考](#所有-slash-commands-參考)
- [漸進式導入策略](#漸進式導入策略)
- [UDS 的一天](#uds-的一天)
- [支援的 AI 工具](#支援的-ai-工具)
- [常見問題](#常見問題)
- [下一步與資源](#下一步與資源)

---

## 什麼是 UDS？

Universal Development Standards 是一套為 AI 時代設計的**語言無關、框架無關**開發標準框架。它提供一組統一的標準、技能和指令，適用於任何技術棧。

| 類別 | 數量 | 說明 |
|------|------|------|
| **Core Standards** | 48 | 通用開發準則（Markdown） |
| **AI Skills** | 40 | 互動式技能（YAML） |
| **Slash Commands** | 30 | 日常開發快速操作指令 |
| **CLI Commands** | 6 | 命令列工具 |

**三大特性：**

1. **語言無關** — JavaScript、Python、Go、Rust、Java 等任何語言都適用
2. **框架無關** — React、Vue、Spring、Django 等任何框架都適用
3. **AI 原生** — 專為 AI 輔助開發工作流程設計

---

## 為什麼要用 UDS？

| 問題 | UDS 解決方案 |
|------|-------------|
| 團隊 commit message 格式不一致 | 透過 `/commit` 標準化 Conventional Commits |
| Code review 漏看關鍵問題 | 透過 `/review` 執行 8 維度系統性審查 |
| AI 工具給出不一致的建議 | 統一標準讓 AI 工具讀取並遵循 |
| 新人加入團隊需要數週上手 | 清晰的標準和引導式工作流程 |
| 測試覆蓋率期望不明確 | 測試金字塔定義明確比例（70/20/7/3） |
| 開發流程不清楚 | 兩套方法論系統（SDD 和雙迴圈 TDD） |

### 設計哲學

**「碰一點，保護一點」** — 你不需要一次導入全部 48 個標準。UDS 專為漸進式導入設計：

- 先只用 `/commit` — 零成本，立即見效
- 接著加入 `/review` — 在合併前捕捉問題
- 團隊適應後，逐步引入 `/tdd` 和 `/sdd`

> **Boy Scout Rule**：讓程式碼比你找到它時更好。每次碰到程式碼，順手加一點保護（測試、文件）。

---

## 架構

UDS 採用**雙層執行模型**：

```
       AI Agent / 開發者
              |
        ┌─────┴─────┐
        |           |
   Skills Layer   Standards Layer
   (.ai.yaml)       (.md)
        |              |
   省 Token         完整理論
   互動式精靈       工具配置
   日常開發用       深度參考用
```

| 面向 | Skills（執行層） | Standards（知識層） |
|------|-----------------|-------------------|
| 格式 | YAML 最佳化 | 完整 Markdown |
| 用途 | 高速互動查詢 | 深度理解與根據 |
| Token 用量 | 最少（AI 友善） | 詳盡（參考用） |
| 使用時機 | 日常開發任務 | 學習概念、深度審查 |

實務上，AI 工具會自動載入 Skills 層。只有當你想了解某條規則的「為什麼」時，才需要閱讀 Standards 層。

---

## 安裝

### 方法一：全域安裝（推薦）

```bash
npm install -g universal-dev-standards
cd your-project
uds init
```

### 方法二：免安裝

```bash
npx universal-dev-standards init
```

### `uds init` 做了什麼

互動式初始化會：

1. **偵測**你的專案類型（Node.js、Python 等）
2. **詢問**你使用的 AI 工具（Claude Code、Cursor 等）
3. **安裝**標準到 `.standards/` 目錄
4. **配置**你的 AI 工具設定檔（CLAUDE.md、.cursorrules 等）

---

## 安裝後驗證

執行 `uds init` 後，你的專案會多出這些檔案：

```
your-project/
├── .standards/           # 48 個 AI 標準（.ai.yaml 檔案）
│   ├── testing.ai.yaml
│   ├── commit-message.ai.yaml
│   ├── code-review.ai.yaml
│   └── ...
├── CLAUDE.md             # Claude Code 配置（若選擇）
├── .cursorrules          # Cursor 配置（若選擇）
└── ...你原有的檔案完全不動
```

**驗證安裝：**

```bash
uds check    # 檢查採用狀態和檔案完整性
uds skills   # 列出已安裝技能
```

---

## 你的第一個指令：/discover

在修改既有程式碼庫之前，先用 `/discover` 評估健康度：

```bash
/discover              # 全專案健康度評估
/discover auth         # 聚焦認證模組評估
/discover payments     # 評估新增支付功能的風險
```

### 輸出範例

```
Project Health Report
=====================
Overall Score: 7.2 / 10

| 維度             | 分數  | 狀態    | 關鍵發現                |
|-----------------|-------|---------|------------------------|
| Architecture    | 8/10  | Good    | 模組邊界清晰            |
| Dependencies    | 6/10  | Warning | 5 個過時, 1 個嚴重      |
| Test Coverage   | 7/10  | Fair    | 72% 行覆蓋率            |
| Security        | 8/10  | Good    | 無嚴重漏洞              |
| Technical Debt  | 6/10  | Warning | 23 個 TODO, 3 個熱點    |

Verdict: CONDITIONAL
Recommendations:
1. [HIGH] 更新 lodash 以修復 CVE-2024-XXXX
2. [MED]  為 src/payments/ 新增測試（0% 覆蓋率）
3. [LOW]  清理 src/utils/ 中的 TODO 積壓
```

### 評估維度

| 維度 | 檢查項目 |
|------|---------|
| **Architecture** | 模組結構、相依圖、進入點 |
| **Dependencies** | 過時套件、已知漏洞、授權風險 |
| **Test Coverage** | 現有測試套件、覆蓋率缺口、測試品質 |
| **Security** | npm audit 發現、硬編碼密鑰、暴露端點 |
| **Technical Debt** | TODO 標記、程式碼重複、複雜度熱點 |

---

## 日常開發流程地圖

用這個決策樹選擇正確的工作流程：

```
第一次接觸這個 Codebase？
│
├─ 是 → /discover（先評估）
│
└─ 否（已熟悉）
   │
   ├─ 全新功能？
   │   └─ 是 → SDD 流程：/sdd → /derive-all → 實作
   │
   ├─ Bug 修復？
   │   └─ 是 → 寫失敗測試 → 修復 → /commit
   │
   ├─ 修改既有程式碼？
   │   ├─ 有測試？ → 直接 /tdd 循環
   │   └─ 沒測試？ → 先寫 characterization test
   │
   └─ 純重構？
       └─ 確保測試覆蓋 → 重構 → 測試通過
```

> **關鍵原則**：選對工作流程，而非記住所有指令。

---

## 工作流程 A：規格驅動開發 (SDD)

SDD 針對**新功能**和 **AI 輔助開發**進行優化。核心理念：**規格先行，程式碼隨後**。

### 五大階段

```
Phase 1        Phase 2        Phase 3         推演            Phase 4         Phase 5
建立規格  →   審查規格  →   核准規格   →   生成測試   →    實作    →     驗證
/sdd          /sdd review    /sdd approve    /derive-all     /sdd implement  /sdd verify
```

| 階段 | 指令 | 輸入 | 輸出 |
|------|------|------|------|
| 1. 建立 | `/sdd user-auth` | 需求描述 | `SPEC-001.md` |
| 2. 審查 | `/sdd review` | SPEC 檔案 | 審查意見 |
| 3. 核准 | `/sdd approve` | SPEC 檔案 | 狀態更新 |
| 推演 | `/derive-all` | SPEC 檔案 | `.feature` + `.test.ts` |
| 4. 實作 | `/sdd implement` | SPEC 檔案 | 進度追蹤 |
| 5. 驗證 | `/sdd verify` | SPEC 檔案 | 驗證報告 |

### 範例：新增雙因素認證

**步驟 1 — 建立規格：**

```bash
/sdd two-factor-authentication
```

AI 會引導你定義：
- **使用者故事**：身為使用者，我希望啟用 2FA 以提高帳戶安全性
- **驗收條件（AC）**：
  - AC-1: 使用者可以生成 TOTP 密鑰
  - AC-2: 使用者可以掃描 QR Code
  - AC-3: 系統驗證 6 位數 OTP
  - AC-4: 提供備份代碼

輸出：`docs/specs/SPEC-001.md`

**步驟 2 — 從核准的規格推演測試：**

```bash
/derive-all docs/specs/SPEC-001.md
```

自動產生：

**BDD 場景（.feature）：**
```gherkin
@SPEC-001 @AC-1
Scenario: 使用者生成 TOTP 密鑰
  Given 使用者已登入
  When 使用者啟用雙因素認證
  Then 系統應產生 TOTP 密鑰
  And 顯示 QR Code 供掃描
```

**TDD 測試骨架（.test.ts）：**
```typescript
describe('SPEC-001: 雙因素認證', () => {
  describe('AC-1: 生成 TOTP 密鑰', () => {
    it('should generate valid TOTP secret when user enables 2FA', () => {
      // Arrange - [TODO]
      // Act - [TODO]
      // Assert - [TODO]
    });
  });
});
```

> 每個驗收條件 1:1 對應一組測試 — 規格就是測試的藍圖。

---

## 工作流程 B：TDD 紅綠重構

TDD 最適合 **Bug 修復**、**小功能**和**修改既有程式碼**。

### 三大階段

```
    ┌──────────────────────────────────┐
    │                                  │
    │   RED         GREEN      REFACTOR│
    │   /tdd red    /tdd green /tdd refactor
    │     │           │           │    │
    │     v           v           v    │
    │   寫失敗測試  最少程式碼  改善品質 │
    │     │           │           │    │
    │     └───────────┴───────────┘    │
    │            重複循環               │
    └──────────────────────────────────┘
```

| 階段 | 指令 | 規則 |
|------|------|------|
| RED | `/tdd red` | 只寫測試，不寫實作。測試必須失敗。 |
| GREEN | `/tdd green` | 寫最少程式碼讓測試通過。不多不少。 |
| REFACTOR | `/tdd refactor` | 改善程式碼品質。測試必須持續通過。 |

### 範例：實作 `isValidEmail()`

**步驟 1：`/tdd red` — 寫失敗測試**

```javascript
// tests/email.test.js
test('should return true for valid email', () => {
  expect(isValidEmail('user@example.com')).toBe(true);
});

test('should return false for invalid email', () => {
  expect(isValidEmail('not-an-email')).toBe(false);
});
```

**步驟 2：`/tdd green` — 最少實作**

```javascript
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

**步驟 3：`/tdd refactor` — 改善品質**

```javascript
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email);
}
```

---

## 選擇正確的工作流程

| 情境 | 推薦工作流程 |
|------|-------------|
| 全新專案 + AI 輔助 | `/sdd` → `/derive-all` → 實作 |
| 全新功能（明確需求） | `/sdd` → `/derive-all` → 實作 |
| Legacy 系統修改 | `/bdd` → `/tdd` 循環 |
| 快速原型 | 直接 `/tdd` |
| 複雜商業邏輯 | `/bdd discovery` → `/tdd` |
| Bug 修復 | 寫失敗測試 → 修復 → `/commit` |
| 模糊構想，需要探索 | `/brainstorm` → `/requirement` → `/sdd` |
| 多方利害關係人需對齊 | `/atdd` → `/sdd` 或 `/bdd` |

> **簡單記法**：新東西用 SDD，改舊的用 TDD，不確定就先 `/discover`。

---

## Legacy Code 策略

### 三步安全修改法

```
Step 1: 寫 Characterization Test（記錄現有行為）
        ↓
Step 2: /tdd 循環加入新行為
        ↓
Step 3: 逐步重構
```

### 什麼是 Characterization Test？

一種記錄程式碼*目前行為*的測試 — 不管對錯。它是你在修改前的安全網。

```javascript
// 記錄目前行為，即使是 bug
test('characterization: login validates email format', () => {
  const result = login('invalid-email', 'password');
  // 觀察：目前程式碼接受無效 email（這是 bug）
  expect(result.success).toBe(true); // 記錄現狀
});
```

### 反向工程指令

用於較大規模的 Legacy Code 理解：

```bash
/reverse spec          # 將既有程式碼反向工程為規格
/reverse-bdd           # 轉換為 BDD 場景
/reverse-tdd           # 分析 BDD-TDD 覆蓋差距
```

> **關鍵原則**：先保護再修改。不要在沒有測試的情況下改 Legacy Code。

---

## 品質指令

### `/commit` — 標準化提交

完成程式碼後，用 `/commit` 產生格式規範的 commit message：

```bash
/commit                     # 自動分析 staged changes
/commit 修正登入驗證邏輯     # 附上描述
```

**產生格式：**

```
feat(auth): 新增雙因素認證支援

實作 TOTP 密鑰生成、QR Code 顯示和 OTP 驗證。
使用者可在帳戶設定中啟用 2FA，並取得備份代碼。

Refs: SPEC-001
```

**Commit 類型：**

| Type | 用途 | 範例 |
|------|------|------|
| `feat` | 新功能 | `feat(auth): 新增 2FA` |
| `fix` | 修 Bug | `fix(login): 修正密碼驗證` |
| `refactor` | 重構 | `refactor(utils): 抽取共用函式` |
| `docs` | 文件 | `docs(api): 更新 API 文件` |
| `test` | 測試 | `test(auth): 新增登入測試` |
| `chore` | 維護 | `chore(deps): 更新相依套件` |

### `/review` — 程式碼審查

提交前，用 `/review` 進行系統性審查：

```bash
/review                    # 審查當前分支所有變更
/review src/auth.js        # 審查特定檔案
/review feature/login      # 審查特定分支
```

**8 個審查維度：**

| # | 維度 | 檢查重點 |
|---|------|---------|
| 1 | Functionality | 功能是否正確？ |
| 2 | Design | 架構是否合理？ |
| 3 | Quality | 程式碼是否乾淨？ |
| 4 | Readability | 是否容易理解？ |
| 5 | Tests | 測試覆蓋是否足夠？ |
| 6 | Security | 有無安全漏洞？ |
| 7 | Performance | 是否有效率？ |
| 8 | Error Handling | 錯誤處理是否完善？ |

**評論前綴系統：**

| 前綴 | 意義 | 動作 |
|------|------|------|
| **BLOCKING** | 必須修復才能合併 | 必要 |
| **IMPORTANT** | 應該修復 | 建議 |
| **SUGGESTION** | 可以更好 | 可選 |
| **QUESTION** | 需要釐清 | 討論 |

### `/checkin` — 提交前品質閘門

提交前執行 `/checkin` 驗證所有品質閘門通過（測試、linting、標準合規）。

---

## 所有 Slash Commands 參考

| 家族 | 指令 | 用途 |
|------|------|------|
| **探索** | `/discover`, `/dev-workflow` | 評估專案、引導工作流程 |
| **規格** | `/sdd`, `/requirement`, `/brainstorm` | 規格驅動開發 |
| **推演** | `/derive-all`, `/derive-bdd`, `/derive-tdd`, `/derive-atdd` | 從規格生成測試 |
| **開發** | `/tdd`, `/bdd`, `/atdd` | 方法論工作流程 |
| **品質** | `/commit`, `/review`, `/checkin`, `/coverage`, `/ac-coverage` | 日常品質管理 |
| **文件** | `/docs`, `/docgen`, `/changelog`, `/release` | 文件與發布 |
| **反向** | `/reverse`, `/reverse-sdd`, `/reverse-bdd`, `/reverse-tdd` | Legacy Code 反向工程 |
| **重構** | `/refactor` | 重構指導 |
| **工具** | `/init`, `/check`, `/update`, `/config`, `/methodology`, `/guide` | 設定與配置 |

> 不需要記住全部。輸入 `/dev-workflow`，它會引導你到正確的指令。

---

## 漸進式導入策略

不需要一次學會所有指令。分階段導入：

### 第 1 週：零成本起步

```bash
/commit     # 標準化 commit message
/review     # 提交前自我審查
```

> 只需要這兩個指令，就能立即提升程式碼品質。

### 第 2-3 週：加入測試保護

```bash
/discover   # 了解專案健康度
/tdd        # 用 TDD 寫新功能
```

### 第 4 週起：完整工作流程

```bash
/sdd        # 規格驅動開發
/derive-all # 自動生成測試
/bdd        # 行為驅動開發
```

> **關鍵心態**：每週多用一個指令，一個月後自然上手。

---

## UDS 的一天

```
09:00  /discover auth          # 評估要修改的認證模組
       → 健康分數 7.2/10, CONDITIONAL

09:15  /sdd add-2fa           # 建立雙因素認證規格
       → 產出 SPEC-001.md

09:30  /sdd review            # 審查規格完整性
       → 確認 4 個 AC 無遺漏

09:45  /derive-all            # 從規格生成 BDD + TDD
       → 產出 4 個 .feature + 4 組 .test.ts

10:00  /tdd red               # 開始 TDD 循環
10:30  /tdd green             # 實作最少程式碼
11:00  /tdd refactor          # 改善品質
       → 重複循環直到所有 AC 完成

12:00  /commit                # 標準化提交
       → feat(auth): 新增雙因素認證

12:05  /review                # 最終審查
       → 0 BLOCKING, 1 SUGGESTION
```

---

## 支援的 AI 工具

| AI 工具 | 狀態 | Skills | Slash Commands | 設定檔 |
|---------|------|--------|----------------|--------|
| **Claude Code** | 完整支援 | 26 | 30 | `CLAUDE.md` |
| **OpenCode** | 完整支援 | 26 | 30 | `AGENTS.md` |
| **Gemini CLI** | Preview | 18+ | 20+ | `GEMINI.md` |
| **Cursor** | 完整支援 | Core | Simulated | `.cursorrules` |
| **Cline / Roo Code** | 部分支援 | Core | Workflow | `.clinerules` |
| **Windsurf** | 部分支援 | 有 | Rulebook | `.windsurfrules` |

> **一套標準，多工具通用** — 換 AI 工具不需要重學標準。

---

## 常見問題

**Q: UDS 會限制我的技術選擇嗎？**
A: 不會。UDS 是語言無關、框架無關的。它定義的是流程和品質標準，不是技術選擇。

**Q: 一定要用 AI 工具嗎？**
A: 不用。核心標準是 Markdown 文件，人類直接閱讀也完全適用。AI 工具只是讓流程更順暢。

**Q: 團隊中只有我用可以嗎？**
A: 可以。漸進式導入的設計就是為了這個情境。先自己用 `/commit` 和 `/review`，等團隊看到效果再推廣。

**Q: 和 ESLint / Prettier 衝突嗎？**
A: 互補關係。ESLint/Prettier 處理程式碼格式，UDS 處理更高層次的開發流程和品質標準。

**Q: 什麼都需要寫規格嗎？**
A: 不用。UDS 遵循「碰一點，保護一點」原則。只在重大新功能時用 `/sdd`。Bug 修復和小變更只需 `/tdd` 和 `/commit`。

**Q: 如何更新到 UDS 新版本？**
A: 在專案目錄執行 `uds update`。它會更新標準同時保留你的自訂設定。

---

## 下一步與資源

### 現在就開始

```bash
npm install -g universal-dev-standards
cd your-project
uds init
```

### 推薦學習路徑

1. 先用 `/commit` + `/review` 養成習慣
2. 遇到新功能時試試 `/sdd`
3. 不確定下一步時，輸入 `/dev-workflow`

### 參考文件

| 資源 | 說明 |
|------|------|
| [Daily Workflow Guide](../../../adoption/DAILY-WORKFLOW-GUIDE.md) | 日常工作流程完整指南 |
| [Command Family Overview](../../../skills/commands/COMMAND-FAMILY-OVERVIEW.md) | 指令家族架構與情境 |
| [Cheatsheet](CHEATSHEET.md) | 所有功能速查表 |
| [Feature Reference](FEATURE-REFERENCE.md) | 完整功能目錄（182 個功能） |
| [README](../../../README.md) | 專案總覽 |

### 取得協助

- 輸入 `/dev-workflow` 獲得引導式工作流程選擇
- 輸入 `/guide <標準名稱>` 查閱特定標準參考
- 造訪 [GitHub repository](https://github.com/AsiaOstrich/universal-dev-standards) 提交 issue 或參與討論

---

## 授權

- 文件（Markdown）：CC BY 4.0
- 程式碼（JavaScript）：MIT
