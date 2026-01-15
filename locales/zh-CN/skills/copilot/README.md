---
source: ../../../../skills/copilot/README.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# GitHub Copilot 指示

衍生自 universal-dev-standards 的 GitHub Copilot 指示。

## 状态

✅ **完成** - 可直接使用

## 安装

将 `copilot-instructions.md` 档案复制到您专案的 `.github` 资料夹：

```bash
mkdir -p .github
cp skills/copilot/copilot-instructions.md .github/copilot-instructions.md
```

或直接从此仓库复制：

```bash
mkdir -p .github
curl -o .github/copilot-instructions.md https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/skills/copilot/copilot-instructions.md
```

## 包含内容

`copilot-instructions.md` 档案包含以下指引：

- **提交讯息** - Conventional Commits 格式
- **程序码品质** - 命名和结构指南
- **安全** - 输入验证和注入防护
- **测试** - AAA 模式和 FIRST 原则
- **文件** - API 文件标准
- **Git** - 分支命名惯例
- **AI 协作** - 最佳实践

## 结构

```
copilot/
├── copilot-instructions.md  # 主要指示档案
└── README.md                # 本档案
```

## 版本

- **版本**：1.0.0
- **最后更新**：2025-12-29
- **来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)

## 授权

CC BY 4.0
