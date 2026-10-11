---
source: ../../../../options/project-structure/nodejs.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 0250c4422107
status: current
---

# Node.js 项目结构

> **语言**: [English](../../../../options/project-structure/nodejs.md) | 简体中文

**上层标准**: [项目结构](../../../../core/project-structure.md)

---

## 概览

本文档定义 Node.js 与 TypeScript 项目的标准目录结构。它采用按功能组织的模式，能够从小型应用顺利扩展到大型企业系统。

## 适用场景

- Express、Fastify、NestJS 应用
- REST 与 GraphQL API
- 全栈 JavaScript/TypeScript 项目
- 微服务

## 目录结构

```
project-root/
├── src/
│   ├── index.ts              # Application entry point
│   ├── app.ts                # Express/Fastify app setup
│   ├── config/               # Configuration files
│   │   ├── index.ts
│   │   ├── database.ts
│   │   └── env.ts
│   ├── modules/              # Feature modules (organized by feature)
│   │   ├── users/
│   │   │   ├── user.model.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── user.dto.ts
│   │   │   ├── user.test.ts
│   │   │   └── index.ts
│   │   ├── products/
│   │   │   └── ...
│   │   └── orders/
│   │       └── ...
│   ├── shared/               # Shared utilities and types
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── validation.middleware.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   └── helpers.ts
│   │   └── types/
│   │       └── index.ts
│   └── infrastructure/       # External service integrations
│       ├── database/
│       │   ├── connection.ts
│       │   └── migrations/
│       ├── cache/
│       │   └── redis.ts
│       └── messaging/
│           └── queue.ts
├── tests/                    # Integration/E2E tests
│   ├── integration/
│   └── e2e/
├── scripts/                  # Build/deploy scripts
├── docs/                     # Documentation
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| 文件 | kebab-case | `user-profile.service.ts` |
| 目录 | kebab-case | `order-management/` |
| 类 | PascalCase | `UserService` |
| 函数 | camelCase | `createUser()` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 接口 | PascalCase | `UserProfile` |

## 文件后缀

| 后缀 | 用途 |
|------|------|
| `.model.ts` | 数据模型/实体 |
| `.service.ts` | 业务逻辑 |
| `.controller.ts` | HTTP 处理器 |
| `.routes.ts` | 路由定义 |
| `.dto.ts` | 数据传输对象 |
| `.test.ts` | 测试文件 |
| `.middleware.ts` | Express/Fastify 中间件 |

## 模块结构

### 功能模块示例

```typescript
// src/modules/users/index.ts
export { User } from './user.model';
export { UserService } from './user.service';
export { userRoutes } from './user.routes';
export type { CreateUserDto, UpdateUserDto } from './user.dto';

// Usage in other modules
import { User, UserService } from '@/modules/users';
```

### Model

```typescript
// src/modules/users/user.model.ts
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
}
```

### 服务

```typescript
// src/modules/users/user.service.ts
import { User, CreateUserInput } from './user.model';
import { UserRepository } from './user.repository';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(input: CreateUserInput): Promise<User> {
    // Business logic here
    return this.userRepository.create(input);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}
```

### Controller

```typescript
// src/modules/users/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';

export class UserController {
  constructor(private readonly userService: UserService) {}

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  };
}
```

### 路由

```typescript
// src/modules/users/user.routes.ts
import { Router } from 'express';
import { UserController } from './user.controller';
import { validateBody } from '@/shared/middleware/validation.middleware';
import { createUserSchema } from './user.dto';

export function createUserRoutes(controller: UserController): Router {
  const router = Router();

  router.post('/', validateBody(createUserSchema), controller.createUser);
  router.get('/:id', controller.getUser);

  return router;
}
```

## 配置

### package.json 脚本

```json
{
  "scripts": {
    "start": "node dist/index.js",
    "dev": "ts-node-dev --respawn src/index.ts",
    "build": "tsc",
    "test": "vitest",
    "test:watch": "vitest watch",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 最佳实践

### 1. 按功能组织

```
# Good: Organize by feature
src/modules/users/
src/modules/products/
src/modules/orders/

# Avoid: Organize by technical layer
src/models/
src/services/
src/controllers/
```

### 2. 用 index 文件暴露公共 API

```typescript
// Each module exposes only what's needed
// src/modules/users/index.ts
export { UserService } from './user.service';
export { User } from './user.model';
// Internal implementation stays private
```

### 3. 测试与源码就近放置

```
src/modules/users/
├── user.service.ts
├── user.service.test.ts  # Unit tests with source
├── user.controller.ts
└── user.controller.test.ts
```

## 相关选项

- [Python](./python.md) - Python 项目结构
- [.NET](./dotnet.md) - .NET/C# 项目结构
- [Java](./java.md) - Java/Spring 项目结构
- [Go](./go.md) - Go 项目结构

---

## 许可

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
