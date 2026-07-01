# Test Data

This directory contains all test data generation and management utilities for
the Playwright Enterprise Framework.

## 📁 Directory Structure

```
test-data/
├── examples/               # Example-specific test data
│   ├── orangehrm/          # OrangeHRM demo site data
│   │   └── ui/
│   │       ├── credentials.json
│   │       └── form-data.json
│   └── jsonplaceholder/    # JSONPlaceholder API example data
│       ├── api/            # Static JSON responses
│       │   ├── users.json
│       │   ├── products.json
│       │   └── orders.json
│       ├── factories/      # Faker-based generators (JSONPlaceholder-specific)
│       │   ├── user.factory.ts
│       │   ├── product.factory.ts
│       │   ├── order.factory.ts
│       │   └── index.ts
│       ├── builders/       # Complex object builders (JSONPlaceholder-specific)
│       │   ├── order.builder.ts
│       │   └── index.ts
│       ├── schemas/        # JSON schemas (JSONPlaceholder-specific)
│       │   ├── user.schema.json
│       │   └── product.schema.json
│       └── mocks/          # MSW mocks (JSONPlaceholder-specific)
│           ├── setup.ts
│           └── users.mock.ts
├── static/                 # Generic reusable data (shared across all projects)
│   ├── test-users.ts       # Shared test accounts
│   ├── countries.ts        # Country/state reference
│   └── index.ts
└── environments/           # Environment-specific configs
    ├── dev.json
    ├── prod.json
    └── staging.json
```

## 🎯 Usage

### When to Use What?

| Data Type        | Use Case                                                                   | Example                                                                                                               |
| ---------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Examples**     | Demo site-specific data (static JSON, factories, builders, schemas, mocks) | `examples/jsonplaceholder/api/users.json`<br>`examples/jsonplaceholder/factories`<br>`examples/jsonplaceholder/mocks` |
| **Static**       | Shared constants/credentials across ALL projects                           | `static/test-users.ts`<br>`static/countries.ts`                                                                       |
| **Environments** | Environment-specific configurations                                        | `environments/dev.json`                                                                                               |

**Key Principle**: If it's specific to an example application (OrangeHRM,
JSONPlaceholder), it goes in `examples/`. If it's truly generic and reusable
across any project, it goes in `static/`.

### Examples (For Demo Sites)

Use example-specific data for testing against demo applications:

```typescript
// Static JSON data
import orangehrmCredentials from '@test-data/examples/orangehrm/ui/credentials.json';
import jsonplaceholderUsers from '@test-data/examples/jsonplaceholder/api/users.json';

// OrangeHRM demo site
const { username, password } = orangehrmCredentials.validCredentials.admin;
await page.fill('#username', username);
await page.fill('#password', password);

// JSONPlaceholder API tests
const validUser = jsonplaceholderUsers.validUsers[0];
await api.post('/users', validUser);
```

### Factories (JSONPlaceholder-Specific)

Use factories for generating realistic, randomized test data for JSONPlaceholder
API tests:

```typescript
import {
  UserFactory,
  ProductFactory,
  OrderFactory,
} from '@test-data/examples/jsonplaceholder/factories';

// Generate single entities
const user = UserFactory.build();
const admin = UserFactory.buildAdmin();
const product = ProductFactory.build();

// Generate with overrides
const specificUser = UserFactory.build({
  email: 'specific@test.com',
  role: 'manager',
});

// Generate multiple entities
const users = UserFactory.buildBatch(10);
const products = ProductFactory.buildBatch(5, { category: 'Electronics' });

// Generate complete orders
const order = OrderFactory.build({ customer: user });
```

### Builders (JSONPlaceholder-Specific)

Use builders for complex objects with many optional properties:

```typescript
import { OrderBuilder } from '@test-data/examples/jsonplaceholder/builders';
import {
  UserFactory,
  ProductFactory,
} from '@test-data/examples/jsonplaceholder/factories';

const customer = UserFactory.build();
const product1 = ProductFactory.build();
const product2 = ProductFactory.build();

const order = new OrderBuilder()
  .withCustomer(customer)
  .withProduct(product1, 2)
  .withProduct(product2, 1)
  .withStatus('processing')
  .withPaymentMethod('credit_card')
  .build();
```

### Schemas (JSONPlaceholder-Specific)

Use schemas for JSON validation of JSONPlaceholder API responses:

```typescript
import Ajv from 'ajv';
import userSchema from '@test-data/examples/jsonplaceholder/schemas/user.schema.json';
import productSchema from '@test-data/examples/jsonplaceholder/schemas/product.schema.json';

const ajv = new Ajv();

// Validate user response
const validateUser = ajv.compile(userSchema);
const isValid = validateUser(responseData);

if (!isValid) {
  console.error('Validation errors:', validateUser.errors);
}

// Validate product response
const validateProduct = ajv.compile(productSchema);
expect(validateProduct(productData)).toBe(true);
```

### Mocks (JSONPlaceholder-Specific)

Use MSW mocks for testing without hitting real JSONPlaceholder API:

