---
source: ../../../core/translation-lifecycle-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 翻译生命周期标准

> **语言**: [English](../../../core/translation-lifecycle-standards.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-04-20
**状态**: Trial（到期 2026-10-20）
**适用范围**: 所有具备多语言文档的项目
**来源**: UDS BUG-A06 事后分析（2026-04-20）
**父标准**: [documentation-lifecycle](documentation-lifecycle.md)

---

## 目的

翻译生命周期标准：MISSING 与 OUTDATED 的区别、Semver 严重度分级，以及自动化整合（pre-commit hook、release gate）。

`documentation-lifecycle` 标准提到翻译同步是 release gate 的一环，但未定义如何分类或响应不同程度的漂移。本标准填补这个缺口：翻译文件不存在与略微过时有本质区别，major 版本落差与 patch 升版也有本质区别。若不作区分，团队要么过度阻塞（任何过时都 fail），要么阻塞不足（忽略所有过时直到成为用户可见的问题）。

**证据（BUG-A06 事后分析）**：
1. UDS 在 3 个月内新增 32 个标准时，因缺乏 MISSING gate，翻译全部缺失，直到 Q2 audit 才发现。
2. `anti-hallucination.md` zh-CN 停在 1.5.0，来源已升至 1.5.1——新的 Agent 认识论校准框架段落在 zh-CN 版本中完全缺失，用户看不到。

---

## 核心规范

- `MISSING`（翻译文件不存在）永远是 release blocker — `exit 1`
- `MAJOR` 版本落差（来源 X > 翻译 x，X > x）是 release blocker — `exit 1`
- `MINOR` 版本落差是 advisory — 醒目警告，不阻塞
- `PATCH` 版本落差是 advisory — 柔和警告，不阻塞
- 严重度由翻译 frontmatter 的 `source_version` 与当前来源版本的 semver 比较决定
- 每个翻译文件必须有 YAML frontmatter，包含 `source`、`source_version`、`translation_version`、`last_synced`、`status`
- 来源标准被修改后，翻译的 `source_version` 立即过时——这种漂移可在 commit 时通过 pre-commit hook 检测

---

## 严重度分级

| 等级 | 条件 | Exit Code | 行动 |
|------|------|-----------|------|
| `MISSING` | 翻译文件不存在 | 1 | 发布前创建 |
| `MAJOR` | 来源 MAJOR > 翻译 MAJOR | 1 | 正式版发布前更新 |
| `MINOR` | 来源 MINOR > 翻译 MINOR（同 MAJOR）| 0 | 下次发布前更新（advisory）|
| `PATCH` | 来源 PATCH > 翻译 PATCH（同 MAJOR.MINOR）| 0 | 方便时更新（advisory）|
| `CURRENT` | source_version == 当前来源版本 | 0 | 无需行动 |

### Semver 差异公式

```
diff_level = compare(
  strip_prerelease(current_source_version),
  strip_prerelease(translation.source_version)
)

其中：major 不同 → MAJOR，minor 不同 → MINOR，其他 → PATCH
```

---

## 触发条件

| 事件 | 必要行动 |
|------|---------|
| 新增标准到 `core/` | 在所有支持的语言创建翻译（MISSING check 阻塞发布）|
| 标准 PATCH 升版 | 方便时更新翻译的 `source_version` + `last_synced` |
| 标准 MINOR 升版（含新段落）| 更新翻译内容 + frontmatter，下次发布前完成 |
| 标准 MAJOR 升版（大改写）| 更新翻译内容 + frontmatter，当前发布前完成（阻塞）|
| 手动更新翻译 | 升版 `translation_version` + `last_synced` |

---

## 翻译 Frontmatter 协议

每个翻译文件必须以以下格式开头：

```yaml
---
source: ../../../core/<filename>.md          # 指向来源的相对路径
source_version: <X.Y.Z>                      # 最后同步时的来源版本
translation_version: <X.Y.Z>                 # 翻译自身的版本
last_synced: <YYYY-MM-DD>                    # 最后同步日期
status: current | outdated | draft           # 人类可读状态
---
```

更新翻译时：
1. 翻译新增或修改的内容
2. 设定 `source_version` = 新的来源版本
3. 设定 `translation_version` = 与 `source_version` 相同（或独立升版）
4. 设定 `last_synced` = 今天日期
5. 设定 `status: current`

---

## 自动化整合

### Pre-Commit Hook

当 `core/*.md` 文件被暂存时，pre-commit hook 执行 `check-translation-sync.sh` 并显示 OUTDATED 警告。Hook **永不阻塞** commit（在 commit 时阻塞过于干扰）——纯提醒用途。

设置方式：`./scripts/install-hooks.sh`（clone 后执行一次）

### Release Gate（`check-translation-sync.sh`）

在 `npm publish` 前或作为 `pre-release-check.sh` 的一部分执行：

```bash
bash scripts/check-translation-sync.sh
# MISSING 或 MAJOR 落差 → exit 1
# 仅 MINOR/PATCH 落差 → exit 0（附 advisory 输出）
```

### Version Bump 整合（`bump-version.sh`）

`bump-version.sh` 在更新版本文件后自动执行 `check-translation-sync.sh`，在升版时即时显示翻译健康状态快照——让作者立即知道发布前需要更新什么。

---

## 情境示例

**情境 1 — 标准 patch 升版（1.0.0 → 1.0.1）**
- 翻译 `source_version: 1.0.0`，来源现在是 `1.0.1`
- 严重度：`PATCH` — advisory，exit 0
- 行动：下次方便时更新，不阻塞发布

**情境 2 — 标准 minor 升版含新段落（1.0.0 → 1.1.0）**
- 翻译 `source_version: 1.0.0`，来源现在是 `1.1.0`
- 严重度：`MINOR` — advisory，exit 0
- 行动：下次发布前更新；zh-CN 用户缺少新内容

**情境 3 — 标准 major 大改写（1.x.x → 2.0.0）**
- 翻译 `source_version: 1.5.0`，来源现在是 `2.0.0`
- 严重度：`MAJOR` — 阻塞，exit 1
- 行动：正式版发布前必须更新

**情境 4 — 新标准，无翻译文件**
- `locales/zh-CN/core/new-standard.md` 不存在
- 严重度：`MISSING` — 阻塞，exit 1
- 行动：发布前创建翻译文件

---

## 错误码

| 代码 | 说明 |
|------|------|
| `TRANS-001` | `MISSING_TRANSLATION` — 来源标准的翻译文件不存在 |
| `TRANS-002` | `MAJOR_VERSION_GAP` — 翻译的 source_version 落后当前来源 MAJOR 版本 |
| `TRANS-003` | `MISSING_FRONTMATTER` — 翻译文件缺少必要的 YAML frontmatter |
| `TRANS-004` | `STALE_SOURCE_REF` — frontmatter 的 `source` 路径指向不存在的文件 |
