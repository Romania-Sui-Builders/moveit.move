# Architecture Documentation - C4 Model: Component Diagram

## Level 3: Component Diagram

This diagram zooms into the Frontend and Smart Contract containers to show their internal components.

## Frontend Container - Component Breakdown

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Next.js Frontend Application                            │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                      Presentation Layer                             │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐    │    │
│  │  │ WalletStatus │  │  BoardList   │  │  TaskListComponent   │    │    │
│  │  │              │  │              │  │                      │    │    │
│  │  │ • Connect UI │  │ • Grid view  │  │ • Table/List view   │    │    │
│  │  │ • Address    │  │ • Create btn │  │ • Status indicators  │    │    │
│  │  │ • Balance    │  │ • Board cards│  │ • Assign/Update     │    │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘    │    │
│  │                                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐    │    │
│  │  │  BoardForm   │  │   TaskForm   │  │  MemberManager       │    │    │
│  │  │              │  │              │  │                      │    │    │
│  │  │ • Name input │  │ • Title      │  │ • Add member form   │    │    │
│  │  │ • Desc input │  │ • Assignee   │  │ • Role selector     │    │    │
│  │  │ • Submit btn │  │ • Due date   │  │ • Member list       │    │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘    │    │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                      Business Logic Layer                           │    │
│  │                                                                      │    │
│  │  ┌──────────────────────────────────────────────────────────────┐  │    │
│  │  │  Custom Hooks (React Query Integration)                      │  │    │
│  │  │                                                                │  │    │
│  │  │  useBoards()                                                  │  │    │
│  │  │  • Query owned boards                                         │  │    │
│  │  │  • Filter by address                                          │  │    │
│  │  │  • Cache invalidation                                         │  │    │
│  │  │                                                                │  │    │
│  │  │  useTasks(boardId)                                            │  │    │
│  │  │  • Query tasks by board                                       │  │    │
│  │  │  • Filter by status                                           │  │    │
│  │  │  • Real-time updates (polling)                                │  │    │
│  │  │                                                                │  │    │
│  │  │  useCreateBoard()                                             │  │    │
│  │  │  • Build transaction                                          │  │    │
│  │  │  • Submit via wallet                                          │  │    │
│  │  │  • Handle success/error                                       │  │    │
│  │  │                                                                │  │    │
│  │  │  useUpdateTask()                                              │  │    │
│  │  │  • Build update transaction                                   │  │    │
│  │  │  • Include capability check                                   │  │    │
│  │  │  • Optimistic update                                          │  │    │
│  │  │                                                                │  │    │
│  │  │  useAddMember()                                               │  │    │
│  │  │  • Verify admin permission                                    │  │    │
│  │  │  • Grant capability                                           │  │    │
│  │  │  • Update member list                                         │  │    │
│  │  └──────────────────────────────────────────────────────────────┘  │    │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                    Data Access Layer                                │    │
│  │                                                                      │    │
│  │  ┌──────────────────────┐  ┌────────────────────────────────┐     │    │
│  │  │   SuiClientWrapper   │  │  TransactionBuilder            │     │    │
│  │  │                      │  │                                │     │    │
│  │  │ • Initialize client  │  │ • Create PTB (Transaction)    │     │    │
│  │  │ • Network config     │  │ • Add move calls              │     │    │
│  │  │ • RPC endpoints      │  │ • Handle arguments            │     │    │
│  │  │ • Error handling     │  │ • Gas budget calculation      │     │    │
│  │  └──────────────────────┘  └────────────────────────────────┘     │    │
│  │                                                                      │    │
│  │  ┌──────────────────────┐  ┌────────────────────────────────┐     │    │
│  │  │   ObjectQueryService │  │  CapabilityManager             │     │    │
│  │  │                      │  │                                │     │    │
│  │  │ • getOwnedObjects()  │  │ • Query user capabilities     │     │    │
│  │  │ • getObject()        │  │ • Verify permissions          │     │    │
│  │  │ • Filter helpers     │  │ • Include in transactions     │     │    │
│  │  │ • Parse responses    │  │ • Role mapping                │     │    │
│  │  └──────────────────────┘  └────────────────────────────────┘     │    │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                   Integration Layer                                 │    │
│  │                                                                      │    │
│  │  ┌──────────────────────────────────────────────────────────────┐  │    │
│  │  │  @mysten/dapp-kit                                             │  │    │
│  │  │                                                                │  │    │
│  │  │  • SuiClientProvider                                          │  │    │
│  │  │  • WalletProvider                                             │  │    │
│  │  │  • useCurrentAccount()                                        │  │    │
│  │  │  • useSignAndExecuteTransaction()                            │  │    │
│  │  │  • useSuiClient()                                             │  │    │
│  │  └──────────────────────────────────────────────────────────────┘  │    │
│  │                                                                      │    │
│  │  ┌──────────────────────────────────────────────────────────────┐  │    │
│  │  │  @tanstack/react-query                                        │  │    │
│  │  │                                                                │  │    │
│  │  │  • QueryClient                                                │  │    │
│  │  │  • useQuery() for reads                                       │  │    │
│  │  │  • useMutation() for writes                                   │  │    │
│  │  │  • Cache management                                           │  │    │
│  │  └──────────────────────────────────────────────────────────────┘  │    │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Smart Contract Container - Component Breakdown

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Smart Contract Package (Move)                            │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                     board.move Module                               │    │
│  │                                                                      │    │
│  │  Structs:                                                           │    │
│  │  ┌──────────────────────────────────────────────────────────┐     │    │
│  │  │  Board                                                    │     │    │
│  │  │  • id: UID                                                │     │    │
│  │  │  • name: String                                           │     │    │
│  │  │  • description: String                                    │     │    │
│  │  │  • owner: address                                         │     │    │
│  │  │  • members: Table<address, u8>  // address -> role       │     │    │
│  │  │  • created_at: u64 (Clock)                                │     │    │
│  │  └──────────────────────────────────────────────────────────┘     │    │
│  │                                                                      │    │
│  │  Functions:                                                         │    │
│  │  • create(name, description) → Board                                │    │
│  │  • add_member(board, member, role, AdminCap)                        │    │
│  │  • remove_member(board, member, AdminCap)                           │    │
│  │  • update_info(board, name, desc, AdminCap)                         │    │
│  │  • get_member_role(board, member) → u8                              │    │
│  │  • is_member(board, address) → bool                                 │    │
│  │                                                                      │    │
│  │  Events:                                                            │    │
│  │  • BoardCreated { board_id, owner, name }                           │    │
│  │  • MemberAdded { board_id, member, role }                           │    │
│  │  • MemberRemoved { board_id, member }                               │    │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                     task.move Module                                │    │
│  │                                                                      │    │
│  │  Structs:                                                           │    │
│  │  ┌──────────────────────────────────────────────────────────┐     │    │
│  │  │  Task                                                     │     │    │
│  │  │  • id: UID                                                │     │    │
│  │  │  • board_id: ID                                           │     │    │
│  │  │  • title: String                                          │     │    │
│  │  │  • description: String                                    │     │    │
│  │  │  • assignee: address                                      │     │    │
│  │  │  • status: u8                                             │     │    │
│  │  │  • due_date: u64                                          │     │    │
│  │  │  • effort_hours: u64                                      │     │    │
│  │  │  • created_at: u64                                        │     │    │
│  │  │  • updated_at: u64                                        │     │    │
│  │  └──────────────────────────────────────────────────────────┘     │    │
│  │                                                                      │    │
│  │  Functions:                                                         │    │
│  │  • create(board_id, title, desc, assignee, due, effort, Cap)       │    │
│  │  • update_status(task, new_status, Cap)                             │    │
│  │  • update_assignee(task, new_assignee, Cap)                         │    │
│  │  • update_details(task, title, desc, due, effort, Cap)              │    │
│  │  • delete(task, AdminCap)                                           │    │
│  │                                                                      │    │
│  │  Events:                                                            │    │
│  │  • TaskCreated { task_id, board_id, title, assignee }              │    │
│  │  • TaskUpdated { task_id, field, old_value, new_value }            │    │
│  │  • TaskDeleted { task_id, board_id }                                │    │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                     access.move Module                              │    │
│  │                                                                      │    │
│  │  Structs:                                                           │    │
│  │  ┌──────────────────────────────────────────────────────────┐     │    │
│  │  │  AdminCap                                                 │     │    │
│  │  │  • id: UID                                                │     │    │
│  │  │  • board_id: ID                                           │     │    │
│  │  └──────────────────────────────────────────────────────────┘     │    │
│  │                                                                      │    │
│  │  ┌──────────────────────────────────────────────────────────┐     │    │
│  │  │  ContributorCap                                           │     │    │
│  │  │  • id: UID                                                │     │    │
│  │  │  • board_id: ID                                           │     │    │
│  │  └──────────────────────────────────────────────────────────┘     │    │
│  │                                                                      │    │
│  │  Functions:                                                         │    │
│  │  • grant_admin_cap(board_id, recipient, AdminCap)                   │    │
│  │  • grant_contributor_cap(board_id, recipient, AdminCap)             │    │
│  │  • revoke_capability(cap) → Revokes by deleting                    │    │
│  │  • verify_admin(cap, board_id) → bool                               │    │
│  │  • verify_contributor(cap, board_id) → bool                         │    │
│  │  • verify_any_permission(address, board_id) → bool                  │    │
│  │                                                                      │    │
│  │  Constants:                                                         │    │
│  │  • ROLE_ADMIN: u8 = 1                                               │    │
│  │  • ROLE_CONTRIBUTOR: u8 = 2                                         │    │
│  │  • ROLE_VIEWER: u8 = 3                                              │    │
│  │                                                                      │    │
│  │  Events:                                                            │    │
│  │  • CapabilityGranted { board_id, recipient, role }                  │    │
│  │  • CapabilityRevoked { board_id, holder }                           │    │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                  analytics.move Module (Bonus)                      │    │
│  │                                                                      │    │
│  │  Structs:                                                           │    │
│  │  ┌──────────────────────────────────────────────────────────┐     │    │
│  │  │  BoardStats                                               │     │    │
│  │  │  • board_id: ID                                           │     │    │
│  │  │  • total_tasks: u64                                       │     │    │
│  │  │  • tasks_by_status: Table<u8, u64>                        │     │    │
│  │  │  • tasks_by_assignee: Table<address, u64>                 │     │    │
│  │  │  • overdue_count: u64                                     │     │    │
│  │  └──────────────────────────────────────────────────────────┘     │    │
│  │                                                                      │    │
│  │  Functions:                                                         │    │
│  │  • init_stats(board_id) → BoardStats                                │    │
│  │  • increment_task_count(stats, status)                              │    │
│  │  • update_assignee_count(stats, assignee, delta)                    │    │
│  │  • recalculate_overdue(stats, clock, tasks)                         │    │
│  │  • get_stats(board_id) → BoardStats                                 │    │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Key Component Interactions

