# Google Antigravity Integration
# Google Antigravity 整合

This directory provides resources for integrating Universal Doc Standards with Google Antigravity.
本目錄提供將通用文件規範與 Google Antigravity 整合的資源。

## Overview | 概述

Google Antigravity is an advanced agentic coding assistant. This integration helps Antigravity agents utilize the Universal Doc Standards to generate higher quality, hallucination-free code and documentation.

Google Antigravity 是一個先進的代理程式碼開發助理。此整合協助 Antigravity 代理利用通用文件規範來生成更高品質、無幻覺的程式碼與文件。

## Resources | 資源

- **[.antigravity/rules.md](./.antigravity/rules.md)** (Recommended | 推薦):
  Project-level rules file, automatically loaded by Antigravity.
  專案級規則檔，Antigravity 會自動載入。

- **[INSTRUCTIONS.md](./INSTRUCTIONS.md)**:
  System prompt snippets for manual configuration.
  用於手動配置的系統提示詞片段。

## Rules Configuration | 規則配置

Google Antigravity supports two levels of rules:

| Type | File Location | Description |
|------|--------------|-------------|
| Global Rules | `~/.gemini/GEMINI.md` | Applies to all projects |
| Project Rules | `.antigravity/rules.md` | Project-specific rules (auto-loaded) |

Google Antigravity 支援兩層規則配置：

| 類型 | 檔案位置 | 說明 |
|------|---------|------|
| 全域規則 | `~/.gemini/GEMINI.md` | 適用於所有專案 |
| 專案規則 | `.antigravity/rules.md` | 專案特定規則（自動載入） |

## Quick Start | 快速開始

### Option 1: Project Rules (Recommended) | 方式一：專案規則（推薦）

Copy the project rules file to your project:

將專案規則檔複製到您的專案：

```bash
# Create directory and copy rules file
mkdir -p .antigravity
cp integrations/google-antigravity/.antigravity/rules.md .antigravity/

# Or use curl
mkdir -p .antigravity
curl -o .antigravity/rules.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/google-antigravity/.antigravity/rules.md
```

### Option 2: Manual Configuration | 方式二：手動配置

1. **Install Standards**:
   Ensure `core/` standards are copied to your project (e.g., `.standards/`).
   確保 `core/` 規範已複製到您的專案（例如 `.standards/`）。

2. **Configure Agent**:
   Copy the content from `INSTRUCTIONS.md` into your Antigravity "User Rules" or specific task instructions.
   將 `INSTRUCTIONS.md` 的內容複製到您的 Antigravity「使用者規則」或特定任務指令中。

### Verify Compliance | 驗證合規性

Ask the agent to "Review this code following anti-hallucination standards".
要求代理「遵循防幻覺標準審查此程式碼」。

---

## Related Standards | 相關標準

- [Anti-Hallucination Standards](../../core/anti-hallucination.md) - 防幻覺標準
- [Commit Message Guide](../../core/commit-message-guide.md) - Commit 訊息指南
- [INSTRUCTIONS.md](./INSTRUCTIONS.md) - 詳細整合指令

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-09 | Added: `.antigravity/rules.md` project rules file, Rules Configuration section |
| 1.0.1 | 2025-12-24 | Added: Related Standards, Version History, License sections |
| 1.0.0 | 2025-12-23 | Initial Google Antigravity integration |

---

## License | 授權

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
