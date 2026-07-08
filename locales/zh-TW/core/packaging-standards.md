---
source: ../../../core/packaging-standards.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-06-10
source_hash: 69ff3afd3c1e
status: current
---

# 打包標準

> **語言**: [English](../../../core/packaging-standards.md) | 繁體中文

**版本**: 1.1.0
**最後更新**: 2026-05-26
**適用性**: 使用 UDS-aware 工具鏈的專案
**範圍**: 通用 (Universal)

---

## 目的

本標準定義一套基於 Recipe 的打包框架，讓使用者專案可在 專案 packaging 配置（路徑由採用層決定） 中宣告打包目標（target）。UDS 負責提供 Recipe 定義與內建 Recipe 函式庫；採用層 runtime 在 pipeline 中執行編排。

框架的關注點分離如下：
- **使用者專案**：宣告「打包什麼」（targets + 設定覆蓋）
- **UDS**：定義「如何打包」（Recipe 結構 + 內建 Recipes）
- **採用層 pipeline**：執行「何時打包」（在 Review 與 Deploy 之間的 pipeline 階段）

---

## 核心原則

| 原則 | 說明 |
|------|------|
| **Recipe-based** | 每個打包目標都參照一個具名 Recipe；不在 pipeline YAML 中撰寫臨時腳本 |
| **宣告式 targets** | 專案在 專案 packaging 配置（路徑由採用層決定） 中宣告 targets；採用層 runtime 負責解析與執行 |
| **可客製化** | 四個客製化層允許設定覆蓋、Hook 注入、自訂 Recipe 及 Escape Hatch |
| **整合至 Pipeline** | 打包作為獨立階段運行於 採用層 pipeline 的 Review 與 Deploy 之間 |

---

## Recipe 結構

Recipe 是定義如何打包專案的 YAML 檔案，欄位定義如下：

```yaml
# Recipe: <name>.yaml
name: <string>            # 必填 — 唯一識別符（kebab-case）
description: <string>     # 選填 — 人類可讀描述
requires:                 # 選填 — 執行前必須存在的檔案
  - <file-path>
steps:                    # 必填 — 有序的建置/打包步驟清單
  - run: <shell-command>
    description: <string> # 選填 — 步驟描述
config:                   # 選填 — 預設設定值（可被使用者專案覆蓋）
  <key>: <value>
hooks:                    # 選填 — 生命週期 hooks（~ 表示不執行）
  preBuild: ~
  postBuild: ~
  prePublish: ~
  postPublish: ~
```

### 必填與選填欄位

| 欄位 | 必填 | 說明 |
|------|------|------|
| `name` | 是 | 唯一識別符，kebab-case 格式 |
| `steps` | 是 | 至少需要一個步驟 |
| `description` | 否 | 人類可讀描述 |
| `requires` | 否 | 前置條件檔案檢查 |
| `config` | 否 | 預設設定值；所有 key 均可被使用者專案覆蓋 |
| `hooks` | 否 | 生命週期 hook 插入點；`~` 表示不執行 |

### 步驟變數

設定值與執行時期情境可在 `run` 指令中使用 `{variable}` 占位符：

| 變數 | 來源 | 範例 |
|------|------|------|
| `{registry}` | `config.registry` | `ghcr.io` |
| `{name}` | `package.json#name` 或 `config.name` | `my-app` |
| `{version}` | `package.json#version` 或 `config.version` | `1.2.3` |
| `{platforms}` | `config.platforms` | `linux/amd64,linux/arm64` |
| `{output_dir}` | `config.output_dir` | `dist/installers` |

---

## 內建 Recipes

UDS 隨附四個內建 Recipe，位於 `recipes/` 目錄：

| Recipe | 檔案 | 使用場景 |
|--------|------|----------|
| `npm-library` | `recipes/npm-library.yaml` | 不含執行入口的 npm 套件 |
| `npm-cli` | `recipes/npm-cli.yaml` | 含 `bin` 欄位的 npm 套件（CLI 工具） |
| `docker-service` | `recipes/docker-service.yaml` | Docker 容器映像建置與推送 |
| `windows-installer` | `recipes/windows-installer.yaml` | Windows 安裝程式（.msi / .exe）透過使用者腳本 |

