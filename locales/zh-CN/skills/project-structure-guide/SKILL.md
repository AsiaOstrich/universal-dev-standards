---
source: ../../../../skills/project-structure-guide/SKILL.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-03-04
status: current
---

# 项目结构指南

> **Language**: [English](../../../../skills/project-structure-guide/SKILL.md) | 简体中文

**版本**：1.1.0
**最后更新**：2026-03-04
**適用性**：Claude Code Skills

---

## 目的

此技能提供根据语言和框架慣例建構项目的指引，協助建立一致、可維護的目录佈局。

## 觸發时机

在以下情况使用此技能：
- 建立新项目
- 重组现有项目结构
- 新增模块或功能
- 设置构建配置
- 建立 .gitignore 文件
- 决定文件的放置位置（代码、文档、配置、资源）
- 在 utils/、helpers/、shared/、lib/ 或 internal/ 之间做选择
- 放置开发中间产物（头脑风暴、RFC、POC、技术调查）

## 支援的语言

| 语言 | 框架/模式 |
|------|-----------|
| Node.js | Express、NestJS、Next.js |
| Python | Django、Flask、FastAPI |
| Java | Spring Boot、Maven、Gradle |
| .NET | ASP.NET Core、Console |
| Go | 标准佈局、cmd/pkg |
| Rust | Binary、Library、Workspace |
| Kotlin | Gradle、Android、Multiplatform |
| PHP | Laravel、Symfony、PSR-4 |
| Ruby | Rails、Gem、Sinatra |
| Swift | SPM、iOS App、Vapor |

## 常見结构模式

### 标准目录

```
project-root/
├── src/              # 原始码
├── tests/            # 测试文件
├── docs/             # 文件
├── tools/            # 建構/部署脚本
├── examples/         # 使用範例
├── config/           # 配置文件
└── .github/          # GitHub 配置
```

### 建構输出（始終 gitignore）

```
dist/                 # 發佈输出
build/                # 编譯产物
out/                  # 输出目录
bin/                  # 二进位执行檔
```

## 语言特定指南

### Node.js

```
project/
├── src/
│   ├── index.js
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── models/
├── tests/
├── package.json
└── .gitignore
```

### Python

```
project/
├── src/
│   └── package_name/
│       ├── __init__.py
│       └── main.py
├── tests/
├── pyproject.toml
└── .gitignore
```

### Go

```
project/
├── cmd/
│   └── appname/
│       └── main.go
├── internal/
├── pkg/
├── go.mod
└── .gitignore
```

## 快速操作

### 建立项目结构

當被要求建立项目时：
1. 詢問语言/框架
2. 生成適當的目录结构
3. 建立必要的配置文件
4. 生成 .gitignore

### 审查结构

审查現有结构时：
1. 检查语言慣例
2. 验证 gitignore 模式
3. 建议改进
4. 識别放錯位置的文件

## 規則

1. **遵循语言惯例** - 每种语言都有既定模式
2. **分离关注点** - 将源代码、测试、文档分开
3. **Gitignore 构建输出** - 永不提交 dist/、build/、out/
4. **一致命名** - 使用语言适当的命名风格
5. **配置在根目录** - 将配置文件放在项目根目录
6. **辨析目录术语** - utils/（无状态、通用）、helpers/（层级绑定）、shared/（跨模块）、lib/（包装依赖）
7. **工作文档放 docs/working/** - 头脑风暴、RFC、POC、技术调查放在 docs/working/ 并进行生命周期管理
8. **生成代码分离** - 放在 src/generated/{type}/，永不与手写代码混合

## 相关标准

- [核心：项目结构](../../core/project-structure.md)
- [核心：文档结构](../../core/documentation-structure.md)
- [指南：文件归档决策指南](../../core/guides/file-placement-guide.md)
- [AI：项目结构选项](../../../../options/project-structure/)


## Next Steps Guidance | 下一步引導

After `/project-structure` completes, the AI assistant should suggest:

> **專案結構已建立或審查完成。建議下一步 / Project structure created or reviewed. Suggested next steps:**
> - 執行 `/sdd` 開始規格驅動開發，將專案結構納入正式規格 ⭐ **Recommended / 推薦** — 確保結構決策有規格追蹤 / Ensures structure decisions are tracked in specs
> - 執行 `/docs` 產生專案文件（README、ARCHITECTURE.md 等） — 讓結構決策有文件記錄 / Document structure decisions
> - 執行 `/ai-friendly-architecture` 設定 AI 上下文配置 — 讓 AI 助手更好地理解專案結構 / Help AI assistants understand the project structure

---

## Related Standards

- [Core: Project Structure](../../core/project-structure.md)
- [Core: Documentation Structure](../../core/documentation-structure.md)
- [Guide: File Placement Decision Guide](../../core/guides/file-placement-guide.md)
- [AI: Project Structure Options](../../ai/options/project-structure/)
