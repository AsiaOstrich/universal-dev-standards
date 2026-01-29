---
source: ../../../options/project-structure/python.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# Python 专案结构

> **语言**: [English](../../../options/project-structure/python.md) | 繁体中文

**上层标准**: [专案结构](../../core/project-structure.md)

---

## 概述

本文件定义使用现代工具（如 Poetry、pytest 和类型提示）的 Python 专案标准目录结构。它遵循 src 布局模式以实现适当的套件隔离。

## 适用情境

- FastAPI、Flask、Django 应用程式
- REST 和 GraphQL API
- 资料科学和机器学习专案
- CLI 应用程式
- Python 套件/函式库

## 目录结构

```
project-root/
├── src/
│   └── myproject/            # 主套件（套件名称）
│       ├── __init__.py
│       ├── main.py           # 应用程式进入点
│       ├── config/           # 设定
│       │   ├── __init__.py
│       │   └── settings.py
│       ├── modules/          # 功能模组
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
│       └── infrastructure/   # 外部服务
│           ├── __init__.py
│           └── database.py
├── tests/                    # 测试
│   ├── __init__.py
│   ├── conftest.py           # pytest fixtures
│   ├── unit/
│   └── integration/
├── scripts/                  # 工具脚本
├── docs/                     # 文件
├── pyproject.toml            # 专案设定
├── .env.example
└── README.md
```

## 命名惯例

| 类型 | 惯例 | 范例 |
|------|------|------|
| 档案 | snake_case | `user_service.py` |
| 目录 | snake_case | `user_management/` |
| 类别 | PascalCase | `UserService` |
| 函式 | snake_case | `create_user()` |
| 常数 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 私有 | _leading_underscore | `_internal_method()` |

## 汇入顺序

```python
# 标准函式库
import os
from typing import Optional, List

# 第三方套件
import requests
from fastapi import FastAPI, HTTPException

# 本地模组
from myproject.modules.users import UserService
from myproject.shared.utils import format_date
```

## 模组结构

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

### 服务

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

## 设定

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

## 最佳实践

### 1. 使用 src 布局

```
# 防止意外汇入未安装的套件
project/
├── src/
│   └── myproject/  # 套件在此
└── tests/          # 测试汇入已安装的套件
```

### 2. 处处使用类型提示

```python
from typing import Optional, List

def get_users(
    limit: int = 10,
    offset: int = 0
) -> List[User]:
    ...
```

### 3. __init__.py 作为公开 API

```python
# 只汇出需要的内容
from .models import User
from .services import UserService

__all__ = ["User", "UserService"]
```

## 相关选项

- [Node.js](./nodejs.md) - Node.js 专案结构
- [.NET](./dotnet.md) - .NET/C# 专案结构
- [Java](./java.md) - Java/Spring 专案结构
- [Go](./go.md) - Go 专案结构

---

## 授权条款

本文件采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权条款。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
