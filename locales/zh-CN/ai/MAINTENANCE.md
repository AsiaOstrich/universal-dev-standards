---
source: ../../../ai/MAINTENANCE.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-08
status: current
---

# AI 标准维护指南

> **Language**: [English](../../../ai/MAINTENANCE.md) | 繁体中文

**版本**: 1.0.0
**最后更新**: 2025-12-30

---

## 目的

本文件定义 AI 优化标准（`.ai.yaml` 档案）的维护工作流程，确保来源文件与其 AI 优化版本之间的一致性。

---

## 架构概览

```
core/                           ← 一级来源（人类可读 Markdown）
  ├── anti-hallucination.md
  ├── changelog-standards.md
  ├── checkin-standards.md
  ├── ...
  └── versioning.md

ai/                             ← AI 优化版（机器可读 YAML）
  ├── standards/                ← Core 标准 → AI 格式
  │   ├── anti-hallucination.ai.yaml
  │   ├── changelog.ai.yaml
  │   └── ...
  └── options/                  ← 可配置选项
      ├── changelog/
      ├── code-review/
      ├── commit-message/
      ├── documentation/
      ├── git-workflow/
      ├── project-structure/
      └── testing/

locales/zh-TW/                  ← 繁体中文翻译
  ├── core/                     ← 翻译的 Markdown
  └── ai/
      ├── standards/            ← 翻译的 AI 标准
      └── options/              ← 翻译的选项
```

---

## 同步层级

```
core/*.md                       (Level 1 - 一级来源)
    ↓
ai/standards/*.ai.yaml          (Level 2 - AI 优化版)
    ↓
ai/options/*/*.ai.yaml          (Level 3 - 选项，如适用)
    ↓
locales/zh-TW/ai/standards/     (Level 4 - 翻译)
locales/zh-TW/ai/options/
```

**规则**：永远从上往下更新。不要在未更新来源的情况下修改下层档案。

---

## 何时更新

### 触发事件

| 事件 | 所需动作 |
|------|----------|
| `core/*.md` 档案修改 | 更新对应的 `ai/standards/*.ai.yaml` |
| `ai/standards/*.ai.yaml` 引用新选项 | 建立新的 `ai/options/*/*.ai.yaml` |
| 英文 AI 档案更新 | 更新 `locales/zh-TW/ai/` 翻译 |
| 新增 `core/*.md` 档案 | 建立新的 AI 标准 + 翻译 |

---

## 更新工作流程

### 步骤 1：检查目前同步状态

```bash
# 执行翻译同步检查
./scripts/check-translation-sync.sh zh-TW
```

### 步骤 2：识别 core/ 的变更

```bash
# 检查最近变更
git log --oneline core/ -10

# 比较版本
grep -E "^\*\*Version\*\*:|^version:" core/*.md | head -20
```

### 步骤 3：更新 ai/standards/

对于每个修改的 `core/*.md`：

1. **读取来源档案** 以了解变更
2. **更新对应的 `ai/standards/*.ai.yaml`**：
   - 更新 `meta.version` 以符合来源
   - 更新 `meta.updated` 为当前日期
   - 同步内容变更（rules、examples、quick_reference 等）
3. **检查是否引用新选项**：
   - 如果 `options:` 区段引用不存在的档案，建立它们

### 步骤 4：更新 ai/options/（如需要）

当标准引用新选项时：

```yaml
# 范例：ai/standards/testing.ai.yaml 引用新选项
options:
  testing_type:
    choices:
      - id: new-testing-type
        file: options/testing/new-testing-type.ai.yaml  # ← 建立此档案
```

依照现有模式建立新的选项档案。

### 步骤 5：更新翻译

对于每个更新的英文档案：

1. **更新 `locales/zh-TW/ai/standards/*.ai.yaml`**
2. **更新 `locales/zh-TW/ai/options/*/*.ai.yaml`**（如适用）
3. **确保 `meta.version` 符合英文来源**

### 步骤 6：验证同步

```bash
# 再次执行同步检查
./scripts/check-translation-sync.sh zh-TW

# 预期：所有档案 [CURRENT]
```

---

## 档案命名规范

### 标准

