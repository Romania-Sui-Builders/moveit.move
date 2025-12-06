# MoveIt Contract Integration - Fixed

## Issues Found and Fixed

### 1. ❌ Wrong Module Name in `useCreateBoard.ts`
**Problem**: Used `::board::create` instead of `::moveit::create_board`

**Fixed**: Changed to correct module and function name
```typescript
// ❌ BEFORE
target: `${PACKAGE_ID}::board::create`

// ✅ AFTER
target: `${PACKAGE_ID}::moveit::create_board`
```

### 2. ❌ Missing Required Parameters in `useCreateBoard.ts`
**Problem**: Missing AdminCap and initial_statuses parameters

**Fixed**: Added all required parameters
```typescript
tx.moveCall({
  target: `${PACKAGE_ID}::moveit::create_board`,
  arguments: [
    tx.object(ADMIN_CAP_ID),           // AdminCap (NEW)
    tx.pure.string(name),
    tx.pure.string(description),
    tx.pure.vector('string', statuses), // initial_statuses (NEW)
    tx.object(CLOCK_ID),
  ],
});
```

### 3. ❌ Wrong Module Name in `useTasks.ts`
**Problem**: Used `::task::create` instead of `::moveit::create_task`

**Fixed**: Changed to correct module and function name
```typescript
// ❌ BEFORE
target: `${PACKAGE_ID}::task::create`

// ✅ AFTER
target: `${PACKAGE_ID}::moveit::create_task`
```

### 4. ❌ Missing ContributorCap Parameter
**Problem**: All task operations require a ContributorCap but it wasn't included

**Fixed**: Added contributorCapId parameter
```typescript
interface CreateTaskData {
  contributorCapId: string;  // NEW - Required!
  title: string;
  description: string;
  assignee?: string;
  dueDate: number;
  effortHours: number;
}
```

## Contract Structure (Correct)

### Module Name
```move
module moveit::moveit;
```

### Key Functions

#### Admin Functions (Require AdminCap)
```move
public fun create_board(
    _: &AdminCap,
    name: String,
    description: String,
    initial_statuses: vector<String>,
    clock: &Clock,
    ctx: &mut TxContext,
): ID

public fun add_contributor(
    _: &AdminCap,
    board: &Board,
    contributor: address,
    ctx: &mut TxContext,
)

public fun add_status(
    _: &AdminCap,
    board: &mut Board,
    status: String,
    ctx: &TxContext,
)
```

#### Contributor Functions (Require ContributorCap)
```move
public fun create_task(
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

public fun update_task_status(
    cap: &ContributorCap,
    board: &mut Board,
    task_id: u64,
    new_status: String,
    clock: &Clock,
    ctx: &TxContext,
)

public fun assign_task(
    cap: &ContributorCap,
    board: &mut Board,
    task_id: u64,
    assignees: vector<address>,
    clock: &Clock,
    ctx: &TxContext,
)
```

## Correct Integration Pattern

### 1. Admin Creates a Board
```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::moveit::create_board`,
  arguments: [
    tx.object(ADMIN_CAP_ID),                    // Your AdminCap
    tx.pure.string('My Board'),                 // name
    tx.pure.string('Board description'),        // description
    tx.pure.vector('string', ['To Do', 'Done']),// initial_statuses
    tx.object(CLOCK_ID),                        // Sui Clock (0x6)
  ],
});
```

### 2. Admin Adds a Contributor
```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::moveit::add_contributor`,
  arguments: [
    tx.object(ADMIN_CAP_ID),           // Your AdminCap
    tx.object(boardId),                // Board object ID
    tx.pure.address(contributorAddr),  // Address to add
  ],
});
```

