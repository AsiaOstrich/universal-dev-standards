# Static vs Dynamic Standards Guide
# 靜態與動態規範指南

**Version**: 1.0.0
**Last Updated**: 2025-12-24
**Applicability**: Projects using AI assistants with this standards framework
**適用範圍**: 使用本規範框架與 AI 助理協作的專案

---

## Purpose | 目的

This guide explains how to classify and deploy development standards based on when they should be applied.

本指南說明如何根據應用時機分類和部署開發規範。

---

## Classification Overview | 分類概覽

```
┌─────────────────────────────────────────────────────────────┐
│           Static Standards | 靜態規範                        │
│           Always active, embedded in project files           │
│           隨時生效，嵌入專案文件中                             │
├─────────────────────────────────────────────────────────────┤
│  • anti-hallucination   → Certainty labels, evidence-based  │
│  • checkin-standards    → Build, test, coverage gates       │
│  • project-structure    → Directory conventions             │
└─────────────────────────────────────────────────────────────┘
                              ↑
                     Always in context
                        隨時在 context 中
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           Dynamic Standards | 動態規範                       │
│           Triggered by keywords, loaded on demand            │
│           關鍵字觸發，按需載入                                │
├─────────────────────────────────────────────────────────────┤
│  • commit-standards     ← "commit", "git"                   │
│  • code-review-assistant← "review", "PR"                    │
│  • git-workflow-guide   ← "branch", "merge"                 │
│  • testing-guide        ← "test", "coverage"                │
│  • release-standards    ← "version", "release"              │
│  • documentation-guide  ← "docs", "README"                  │
│  • requirement-assistant← "spec", "SDD", "新功能"            │
└─────────────────────────────────────────────────────────────┘
```

---

## Static Standards | 靜態規範

### Definition | 定義

Standards that should **always be active** during AI interactions, regardless of the specific task.

無論執行何種任務，AI 互動時都應該**隨時生效**的規範。

### Characteristics | 特徵

- Apply to all interactions (no specific trigger)
- Content is concise (fits in project context file)
- Low token overhead
- Foundational behavioral guidelines

- 適用於所有互動（無特定觸發）
- 內容精簡（適合放在專案 context 文件）
- 低 token 開銷
- 基礎行為準則

### Static Standards List | 靜態規範清單

| Standard | Key Rules | Core Purpose |
|----------|-----------|--------------|
| [anti-hallucination](../core/anti-hallucination.md) | Certainty labels, source citation, recommendations | Prevent AI from making unverified claims |
| [checkin-standards](../core/checkin-standards.md) | Build passes, tests pass, coverage maintained | Ensure code quality before commits |
| [project-structure](../core/project-structure.md) | Directory conventions, gitignore rules | Maintain consistent project organization |

| 規範 | 核心規則 | 核心目的 |
|------|---------|---------|
| [anti-hallucination](../core/anti-hallucination.md) | 確定性標籤、來源引用、建議原則 | 防止 AI 提出未經驗證的聲明 |
| [checkin-standards](../core/checkin-standards.md) | 編譯通過、測試通過、覆蓋率維持 | 確保 commit 前的程式碼品質 |
| [project-structure](../core/project-structure.md) | 目錄慣例、gitignore 規則 | 維持一致的專案組織 |

### Deployment | 部署方式

Add to your project root as one of:

將以下任一檔案加入專案根目錄：

- `CLAUDE.md` (Claude Code)
- `.cursorrules` (Cursor)
- `.github/copilot-instructions.md` (GitHub Copilot)
- `AI_GUIDELINES.md` (generic)

**Template**: See [CLAUDE.md.template](../templates/CLAUDE.md.template)

---

## Dynamic Standards | 動態規範

### Definition | 定義

Standards that are **triggered by specific keywords** or tasks, loaded on demand to provide detailed guidance.

由**特定關鍵字**或任務觸發，按需載入以提供詳細指引的規範。

### Characteristics | 特徵

- Have specific trigger conditions (keywords, commands)
- Content is detailed (would bloat context if always loaded)
- Loaded only when relevant
- Task-specific workflows

- 有特定觸發條件（關鍵字、指令）
- 內容詳細（若隨時載入會使 context 膨脹）
- 僅在相關時載入
- 任務特定的工作流程

### Dynamic Standards List | 動態規範清單

| Standard | Skill | Trigger Keywords |
|----------|-------|-----------------|
| [commit-message-guide](../core/commit-message-guide.md) | commit-standards | commit, git, 提交, feat, fix |
| [code-review-checklist](../core/code-review-checklist.md) | code-review-assistant | review, PR, 審查 |
| [git-workflow](../core/git-workflow.md) | git-workflow-guide | branch, merge, 分支 |
| [testing-standards](../core/testing-standards.md) | testing-guide | test, 測試, coverage |
| [test-completeness-dimensions](../core/test-completeness-dimensions.md) | testing-guide | test completeness |
| [versioning](../core/versioning.md) | release-standards | version, release, 版本 |
| [changelog-standards](../core/changelog-standards.md) | release-standards | changelog, 變更日誌 |
| [documentation-structure](../core/documentation-structure.md) | documentation-guide | README, docs |
| [documentation-writing-standards](../core/documentation-writing-standards.md) | documentation-guide | documentation |
| [spec-driven-development](../core/spec-driven-development.md) | requirement-assistant | spec, SDD, 規格, 新功能 |

