---
source: ../../../core/project-structure.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-03-04
status: current
---

# 專案結構標準

**版本**: 1.2.0
**最後更新**: 2026-03-04
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

## Monorepo vs Polyrepo 決策指南

### 決策矩陣

| 因素 | Monorepo 適合 | Polyrepo 適合 |
|------|-------------|--------------|
| **程式碼共享** | 高（共用函式庫、元件） | 低（獨立服務） |
| **團隊結構** | 單一團隊或緊密協作 | 自治團隊 |
| **發布節奏** | 協調發布 | 獨立發布 |
| **CI/CD 複雜度** | 可接受統一管道 | 需要隔離管道 |
| **儲存庫大小** | < 5GB，< 100萬檔案 | 大型資產、長歷史 |

### 快速選擇指南

**選擇 Monorepo 當**:
- 多個專案共享大量程式碼或依賴
- 團隊願意投資於工具

**選擇 Polyrepo 當**:
- 團隊需要發布獨立性
- 各專案完全獨立

---

## Monorepo 工具比較

| 功能 | Turborepo | Nx | Lerna | Rush |
|------|-----------|----|----|------|
| **主要用途** | 任務執行 | 完整框架 | 發布 | 企業級 |
| **學習曲線** | 低 | 中高 | 低 | 高 |
| **建置速度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **遠端快取** | ✅ 內建 | ✅ Nx Cloud | ❌ 手動 | ✅ 內建 |
| **程式碼生成** | ❌ | ✅ 豐富 | ❌ | ❌ |
| **最適合** | 小中型團隊 | 大型團隊、企業 | 簡單發布 | 企業規模 |

---

## Workspace 配置

