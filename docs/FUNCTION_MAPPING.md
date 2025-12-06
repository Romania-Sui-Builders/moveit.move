# MoveIt Contract Function Mapping

Quick reference of all contract functions and their dApp implementation status.

## ⚠️ IMPORTANT ARCHITECTURAL NOTES

### Member Management - NOT SUPPORTED
The contract **does NOT store a members list** in the Board struct. Instead, it uses **capability-based access control**:

- **AdminCap** - Owned by admin, allows board management
- **ContributorCap** - Given to contributors, allows task operations

ContributorCaps are separate objects owned by users, not stored in the board. There's no on-chain way to query "all members of a board".

**UI Impact:**
- ❌ Members tab shows informational message instead of member list
- ✅ Admin can still call `add_contributor()` to grant access
- 🔄 Future: Indexer can track `ContributorAdded` events to show members

### Status vs Columns
- Contract uses `statuses: vector<String>` for workflow
- UI converts to `columns: BoardColumn[]` for display
- Status reordering is UI-only (contract stores in insertion order)

---

## 🔑 Legend

- ✅ **Fully Implemented** - Function is called by dApp with correct parameters
- ⚠️ **Partially Implemented** - Function exists but dApp uses workaround or indirect approach
- ❌ **Not Implemented** - Function exists in contract but dApp doesn't use it
- 🚫 **Not Exposed** - Internal function, not meant for dApp use

---

## Admin Functions (Require AdminCap)

### Board Management

| Function | Status | dApp Hook/Component | Notes |
|----------|--------|---------------------|-------|
| `create_board` | ✅ Fully Implemented | `useCreateBoard.ts` | Creates shared Board objects with initial statuses |
| `update_board` | ❌ Not Implemented | - | Can update board name and description |
| `add_status` | ❌ Not Implemented | - | Add workflow statuses to board |
| `remove_status` | ❌ Not Implemented | - | Remove workflow statuses |
| `migrate_board` | ❌ Not Implemented | - | Upgrade boards to new version |

### Contributor Management

| Function | Status | dApp Hook/Component | Notes |
|----------|--------|---------------------|-------|
| `add_contributor` | ❌ Not Implemented | - | Grant ContributorCap to users |
| `burn_contributor_cap` | ❌ Not Implemented | - | Revoke contributor access |

### Dynamic Fields (Extensibility)

| Function | Status | dApp Hook/Component | Notes |
|----------|--------|---------------------|-------|
| `add_board_field<T>` | ❌ Not Implemented | - | Add custom data to boards |
| `get_board_field_mut<T>` | ❌ Not Implemented | - | Modify custom board data |
| `remove_board_field<T>` | ❌ Not Implemented | - | Remove custom data |

---

## Contributor Functions (Require ContributorCap)

### Task Operations

| Function | Status | dApp Hook/Component | Notes |
|----------|--------|---------------------|-------|
| `create_task` | ✅ Fully Implemented | `useTasks.ts` → `useCreateTask()` | Creates task with all fields |
| `update_task` | ✅ Fixed & Implemented | `useTasks.ts` → `useUpdateTask()` | Now passes correct Object ID |
| `update_task_status` | ⚠️ Partially Implemented | API routes | Should use dedicated function |
| `assign_task` | ❌ Not Implemented | - | Dedicated function for assignments |
| `create_subtask` | ❌ Not Implemented | - | Create hierarchical tasks |

### Comments

| Function | Status | dApp Hook/Component | Notes |
|----------|--------|---------------------|-------|
| `add_comment` | ❌ Not Implemented | - | Add discussion to tasks |

---

## View Functions (Public, No Capabilities Required)

### Version Management

| Function | Status | dApp Hook/Component | Notes |
|----------|--------|---------------------|-------|
| `current_version` | ❌ Not Implemented | - | Get contract version |
| `get_board_version` | ❌ Not Implemented | - | Check board version |
| `needs_migration` | ❌ Not Implemented | - | Check if board needs upgrade |

### Board Queries

| Function | Status | dApp Hook/Component | Notes |
|----------|--------|---------------------|-------|
| `get_board_info` | ⚠️ Indirect Use | `blockchain.service.ts` | Used in `getBoardFromBlockchain()` |
| `get_board_statuses` | ⚠️ Indirect Use | `blockchain.service.ts` | Fetched via board object |
| `get_board_task_ids` | ✅ Now Implemented | `blockchain.service.ts` | Fixed to fetch task IDs |
| `get_task_count` | ❌ Not Implemented | - | Get total task count |
| `is_valid_status` | ❌ Not Implemented | - | Validate status string |
| `has_board_field` | ❌ Not Implemented | - | Check custom field exists |
| `get_board_field<T>` | ❌ Not Implemented | - | Read custom board data |

### Task Queries

| Function | Status | dApp Hook/Component | Notes |
|----------|--------|---------------------|-------|
| `get_task_board_id` | ⚠️ Indirect Use | `blockchain.service.ts` | Part of task object |
| `get_task_info` | ⚠️ Indirect Use | `blockchain.service.ts` | Used in `getTaskFromBlockchain()` |
| `get_task_number` | ⚠️ Indirect Use | `blockchain.service.ts` | Fetched as `taskNumber` |
| `get_parent_task_id` | ⚠️ Indirect Use | `blockchain.service.ts` | Fetched but not displayed |
| `get_subtask_ids` | ⚠️ Indirect Use | `blockchain.service.ts` | Fetched but not used |
| `is_subtask` | ❌ Not Implemented | - | Check if task has parent |
| `has_subtasks` | ❌ Not Implemented | - | Check if task has children |
| `get_subtask_count` | ❌ Not Implemented | - | Count child tasks |

