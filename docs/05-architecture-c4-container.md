# Architecture Documentation - C4 Model: Container Diagram

## Level 2: Container Diagram

This diagram shows the high-level containers (applications, data stores) that make up MoveIt and how they interact.

```
                                    ┌────────────────────┐
                                    │    User (Browser)  │
                                    └──────────┬─────────┘
                                               │
                                               │ HTTPS
                                               ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                          Frontend Container                               │
│                         (Next.js 16 App Router)                           │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  React Components                                                 │   │
│  │  - Board Management Pages                                         │   │
│  │  - Task List & Detail Views                                       │   │
│  │  - Member Management UI                                           │   │
│  │  - Wallet Connection Component                                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                      │
│                                    ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  State Management (TanStack Query)                               │   │
│  │  - Query boards by owner                                          │   │
│  │  - Query tasks by board                                           │   │
│  │  - Cache on-chain data                                            │   │
│  │  - Optimistic updates                                             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                      │
│                                    ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Sui Integration Layer (@mysten/dapp-kit)                        │   │
│  │  - Wallet Provider & Hooks                                        │   │
│  │  - Transaction Builder                                            │   │
│  │  - Object Query Utilities                                         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                      │
└────────────────────────────────────┼──────────────────────────────────────┘
                                     │
                                     │ JSON-RPC over HTTPS
                                     │
                                     ▼
                     ┌───────────────────────────────┐
                     │     Wallet Container          │
                     │   (Browser Extension)         │
                     │                               │
                     │  - Key Management             │
                     │  - Transaction Signing        │
                     │  - User Approval UI           │
                     └───────────────┬───────────────┘
                                     │
                                     │ Signed Transactions
                                     │
                                     ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                       Sui Blockchain Network                              │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  RPC Layer                                                        │   │
│  │  - Transaction submission endpoint                                │   │
│  │  - Object query endpoints                                         │   │
│  │  - Event subscription (future)                                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                      │
│                                    ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Smart Contract Container (Move Modules)                          │   │
│  │                                                                    │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐   │   │
│  │  │  board.move    │  │  task.move     │  │  access.move    │   │   │
│  │  │                │  │                │  │                 │   │   │
│  │  │ • create       │  │ • create       │  │ • AdminCap      │   │   │
│  │  │ • add_member   │  │ • update       │  │ • ContribCap    │   │   │
│  │  │ • remove_mem   │  │ • assign       │  │ • verify_perm   │   │   │
│  │  │ • get_board    │  │ • get_tasks    │  │ • grant_cap     │   │   │
│  │  └────────────────┘  └────────────────┘  └─────────────────┘   │   │
│  │                                                                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                      │
│                                    ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Object Storage (Sui State)                                       │   │
│  │                                                                    │   │
│  │  Board Objects:          Task Objects:         Capability Objects:│   │
│  │  ┌────────────┐          ┌──────────┐          ┌──────────────┐ │   │
│  │  │ Board #1   │          │ Task #1  │          │ AdminCap #1  │ │   │
│  │  │ Board #2   │          │ Task #2  │          │ ContribCap#1 │ │   │
│  │  │ Board #3   │          │ Task #3  │          │ ContribCap#2 │ │   │
│  │  └────────────┘          └──────────┘          └──────────────┘ │   │
│  │                                                                    │   │
│  │  Ownership & References maintained via UIDs and object IDs        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

## Container Details

### 1. Frontend Container (Next.js Application)

**Technology Stack**:
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **UI Library**: Radix UI + Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Sui SDK**: @mysten/dapp-kit, @mysten/sui

**Responsibilities**:
- Render user interface for boards and tasks
- Handle wallet connection and user authentication
- Build and submit transactions to Sui
- Query on-chain state and display data
- Provide responsive, accessible UI

**Key Components**:

```typescript
// Component Structure
app/
  layout.tsx              // Root layout with providers
  page.tsx                // Landing page
  boards/
    page.tsx              // Board list view
    [boardId]/
      page.tsx            // Board detail + tasks
      
components/
  WalletStatus.tsx        // Wallet connection UI
  BoardList.tsx           // List of user's boards
  BoardForm.tsx           // Create/edit board
  TaskList.tsx            // Tasks for a board
  TaskForm.tsx            // Create/edit task
  MemberManager.tsx       // Add/remove members
  
core/
  networkConfig.ts        // Sui network configuration
  contracts.ts            // Contract addresses & ABIs
  hooks/
    useBoards.ts          // Query boards
    useTasks.ts           // Query tasks
    useTransactions.ts    // Submit transactions
```

**State Management Pattern**:
```typescript
// TanStack Query for on-chain data
const { data: boards } = useQuery({
  queryKey: ['boards', address],
  queryFn: () => suiClient.getOwnedObjects({
    owner: address,
    filter: { StructType: `${PACKAGE_ID}::board::Board` }
  })
});

