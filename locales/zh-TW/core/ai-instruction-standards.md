---
source: ../../../core/ai-instruction-standards.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-05-28
status: current
---

# AI 指令檔案規範

> **語言**: [English](../../../core/ai-instruction-standards.md) | 繁體中文

**版本**: 1.1.0
**最後更新**: 2026-05-28
**適用範圍**: 所有使用 AI 編碼助手的專案

---

## 目的

本規範定義建立和維護 AI 指令檔案（又稱「系統提示詞檔」）的最佳實踐。這些檔案引導 AI 助手理解專案特定的慣例、標準和工作流程。

---

## 支援的 AI 工具

| AI 工具 | 指令檔案 | 格式 |
|---------|---------|------|
| Claude Code | `CLAUDE.md` | Markdown |
| Cursor | `.cursorrules` | Markdown |
| Windsurf | `.windsurfrules` | Markdown |
| Cline | `.clinerules` | Markdown |
| GitHub Copilot | `.github/copilot-instructions.md` | Markdown |
| OpenCode | `.opencode/instructions.md` | Markdown |

---

## 核心原則：通用與專用分離

### 為什麼要分離？

AI 指令檔案通常混合兩種類型的內容：
1. **通用規則**：適用於任何專案
2. **專案專用配置**：專屬於你的專案

分離這些內容可以改善：
- **可攜性**：通用區段可在專案間重複使用
- **可維護性**：更容易更新而不會意外「洩漏」
- **清晰性**：使用者知道採用標準時需要自訂哪些部分

---

## 檔案結構

### 建議的佈局

```markdown
# [專案名稱] - AI 指令

## 通用標準
<!-- 適用於任何專案的規則 -->
- Commit 訊息格式
- 程式碼審查清單
- 測試標準
- 反幻覺規則

---

## 專案專用配置
<!-- 專屬於本專案 - 採用時需自訂 -->

### 技術棧
[你的技術在這裡]

### 快速指令
[你的建置/測試/部署指令]

### 檔案結構
[你的專案結構]

### 發布流程
[你的發布工作流程]
```

---

## 內容指南

### 通用內容（不要包含專案特定細節）

| 類別 | 範例 |
|------|------|
| **Commit 標準** | Conventional Commits 格式、訊息結構 |
| **程式碼審查** | 審查清單、註解前綴 |
| **測試** | 測試金字塔比例、命名慣例 |
| **AI 行為** | 反幻覺規則、來源標註 |
| **文件** | 寫作風格、結構指南 |

**在通用區段中避免：**
- 特定指令（例如：`npm test`、`pytest`）
- 硬編碼路徑（例如：`cli/src/`、`/var/www/`）
- 版本號（例如：`Node.js 18`、`Python 3.11`）
- 專案名稱和 URL

### 專案專用內容（明確標記這些區段）

| 類別 | 範例 |
|------|------|
| **技術棧** | 程式語言、框架、版本 |
| **指令** | 建置、測試、lint、部署指令 |
| **檔案結構** | 目錄佈局、關鍵檔案 |
| **發布流程** | 版本檔案、部署步驟 |
| **團隊慣例** | 語言偏好、命名模式 |

---

## 標記慣例

使用明確的標記來區分內容類型：

### 選項 A：區段標題

```markdown
## 通用標準
[通用內容]

## 專案專用配置
[專案專用內容]
```

### 選項 B：行內標記

```markdown
> ⚠️ **專案專用**：此區段包含專屬於本專案的配置。

### 技術棧
...
```

### 選項 C：註解標註

```markdown
<!-- 通用：以下適用於所有專案 -->
### Commit 訊息格式
...

<!-- 專案專用：為你的專案自訂 -->
### 快速指令
...
```

---

## 國際化（i18n）

AI 指令檔常需提供多語言版本——既為了國際採用者，也為了非英語母語維護者主導的專案。本章節定義多語言指令檔的組織、驗證與安裝規則。

### AI 指令檔的範圍

本標準涵蓋兩個層級的 AI 指令檔：

| 層級 | 範例 | i18n 模式 |
|------|------|----------|
| **Root 層** | `CLAUDE.md`、`.cursorrules`、`.windsurfrules`、`.opencode/instructions.md` | 單檔內以 inline 段落分語言（例：`## 中文` / `## English`）|
| **Skill 層** | Claude Code `.claude/skills/{name}/SKILL.md`、OpenCode plugin instructions | Canonical（英文）+ `locales/{lang}/` 變體 |