### 1. Board Creation Flow (Detailed)

```
User (Browser)
    │
    ▼
BoardForm Component
    │ validates input
    ▼
useCreateBoard Hook
    │ calls
    ▼
TransactionBuilder
    │ builds PTB
    │ tx.moveCall({
    │   target: "board::create",
    │   arguments: [name, desc]
    │ })
    ▼
useSignAndExecuteTransaction
    │ requests signature
    ▼
Wallet
    │ user approves
    │ signs transaction
    ▼
SuiClientWrapper
    │ submits to RPC
    ▼
Sui Network
    │ executes
    ▼
board::create function
    │ creates Board struct
    │ emits BoardCreated event
    │ transfers to sender
    ▼
On-chain State
    │ Board object stored
    ▼
TanStack Query
    │ invalidates cache
    │ refetches boards
    ▼
BoardList Component
    │ displays new board
    ▼
User sees update
```

### 2. Task Update with Permission Check

```
User clicks "Update Status"
    │
    ▼
TaskForm Component
    │ new status selected
    ▼
useUpdateTask Hook
    │ checks permission
    ▼
CapabilityManager
    │ queries user's ContributorCap
    │ for this board_id
    ▼
if (hasCap) {
    TransactionBuilder
        │ builds PTB
        │ tx.moveCall({
        │   target: "task::update_status",
        │   arguments: [
        │     task_id,
        │     capability_id,  // Include cap!
        │     new_status
        │   ]
        │ })
        ▼
    Submit transaction
        ▼
    task::update_status function
        │ verify_contributor(cap, task.board_id)
        │ if valid:
        │   task.status = new_status
        │   emit TaskUpdated event
        ▼
    Success
} else {
    Show error: "No permission"
}
```

