# UDS Language Packs

Language packs provide migration risk labels for specific source→target language pairs.
They extend the core `feature-manifest-standard` without polluting the core standard.

## Naming Convention

```
language-pack-<source>-to-<target>.ai.yaml
```

Examples:
- `language-pack-php-to-csharp.ai.yaml`
- `language-pack-java-to-go.ai.yaml`
- `language-pack-python-to-rust.ai.yaml`

## Available Language Packs

| Pack | Source | Target | Labels |
|------|--------|--------|--------|
| [language-pack-php-to-csharp.ai.yaml](language-pack-php-to-csharp.ai.yaml) | PHP | C# (ASP.NET Core) | SESSION_HANDLING, ORM_DIFFERENCES, TIMEZONE_HANDLING, FILE_UPLOAD_PATH, REGEX_DIFFERENCES, ARRAY_FUNCTIONS, EXCEPTION_HIERARCHY |

## Usage

Reference language pack risk labels in `feature-manifest.yaml` alongside generic labels:

```yaml
features:
  - id: FM-001
    name: UserLogin
    migration_risks:
      - SESSION_HANDLING   # from language-pack-php-to-csharp
      - NULL_SEMANTICS     # from generic risks (feature-manifest-standard)
      - ASYNC_MODEL        # from generic risks
```

## Generic vs Language Pack Labels

| Type | Source | When to use |
|------|--------|-------------|
| Generic | `feature-manifest-standard.migration_risks.generic` | All migration projects |
| Language Pack | `ai/language-packs/<pack>.ai.yaml` | Specific source→target pairs |

## Creating a New Language Pack

1. Copy the structure from an existing pack
2. Replace `source`, `target`, and `migration_risks` with the new pair's specifics
3. Each risk label should have: `label`, `description`, `details` (optional but recommended)
4. Submit via pull request to UDS with evidence from real migration projects

## Architecture Decision

Language packs were separated from the core `feature-manifest-standard` in UDS v1.1.0
(XSPEC-203) to keep the core standard language-agnostic. See `ai/standards/feature-manifest-standard.ai.yaml`
`migration_risks.language_packs` for the extension point declaration.