> 注意：skill 層的多檔結構主要對 Claude Code 適用。其他工具是 root 單檔；對它們只有下方「分層語言策略」與「Chimera 防範」規則適用。

### 分層語言策略

每份 AI 指令檔概念上有 **4 層**，各層語言責任不同：

| 層 | 內容 | Canonical (en) | Locale ({lang}) | 為何分這層 |
|----|------|---------------|----------------|-----------|
| **L1 — Metadata** | YAML frontmatter `description`、`argument-hint`、`allowed-tools` | **必須英文** | **必須對應 locale 語言** | AI 觸發訊號；英文 token 效率最高 + 訓練語料密度高 |
| **L2 — 指令（Instructions）** | 對 AI 的命令式規則（steps、behavior、allowed-tools 理由）| **必須英文** | 對應 locale 語言（可選；可保留英文）| AI 讀英文指令最精準；只有當維護者需要以母語讀指令時才翻譯 |
| **L3 — 輸出範本（Output Templates）** | 範例輸出、回應格式、情境範本 | 英文（canonical 鎖定英文）| **強制對應 locale**（mandatory）| **唯一直接影響 AI 輸出語言的層**——AI 會繼承所見範本的語言 |
| **L4 — 人類文件** | 維護者註解、貢獻者說明、walkthrough | 英文 | 對應 locale 語言（強烈建議）| 給人類維護者讀，AI 不讀 |

**關鍵 insight**：L1（description）是 AI 用來決定「**是否呼叫**」此 skill 的觸發訊號——它**不**影響 AI 之後說什麼。L3（output template）才是控制 AI 輸出語言的唯一開關，因為 AI 會慣性沿用範本語言。**i18n 強制檢查應該聚焦在 L3——加強 L1 的強制（例如強制 description 用 locale）是常見錯誤，它解決的是錯誤的問題。**

### Canonical / Locale 檔案結構

UDS 標準與 skill 的 locale 變體結構：

```text
core/{name}.md                              ← canonical（英文）— single source of truth
core/{name}.ai.yaml                         ← canonical 結構化（英文）
locales/{lang}/core/{name}.md               ← locale 變體（匹配 lang）
locales/{lang}/ai/standards/{name}.ai.yaml  ← locale .ai.yaml（匹配 lang）
skills/{name}/SKILL.md                      ← canonical skill（英文）
locales/{lang}/skills/{name}/SKILL.md       ← locale skill 變體
```

**命名慣例**：使用 BCP 47 語言標籤——`zh-TW`、`zh-CN`、`ja`、`ko`、`en-US` 等。

### Locale 變體 Frontmatter 必填欄位

每個 locale 變體必須含追蹤用 frontmatter，方便偵測 drift：

```yaml
---
name: {與 canonical 同名}
source: {指回 canonical 的相對路徑}
source_version: {翻譯時 canonical 的版本}
translation_version: {本翻譯的版本}
---
```

當 canonical 更新（bump `source_version`），locale 維護者應重新同步並 bump `translation_version`。若 `source_version` 落後超過 2 個 minor 版本，會觸發 drift 警告（見「Chimera 防範」）。

### 責任邊界

| 角色 | 擁有 | 必須做 |
|------|------|--------|
| **Canonical 擁有者** | `core/{name}.md`、`core/{name}.ai.yaml`、`skills/{name}/SKILL.md` | 維持 L1/L2/L3/L4 為英文；每次 breaking change 時 bump `source_version` |
| **Locale 維護者** | `locales/{lang}/...` 檔 | `translation_version` 對齊 `source_version`；翻譯 L1（必）、L2（選）、L3（必）、L4（建議）|
| **採用者（下游專案）** | 自己的 `.claude/skills/`、`CLAUDE.md` 等 | 用 `uds install --locale {lang}` 安裝；**絕不**手動修改 canonical 檔（要客製化請用 locale 變體或 overlay）|

### Chimera 防範

**Chimera**（混血兒）指違反分層規則、混合語言的檔案。常見 chimera 模式：

