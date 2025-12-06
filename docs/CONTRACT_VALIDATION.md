# MoveIt Smart Contract Validation & Integration Report

## Executive Summary

After parsing the complete smart contract at `/contract/moveit/sources/moveit.move`, this document validates which features are exposed by the contract and identifies critical integration issues in the dApp.

## Contract Architecture

### Module Name
- **Correct**: `moveit::moveit`
- **Package ID**: `0x24090e76985a9020623d468e9f5b4c2030ea62acf8469da5d9d56f9762d55c8f`

### Core Structs

1. **MOVEIT** - One-time witness for package publishing
2. **AdminCap** - Admin capability (ID: `0x64572da921ef162088a2c9e9539375c264444f3645b4a9968a22b0d5cbb1cb16`)
3. **Board** - Shared objects with:
   - `version: u64` - For migration compatibility
   - `statuses: vector<String>` - Configurable workflow
   - `task_counter: u64` - For generating unique task numbers
   - `task_ids: vector<ID>` - **CRITICAL**: Object IDs of all tasks
4. **Task** - **Shared objects** (not stored in Table) with:
   - `id: UID` - Unique object identifier
   - `board_id: ID` - Reference to parent board
   - `task_number: u64` - Sequential number within board
   - `parent_task_id: Option<ID>` - For subtask hierarchy
   - `subtask_ids: vector<ID>` - List of child tasks
5. **ContributorCap** - Capability for task operations
6. **Comment** - Stored as dynamic fields on Task objects

## 🔴 CRITICAL INTEGRATION ISSUES FOUND

### Issue 1: Task Storage Architecture Mismatch

**Contract Reality:**
```move
// Board stores task Object IDs in a vector
public struct Board has key, store {
    task_ids: vector<ID>,  // Just the IDs!
    // ...
}

// Tasks are separate shared objects
public struct Task has key, store {
    id: UID,  // Each task is its own object!
    // ...
}
```

**dApp Assumption (INCORRECT):**
```typescript
// blockchain.service.ts line 199-227
export async function getTaskFromBoard(boardId: string, taskId: number) {
    // ❌ WRONG: Tries to query dynamic field (Table structure)
    const object = await suiClient.getDynamicFieldObject({
        parentId: boardId,
        name: { type: 'u64', value: taskId.toString() }
    });
}
```

**Impact:** Task fetching from blockchain fallback is completely broken. It tries to query a Table that doesn't exist.

**Fix Required:** Query tasks by their Object IDs (stored in `board.task_ids`), not by dynamic fields.

### Issue 2: Wrong Transaction Arguments in Update Task

**Contract Signature:**
```move
public fun update_task(
    cap: &ContributorCap,
    board: &Board,
    task: &mut Task,  // ← Takes Task OBJECT
    title: String,
    description: String,
    due_date: u64,
    effort: u64,
    clock: &Clock,
    ctx: &TxContext,
)
```

**dApp Code (INCORRECT):**
```typescript
// hooks/useTasks.ts line 110-124
tx.moveCall({
    target: `${PACKAGE_ID}::moveit::update_task`,
    arguments: [
        tx.object(contributorCapId),
        tx.object(boardId),
        tx.pure.u64(parseInt(taskId)),  // ❌ WRONG: Sends task NUMBER, not task OBJECT
        tx.pure.string(updates.title || ''),
        // ...
    ],
});
```

**Impact:** All task updates will fail because the contract expects a Task object reference, not a task number.

**Fix Required:** Pass task Object ID, not task number.

## ✅ PUBLIC FUNCTIONS EXPOSED BY CONTRACT

### Admin Functions (Require AdminCap)

1. **Board Management:**
   - `create_board(AdminCap, name, description, initial_statuses, clock, ctx) -> ID`
   - `update_board(AdminCap, board, name, description)`
   - `add_status(AdminCap, board, status, ctx)`
   - `remove_status(AdminCap, board, status, ctx)`
   - `migrate_board(AdminCap, board, ctx)` - For version upgrades

