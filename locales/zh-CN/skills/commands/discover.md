---
source: ../../../../skills/commands/discover.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
status: current
---

---
name: discover
description: "[UDS] Assess project health, architecture, and risks before adding features"
argument-hint: "[feature area | 功能范围]"
---

# 专案现况评估

在既有代码库新增功能前的 Phase 0 评估。评估专案健康度、架构与风险。

## 用法

```bash
/discover [feature area]
```

## 评估维度

| 维度 | 检查项目 |
|------|----------|
| **架构** | 模组结构、依赖图、入口点 |
| **依赖** | 过时套件、已知漏洞、授权风险 |
| **测试覆盖率** | 现有测试、覆盖率缺口、测试质量 |
| **安全** | `npm audit` 发现、硬编码密钥、暴露端点 |
| **技术债** | TODO 标记、代码重复、复杂度热点 |

## 工作流程

1. **扫描专案** - 读取 package.json、目录结构、配置文件
2. **分析架构** - 映射模组、依赖关系和数据流
3. **检查依赖** - 运行 `npm outdated`、`npm audit` 获取健康信号
4. **评估风险** - 识别复杂度热点、缺失测试、安全问题
5. **生成报告** - 输出健康评分与可执行建议
6. **决定下一步** - 根据发现结果判断 GO / NO-GO / CONDITIONAL

## 范例

```bash
/discover                # 完整专案健康评估
/discover auth           # 针对认证相关模组的集中评估
/discover payments       # 评估新增支付功能前的风险
```

## 输出格式

```
Project Health Report
=====================
Overall Score: 7.2 / 10

| Dimension       | Score | Status  | Key Finding            |
|-----------------|-------|---------|------------------------|
| Architecture    | 8/10  | Good    | Clean module boundaries |
| Dependencies    | 6/10  | Warning | 5 outdated, 1 critical |
| Test Coverage   | 7/10  | Fair    | 72% line coverage      |
| Security        | 8/10  | Good    | No critical vulns      |
| Technical Debt  | 6/10  | Warning | 23 TODOs, 3 hotspots   |

Verdict: CONDITIONAL
Recommendations:
1. [HIGH] Update lodash to fix CVE-2024-XXXX
2. [MED]  Add tests for src/payments/ (0% coverage)
3. [LOW]  Resolve TODO backlog in src/utils/
```

## 后续步骤

发现评估后，典型的棕地（brownfield）工作流程为：

1. `/discover` - 评估专案健康度（本命令）
2. `/reverse spec` - 逆向工程现有代码为规格
3. `/sdd` - 为新功能编写规格
4. `/tdd` 或 `/bdd` - 在测试保护下实作

## 参考

*   [专案探索技能](../project-discovery/SKILL.md)
*   [逆向工程规范](../../core/reverse-engineering-standards.md)
