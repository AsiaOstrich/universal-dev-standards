---
source: ../../../core/git-workflow.md
source_version: 1.4.0
translation_version: 1.4.0
last_synced: 2026-10-11
source_hash: dbbce0815e5e
status: current
---

# Git 工作流程標準

> **語言**: [English](../../../core/git-workflow.md) | 繁體中文

**版本**: 1.4.0
**最後更新**: 2026-01-29
**適用性**: 所有使用 Git 進行版本控制的專案
**範圍**: universal（通用）
**業界標準**: 無（業界通行實踐）
**參考資料**: [atlassian.com](https://www.atlassian.com/git/tutorials)

> **詳細說明與教學請參閱 [Git 工作流程指南](guides/git-workflow-guide.md)**

---

## 目的

本標準定義 Git 分支策略與工作流程，確保跨團隊、跨專案擁有一致且可預期的協作模式。

---

## 工作流程策略選擇

**專案必須擇一**採用工作流程策略，並清楚記錄。

| 因素 | GitFlow | GitHub Flow | Trunk-Based |
|--------|---------|-------------|-------------|
| **發布頻率** | 每月以上 | 每週 | 每天多次 |
| **團隊規模** | 大型（10+） | 中型（5-15） | 小至中型（3-10） |
| **CI/CD 成熟度** | 基礎 | 中等 | 進階 |
| **Feature flags** | 選用 | 選用 | 必要 |
| **複雜度** | 高 | 低 | 中 |

---

## 分支類型

### GitFlow 分支類型

| 分支類型 | 目的 | 基底分支 | 合併目標 | 生命週期 |
|-------------|---------|-------------|--------------|----------|
| `main` | 正式環境程式碼 | - | - | 永久 |
| `develop` | 整合分支 | - | - | 永久 |
| `feature/*` | 新功能 | `develop` | `develop` | 暫時 |
| `release/*` | 發布準備 | `develop` | `main` + `develop` | 暫時 |
| `hotfix/*` | 緊急修復 | `main` | `main` + `develop` | 暫時 |

### GitHub Flow 分支類型

| 分支類型 | 目的 | 基底分支 | 合併目標 | 生命週期 |
|-------------|---------|-------------|--------------|----------|
| `main` | 正式環境程式碼 | - | - | 永久 |
| `feature/*` | 新功能 | `main` | `main` | 暫時 |
| `bugfix/*` | Bug 修復 | `main` | `main` | 暫時 |
| `hotfix/*` | 緊急修復 | `main` | `main` | 暫時 |

### Trunk-Based 分支類型

| 分支類型 | 目的 | 基底分支 | 合併目標 | 生命週期 |
|-------------|---------|-------------|--------------|----------|
| `main` | 主幹 | - | - | 永久 |
| `feature/*` | 小型變更 | `main` | `main` | ≤2 天 |

---

## 分支命名慣例

### 標準格式

```
<type>/<short-description>
```

### 類型

| 類型 | 用途 | 範例 |
|------|-------|---------|
| `feature/` | 新功能 | `feature/oauth-login` |
| `fix/` 或 `bugfix/` | Bug 修復 | `fix/memory-leak` |
| `hotfix/` | 正式環境緊急修復 | `hotfix/security-patch` |
| `refactor/` | 程式碼重構 | `refactor/extract-service` |
| `docs/` | 僅文件變更 | `docs/api-reference` |
| `test/` | 新增測試 | `test/integration-tests` |
| `chore/` | 維護任務 | `chore/update-dependencies` |
| `release/` | 發布準備（GitFlow） | `release/v1.2.0` |

### 命名規則

1. **使用小寫**
2. **以連字號取代空格**
3. **具描述性但保持精簡**
4. **避免僅以 issue 編號作為識別**

---

## 合併策略

**專案必須**針對每種分支類型**擇一**採用。

| 策略 | 指令 | 最適用於 | 優點 | 缺點 |
|----------|---------|----------|------|------|
| **Merge Commit** | `git merge --no-ff` | GitFlow、長期存在的功能分支 | 完整歷史、易於還原 | 日誌雜亂 |
| **Squash Merge** | `git merge --squash` | GitHub Flow、功能分支 | 歷史乾淨、每個功能一個提交 | 遺失細節 |
| **Rebase + FF** | `git rebase && git merge --ff-only` | Trunk-Based、短期分支 | 線性歷史、保留提交 | 改寫歷史 |

---

## 建立分支前檢查清單

建立新分支前，請完成以下檢查：

### 適用於 GitFlow 與 GitHub Flow

- [ ] 檢查未合併的分支：`git branch --no-merged main`
- [ ] 同步最新程式碼：`git checkout main && git pull origin main`
- [ ] 確認測試通過：執行專案測試套件
- [ ] 建立分支：`git checkout -b feature/description`

### 適用於 Trunk-Based 開發

- [ ] 同步最新程式碼：`git checkout main && git pull origin main`（關鍵）
- [ ] 確認測試通過（關鍵）
- [ ] 建立短期分支：`git checkout -b feature/description`

---

## 衝突解決

### 預防檢查清單

- [ ] 經常與基底分支同步
- [ ] 保持分支精簡（避免長期存在的功能分支）
- [ ] 重大重構事先告知團隊

### 解決步驟

```bash
git checkout main && git pull origin main
git checkout feature/my-feature && git merge main
# Resolve conflicts in marked files
git add resolved-file.js
git commit -m "chore: resolve merge conflicts with main"
npm test  # Verify
git push origin feature/my-feature
```

---

## 標籤與發布

### 語意化版本

```
MAJOR.MINOR.PATCH
```

| 組成 | 何時遞增 | 範例 |
|-----------|-------------------|---------|
| **MAJOR** | 破壞性變更 | v2.0.0 |
| **MINOR** | 新功能（向下相容） | v1.2.0 |
| **PATCH** | Bug 修復（向下相容） | v1.2.1 |

### 預發布版本

| 類型 | 格式 | 範例 |
|------|--------|---------|
| Alpha | `X.Y.Z-alpha.N` | v1.2.0-alpha.1 |
| Beta | `X.Y.Z-beta.N` | v1.2.0-beta.2 |
| RC | `X.Y.Z-rc.N` | v1.2.0-rc.1 |

### 建立標籤

```bash
git tag -a v1.2.0 -m "Release version 1.2.0: Add OAuth2 support"
git push origin v1.2.0
```

---

## 受保護分支

### `main`/`develop` 建議保護設定

| 設定 | 是否需要 |
|---------|----------|
| 要求 pull request 審查 | ✅（1-2 位審查者） |
| 要求狀態檢查通過 | ✅（CI 測試、linting） |
| 要求分支保持最新 | ✅ |
| 包含管理員 | ✅ |
| 允許強制推送 | ❌ |
| 允許刪除 | ❌ |

---

## Pull Request 工作流程

### PR 建立檢查清單

- [ ] **標題遵循 commit 慣例**（例如 `feat(auth): add OAuth2`）
- [ ] **描述說明原因**（而不只是做了什麼）
- [ ] **連結到 issue**（例如「Closes #123」）
- [ ] **新功能附帶測試**
- [ ] **視需要更新文件**
- [ ] **在描述中標明破壞性變更**
- [ ] **UI 變更附上截圖/GIF**

### PR 類型參考

| 類型 | 目的 | 範例 |
|------|---------|---------|
| `feat` | 新功能 | `feat(auth): add OAuth2 login` |
| `fix` | Bug 修復 | `fix(api): handle null response` |
| `docs` | 文件 | `docs(readme): update install steps` |
| `refactor` | 程式碼重構 | `refactor(utils): extract validation` |
| `test` | 新增測試 | `test(auth): add login unit tests` |
| `chore` | 維護 | `chore(deps): update lodash` |
| `perf` | 效能 | `perf(query): optimize user lookup` |

---

## 相關標準

- [Commit 訊息指南](commit-message-guide.md)
- [程式碼簽入標準](checkin-standards.md)
- [版本控制標準](versioning.md)
- [變更日誌標準](changelog-standards.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.4.0 | 2026-01-29 | 重構：拆分為規則 + 指南，教學內容移至指南 |
| 1.3.0 | 2026-01-24 | 新增：Trunk-Based + Feature Flags 整合、Ship/Show/Ask 決策模型、Stacked PRs 工作流程 |
| 1.2.1 | 2025-12-24 | 新增：相關標準章節 |
| 1.2.0 | 2025-12-16 | 新增：決策樹、選擇矩陣 |
| 1.1.0 | 2025-12-08 | 新增建立分支前檢查清單章節 |
| 1.0.0 | 2025-11-12 | 初始 Git 工作流程標準 |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