2. **Contributor Management:**
   - `add_contributor(AdminCap, board, new_contributor, ctx)`

3. **Dynamic Fields (Custom Data):**
   - `add_board_field<T>(AdminCap, board, key, value)`
   - `get_board_field_mut<T>(AdminCap, board, key) -> &mut T`
   - `remove_board_field<T>(AdminCap, board, key) -> T`

### Contributor Functions (Require ContributorCap)

1. **Task Creation & Management:**
   - `create_task(ContributorCap, board, title, description, due_date, effort, assignees, clock, ctx) -> ID`
   - `update_task(ContributorCap, board, task, title, description, due_date, effort, clock, ctx)`
   - `update_task_status(ContributorCap, board, task, new_status, clock, ctx)`
   - `assign_task(ContributorCap, board, task, assignees, clock, ctx)`
   - `create_subtask(ContributorCap, board, parent_task, title, description, due_date, effort, assignees, clock, ctx) -> ID`

2. **Comments:**
   - `add_comment(ContributorCap, task, content, clock, ctx)`

### Public View Functions (No Capabilities Required)

1. **Version Management:**
   - `current_version() -> u64`
   - `get_board_version(board) -> u64`
   - `needs_migration(board) -> bool`

2. **Board Info:**
   - `get_board_info(board) -> (name, description, task_counter, created_at, version)`
   - `get_board_statuses(board) -> vector<String>`
   - `get_board_task_ids(board) -> vector<ID>` ✅ **Use this to get task IDs!**
   - `get_task_count(board) -> u64`
   - `is_valid_status(board, status) -> bool`
   - `has_board_field(board, key) -> bool`
   - `get_board_field<T>(board, key) -> &T`

3. **Task Info:**
   - `get_task_board_id(task) -> ID`
   - `get_task_info(task) -> (title, description, due_date, status, effort, assignees, creator, created_at, updated_at)`
   - `get_task_number(task) -> u64`
   - `get_parent_task_id(task) -> Option<ID>`
   - `get_subtask_ids(task) -> vector<ID>`
   - `is_subtask(task) -> bool`
   - `has_subtasks(task) -> bool`
   - `get_subtask_count(task) -> u64`

4. **Comment Info:**
   - `get_comment(task, comment_number) -> (content, author, created_at)`
   - `get_comment_count(task) -> u64`
   - `has_comments(task) -> bool`

5. **Capability Validation:**
   - `get_contributor_cap_board_id(cap) -> ID`
   - `is_valid_contributor_cap(board, cap) -> bool`

### Public Utility Functions

- `burn_contributor_cap(cap)` - Remove contributor access

## ❌ FEATURES NOT IMPLEMENTED IN CONTRACT

These features do NOT exist in the smart contract:

1. ❌ Task deletion
2. ❌ Board deletion
3. ❌ Comment editing
4. ❌ Comment deletion
5. ❌ Task priority field
6. ❌ Task tags/labels
7. ❌ Board members list (only ContributorCap tracking)
8. ❌ Task dependencies (only parent/child hierarchy)

## 🎯 DAPP INTEGRATION STATUS

### ✅ Correctly Implemented

1. **Board Creation** (`useCreateBoard.ts`)
   - Uses correct module: `moveit::moveit`
   - Passes AdminCap ✅
   - Passes initial_statuses ✅
   - Uses Clock object ✅

2. **Data Fetching Strategy**
   - API-first with blockchain fallback ✅
   - Board queries via events ✅

3. **Network Configuration**
   - Set to testnet ✅
   - Correct package ID ✅
   - Correct AdminCap ID ✅

### 🔴 Needs Immediate Fix

1. **Task Fetching from Blockchain** (`blockchain.service.ts`)
   - ❌ Uses dynamic field query (wrong approach)
   - ✅ Should query task objects by their IDs from `board.task_ids`

2. **Task Update Transaction** (`useTasks.ts`)
   - ❌ Passes task number instead of task object
   - ✅ Should pass task Object ID