### 3. Member Management with Capability Grant

```
Admin adds new member
    │
    ▼
MemberManager Component
    │ inputs: address, role
    ▼
useAddMember Hook
    │ verifies admin permission
    ▼
TransactionBuilder (Batch)
    │ 1. board::add_member(board, member, role, AdminCap)
    │ 2. access::grant_contributor_cap(board_id, member)
    ▼
Submit batch transaction
    ▼
board::add_member
    │ verifies AdminCap
    │ adds to members table
    │ emits MemberAdded event
    ▼
access::grant_contributor_cap
    │ creates ContributorCap object
    │ transfers to new member
    │ emits CapabilityGranted event
    ▼
On-chain state updated
    │ - Board.members includes new member
    │ - Member owns ContributorCap
    ▼
Frontend refetches
    │ shows updated member list
    ▼
New member can now create/update tasks
```

## Component Dependencies

### Frontend Component Dependency Graph

```
App (Root)
  ├─ Providers
  │   ├─ QueryClientProvider
  │   ├─ SuiClientProvider
  │   └─ WalletProvider
  │
  ├─ Layout
  │   ├─ Navigation
  │   └─ WalletStatus
  │
  └─ Pages
      ├─ Home
      │   └─ Landing content
      │
      ├─ Boards
      │   ├─ useBoards hook
      │   ├─ BoardList
      │   │   ├─ BoardCard (multiple)
      │   │   └─ CreateBoardButton
      │   │       └─ BoardForm dialog
      │   │           └─ useCreateBoard
      │
      └─ Board Detail
          ├─ useBoard(id) hook
          ├─ useTasks(boardId) hook
          ├─ BoardHeader
          │   └─ MemberManager
          │       ├─ useAddMember
          │       └─ useRemoveMember
          │
          └─ TaskList
              ├─ TaskItem (multiple)
              │   ├─ useUpdateTask
              │   └─ TaskForm dialog
              │       └─ useCreateTask
              │
              └─ CreateTaskButton
                  └─ TaskForm dialog
```

