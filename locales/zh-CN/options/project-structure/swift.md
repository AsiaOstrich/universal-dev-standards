---
source: options/project-structure/swift.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---
# Swift 项目结构

> **语言**: [English](../../../../options/project-structure/swift.md) | 简体中文

**上层标准**: [项目结构](../../core/project-structure.md)

---

## 概览

Swift 项目可使用 Swift Package Manager (SPM) 或 Xcode 来管理。iOS/macOS 应用程序通常使用 Xcode 项目，而库与服务器端 Swift 则使用 SPM。

## 项目类型

### SPM Library

```
project-root/
├── Sources/
│   └── PackageName/
│       ├── PackageName.swift
│       ├── Models/
│       ├── Services/
│       └── Utilities/
├── Tests/
│   └── PackageNameTests/
│       └── PackageNameTests.swift
├── Package.swift
└── README.md
```

### SPM Executable

```
project-root/
├── Sources/
│   ├── AppName/
│   │   └── main.swift
│   └── AppNameCore/
│       └── Core.swift
├── Tests/
│   └── AppNameTests/
├── Package.swift
└── README.md
```

### iOS App

```
project-root/
├── AppName/
│   ├── App/
│   │   ├── AppNameApp.swift
│   │   └── ContentView.swift
│   ├── Features/
│   │   ├── Home/
│   │   │   ├── HomeView.swift
│   │   │   └── HomeViewModel.swift
│   │   └── Settings/
│   ├── Core/
│   │   ├── Models/
│   │   ├── Services/
│   │   └── Utilities/
│   ├── Resources/
│   │   ├── Assets.xcassets
│   │   └── Localizable.strings
│   └── Info.plist
├── AppNameTests/
├── AppNameUITests/
├── AppName.xcodeproj
└── README.md
```

### Vapor（服务器端）

```
project-root/
├── Sources/
│   ├── App/
│   │   ├── configure.swift
│   │   ├── routes.swift
│   │   ├── Controllers/
│   │   ├── Models/
│   │   └── Migrations/
│   └── Run/
│       └── main.swift
├── Tests/
│   └── AppTests/
├── Resources/
│   └── Views/
├── Public/
├── Package.swift
└── docker-compose.yml
```

## 配置文件

| 文件 | 用途 | Required |
|------|------|----------|
| `Package.swift` | Swift Package Manager manifest | Yes (SPM) |
| `*.xcodeproj` | Xcode 项目 | Yes (Xcode) |
| `*.xcworkspace` | Xcode workspace | No |
| `.swiftlint.yml` | SwiftLint 配置 | No |
| `.swift-version` | Swift 版本 | No |

## .gitignore

```
.build/
.swiftpm/
*.xcodeproj/xcuserdata/
*.xcworkspace/xcuserdata/
DerivedData/
.DS_Store
Pods/
Carthage/
```

## 工具

| 类别 | 工具 |
|------|------|
| Build | Swift Package Manager, Xcode, xcodebuild |
| Test Runner | XCTest, Quick/Nimble |
| Linter | SwiftLint, SwiftFormat |
| Formatter | SwiftFormat, swift-format |
| Package Manager | Swift Package Manager, CocoaPods, Carthage |
| Documentation | DocC, Jazzy |

## 规则

| 规则 | 描述 | Priority |
|------|------|----------|
| Feature folders | 按功能分组，包含 View、ViewModel 与 Models | Recommended |
| SPM targets | 将 library 与 executable 拆分为不同的 target | Recommended |
| Protocol-oriented | 使用 protocol 进行抽象与依赖注入 | Recommended |
| Test naming | 使用 `test_methodName_condition_expectedResult` 格式 | Recommended |
| Access control | 使用最小访问级别（默认为 internal，API 才用 public） | Required |

## 相关选项

- [Kotlin](./kotlin.md) - Kotlin 项目结构
- [Rust](./rust.md) - Rust 项目结构

---

## 参考资料

- [Swift Package Manager](https://swift.org/package-manager/)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [Vapor](https://vapor.codes/)

---

## 许可

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
