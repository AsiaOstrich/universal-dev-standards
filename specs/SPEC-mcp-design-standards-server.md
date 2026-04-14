# SPEC: MCP Design Standards Server — UDS 內部實作規格

> **狀態**: Implemented
> **來源 XSPEC**: XSPEC-026 Phase 4
> **負責子專案**: universal-dev-standards

---

## 目標

在 UDS CLI 新增 `uds mcp serve` 子命令，啟動一個 stdio transport MCP Server，
讓任何支援 MCP 協定的 AI 工具（Claude Code、Cursor）可以查詢設計標準。

---

## 實作產物

| 產物 | 路徑 | 狀態 |
|------|------|------|
| MCP Server 核心 | `cli/src/mcp/server.js` | Implemented |
| MCP CLI 命令 | `cli/src/commands/mcp.js` | Implemented |
| CLI 命令入口 | `cli/bin/uds.js`（新增 `mcpCommand` 引入與註冊） | Implemented |
| MCP 配置範本 | `templates/mcp-config.json` | Implemented |
| 測試 | `cli/tests/commands/mcp/server.test.js`（12 個測試） | Implemented |

---

## 提供的 MCP 工具

| 工具名稱 | 說明 |
|---------|------|
| `get_design_token` | 讀取指定專案的 DESIGN.md，若不存在回傳 UDS 模板（友好降級） |
| `get_design_standards` | 回傳 `frontend-design-standards.ai.yaml` 完整內容 |
| `validate_design_token` | 驗證 DESIGN.md 是否含必填段落，回傳缺失清單 |

---

## 技術決策

- **無外部 MCP SDK**：純 Node.js 標準庫（`process.stdin` / `process.stdout`）實作 stdio JSON-RPC 2.0
- **stderr 用於日誌**：啟動訊息輸出至 stderr，不干擾 stdout MCP 通訊
- **ESM 模組**：跟隨 `cli/package.json` 的 `"type": "module"`
- **友好降級**：`get_design_token` 找不到 DESIGN.md 時不報錯，改回傳 UDS 模板並附加說明

---

## 驗收標準

- [x] `uds mcp serve` 啟動後在 stderr 輸出啟動訊息
- [x] 收到 `initialize` 請求回傳 protocolVersion `2024-11-05`
- [x] `tools/list` 回傳 3 個工具（get_design_token、get_design_standards、validate_design_token）
- [x] `get_design_token` 在 DESIGN.md 存在時回傳該檔案內容
- [x] `get_design_token` 在 DESIGN.md 不存在時回傳 UDS 模板（不報錯）
- [x] `validate_design_token` 正確識別缺失的必填段落
- [x] 未知 method 回傳 JSON-RPC error code -32601
- [x] 全套件測試通過（2932 passed, 0 failed）

---

## 使用方式

### Claude Code 設定

在 Claude Code 的 `settings.json` 中加入（參考 `templates/mcp-config.json`）：

```json
{
  "mcpServers": {
    "uds-design-standards": {
      "command": "uds",
      "args": ["mcp", "serve"]
    }
  }
}
```

### 手動測試

```bash
# 啟動 server（另開 terminal）
uds mcp serve

# 送 initialize request
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | uds mcp serve
```