### 3. Contributor Creates a Task
```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::moveit::create_task`,
  arguments: [
    tx.object(contributorCapId),       // ContributorCap received from admin
    tx.object(boardId),                // Board object ID
    tx.pure.string('Task title'),
    tx.pure.string('Task description'),
    tx.pure.u64(dueDate),              // Timestamp in ms
    tx.pure.u64(effort),               // Effort in hours or story points
    tx.pure.vector('address', assignees), // Array of addresses
    tx.object(CLOCK_ID),
  ],
});
```

### 4. Contributor Updates Task Status
```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::moveit::update_task_status`,
  arguments: [
    tx.object(contributorCapId),
    tx.object(boardId),
    tx.pure.u64(taskId),               // Task ID (not object ID!)
    tx.pure.string('In Progress'),     // New status
    tx.object(CLOCK_ID),
  ],
});
```

## Important Notes

### 1. AdminCap vs ContributorCap
- **AdminCap**: Created once when contract is deployed. Only admin has this.
  - Can create boards
  - Can add/remove statuses
  - Can add contributors
  
- **ContributorCap**: Created by admin for each contributor on each board.
  - Can create tasks
  - Can update tasks
  - Can change task status
  - Can assign tasks

### 2. Task IDs vs Object IDs
- Tasks are **stored inside the Board object** (in a Table)
- Tasks have a **task_id** (u64) which is different from a Sui object ID
- When calling task functions, use the **task_id** number, not an object ID

### 3. Board is a Shared Object
- Boards are shared objects that multiple accounts can interact with
- Use `tx.object(boardId)` to reference them in transactions
- No need to own the board object

### 4. Clock Object
- Always use `0x6` for the Clock object ID
- This is a standard Sui system object
- Already configured in constants: `CLOCK_ID = '0x6'`

## Setup Checklist

- [x] Fixed module name from `board` to `moveit`
- [x] Fixed function names to match contract
- [x] Added AdminCap parameter to admin functions
- [x] Added ContributorCap parameter to contributor functions
- [x] Added initial_statuses parameter to create_board
- [x] Updated TypeScript interfaces to match contract
- [ ] Get your AdminCap ID and add to .env
- [ ] Test creating a board
- [ ] Test adding a contributor
- [ ] Test creating a task with ContributorCap

## Next Steps

1. **Find Your AdminCap ID**
   ```bash
   # List your owned objects
   sui client objects --json
   
   # Look for an object with type ending in "::moveit::AdminCap"
   ```

2. **Update .env**
   ```env
   NEXT_PUBLIC_ADMIN_CAP_ID=0xYOUR_ADMIN_CAP_ID
   ```

3. **Test the Integration**
   - Create a board (will receive Board ID)
   - Add yourself as a contributor (will receive ContributorCap)
   - Create a task using the ContributorCap

## Error Messages Explained

| Error | Meaning | Solution |
|-------|---------|----------|
| "No module found with module name board" | Using wrong module name | Use `moveit` not `board` |
| "Function not found" | Wrong function name or parameters | Check contract source code |
| "Invalid board ID" | ContributorCap doesn't match Board | Use correct ContributorCap for the Board |
| "Task not found" | Task ID doesn't exist in Board | Use valid task_id from board |
| "Invalid status" | Status string not in board's status list | Use a status that exists in board.statuses |

## Files Updated

1. ✅ `hooks/useCreateBoard.ts` - Fixed module name and added parameters
2. ✅ `hooks/useTasks.ts` - Fixed module name and added ContributorCap
3. ✅ `components/providers.tsx` - Fixed network from devnet to testnet
4. ✅ `services/moveit.service.ts` - Already correct
5. ✅ `core/constants.ts` - Already correct with MODULE_TARGETS

## Working Files (Already Correct)

- `services/moveit.service.ts` - Service layer is perfect ✅
- `hooks/useMoveItContract.ts` - Uses the correct service ✅
- `core/constants.ts` - All module targets are correct ✅

## Recommended Usage

Use the service layer for best type safety:

```typescript
import { useCreateBoard } from '@/hooks/useMoveItContract';

const { mutate: createBoard } = useCreateBoard();

createBoard({
  name: 'My Board',
  description: 'Board description',
  initialStatuses: ['To Do', 'In Progress', 'Done'],
});
```

This ensures type safety and correct parameter passing!