### Deployment | 部署方式

Install as Claude Code Skills:

安裝為 Claude Code Skills：

```bash
# Install all skills
cd skills/claude-code && ./install.sh

# Or install selectively
cp -r skills/claude-code/commit-standards ~/.claude/skills/
```

See [Claude Code Skills README](../skills/claude-code/README.md) for details.

---

## Decision Flowchart | 決策流程圖

```
                    ┌─────────────────┐
                    │  New Standard   │
                    └────────┬────────┘
                             │
                             ▼
               ┌─────────────────────────┐
               │ Does it apply to ALL    │
               │ AI interactions?        │
               └────────────┬────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
             YES                          NO
              │                           │
              ▼                           ▼
    ┌─────────────────┐      ┌─────────────────────────┐
    │ STATIC          │      │ Can it be triggered by  │
    │ Add to project  │      │ keywords?               │
    │ context file    │      └────────────┬────────────┘
    └─────────────────┘                   │
                               ┌──────────┴──────────┐
                               │                     │
                              YES                    NO
                               │                     │
                               ▼                     ▼
                    ┌─────────────────┐   ┌─────────────────┐
                    │ DYNAMIC         │   │ Consider if it  │
                    │ Create as Skill │   │ should be       │
                    │ with keywords   │   │ split or merged │
                    └─────────────────┘   └─────────────────┘
```

---

## Skill Trigger Mechanism | Skill 觸發機制

Skills use YAML frontmatter to define triggers:

Skills 使用 YAML frontmatter 定義觸發條件：

```yaml
---
name: commit-standards
description: |
  Format commit messages following conventional commits standard.
  Use when: writing commit messages, git commit, reviewing commit history.
  Keywords: commit, git, message, conventional, 提交, 訊息, feat, fix, refactor.
---
```

**Key elements | 關鍵元素**:
- `Use when:` - Describes trigger scenarios
- `Keywords:` - Lists trigger keywords (supports multiple languages)

---

## Best Practices | 最佳實踐

### For Static Standards | 靜態規範

1. **Keep it concise**: Max 100-200 lines in project context file
2. **Focus on behaviors**: What AI should always do/avoid
3. **Include quick references**: Concise tables, not full documentation
4. **Link to details**: Reference full standards for deep dives

1. **保持精簡**：專案 context 檔案最多 100-200 行
2. **聚焦行為**：AI 應該隨時做/避免的事
3. **包含快速參考**：精簡表格，非完整文件
4. **連結詳細內容**：參考完整標準以深入了解

### For Dynamic Standards | 動態規範

1. **Choose clear keywords**: Distinct, commonly used terms
2. **Support multiple languages**: Include Chinese keywords for Chinese-speaking users
3. **Group related standards**: e.g., testing-guide covers both testing-standards and test-completeness
4. **Provide quick references**: Skills should have concise summary at top

1. **選擇清晰關鍵字**：明確、常用的術語
2. **支援多語言**：為中文使用者包含中文關鍵字
3. **群組相關規範**：如 testing-guide 涵蓋 testing-standards 與 test-completeness
4. **提供快速參考**：Skills 頂部應有精簡摘要

---

## Migration Guide | 遷移指南

### From Full Rules to Static+Dynamic | 從完整規則到靜態+動態

If you currently have all rules in one file:

如果目前所有規則都在一個檔案中：

1. **Extract static rules**: Move anti-hallucination, checkin, and structure rules to `CLAUDE.md`
2. **Convert dynamic rules to Skills**: Create or install Skills for task-specific rules
3. **Remove redundant content**: Delete duplicated rules from context file
4. **Test triggers**: Verify Skills activate on expected keywords

1. **提取靜態規則**：將 anti-hallucination、checkin、結構規則移至 `CLAUDE.md`
2. **轉換動態規則為 Skills**：為任務特定規則建立或安裝 Skills
3. **移除重複內容**：從 context 檔案刪除重複的規則
4. **測試觸發**：驗證 Skills 在預期關鍵字時啟動

---

## Related Resources | 相關資源

- [CLAUDE.md Template](../templates/CLAUDE.md.template) - Ready-to-use static rules template
- [Claude Code Skills](../skills/claude-code/README.md) - Skill installation guide
- [Adoption Guide](./ADOPTION-GUIDE.md) - Overall adoption strategy

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | Initial guide |

---

## License | 授權

This guide is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本指南以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
