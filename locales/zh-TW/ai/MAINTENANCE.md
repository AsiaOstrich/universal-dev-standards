---
source: ../../../ai/MAINTENANCE.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-08
status: current
---

# AI 標準維護指南

> **Language**: [English](../../../ai/MAINTENANCE.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2025-12-30

---

## 目的

本文件定義 AI 優化標準（`.ai.yaml` 檔案）的維護工作流程，確保來源文件與其 AI 優化版本之間的一致性。

---

## 架構概覽

```
core/                           ← 一級來源（人類可讀 Markdown）
  ├── anti-hallucination.md
  ├── changelog-standards.md
  ├── checkin-standards.md
  ├── ...
  └── versioning.md

ai/                             ← AI 優化版（機器可讀 YAML）
  ├── standards/                ← Core 標準 → AI 格式
  │   ├── anti-hallucination.ai.yaml
  │   ├── changelog.ai.yaml
  │   └── ...
  └── options/                  ← 可配置選項
      ├── changelog/
      ├── code-review/
      ├── commit-message/
      ├── documentation/
      ├── git-workflow/
      ├── project-structure/
      └── testing/

locales/zh-TW/                  ← 繁體中文翻譯
  ├── core/                     ← 翻譯的 Markdown
  └── ai/
      ├── standards/            ← 翻譯的 AI 標準
      └── options/              ← 翻譯的選項
```

---

## 同步層級

```
core/*.md                       (Level 1 - 一級來源)
    ↓
ai/standards/*.ai.yaml          (Level 2 - AI 優化版)
    ↓
ai/options/*/*.ai.yaml          (Level 3 - 選項，如適用)
    ↓
locales/zh-TW/ai/standards/     (Level 4 - 翻譯)
locales/zh-TW/ai/options/
```

**規則**：永遠從上往下更新。不要在未更新來源的情況下修改下層檔案。

---

## 何時更新

### 觸發事件

| 事件 | 所需動作 |
|------|----------|
| `core/*.md` 檔案修改 | 更新對應的 `ai/standards/*.ai.yaml` |
| `ai/standards/*.ai.yaml` 引用新選項 | 建立新的 `ai/options/*/*.ai.yaml` |
| 英文 AI 檔案更新 | 更新 `locales/zh-TW/ai/` 翻譯 |
| 新增 `core/*.md` 檔案 | 建立新的 AI 標準 + 翻譯 |

---

## 更新工作流程

### 步驟 1：檢查目前同步狀態

**macOS / Linux:**
```bash
# 執行翻譯同步檢查
./scripts/check-translation-sync.sh zh-TW
```

**Windows PowerShell:**
```powershell
# 執行翻譯同步檢查
.\scripts\check-translation-sync.ps1 -Locale zh-TW
```

### 步驟 2：識別 core/ 的變更

**macOS / Linux / Windows (Git):**
```bash
# 檢查最近變更
git log --oneline core/ -10

# 比較版本
grep -E "^\*\*Version\*\*:|^version:" core/*.md | head -20
```

### 步驟 3：更新 ai/standards/

對於每個修改的 `core/*.md`：

1. **讀取來源檔案** 以了解變更
2. **更新對應的 `ai/standards/*.ai.yaml`**：
   - 更新 `meta.version` 以符合來源
   - 更新 `meta.updated` 為當前日期
   - 同步內容變更（rules、examples、quick_reference 等）
3. **檢查是否引用新選項**：
   - 如果 `options:` 區段引用不存在的檔案，建立它們

### 步驟 4：更新 ai/options/（如需要）

當標準引用新選項時：

```yaml
# 範例：ai/standards/testing.ai.yaml 引用新選項
options:
  testing_type:
    choices:
      - id: new-testing-type
        file: options/testing/new-testing-type.ai.yaml  # ← 建立此檔案
```

依照現有模式建立新的選項檔案。

### 步驟 5：更新翻譯

對於每個更新的英文檔案：

1. **更新 `locales/zh-TW/ai/standards/*.ai.yaml`**
2. **更新 `locales/zh-TW/ai/options/*/*.ai.yaml`**（如適用）
3. **確保 `meta.version` 符合英文來源**

### 步驟 6：驗證同步

**macOS / Linux:**
```bash
# 再次執行同步檢查
./scripts/check-translation-sync.sh zh-TW

# 預期：所有檔案 [CURRENT]
```

**Windows PowerShell:**
```powershell
# 再次執行同步檢查
.\scripts\check-translation-sync.ps1 -Locale zh-TW

# 預期：所有檔案 [CURRENT]
```

---

## 檔案命名規範

### 標準

| 來源 | AI 標準 |
|------|---------|
| `core/changelog-standards.md` | `ai/standards/changelog.ai.yaml` |
| `core/code-review-checklist.md` | `ai/standards/code-review.ai.yaml` |
| `core/commit-message-guide.md` | `ai/standards/commit-message.ai.yaml` |
| `core/anti-hallucination.md` | `ai/standards/anti-hallucination.ai.yaml` |

**模式**：移除 `-standards`、`-guide`、`-checklist` 等後綴以獲得更簡潔的名稱。

### 選項

```
ai/options/{category}/{option-name}.ai.yaml
```

範例：
- `ai/options/testing/unit-testing.ai.yaml`
- `ai/options/git-workflow/github-flow.ai.yaml`
- `ai/options/project-structure/nodejs.ai.yaml`

---

## AI 標準檔案結構

```yaml
# {標準名稱} - AI 優化版
# 來源: core/{source-file}.md

id: {standard-id}
meta:
  version: "{x.y.z}"           # 必須符合來源版本
  updated: "{YYYY-MM-DD}"      # 最後更新日期
  source: core/{source}.md     # 來源檔案路徑
  description: {簡短描述}
  language: zh-TW              # 翻譯檔案需要此欄位

# 選用：如標準有可配置選項
options:
  {option_name}:
    description: {描述}
    multiSelect: {true|false}
    choices:
      - id: {choice-id}
        file: options/{category}/{choice}.ai.yaml
        best_for: {使用場景}

# 主要內容區段（因標準而異）
rules:
  - id: {rule-id}
    trigger: {何時套用}
    instruction: {該做什麼}
    priority: {required|recommended}

# 快速參考表格
quick_reference:
  {table_name}:
    columns: [{col1}, {col2}, ...]
    rows:
      - [{val1}, {val2}, ...]
```

---

## 無選項的標準

這些標準是通用規則，不需要可配置選項：

| 標準 | 原因 |
|------|------|
| anti-hallucination | 通用 AI 行為規則 |
| checkin-standards | 通用程式碼簽入規則 |
| documentation-writing-standards | 通用文件撰寫規則 |
| spec-driven-development | 通用 SDD 工作流程 |
| test-completeness-dimensions | 通用測試維度 |
| versioning | 通用版本控制規則 |
| error-codes | 通用錯誤碼格式 |
| logging | 通用日誌規則 |

---

## 有選項的標準

| 標準 | 選項類別 | 選項數量 |
|------|----------|----------|
| changelog | changelog/ | 2 |
| code-review | code-review/ | 3 |
| commit-message | commit-message/ | 3 |
| documentation-structure | documentation/ | 3 |
| git-workflow | git-workflow/ | 6 |
| project-structure | project-structure/ | 10 |
| testing | testing/ | 9 |

---

## 更新檢查清單

### 更新單一標準時

- [ ] 讀取 `core/*.md` 來源以了解變更
- [ ] 更新 `ai/standards/*.ai.yaml` 版本和內容
- [ ] 檢查是否引用新選項 → 如需要則建立
- [ ] 更新 `locales/zh-TW/ai/standards/*.ai.yaml`
- [ ] 如適用更新 `locales/zh-TW/ai/options/`
- [ ] 執行 `./scripts/check-translation-sync.sh zh-TW`
- [ ] 驗證所有檔案顯示 `[CURRENT]`

### 新增標準時

- [ ] 建立 `core/{new-standard}.md`
- [ ] 建立 `ai/standards/{new-standard}.ai.yaml`
- [ ] 如需要建立 `ai/options/{category}/` 檔案
- [ ] 建立 `locales/zh-TW/core/{new-standard}.md`
- [ ] 建立 `locales/zh-TW/ai/standards/{new-standard}.ai.yaml`
- [ ] 如需要建立 `locales/zh-TW/ai/options/` 翻譯
- [ ] 執行同步檢查

---

## 常用命令

**macOS / Linux:**
```bash
# 檢查同步狀態
./scripts/check-translation-sync.sh zh-TW

# 列出所有 AI 標準
ls ai/standards/*.yaml

# 列出所有選項
find ai/options -name "*.yaml" | sort

# 比較檔案數量
echo "EN standards: $(ls ai/standards/*.yaml | wc -l)"
echo "ZH standards: $(ls locales/zh-TW/ai/standards/*.yaml | wc -l)"
echo "EN options: $(find ai/options -name '*.yaml' | wc -l)"
echo "ZH options: $(find locales/zh-TW/ai/options -name '*.yaml' | wc -l)"

# 尋找被引用但不存在的選項
grep -rh "file:.*options/" ai/standards/*.yaml | \
  sed 's/.*file: //' | sort -u | \
  while read f; do [ ! -f "ai/$f" ] && echo "Missing: $f"; done
```

**Windows PowerShell:**
```powershell
# 檢查同步狀態
.\scripts\check-translation-sync.ps1 -Locale zh-TW

# 列出所有 AI 標準
Get-ChildItem ai\standards\*.yaml

# 列出所有選項
Get-ChildItem -Recurse ai\options -Filter "*.yaml" | Sort-Object FullName

# 比較檔案數量
Write-Host "EN standards: $((Get-ChildItem ai\standards\*.yaml).Count)"
Write-Host "ZH standards: $((Get-ChildItem locales\zh-TW\ai\standards\*.yaml).Count)"
Write-Host "EN options: $((Get-ChildItem -Recurse ai\options -Filter '*.yaml').Count)"
Write-Host "ZH options: $((Get-ChildItem -Recurse locales\zh-TW\ai\options -Filter '*.yaml').Count)"
```

---

## 完整同步對照表（按 Core 檔案分類）

以下是修改各 `core/*.md` 時需要更新的完整檔案列表。

---

### 1. anti-hallucination.md

**複雜度**: 簡單（無選項）

```
core/anti-hallucination.md                          ← 來源
├── locales/zh-TW/core/anti-hallucination.md
├── ai/standards/anti-hallucination.ai.yaml
├── locales/zh-TW/ai/standards/anti-hallucination.ai.yaml
└── skills/ai-collaboration-standards/
    ├── SKILL.md
    ├── anti-hallucination.md
    └── locales/zh-TW/.../
```

**需更新檔案**: ~6 個

---

### 2. changelog-standards.md

**複雜度**: 中等（2 個 YAML 選項）

```
core/changelog-standards.md                         ← 來源
├── locales/zh-TW/core/changelog-standards.md
├── ai/standards/changelog.ai.yaml
├── locales/zh-TW/ai/standards/changelog.ai.yaml
├── ai/options/changelog/
│   ├── keep-a-changelog.ai.yaml
│   └── auto-generated.ai.yaml
├── locales/zh-TW/ai/options/changelog/
│   ├── keep-a-changelog.ai.yaml
│   └── auto-generated.ai.yaml
└── skills/release-standards/
    ├── SKILL.md
    ├── changelog-format.md
    └── locales/zh-TW/.../
```

**需更新檔案**: ~12 個

---

### 3. checkin-standards.md

**複雜度**: 簡單（無選項）

```
core/checkin-standards.md                           ← 來源
├── locales/zh-TW/core/checkin-standards.md
├── ai/standards/checkin-standards.ai.yaml
├── locales/zh-TW/ai/standards/checkin-standards.ai.yaml
└── skills/commit-standards/
    ├── SKILL.md
    └── locales/zh-TW/.../
```

**需更新檔案**: ~6 個

---

### 4. code-review-checklist.md

**複雜度**: 中等（3 個 YAML 選項）

```
core/code-review-checklist.md                       ← 來源
├── locales/zh-TW/core/code-review-checklist.md
├── ai/standards/code-review.ai.yaml
├── locales/zh-TW/ai/standards/code-review.ai.yaml
├── ai/options/code-review/
│   ├── pr-review.ai.yaml
│   ├── pair-programming.ai.yaml
│   └── automated-review.ai.yaml
├── locales/zh-TW/ai/options/code-review/
│   ├── pr-review.ai.yaml
│   ├── pair-programming.ai.yaml
│   └── automated-review.ai.yaml
└── skills/code-review-assistant/
    ├── SKILL.md
    └── locales/zh-TW/.../
```

**需更新檔案**: ~14 個

---

### 5. commit-message-guide.md

**複雜度**: 高（3 個 MD 選項 + 3 個 YAML 選項）

```
core/commit-message-guide.md                        ← 來源
├── locales/zh-TW/core/commit-message-guide.md
├── ai/standards/commit-message.ai.yaml
├── locales/zh-TW/ai/standards/commit-message.ai.yaml
├── options/commit-message/
│   ├── english.md
│   ├── traditional-chinese.md
│   └── bilingual.md
├── locales/zh-TW/options/commit-message/
│   ├── english.md
│   ├── traditional-chinese.md
│   └── bilingual.md
├── ai/options/commit-message/
│   ├── english.ai.yaml
│   ├── traditional-chinese.ai.yaml
│   └── bilingual.ai.yaml
├── locales/zh-TW/ai/options/commit-message/
│   ├── english.ai.yaml
│   ├── traditional-chinese.ai.yaml
│   └── bilingual.ai.yaml
└── skills/commit-standards/
    ├── SKILL.md
    └── locales/zh-TW/.../
```

**需更新檔案**: ~20 個

---

### 6. documentation-structure.md

**複雜度**: 中等（3 個 YAML 選項）

```
core/documentation-structure.md                     ← 來源
├── locales/zh-TW/core/documentation-structure.md
├── ai/standards/documentation-structure.ai.yaml
├── locales/zh-TW/ai/standards/documentation-structure.ai.yaml
├── ai/options/documentation/
│   ├── markdown-docs.ai.yaml
│   ├── api-docs.ai.yaml
│   └── wiki-style.ai.yaml
├── locales/zh-TW/ai/options/documentation/
│   ├── markdown-docs.ai.yaml
│   ├── api-docs.ai.yaml
│   └── wiki-style.ai.yaml
└── skills/documentation-guide/
    ├── SKILL.md
    └── locales/zh-TW/.../
```

**需更新檔案**: ~14 個

---

### 7. documentation-writing-standards.md

**複雜度**: 簡單（無選項）

```
core/documentation-writing-standards.md             ← 來源
├── locales/zh-TW/core/documentation-writing-standards.md
├── ai/standards/documentation-writing-standards.ai.yaml
├── locales/zh-TW/ai/standards/documentation-writing-standards.ai.yaml
└── skills/documentation-guide/
    ├── SKILL.md
    └── locales/zh-TW/.../
```

**需更新檔案**: ~6 個

---

### 8. error-code-standards.md

**複雜度**: 簡單（無選項、無技能）

```
core/error-code-standards.md                        ← 來源
├── locales/zh-TW/core/error-code-standards.md
├── ai/standards/error-codes.ai.yaml
└── locales/zh-TW/ai/standards/error-codes.ai.yaml
```

**需更新檔案**: ~4 個

---

### 9. git-workflow.md

**複雜度**: 高（6 個 MD 選項 + 6 個 YAML 選項）

```
core/git-workflow.md                                ← 來源
├── locales/zh-TW/core/git-workflow.md
├── ai/standards/git-workflow.ai.yaml
├── locales/zh-TW/ai/standards/git-workflow.ai.yaml
├── options/git-workflow/
│   ├── gitflow.md
│   ├── github-flow.md
│   ├── trunk-based.md
│   ├── merge-commit.md
│   ├── squash-merge.md
│   └── rebase-ff.md
├── locales/zh-TW/options/git-workflow/
│   └── (6 個翻譯的 .md 檔案)
├── ai/options/git-workflow/
│   └── (6 個 .ai.yaml 檔案)
├── locales/zh-TW/ai/options/git-workflow/
│   └── (6 個翻譯的 .ai.yaml 檔案)
└── skills/git-workflow-guide/
    ├── SKILL.md
    └── locales/zh-TW/.../
```

**需更新檔案**: ~32 個

---

### 10. logging-standards.md

**複雜度**: 簡單（無選項、無技能）

```
core/logging-standards.md                           ← 來源
├── locales/zh-TW/core/logging-standards.md
├── ai/standards/logging.ai.yaml
└── locales/zh-TW/ai/standards/logging.ai.yaml
```

**需更新檔案**: ~4 個

---

### 11. project-structure.md

**複雜度**: 非常高（5 個 MD 選項 + 10 個 YAML 選項）

```
core/project-structure.md                           ← 來源
├── locales/zh-TW/core/project-structure.md
├── ai/standards/project-structure.ai.yaml
├── locales/zh-TW/ai/standards/project-structure.ai.yaml
├── options/project-structure/
│   ├── dotnet.md
│   ├── nodejs.md
│   ├── python.md
│   ├── java.md
│   └── go.md
├── locales/zh-TW/options/project-structure/
│   └── (5 個翻譯的 .md 檔案)
├── ai/options/project-structure/
│   ├── dotnet.ai.yaml
│   ├── nodejs.ai.yaml
│   ├── python.ai.yaml
│   ├── java.ai.yaml
│   ├── go.ai.yaml
│   ├── rust.ai.yaml      ← 僅 YAML（無 MD）
│   ├── kotlin.ai.yaml    ← 僅 YAML（無 MD）
│   ├── php.ai.yaml       ← 僅 YAML（無 MD）
│   ├── ruby.ai.yaml      ← 僅 YAML（無 MD）
│   └── swift.ai.yaml     ← 僅 YAML（無 MD）
├── locales/zh-TW/ai/options/project-structure/
│   └── (10 個翻譯的 .ai.yaml 檔案)
└── skills/project-structure-guide/（如存在）
```

**需更新檔案**: ~38 個

**備註**: 5 種語言同時有 MD 和 YAML，5 種語言僅有 YAML。

---

### 12. spec-driven-development.md

**複雜度**: 簡單（無選項）

```
core/spec-driven-development.md                     ← 來源
├── locales/zh-TW/core/spec-driven-development.md
├── ai/standards/spec-driven-development.ai.yaml
└── locales/zh-TW/ai/standards/spec-driven-development.ai.yaml
```

**需更新檔案**: ~4 個

---

### 13. test-completeness-dimensions.md

**複雜度**: 簡單（無選項）

```
core/test-completeness-dimensions.md                ← 來源
├── locales/zh-TW/core/test-completeness-dimensions.md
├── ai/standards/test-completeness-dimensions.ai.yaml
├── locales/zh-TW/ai/standards/test-completeness-dimensions.ai.yaml
└── skills/testing-guide/
    ├── SKILL.md
    └── locales/zh-TW/.../
```

**需更新檔案**: ~6 個

---

### 14. testing-standards.md

**複雜度**: 非常高（4 個 MD 選項 + 9 個 YAML 選項）

```
core/testing-standards.md                           ← 來源
├── locales/zh-TW/core/testing-standards.md
├── ai/standards/testing.ai.yaml
├── locales/zh-TW/ai/standards/testing.ai.yaml
├── options/testing/
│   ├── unit-testing.md
│   ├── integration-testing.md
│   ├── system-testing.md
│   └── e2e-testing.md
├── locales/zh-TW/options/testing/
│   └── (4 個翻譯的 .md 檔案)
├── ai/options/testing/
│   ├── unit-testing.ai.yaml
│   ├── integration-testing.ai.yaml
│   ├── system-testing.ai.yaml
│   ├── e2e-testing.ai.yaml
│   ├── istqb-framework.ai.yaml    ← 僅 YAML
│   ├── industry-pyramid.ai.yaml   ← 僅 YAML
│   ├── security-testing.ai.yaml   ← 僅 YAML
│   ├── performance-testing.ai.yaml← 僅 YAML
│   └── contract-testing.ai.yaml   ← 僅 YAML
├── locales/zh-TW/ai/options/testing/
│   └── (9 個翻譯的 .ai.yaml 檔案)
└── skills/testing-guide/
    ├── SKILL.md
    ├── testing-pyramid.md
    └── locales/zh-TW/.../
```

**需更新檔案**: ~34 個

**備註**: 4 種測試類型同時有 MD 和 YAML，5 種僅有 YAML。

---

### 15. versioning.md

**複雜度**: 簡單（無選項）

```
core/versioning.md                                  ← 來源
├── locales/zh-TW/core/versioning.md
├── ai/standards/versioning.ai.yaml
├── locales/zh-TW/ai/standards/versioning.ai.yaml
└── skills/release-standards/
    ├── SKILL.md
    ├── semantic-versioning.md
    └── locales/zh-TW/.../
```

**需更新檔案**: ~8 個

---

## 摘要：各標準更新複雜度

| 標準 | 複雜度 | 預估檔案數 | 有選項 | 有技能 |
|------|--------|------------|--------|--------|
| anti-hallucination | 簡單 | ~6 | ❌ | ✅ |
| changelog-standards | 中等 | ~12 | ✅ 2 YAML | ✅ |
| checkin-standards | 簡單 | ~6 | ❌ | ✅ |
| code-review-checklist | 中等 | ~14 | ✅ 3 YAML | ✅ |
| commit-message-guide | 高 | ~20 | ✅ 3 MD + 3 YAML | ✅ |
| documentation-structure | 中等 | ~14 | ✅ 3 YAML | ✅ |
| documentation-writing-standards | 簡單 | ~6 | ❌ | ✅ |
| error-code-standards | 簡單 | ~4 | ❌ | ❌ |
| git-workflow | 高 | ~32 | ✅ 6 MD + 6 YAML | ✅ |
| logging-standards | 簡單 | ~4 | ❌ | ❌ |
| project-structure | 非常高 | ~38 | ✅ 5 MD + 10 YAML | ❌ |
| spec-driven-development | 簡單 | ~4 | ❌ | ❌ |
| test-completeness-dimensions | 簡單 | ~6 | ❌ | ✅ |
| testing-standards | 非常高 | ~34 | ✅ 4 MD + 9 YAML | ✅ |
| versioning | 簡單 | ~8 | ❌ | ✅ |

**總計**: 所有標準約 ~208 個檔案

---

## 更新順序（建議）

更新單一 `core/*.md` 檔案時，請依照以下順序：

```
1. core/{standard}.md                    ← 先編輯來源
2. locales/zh-TW/core/{standard}.md      ← 翻譯 core
3. ai/standards/{standard}.ai.yaml       ← 更新 AI 版本
4. locales/zh-TW/ai/standards/...        ← 翻譯 AI 版本
5. options/{category}/*.md               ← 如有 MD 選項
6. locales/zh-TW/options/{category}/     ← 翻譯 MD 選項
7. ai/options/{category}/*.ai.yaml       ← 如有 YAML 選項
8. locales/zh-TW/ai/options/{category}/  ← 翻譯 YAML 選項
9. skills/{skill}/           ← 更新相關技能
10. locales/zh-TW/skills/...             ← 翻譯技能
```

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.1.0 | 2025-12-30 | 新增 15 個標準的完整同步對照表 |
| 1.0.0 | 2025-12-30 | 初始維護指南 |

---

## 授權

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。