### 選擇 Recipe 的決策流程

```
產出物是 npm 套件嗎？
├── 是 → package.json 是否含有 "bin" 欄位？
│         ├── 是 → npm-cli
│         └── 否 → npm-library
└── 否 → 產出物是容器映像嗎？
          ├── 是 → docker-service
          └── 否 → 產出物是 Windows 安裝程式嗎？
                    ├── 是 → windows-installer
                    └── 否 → 撰寫自訂 Recipe（參見客製化層）
```

---

## 客製化層

需要偏離內建 Recipe 預設值的專案，應使用最低適用層：

| 層級 | 機制 | 使用時機 |
|------|------|----------|
| **L1 — 設定覆蓋** | 專案 packaging 配置（路徑由採用層決定） 中的 `config:` 區塊 | 更改預設值（registry URL、tag、輸出目錄）|
| **L2 — Hook 注入** | 專案 packaging 配置（路徑由採用層決定） 中的 `hooks:` 區塊 | 在建置或發佈前後執行額外指令 |
| **L3 — 自訂 Recipe** | 專案 `.uds/recipes/` 中的新 `.yaml` 檔案 | 完全不同的建置流程；內建 Recipe 不適用 |
| **L4 — Escape Hatch** | target 定義中以 `script:` 取代 `recipe:` | 原始 shell 腳本，無適合的 Recipe 抽象 |

### L1 範例 — 設定覆蓋

```yaml
# .uds/packaging.yaml
targets:
  - name: publish-npm
    recipe: npm-library
    config:
      registry: https://npm.pkg.github.com
      access: restricted
      tag: beta
```

### L2 範例 — Hook 注入

```yaml
# .uds/packaging.yaml
targets:
  - name: docker-push
    recipe: docker-service
    hooks:
      postPush: |
        curl -X POST https://hooks.example.com/deploy-notify \
          -d "{\"version\": \"{version}\"}"
```

### L3 範例 — 自訂 Recipe

```yaml
# .uds/recipes/electron-app.yaml
name: electron-app
description: 建置 Electron 桌面應用程式
requires:
  - package.json
  - electron-builder.yml
steps:
  - run: npm run build
  - run: npx electron-builder --publish never
config:
  output_dir: dist
```

### L4 範例 — Escape Hatch

```yaml
# .uds/packaging.yaml
targets:
  - name: legacy-bundle
    script: |
      ./scripts/legacy-bundle.sh
      mv output/ dist/bundle/
```

---

## 打包驗收標準

當以下**所有**條件均滿足時，打包執行視為**成功**：

| 標準 | 閾值 | 備註 |
|------|------|------|
| 所有 `requires` 檔案存在 | 100% | 在任何步驟執行前檢查 |
| 所有步驟以 exit code 0 結束 | 100% | 任何非零 exit 使執行失敗 |
| `postBuild` 產出物存在 | 存在於預期路徑 | 建置步驟後由採用層 runtime 驗證 |
| Hook 指令以 exit code 0 結束 | 100% | Hook 失敗會傳播為步驟失敗 |
| 已發佈產出物可被取回 | HTTP 200 / registry 查詢成功 | 由採用層 runtime 在發佈後進行 smoke check |

### 失敗處理

| 失敗類型 | 行動 | 可重試？ |
|----------|------|----------|
| `requires` 檔案缺失 | 立即失敗，回報缺失路徑 | 否 |
| 步驟非零 exit | 立即失敗，若已定義則執行 `postBuild` hook | 可設定（預設：否）|
| Hook 非零 exit | 立即失敗 | 否 |
| 發佈無法連線 | 以指數退避重試最多 3 次 | 是（3×）|

---

## Archive 格式完整性

當打包步驟產生將由部署腳本消費的 archive（`.zip`、`.tar.gz`、`.tar.bz2` 等）時，**真實的二進位格式必須與副檔名相符**。命名為 `.zip` 的檔案必須是真正的 ZIP archive（PKZip magic `PK\x03\x04`），而非改名的 tar archive。