| 模式 | 嚴重度 | 偵測方式 |
|------|--------|----------|
| Canonical 檔的 `description` 含 CJK | ❌ Error | Lint：`canonical:description-must-be-ascii` |
| Locale 變體的 `description` 是純 ASCII | ❌ Error | Lint：`locale:description-must-match-language` |
| Locale 變體缺 `source:` frontmatter | ❌ Error | Lint：`locale:must-have-source-frontmatter` |
| Canonical L3 output template 含非英文範例回應 | ⚠️ Warn | Lint：`canonical:l3-language-consistency` |
| 採用者 `.claude/skills/` 的檔案與 canonical 和任何 locale 變體都不同 | ⚠️ Warn | Sync check：`adopter:must-match-installed-locale` |
| `translation_version` 落後 `source_version` 超過 2 minor | ⚠️ Warn | Drift check |

Pre-commit / CI lint 強制 error 級規則；warn 級規則只在 dashboard 揭露不阻擋。

### 採用者安裝模式

採用者透過 UDS CLI 安裝指令檔：

```bash
uds install --locale zh-TW   # 以繁體中文安裝 skills 與 standards
```

**Locale 解析優先順序**：
1. `--locale` CLI 旗標（最高）
2. `.uds/install.yaml` 的 `locale:` 欄位
3. 環境變數 `UDS_LOCALE`
4. Fallback：`en`

**Locale 不存在時的 fallback 行為**：當索求的 locale 對某個 skill 沒有變體時，CLI：
- 安裝 canonical（英文）檔案
- 發出 WARN 列出哪些 skill fallback 了
- **不**阻斷安裝

這確保覆蓋率不完整時採用者仍能用。採用者可查 `locales/COVERAGE.md` 知道哪些有翻譯、哪些沒有。

### 遷移：已有 chimera 的採用者

若採用者已手動修改過專案中的 canonical 檔（例：在 `.claude/skills/` 翻譯了描述）：

1. **辨識 chimera**：比對採用者檔案與 UDS canonical / canonical 的 locale 變體。
2. **安裝正確變體**：執行 `uds install --locale {lang}` 替換 chimera 為 locale 變體。
3. **保留專案級客製**：若 chimera 含合理的專案級客製（非翻譯），抽出為 overlay 或記錄到客製化日誌（例：`UDS-CUSTOMIZATION.md`）。
4. **丟棄純翻譯**：chimera 中純翻譯部分直接丟棄——locale 變體會取代它。

### 快速參考

| 動作 | 何時 | 工具 / 檔案 |
|------|------|------------|
| 新增語言支援 | 想支援新 locale | 建立 `locales/{lang}/...` 對應 canonical 結構 |
| 更新 canonical | 改進英文 source | Bump `source_version`；通知 locale 維護者 |
| 翻譯 / 同步 locale | 新增或更新 locale 內容 | Bump `translation_version`；參照當前 `source_version` |
| 檢查覆蓋率 | 定期 review | 看自動產生的 `locales/COVERAGE.md` |
| 帶 locale 安裝 | 採用者初設或重新同步 | `uds install --locale {lang}` |
| 跑 i18n lint | Commit 前 / CI | `uds lint --i18n` |

---

## 維護檢查清單

在提交 AI 指令檔案的變更之前：

- [ ] **通用區段**：無專案特定的路徑、指令或版本
- [ ] **專案專用區段**：已用標籤明確標記
- [ ] **交叉引用**：指向標準文件的連結正確
- [ ] **一致性**：格式與現有區段一致

### 洩漏檢測

執行此檢查以找出通用區段中可能的專案特定內容洩漏：

```bash
# 範例：在通用區段中找出硬編碼指令
grep -n "npm\|yarn\|pip\|cargo" CLAUDE.md | head -20
```

審查每個匹配項，確保它在專案專用區段中。

---

## 快速參考卡

### 通用 vs 專案專用

| 類型 | 包含 | 範例 |
|------|------|------|
| **通用** | 通用規則 | 「提交前執行測試」 |
| **專案專用** | 具體指令 | 「提交前執行 `npm test`」 |

### 區段標記

| 標記 | 含義 |
|------|------|
| `## 通用` | 適用於任何專案 |
| `## 專案專用` | 專屬於本專案 |
| `> ⚠️ 專案專用` | 特定區段的行內警告 |

---

## 相關標準

- [文件結構](documentation-structure.md)
- [文件寫作標準](documentation-writing-standards.md)
- [反幻覺指南](anti-hallucination.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-01-14 | 初始發布 |
| 1.1.0 | 2026-05-28 | 新增 i18n 章節；範圍延伸至 skill 層級檔案 |

---

## 授權

本標準採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 發布。
