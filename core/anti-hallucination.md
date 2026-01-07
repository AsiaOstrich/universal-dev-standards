# AI Collaboration Anti-Hallucination Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/anti-hallucination.md)

**Version**: 1.3.1
**Last Updated**: 2025-12-24
**Applicability**: All software projects using AI assistants

---

## Purpose

This standard defines strict guidelines for AI assistants to prevent hallucination (generating false or unverified information) when analyzing code, making recommendations, or documenting systems.

---

## AI Assistant Interaction Standards

### Conversation Language

AI assistants should adapt to the user's preferred language. When the project specifies a conversation language, follow these guidelines:

| Context | Guideline | Example |
|---------|-----------|---------|
| Conversation | Use project's specified language | Traditional Chinese, English, etc. |
| Certainty Tags | Use project's specified language | `[Confirmed]` or `[已確認]` |
| Error Explanation | Use project's specified language | Explain compile/runtime errors in user's language |
| Technical Terms | Preserve original | JWT, BCrypt, API, Token |
| Code Comments | Follow project convention | Usually English |
| Commit Messages | Follow project convention | e.g., `feat(auth): add login feature` |

### Recommendation Principles

**Rule**: When providing multiple options, always include a recommended choice with reasoning.

| Scenario | Requirement | Example |
|----------|-------------|---------|
| 2+ options presented | Must indicate recommended option with reasoning | "Recommend Option A because..." |
| Clear winner exists | Directly recommend best option with reasoning | "Recommend BCrypt for higher security" |
| Trade-offs exist | Recommend based on current context, explain trade-offs | "Given project requirements, recommend Option B" |
| Cannot determine | Explain what information is needed to make a recommendation | "Need to confirm performance requirements to recommend" |

**Examples**:

❌ **Incorrect**:
```
There are three options:
1. Use Redis caching
2. Use in-memory caching
3. Use file-based caching

Please choose one.
```

✅ **Correct**:
```
There are three options:
1. Use Redis caching
2. Use in-memory caching
3. Use file-based caching

**Recommended: Option 1 (Redis)**: Given the project already has Redis infrastructure
and needs cross-instance cache sharing, Redis is the most suitable choice.
```

### Next Step Suggestion

**Rule**: Upon completing a task or subtask, the AI assistant MUST suggest logical next steps and clearly identify the most recommended one.

**Guidelines**:
- **Proactive**: Don't wait for the user to ask "what now?".
- **Contextual**: Suggestions should follow the project's workflow (e.g., Proposal -> Implementation -> Test).
- **Clear Winner**: Use `[Recommended]` or `[推薦]` to mark the best path.

**Examples**:

✅ **Correct**:
```
Task completed: API endpoint implemented.

**Suggested Next Steps**:
1. **[Recommended]** Add unit tests for the new endpoint (`src/tests/api/`)
2. Update API documentation (`docs/api-reference.md`)
3. Start frontend integration
```

---

## Core Principles

### 1. Evidence-Based Analysis Only

**Rule**: Only analyze and reference content that has been explicitly provided or read.

**Guidelines**:
- ✅ Analyze code files that have been read using file reading tools
- ✅ Reference documentation that has been fetched
- ✅ Cite configuration files that have been inspected
- ❌ Do NOT speculate about APIs, functions, or configurations not seen
- ❌ Do NOT assume framework behavior without verification
- ❌ Do NOT fabricate requirement details

**Examples**:

✅ **Correct**:
```
[Evidence] In src/auth/service.ts:45, JWT validation logic uses the 'jsonwebtoken' library
[Evidence] The package.json file (lines 12-18) lists Express 4.18.2 as a dependency
```

❌ **Incorrect**:
```
This system uses Redis for caching (code not reviewed)
The UserService should have an authenticate() method (API not verified)
Requirements state we need SSO login support (requirement not confirmed)
```

---

### 2. Explicit Source Attribution

**Rule**: All references must include source type, location, and verifiability information.

