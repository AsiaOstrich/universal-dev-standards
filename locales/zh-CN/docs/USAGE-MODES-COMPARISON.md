---
source: ../../../docs/USAGE-MODES-COMPARISON.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 65e48ed292b6
status: current
---

# 使用模式比较：Skills vs 规范文件 vs 两者并用

> **语言**: [English](../../../docs/USAGE-MODES-COMPARISON.md) | 简体中文
>
> **版本**: 1.0.0
> **最后更新**: 2026-01-12

本文件比较安装 Universal Development Standards (UDS) 后三种使用模式的效果差异。

---

## 目录

1. [概览](#概览)
2. [模式比较](#模式比较)
3. [详细比较](#详细比较)
4. [使用场景建议](#使用场景建议)
5. [功能覆盖](#功能覆盖)
6. [定量比较](#定量比较)
7. [结论](#结论)

---

## 概览

### 模式 A：仅使用 Skills

**配置方式**：
- 安装时选择 `standardsScope: minimal`
- Skills 位置：装进项目（`--skills-location project`，默认）；插件市场是有限制的替代方式（只支持 Claude Code、只有英文技能文本、只跟正式版）
- 最小化规范文件复制到项目

**包含内容**：
- 16 个 Claude Code Skills（互动式命令）
- 最小化规范文件（仅 reference 类别）

### 模式 B：仅使用规范文件

**配置方式**：
- 安装时选择 `standardsScope: full`
- 跳过 Skills 安装（或选择非 Claude Code 工具）
- 完整规范文件复制到 `.standards/`

**包含内容**：
- 17 个核心规范文件
- 集成文件（.cursorrules、CLAUDE.md 等）
- 无互动式 Skills

### 模式 C：同时使用 Skills 与规范文件

**配置方式**：
- 安装时选择 `standardsScope: full` + Skills 安装

**包含内容**：
- 16 个 Claude Code Skills
- 17 个核心规范文件
- 集成文件

---

## 模式比较

### 快速比较表

| 面向 | 仅 Skills | 仅规范文件 | Skills + 规范文件 |
|------|----------|-----------|------------------|
| 互动式命令 | 16 个 | 无 | 16 个 |
| 规范深度 | 中 | 高 | 高 |
| Token 消耗 | 低 | 中-高 | 高 |
| 多工具支持 | 仅 Claude Code | 全部 9 个 AI 工具 | 全部 9 个 AI 工具 |
| 版本控制 | 外部管理 | Git 追踪 | 混合 |
| 自定义扩展 | 受限 | 完整 | 完整 |
| 学习曲线 | 低 | 高 | 低 |

### 最适合场景

| 模式 | 推荐对象 |
|------|---------|
| **仅 Skills** | 个人开发者，专门使用 Claude Code |
| **仅规范文件** | 多工具团队、企业环境、离线使用 |
| **Skills + 规范文件** | 完整体验、学习 UDS、团队入职 |

---

## 详细比较

### 互动性与使用体验

| 面向 | 仅 Skills | 仅规范文件 | Skills + 规范文件 |
|------|----------|-----------|------------------|
| 互动式命令 | 16 个可用 | 无 | 16 个可用 |
| 上下文感知 | 自动检测 | 需手动阅读 | 自动检测 |
| 工作流程引导 | 逐步引导 | 需自行理解 | 逐步引导 |
| 学习曲线 | 低 | 高 | 低 |

**说明**：
- Skills 提供 `/commit`、`/tdd`、`/code-review` 等命令进行互动引导
- 规范文件需要开发者主动阅读并应用
- Skills 可自动检测上下文（如 git status、项目语言）

### 内容完整性

| 面向 | 仅 Skills | 仅规范文件 | Skills + 规范文件 |
|------|----------|-----------|------------------|
| 规范深度 | 中 | 高 | 高 |
| 示例数量 | 精简 | 丰富 | 丰富 |
| 决策矩阵 | 部分 | 完整 | 完整 |
| 版本追踪 | 否 | 是 | 是 |
| 跨语言示例 | 部分 | 完整 | 完整 |

**说明**：
- Skills 提取规范文件的精华，但省略部分细节
- 规范文件包含完整的决策树、示例、和边界情况
- 如大规模重构模式（`refactoring-standards.md`）在 Skills 中无对应功能

### 工具支持

| 工具 | 仅 Skills | 仅规范文件 | Skills + 规范文件 |
|------|----------|-----------|------------------|
| Claude Code | 完整 | 基础 | 完整 |
| Cursor | 不支持 | 支持 | 支持 |
| Windsurf | 不支持 | 支持 | 支持 |
| Cline | 不支持 | 支持 | 支持 |
| GitHub Copilot | 不支持 | 支持 | 支持 |
| 其他 AI 工具 | 不支持 | 支持 | 支持 |

**说明**：
- Skills 仅支持 Claude Code
- 规范文件可集成到所有 9 个支持的 AI 工具
- 多工具团队需要规范文件

### 维护与更新

| 面向 | 仅 Skills | 仅规范文件 | Skills + 规范文件 |
|------|----------|-----------|------------------|
| 更新方式 | Plugin 自动更新 | `uds update` | 混合 |
| 版本控制 | 外部管理 | Git 追踪 | 部分 |
| 自定义扩展 | 受限 | 完整 | 完整 |
| 团队同步 | 需各自安装 | Git 同步 | 混合 |

**说明**：
- 装进项目的 Skills（默认）可以提交到 Git；来自插件市场的 Skills 由 Claude Code 管理，不在项目内
- 规范文件可放入 Git，团队自动同步
- 自定义规则需要修改规范文件

### Token 使用效率

| 面向 | 仅 Skills | 仅规范文件 | Skills + 规范文件 |
|------|----------|-----------|------------------|
| 基础 Token 消耗 | 低 | 中-高 | 高 |
| 按需加载 | 是 | 否 | 部分 |
| 重复内容 | 无 | 无 | 有 |

**说明**：
- Skills 按需加载，只在调用时消耗 token
- 规范文件集成到 CLAUDE.md 后，每次对话都会加载
- 同时使用时，Skills 与规范文件有部分内容重叠

---

## 使用场景建议

### 场景 1：个人开发者 + 仅使用 Claude Code

**推荐模式**：仅使用 Skills（模式 A）

**原因**：
- Token 消耗最低
- 互动体验最佳
- 无需管理额外文件
- `/commit`、`/tdd`、`/code-review` 命令足够日常使用

**配置方式**：
```bash
uds init -y --skills-location project
# standardsScope 将自动设为 minimal
```

### 场景 2：团队开发 + 多种 AI 工具

**推荐模式**：同时使用 Skills + 规范文件（模式 C）

**原因**：
- 规范文件可 Git 同步，确保团队一致性
- 非 Claude Code 使用者可使用规范文件
- Skills 提供 Claude Code 使用者更好的体验

**配置方式**：
```bash
uds init -y --skills-location project --content-mode index
# 在互动提示中选择多个 AI 工具
```

### 场景 3：严格规范要求的企业环境

**推荐模式**：仅使用规范文件（模式 B）

**原因**：
- 可完全自定义规范内容
- 完整的版本控制和审计追踪
- 不依赖外部 Plugin Marketplace
- 适合需要离线工作的环境

**配置方式**：
```bash
uds init -y --skills-location none --content-mode index
```

### 场景 4：学习 UDS 标准体系

**推荐模式**：同时使用 Skills + 规范文件（模式 C）

**原因**：
- Skills 提供引导式学习
- 规范文件提供深入参考
- 可对照 Skills 行为与规范内容

---

## 功能覆盖

### Skills 强项但规范文件较弱的功能

| 功能 | 对应 Skill |
|------|-----------|
| 方法论切换 | `/methodology switch` |
| 阶段检查点提醒 | `methodology-system` |
| 自动提交消息生成 | `/commit` |
| 互动式 TDD 循环 | `/tdd` |

### 规范文件提供但 Skills 未涵盖的功能

| 功能 | 对应规范文件 |
|------|-------------|
| 大规模重构模式（Strangler Fig） | `refactoring-standards.md` |
| 技术债评估矩阵 | `refactoring-standards.md` |
| 完整错误码分类体系 | `error-code-standards.md` |
| 日志采样策略 | `logging-standards.md` |
| 项目类型映射矩阵 | `documentation-writing-standards.md` |

### 两者均完整覆盖的功能

| 功能 | Skill | 规范文件 |
|------|-------|---------|
| Conventional Commits | `commit-standards` | `commit-message-guide.md` |
| 测试金字塔 | `testing-guide` | `testing-standards.md` |
| 代码审查清单 | `code-review-assistant` | `code-review-checklist.md` |
| 语义化版本 | `release-standards` | `versioning.md` |
| CHANGELOG 格式 | `changelog-guide` | `changelog-standards.md` |

---

## 定量比较

### 内容量比较

| 指标 | 仅 Skills | 仅规范文件 | Skills + 规范文件 |
|------|----------|-----------|------------------|
| 文件数量 | ~16 Skills | ~17 规范 | ~33 总计 |
| 估计行数 | ~3,000 | ~8,000 | ~11,000 |
| 估计 Token | ~15K | ~40K | ~50K |

### 各领域功能覆盖率

| 领域 | 仅 Skills | 仅规范文件 | Skills + 规范文件 |
|------|----------|-----------|------------------|
| 版本管理 | 90% | 100% | 100% |
| 测试规范 | 85% | 100% | 100% |
| 代码审查 | 95% | 100% | 100% |
| 重构指引 | 30% | 100% | 100% |
| 错误处理 | 70% | 100% | 100% |
| 日志规范 | 60% | 100% | 100% |

---

## 结论

### 效果差异总结

1. **互动性**：Skills > 规范文件（Skills 提供主动引导）
2. **完整性**：规范文件 > Skills（规范文件涵盖更多细节）
3. **效率**：Skills > 规范文件（按需加载，token 消耗低）
4. **灵活性**：规范文件 > Skills（可自定义、可版本控制）
5. **多工具支持**：规范文件 > Skills（Skills 仅限 Claude Code）

### 最佳实践建议

```
个人开发者 + Claude Code
  └─ 推荐：仅 Skills（模式 A）
     └─ 配置：standardsScope: minimal + 技能装进项目

团队开发 + 混合工具
  └─ 推荐：Skills + 规范文件（模式 C）
     └─ 配置：standardsScope: full + 技能装进项目
     └─ 规范文件纳入 Git 管理

企业环境 + 合规要求
  └─ 推荐：仅规范文件（模式 B）
     └─ 配置：standardsScope: full + 无 Skills
     └─ 可完全离线使用
```

### 总体评价

| 模式 | 适合对象 | 评分 |
|------|---------|------|
| 仅 Skills | 个人快速开发 | ★★★★☆ |
| 仅规范文件 | 多工具团队/企业 | ★★★★☆ |
| Skills + 规范文件 | 完整体验/学习 | ★★★★★ |

**结论**：三种模式各有优势，选择取决于团队规模、工具组合、和合规要求。对于希望获得最完整体验的用户，建议同时使用 Skills 与规范文件。

---

## 相关文件

- [CLI 初始化选项](CLI-INIT-OPTIONS.md) - 完整 CLI 选项指南
- [采用指南](../../../adoption/ADOPTION-GUIDE.md) - 标准采用指南
- [Skills README](../../../skills/README.md) - Claude Code Skills 文件

---

**由 Universal Dev Standards 团队维护**
