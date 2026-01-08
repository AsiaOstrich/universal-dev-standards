---
source: ../../../../../skills/claude-code/release-standards/release-workflow.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-08
status: current
---

# 發布流程指南

> **Language**: [English](../../../../skills/claude-code/release-standards/release-workflow.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-01-02
**適用範圍**: Universal Development Standards 專案

---

## 目的

本文件提供 Universal Development Standards 專案的完整逐步發布流程，包含版本管理、npm 發布、GitHub 發布和 dist-tag 處理。

---

## 發布類型

### 1. Beta 發布（測試版本）

**使用時機：**
- 在穩定版發布前測試新功能
- 向早期採用者收集回饋
- 在生產環境前驗證錯誤修正

**版本模式：** `X.Y.Z-beta.N`（例如：`3.2.1-beta.1`）

**npm 標籤：** `@beta`

**安裝方式：** `npm install -g universal-dev-standards@beta`

---

### 2. 穩定發布（正式版本）

**使用時機：**
- 所有功能已測試並驗證
- 準備好用於生產環境
- 所有測試通過

**版本模式：** `X.Y.Z`（例如：`3.2.1`）

**npm 標籤：** `@latest`

**安裝方式：** `npm install -g universal-dev-standards`

---

### 3. Alpha 發布（早期測試）

**使用時機：**
- 非常早期的測試，功能不穩定
- 僅限內部團隊測試

**版本模式：** `X.Y.Z-alpha.N`（例如：`3.3.0-alpha.1`）

**npm 標籤：** `@alpha`

**安裝方式：** `npm install -g universal-dev-standards@alpha`

---

### 4. 候選發布（預發布）

**使用時機：**
- 穩定版發布前的最終測試
- 不包含新功能，僅錯誤修正

**版本模式：** `X.Y.Z-rc.N`（例如：`3.2.1-rc.1`）

**npm 標籤：** `@rc`

**安裝方式：** `npm install -g universal-dev-standards@rc`

---

## 完整發布流程

### 流程 A：Beta 發布

```bash
# 1. 確保在 main 分支並已更新
git checkout main
git pull origin main

# 2. 確保所有測試通過
cd cli
npm test
npm run lint

# 3. 更新版本號為 beta
npm version 3.2.1-beta.1

# 4. 更新 CHANGELOG.md
# - 在 [Unreleased] 區段下新增條目
# - 建立新區段：## [3.2.1-beta.1] - YYYY-MM-DD
# - 將 [Unreleased] 的變更移到新區段

# 5. 提交變更（如果手動更新了 CHANGELOG）
git add CHANGELOG.md cli/package.json cli/package-lock.json
git commit -m "chore(release): bump version to 3.2.1-beta.1"

# 6. 建立並推送 git tag
git tag v3.2.1-beta.1
git push origin main --tags

# 7. 建立 GitHub Release
# - 前往：https://github.com/AsiaOstrich/universal-dev-standards/releases/new
# - Tag：v3.2.1-beta.1
# - 標題：v3.2.1-beta.1 - [功能名稱] (Beta)
# - 標記為「Pre-release」
# - 描述：使用 .github/RELEASE_v3.2.1-beta.1.md 的範本
# - 點擊「Publish release」

# 8. GitHub Actions 自動發布到 npm 並標記為 @beta
# - 工作流程：.github/workflows/publish.yml
# - 自動標籤偵測：版本包含 "-beta." → @beta 標籤
# - 無需手動執行 npm publish

# 9. 驗證 npm 發布
npm view universal-dev-standards dist-tags
# 預期：{ latest: '3.2.0', beta: '3.2.1-beta.1' }

# 10. 測試安裝
npm install -g universal-dev-standards@beta
uds --version  # 應顯示 3.2.1-beta.1
```

---

### 流程 B：穩定發布（從 Beta）

```bash
# 1. 確保 beta 測試完成並所有問題已解決
# 2. 確保在 main 分支並已更新
git checkout main
git pull origin main

# 3. 確保所有測試通過
cd cli
npm test
npm run lint

# 4. 更新版本號為穩定版
npm version 3.2.1

# 5. 更新 CHANGELOG.md
# - 將 [3.2.1-beta.1] 的變更移到 [3.2.1]
# - 更新日期為發布日期
# - 移除 beta 專屬的註記

# 6. 提交變更
git add CHANGELOG.md cli/package.json cli/package-lock.json
git commit -m "chore(release): bump version to 3.2.1"

# 7. 建立並推送 git tag
git tag v3.2.1
git push origin main --tags

# 8. 建立 GitHub Release
# - 前往：https://github.com/AsiaOstrich/universal-dev-standards/releases/new
# - Tag：v3.2.1
# - 標題：v3.2.1 - [功能名稱]
# - 標記為「Latest release」
# - 描述：最終發布說明
# - 點擊「Publish release」

# 9. GitHub Actions 自動發布到 npm 並標記為 @latest
# - 工作流程：.github/workflows/publish.yml
# - 自動標籤偵測：無預發布識別符 → @latest 標籤
# - 無需手動執行 npm publish

# 10. 驗證 npm 發布
npm view universal-dev-standards dist-tags
# 預期：{ latest: '3.2.1', beta: '3.2.1-beta.1' }

# 11. 測試安裝
npm install -g universal-dev-standards
uds --version  # 應顯示 3.2.1
```

---

### 流程 C：直接穩定發布（跳過 Beta）

```bash
# 僅在小幅修正或不需要 beta 測試時使用

# 1. 遵循流程 B 的步驟 1-11
# 2. 不需要 beta 版本，直接發布穩定版
```

---

## npm dist-tag 策略

專案在 `.github/workflows/publish.yml` 中使用自動標籤偵測：

| 版本模式 | npm Tag | 安裝指令 | 自動化？ |
|---------|---------|---------|---------|
| `X.Y.Z` | `latest` | `npm install -g universal-dev-standards` | ✅ 是 |
| `X.Y.Z-beta.N` | `beta` | `npm install -g universal-dev-standards@beta` | ✅ 是 |
| `X.Y.Z-alpha.N` | `alpha` | `npm install -g universal-dev-standards@alpha` | ✅ 是 |
| `X.Y.Z-rc.N` | `rc` | `npm install -g universal-dev-standards@rc` | ✅ 是 |

### 運作方式

GitHub Actions 工作流程會自動：

1. 從 `cli/package.json` 讀取版本號
2. 使用正則表達式模式偵測版本類型
3. 使用正確的標籤發布到 npm

**實作位置：** `.github/workflows/publish.yml` 第 39-60 行

---

## 疑難排解：手動修正 dist-tag

### 問題：手動 npm 發布後標籤錯誤

如果不小心使用錯誤的標籤發布（例如 beta 版本標記為 `@latest`）：

```bash
# 1. 登入 npm（如果尚未登入）
npm login

# 2. 修正標籤
npm dist-tag add universal-dev-standards@3.2.0 latest      # 將先前的穩定版恢復為 @latest
npm dist-tag add universal-dev-standards@3.2.1-beta.1 beta # 將 beta 版本標記為 @beta

# 3. 驗證修正
npm view universal-dev-standards dist-tags
# 預期：{ latest: '3.2.0', beta: '3.2.1-beta.1' }
```

### 問題：需要撤回發布

```bash
# 選項 1：棄用該版本
npm deprecate universal-dev-standards@3.2.1-beta.1 "Please use 3.2.1-beta.2 instead"

# 選項 2：取消發布（僅限 72 小時內，請謹慎使用）
npm unpublish universal-dev-standards@3.2.1-beta.1

# 選項 3：發布新的修補版本
npm version 3.2.2
# 然後遵循正常的發布流程
```

---

## CHANGELOG 更新指南

### Beta 發布格式

```markdown
## [Unreleased]

## [3.2.1-beta.1] - 2026-01-02

> ⚠️ **Beta 發布**：這是測試版本。請在穩定版發布前回報任何問題。

### Added
- **CLI**：在 Skills 安裝流程中新增 Plugin Marketplace 支援

### Fixed
- **CLI**：修復 standards registry 中通配符路徑處理導致 404 錯誤
- **CLI**：修復 init/configure/update 指令執行後程式未退出的問題

### Testing
- ✅ 所有 68 個單元測試通過
- ✅ ESLint 檢查通過
```

### 穩定發布格式

```markdown
## [Unreleased]

## [3.2.1] - 2026-01-02

### Added
- **CLI**：在 Skills 安裝流程中新增 Plugin Marketplace 支援
  - 在 Skills 安裝提示中新增「Plugin Marketplace (推薦)」選項
  - CLI 在不嘗試本地安裝的情況下追蹤透過 marketplace 安裝的 Skills
  - `uds check` 指令顯示 marketplace 安裝狀態

### Fixed
- **CLI**：修復下載範本時通配符路徑處理導致 404 錯誤
- **CLI**：修復 init/configure/update 指令執行後程式未退出的問題
```

---

## 發布前準備

在開始發布流程之前，完成以下準備步驟。這些可以使用 `scripts/pre-release.sh` 自動化執行。

### 步驟 1：更新版本號

更新以下**所有**檔案中的版本（共 6 個檔案）：

| 檔案 | 欄位 | 範例 |
|------|------|------|
| `cli/package.json` | `"version"` | `"3.3.0"` |
| `.claude-plugin/plugin.json` | `"version"` | `"3.3.0"` |
| `.claude-plugin/marketplace.json` | `"version"` | `"3.3.0"` |
| `cli/standards-registry.json` | `"version"`（3 處） | `"3.3.0"` |
| `README.md` | `**Version**:` 和 `**Last Updated**:` | `3.3.0`, `2026-01-08` |

**自動化命令：**
```bash
./scripts/pre-release.sh --version 3.3.0
```

### 步驟 2：更新 CHANGELOG.md

1. 在 `[Unreleased]` 下建立新版本區段
2. 整合所有 beta 變更（如果從 beta 發布穩定版）
3. 加入發布日期

**格式：**
```markdown
## [Unreleased]

## [3.3.0] - 2026-01-08

### 新增
- 功能描述...

### 變更
- 變更描述...

### 修復
- 修復描述...
```

### 步驟 3：翻譯同步 (zh-TW)

確保所有 zh-TW 翻譯已同步：

```bash
# 檢查同步狀態
./scripts/check-translation-sync.sh

# 需要更新的檔案：
# - locales/zh-TW/README.md（版本 + 日期）
# - locales/zh-TW/CHANGELOG.md（新版本區段）
# - locales/zh-TW/CLAUDE.md（last_synced 日期）
# - 任何顯示 [NO META] 或 [OUTDATED] 的檔案
```

### 步驟 4：翻譯同步 (zh-CN)

確保所有 zh-CN 翻譯已同步：

```bash
# 檢查同步狀態
./scripts/check-translation-sync.sh zh-CN

# 如果 zh-TW 新增了檔案，同步到 zh-CN：
# 使用 opencc 進行繁體到簡體轉換
uv run --with opencc-python-reimplemented python3 -c "
import opencc
converter = opencc.OpenCC('t2s')
# 轉換檔案...
"

# 需要更新的檔案：
# - locales/zh-CN/README.md（版本 + 日期）
# - locales/zh-CN/CHANGELOG.md（新版本區段）
# - locales/zh-CN/CLAUDE.md（last_synced 日期）
```

### 步驟 5：執行驗證

```bash
# 執行所有測試
cd cli && npm test

# 執行 linting
npm run lint

# 驗證版本一致性
grep -r "3.3.0" cli/package.json .claude-plugin/ cli/standards-registry.json README.md

# 驗證無殘留 beta 版本（用於穩定版發布）
grep -r "beta" cli/package.json .claude-plugin/ cli/standards-registry.json | grep -v node_modules

# 驗證翻譯同步
./scripts/check-translation-sync.sh
./scripts/check-translation-sync.sh zh-CN
```

### 發布前準備腳本

使用自動化腳本進行一致的發布前準備：

```bash
# 完整準備（互動模式）
./scripts/pre-release.sh

# 指定版本
./scripts/pre-release.sh --version 3.3.0

# 跳過翻譯同步（用於 beta 發布）
./scripts/pre-release.sh --version 3.3.0-beta.1 --skip-translations

# 預覽模式（顯示將會變更的內容）
./scripts/pre-release.sh --version 3.3.0 --dry-run
```

---

## 預發布檢查清單

### 建立任何發布之前

- [ ] 所有測試通過（`npm test`）
- [ ] Linting 通過（`npm run lint`）
- [ ] CHANGELOG.md 已更新所有變更
- [ ] Git 工作目錄乾淨（`git status`）

### 版本檔案檢查清單

更新並驗證以下檔案中的版本號：

- [ ] `cli/package.json` - 主要版本來源
- [ ] `.claude-plugin/plugin.json` - 插件版本和技能數量
- [ ] `.claude-plugin/marketplace.json` - Marketplace 版本和技能數量

**僅限穩定版本**（不適用於 beta/alpha/rc）：

- [ ] `README.md` - 標題中的版本號
- [ ] `cli/README.md` - 標題和變更日誌表格中的版本號
- [ ] `cli/standards-registry.json` - 註冊表版本
- [ ] `locales/*/README.md` - 標題中的版本號（所有維護中的語言版本）

### 文件驗證檢查清單

驗證**新變更已加入**且**既有內容正確無誤**：

**Skills 文件：**
- [ ] `skills/README.md` - 技能數量和清單正確
- [ ] `skills/INTEGRATION-GUIDE.md` - 技能數量正確
- [ ] `skills/claude-code/README.md` - 技能清單和安裝說明正確
- [ ] `.claude-plugin/README.md` - 技能數量和清單正確

**專案文件：**
- [ ] `README.md` - 技能數量正確（見「Standards Coverage」區塊）
- [ ] `CLAUDE.md` - 核心標準數量和技能數量正確
- [ ] `MAINTENANCE.md` - 檔案數量和技能表格正確
- [ ] `STANDARDS-MAPPING.md` - 技能矩陣和統計正確

**本地化（所有語言版本）：**

對於每個支援的語言版本（`locales/zh-TW/`、`locales/zh-CN/` 等），驗證對應翻譯正確且已同步：

- [ ] `locales/*/README.md` - 技能數量正確
- [ ] `locales/*/CLAUDE.md` - 核心標準和技能數量正確
- [ ] `locales/*/MAINTENANCE.md` - 檔案數量和技能表格正確
- [ ] `locales/*/STANDARDS-MAPPING.md` - 技能矩陣正確
- [ ] `locales/*/skills/claude-code/README.md` - 技能清單正確
- [ ] `locales/*/adoption/STATIC-DYNAMIC-GUIDE.md` - 技能數量正確

**內容正確性驗證：**
- [ ] 搜尋過時的版本號：`grep -r "X.Y.Z" --include="*.md"`（將 X.Y.Z 替換為前一版本）
- [ ] 搜尋過時的技能數量：`grep -r "N skills" --include="*.md"`（將 N 替換為前一數量）
- [ ] 驗證所有內部連結有效
- [ ] 驗證統計數字和計數在所有檔案中一致

**自動化驗證：**
- [ ] 執行翻譯同步檢查：`./scripts/check-translation-sync.sh`

### Beta 發布之前

- [ ] 預發布檢查清單完成
- [ ] 版本檔案檢查清單完成（僅 beta 版本檔案）
- [ ] 文件驗證檢查清單完成
- [ ] 已知問題已記錄在發布說明中

### 穩定發布之前

- [ ] 預發布檢查清單完成
- [ ] 版本檔案檢查清單完成（所有檔案）
- [ ] 文件驗證檢查清單完成
- [ ] Beta 測試完成（如適用）
- [ ] 所有 beta 回饋已處理
- [ ] 無嚴重或高優先級錯誤
- [ ] 已建立遷移指南（如有破壞性變更）

---

## 版本編號策略

遵循語義化版本：

| 變更類型 | 版本遞增 | 範例 |
|---------|---------|------|
| 破壞性變更 | MAJOR | 2.9.5 → 3.0.0 |
| 新功能（向後相容） | MINOR | 3.1.5 → 3.2.0 |
| 錯誤修正（向後相容） | PATCH | 3.2.0 → 3.2.1 |
| Beta 發布 | 新增 `-beta.N` | 3.2.1 → 3.2.1-beta.1 |
| Alpha 發布 | 新增 `-alpha.N` | 3.3.0 → 3.3.0-alpha.1 |
| 候選發布 | 新增 `-rc.N` | 3.2.1 → 3.2.1-rc.1 |

---

## CI/CD 自動化

### GitHub Actions 工作流程

專案使用 `.github/workflows/publish.yml` 進行自動化發布：

**觸發條件：** 建立 GitHub Release（任何 tag）

**步驟：**
1. Checkout 程式碼
2. 設定 Node.js
3. 安裝相依套件（`npm ci`）
4. 驗證 CLI（`node bin/uds.js --version`）
5. **判斷 npm tag**（自動版本偵測）
6. 使用正確的 tag 發布到 npm

**版本偵測邏輯：**
```bash
VERSION=$(node -p "require('./package.json').version")

if [[ $VERSION =~ -beta\. ]]; then
  TAG=beta
elif [[ $VERSION =~ -alpha\. ]]; then
  TAG=alpha
elif [[ $VERSION =~ -rc\. ]]; then
  TAG=rc
else
  TAG=latest
fi

npm publish --tag $TAG
```

---

## 相關文件

- [語義化版本指南](./semantic-versioning.md)
- [Changelog 格式](./changelog-format.md)
- [MAINTENANCE.md](../../../MAINTENANCE.md) - 工作流程 6：發布新版本
- [.github/workflows/publish.yml](../../../.github/workflows/publish.yml)

---

## AI 助理指南

當被要求協助發布時，AI 助理應該：

1. **識別發布類型：** 詢問這是 beta、alpha、rc 或穩定版
2. **執行預發布檢查：** 測試、linting、git 狀態
3. **更新版本：** 使用 `npm version` 搭配正確格式
4. **更新 CHANGELOG：** 遵循該發布類型的格式
5. **建立 git tag：** 格式 `v{VERSION}`
6. **提醒關於 GitHub Release：** 使用者必須手動建立
7. **發布後驗證：** 檢查 npm dist-tags
8. **絕不手動執行 `npm publish`：** GitHub Actions 會處理

### 互動範例

```
使用者：「我想發布 beta 版本」

AI：
我會協助你準備 beta 版本發布。請確認：

1. 版本號是多少？（例如：3.2.1-beta.1）
2. 主要包含哪些變更？

確認後，我會：
1. 執行測試和檢查
2. 更新版本號和 CHANGELOG
3. 建立 git tag
4. 提供 GitHub Release 建立指示
5. GitHub Actions 會自動發布到 npm 並標記為 @beta
```

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-01-02 | 初始發布流程指南 |

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
