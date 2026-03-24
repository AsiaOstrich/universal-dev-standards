---
marp: true
theme: default
paginate: true
title: Universal Development Standards 入門教學
description: 給軟體開發工程師的 UDS 快速上手指南
---

# Universal Development Standards
## 入門教學

**AI 時代的通用開發標準框架**

Version 5.0.0-rc.16 | 2026

---

## 你有沒有遇過這些問題？

- Commit message 每個人格式不同，log 亂成一團
- Code review 全靠個人經驗，漏看關鍵問題
- AI 工具（Claude Code、Cursor）給的建議缺乏一致性
- 新人加入團隊，沒有標準可循，摸索期超長
- 測試覆蓋率忽高忽低，沒人知道該寫到什麼程度

> **如果有一套跨語言、跨框架的標準，而且 AI 工具能直接遵守呢？**

---

## UDS 是什麼？

**Universal Development Standards** — 一套語言無關、框架無關的開發標準框架。

| 類別 | 數量 | 說明 |
|------|------|------|
| **Core Standards** | 48 | 通用開發準則（Markdown） |
| **AI Skills** | 40 | 互動式技能（YAML） |
| **Slash Commands** | 45 | 快速操作指令 |
| **CLI Commands** | 6 | 命令列工具 |

**三大特性：**
1. **語言無關** — JavaScript、Python、Go、Rust... 都適用
2. **框架無關** — React、Vue、Spring、Django... 都適用
3. **AI 原生** — 專為 AI 輔助開發設計

---

## 設計哲學

### 漸進式導入，不是一次全上

```
  誤解：「必須先為所有 Legacy Code 寫好規格和測試」

  現實：「碰到哪裡，就保護哪裡」
```

**Boy Scout Rule**：讓程式碼比你找到它時更好一點

- 不需要一次導入 48 個標準
- 從 `/commit` 開始，零成本立即見效
- 每次修改程式碼時，順手加一點保護（測試、文件）

---

## 架構總覽：雙層執行模型

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

---

## 支援的 AI 工具

| AI 工具 | 狀態 | Skills | Slash Commands |
|---------|------|--------|----------------|
| **Claude Code** | 完整支援 | 26 | 30 |
| **OpenCode** | 完整支援 | 26 | 30 |
| **Gemini CLI** | Preview | 18+ | 20+ |
| **Cursor** | 完整支援 | Core | Simulated |
| **Cline / Roo Code** | 部分支援 | Core | Workflow |
| **Windsurf** | 部分支援 | 有 | Rulebook |

> **一套標準，多工具通用** — 換 AI 工具不需要重學標準

---

## 安裝與初始化

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

`uds init` 會自動：
1. 偵測你的專案類型
2. 詢問你使用的 AI 工具
3. 安裝標準到 `.standards/` 目錄
4. 配置對應的 AI 工具設定檔

---

## 初始化後你的專案得到什麼？

```
your-project/
├── .standards/           # AI 標準（48 個 .ai.yaml 檔案）
│   ├── testing.ai.yaml
│   ├── commit-message.ai.yaml
│   ├── code-review.ai.yaml
│   └── ...
├── CLAUDE.md             # Claude Code 配置（若選擇）
├── .cursorrules          # Cursor 配置（若選擇）
└── ...你原有的檔案       # 完全不動
```

**驗證安裝：**

```bash
uds check    # 檢查採用狀態
uds skills   # 列出已安裝技能
```

---

## 30 個 Slash Commands 快速導覽

| 家族 | 指令 | 用途 |
|------|------|------|
| **探索** | `/discover`, `/dev-workflow` | 評估專案、引導流程 |
| **規格** | `/sdd`, `/requirement`, `/brainstorm` | 規格驅動開發 |
| **推演** | `/derive-all`, `/derive-bdd`, `/derive-tdd` | 從規格生成測試 |
| **開發** | `/tdd`, `/bdd`, `/atdd` | 方法論工作流程 |
| **品質** | `/commit`, `/review`, `/checkin`, `/coverage` | 日常品質管理 |
| **文件** | `/docs`, `/changelog`, `/release` | 文件與發布 |
| **反向** | `/reverse`, `/reverse-sdd`, `/reverse-bdd` | Legacy Code 反向工程 |
| **工具** | `/init`, `/check`, `/update`, `/methodology` | 工具與設定 |

> 不需要記住全部！輸入 `/dev-workflow` 會引導你下一步該做什麼

---

## 你的第一個指令：`/discover`

