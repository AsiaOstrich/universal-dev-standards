---
source: skills/claude-code/release-standards/semantic-versioning.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# 语意化版本指南

> **语言**: [English](../../../../../skills/claude-code/release-standards/semantic-versioning.md) | 繁体中文

**版本**: 1.0.0
**最后更新**: 2025-12-24
**适用范围**: Claude Code Skills

---

## 目的

本文件提供软体发布中语意化版本控制（SemVer）的指南。

---

## 格式

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
```

### 组成部分

| 组成部分 | 用途 | 何时递增 |
|-----------|---------|-------------------|
| **MAJOR** | 重大变更 | 不相容的 API 变更 |
| **MINOR** | 新功能 | 向后相容的功能性 |
| **PATCH** | 错误修正 | 向后相容的错误修正 |
| **PRERELEASE** | 预发布识别码 | Alpha、beta、rc 版本 |
| **BUILD** | 建置元资料 | 建置编号、提交杂凑值 |

---

## MAJOR 版本（X.0.0）

**递增时机**:
- 重大 API 变更
- 移除已弃用的功能
- 重大架构变更
- 不相容的行为变更

**范例**:
```
1.9.5 → 2.0.0  # Remove deprecated API
3.2.1 → 4.0.0  # Change return type of public method
```

**指南**:
- 将 MINOR 和 PATCH 重置为 0
- 撰写迁移指南文件
- 在先前的 MINOR 版本中提供弃用警告

---

## MINOR 版本（x.Y.0）

**递增时机**:
- 新增新功能（向后相容）
- 弃用功能（不移除）
- 实质的内部改进
- 新的公开 API

**范例**:
```
2.3.5 → 2.4.0  # Add new API endpoint
1.12.0 → 1.13.0  # Add optional parameter
```

**指南**:
- 将 PATCH 重置为 0
- 现有功能保持不变
- 新功能采用选择性加入

---

## PATCH 版本（x.y.Z）

**递增时机**:
- 错误修正（无新功能）
- 安全性修补
- 文件修正
- 内部重构（无 API 变更）

**范例**:
```
3.1.2 → 3.1.3  # Fix null pointer exception
2.0.0 → 2.0.1  # Security vulnerability patch
```

**指南**:
- 无新功能
- 无 API 变更
- 可立即安全更新

---

## 预发布版本

### 识别码

| 识别码 | 用途 | 稳定性 | 目标受众 |
|------------|---------|-----------|----------|
| `alpha` | 早期测试 | 不稳定 | 内部团队 |
| `beta` | 功能完整 | 大致稳定 | 早期采用者 |
| `rc` | 最终测试 | 稳定 | Beta 测试者 |

### 范例

```
1.0.0-alpha.1       # First alpha release
1.0.0-alpha.2       # Second alpha release
1.0.0-beta.1        # First beta release
1.0.0-beta.2        # Second beta release
1.0.0-rc.1          # Release candidate 1
1.0.0               # Stable release
```

### 排序

```
1.0.0-alpha.1 < 1.0.0-alpha.2 < 1.0.0-beta.1 < 1.0.0-rc.1 < 1.0.0
```

---

## 建置元资料

### 范例

```
1.0.0+20250112            # Date-based build
2.3.1+001                 # Sequential build number
3.0.0+sha.5114f85         # Git commit hash
```

**注意**: 建置元资料不会影响版本优先顺序。

---

## 初始开发（0.x.x）

```
0.1.0  # Initial development release
0.2.0  # Add features
0.9.0  # Approaching stability
1.0.0  # First stable release
```

**指南**:
- 主版本 0 表示开发阶段
- API 可能经常变更
- MINOR 版本允许重大变更
- API 稳定时移至 1.0.0

---

## 版本生命周期范例

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

## Git 标签

### 建立标签

```bash
# 附注标签（建议）
git tag -a v1.2.0 -m "Release version 1.2.0"

# 推送标签到远端
git push origin v1.2.0

# 推送所有标签
git push origin --tags
```

### 标签命名惯例

```
v1.0.0          ✅ 建议（带 'v' 前缀）
1.0.0           ✅ 可接受（不带 'v'）
version-1.0.0   ❌ 避免（太冗长）
1.0             ❌ 避免（不完整版本）
```

---

## 相依性版本范围

### npm (package.json)

```json
{
  "dependencies": {
    "exact": "1.2.3",           // 确切版本
    "patch": "~1.2.3",          // >=1.2.3 <1.3.0
    "minor": "^1.2.3",          // >=1.2.3 <2.0.0
    "range": ">=1.2.3 <2.0.0",  // 明确范围
    "latest": "*"               // ❌ 避免 - 任何版本
  }
}
```

---

## 相关标准

- [版本控制标准](../../../../../core/versioning.md)
- [变更日志格式指南](./changelog-format.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2025-12-24 | 新增：标准区段（目的、相关标准、版本历史、授权） |

---

## 授权

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
