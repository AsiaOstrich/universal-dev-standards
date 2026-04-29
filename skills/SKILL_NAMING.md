# UDS Skill 命名規範

> **版本**: 1.0.0 | **建立**: 2026-04-29 | **依據**: XSPEC-100

本文件定義所有 UDS Skill 的命名規則，確保命令一致、可猜測、不需背景知識即可理解。

---

## 規則

### 規則 1：目錄名稱以功能領域為主詞

- **格式**：`{領域}-{動作/角色}` 或 `{領域}-{類型}`
- **良好範例**：`tdd-assistant`、`api-design-assistant`、`dev-methodology`
- **避免**：`methodology-system`（`-system` 不傳遞任何資訊）、`process-automation`（太廣泛）

### 規則 2：後綴使用 `-assistant` 或無後綴

| 後綴 | 使用時機 |
|------|---------|
| `-assistant` | Skill 提供互動式引導流程（問答式、多階段） |
| 無後綴 | 工具型（`push`）、短命令（`xspec`）、名詞型（`dev-methodology`） |
| **禁止** `-guide` 與 `-standards` 混用 | 改為描述性名詞（`logging-guide` → `logging`，長期計畫） |

### 規則 3：縮寫只限業界公認的詞彙

| 允許縮寫 | 全稱 | 說明 |
|---------|------|------|
| `tdd` | Test-Driven Development | 業界公認 |
| `bdd` | Behavior-Driven Development | 業界公認 |
| `atdd` | Acceptance TDD | 業界公認（需在 README 說明） |
| `e2e` | End-to-End | 業界公認 |
| `api` | Application Programming Interface | 通用 |
| `ci-cd` | Continuous Integration/Delivery | 業界公認 |
| `slo` | Service Level Objective | SRE 領域公認（需在 README 說明） |

**禁止使用未說明的專案特定縮寫作為主要識別名稱**（如 `xspec`、`dec` 屬於工具型短命令，已在說明文件補充全稱）。

### 規則 4：slash command（`name:` 欄位）必須比目錄名更短

- 目錄名用於 system-reminder 顯示（描述性）
- `name:` 欄位是使用者實際輸入的命令（應短、清楚）
- 例：目錄 `tdd-assistant` → `name: tdd`；目錄 `api-design-assistant` → `name: api-design`

### 規則 5：命令名稱必須能預測功能

判斷標準：對不認識此 Skill 的開發者說「這個命令叫 `/xxx`」，他能否猜出大概是做什麼？

- `/tdd` ✅ → 測試驅動開發
- `/eval-source` ✅ → 評估外部來源
- `/borrow` ❌ → 借什麼？
- `/derive` ⚠️ → 可接受（SDD 脈絡下清楚），但 `/spec-derive` 更明確

---

## 命名範例對照表

| 舊命令目錄 | 新命令目錄 | slash command | 改名原因 |
|----------|----------|--------------|---------|
| `ac-coverage-assistant` | `ac-coverage` | `/ac-coverage` | 去冗餘後綴；已有 `name: ac-coverage` |
| `forward-derivation` | `spec-derivation` | `/derive` | 明確「從規格衍生」語意 |
| `methodology-system` | `dev-methodology` | `/methodology` | `-system` 無意義，改為名詞形式 |
| `process-automation` | `skill-builder` | `/skill-builder` | 功能是「建立 Skill」，非廣義自動化 |
| `borrow-assistant` | `eval-source` | `/eval-source` | 明確「評估外部來源」語意 |
| `dec-update-assistant` | `dec-update` | `/dec-update` | 去冗餘後綴；已有 `name: dec-update` |
| `session-prompt-assistant` | `session-init` | `/session-init` | 明確「初始化 session」語意 |
| `xspec-assistant` | `xspec` | `/xspec` | 工具型短命令，已有 `name: xspec` |

---

## 新增 Skill 命名檢查清單

新增 Skill 時，依序確認：

- [ ] 目錄名以功能領域為主詞（非動詞或系統名詞）
- [ ] 後綴：引導式用 `-assistant`，工具型無後綴
- [ ] 只用業界公認縮寫；專案特定縮寫需在 README 補說明
- [ ] `name:` 欄位比目錄名短，且能預測功能
- [ ] 更新 `skills/README.md` 加入新 Skill 的縮寫說明

---

## 歷史改名紀錄

| 日期 | 舊名 | 新名 | XSPEC |
|------|------|------|-------|
| 2026-04-29 | `ac-coverage-assistant` | `ac-coverage` | XSPEC-100 |
| 2026-04-29 | `forward-derivation` | `spec-derivation` | XSPEC-100 |
| 2026-04-29 | `methodology-system` | `dev-methodology` | XSPEC-100 |
| 2026-04-29 | `process-automation` | `skill-builder` | XSPEC-100 |
| 2026-04-29 | `borrow-assistant` | `eval-source` | XSPEC-100 |
| 2026-04-29 | `dec-update-assistant` | `dec-update` | XSPEC-100 |
| 2026-04-29 | `session-prompt-assistant` | `session-init` | XSPEC-100 |
| 2026-04-29 | `xspec-assistant` | `xspec` | XSPEC-100 |
