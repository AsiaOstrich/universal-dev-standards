---
source: ../../../core/versioning.md
source_version: 1.4.0
translation_version: 1.4.0
last_synced: 2026-06-24
status: current
---

> **語言**: [English](../../../core/versioning.md) | 繁體中文

# 語義化版本標準

**版本**: 1.3.0
**最後更新**: 2026-06-23
**適用範圍**: 所有有版本發布的軟體專案

---

## 目的

本標準定義如何使用語義化版本 (SemVer) 為軟體發布編號，以清楚地向使用者和維護者傳達變更。

---

## 語義化版本格式

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]

例如:
2.3.1
1.0.0-alpha.1
3.2.0-beta.2+20250112
```

### 組成元素

| Component | Purpose | When to Increment |
|-----------|---------|-------------------|
| **MAJOR** | Breaking changes | Incompatible API changes |
| **MINOR** | New features | Backward-compatible functionality |
| **PATCH** | Bug fixes | Backward-compatible bug fixes |
| **PRERELEASE** | Pre-release identifier | Alpha, beta, rc versions |
| **BUILD** | Build metadata | Build number, commit hash |

---

## 遞增規則

### MAJOR Version (X.0.0)

**遞增時機**:
- Breaking API changes
- Removing deprecated features
- Major architecture changes
- Incompatible behavior changes

**範例**:
```
1.9.5 → 2.0.0  # Remove deprecated API
3.2.1 → 4.0.0  # Change return type of public method
```

**指引**:
- Reset MINOR and PATCH to 0
- Document migration guide
- Provide deprecation warnings in previous MINOR versions

---

### MINOR Version (x.Y.0)

**遞增時機**:
- Adding new features (backward-compatible)
- Deprecating features (not removing)
- Substantial internal improvements
- New public APIs

**範例**:
```
2.3.5 → 2.4.0  # Add new API endpoint
1.12.0 → 1.13.0  # Add optional parameter to existing function
```

**指引**:
- Reset PATCH to 0
- Existing functionality unchanged
- New features are opt-in

---

### PATCH Version (x.y.Z)

**遞增時機**:
- Bug fixes (no new features)
- Security patches
- Documentation corrections
- Internal refactoring (no API changes)

**範例**:
```
3.1.2 → 3.1.3  # Fix null pointer exception
2.0.0 → 2.0.1  # Security vulnerability patch
```

**指引**:
- No new functionality
- No API changes
- Safe to update immediately

---

## 預發布版本

Format: `MAJOR.MINOR.PATCH-PRERELEASE`

### 預發布識別碼

| Identifier | Purpose | Stability | Audience |
|------------|---------|-----------|----------|
| `alpha` | Early testing | Unstable | Internal team |
| `beta` | Feature complete | Mostly stable | Early adopters |
| `rc` (release candidate) | Final testing | Stable | Beta testers |

### 範例

```
1.0.0-alpha.1       # First alpha release
1.0.0-alpha.2       # Second alpha release
1.0.0-beta.1        # First beta release
1.0.0-beta.2        # Second beta release
1.0.0-rc.1          # Release candidate 1
1.0.0               # Stable release
```

### 排序

Pre-releases are ordered lexicographically:
```
1.0.0-alpha.1 < 1.0.0-alpha.2 < 1.0.0-beta.1 < 1.0.0-rc.1 < 1.0.0
```

---

## 建置元資料

Format: `MAJOR.MINOR.PATCH+BUILD`

### 範例

```
1.0.0+20250112            # Date-based build
2.3.1+001                 # Sequential build number
3.0.0+sha.5114f85         # Git commit hash
1.2.0-beta.1+exp.sha.5114f85  # Combined pre-release and build
```

### 指引

- Build metadata SHOULD NOT affect version precedence
- Use for CI/CD tracking
- Include in artifacts but not in version comparison

> **關鍵：build metadata 不得作為部署的區分依據。**
> 由於工具鏈在優先序與比較中忽略 `+build`（如上），兩個僅 build metadata 不同的建置
> （`1.2.3+abc` vs `1.2.3+def`）對**版本比較工具**而言**無法區分**——回滾目標與 `semver` 比較
> 視為同一個發布。用 `+sha` 區分行為不同的已部署建置是一種治理逃逸：版本號不再是 changelog /
> SBOM / 稽核 / 回滾 / SLA / CVE 範圍的 join key。任何 ship 的變更 MUST 取得真正的版本 bump 或
> 唯一不可變的 artifact 身分（見下方 **部署版本身分**）——`+sha` **不能**替代。

---

## 部署版本身分

> 來源：一個反覆出現的失敗模式——多個行為不同的 hotfix 建置以**同一個 `X.Y.Z`** 部署，僅靠
> `+sha` 區分，於是「prod 跑的是哪個 / 修補 X 是否真的上了」退化成 commit 考古。

本節規範**可部署單元**的身分——無論該單元對專案而言是什麼（容器 image、tarball、已發布套件）。
它與下方的 [發布流程](#發布流程)（描述一套具體的單機發布流程）互補；此處的身分規則**不論部署機制
為何皆適用**。

### 核心不變量

**每個唯一的可部署建置 artifact MUST 帶有唯一、不可變的版本身分（版本號本體 + commit sha）。**
部署、*晉升（promote）*、或*回滾（rollback）*一個**既有** artifact MUST NOT 改變其身分。

- **錨定在 artifact，而非部署動作。** 新建置（原始碼或依賴不同）⇒ 新版本。*同一個*建置在環境間
  移動（staging → prod，build-once-deploy-many）、重新部署（blue-green / canary）、或回滾，是
  **同一個** artifact、保留其身分——MUST NOT 重新 bump。在 promote/rollback 上重新 bump 會讓版本
  號謊報實際在跑的東西。（回滾還原一個先前的 artifact 時，是還原該 artifact 的原始身分，而非鑄造
  一個新身分。）
- **絕不讓兩個不同的建置共用同一個 `X.Y.Z`。**

### 自動強制，而非靠紀律

此不變量 SHOULD 由自動機制強制，而非單靠人為紀律——上述失敗模式*正是*忘記手動 bump。下列任一皆滿足：

- **commit 驅動的發布自動化**（`semantic-release` / `standard-version`，見 [自動化工具](#自動化工具)）：
  在 CI 中由 commit 歷史推導並 bump 版本，使人無從忘記 bump。
- **git-height 衍生版本**（MinVer / Nerdbank.GitVersioning / GitVersion）：版本由 git 提交拓撲
  推導，故碰撞結構上不可能。對 polyglot / .NET / JVM 專案 RECOMMENDED（自動化工具一節原本以 Node
  為主）。注意 monorepo 與 squash-merge 工作流的注意事項。
- **CI 唯一性閘**：若算出的版本已存在於 git tag 或 registry，則 release 失敗。

### 不可變 artifact（交叉引用）

唯一的*號碼*是必要但不充分——*artifact* 本身也必須不可變且內容定址（例如容器 image 以 digest 引用
而非可變 tag）。具體的 artifact 層級要求——把部署釘在內容位址、禁止 tag/版本重用——**歸
container-image-standards** 且將於該標準訂定；本標準只要求版本身分本身保持唯一且不可變。

### Build 身分可被觀測（交叉引用）

已部署的服務 SHOULD 暴露 `version + commit sha + build time`，讓維運者不必 commit 考古就能知道在跑
什麼；一旦暴露，sha MUST 與已部署 artifact 的 sha 相符（可驗證、非自述），且該端點 SHOULD 受存取
控制（公開端點會洩漏內部 commit 身分）。這是部署 / 可觀測性的關切：build 身分驗證的要求**歸
deployment-standards**（將於該標準訂定），而 **supply-chain-attestation** 已提供 provenance 作為
「此 artifact 確實來自此 sha」的密碼學背書。

---

## 初始開發

### Version 0.x.x

```
0.1.0  # Initial development release
0.2.0  # Add features
0.3.0  # Add more features
...
1.0.0  # First stable release
```

**指引**:
- Major version 0 indicates development phase
- API may change frequently
- Breaking changes allowed in MINOR versions
- Move to 1.0.0 when API is stable

---

## 版本生命週期

### 發布週期範例

```
Development Phase:
0.1.0 → 0.2.0 → 0.9.0

