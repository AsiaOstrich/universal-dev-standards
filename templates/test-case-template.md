# Test Case Template

> Inspired by ISO/IEC/IEEE 29119-3 Test Case Specification.

## Test Case: TC-{NNN}

### Metadata

| Field | Value |
|-------|-------|
| **ID** | TC-{NNN} |
| **Title** | {Descriptive test case title} |
| **Test Level** | Unit / Integration / System / E2E |
| **Priority** | High / Medium / Low |
| **Related Task** | T-{NNN} |
| **Author** | {name} |
| **Date** | {date} |

### Preconditions

- {Required state or setup before test execution}

### Test Steps

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | {action} | {expected} |
| 2 | {action} | {expected} |
| 3 | {action} | {expected} |

### Verify Command

```bash
{command to verify this test case passes}
```

### Test Data

- {Input data requirements}

### Postconditions

- {Expected state after test execution}

### Notes

- {Additional information, edge cases, or references}

---

## Example

### Test Case: TC-001

| Field | Value |
|-------|-------|
| **ID** | TC-001 |
| **Title** | User login with valid credentials returns JWT token |
| **Test Level** | Integration |
| **Priority** | High |
| **Related Task** | T-003 |

**Preconditions**: Test database seeded with user `test@example.com`

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | POST /api/login with valid credentials | 200 OK |
| 2 | Check response body | Contains `token` field |
| 3 | Decode JWT token | Contains correct user ID |

**Verify Command**:
```bash
vitest run src/auth/login.integration.test.ts
```
