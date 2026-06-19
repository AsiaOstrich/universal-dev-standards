---
source: options/project-structure/rust.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Rust Project Structure

> **语言**: [English](../../../../options/project-structure/rust.md) | 简体中文

**上层标准**: [Project Structure](../../core/project-structure.md)

---

## 概览

Rust 项目结构遵循 Cargo 惯例，将源代码、测试、基准测试（benchmark）与示例清楚区隔。module 系统可明确控制代码的组织与可见性。

## 项目类型

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

## 配置文件

| 文件 | 用途 | Required |
|------|------|----------|
| `Cargo.toml` | 包 manifest | Yes |
| `Cargo.lock` | 依赖包锁定文件 | Yes (binaries), No (libraries) |
| `rust-toolchain.toml` | Toolchain 版本 | No |
| `.cargo/config.toml` | Cargo 配置 | No |

## .gitignore

```
target/
*.pdb
.env
Cargo.lock  # For libraries only
```

## 工具

| 类别 | 工具 |
|------|------|
| Build | `cargo build`、`cargo build --release` |
| Test Runner | `cargo test`、`cargo nextest` |
| Linter | clippy |
| Formatter | rustfmt、`cargo fmt` |
| Package Manager | cargo、crates.io |
| Documentation | `cargo doc`、rustdoc |

## 规则

| 规则 | 说明 | 优先级 |
|------|------|--------|
| Module 组织 | 一致地采用 mod.rs 或 module_name.rs 模式 | Required |
| 测试位置 | 单元测试以 `#[cfg(test)]` 置于同文件，集成测试置于 `tests/` | Required |
| 错误处理 | 在 error.rs 或 errors.rs 定义自定义错误类型 | Recommended |
| 大型项目用 Workspace | 多 crate 项目采用 Cargo workspace | Recommended |
| Doc 注释 | 公开项使用 `///`，module 层级文档使用 `//!` | Recommended |

## 相关选项

- [Go](./go.md) - Go 项目结构
- [Node.js](./nodejs.md) - Node.js 项目结构

---

## 参考资料

- [The Cargo Book](https://doc.rust-lang.org/cargo/)
- [Rust Book - Packages and Crates](https://doc.rust-lang.org/book/ch07-01-packages-and-crates.html)

---

## 授权

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
