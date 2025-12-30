---
source: ../../../core/project-structure.md
source_version: 1.0.1
translation_version: 1.0.1
last_synced: 2025-12-30
status: current
---

# 專案結構標準

**版本**: 1.0.1
**最後更新**: 2025-12-24
**適用範圍**: 所有軟體專案

[English](../../../core/project-structure.md) | **繁體中文**

---

## 目的

本標準定義專案目錄結構的規範（不僅限於文件檔案），涵蓋常見的工具目錄、建置輸出以及各程式語言的慣例。

---

## 常見專案目錄

### 建議目錄結構

```
project-root/
├── README.md                    # Project overview
├── CONTRIBUTING.md              # Contribution guidelines
├── CHANGELOG.md                 # Version history
├── LICENSE                      # License file
│
├── .standards/ or .claude/      # Development standards
│   └── ...
│
├── docs/                        # Documentation
│   └── ...
│
├── src/                         # Source code (language-dependent)
│   └── ...
│
├── tests/                       # Test files (if separate from src)
│   └── ...
│
├── tools/                       # Development/deployment scripts
│   ├── deployment/              # Deployment scripts
│   ├── migration/               # Database migration tools
│   └── scripts/                 # Utility scripts
│
├── examples/                    # Usage examples
│   └── ...
│
├── dist/                        # Build output (gitignored)
├── build/                       # Compiled artifacts (gitignored)
└── publish/                     # Release packages (partially gitignored)
```

---

## 目錄定義

### 原始碼與建置目錄

| Directory | Purpose | gitignore? | Notes |
|-----------|---------|------------|-------|
| `src/` | Source code | No | Language-dependent; see conventions below |
| `lib/` | Library/dependency code | Depends | Vendored deps may be committed |
| `dist/` | Distribution/build output | **Yes** | Generated files, never commit |
| `build/` | Compiled artifacts | **Yes** | Intermediate build files |
| `out/` | Output directory | **Yes** | Alternative to dist/build |
| `bin/` | Binary executables | **Yes** | Compiled binaries |
| `obj/` | Object files | **Yes** | .NET intermediate files |

### 工具與腳本目錄

| Directory | Purpose | gitignore? | Notes |
|-----------|---------|------------|-------|
| `tools/` | Development/deployment tools | No | Shell scripts, Python tools, etc. |
| `scripts/` | Build/CI scripts | No | Often at root or under tools/ |
| `.github/` | GitHub-specific configs | No | Actions, templates, workflows |
| `.gitlab/` | GitLab-specific configs | No | CI templates |

### 資料與設定目錄

| Directory | Purpose | gitignore? | Notes |
|-----------|---------|------------|-------|
| `data/` | Test/seed data | Depends | Large files should be gitignored |
| `config/` | Configuration files | Depends | Secrets must be gitignored |
| `assets/` | Static assets | No | Images, templates, etc. |
| `resources/` | Resource files | No | Alternative to assets/ |

### 發佈目錄

| Directory | Purpose | gitignore? | Notes |
|-----------|---------|------------|-------|
| `publish/` | Release packages | Partial | May keep release notes, gitignore binaries |
| `release/` | Release artifacts | **Yes** | Generated release files |
| `packages/` | Monorepo packages | No | For monorepo projects |

---

## 各程式語言慣例

### .NET / C#

```
project-root/
├── ProjectName.sln              # Solution file at root
├── ProjectName/                 # Main project
│   ├── ProjectName.csproj
│   ├── Program.cs
│   ├── Controllers/
│   └── ...
├── ProjectName.Domain/          # Domain layer (Clean Architecture)
├── ProjectName.Application/     # Application layer
├── ProjectName.Infrastructure/  # Infrastructure layer
├── ProjectName.Tests/           # Test project
└── docs/
```

**慣例**: 專案為根目錄的子目錄，不放在 `src/` 下。Solution 檔案 (`.sln`) 放在根目錄。

---

### Node.js / TypeScript

```
project-root/
├── package.json
├── tsconfig.json               # If TypeScript
├── src/                        # Source code
│   ├── index.ts
│   ├── controllers/
│   └── services/
├── dist/                       # Compiled output (gitignored)
├── tests/ or __tests__/        # Test files
├── node_modules/               # Dependencies (gitignored)
└── docs/
```

**慣例**: 原始碼放在 `src/`，編譯輸出放在 `dist/`。測試可放在 `tests/`、`__tests__/` 或與原始碼放在一起。

---

### Python

```
project-root/
├── pyproject.toml or setup.py
├── src/                        # src-layout (recommended)
│   └── package_name/
│       ├── __init__.py
│       └── module.py
├── tests/
│   └── test_module.py
├── docs/
├── .venv/                      # Virtual environment (gitignored)
└── dist/                       # Built packages (gitignored)
```

