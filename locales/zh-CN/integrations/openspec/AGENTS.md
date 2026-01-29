---
source: ../../../integrations/openspec/AGENTS.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-13
status: current
---

# OpenSpec 指令

使用 OpenSpec 进行规格驱动开发的 AI 编码助手指令。

## 快速检查清单

- 搜索现有工作：`openspec spec list --long`、`openspec list`（仅使用 `rg` 进行全文搜索）
- 决定范围：新功能 vs 修改现有功能
- 选择唯一的 `change-id`：kebab-case，动词开头（`add-`、`update-`、`remove-`、`refactor-`）
- 创建骨架：`proposal.md`、`tasks.md`、`design.md`（仅在需要时），以及每个受影响功能的差异规格
- 撰写差异：使用 `## ADDED|MODIFIED|REMOVED|RENAMED Requirements`；每个需求至少包含一个 `#### Scenario:`
- 验证：`openspec validate [change-id] --strict` 并修复问题
- 请求核准：在提案核准前不要开始实现

## 三阶段工作流程

### 阶段 1：创建变更
在需要以下情况时创建提案：
- 新增功能或特性
- 进行破坏性变更（API、schema）
- 变更架构或模式
- 性能优化（改变行为）
- 更新安全模式

触发条件（示例）：
- 「帮我创建变更提案」
- 「帮我规划变更」
- 「帮我创建提案」
- 「我想创建规格提案」
- 「我想创建规格」

可跳过提案的情况：
- 错误修复（恢复预期行为）
- 错字、格式、注释
- 依赖更新（非破坏性）
- 配置变更
- 现有行为的测试

**工作流程**
1. 审查 `openspec/project.md`、`openspec list` 和 `openspec list --specs` 以了解当前上下文。
2. 选择唯一的动词开头 `change-id`，在 `openspec/changes/<id>/` 下创建 `proposal.md`、`tasks.md`、可选的 `design.md` 和规格差异。
3. 使用 `## ADDED|MODIFIED|REMOVED Requirements` 草拟规格差异，每个需求至少有一个 `#### Scenario:`。
4. 执行 `openspec validate <id> --strict` 并在分享提案前解决所有问题。

### 阶段 2：实现变更
将这些步骤作为待办事项追踪，逐一完成。
1. **阅读 proposal.md** - 了解正在构建什么
2. **阅读 design.md**（如存在）- 审查技术决策
3. **阅读 tasks.md** - 获取实现检查清单
4. **依序实现任务** - 按顺序完成
5. **确认完成** - 确保 `tasks.md` 中每个项目完成后才更新状态
6. **更新检查清单** - 所有工作完成后，将每个任务设为 `- [x]` 以反映实际状态
7. **核准关卡** - 在提案审查和核准前不要开始实现

### 阶段 3：归档变更
部署后，创建单独的 PR：
- 将 `changes/[name]/` 移至 `changes/archive/YYYY-MM-DD-[name]/`
- 如功能有变更则更新 `specs/`
- 对于纯工具类变更使用 `openspec archive <change-id> --skip-specs --yes`（始终明确传递 change ID）
- 执行 `openspec validate --strict` 确认归档的变更通过检查

## 任何任务之前

**上下文检查清单：**
- [ ] 阅读 `specs/[capability]/spec.md` 中的相关规格
- [ ] 检查 `changes/` 中是否有冲突的待处理变更
- [ ] 阅读 `openspec/project.md` 了解惯例
- [ ] 执行 `openspec list` 查看活跃变更
- [ ] 执行 `openspec list --specs` 查看现有功能

**创建规格前：**
- 始终检查功能是否已存在
- 优先修改现有规格而非创建重复项
- 使用 `openspec show [spec]` 审查当前状态
- 如请求模糊，在创建骨架前询问 1-2 个澄清问题

### 搜索指引
- 列举规格：`openspec spec list --long`（或 `--json` 用于脚本）
- 列举变更：`openspec list`（或 `openspec change list --json` - 已弃用但可用）
- 显示详情：
  - 规格：`openspec show <spec-id> --type spec`（使用 `--json` 进行过滤）
  - 变更：`openspec show <change-id> --json --deltas-only`
- 全文搜索（使用 ripgrep）：`rg -n "Requirement:|Scenario:" openspec/specs`

## 快速开始

### CLI 指令

```bash
# 基本指令
openspec list                  # 列出活跃变更
openspec list --specs          # 列出规格
openspec show [item]           # 显示变更或规格
openspec validate [item]       # 验证变更或规格
openspec archive <change-id> [--yes|-y]   # 部署后归档（添加 --yes 用于非交互执行）

# 项目管理
openspec init [path]           # 初始化 OpenSpec
openspec update [path]         # 更新指令文件

# 交互模式
openspec show                  # 提示选择
openspec validate              # 批量验证模式

# 调试
openspec show [change] --json --deltas-only
openspec validate [change] --strict
```

### 指令标志

- `--json` - 机器可读输出
- `--type change|spec` - 区分项目
- `--strict` - 全面验证
- `--no-interactive` - 禁用提示
- `--skip-specs` - 归档时不更新规格
- `--yes`/`-y` - 跳过确认提示（非交互归档）