### pnpm Workspaces

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tools/*'
```

### Yarn Workspaces

```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

---

## 基於套件的架構

### 概念

基於套件的架構按**功能邊界**而非技術層次組織程式碼。每個套件是獨立的單元，有清晰的介面。

```
傳統（分層）                    基於套件（按功能）
─────────────                  ────────────────
src/                           packages/
├── controllers/               ├── authentication/
├── services/                  │   ├── api/
├── models/                    │   ├── domain/
└── repositories/              │   └── infrastructure/
                               ├── orders/
                               └── shared/
```

### 好處

| 好處 | 說明 |
|------|------|
| **清晰邊界** | 每個套件有明確的公開 API |
| **獨立測試** | 可隔離測試套件 |
| **平行開發** | 團隊可在不同套件上工作 |
| **選擇性部署** | 只部署變更的套件 |

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

## 原始碼組織術語

### 目錄用途指南

組織原始碼時，以下目錄具有不同用途：

| 目錄 | 用途 | 何時使用 | 無狀態？ | 可重用範圍 |
|------|------|---------|----------|-----------|
| `utils/` | 純工具函式 | 無狀態、無業務邏輯、跨模組可重用 | 是 | 全域 |
| `helpers/` | 情境特定輔助 | 綁定特定層級（測試、視圖、控制器） | 不一定 | 層級特定 |
| `shared/` | 跨模組共用程式碼 | 2+ 模組使用、可能有套件邊界 | 不一定 | 跨模組 |
| `common/` | shared/ 的別名 | 較不推薦；建議使用 `shared/` | 不一定 | 跨模組 |
| `lib/` | 包裝/vendored 函式庫 | 包裝第三方依賴、內部函式庫 | 不一定 | 專案層級 |
| `internal/` | 套件私有程式碼（Go 慣例） | 模組/套件內部，不對外暴露 | 不一定 | 套件內部 |

### 決策流程

```
是否無狀態且無業務邏輯？
├── 是：在整個專案中可重用嗎？
│   ├── 是 → utils/
│   └── 否：綁定特定層級（測試、視圖）？
│       ├── 是 → helpers/（例如 tests/helpers/、views/helpers/）
│       └── 否 → 放在使用它的模組中
└── 否：被 2+ 模組使用？
    ├── 是 → shared/
    └── 否：是否包裝第三方依賴？
        ├── 是 → lib/
        └── 否 → 放在擁有它的模組中
```

### 範例

```
src/
├── utils/              # formatDate()、slugify()、deepClone()
├── helpers/            # （在 src/ 層級不常見；建議使用層級特定的）
├── shared/
│   ├── types/          # 跨模組 TypeScript 型別
│   └── constants/      # 共用常數
├── lib/
│   └── http-client/    # 包裝 axios 並加入專案預設
└── modules/
    └── auth/
        └── helpers/    # Auth 特定的輔助函式
```

---

## 設定檔歸屬

### 標準位置

| 分類 | 位置 | 範例 |
|------|------|------|
| **根目錄設定** | 專案根目錄 `/` | `package.json`、`tsconfig.json`、`pyproject.toml`、`.eslintrc.json` |
| **應用程式設定** | `config/` 或 `src/config/` | 資料庫設定、功能旗標、應用程式設定 |
| **環境變數** | `.env` 檔案（gitignored） | `.env`、`.env.local`、`.env.production` |
| **CI/CD** | `.github/workflows/` 或 `.gitlab-ci.yml` | CI 管線定義 |
| **基礎設施** | `infra/` 或 `deploy/` | Terraform、Kubernetes manifests、Docker Compose |
| **IDE/編輯器** | 根目錄（多數 gitignored） | `.vscode/`、`.idea/`、`.editorconfig` |

### 決策規則

1. **工具設定** → 專案根目錄（工具預期在此）
2. **應用程式執行時設定** → `config/` 或 `src/config/`
3. **機密資訊** → `.env` 檔案，**永遠 gitignored**
4. **CI/CD** → 平台特定目錄（`.github/`、`.gitlab/`）
5. **基礎設施即程式碼** → `infra/` 或 `deploy/`

---

## 生成碼歸屬

### 標準位置

| 類型 | 位置 | Gitignore？ |
|------|------|------------|
| **API 客戶端 stubs** | `src/generated/` | 視工作流程而定 |
| **Protobuf/gRPC** | `src/generated/proto/` | 是（從 .proto 重新生成） |
| **資料庫型別**（ORM） | `src/generated/db/` | 視 ORM 而定 |
| **OpenAPI 型別** | `src/generated/api/` | 視工作流程而定 |
| **建構產物** | `dist/`、`build/` | 是 |
| **編譯資源** | `out/`、`bin/` | 是 |

### 規則

1. **永遠分離**生成碼與手寫程式碼
2. **使用 `src/generated/`** 作為標準父目錄
3. **可重現則 gitignore** — 如果可從原始檔案（`.proto`、`.graphql`、schema）重新生成，則 gitignore
4. **關鍵則提交** — 如果生成工具不在 CI 中或生成結果非確定性的，則提交輸出
5. **永遠不編輯生成檔案** — 加入標頭註解：`// DO NOT EDIT — generated by [tool]`

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

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.2.0 | 2026-03-04 | 新增：原始碼組織術語（utils/helpers/shared/lib）、設定檔歸屬、生成碼歸屬 |
| 1.1.0 | 2026-01-24 | 新增：Monorepo vs Polyrepo 決策指南、Monorepo 工具比較、Workspace 配置、基於套件的架構 |
| 1.0.1 | 2025-12-24 | 新增：相關標準區段 |
| 1.0.0 | 2025-12-11 | 初始專案結構標準 |

---

## 參考資料

- [.NET Project Structure](https://docs.microsoft.com/en-us/dotnet/core/porting/project-structure)
- [Node.js Project Structure Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Python Packaging User Guide](https://packaging.python.org/en/latest/)
- [Standard Go Project Layout](https://github.com/golang-standards/project-layout)
- [Maven Standard Directory Layout](https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html)
- [Turborepo 文件](https://turbo.build/repo/docs) - 現代 JavaScript/TypeScript monorepo 建置系統
- [Nx 文件](https://nx.dev/getting-started/intro) - 智能 monorepo 工具
- [pnpm Workspaces](https://pnpm.io/workspaces) - 快速、高效的套件管理器 workspaces
- [Monorepo Explained](https://monorepo.tools/) - Monorepo 工具全面指南

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
