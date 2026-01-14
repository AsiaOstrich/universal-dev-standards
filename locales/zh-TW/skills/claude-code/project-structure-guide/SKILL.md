---
source: ../../../../../skills/claude-code/project-structure-guide/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# 專案結構指南

> **Language**: [English](../../../../../skills/claude-code/project-structure-guide/SKILL.md) | 繁體中文

**版本**：1.0.0
**最後更新**：2025-12-30
**適用性**：Claude Code Skills

---

## 目的

此技能提供根據語言和框架慣例建構專案的指引，協助建立一致、可維護的目錄佈局。

## 觸發時機

在以下情況使用此技能：
- 建立新專案
- 重組現有專案結構
- 新增模組或功能
- 設定建構配置
- 建立 .gitignore 檔案

## 支援的語言

| 語言 | 框架/模式 |
|------|-----------|
| Node.js | Express、NestJS、Next.js |
| Python | Django、Flask、FastAPI |
| Java | Spring Boot、Maven、Gradle |
| .NET | ASP.NET Core、Console |
| Go | 標準佈局、cmd/pkg |
| Rust | Binary、Library、Workspace |
| Kotlin | Gradle、Android、Multiplatform |
| PHP | Laravel、Symfony、PSR-4 |
| Ruby | Rails、Gem、Sinatra |
| Swift | SPM、iOS App、Vapor |

## 常見結構模式

### 標準目錄

```
project-root/
├── src/              # 原始碼
├── tests/            # 測試檔案
├── docs/             # 文件
├── tools/            # 建構/部署腳本
├── examples/         # 使用範例
├── config/           # 配置檔案
└── .github/          # GitHub 配置
```

### 建構輸出（始終 gitignore）

```
dist/                 # 發佈輸出
build/                # 編譯產物
out/                  # 輸出目錄
bin/                  # 二進位執行檔
```

## 語言特定指南

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

### 建立專案結構

當被要求建立專案時：
1. 詢問語言/框架
2. 生成適當的目錄結構
3. 建立必要的配置檔案
4. 生成 .gitignore

### 審查結構

審查現有結構時：
1. 檢查語言慣例
2. 驗證 gitignore 模式
3. 建議改進
4. 識別放錯位置的檔案

## 規則

1. **遵循語言慣例** - 每種語言都有既定模式
2. **分離關注點** - 將原始碼、測試、文件分開
3. **Gitignore 建構輸出** - 永不提交 dist/、build/、out/
4. **一致命名** - 使用語言適當的命名風格
5. **配置在根目錄** - 將配置檔案放在專案根目錄

## 相關標準

- [核心：專案結構](../../../core/project-structure.md)
- [AI：專案結構選項](../../../ai/options/project-structure/)
