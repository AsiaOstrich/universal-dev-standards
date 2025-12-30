---
source: ../../../core/versioning.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2025-12-30
status: current
---

> **語言**: [English](../../../core/versioning.md) | 繁體中文

# 語義化版本標準

**版本**: 1.2.0
**最後更新**: 2025-12-30
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

> **另見**：完整的 CHANGELOG 撰寫指南，請參閱 [changelog-standards.md](changelog-standards.md)。

### CHANGELOG.md Format

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- New feature X
- New API endpoint Y

### Changed
- Updated dependency Z to v3.0

### Deprecated
- Method A will be removed in v3.0

### Removed
- Old API endpoint B

### Fixed
- Bug fix for issue #123

### Security
- Security vulnerability patch

## [2.1.0] - 2025-11-12

### Added
- OAuth2 authentication support
- Email notification system

### Fixed
- Memory leak in user session cache

## [2.0.0] - 2025-10-01

### Changed
- **BREAKING**: User API response format

### Removed
- **BREAKING**: Deprecated v1 endpoints

## [1.5.2] - 2025-09-15

### Fixed
- Null pointer exception in payment module

[Unreleased]: https://github.com/user/repo/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/user/repo/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/user/repo/compare/v1.5.2...v2.0.0
[1.5.2]: https://github.com/user/repo/releases/tag/v1.5.2
```

### 排除規則

CHANGELOG **不應**記錄以下類型的變更：

#### 1. 被 `.gitignore` 排除的目錄

被版本控制排除的目錄不會被簽入，因此不應記錄在 CHANGELOG 中。

**原則**: 任何在專案 `.gitignore` 中列出的目錄或檔案，都不應記錄在 CHANGELOG 中。

**常見排除類別 (範例)**:

| 類別 | 常見目錄/檔案 | 原因 |
|------|--------------|------|
| AI 協作輔助 | `.claude/`, `.cursor/`, `.ai/` | 本地開發輔助，不納入版控 |
| 開發規範 | `.standards/`, `docs/internal/` | 本地規範文件，不納入版控 |
| 建置輸出 | `dist/`, `build/`, `out/` | 建置產物，不納入版控 |
| 大型資料 | `data/`, `datasets/` | 資料檔案，不納入版控 |

**檢查方式**:
```bash
# 產生 CHANGELOG 前，檢查專案的 .gitignore 排除項目
cat .gitignore | grep -E "^[^#*]" | head -20
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
   ```bash
   # 確認記錄的路徑存在於版本庫
   git ls-files | grep -E "path/to/file"
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

## 破壞性變更溝通

### 1. Deprecation Warnings (N-1 Version)

```javascript
// Version 1.5.0 - Add deprecation warning
/**
 * @deprecated Use authenticateV2() instead. Will be removed in v2.0.0
 */
function authenticate(username, password) {
  console.warn('[DEPRECATED] authenticate() will be removed in v2.0.0. Use authenticateV2()');
  return authenticateV2(username, password);
}
```

### 2. API 版本化策略

根據需求選擇 API 版本化策略：

| 策略 | 格式 | 優點 | 缺點 |
|------|------|------|------|
| URL 路徑 | `/api/v1/users` | 清晰、易於路由 | URL 污染 |
| 查詢參數 | `/api/users?version=1` | 可選版本 | 快取問題 |
| 標頭 | `Accept: application/vnd.api.v1+json` | URL 乾淨 | 較不可見 |
| 內容協商 | `Accept: application/vnd.api+json;version=1` | RESTful | 複雜 |

**建議**：大多數 API 使用 URL 路徑版本化（對開發者最清晰）。

### 3. 棄用時間線

棄用 API 功能時遵循此時間線：

```
v1.0.0 - 功能引入
v1.5.0 - 新增棄用警告（最少 N-1 版本）
v2.0.0 - 移除功能（記錄在遷移指南中）
```

**棄用期間指南**：

| API 類型 | 最短棄用期間 |
|----------|-------------|
| 內部 API | 1 個次要版本 |
| 合作夥伴 API | 2 個次要版本 + 3 個月 |
| 公開 API | 2 個次要版本 + 6 個月 |
| 關鍵基礎設施 | 最少 1 年 |

### 4. 向後相容性檢查清單

發布前驗證這些向後相容性規則：

**不要破壞（不升級主版本號）**：
- [ ] 移除公開 API 端點
- [ ] 移除必填請求欄位
- [ ] 新增必填請求欄位
- [ ] 變更回應欄位類型
- [ ] 變更錯誤碼含義
- [ ] 移除消費者依賴的回應欄位

**安全變更（次要/修補版本）**：
- [ ] 新增可選請求欄位
- [ ] 新增回應欄位
- [ ] 新增端點
- [ ] 新增錯誤碼
- [ ] 改善錯誤訊息
- [ ] 效能改進

### 5. 遷移指南（N 版本）

```markdown
# 遷移指南：v1.x 到 v2.0

## 破壞性變更

### 1. authenticate() 已移除

**Before (v1.x)**:
```javascript
const token = await authenticate('user', 'pass');
```

**After (v2.0)**:
```javascript
const token = await authenticateV2({ username: 'user', password: 'pass' });
```

### 2. API response format changed

**Before (v1.x)**:
```json
{ "data": { "user": {...} } }
```

**After (v2.0)**:
```json
{ "user": {...} }
```

Update your code:
```javascript
// Before
const user = response.data.user;

// After
const user = response.user;
```
```

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

---

## 版本歷史

| Version | Date | Changes |
|---------|------|---------|
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
