---
source: ../../../../skills/commands/update.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Update development standards to latest version
allowed-tools: Read, Bash(uds update:*), Bash(uds check:*), Bash(uds configure:*), Bash(npx:*), Bash(cat .standards/*), Bash(ls .claude/*), Bash(ls .opencode/*), Bash(ls .github/*)
argument-hint: "[--yes] [--offline] [--beta]"
---

# 更新標準

> **Language**: [English](../../../../skills/commands/update.md) | 繁體中文

將 Universal Development Standards 更新至最新版本。

## 互動模式（預設）

當不帶 `--yes` 執行時，使用 AskUserQuestion 確認更新偏好。

### 步驟 1：檢查目前狀態

首先，執行 `uds check --summary` 顯示精簡安裝狀態。

```bash
uds check --summary
```

顯示：版本（含更新指示器）、等級、檔案狀態、Skills 狀態和 Commands 狀態。

### 步驟 2：詢問更新偏好

如果有可用更新，根據版本類型顯示對應選項。

#### Pre-release 版本類型

Pre-release 版本按穩定度排序（由低到高）：

| 類型 | 穩定度 | 說明 |
|------|--------|------|
| alpha | 🔴 早期 | 功能可能不完整，供內部測試 |
| beta | 🟡 測試中 | 功能大致完成，可能有 bug，供早期採用者 |
| rc | 🟢 接近穩定 | 候選發布版，接近正式版，供 beta 測試者 |

版本比較：`alpha < beta < rc < stable`

詳細版本規範請參見 [core/versioning.md](../../core/versioning.md)。

#### 更新選項

**如果有穩定版本可用（例如 3.5.1）：**

| 選項 | 說明 |
|------|------|
| **立即更新** | 更新標準至最新穩定版本 X.Y.Z（建議） |
| **檢查 Beta** | 檢查 beta 版本更新 |
| **跳過** | 暫不更新 |

**如果僅有 pre-release 版本可用，顯示特定類型：**

從 `uds check` 輸出偵測版本類型並顯示特定類型名稱：

| 偵測到的類型 | 選項標籤 | 說明 |
|-------------|---------|------|
| `X.Y.Z-alpha.N` | **更新至 Alpha** | 更新至 alpha 版本 X.Y.Z-alpha.N（🔴 早期測試） |
| `X.Y.Z-beta.N` | **更新至 Beta** | 更新至 beta 版本 X.Y.Z-beta.N（🟡 功能大致完成） |
| `X.Y.Z-rc.N` | **更新至 RC** | 更新至 RC 版本 X.Y.Z-rc.N（🟢 接近穩定） |

一律包含**跳過**選項：暫不更新。

**Beta 版本的 AskUserQuestion 範例：**
- 問題："有新的 beta 版本可用：3.5.1-beta.3 → 3.5.1-beta.15。您想如何處理？"
- 選項 1："更新至 Beta (建議)" - "更新標準至 3.5.1-beta.15 版本（🟡 功能大致完成）"
- 選項 2："暫時跳過" - "目前不進行更新，維持現有版本"

### 步驟 3：執行更新

**如果選擇立即更新：**
```bash
uds update --yes
```

**如果選擇檢查 Beta：**
```bash
uds update --beta --yes
```

### 步驟 4：檢查 Skills/Commands 狀態

更新完成後，使用多階段 AskUserQuestion 檢查缺少或過時的 Skills/Commands。

**重要：** 由於 AskUserQuestion 選項有限（最多 4 個），使用多階段方式處理不同 AI 工具和安裝偏好。

#### 步驟 4a：偵測缺少的 Skills

首先讀取 manifest 來識別已配置的 AI 工具及其 Skills 狀態：

```bash
# 讀取 manifest 取得已配置的 AI 工具
cat .standards/manifest.json
# 檢查現有的 Skills 安裝
ls .claude/skills/ 2>/dev/null || echo "Not installed"
ls .opencode/skill/ 2>/dev/null || echo "Not installed"
```

針對每個支援 Skills 的已配置 AI 工具，檢查 Skills 是否已安裝。

#### 步驟 4b/4c：詢問 Skills 安裝（整合）

如果有已配置的 AI 工具缺少 Skills，使用**智能分組**策略。

**重要：AskUserQuestion 最多只能有 4 個選項。** 使用智能分組來處理。

**步驟 4b-1：檢查 Marketplace 狀態（僅 Claude Code）**

首先檢查 Plugin Marketplace 是否已安裝：
```bash
ls ~/.claude/plugins/universal-dev-standards@asia-ostrich 2>/dev/null && echo "Marketplace installed"
```

- 如果 Marketplace 已安裝 → 顯示 "Claude Code: ✓ 已透過 Marketplace 安裝" 並跳過 Claude Code 選項
- 如果 Marketplace 未安裝 → 包含 Marketplace 選項

**步驟 4b-2：套用智能分組策略**

#### 策略 A：1-2 個工具 → 合併詢問

**範例（僅 Claude Code，Marketplace 未安裝）：**
```
問題："Skills 要安裝到哪裡？"
選項：
1. Plugin Marketplace (建議) - 自動更新，易於管理
2. User Level (~/.claude/skills/) - 所有專案共用
3. Project Level (.claude/skills/) - 僅此專案
4. 跳過 - 不安裝 Skills
```

**範例（OpenCode + Copilot，Claude Code 已透過 Marketplace 安裝）：**
```
問題："Skills 要安裝到哪裡？（Claude Code: ✓ 已透過 Marketplace 安裝）"
選項：
1. 全部 User Level - 所有專案共用
2. 全部 Project Level (建議) - 僅此專案
3. 跳過 - 不安裝額外 Skills
```

#### 策略 B：3+ 個工具 → 兩階段詢問

**第一階段：詢問統一或個別**
```
問題："有多個 AI 工具需要安裝 Skills，安裝層級要如何設定？"
選項：
1. 統一層級 (建議) - 所有工具使用相同層級
2. 個別設定 - 為每個工具分別選擇層級
3. 跳過 - 不安裝 Skills
```

**第二階段 a：若統一 → 詢問層級一次**
```
問題："所有 Skills 要安裝到哪個層級？"
選項：
1. User Level - 所有專案共用
2. Project Level (建議) - 僅此專案
```

**第二階段 b：若個別 → 逐工具詢問**

**執行安裝：**
```bash
uds configure --type skills --ai-tool opencode --skills-location project
uds configure --type skills --ai-tool cursor --skills-location user
```

**注意：** 如果用戶選擇統一層級，使用 `--skills-location` 選項。如果選擇個別設定，不帶此選項執行以觸發互動提示。

#### 步驟 4d：偵測缺少的 Commands

檢查已配置但尚未安裝 Commands 的 AI 工具：

```bash
# 檢查現有的 Commands 安裝
ls .opencode/commands/ 2>/dev/null || echo "Not installed"
ls .github/commands/ 2>/dev/null || echo "Not installed"
```

**注意：** 並非所有 AI 工具都支援 Commands。支援 Commands 的工具：
- OpenCode (.opencode/commands/)
- GitHub Copilot (.github/commands/)
- Roo Code (.roo/commands/)
- Gemini CLI (.gemini/commands/)

#### 步驟 4e：詢問 Commands 安裝

如果有已配置的 AI 工具缺少 Commands，使用**智能分組**策略。

**重要：AskUserQuestion 最多只能有 4 個選項。** 使用智能分組來處理。

#### 策略 A：1-2 個工具 → 合併詢問

**範例（僅 OpenCode）：**
```
問題："Commands 要安裝到哪裡？"
選項：
1. User Level (~/.config/opencode/command/) - 所有專案共用
2. Project Level (.opencode/command/) - 僅此專案 (建議)
3. 跳過 - 使用 Skills 即可
```

**範例（OpenCode + Copilot）：**
```
問題："Commands 要安裝到哪裡？"
選項：
1. 全部 User Level - 所有專案共用
2. 全部 Project Level (建議) - 僅此專案
3. 跳過 - 使用 Skills 即可
```

#### 策略 B：3+ 個工具 → 兩階段詢問

**第一階段：詢問統一或個別**
```
問題："有多個 AI 工具需要安裝 Commands，安裝層級要如何設定？"
選項：
1. 統一層級 (建議) - 所有工具使用相同層級
2. 個別設定 - 為每個工具分別選擇層級
3. 跳過 - 不安裝 Commands
```

**第二階段 a：若統一 → 詢問層級一次**
```
問題："所有 Commands 要安裝到哪個層級？"
選項：
1. User Level - 所有專案共用
2. Project Level (建議) - 僅此專案
```

**第二階段 b：若個別 → 逐工具詢問**

**執行安裝：**
```bash
# CLI 會互動詢問安裝層級
uds configure --type commands --ai-tool opencode
uds configure --type commands --ai-tool copilot
```

**注意：** 指定 `--ai-tool` 時，CLI 會互動詢問安裝層級（project 或 user）。

#### 拒絕功能處理

**重要：** CLI 會在 `manifest.declinedFeatures` 中追蹤用戶拒絕的選項。

- 用戶之前拒絕的工具不會在後續提示中顯示
- 可透過 `/config skills` 或 `/config commands` 重新安裝
- 拒絕是按工具記錄的（例如拒絕 OpenCode 的 Skills 不影響 Claude Code）

### 步驟 5：說明結果

所有操作完成後，說明：
1. 已更新的內容（標準版本、檔案數量）
2. Skills/Commands 安裝結果
3. 遇到的任何錯誤
4. 後續步驟（若安裝了 Skills 則重新啟動 AI 工具）

## 快速模式

帶 `--yes` 或特定選項執行時，跳過互動問題：

```bash
/update --yes           # 不確認直接更新
/update --beta --yes    # 更新至 beta 版本
/update --offline       # 跳過 npm registry 檢查
/update --skills        # 僅更新 Skills
/update --commands      # 僅更新 Commands
```

**注意：** 在 `--yes` 模式下，CLI 會顯示可用 Skills/Commands 的提示，但不會自動安裝（保守行為）。

## 選項參考

| 選項 | 說明 |
|------|------|
| `--yes`, `-y` | 跳過確認提示 |
| `--offline` | 跳過 npm registry 檢查 |
| `--beta` | 檢查 beta 版本更新 |
| `--skills` | 僅更新 Skills |
| `--commands` | 僅更新 Commands |
| `--integrations-only` | 僅重新產生整合檔案 |
| `--sync-refs` | 同步整合檔案參考 |
| `--standards-only` | 僅更新標準，不更新整合 |

## 更新內容

- `.standards/` 目錄中的標準檔案
- 擴充檔案（語言、框架、地區）
- 整合檔案（`.cursorrules`、`CLAUDE.md` 等）
- `manifest.json` 中的版本資訊

## Skills 更新

Skills 單獨管理：

| 安裝方式 | 更新方法 |
|---------|---------|
| Plugin Marketplace | 重啟 Claude Code 自動更新 |
| User-level | `cd ~/.claude/skills && git pull` |
| Project-level | `cd .claude/skills && git pull` |

## 疑難排解

**"Standards not initialized"**
- 先執行 `/init` 初始化標準

**"Already up to date"**
- 無需操作；標準已是最新

**"Skills previously declined"**
- 執行 `/config skills` 重新安裝已拒絕的 Skills

## 參考

- CLI 文件：`uds update --help`
- 檢查指令：[/check](./check.md)
- 配置指令：[/config](./config.md)
