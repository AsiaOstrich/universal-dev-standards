---
source: docs/user/README.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# UDS 用户文档

> **语言**: [English](../../../../docs/user/README.md) | 简体中文

欢迎来到 UDS（Universal Development Standards，通用开发标准）用户文档中心。

---

## 新手入门

刚安装完 UDS？从这里开始：

1. **[GETTING-STARTED.md](../../../../docs/user/GETTING-STARTED.md)** — 5 分钟导览：安装 → 初始化 → 第一份 spec → 第一次 commit（简中翻译进行中）
2. **[GLOSSARY.md](../../../../docs/user/GLOSSARY.md)** — 什么是 Skill？Standard？Tier？所有 UDS 术语的定义（简中翻译进行中）
3. **[SKILLS-INDEX.md](../../../../docs/user/SKILLS-INDEX.md)** — 按 Tier 与分类浏览全部 54 个 skill（自动生成，仅英文）

---

## 日常使用

| 我想要… | 前往 |
|---------|------|
| 找到正确的命令 | [SKILLS-INDEX.md → 触发时机速查](../../../../docs/user/SKILLS-INDEX.md#觸發時機速查-when-to-use) |
| 查看所有斜线命令 | [COMMANDS-INDEX.md](../../../../docs/user/COMMANDS-INDEX.md) |
| 自定义列出哪些 skill | [skill-budget-tuning.md](../../../../docs/skill-budget-tuning.md) |
| 快速参考卡 | [CHEATSHEET.md](../CHEATSHEET.md) |
| 解答常见问题 | [FAQ.md](../../../../docs/user/FAQ.md) |
| 修正问题 | [TROUBLESHOOTING.md](../../../../docs/user/TROUBLESHOOTING.md) |

---

## 维护者 / 贡献者

| 主题 | 资源 |
|------|------|
| UDS 的结构 | [CONTRIBUTING.md](../../../../CONTRIBUTING.md) |
| CLI 参考 | [cli/README.md](../../../../cli/README.md) |
| 采用指南 | [ADOPTION-GUIDE.md](../../../../adoption/ADOPTION-GUIDE.md) |
| 发布前信息 | [PRE-RELEASE.md](../../../../docs/PRE-RELEASE.md) |
| 更新自动生成的文档 | 执行 `npm run docs:generate-index` |

---

## 文档地图

```
docs/
├── user/                        ← 你在这里（面向用户的文档）
│   ├── README.md                ← 本档 — 文档中心
│   ├── GETTING-STARTED.md       ← 首次设置指南
│   ├── SKILLS-INDEX.md          ← 54 个 skill 按 Tier 与分类（自动生成）
│   ├── COMMANDS-INDEX.md        ← 所有斜线命令（自动生成）
│   ├── CHEATSHEET.md            ← 快速参考卡
│   ├── FAQ.md                   ← 常见问题
│   ├── GLOSSARY.md              ← 术语表
│   └── TROUBLESHOOTING.md       ← 问题 → 解法
├── reference/                   ← 完整参考（自动生成）
│   └── FEATURE-REFERENCE.md
└── internal/                    ← 维护者文档（非给终端用户）
```

> **注意**：标记「自动生成」的文件由 `npm run docs:generate-index` 重建。
> 请勿手动编辑——下次执行时变更会被覆写。
