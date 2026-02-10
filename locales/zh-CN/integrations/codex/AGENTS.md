---
source: ../../../../integrations/codex/AGENTS.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-13
status: current
---

# 通用开发规范

本项目遵循通用文档规范，以确保高质量、无幻觉的代码与文档。

---

## 规格驱动开发 (SDD) 优先

**规则**：当项目中集成了 SDD 工具（如 OpenSpec、Spec Kit 等）并提供特定命令时，你必须优先使用这些命令，而非手动编辑文件。

**检测方式**：
- OpenSpec：检查是否有 `openspec/` 目录或 `openspec.json`
- Spec Kit：检查是否有 `specs/` 目录或 `.speckit` 配置

**原因**：
- **一致性**：工具确保规格结构遵循严格的 schema
- **可追溯性**：命令自动处理日志、ID 和链接
- **安全性**：工具内建验证以防止无效状态

参考：`core/spec-driven-development.md`

---

## 防幻觉协议

参考：`core/anti-hallucination.md`

### 1. 证据基础分析

- 在分析文件之前，你必须先读取文件。
- 不要猜测 API、类名或库版本。
- 如果你还没看过代码，请说明：「我需要读取 [文件] 来确认」。

### 2. 来源标注

每个关于代码的事实陈述都必须标注来源：
- 代码：`[来源: 代码] 路径/文件:行号`
- 外部文档：`[来源: 外部] http://网址 (访问日期: 日期)`

### 3. 确定性分类

使用标签表示信心程度：
- `[已确认]` - 已从来源验证
- `[推论]` - 逻辑推论
- `[假设]` - 合理假设
- `[未知]` - 无法确定

### 4. 建议

当提供选项时，你必须明确说明「推荐」的选择及其理由。

---

## 文档与提交

### Commit 消息

遵循 Conventional Commits 格式（参考：`core/commit-message-guide.md`）：

```
<类型>(<范围>): <主题>

<内文>

<页脚>
```

**类型**：feat、fix、docs、chore、test、refactor、style

### 文件结构

遵循文档结构指南（参考：`core/documentation-structure.md`）。

### 质量检查

完成前，依据 `core/checkin-standards.md` 验证工作：
- [ ] 代码编译成功
- [ ] 所有测试通过
- [ ] 无硬编码的秘密信息
- [ ] 如适用，已更新文档

---

## 代码审查规范

参考：`core/code-review-checklist.md`

审查代码时，检查：
1. **功能性** - 是否按预期运作？
2. **安全性** - 无漏洞（OWASP Top 10）？
3. **性能** - 算法和查询是否高效？
4. **可维护性** - 代码是否整洁、易读？
5. **测试** - 测试覆盖率是否足够？

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-01-09 | 初始 OpenAI Codex 集成 |

---

## 许可证

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。
