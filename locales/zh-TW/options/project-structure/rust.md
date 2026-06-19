---
source: options/project-structure/rust.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Rust Project Structure

> **語言**: [English](../../../../options/project-structure/rust.md) | 繁體中文

**上層標準**: [Project Structure](../../core/project-structure.md)

---

## 概觀

Rust 專案結構遵循 Cargo 慣例，將原始碼、測試、基準測試（benchmark）與範例清楚區隔。module 系統可明確控制程式碼的組織與可見性。

## 專案類型

### Binary Project

```
project-root/
├── src/
│   ├── main.rs           # Entry point
│   ├── lib.rs            # Library root (optional)
│   ├── config.rs
│   ├── error.rs
│   └── modules/
│       ├── mod.rs
│       ├── handler.rs
│       └── service.rs
├── tests/                # Integration tests
│   └── integration_test.rs
├── benches/              # Benchmarks
│   └── benchmark.rs
├── examples/             # Example code
│   └── example.rs
├── Cargo.toml
├── Cargo.lock
└── README.md
```

### Library Project

```
project-root/
├── src/
│   ├── lib.rs            # Library entry point
│   ├── error.rs
│   └── modules/
│       └── mod.rs
├── tests/
├── examples/
├── Cargo.toml
└── README.md
```

### Workspace（多 Crate）

```
project-root/
├── crates/
│   ├── core/
│   │   ├── src/
│   │   └── Cargo.toml
│   ├── api/
│   │   ├── src/
│   │   └── Cargo.toml
│   └── cli/
│       ├── src/
│       └── Cargo.toml
├── Cargo.toml            # Workspace root
└── Cargo.lock
```

## 設定檔

| 檔案 | 用途 | Required |
|------|------|----------|
| `Cargo.toml` | 套件 manifest | Yes |
| `Cargo.lock` | 相依套件鎖定檔 | Yes (binaries), No (libraries) |
| `rust-toolchain.toml` | Toolchain 版本 | No |
| `.cargo/config.toml` | Cargo 設定 | No |

## .gitignore

```
target/
*.pdb
.env
Cargo.lock  # For libraries only
```

## 工具

| 類別 | 工具 |
|------|------|
| Build | `cargo build`、`cargo build --release` |
| Test Runner | `cargo test`、`cargo nextest` |
| Linter | clippy |
| Formatter | rustfmt、`cargo fmt` |
| Package Manager | cargo、crates.io |
| Documentation | `cargo doc`、rustdoc |

## 規則

| 規則 | 說明 | 優先級 |
|------|------|--------|
| Module 組織 | 一致地採用 mod.rs 或 module_name.rs 模式 | Required |
| 測試位置 | 單元測試以 `#[cfg(test)]` 置於同檔，整合測試置於 `tests/` | Required |
| 錯誤處理 | 在 error.rs 或 errors.rs 定義自訂錯誤型別 | Recommended |
| 大型專案用 Workspace | 多 crate 專案採用 Cargo workspace | Recommended |
| Doc 註解 | 公開項目使用 `///`，module 層級文件使用 `//!` | Recommended |

## 相關選項

- [Go](./go.md) - Go 專案結構
- [Node.js](./nodejs.md) - Node.js 專案結構

---

## 參考資料

- [The Cargo Book](https://doc.rust-lang.org/cargo/)
- [Rust Book - Packages and Crates](https://doc.rust-lang.org/book/ch07-01-packages-and-crates.html)

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
