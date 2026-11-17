# UDS CLI 測試發現與執行指南

> **專為 AI Agent 設計的測試導航文件**
>
> 最後更新：2026-01-23 | 總測試數：2,931 | 測試文件：33 份

## 📋 測試結構總覽

Universal Development Standards CLI 採用分層測試架構，確保從底層工具到用戶界面的全面覆蓋。

### 🏗️ 測試金字塔

```
E2E Tests (712) - 24.3%
↑
Integration Tests (830) - 28.3%  
↑
Unit Tests (1,389) - 47.4%
```

## 🗂️ 測試文件地圖

### 🔬 核心單元測試 (`tests/unit/core/`)
| 文件 | 測試數 | 覆蓋功能 |
|------|--------|----------|
| `constants.test.js` | 93 | 核心常數定義 |
| `paths.test.js` | 115 | 路徑處理邏輯 |
| `manifest.test.js` | 121 | 清單文件操作 |
| `errors.test.js` | 91 | 錯誤處理機制 |

### 🔧 工具測試 (`tests/unit/utils/` + `tests/utils/`)
| 文件 | 測試數 | 覆蓋功能 |
|------|--------|----------|
| `reference-sync.test.js` | 81 | 參考同步機制 |
| `agent-adapter.test.js` | 89 | AI 適配器 |
| `skills-installer.test.js` | 74 | 技能安裝器 |
| `agents-installer.test.js` | 78 | 代理安裝器 |
| `hasher.test.js` | 84 | 哈希工具 |
| `detector.test.js` | 54 | 項目檢測器 |
| `copier.test.js` | 31 | 文件複製工具 |
| `registry.test.js` | 35 | 註冊表操作 |
| `integration-generator.test.js` | 90 | 集成生成器 |
| `context-chunker.test.js` | 94 | 上下文分塊 |
| `github.test.js` | 58 | GitHub 集成 |
| `npm-registry.test.js` | 48 | NPM 註冊表 |

### 💬 提示測試 (`tests/prompts/`)
| 文件 | 測試數 | 覆蓋功能 |
|------|--------|----------|
| `init.test.js` | 137 | 初始化提示 |
| `integrations.test.js` | 74 | 集成選項提示 |

### ⚡ 命令測試 (`tests/commands/`)
| 文件 | 測試數 | 覆蓋功能 |
|------|--------|----------|
| `ai-context.test.js` | 164 | AI 上下文命令 |
| `init.test.js` | 157 | 初始化命令 |
| `update.test.js` | 118 | 更新命令 |
| `check.test.js` | 82 | 檢查命令 |
| `configure.test.js` | 72 | 配置命令 |
| `skills.test.js` | 58 | 技能命令 |
| `list.test.js` | 19 | 列表命令 |

### 🔄 端到端測試 (`tests/e2e/`)
| 文件 | 測試數 | 覆蓋功能 | 執行時間 |
|------|--------|----------|----------|
| `init-flow.test.js` | 204 | 初始化完整流程 | ~17 分鐘 |
| `check-flow.test.js` | 148 | 檢查完整流程 | ~12 分鐘 |
| `config-flow.test.js` | 126 | 配置完整流程 | ~10 分鐘 |
| `update-flow.test.js` | 95 | 更新完整流程 | ~8 分鐘 |
| `list-flow.test.js` | 81 | 列表完整流程 | ~7 分鐘 |
| `skills-flow.test.js` | 58 | 技能完整流程 | ~5 分鐘 |

## 🎯 AI Agent 測試執行策略

### 🚀 快速開發循環（推薦）
```bash
# 1. 執行所有單元測試（< 3 秒）
cd cli && npm test -- tests/unit/ tests/utils/

# 2. 執行命令測試（< 2 秒）
cd cli && npm test -- tests/commands/

# 3. 執行提示測試（< 1 秒）
cd cli && npm test -- tests/prompts/

# 總計：< 6 秒完成 1,619 個測試
```

### 🔍 模組化測試
```bash
# 特定功能模組
cd cli && npm test -- tests/unit/core/                    # 核心功能
cd cli && npm test -- tests/unit/utils/workflow-state.test.js  # 特定工具
cd cli && npm test -- tests/commands/init.test.js        # 特定命令
```

