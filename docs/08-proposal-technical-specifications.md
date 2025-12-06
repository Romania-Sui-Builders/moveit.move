# Proposal - Technical Specifications

## Smart Contract Specifications

### Data Types & Structures

#### Board Module (`moveit::board`)

```move
module moveit::board {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::table::{Self, Table};
    use sui::transfer;
    use sui::clock::{Self, Clock};
    use std::string::String;

    /// Board represents a workspace
    struct Board has key {
        id: UID,
        name: String,                  // Max 100 chars
        description: String,            // Max 500 chars
        owner: address,                 // Creator address
        members: Table<address, u8>,    // address → role mapping
        created_at: u64,                // Timestamp from Clock
    }

    /// Role constants
    const ROLE_ADMIN: u8 = 1;          // Can manage members, delete board
    const ROLE_CONTRIBUTOR: u8 = 2;    // Can create/update tasks
    const ROLE_VIEWER: u8 = 3;         // Can view only (future)

    /// Error codes
    const ENotOwner: u64 = 1;
    const EMemberNotFound: u64 = 2;
    const EMemberAlreadyExists: u64 = 3;
    const EInvalidRole: u64 = 4;
    const ENameTooLong: u64 = 5;

    /// Events
    struct BoardCreated has copy, drop {
        board_id: ID,
        owner: address,
        name: String,
        timestamp: u64,
    }

    struct MemberAdded has copy, drop {
        board_id: ID,
        member: address,
        role: u8,
        timestamp: u64,
    }

    struct MemberRemoved has copy, drop {
        board_id: ID,
        member: address,
        timestamp: u64,
    }
}
```

**Function Specifications**:

```move
/// Create a new board
/// Returns: Owned Board object
/// Emits: BoardCreated event
/// Gas estimate: ~0.001 SUI
public entry fun create(
    name: String,
    description: String,
    clock: &Clock,
    ctx: &mut TxContext
);

/// Add member to board
/// Requires: Caller owns AdminCap for this board OR is board owner
/// Emits: MemberAdded event
/// Gas estimate: ~0.0005 SUI
public entry fun add_member(
    board: &mut Board,
    member: address,
    role: u8,
    admin_cap: &AdminCap,
    ctx: &mut TxContext
);

/// Remove member from board
/// Requires: Caller owns AdminCap
/// Emits: MemberRemoved event
/// Note: Does NOT revoke capabilities (separate action)
public entry fun remove_member(
    board: &mut Board,
    member: address,
    admin_cap: &AdminCap,
    ctx: &mut TxContext
);

/// Get member role (read-only)
/// Returns: Option<u8> - role if member exists
public fun get_member_role(
    board: &Board,
    member: address
): Option<u8>;

/// Check if address is a member (read-only)
public fun is_member(
    board: &Board,
    member: address
): bool;
```

---

#### Task Module (`moveit::task`)

```move
module moveit::task {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::clock::{Self, Clock};
    use std::string::String;
    use moveit::access::{Self, ContributorCap, AdminCap};

    /// Task represents a work item
    struct Task has key, store {
        id: UID,
        board_id: ID,                   // Parent board
        title: String,                  // Max 200 chars
        description: String,            // Max 2000 chars
        assignee: address,              // Who is responsible
        status: u8,                     // Current status
        due_date: u64,                  // Unix timestamp (ms)
        effort_hours: u64,              // Estimated effort
        created_at: u64,                // Creation timestamp
        updated_at: u64,                // Last update timestamp
        created_by: address,            // Task creator
    }

    /// Status constants
    const STATUS_TODO: u8 = 0;
    const STATUS_IN_PROGRESS: u8 = 1;
    const STATUS_DONE: u8 = 2;
    const STATUS_BLOCKED: u8 = 3;       // Bonus

    /// Error codes
    const EInvalidStatus: u64 = 100;
    const ENotAuthorized: u64 = 101;
    const ETaskNotFound: u64 = 102;
    const ETitleTooLong: u64 = 103;
    const EInvalidDueDate: u64 = 104;

    /// Events
    struct TaskCreated has copy, drop {
        task_id: ID,
        board_id: ID,
        title: String,
        assignee: address,
        timestamp: u64,
    }

    struct TaskUpdated has copy, drop {
        task_id: ID,
        field: String,              // "status", "assignee", etc.
        timestamp: u64,
    }

    struct TaskDeleted has copy, drop {
        task_id: ID,
        board_id: ID,
        timestamp: u64,
    }
}
```

**Function Specifications**:

