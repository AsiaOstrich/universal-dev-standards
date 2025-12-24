# Google Antigravity Integration
# Google Antigravity 整合

This directory provides resources for integrating Universal Doc Standards with Google Antigravity.
本目錄提供將通用文件規範與 Google Antigravity 整合的資源。

## Overview | 概述

Google Antigravity is an advanced agentic coding assistant. This integration helps Antigravity agents utilize the Universal Doc Standards to generate higher quality, hallucination-free code and documentation.

Google Antigravity 是一個先進的代理程式碼開發助理。此整合協助 Antigravity 代理利用通用文件規範來生成更高品質、無幻覺的程式碼與文件。

## Resources | 資源

- **[INSTRUCTIONS.md](./INSTRUCTIONS.md)**: 
  System prompt snippets to enforce standards compliance.
  用於強制執行規範合規性的系統提示詞片段。

## Quick Start | 快速開始

1. **Install Standards**:
   Ensure `core/` standards are copied to your project (e.g., `.standards/`).
   確保 `core/` 規範已複製到您的專案（例如 `.standards/`）。

2. **Configure Agent**:
   Copy the content from `INSTRUCTIONS.md` into your Antigravity "User Rules" or specific task instructions.
   將 `INSTRUCTIONS.md` 的內容複製到您的 Antigravity「使用者規則」或特定任務指令中。

3. **Verify Compliance**:
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
| 1.0.1 | 2025-12-24 | Added: Related Standards, Version History, License sections |
| 1.0.0 | 2025-12-23 | Initial Google Antigravity integration |

---

## License | 授權

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
