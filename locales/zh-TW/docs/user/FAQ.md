---
source: docs/user/FAQ.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# UDS 常見問題

> **語言**: [English](../../../../docs/user/FAQ.md) | 繁體中文

---

## 安裝與設定

**Q：`uds init` 和 `uds update` 有什麼差別？**

`uds init` 用於首次設定：它會複製標準、設定你的 AI 工具，並安裝 skill。
`uds update` 則是把已初始化的專案升級到最新的 UDS 版本，過程中不會重新設定。

**Q：不用 Claude Code 也能使用 UDS 嗎？**

可以。UDS 支援 Claude Code、Cursor、GitHub Copilot、Windsurf，以及任何會讀取指令檔的 AI 工具。執行 `uds init` 並選擇你的工具，它就會設定對應的檔案（`.cursorrules`、`CLAUDE.md` 等）。Skill 為 Claude Code 專屬；對於其他工具，標準與等同 CLAUDE.md 的檔案仍然適用。

**Q：我已經有一份 `CLAUDE.md`，`uds init` 會覆寫它嗎？**

不會。`uds init` 會把 UDS 內容合併進你既有的檔案，以清楚標記的區塊附加 UDS 段落。你原有的內容會被保留。

---

## Skill 與命令

**Q：什麼是 Skill？**

Skill 是預先建好的 AI 工作流程，當你在 Claude Code 輸入 `/command` 時就會啟動。例如 `/sdd` 會啟動 Spec-Driven Development（規格驅動開發）skill，引導你建立 spec 檔。Skill 儲存在 `skills/<name>/SKILL.md`，並由 Claude Code 自動載入。

**Q：Skill 和 Standard 有什麼差別？**

**Standard（標準）** 是書面準則（Markdown 或 YAML），說明某件事該怎麼做（例如 「commit-message」標準定義了 Conventional Commits 格式）。**Skill** 則是運用這些標準來執行某個流程的 AI 工作流程。標準是知識庫；Skill 是執行層。

**Q：為什麼我在 Claude Code 選單裡看不到某個 skill？**

可能有三個原因：
1. **UDS 未初始化**：執行 `uds check` 確認
2. **超出 skill 預算**：當 skill 很多時，Claude Code 會截斷清單。請參閱 [skill-budget-tuning.md](../../../../docs/skill-budget-tuning.md) 調整哪些 skill 會顯示
3. **Tier 3 skill**：Tier 3 skill 預設隱藏以節省 context。它們仍可透過 `/<name>` 呼叫。若要顯示，請在你的 `settings.json` 中覆寫——參閱 [skill-budget-tuning.md](../../../../docs/skill-budget-tuning.md)

**Q：選單裡看不到的 skill 還能用嗎？**

可以。不論是否出現在選單中，每個 skill 都能直接輸入 `/<name>` 來呼叫。例如即使 `brainstorm-assistant` 是 Tier 3 而未列出，`/brainstorm` 仍然有效。

**Q：我怎麼知道哪個命令會觸發哪個 skill？**

完整的「命令對 skill」對照請見 [COMMANDS-INDEX.md](../../../../docs/user/COMMANDS-INDEX.md)，或以 skill 為中心的檢視 [SKILLS-INDEX.md](../../../../docs/user/SKILLS-INDEX.md)。

**Q：我怎麼停用一個從不使用的 skill？**

在你的 `.claude/settings.json` 中：
```json
{
  "skillOverrides": {
    "brainstorm-assistant": "disabled"
  }
}
```
所有覆寫選項請見 [skill-budget-tuning.md](../../../../docs/skill-budget-tuning.md)。

---

## 規格驅動開發

**Q：每次變更都得寫 spec 嗎？**

不用。建議在功能、user story 與較具規模的變更時撰寫 spec。對於小型 bug 修正或重構，`/commit` 與 `/code-review` 就足夠了。經驗法則：若實作會花超過 2 小時，寫 spec 會有幫助。

**Q：spec 存放在哪裡？**

預設位於專案根目錄的 `specs/SPEC-NNN-<slug>.md`。格式遵循 UDS spec-driven-development 標準。

**Q：什麼是 AC（Acceptance Criterion，驗收條件）？**

驗收條件是一條可測試的陳述，用來定義一個功能何時算「完成」。例如：「Given 一位已註冊使用者，When 他以正確憑證登入，Then 他會取得有效的 session token。」AC 驅動測試覆蓋並防止範圍蔓延。

---

## 更新與版本

**Q：我要如何把 UDS 更新到最新版？**

```bash
uds update
```

這會下載最新的標準與 skill，同時保留你專案專屬的客製化。

**Q：我要如何查看目前的 UDS 版本？**

```bash
uds --version
# 或
cat .standards/manifest.json | grep version
```

**Q：更新 UDS 會破壞我現有的 spec 或 CLAUDE.md 嗎？**

不會。標準更新保持向後相容。Spec 是你的檔案，`uds update` 絕不會動它們。CLAUDE.md 只有在你明確執行 `uds init --force` 時才會被修改。

---

## 架構

**Q：什麼是「雙層架構（Dual-Layer Architecture）」？**

UDS 有兩層：
- **Core Standards（核心標準，`.standards/` — Markdown 檔）**：人類可讀的準則、完整理論、邊界案例
- **AI Standards（AI 標準，`.standards/` — `.ai.yaml` 檔）**：同一份標準的 token 精簡、為 AI 最佳化的版本，專為 Claude Code 的 context window 設計

當 Skill 執行時，它會讀取 `.ai.yaml` 檔。當開發者想了解背後理由時，則閱讀 `.md` 檔。

**Q：`skills/` 和 `.standards/` 有什麼差別？**

`skills/` 包含驅動 Claude Code 中 `/command` 的 SKILL.md 檔，它們是工作流程。
`.standards/` 包含底層知識庫（Core Standards + AI Standards）。Skill 引用標準；標準不引用 skill。

**Q：什麼是 Skill Tier？（DEC-061）**

Tier 控制 Claude Code 的 context 預算有多少用於 skill 描述：
- **Tier 1**：永遠以完整描述列出（15 個 skill — 每日使用）
- **Tier 2**：預設以完整描述列出（28 個 skill — 每週使用）
- **Tier 3**：預設僅列出名稱（12 個 skill — 專家／事件驅動）

所有 tier 都能透過 `/<name>` 完整呼叫。Tier 只影響 _列出_ 的行為。
