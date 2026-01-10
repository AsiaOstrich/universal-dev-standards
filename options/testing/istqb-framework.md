# ISTQB Testing Framework

> **Language**: English | [繁體中文](../../locales/zh-TW/options/testing/istqb-framework.md)

**Parent Standard**: [Testing Completeness](../../core/testing-completeness.md)

---

## Overview

The ISTQB (International Software Testing Qualifications Board) testing framework provides a standardized 4-level testing model. It offers formal structure, clear documentation requirements, and is widely used in enterprise environments.

## Best For

- Enterprise projects requiring formal QA processes
- Projects needing certification or compliance
- Organizations with dedicated QA teams
- Waterfall or hybrid development methodologies
- Projects with strict audit requirements

## Testing Levels

### 1. Unit Testing (UT)

| Aspect | Details |
|--------|---------|
| **ISTQB Term** | Component Testing |
| **Definition** | Testing individual software components in isolation |
| **Purpose** | Verify code units work correctly |
| **Performed By** | Developers |

### 2. Integration Testing (IT/SIT)

| Aspect | Details |
|--------|---------|
| **ISTQB Term** | Integration Testing |
| **Abbreviation** | IT or SIT |
| **Definition** | Testing interfaces and interactions between integrated components |
| **Purpose** | Verify component interactions |
| **Performed By** | Developers or QA |

**Note:**
- IT (Integration Testing): Common in Agile/DevOps
- SIT (System Integration Testing): Common in Enterprise/ISTQB contexts
- Both terms refer to the same testing level

### 3. System Testing (ST)

| Aspect | Details |
|--------|---------|
| **ISTQB Term** | System Testing |
| **Definition** | Testing the complete integrated system to verify it meets requirements |
| **Purpose** | Verify system meets functional and non-functional requirements |
| **Performed By** | QA Team |

### 4. Acceptance Testing (AT/UAT)

| Aspect | Details |
|--------|---------|
| **ISTQB Term** | Acceptance Testing |
| **Abbreviation** | AT or UAT |
| **Definition** | Testing to determine if the system satisfies business needs |
| **Purpose** | Verify system meets business requirements |
| **Performed By** | End users or business stakeholders |

**Subtypes:**
- **User Acceptance Testing (UAT):** Validation by actual users
- **Contract Acceptance Testing:** Verification against contract criteria
- **Regulatory Acceptance Testing:** Compliance verification

## Test Types

### Functional Testing

- Functional testing
- User interface testing
- Regression testing

### Non-Functional Testing

- Performance testing
- Security testing
- Usability testing
- Reliability testing

## When to Choose ISTQB

**Choose when:**
- Need formal test documentation
- Working with QA certification bodies
- Enterprise environment with compliance requirements
- Team includes certified ISTQB professionals
- Audit trail is important

**Avoid when:**
- Rapid iteration is priority
- Small team without dedicated QA
- Pure DevOps/Continuous Delivery focus
- Documentation overhead is concern

## Comparison with Industry Pyramid

| ISTQB Level | Industry Equivalent | Key Difference |
|-------------|---------------------|----------------|
| Unit Testing | Unit Testing (UT) | Same concept |
| Integration Testing | Integration Testing (IT/SIT) | Same concept, different abbreviation conventions |
| System Testing | Often merged with E2E | ISTQB separates system validation from user acceptance |
| Acceptance Testing | Part of E2E | ISTQB has dedicated level for business validation |

## Rules

| Rule | Description | Priority |
|------|-------------|----------|
| Four-level structure | Use 4 levels: UT → IT/SIT → ST → AT/UAT with entry/exit criteria | Required |
| Requirement traceability | Each test case should trace to a requirement | Required |
| Defect classification | Classify defects by severity and priority per ISTQB guidelines | Recommended |

## Related Options

- [Industry Pyramid](./industry-pyramid.md) - Agile 3-level testing model
- [Unit Testing](./unit-testing.md) - Detailed unit testing practices
- [System Testing](./system-testing.md) - System testing practices

---

## References

- [ISTQB Glossary v4.0](https://glossary.istqb.org)
- [ISTQB Foundation Level Syllabus](https://www.istqb.org/certifications/certified-tester-foundation-level)

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
