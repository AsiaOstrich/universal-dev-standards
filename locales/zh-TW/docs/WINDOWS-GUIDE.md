---
source: ../../../docs/WINDOWS-GUIDE.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# Windows 開發指南

本指南提供使用和貢獻 Universal Development Standards 的 Windows 特定說明。

---

## 先決條件

### 必要

- **Node.js** >= 18.0.0 ([下載](https://nodejs.org/))
- **Git for Windows** ([下載](https://git-scm.com/download/win))
  - 包含 Git Bash 用於執行 shell 腳本

### 推薦

- **Windows Terminal** - 更好的終端體驗
- **Visual Studio Code** - 跨平台編輯器
- **PowerShell 7+** - 現代 PowerShell ([下載](https://github.com/PowerShell/PowerShell))

---

## 安裝選項

### 選項一：npm（推薦）

```powershell
npm install -g universal-dev-standards
uds init
```

### 選項二：本地開發

**PowerShell：**
```powershell
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards\cli
npm install
npm link
```

**Git Bash：**
```bash
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards/cli
npm install
npm link
```

---

## 安裝 Claude Code Skills

**PowerShell：**
```powershell
cd universal-dev-standards\skills\claude-code
.\install.ps1
```

**Git Bash：**
```bash
cd universal-dev-standards/skills/claude-code
./install.sh
```

Skills 會安裝到：`%USERPROFILE%\.claude\skills\`

---

## 翻譯同步檢查

**PowerShell：**
```powershell
.\scripts\check-translation-sync.ps1

# 帶區域參數
.\scripts\check-translation-sync.ps1 -Locale zh-TW
```

**Git Bash：**
```bash
./scripts/check-translation-sync.sh

# 帶區域參數
./scripts/check-translation-sync.sh zh-TW
```

---

## Git 鉤子

Git 鉤子使用 Husky 設定，透過 Git Bash（包含在 Git for Windows 中）自動運作。不需要額外設定。

當您在 `cli/` 目錄執行 `npm install` 時，Husky 會自動設定 pre-commit 鉤子。

---

## 常見問題與解決方案

### 1. 腳本執行政策

**問題：** 「此系統上已停用腳本執行」

**解決方案：**
```powershell
# 以系統管理員身份執行 PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. 換行符問題

儲存庫包含 `.gitattributes` 自動處理換行符。如果您遇到問題：

```bash
# 在 Git Bash 中
git config core.autocrlf true
git rm --cached -r .
git reset --hard
```

### 3. 路徑長度限制

在 Git 中啟用長路徑：

```bash
git config --system core.longpaths true
```

### 4. PowerShell 版本

- **Windows PowerShell** (v5.1) - 內建於 Windows
- **PowerShell** (v7+) - 跨平台，推薦

本專案的腳本在兩個版本都能運作。

### 5. npm 全域安裝路徑

如果全域安裝後找不到 `uds` 命令：

```powershell
# 檢查 npm 全域 bin 路徑
npm config get prefix

# 如需要，添加到 PATH（替換為您的實際路徑）
$env:PATH += ";C:\Users\YourName\AppData\Roaming\npm"
```

---

## 環境變數

CLI 支援 Unix 和 Windows 環境變數：

| Unix | Windows | 說明 |
|------|---------|------|
| `$HOME` | `$env:USERPROFILE` | 主目錄 |
| `~/.claude/skills/` | `%USERPROFILE%\.claude\skills\` | Skills 位置 |

---

## 開發工作流程

```powershell
# 1. 克隆儲存庫
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards

# 2. 安裝 CLI 依賴
cd cli
npm install

# 3. 執行測試
npm test

# 4. 執行程式碼檢查
npm run lint

# 5. 連結以進行本地測試
npm link

# 6. 測試 CLI 命令
uds list
uds init --help
```

---

## 終端推薦

| 終端 | 最適合 | 備註 |
|------|--------|------|
| **Windows Terminal** | 日常使用 | 現代化，可自訂 |
| **Git Bash** | 執行 shell 腳本 | 類 Unix 環境 |
| **PowerShell 7** | Windows 腳本 | 跨平台 |
| **VS Code Terminal** | 開發 | 整合體驗 |

---

## 相關文件

- [主 README](../../README.md) - 專案概述
- [CLI README](../../cli/README.md) - CLI 文件
- [採用指南](../adoption/ADOPTION-GUIDE.md) - 完整採用指南

---

**需要協助？** 在 [GitHub Issues](https://github.com/AsiaOstrich/universal-dev-standards/issues) 開啟 issue
