---
source: ../../../../../skills/claude-code/tdd-assistant/language-examples.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-07
status: current
---

# TDD 语言範例

> **语言**: [English](../../../../../skills/claude-code/tdd-assistant/language-examples.md) | 简体中文

**版本**: 1.0.0
**最後更新**: 2026-01-07

---

## 概覽

本文件提供六种主流程序语言的完整 TDD 範例：

1. [JavaScript/TypeScript](#javascripttypescript)
2. [Python](#python)
3. [C#](#c)
4. [Go](#go)
5. [Java](#java)
6. [Ruby](#ruby)

每个區段包含：
- 完整的紅-綠-重構範例
- 测试框架设置
- Mock/Stub 使用
- BDD 範例（如適用）

---

## JavaScript/TypeScript

### 测试框架：Jest/Vitest

#### 设置

```bash
# Jest
npm install --save-dev jest @types/jest ts-jest

# Vitest
npm install --save-dev vitest
```

#### 完整 TDD 範例：購物車

**步骤 1：紅色 - 撰写失败测试**

```typescript
// cart.test.ts
import { ShoppingCart } from './cart';

describe('ShoppingCart', () => {
  describe('calculateTotal', () => {
    test('should return 0 for empty cart', () => {
      // Arrange（准备）
      const cart = new ShoppingCart();

      // Act（执行）
      const total = cart.calculateTotal();

      // Assert（斷言）
      expect(total).toBe(0);
    });
  });
});
```

执行测试 - 它失败因为 `ShoppingCart` 不存在。

**步骤 2：綠色 - 最少实現**

```typescript
// cart.ts
export class ShoppingCart {
  calculateTotal(): number {
    return 0; // 假裝！
  }
}
```

测试通過。

**步骤 3：紅色 - 新增下一个测试**

```typescript
test('should return sum of item prices', () => {
  const cart = new ShoppingCart();
  cart.addItem({ name: 'Widget', price: 10 });
  cart.addItem({ name: 'Gadget', price: 20 });

  const total = cart.calculateTotal();

  expect(total).toBe(30);
});
```

**步骤 4：綠色 - 实現**

```typescript
export class ShoppingCart {
  private items: { name: string; price: number }[] = [];

  addItem(item: { name: string; price: number }): void {
    this.items.push(item);
  }

  calculateTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}
```

#### Mock 範例

```typescript
// orderService.test.ts
import { OrderService } from './orderService';
import { PaymentGateway } from './paymentGateway';

jest.mock('./paymentGateway');

describe('OrderService', () => {
  test('should process payment and return order confirmation', async () => {
    // Arrange
    const mockPaymentGateway = new PaymentGateway() as jest.Mocked<PaymentGateway>;
    mockPaymentGateway.charge.mockResolvedValue({
      success: true,
      transactionId: 'TXN123'
    });

    const orderService = new OrderService(mockPaymentGateway);

    // Act
    const result = await orderService.checkout({
      amount: 100,
      cardNumber: '4111111111111111'
    });

    // Assert
    expect(result.confirmed).toBe(true);
    expect(mockPaymentGateway.charge).toHaveBeenCalledWith(100, '4111111111111111');
  });
});
```

---

## Python

### 测试框架：pytest

#### 设置

```bash
pip install pytest pytest-cov pytest-mock
```

#### 完整 TDD 範例：计算机

**步骤 1：紅色**

```python
# tests/test_calculator.py
import pytest
from calculator import Calculator

class TestCalculator:
    def test_add_two_positive_numbers(self):
        # Arrange（准备）
        calc = Calculator()

        # Act（执行）
        result = calc.add(2, 3)

        # Assert（斷言）
        assert result == 5
```

**步骤 2：綠色**

```python
# calculator.py
class Calculator:
    def add(self, a: float, b: float) -> float:
        return 5  # 假裝！
```

**步骤 3：紅色 - 強制泛化**

```python
def test_add_different_numbers(self):
    calc = Calculator()
    result = calc.add(10, 20)
    assert result == 30
```

**步骤 4：綠色 - 实現**

```python
class Calculator:
    def add(self, a: float, b: float) -> float:
        return a + b
```

#### Mock 範例

```python
# tests/test_user_service.py
from unittest.mock import Mock, patch
from user_service import UserService

class TestUserService:
    @patch('user_service.EmailClient')
    def test_register_user_sends_welcome_email(self, mock_email_client):
        # Arrange
        mock_client = Mock()
        mock_email_client.return_value = mock_client
        service = UserService()

        # Act
        service.register_user("john@example.com", "John")

        # Assert
        mock_client.send.assert_called_once_with(
            to="john@example.com",
            subject="Welcome!",
            body="Hello John, welcome to our service!"
        )
```

---

## C#

### 测试框架：xUnit

#### 设置

```bash
dotnet add package xunit
dotnet add package xunit.runner.visualstudio
dotnet add package Moq
dotnet add package FluentAssertions
```

#### 完整 TDD 範例：订单处理器

**步骤 1：紅色**

```csharp
// OrderProcessorTests.cs
using Xunit;
using FluentAssertions;

public class OrderProcessorTests
{
    [Fact]
    public void ProcessOrder_WithValidOrder_ReturnsSuccess()
    {
        // Arrange（准备）
        var processor = new OrderProcessor();
        var order = new Order { Id = 1, Amount = 100 };

        // Act（执行）
        var result = processor.Process(order);

        // Assert（斷言）
        result.IsSuccess.Should().BeTrue();
    }
}
```

**步骤 2：綠色**

```csharp
// OrderProcessor.cs
public class OrderProcessor
{
    public ProcessResult Process(Order order)
    {
        return new ProcessResult { IsSuccess = true }; // 假裝！
    }
}
```

#### Moq 範例

```csharp
using Moq;

public class PaymentServiceTests
{
    [Fact]
    public async Task ProcessPayment_WithValidCard_ChargesAndSendsReceipt()
    {
        // Arrange
        var mockGateway = new Mock<IPaymentGateway>();
        mockGateway
            .Setup(g => g.ChargeAsync(It.IsAny<decimal>(), It.IsAny<string>()))
            .ReturnsAsync(new ChargeResult { TransactionId = "TXN123" });

        var service = new PaymentService(mockGateway.Object);

        // Act
        var result = await service.ProcessPaymentAsync(100, "4111111111111111");

        // Assert
        result.TransactionId.Should().Be("TXN123");
        mockGateway.Verify(g => g.ChargeAsync(100, "4111111111111111"), Times.Once);
    }
}
```

---

## Go

### 测试框架：testing + testify

#### 设置

```bash
go get github.com/stretchr/testify
```

#### 完整 TDD 範例：使用者储存庫

**步骤 1：紅色**

```go
// user_repository_test.go
package repository

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func TestUserRepository_FindById_ReturnsUser(t *testing.T) {
    // Arrange（准备）
    repo := NewUserRepository()
    repo.Save(&User{ID: 1, Name: "John"})

    // Act（执行）
    user, err := repo.FindById(1)

    // Assert（斷言）
    assert.NoError(t, err)
    assert.Equal(t, "John", user.Name)
}
```

**步骤 2：綠色**

```go
// user_repository.go
package repository

type UserRepository struct {
    users map[int]*User
}

func NewUserRepository() *UserRepository {
    return &UserRepository{users: make(map[int]*User)}
}

func (r *UserRepository) Save(user *User) {
    r.users[user.ID] = user
}

func (r *UserRepository) FindById(id int) (*User, error) {
    user, exists := r.users[id]
    if !exists {
        return nil, errors.New("user not found")
    }
    return user, nil
}
```

#### 表格驅动测试（Go 慣例）

```go
func TestUserRepository_Save(t *testing.T) {
    tests := []struct {
        name     string
        user     *User
        expected int
    }{
        {
            name:     "save single user",
            user:     &User{ID: 1, Name: "Alice"},
            expected: 1,
        },
        {
            name:     "save user with different ID",
            user:     &User{ID: 2, Name: "Bob"},
            expected: 2,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            repo := NewUserRepository()
            repo.Save(tt.user)

            found, err := repo.FindById(tt.expected)

            assert.NoError(t, err)
            assert.Equal(t, tt.user.Name, found.Name)
        })
    }
}
```

---

## Java

### 测试框架：JUnit 5 + Mockito

#### 设置 (Maven)

```xml
<dependencies>
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>5.10.0</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.mockito</groupId>
        <artifactId>mockito-core</artifactId>
        <version>5.5.0</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

#### 完整 TDD 範例：帳戶服务

**步骤 1：紅色**

```java
// AccountServiceTest.java
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class AccountServiceTest {

    @Test
    void deposit_withPositiveAmount_increasesBalance() {
        // Arrange（准备）
        AccountService service = new AccountService();
        Account account = new Account(100.0);

        // Act（执行）
        service.deposit(account, 50.0);

        // Assert（斷言）
        assertThat(account.getBalance()).isEqualTo(150.0);
    }
}
```

**步骤 2：綠色**

```java
// AccountService.java
public class AccountService {
    public void deposit(Account account, double amount) {
        account.setBalance(account.getBalance() + amount);
    }
}
```

#### Mockito 範例

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private PaymentGateway paymentGateway;

    @InjectMocks
    private OrderService orderService;

    @Test
    void placeOrder_withValidOrder_processesPayment() {
        // Arrange
        Order order = new Order("PROD-1", 2, 50.0);
        when(paymentGateway.charge(100.0))
            .thenReturn(new PaymentResult("TXN-123", true));

        // Act
        OrderResult result = orderService.placeOrder(order);

        // Assert
        assertThat(result.isSuccess()).isTrue();
        verify(paymentGateway).charge(100.0);
    }
}
```

---

## Ruby

### 测试框架：RSpec

#### 设置

```ruby
# Gemfile
group :test do
  gem 'rspec', '~> 3.12'
  gem 'rspec-mocks'
end
```

#### 完整 TDD 範例：購物車

**步骤 1：紅色**

```ruby
# spec/shopping_cart_spec.rb
require_relative '../lib/shopping_cart'

RSpec.describe ShoppingCart do
  describe '#total' do
    it 'returns 0 for empty cart' do
      cart = ShoppingCart.new

      expect(cart.total).to eq(0)
    end
  end
end
```

**步骤 2：綠色**

```ruby
# lib/shopping_cart.rb
class ShoppingCart
  def total
    0 # 假裝！
  end
end
```

**步骤 3：紅色 - 新增商品**

```ruby
it 'returns sum of item prices' do
  cart = ShoppingCart.new
  cart.add_item(name: 'Widget', price: 10)
  cart.add_item(name: 'Gadget', price: 20)

  expect(cart.total).to eq(30)
end
```

**步骤 4：綠色与重構**

```ruby
class ShoppingCart
  def initialize
    @items = []
  end

  def add_item(item)
    @items << item
  end

  def total
    @items.sum { |item| item[:price] }
  end
end
```

#### RSpec Mock 範例

```ruby
RSpec.describe OrderService do
  describe '#process' do
    it 'charges payment and sends confirmation' do
      # Arrange
      payment_gateway = instance_double(PaymentGateway)
      email_service = instance_double(EmailService)

      allow(payment_gateway).to receive(:charge).and_return(
        OpenStruct.new(success: true, transaction_id: 'TXN123')
      )
      allow(email_service).to receive(:send_confirmation)

      service = OrderService.new(
        payment_gateway: payment_gateway,
        email_service: email_service
      )

      # Act
      result = service.process(Order.new(amount: 100, email: 'user@example.com'))

      # Assert
      expect(result.success?).to be true
      expect(payment_gateway).to have_received(:charge).with(100)
    end
  end
end
```

---

## 框架比較摘要

| 语言 | 单元测试 | Mock | BDD | Watch 模式 |
|------|---------|------|-----|-----------|
| **JavaScript** | Jest/Vitest | jest.mock | Cucumber.js | `--watch` |
| **Python** | pytest | unittest.mock | Behave | pytest-watch |
| **C#** | xUnit/NUnit | Moq | SpecFlow | dotnet watch |
| **Go** | testing | testify/mock | godog | go test -v |
| **Java** | JUnit 5 | Mockito | Cucumber-JVM | Maven/Gradle |
| **Ruby** | RSpec | rspec-mocks | Cucumber/RSpec | guard |

---

## 相关文件

- [SKILL.md](./SKILL.md) - TDD 助手概覽
- [TDD 工作流程](./tdd-workflow.md) - 详细工作流程指南
- [TDD 核心标准](../../../../../core/test-driven-development.md) - 完整 TDD 标准