### Comment Queries

| Function | Status | dApp Hook/Component | Notes |
|----------|--------|---------------------|-------|
| `get_comment` | ❌ Not Implemented | - | Fetch comment by number |
| `get_comment_count` | ❌ Not Implemented | - | Count task comments |
| `has_comments` | ❌ Not Implemented | - | Check if task has comments |

### Capability Validation

| Function | Status | dApp Hook/Component | Notes |
|----------|--------|---------------------|-------|
| `get_contributor_cap_board_id` | ⚠️ Indirect Use | `blockchain.service.ts` | Used in `getContributorCapsFromBlockchain()` |
| `is_valid_contributor_cap` | ❌ Not Implemented | - | Validate cap for board |

---

## 📊 Implementation Statistics

### Overall Progress

```
Total Functions: 36
✅ Fully Implemented: 3 (8%)
⚠️ Partially Implemented: 10 (28%)
❌ Not Implemented: 23 (64%)
```

### By Category

**Admin Functions (8 total)**
- ✅ Implemented: 1 (create_board)
- ❌ Not Implemented: 7

**Contributor Functions (6 total)**
- ✅ Implemented: 2 (create_task, update_task)
- ⚠️ Partial: 1 (update_task_status)
- ❌ Not Implemented: 3

**View Functions (22 total)**
- ⚠️ Indirect Use: 9
- ❌ Not Implemented: 13

---

## 🚀 Priority Implementation Order

### Phase 1: Critical Fixes (DONE ✅)
1. ✅ Fix task fetching (use Object IDs, not dynamic fields)
2. ✅ Fix task updates (pass object, not number)
3. ✅ Update type definitions

### Phase 2: Core Features (RECOMMENDED)
1. **Task Status Updates** - Use dedicated `update_task_status()` function
   - Currently using API workaround
   - Should call contract function directly

2. **Task Assignments** - Use dedicated `assign_task()` function
   - Currently part of update_task
   - More gas-efficient with dedicated function

3. **Contributor Management** - Implement `add_contributor()` and `burn_contributor_cap()`
   - Essential for multi-user boards
   - Currently relies on admin manual distribution

### Phase 3: Advanced Features
1. **Subtasks** - Full hierarchical task management
   - `create_subtask()`
   - Display parent/child relationships in UI

2. **Comments** - Discussion system
   - `add_comment()`
   - `get_comment()`
   - Comment display in task detail

3. **Board Management** - Full admin controls
   - `update_board()`
   - `add_status()` / `remove_status()`
   - Board settings UI

### Phase 4: Enhancement & Optimization
1. **Version Management** - Handle contract upgrades
   - `needs_migration()`
   - `migrate_board()`

2. **Dynamic Fields** - Custom extensibility
   - `add_board_field<T>()`
   - Plugin system for custom data

---

## 📋 Implementation Examples

### Task Status Update (Recommended)

```typescript
// hooks/useTaskStatus.ts
export function useUpdateTaskStatus(boardId: string) {
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
  });
}
```

### Add Contributor (Recommended)

```typescript
// hooks/useContributors.ts
export function useAddContributor(boardId: string) {
  return useMutation({
    mutationFn: async ({ 
      adminCapId, 
      contributorAddress 
    }: { 
      adminCapId: string; 
      contributorAddress: string;
    }) => {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::moveit::add_contributor`,
        arguments: [
          tx.object(adminCapId),
          tx.object(boardId),
          tx.pure.address(contributorAddress),
        ],
      });

      return signAndExecute({ transaction: tx });
    },
  });
}
```

### Create Subtask (Future)

```typescript
// hooks/useSubtasks.ts
export function useCreateSubtask(boardId: string) {
  return useMutation({
    mutationFn: async ({ 
      contributorCapId, 
      parentTaskId,
      title,
      description,
      // ... other fields
    }: SubtaskData) => {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::moveit::create_subtask`,
        arguments: [
          tx.object(contributorCapId),
          tx.object(boardId),
          tx.object(parentTaskId), // Parent task object
          tx.pure.string(title),
          tx.pure.string(description),
          tx.pure.u64(dueDate),
          tx.pure.u64(effort),
          tx.pure.vector('address', assignees),
          tx.object(CLOCK_ID),
        ],
      });

      return signAndExecute({ transaction: tx });
    },
  });
}
```

---

## 🎯 Key Takeaways

### What's Working
- ✅ Board creation with AdminCap
- ✅ Task creation with ContributorCap
- ✅ Task updates with correct Object IDs
- ✅ Blockchain fallback for data fetching

### What's Missing
- ❌ No dedicated status update function (using workaround)
- ❌ No contributor management UI
- ❌ No subtask support
- ❌ No comments system
- ❌ No board settings (add/remove statuses)

### Recommended Next Steps
1. Implement dedicated `update_task_status()` hook
2. Add `add_contributor()` functionality for team management
3. Build subtask UI for hierarchical tasks
4. Add comments for task collaboration

---

## 📚 Related Documentation

- `CONTRACT_VALIDATION.md` - Full contract analysis
- `CRITICAL_FIXES_APPLIED.md` - Recent bug fixes
- `INTEGRATION_SUMMARY.md` - Overall integration status
