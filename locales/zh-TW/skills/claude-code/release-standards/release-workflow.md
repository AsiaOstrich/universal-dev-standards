---
source: ../../../../../skills/claude-code/release-standards/release-workflow.md
source_version: 2.2.0
translation_version: 2.2.0
last_synced: 2026-01-26
status: current
---

# 發布流程指南

> **Language**: [English](../../../../../skills/claude-code/release-standards/release-workflow.md) | 繁體中文

**版本**: 2.2.0
**最後更新**: 2026-01-26
**適用範圍**: 所有使用語義化版本的軟體專案

---

## 目的

本文件提供適用於任何軟體專案的通用發布流程指南。涵蓋版本管理、發布類型和標準發布流程。

> **注意**：專案特有配置（額外的版本檔案、翻譯同步、自訂驗證腳本）請在專案的 `CLAUDE.md` 檔案中定義。

---

## 發布類型

### 1. Beta 發布（測試版本）

**使用時機：**
- 在穩定版發布前測試新功能
- 向早期採用者收集回饋
- 在生產環境前驗證錯誤修正

**版本模式：** `X.Y.Z-beta.N`（例如：`3.2.1-beta.1`）

**npm 標籤：** `@beta`

---

### 2. 穩定發布（正式版本）

**使用時機：**
- 所有功能已測試並驗證
- 準備好用於生產環境
- 所有測試通過

**版本模式：** `X.Y.Z`（例如：`3.2.1`）

**npm 標籤：** `@latest`

---

### 3. Alpha 發布（早期測試）

**使用時機：**
- 非常早期的測試，功能不穩定
- 僅限內部團隊測試

**版本模式：** `X.Y.Z-alpha.N`（例如：`3.3.0-alpha.1`）

**npm 標籤：** `@alpha`

---

### 4. 候選發布（預發布）

**使用時機：**
- 穩定版發布前的最終測試
- 不包含新功能，僅錯誤修正

**版本模式：** `X.Y.Z-rc.N`（例如：`3.2.1-rc.1`）

**npm 標籤：** `@rc`

---

## 標準發布流程

> **流程理念**：Alpha 用於內部測試，Beta 用於公開發布。確保每個階段都經過充分驗證。

```
┌─────────────────────────────────────────────────────────────────┐
│  Alpha（內部）  →  Beta（公開）  →  Stable（正式）              │
│  X.Y.Z-alpha.N     X.Y.Z-beta.N     X.Y.Z                       │
└─────────────────────────────────────────────────────────────────┘
```

---

### 階段 A：Alpha 發布（內部測試）

#### 步驟 1：準備發布分支

```bash
# 確保在 main 分支並已更新
git checkout main
git pull origin main

# 檢查 git 狀態（應為乾淨狀態）
git status
```

#### 步驟 2：更新為 Alpha 版本

```bash
# npm 專案
npm version X.Y.Z-alpha.1 --no-git-tag-version

# 其他專案，手動更新版本檔案
# 更新所有專案特定的版本檔案（請參考 CLAUDE.md）
```

#### 步驟 3：更新 CHANGELOG

```markdown
## [X.Y.Z-alpha.1] - YYYY-MM-DD

> ⚠️ **Alpha 發布**：僅供內部測試。

### Added
- 新功能描述

### Changed
- 變更描述
```

#### 步驟 4：執行所有測試

```bash
# 執行自動化測試
npm test  # 或專案的測試指令

# 執行程式碼檢查
npm run lint  # 或專案的 lint 指令

# 執行預發布檢查（如有）
./scripts/pre-release-check.sh  # 或 .\scripts\pre-release-check.ps1
```

#### 步驟 5：內部驗證

繼續前請手動驗證：

- [ ] **建置驗證**：應用程式成功建置
- [ ] **冒煙測試**：核心功能如預期運作
- [ ] **版本顯示**：版本顯示 `X.Y.Z-alpha.N`
- [ ] **已知問題**：已記錄供團隊參考

> ⚠️ **若任何驗證失敗，請在此停止。** 修復問題並遞增 alpha 版號（alpha.2, alpha.3...）。

#### 步驟 6：提交 Alpha（可選：僅本地）

```bash
# 提交變更（可僅供內部測試使用本地）
git add .
git commit -m "chore(release): X.Y.Z-alpha.1"

# 可選：推送以進行 CI/CD 測試
git push origin main
```

---

### 階段 B：Beta 發布（公開測試）

#### 步驟 7：將 Alpha 升級為 Beta

內部測試通過後：

```bash
# 將版本從 alpha 更新為 beta
npm version X.Y.Z-beta.1 --no-git-tag-version

# 更新所有專案特定的版本檔案
```

#### 步驟 8：更新 Beta 的 CHANGELOG

```markdown
## [X.Y.Z-beta.1] - YYYY-MM-DD

> ⚠️ **Beta 發布**：用於測試。使用 `npm install <package>@beta` 安裝

### Added
- 新功能描述

### Fixed
- Alpha 測試期間發現的問題
```

#### 步驟 9：最終驗證

- [ ] 所有 alpha 問題已解決
- [ ] 版本顯示 `X.Y.Z-beta.1`
- [ ] CHANGELOG 已更新 beta 說明

#### 步驟 10：提交並標籤 Beta

```bash
# 提交變更
git add .
git commit -m "chore(release): X.Y.Z-beta.1"

# 建立並推送標籤
git tag vX.Y.Z-beta.1
git push origin main --tags
```

#### 步驟 11：建立 Beta Release

建立 GitHub/GitLab Release：
- Tag：`vX.Y.Z-beta.1`
- 標題：`vX.Y.Z-beta.1 - [Release Name]`
- ✅ 標記為 **pre-release**
- 從 CHANGELOG 加入發布說明