First Stable Release:
1.0.0

Feature Additions:
1.0.0 → 1.1.0 → 1.2.0

Bug Fixes:
1.2.0 → 1.2.1 → 1.2.2

Next Major Release:
1.2.2 → 2.0.0-alpha.1 → 2.0.0-beta.1 → 2.0.0-rc.1 → 2.0.0
```

---

## 變更日誌整合

> **另見**：完整的 CHANGELOG 撰寫指南、格式範本和範例，請參閱 [changelog-standards.md](changelog-standards.md)。

### CHANGELOG.md 快速參考

CHANGELOG 檔案應遵循 [Keep a Changelog](https://keepachangelog.com/) 格式，包含以下類別：

| 類別 | 用於 |
|------|------|
| `Added` | 新功能 |
| `Changed` | 現有功能的變更 |
| `Deprecated` | 將來會移除的功能 |
| `Removed` | 已移除的功能 |
| `Fixed` | 錯誤修復 |
| `Security` | 安全漏洞修補 |

**重大變更**：前綴加上 `**BREAKING**:` 以確保可見性。

完整的格式範本和範例，請參閱 [changelog-standards.md](changelog-standards.md)。

### 排除規則

CHANGELOG **不應**記錄以下類型的變更：

#### 1. 被 `.gitignore` 排除的目錄

被版本控制排除的目錄不會被簽入，因此不應記錄在 CHANGELOG 中。

**原則**: 任何在專案 `.gitignore` 中列出的目錄或檔案，都不應記錄在 CHANGELOG 中。

**常見排除類別 (範例)**:

| 類別 | 常見目錄/檔案 | 原因 |
|------|--------------|------|
| AI 協作輔助 | `.claude/`, `.cursor/`, `.ai/` | 本地開發輔助，不納入版控 |
| 開發規範 | `.standards/` | 本地規範文件，不納入版控 |
| 建置輸出 | `dist/`, `build/`, `out/` | 建置產物，不納入版控 |
| 大型資料 | `data/`, `datasets/` | 資料檔案，不納入版控 |

**檢查方式**:

**macOS / Linux:**
```bash
# 產生 CHANGELOG 前，檢查專案的 .gitignore 排除項目
cat .gitignore | grep -E "^[^#*]" | head -20
```

**Windows PowerShell:**
```powershell
# 產生 CHANGELOG 前，檢查專案的 .gitignore 排除項目
Get-Content .gitignore | Where-Object { $_ -match "^[^#*]" } | Select-Object -First 20
```

**Note**: 每個專案應根據自己的 `.gitignore` 設定來決定排除項目。上表僅為常見範例。

#### 2. 建置產物與暫存檔案

以下類型的變更也不應記錄：

- `bin/`, `obj/`, `Release/`, `Debug/` 等建置輸出
- `*.log`, `*.tmp` 等暫存檔案
- `node_modules/`, `packages/` 等依賴目錄

#### 3. 環境與設定檔案（敏感資料）

包含敏感資料的檔案不應記錄：

- `*.env`, `.env.*` 環境變數檔案
- `*.local.json`, `*.local.yaml` 本地設定檔案 (如 .NET 的 `appsettings.*.local.json`)
- `*.pem`, `*.key`, `*.p12` 金鑰與憑證檔案
- `credentials.*`, `secrets.*` 憑證檔案

### 最佳實踐

產生 CHANGELOG 時應遵循以下流程：

1. **列出變更 commits**

   **macOS / Linux / Windows (Git):**
   ```bash
   git log main..HEAD --oneline
   ```

2. **排除不需記錄的 commits**
   - 含「gitignore」、「版控」、「雜項(版控)」類型的 commits
   - 僅修改被排除目錄的 commits

3. **分類記錄**
   - 只記錄會被簽入版本庫的實際程式碼或文件變更
   - 確保所有記錄的檔案路徑在版本庫中存在

4. **驗證記錄**

   **macOS / Linux:**
   ```bash
   # 確認記錄的路徑存在於版本庫
   git ls-files | grep -E "path/to/file"
   ```

   **Windows PowerShell:**
   ```powershell
   # 確認記錄的路徑存在於版本庫
   git ls-files | Select-String -Pattern "path/to/file"
   ```

---

## 發布流程

### 流程概覽

完整的 Release 流程包含 5 個階段：

1. **Pre-release Diagnosis** (診斷階段) - 強制性
2. **Environment Preparation** (環境準備)
3. **Package Generation** (打包生成)
4. **Deployment Execution** (部署執行)
5. **Post-release Verification** (驗證階段)

### Phase 1: Pre-release Diagnosis (診斷階段) - 強制性

**目的**: 在生成升級包前，評估目標伺服器的環境狀態

**檢查項目**:
- 系統工具版本
- 必要驅動程式
- 磁碟空間
- 資料庫連線
- 應用程式版本
- 配置項完整性

**通過條件** (Quality Gate):
- 所有必要工具已安裝
- 磁碟空間充足 (至少 500MB)
- 資料庫連線正常
- 無系統級錯誤

**失敗處理**:
- 若診斷失敗，執行環境準備 (Phase 2)
- 修復後重新執行診斷
- 不得跳過診斷直接打包

---

### Phase 2: Environment Preparation (環境準備)

**目的**: 依照診斷報告結果，安裝缺失的工具和驅動

**驗證標準**:
- 所有診斷項目通過
- 資料庫連線測試成功
- 驗證工具無報錯

---

### Phase 3: Package Generation (打包生成)

**目的**: 生成包含最新版本的升級包

**執行步驟**:
```bash
# 1. 確認當前分支和版本
git branch
git describe --tags

