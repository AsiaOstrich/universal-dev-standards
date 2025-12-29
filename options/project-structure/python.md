# Python Project Structure

> **Language**: English | [繁體中文](../../locales/zh-TW/options/project-structure/python.md)

**Parent Standard**: [Project Structure](../../core/project-structure.md)

---

## Overview

This document defines the standard directory structure for Python projects using modern tooling like Poetry, pytest, and type hints. It follows the src layout pattern for proper package isolation.

## Best For

- FastAPI, Flask, Django applications
- REST and GraphQL APIs
- Data science and ML projects
- CLI applications
- Python packages/libraries

## Directory Structure

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

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | snake_case | `user_service.py` |
| Directories | snake_case | `user_management/` |
| Classes | PascalCase | `UserService` |
| Functions | snake_case | `create_user()` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Private | _leading_underscore | `_internal_method()` |

## Import Order

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

## Module Structure

### Models

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

### Services

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

### Routes (FastAPI)

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

### Schemas (Pydantic)

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

### Module Init

```python
# src/myproject/modules/users/__init__.py
from .models import User, CreateUserInput
from .services import UserService
from .routes import router as user_router

__all__ = ["User", "CreateUserInput", "UserService", "user_router"]
```

## Configuration

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

### Settings

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

## Testing

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

### Unit Tests

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

## Best Practices

### 1. Use src Layout

```
# Prevents accidental imports of uninstalled package
project/
├── src/
│   └── myproject/  # Package lives here
└── tests/          # Tests import installed package
```

### 2. Type Hints Everywhere

```python
from typing import Optional, List

def get_users(
    limit: int = 10,
    offset: int = 0
) -> List[User]:
    ...
```

### 3. __init__.py for Public API

```python
# Only export what's needed
from .models import User
from .services import UserService

__all__ = ["User", "UserService"]
```

## Related Options

- [Node.js](./nodejs.md) - Node.js project structure
- [.NET](./dotnet.md) - .NET/C# project structure
- [Java](./java.md) - Java/Spring project structure
- [Go](./go.md) - Go project structure

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
