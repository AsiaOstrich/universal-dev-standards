---
source: ../../../../integrations/claude-code/README.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-08-12
status: current
---

# Claude Code 整合

> **語言**: English | [繁體中文](README.md)

**版本**: 1.1.0
**最後更新**: 2026-08-12

本目錄包含將通用開發標準 (Universal Development Standards) 與 [Claude Code](https://docs.anthropic.com/claude-code) 整合的資源。

## 概覽

Claude Code 是一個先進的 AI 編碼代理，可以直接與您的程式碼庫互動。此整合提供：

1.  **專案上下文 (`CLAUDE.md`)**：定義專案特定的規則、風格指南和指令。
2.  **技能 (`skills/`)**：針對 TDD、SDD、程式碼審查等的專業能力。
3.  **模型層級 × effort 映射**：`core/model-selection.md` 的宿主層那一半。
4.  **參考 subagent 定義**：`.claude/agents/*.md`，每個模型層級各一份。
5.  **跨 repo 派工模板**：當目標 repo 不是你的 session 所在的那一個時，subagent 的 prompt 必須自帶什麼。

## 本宿主的模型選擇（XSPEC-362 R5）

`core/model-selection.md` 依規則保持 vendor-neutral——它把 tier（`fast` / `standard` / `capable`）
與 effort 級距（`low` … `max`）定義為標籤，並明白表示它無法斷言某個模型接受哪些 effort 級距。
下列檔案為 Claude Code 回答這件事，且是本 repo **唯一**應該出現具體模型識別字的地方。

| 檔案 | 內容 |
|---|---|
| [`model-selection-mapping.md`](../../../../integrations/claude-code/model-selection-mapping.md) | tier → `model`、effort → `effort`、已解析的 tier × effort 表格，以及硬邊界登記表 |
| [`model-selection-mapping.ai.yaml`](../../../../integrations/claude-code/model-selection-mapping.ai.yaml) | 同一份映射的機器可讀版 |
| [`.claude/agents/`](../../../../integrations/claude-code/.claude/agents/) | 四份參考 subagent 定義：三層各一，外加一個長時程變體 |
| [`dispatch-template.md`](../../../../integrations/claude-code/dispatch-template.md) | 跨 repo 派工模板，以及支撐它的實測 |

該映射有兩件事值得先知道：

- **UDS 的 `very-high` 在 Claude Code 寫作 `xhigh`。** 這是唯一名稱不同的一級。標準不改名去遷就工具，
  改名由宿主層吸收。
- **`fast` 層在本宿主沒有 effort 軸。** 該層的模型不接受任何 effort 級距，
  所以標準的「先調 effort 再升級模型層」在那裡沒有東西可調。

派工機制——並行安全、獨立域、狀態協定——**不**由這些檔案涵蓋。
那屬於 [`core/agent-dispatch.md`](../../../../core/agent-dispatch.md)，這些檔案引用它而不重寫它。

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
