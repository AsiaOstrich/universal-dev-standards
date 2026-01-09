# Gemini CLI Integration
# Gemini CLI 整合

This directory provides resources for integrating Universal Doc Standards with [Gemini CLI](https://geminicli.com/).

本目錄提供將通用文件規範與 [Gemini CLI](https://geminicli.com/) 整合的資源。

## Overview | 概述

Gemini CLI is Google's open-source AI agent that brings the power of Gemini directly into your terminal. This integration helps Gemini CLI utilize the Universal Doc Standards to generate higher quality, hallucination-free code and documentation.

Gemini CLI 是 Google 的開源 AI 代理工具，將 Gemini 模型帶入終端環境。此整合協助 Gemini CLI 利用通用文件規範來生成更高品質、無幻覺的程式碼與文件。

## Resources | 資源

- **[GEMINI.md](./GEMINI.md)** (Recommended | 推薦):
  Project-level context file, automatically loaded by Gemini CLI.
  專案級指令檔案，Gemini CLI 會自動載入。

- **[settings-example.json](./settings-example.json)**:
  Example settings file for customizing CLI behavior.
  用於自訂 CLI 行為的設定範例檔案。

## Configuration Hierarchy | 配置層級

Gemini CLI supports a hierarchical context system:

| Level | File Location | Description |
|-------|--------------|-------------|
| Global | `~/.gemini/GEMINI.md` | Applies to all projects |
| Project | `./GEMINI.md` | Project root directory |
| Subdirectory | `./subdir/GEMINI.md` | Module-specific rules |
| Settings | `.gemini/settings.json` | Behavior configuration |

Gemini CLI 支援分層配置系統：

| 層級 | 檔案位置 | 說明 |
|------|---------|------|
| 全域 | `~/.gemini/GEMINI.md` | 適用於所有專案 |
| 專案 | `./GEMINI.md` | 專案根目錄 |
| 子目錄 | `./subdir/GEMINI.md` | 模組特定規則 |
| 設定 | `.gemini/settings.json` | 行為配置 |

## Quick Start | 快速開始

### Option 1: Project Context (Recommended) | 方式一：專案指令（推薦）

Copy the context file to your project root:

將指令檔案複製到專案根目錄：

```bash
# Copy GEMINI.md to project root
cp integrations/gemini-cli/GEMINI.md ./GEMINI.md

# Or use curl
curl -o GEMINI.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/gemini-cli/GEMINI.md
```

### Option 2: Global Context | 方式二：全域指令

Add to your global context for all projects:

加入全域指令，適用於所有專案：

```bash
# Create global directory if needed
mkdir -p ~/.gemini

# Append or create global GEMINI.md
cat integrations/gemini-cli/GEMINI.md >> ~/.gemini/GEMINI.md
```

### Option 3: Custom Settings | 方式三：自訂設定

Copy the settings example to customize CLI behavior:

複製設定範例以自訂 CLI 行為：

```bash
# Create project settings directory
mkdir -p .gemini

# Copy settings example
cp integrations/gemini-cli/settings-example.json .gemini/settings.json
```

## Special Features | 特殊功能

### Modular Imports | 模組化導入

Gemini CLI supports importing content from other files:

Gemini CLI 支援從其他檔案導入內容：

```markdown
# In GEMINI.md
@./docs/coding-style.md
@./docs/api-guidelines.md
```

### Memory Commands | 記憶命令

Manage context at runtime:

在執行時管理指令：

- `/memory show` - Display current context | 顯示目前指令
- `/memory refresh` - Reload all GEMINI.md files | 重新載入所有 GEMINI.md
- `/memory add <text>` - Add to global context | 加入全域指令

### Verify Context | 驗證指令

Check that standards are loaded:

確認標準已載入：

```
/memory show
```

Ask the agent to confirm:

要求代理確認：

```
Review this code following anti-hallucination standards.
遵循防幻覺標準審查此程式碼。
```

## Relationship with Google Antigravity | 與 Google Antigravity 的關係

Both tools share the global `~/.gemini/` directory:

兩個工具共用全域 `~/.gemini/` 目錄：

| Tool | Project Rules Location | Shared |
|------|----------------------|--------|
| Gemini CLI | `./GEMINI.md` | `~/.gemini/GEMINI.md` |
| Antigravity | `.antigravity/rules.md` | `~/.gemini/GEMINI.md` |

They can coexist, using the same global configuration.

兩者可共存，使用相同的全域配置。

---

## Related Standards | 相關標準

- [Anti-Hallucination Standards](../../core/anti-hallucination.md) - 防幻覺標準
- [Commit Message Guide](../../core/commit-message-guide.md) - Commit 訊息指南
- [Spec-Driven Development](../../core/spec-driven-development.md) - 規格驅動開發
- [Gemini CLI Official Docs](https://geminicli.com/docs/) - 官方文件

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-09 | Initial Gemini CLI integration |

---

## License | 授權

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
