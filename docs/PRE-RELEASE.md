# Pre-release Versions | 預發布版本

> **Language**: English | [繁體中文](../locales/zh-TW/README.md) | [简体中文](../locales/zh-CN/README.md)

This document covers installing and using pre-release versions of UDS (Beta, RC, Alpha).

本文件說明如何安裝和使用 UDS 的預發布版本（Beta、RC、Alpha）。

---

## Installation | 安裝方式

```bash
# Install the latest RC (Release Candidate)
npm install -g universal-dev-standards@rc

# Install the latest Beta
npm install -g universal-dev-standards@beta

# Install the latest Alpha (internal testing)
npm install -g universal-dev-standards@alpha
```

### Version Tags | 版本標籤

| Tag | Purpose | Stability | 說明 |
| :--- | :--- | :--- | :--- |
| `@latest` | Production release | Stable | 正式穩定版 |
| `@rc` | Release candidate | Near-stable | 候選版本，接近穩定 |
| `@beta` | Public testing | May have issues | 公開測試，可能有問題 |
| `@alpha` | Internal testing | Experimental | 內部測試，實驗性質 |

---

## What's New in 5.0 Beta

| Feature | Description |
| :--- | :--- |
| **32 Core Standards** | 10 new standards including Security, Performance, Accessibility |
| **26 Skills / 30 Commands** | New `/requirement`, `/security`, `/perf` commands |
| **Developer Memory** | Persistent memory across sessions (`.standards/developer-memory.ai.yaml`) |
| **Enhanced i18n** | Commit language preferences, improved zh-CN support |

---

## Checking Your Version | 確認版本

```bash
# Check installed version
uds --version

# Check available versions on npm
npm view universal-dev-standards dist-tags
```

---

## Switching Between Versions | 切換版本

```bash
# Upgrade to stable
npm install -g universal-dev-standards@latest

# Switch to beta
npm install -g universal-dev-standards@beta

# Switch to RC
npm install -g universal-dev-standards@rc
```

---

## Reporting Issues | 回報問題

Pre-release versions may have bugs. Please report issues at:

預發布版本可能存在問題，請在此回報：

- [GitHub Issues](https://github.com/AsiaOstrich/universal-dev-standards/issues)

When reporting, include:
- Version number (`uds --version`)
- Steps to reproduce
- Expected vs actual behavior
