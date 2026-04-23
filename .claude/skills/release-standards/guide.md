---
source: ../../../../skills/release-standards/SKILL.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-04-23
status: current
description: |
  語意化版本控制和變更日誌格式化的軟體發布標準。
  使用時機：準備發布、更新版本號、撰寫變更日誌。
  關鍵字：version, release, changelog, semver, major, minor, patch, 版本, 發布, 變更日誌。
---

# 發布標準

> **語言**: [English](../../../../skills/release-standards/SKILL.md) | 繁體中文

**版本**: 1.1.0
**最後更新**: 2026-01-02
**適用範圍**: Claude Code Skills

---

## 目的

本技能提供語意化版本控制和變更日誌格式化標準。

## 快速參考

### 語意化版本格式

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]

Examples:
2.3.1
1.0.0-alpha.1
3.2.0-beta.2+20250112
```

### 版本遞增規則

| 組成部分 | 何時遞增 | 範例 |
|-----------|-------------------|----------|
| **MAJOR** | 重大變更 | 1.9.5 → 2.0.0 |
| **MINOR** | 新功能（向後相容） | 2.3.5 → 2.4.0 |
| **PATCH** | 錯誤修復（向後相容） | 3.1.2 → 3.1.3 |

### 預發布識別符

| 識別符 | 穩定性 | 目標受眾 |
|------------|-----------|----------|
| `alpha` | 不穩定 | 內部團隊 |
| `beta` | 大致穩定 | 早期採用者 |
| `rc` | 穩定 | Beta 測試者 |

### CHANGELOG 分類

| 分類 | 用途 |
|----------|-------|
| **Added** | 新功能 |
| **Changed** | 現有功能的變更 |
| **Deprecated** | 即將移除的功能 |
| **Removed** | 已移除的功能 |
| **Fixed** | 錯誤修復 |
| **Security** | 安全性漏洞修復 |

## 詳細指南

完整標準請參閱：
- [語意化版本控制指南](./semantic-versioning.md)
- [變更日誌格式](./changelog-format.md)
- [發布流程指南](./release-workflow.md) - 本專案完整發布流程

## CHANGELOG 條目格式

```markdown
## [VERSION] - YYYY-MM-DD

