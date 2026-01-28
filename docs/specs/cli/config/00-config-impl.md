# [SPEC-CONFIG-IMPL] Configuration System Implementation / 配置系統實作規格

**Status**: Draft
**Target Component**: CLI Core Config Module

---

## 1. Class Structure / 類別結構

### ConfigLoader (`cli/src/utils/config-loader.js`)
負責從不同來源讀取檔案。
- `loadGlobal()`: 讀取 `~/.udsrc` (YAML/JSON)。
- `loadProject()`: 讀取 `./.uds/config.yaml`。
- `loadOrg(url)`: 遠端下載配置（目前僅定義介面，先實作本地）。

### ConfigMerger (`cli/src/utils/config-merger.js`)
負責合併邏輯。
- `merge(base, override)`: 深度合併兩個物件。
- 支援 `$append` 特殊關鍵字（用於陣列）。

### ConfigManager (`cli/src/utils/config-manager.js`)
高階介面供其他模組調用。
- `get(key, defaultValue)`: 支援點號路徑（例如 `get('hitl.threshold')`）。
- `set(key, value, scope)`: 更新配置。

---

## 2. Configuration Schema / 配置綱要

使用 `Joi` 或簡單物件定義：
- `ui.language`: string (default: 'en')
- `hitl.threshold`: number (0-4, default: 2)
- `vibe-coding.enabled`: boolean (default: false)

---

## 3. CLI Command: `uds config`

```bash
uds config list           # 顯示合併後的最終配置
uds config get <key>      # 獲取特定值
uds config set <key> <val> [--global] # 設定值
```

---

## 4. Test Cases / 測試案例

- [ ] 只有 Global 配置時應正確讀取。
- [ ] Project 配置應能覆蓋 Global 配置。
- [ ] 點號路徑 (Dot notation) 讀取應正確。
- [ ] 無配置檔案時應返回預設值。