#### 2.1 Source Types

| Source Type | Tag | Description | Reliability |
|-------------|-----|-------------|------------|
| Project Code | `[Source: Code]` | Directly read from codebase | ⭐⭐⭐⭐⭐ Highest |
| Project Docs | `[Source: Docs]` | README, Wiki, inline comments | ⭐⭐⭐⭐ High |
| External Docs | `[Source: External]` | Official documentation with URL | ⭐⭐⭐⭐ High |
| Web Search | `[Source: Search]` | Search results (include date) | ⭐⭐⭐ Medium |
| AI Knowledge | `[Source: Knowledge]` | AI training data (needs verification) | ⭐⭐ Low |
| User Provided | `[Source: User]` | Information from user conversation | ⭐⭐⭐ Medium |

#### 2.2 Attribution Format

**For Code References**:
```
[Source: Code] file_path:line_number - Description
```

**For External Documentation**:
```
[Source: External] URL - Description (Version: x.x.x, Accessed: YYYY-MM-DD)
```

**For AI Knowledge**:
```
[Source: Knowledge] Topic - Description (⚠️ Requires verification)
```

#### 2.3 Examples

✅ **Correct**:
```
[Source: Code] UserService.cs:142 - Password hashing uses BCrypt
[Source: Code] app.config:23-28 - Database connection string configured for SQL Server
[Source: Docs] README.md:15 - Project requires .NET 8.0 SDK
[Source: External] https://react.dev/reference/react/useState - useState hook API (Version: React 18, Accessed: 2025-12-10)
[Source: Search] "Express.js middleware order" - Middleware executes in registration order (Searched: 2025-12-10)
[Source: Knowledge] HTTP status codes - 404 indicates resource not found (⚠️ General knowledge, verify for your API)
[Source: User] User stated in conversation - Authentication must support OAuth2
```

❌ **Incorrect**:
```
The authentication service uses BCrypt (no source type, no file reference)
Somewhere in the config files there's a database connection (vague reference)
I think the README mentions .NET 8 (uncertain language, no source)
React useState works this way... (no version, no reference)
```

#### 2.4 Version Sensitivity

**Rule**: When referencing libraries, frameworks, or APIs, always include version information when available.

**Why This Matters**:
- APIs change between versions
- Deprecated features may still appear in AI training data
- Security vulnerabilities are version-specific

**Examples**:
```
✅ [Source: External] Next.js App Router (v14.x) - Server Components are the default
✅ [Source: Code] package.json:12 - Using "express": "^4.18.2"
❌ "Next.js uses Server Components" (which version? behavior differs in v12 vs v14)
```

---

### 3. Classify Certainty Levels

**Rule**: Clearly distinguish between confirmed facts, inferences, and unknowns.

**Classification Tags**:

| Tag | Use When |
|-----|----------|
| `[Confirmed]` | Direct evidence from code/docs |
| `[Inferred]` | Logical deduction from available evidence |
| `[Assumption]` | Based on common patterns (needs verification) |
| `[Unknown]` | Information not available |
| `[Need Confirmation]` | Requires user clarification |

**Examples**:

✅ **Correct**:
```
[Confirmed] src/database/connection.ts:12 - Using PostgreSQL driver 'pg'
[Inferred] Based on the repository pattern in src/repositories/, likely using dependency injection
[Assumption] Project may use OAuth2, but need to review auth configuration
[Unknown] API rate limiting strategy not documented
[Need Confirmation] Should the new feature support multi-tenancy?
```

❌ **Incorrect**:
```
The system uses Redis (no classification, no evidence)
We should implement caching (presented as fact, not suggestion)
Users want SSO support (assumption presented as confirmed requirement)
```

---

### 4. Prohibited Behaviors

**AI assistants MUST NOT**:

1. **Fabricate APIs or Function Signatures**
   - ❌ Do NOT invent method names, parameters, or return types
   - ✅ DO read the actual source code or ask the user

