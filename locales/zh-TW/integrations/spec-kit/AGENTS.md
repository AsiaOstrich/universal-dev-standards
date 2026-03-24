---
source: ../../../../integrations/spec-kit/AGENTS.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-03-23
status: current
---

# Spec Kit 指令

> **語言**: [English](../../../../integrations/spec-kit/AGENTS.md) | 繁體中文

**版本**: 1.1.0
**最後更新**: 2026-03-23

為使用 Spec Kit 進行規格驅動開發的 AI 程式助手提供指引。

## 使用方式

將此檔案複製到您的專案中，或納入您的 AI 助手系統指令。

---

## 使用 Spec Kit 進行規格驅動開發

當 Spec Kit 在此專案中啟用時，您必須遵循**規格驅動開發 (SDD)** 方法論。

### 核心原則：先規格，後程式碼

**規則**：在沒有對應已核准規格的情況下，不得進行任何功能性程式碼變更。

**例外**：
- 緊急修復（立即恢復服務，事後補文件）
- 微小變更（錯字、註解、格式調整）

---

## Spec Kit 指令

### CLI 指令

| 指令 | 說明 |
|------|------|
| `specify init <project-name>` | 初始化新的 SDD 專案 |
| `specify check` | 驗證已安裝的工具（git、AI agents） |

**Init 選項：**

| 旗標 | 說明 |
|------|------|
| `--ai <agent>` | 選擇 AI 助手（claude、gemini、copilot、cursor-agent、windsurf 等） |
| `--ai-skills` | 以 agent skills 而非斜線指令安裝 |
| `--here` | 在目前目錄中初始化 |
| `--force` | 合併時跳過確認 |
| `--script ps` | PowerShell 腳本（Windows/跨平台） |
| `--no-git` | 跳過 git 儲存庫初始化 |
| `--debug` | 啟用詳細輸出 |
| `--branch-numbering timestamp` | 使用時間戳記式分支命名 |

### 斜線指令（工作流程）

當 Spec Kit 可用時，使用以下斜線指令進行 SDD 工作流程：

| 指令 | 階段 | 說明 |
|------|------|------|
| `/constitution` | 設定 | 建立專案治理原則 |
| `/specify` | 提案 | 定義需求與使用者故事 |
| `/clarify` | 討論 | 透過結構化問題解決規格歧義 |
| `/plan` | 設計 | 建立技術實作計畫 |
| `/tasks` | 規劃 | 產生可執行的任務分解 |
| `/analyze` | 審查 | 檢查跨產物的一致性 |
| `/implement` | 實作 | 執行任務以建構功能 |

### 指令優先順序

**規則**：始終優先使用 Spec Kit 指令，而非手動編輯檔案。

**理由**：
- **一致性**：確保規格結構遵循 schema
- **可追溯性**：自動產生 ID 與建立連結
- **驗證**：內建檢查防止無效狀態

---

## SDD 工作流程

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Constitution │───▶│   Specify    │───▶│   Clarify    │
└──────────────┘    └──────────────┘    └──────────────┘
                                               │
                    ┌──────────────┐    ┌───────▼──────┐
                    │  Implement   │◀───│  Plan/Tasks  │
                    └──────────────┘    └──────────────┘
                           │
                    ┌──────▼───────┐
                    │   Analyze    │
                    └──────────────┘
```

### 工作流程階段

| 階段 | 說明 | 指令 |
|------|------|------|
| **Constitution** | 定義專案治理原則 | `/constitution` |
| **Specify** | 定義需求與使用者故事 | `/specify` |
| **Clarify** | 透過結構化問題解決歧義 | `/clarify` |
| **Plan** | 建立技術實作計畫 | `/plan` |
| **Tasks** | 產生可執行的任務分解 | `/tasks` |
| **Implement** | 執行任務以建構功能 | `/implement` |
| **Analyze** | 檢查跨產物的一致性 | `/analyze` |

---

## 工作流程強制閘門

**重要**：在執行任何工作流程階段之前，你**必須**檢查先決條件。

### 階段閘門

| 階段 | 先決條件 | 失敗時 |
|------|----------|--------|
| Specify | Constitution 已建立（首次時） | → 先執行 `/constitution` |
| Plan | 需求已透過 `/specify` 定義 | → 先執行 `/specify` |
| Implement | 計畫已核准、任務已產生 | → 先執行 `/plan` 再執行 `/tasks` |
| Commit (feat/fix) | 檢查作用中的規格 | → 建議加上 `Refs: SPEC-XXX` |

### 會話啟動協定
在會話開始時，檢查是否有作用中的工作流程：尋找 `.specify/` 目錄或作用中的規格檔案。
若發現作用中的工作流程 → 告知使用者並提供繼續的選項。

參考：`.standards/workflow-enforcement.ai.yaml`

---

## 執行任何任務之前

**情境檢查清單**：
- [ ] 檢查作用中的規格：尋找 `.specify/` 目錄
- [ ] 在進行變更前審查相關規格
- [ ] 確認沒有衝突的規格存在
- [ ] 若變更非微小則建立規格

**可跳過規格的情況**：
- Bug 修復（恢復預期行為）
- 錯字、格式、註解
- 相依性更新（非破壞性）
- 設定檔變更

---

## 目錄結構

```
.specify/
├── templates/                    # 核心 spec-kit 範本
├── extensions/
│   └── <ext-id>/templates/      # 擴充套件範本
├── presets/
│   └── <preset-id>/templates/   # 預設客製化
└── templates/overrides/          # 專案本地覆寫（最高優先）
```

---

## 規格文件範本

手動建立規格時，請使用以下結構：

```markdown
# [SPEC-ID] 功能標題

## 摘要
簡要描述提議的變更。

## 動機
為何需要此變更？它解決什麼問題？

## 詳細設計
技術方案、受影響的元件、資料流。

## 驗收標準
- [ ] 標準 1
- [ ] 標準 2

## 相依性
列出對其他規格或外部系統的相依性。

## 風險
潛在風險與緩解策略。
```

---

## 與 Universal Dev Standards 整合

### 提交訊息

在提交訊息中引用規格 ID：

```
feat(auth): implement login feature

Implements SPEC-001 login functionality with OAuth2 support.

Refs: SPEC-001
```

### 程式碼審查

審查者應驗證：
- [ ] 變更符合已核准的規格
- [ ] 未超出規格範圍
- [ ] 規格驗收標準已達成

---

## 最佳實踐

### 應做

- 保持規格聚焦且原子化（每個規格一個變更）
- 包含明確的驗收標準
- 將規格連結到實作 PR
- 使用 `/analyze` 驗證一致性
- 完成後封存規格

### 不應做

- 在規格核准前開始寫程式
- 在實作期間修改範圍卻未更新規格
- 讓規格處於未決狀態（應始終關閉或封存）
- 在需求模糊時跳過 `/clarify` 步驟

---

## 相關標準

- [規格驅動開發](../../../../core/spec-driven-development.md) - SDD 方法論
- [提交訊息指南](../../../../core/commit-message-guide.md) - 提交慣例
- [程式碼簽入標準](../../../../core/checkin-standards.md) - 簽入要求

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.1.0 | 2026-03-23 | 更新以反映 Spec Kit v0.4.0 實際的 CLI 指令與斜線指令 |
| 1.0.0 | 2025-12-30 | 初始 Spec Kit 整合 |

---

## 授權條款

本文件依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。
