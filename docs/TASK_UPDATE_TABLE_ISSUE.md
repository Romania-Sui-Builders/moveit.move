# Task Update Issue: Table vs Vector Storage

## Problem

When attempting to update tasks on boards created with the old contract, users encounter the error:
```
Invalid type: Expected Object but received Object
```

## Root Cause

The MoveIt contract has undergone an architecture change:

### Old Architecture (Legacy Boards)
- Tasks stored in **`Table<u64, Task>`** structure
- Tasks accessible via dynamic field queries
- Task Object IDs are from dynamic fields

### New Architecture (Current Boards)
- Tasks are **separate Sui objects**
- Board stores `task_ids: vector<ID>`
- Tasks have their own Object IDs

### The Contract Function
```move
public fun update_task(
    cap: &ContributorCap,
    board: &Board,
    task: &mut Task,  // ❌ Requires mutable reference to Task object
    ...
)
```

**The Problem**: You cannot pass a mutable reference (`&mut Task`) to tasks stored in a Table from outside the contract. The contract would need to use `table::borrow_mut()` internally.

## Solution Implemented

### 1. Detection
Added `tableId` and `tableSize` fields to the Board type:
```typescript
export interface Board {
  // ...existing fields
  tableId?: string // Present if board uses old Table storage
  tableSize?: number
}
```

### 2. UI Prevention
- **Warning Alert**: Shows when viewing tasks on legacy boards
- **Disabled Buttons**: Edit and Delete buttons disabled on Table-based boards
- **Clear Error Message**: Explains the limitation and suggests creating a new board

### 3. Code Changes

**File: `lib/types.ts`**
- Added `tableId` and `tableSize` optional fields to Board interface

**File: `components/task-detail.tsx`**
- Added check for `board.tableId` before attempting updates
- Shows warning alert for legacy boards
- Disables edit/delete buttons with explanatory tooltips
- Provides user-friendly error message

**File: `hooks/useTasks.ts`**
- Enhanced logging for debugging transaction issues

## Workarounds

### Option 1: Create New Boards (Recommended)
Users should create new boards which will use the current architecture with separate Task objects.

### Option 2: Add Contract Function (Future Enhancement)
Add a new contract function to handle Table-based task updates:

```move
public fun update_task_in_table(
    cap: &ContributorCap,
    board: &mut Board,
    task_id: u64,  // u64 index, not Object ID
    title: String,
    description: String,
    due_date: u64,
    effort: u64,
    clock: &Clock,
    ctx: &TxContext,
) {
    use sui::table;
    
    // Borrow mutable reference from table
    let task = table::borrow_mut(&mut board.tasks, task_id);
    
    // Update task fields
    task.title = title;
    task.description = description;
    task.due_date = due_date;
    task.effort = effort;
    task.updated_at = clock.timestamp_ms();
    
    event::emit(TaskUpdated { ... });
}
```

### Option 3: Board Migration (Complex)
Implement a migration function to convert Table-based boards to the new architecture.

## Testing

To test with **new boards** (that support updates):
1. Create a fresh board using the current contract
2. Add contributors
3. Create tasks
4. Update tasks ✅ (should work)

For **legacy boards**:
- Edit/Delete buttons will be disabled
- Warning message displayed
- Users directed to create new boards

## Identification

Legacy boards can be identified by:
- ✅ Presence of `tableId` field in Board object
- ✅ Console logs showing "⚠️ Board uses old Table structure"
- ✅ Warning alert in task detail view

## References

- Contract file: `contract/moveit/sources/moveit.move`
- Board types: `dapp/sui-tasks/lib/types.ts`
- Task detail component: `dapp/sui-tasks/components/task-detail.tsx`
- Blockchain service: `dapp/sui-tasks/services/blockchain.service.ts`
