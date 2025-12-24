# Level 2: Recommended Adoption Checklist | 等級二：推薦採用檢查清單

> Professional quality standards for team projects | 團隊專案的專業品質標準
>
> Setup time: ~2 hours | 設置時間：約 2 小時

---

## Prerequisites | 前置條件

- [ ] Level 1 (Essential) completed | 等級一（基本）已完成
- [ ] Team agreement on adoption | 團隊已同意採用

---

## Skills Installation | Skills 安裝

Install additional Level 2 skills:

```bash
# If not already installed globally
git clone https://github.com/AsiaOstrich/universal-dev-skills.git
cd universal-dev-skills
./install.sh
# Select: Global installation
```

**Checklist | 檢查清單**:

### From Level 1 | 來自等級一
- [ ] ai-collaboration-standards | ai-collaboration-standards
- [ ] commit-standards | commit-standards

### Level 2 Skills | 等級二 Skills
- [ ] code-review-assistant | code-review-assistant
- [ ] git-workflow-guide | git-workflow-guide
- [ ] release-standards | release-standards
- [ ] testing-guide | testing-guide
- [ ] requirement-assistant | requirement-assistant

---

## Reference Documents | 參考文件

Level 2 has no additional reference documents beyond Level 1.

等級二沒有超出等級一的額外參考文件。

**Verify Level 1 Documents | 驗證等級一文件**:
- [ ] `.standards/checkin-standards.md` exists
- [ ] `.standards/spec-driven-development.md` exists

---

## Extensions (Select Applicable) | 延伸規範（選擇適用的）

### Language Extensions | 語言延伸

**For C# Projects | 用於 C# 專案**:
```bash
cp path/to/universal-dev-standards/extensions/languages/csharp-style.md .standards/
```
- [ ] `csharp-style.md` copied (if applicable)

**For PHP Projects | 用於 PHP 專案**:
```bash
cp path/to/universal-dev-standards/extensions/languages/php-style.md .standards/
```
- [ ] `php-style.md` copied (if applicable)

### Framework Extensions | 框架延伸

**For Fat-Free Framework | 用於 Fat-Free 框架**:
```bash
cp path/to/universal-dev-standards/extensions/frameworks/fat-free-patterns.md .standards/
```
- [ ] `fat-free-patterns.md` copied (if applicable)

### Locale Extensions | 地區延伸

**For Traditional Chinese Teams | 用於繁體中文團隊**:
```bash
cp path/to/universal-dev-standards/extensions/locales/zh-tw.md .standards/
```
- [ ] `zh-tw.md` copied (if applicable)

---

## AI Tool Integrations | AI 工具整合

Select and install based on your tools:

### GitHub Copilot
```bash
mkdir -p .github
cp path/to/universal-dev-standards/integrations/github-copilot/copilot-instructions.md .github/
```
- [ ] `.github/copilot-instructions.md` installed

### Cursor IDE
```bash
cp path/to/universal-dev-standards/integrations/cursor/.cursorrules .
```
- [ ] `.cursorrules` installed

### Windsurf IDE
```bash
cp path/to/universal-dev-standards/integrations/windsurf/.windsurfrules .
```
- [ ] `.windsurfrules` installed

### Cline
```bash
cp path/to/universal-dev-standards/integrations/cline/.clinerules .
```
- [ ] `.clinerules` installed

### OpenSpec (for SDD workflow)
```bash
cp -r path/to/universal-dev-standards/integrations/openspec/ .openspec/
```
- [ ] `.openspec/` directory installed

---

## Team Configuration | 團隊配置

### Git Workflow Selection | Git 工作流程選擇

Review `git-workflow.md` and select:
- [ ] Trunk-Based Development
- [ ] GitHub Flow
- [ ] GitFlow

Document decision in project README or CONTRIBUTING.md.

### Code Review Process | 程式碼審查流程

- [ ] Define required reviewers
- [ ] Set up branch protection rules
- [ ] Configure code-review-assistant skill settings

### Testing Standards | 測試標準

- [ ] Define coverage targets (recommended: 70/20/7/3)
- [ ] Set up CI/CD pipeline
- [ ] Configure testing-guide skill settings

---

## Verification | 驗證

### Test All Skills | 測試所有 Skills

1. **commit-standards**: Write a commit → Should follow Conventional Commits
2. **code-review-assistant**: Review code → Should use systematic checklist
3. **git-workflow-guide**: Ask about branching → Should explain chosen workflow
4. **release-standards**: Ask about versioning → Should explain SemVer
5. **testing-guide**: Ask about tests → Should explain testing pyramid

### Verify Integrations | 驗證整合

- [ ] AI tool follows project standards
- [ ] AI tool provides evidence-based responses

---

## Final Checklist | 最終檢查清單

| Category | Items | Status |
|----------|-------|--------|
| **Level 1 Skills** | ai-collaboration-standards, commit-standards | [ ] |
| **Level 2 Skills** | code-review-assistant, git-workflow-guide, release-standards, testing-guide, requirement-assistant | [ ] |
| **Reference Docs** | checkin-standards.md, spec-driven-development.md | [ ] |
| **Extensions** | (selected based on project) | [ ] |
| **Integrations** | (selected based on tools) | [ ] |
| **Team Config** | Workflow, review process, testing targets | [ ] |

---

## Next Steps | 下一步

When ready to upgrade to Level 3 (Enterprise):
- See [enterprise.md](enterprise.md)

準備升級到等級三（企業）時：
- 參見 [enterprise.md](enterprise.md)

---

## Related Standards | 相關標準

- [Essential Adoption Checklist](minimal.md) - Level 1 基本採用
- [Enterprise Adoption Checklist](enterprise.md) - Level 3 升級指南
- [Checkin Standards](../../core/checkin-standards.md) - 簽入標準
- [Git Workflow](../../core/git-workflow.md) - Git 工作流程
- [Testing Standards](../../core/testing-standards.md) - 測試標準
- [Code Review Checklist](../../core/code-review-checklist.md) - 程式碼審查

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.1 | 2025-12-24 | Added: Related Standards, License sections |
| 1.0.0 | 2025-12-23 | Initial checklist |

---

## License | 授權

This checklist is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本檢查清單以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