## 目录结构

```
openspec/
├── project.md              # 项目惯例
├── specs/                  # 当前真相 - 已构建的内容
│   └── [capability]/       # 单一聚焦功能
│       ├── spec.md         # 需求和场景
│       └── design.md       # 技术模式
├── changes/                # 提案 - 应该变更的内容
│   ├── [change-name]/
│   │   ├── proposal.md     # 为何、什么、影响
│   │   ├── tasks.md        # 实现检查清单
│   │   ├── design.md       # 技术决策（可选；见标准）
│   │   └── specs/          # 差异变更
│   │       └── [capability]/
│   │           └── spec.md # ADDED/MODIFIED/REMOVED
│   └── archive/            # 已完成变更
```

## 创建变更提案

### 决策树

```
新请求？
├─ 恢复规格行为的错误修复？ → 直接修复
├─ 错字/格式/注释？ → 直接修复
├─ 新功能/特性？ → 创建提案
├─ 破坏性变更？ → 创建提案
├─ 架构变更？ → 创建提案
└─ 不确定？ → 创建提案（较安全）
```

### 提案结构

1. **创建目录：** `changes/[change-id]/`（kebab-case，动词开头，唯一）

2. **撰写 proposal.md：**
```markdown
# 变更：[变更简述]

## 为何
[1-2 句说明问题/机会]

## 变更内容
- [变更项目列表]
- [以 **BREAKING** 标记破坏性变更]

## 影响
- 受影响规格：[列出功能]
- 受影响代码：[关键文件/系统]
```

3. **创建规格差异：** `specs/[capability]/spec.md`
```markdown
## ADDED Requirements
### Requirement: 新功能
系统应提供...

#### Scenario: 成功案例
- **WHEN** 用户执行动作
- **THEN** 预期结果

## MODIFIED Requirements
### Requirement: 现有功能
[完整的修改后需求]

## REMOVED Requirements
### Requirement: 旧功能
**原因**：[移除原因]
**迁移**：[如何处理]
```
如果多个功能受影响，在 `changes/[change-id]/specs/<capability>/spec.md` 下创建多个差异文件——每个功能一个。

4. **创建 tasks.md：**
```markdown
## 1. 实现
- [ ] 1.1 创建数据库 schema
- [ ] 1.2 实现 API 端点
- [ ] 1.3 添加前端组件
- [ ] 1.4 编写测试
```

5. **在需要时创建 design.md：**
如符合以下任一条件则创建 `design.md`；否则省略：
- 跨模块变更（多个服务/模块）或新架构模式
- 新外部依赖或重大数据模型变更
- 安全、性能或迁移复杂度
- 在编码前需要技术决策来消除歧义

## 规格文件格式

### 重要：场景格式

**正确**（使用 #### 标题）：
```markdown
#### Scenario: 用户登录成功
- **WHEN** 提供有效凭证
- **THEN** 返回 JWT token
```

**错误**（不要使用项目符号或粗体）：
```markdown
- **Scenario: 用户登录**  ❌
**Scenario**: 用户登录     ❌
### Scenario: 用户登录      ❌
```

每个需求必须至少有一个场景。

### 需求用语
- 使用 SHALL/MUST 表示规范性需求（除非刻意为非规范性，否则避免 should/may）

### 差异操作

- `## ADDED Requirements` - 新功能
- `## MODIFIED Requirements` - 行为变更
- `## REMOVED Requirements` - 弃用功能
- `## RENAMED Requirements` - 名称变更

标题以 `trim(header)` 匹配 - 忽略空白。

## 最佳实践

### 简单优先
- 默认为 <100 行新代码
- 单文件实现直到证明不足
- 无明确理由不使用框架
- 选择无聊、经过验证的模式

### 复杂度触发条件
仅在以下情况增加复杂度：
- 性能数据显示当前解决方案过慢
- 具体的规模需求（>1000 用户、>100MB 数据）
- 需要抽象的多个已验证用例

### 清晰引用
- 使用 `file.ts:42` 格式标示代码位置
- 以 `specs/auth/spec.md` 格式引用规格
- 链接相关变更和 PR

### 功能命名
- 使用动词-名词：`user-auth`、`payment-capture`
- 每个功能单一目的
- 10 分钟可理解规则
- 如描述需要「和」则拆分

### 变更 ID 命名
- 使用 kebab-case，简短且描述性：`add-two-factor-auth`
- 优先使用动词开头前缀：`add-`、`update-`、`remove-`、`refactor-`
- 确保唯一性；若已被使用，附加 `-2`、`-3` 等

## 快速参考

### 阶段指示
- `changes/` - 提议，尚未构建
- `specs/` - 已构建和部署
- `archive/` - 已完成变更

### 文件用途
- `proposal.md` - 为何和什么
- `tasks.md` - 实现步骤
- `design.md` - 技术决策
- `spec.md` - 需求和行为

### CLI 基本指令
```bash
openspec list              # 正在进行什么？
openspec show [item]       # 查看详情
openspec validate --strict # 是否正确？
openspec archive <change-id> [--yes|-y]  # 标记完成（添加 --yes 用于自动化）
```

记住：规格是真相。变更是提案。保持同步。
