---
source: ../../../../skills/commands/derive-tdd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 455bbcab0e1a
status: current
---

---
description: [UDS] Derive TDD test skeletons from SDD specification
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[spec file path | 规格文件路径]"
---

# /derive-tdd — 推演 TDD 测试骨架

从已核准的 SDD 规格文件推演测试骨架文件。

## 工作流程

```
SPEC-XXX.md ──► Parse AC ──► Generate .test.ts ──► Review
```

1. **读取** SDD 规格并提取验收标准
2. **映射** 每个 AC 到一个 `describe`/`it` 区块，采用 AAA 模式
3. **生成** 测试文件，包含 `[TODO]` 标记供实作填入
4. **输出** 推演摘要

## 输出格式

```typescript
describe('SPEC-001: [Feature Name]', () => {
  describe('AC-1: [AC description]', () => {
    it('should [expected behavior]', () => {
      // Arrange — [TODO]
      // Act — [TODO]
      // Assert — [TODO]
    });
  });
});
```

## 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/derive-tdd specs/SPEC-001.md` | Derive TDD from specific spec | 从特定规格推演 TDD |
| `/derive-tdd` | Interactive — ask for spec file | 互动式 — 询问规格文件 |

## AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/derive-tdd` | 列出 status=Approved 的 spec 供选择 |
| `/derive-tdd <spec-file>` | 直接从指定 spec 推演 TDD 骨架 |

### 交互脚本

1. 读取 spec，提取所有 AC
2. 检测项目语言和测试框架

**Decision: 语言/框架检测**
- IF 找到 `vitest.config` / `jest.config` → 使用对应框架
- IF 找到 `pytest.ini` / `pyproject.toml` → 使用 pytest
- IF 无法检测 → 询问用户

3. 将每个 AC 映射为 `describe`/`it` 区块（含 AAA 注释和 `[TODO]` 标记）
4. 展示生成的测试文件内容

🛑 **STOP**: 展示测试骨架后等待用户确认写入

### 停止点

| 停止点 | 等待内容 |
|--------|---------|
| 测试骨架生成后 | 确认内容正确并写入 |

### 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| AC 过于抽象无法转为测试 | 标记 `[TODO: AC needs refinement]`，继续其余 AC |
| 无法检测语言/框架 | 询问用户指定 |
| Spec 无 AC | 告知并引导修改 spec |

## 参考

- 父命令: [/derive](../spec-derivation/SKILL.md)
- 核心规范: [forward-derivation-standards.md](../../core/forward-derivation-standards.md)