// Mutations for state changes
const createBoard = useMutation({
  mutationFn: (name: string) => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::board::create`,
      arguments: [tx.pure.string(name)]
    });
    return signAndExecuteTransaction({ transaction: tx });
  },
  onSuccess: () => queryClient.invalidateQueries(['boards'])
});
```

**Deployment**:
- Hosted on Vercel (or similar)
- Static generation where possible
- Dynamic routes for board/task details
- Environment variables for network config

### 2. Wallet Container (Browser Extension)

**Technology**: External system (Sui Wallet, Suiet, etc.)

**Responsibilities**:
- Store user's private keys securely
- Sign transactions when requested
- Provide user approval UI
- Inject wallet API into browser

**Integration**:
```typescript
// Frontend uses dapp-kit to connect
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';

function App() {
  const account = useCurrentAccount();
  
  return (
    <div>
      <ConnectButton />
      {account && <p>Connected: {account.address}</p>}
    </div>
  );
}
```

**Security Boundary**:
- Private keys NEVER leave wallet
- Frontend only requests signatures
- User must approve each transaction
- Wallet validates transaction before signing

### 3. Smart Contract Container (Move Modules)

**Technology**: Sui Move programming language

**Module Structure**:

```
contract/
  sources/
    board.move          // Board management
    task.move           // Task operations
    access.move         // Access control & capabilities
  tests/
    board_tests.move    // Board creation & membership tests
    task_tests.move     // Task CRUD tests
    access_tests.move   // Permission verification tests
  Move.toml             // Package manifest
```

**Module: board.move**

```move
module moveit::board {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::table::{Self, Table};
    use std::string::String;

    // Board object - owned by creator
    struct Board has key {
        id: UID,
        name: String,
        description: String,
        owner: address,
        members: Table<address, u8>, // address -> role
        created_at: u64,
    }

    // Create a new board (owned object)
    public entry fun create(
        name: String,
        description: String,
        ctx: &mut TxContext
    ) {
        let board = Board {
            id: object::new(ctx),
            name,
            description,
            owner: tx_context::sender(ctx),
            members: table::new(ctx),
            created_at: 0, // TODO: Use Clock
        };
        transfer::transfer(board, tx_context::sender(ctx));
    }

    // Add member with role
    public entry fun add_member(
        board: &mut Board,
        member: address,
        role: u8,
        ctx: &mut TxContext
    ) {
        assert!(board.owner == tx_context::sender(ctx), ENotOwner);
        table::add(&mut board.members, member, role);
    }

    // Constants for roles
    const ROLE_ADMIN: u8 = 1;
    const ROLE_CONTRIBUTOR: u8 = 2;
    const ROLE_VIEWER: u8 = 3;
}
```

**Module: task.move**

```move
module moveit::task {
    use sui::object::{Self, UID, ID};
    use std::string::String;

    // Task object - can be owned or shared
    struct Task has key, store {
        id: UID,
        board_id: ID,
        title: String,
        description: String,
        assignee: address,
        status: u8,
        due_date: u64,
        effort_hours: u64,
        created_at: u64,
        updated_at: u64,
    }

    // Create task (owned by board or user)
    public entry fun create(
        board_id: ID,
        title: String,
        description: String,
        assignee: address,
        due_date: u64,
        effort_hours: u64,
        ctx: &mut TxContext
    ) {
        // TODO: Verify caller has permission on board
        let task = Task {
            id: object::new(ctx),
            board_id,
            title,
            description,
            assignee,
            status: STATUS_TODO,
            due_date,
            effort_hours,
            created_at: 0,
            updated_at: 0,
        };
        transfer::transfer(task, tx_context::sender(ctx));
    }

    // Update task status
    public entry fun update_status(
        task: &mut Task,
        new_status: u8,
        ctx: &mut TxContext
    ) {
        // TODO: Verify permission
        task.status = new_status;
        task.updated_at = 0; // TODO: Use Clock
    }

    // Status constants
    const STATUS_TODO: u8 = 0;
    const STATUS_IN_PROGRESS: u8 = 1;
    const STATUS_DONE: u8 = 2;
}
```

**Module: access.move**

```move
module moveit::access {
    use sui::object::{Self, UID, ID};

    // Capability for admin actions
    struct AdminCap has key, store {
        id: UID,
        board_id: ID,
    }

    // Capability for contributor actions
    struct ContributorCap has key, store {
        id: UID,
        board_id: ID,
    }

    // Grant admin capability
    public fun grant_admin(
        board_id: ID,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let cap = AdminCap {
            id: object::new(ctx),
            board_id,
        };
        transfer::transfer(cap, recipient);
    }

    // Verify admin permission
    public fun verify_admin(cap: &AdminCap, board_id: ID): bool {
        cap.board_id == board_id
    }
}
```

**Deployment**:
```bash
# Build contracts
cd contract
sui move build

# Deploy to devnet/testnet
sui client publish --gas-budget 100000000

# Output: Package ID (save this for frontend)
```

### 4. Object Storage Container (Sui State)

**Technology**: Sui's object storage layer

**Object Types**:

1. **Board Objects**
   - Type: Owned object (by creator)
   - Contains: Board metadata, member table
   - Queries: By owner address

2. **Task Objects**
   - Type: Owned or shared (design decision)
   - Contains: Task data
   - Queries: By board_id, assignee

3. **Capability Objects**
   - Type: Owned objects (granted to members)
   - Contains: Board reference, permission level
   - Queries: By owner address

**Storage Patterns**:

```move
// Option 1: Tasks as separate owned objects
// Pros: Parallel updates, clear ownership
// Cons: Need to query multiple objects

// Option 2: Tasks as dynamic fields on Board
use sui::dynamic_field as df;

// In board.move
public fun add_task_as_field(
    board: &mut Board,
    task_id: ID,
    task: Task,
    ctx: &mut TxContext
) {
    df::add(&mut board.id, task_id, task);
}

// Query all tasks for a board
public fun get_task_ids(board: &Board): vector<ID> {
    // Return list of dynamic field keys
}
```

**MVP Decision: Separate Task Objects**
- Simpler to implement in 12 hours
- Easier to query from frontend
- Can optimize with dynamic fields post-MVP

### 5. RPC Layer Container

**Technology**: Sui JSON-RPC API

**Endpoints Used**:

```typescript
// Frontend SDK usage
import { SuiClient } from '@mysten/sui/client';

const client = new SuiClient({ 
  url: 'https://fullnode.devnet.sui.io' 
});

// Query owned boards
const boards = await client.getOwnedObjects({
  owner: address,
  filter: {
    StructType: `${PACKAGE_ID}::board::Board`
  },
  options: {
    showContent: true,
    showOwner: true
  }
});

// Get specific object
const board = await client.getObject({
  id: boardId,
  options: { showContent: true }
});

// Submit transaction
const result = await client.executeTransactionBlock({
  transactionBlock: signedTx,
  options: { showEffects: true, showEvents: true }
});

// Subscribe to events (future)
await client.subscribeEvent({
  filter: { 
    MoveEventType: `${PACKAGE_ID}::board::BoardCreated` 
  },
  onMessage: (event) => console.log(event)
});
```

## Inter-Container Communication

### Frontend ↔ Smart Contract

**Create Board Flow**:
```
1. User clicks "Create Board" in UI
2. Frontend builds transaction:
   - Move call to board::create
   - Arguments: name, description
3. Frontend requests wallet signature
4. Wallet prompts user for approval
5. User approves, wallet signs transaction
6. Frontend submits via RPC
7. Transaction executes on Sui
8. Board object created, transferred to user
9. Frontend queries updated state
10. UI shows new board
```

**Query Tasks Flow**:
```
1. User navigates to board detail page
2. Frontend queries owned objects:
   - Filter by Task type
   - Filter by board_id (in object content)
3. RPC returns task objects
4. Frontend parses and displays tasks
```

### Security & Access Control

**Permission Verification**:
```move
// On-chain verification
public entry fun update_task(
    task: &mut Task,
    cap: &ContributorCap, // Must provide capability
    new_status: u8,
    ctx: &mut TxContext
) {
    assert!(
        access::verify_contributor(cap, task.board_id),
        EInvalidPermission
    );
    task.status = new_status;
}
```

**Frontend handles capability management**:
```typescript
// Query user's capabilities
const caps = await client.getOwnedObjects({
  owner: address,
  filter: { 
    StructType: `${PACKAGE_ID}::access::ContributorCap` 
  }
});

// When updating task, include capability in transaction
tx.moveCall({
  target: `${PACKAGE_ID}::task::update`,
  arguments: [
    tx.object(taskId),
    tx.object(capId), // Capability object
    tx.pure.u8(newStatus)
  ]
});
```

## Data Flow Summary

```
User Action (Browser)
    ↓
React Component
    ↓
Transaction Builder (dapp-kit)
    ↓
Wallet Signature Request
    ↓
Signed Transaction
    ↓
RPC Submission
    ↓
Move Module Execution
    ↓
Object State Change
    ↓
RPC Query (TanStack Query)
    ↓
UI Update
```

---

**Container Summary**: The system consists of 5 main containers - a Next.js frontend for UI, user wallets for authentication, Move smart contracts for business logic, Sui object storage for state, and RPC layer for communication. Each container has clear responsibilities and interfaces, enabling parallel development by the team.
