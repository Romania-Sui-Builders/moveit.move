# MoveIt Integration Guide

This guide explains how to integrate the MoveIt smart contract and indexer with the sui-tasks dApp.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Smart Contract Integration](#smart-contract-integration)
3. [Indexer Integration](#indexer-integration)
4. [Environment Setup](#environment-setup)
5. [API Integration](#api-integration)
6. [Frontend Integration](#frontend-integration)

---

## Architecture Overview

```
┌─────────────────┐
│   Sui Network   │
│  (Smart Contract)│
└────────┬────────┘
         │
         │ Events
         ↓
┌─────────────────┐      ┌─────────────────┐
│  Indexer (TS)   │─────→│  PostgreSQL DB  │
│  Event Listener │      │  (Prisma)       │
└────────┬────────┘      └─────────────────┘
         │
         │ REST API
         ↓
┌─────────────────┐
│   Next.js dApp  │
│  (Frontend)     │
└─────────────────┘
```

### Components:

1. **Smart Contract** (`contract/moveit`): Sui Move contract handling boards, tasks, permissions
2. **Indexer** (`indexer-ts`): TypeScript service that listens to blockchain events and stores them in PostgreSQL
3. **dApp** (`dapp/sui-tasks`): Next.js frontend for user interaction

---

## Smart Contract Integration

### Contract Structure

The MoveIt contract (`moveit::moveit`) provides:

#### Core Objects:
- **Board**: Workspace for organizing tasks
  - Configurable workflow statuses
  - Version field for upgrades
  - Task counter and tasks table
  
- **Task**: Unit of work within a board
  - Hierarchical (parent/child relationships)
  - Assignable to multiple users
  - Status tracking

- **AdminCap**: Admin capability for board management
- **ContributorCap**: Contributor capability for task operations

#### Key Functions:

**Admin Functions** (require AdminCap):
```move
// Create a new board
create_board(
    _: &AdminCap,
    name: String,
    description: String,
    initial_statuses: vector<String>,
    clock: &Clock,
    ctx: &mut TxContext,
): ID

// Add contributor to board
add_contributor(
    _: &AdminCap,
    board: &Board,
    new_contributor: address,
    ctx: &mut TxContext,
)

// Add/remove statuses
add_status(_: &AdminCap, board: &mut Board, status: String, ctx: &TxContext)
remove_status(_: &AdminCap, board: &mut Board, status: String, ctx: &TxContext)
```

**Contributor Functions** (require ContributorCap):
```move
// Create task
create_task(
    cap: &ContributorCap,
    board: &mut Board,
    title: String,
    description: String,
    due_date: u64,
    effort: u64,
    assignees: vector<address>,
    clock: &Clock,
    ctx: &TxContext,
): u64

// Update task
update_task(
    cap: &ContributorCap,
    board: &mut Board,
    task_id: u64,
    title: String,
    description: String,
    due_date: u64,
    effort: u64,
    clock: &Clock,
    ctx: &TxContext,
)

// Update task status
update_task_status(
    cap: &ContributorCap,
    board: &mut Board,
    task_id: u64,
    new_status: String,
    clock: &Clock,
    ctx: &TxContext,
)

// Assign task
assign_task(
    cap: &ContributorCap,
    board: &mut Board,
    task_id: u64,
    assignees: vector<address>,
    clock: &Clock,
    ctx: &TxContext,
)

// Create subtask
create_subtask(
    cap: &ContributorCap,
    board: &mut Board,
    parent_task_id: u64,
    title: String,
    description: String,
    due_date: u64,
    effort: u64,
    assignees: vector<address>,
    clock: &Clock,
    ctx: &TxContext,
): u64
```

#### Events Emitted:

```move
BoardCreated { board_id, name, created_by, version }
BoardMigrated { board_id, old_version, new_version, migrated_by }
StatusAdded { board_id, status, added_by }
StatusRemoved { board_id, status, removed_by }
ContributorAdded { board_id, contributor, added_by }
TaskCreated { board_id, task_id, title, creator }
TaskUpdated { board_id, task_id, updated_by }
TaskStatusChanged { board_id, task_id, old_status, new_status, changed_by }
TaskAssigned { board_id, task_id, assignees, assigned_by }
SubtaskCreated { board_id, parent_task_id, subtask_id, title, creator }
```

---

## Indexer Integration

### How It Works

The indexer:
1. Connects to Sui network (testnet/mainnet)
2. Polls for events from the MoveIt contract
3. Parses events and stores them in PostgreSQL
4. Provides REST API to query indexed data
5. Maintains cursor for resumable indexing

### Database Schema

```prisma
model BoardCreated {
  dbId String @id @default(uuid())
  board_id String
  name String
  created_by String
  version String
}

model TaskCreated {
  dbId String @id @default(uuid())
  board_id String
  task_id String
  title String
  creator String
}

model TaskStatusChanged {
  dbId String @id @default(uuid())
  board_id String
  task_id String
  old_status String
  new_status String
  changed_by String
}

// ... other event tables
```

### API Endpoints

The indexer provides these endpoints (default port 3001):

```
GET /events/moveit/board-created
GET /events/moveit/board-migrated
GET /events/moveit/status-added
GET /events/moveit/status-removed
GET /events/moveit/contributor-added
GET /events/moveit/task-created
GET /events/moveit/task-updated
GET /events/moveit/task-status-changed
GET /events/moveit/task-assigned
```

Response format:
```json
[
  {
    "dbId": "uuid",
    "board_id": "0x...",
    "task_id": "1",
    "title": "Task Title",
    "creator": "0x..."
  }
]
```

---

## Environment Setup

### 1. Smart Contract Deployment

```bash
cd contract/moveit

# Build the contract
sui move build

# Publish to testnet (save the package ID!)
sui client publish --gas-budget 100000000

# Save these values:
# - PACKAGE_ID: The published package object ID
# - ADMIN_CAP_ID: The AdminCap object ID (from transaction effects)
```

### 2. Indexer Setup

```bash
cd indexer-ts

# Install dependencies
npm install

# Set up environment variables (see .env file below)
# Set up database
npm run db:setup:dev

# Start indexer (in separate terminal)
npm run indexer

# Start API server (in another terminal)
npm run api:dev
```

### 3. dApp Setup

```bash
cd dapp/sui-tasks

# Install dependencies
npm install

# Set up environment variables (see .env file below)
# Start development server
npm run dev
```

---

## API Integration

### Creating API Routes in dApp

The dApp should create API routes that proxy to the indexer:

**File: `dapp/sui-tasks/app/api/events/[...slug]/route.ts`**

This allows the frontend to call `/api/events/moveit/task-created` which proxies to the indexer.

### Example Usage:

```typescript
// Fetch all board created events
const response = await fetch('/api/events/moveit/board-created');
const boards = await response.json();

// Fetch all tasks for a board
const tasks = await fetch('/api/events/moveit/task-created');
const boardTasks = tasks.filter(t => t.board_id === boardId);
```

---

## Frontend Integration

### 1. Update Constants

Update `dapp/sui-tasks/core/constants.ts` with deployed package ID.

### 2. Create Service Layer

Create services to interact with both the blockchain and indexer.

**File: `dapp/sui-tasks/services/moveit.service.ts`**

### 3. Update Hooks

Update existing hooks to use the new contract structure and indexer data.

### 4. Transaction Building

Example transaction to create a board:

```typescript
const tx = new Transaction();

tx.moveCall({
  target: `${PACKAGE_ID}::moveit::create_board`,
  arguments: [
    tx.object(ADMIN_CAP_ID), // AdminCap
    tx.pure.string(name),
    tx.pure.string(description),
    tx.pure.vector('string', initial_statuses),
    tx.object(CLOCK_ID),
  ],
});
```

Example transaction to create a task:

```typescript
const tx = new Transaction();

tx.moveCall({
  target: `${PACKAGE_ID}::moveit::create_task`,
  arguments: [
    tx.object(CONTRIBUTOR_CAP_ID), // ContributorCap
    tx.object(boardId), // Board object
    tx.pure.string(title),
    tx.pure.string(description),
    tx.pure.u64(dueDate),
    tx.pure.u64(effort),
    tx.pure.vector('address', assignees),
    tx.object(CLOCK_ID),
  ],
});
```

---

## Testing the Integration

### 1. Deploy Contract
```bash
cd contract/moveit
sui move build
sui client publish --gas-budget 100000000
```

### 2. Start Indexer
```bash
cd indexer-ts
# Update .env with PACKAGE_ID
npm run indexer
# In another terminal
npm run api:dev
```

### 3. Test API
```bash
# Check if API is running
curl http://localhost:3001/events/moveit/board-created
```

### 4. Start dApp
```bash
cd dapp/sui-tasks
# Update .env with PACKAGE_ID and INDEXER_URL
npm run dev
```

### 5. Create a Board
- Connect wallet in dApp
- Use admin functions to create a board
- Check indexer API for BoardCreated event

---

## Troubleshooting

### Indexer not receiving events
- Verify PACKAGE_ID is correct in indexer config
- Check network settings (testnet vs devnet)
- Verify DATABASE_URL is correct
- Check indexer logs for errors

### Transactions failing
- Ensure you have the correct capability (AdminCap or ContributorCap)
- Verify gas budget is sufficient
- Check that board/task IDs are correct
- Ensure board is shared object (not owned)

### API returning empty data
- Wait a few seconds after transaction for indexer to process
- Check indexer terminal for processing logs
- Verify transaction was successful on Sui Explorer
- Check database has data: `npm run db:studio`

---

## Next Steps

1. Deploy smart contract to testnet
2. Set up PostgreSQL database
3. Configure and start indexer
4. Update dApp environment variables
5. Test board creation flow
6. Test task creation flow
7. Implement real-time updates using SWR

---

## Resources

- [Sui Documentation](https://docs.sui.io/)
- [Sui dApp Kit](https://sdk.mystenlabs.com/dapp-kit)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
