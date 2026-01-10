# Kotlin Project Structure

> **Language**: English | [繁體中文](../../locales/zh-TW/options/project-structure/kotlin.md)

**Parent Standard**: [Project Structure](../../core/project-structure.md)

---

## Overview

Kotlin projects typically use Gradle for build management and follow conventions similar to Java. Kotlin supports multiple platforms including JVM, Android, and Kotlin Multiplatform.

## Project Types

### Gradle (JVM)

```
project-root/
├── src/
│   ├── main/
│   │   ├── kotlin/
│   │   │   └── com/example/app/
│   │   │       ├── Application.kt
│   │   │       ├── config/
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── repository/
│   │   │       └── model/
│   │   └── resources/
│   │       └── application.yml
│   └── test/
│       ├── kotlin/
│       │   └── com/example/app/
│       └── resources/
├── build.gradle.kts      # Gradle Kotlin DSL
├── settings.gradle.kts
├── gradle.properties
└── gradlew
```

### Android

```
project-root/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── kotlin/
│   │   │   ├── res/
│   │   │   └── AndroidManifest.xml
│   │   ├── test/
│   │   └── androidTest/
│   └── build.gradle.kts
├── build.gradle.kts
├── settings.gradle.kts
└── gradle.properties
```

### Kotlin Multiplatform

```
project-root/
├── shared/
│   ├── src/
│   │   ├── commonMain/kotlin/
│   │   ├── commonTest/kotlin/
│   │   ├── androidMain/kotlin/
│   │   ├── iosMain/kotlin/
│   │   └── jvmMain/kotlin/
│   └── build.gradle.kts
├── androidApp/
├── iosApp/
└── build.gradle.kts
```

## Configuration Files

| File | Purpose | Required |
|------|---------|----------|
| `build.gradle.kts` | Build configuration (Kotlin DSL) | Yes |
| `settings.gradle.kts` | Project settings | Yes |
| `gradle.properties` | Gradle properties | No |
| `gradle/libs.versions.toml` | Version catalog | No (recommended) |

## .gitignore

```
build/
.gradle/
*.iml
.idea/
local.properties
*.apk
*.aab
```

## Tools

| Category | Tools |
|----------|-------|
| Build | Gradle, Gradle Kotlin DSL |
| Test Runner | JUnit5, Kotest, MockK |
| Linter | Detekt, ktlint |
| Formatter | ktlint, IntelliJ IDEA |
| Package Manager | Gradle, Maven |
| Documentation | Dokka |

## Rules

| Rule | Description | Priority |
|------|-------------|----------|
| Kotlin DSL | Prefer build.gradle.kts over Groovy | Recommended |
| Package structure | Follow reverse domain naming (com.example.app) | Required |
| Test location | Mirror main source structure in test directory | Required |
| Version catalog | Use libs.versions.toml for dependencies | Recommended |
| Coroutines testing | Use kotlinx-coroutines-test for suspend functions | Recommended |

## Related Options

- [Java](./java.md) - Java project structure
- [.NET](./dotnet.md) - .NET project structure

---

## References

- [Kotlin Documentation](https://kotlinlang.org/docs/home.html)
- [Gradle Kotlin DSL](https://docs.gradle.org/current/userguide/kotlin_dsl.html)
- [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform.html)

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
