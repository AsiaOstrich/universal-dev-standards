---
source: ../../../../options/project-structure/nodejs.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
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
│   ├── index.ts              # 應用程式進入點
│   ├── app.ts                # Express/Fastify app 設定
│   ├── config/               # 設定檔
│   │   ├── index.ts
│   │   ├── database.ts
│   │   └── env.ts
│   ├── modules/              # 功能模組（依功能組織）
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
│   ├── shared/               # 共用工具和類型
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── types/
│   └── infrastructure/       # 外部服務整合
│       ├── database/
│       ├── cache/
│       └── messaging/
├── tests/                    # 整合/E2E 測試
├── scripts/                  # 建置/部署腳本
├── docs/                     # 文件
├── package.json
├── tsconfig.json
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

## 模組結構範例

```typescript
// src/modules/users/index.ts
export { User } from './user.model';
export { UserService } from './user.service';
export { userRoutes } from './user.routes';
export type { CreateUserDto, UpdateUserDto } from './user.dto';

// 在其他模組中使用
import { User, UserService } from '@/modules/users';
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

## 最佳實踐

### 1. 以功能組織

```
# 好：依功能組織
src/modules/users/
src/modules/products/
src/modules/orders/

# 避免：依技術層組織
src/models/
src/services/
src/controllers/
```

### 2. Index 檔案作為公開 API

```typescript
// 每個模組只暴露需要的內容
// src/modules/users/index.ts
export { UserService } from './user.service';
export { User } from './user.model';
// 內部實作保持私有
```

### 3. 測試與原始碼並置

```
src/modules/users/
├── user.service.ts
├── user.service.test.ts  # 單元測試與原始碼並置
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
