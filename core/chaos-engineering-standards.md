# Chaos Engineering Standards

> **Language**: English

**Version**: 1.0.0
**Last Updated**: 2026-03-31
**Applicability**: All software projects
**Scope**: universal
**License**: CC BY 4.0
**References**: [Principles of Chaos Engineering](https://principlesofchaos.org/), [Netflix Chaos Engineering](https://netflixtechblog.com/tagged/chaos-engineering)

---

## Overview

This document defines chaos engineering standards covering experiment workflow, fault injection types, safety guardrails, progressive chaos stages, SLO integration, and experiment record templates. The goal is to continuously validate system resilience through scientific chaos experiments.

---

## 1. Experiment Workflow

A chaos experiment follows a 4-step scientific method to validate system resilience.

### 4-Step Process

| Step | Name | Description |
|------|------|-------------|
| **Step 1** | **Hypothesis** | Define the steady-state hypothesis: "Under fault X, the system should maintain behavior Y." Describe expected behavior and measurable indicators. |
| **Step 2** | **Experiment** | Design and execute fault injection. Record experiment parameters, duration, and scope. |
| **Step 3** | **Observation** | Monitor system metrics, logs, and alerts. Compare actual behavior against the hypothesis. |
| **Step 4** | **Conclusion** | Analyze results: hypothesis confirmed or disproved. Document findings and improvement items. |

### Hypothesis Guidelines

A well-formed steady-state hypothesis should:
- Define what "normal" looks like (e.g., p99 latency < 200ms, error rate < 0.1%)
- Specify the fault condition being tested
- State the expected system behavior during the fault
- Be falsifiable and measurable

---

## 2. Fault Injection Types

Five standard fault injection types cover the most common failure modes in distributed systems.

| Type | Description | Examples |
|------|-------------|----------|
| **Network Latency** | Inject network delay or packet loss | Add 200ms latency, 5% packet loss, DNS resolution delay |
| **Service Disruption** | Terminate or degrade service instances | Randomly kill pods, shut down an availability zone, restart a service |
| **Resource Exhaustion** | Exhaust compute resources | CPU saturation, memory pressure, disk space full, file descriptor exhaustion |
| **Dependency Failure** | Simulate external dependency failures | Database connection drop, third-party API returning 503, cache unavailability |
| **Clock Skew** | Introduce clock drift or NTP anomalies | Clock skew forward/backward by 5 minutes, NTP service disruption |

### Selecting Fault Types

Choose fault injection types based on:
- System architecture and known weak points
- Historical incident patterns
- Dependency criticality analysis
- SLO risk assessment

---

## 3. Safety Guardrails

Every chaos experiment MUST have safety guardrails to prevent uncontrolled damage.

### Three Safety Mechanisms

| Mechanism | Description | Examples |
|-----------|-------------|----------|
| **Blast Radius** | Limit the scope of impact to a controlled subset | Maximum N% of traffic affected, at most M instances impacted, single region only |
| **Auto-Stop** | Define automatic termination conditions that halt the experiment | Error rate exceeds threshold, latency exceeds upper limit, health check failures exceed count |
| **Rollback** | Provide a one-click mechanism to remove all injected faults and restore normal state | Kill switch to revert all fault injection, automated cleanup scripts, infrastructure rollback |

### Guardrail Requirements

- Every experiment MUST define all three mechanisms before execution
- Auto-Stop conditions MUST be monitored in real-time
- Rollback MUST be tested before the experiment begins
- A designated "experiment owner" MUST be present during execution

---

## 4. Progressive Chaos

Chaos engineering adoption follows a progressive 3-stage approach, each with prerequisites that must be met before advancing.

### 3-Stage Progression

| Stage | Environment | Prerequisites |
|-------|-------------|---------------|
| **Stage 1** | **Non-Production** | Basic monitoring in place; team understands chaos engineering principles; safety guardrails defined |
| **Stage 2** | **Staging** | Completed 3+ successful experiments in Stage 1; full observability system deployed; automated rollback verified |
| **Stage 3** | **Production** | Stage 2 completed without major issues; mature safety guardrails proven; management approval obtained; incident response plan ready |

### Stage Advancement Criteria

- Each stage requires documented evidence of prerequisite completion
- Stage advancement decisions should be reviewed by the team
- Regression to a previous stage is acceptable if new risks are identified

---

## 5. SLO Integration

Chaos experiments must be coordinated with SLO Error Budget management to avoid excessive impact on service reliability.

### Error Budget Constraints

| Rule | Threshold | Description |
|------|-----------|-------------|
| **Single Experiment Limit** | **10%** | A single chaos experiment SHALL NOT consume more than 10% of the total Error Budget |
| **Pause Threshold** | **30%** | Chaos experiments SHALL be paused when remaining Error Budget falls below 30% |
| **Budget Reporting** | — | All Error Budget impact from chaos experiments MUST be recorded in the Error Budget report |

### Integration Guidelines

- Schedule chaos experiments when Error Budget is healthy (> 50% remaining)
- Coordinate with SLO owners before running experiments that may affect SLIs
- Track chaos-induced errors separately from organic errors when possible
- Review chaos experiment impact in regular SLO review meetings

---

## 6. Experiment Record Template

Every completed chaos experiment MUST be documented using the standard record template.

### 5-Section Record Format

| Section | Content |
|---------|---------|
| **Hypothesis** | Steady-state hypothesis description, expected behavior, measurable indicators |
| **Method** | Fault injection type, parameters, duration, blast radius, environment |
| **Result** | Actual system behavior observed, metric changes, alerts triggered, user impact |
| **Learning** | Whether hypothesis was confirmed or disproved, weaknesses discovered, unexpected behaviors |
| **Action** | Follow-up improvement plan, responsible person, timeline, related tickets |

### Record Example

```markdown
## Chaos Experiment Record

### Hypothesis
Under a 200ms network latency injection on the payment service,
the checkout flow should complete within 3 seconds (p99) with zero failed transactions.

### Method
- **Type**: Network Latency
- **Target**: payment-service pods (2 of 6)
- **Parameters**: 200ms delay on all outbound requests
- **Duration**: 15 minutes
- **Blast Radius**: 33% of payment service instances
- **Environment**: Staging

### Result
- Checkout p99 latency increased to 2.8s (within threshold)
- 0 failed transactions
- 2 timeout alerts triggered (expected)
- No user-facing errors

### Learning
- Hypothesis CONFIRMED
- Retry logic worked as expected
- Timeout alert threshold may need adjustment (too sensitive)

### Action
- [ ] Adjust timeout alert threshold from 2s to 3s (owner: SRE team, by: next sprint)
- [ ] Add circuit breaker metrics to dashboard (owner: platform team, by: next sprint)
```

---

## References

- [Principles of Chaos Engineering](https://principlesofchaos.org/)
- [Netflix Chaos Engineering](https://netflixtechblog.com/tagged/chaos-engineering)
- [Gremlin Chaos Engineering Guide](https://www.gremlin.com/chaos-engineering/)
- [AWS Fault Injection Simulator](https://aws.amazon.com/fis/)

---

*This standard is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).*
