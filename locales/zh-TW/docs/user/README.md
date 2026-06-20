---
source: docs/user/README.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# UDS 使用者文件

> **語言**: [English](../../../../docs/user/README.md) | 繁體中文

歡迎來到 UDS（Universal Development Standards，通用開發標準）使用者文件中心。

---

## 新手入門

剛安裝完 UDS？從這裡開始：

1. **[GETTING-STARTED.md](../../../../docs/user/GETTING-STARTED.md)** — 5 分鐘導覽：安裝 → 初始化 → 第一份 spec → 第一次 commit（繁中翻譯進行中）
2. **[GLOSSARY.md](../../../../docs/user/GLOSSARY.md)** — 什麼是 Skill？Standard？Tier？所有 UDS 術語的定義（繁中翻譯進行中）
3. **[SKILLS-INDEX.md](../../../../docs/user/SKILLS-INDEX.md)** — 依 Tier 與分類瀏覽全部 55 個 skill（自動產生，僅英文）

---

## 日常使用

| 我想要… | 前往 |
|---------|------|
| 找到正確的命令 | [SKILLS-INDEX.md → 觸發時機速查](../../../../docs/user/SKILLS-INDEX.md#觸發時機速查-when-to-use) |
| 查看所有斜線命令 | [COMMANDS-INDEX.md](../../../../docs/user/COMMANDS-INDEX.md) |
| 自訂列出哪些 skill | [skill-budget-tuning.md](../../../../docs/skill-budget-tuning.md) |
| 快速參考卡 | [CHEATSHEET.md](../CHEATSHEET.md) |
| 解答常見問題 | [FAQ.md](../../../../docs/user/FAQ.md) |
| 修正問題 | [TROUBLESHOOTING.md](../../../../docs/user/TROUBLESHOOTING.md) |

---

## 維護者 / 貢獻者

| 主題 | 資源 |
|------|------|
| UDS 的結構 | [../../CONTRIBUTING.md](../../../../CONTRIBUTING.md) |
| CLI 參考 | [cli/README.md](../../../../cli/README.md) |
| 採用指南 | [ADOPTION-GUIDE.md](../../../../adoption/ADOPTION-GUIDE.md) |
| 發布前資訊 | [PRE-RELEASE.md](../../../../docs/PRE-RELEASE.md) |
| 更新自動產生的文件 | 執行 `npm run docs:generate-index` |

---

## 文件地圖

```
docs/
├── user/                        ← 你在這裡（面向使用者的文件）
│   ├── README.md                ← 本檔 — 文件中心
│   ├── GETTING-STARTED.md       ← 首次設定指南
│   ├── SKILLS-INDEX.md          ← 55 個 skill 依 Tier 與分類（自動產生）
│   ├── COMMANDS-INDEX.md        ← 所有斜線命令（自動產生）
│   ├── CHEATSHEET.md            ← 快速參考卡
│   ├── FAQ.md                   ← 常見問題
│   ├── GLOSSARY.md              ← 術語表
│   └── TROUBLESHOOTING.md       ← 問題 → 解法
├── reference/                   ← 完整參考（自動產生）
│   └── FEATURE-REFERENCE.md
└── internal/                    ← 維護者文件（非給終端使用者）
```

> **注意**：標記「自動產生」的檔案由 `npm run docs:generate-index` 重建。
> 請勿手動編輯——下次執行時變更會被覆寫。