#### 步驟 12：驗證 Beta 發布

```bash
# npm 套件
npm view <package-name> dist-tags
# 應顯示：beta: X.Y.Z-beta.1

# 測試安裝
npm install -g <package-name>@beta

# 驗證版本
<command> --version  # 應顯示 X.Y.Z-beta.1
```

---

### 階段 C：Stable 發布（正式版）

Beta 測試完成後，依照相同模式：
1. 更新版本為 `X.Y.Z`（移除 `-beta.N`）
2. 更新 CHANGELOG（移除 beta 警告）
3. 提交、標籤、推送
4. 建立 GitHub release（不標記為 pre-release）
5. 驗證 npm 上的 `@latest` 標籤

---

### 驗證發布

```bash
# npm 套件
npm view <package-name> dist-tags

# 測試安裝
npm install -g <package-name>@<version>
```

---

## npm dist-tag 策略

| 版本模式 | npm Tag | 安裝指令 |
|---------|---------|---------|
| `X.Y.Z` | `latest` | `npm install <package>` |
| `X.Y.Z-beta.N` | `beta` | `npm install <package>@beta` |
| `X.Y.Z-alpha.N` | `alpha` | `npm install <package>@alpha` |
| `X.Y.Z-rc.N` | `rc` | `npm install <package>@rc` |

### 自動標籤偵測

用於 CI/CD 自動化，使用正則表達式偵測版本類型：

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

## CHANGELOG 格式

### Beta 發布格式

```markdown
## [X.Y.Z-beta.N] - YYYY-MM-DD

> ⚠️ **Beta 發布**：這是測試版本。

### Added
- 功能描述

### Fixed
- 錯誤修正描述
```

### 穩定發布格式

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- 功能描述及詳情

### Changed
- 變更描述

### Fixed
- 錯誤修正描述
```

---

## 版本編號策略

遵循[語義化版本](https://semver.org/)：

| 變更類型 | 版本遞增 | 範例 |
|---------|---------|------|
| 破壞性變更 | MAJOR | 2.9.5 → 3.0.0 |
| 新功能（向後相容） | MINOR | 3.1.5 → 3.2.0 |
| 錯誤修正（向後相容） | PATCH | 3.2.0 → 3.2.1 |
| 預發布 | 新增後綴 | 3.2.1 → 3.2.1-beta.1 |

---

## 疑難排解

### npm Tag 錯誤

如果使用錯誤的標籤發布：

```bash
npm dist-tag add <package>@<version> <correct-tag>
```

### 需要撤回發布

```bash
# 選項 1：棄用
npm deprecate <package>@<version> "Please use <new-version> instead"

# 選項 2：取消發布（僅限 72 小時內）
npm unpublish <package>@<version>

# 選項 3：發布修補版本
npm version patch
```

---

## 預發布檢查清單

### Alpha 發布前（內部）

- [ ] 在正確的分支（main）
- [ ] Git 工作目錄乾淨
- [ ] 版本已更新為 `X.Y.Z-alpha.N`
- [ ] 所有測試通過
- [ ] Linting 通過
- [ ] 建置成功
- [ ] 核心功能運作正常（冒煙測試）

### Beta 發布前（公開）

- [ ] Alpha 測試完成
- [ ] 所有 alpha 問題已解決
- [ ] 版本已更新為 `X.Y.Z-beta.N`
- [ ] CHANGELOG 已更新 beta 說明
- [ ] 已知問題已記錄
- [ ] 預發布檢查腳本通過

### 穩定發布前（正式版）

- [ ] Beta 測試完成
- [ ] 所有 beta 回饋已處理
- [ ] 無嚴重錯誤
- [ ] 版本已更新為 `X.Y.Z`
- [ ] CHANGELOG 已完成（移除 beta 警告）
- [ ] 已建立遷移指南（如有破壞性變更）

---

## 專案特有配置

專案特有的發布需求請在 `CLAUDE.md` 中定義：

```markdown
## Release Process (Project-Specific)

### Additional Version Files
- `path/to/file1.json` - description
- `path/to/file2.json` - description

### Pre-release Scripts
# macOS / Linux
./scripts/your-pre-release-check.sh

# Windows PowerShell
.\scripts\your-pre-release-check.ps1

### Additional Verification
- Custom verification step 1
- Custom verification step 2
```

這讓 AI 助手在執行 `/release` 指令時自動套用專案特有規則。

---

## AI 助理指南

協助發布時：

1. **識別發布類型：** 詢問是 beta、alpha、rc 或穩定版
2. **執行預發布檢查：** 測試、linting、git 狀態
3. **檢查專案特有規則：** 閱讀 `CLAUDE.md` 取得額外需求
4. **更新版本：** 使用適當的版本指令
5. **更新 CHANGELOG：** 遵循標準格式
6. **建立 git tag：** 格式 `v{VERSION}`
7. **建立 release：** GitHub/GitLab release
8. **驗證發布：** 檢查 dist-tags 並測試安裝

---

## 相關文件

- [語義化版本指南](./semantic-versioning.md)
- [Changelog 格式](./changelog-format.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 2.2.0 | 2026-01-26 | 新增 Alpha→Beta→Stable 三階段工作流程模式 |
| 2.1.0 | 2026-01-26 | 採用「版號優先」流程：更新版號 → 測試 → 驗證 → 發布 |
| 2.0.0 | 2026-01-14 | 重構為通用指南，專案特有內容移至 CLAUDE.md |
| 1.0.0 | 2026-01-02 | 初始發布流程指南 |

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