### Smart Contract Module Dependencies

```
board.move
  ├─ sui::object
  ├─ sui::table
  ├─ sui::tx_context
  └─ std::string

task.move
  ├─ sui::object
  ├─ sui::tx_context
  ├─ std::string
  └─ moveit::access (for permission checks)

access.move
  ├─ sui::object
  ├─ sui::tx_context
  └─ sui::transfer

analytics.move (bonus)
  ├─ sui::object
  ├─ sui::table
  ├─ sui::clock
  ├─ moveit::board
  └─ moveit::task
```

## Component Interfaces (APIs)

### Frontend Hook Interfaces

```typescript
// useBoards.ts
interface UseBoardsResult {
  boards: Board[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useBoards(address?: string): UseBoardsResult;

// useCreateBoard.ts
interface CreateBoardInput {
  name: string;
  description: string;
}

export function useCreateBoard() {
  return useMutation({
    mutationFn: async (input: CreateBoardInput) => {...},
    onSuccess: () => {...}
  });
}

// useUpdateTask.ts
interface UpdateTaskInput {
  taskId: string;
  updates: {
    status?: number;
    assignee?: string;
    title?: string;
    description?: string;
  };
}

export function useUpdateTask() {
  return useMutation({
    mutationFn: async (input: UpdateTaskInput) => {...}
  });
}
```

### Smart Contract Public Interfaces

```move
// board.move public API
module moveit::board {
    // Create a new board (returns owned Board)
    public entry fun create(
        name: String,
        description: String,
        ctx: &mut TxContext
    );

    // Add member (requires AdminCap)
    public entry fun add_member(
        board: &mut Board,
        member: address,
        role: u8,
        admin_cap: &AdminCap,
        ctx: &mut TxContext
    );

    // Get member role (read-only)
    public fun get_member_role(
        board: &Board,
        member: address
    ): Option<u8>;
}

// task.move public API
module moveit::task {
    // Create task (requires ContributorCap or AdminCap)
    public entry fun create(
        board_id: ID,
        title: String,
        description: String,
        assignee: address,
        due_date: u64,
        effort_hours: u64,
        cap: &ContributorCap,
        ctx: &mut TxContext
    );

    // Update task status
    public entry fun update_status(
        task: &mut Task,
        new_status: u8,
        cap: &ContributorCap,
        ctx: &mut TxContext
    );

    // Read-only accessors
    public fun get_board_id(task: &Task): ID;
    public fun get_status(task: &Task): u8;
}

// access.move public API
module moveit::access {
    // Grant admin capability
    public entry fun grant_admin_cap(
        board_id: ID,
        recipient: address,
        admin_cap: &AdminCap,
        ctx: &mut TxContext
    );

    // Verify permission (used by other modules)
    public fun verify_contributor(
        cap: &ContributorCap,
        board_id: ID
    ): bool;
}
```