**慣例**: 函式庫使用 src-layout (`src/package_name/`)。應用程式可使用平面結構（`package_name/` 在根目錄）。

---

### Java / Maven

```
project-root/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/
│   │   └── resources/
│   └── test/
│       ├── java/
│       └── resources/
├── target/                     # Build output (gitignored)
└── docs/
```

**慣例**: Maven 標準目錄結構，不應偏離。

---

### Go

```
project-root/
├── go.mod
├── go.sum
├── main.go                     # Or cmd/app/main.go for multiple binaries
├── cmd/                        # Application entry points
│   └── myapp/
│       └── main.go
├── pkg/                        # Public library code
│   └── mylib/
├── internal/                   # Private application code
│   └── ...
├── api/                        # API definitions (protobuf, OpenAPI)
└── docs/
```

**慣例**: 使用 `cmd/` 存放執行檔、`internal/` 存放私有程式碼、`pkg/` 存放公開函式庫。

---

## Monorepo 結構

對於包含多個套件/應用程式的專案：

```
project-root/
├── package.json                # Root package.json (if using npm/yarn workspaces)
├── packages/                   # Shared packages
│   ├── shared-utils/
│   ├── ui-components/
│   └── api-client/
├── apps/                       # Applications
│   ├── web/
│   ├── mobile/
│   └── api-server/
├── tools/                      # Shared build tools
├── docs/                       # Shared documentation
└── README.md
```

---

## IDE 與編輯器產生檔案

### 應加入 .gitignore 的常見檔案

```gitignore
# IDE - JetBrains (IntelliJ, Rider, WebStorm)
.idea/
*.iml

# IDE - Visual Studio
.vs/
*.user
*.suo

# IDE - VS Code (optional, some teams commit .vscode/)
.vscode/
!.vscode/settings.json    # May commit shared settings
!.vscode/extensions.json  # May commit recommended extensions

# IDE - Eclipse
.project
.classpath
.settings/

# macOS
.DS_Store

# Windows
Thumbs.db
desktop.ini
```

### 偵測異常檔案

提交前，確認沒有追蹤 IDE 產生檔案：

```bash
# Check for common IDE artifacts in git
git ls-files | grep -E '^\$|^\.idea|^\.vs/|\.user$|\.suo$'
```

**已知問題**: VSCode 變數展開錯誤可能會建立像 `${workspaceFolder}/` 這樣的目錄。如果發現，請移除：

```bash
# Remove if exists and not tracked
rm -rf '${workspaceFolder}'
```

---

## 反模式

### ❌ 避免以下模式

1. **無意義的巢狀 src 目錄**
   ```
   ❌ project/src/src/main/...
   ```

2. **建置輸出與原始碼混合**
   ```
   ❌ src/
       ├── app.ts
       └── app.js      # Compiled file mixed with source
   ```

3. **一個 repo 中有多個無關專案且未使用 monorepo 結構**
   ```
   ❌ project/
       ├── backend/    # Unrelated project
       └── frontend/   # Another unrelated project
       # No shared tooling, no workspace config
   ```

4. **提交產生檔案**
   ```
   ❌ dist/ tracked in git
   ❌ node_modules/ tracked in git
   ```

5. **儲存庫中的密碼**
   ```
   ❌ config/secrets.json committed
   ❌ .env with real credentials committed
   ```

---

## 驗證檢查清單

提交前請確認：

- [ ] 建置輸出 (`dist/`, `build/`, `bin/`, `obj/`) 已加入 gitignore
- [ ] 相依套件 (`node_modules/`, `.venv/`, `vendor/`) 已加入 gitignore
- [ ] IDE 產生檔案 (`.idea/`, `.vs/`) 已加入 gitignore
- [ ] 提交檔案中沒有密碼
- [ ] 原始碼結構遵循程式語言慣例
- [ ] 沒有異常目錄（例如 `${workspaceFolder}/`）

---

## 相關標準

- [Documentation Structure Standard](documentation-structure.md) - 文件結構標準
- [Code Check-in Standards](checkin-standards.md) - 程式碼簽入標準

---

## 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.1 | 2025-12-24 | Added: Related Standards section |
| 1.0.0 | 2025-12-11 | Initial project structure standard |

---

## 參考資料

- [.NET Project Structure](https://docs.microsoft.com/en-us/dotnet/core/porting/project-structure)
- [Node.js Project Structure Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Python Packaging User Guide](https://packaging.python.org/en/latest/)
- [Standard Go Project Layout](https://github.com/golang-standards/project-layout)
- [Maven Standard Directory Layout](https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html)

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
