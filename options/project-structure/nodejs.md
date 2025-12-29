# Node.js Project Structure

> **Language**: English | [繁體中文](../../locales/zh-TW/options/project-structure/nodejs.md)

**Parent Standard**: [Project Structure](../../core/project-structure.md)

---

## Overview

This document defines the standard directory structure for Node.js and TypeScript projects. It follows a feature-based organization pattern that scales well from small applications to large enterprise systems.

## Best For

- Express, Fastify, NestJS applications
- REST and GraphQL APIs
- Full-stack JavaScript/TypeScript projects
- Microservices

## Directory Structure

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

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `user-profile.service.ts` |
| Directories | kebab-case | `order-management/` |
| Classes | PascalCase | `UserService` |
| Functions | camelCase | `createUser()` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Interfaces | PascalCase | `UserProfile` |

## File Suffixes

| Suffix | Purpose |
|--------|---------|
| `.model.ts` | Data models/entities |
| `.service.ts` | Business logic |
| `.controller.ts` | HTTP handlers |
| `.routes.ts` | Route definitions |
| `.dto.ts` | Data transfer objects |
| `.test.ts` | Test files |
| `.middleware.ts` | Express/Fastify middleware |

## Module Structure

### Feature Module Example

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

### Service

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

### Routes

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

## Configuration

### package.json Scripts

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

## Best Practices

### 1. Feature-Based Organization

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

### 2. Index Files for Public API

```typescript
// Each module exposes only what's needed
// src/modules/users/index.ts
export { UserService } from './user.service';
export { User } from './user.model';
// Internal implementation stays private
```

### 3. Colocation of Tests

```
src/modules/users/
├── user.service.ts
├── user.service.test.ts  # Unit tests with source
├── user.controller.ts
└── user.controller.test.ts
```

## Related Options

- [Python](./python.md) - Python project structure
- [.NET](./dotnet.md) - .NET/C# project structure
- [Java](./java.md) - Java/Spring project structure
- [Go](./go.md) - Go project structure

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
