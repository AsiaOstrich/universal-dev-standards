# Level 1: Essential Adoption Checklist | 等級一：基本採用檢查清單

> Minimum viable standards for any project | 任何專案的最低可行標準
>
> Setup time: ~30 minutes | 設置時間：約 30 分鐘

---

## Prerequisites | 前置條件

- [ ] Git repository initialized | Git 儲存庫已初始化
- [ ] Claude Code installed (for Skills) | 已安裝 Claude Code（用於 Skills）

---

## Skills Installation | Skills 安裝

### Option A: Install All Skills (Recommended) | 選項 A：安裝全部 Skills（推薦）

```bash
git clone https://github.com/AsiaOstrich/universal-dev-skills.git
cd universal-dev-skills
./install.sh
# Select: Global installation
```

### Option B: Install Specific Skills Only | 選項 B：僅安裝特定 Skills

```bash
# Copy only Level 1 skills
cp -r universal-dev-skills/skills/ai-collaboration-standards ~/.claude/skills/
cp -r universal-dev-skills/skills/commit-standards ~/.claude/skills/
```

**Checklist | 檢查清單**:
- [ ] ai-collaboration-standards skill installed | ai-collaboration-standards skill 已安裝
- [ ] commit-standards skill installed | commit-standards skill 已安裝

---

## Reference Documents | 參考文件

Copy these documents to your project:

```bash
# In your project root
mkdir -p .standards

# Copy Level 1 reference documents
cp path/to/universal-dev-standards/core/checkin-standards.md .standards/
cp path/to/universal-dev-standards/core/spec-driven-development.md .standards/
```

**Checklist | 檢查清單**:
- [ ] `.standards/` directory created | `.standards/` 目錄已建立
- [ ] `checkin-standards.md` copied | `checkin-standards.md` 已複製
- [ ] `spec-driven-development.md` copied | `spec-driven-development.md` 已複製

---

## Verification | 驗證

### Test Skills | 測試 Skills

1. Open Claude Code in your project
2. Try: "Help me write a commit message" → Should follow Conventional Commits
3. Ask about code changes → Should provide evidence-based responses

### Review Reference Documents | 檢閱參考文件

- [ ] Read `checkin-standards.md` and understand quality gates
- [ ] Read `spec-driven-development.md` and understand the methodology

---

## Final Checklist | 最終檢查清單

| Item | Status |
|------|--------|
| ai-collaboration-standards skill | [ ] |
| commit-standards skill | [ ] |
| .standards/checkin-standards.md | [ ] |
| .standards/spec-driven-development.md | [ ] |

---

## Next Steps | 下一步

When ready to upgrade to Level 2 (Recommended):
- See [recommended.md](recommended.md)

準備升級到等級二（推薦）時：
- 參見 [recommended.md](recommended.md)
