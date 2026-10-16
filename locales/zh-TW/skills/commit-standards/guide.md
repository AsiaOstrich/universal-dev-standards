---
source: ../../../../skills/commit-standards/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: d20c12a0252c
status: current
description: |
  遵循約定式提交標準格式化提交訊息。
  使用時機：撰寫提交訊息、git commit、檢視提交歷史。
  關鍵字：commit、git、message、conventional、feat、fix、refactor。
---

# 提交訊息標準

> **語言**: [English](../../../../skills/commit-standards/guide.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2025-12-24
**適用範圍**: Claude Code Skills

---

> **核心標準**: 此技能實作 [Commit Message Guide](../../core/commit-message-guide.md)。如需完整的開發方法論文件，請參閱核心標準。

## 目的

此技能確保遵循約定式提交（conventional commits），撰寫一致且有意義的提交訊息。

# [實體綁定]
## 現實檢驗
在提交 commit 訊息之前，你必須：
1. 驗證環境：執行 `uds check --standard commit-message` 以確保已設定 `commitlint`。
2. 驗證內容：執行 `echo "{message}" | npx commitlint` 以驗證產生的訊息。
3. 若 exit_code != 0：
   - 閱讀錯誤訊息。
   - 修改訊息。
   - 重試驗證直到通過為止。

## 快速參考

### 基本格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 提交類型

| English | 使用時機 |
|---------|----------|
| `feat` | 新功能 |
| `fix` | 錯誤修正 |
| `refactor` | 程式碼重構（無功能變更） |
| `docs` | 僅文件變更 |
| `style` | 格式調整（無程式碼邏輯變更） |
| `test` | 新增或更新測試 |
| `perf` | 效能改善 |
| `build` | 建置系統或相依項目 |
| `ci` | CI/CD 管線變更 |
| `chore` | 維護任務 |
| `revert` | 還原先前的提交 |
| `security` | 安全漏洞修正 |

### 主旨行規則

1. **長度**: ≤72 字元（50 為理想）
2. **時態**: 祈使語氣（使用 "Add feature" 而非 "Added feature"）
3. **大小寫**: 首字母大寫
4. **無句點**: 結尾不加句點

## 詳細指南

完整標準請參考：
- [約定式提交指南](./conventional-commits.md)
- [語言選項](./language-options.md)

### AI 最佳化格式（Token 效率）

對於 AI 助理，請使用 YAML 格式檔案以減少 Token 使用量：
- 基礎標準：`ai/standards/commit-message.ai.yaml`
- 語言選項：
  - 英文：`ai/options/commit-message/english.ai.yaml`
  - 繁體中文：`ai/options/commit-message/traditional-chinese.ai.yaml`
  - 雙語：`ai/options/commit-message/bilingual.ai.yaml`

## 範例

### ✅ 良好範例

```
feat(auth): Add OAuth2 Google login support
fix(api): Resolve memory leak in user session cache
refactor(database): Extract query builder to separate class
docs(readme): Update installation instructions for Node 20
```

### ❌ 不良範例

```
fixed bug                    # Too vague, no scope
feat(auth): added google login  # Past tense
Update stuff.                # Period, vague
WIP                          # Not descriptive
```

## 主體內容指南

使用主體內容說明變更的**原因（WHY）**：

```
fix(api): Resolve race condition in concurrent user updates

Why this occurred:
- Two simultaneous PUT requests could overwrite each other
- No optimistic locking implemented

What this fix does:
- Add version field to User model
- Return 409 Conflict if version mismatch

Fixes #789
```

## 破壞性變更

務必在頁腳記錄破壞性變更：

```
feat(api): Change user endpoint response format

BREAKING CHANGE: User API response format changed

Migration guide:
1. Update API clients to remove .data wrapper
2. Use created_at instead of createdAt
```

## 議題參照

```
Closes #123    # Automatically closes issue
Fixes #456     # Automatically closes issue
Refs #789      # Links without closing
```

---

## 語言選擇決策（YAML 壓縮）

```yaml
# === LANGUAGE DECISION MATRIX ===
decision_tree:
  - q: "Open source project?"
    y: "→ English (international contributors)"
    n: next
  - q: "International/distributed team?"
    y: "→ English (common language)"
    n: next
  - q: "Single-language team?"
    y: "→ Team's primary language OR English"
    n: "→ Bilingual (subject:EN, body:local)"

recommendation_matrix:
  open_source: {lang: English, reason: "international contributors"}
  international_team: {lang: English, reason: "common language"}
  local_team_EN: {lang: English, reason: "tool compatibility, career mobility"}
  local_team_ZH: {lang: "繁體中文", reason: "clarity, team preference"}
  mixed: {lang: Bilingual, reason: "best of both worlds"}

# === TOOL COMPATIBILITY ===
tool_support:
  full_unicode:
    - GitHub/GitLab/Bitbucket
    - VS Code/JetBrains
    - SourceTree/GitKraken
  potential_issues:
    - "Some CI/CD log viewers"
    - "Legacy terminal encodings"
    - "Email notifications (rare)"

# === FORMAT BY LANGUAGE ===
english:
  types: [feat, fix, refactor, docs, style, test, perf, build, ci, chore, revert, security]
  example: "feat(auth): add OAuth2 Google login support"

traditional_chinese:
  # English types (same as english), Traditional Chinese subject and body. A Chinese type is not allowed (XSPEC-475).
  types: [feat, fix, refactor, docs, style, test, perf, build, ci, chore, revert, security]
  example: "feat(auth): 新增 OAuth2 Google 登入支援"

bilingual:
  format: "type(scope): English subject. 中文主旨.\n\nEnglish body\n\n中文 body\n\nfooter"
  example: |
    feat(auth): Add OAuth2 Google login support. 新增 OAuth2 Google 登入支援.

    Implement Google OAuth2 authentication flow for user login.

    - Add Google OAuth2 SDK integration
    - Create callback endpoint for OAuth flow
    - Store refresh tokens securely

    實作 Google OAuth2 認證流程供使用者登入。

    - 整合 Google OAuth2 SDK
    - 建立 OAuth 流程回呼端點
    - 安全儲存更新權杖

    Closes #123
```

---

## 配置檢測

此技能支援專案特定的語言配置。

### 檢測順序

1. 檢查 `CONTRIBUTING.md` 中的「Output Language」區段
2. 若找到，使用指定的選項（English / Traditional Chinese / Bilingual）
3. 若未找到，**預設使用 English** 以獲得最大工具相容性

### 首次設定

若未找到配置且情境不明確：

1. 詢問使用者：「此專案尚未配置提交訊息語言偏好。您想使用哪個選項？（English / 中文 / Bilingual）」
2. 使用者選擇後，建議記錄於 `CONTRIBUTING.md`：

```markdown
## Output Language

This project uses **[chosen option]** commit types.
<!-- Options: English | Traditional Chinese | Bilingual -->
```

### 配置範例

在專案的 `CONTRIBUTING.md` 中：

```markdown
## Output Language

This project uses **English** commit types.

### Allowed Types
feat, fix, refactor, docs, style, test, perf, build, ci, chore, revert, security
```

---

## 雙語主體慣例

使用雙語提交訊息時，主體必須嚴格遵循此結構：

```
<type>(<scope>): <English subject>. <中文主旨>.
                                                    ← blank line
<English body>                                      ← English explanation first
                                                    ← blank line
<中文本文>                                           ← Chinese explanation second
                                                    ← blank line
<footer>                                            ← BREAKING CHANGE, Fixes #, etc.
```

### 結構規則

1. **英文主體優先** — 撰寫完整的英文說明（段落 + 視需要加上項目符號清單）
2. **空行分隔** — 英文與中文區段之間保留一行空行
3. **中文主體次之** — 撰寫完整的中文說明（對應英文內容）
4. **頁腳前保留空行** — 任何頁腳行之前保留一行空行
5. **不混用語言** — 每個段落必須完全使用單一語言

### 反模式

| 模式 | 問題 | 修正方式 |
|---------|---------|-----|
| 混合段落：`Add login 新增登入` | 單一段落中混雜多種語言 | 分開成兩個段落 |
| 僅有英文主體 | 缺少中文主體 | 在英文主體後加入中文主體 |
| 僅有中文主體 | 缺少英文主體 | 在中文主體前加入英文主體 |
| 頁腳置於主體之間 | 頁腳分割了雙語內容 | 將頁腳移至末尾 |

---

## 相關標準

- [Commit Message Guide](../../core/commit-message-guide.md)
- [Git Workflow](../../core/git-workflow.md)
- [Changelog Standards](../../core/changelog-standards.md)

---

## 版本歷史

| 版本 | 日期 | 變更內容 |
|------|------|----------|
| 1.0.0 | 2025-12-24 | 新增：標準區段（目的、相關標準、版本歷史、授權） |

---

## 授權

此技能以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
