---
source: ../../../../options/project-structure/python.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 13b274f574f2
status: current
---

# Python 项目结构

> **语言**: [English](../../../../options/project-structure/python.md) | 简体中文

**上层标准**: [项目结构](../../core/project-structure.md)

---

## 概览

本文档定义 Python 项目的标准目录结构，适用于使用 Poetry、pytest 与类型提示（type hints）等现代工具的项目。它采用 src 布局（src layout）模式，以实现妥善的包隔离。

## 最适用于

- FastAPI、Flask、Django 应用程序
- REST 与 GraphQL API
- 数据科学与机器学习项目
- CLI 应用程序
- Python 包／库

## 目录结构

```
project-root/
├── src/
│   └── myproject/            # Main package (package name)
│       ├── __init__.py
│       ├── main.py           # Application entry point
│       ├── config/           # Configuration
│       │   ├── __init__.py
│       │   └── settings.py
│       ├── modules/          # Feature modules
│       │   ├── __init__.py
│       │   ├── users/
│       │   │   ├── __init__.py
│       │   │   ├── models.py
│       │   │   ├── services.py
│       │   │   ├── routes.py
│       │   │   └── schemas.py
│       │   └── products/
│       │       └── ...
│       ├── shared/           # Shared utilities
│       │   ├── __init__.py
│       │   ├── exceptions.py
│       │   └── utils.py
│       └── infrastructure/   # External services
│           ├── __init__.py
│           └── database.py
├── tests/                    # Tests
│   ├── __init__.py
│   ├── conftest.py           # pytest fixtures
│   ├── unit/
│   │   └── test_users.py
│   └── integration/
│       └── test_api.py
├── scripts/                  # Utility scripts
├── docs/                     # Documentation
├── pyproject.toml            # Project configuration
├── requirements.txt          # Dependencies (or use Poetry)
├── .env.example
└── README.md
```

## 命名规范

| 类型 | 规范 | 示例 |
|------|------------|---------|
| 文件 | snake_case | `user_service.py` |
| 目录 | snake_case | `user_management/` |
| 类 | PascalCase | `UserService` |
| 函数 | snake_case | `create_user()` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 私有成员 | _leading_underscore | `_internal_method()` |

## 导入顺序

```python
# Standard library
import os
from typing import Optional, List

# Third-party packages
import requests
from fastapi import FastAPI, HTTPException

# Local modules
from myproject.modules.users import UserService
from myproject.shared.utils import format_date
```

## 模块结构

### 模型（Models）

```python
# src/myproject/modules/users/models.py
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class User:
    id: str
    email: str
    name: str
    created_at: datetime
    updated_at: datetime

@dataclass
class CreateUserInput:
    email: str
    name: str
    password: str
```

### 服务（Services）

```python
# src/myproject/modules/users/services.py
from typing import Optional
from .models import User, CreateUserInput
from .repository import UserRepository

class UserService:
    def __init__(self, repository: UserRepository):
        self._repository = repository

    async def create_user(self, input: CreateUserInput) -> User:
        """Create a new user."""
        # Validate email uniqueness
        existing = await self._repository.find_by_email(input.email)
        if existing:
            raise ValueError("Email already registered")

        return await self._repository.create(input)

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Retrieve user by ID."""
        return await self._repository.find_by_id(user_id)
```

### 路由（FastAPI）

```python
# src/myproject/modules/users/routes.py
from fastapi import APIRouter, HTTPException, Depends
from .services import UserService
from .schemas import UserCreate, UserResponse
from myproject.shared.deps import get_user_service

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

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    service: UserService = Depends(get_user_service)
):
    user = await service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

### Schema（Pydantic）

```python
# src/myproject/modules/users/schemas.py
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime

    class Config:
        from_attributes = True
```

### 模块初始化

```python
# src/myproject/modules/users/__init__.py
from .models import User, CreateUserInput
from .services import UserService
from .routes import router as user_router

__all__ = ["User", "CreateUserInput", "UserService", "user_router"]
```

## 配置

### pyproject.toml

```toml
[project]
name = "myproject"
version = "1.0.0"
description = "My Python project"
requires-python = ">=3.10"
dependencies = [
    "fastapi>=0.100.0",
    "uvicorn>=0.23.0",
    "pydantic>=2.0.0",
    "sqlalchemy>=2.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "pytest-asyncio>=0.21.0",
    "pytest-cov>=4.0.0",
    "ruff>=0.1.0",
    "mypy>=1.0.0",
]

[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"

[tool.ruff]
line-length = 88
select = ["E", "F", "I", "N", "W"]

[tool.mypy]
python_version = "3.10"
strict = true
```

### 设置（Settings）

```python
# src/myproject/config/settings.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "My Project"
    debug: bool = False
    database_url: str
    redis_url: str = "redis://localhost:6379"
    secret_key: str

    class Config:
        env_file = ".env"

@lru_cache
def get_settings() -> Settings:
    return Settings()
```

## 测试

### conftest.py

```python
# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from myproject.main import create_app

@pytest.fixture
def app():
    return create_app()

@pytest.fixture
def client(app):
    return TestClient(app)

@pytest.fixture
def test_user():
    return {
        "email": "test@example.com",
        "name": "Test User",
        "password": "testpass123"
    }
```

### 单元测试

```python
# tests/unit/test_user_service.py
import pytest
from myproject.modules.users import UserService
from unittest.mock import Mock, AsyncMock

@pytest.fixture
def mock_repository():
    repo = Mock()
    repo.find_by_email = AsyncMock(return_value=None)
    repo.create = AsyncMock()
    return repo

@pytest.fixture
def user_service(mock_repository):
    return UserService(mock_repository)

@pytest.mark.asyncio
async def test_create_user_success(user_service, mock_repository):
    # Arrange
    input_data = CreateUserInput(
        email="test@example.com",
        name="Test",
        password="pass123"
    )

    # Act
    await user_service.create_user(input_data)

    # Assert
    mock_repository.create.assert_called_once()
```

## 最佳实践

### 1. 使用 src 布局

```
# Prevents accidental imports of uninstalled package
project/
├── src/
│   └── myproject/  # Package lives here
└── tests/          # Tests import installed package
```

### 2. 全面使用类型提示

```python
from typing import Optional, List

def get_users(
    limit: int = 10,
    offset: int = 0
) -> List[User]:
    ...
```

### 3. 用 __init__.py 定义公开 API

```python
# Only export what's needed
from .models import User
from .services import UserService

__all__ = ["User", "UserService"]
```

## 相关选项

- [Node.js](./nodejs.md) - Node.js 项目结构
- [.NET](./dotnet.md) - .NET/C# 项目结构
- [Java](./java.md) - Java/Spring 项目结构
- [Go](./go.md) - Go 项目结构

---

## 许可

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
