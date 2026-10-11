---
source: ../../../../skills/commands/ac-coverage.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 149339949adc
---

---
description: "[UDS] Generate AC-to-test traceability matrix and coverage report"
allowed-tools: Read, Grep, Glob
argument-hint: "[spec file path | 规格文件路径]"
---

# AC 覆盖率

从规格文件生成验收条件（AC）与测试的追踪矩阵及覆盖率报告。

## 用法

```bash
/ac-coverage specs/SPEC-001.md            # Analyze specific SPEC
/ac-coverage specs/SPEC-001.md --threshold 90   # Custom threshold
/ac-coverage specs/SPEC-001.md --test-dir tests/ # Specify test directory
```

## 工作流程

1. **解析 SPEC** — 读取规格文件并提取所有 AC 定义（AC-1, AC-2, ...）
2. **扫描测试** — 搜索测试文件中的 `@AC` 和 `@SPEC` 注解
3. **构建矩阵** — 将每个 AC 映射到对应的测试引用
4. **分类状态** — ✅ 已覆盖 | ⚠️ 部分覆盖 | ❌ 未覆盖
5. **计算覆盖率** — `Coverage % = (covered + partial × 0.5) / total × 100`
6. **生成报告** — 输出标准化 Markdown 报告

## 与 `/coverage` 的区别

| | `/coverage` | `/ac-coverage` |
|-|-------------|----------------|
| **层级** | 代码（行/分支/函数） | 需求（AC 到测试） |
| **问题** | "有多少代码被测试了？" | "哪些 AC 有测试？" |
| **输入** | 源代码 + 测试运行器 | SPEC 文件 + 测试注解 |

两者互补 — 使用 `/coverage` 确保代码品质，使用 `/ac-coverage` 确保需求验证。

## 品质门槛

| 情境 | 默认门槛 | 可配置 |
|------|----------|--------|
| **签入** | 80% | `--threshold N` |
| **发布** | 100% | `--threshold N` |
| **警告** | 60% | `--threshold N` |

## 输出格式

```markdown
# AC Coverage Report

**Specification**: SPEC-001 — Feature Name
**Generated**: 2026-03-18
**Coverage**: 75% (6/8 AC)

## Summary

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Covered | 5 | 62.5% |
| ⚠️ Partial | 2 | 25.0% |
| ❌ Uncovered | 1 | 12.5% |

## Traceability Matrix

| AC-ID | Description | Status | Test Reference |
|-------|-------------|--------|----------------|
| AC-1 | ... | ✅ | test-file.ts:15 |

## Gaps
- **AC-8**: Blocked by external dependency

## Action Items
1. [ ] AC-8: Resolve blocker
```

## 下一步引导

`/ac-coverage` 完成后，AI 助手应建议：

> **AC 覆盖率分析完成。建议下一步：**
> - 覆盖率达标 → 执行 `/checkin` 品质关卡
> - 有未覆盖 AC → 执行 `/derive-tdd` 补齐测试
> - 有部分覆盖 AC → 检查缺少的边界情况

## AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/ac-coverage` | 列出可用的 spec 文件供选择 |
| `/ac-coverage <spec-file>` | 直接分析指定 spec 的 AC 覆盖率 |
| `/ac-coverage <spec-file> --threshold N` | 使用自定义门槛 |

### 交互脚本

1. 读取 spec 文件，提取所有 AC
2. 扫描测试文件中的 `@AC` 和 `@SPEC` 注解
3. 建立 AC → Test 追踪矩阵
4. 计算覆盖率
5. 生成报告

**Decision: 覆盖率结果**
- IF 覆盖率 ≥ 门槛 → 标记 ✅，建议 `/checkin`
- IF 有未覆盖 AC → 列出并建议 `/derive-tdd` 补测试
- IF 有部分覆盖 AC → 建议检查缺少的边界情况

🛑 **STOP**: 报告展示后等待用户决定下一步

### 停止点

| 停止点 | 等待内容 |
|--------|---------|
| 报告展示后 | 用户决定补测试或继续 |

### 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| Spec 文件不存在 | 列出可用的 spec 文件 |
| Spec 无 AC 定义 | 告知并引导修改 spec |
| 测试文件无 `@AC` 注解 | 尝试以命名惯例匹配，标记 `[Inferred]` |

## 参考

- [AC Coverage Assistant Skill](../ac-coverage/SKILL.md)
- [Core Standard: Acceptance Criteria Traceability](../../core/acceptance-criteria-traceability.md)
- 相关: [/coverage](./coverage.md) (代码层级覆盖率)
- 相关: [/checkin](./checkin.md) (品质关卡)