| 来源 | AI 标准 |
|------|---------|
| `core/changelog-standards.md` | `ai/standards/changelog.ai.yaml` |
| `core/code-review-checklist.md` | `ai/standards/code-review.ai.yaml` |
| `core/commit-message-guide.md` | `ai/standards/commit-message.ai.yaml` |
| `core/anti-hallucination.md` | `ai/standards/anti-hallucination.ai.yaml` |

**模式**：移除 `-standards`、`-guide`、`-checklist` 等后缀以获得更简洁的名称。

### 选项

```
ai/options/{category}/{option-name}.ai.yaml
```

范例：
- `ai/options/testing/unit-testing.ai.yaml`
- `ai/options/git-workflow/github-flow.ai.yaml`
- `ai/options/project-structure/nodejs.ai.yaml`

---

## AI 标准档案结构

```yaml
# {标准名称} - AI 优化版
# 来源: core/{source-file}.md

id: {standard-id}
meta:
  version: "{x.y.z}"           # 必须符合来源版本
  updated: "{YYYY-MM-DD}"      # 最后更新日期
  source: core/{source}.md     # 来源档案路径
  description: {简短描述}
  language: zh-TW              # 翻译档案需要此栏位

# 选用：如标准有可配置选项
options:
  {option_name}:
    description: {描述}
    multiSelect: {true|false}
    choices:
      - id: {choice-id}
        file: options/{category}/{choice}.ai.yaml
        best_for: {使用场景}

# 主要内容区段（因标准而异）
rules:
  - id: {rule-id}
    trigger: {何时套用}
    instruction: {该做什么}
    priority: {required|recommended}

# 快速参考表格
quick_reference:
  {table_name}:
    columns: [{col1}, {col2}, ...]
    rows:
      - [{val1}, {val2}, ...]
```

---

## 无选项的标准

这些标准是通用规则，不需要可配置选项：

| 标准 | 原因 |
|------|------|
| anti-hallucination | 通用 AI 行为规则 |
| checkin-standards | 通用程式码签入规则 |
| documentation-writing-standards | 通用文件撰写规则 |
| spec-driven-development | 通用 SDD 工作流程 |
| test-completeness-dimensions | 通用测试维度 |
| versioning | 通用版本控制规则 |
| error-codes | 通用错误码格式 |
| logging | 通用日志规则 |

---

## 有选项的标准

| 标准 | 选项类别 | 选项数量 |
|------|----------|----------|
| changelog | changelog/ | 2 |
| code-review | code-review/ | 3 |
| commit-message | commit-message/ | 3 |
| documentation-structure | documentation/ | 3 |
| git-workflow | git-workflow/ | 6 |
| project-structure | project-structure/ | 10 |
| testing | testing/ | 9 |

---

## 更新检查清单

### 更新单一标准时

- [ ] 读取 `core/*.md` 来源以了解变更
- [ ] 更新 `ai/standards/*.ai.yaml` 版本和内容
- [ ] 检查是否引用新选项 → 如需要则建立
- [ ] 更新 `locales/zh-TW/ai/standards/*.ai.yaml`
- [ ] 如适用更新 `locales/zh-TW/ai/options/`
- [ ] 执行 `./scripts/check-translation-sync.sh zh-TW`
- [ ] 验证所有档案显示 `[CURRENT]`

### 新增标准时

- [ ] 建立 `core/{new-standard}.md`
- [ ] 建立 `ai/standards/{new-standard}.ai.yaml`
- [ ] 如需要建立 `ai/options/{category}/` 档案
- [ ] 建立 `locales/zh-TW/core/{new-standard}.md`
- [ ] 建立 `locales/zh-TW/ai/standards/{new-standard}.ai.yaml`
- [ ] 如需要建立 `locales/zh-TW/ai/options/` 翻译
- [ ] 执行同步检查

---

## 常用命令

### macOS / Linux

