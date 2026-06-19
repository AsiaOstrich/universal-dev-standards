---
source: options/project-structure/kotlin.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Kotlin 项目结构

> **语言**: [English](../../../../options/project-structure/kotlin.md) | 简体中文

**上层标准**: [项目结构](../../core/project-structure.md)

---

## 概览

Kotlin 项目通常使用 Gradle 进行构建管理，并遵循与 Java 类似的约定。Kotlin 支持多种平台，包括 JVM、Android 与 Kotlin Multiplatform。

## 项目类型

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

## 配置文件

| 文件 | 用途 | Required |
|------|------|----------|
| `build.gradle.kts` | 构建配置（Kotlin DSL） | Yes |
| `settings.gradle.kts` | 项目设置 | Yes |
| `gradle.properties` | Gradle 属性 | No |
| `gradle/libs.versions.toml` | 版本目录（version catalog） | No (recommended) |

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

## 工具

| 类别 | 工具 |
|------|------|
| Build | Gradle, Gradle Kotlin DSL |
| Test Runner | JUnit5, Kotest, MockK |
| Linter | Detekt, ktlint |
| Formatter | ktlint, IntelliJ IDEA |
| Package Manager | Gradle, Maven |
| Documentation | Dokka |

## 规则

| 规则 | 说明 | 优先级 |
|------|------|--------|
| Kotlin DSL | 优先使用 build.gradle.kts 而非 Groovy | Recommended |
| Package 结构 | 遵循反向域名命名（com.example.app） | Required |
| 测试位置 | 在 test 目录中镜像 main 源代码结构 | Required |
| 版本目录 | 使用 libs.versions.toml 管理依赖包 | Recommended |
| Coroutines 测试 | 对 suspend 函数使用 kotlinx-coroutines-test | Recommended |

## 相关选项

- [Java](./java.md) - Java 项目结构
- [.NET](./dotnet.md) - .NET 项目结构

---

## 参考资料

- [Kotlin Documentation](https://kotlinlang.org/docs/home.html)
- [Gradle Kotlin DSL](https://docs.gradle.org/current/userguide/kotlin_dsl.html)
- [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform.html)

---

## 许可

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
