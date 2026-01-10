# Swift Project Structure

> **Language**: English | [繁體中文](../../locales/zh-TW/options/project-structure/swift.md)

**Parent Standard**: [Project Structure](../../core/project-structure.md)

---

## Overview

Swift projects can be managed with Swift Package Manager (SPM) or Xcode. iOS/macOS apps typically use Xcode projects, while libraries and server-side Swift use SPM.

## Project Types

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

### Vapor (Server-Side)

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

## Configuration Files

| File | Purpose | Required |
|------|---------|----------|
| `Package.swift` | Swift Package Manager manifest | Yes (SPM) |
| `*.xcodeproj` | Xcode project | Yes (Xcode) |
| `*.xcworkspace` | Xcode workspace | No |
| `.swiftlint.yml` | SwiftLint configuration | No |
| `.swift-version` | Swift version | No |

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

## Tools

| Category | Tools |
|----------|-------|
| Build | Swift Package Manager, Xcode, xcodebuild |
| Test Runner | XCTest, Quick/Nimble |
| Linter | SwiftLint, SwiftFormat |
| Formatter | SwiftFormat, swift-format |
| Package Manager | Swift Package Manager, CocoaPods, Carthage |
| Documentation | DocC, Jazzy |

## Rules

| Rule | Description | Priority |
|------|-------------|----------|
| Feature folders | Group by feature with View, ViewModel, and Models | Recommended |
| SPM targets | Separate library and executable into different targets | Recommended |
| Protocol-oriented | Use protocols for abstraction and dependency injection | Recommended |
| Test naming | Use `test_methodName_condition_expectedResult` format | Recommended |
| Access control | Use minimal access level (internal by default, public for API) | Required |

## Related Options

- [Kotlin](./kotlin.md) - Kotlin project structure
- [Rust](./rust.md) - Rust project structure

---

## References

- [Swift Package Manager](https://swift.org/package-manager/)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [Vapor](https://vapor.codes/)

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
