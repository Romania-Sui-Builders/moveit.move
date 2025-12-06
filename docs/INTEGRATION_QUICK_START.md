# MoveIt Integration - Quick Reference

This document provides a quick reference for integrating the MoveIt smart contract and indexer with your dApp.

## 📁 Project Structure

```
moveit.move/
├── contract/moveit/              # Smart contract
│   ├── sources/moveit.move       # Main contract
│   └── Move.toml                 # Contract config
├── indexer-ts/                   # Event indexer
│   ├── indexer.ts                # Event listener
│   ├── server.ts                 # REST API
│   ├── handlers/moveit.ts        # Event handlers
│   └── prisma/schema.prisma      # Database schema
├── dapp/sui-tasks/               # Next.js frontend
│   ├── services/                 # Integration layer
│   │   ├── moveit.service.ts     # Contract transactions
│   │   └── indexer.service.ts    # Indexer API client
│   ├── hooks/                    # React hooks
│   │   ├── useMoveItContract.ts  # Contract mutations
│   │   ├── useIndexedBoards.ts   # Board data
│   │   └── useIndexedTasks.ts    # Task data
│   └── core/constants.ts         # Configuration
└── docs/                         # Documentation
```

## 🚀 Quick Start

### 1. Use the Setup Script (Recommended)

```bash
# Make script executable
chmod +x setup.sh

# Run setup
./setup.sh
```

### 2. Manual Setup

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📋 Environment Variables

### Indexer (.env)

```env
NETWORK=testnet
PACKAGE_ID=0x...
DATABASE_URL=postgresql://...
POLLING_INTERVAL_MS=5000
PORT=3001
```

### dApp (.env.local)

```env
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=0x...
NEXT_PUBLIC_ADMIN_CAP_ID=0x...
NEXT_PUBLIC_CLOCK_ID=0x6
NEXT_PUBLIC_INDEXER_URL=http://localhost:3001
```

## 🔧 Usage Examples

### Creating a Board

```typescript
import { useCreateBoard } from '@/hooks/useMoveItContract';

function CreateBoardButton() {
  const { mutate: createBoard, isPending } = useCreateBoard();

  const handleCreate = () => {
    createBoard({
      name: "My Project",
      description: "Project description",
      initialStatuses: ["To Do", "In Progress", "Done"]
    });
  };

  return (
    <button onClick={handleCreate} disabled={isPending}>
      Create Board
    </button>
  );
}
```

### Fetching Boards from Indexer

```typescript
import { useIndexedBoards } from '@/hooks/useIndexedBoards';

function BoardList() {
  const { boards, isLoading, error } = useIndexedBoards();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading boards</div>;

  return (
    <div>
      {boards.map(board => (
        <div key={board.board_id}>
          <h3>{board.name}</h3>
          <p>Tasks: {board.taskCount}</p>
        </div>
      ))}
    </div>
  );
}
```

### Creating a Task

```typescript
import { useCreateTask } from '@/hooks/useMoveItContract';

function CreateTaskButton({ boardId, contributorCapId }: Props) {
  const { mutate: createTask } = useCreateTask();

  const handleCreate = () => {
    createTask({
      contributorCapId,
      boardId,
      title: "New Task",
      description: "Task description",
      dueDate: Date.now() + 86400000, // Tomorrow
      effort: 5, // hours
      assignees: [], // Empty for now
    });
  };

  return <button onClick={handleCreate}>Create Task</button>;
}
```

### Fetching Tasks from Indexer

```typescript
import { useIndexedTasks } from '@/hooks/useIndexedTasks';

function TaskList({ boardId }: { boardId: string }) {
  const { tasks, isLoading } = useIndexedTasks(boardId);

  if (isLoading) return <div>Loading tasks...</div>;

  return (
    <div>
      {tasks.map(task => (
        <div key={task.task_id}>
          <h4>{task.title}</h4>
          <p>Status: {task.status}</p>
          <p>Assignees: {task.assignees.join(', ')}</p>
        </div>
      ))}
    </div>
  );
}
```

### Updating Task Status

```typescript
import { useUpdateTaskStatus } from '@/hooks/useMoveItContract';

function TaskStatusButton({ boardId, taskId, contributorCapId }: Props) {
  const { mutate: updateStatus } = useUpdateTaskStatus();

  const handleStatusChange = (newStatus: string) => {
    updateStatus({
      contributorCapId,
      boardId,
      taskId,
      newStatus,
    });
  };

  return (
    <select onChange={(e) => handleStatusChange(e.target.value)}>
      <option value="To Do">To Do</option>
      <option value="In Progress">In Progress</option>
      <option value="Done">Done</option>
    </select>
  );
}
```

