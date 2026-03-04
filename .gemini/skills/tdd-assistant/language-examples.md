# TDD Language Examples

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/tdd-assistant/language-examples.md)

**Version**: 1.0.0
**Last Updated**: 2026-01-07

---

## Overview

This document provides complete TDD examples in six major programming languages:

1. [JavaScript/TypeScript](#javascripttypescript)
2. [Python](#python)
3. [C#](#c)
4. [Go](#go)
5. [Java](#java)
6. [Ruby](#ruby)

Each section includes:
- Complete Red-Green-Refactor example
- Test framework setup
- Mock/Stub usage
- BDD example (where applicable)

---

## JavaScript/TypeScript

### Test Framework: Jest/Vitest

#### Setup

```bash
# Jest
npm install --save-dev jest @types/jest ts-jest

# Vitest
npm install --save-dev vitest
```

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

#### Complete TDD Example: Shopping Cart

**Step 1: RED - Write failing test**

```typescript
// cart.test.ts
import { ShoppingCart } from './cart';

describe('ShoppingCart', () => {
  describe('calculateTotal', () => {
    test('should return 0 for empty cart', () => {
      // Arrange
      const cart = new ShoppingCart();

      // Act
      const total = cart.calculateTotal();

      // Assert
      expect(total).toBe(0);
    });
  });
});
```

Run test - it fails because `ShoppingCart` doesn't exist.

**Step 2: GREEN - Minimum implementation**

```typescript
// cart.ts
export class ShoppingCart {
  calculateTotal(): number {
    return 0; // Fake it!
  }
}
```

Test passes.

**Step 3: RED - Add next test**

```typescript
test('should return sum of item prices', () => {
  const cart = new ShoppingCart();
  cart.addItem({ name: 'Widget', price: 10 });
  cart.addItem({ name: 'Gadget', price: 20 });

  const total = cart.calculateTotal();

  expect(total).toBe(30);
});
```

**Step 4: GREEN - Implement**

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

**Step 5: RED - Test with discount**

```typescript
test('should apply percentage discount', () => {
  const cart = new ShoppingCart();
  cart.addItem({ name: 'Widget', price: 100 });
  cart.applyDiscount(20); // 20% off

  const total = cart.calculateTotal();

  expect(total).toBe(80);
});
```

**Step 6: GREEN & REFACTOR**

```typescript
export class ShoppingCart {
  private items: Array<{ name: string; price: number }> = [];
  private discountPercent = 0;

  addItem(item: { name: string; price: number }): void {
    this.items.push(item);
  }

  applyDiscount(percent: number): void {
    this.discountPercent = percent;
  }

  calculateTotal(): number {
    const subtotal = this.items.reduce((sum, item) => sum + item.price, 0);
    const discount = subtotal * (this.discountPercent / 100);
    return subtotal - discount;
  }
}
```

#### Mocking Example

```typescript
// orderService.test.ts
import { OrderService } from './orderService';
import { PaymentGateway } from './paymentGateway';

jest.mock('./paymentGateway');

describe('OrderService', () => {
  let orderService: OrderService;
  let mockPaymentGateway: jest.Mocked<PaymentGateway>;

  beforeEach(() => {
    mockPaymentGateway = new PaymentGateway() as jest.Mocked<PaymentGateway>;
    orderService = new OrderService(mockPaymentGateway);
  });

  test('should process payment and return order confirmation', async () => {
    // Arrange
    mockPaymentGateway.charge.mockResolvedValue({
      success: true,
      transactionId: 'TXN123'
    });

    // Act
    const result = await orderService.checkout({
      amount: 100,
      cardNumber: '4111111111111111'
    });

    // Assert
    expect(result.confirmed).toBe(true);
    expect(result.transactionId).toBe('TXN123');
    expect(mockPaymentGateway.charge).toHaveBeenCalledWith(100, '4111111111111111');
  });
});
```

#### BDD with Cucumber.js

```gherkin
# features/shopping_cart.feature
Feature: Shopping Cart
  As a customer
  I want to add items to my cart
  So that I can purchase them

  Scenario: Add item to empty cart
    Given I have an empty shopping cart
    When I add a "Widget" priced at $10
    Then the cart total should be $10

  Scenario: Apply discount code
    Given I have a cart with items totaling $100
    When I apply discount code "SAVE20"
    Then the cart total should be $80
```

```typescript
// features/step_definitions/cart_steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { ShoppingCart } from '../src/cart';

let cart: ShoppingCart;

Given('I have an empty shopping cart', function () {
  cart = new ShoppingCart();
});

When('I add a {string} priced at ${int}', function (name: string, price: number) {
  cart.addItem({ name, price });
});

Then('the cart total should be ${int}', function (expected: number) {
  expect(cart.calculateTotal()).to.equal(expected);
});
```

---

## Python

### Test Framework: pytest

#### Setup

```bash
pip install pytest pytest-cov pytest-mock
```

```ini
# pytest.ini
[pytest]
testpaths = tests
python_files = test_*.py
python_functions = test_*
addopts = -v --tb=short
```

#### Complete TDD Example: Calculator

**Step 1: RED**

```python
# tests/test_calculator.py
import pytest
from calculator import Calculator

class TestCalculator:
    def test_add_two_positive_numbers(self):
        # Arrange
        calc = Calculator()

        # Act
        result = calc.add(2, 3)

        # Assert
        assert result == 5
```

**Step 2: GREEN**

```python
# calculator.py
class Calculator:
    def add(self, a: float, b: float) -> float:
        return 5  # Fake it!
```

**Step 3: RED - Force generalization**

```python
def test_add_different_numbers(self):
    calc = Calculator()
    result = calc.add(10, 20)
    assert result == 30
```

**Step 4: GREEN - Implement**

```python
class Calculator:
    def add(self, a: float, b: float) -> float:
        return a + b
```

**Step 5: RED - Add more operations**

```python
def test_subtract_returns_difference(self):
    calc = Calculator()
    result = calc.subtract(10, 3)
    assert result == 7

def test_divide_by_zero_raises_error(self):
    calc = Calculator()
    with pytest.raises(ValueError, match="Cannot divide by zero"):
        calc.divide(10, 0)
```

**Step 6: GREEN & REFACTOR**

```python
class Calculator:
    def add(self, a: float, b: float) -> float:
        return a + b

    def subtract(self, a: float, b: float) -> float:
        return a - b

    def divide(self, a: float, b: float) -> float:
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return a / b
```

#### Mocking Example

```python
# tests/test_user_service.py
import pytest
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

    def test_get_user_returns_user_from_repository(self):
        # Arrange
        mock_repo = Mock()
        mock_repo.find_by_id.return_value = {"id": 1, "name": "John"}
        service = UserService(repository=mock_repo)

        # Act
        user = service.get_user(1)

        # Assert
        assert user["name"] == "John"
        mock_repo.find_by_id.assert_called_once_with(1)
```

#### BDD with Behave

```gherkin
# features/calculator.feature
Feature: Calculator
  As a user
  I want to perform calculations
  So that I can solve math problems

  Scenario: Add two numbers
    Given I have a calculator
    When I add 5 and 3
    Then the result should be 8

  Scenario Outline: Multiple additions
    Given I have a calculator
    When I add <a> and <b>
    Then the result should be <result>

    Examples:
      | a  | b  | result |
      | 1  | 1  | 2      |
      | 10 | 20 | 30     |
      | -5 | 5  | 0      |
```

```python
# features/steps/calculator_steps.py
from behave import given, when, then
from calculator import Calculator

@given('I have a calculator')
def step_impl(context):
    context.calculator = Calculator()

@when('I add {a:d} and {b:d}')
def step_impl(context, a, b):
    context.result = context.calculator.add(a, b)

@then('the result should be {expected:d}')
def step_impl(context, expected):
    assert context.result == expected
```

---

## C#

### Test Framework: xUnit

#### Setup

```bash
dotnet add package xunit
dotnet add package xunit.runner.visualstudio
dotnet add package Moq
dotnet add package FluentAssertions
```

#### Complete TDD Example: Order Processor

**Step 1: RED**

```csharp
// OrderProcessorTests.cs
using Xunit;
using FluentAssertions;

public class OrderProcessorTests
{
    [Fact]
    public void ProcessOrder_WithValidOrder_ReturnsSuccess()
    {
        // Arrange
        var processor = new OrderProcessor();
        var order = new Order { Id = 1, Amount = 100 };

        // Act
        var result = processor.Process(order);

        // Assert
        result.IsSuccess.Should().BeTrue();
    }
}
```

**Step 2: GREEN**

```csharp
// OrderProcessor.cs
public class OrderProcessor
{
    public ProcessResult Process(Order order)
    {
        return new ProcessResult { IsSuccess = true }; // Fake it!
    }
}

public class Order
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
}

public class ProcessResult
{
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
}
```

**Step 3: RED - Add validation**

```csharp
[Fact]
public void ProcessOrder_WithZeroAmount_ReturnsFailure()
{
    var processor = new OrderProcessor();
    var order = new Order { Id = 1, Amount = 0 };

    var result = processor.Process(order);

    result.IsSuccess.Should().BeFalse();
    result.ErrorMessage.Should().Be("Order amount must be greater than zero");
}
```

**Step 4: GREEN & REFACTOR**

```csharp
public class OrderProcessor
{
    public ProcessResult Process(Order order)
    {
        if (order.Amount <= 0)
        {
            return ProcessResult.Failure("Order amount must be greater than zero");
        }

        return ProcessResult.Success();
    }
}

public class ProcessResult
{
    public bool IsSuccess { get; private set; }
    public string? ErrorMessage { get; private set; }

    public static ProcessResult Success() =>
        new() { IsSuccess = true };

    public static ProcessResult Failure(string message) =>
        new() { IsSuccess = false, ErrorMessage = message };
}
```

#### Mocking Example with Moq

```csharp
using Moq;
using Xunit;
using FluentAssertions;

public class PaymentServiceTests
{
    [Fact]
    public async Task ProcessPayment_WithValidCard_ChargesAndSendsReceipt()
    {
        // Arrange
        var mockGateway = new Mock<IPaymentGateway>();
        var mockEmailService = new Mock<IEmailService>();

        mockGateway
            .Setup(g => g.ChargeAsync(It.IsAny<decimal>(), It.IsAny<string>()))
            .ReturnsAsync(new ChargeResult { TransactionId = "TXN123" });

        var service = new PaymentService(mockGateway.Object, mockEmailService.Object);

        // Act
        var result = await service.ProcessPaymentAsync(100, "4111111111111111", "user@example.com");

        // Assert
        result.TransactionId.Should().Be("TXN123");

        mockGateway.Verify(
            g => g.ChargeAsync(100, "4111111111111111"),
            Times.Once);

        mockEmailService.Verify(
            e => e.SendReceiptAsync("user@example.com", It.Is<Receipt>(r => r.TransactionId == "TXN123")),
            Times.Once);
    }
}
```

#### BDD with SpecFlow

```gherkin
# Features/OrderProcessing.feature
Feature: Order Processing
  As an e-commerce system
  I want to process customer orders
  So that customers can receive their products

  Scenario: Process valid order
    Given I have an order with amount $100
    When I process the order
    Then the order should be marked as processed
    And a confirmation email should be sent

  Scenario: Reject order with zero amount
    Given I have an order with amount $0
    When I process the order
    Then the order should be rejected
    And the error message should be "Order amount must be greater than zero"
```

```csharp
// StepDefinitions/OrderProcessingSteps.cs
using TechTalk.SpecFlow;
using FluentAssertions;

[Binding]
public class OrderProcessingSteps
{
    private Order _order;
    private ProcessResult _result;
    private readonly OrderProcessor _processor = new();

    [Given(@"I have an order with amount \$(.*)")]
    public void GivenIHaveAnOrderWithAmount(decimal amount)
    {
        _order = new Order { Id = 1, Amount = amount };
    }

    [When(@"I process the order")]
    public void WhenIProcessTheOrder()
    {
        _result = _processor.Process(_order);
    }

    [Then(@"the order should be marked as processed")]
    public void ThenTheOrderShouldBeMarkedAsProcessed()
    {
        _result.IsSuccess.Should().BeTrue();
    }

    [Then(@"the error message should be ""(.*)""")]
    public void ThenTheErrorMessageShouldBe(string expectedMessage)
    {
        _result.ErrorMessage.Should().Be(expectedMessage);
    }
}
```

---

## Go

### Test Framework: testing + testify

#### Setup

```bash
go get github.com/stretchr/testify
```

#### Complete TDD Example: User Repository

**Step 1: RED**

```go
// user_repository_test.go
package repository

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func TestUserRepository_FindById_ReturnsUser(t *testing.T) {
    // Arrange
    repo := NewUserRepository()
    repo.Save(&User{ID: 1, Name: "John"})

    // Act
    user, err := repo.FindById(1)

    // Assert
    assert.NoError(t, err)
    assert.Equal(t, "John", user.Name)
}
```

**Step 2: GREEN**

```go
// user_repository.go
package repository

import "errors"

type User struct {
    ID   int
    Name string
}

type UserRepository struct {
    users map[int]*User
}

func NewUserRepository() *UserRepository {
    return &UserRepository{
        users: make(map[int]*User),
    }
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

**Step 3: RED - Error case**

```go
func TestUserRepository_FindById_ReturnsErrorWhenNotFound(t *testing.T) {
    repo := NewUserRepository()

    user, err := repo.FindById(999)

    assert.Nil(t, user)
    assert.EqualError(t, err, "user not found")
}
```

#### Table-Driven Tests (Go Idiom)

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

#### Mocking with testify/mock

```go
// email_service_test.go
package service

import (
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
)

// Mock
type MockEmailSender struct {
    mock.Mock
}

func (m *MockEmailSender) Send(to, subject, body string) error {
    args := m.Called(to, subject, body)
    return args.Error(0)
}

func TestNotificationService_SendWelcome(t *testing.T) {
    // Arrange
    mockSender := new(MockEmailSender)
    mockSender.On("Send", "user@example.com", "Welcome!", mock.Anything).Return(nil)

    service := NewNotificationService(mockSender)

    // Act
    err := service.SendWelcome("user@example.com")

    // Assert
    assert.NoError(t, err)
    mockSender.AssertExpectations(t)
}
```

---

## Java

### Test Framework: JUnit 5 + Mockito

#### Setup (Maven)

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
    <dependency>
        <groupId>org.assertj</groupId>
        <artifactId>assertj-core</artifactId>
        <version>3.24.2</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

#### Complete TDD Example: Account Service

**Step 1: RED**

```java
// AccountServiceTest.java
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class AccountServiceTest {

    @Test
    void deposit_withPositiveAmount_increasesBalance() {
        // Arrange
        AccountService service = new AccountService();
        Account account = new Account(100.0);

        // Act
        service.deposit(account, 50.0);

        // Assert
        assertThat(account.getBalance()).isEqualTo(150.0);
    }
}
```

**Step 2: GREEN**

```java
// AccountService.java
public class AccountService {
    public void deposit(Account account, double amount) {
        account.setBalance(account.getBalance() + amount);
    }
}

// Account.java
public class Account {
    private double balance;

    public Account(double initialBalance) {
        this.balance = initialBalance;
    }

    public double getBalance() { return balance; }
    public void setBalance(double balance) { this.balance = balance; }
}
```

**Step 3: RED - Validation**

```java
@Test
void deposit_withNegativeAmount_throwsException() {
    AccountService service = new AccountService();
    Account account = new Account(100.0);

    assertThatThrownBy(() -> service.deposit(account, -50.0))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Deposit amount must be positive");
}

@Test
void withdraw_withInsufficientFunds_throwsException() {
    AccountService service = new AccountService();
    Account account = new Account(100.0);

    assertThatThrownBy(() -> service.withdraw(account, 150.0))
        .isInstanceOf(InsufficientFundsException.class)
        .hasMessage("Insufficient funds");
}
```

**Step 4: GREEN & REFACTOR**

```java
public class AccountService {

    public void deposit(Account account, double amount) {
        validatePositiveAmount(amount, "Deposit");
        account.setBalance(account.getBalance() + amount);
    }

    public void withdraw(Account account, double amount) {
        validatePositiveAmount(amount, "Withdrawal");
        if (account.getBalance() < amount) {
            throw new InsufficientFundsException("Insufficient funds");
        }
        account.setBalance(account.getBalance() - amount);
    }

    private void validatePositiveAmount(double amount, String operation) {
        if (amount <= 0) {
            throw new IllegalArgumentException(operation + " amount must be positive");
        }
    }
}
```

#### Mocking with Mockito

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private PaymentGateway paymentGateway;

    @Mock
    private InventoryService inventoryService;

    @InjectMocks
    private OrderService orderService;

    @Test
    void placeOrder_withValidOrder_processesPaymentAndUpdatesInventory() {
        // Arrange
        Order order = new Order("PROD-1", 2, 50.0);
        when(inventoryService.checkStock("PROD-1")).thenReturn(10);
        when(paymentGateway.charge(100.0)).thenReturn(new PaymentResult("TXN-123", true));

        // Act
        OrderResult result = orderService.placeOrder(order);

        // Assert
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getTransactionId()).isEqualTo("TXN-123");

        verify(inventoryService).checkStock("PROD-1");
        verify(inventoryService).reserve("PROD-1", 2);
        verify(paymentGateway).charge(100.0);
    }
}
```

#### BDD with Cucumber-JVM

```gherkin
# src/test/resources/features/account.feature
Feature: Account Management
  As a bank customer
  I want to manage my account balance
  So that I can track my finances

  Scenario: Deposit money
    Given I have an account with balance $100
    When I deposit $50
    Then my balance should be $150

  Scenario: Withdraw with insufficient funds
    Given I have an account with balance $100
    When I try to withdraw $150
    Then I should see an error "Insufficient funds"
    And my balance should be $100
```

```java
// StepDefinitions.java
import io.cucumber.java.en.*;
import static org.assertj.core.api.Assertions.*;

public class AccountStepDefinitions {
    private Account account;
    private AccountService service = new AccountService();
    private Exception caughtException;

    @Given("I have an account with balance ${double}")
    public void iHaveAccountWithBalance(double balance) {
        account = new Account(balance);
    }

    @When("I deposit ${double}")
    public void iDeposit(double amount) {
        service.deposit(account, amount);
    }

    @When("I try to withdraw ${double}")
    public void iTryToWithdraw(double amount) {
        try {
            service.withdraw(account, amount);
        } catch (Exception e) {
            caughtException = e;
        }
    }

    @Then("my balance should be ${double}")
    public void myBalanceShouldBe(double expected) {
        assertThat(account.getBalance()).isEqualTo(expected);
    }

    @Then("I should see an error {string}")
    public void iShouldSeeAnError(String message) {
        assertThat(caughtException).hasMessage(message);
    }
}
```

---

## Ruby

### Test Framework: RSpec

#### Setup

```ruby
# Gemfile
group :test do
  gem 'rspec', '~> 3.12'
  gem 'rspec-mocks'
end
```

```bash
bundle install
rspec --init
```

#### Complete TDD Example: Shopping Cart

**Step 1: RED**

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

**Step 2: GREEN**

```ruby
# lib/shopping_cart.rb
class ShoppingCart
  def total
    0 # Fake it!
  end
end
```

**Step 3: RED - Add items**

```ruby
describe '#total' do
  it 'returns sum of item prices' do
    cart = ShoppingCart.new
    cart.add_item(name: 'Widget', price: 10)
    cart.add_item(name: 'Gadget', price: 20)

    expect(cart.total).to eq(30)
  end
end
```

**Step 4: GREEN & REFACTOR**

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

**Step 5: RED - Discount**

```ruby
describe '#apply_discount' do
  it 'reduces total by percentage' do
    cart = ShoppingCart.new
    cart.add_item(name: 'Widget', price: 100)
    cart.apply_discount(20) # 20% off

    expect(cart.total).to eq(80)
  end
end
```

**Step 6: GREEN**

```ruby
class ShoppingCart
  def initialize
    @items = []
    @discount_percent = 0
  end

  def add_item(item)
    @items << item
  end

  def apply_discount(percent)
    @discount_percent = percent
  end

  def total
    subtotal = @items.sum { |item| item[:price] }
    discount = subtotal * (@discount_percent / 100.0)
    subtotal - discount
  end
end
```

#### RSpec Mocking

```ruby
# spec/order_service_spec.rb
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

      order = Order.new(amount: 100, email: 'user@example.com')

      # Act
      result = service.process(order)

      # Assert
      expect(result.success?).to be true
      expect(payment_gateway).to have_received(:charge).with(100)
      expect(email_service).to have_received(:send_confirmation)
        .with('user@example.com', hash_including(transaction_id: 'TXN123'))
    end
  end
end
```

#### BDD with RSpec (Native)

RSpec has built-in BDD-style syntax:

```ruby
# spec/features/shopping_cart_spec.rb
RSpec.feature 'Shopping Cart', type: :feature do
  scenario 'User adds items to cart' do
    # Given
    cart = ShoppingCart.new

    # When
    cart.add_item(name: 'Widget', price: 10)
    cart.add_item(name: 'Gadget', price: 20)

    # Then
    expect(cart.total).to eq(30)
    expect(cart.item_count).to eq(2)
  end

  scenario 'User applies discount code' do
    # Given
    cart = ShoppingCart.new
    cart.add_item(name: 'Widget', price: 100)

    # When
    cart.apply_discount(20)

    # Then
    expect(cart.total).to eq(80)
  end
end
```

#### BDD with Cucumber

```gherkin
# features/shopping_cart.feature
Feature: Shopping Cart
  As a customer
  I want to manage my shopping cart
  So that I can purchase products

  Scenario: Add item to cart
    Given I have an empty cart
    When I add a "Widget" priced at $10
    Then my cart total should be $10

  Scenario: Apply discount
    Given I have a cart with total $100
    When I apply a 20% discount
    Then my cart total should be $80
```

```ruby
# features/step_definitions/cart_steps.rb
Given('I have an empty cart') do
  @cart = ShoppingCart.new
end

When('I add a {string} priced at ${int}') do |name, price|
  @cart.add_item(name: name, price: price)
end

Then('my cart total should be ${int}') do |expected|
  expect(@cart.total).to eq(expected)
end
```

---

## Framework Comparison Summary

| Language | Unit Test | Mock | BDD | Watch Mode |
|----------|-----------|------|-----|------------|
| **JavaScript** | Jest/Vitest | jest.mock | Cucumber.js | `--watch` |
| **Python** | pytest | unittest.mock | Behave | pytest-watch |
| **C#** | xUnit/NUnit | Moq | SpecFlow | dotnet watch |
| **Go** | testing | testify/mock | godog | go test -v |
| **Java** | JUnit 5 | Mockito | Cucumber-JVM | Maven/Gradle |
| **Ruby** | RSpec | rspec-mocks | Cucumber/RSpec | guard |

---

## Related Documents

- [SKILL.md](./SKILL.md) - TDD Assistant overview
- [TDD Workflow](./tdd-workflow.md) - Detailed workflow guide
- [TDD Core Standard](../../core/test-driven-development.md) - Full TDD standard