> **為何強制要求：** archive 格式不符會在下游觸發靜默失敗。PowerShell 的 `Expand-Archive` 和 `[System.IO.Compression.ZipFile]::ExtractToDirectory()` 接受 tar 改名的 `.zip` **而不拋出錯誤**——檔案被讀取，什麼都沒有解壓縮，也沒有例外。若部署腳本的下一步是破壞性的（例如「刪除現有安裝目錄」），運行中的安裝就會被摧毀而無任何替代物。

### 發布前驗證

每個產生 archive 的打包步驟**必須**在宣告成功前包含格式驗證。最低驗證要求：

| 格式 | 驗證單行指令 |
|---|---|
| `.zip` | `python -c "import zipfile; zipfile.ZipFile('out.zip').namelist()"` 必須成功 |
| `.zip`（Unix） | `file out.zip` 必須回報 `Zip archive data`，**而非** `POSIX tar archive` |
| `.tar.gz` | `tar -tzf out.tar.gz >/dev/null` 必須成功 |
| 任何格式 | 選用：雜湊比對預期檔案的 manifest |

驗證失敗必須在發布前中止打包管線。

### 各平台設定範例

**Windows — 應該這樣做：**

```powershell
# 選項 A：PowerShell 內建（產生真正的 ZIP）
Compress-Archive -Path "publish\*" -DestinationPath "dist\patch.zip" -Force

# 選項 B：.NET API（產生真正的 ZIP）
Add-Type -Assembly System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory(
    "publish", "dist\patch.zip", "Optimal", $false
)
```

**Windows — 不應該這樣做：**

```bash
# ❌ git-bash / busybox tar -a -cf 在 Windows 上不可靠
# -a「依副檔名自動」旗標會產生副檔名為 .zip 的 POSIX tar archive。
# `file patch.zip` → "POSIX tar archive (GNU)"（而非 "Zip archive data"）
cd publish && tar -a -cf "../dist/patch.zip" api/
```

**類 Unix — 應該這樣做：**

```bash
# ZIP archive 使用 'zip'（BSD/Linux）
zip -r dist/patch.zip publish/

# tar.gz archive 使用 'tar -czf'（不加 -a）——明確且確定性
tar -czf dist/patch.tar.gz publish/

# 發布前驗證
file dist/patch.zip            # 預期 "Zip archive data"
python -c "import zipfile; zipfile.ZipFile('dist/patch.zip').namelist()"
```

### 消費端防禦

生產端無法保證消費端一定會驗證。消費端（部署腳本）**必須**在任何破壞性動作前驗證 archive 完整性。消費端需求請參閱[部署標準 — 防禦性部署順序](deployment-standards.md#防禦性部署順序)。

### 失敗模式參考（真實事故）

一個 Windows IIS 正式部署腳本（2026-05-24）在 git-bash 中使用 `tar -a -cf patch.zip api/` 產生其發行 archive。消費端的 PowerShell 部署腳本接著執行 `Expand-Archive`（對 tar 改名檔案靜默空操作），繼續對運行中的 `apiDir` 執行 `Remove-Item -Recurse`，然後從一個不存在的來源執行 `Copy-Item`（因為什麼都沒有被解壓縮）。運行中的安裝被清除，AppPool 停止，正式環境中斷約 3 分鐘，直到完成基於備份的回滾。

（a）生產端使用自動副檔名 tar，加上（b）消費端未驗證解壓縮輸出，兩者組合在任何步驟都沒有拋出錯誤的情況下摧毀了運行中的安裝。

---

## 相關標準

- [部署標準](deployment-standards.md) — 打包後的部署階段
- [Pipeline 整合標準](pipeline-integration-standards.md) — CI/CD pipeline 設定
- [Check-in 標準](checkin-standards.md) — 打包前的品質關卡
- [版本控制標準](versioning.md) — 套件產出物使用的版本號
- [供應鏈證明標準](supply-chain-attestation.md) — 打包產出物的 SBOM / SLSA 溯源 / 簽章（此處的格式完整性屬於封存檔層級；證明則補充了從原始碼到產出物的溯源）

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.1.0 | 2026-05-26 | 新增：Archive 格式完整性章節——真實格式必須符合副檔名規則、驗證單行指令、Windows 正確/錯誤做法清單、真實事故參考（XSPEC-231 / 關閉 issue #113） |
| 1.0.0 | 2026-04-15 | 初始發行 — XSPEC-034 Phase 1 |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
