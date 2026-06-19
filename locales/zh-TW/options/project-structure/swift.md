---
source: options/project-structure/swift.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---
# Swift 專案結構

> **語言**: [English](../../../../options/project-structure/swift.md) | 繁體中文

**上層標準**: [專案結構](../../core/project-structure.md)

---

## 概觀

Swift 專案可使用 Swift Package Manager (SPM) 或 Xcode 來管理。iOS/macOS 應用程式通常使用 Xcode 專案，而函式庫與伺服器端 Swift 則使用 SPM。

## 專案類型

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

### Vapor（伺服器端）

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

## 設定檔

| 檔案 | 用途 | Required |
|------|------|----------|
| `Package.swift` | Swift Package Manager manifest | Yes (SPM) |
| `*.xcodeproj` | Xcode 專案 | Yes (Xcode) |
| `*.xcworkspace` | Xcode workspace | No |
| `.swiftlint.yml` | SwiftLint 設定 | No |
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

| 類別 | 工具 |
|------|------|
| Build | Swift Package Manager, Xcode, xcodebuild |
| Test Runner | XCTest, Quick/Nimble |
| Linter | SwiftLint, SwiftFormat |
| Formatter | SwiftFormat, swift-format |
| Package Manager | Swift Package Manager, CocoaPods, Carthage |
| Documentation | DocC, Jazzy |

## 規則

| 規則 | 描述 | Priority |
|------|------|----------|
| Feature folders | 依功能分組，包含 View、ViewModel 與 Models | Recommended |
| SPM targets | 將 library 與 executable 分拆為不同的 target | Recommended |
| Protocol-oriented | 使用 protocol 進行抽象與依賴注入 | Recommended |
| Test naming | 使用 `test_methodName_condition_expectedResult` 格式 | Recommended |
| Access control | 使用最小存取層級（預設為 internal，API 才用 public） | Required |

## 相關選項

- [Kotlin](./kotlin.md) - Kotlin 專案結構
- [Rust](./rust.md) - Rust 專案結構

---

## 參考資料

- [Swift Package Manager](https://swift.org/package-manager/)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [Vapor](https://vapor.codes/)

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