# 2. 生成升級包 (使用專案提供的打包腳本)
./tools/generate-upgrade-package.sh -v v1.2.1 -o ./dist

# 3. 驗證升級包內容
tar -tzf dist/upgrade-package-*.tar.gz | head -20
```

#### 升級包命名規範

**格式**: `{PROJECT}-upgrade-v{VERSION}-{DATE}.tar.gz`

| 元素 | 說明 | 範例 |
|------|------|------|
| `{PROJECT}` | 專案名稱（替換為實際專案名） | `my-app`, `api-server` |
| `{VERSION}` | 版本號（與 Git tag 一致） | `1.2.1`, `2.0.0-beta.1` |
| `{DATE}` | 打包日期 (YYYYMMDD) | `20251128` |

**範例**（將 `{PROJECT}` 替換為您的專案名稱）:
```
{PROJECT}-upgrade-v1.2.1-20251127.tar.gz
{PROJECT}-upgrade-v2.0.0-beta.1-20251201.tar.gz
```

---

### Phase 4: Deployment Execution (部署執行)

**目的**: 在目標伺服器執行升級

**執行步驟**:
```bash
# 1. 上傳升級包到目標伺服器
scp upgrade-package-*.tar.gz user@target:/tmp/

# 2. 解壓升級包
cd /tmp
tar -xzf upgrade-package-*.tar.gz
cd upgrade-package-*/

