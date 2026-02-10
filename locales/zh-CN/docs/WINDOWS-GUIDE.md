---
source: ../../../docs/WINDOWS-GUIDE.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# Windows 开发指南

本指南提供使用和贡献 Universal Development Standards 的 Windows 特定说明。

---

## 先决条件

### 必要

- **Node.js** >= 18.0.0 ([下载](https://nodejs.org/))
- **Git for Windows** ([下载](https://git-scm.com/download/win))
  - 包含 Git Bash 用于执行 shell 脚本

### 推荐

- **Windows Terminal** - 更好的终端体验
- **Visual Studio Code** - 跨平台编辑器
- **PowerShell 7+** - 现代 PowerShell ([下载](https://github.com/PowerShell/PowerShell))

---

## 安装选项

### 选项一：npm（推荐）

```powershell
npm install -g universal-dev-standards
uds init
```

### 选项二：本地开发

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

## 安装 Claude Code Skills

**推荐：Plugin Marketplace**
```bash
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

**替代方案：手动复制（PowerShell）**
```powershell
New-Item -ItemType Directory -Force -Path $env:USERPROFILE\.claude\skills
Copy-Item -Recurse skills\claude-code\commit-standards $env:USERPROFILE\.claude\skills\
```

Skills 会安装到：`%USERPROFILE%\.claude\skills\`

---

## 翻译同步检查

**PowerShell：**
```powershell
.\scripts\check-translation-sync.ps1

# 带区域参数
.\scripts\check-translation-sync.ps1 -Locale zh-TW
```

**Git Bash：**
```bash
./scripts/check-translation-sync.sh

# 带区域参数
./scripts/check-translation-sync.sh zh-TW
```

---

## Git 钩子

Git 钩子使用 Husky 设定，透过 Git Bash（包含在 Git for Windows 中）自动运作。不需要额外设定。

当您在 `cli/` 目录执行 `npm install` 时，Husky 会自动设定 pre-commit 钩子。

---

## 常见问题与解决方案

### 1. 脚本执行政策

**问题：** 「此系统上已停用脚本执行」

**解决方案：**
```powershell
# 以系统管理员身份执行 PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. 换行符问题

储存库包含 `.gitattributes` 自动处理换行符。如果您遇到问题：

```bash
# 在 Git Bash 中
git config core.autocrlf true
git rm --cached -r .
git reset --hard
```

### 3. 路径长度限制

在 Git 中启用长路径：

```bash
git config --system core.longpaths true
```

### 4. PowerShell 版本

- **Windows PowerShell** (v5.1) - 内建于 Windows
- **PowerShell** (v7+) - 跨平台，推荐

本专案的脚本在两个版本都能运作。

### 5. npm 全域安装路径

如果全域安装后找不到 `uds` 命令：

```powershell
# 检查 npm 全域 bin 路径
npm config get prefix

# 如需要，添加到 PATH（替换为您的实际路径）
$env:PATH += ";C:\Users\YourName\AppData\Roaming\npm"
```

---

## 环境变数

CLI 支援 Unix 和 Windows 环境变数：

| Unix | Windows | 说明 |
|------|---------|------|
| `$HOME` | `$env:USERPROFILE` | 主目录 |
| `~/.claude/skills/` | `%USERPROFILE%\.claude\skills\` | Skills 位置 |

---

## 开发工作流程

```powershell
# 1. 克隆储存库
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards

# 2. 安装 CLI 依赖
cd cli
npm install

# 3. 执行测试
npm test

# 4. 执行程序码检查
npm run lint

# 5. 连结以进行本地测试
npm link

# 6. 测试 CLI 命令
uds list
uds init --help
```

---

## 终端推荐

| 终端 | 最适合 | 备注 |
|------|--------|------|
| **Windows Terminal** | 日常使用 | 现代化，可自订 |
| **Git Bash** | 执行 shell 脚本 | 类 Unix 环境 |
| **PowerShell 7** | Windows 脚本 | 跨平台 |
| **VS Code Terminal** | 开发 | 集成体验 |

---

## 相关文件

- [主 README](../../README.md) - 专案概述
- [CLI README](../../../cli/README.md) - CLI 文件
- [采用指南](../adoption/ADOPTION-GUIDE.md) - 完整采用指南

---

**需要协助？** 在 [GitHub Issues](https://github.com/AsiaOstrich/universal-dev-standards/issues) 开启 issue
