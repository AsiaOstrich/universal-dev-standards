# Claude Code 整合

> **語言**: English | [繁體中文](README.md)

**版本**: 1.0.0
**最後更新**: 2026-01-29

本目錄包含將通用開發標準 (Universal Development Standards) 與 [Claude Code](https://docs.anthropic.com/claude-code) 整合的資源。

## 概覽

Claude Code 是一個先進的 AI 編碼代理，可以直接與您的程式碼庫互動。此整合提供：

1.  **專案上下文 (`CLAUDE.md`)**：定義專案特定的規則、風格指南和指令。
2.  **技能 (`skills/`)**：針對 TDD、SDD、程式碼審查等的專業能力。

## 設定

最簡單的設定方式是使用 UDS CLI：

```bash
npx universal-dev-standards init
# 從清單中選擇 "Claude Code"
```

### 手動設定

1. 將 `CLAUDE.md` 複製到您的專案根目錄。
2. 確保專案中存在 `core/` 目錄。
3. 如有需要，安裝技能（請參閱 `skills/README.md`）。

## 驗證

要驗證整合是否運作正常：

1. 啟動 Claude Code：`claude`
2. 詢問：「這個專案的核心標準是什麼？」
3. 它應該讀取 `CLAUDE.md` 並引用 `core/` 中的檔案。

## Token 優化

此整合已針對 Token 使用量進行優化：
- **核心規則**：`core/*.md`（輕量級規則）
- **詳細指南**：`core/guides/*.md`（僅在需要時載入）
