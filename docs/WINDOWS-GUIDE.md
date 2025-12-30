# Windows Development Guide
# Windows 開發指南

This guide provides Windows-specific instructions for using and contributing to Universal Development Standards.

本指南提供使用和貢獻 Universal Development Standards 的 Windows 特定說明。

---

## Prerequisites | 先決條件

### Required | 必要

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **Git for Windows** ([Download](https://git-scm.com/download/win))
  - Includes Git Bash for running shell scripts
  - 包含 Git Bash 用於執行 shell 腳本

### Recommended | 推薦

- **Windows Terminal** - Better terminal experience | 更好的終端體驗
- **Visual Studio Code** - Cross-platform editor | 跨平台編輯器
- **PowerShell 7+** - Modern PowerShell | 現代 PowerShell ([Download](https://github.com/PowerShell/PowerShell))

---

## Installation Options | 安裝選項

### Option 1: npm (Recommended) | 選項一：npm（推薦）

```powershell
npm install -g universal-dev-standards
uds init
```

### Option 2: Local Development | 選項二：本地開發

**PowerShell:**
```powershell
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards\cli
npm install
npm link
```

**Git Bash:**
```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards/cli
npm install
npm link
```

---

## Installing Claude Code Skills | 安裝 Claude Code Skills

**PowerShell:**
```powershell
cd universal-dev-standards\skills\claude-code
.\install.ps1
```

**Git Bash:**
```bash
cd universal-dev-standards/skills/claude-code
./install.sh
```

Skills will be installed to: `%USERPROFILE%\.claude\skills\`

Skills 會安裝到：`%USERPROFILE%\.claude\skills\`

---

## Translation Sync Check | 翻譯同步檢查

**PowerShell:**
```powershell
.\scripts\check-translation-sync.ps1

# With locale parameter | 帶區域參數
.\scripts\check-translation-sync.ps1 -Locale zh-TW
```

**Git Bash:**
```bash
./scripts/check-translation-sync.sh

# With locale parameter | 帶區域參數
./scripts/check-translation-sync.sh zh-TW
```

---

## Git Hooks | Git 鉤子

Git hooks are configured using Husky and work automatically through Git Bash (included with Git for Windows). No additional setup required.

Git 鉤子使用 Husky 設定，透過 Git Bash（包含在 Git for Windows 中）自動運作。不需要額外設定。

When you run `npm install` in the `cli/` directory, Husky will automatically set up the pre-commit hooks.

當您在 `cli/` 目錄執行 `npm install` 時，Husky 會自動設定 pre-commit 鉤子。

---

## Common Issues & Solutions | 常見問題與解決方案

### 1. Script Execution Policy | 腳本執行政策

**Problem:** "Execution of scripts is disabled on this system"

**問題：** 「此系統上已停用腳本執行」

**Solution | 解決方案:**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Line Ending Issues | 換行符問題

The repository includes `.gitattributes` to handle line endings automatically. If you encounter issues:

儲存庫包含 `.gitattributes` 自動處理換行符。如果您遇到問題：

```bash
# In Git Bash
git config core.autocrlf true
git rm --cached -r .
git reset --hard
```

### 3. Path Length Limitations | 路徑長度限制

Enable long paths in Git:

在 Git 中啟用長路徑：

```bash
git config --system core.longpaths true
```

### 4. PowerShell vs Windows PowerShell | PowerShell 版本

- **Windows PowerShell** (v5.1) - Built into Windows | 內建於 Windows
- **PowerShell** (v7+) - Cross-platform, recommended | 跨平台，推薦

The scripts in this project work with both versions.

本專案的腳本在兩個版本都能運作。

### 5. npm Global Installation Path | npm 全域安裝路徑

If `uds` command is not found after global installation:

如果全域安裝後找不到 `uds` 命令：

```powershell
# Check npm global bin path
npm config get prefix

# Add to PATH if needed (replace with your actual path)
$env:PATH += ";C:\Users\YourName\AppData\Roaming\npm"
```

---

## Environment Variables | 環境變數

The CLI supports both Unix and Windows environment variables:

CLI 支援 Unix 和 Windows 環境變數：

| Unix | Windows | Description |
|------|---------|-------------|
| `$HOME` | `$env:USERPROFILE` | Home directory | 主目錄 |
| `~/.claude/skills/` | `%USERPROFILE%\.claude\skills\` | Skills location | Skills 位置 |

---

## Development Workflow | 開發工作流程

```powershell
# 1. Clone repository | 克隆儲存庫
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards

# 2. Install CLI dependencies | 安裝 CLI 依賴
cd cli
npm install

# 3. Run tests | 執行測試
npm test

# 4. Run linting | 執行程式碼檢查
npm run lint

# 5. Link for local testing | 連結以進行本地測試
npm link

# 6. Test CLI commands | 測試 CLI 命令
uds list
uds init --help
```

---

## Terminal Recommendations | 終端推薦

| Terminal | Best For | Notes |
|----------|----------|-------|
| **Windows Terminal** | Daily use | Modern, customizable | 現代化，可自訂 |
| **Git Bash** | Running shell scripts | Unix-like environment | 類 Unix 環境 |
| **PowerShell 7** | Windows scripting | Cross-platform | 跨平台 |
| **VS Code Terminal** | Development | Integrated experience | 整合體驗 |

---

## Related Documentation | 相關文件

- [Main README](../README.md) - Project overview | 專案概述
- [CLI README](../cli/README.md) - CLI documentation | CLI 文件
- [Adoption Guide](../adoption/ADOPTION-GUIDE.md) - Complete adoption guidance | 完整採用指南

---

**Need help?** Open an issue at [GitHub Issues](https://github.com/AsiaOstrich/universal-dev-standards/issues)

**需要協助？** 在 [GitHub Issues](https://github.com/AsiaOstrich/universal-dev-standards/issues) 開啟 issue
