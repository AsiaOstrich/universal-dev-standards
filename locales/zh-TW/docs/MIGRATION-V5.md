# 遷移指南：Universal Dev Standards V5

> **語言**: English | [繁體中文](MIGRATION-V5.md)

**版本**: 5.0.0
**狀態**: 重大變更（Token 使用量最佳化）

## 概覽

Universal Development Standards V5 引入了重大的架構變更，旨在**減少 AI Token 消耗量高達 75%**。我們將「可執行的規則」與「教育性內容」進行了分離。

## 主要變更

### 1. 規則 (Rules) 與指南 (Guides) 分離

在 V4 中，許多標準檔案體積龐大（例如 `testing-standards.md` 高達 141KB）。在 V5 中，這些檔案已被拆分：

| 組件 | 位置 | 目的 | AI 行為 |
|------|------|------|---------|
| **規則 (Rules)** | `core/*.md` | 可執行的規則、檢查清單、閾值 | **務必讀取** |
| **指南 (Guides)** | `core/guides/*.md` | 詳細解釋、教學、範例 | **僅在需要時讀取** |
| **方法論** | `methodologies/guides/*.md` | 完整的方法論指南 (TDD, BDD 等) | **僅在需要時讀取** |

### 2. 檔案位置移動

以下方法論檔案已從 `core/` 移至 `methodologies/guides/`：
- `test-driven-development.md`
- `acceptance-test-driven-development.md`
- `spec-driven-development.md`
- `behavior-driven-development.md`
- `requirement-engineering.md`

### 3. AI 代理指令

新的 AI 工具設定（`.cursorrules`、`CLAUDE.md` 等）現在包含 **核心標準使用規則 (Core Standards Usage Rule)**，指示 AI 代理優先讀取 `core/` 中的輕量化規則以節省 Token。

## 如何升級

### 現有專案

如果您已在專案中初始化了 UDS，請按照以下步驟操作以獲取 Token 最佳化效益：

1. **更新 CLI**：
   ```bash
   npm install -g universal-dev-standards@alpha
   ```

2. **同步參考 (Sync References)**：
   執行更新指令以獲取新的輕量化規則檔案與指南：
   ```bash
   uds update --sync-refs
   ```

3. **更新 AI 規則**：
   重新生成或更新您的 AI 工具設定檔（例如 `.cursorrules`），以包含新的使用指令：
   ```bash
   uds configure
   # 選擇您的 AI 工具並選擇 "Update"
   ```

### 向後相容性

我們在原始的 `core/` 位置留下了 **Stub 檔案 (轉址檔案)**。這些是小型檔案（約 1KB），提供摘要以及指向新完整指南的連結。這確保了您文件中任何現有的硬編碼連結或參考不會失效。

## 常見問題 (FAQ)

### 為什麼要這樣做？
現代 AI 模型具有上下文視窗 (Context Window) 限制以及 Token 成本。大型文件會降低 AI 效能並增加延遲。V5 使「常駐」上下文變得更小，同時保持完整知識庫可用。

### 我需要修改程式碼嗎？
不需要。此變更僅影響文件結構和 AI 代理的行為。