```typescript
import {
  startMockServer,
  stopMockServer,
  resetMockServer,
} from '@test-data/examples/jsonplaceholder/mocks/setup';

// In test setup
test.beforeAll(async () => {
  startMockServer();
});

test.afterEach(async () => {
  resetMockServer();
});

test.afterAll(async () => {
  stopMockServer();
});

// Your tests now use mocked responses
test('should get users', async ({ request }) => {
  const response = await request.get('/users');
  expect(response.ok()).toBeTruthy();
  // Returns mocked data from users.mock.ts
});
```

### Static Data

Use static data for consistent reference data (test users, credit cards,
countries):

```typescript
import {
  TEST_USERS,
  TEST_CREDIT_CARDS,
  COUNTRIES,
} from '@test-data/static';

// Test authentication
await page.fill('#username', TEST_USERS.admin.username);
await page.fill('#password', TEST_USERS.admin.password);

// Test payment
await page.fill('#cardNumber', TEST_CREDIT_CARDS.visa.number);
await page.fill('#cvv', TEST_CREDIT_CARDS.visa.cvv);

// Test address forms
const country = COUNTRIES.find(c => c.code === 'US');
await page.selectOption('#country', country.code);
```

## ✅ Best Practices

### 1. Test Isolation

Each test should create its own data:

```typescript
test.beforeEach(async ({ request }) => {
  // Create fresh data for each test
  testUser = UserFactory.build();
  testUserId = await createUserViaAPI(request, testUser);
});

test.afterEach(async ({ request }) => {
  // Clean up after each test
  if (testUserId) {
    await deleteUserViaAPI(request, testUserId);
  }
});
```

### 2. Unique Identifiers

Ensure uniqueness to avoid conflicts:

```typescript
// ✅ Good - Unique email with timestamp
const user = UserFactory.build({
  email: `test.user+${Date.now()}@example.com`,
});

// ❌ Bad - Static email causes conflicts
const user = UserFactory.build({
  email: 'test@example.com',
});
```

### 3. No Real Data

Never use production data in tests:

```typescript
// ✅ Good - Synthetic data
const user = UserFactory.build();

// ❌ Bad - Real user data
const user = await db.query('SELECT * FROM prod.users LIMIT 1');
```

### 4. Cleanup

Always clean up test data:

```typescript
test.afterEach(async () => {
  // Delete created entities
  await Promise.all(createdIds.map(id => deleteEntity(id)));
});

test.afterAll(async () => {
  // Final cleanup
  await cleanupAllTestData();
});
```

## 🔒 Security & Privacy

### Never Commit

- ❌ Real user credentials
- ❌ Production data exports
- ❌ API keys or secrets
- ❌ PII (personally identifiable information)

### Always Use

- ✅ Faker.js for synthetic data
- ✅ Environment variables for credentials
- ✅ Test credit cards (4111111111111111)
- ✅ Test email domains (+test@example.com)

### GDPR Compliance

- Only synthetic data in tests
- Automated cleanup processes
- No real personal data
- Document data retention

## 📚 Documentation

For comprehensive test data strategy, see [Testing Guide](../../docs/testing.md)

Key topics covered:

- Test data organization and management
- Data generation with factories
- Test data lifecycle
- Privacy & compliance considerations
- Data management best practices
- Examples and patterns

## 🛠️ Available Factories

### UserFactory

```typescript
UserFactory.build(); // Basic user
UserFactory.buildAdmin(); // Admin user
UserFactory.buildManager(); // Manager user
UserFactory.buildInactive(); // Inactive user
UserFactory.buildBatch(10); // 10 users
```

### ProductFactory

```typescript
ProductFactory.build(); // Basic product
ProductFactory.buildPremium(); // High-value product
ProductFactory.buildOutOfStock(); // Out of stock
ProductFactory.buildOnSale(); // Discounted product
ProductFactory.buildBatch(10); // 10 products
```

### OrderFactory

```typescript
OrderFactory.build(); // Basic order
OrderFactory.buildPending(); // Pending order
OrderFactory.buildProcessing(); // Processing order
OrderFactory.buildDelivered(); // Completed order
OrderFactory.buildCancelled(); // Cancelled order
OrderFactory.buildBatch(10); // 10 orders
```

## 🔄 Data Lifecycle

```
1. Setup (beforeEach)
   ↓
2. Generate (factories/builders)
   ↓
3. Use (in test)
   ↓
4. Cleanup (afterEach)
```

## ❓ FAQ

**Q: When should I use factories vs builders?**

A: Use factories for simple objects with few overrides. Use builders for complex
objects with many optional properties.

**Q: How do I ensure data uniqueness?**

A: Factories automatically generate unique IDs. For emails/usernames, add
timestamps: `test+${Date.now()}@example.com`

**Q: Can I use the same data across tests?**

A: No, each test should create its own data for isolation. Use fixtures for
shared dependencies.

**Q: Where should I put custom factories?**

A: Add them to `factories/` directory and export from `factories/index.ts`

**Q: How do I seed a database?**

A: Use scripts in `seeds/` directory: `pnpm run seed:dev`

## 📞 Support

For questions or issues:

1. Check [Testing Guide](../../docs/testing.md)
2. Review existing factory implementations
3. Contact QA team
