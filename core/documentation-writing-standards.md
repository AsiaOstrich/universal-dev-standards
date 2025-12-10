# 文件撰寫規範 | Documentation Writing Standards

> **Version**: 1.0.0
> **Last Updated**: 2025-12-10
> **Applicability**: All software projects (new, refactoring, migration, maintenance)
> **適用範圍**: 所有軟體專案（新建、重構、遷移、維護）

---

## Purpose | 目的

This standard defines documentation requirements based on project types and provides detailed writing guidelines for each document category.

本標準根據專案類型定義文件需求，並提供各類文件的詳細撰寫指南。

**Relationship to Other Standards | 與其他標準的關係**:
- Complements [documentation-structure.md](documentation-structure.md) which defines file organization
- This standard focuses on **content requirements** and **project type mapping**
- 補充 [documentation-structure.md](documentation-structure.md) 所定義的檔案組織
- 本標準聚焦於**內容需求**和**專案類型對照**

---

## Project Types and Required Documents | 專案類型與文件對照

### Document Requirements Matrix | 文件需求矩陣

| Document | New Project | Refactoring | Migration | Maintenance | Description |
|----------|:-----------:|:-----------:|:---------:|:-----------:|-------------|
| **README.md** | ✅ Required | ✅ Required | ✅ Required | ✅ Required | Project entry point |
| **ARCHITECTURE.md** | ✅ Required | ✅ Required | ✅ Required | ⚪ Recommended | System architecture |
| **API.md** | ⚪ If applicable | ✅ Required | ✅ Required | ⚪ Recommended | API specification |
| **DATABASE.md** | ⚪ If applicable | ✅ Required | ✅ Required | ⚪ Recommended | Database schema |
| **DEPLOYMENT.md** | ✅ Required | ✅ Required | ✅ Required | ⚪ Recommended | Deployment guide |
| **MIGRATION.md** | ❌ Not needed | ✅ Required | ✅ Required | ❌ Not needed | Migration plan |
| **ADR/** | ⚪ Recommended | ✅ Required | ✅ Required | ⚪ If applicable | Architecture decisions |
| **CHANGELOG.md** | ✅ Required | ✅ Required | ✅ Required | ✅ Required | Version history |
| **CONTRIBUTING.md** | ⚪ Recommended | ⚪ Recommended | ⚪ Recommended | ⚪ If applicable | Contribution guide |

**Legend | 圖例**: ✅ Required | ⚪ Recommended/If applicable | ❌ Not needed

---

### Project Type Descriptions | 專案類型說明

#### 🆕 New Project | 新建專案

Building software from scratch.

從零開始建立的軟體專案。

**Required Documents | 必要文件**:
- README.md - Project overview, quick start
- ARCHITECTURE.md - Design architecture (pre-development planning)
- DEPLOYMENT.md - Deployment process
- CHANGELOG.md - Version history

**Recommended Documents | 建議文件**:
- API.md - If exposing external APIs
- DATABASE.md - If using databases
- ADR/ - Record important technical decisions

---

#### 🔄 Refactoring Project | 重構專案

Improving existing system's code structure, architecture, or technology stack without changing external behavior.

改善既有系統的程式碼結構、架構或技術棧，但不改變外部行為。

**Required Documents | 必要文件**:
- README.md - Update technology stack description
- ARCHITECTURE.md - Compare old and new architecture
- API.md - API change documentation (if applicable)
- DATABASE.md - Schema change documentation (if applicable)
- DEPLOYMENT.md - New deployment process
- MIGRATION.md - Refactoring migration plan
- ADR/ - Document refactoring decisions
- CHANGELOG.md - Detailed change records

**Key Points | 重點**:
- MIGRATION.md must include rollback plan
- ADR/ must document "why refactor" and "why this approach"
- MIGRATION.md 需包含回滾計畫
- ADR/ 需記錄「為何重構」及「為何選擇此方案」

---

#### 🚚 Migration Project | 遷移專案

Moving system from one environment/platform to another (e.g., cloud migration, version upgrade).

將系統從一個環境/平台遷移到另一個（如雲端遷移、版本升級）。

**Required Documents | 必要文件**:
- README.md - New environment description
- ARCHITECTURE.md - New architecture diagram
- API.md - API compatibility documentation
- DATABASE.md - Data migration documentation
- DEPLOYMENT.md - New environment deployment
- MIGRATION.md - Migration steps and verification
- ADR/ - Migration decision records
- CHANGELOG.md - Migration change records

**Key Points | 重點**:
- MIGRATION.md is the core document
- Must include data migration verification, rollback plan, integration partner notification
- MIGRATION.md 是核心文件
- 需包含資料遷移驗證、回滾計畫、整合方通知

---

#### 🔧 Maintenance Project | 維護專案

Day-to-day maintenance, bug fixes, minor feature enhancements of existing systems.

既有系統的日常維護、Bug 修復、小幅功能增強。

**Required Documents | 必要文件**:
- README.md - Keep updated
- CHANGELOG.md - Record every change

**Recommended Documents | 建議文件**:
- Other documents updated based on change scope

---

## Core Principles | 核心原則

> **Documentation is an extension of code and should be treated with equal importance. Good documentation reduces communication costs, accelerates onboarding, and lowers maintenance risks.**
>
> **文件是程式碼的延伸，應與程式碼同等重視。好的文件能減少溝通成本、加速新人上手、降低維護風險。**

### Documentation Pyramid | 文件金字塔

```
                    ┌─────────────┐
                    │   README    │  ← Entry point, quick overview
                    ├─────────────┤
                 ┌──┴─────────────┴──┐
                 │   ARCHITECTURE    │  ← System overview
                 ├───────────────────┤
              ┌──┴───────────────────┴──┐
              │  API / DATABASE / DEPLOY │  ← Technical details
              ├─────────────────────────┤
           ┌──┴─────────────────────────┴──┐
           │    ADR / MIGRATION / CHANGELOG │  ← Change history
           └───────────────────────────────┘
```

---

## Document Categories and Standards | 文件分類與規範

### 1. Architecture Documentation | 架構文件

#### ARCHITECTURE.md

**Purpose | 用途**: Describe overall system architecture, module division, technology choices

**Required Sections | 必要章節**:

| Section | Description | Required |
|---------|-------------|----------|
| System Overview | Purpose, scope, main functions | Required |
| Architecture Diagram | Use Mermaid or ASCII Art | Required |
| Module Description | Responsibilities, dependencies | Required |
| Technology Stack | Frameworks, languages, database versions | Required |
| Data Flow | Main business process data flow | Required |
| Deployment Architecture | Production deployment topology | Recommended |
| Design Decisions | Reasons for key decisions (or link to ADR) | Recommended |

**Template Structure | 範本結構**:

```markdown
# System Architecture | 系統架構

## 1. Overview | 系統概述
[System purpose and scope]

## 2. Architecture Diagram | 架構圖
[Mermaid or ASCII diagram]

## 3. Module Description | 模組說明
### 3.1 Presentation Layer | 表現層
### 3.2 Business Logic Layer | 業務邏輯層
### 3.3 Data Access Layer | 資料存取層

## 4. Technology Stack | 技術棧
| Category | Technology | Version |
|----------|------------|---------|

## 5. Data Flow | 資料流程
[Main business process diagram]

## 6. Deployment Architecture | 部署架構
[Deployment topology diagram]
```

---

### 2. API Documentation | API 文件

#### API.md

**Purpose | 用途**: Document external API interfaces

**Required Sections | 必要章節**:

| Section | Description | Required |
|---------|-------------|----------|
| API Overview | Version, base URL, authentication | Required |
| Authentication | Token acquisition, expiration | Required |
| Endpoint List | All API endpoints | Required |
| Endpoint Specifications | Request/response format for each | Required |
| Error Code Reference | Error codes and descriptions | Required |
| Code Examples | Examples in common languages | Recommended |
| Rate Limiting | API call frequency limits | If applicable |

**Endpoint Specification Format | 端點規格格式**:

```markdown
### POST /api/v1/resource

Description of what this endpoint does.

**Request**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| field1 | string | Yes | Description |
| field2 | integer | No | Description |

**Request Example**
```json
{
  "field1": "value",
  "field2": 123
}
```

**Response**

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Whether successful |
| data | object | Response data |

**Response Example**
```json
{
  "success": true,
  "data": {}
}
```

**Error Responses**
| Code | Description |
|------|-------------|
| 400 | Bad request |
| 401 | Unauthorized |
```

---

### 3. Database Documentation | 資料庫文件

#### DATABASE.md

**Purpose | 用途**: Document database structure, relationships, indexing strategy

**Required Sections | 必要章節**:

| Section | Description | Required |
|---------|-------------|----------|
| Database Overview | Type, version, connection info | Required |
| ER Diagram | Entity relationship diagram | Required |
| Table List | All tables with purposes | Required |
| Table Specifications | Column definitions for each table | Required |
| Index Documentation | Indexing strategy and performance | Required |
| Migration Scripts | Script locations and execution order | Required |
| Backup Strategy | Backup frequency, retention | Recommended |

**Table Specification Format | 資料表規格格式**:

```markdown
### TableName

Description of table purpose.

**Column Definition | 欄位定義**

| Column | Data Type | Nullable | Default | Description |
|--------|-----------|----------|---------|-------------|
| id | bigint | No | IDENTITY | Primary key |
| name | varchar(100) | No | - | Name field |
| status | tinyint | No | 0 | Status flag |

**Indexes | 索引**

| Index Name | Columns | Type | Description |
|------------|---------|------|-------------|
| PK_TableName | id | CLUSTERED | Primary key |
| IX_Status | status, created_at | NONCLUSTERED | Query optimization |

**Relationships | 關聯**

| Related Table | Join Columns | Relationship |
|---------------|--------------|--------------|
| OtherTable | id = other_id | 1:N |
```

---

### 4. Deployment Documentation | 部署文件

#### DEPLOYMENT.md

**Purpose | 用途**: Document deployment steps, environment configuration, troubleshooting

**Required Sections | 必要章節**:

| Section | Description | Required |
|---------|-------------|----------|
| Environment Requirements | Hardware, software, network | Required |
| Installation Steps | Detailed installation process | Required |
| Configuration | Configuration file parameters | Required |
| Verification | How to confirm successful deployment | Required |
| Troubleshooting | Common issues and solutions | Required |
| Monitoring | Health checks, log locations | Recommended |
| Scaling Guide | How to scale horizontally/vertically | If applicable |

**Configuration Documentation Format | 設定檔說明格式**:

```markdown
### config.yaml Settings

| Parameter | Default | Description | Example |
|-----------|---------|-------------|---------|
| db.host | localhost | Database host | `192.168.1.100` |
| db.port | 5432 | Database port | - |
| app.timeout | 300 | Request timeout (seconds) | - |
```

---

### 5. Migration Documentation | 遷移文件

#### MIGRATION.md

**Purpose | 用途**: Document migration plan, backward compatibility strategy, rollback procedures

**Required Sections | 必要章節**:

| Section | Description | Required |
|---------|-------------|----------|
| Migration Overview | Goals, scope, timeline | Required |
| Prerequisites | Required preparation before migration | Required |
| Migration Steps | Detailed migration process | Required |
| Verification Checklist | Post-migration verification items | Required |
| Rollback Plan | Steps to rollback on failure | Required |
| Backward Compatibility | API/database compatibility notes | Required |
| Integration Partner Notification | External systems to notify | If applicable |

---

### 6. Architecture Decision Records (ADR) | 架構決策記錄

#### docs/ADR/NNN-title.md

**Purpose | 用途**: Record important architectural decisions and their rationale

**File Naming | 檔案命名**: `NNN-kebab-case-title.md` (e.g., `001-use-postgresql.md`)

**Required Sections | 必要章節**:

| Section | Description | Required |
|---------|-------------|----------|
| Title | Decision name | Required |
| Status | proposed/accepted/deprecated/superseded | Required |
| Context | Why this decision is needed | Required |
| Decision | Specific decision content | Required |
| Consequences | Impact of decision (positive/negative) | Required |
| Alternatives | Other options considered | Recommended |

**Template | 範本**:

```markdown
# ADR-001: [Decision Title]

## Status | 狀態
Accepted

## Context | 背景
[Why this decision is needed...]

## Decision | 決策
[Specific decision...]

## Consequences | 後果

### Positive | 正面影響
- Benefit 1
- Benefit 2

### Negative | 負面影響
- Drawback 1
- Drawback 2

## Alternatives Considered | 替代方案
1. Alternative A - Rejected because...
2. Alternative B - Rejected because...
```

---

## Quality Standards | 品質標準

### Format Requirements | 格式要求

| Item | Standard |
|------|----------|
| Language | Bilingual (English + Chinese titles/content) |
| Encoding | UTF-8 |
| Line Length | Recommended ≤ 120 characters |
| Diagrams | Prefer Mermaid, then ASCII Art |
| Links | Use relative paths for internal links |

### Maintenance Requirements | 維護要求

| Item | Standard |
|------|----------|
| Sync Updates | Update docs when code changes |
| Version Marking | Mark version and update date at top |
| Review Inclusion | Include doc changes in code review |
| Periodic Review | Review docs quarterly for staleness |

### Review Checklist | 審查清單

Before submitting documentation:

- [ ] Required sections complete
- [ ] No outdated or incorrect information
- [ ] All links working
- [ ] Examples are executable/accurate
- [ ] Bilingual titles consistent
- [ ] Format follows standards

---

## File Location Standards | 文件位置規範

```
project-root/
├── README.md                    # Project entry document
├── CONTRIBUTING.md              # Contribution guide
├── CHANGELOG.md                 # Change log
├── .standards/ or .claude/      # Development standards
│   ├── documentation-writing-standards.md
│   └── ...
└── docs/                        # Documentation directory
    ├── INDEX.md                 # Documentation index
    ├── ARCHITECTURE.md          # Architecture document
    ├── API.md                   # API document
    ├── DATABASE.md              # Database document
    ├── DEPLOYMENT.md            # Deployment document
    ├── MIGRATION.md             # Migration document
    ├── ADR/                     # Architecture decision records
    │   ├── 001-xxx.md
    │   └── ...
    └── DB/                      # Database scripts
```

---

## Recommended Tools | 工具建議

| Purpose | Tools |
|---------|-------|
| Markdown Editing | VS Code + Markdown Preview Enhanced |
| Diagram Drawing | Mermaid / draw.io / PlantUML |
| API Documentation | OpenAPI (Swagger) / Redoc |
| ER Diagram | dbdiagram.io / DBeaver |

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-10 | Initial documentation writing standards |

---

## License | 授權

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
