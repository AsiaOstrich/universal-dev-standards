---
source: ../../../../options/project-structure/nodejs.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# Node.js 专案结构

> **语言**: [English](../../../../options/project-structure/nodejs.md) | 繁体中文

**上层标准**: [专案结构](../../core/project-structure.md)

---

## 概述

本文件定义 Node.js 和 TypeScript 专案的标准目录结构。它遵循以功能为基础的组织模式，能从小型应用扩展到大型企业系统。

## 适用情境

- Express、Fastify、NestJS 应用程式
- REST 和 GraphQL API
- 全端 JavaScript/TypeScript 专案
- 微服务

## 目录结构

```
project-root/
├── src/
│   ├── index.ts              # 应用程式进入点
│   ├── app.ts                # Express/Fastify app 设定
│   ├── config/               # 设定档
│   │   ├── index.ts
│   │   ├── database.ts
│   │   └── env.ts
│   ├── modules/              # 功能模组（依功能组织）
│   │   ├── users/
│   │   │   ├── user.model.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── user.dto.ts
│   │   │   ├── user.test.ts
│   │   │   └── index.ts
│   │   ├── products/
│   │   └── orders/
│   ├── shared/               # 共用工具和类型
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── types/
│   └── infrastructure/       # 外部服务整合
│       ├── database/
│       ├── cache/
│       └── messaging/
├── tests/                    # 整合/E2E 测试
├── scripts/                  # 建置/部署脚本
├── docs/                     # 文件
├── package.json
├── tsconfig.json
└── README.md
```

## 命名惯例

| 类型 | 惯例 | 范例 |
|------|------|------|
| 档案 | kebab-case | `user-profile.service.ts` |
| 目录 | kebab-case | `order-management/` |
| 类别 | PascalCase | `UserService` |
| 函式 | camelCase | `createUser()` |
| 常数 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 介面 | PascalCase | `UserProfile` |

## 档案后缀

| 后缀 | 用途 |
|------|------|
| `.model.ts` | 资料模型/实体 |
| `.service.ts` | 业务逻辑 |
| `.controller.ts` | HTTP 处理器 |
| `.routes.ts` | 路由定义 |
| `.dto.ts` | 资料传输物件 |
| `.test.ts` | 测试档案 |
| `.middleware.ts` | Express/Fastify 中介软体 |

## 模组结构范例

```typescript
// src/modules/users/index.ts
export { User } from './user.model';
export { UserService } from './user.service';
export { userRoutes } from './user.routes';
export type { CreateUserDto, UpdateUserDto } from './user.dto';

// 在其他模组中使用
import { User, UserService } from '@/modules/users';
```

## 设定

### package.json 脚本

```json
{
  "scripts": {
    "start": "node dist/index.js",
    "dev": "ts-node-dev --respawn src/index.ts",
    "build": "tsc",
    "test": "vitest",
    "test:watch": "vitest watch",
    "lint": "eslint src --ext .ts"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 最佳实践

### 1. 以功能组织

```
# 好：依功能组织
src/modules/users/
src/modules/products/
src/modules/orders/

# 避免：依技术层组织
src/models/
src/services/
src/controllers/
```

### 2. Index 档案作为公开 API

```typescript
// 每个模组只暴露需要的内容
// src/modules/users/index.ts
export { UserService } from './user.service';
export { User } from './user.model';
// 内部实作保持私有
```

### 3. 测试与原始码并置

```
src/modules/users/
├── user.service.ts
├── user.service.test.ts  # 单元测试与原始码并置
├── user.controller.ts
└── user.controller.test.ts
```

## 相关选项

- [Python](./python.md) - Python 专案结构
- [.NET](./dotnet.md) - .NET/C# 专案结构
- [Java](./java.md) - Java/Spring 专案结构
- [Go](./go.md) - Go 专案结构

---

## 授权条款

本文件采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权条款。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