```bash
# 检查同步状态
./scripts/check-translation-sync.sh zh-TW

# 列出所有 AI 标准
ls ai/standards/*.yaml

# 列出所有选项
find ai/options -name "*.yaml" | sort

# 比较档案数量
echo "EN standards: $(ls ai/standards/*.yaml | wc -l)"
echo "ZH standards: $(ls locales/zh-TW/ai/standards/*.yaml | wc -l)"
echo "EN options: $(find ai/options -name '*.yaml' | wc -l)"
echo "ZH options: $(find locales/zh-TW/ai/options -name '*.yaml' | wc -l)"

# 寻找被引用但不存在的选项
grep -rh "file:.*options/" ai/standards/*.yaml | \
  sed 's/.*file: //' | sort -u | \
  while read f; do [ ! -f "ai/$f" ] && echo "Missing: $f"; done
```

### Windows PowerShell

```powershell
# 检查同步状态
.\scripts\check-translation-sync.ps1 zh-TW

# 列出所有 AI 标准
Get-ChildItem ai\standards\*.yaml

# 列出所有选项
Get-ChildItem -Recurse ai\options -Filter "*.yaml" | Sort-Object FullName

# 比较档案数量
Write-Host "EN standards: $((Get-ChildItem ai\standards\*.yaml).Count)"
Write-Host "ZH standards: $((Get-ChildItem locales\zh-TW\ai\standards\*.yaml).Count)"
Write-Host "EN options: $((Get-ChildItem -Recurse ai\options -Filter '*.yaml').Count)"
Write-Host "ZH options: $((Get-ChildItem -Recurse locales\zh-TW\ai\options -Filter '*.yaml').Count)"
```

---

## 完整同步对照表（按 Core 档案分类）

以下是修改各 `core/*.md` 时需要更新的完整档案列表。

---

### 1. anti-hallucination.md

**复杂度**: 简单（无选项）

```
core/anti-hallucination.md                          ← 来源
├── locales/zh-TW/core/anti-hallucination.md
├── ai/standards/anti-hallucination.ai.yaml
├── locales/zh-TW/ai/standards/anti-hallucination.ai.yaml
└── skills/claude-code/ai-collaboration-standards/
    ├── SKILL.md
    ├── anti-hallucination.md
    └── locales/zh-TW/.../
```

**需更新档案**: ~6 个

---

### 2. changelog-standards.md

**复杂度**: 中等（2 个 YAML 选项）

```
core/changelog-standards.md                         ← 来源
├── locales/zh-TW/core/changelog-standards.md
├── ai/standards/changelog.ai.yaml
├── locales/zh-TW/ai/standards/changelog.ai.yaml
├── ai/options/changelog/
│   ├── keep-a-changelog.ai.yaml
│   └── auto-generated.ai.yaml
├── locales/zh-TW/ai/options/changelog/
│   ├── keep-a-changelog.ai.yaml
│   └── auto-generated.ai.yaml
└── skills/claude-code/release-standards/
    ├── SKILL.md
    ├── changelog-format.md
    └── locales/zh-TW/.../
```

**需更新档案**: ~12 个

---

### 3. checkin-standards.md

**复杂度**: 简单（无选项）

```
core/checkin-standards.md                           ← 来源
├── locales/zh-TW/core/checkin-standards.md
├── ai/standards/checkin-standards.ai.yaml
├── locales/zh-TW/ai/standards/checkin-standards.ai.yaml
└── skills/claude-code/commit-standards/
    ├── SKILL.md
    └── locales/zh-TW/.../
```

**需更新档案**: ~6 个

---

### 4. code-review-checklist.md

**复杂度**: 中等（3 个 YAML 选项）

```
core/code-review-checklist.md                       ← 来源
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
└── skills/claude-code/code-review-assistant/
    ├── SKILL.md
    └── locales/zh-TW/.../
```

**需更新档案**: ~14 个

---

### 5. commit-message-guide.md

**复杂度**: 高（3 个 MD 选项 + 3 个 YAML 选项）

```
core/commit-message-guide.md                        ← 来源
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
└── skills/claude-code/commit-standards/
    ├── SKILL.md
    └── locales/zh-TW/.../
```

**需更新档案**: ~20 个

---

### 6. documentation-structure.md

**复杂度**: 中等（3 个 YAML 选项）

```
core/documentation-structure.md                     ← 来源
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
└── skills/claude-code/documentation-guide/
    ├── SKILL.md
    └── locales/zh-TW/.../
```

**需更新档案**: ~14 个

---

