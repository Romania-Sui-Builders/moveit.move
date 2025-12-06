# Frontend Testing Guide

## Overview

This document describes the testing strategy and implementation for the MoveIt dApp frontend.

## Testing Stack

- **Jest**: Testing framework
- **React Testing Library**: Component testing
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom matchers for DOM

## Setup

### Installation

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest jest jest-environment-jsdom
```

### Configuration

- **jest.config.js**: Main Jest configuration
- **jest.setup.js**: Global test setup and mocks
- **tsconfig.json**: TypeScript configuration for tests

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- board-list.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should render"
```

## Test Structure

### Directory Structure

```
__tests__/
├── components/          # Component tests
│   ├── board-list.test.tsx
│   ├── task-form.test.tsx
│   └── task-detail.test.tsx
├── hooks/              # Custom hooks tests
│   ├── useTasks.test.ts
│   └── useBoards.test.ts
├── services/           # Service layer tests
│   ├── blockchain.service.test.ts
│   └── data.service.test.ts
├── lib/                # Utility and type tests
│   └── types.test.ts
└── utils/              # Helper function tests
    └── format.test.ts
```

## Test Categories

### 1. Unit Tests

Testing individual functions and utilities in isolation.

**Example**: `__tests__/lib/types.test.ts`

```typescript
describe('canManageMembers', () => {
  it('should allow owner to manage members', () => {
    expect(canManageMembers('owner')).toBe(true)
  })

  it('should not allow regular member', () => {
    expect(canManageMembers('member')).toBe(false)
  })
})
```

### 2. Component Tests

Testing React components with user interactions.

**Example**: `__tests__/components/board-list.test.tsx`

```typescript
it('should render list of boards', async () => {
  const mockBoards = [{ id: '0x1', name: 'Project Alpha' }]
  
  render(<BoardList boards={mockBoards} />)
  
  expect(screen.getByText('Project Alpha')).toBeInTheDocument()
})
```

### 3. Integration Tests

Testing how multiple components/services work together.

**Example**: `__tests__/services/blockchain.service.test.ts`

```typescript
it('should fetch board and tasks from blockchain', async () => {
  const board = await getBoardFromBlockchain('0xboard1')
  const tasks = await getTasksForBoard(board)
  
  expect(board).toBeDefined()
  expect(tasks).toHaveLength(5)
})
```

## Mocking Strategy

### 1. External Libraries

Mock Sui SDK and other external dependencies:

```typescript
jest.mock('@mysten/dapp-kit', () => ({
  useCurrentAccount: () => ({ address: '0x123' }),
  useSignAndExecuteTransaction: () => ({
    mutateAsync: jest.fn(),
  }),
}))
```

### 2. API Calls

Mock SWR and fetch:

```typescript
jest.mock('swr')
global.fetch = jest.fn()
```

### 3. Next.js Router

```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))
```

## Test Coverage Goals

### Minimum Coverage Targets

- **Statements**: 50%
- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%

### Priority Areas (80%+ coverage)

1. **Permission logic** (`lib/types.ts`)
2. **Blockchain service** (`services/blockchain.service.ts`)
3. **Data transformations** (`services/data.service.ts`)
4. **Utility functions** (`utils/format.ts`)

### Lower Priority (30%+ coverage)

1. **UI components** (can rely on manual testing)
2. **Styling logic**
3. **Mock data generators**

## Writing Good Tests

### Best Practices

1. **Test Behavior, Not Implementation**
   ```typescript
   // ❌ Bad: Testing implementation details
   expect(component.state.isOpen).toBe(true)
   
   // ✅ Good: Testing user-visible behavior
   expect(screen.getByRole('dialog')).toBeVisible()
   ```

2. **Use Descriptive Test Names**
   ```typescript
   // ❌ Bad
   it('works', () => { ... })
   
   // ✅ Good
   it('should display error when wallet is not connected', () => { ... })
   ```

3. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should create new board', async () => {
     // Arrange
     const mockData = { name: 'New Board' }
     
     // Act
     render(<BoardForm />)
     await userEvent.type(screen.getByRole('textbox'), mockData.name)
     await userEvent.click(screen.getByRole('button', { name: /create/i }))
     
     // Assert
     expect(screen.getByText('Board created')).toBeInTheDocument()
   })
   ```

4. **Avoid Testing Library Internals**
   - Don't test React Query internals
   - Don't test Sui SDK behavior
   - Focus on YOUR code

5. **Use Data-TestId Sparingly**
   ```typescript
   // ❌ Avoid if possible
   getByTestId('submit-button')
   
   // ✅ Prefer semantic queries
   getByRole('button', { name: /submit/i })
   getByLabelText('Email address')
   ```

## Common Test Patterns

### Testing Async Operations

```typescript
it('should load data from blockchain', async () => {
  render(<BoardDetail boardId="0x123" />)
  
  await waitFor(() => {
    expect(screen.getByText('Board Name')).toBeInTheDocument()
  })
})
```

### Testing User Interactions

```typescript
it('should handle form submission', async () => {
  const user = userEvent.setup()
  render(<TaskForm />)
  
  await user.type(screen.getByLabelText('Title'), 'New Task')
  await user.click(screen.getByRole('button', { name: /create/i }))
  
  expect(mockCreateTask).toHaveBeenCalledWith({
    title: 'New Task',
  })
})
```

### Testing Error States

```typescript
it('should display error message on failure', async () => {
  mockFetch.mockRejectedValueOnce(new Error('Network error'))
  
  render(<BoardList />)
  
  await waitFor(() => {
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
  })
})
```

## Debugging Tests

### Running Single Test

```bash
npm test -- --testNamePattern="should render loading state"
```

### Verbose Output

```bash
npm test -- --verbose
```

### Debug Specific File

```bash
npm test -- board-list.test.tsx --watch
```

### Using console.log

```typescript
import { screen, debug } from '@testing-library/react'

it('should render', () => {
  render(<Component />)
  debug() // Prints entire DOM
  debug(screen.getByRole('button')) // Prints specific element
})
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
```

## Test Data

### Mock Data Location

- `lib/mock-data.ts` - Shared mock data for tests
- Keep test data realistic (use actual Sui address formats)
- Use factories for generating test data

```typescript
// Example factory
function createMockBoard(overrides = {}) {
  return {
    id: '0x' + '1'.repeat(64),
    name: 'Test Board',
    description: 'Test Description',
    createdAt: Date.now(),
    taskCounter: 0,
    ...overrides,
  }
}
```

## Troubleshooting

### "Cannot find module" Errors

Update `moduleNameMapper` in `jest.config.js`:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

### "ReferenceError: TextEncoder is not defined"

Add to `jest.setup.js`:

```javascript
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
```

### Timeout Errors

Increase timeout for slow tests:

```typescript
it('should complete slow operation', async () => {
  // Test code
}, 10000) // 10 second timeout
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Sui TypeScript SDK Testing](https://sdk.mystenlabs.com/typescript/testing)

## Contributing

When adding new features:

1. Write tests FIRST (TDD approach recommended)
2. Ensure coverage doesn't drop below thresholds
3. Update this documentation if adding new patterns
4. Run full test suite before committing

```bash
npm run test:coverage
```

## Current Test Status

Run `npm run test:coverage` to see current coverage report.

Target areas for improvement:
- [ ] Component interaction tests
- [ ] Blockchain integration tests
- [ ] Error handling tests
- [ ] Edge case coverage
