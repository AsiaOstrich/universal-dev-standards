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
