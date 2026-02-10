---
source: ../../../../options/project-structure/python.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# Python 專案結構

> **語言**: [English](../../../options/project-structure/python.md) | 繁體中文

**上層標準**: [專案結構](../../core/project-structure.md)

---

## 概述

本文件定義使用現代工具（如 Poetry、pytest 和類型提示）的 Python 專案標準目錄結構。它遵循 src 佈局模式以實現適當的套件隔離。

## 適用情境

- FastAPI、Flask、Django 應用程式
- REST 和 GraphQL API
- 資料科學和機器學習專案
- CLI 應用程式
- Python 套件/函式庫

## 目錄結構

```
project-root/
├── src/
│   └── myproject/            # 主套件（套件名稱）
│       ├── __init__.py
│       ├── main.py           # 應用程式進入點
│       ├── config/           # 設定
│       │   ├── __init__.py
│       │   └── settings.py
│       ├── modules/          # 功能模組
│       │   ├── __init__.py
│       │   ├── users/
│       │   │   ├── __init__.py
│       │   │   ├── models.py
│       │   │   ├── services.py
│       │   │   ├── routes.py
│       │   │   └── schemas.py
│       │   └── products/
│       ├── shared/           # 共用工具
│       │   ├── __init__.py
│       │   ├── exceptions.py
│       │   └── utils.py
│       └── infrastructure/   # 外部服務
│           ├── __init__.py
│           └── database.py
├── tests/                    # 測試
│   ├── __init__.py
│   ├── conftest.py           # pytest fixtures
│   ├── unit/
│   └── integration/
├── scripts/                  # 工具腳本
├── docs/                     # 文件
├── pyproject.toml            # 專案設定
├── .env.example
└── README.md
```

## 命名慣例

| 類型 | 慣例 | 範例 |
|------|------|------|
| 檔案 | snake_case | `user_service.py` |
| 目錄 | snake_case | `user_management/` |
| 類別 | PascalCase | `UserService` |
| 函式 | snake_case | `create_user()` |
| 常數 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 私有 | _leading_underscore | `_internal_method()` |

## 匯入順序

```python
# 標準函式庫
import os
from typing import Optional, List

# 第三方套件
import requests
from fastapi import FastAPI, HTTPException

# 本地模組
from myproject.modules.users import UserService
from myproject.shared.utils import format_date
```

## 模組結構

### 模型

```python
# src/myproject/modules/users/models.py
from dataclasses import dataclass
from datetime import datetime

@dataclass
class User:
    id: str
    email: str
    name: str
    created_at: datetime
```

### 服務

```python
# src/myproject/modules/users/services.py
from typing import Optional
from .models import User, CreateUserInput
from .repository import UserRepository

class UserService:
    def __init__(self, repository: UserRepository):
        self._repository = repository

    async def create_user(self, input: CreateUserInput) -> User:
        """建立新使用者。"""
        existing = await self._repository.find_by_email(input.email)
        if existing:
            raise ValueError("Email already registered")
        return await self._repository.create(input)
```

### 路由（FastAPI）

```python
# src/myproject/modules/users/routes.py
from fastapi import APIRouter, HTTPException, Depends
from .services import UserService
from .schemas import UserCreate, UserResponse

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UserResponse, status_code=201)
async def create_user(
    user_data: UserCreate,
    service: UserService = Depends(get_user_service)
):
    try:
        user = await service.create_user(user_data)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
```

## 設定

### pyproject.toml

```toml
[project]
name = "myproject"
version = "1.0.0"
requires-python = ">=3.10"
dependencies = [
    "fastapi>=0.100.0",
    "uvicorn>=0.23.0",
    "pydantic>=2.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "pytest-asyncio>=0.21.0",
    "ruff>=0.1.0",
    "mypy>=1.0.0",
]

[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
```

## 最佳實踐

### 1. 使用 src 佈局

```
# 防止意外匯入未安裝的套件
project/
├── src/
│   └── myproject/  # 套件在此
└── tests/          # 測試匯入已安裝的套件
```

### 2. 處處使用類型提示

```python
from typing import Optional, List

def get_users(
    limit: int = 10,
    offset: int = 0
) -> List[User]:
    ...
```

### 3. __init__.py 作為公開 API

```python
# 只匯出需要的內容
from .models import User
from .services import UserService

__all__ = ["User", "UserService"]
```

## 相關選項

- [Node.js](./nodejs.md) - Node.js 專案結構
- [.NET](./dotnet.md) - .NET/C# 專案結構
- [Java](./java.md) - Java/Spring 專案結構
- [Go](./go.md) - Go 專案結構

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