# 3. Dry-run 測試 (強烈建議)
sudo ./upgrade.sh --dry-run

# 4. 正式升級
sudo ./upgrade.sh
```

**部署驗證**:
- 備份已建立
- 服務停止成功
- 檔案部署成功
- Schema 遷移成功 (若適用)
- 服務啟動成功

---

### Phase 5: Post-release Verification (驗證階段)

**目的**: 確認升級成功，應用程式正常運行

**檢查項目**:
```bash
# 1. 檢查服務狀態
systemctl status your-service

# 2. 檢查應用程式版本
curl http://localhost:PORT/api/version

# 3. 檢查日誌無錯誤
tail -100 /path/to/app.log | grep -i error
```

**成功標準**:
- 服務正常運行
- API 回應正確版本號
- 日誌無致命錯誤
- 功能驗證通過

---

### 發布檢查清單

**Pre-release (診斷與準備)**:
- [ ] 執行伺服器診斷
- [ ] 診斷報告通過所有檢查項目
- [ ] 環境準備完成 (若有缺失)
- [ ] 環境驗證工具通過

**Release (打包與部署)**:
- [ ] 升級包生成成功
- [ ] 升級包內容驗證通過
- [ ] Dry-run 測試無異常
- [ ] 備份計劃已準備
- [ ] 回滾計劃已準備

**Post-release (驗證與監控)**:
- [ ] 服務啟動成功
- [ ] 版本號正確
- [ ] 功能驗證通過
- [ ] 日誌無異常

---

### 品質門檻

以下檢查點**必須通過**，否則不得進入下一階段：

| 階段 | 門檻 | 失敗處理 |
|------|------|---------|
| **Diagnosis** | 診斷報告無錯誤 | 環境準備 |
| **Preparation** | 驗證工具通過 | 修復並重新驗證 |
| **Packaging** | 升級包結構完整 | 重新打包 |
| **Deployment** | Dry-run 無異常 | 分析日誌並修正 |
| **Verification** | 服務正常運行 | 回滾 |

---

### 回滾計劃

若升級失敗，執行以下回滾步驟：

```bash
# 1. 停止服務
sudo systemctl stop your-service

