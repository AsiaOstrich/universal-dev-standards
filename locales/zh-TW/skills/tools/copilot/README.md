---
source: ../../../skills/copilot/README.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# GitHub Copilot 指示

衍生自 universal-dev-standards 的 GitHub Copilot 指示。

## 狀態

✅ **完成** - 可直接使用

## 安裝

將 `copilot-instructions.md` 檔案複製到您專案的 `.github` 資料夾：

```bash
mkdir -p .github
cp skills/copilot/copilot-instructions.md .github/copilot-instructions.md
```

或直接從此倉庫複製：

```bash
mkdir -p .github
curl -o .github/copilot-instructions.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/skills/copilot/copilot-instructions.md
```

## 包含內容

`copilot-instructions.md` 檔案包含以下指引：

- **提交訊息** - Conventional Commits 格式
- **程式碼品質** - 命名和結構指南
- **安全** - 輸入驗證和注入防護
- **測試** - AAA 模式和 FIRST 原則
- **文件** - API 文件標準
- **Git** - 分支命名慣例
- **AI 協作** - 最佳實踐

## 結構

```
copilot/
├── copilot-instructions.md  # 主要指示檔案
└── README.md                # 本檔案
```

## 版本

- **版本**：1.0.0
- **最後更新**：2025-12-29
- **來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)

## 授權

CC BY 4.0
