---
source: docs/specs/system/memory-adoption-strategy.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# 記憶採用策略

**狀態**: Archived

> **語言**: [English](../../../../../docs/specs/system/memory-adoption-strategy.md) | 繁體中文

本文件提供策略指引，協助跨不同團隊規模與營運模式採用 Universal Development Standards (UDS) 的記憶系統。它幫助使用者決定如何架構自身的 **Project Context Memory (PCM)** 與 **Developer Persistent Memory (DPM)**，以發揮最大效益。

---

## 1. 決策矩陣

選擇最適合你營運模式的策略：

| 策略 | 目標對象 | 儲存位置 | 知識流向 | 主要效益 |
| :--- | :--- | :--- | :--- | :--- |
| **數位花園 (Digital Garden)** | 獨立開發者、自由工作者 | 本機全域 (`~/.uds/memory`) | Project → User | **可攜性**：你的經驗隨你而行。 |
| **倉庫中心 (Repo-Centric)** | 新創公司、小型團隊 | 專案本地 (`.project-context/`) | User → Project | **一致性**：為新成員提供「開箱即用」的上手體驗。 |
| **軸輻式 (Hub-and-Spoke)** | 企業、多專案組織 | Git Submodule／Registry | Hub ↔ Spoke | **標準化**：在嚴格邊界內強制落實合規。 |

---

## 2. 策略 A：數位花園 (獨立／自由工作者)

**理念**：「我是知識的載體。」

目標是在許多臨時專案之間累積個人經驗。AI 扮演你的個人結對程式設計夥伴，學習 *你的* 偏好。

### 配置
- **全域 memory**：啟用。將特定技術堆疊的洞見（例如「React Tips」、「Python Tricks」）儲存於 `~/.uds/memory/`。
- **專案 memory**：最小化。僅儲存憑證、特定路徑或臨時性的商業邏輯。

### 工作流程
1.  **遇到問題**：在專案 A 中解決一個棘手的 React 渲染錯誤。
2.  **提升 (Promote)**：告訴 AI：「將這個存成通用的 React 模式到我的全域 memory。」
3.  **重複使用**：開啟專案 B。當你撰寫類似程式碼時，AI 會立即建議該模式，因為它讀取了 `~/.uds/memory`。

### 設定
```bash
# 1. Create global directory
mkdir -p ~/.uds/memory

# 2. (Optional) Initialize as git repo for backup
cd ~/.uds/memory && git init
```

---

## 3. 策略 B：倉庫中心 (小型團隊)

**理念**：「倉庫即真實來源 (Source of Truth)。」

目標是確保每位團隊成員（以及他們的 AI Agent）擁有完全相同的脈絡。個人偏好不應凌駕於專案慣例之上。

### 配置
- **全域 memory**：**停用** 或唯讀。避免「在我的機器／AI 上可以運作」的問題。
- **專案 memory**：完整。所有架構決策、程式撰寫風格與領域術語皆存放於 `.project-context/`，並提交至 Git。

### 工作流程
1.  **上手 (Onboarding)**：新成員 clone 倉庫。
2.  **即時脈絡**：他們的 AI 讀取 `.project-context/`，立即得知：「我們採用 Hexagonal Architecture」與「變數必須使用 snake_case」。
3.  **共識**：當團隊在 Code Review 中對新規則達成共識時，由一人指示 AI：「將這條規則加入 Project Context。」
4.  **同步**：新的 `.md` 檔案被提交並推送。每個人在下次 `git pull` 時取得更新。

---

## 4. 策略 C：軸輻式 (企業)

**理念**：「治理與合規。」

目標是在數百個專案之間共享共通標準，同時允許在地的彈性。

### 配置
- **核心層（軸 The Hub）**：一個專用的 Git 倉庫（例如 `acme-corp/standard-memory`），內含全公司的安全規則與架構模式。
- **專案層（輻 The Spoke）**：本地 `.project-context/`，用於應用程式專屬的邏輯。

### 實作：Git Submodules
每個專案將中央 memory 作為 submodule 掛載。

```bash
# In Project A, B, and C:
git submodule add git@github.com:acme-corp/standard-memory.git .standards/shared
```

### 工作流程
1.  **政策更新**：安全團隊在 Hub 倉庫中更新「Auth Standards」。
2.  **傳播 (Propagation)**：各專案更新其 submodule，以拉取新標準。
3.  **驗證**：CI/CD 管線檢查專案程式碼是否符合 `.standards/shared` 中更新後的規則。

---

## 5. 總結

| 如果你想要… | 採用策略… |
| :--- | :--- |
| 在不同接案工作之間停止重複造輪子 | **數位花園 (Digital Garden)** |
| 讓新進人員在第一天就能產出 | **倉庫中心 (Repo-Centric)** |
| 確保 50+ 個微服務遵循安全規格 | **軸輻式 (Hub-and-Spoke)** |
