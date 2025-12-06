# Access Control Implementation Guide

## Overview
The MoveIt application implements a capability-based access control system using Sui's object ownership model. This document explains how access control works and how it's integrated into the dApp.

## Capability Types

### 1. AdminCap (Admin Capability)
- **Purpose**: Grants full administrative control over a board
- **Holder**: The board creator (one per board)
- **Permissions**:
  - Update board metadata (name, description)
  - Manage workflow statuses (add/remove)
  - Add contributors to the board
  - All permissions that ContributorCap has

### 2. ContributorCap (Contributor Capability)
- **Purpose**: Grants task management permissions on a specific board
- **Holder**: Users added by the admin (multiple per board)
- **Permissions**:
  - Create tasks
  - Update tasks (title, description, due date, effort)
  - Change task status
  - Assign tasks
  - Delete tasks
  - Add/remove task assignees

## Access Control Flow

### Step 1: Board Creation
```
User creates board → Receives AdminCap → Stored in user's wallet
```

**Contract Function:**
```move
public fun create_board(
    name: String,
    description: String,
    clock: &Clock,
    ctx: &mut TxContext,
): ID
```

**Returns**: Board ID and transfers AdminCap to creator

### Step 2: Adding Contributors
```
Admin → Uses AdminCap → Adds contributor address → ContributorCap transferred to contributor
```

**Contract Function:**
```move
public fun add_contributor(
    _: &AdminCap,
    board: &Board,
    new_contributor: address,
    ctx: &mut TxContext,
)
```

**UI Component**: `AddContributorForm` (in Contributors tab)

**Hook**: `useAddContributor()`

### Step 3: Task Management
```
Contributor → Uses ContributorCap → Creates/manages tasks
```

**Contract Functions:**
```move
// Create new task
public fun create_task(
    cap: &ContributorCap,
    board: &mut Board,
    title: String,
    description: String,
    due_date: u64,
    effort: u64,
    assignees: vector<address>,
    clock: &Clock,
    ctx: &mut TxContext,
): ID

// Update existing task
public fun update_task(
    cap: &ContributorCap,
    board: &Board,
    task: &mut Task,
    title: String,
    description: String,
    due_date: u64,
    effort: u64,
    clock: &Clock,
    ctx: &TxContext,
)
```

## Frontend Integration

### Environment Configuration

```bash
# .env file
NEXT_PUBLIC_ADMIN_CAP_ID=0x64572da921ef162088a2c9e9539375c264444f3645b4a9968a22b0d5cbb1cb16
NEXT_PUBLIC_CONTRIBUTOR_CAP_ID= # Leave empty - queried from blockchain
```

**Note**: ContributorCap IDs are user-specific and queried dynamically from the blockchain.

### Hooks

#### 1. Query ContributorCap
```typescript
// hooks/useContributorCaps.ts

// Get all ContributorCaps for current user
const { data: caps } = useContributorCaps()

// Get ContributorCap for specific board
const { data: capId } = useContributorCapForBoard(boardId)

// Check if user has access to board
const { data: hasAccess } = useHasContributorAccess(boardId)
```

#### 2. Add Contributor
```typescript
// hooks/useAddContributor.ts
const { mutate: addContributor } = useAddContributor()

addContributor({
  adminCapId: "0x...",
  boardId: "0x...",
  contributorAddress: "0x..."
})
```

### Component Access Control

#### Board Detail (`board-detail.tsx`)
```typescript
// Contributors tab - only visible to admin
<TabsContent value="contributors">
  {ADMIN_CAP_ID ? (
    <AddContributorForm boardId={boardId} adminCapId={ADMIN_CAP_ID} />
  ) : (
    <div>Admin capability required</div>
  )}
</TabsContent>
```

#### Task Form (`task-form.tsx`)
```typescript
// Query ContributorCap for current user and board
const { data: contributorCapId, isLoading } = useContributorCapForBoard(boardId)

// Show warning if no access
{!contributorCapId && (
  <Alert variant="destructive">
    You need contributor access to create tasks.
    Ask the board admin to add you as a contributor.
  </Alert>
)}

// Pass to blockchain transaction
createTask.mutateAsync({
  contributorCapId,
  title,
  description,
  // ...
})
```

#### Task List (`task-list.tsx`)
```typescript
// Query ContributorCap
const { data: contributorCapId } = useContributorCapForBoard(boardId)

// Disable create button if no access
<Button 
  disabled={!contributorCapId}
  title={!contributorCapId ? "You need contributor access" : ""}
>
  Create Task
</Button>
```

