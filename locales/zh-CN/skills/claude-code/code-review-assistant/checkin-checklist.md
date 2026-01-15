---
source: /skills/claude-code/code-review-assistant/checkin-checklist.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# Pre-Commit Checklist（提交前检查清单）

> **语言**: [English](../../../../../skills/claude-code/code-review-assistant/checkin-checklist.md) | 简体中文

**版本**: 1.0.0
**最後更新**: 2025-12-24
**適用範圍**: Claude Code Skills

---

## 目的

本文件提供开发者在提交程序码变更前需要验证的检查清单。

---

## 必要检查

### 1. 建置验证

- [ ] **程序码编譯成功**
  - 零建置错误
  - 零建置警告（或已记录的例外情况）

- [ ] **依賴套件已滿足**
  - 所有套件依賴已安裝
  - 依賴版本已鎖定
  - 無缺少的 imports

---

### 2. 测试验证

- [ ] **所有現有测试通過**
  - 单元测试：100% 通過率
  - 集成测试：100% 通過率

- [ ] **新程序码已测试**
  - 新功能有对应的测试
  - Bug 修復包含回歸测试

- [ ] **测试覆蓋率已維持**
  - 覆蓋率百分比未降低
  - 关鍵路徑已测试

---

### 3. 程序码品质

- [ ] **遵循编码标准**
  - 遵守命名慣例
  - 程序码格式一致
  - 需要时有註解

- [ ] **無程序码異味**
  - 方法 ≤50 行
  - 巢状深度 ≤3 层
  - 循環複雜度 ≤10
  - 無重複程序码區塊

- [ ] **安全性已检查**
  - 無硬编码的密鑰
  - 無 SQL 注入漏洞
  - 無 XSS 漏洞
  - 無不安全的依賴套件

---

### 4. 文件

- [ ] **API 文件已更新**
  - 公開 API 有文件註解
  - 參數已说明
  - 回传值已记录

- [ ] **README 已更新（如需要）**
  - 新功能已记录
  - 重大变更已註记

- [ ] **CHANGELOG 已更新（如適用）**
  - 面向使用者的变更已加入 `[Unreleased]`
  - 重大变更已標记

---

### 5. 工作流程合規性

- [ ] **分支命名正确**
  - 遵循项目慣例（`feature/`、`fix/`）

- [ ] **提交消息已格式化**
  - 遵循 conventional commits 或项目标准

- [ ] **与目標分支同步**
  - 已合併目標分支的最新变更
  - 無合併衝突

---

## 提交时机指南

### ✅ 適當的提交时机

1. **完成的功能单元**
   - 功能完全实作
   - 测试已撰写并通過
   - 文件已更新

2. **特定 Bug 已修復**
   - Bug 已重現并修復
   - 已加入回歸测试

3. **獨立的重構**
   - 重構完成
   - 無功能变更
   - 所有测试仍通過

4. **可执行状态**
   - 程序码编譯無错误
   - 应用程序可执行/啟动
   - 核心功能未损壞

### ❌ 不適當的提交时机

1. **建置失败**
   - 存在编譯错误
   - 未解决的依賴問題

2. **测试失败**
   - 一个或多个测试失败
   - 新程序码尚未撰写测试

3. **未完成的功能**
   - 功能部分实作
   - 会破壞現有功能

4. **实驗性程序码**
   - 散佈 TODO 註解
   - 遺留除錯程序码
   - 註解掉的程序码區塊

---

## 提交粒度

### 理想的提交大小

| 指標 | 建议 |
|--------|-------------|
| 文件數量 | 1-10 个文件 |
| 变更行數 | 50-300 行 |
| 範圍 | 单一关注点 |

### 拆分原則

**合併为一个提交**：
- 功能实作 + 对应的测试
- 緊密相关的多文件变更

**分開提交**：
- 功能 A + 功能 B → 分開
- 重構 + 新功能 → 分開
- Bug 修復 + 附帶重構 → 分開

---

## 特殊情境

### 緊急離開（WIP）

**选项 1：Git Stash（推荐）**
```bash
git stash save "WIP: description of incomplete work"
# Resume later
git stash pop
```

**选项 2：WIP 分支**
```bash
git checkout -b wip/feature-temp
git commit -m "WIP: progress save (do not merge)"
```

### Hotfix

1. 從 main 建立 hotfix 分支
2. 最小化变更（僅修復問題）
3. 快速验证（确保测试通過）
4. 在提交消息中標记緊急性：
   ```
   fix(module): [URGENT] fix critical issue
   ```

---

## 常見違規

### ❌ "WIP" 提交

```
git commit -m "WIP"
git commit -m "save work"
git commit -m "trying stuff"
```

**解决方案**：使用 `git stash` 或在合併前 squash

### ❌ 註解掉的程序码

**問題**：使程序码庫雜亂，混淆未來的开发者

**解决方案**：刪除它。Git 历史会保留舊程序码。

### ❌ 混合关注点

```
git commit -m "fix bug and refactor and add feature"
```

**解决方案**：分開为多个提交：
```
git commit -m "fix(module-a): resolve null pointer error"
git commit -m "refactor(module-b): extract validation logic"
git commit -m "feat(module-c): add export feature"
```

---

## 相关标准

- [Checkin Standards](../../../../../core/checkin-standards.md)
- [Code Review Checklist](./review-checklist.md)
- [Commit Message Guide](../../../../../core/commit-message-guide.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | 新增：标准章节（目的、相关标准、版本历史、授权） |

---

## 授权

本文件依据 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权發布。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
