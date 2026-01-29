# Requirement Engineering Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/requirement-engineering.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-28
**Applicability**: All software projects
**Scope**: universal

---

## Purpose

This standard defines the principles, processes, and best practices for software requirements engineering. It provides the theoretical foundation for writing, managing, and validating software requirements throughout the development lifecycle.

**Reference Standards**:
- [IEEE 830-1998 (reaffirmed 2009)](https://standards.ieee.org/ieee/830/1222/) - Recommended Practice for Software Requirements Specifications
- [IEEE 29148-2018](https://standards.ieee.org/ieee/29148/6937/) - Systems and Software Engineering — Life Cycle Processes — Requirements Engineering
- [SWEBOK v4.0 - Chapter 1: Software Requirements](https://www.computer.org/education/bodies-of-knowledge/software-engineering) - IEEE Computer Society
- [ISO/IEC 25010:2011](https://www.iso.org/standard/35733.html) - Systems and Software Quality Requirements and Evaluation (SQuaRE)

---

## Glossary

Quick reference for requirements engineering terminology:

| Term | Definition |
|------|------------|
| **Requirement** | A condition or capability needed by a stakeholder to solve a problem or achieve an objective |
| **Functional Requirement (FR)** | What the system should DO (behavior, features) |
| **Non-Functional Requirement (NFR)** | How the system should BEHAVE (quality attributes) |
| **User Story** | Agile requirement format: "As a [role], I want [feature], so that [benefit]" |
| **Acceptance Criteria (AC)** | Conditions that must be satisfied for a requirement to be accepted |
| **Traceability** | Ability to link requirements to their origins and implementations |
| **Elicitation** | Process of gathering requirements from stakeholders |
| **Validation** | Confirming requirements meet stakeholder needs ("Building the right thing") |
| **Verification** | Confirming implementation meets requirements ("Building it right") |

---

## Table of Contents

1. [Requirements Engineering Lifecycle](#requirements-engineering-lifecycle)
2. [Requirements Elicitation](#requirements-elicitation)
3. [Requirements Analysis](#requirements-analysis)
4. [Requirements Specification](#requirements-specification)
5. [Requirements Validation](#requirements-validation)
6. [Requirement Types and Classification](#requirement-types-and-classification)
7. [Quality Attributes (NFRs)](#quality-attributes-nfrs)
8. [User Story Standards (Agile)](#user-story-standards-agile)
9. [Acceptance Criteria Guidelines](#acceptance-criteria-guidelines)
10. [Requirements Traceability](#requirements-traceability)
11. [Change Management](#change-management)
12. [Integration with SDD](#integration-with-sdd)
13. [Common Pitfalls](#common-pitfalls)
14. [Best Practices](#best-practices)

---

## Requirements Engineering Lifecycle

Requirements engineering is not a one-time activity but a continuous process throughout the software lifecycle.

### Process Overview (SWEBOK v4.0)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Requirements Engineering Process                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌───────────────┐    ┌───────────────┐    ┌───────────────┐              │
│   │  Elicitation  │───▶│   Analysis    │───▶│ Specification │              │
│   │               │    │               │    │               │              │
│   │ • Interviews  │    │ • Modeling    │    │ • SRS Doc     │              │
│   │ • Workshops   │    │ • Prioritize  │    │ • User Stories│              │
│   │ • Observation │    │ • Negotiate   │    │ • Use Cases   │              │
│   └───────────────┘    └───────────────┘    └───────────────┘              │
│           ▲                                         │                       │
│           │                                         ▼                       │
│   ┌───────────────────────────────────────────────────────────────┐        │
│   │                        Validation                              │        │
│   │                                                                │        │
│   │  • Reviews  • Prototyping  • Model Validation  • Acceptance   │        │
│   └───────────────────────────────────────────────────────────────┘        │
│           │                                                                 │
│           ▼                                                                 │
│   ┌───────────────────────────────────────────────────────────────┐        │
│   │                    Change Management                           │        │
│   │                                                                │        │
│   │  • Change Requests  • Impact Analysis  • Version Control      │        │
│   └───────────────────────────────────────────────────────────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Activity Summary

| Phase | Purpose | Key Outputs |
|-------|---------|-------------|
| **Elicitation** | Gather requirements from stakeholders | Raw requirements, interview notes |
| **Analysis** | Organize, prioritize, resolve conflicts | Requirement models, priority matrix |
| **Specification** | Document requirements formally | SRS, user stories, use cases |
| **Validation** | Confirm correctness and completeness | Review reports, prototypes |
| **Change Management** | Handle requirement changes | Change requests, impact assessments |

---

## Requirements Elicitation

### Elicitation Techniques

| Technique | Best For | Limitations |
|-----------|----------|-------------|
| **Interviews** | Deep understanding of individual needs | Time-consuming, subjective |
| **Workshops (JAD)** | Consensus building, group decisions | Scheduling difficulties |
| **Observation** | Understanding actual work processes | Observer effect, time-intensive |
| **Questionnaires** | Large stakeholder groups | Low response rates, superficial |
| **Document Analysis** | Existing systems, compliance requirements | May be outdated |
| **Prototyping** | Clarifying UI/UX requirements | May set wrong expectations |
| **Brainstorming** | Creative solutions, new ideas | May lack focus |

### Stakeholder Identification

```
┌─────────────────────────────────────────────────────────────────┐
│                    Stakeholder Categories                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Primary Stakeholders (Direct Users)                           │
│   ├── End Users                                                 │
│   ├── System Administrators                                     │
│   └── Operators                                                 │
│                                                                 │
│   Secondary Stakeholders (Indirect Influence)                   │
│   ├── Customers (paying for the system)                         │
│   ├── Management                                                │
│   └── Regulatory Bodies                                         │
│                                                                 │
│   Tertiary Stakeholders (Technical)                             │
│   ├── Development Team                                          │
│   ├── Testing Team                                              │
│   └── Maintenance Team                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Elicitation Best Practices

1. **Identify ALL stakeholders** before starting elicitation
2. **Separate needs from solutions** - focus on "what" not "how"
3. **Document assumptions** explicitly
4. **Use multiple techniques** for comprehensive coverage
5. **Validate understanding** by restating requirements back to stakeholders

---

## Requirements Analysis

### Analysis Activities

| Activity | Description | Output |
|----------|-------------|--------|
| **Categorization** | Group requirements by type, module, priority | Requirement hierarchy |
| **Prioritization** | Rank by business value, risk, dependencies | Priority matrix |
| **Modeling** | Create visual representations | Use cases, data flow diagrams |
| **Conflict Resolution** | Resolve contradicting requirements | Negotiated requirements |
| **Feasibility Assessment** | Evaluate technical/economic feasibility | Feasibility report |

### Prioritization Methods

#### MoSCoW Method

| Priority | Meaning | Description |
|----------|---------|-------------|
| **M**ust Have | Critical | System won't work without it |
| **S**hould Have | Important | Important but can work around |
| **C**ould Have | Desirable | Nice to have if time permits |
| **W**on't Have | Future | Out of scope for this release |

#### Numbered Priority (P0-P3)

| Level | Label | Response Time | Example |
|-------|-------|---------------|---------|
| P0 | Critical | Immediate | Security vulnerability |
| P1 | High | This sprint | Core feature |
| P2 | Medium | This release | Improvement |
| P3 | Low | Backlog | Enhancement |

#### Kano Model

| Category | Characteristic | Customer Reaction |
|----------|---------------|-------------------|
| **Basic (Must-be)** | Expected, taken for granted | Dissatisfied if missing |
| **Performance (One-dimensional)** | More is better | Satisfaction proportional |
| **Excitement (Delighter)** | Unexpected innovation | Highly satisfied if present |

---

## Requirements Specification

### IEEE 830 SRS Structure

The IEEE 830-1998 standard recommends this structure for Software Requirements Specifications:

```
1. Introduction
   1.1 Purpose
   1.2 Scope
   1.3 Definitions, Acronyms, Abbreviations
   1.4 References
   1.5 Overview

2. Overall Description
   2.1 Product Perspective
   2.2 Product Functions
   2.3 User Characteristics
   2.4 Constraints
   2.5 Assumptions and Dependencies

3. Specific Requirements
   3.1 External Interface Requirements
   3.2 Functional Requirements
   3.3 Performance Requirements
   3.4 Logical Database Requirements
   3.5 Design Constraints
   3.6 Software System Attributes
   3.7 Organizing the Specific Requirements

Appendices
Index
```

### Quality Characteristics (IEEE 830)

A good SRS should be:

| Characteristic | Description | Verification |
|----------------|-------------|--------------|
| **Correct** | Accurately represents stakeholder needs | Stakeholder review |
| **Unambiguous** | Only one interpretation possible | Peer review |
| **Complete** | All requirements documented | Checklist verification |
| **Consistent** | No contradictions | Automated checking |
| **Ranked** | Priority assigned to each requirement | Priority matrix |
| **Verifiable** | Can be tested | Testability review |
| **Modifiable** | Easy to change | Traceability matrix |
| **Traceable** | Origin and implementation linkable | Traceability tools |

### Requirement Statement Guidelines

#### SMART Requirements

| Attribute | Good Example | Bad Example |
|-----------|--------------|-------------|
| **S**pecific | "Display error message 'Invalid email format'" | "Show appropriate error" |
| **M**easurable | "Response time < 200ms" | "Fast response" |
| **A**chievable | "Support 1000 concurrent users" | "Support infinite users" |
| **R**elevant | Related to business goal | Technical preference |
| **T**ime-bound | "Available for Q2 release" | "Sometime in the future" |

#### Writing Clear Requirements

**Template**:
```
[CONDITION] The system SHALL [ACTION] [OBJECT] [CONSTRAINT]
```

**Examples**:
```
✓ Good: When the user submits a form with invalid email, the system SHALL display an error message within 100ms.

✗ Bad: The system should handle email validation properly.
```

---

## Requirements Validation

### Validation Techniques

| Technique | Description | Best For |
|-----------|-------------|----------|
| **Requirements Review** | Formal inspection by stakeholders | All projects |
| **Prototyping** | Build mockup for feedback | UI/UX requirements |
| **Model Validation** | Check models for consistency | Complex systems |
| **Acceptance Test Design** | Write tests before development | Agile projects |

### Validation Checklist

- [ ] All requirements are testable
- [ ] No conflicting requirements
- [ ] All stakeholders have approved
- [ ] Edge cases are documented
- [ ] NFRs are quantified
- [ ] Dependencies are identified
- [ ] Assumptions are documented
- [ ] Traceability is established

### Common Validation Issues

| Issue | Symptom | Resolution |
|-------|---------|------------|
| **Ambiguity** | Multiple interpretations | Rewrite with specific terms |
| **Incompleteness** | Missing scenarios | Add edge cases |
| **Inconsistency** | Contradicting requirements | Negotiate with stakeholders |
| **Infeasibility** | Technically impossible | Adjust scope or technology |
| **Untestability** | Cannot verify | Add measurable criteria |

---

## Requirement Types and Classification

### Functional Requirements (FR)

Define what the system should DO.

**Categories**:
- Business Rules
- User Operations
- Data Processing
- System Behavior
- Integration Points

**Example**:
```markdown
### FR-AUTH-001: User Login

**Description**: Users can authenticate using email and password.

**Acceptance Criteria**:
- [ ] Valid credentials grant access
- [ ] Invalid credentials show error message
- [ ] Account locks after 5 failed attempts
- [ ] Session expires after 30 minutes of inactivity
```

### Non-Functional Requirements (NFR)

Define how the system should BEHAVE (quality attributes).

See [Quality Attributes (NFRs)](#quality-attributes-nfrs) section for details.

### Constraints

External limitations on the system.

| Type | Example |
|------|---------|
| **Technical** | Must use PostgreSQL database |
| **Business** | Must comply with GDPR |
| **Resource** | Budget limited to $100K |
| **Time** | Must launch before Q4 |

---

## Quality Attributes (NFRs)

### ISO 25010 Quality Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ISO/IEC 25010 Quality Model                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Functional       Performance      Compatibility    Usability              │
│   Suitability      Efficiency                                               │
│   ├── Completeness ├── Time behavior ├── Co-existence ├── Appropriateness  │
│   ├── Correctness  ├── Resource      ├── Interoper-   ├── Recognizability  │
│   └── Appropriate-    utilization       ability       ├── Learnability     │
│       ness         └── Capacity                       ├── Operability      │
│                                                       ├── User error       │
│                                                       │   protection       │
│                                                       ├── UI aesthetics    │
│                                                       └── Accessibility    │
│                                                                             │
│   Reliability      Security         Maintainability  Portability            │
│   ├── Maturity     ├── Confiden-    ├── Modularity   ├── Adaptability      │
│   ├── Availability    tiality       ├── Reusability  ├── Installability    │
│   ├── Fault        ├── Integrity    ├── Analysability ├── Replaceability   │
│      tolerance     ├── Non-repudi-  ├── Modifiability                      │
│   └── Recover-        ation         └── Testability                        │
│       ability      └── Account-                                             │
│                       ability                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### NFR Specification Template

```markdown
### NFR-PERF-001: API Response Time

**Category**: Performance Efficiency > Time Behavior
**Priority**: P1

**Requirement**:
The system SHALL respond to API requests within 200ms for the 95th percentile under normal load.

**Measurement**:
- Normal load: 1000 concurrent users
- Measurement tool: Application Performance Monitoring (APM)
- Threshold: p95 < 200ms, p99 < 500ms

**Rationale**:
User research shows abandonment rate increases significantly above 200ms response time.

**Verification**:
Load testing with k6 or JMeter before each release.
```

### Common NFR Categories

| Category | Typical Metrics | Example |
|----------|-----------------|---------|
| **Performance** | Response time, throughput | < 200ms p95 |
| **Scalability** | Concurrent users, data volume | 10,000 users |
| **Availability** | Uptime percentage | 99.9% SLA |
| **Security** | Encryption, authentication | TLS 1.3 |
| **Usability** | Task completion, error rate | WCAG 2.1 AA |
| **Maintainability** | Code coverage, complexity | > 80% coverage |

---

## User Story Standards (Agile)

### User Story Format

```
As a [role/persona],
I want [feature/capability],
So that [benefit/value].
```

### INVEST Criteria

| Criterion | Description | Validation Question |
|-----------|-------------|---------------------|
| **I**ndependent | Can be delivered standalone | Dependencies on other stories? |
| **N**egotiable | Details can be discussed | Implementation locked in? |
| **V**aluable | Provides user/business value | Who benefits? |
| **E**stimable | Effort can be estimated | Unknown scope? |
| **S**mall | Fits in one sprint | Can it be split? |
| **T**estable | Clear acceptance criteria | How to verify? |

### User Story Template

```markdown
## [US-XXX] Feature Title

### Story
As a [role],
I want [feature],
So that [benefit].

### Acceptance Criteria
- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]

### Notes
- [Additional context]
- [Technical considerations]

### Priority: P1
### Estimate: 3 points
```

### Story Splitting Techniques

| Technique | Description | Example |
|-----------|-------------|---------|
| **By Workflow** | Split by user journey steps | Login → View → Edit |
| **By Data** | Split by data variations | Import CSV → Import Excel |
| **By Rules** | Split by business rules | Basic validation → Advanced |
| **By Interface** | Split by access method | Web → Mobile → API |
| **By Operations** | Split by CRUD | Create → Read → Update |

---

## Acceptance Criteria Guidelines

### Formats

#### Given-When-Then (BDD Style)

```gherkin
Given [precondition/context]
When [action/trigger]
Then [expected outcome]
And [additional outcome]
```

**Example**:
```gherkin
Given I am a logged-in user
When I click the "Add to Cart" button
Then the item should be added to my cart
And the cart count should increase by 1
```

#### Checkbox Style

```markdown
- [ ] User can upload files up to 10MB
- [ ] Supported formats: JPG, PNG, PDF
- [ ] Progress bar displays during upload
- [ ] Error message shown for unsupported formats
```

### Quality Guidelines

| Quality | Good | Bad |
|---------|------|-----|
| **Specific** | "Display error within 2 seconds" | "Handle errors" |
| **Measurable** | "Response time < 500ms" | "Fast response" |
| **Testable** | "Modal shows confirmation" | "Good UX" |
| **Complete** | All scenarios covered | Missing edge cases |

### Common AC Mistakes

| Mistake | Example | Fix |
|---------|---------|-----|
| **Too Vague** | "System works well" | Quantify expectations |
| **Implementation Detail** | "Use Redis cache" | Focus on outcome |
| **Missing Edge Cases** | "User can upload" | Add size/format limits |
| **Subjective** | "User-friendly" | Define specific criteria |

---

## Requirements Traceability

### Traceability Matrix

| Req ID | Source | Design | Code | Test | Status |
|--------|--------|--------|------|------|--------|
| FR-001 | BRD-1.1 | DES-01 | auth.ts | UT-001, IT-005 | Implemented |
| FR-002 | BRD-1.2 | DES-02 | user.ts | UT-002 | In Progress |
| NFR-001 | NFR-Doc | DES-01 | - | PT-001 | Verified |

### Traceability Types

```
┌─────────────────────────────────────────────────────────────────┐
│                    Traceability Relationships                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Business Need                                                 │
│        │                                                        │
│        ▼ derived-from                                           │
│   Stakeholder Requirement                                       │
│        │                                                        │
│        ▼ refined-to                                             │
│   System Requirement                                            │
│        │                                                        │
│        ├──▶ allocated-to ──▶ Design Component                   │
│        │                                                        │
│        └──▶ verified-by ──▶ Test Case                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Benefits of Traceability

1. **Impact Analysis**: Understand change effects
2. **Completeness Check**: Ensure all requirements implemented
3. **Test Coverage**: Verify all requirements tested
4. **Audit Trail**: Regulatory compliance
5. **Knowledge Preservation**: Maintain rationale

---

## Change Management

### Change Request Process

```
┌─────────────────────────────────────────────────────────────────┐
│                  Requirement Change Process                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌───────────┐    ┌───────────┐    ┌───────────┐              │
│   │  Request  │───▶│  Analyze  │───▶│  Decide   │              │
│   │           │    │  Impact   │    │           │              │
│   └───────────┘    └───────────┘    └───────────┘              │
│                                           │                     │
│                         ┌─────────────────┼─────────────────┐   │
│                         │                 │                 │   │
│                         ▼                 ▼                 ▼   │
│                    ┌─────────┐       ┌─────────┐       ┌────────┤
│                    │ Approve │       │ Defer   │       │ Reject │
│                    └────┬────┘       └─────────┘       └────────┘
│                         │                                       │
│                         ▼                                       │
│                    ┌─────────┐    ┌───────────┐                │
│                    │Implement│───▶│  Verify   │                │
│                    └─────────┘    └───────────┘                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Impact Analysis Checklist

- [ ] Affected requirements identified
- [ ] Affected design components listed
- [ ] Affected code modules identified
- [ ] Affected test cases updated
- [ ] Schedule impact assessed
- [ ] Cost impact estimated
- [ ] Risk assessment completed
- [ ] Stakeholder approval obtained

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-15 | J. Smith | Initial release |
| 1.1 | 2024-02-20 | A. Jones | Added NFR-005 |
| 2.0 | 2024-04-01 | J. Smith | Major scope change |

---

## Integration with SDD

### SDD Workflow Entry Points

Requirements engineering integrates with Spec-Driven Development at multiple points:

```
┌─────────────────────────────────────────────────────────────────┐
│            Requirements → SDD Integration                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Requirements Engineering                                      │
│   ├── Elicitation                                               │
│   │      └──▶ Input for SDD Proposal (SPEC-XXX.md)              │
│   ├── Specification                                             │
│   │      └──▶ Acceptance Criteria → Forward Derivation          │
│   └── Validation                                                │
│          └──▶ Verification phase in SDD                         │
│                                                                 │
│   SDD Workflow                                                  │
│   ├── Proposal (contains requirements as AC)                    │
│   ├── Review (requirements validation)                          │
│   ├── Implementation (requirements realized)                    │
│   ├── Verification (requirements tested)                        │
│   └── Archive (requirements documented)                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Mapping Requirements to SDD

| Requirements Artifact | SDD Equivalent |
|----------------------|----------------|
| User Story | SPEC Summary section |
| Acceptance Criteria | SPEC Acceptance Criteria |
| NFRs | SPEC Constraints/Requirements |
| Traceability | SPEC Dependencies |
| Validation | SPEC Verification phase |

### Reference

See [Spec-Driven Development Standards](spec-driven-development.md) for complete SDD workflow.

---

## Common Pitfalls

### Requirements Elicitation Pitfalls

| Pitfall | Problem | Mitigation |
|---------|---------|------------|
| **Assuming stakeholder knowledge** | Missing requirements | Detailed discovery sessions |
| **Ignoring edge cases** | Incomplete requirements | Systematic edge case analysis |
| **Gold plating** | Unnecessary features | Stick to validated needs |
| **Scope creep** | Uncontrolled growth | Formal change process |

### Requirements Specification Pitfalls

| Pitfall | Problem | Mitigation |
|---------|---------|------------|
| **Ambiguous language** | Multiple interpretations | Use precise terms |
| **Solution in requirements** | Limiting options | Focus on "what", not "how" |
| **Missing NFRs** | Quality issues later | Systematic NFR elicitation |
| **No traceability** | Lost requirements | Traceability matrix |

### Requirements Validation Pitfalls

| Pitfall | Problem | Mitigation |
|---------|---------|------------|
| **Rubber-stamp reviews** | Defects slip through | Formal review process |
| **Late validation** | Expensive rework | Early prototyping |
| **Missing stakeholders** | Incomplete validation | Stakeholder mapping |

---

## Best Practices

### Do's

- ✅ Involve ALL stakeholders in elicitation
- ✅ Prioritize requirements using a consistent method
- ✅ Write testable acceptance criteria
- ✅ Maintain traceability throughout lifecycle
- ✅ Version control all requirements documents
- ✅ Review requirements with stakeholders regularly
- ✅ Document assumptions explicitly
- ✅ Use templates for consistency

### Don'ts

- ❌ Skip requirements for "small" changes
- ❌ Write requirements in isolation
- ❌ Mix requirements with design/implementation
- ❌ Use ambiguous language ("appropriate", "user-friendly")
- ❌ Ignore non-functional requirements
- ❌ Assume stakeholders know what they want
- ❌ Skip validation before development

---

## Related Standards

- [Spec-Driven Development](spec-driven-development.md) - Specification workflow
- [Forward Derivation Standards](forward-derivation-standards.md) - AC → Test derivation
- [Behavior-Driven Development](behavior-driven-development.md) - Given-When-Then scenarios
- [Acceptance Test-Driven Development](acceptance-test-driven-development.md) - ATDD workshops
- [Testing Standards](testing-standards.md) - Test verification
- [Documentation Structure](documentation-structure.md) - Documentation standards

---

## References

### Standards

- [IEEE 830-1998](https://standards.ieee.org/ieee/830/1222/) - Recommended Practice for Software Requirements Specifications
- [IEEE 29148-2018](https://standards.ieee.org/ieee/29148/6937/) - Life Cycle Processes — Requirements Engineering
- [ISO/IEC 25010:2011](https://www.iso.org/standard/35733.html) - Systems and Software Quality Requirements and Evaluation
- [SWEBOK v4.0 - Chapter 1](https://www.computer.org/education/bodies-of-knowledge/software-engineering) - Software Requirements

### Books

- Wiegers, K. & Beatty, J. (2013). *Software Requirements* (3rd ed.). Microsoft Press.
- Robertson, S. & Robertson, J. (2012). *Mastering the Requirements Process* (3rd ed.). Addison-Wesley.
- Cohn, M. (2004). *User Stories Applied*. Addison-Wesley.

### Articles

- [INVEST in Good Stories](https://xp123.com/articles/invest-in-good-stories-and-smart-tasks/) - Bill Wake
- [User Story Template](https://www.mountaingoatsoftware.com/agile/user-stories) - Mike Cohn

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Initial release: Complete requirement engineering standards with IEEE 830, SWEBOK v4.0, ISO 25010 references |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