### 🐢 完整驗證（用戶終端執行）
```bash
# E2E 測試（預計 59 分鐘）
cd cli && npm run test:e2e

# 或分批執行以避免超時
cd cli && npm test -- tests/e2e/skills-flow.test.js      # 5 分鐘
cd cli && npm test -- tests/e2e/list-flow.test.js       # 7 分鐘
cd cli && npm test -- tests/e2e/update-flow.test.js     # 8 分鐘
cd cli && npm test -- tests/e2e/config-flow.test.js     # 10 分鐘
cd cli && npm test -- tests/e2e/check-flow.test.js      # 12 分鐘
cd cli && npm test -- tests/e2e/init-flow.test.js       # 17 分鐘
```

## 🔧 測試配置與調優

### ⚙️ Vitest 配置影響
- `fileParallelism: false` - 強制順序執行（影響 E2E 測試）
- `testTimeout: 30000` - 30 秒默認超時
- E2E 測試會啟動子進程，每個約 5 秒

### 📊 性能優化建議

#### 對於開發階段
```bash
# 推薦：只執行單元測試
npm test -- tests/unit/ tests/utils/ tests/commands/ tests/prompts/

# 或排除 E2E 測試
npm test -- --exclude tests/e2e/
```

#### 對於 CI/CD
```bash
# 並行執行（建議配置）
npm test -- tests/unit/ tests/utils/ tests/commands/ tests/prompts/ --reporter=junit
npm run test:e2e --reporter=junit
```

#### 對於發布前檢查
```bash
# 完整測試套件（在用戶終端中）
./scripts/pre-release-check.sh
```

## 🎪 測試發現命令

### 🔍 查看所有測試文件
```bash
find tests/ -name "*.test.js" | sort
```

### 📈 統計測試數量
```bash
# 總測試數
find tests/ -name "*.test.js" -exec grep -c "describe\|it\|test" {} \; | awk '{sum += $1} END {print "總計: " sum " 個測試"}'

# 各類別統計
find tests/unit/ -name "*.test.js" -exec grep -c "describe\|it\|test" {} \; | awk '{sum += $1} END {print "單元測試: " sum " 個"}'
find tests/e2e/ -name "*.test.js" -exec grep -c "describe\|it\|test" {} \; | awk '{sum += $1} END {print "E2E 測試: " sum " 個"}'
```

### 🎯 特定場景的測試組合

#### 修改核心邏輯後
```bash
npm test -- tests/unit/core/ tests/unit/utils/ tests/commands/
```

#### 修改 CLI 命令後
```bash
npm test -- tests/commands/ tests/e2e/
```

#### 修改提示界面後
```bash
npm test -- tests/prompts/ tests/e2e/init-flow.test.js
```

#### 修改安裝器後
```bash
npm test -- tests/unit/utils/*installer*.test.js tests/e2e/
```

## 🚨 AI Agent 注意事項

### ⚠️ 執行限制
- **E2E 測試**在背景執行會超時（>120 秒）
- **完整測試套件**需要 59+ 分鐘
- **覆蓋率報告**生成也需要較長時間

### ✅ 最佳實踐
1. **優先執行單元測試**驗證核心功能
2. **根據變更範圍選擇性執行 E2E 測試**
3. **對於長時間測試，建議用戶在終端中手動執行**

### 🎪 建議的 AI 對話模式

#### 開發階段
```
用戶：我修改了 X 功能
AI：我來執行相關測試驗證變更
    [執行對應的單元測試]
    [如有需要，建議用戶執行特定 E2E 測試]
```

#### 發布前階段
```
用戶：準備發布新版本
AI：我來執行完整的預發布檢查
    [執行所有單元測試]
    [執行 linting 和同步檢查]
    [建議用戶執行 E2E 測試]
    [生成覆蓋率報告]
```

## 📚 相關文件

- `../package.json` - 測試腳本配置
- `../vitest.config.js` - 測試框架配置
- `E2E-TEST-CASES.md` - E2E 測試規格詳情
- `../CLAUDE.md` - AI Agent 開發指南

---

*此文件專為 AI Agent 設計，確保能夠高效、準確地發現和執行 Universal Development Standards 的所有測試項目。*