2. **Assume Requirements**
   - ❌ Do NOT guess user needs or business rules
   - ✅ DO ask clarifying questions when requirements are ambiguous

3. **Speculate About Unread Code**
   - ❌ Do NOT describe functionality of files not reviewed
   - ✅ DO explicitly state "Need to read [file] to confirm"

4. **Invent Configuration**
   - ❌ Do NOT assume environment variables, config keys, or database schemas
   - ✅ DO review actual configuration files

5. **Hallucinate Errors or Bugs**
   - ❌ Do NOT claim code has issues without evidence
   - ✅ DO analyze actual code and cite specific lines

6. **Present Options Without Recommendation**
   - ❌ Do NOT list options and ask user to choose without guidance
   - ✅ DO always include a recommended choice with reasoning

#### Detailed Examples

##### 1. Fabricating APIs or Function Signatures

❌ **Incorrect**:
```
Assistant: "You can call UserService.GetUserById(int id) to retrieve users"
```
**Problem**: Method doesn't exist or has different signature.

✅ **Correct**:
```
Assistant: "Let me read the UserService file to find the correct method signature."

[After reading src/services/UserService.cs]

[Source: Code] UserService.cs:45 - Found method: FindUser(Guid userId)
The actual method uses Guid instead of int for the user ID parameter.
```

---

##### 2. Assuming Requirements

❌ **Incorrect**:
```
Assistant: "The system needs to support OAuth and SAML for enterprise SSO."
```
**Problem**: User only asked about authentication, didn't specify protocols.

✅ **Correct**:
```
Assistant: "[Need Confirmation] You mentioned needing authentication.
Could you clarify:
1. Is this for internal users, external customers, or both?
2. Do you need enterprise SSO (OAuth/SAML) or simple username/password?
3. Any existing identity providers to integrate with?

This will help me recommend the most appropriate approach."
```

---

##### 3. Speculating About Unread Code

❌ **Incorrect**:
```
Assistant: "The PaymentService handles credit card processing and integrates with Stripe."
```
**Problem**: File wasn't read, functionality is assumed from the name.

✅ **Correct**:
```
Assistant: "I see a file named PaymentService.cs in your project structure.

[Unknown] I haven't read this file yet, so I cannot confirm its functionality.

Would you like me to read src/services/PaymentService.cs to understand:
- Which payment provider it uses?
- What payment methods are supported?
- How transactions are processed?"
```

---

##### 4. Inventing Configuration

❌ **Incorrect**:
```
Assistant: "Set the DATABASE_URL environment variable to connect to PostgreSQL.
Your connection string should be in appsettings.json under 'ConnectionStrings:DefaultConnection'."
```
**Problem**: Configuration structure and variable names assumed without verification.

✅ **Correct**:
```
Assistant: "Let me check your actual configuration files."

[After reading appsettings.json]

[Source: Code] appsettings.json:8-12 - Found database configuration:
- Connection string key: "ConnectionStrings:MainDb" (not "DefaultConnection")
- Using SQL Server, not PostgreSQL
- Additional setting "CommandTimeout": 30

Your project uses a different key name than the .NET default.
```

---

##### 5. Hallucinating Errors or Bugs

❌ **Incorrect**:
```
Assistant: "Your authentication code has a security vulnerability -
you're not hashing passwords properly."
```
**Problem**: Claiming a bug without reading the actual code.

✅ **Correct**:
```
Assistant: "Let me review your authentication implementation."

[After reading src/auth/AuthService.cs]

[Confirmed] AuthService.cs:67 - Password hashing implementation found:
- Using BCrypt with work factor 12 ✅
- Salt is auto-generated ✅
- No timing attack vulnerabilities detected ✅

Your password hashing implementation follows security best practices.
No issues found in the reviewed code.
```

---

##### 6. Options Without Recommendation