## 🔑 Key Concepts

### Capabilities

- **AdminCap**: Required for board management operations
  - Create boards
  - Add/remove statuses
  - Add contributors
  
- **ContributorCap**: Required for task operations
  - Create tasks
  - Update tasks
  - Change status
  - Assign tasks

### Data Flow

```
User Action → Transaction → Sui Network → Event Emission
                                              ↓
                                         Indexer Listens
                                              ↓
                                    Stores in PostgreSQL
                                              ↓
                                        REST API Serves
                                              ↓
                                      dApp Fetches (SWR)
                                              ↓
                                        UI Updates
```

### Real-time Updates

The dApp uses SWR for automatic data refreshing:

- Boards refresh every 5 seconds
- Tasks refresh every 3 seconds
- Immediate refresh after mutations

## 📡 Indexer API Endpoints

All endpoints return JSON arrays of events.

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

## 🏗️ Smart Contract Functions

### Admin Functions (require AdminCap)

```move
create_board(admin_cap, name, description, statuses, clock, ctx)
update_board(admin_cap, board, name, description)
add_status(admin_cap, board, status, ctx)
remove_status(admin_cap, board, status, ctx)
add_contributor(admin_cap, board, contributor_address, ctx)
```

### Contributor Functions (require ContributorCap)

```move
create_task(cap, board, title, desc, due_date, effort, assignees, clock, ctx)
update_task(cap, board, task_id, title, desc, due_date, effort, clock, ctx)
update_task_status(cap, board, task_id, new_status, clock, ctx)
assign_task(cap, board, task_id, assignees, clock, ctx)
create_subtask(cap, board, parent_id, title, desc, due_date, effort, assignees, clock, ctx)
```

## 🐛 Debugging

### Check Indexer Status

```bash
# Verify API is running
curl http://localhost:3001/events/moveit/board-created

# Check database
cd indexer-ts && npm run db:studio
```

### Check Transaction

```bash
# View on Sui Explorer
open "https://suiexplorer.com/txblock/YOUR_TX_DIGEST?network=testnet"
```

### Check Logs

```bash
# Indexer logs
cd indexer-ts && npm run indexer  # Watch terminal output

# dApp logs
cd dapp/sui-tasks && npm run dev  # Check browser console
```

## 📚 Documentation

- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Comprehensive integration documentation
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Step-by-step deployment guide
- [Sui Documentation](https://docs.sui.io/) - Official Sui docs

## 🎯 Common Tasks

### Get User's ContributorCap

```typescript
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { CONTRIBUTOR_CAP_TYPE } from '@/core/constants';

async function getUserContributorCap(boardId: string) {
  const account = useCurrentAccount();
  const client = useSuiClient();
  
  if (!account) return null;
  
  const { data } = await client.getOwnedObjects({
    owner: account.address,
    filter: { StructType: CONTRIBUTOR_CAP_TYPE },
    options: { showContent: true },
  });
  
  // Find cap for specific board
  const cap = data.find(obj => {
    const content = obj.data?.content;
    return content?.fields?.board_id === boardId;
  });
  
  return cap?.data?.objectId;
}
```

### Listen for Transaction Success

```typescript
const { mutateAsync } = useCreateTask();

const result = await mutateAsync(params);

// Wait for indexer to process (optional)
await new Promise(resolve => setTimeout(resolve, 2000));

// Refresh data
queryClient.invalidateQueries({ queryKey: ['/api/indexer/tasks'] });
```

## ⚡ Performance Tips

1. **Use SWR caching** - Prevents unnecessary API calls
2. **Batch reads** - Use indexer's aggregated endpoints
3. **Optimize polling** - Adjust `POLLING_INTERVAL_MS` based on needs
4. **Shared objects** - Boards should be shared objects for parallel access
5. **Gas optimization** - Batch multiple operations when possible

## 🔐 Security Considerations

1. **Capability Protection** - Never expose AdminCap ID publicly
2. **Input Validation** - Validate all user inputs before transactions
3. **Authorization** - Check capabilities before allowing operations
4. **Rate Limiting** - Implement rate limiting on indexer API
5. **Environment Variables** - Use `.env.local` (not committed to git)

## 🚨 Known Limitations

1. **Indexer Delay** - 1-5 second delay between transaction and indexer
2. **Task Updates** - Only last update is stored in events (no history)
3. **Pagination** - Current implementation loads all events (add pagination for production)
4. **Error Handling** - Basic error handling (enhance for production)

## 📞 Support

For issues or questions:

1. Check the troubleshooting section in [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. Review transaction on Sui Explorer
3. Check indexer and dApp logs
4. Verify environment variables

---

**Last Updated:** December 6, 2025
