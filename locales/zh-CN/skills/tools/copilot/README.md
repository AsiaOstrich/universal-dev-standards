---
source: ../../../../../skills/tools/copilot/README.md
source_version: 2.0.0
translation_version: 2.0.0
last_synced: 2026-10-11
source_hash: 228a608b0aa0
status: current
---

# GitHub Copilot 指示

衍生自 universal-dev-standards 的 GitHub Copilot 指示。

## 状态

✅ **完成** - 可直接使用

## 精简版与完整版

| 版本 | 位置 | 内容 |
|------|------|------|
| **精简版**（本资料夹） | `skills/copilot/` | 仅包含核心标准 |
| **完整版** | `integrations/github-copilot/` | 完整标准 + Chat 参考 + Skills 对照 |

**建议**：使用 `integrations/github-copilot/` 中的完整版，以获得全面的涵盖范围。

## 安装

### 选项 1：精简版（本资料夹）

```bash
mkdir -p .github
cp skills/copilot/copilot-instructions.md .github/copilot-instructions.md
```

### 选项 2：完整版（建议）

```bash
mkdir -p .github
cp integrations/github-copilot/copilot-instructions.md .github/copilot-instructions.md
```

### 选项 3：透过 curl 下载

```bash
mkdir -p .github
# 完整版（建议）
curl -o .github/copilot-instructions.md \
  https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/integrations/github-copilot/copilot-instructions.md
```

## 包含内容

### 精简版（本资料夹）

- 提交讯息 - Conventional Commits 格式
- 程序码品质 - 命名和结构指南
- 安全 - 输入验证和注入防护
- 测试 - AAA 模式和 FIRST 原则
- 文件 - API 文件标准
- Git - 分支命名惯例
- AI 协作 - 最佳实践

### 完整版（integrations/github-copilot/）

包含上述所有内容，另加：

- **TDD 指南** - 红-绿-重构循环、FIRST 原则
- **测试覆盖率** - 7 维度框架
- **程序码审查** - 10 类别检查表、评论前缀
- **提交前检查表** - 品质关卡
- **需求撰写** - INVEST 准则、使用者故事格式
- **SDD 优先** - 规格驱动开发规则
- **Chat 参考** - Copilot Chat 的提示词范本
- **Skills 对照** - Claude Code skills 对应项目

## 其他资源

请参阅 `integrations/github-copilot/`：

- `README.md` - 完整文件
- `copilot-instructions.md` - 完整版指示
- `COPILOT-CHAT-REFERENCE.md` - Chat 提示词范本
- `skills-mapping.md` - Claude Code skills 对照

## 结构

```
skills/copilot/
├── copilot-instructions.md  # 精简版指示档案
└── README.md                # 本档案

integrations/github-copilot/
├── README.md                # 完整文件
├── copilot-instructions.md  # 完整版指示档案
├── COPILOT-CHAT-REFERENCE.md # Chat 提示词
└── skills-mapping.md        # Skills 对照
```

## 版本

- **版本**：2.0.0
- **最后更新**：2026-01-13
- **来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)

## 授权

CC BY 4.0