### ⚠️ Missing Features

1. **Subtask Management** - Contract supports it, dApp doesn't implement
2. **Task Status Updates** - Contract has dedicated function, dApp might not use it
3. **Task Assignment** - Contract has dedicated function, dApp might not use it
4. **Comments** - Contract fully supports, dApp doesn't implement
5. **Dynamic Board Fields** - Contract supports extensibility, dApp doesn't use

## 📋 RECOMMENDED FIXES

### Priority 1: Critical Fixes

#### Fix 1: Update `blockchain.service.ts` Task Fetching

**Replace `getTaskFromBoard` function:**

```typescript
/**
 * Get task by Object ID (new approach - tasks are shared objects)
 */
export async function getTaskFromBlockchain(taskObjectId: string): Promise<BlockchainTask | null> {
  try {
    const object = await suiClient.getObject({
      id: taskObjectId,
      options: {
        showContent: true,
        showType: true,
      },
    });

    if (!object.data || object.data.content?.dataType !== 'moveObject') {
      return null;
    }

    const content = object.data.content as any;
    const fields = content.fields;

    return {
      id: taskObjectId, // Object ID, not task_number
      boardId: fields.board_id,
      taskNumber: parseInt(fields.task_number || '0'),
      title: fields.title || '',
      description: fields.description || '',
      dueDate: parseInt(fields.due_date || '0'),
      status: fields.status || '',
      effort: parseInt(fields.effort || '0'),
      assignees: fields.assignees || [],
      creator: fields.creator || '',
      createdAt: parseInt(fields.created_at || '0'),
      updatedAt: parseInt(fields.updated_at || '0'),
      parentTaskId: fields.parent_task_id?.vec?.[0],
      subtaskIds: fields.subtask_ids || [],
    };
  } catch (error) {
    console.error('Error fetching task:', error);
    return null;
  }
}

/**
 * Get all tasks for a board by querying task_ids
 */
export async function getTasksForBoard(boardId: string): Promise<BlockchainTask[]> {
  try {
    const board = await getBoardFromBlockchain(boardId);
    if (!board || !board.taskIds) return [];

    // Fetch all tasks in parallel
    const taskPromises = board.taskIds.map(taskId => getTaskFromBlockchain(taskId));
    const tasks = await Promise.all(taskPromises);
    
    // Filter out null results
    return tasks.filter((task): task is BlockchainTask => task !== null);
  } catch (error) {
    console.error('Error fetching tasks for board:', error);
    return [];
  }
}
```

**Update `getBoardFromBlockchain` to include task_ids:**

```typescript
return {
  id: boardId,
  name: fields.name || '',
  description: fields.description || '',
  statuses: fields.statuses || [],
  taskCounter: parseInt(fields.task_counter || '0'),
  taskIds: fields.task_ids || [], // ← Add this
  createdAt: parseInt(fields.created_at || '0'),
  version: parseInt(fields.version || '1'),
};
```

#### Fix 2: Update Task Transaction Hook

**In `hooks/useTasks.ts`, fix the `useUpdateTask` function:**

