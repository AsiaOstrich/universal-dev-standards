---
source: ../../../../../skills/tools/copilot/README.md
source_version: 2.0.0
translation_version: 2.0.0
last_synced: 2026-10-12
source_hash: 228a608b0aa0
status: current
---

# GitHub Copilot 指示

衍生自 universal-dev-standards 的 GitHub Copilot 指示。

## 狀態

✅ **完成** - 可直接使用

## 精簡版與完整版

| 版本 | 位置 | 內容 |
|---------|----------|---------|
| **精簡版**（本資料夾） | `skills/copilot/` | 僅含必要標準 |
| **完整版** | `integrations/github-copilot/` | 完整標準 + Chat 參考 + Skills 對應 |

**建議**：使用 `integrations/github-copilot/` 的完整版，以獲得全面涵蓋。

## 安裝

### 選項 1：精簡版（本資料夾）

```bash
mkdir -p .github
cp skills/copilot/copilot-instructions.md .github/copilot-instructions.md
```

### 選項 2：完整版（推薦）

```bash
mkdir -p .github
cp integrations/github-copilot/copilot-instructions.md .github/copilot-instructions.md
```

### 選項 3：透過 curl 下載

```bash
mkdir -p .github
# Full version (recommended)
curl -o .github/copilot-instructions.md \
  https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/github-copilot/copilot-instructions.md
```

## 包含內容

### 精簡版（本資料夾）

- 提交訊息 - Conventional Commits 格式
- 程式碼品質 - 命名和結構指南
- 安全 - 輸入驗證和注入防護
- 測試 - AAA 模式和 FIRST 原則
- 文件 - API 文件標準
- Git - 分支命名慣例
- AI 協作 - 最佳實踐

### 完整版（integrations/github-copilot/）

包含上述所有內容，另加：

- **TDD 指南** - 紅-綠-重構循環、FIRST 原則
- **測試覆蓋率** - 7 維度框架
- **程式碼審查** - 10 類別檢查表、評論前綴
- **提交前檢查表** - 品質關卡
- **需求撰寫** - INVEST 準則、使用者故事格式
- **SDD 優先** - 規格驅動開發規則
- **Chat 參考** - Copilot Chat 的提示詞範本
- **Skills 對應** - 對應的 Claude Code skills

## 其他資源

參見 `integrations/github-copilot/`：

- `README.md` - 完整文件
- `copilot-instructions.md` - 完整版指示
- `COPILOT-CHAT-REFERENCE.md` - Chat 提示詞範本
- `skills-mapping.md` - Claude Code skills 對應

## 結構

```
skills/copilot/
├── copilot-instructions.md  # 精簡版指示
└── README.md                # 本檔案

integrations/github-copilot/
├── README.md                # 完整文件
├── copilot-instructions.md  # 完整版指示
├── COPILOT-CHAT-REFERENCE.md # Chat 提示詞
└── skills-mapping.md        # Skills 對應
```

## 版本

- **版本**：2.0.0
- **最後更新**：2026-01-13
- **來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)

## 授權

CC BY 4.0