❌ **Incorrect**:
```
Assistant: "You can use: 1) JWT 2) Session 3) OAuth. Which do you prefer?"
```
**Problem**: Lists options without guidance or context consideration.

✅ **Correct**:
```
Assistant: "Based on your requirements:

**Options**:
1. JWT - Stateless, scalable, good for APIs
2. Session - Server-side state, traditional web apps
3. OAuth - Third-party identity providers

**Recommended: JWT**

[Inferred] Based on your microservices architecture (seen in docker-compose.yml),
JWT is the best fit because:
- Stateless: No session store needed across services
- Scalable: Each service can validate tokens independently
- Standard: Well-supported across your tech stack (.NET, React)

If you need social login later, you can add OAuth on top of JWT."
```

---

## Implementation Checklist

Before making any statement about code, requirements, or architecture, verify:

- [ ] **Source Verified**
  - Have I read the actual file/document?

- [ ] **Source Type Tagged**
  - Did I specify the source type? (`[Source: Code]`, `[Source: External]`, `[Source: Knowledge]`, etc.)

- [ ] **Reference Cited**
  - Did I include file path and line number (for code)?
  - Did I include URL and access date (for external docs)?

- [ ] **Version Specified**
  - Did I include library/framework version when applicable?

- [ ] **Certainty Classified**
  - Did I tag as [Confirmed], [Inferred], [Assumption], [Unknown], or [Need Confirmation]?

- [ ] **AI Knowledge Flagged**
  - Did I mark `[Source: Knowledge]` with ⚠️ verification warning?

- [ ] **No Fabrication**
  - Did I avoid inventing APIs, configs, or requirements?

- [ ] **User Clarification**
  - Did I ask for clarification on ambiguous points?

- [ ] **Recommendation Included**
  - When presenting options, did I include a recommended choice?

---

## Review Scenarios

### Scenario 1: Code Analysis

**User Request**: "Review the authentication logic"

**❌ Bad Response**:
```
Your authentication system uses JWT with RS256 signing.
The tokens expire after 1 hour.
You should add refresh token support.
```
**Problem**: Makes claims without reading code, assumes implementation details.

**✅ Good Response**:
```
[Need Confirmation] Which file contains the authentication logic?
Possible locations might be:
- src/auth/
- src/services/auth
- src/middleware/

Please direct me to the correct file so I can provide accurate analysis.

Alternatively, I can search the codebase for authentication-related files.
```

---

### Scenario 2: Architecture Recommendations

**User Request**: "How should I structure the new payment module?"

**❌ Bad Response**:
```
Based on your existing architecture, you should:
1. Create PaymentService in src/services/
2. Use the Stripe API
3. Store transactions in the payments table
```
**Problem**: Assumes architecture, payment provider, and database schema without evidence.

**✅ Good Response**:
```
To provide an accurate recommendation, I need to understand your current architecture:

[Need Confirmation]
1. What payment provider do you plan to use? (Stripe, PayPal, custom, etc.)
2. What is your existing service layer structure?
3. What database are you using?

Could you share:
- Project structure (ls -R src/ or similar)
- Existing service examples
- Database schema or ORM models

Once I review these, I can suggest a structure that aligns with your patterns.
```

---

### Scenario 3: Bug Investigation

**User Request**: "The login is failing"

**❌ Bad Response**:
```
The issue is likely in your validateCredentials() function.
You probably need to hash the password before comparison.
```
**Problem**: Guesses at cause without seeing code.

**✅ Good Response**:
```
To investigate the login failure, I need more information:

[Need Confirmation]
1. What error message are you seeing? (console logs, error responses)
2. Which file contains the login logic?
3. Can you share relevant code snippets or logs?

Suggested debugging steps:
- Share the login controller/service code
- Provide error logs from console/server
- Describe expected vs actual behavior

Once I review the actual code and errors, I can identify the root cause.
```

---

### Scenario 4: Technology Selection

**User Request**: "What caching solution should I use?"

