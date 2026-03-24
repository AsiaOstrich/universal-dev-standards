---
source: ../../../core/performance-standards.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-03-24
status: current
---

> **语言**: [English](../../../core/performance-standards.md) | 简体中文

# 性能标准

**版本**: 1.1.0
**最后更新**: 2026-01-29
**适用范围**: 所有软件项目
**范围**: universal
**行业标准**: ISO/IEC 25010 Performance Efficiency
**参考**: [sre.google](https://sre.google/books/)

> **详细说明和优化技术请参阅 [性能指南](../../../core/guides/performance-guide.md)**

---

## 目的

本标准定义软件性能工程的综合指南，涵盖性能需求、测试方法和监控实践。

**参考标准**:
- [ISO/IEC 25010:2011](https://www.iso.org/standard/35733.html) - 性能效率
- [Google SRE Book](https://sre.google/books/) - 站点可靠性工程

---

## 性能需求模板

### NFR 格式

```markdown
### NFR-PERF-XXX: [标题]

**类别**: 性能效率 > [时间行为/资源利用/容量]
**优先级**: P1/P2/P3

**需求**:
| 百分位 | 目标 | 最大值 |
|--------|------|--------|
| p50 | Xms | Yms |
| p95 | Xms | Yms |
| p99 | Xms | Yms |

**条件**: [负载、数据量等]
**度量**: [工具、采样、报告]
```

---

## 常见性能目标

| 系统类型 | 响应时间（p95） | 吞吐量 | 可用性 |
|---------|----------------|--------|--------|
| **电商** | < 200ms | 1000+ rps | 99.9% |
| **内部工具** | < 500ms | 100+ rps | 99.5% |
| **批处理** | 不适用 | 10K+ 记录/分钟 | 99% |
| **实时系统** | < 50ms (p99) | 10K+ rps | 99.99% |
| **API 网关** | < 100ms | 5K+ rps | 99.95% |

---

## 性能测试类型

| 测试类型 | 目的 | 工具 |
|---------|------|------|
| **负载测试** | 验证正常负载下的性能 | k6, JMeter, Gatling |
| **压力测试** | 发现系统的断裂点 | k6, Locust |
| **浸泡测试** | 检测内存泄漏和资源耗尽 | k6（长时间运行） |
| **峰值测试** | 验证突发流量处理能力 | k6, JMeter |

---

## 性能监控

### 关键指标

| 指标 | 描述 | 告警阈值 |
|------|------|---------|
| 响应时间（p95） | 95% 请求的响应时间 | > 目标的 1.5× |
| 错误率 | 失败请求的百分比 | > 1% |
| 吞吐量 | 每秒请求数 | < 预期的 80% |
| CPU 使用率 | 处理器利用率 | > 80% |
| 内存使用率 | 内存利用率 | > 85% |

---

## 相关标准

- [部署标准](deployment-standards.md)
- [安全标准](security-standards.md)
- [测试标准](testing-standards.md)

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