### Added
- Add user dashboard with customizable widgets (#123)

### Changed
- **BREAKING**: Change API response format from XML to JSON

### Fixed
- Fix memory leak when processing large files (#456)

### Security
- Fix SQL injection vulnerability (CVE-2025-12345)
```

## 重大變更

使用 **BREAKING** 前綴標記重大變更：

```markdown
### Changed
- **BREAKING**: Remove deprecated `getUserById()`, use `getUser()` instead
```

## Git 標籤

```bash
# Create annotated tag (recommended)
git tag -a v1.2.0 -m "Release version 1.2.0"

# Push tag to remote
git push origin v1.2.0
```

## 版本排序

```
1.0.0-alpha.1 < 1.0.0-alpha.2 < 1.0.0-beta.1 < 1.0.0-rc.1 < 1.0.0
```

---

## 配置檢測

本技能支援專案特定配置。

### 檢測順序

1. 檢查 `CONTRIBUTING.md` 中的「Disabled Skills」段落
   - 如果列出此技能，則該專案停用此技能
2. 檢查 `CONTRIBUTING.md` 中的「Release Standards」段落
3. 如果未找到，**預設使用語意化版本控制和 Keep a Changelog 格式**

### 首次設定

如果未找到配置且上下文不明確：

1. 詢問使用者：「此專案尚未配置發布標準。您想使用語意化版本控制嗎？」
2. 使用者選擇後，建議在 `CONTRIBUTING.md` 中記錄：

```markdown
## Release Standards

### Versioning
This project uses **Semantic Versioning** (MAJOR.MINOR.PATCH).

### Changelog
This project follows **Keep a Changelog** format.
```

### 配置範例

在專案的 `CONTRIBUTING.md` 中：

```markdown
## Release Standards

### Versioning
This project uses **Semantic Versioning** (MAJOR.MINOR.PATCH).

### Changelog
This project follows **Keep a Changelog** format.

### Release Process
1. Update version in package.json
2. Update CHANGELOG.md
3. Create git tag with `v` prefix (e.g., v1.2.0)
4. Push tag to trigger release workflow
```

---

## 相關標準

- [版本控制](../../core/versioning.md)
- [變更日誌標準](../../core/changelog-standards.md)
- [Git 工作流程](../../core/git-workflow.md)

---

---

## 打包指引（`/release package`）

在建立 GitHub Release（Step 6）之前，使用 `/release package` 引導完成打包。

### 設計原則

Skill 採用**知識層**模式：輸出命令清單，不自動執行。打包涉及本地憑證與工具鏈，Skill 無法保證環境正確；使用者複製命令後自行執行，確保可控。

---

### 技術棧自動偵測邏輯

執行 `/release package` 時，Skill 依以下優先序讀取專案檔案識別技術棧：

| 偵測順序 | 偵測條件 | 識別結果 |
|---------|---------|---------|
| 1 | `package.json` 含 `electron` 相依 | Electron 應用 |
| 2 | `package.json` 含 `pkg` 或 `nexe` 相依 | Node.js CLI |
| 3 | `package.json`（無以上相依） | npm 套件 |
| 4 | `Cargo.toml` 存在 | Rust / Cargo |
| 5 | `pyproject.toml` 或 `setup.py` 存在 | Python 套件 |
| 6 | `go.mod` 存在 | Go CLI |
| 7 | 以上皆無 | 請使用者手動指定 |

---

### Wave 1 技術棧打包指引

#### Electron 應用

**環境準備：**

| 平台 | 必要環境變數 / 工具 |
|------|-------------------|
| macOS | `APPLE_ID`、`APPLE_APP_SPECIFIC_PASSWORD`、`APPLE_TEAM_ID`（Notarization 用）|
| Windows | 程式碼簽章憑證（`.pfx` 或 HSM），`CSC_LINK`、`CSC_KEY_PASSWORD` |
| Linux | 無額外憑證需求 |

**打包命令（以 electron-builder 為例）：**

```bash
# 確認 electron-builder 已安裝
npx electron-builder --version

# 打包所有平台（需在 CI 或各平台本地執行）
npx electron-builder --mac --win --linux

# 僅打包 macOS
npx electron-builder --mac

# 僅打包特定格式
npx electron-builder --mac dmg
npx electron-builder --win nsis
npx electron-builder --linux AppImage deb
```

**Artifacts 驗證：**

```bash
ls -la dist/
# 預期輸出：*.dmg / *.exe / *.AppImage / *.deb

sha256sum dist/*.dmg dist/*.exe dist/*.AppImage > dist/checksums.txt
cat dist/checksums.txt
```

---

#### Go CLI

**環境準備：**

```bash
# 確認 Go 環境
go version

# 安裝 goreleaser（可選，建議用於多平台）
go install github.com/goreleaser/goreleaser/v2@latest
```

**打包命令：**

```bash
# 方法 1：手動 cross-compile（無額外工具）
GOOS=darwin  GOARCH=amd64 go build -o dist/myapp-darwin-amd64  .
GOOS=darwin  GOARCH=arm64 go build -o dist/myapp-darwin-arm64  .
GOOS=linux   GOARCH=amd64 go build -o dist/myapp-linux-amd64   .
GOOS=linux   GOARCH=arm64 go build -o dist/myapp-linux-arm64   .
GOOS=windows GOARCH=amd64 go build -o dist/myapp-windows-amd64.exe .

# 方法 2：goreleaser（自動 matrix + 打包 tar.gz）
goreleaser release --clean
# 或先測試
goreleaser release --snapshot --clean
```

**Artifacts 驗證：**

```bash
ls -la dist/
sha256sum dist/myapp-* > dist/checksums.txt
```

---

#### Python CLI

**環境準備：**

```bash
# 方法 1：PyInstaller（產出單一執行檔）
pip install pyinstaller

# 方法 2：poetry build（產出 wheel + sdist，適合 PyPI 發布）
pip install poetry
```

**打包命令：**

```bash
# PyInstaller — 打包成單一執行檔
pyinstaller --onefile --name myapp src/main.py

# 或使用 spec 檔（若已有 myapp.spec）
pyinstaller myapp.spec

# poetry — 打包 wheel + sdist
poetry build
# 產出：dist/myapp-X.Y.Z.tar.gz  dist/myapp-X.Y.Z-py3-none-any.whl

# 發布到 PyPI
twine upload dist/*
# 或先測試
twine upload --repository testpypi dist/*
```

**Artifacts 驗證：**

```bash
ls -la dist/
sha256sum dist/* > dist/checksums.txt
```

---

#### npm 套件

**環境準備：**

```bash
# 確認 npm 登入狀態
npm whoami

# 確認 2FA 設定（若啟用需準備 OTP）
npm profile get
```

**打包命令：**

```bash
# 先 dry-run 確認內容
npm pack --dry-run

# 實際打包（產出 .tgz）
npm pack

# 正式發布
npm publish                    # 穩定版（@latest）
npm publish --tag beta         # Beta 版
npm publish --tag alpha        # Alpha 版

# 2FA 啟用時
npm publish --otp=XXXXXX
```

**發布驗證：**

```bash
npm view <package-name> dist-tags
npm view <package-name> version
```

---

### 通用 Checksums 與 GitHub Release 上傳

打包完成後，上傳 artifacts 至 GitHub Release：

```bash
# 生成 checksums（含所有 artifacts）
sha256sum dist/* > dist/checksums.txt

# 上傳至 GitHub Release（需先完成 Step 5 建立 tag）
gh release upload vX.Y.Z dist/myapp-darwin-amd64 dist/myapp-linux-amd64
gh release upload vX.Y.Z dist/checksums.txt
```

---

## 版本歷史

| 版本 | 日期 | 變更內容 |
|---------|------|---------|
| 1.2.0 | 2026-04-23 | 新增：打包指引章節（/release package，Wave 1 四個技術棧）|
| 1.1.0 | 2026-01-02 | 新增：發布流程指南，包含完整發布流程 |
| 1.0.0 | 2025-12-24 | 新增：標準段落（目的、相關標準、版本歷史、授權條款） |

---

## 授權條款

本技能依據 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