**用途**：在修改既有專案前，先評估健康度

```bash
/discover              # 全專案評估
/discover auth         # 只評估認證模組
/discover payments     # 評估支付相關模組
```

**輸出範例：**

```
Project Health Report
=====================
Overall Score: 7.2 / 10

| 維度         | 分數  | 狀態  | 關鍵發現              |
|-------------|-------|------|-----------------------|
| Architecture | 8/10 | Good | 模組邊界清晰           |
| Dependencies | 6/10 | Warn | 5 個過時, 1 個嚴重     |
| Test Coverage| 7/10 | Fair | 72% 行覆蓋率           |
| Security     | 8/10 | Good | 無嚴重漏洞             |
| Tech Debt    | 6/10 | Warn | 23 個 TODO, 3 個熱點   |

Verdict: CONDITIONAL
```

---

## 日常開發流程地圖

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

> 關鍵原則：**選對工作流程，而非記住所有指令**

---

## 工作流程 A：SDD 完整流程

**SDD（Spec-Driven Development）** — 規格驅動開發，AI 時代的最佳實踐

```
Phase 1        Phase 2        Phase 3         Phase 4         Phase 5
建立規格  →   審查規格  →   核准規格   →    實作    →     驗證
/sdd          /sdd review    /sdd approve    /sdd implement  /sdd verify
                                  |
                            /derive-all
                         （自動產生 BDD + TDD）
```

| Phase | 指令 | 輸入 | 輸出 |
|-------|------|------|------|
| 1. 建立 | `/sdd user-auth` | 需求描述 | `SPEC-001.md` |
| 2. 審查 | `/sdd review` | SPEC 檔案 | 審查意見 |
| 3. 核准 | `/sdd approve` | SPEC 檔案 | 狀態更新 |
| 推演 | `/derive-all` | SPEC 檔案 | `.feature` + `.test.ts` |
| 4. 實作 | `/sdd implement` | SPEC 檔案 | 進度追蹤 |
| 5. 驗證 | `/sdd verify` | SPEC 檔案 | 驗證報告 |

---

## `/sdd` 實戰：建立規格

**場景**：我們要為專案新增「雙因素認證」功能

```bash
/sdd two-factor-authentication
```

AI 會引導你定義：
- **使用者故事**：身為使用者，我希望啟用 2FA 以提高帳戶安全性
- **驗收條件（AC）**：
  - AC-1: 使用者可以生成 TOTP 密鑰
  - AC-2: 使用者可以掃描 QR Code
  - AC-3: 驗證 6 位數 OTP
  - AC-4: 提供備份代碼
- **技術約束**、**邊界條件**

輸出：`docs/specs/SPEC-001.md`

> **動手試試**：在你的專案中執行 `/sdd` 加上你想做的功能名稱

---

## `/derive-all`：從規格自動生成測試

```bash
/derive-all docs/specs/SPEC-001.md
```

**自動產生兩種檔案：**

**BDD 場景（`.feature`）：**
```gherkin
@SPEC-001 @AC-1
Scenario: 使用者生成 TOTP 密鑰
  Given 使用者已登入
  When 使用者啟用雙因素認證
  Then 系統應產生 TOTP 密鑰
  And 顯示 QR Code 供掃描
```

**TDD 測試骨架（`.test.ts`）：**
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

> 規格即測試的藍圖 — 每個 AC 對應一組測試

---

## 工作流程 B：TDD 紅綠重構

**適用場景**：Bug 修復、小功能、既有程式碼修改

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

**三個階段：**

| 階段 | 指令 | 規則 |
|------|------|------|
| RED | `/tdd red` | 只寫測試，不寫實作。測試必須失敗 |
| GREEN | `/tdd green` | 寫最少程式碼讓測試通過，不多不少 |
| REFACTOR | `/tdd refactor` | 改善程式碼品質，測試必須持續通過 |

---

## `/tdd` 實戰：三步循環

**場景**：實作一個 `isValidEmail(email)` 函式

### Step 1: `/tdd red` — 寫失敗測試

```javascript
// tests/email.test.js
test('should return true for valid email', () => {
  expect(isValidEmail('user@example.com')).toBe(true);
});

test('should return false for invalid email', () => {
  expect(isValidEmail('not-an-email')).toBe(false);
});
```

### Step 2: `/tdd green` — 最少實作

