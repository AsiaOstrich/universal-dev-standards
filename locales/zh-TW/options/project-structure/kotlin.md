---
source: options/project-structure/kotlin.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Kotlin 專案結構

> **語言**: [English](../../../../options/project-structure/kotlin.md) | 繁體中文

**上層標準**: [專案結構](../../core/project-structure.md)

---

## 概觀

Kotlin 專案通常使用 Gradle 進行建置管理，並遵循與 Java 類似的慣例。Kotlin 支援多種平台，包括 JVM、Android 與 Kotlin Multiplatform。

## 專案類型

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

## 設定檔

| 檔案 | 用途 | Required |
|------|------|----------|
| `build.gradle.kts` | 建置設定（Kotlin DSL） | Yes |
| `settings.gradle.kts` | 專案設定 | Yes |
| `gradle.properties` | Gradle 屬性 | No |
| `gradle/libs.versions.toml` | 版本目錄（version catalog） | No (recommended) |

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

| 類別 | 工具 |
|------|------|
| Build | Gradle, Gradle Kotlin DSL |
| Test Runner | JUnit5, Kotest, MockK |
| Linter | Detekt, ktlint |
| Formatter | ktlint, IntelliJ IDEA |
| Package Manager | Gradle, Maven |
| Documentation | Dokka |

## 規則

| 規則 | 說明 | 優先級 |
|------|------|--------|
| Kotlin DSL | 優先使用 build.gradle.kts 而非 Groovy | Recommended |
| Package 結構 | 遵循反向網域命名（com.example.app） | Required |
| 測試位置 | 在 test 目錄中鏡像 main 原始碼結構 | Required |
| 版本目錄 | 使用 libs.versions.toml 管理相依套件 | Recommended |
| Coroutines 測試 | 對 suspend 函式使用 kotlinx-coroutines-test | Recommended |

## 相關選項

- [Java](./java.md) - Java 專案結構
- [.NET](./dotnet.md) - .NET 專案結構

---

## 參考資料

- [Kotlin Documentation](https://kotlinlang.org/docs/home.html)
- [Gradle Kotlin DSL](https://docs.gradle.org/current/userguide/kotlin_dsl.html)
- [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform.html)

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
