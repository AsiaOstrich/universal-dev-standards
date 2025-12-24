---
source: adoption/checklists/minimal.md
source_version: 1.0.1
translation_version: 1.0.1
last_synced: 2025-12-25
status: current
---

# 等級 1：基本採用檢查清單

> **語言**: [English](../../../../adoption/checklists/minimal.md) | 繁體中文

> 任何專案的最低可行標準
>
> 設置時間：約 30 分鐘

---

## 前置條件

- [ ] 已初始化 Git 儲存庫
- [ ] 已安裝 Claude Code（用於 Skills）

---

## Skills 安裝

### 選項 A：安裝所有 Skills（推薦）

```bash
git clone https://github.com/AsiaOstrich/universal-dev-skills.git
cd universal-dev-skills
./install.sh
# Select: Global installation
```

### 選項 B：僅安裝特定 Skills

```bash
# Copy only Level 1 skills
cp -r universal-dev-skills/skills/ai-collaboration-standards ~/.claude/skills/
cp -r universal-dev-skills/skills/commit-standards ~/.claude/skills/
```

**檢查清單**：
- [ ] 已安裝 ai-collaboration-standards skill
- [ ] 已安裝 commit-standards skill

---

## 參考文件

將這些文件複製到您的專案：

```bash
# In your project root
mkdir -p .standards

# Copy Level 1 reference documents
cp path/to/universal-dev-standards/core/checkin-standards.md .standards/
cp path/to/universal-dev-standards/core/spec-driven-development.md .standards/
```

**檢查清單**:
- [ ] `.standards/` 目錄已建立
- [ ] `checkin-standards.md` 已複製
- [ ] `spec-driven-development.md` 已複製

---

## 驗證

### 測試 Skills

1. Open Claude Code in your project
2. Try: "Help me write a commit message" → Should follow Conventional Commits
3. Ask about code changes → Should provide evidence-based responses

### 檢閱參考文件

- [ ] Read `checkin-standards.md` and understand quality gates
- [ ] Read `spec-driven-development.md` and understand the methodology

---

## 最終檢查清單

| Item | Status |
|------|--------|
| ai-collaboration-standards skill | [ ] |
| commit-standards skill | [ ] |
| .standards/checkin-standards.md | [ ] |
| .standards/spec-driven-development.md | [ ] |

---

## 下一步

準備升級到等級二（推薦）時：
- 參見 [recommended.md](recommended.md)

---

## 相關標準

- [Recommended Adoption Checklist](recommended.md) - Level 2 升級指南
- [Enterprise Adoption Checklist](enterprise.md) - Level 3 升級指南
- [Checkin Standards](../../../core/checkin-standards.md) - 簽入標準
- [Spec-Driven Development](../../../core/spec-driven-development.md) - 規格驅動開發

---

## 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.1 | 2025-12-24 | Added: Related Standards, License sections |
| 1.0.0 | 2025-12-23 | Initial checklist |

---

## 授權

本檢查清單以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
