---
source: /skills/claude-code/code-review-assistant/checkin-checklist.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# Pre-Commit Checklist（提交前检查清单）

> **语言**: [English](../../../../../skills/claude-code/code-review-assistant/checkin-checklist.md) | 繁体中文

**版本**: 1.0.0
**最后更新**: 2025-12-24
**适用范围**: Claude Code Skills

---

## 目的

本文件提供开发者在提交程式码变更前需要验证的检查清单。

---

## 必要检查

### 1. 建置验证

- [ ] **程式码编译成功**
  - 零建置错误
  - 零建置警告（或已记录的例外情况）

- [ ] **依赖套件已满足**
  - 所有套件依赖已安装
  - 依赖版本已锁定
  - 无缺少的 imports

---

### 2. 测试验证

- [ ] **所有现有测试通过**
  - 单元测试：100% 通过率
  - 整合测试：100% 通过率

- [ ] **新程式码已测试**
  - 新功能有对应的测试
  - Bug 修复包含回归测试

- [ ] **测试覆盖率已维持**
  - 覆盖率百分比未降低
  - 关键路径已测试

---

### 3. 程式码品质

- [ ] **遵循编码标准**
  - 遵守命名惯例
  - 程式码格式一致
  - 需要时有注解

- [ ] **无程式码异味**
  - 方法 ≤50 行
  - 巢状深度 ≤3 层
  - 循环复杂度 ≤10
  - 无重复程式码区块

- [ ] **安全性已检查**
  - 无硬编码的密钥
  - 无 SQL 注入漏洞
  - 无 XSS 漏洞
  - 无不安全的依赖套件

---

### 4. 文件

- [ ] **API 文件已更新**
  - 公开 API 有文件注解
  - 参数已说明
  - 回传值已记录

- [ ] **README 已更新（如需要）**
  - 新功能已记录
  - 重大变更已注记

- [ ] **CHANGELOG 已更新（如适用）**
  - 面向使用者的变更已加入 `[Unreleased]`
  - 重大变更已标记

---

### 5. 工作流程合规性

- [ ] **分支命名正确**
  - 遵循专案惯例（`feature/`、`fix/`）

- [ ] **提交讯息已格式化**
  - 遵循 conventional commits 或专案标准

- [ ] **与目标分支同步**
  - 已合并目标分支的最新变更
  - 无合并冲突

---

## 提交时机指南

### ✅ 适当的提交时机

1. **完成的功能单元**
   - 功能完全实作
   - 测试已撰写并通过
   - 文件已更新

2. **特定 Bug 已修复**
   - Bug 已重现并修复
   - 已加入回归测试

3. **独立的重构**
   - 重构完成
   - 无功能变更
   - 所有测试仍通过

4. **可执行状态**
   - 程式码编译无错误
   - 应用程式可执行/启动
   - 核心功能未损坏

### ❌ 不适当的提交时机

1. **建置失败**
   - 存在编译错误
   - 未解决的依赖问题

2. **测试失败**
   - 一个或多个测试失败
   - 新程式码尚未撰写测试

3. **未完成的功能**
   - 功能部分实作
   - 会破坏现有功能

4. **实验性程式码**
   - 散布 TODO 注解
   - 遗留除错程式码
   - 注解掉的程式码区块

---

## 提交粒度

### 理想的提交大小

| 指标 | 建议 |
|--------|-------------|
| 档案数量 | 1-10 个档案 |
| 变更行数 | 50-300 行 |
| 范围 | 单一关注点 |

### 拆分原则

**合并为一个提交**：
- 功能实作 + 对应的测试
- 紧密相关的多档案变更

**分开提交**：
- 功能 A + 功能 B → 分开
- 重构 + 新功能 → 分开
- Bug 修复 + 附带重构 → 分开

---

## 特殊情境

### 紧急离开（WIP）

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

1. 从 main 建立 hotfix 分支
2. 最小化变更（仅修复问题）
3. 快速验证（确保测试通过）
4. 在提交讯息中标记紧急性：
   ```
   fix(module): [URGENT] fix critical issue
   ```

---

## 常见违规

### ❌ "WIP" 提交

```
git commit -m "WIP"
git commit -m "save work"
git commit -m "trying stuff"
```

**解决方案**：使用 `git stash` 或在合并前 squash

### ❌ 注解掉的程式码

**问题**：使程式码库杂乱，混淆未来的开发者

**解决方案**：删除它。Git 历史会保留旧程式码。

### ❌ 混合关注点

```
git commit -m "fix bug and refactor and add feature"
```

**解决方案**：分开为多个提交：
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

本文件依据 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
