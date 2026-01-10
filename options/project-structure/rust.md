# Rust Project Structure

> **Language**: English | [繁體中文](../../locales/zh-TW/options/project-structure/rust.md)

**Parent Standard**: [Project Structure](../../core/project-structure.md)

---

## Overview

Rust project structure follows Cargo conventions with clear separation between source code, tests, benchmarks, and examples. The module system provides explicit control over code organization and visibility.

## Project Types

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

### Workspace (Multi-Crate)

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

## Configuration Files

| File | Purpose | Required |
|------|---------|----------|
| `Cargo.toml` | Package manifest | Yes |
| `Cargo.lock` | Dependency lock file | Yes (binaries), No (libraries) |
| `rust-toolchain.toml` | Toolchain version | No |
| `.cargo/config.toml` | Cargo configuration | No |

## .gitignore

```
target/
*.pdb
.env
Cargo.lock  # For libraries only
```

## Tools

| Category | Tools |
|----------|-------|
| Build | `cargo build`, `cargo build --release` |
| Test Runner | `cargo test`, `cargo nextest` |
| Linter | clippy |
| Formatter | rustfmt, `cargo fmt` |
| Package Manager | cargo, crates.io |
| Documentation | `cargo doc`, rustdoc |

## Rules

| Rule | Description | Priority |
|------|-------------|----------|
| Module organization | Use mod.rs or module_name.rs pattern consistently | Required |
| Tests location | Unit tests in same file with `#[cfg(test)]`, integration tests in `tests/` | Required |
| Error handling | Define custom error types in error.rs or errors.rs | Recommended |
| Workspace for large | Use Cargo workspaces for multi-crate projects | Recommended |
| Doc comments | Use `///` for public items, `//!` for module-level docs | Recommended |

## Related Options

- [Go](./go.md) - Go project structure
- [Node.js](./nodejs.md) - Node.js project structure

---

## References

- [The Cargo Book](https://doc.rust-lang.org/cargo/)
- [Rust Book - Packages and Crates](https://doc.rust-lang.org/book/ch07-01-packages-and-crates.html)

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