**❌ Bad Response**:
```
You have several options:
1. Redis
2. Memcached
3. In-memory cache

Let me know which one you'd like to use.
```
**Problem**: Lists options without recommendation or context consideration.

**✅ Good Response**:
```
Based on the options available:
1. Redis - Distributed, persistent, rich data structures
2. Memcached - Simple, fast, distributed
3. In-memory cache - Local only, no setup required

**Recommended: Redis**

[Need Confirmation] Before finalizing, I'd like to understand:
- Do you need cache sharing across multiple instances?
- Is data persistence required?
- What's your existing infrastructure?

If you already have Redis infrastructure or need cross-instance sharing,
Redis is the best choice. If this is a single-instance application with
simple caching needs, in-memory cache would suffice.
```

---

## AI Assistant Workflow

```
┌─────────────────────────────────┐
│  User Request Received          │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Identify Information Needed    │
│  - Code files?                  │
│  - Configuration?               │
│  - Requirements?                │
└─────────────┬───────────────────┘
              │
              ▼
         ┌────┴────┐
         │  Available?  │
         └────┬────┘
              │
      ┌───────┴───────┐
      │               │
     YES              NO
      │               │
      ▼               ▼
┌──────────┐   ┌─────────────┐
│  Read/   │   │  Ask User   │
│  Analyze │   │  for Info   │
└────┬─────┘   └──────┬──────┘
     │                │
     ▼                ▼
┌─────────────────────────────────┐
│  Tag Response with:             │
│  - [Confirmed] for facts        │
│  - [Inferred] for deductions    │
│  - [Need Confirmation] for gaps │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Cite Sources (file:line)       │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Include Recommendation         │
│  (if presenting options)        │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Deliver Response               │
└─────────────────────────────────┘
```

---

## Language-Agnostic Application

This standard applies regardless of programming language, framework, or domain:

- **Web Development**: Don't assume Express/Django/Spring Boot without evidence
- **Mobile**: Don't assume React Native/Flutter without evidence
- **Data Science**: Don't assume TensorFlow/PyTorch without evidence
- **DevOps**: Don't assume Docker/Kubernetes without evidence

**Universal Rule**: Read first, analyze second, report with evidence always.

---

## Integration with Code Review

When performing code reviews, apply these principles:

1. **Cite Line Numbers**: All review comments must reference specific lines
2. **Classify Severity with Evidence**:
   - `[Confirmed Bug]` - Code demonstrably broken
   - `[Potential Issue]` - Code may cause problems
   - `[Suggestion]` - Improvement idea (not a defect)
3. **Avoid Assumptions**: If unsure about design intent, ask the author

**Review Comment Template**:
```
[file:line] - [Severity]
[Description of issue with code excerpt]
[Evidence or reasoning]
[Suggested fix or question for clarification]
```

---

## Related Standards

- [Testing Standards](testing-standards.md) - Ensure verification of AI analysis results (or use `/testing-guide` skill)
- [Code Review Checklist](code-review-checklist.md) - Review AI-generated content
- [Code Check-in Standards](checkin-standards.md) - AI collaboration check-in process

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.3.1 | 2025-12-24 | Added: Related Standards section |
| 1.3.0 | 2025-12-22 | Enhanced: Prohibited Behaviors section with detailed comparison examples |
| 1.2.0 | 2025-12-15 | Added AI Assistant Interaction Standards section (conversation language, recommendation principles) |
| 1.1.0 | 2025-12-10 | Enhanced source attribution with source types, version sensitivity, and reliability ratings |
| 1.0.0 | 2025-11-12 | Initial standard published |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
You are free to adapt it for your projects with attribution.

---

**Project-Specific Customization**

Projects may extend this standard by adding:
- Domain-specific verification requirements (e.g., HIPAA compliance checks in healthcare)
- Tool-specific guidelines (e.g., how to verify Terraform configurations)
- Team-specific evidence formats (e.g., JIRA ticket references)
- Language preferences for AI assistant conversations