#### Task Detail (`task-detail.tsx`)
```typescript
// Query ContributorCap
const { data: contributorCapId } = useContributorCapForBoard(board.id)

// Show warning
{!contributorCapId && (
  <Alert variant="destructive">
    You need contributor access to edit this task.
  </Alert>
)}

// Disable edit/delete buttons
<Button 
  onClick={() => setIsEditing(true)}
  disabled={!contributorCapId}
>
  <Pencil />
</Button>
```

## User Workflows

### Workflow 1: Board Creator
1. Create board → Receive AdminCap
2. AdminCap stored in wallet
3. Can add contributors via Contributors tab
4. Must give themselves a ContributorCap to create tasks

### Workflow 2: Contributor
1. Admin adds contributor address
2. Receive ContributorCap in wallet
3. dApp automatically detects ContributorCap
4. Can create and manage tasks on that board
5. Cannot add other contributors (no AdminCap)

### Workflow 3: Visitor (No Caps)
1. Can view boards and tasks (read-only)
2. Create Task button disabled
3. Edit/Delete buttons disabled
4. See messages: "You need contributor access"

## Security Considerations

### 1. Capability Ownership
- Capabilities are owned objects in Sui
- Only the owner can use them in transactions
- Cannot be forged or duplicated
- Transfer requires explicit transaction

### 2. Board-Specific Access
- Each ContributorCap is tied to one board
- `cap.board_id == object::id(board)` check in contract
- User with Cap for Board A cannot affect Board B

### 3. Validation
- All contract functions validate capability ownership
- dApp checks capability before showing UI controls
- Blockchain enforces capability requirements

### 4. Revocation
```move
public fun burn_contributor_cap(cap: ContributorCap)
```
- Contributor can voluntarily burn their cap
- Admin cannot forcibly revoke (would need transfer mechanism)

## Troubleshooting

### Issue: "ContributorCap required to create tasks"
**Solution**: 
1. Check if you have a ContributorCap for this board
2. Ask the board admin to add you via Contributors tab
3. Verify wallet is connected

### Issue: Create Task button disabled
**Solution**:
1. Hook is querying your ContributorCaps
2. If none found, you need to be added by admin
3. Check browser console for query errors

### Issue: Admin can't create tasks
**Solution**:
- Admin needs to add themselves as a contributor
- Go to Contributors tab
- Add your own wallet address
- You'll receive a ContributorCap

## API Reference

### Contract Functions (Admin)
- `create_board()` - Create new board, get AdminCap
- `add_contributor()` - Grant ContributorCap to user
- `update_board()` - Change board name/description
- `add_status()` - Add workflow status
- `remove_status()` - Remove workflow status

### Contract Functions (Contributor)
- `create_task()` - Create new task
- `update_task()` - Update task details
- `update_task_status()` - Change task status
- `assign_task()` - Assign task to user
- `remove_assignee()` - Remove task assignee
- `delete_task()` - Delete task

### Hooks
- `useContributorCaps()` - Get all user's caps
- `useContributorCapForBoard(boardId)` - Get cap for board
- `useHasContributorAccess(boardId)` - Boolean access check
- `useAddContributor()` - Add contributor mutation

### Components
- `AddContributorForm` - Admin form to add contributors
- `TaskForm` - Create task (requires ContributorCap)
- `TaskDetail` - Edit task (requires ContributorCap)
- `TaskList` - Shows tasks, create button

## Best Practices

1. **Always check capability before showing UI**
   - Use hooks to query capabilities
   - Disable buttons when no access
   - Show helpful messages

2. **Handle loading states**
   - Query returns `isLoading` flag
   - Show loading indicator
   - Don't show error until loaded

3. **Admin self-grant**
   - Admins should add themselves as contributors
   - Allows admin to manage tasks
   - Keep AdminCap separate for board management

4. **Clear error messages**
   - Tell users they need contributor access
   - Explain how to get access (ask admin)
   - Link to Contributors tab for admins

5. **Validate on blockchain**
   - Frontend checks are for UX only
   - Blockchain enforces capability requirements
   - Never skip capability parameter

## Migration Notes

### From Previous Implementation
- Removed `board.members` array (not in contract)
- Replaced with capability-based queries
- Member list shows explanation instead of list
- Contributors are implicit (anyone with ContributorCap)

### Breaking Changes
- Task creation requires ContributorCap
- Admin must add themselves to create tasks
- No stored member list (query capabilities instead)