# 2. 還原備份
BACKUP_PATH="/path/to/backup-$(date +%Y%m%d)"
sudo rm -rf /path/to/app
sudo mv "$BACKUP_PATH" /path/to/app

# 3. 重啟服務
sudo systemctl start your-service

# 4. 驗證回滾成功
sudo systemctl status your-service
```

---

### 合規性

**強制性要求**:
- 不得跳過診斷階段
- 不得跳過 dry-run 測試
- 必須留存診斷報告
- 必須準備回滾計劃

**審計追蹤**:
- 所有 Release 文檔留存至少 12 個月
- 診斷報告與 Git Tag 關聯
- 升級日誌保存完整

---

## Git 版本標籤

### 建立標籤

```bash
# Annotated tag (recommended)
git tag -a v1.2.0 -m "Release version 1.2.0"

# Tag with detailed message
git tag -a v2.0.0 -m "Release version 2.0.0

Major changes:
- New authentication system
- Redesigned API
- Performance improvements"

# Push tag to remote
git push origin v1.2.0

# Push all tags
git push origin --tags
```

### 標籤命名慣例

```
v1.0.0          ✅ Recommended (with 'v' prefix)
1.0.0           ✅ Acceptable (without 'v')
version-1.0.0   ❌ Avoid (too verbose)
1.0             ❌ Avoid (incomplete version)
```

---

## 自動化工具

### standard-version (Node.js)

```bash
# Install
npm install --save-dev standard-version

# Add to package.json
{
  "scripts": {
    "release": "standard-version"
  }
}

# Create release
npm run release              # Auto-increment based on commits
npm run release -- --release-as minor  # Force minor version
npm run release -- --release-as 2.0.0  # Specific version
```

### semantic-release (Node.js)

```bash
# Install
npm install --save-dev semantic-release

# Configure in .releaserc.json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/github"
  ]
}
```

---

## 依賴版本範圍

### npm (package.json)

```json
{
  "dependencies": {
    "exact": "1.2.3",           // Exact version
    "patch": "~1.2.3",          // >=1.2.3 <1.3.0
    "minor": "^1.2.3",          // >=1.2.3 <2.0.0
    "range": ">=1.2.3 <2.0.0",  // Explicit range
    "latest": "*"               // ❌ Avoid - any version
  }
}
```

**建議**:
- Use `^` for most dependencies (minor updates)
- Use `~` for conservative updates (patch only)
- Use exact versions for critical dependencies
- Never use `*` in production

---

### .NET (csproj)

```xml
<ItemGroup>
  <!-- Exact version -->
  <PackageReference Include="Newtonsoft.Json" Version="13.0.1" />

  <!-- Minimum version -->
  <PackageReference Include="Microsoft.Extensions.Logging" Version="[8.0.0,)" />

  <!-- Version range -->
  <PackageReference Include="AutoMapper" Version="[12.0.0,13.0.0)" />