### 7. documentation-writing-standards.md

**复杂度**: 简单（无选项）

```
core/documentation-writing-standards.md             ← 来源
├── locales/zh-TW/core/documentation-writing-standards.md
├── ai/standards/documentation-writing-standards.ai.yaml
├── locales/zh-TW/ai/standards/documentation-writing-standards.ai.yaml
└── skills/claude-code/documentation-guide/
    ├── SKILL.md
    └── locales/zh-TW/.../
```

**需更新档案**: ~6 个

---

### 8. error-code-standards.md

**复杂度**: 简单（无选项、无技能）

```
core/error-code-standards.md                        ← 来源
├── locales/zh-TW/core/error-code-standards.md
├── ai/standards/error-codes.ai.yaml
└── locales/zh-TW/ai/standards/error-codes.ai.yaml
```

**需更新档案**: ~4 个

---

### 9. git-workflow.md

**复杂度**: 高（6 个 MD 选项 + 6 个 YAML 选项）

```
core/git-workflow.md                                ← 来源
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
│   └── (6 个翻译的 .md 档案)
├── ai/options/git-workflow/
│   └── (6 个 .ai.yaml 档案)
├── locales/zh-TW/ai/options/git-workflow/
│   └── (6 个翻译的 .ai.yaml 档案)
└── skills/claude-code/git-workflow-guide/
    ├── SKILL.md
    └── locales/zh-TW/.../
```

**需更新档案**: ~32 个

---

### 10. logging-standards.md

**复杂度**: 简单（无选项、无技能）

```
core/logging-standards.md                           ← 来源
├── locales/zh-TW/core/logging-standards.md
├── ai/standards/logging.ai.yaml
└── locales/zh-TW/ai/standards/logging.ai.yaml
```

**需更新档案**: ~4 个

---

### 11. project-structure.md

**复杂度**: 非常高（5 个 MD 选项 + 10 个 YAML 选项）

```
core/project-structure.md                           ← 来源
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
│   └── (5 个翻译的 .md 档案)
├── ai/options/project-structure/
│   ├── dotnet.ai.yaml
│   ├── nodejs.ai.yaml
│   ├── python.ai.yaml
│   ├── java.ai.yaml
│   ├── go.ai.yaml
│   ├── rust.ai.yaml      ← 仅 YAML（无 MD）
│   ├── kotlin.ai.yaml    ← 仅 YAML（无 MD）
│   ├── php.ai.yaml       ← 仅 YAML（无 MD）
│   ├── ruby.ai.yaml      ← 仅 YAML（无 MD）
│   └── swift.ai.yaml     ← 仅 YAML（无 MD）
├── locales/zh-TW/ai/options/project-structure/
│   └── (10 个翻译的 .ai.yaml 档案)
└── skills/claude-code/project-structure-guide/（如存在）
```

**需更新档案**: ~38 个

**备注**: 5 种语言同时有 MD 和 YAML，5 种语言仅有 YAML。

---

### 12. spec-driven-development.md

**复杂度**: 简单（无选项）

```
core/spec-driven-development.md                     ← 来源
├── locales/zh-TW/core/spec-driven-development.md
├── ai/standards/spec-driven-development.ai.yaml
└── locales/zh-TW/ai/standards/spec-driven-development.ai.yaml
```

**需更新档案**: ~4 个

---

### 13. test-completeness-dimensions.md

**复杂度**: 简单（无选项）

```
core/test-completeness-dimensions.md                ← 来源
├── locales/zh-TW/core/test-completeness-dimensions.md
├── ai/standards/test-completeness-dimensions.ai.yaml
├── locales/zh-TW/ai/standards/test-completeness-dimensions.ai.yaml
└── skills/claude-code/testing-guide/
    ├── SKILL.md
    └── locales/zh-TW/.../
```

**需更新档案**: ~6 个

---

### 14. testing-standards.md

**复杂度**: 非常高（4 个 MD 选项 + 9 个 YAML 选项）

