# Contributing to Universal Documentation Standards
# 貢獻到通用文件規範

Thank you for your interest in contributing! We welcome contributions to improve these standards.

感謝您有興趣貢獻！我們歡迎改善這些標準的貢獻。

---

## How to Contribute | 如何貢獻

### 1. Suggest Improvements | 提出改善建議

Open an issue describing:
- The problem or gap in current standards
- Your proposed solution
- Examples from your experience

開啟 issue 描述：
- 當前標準的問題或缺口
- 您提出的解決方案
- 來自您經驗的範例

### 2. Add Examples | 新增範例

Submit examples of how you've applied these standards in real projects:
- Create a new directory under `examples/`
- Include configuration files, documentation samples
- Add a README explaining the setup

提交您在實際專案中應用這些標準的範例：
- 在 `examples/` 下建立新目錄
- 包含設定檔、文件範例
- 新增 README 說明設定

### 3. Extend Standards | 擴充標準

Contribute new language/framework/domain extensions:
- Create a new file under appropriate `extensions/` subdirectory
- Follow existing template structure
- Include practical examples
- Ensure it works across different project types

貢獻新的語言/框架/領域擴充：
- 在適當的 `extensions/` 子目錄下建立新檔案
- 遵循現有範本結構
- 包含實際範例
- 確保適用於不同專案類型

### 4. Translate Standards | 翻譯標準

Help translate standards to other languages:
- Create new locale file under `extensions/locales/`
- Follow the template in `extensions/locales/_template.md`
- Ensure terminology consistency

幫助將標準翻譯成其他語言：
- 在 `extensions/locales/` 下建立新語言檔案
- 遵循 `extensions/locales/_template.md` 範本
- 確保術語一致性

### 5. Adding a New Standard (Dual-Layer) | 新增標準 (雙層架構)

All new standards MUST use the UDS v2 format (Physical + Imagination):
- Define `standard` object for human/AI guidelines
- Define `physical_spec` object for machine validation
- Verify using `uds check --standard <id>`

See [MIGRATION-GUIDE-V2.md](docs/internal/MIGRATION-GUIDE-V2.md) for templates.

所有新標準必須使用 UDS v2 格式 (物理層 + 想像層)：
- 定義 `standard` 物件用於人類/AI 指引
- 定義 `physical_spec` 物件用於機器驗證
- 使用 `uds check --standard <id>` 進行驗證

請參閱 [MIGRATION-GUIDE-V2.md](docs/internal/MIGRATION-GUIDE-V2.md) 以獲取範本。

---

## Contribution Guidelines | 貢獻指南

All contributions must:

所有貢獻必須：

### ✅ Quality Requirements | 品質要求

1. **Maintain Universal Applicability | 保持通用適用性**
   - Core standards must be language/framework/domain agnostic
   - 核心標準必須與語言/框架/領域無關

2. **Include Practical Examples | 包含實際範例**
   - Provide examples in at least 2 different contexts
   - 至少提供 2 種不同情境的範例

3. **Follow Documentation Structure | 遵循文件結構**
   - Use existing templates and formatting
   - Include both English and Traditional Chinese (bilingual)
   - 使用現有範本與格式
   - 包含英文與繁體中文（雙語）

4. **Evidence-Based | 基於證據**
   - Support claims with references or real-world validation
   - 以參考資料或實際驗證支持主張

5. **License Compliance | 授權合規**
   - All contributions licensed under CC BY 4.0
   - 所有貢獻以 CC BY 4.0 授權

---

## Pull Request Process | Pull Request 流程

1. **Fork the Repository**
   - Fork 此儲存庫

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-contribution-name
   ```

3. **Make Your Changes**
   - Follow the standards defined in this project
   - Add examples and documentation
   - 遵循此專案定義的標準
   - 新增範例與文件

4. **Test Your Changes**
   - Ensure markdown formatting is correct
   - Check all links work
   - Verify examples are accurate
   - 確保 markdown 格式正確
   - 檢查所有連結有效
   - 驗證範例正確

5. **Commit Your Changes**
   - Follow the commit message guide in this project
   - 遵循此專案的 commit 訊息指南

   ```bash
   git commit -m "docs(extensions): add Python style guide"
   ```

6. **Push to Your Fork**
   ```bash
   git push origin feature/your-contribution-name
   ```

7. **Open a Pull Request**
   - Provide clear description of changes
   - Reference any related issues
   - 提供清楚的變更描述
   - 引用相關 issues

---

## Commit Message Format | Commit 訊息格式

Follow the conventional commits format defined in this project:

遵循此專案定義的 conventional commits 格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New standard or major addition
- `docs`: Documentation improvements
- `fix`: Fix errors in standards
- `refactor`: Reorganize without changing content
- `chore`: Maintenance tasks

**Example**:
```
docs(extensions): add TypeScript style guide

- Add naming conventions for TypeScript
- Include examples for interfaces and types
- Add linting configuration recommendations

Closes #42
```

---

## Code of Conduct | 行為準則

### Our Standards | 我們的標準

- Be respectful and inclusive
- Focus on constructive feedback
- Accept differing viewpoints
- 保持尊重與包容
- 專注於建設性回饋
- 接受不同觀點

### Unacceptable Behavior | 不可接受的行為

- Harassment or discriminatory language
- Trolling or inflammatory comments
- Personal attacks
- 騷擾或歧視性語言
- 惡意挑釁或煽動性評論
- 人身攻擊

---

## Questions? | 有問題？

- Open an issue for questions about the standards
- Tag with `question` label
- We'll respond as soon as possible
- 開啟 issue 詢問關於標準的問題
- 標記 `question` 標籤
- 我們會盡快回覆

---

## Recognition | 致謝

Contributors will be acknowledged in:
- Project README
- Release notes
- Contributors list

貢獻者將會被致謝於：
- 專案 README
- 發布說明
- 貢獻者清單

---

Thank you for helping improve documentation standards for everyone!

感謝您幫助改善所有人的文件標準！