</ItemGroup>
```

---

## 破壞性變更與棄用

破壞性變更會驅動 **MAJOR** 版本號遞增（見[遞增規則](#遞增規則)）——這正是 SemVer 向消費者傳達不相容變更的方式。API *契約層級*的演進與退役細節，由負責該領域的標準各自掌管，使每條規則都有單一真實來源：

- **API 版本化策略、向後相容性檢查清單（何謂破壞性變更）、程式碼中的棄用註記、以及遷移指南模板** → [API 設計標準](api-design-standards.md#api-版本控制策略)
- **棄用生命週期、依 API 分級的最短通知期間、`Sunset` / `Deprecation` 標頭、以及消費者通知** → [棄用與日落標準](deprecation-standards.md#api-棄用)

本標準僅保留版本號規則：不相容變更必須以 MAJOR 遞增發布，棄用則應在退役前的某個 MINOR 版本先行宣告（見 [MAJOR 版本](#major-version-x00)指南）。

---

## 專案設定

### Document in README.md

```markdown
## Versioning

This project follows [Semantic Versioning 2.0.0](https://semver.org/).

### Version Format
`MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]`

### Release Cycle
- **Major releases**: Annually (breaking changes)
- **Minor releases**: Quarterly (new features)
- **Patch releases**: As needed (bug fixes)

### Support Policy
- Latest major version: Full support
- Previous major version: Security fixes only (1 year)
- Older versions: No support

### Changelog
See [CHANGELOG.md](CHANGELOG.md) for release history.
```

---

## 版本比較

### 優先級規則

```
1.0.0 < 2.0.0 < 2.1.0 < 2.1.1

1.0.0-alpha < 1.0.0-alpha.1 < 1.0.0-beta < 1.0.0-rc.1 < 1.0.0

1.0.0 < 1.0.0+001 (build metadata ignored in precedence)
```

### 程式碼中比較

```javascript
// JavaScript (using semver package)
const semver = require('semver');

semver.gt('1.2.3', '1.2.2');  // true
semver.satisfies('1.2.3', '^1.0.0');  // true
semver.major('2.3.1');  // 2
```

---

## 常見問題

### Q: When should I release 1.0.0?

**A**: When your API is stable and you're ready to commit to backward compatibility.

---

### Q: Should I bump MAJOR for internal breaking changes?

**A**: No, only for public API changes. Internal refactoring is PATCH or MINOR.

---

### Q: Can I skip versions?

**A**: Yes, but not recommended. Use sequential versioning for clarity.

---

### Q: How do I version libraries vs applications?

**A**:
- **Libraries**: Strictly follow SemVer (API matters)
- **Applications**: Can be more flexible (user experience matters)

---

## 相關標準

- [Changelog Standards](changelog-standards.md) - 變更日誌標準
- [Git Workflow Standards](git-workflow.md) - Git 工作流程標準
- [Commit Message Guide](commit-message-guide.md) - Commit 訊息規範
- [API Design Standards](api-design-standards.md) - API 版本化策略、向後相容性規則、遷移指南
- [Deprecation & Sunset Standards](deprecation-standards.md) - 棄用生命週期與最短通知期間

---

## 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.4.0 | 2026-06-24 | Moved out (to single sources): API Versioning Strategies (de-duplicated), Deprecation Timeline + per-tier periods, Backward Compatibility Checklist, Migration Guide template — now owned by api-design-standards / deprecation-standards (XSPEC-298 R8, UDS #126) |
| 1.3.0 | 2026-06-23 | Added: Deployment Version Identity section; build-metadata-as-deployment-discriminator caveat (from UDS #138) |
| 1.2.0 | 2025-12-30 | Added: API Versioning Strategies, Deprecation Timeline, Backward Compatibility Checklist |
| 1.1.3 | 2025-12-24 | Added: Related Standards section |
| 1.1.2 | 2025-12-11 | Improved: Upgrade package naming example to use generic placeholders instead of hardcoded project names |
| 1.1.1 | 2025-12-04 | Refactored: CHANGELOG exclusion rules to be more generic (removed project-specific directories) |
| 1.1.0 | 2025-12-04 | Added: CHANGELOG exclusion rules, Release Process section |
| 1.0.0 | 2025-11-12 | Initial versioning standard |

---

## 參考資料

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Calendar Versioning](https://calver.org/) (alternative scheme)

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