```
core/testing-standards.md                           ← 来源
├── locales/zh-TW/core/testing-standards.md
├── ai/standards/testing.ai.yaml
├── locales/zh-TW/ai/standards/testing.ai.yaml
├── options/testing/
│   ├── unit-testing.md
│   ├── integration-testing.md
│   ├── system-testing.md
│   └── e2e-testing.md
├── locales/zh-TW/options/testing/
│   └── (4 个翻译的 .md 档案)
├── ai/options/testing/
│   ├── unit-testing.ai.yaml
│   ├── integration-testing.ai.yaml
│   ├── system-testing.ai.yaml
│   ├── e2e-testing.ai.yaml
│   ├── istqb-framework.ai.yaml    ← 仅 YAML
│   ├── industry-pyramid.ai.yaml   ← 仅 YAML
│   ├── security-testing.ai.yaml   ← 仅 YAML
│   ├── performance-testing.ai.yaml← 仅 YAML
│   └── contract-testing.ai.yaml   ← 仅 YAML
├── locales/zh-TW/ai/options/testing/
│   └── (9 个翻译的 .ai.yaml 档案)
└── skills/claude-code/testing-guide/
    ├── SKILL.md
    ├── testing-pyramid.md
    └── locales/zh-TW/.../
```

**需更新档案**: ~34 个

**备注**: 4 种测试类型同时有 MD 和 YAML，5 种仅有 YAML。

---

### 15. versioning.md

**复杂度**: 简单（无选项）

```
core/versioning.md                                  ← 来源
├── locales/zh-TW/core/versioning.md
├── ai/standards/versioning.ai.yaml
├── locales/zh-TW/ai/standards/versioning.ai.yaml
└── skills/claude-code/release-standards/
    ├── SKILL.md
    ├── semantic-versioning.md
    └── locales/zh-TW/.../
```

**需更新档案**: ~8 个

---

## 摘要：各标准更新复杂度

| 标准 | 复杂度 | 预估档案数 | 有选项 | 有技能 |
|------|--------|------------|--------|--------|
| anti-hallucination | 简单 | ~6 | ❌ | ✅ |
| changelog-standards | 中等 | ~12 | ✅ 2 YAML | ✅ |
| checkin-standards | 简单 | ~6 | ❌ | ✅ |
| code-review-checklist | 中等 | ~14 | ✅ 3 YAML | ✅ |
| commit-message-guide | 高 | ~20 | ✅ 3 MD + 3 YAML | ✅ |
| documentation-structure | 中等 | ~14 | ✅ 3 YAML | ✅ |
| documentation-writing-standards | 简单 | ~6 | ❌ | ✅ |
| error-code-standards | 简单 | ~4 | ❌ | ❌ |
| git-workflow | 高 | ~32 | ✅ 6 MD + 6 YAML | ✅ |
| logging-standards | 简单 | ~4 | ❌ | ❌ |
| project-structure | 非常高 | ~38 | ✅ 5 MD + 10 YAML | ❌ |
| spec-driven-development | 简单 | ~4 | ❌ | ❌ |
| test-completeness-dimensions | 简单 | ~6 | ❌ | ✅ |
| testing-standards | 非常高 | ~34 | ✅ 4 MD + 9 YAML | ✅ |
| versioning | 简单 | ~8 | ❌ | ✅ |

**总计**: 所有标准约 ~208 个档案

---

## 更新顺序（建议）

更新单一 `core/*.md` 档案时，请依照以下顺序：

```
1. core/{standard}.md                    ← 先编辑来源
2. locales/zh-TW/core/{standard}.md      ← 翻译 core
3. ai/standards/{standard}.ai.yaml       ← 更新 AI 版本
4. locales/zh-TW/ai/standards/...        ← 翻译 AI 版本
5. options/{category}/*.md               ← 如有 MD 选项
6. locales/zh-TW/options/{category}/     ← 翻译 MD 选项
7. ai/options/{category}/*.ai.yaml       ← 如有 YAML 选项
8. locales/zh-TW/ai/options/{category}/  ← 翻译 YAML 选项
9. skills/claude-code/{skill}/           ← 更新相关技能
10. locales/zh-TW/skills/...             ← 翻译技能
```

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.1.0 | 2025-12-30 | 新增 15 个标准的完整同步对照表 |
| 1.0.0 | 2025-12-30 | 初始维护指南 |

---

## 授权

本文件采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权释出。
