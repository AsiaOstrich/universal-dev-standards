---
source: ../../../../options/project-structure/nodejs.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 0250c4422107
status: current
---

# Node.js 專案結構

> **語言**: [English](../../../../options/project-structure/nodejs.md) | 繁體中文

**上層標準**: [專案結構](../../../../core/project-structure.md)

---

## 概述

本文件定義 Node.js 和 TypeScript 專案的標準目錄結構。它遵循以功能為基礎的組織模式，能從小型應用擴展到大型企業系統。

## 適用情境

- Express、Fastify、NestJS 應用程式
- REST 和 GraphQL API
- 全端 JavaScript/TypeScript 專案
- 微服務

## 目錄結構

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

## 命名慣例

| 類型 | 慣例 | 範例 |
|------|------|------|
| 檔案 | kebab-case | `user-profile.service.ts` |
| 目錄 | kebab-case | `order-management/` |
| 類別 | PascalCase | `UserService` |
| 函式 | camelCase | `createUser()` |
| 常數 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 介面 | PascalCase | `UserProfile` |

## 檔案後綴

| 後綴 | 用途 |
|------|------|
| `.model.ts` | 資料模型/實體 |
| `.service.ts` | 業務邏輯 |
| `.controller.ts` | HTTP 處理器 |
| `.routes.ts` | 路由定義 |
| `.dto.ts` | 資料傳輸物件 |
| `.test.ts` | 測試檔案 |
| `.middleware.ts` | Express/Fastify 中介軟體 |

## 模組結構

### 功能模組範例

```typescript
// src/modules/users/index.ts
export { User } from './user.model';
export { UserService } from './user.service';
export { userRoutes } from './user.routes';
export type { CreateUserDto, UpdateUserDto } from './user.dto';

// Usage in other modules
import { User, UserService } from '@/modules/users';
```

### 模型

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

### 服務

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

### 控制器

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

## 設定

### package.json 腳本

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

## 最佳實踐

### 1. 以功能組織

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

### 2. Index 檔案作為公開 API

```typescript
// Each module exposes only what's needed
// src/modules/users/index.ts
export { UserService } from './user.service';
export { User } from './user.model';
// Internal implementation stays private
```

### 3. 測試與原始碼並置

```
src/modules/users/
├── user.service.ts
├── user.service.test.ts  # Unit tests with source
├── user.controller.ts
└── user.controller.test.ts
```

## 相關選項

- [Python](./python.md) - Python 專案結構
- [.NET](./dotnet.md) - .NET/C# 專案結構
- [Java](./java.md) - Java/Spring 專案結構
- [Go](./go.md) - Go 專案結構

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