## Data Flow Between Components

### Read Flow (Query Boards)

```
1. User navigates to /boards
2. Page component calls useBoards(address)
3. useBoards uses TanStack Query:
   - Check cache first
   - If stale, query Sui
4. ObjectQueryService.getOwnedObjects({
     owner: address,
     filter: { StructType: "Board" }
   })
5. SuiClientWrapper.client.getOwnedObjects()
6. RPC returns board objects
7. Parse and normalize data
8. TanStack Query caches result
9. Component receives boards array
10. BoardList renders board cards
```

### Write Flow (Create Task)

```
1. User fills task form
2. Form calls useCreateTask.mutate(data)
3. CapabilityManager checks for ContributorCap
4. If no cap → error
5. If has cap → TransactionBuilder creates PTB:
   - Add move_call for task::create
   - Include capability object
   - Set gas budget
6. Request wallet signature
7. User approves in wallet
8. Submit signed tx to Sui
9. Validators execute task::create
10. New Task object created on-chain
11. TaskCreated event emitted
12. Transaction confirmed
13. useCreateTask.onSuccess:
    - Invalidate tasks query cache
    - Show success message
14. useTasks refetches
15. New task appears in list
```

## Error Handling Components

### Frontend Error Boundaries

```typescript
// Error types
enum ErrorType {
  WALLET_NOT_CONNECTED = "WALLET_NOT_CONNECTED",
  INSUFFICIENT_GAS = "INSUFFICIENT_GAS",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  TRANSACTION_FAILED = "TRANSACTION_FAILED",
  NETWORK_ERROR = "NETWORK_ERROR",
}

// Error handler component
class ErrorHandler {
  handle(error: Error): UserMessage {
    if (error.message.includes("Insufficient gas")) {
      return {
        title: "Insufficient Gas",
        message: "Please add SUI tokens to your wallet",
        action: "Get Testnet Tokens"
      };
    }
    // ... more cases
  }
}
```

### Smart Contract Error Codes

```move
module moveit::board {
    const ENotOwner: u64 = 1;
    const EMemberNotFound: u64 = 2;
    const EMemberAlreadyExists: u64 = 3;
    const EInvalidRole: u64 = 4;
}

module moveit::task {
    const EInvalidStatus: u64 = 100;
    const ENotAuthorized: u64 = 101;
    const ETaskNotFound: u64 = 102;
}

module moveit::access {
    const EInvalidCapability: u64 = 200;
    const EBoardMismatch: u64 = 201;
}
```

## Performance Optimization Components

### Frontend Optimizations

```typescript
// Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Optimistic updates
const updateTask = useMutation({
  mutationFn: updateTaskOnChain,
  onMutate: async (newTask) => {
    // Optimistically update UI
    await queryClient.cancelQueries(['tasks', boardId]);
    const previous = queryClient.getQueryData(['tasks', boardId]);
    queryClient.setQueryData(['tasks', boardId], old => ({
      ...old,
      ...newTask
    }));
    return { previous };
  },
  onError: (err, newTask, context) => {
    // Rollback on error
    queryClient.setQueryData(['tasks', boardId], context.previous);
  },
});
```

### Smart Contract Optimizations

```move
// Use Table instead of vector for large collections
use sui::table::{Self, Table};

struct Board has key {
    members: Table<address, u8>,  // O(1) lookup
    // NOT: members: vector<Member>  // O(n) lookup
}

// Emit events for indexing
event::emit(TaskCreated {
    task_id: object::id(&task),
    board_id,
    title,
    timestamp: clock::timestamp_ms(clock)
});
```

---

**Component Summary**: The frontend is organized in layers (presentation, business logic, data access, integration) with clear separation of concerns. Smart contracts are modular with explicit dependencies and public interfaces. Each component has a single responsibility and communicates through well-defined APIs.