```move
/// Create a new task
/// Requires: ContributorCap or AdminCap for the board
/// Returns: Task object (owned by creator initially)
/// Emits: TaskCreated event
/// Gas estimate: ~0.001 SUI
public entry fun create(
    board_id: ID,
    title: String,
    description: String,
    assignee: address,
    due_date: u64,
    effort_hours: u64,
    cap: &ContributorCap,
    clock: &Clock,
    ctx: &mut TxContext
);

/// Update task status
/// Requires: ContributorCap or AdminCap for the board
/// Emits: TaskUpdated event
/// Gas estimate: ~0.0003 SUI
public entry fun update_status(
    task: &mut Task,
    new_status: u8,
    cap: &ContributorCap,
    clock: &Clock,
    ctx: &mut TxContext
);

/// Update task assignee
/// Requires: ContributorCap or AdminCap
/// Emits: TaskUpdated event
public entry fun update_assignee(
    task: &mut Task,
    new_assignee: address,
    cap: &ContributorCap,
    clock: &Clock,
    ctx: &mut TxContext
);

/// Update task details (title, description, due_date, effort)
/// Requires: ContributorCap or AdminCap
/// Emits: TaskUpdated event
public entry fun update_details(
    task: &mut Task,
    title: String,
    description: String,
    due_date: u64,
    effort_hours: u64,
    cap: &ContributorCap,
    clock: &Clock,
    ctx: &mut TxContext
);

/// Delete a task
/// Requires: AdminCap for the board
/// Emits: TaskDeleted event
/// Note: Destroys task object
public entry fun delete(
    task: Task,
    cap: &AdminCap,
    ctx: &mut TxContext
);

/// Read-only getters
public fun get_board_id(task: &Task): ID;
public fun get_status(task: &Task): u8;
public fun get_title(task: &Task): &String;
public fun get_assignee(task: &Task): address;
public fun get_due_date(task: &Task): u64;
```

---

#### Access Control Module (`moveit::access`)

```move
module moveit::access {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;

    /// Admin capability for a specific board
    struct AdminCap has key, store {
        id: UID,
        board_id: ID,
    }

    /// Contributor capability for a specific board
    struct ContributorCap has key, store {
        id: UID,
        board_id: ID,
    }

    /// Error codes
    const EInvalidCapability: u64 = 200;
    const EBoardMismatch: u64 = 201;
    const ENotAuthorized: u64 = 202;

    /// Events
    struct CapabilityGranted has copy, drop {
        board_id: ID,
        recipient: address,
        cap_type: String,           // "admin" or "contributor"
        timestamp: u64,
    }

    struct CapabilityRevoked has copy, drop {
        board_id: ID,
        holder: address,
        cap_type: String,
        timestamp: u64,
    }
}
```

**Function Specifications**:

```move
/// Grant admin capability for a board
/// Requires: Existing AdminCap for the board (chain of trust)
/// Returns: Transfers AdminCap to recipient
/// Emits: CapabilityGranted event
public entry fun grant_admin_cap(
    board_id: ID,
    recipient: address,
    admin_cap: &AdminCap,
    ctx: &mut TxContext
);

/// Grant contributor capability
/// Requires: AdminCap for the board
/// Returns: Transfers ContributorCap to recipient
/// Emits: CapabilityGranted event
public entry fun grant_contributor_cap(
    board_id: ID,
    recipient: address,
    admin_cap: &AdminCap,
    ctx: &mut TxContext
);

/// Revoke capability (user returns it)
/// Note: In MVP, user must voluntarily return cap
/// Future: Admin can force revoke with special permission
public entry fun revoke_admin_cap(
    cap: AdminCap
);

public entry fun revoke_contributor_cap(
    cap: ContributorCap
);

/// Verify admin permission
/// Returns: true if cap is valid for board_id
public fun verify_admin(
    cap: &AdminCap,
    board_id: ID
): bool;

/// Verify contributor permission
public fun verify_contributor(
    cap: &ContributorCap,
    board_id: ID
): bool;

/// Verify any permission (admin or contributor)
/// Used for operations that allow either role
public fun verify_any_permission(
    board_id: ID,
    admin_cap_opt: Option<&AdminCap>,
    contrib_cap_opt: Option<&ContributorCap>
): bool;
```

---

### Object Ownership Model