```javascript
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

### Step 3: `/tdd refactor` — 改善品質

```javascript
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email);
}
```

> **動手試試**：用 `/tdd` 在你的專案中實作一個小函式

---

## 情境選擇：SDD vs TDD？

| 情境 | 推薦工作流程 |
|------|-------------|
| 全新專案 + AI 輔助 | `/sdd` → `/derive-all` → 實作 |
| 全新功能（明確需求） | `/sdd` → `/derive-all` → 實作 |
| Legacy 系統修改 | `/bdd` → `/tdd` 循環 |
| 快速原型 | 直接 `/tdd` |
| 複雜商業邏輯 | `/bdd discovery` → `/tdd` |
| Bug 修復 | 寫失敗測試 → 修復 → `/commit` |
| 模糊構想 | `/brainstorm` → `/requirement` → `/sdd` |
| 多方利害關係人 | `/atdd` → `/sdd` 或 `/bdd` |

> **簡單記法**：新東西用 SDD，改舊的用 TDD，不確定就先 `/discover`

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

**Characterization Test 範例：**

```javascript
// 不管對錯，先記錄目前行為
test('characterization: login validates email format', () => {
  const result = login('invalid-email', 'password');
  // 觀察：目前程式碼接受無效 email（這是 bug）
  expect(result.success).toBe(true); // 記錄現狀
});
```

**反向工程指令：**

```bash
/reverse spec          # 將既有程式碼反向工程為規格
/reverse-bdd           # 轉換為 BDD 場景
```

> 重點：先保護再修改，不要在沒有測試的情況下改 Legacy Code

---

## `/commit`：標準化提交

在完成程式碼後，用 `/commit` 自動產生規範的 commit message。

```bash
/commit                     # 自動分析 staged changes
/commit 修正登入驗證邏輯     # 附上描述
```

**自動產生格式：**

```
feat(auth): 新增雙因素認證支援

實作 TOTP 密鑰生成、QR Code 顯示和 OTP 驗證。
使用者可在帳戶設定中啟用 2FA，並取得備份代碼。

Refs: SPEC-001
```

**Commit Types 速查：**

| Type | 用途 | 範例 |
|------|------|------|
| `feat` | 新功能 | `feat(auth): 新增 2FA` |
| `fix` | 修 Bug | `fix(login): 修正密碼驗證` |
| `refactor` | 重構 | `refactor(utils): 抽取共用函式` |
| `docs` | 文件 | `docs(api): 更新 API 文件` |
| `test` | 測試 | `test(auth): 新增登入測試` |
| `chore` | 維護 | `chore(deps): 更新相依套件` |

---

## `/review`：程式碼審查

提交前，用 `/review` 進行系統性審查。

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

---

## 漸進式導入策略

不需要一次學會所有指令。建議分階段導入：

### 第 1 週：零成本起步

```bash
/commit     # 標準化 commit message
/review     # 提交前自我審查
```

> 只需要這兩個指令，就能立即提升程式碼品質

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

> **關鍵心態**：每週多用一個指令，一個月後自然上手

---

## 完整工作日示範

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

## 常見問題 FAQ

**Q: UDS 會限制我的技術選擇嗎？**
A: 不會。UDS 是語言無關、框架無關的。它定義的是「流程和品質標準」，不是技術選擇。

**Q: 一定要用 AI 工具嗎？**
A: 不用。核心標準是 Markdown 文件，人類直接閱讀也完全適用。AI 工具只是讓流程更順暢。

**Q: 團隊中只有我用可以嗎？**
A: 可以。漸進式導入的設計就是為了這個情境。你可以先自己用 `/commit` 和 `/review`，等團隊看到效果再推廣。

**Q: 和 ESLint / Prettier 衝突嗎？**
A: 互補關係。ESLint/Prettier 處理程式碼格式，UDS 處理更高層次的開發流程和品質標準。

---

## 下一步

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

### 參考資源

| 資源 | 說明 |
|------|------|
| [Daily Workflow Guide](../../adoption/DAILY-WORKFLOW-GUIDE.md) | 日常工作流程完整指南 |
| [Command Family Overview](../../skills/commands/COMMAND-FAMILY-OVERVIEW.md) | 指令家族架構 |
| [README](../../README.md) | 專案總覽 |
| `/dev-workflow` | 任何時候不知道下一步，就用這個指令 |

---

## 感謝聆聽

**Universal Development Standards**
AI 時代的通用開發標準框架

```bash
npm install -g universal-dev-standards && uds init
```

> **一套標準，多工具通用，漸進式導入，立即見效。**