```typescript
export function useUpdateTask() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ taskObjectId, boardId, contributorCapId, updates }: UpdateTaskData) => {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      if (!contributorCapId) {
        throw new Error('Contributor capability required');
      }

      const tx = new Transaction();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::moveit::update_task`,
        arguments: [
          tx.object(contributorCapId),
          tx.object(boardId),
          tx.object(taskObjectId), // ✅ Pass task OBJECT, not number
          tx.pure.string(updates.title || ''),
          tx.pure.string(updates.description || ''),
          tx.pure.u64(updates.dueDate || 0),
          tx.pure.u64(updates.effortHours || 0),
          tx.object(CLOCK_ID),
        ],
      });

      return signAndExecute({ transaction: tx });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      toast(
        'Failed to update task',
        error instanceof Error ? error.message : 'Transaction failed',
        'error'
      );
    },
  });
}
```

**Update the interface:**

```typescript
interface UpdateTaskData {
  taskObjectId: string; // ✅ Changed from taskId (number) to taskObjectId (string)
  boardId: string;
  contributorCapId: string;
  updates: {
    title?: string;
    description?: string;
    dueDate?: number;
    effortHours?: number;
  };
}
```

### Priority 2: Add Missing Contract Features

#### 1. Task Status Update Hook

```typescript
// hooks/useTaskStatus.ts
export function useUpdateTaskStatus(boardId: string) {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      contributorCapId, 
      taskObjectId, 
      newStatus 
    }: { 
      contributorCapId: string; 
      taskObjectId: string; 
      newStatus: string;
    }) => {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::moveit::update_task_status`,
        arguments: [
          tx.object(contributorCapId),
          tx.object(boardId),
          tx.object(taskObjectId),
          tx.pure.string(newStatus),
          tx.object(CLOCK_ID),
        ],
      });

      return signAndExecute({ transaction: tx });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', boardId] });
    },
  });
}
```

#### 2. Task Assignment Hook

```typescript
// hooks/useTaskAssignment.ts
export function useAssignTask(boardId: string) {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      contributorCapId, 
      taskObjectId, 
      assignees 
    }: { 
      contributorCapId: string; 
      taskObjectId: string; 
      assignees: string[];
    }) => {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::moveit::assign_task`,
        arguments: [
          tx.object(contributorCapId),
          tx.object(boardId),
          tx.object(taskObjectId),
          tx.pure.vector('address', assignees),
          tx.object(CLOCK_ID),
        ],
      });

      return signAndExecute({ transaction: tx });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', boardId] });
    },
  });
}
```

#### 3. Comments Support

```typescript
// hooks/useComments.ts
export function useAddComment(taskObjectId: string) {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      contributorCapId, 
      content 
    }: { 
      contributorCapId: string; 
      content: string;
    }) => {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::moveit::add_comment`,
        arguments: [
          tx.object(contributorCapId),
          tx.object(taskObjectId),
          tx.pure.string(content),
          tx.object(CLOCK_ID),
        ],
      });

      return signAndExecute({ transaction: tx });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskObjectId] });
    },
  });
}
```

## 📊 TYPE UPDATES NEEDED

### Update Task Type

```typescript
// lib/types.ts or types/task.ts
export interface Task {
  id: string; // ✅ Object ID, not number
  boardId: string;
  taskNumber: number; // ✅ Sequential number (for display)
  title: string;
  description: string;
  dueDate: number;
  status: string;
  effort: number;
  assignees: string[];
  creator: string;
  createdAt: number;
  updatedAt: number;
  parentTaskId?: string; // ✅ Object ID of parent
  subtaskIds: string[]; // ✅ Object IDs of subtasks
  commentCount?: number; // ✅ Number of comments
}
```

## 🎯 VALIDATION CHECKLIST

- [x] Contract fully parsed and analyzed
- [x] All public functions catalogued
- [x] Admin vs Contributor permissions documented
- [x] Critical integration issues identified
- [x] Task storage architecture clarified
- [ ] Task fetching fixed in blockchain.service.ts
- [ ] Task update transaction fixed in useTasks.ts
- [ ] Task type updated to use Object IDs
- [ ] Missing features documented
- [ ] Priority fixes implemented

## 📝 CONCLUSION

The dApp is **mostly aligned** with the contract but has **2 critical bugs** that break task operations when falling back to blockchain queries:

1. **Task Fetching**: Tries to query dynamic fields (Table) that don't exist. Tasks are shared objects with IDs in `board.task_ids`.
2. **Task Updates**: Passes task number instead of task object reference.

Additionally, the dApp is **missing several features** that the contract fully supports:
- Subtask management
- Dedicated status update function
- Dedicated assignment function
- Comments system
- Dynamic board fields

**Recommended Action**: Fix the 2 critical bugs immediately, then gradually add missing features.