```
User (EOA)
  │
  ├─ owns → Board #1
  ├─ owns → Board #2
  ├─ owns → AdminCap (for Board #3)
  ├─ owns → ContributorCap (for Board #4)
  ├─ owns → Task #1 (assigned to them)
  └─ owns → Task #2 (assigned to them)

Board Object
  │
  ├─ contains → Table<address, u8> (members)
  └─ reference → Multiple tasks have this board_id

Task Object
  │
  └─ references → Board via board_id field
```

**Design Decision: Tasks as Owned Objects (MVP)**

```
Pros:
+ Simple to implement
+ Easy to query (getOwnedObjects by assignee)
+ Parallel updates (different users, different tasks)
+ Natural fit for task assignment

Cons:
- Need to track board_id separately
- Querying "all tasks for board" requires filtering
- Task transfer on reassignment

Alternative (Post-MVP): Dynamic Fields
- Store tasks as dynamic fields on Board
- Better for querying by board
- More complex implementation
```

---

## Frontend Specifications

### Technology Stack

```json
{
  "framework": "Next.js 16",
  "language": "TypeScript 5.x",
  "ui": "Radix UI + Tailwind CSS 4",
  "blockchain": "@mysten/dapp-kit 0.19.x",
  "queries": "@tanstack/react-query 5.x",
  "styling": "Tailwind CSS + CSS Modules"
}
```

### API Interfaces

#### Custom Hooks

```typescript
// hooks/useBoards.ts
export function useBoards(address?: string) {
  return useQuery({
    queryKey: ['boards', address],
    queryFn: async () => {
      if (!address) return [];
      const { data } = await suiClient.getOwnedObjects({
        owner: address,
        filter: {
          StructType: `${PACKAGE_ID}::board::Board`
        },
        options: {
          showContent: true,
          showOwner: true,
        }
      });
      return data.map(parseBoard);
    },
    enabled: !!address,
  });
}

// hooks/useCreateBoard.ts
export function useCreateBoard() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  
  return useMutation({
    mutationFn: async (input: CreateBoardInput) => {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::board::create`,
        arguments: [
          tx.pure.string(input.name),
          tx.pure.string(input.description),
          tx.object(CLOCK_ID),
        ],
      });
      return signAndExecute({ transaction: tx });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['boards']);
    }
  });
}

// hooks/useTasks.ts
export function useTasks(boardId?: string, address?: string) {
  return useQuery({
    queryKey: ['tasks', boardId, address],
    queryFn: async () => {
      if (!address) return [];
      const { data } = await suiClient.getOwnedObjects({
        owner: address,
        filter: {
          StructType: `${PACKAGE_ID}::task::Task`
        },
        options: { showContent: true }
      });
      
      // Filter by board_id
      return data
        .map(parseTask)
        .filter(task => !boardId || task.boardId === boardId);
    },
    enabled: !!address,
  });
}

// hooks/useCapabilities.ts
export function useCapabilities(address?: string, boardId?: string) {
  return useQuery({
    queryKey: ['capabilities', address, boardId],
    queryFn: async () => {
      if (!address) return { admin: null, contributor: null };
      
      const adminCaps = await suiClient.getOwnedObjects({
        owner: address,
        filter: {
          StructType: `${PACKAGE_ID}::access::AdminCap`
        },
        options: { showContent: true }
      });
      
      const contribCaps = await suiClient.getOwnedObjects({
        owner: address,
        filter: {
          StructType: `${PACKAGE_ID}::access::ContributorCap`
        },
        options: { showContent: true }
      });
      
      // Find matching board_id
      const adminCap = adminCaps.data
        .map(parseAdminCap)
        .find(cap => cap.boardId === boardId);
        
      const contributorCap = contribCaps.data
        .map(parseContributorCap)
        .find(cap => cap.boardId === boardId);
      
      return { admin: adminCap, contributor: contributorCap };
    },
    enabled: !!address && !!boardId,
  });
}
```

#### Type Definitions

```typescript
// types/board.ts
export interface Board {
  id: string;
  name: string;
  description: string;
  owner: string;
  createdAt: number;
  memberCount: number; // Computed from Table
}

