# Windows Development Guide

> **Language**: English | [繁體中文](../locales/zh-TW/docs/WINDOWS-GUIDE.md) | [简体中文](../locales/zh-CN/docs/WINDOWS-GUIDE.md)

This guide provides Windows-specific instructions for using and contributing to Universal Development Standards.

---

## Prerequisites

### Required

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **Git for Windows** ([Download](https://git-scm.com/download/win))
  - Includes Git Bash for running shell scripts

### Recommended

- **Windows Terminal** - Better terminal experience
- **Visual Studio Code** - Cross-platform editor
- **PowerShell 7+** - Modern PowerShell ([Download](https://github.com/PowerShell/PowerShell))

---

## Installation Options

### Option 1: npm (Recommended)

```powershell
npm install -g universal-dev-standards
uds init
```

### Option 2: Local Development

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

## Installing Claude Code Skills

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

---

## Translation Sync Check

**PowerShell:**
```powershell
.\scripts\check-translation-sync.ps1

# With locale parameter
.\scripts\check-translation-sync.ps1 -Locale zh-TW
```

**Git Bash:**
```bash
./scripts/check-translation-sync.sh

# With locale parameter
./scripts/check-translation-sync.sh zh-TW
```

---

## Git Hooks

Git hooks are configured using Husky and work automatically through Git Bash (included with Git for Windows). No additional setup required.

When you run `npm install` in the `cli/` directory, Husky will automatically set up the pre-commit hooks.

---

## Common Issues & Solutions

### 1. Script Execution Policy

**Problem:** "Execution of scripts is disabled on this system"

**Solution:**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Line Ending Issues

The repository includes `.gitattributes` to handle line endings automatically. If you encounter issues:

```bash
# In Git Bash
git config core.autocrlf true
git rm --cached -r .
git reset --hard
```

### 3. Path Length Limitations

Enable long paths in Git:

```bash
git config --system core.longpaths true
```

### 4. PowerShell Versions

- **Windows PowerShell** (v5.1) - Built into Windows
- **PowerShell** (v7+) - Cross-platform, recommended

The scripts in this project work with both versions.

### 5. npm Global Installation Path

If `uds` command is not found after global installation:

```powershell
# Check npm global bin path
npm config get prefix

# Add to PATH if needed (replace with your actual path)
$env:PATH += ";C:\Users\YourName\AppData\Roaming\npm"
```

---

## Environment Variables

The CLI supports both Unix and Windows environment variables:

| Unix | Windows | Description |
|------|---------|-------------|
| `$HOME` | `$env:USERPROFILE` | Home directory |
| `~/.claude/skills/` | `%USERPROFILE%\.claude\skills\` | Skills location |

---

## Development Workflow

```powershell
# 1. Clone repository
git clone https://github.com/AsiaOstrich/universal-dev-standards.git
cd universal-dev-standards

# 2. Install CLI dependencies
cd cli
npm install

# 3. Run tests
npm test

# 4. Run linting
npm run lint

# 5. Link for local testing
npm link

# 6. Test CLI commands
uds list
uds init --help
```

---

## Terminal Recommendations

| Terminal | Best For | Notes |
|----------|----------|-------|
| **Windows Terminal** | Daily use | Modern, customizable |
| **Git Bash** | Running shell scripts | Unix-like environment |
| **PowerShell 7** | Windows scripting | Cross-platform |
| **VS Code Terminal** | Development | Integrated experience |

---

## Related Documentation

- [Main README](../README.md) - Project overview
- [CLI README](../cli/README.md) - CLI documentation
- [Adoption Guide](../adoption/ADOPTION-GUIDE.md) - Complete adoption guidance

---

**Need help?** Open an issue at [GitHub Issues](https://github.com/AsiaOstrich/universal-dev-standards/issues)
