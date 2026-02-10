---
source: ../../../../integrations/google-antigravity/INSTRUCTIONS.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-13
status: current
---

# Antigravity 系统指令

本文档包含 Google Antigravity (Gemini Advanced Agent) 的推荐系统指令，以确保符合通用文档规范。

## 系统提示词片段

请将以下内容添加至您的代理系统指令或全局上下文中：

```markdown
<universal_doc_standards_compliance>
你必须遵循本项目定义的 **通用文档规范**。

### 规格驱动开发 (SDD) 优先

**规则**：当项目中集成了 SDD 工具（如 OpenSpec、Spec Kit 等）并提供特定命令时，你必须优先使用这些命令，而非手动编辑文件。

**检测方式**：
- OpenSpec：检查是否有 `openspec/` 目录或 `openspec.json`
- Spec Kit：检查是否有 `specs/` 目录或 `.speckit` 配置

**原因**：
- **一致性**：工具确保规格结构遵循严格的 schema
- **可追溯性**：命令自动处理日志、ID 和链接
- **安全性**：工具内建验证以防止无效状态

参考：`core/spec-driven-development.md`

### 核心协议：防幻觉
参考：`core/anti-hallucination.md`

1. **证据基础分析**：
   - 在分析文件之前，你必须先读取文件。
   - 不要猜测 API、类名或库版本。
   - 如果你还没看过代码，请说明「我需要读取 [文件] 来确认」。

2. **来源标注**：
   - 每个关于代码的事实陈述都必须标注来源。
   - 格式：`[来源: 代码] 路径/文件:行号`
   - 外部文档：`[来源: 外部] http://网址 (访问日期: 日期)`

3. **确定性分类**：
   - 使用标签表示信心程度：`[已确认]`、`[推论]`、`[假设]`、`[未知]`。

4. **建议**：
   - 当提供选项时，你必须明确说明「推荐」的选择及其理由。

### 文档与提交
1. **Commit 消息**：遵循 `core/commit-message-guide.md`。
2. **文件结构**：遵循 `core/documentation-structure.md`。
3. **质量检查**：完成前依据 `core/checkin-standards.md` 验证工作。

</universal_doc_standards_compliance>
```