// types/task.ts
export interface Task {
  id: string;
  boardId: string;
  title: string;
  description: string;
  assignee: string;
  status: TaskStatus;
  dueDate: number;
  effortHours: number;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export enum TaskStatus {
  TODO = 0,
  IN_PROGRESS = 1,
  DONE = 2,
  BLOCKED = 3,
}

// types/capability.ts
export interface AdminCapability {
  id: string;
  boardId: string;
}

export interface ContributorCapability {
  id: string;
  boardId: string;
}

export interface Permission {
  canCreateTasks: boolean;
  canUpdateTasks: boolean;
  canDeleteTasks: boolean;
  canManageMembers: boolean;
}
```

### Component Specifications

```typescript
// components/BoardCard.tsx
interface BoardCardProps {
  board: Board;
  onClick?: () => void;
}

// components/TaskList.tsx
interface TaskListProps {
  boardId: string;
  filters?: {
    status?: TaskStatus;
    assignee?: string;
  };
  onTaskClick?: (task: Task) => void;
}

// components/MemberManager.tsx
interface MemberManagerProps {
  boardId: string;
  isAdmin: boolean;
}
```

---

## Network Configuration

### Devnet (Development)
```typescript
export const DEVNET_CONFIG = {
  networkUrl: 'https://fullnode.devnet.sui.io',
  faucetUrl: 'https://faucet.devnet.sui.io/gas',
  explorerUrl: 'https://suiexplorer.com/?network=devnet',
};
```

### Testnet (Demo)
```typescript
export const TESTNET_CONFIG = {
  networkUrl: 'https://fullnode.testnet.sui.io',
  faucetUrl: 'https://faucet.testnet.sui.io/gas',
  explorerUrl: 'https://suiexplorer.com/?network=testnet',
};
```

---

## Gas Cost Estimates

| Operation | Estimated Gas (SUI) | USD Equivalent |
|-----------|---------------------|----------------|
| Create Board | 0.001 | $0.001 |
| Add Member | 0.0005 | $0.0005 |
| Grant Capability | 0.0005 | $0.0005 |
| Create Task | 0.001 | $0.001 |
| Update Task Status | 0.0003 | $0.0003 |
| Update Task Details | 0.0005 | $0.0005 |
| Delete Task | 0.0003 | $0.0003 |

**Typical User Session Cost**:
- Create 1 board: 0.001 SUI
- Add 3 members: 0.0015 SUI
- Create 5 tasks: 0.005 SUI
- Update 10 statuses: 0.003 SUI
- **Total: ~0.0105 SUI (~$0.01)**

---

## Testing Specifications

### Unit Tests (Move)

```move
#[test_only]
module moveit::board_tests {
    use moveit::board::{Self, Board};
    use moveit::access;
    use sui::test_scenario;

    #[test]
    fun test_create_board() {
        let user = @0xA;
        let scenario = test_scenario::begin(user);
        
        // Create board
        board::create(
            string::utf8(b"Test Board"),
            string::utf8(b"Description"),
            test_scenario::ctx(&mut scenario)
        );
        
        // Check user owns board
        test_scenario::next_tx(&mut scenario, user);
        assert!(test_scenario::has_most_recent_for_sender<Board>(&scenario));
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_add_member_with_admin_cap() {
        // Test that admin can add members
    }

    #[test]
    #[expected_failure(abort_code = board::ENotOwner)]
    fun test_add_member_without_permission() {
        // Test that non-admin cannot add members
    }
}
```

**Test Coverage Goals**:
- Board module: 80%+
- Task module: 80%+
- Access module: 90%+ (security-critical)
- Overall: 75%+

---

## Security Considerations

### Access Control
- All state-changing functions verify capability ownership
- Capabilities are board-specific (can't use Board A cap on Board B)
- Capabilities are owned objects (can't be faked)

### Input Validation
- String length limits enforced
- Status values validated against constants
- Due dates checked against Clock
- Addresses validated (non-zero)

### Error Handling
- All errors use descriptive codes
- No panics in production paths
- Graceful degradation in frontend

---

## Performance Optimizations

### On-Chain
- Use Table for O(1) member lookups (not vector)
- Emit events for indexing (don't query all objects)
- Keep object sizes minimal (no large strings on-chain)

### Off-Chain
- TanStack Query caching (30s stale time)
- Optimistic updates for better UX
- Pagination for large lists (future)
- Debounced queries (future)

---

## Deployment Checklist

### Smart Contracts
- [ ] Build: `sui move build`
- [ ] Test: `sui move test`
- [ ] Deploy: `sui client publish --gas-budget 100000000`
- [ ] Save package ID
- [ ] Verify on explorer

### Frontend
- [ ] Update `PACKAGE_ID` in config
- [ ] Update `CLOCK_ID` (0x6)
- [ ] Test wallet connection
- [ ] Deploy to Vercel
- [ ] Test on deployed URL

---

**Technical Summary**: The system uses a capability-based access control model with owned objects for boards, tasks, and permissions. Gas costs are optimized through careful data structure choices. The frontend uses modern React patterns with TanStack Query for state management and optimistic updates for UX.
