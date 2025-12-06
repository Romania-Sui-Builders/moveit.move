# MoveIt Integration - Complete Package

This package contains everything you need to integrate the MoveIt smart contract and indexer with your dApp.

## 📦 What's Included

### Documentation
- ✅ **INTEGRATION_GUIDE.md** - Comprehensive architecture and integration details
- ✅ **DEPLOYMENT_GUIDE.md** - Step-by-step deployment instructions
- ✅ **INTEGRATION_QUICK_START.md** - Quick reference and examples
- ✅ **This file** - Overview and file manifest

### Environment Files
- ✅ **indexer-ts/.env.example** - Indexer environment template
- ✅ **dapp/sui-tasks/.env.example** - dApp environment template
- ✅ **dapp/sui-tasks/.env.local.example** - Local development template

### Integration Code

#### Services
- ✅ **dapp/sui-tasks/services/moveit.service.ts** - Smart contract transaction builder
- ✅ **dapp/sui-tasks/services/indexer.service.ts** - Indexer API client

#### Hooks
- ✅ **dapp/sui-tasks/hooks/useMoveItContract.ts** - Contract mutation hooks
- ✅ **dapp/sui-tasks/hooks/useIndexedBoards.ts** - Board data fetching
- ✅ **dapp/sui-tasks/hooks/useIndexedTasks.ts** - Task data fetching

#### Configuration
- ✅ **dapp/sui-tasks/core/constants.ts** - Updated with MoveIt constants
- ✅ **dapp/sui-tasks/app/api/indexer/[...path]/route.ts** - API proxy

### Scripts
- ✅ **setup.sh** - Automated setup script

## 🎯 Integration Overview

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Sui Network                          │
│                    (MoveIt Smart Contract)                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ Events
                           ↓
┌──────────────────────────────────────────┐
│          Event Indexer (TypeScript)       │
│  - Listens to blockchain events           │
│  - Stores in PostgreSQL via Prisma        │
│  - Provides REST API                      │
└──────────────────┬───────────────────────┘
                   │
                   │ HTTP API
                   ↓
┌─────────────────────────────────────────────┐
│         Next.js dApp (Frontend)             │
│  - Wallet connection                        │
│  - Transaction signing                      │
│  - Real-time data via SWR                   │
│  - Board & Task management UI               │
└─────────────────────────────────────────────┘
```

### Key Features

✅ **Smart Contract Integration**
- Board creation and management
- Task lifecycle (create, update, status change)
- Role-based access control (AdminCap, ContributorCap)
- Hierarchical tasks (subtasks)

✅ **Event Indexing**
- Real-time event listening
- PostgreSQL storage
- RESTful API
- Cursor-based resumable indexing

✅ **Frontend Integration**
- TypeScript service layer
- React hooks for data fetching
- React hooks for mutations
- SWR for real-time updates
- Type-safe API clients

## 🚀 Getting Started

### Prerequisites

- Sui CLI installed
- Node.js v18+
- PostgreSQL database
- Sui wallet with testnet tokens

### Quick Start (3 Steps)

1. **Deploy Contract**
   ```bash
   cd contract/moveit
   sui move build
   sui client publish --gas-budget 100000000
   # Save PACKAGE_ID and ADMIN_CAP_ID
   ```

2. **Run Setup Script**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   # Enter your PACKAGE_ID, ADMIN_CAP_ID, and DATABASE_URL
   ```

3. **Start Services**
   ```bash
   # Terminal 1 - Indexer
   cd indexer-ts && npm run indexer
   
   # Terminal 2 - API
   cd indexer-ts && npm run api:dev
   
   # Terminal 3 - dApp
   cd dapp/sui-tasks && npm run dev
   ```

4. **Open Browser**
   ```
   http://localhost:3000
   ```

## 📚 Documentation Guide

### For First-Time Setup
1. Read **DEPLOYMENT_GUIDE.md** first
2. Follow the step-by-step instructions
3. Use the setup script for automation

### For Development
1. Reference **INTEGRATION_QUICK_START.md**
2. Use the code examples
3. Check the API endpoints

### For Architecture Understanding
1. Read **INTEGRATION_GUIDE.md**
2. Understand the data flow
3. Review smart contract structure

## 🔧 Configuration

### Required Environment Variables

**Indexer:**
```env
NETWORK=testnet
PACKAGE_ID=<from deployment>
DATABASE_URL=postgresql://...
```

**dApp:**
```env
NEXT_PUBLIC_PACKAGE_ID=<from deployment>
NEXT_PUBLIC_ADMIN_CAP_ID=<from deployment>
NEXT_PUBLIC_INDEXER_URL=http://localhost:3001
```

See `.env.example` files for complete templates.

## 📖 Code Examples

### Create a Board

```typescript
import { useCreateBoard } from '@/hooks/useMoveItContract';

const { mutate: createBoard } = useCreateBoard();

createBoard({
  name: "My Project",
  description: "Project description",
  initialStatuses: ["To Do", "In Progress", "Done"]
});
```

### Fetch Boards

```typescript
import { useIndexedBoards } from '@/hooks/useIndexedBoards';

const { boards, isLoading } = useIndexedBoards();
// Automatically refreshes every 5 seconds
```

### Create a Task

```typescript
import { useCreateTask } from '@/hooks/useMoveItContract';

const { mutate: createTask } = useCreateTask();

createTask({
  contributorCapId: "<your contributor cap>",
  boardId: "<board object id>",
  title: "New Task",
  description: "Task details",
  dueDate: Date.now() + 86400000,
  effort: 5,
  assignees: ["0x..."],
});
```

### Update Task Status

```typescript
import { useUpdateTaskStatus } from '@/hooks/useMoveItContract';

const { mutate: updateStatus } = useUpdateTaskStatus();

updateStatus({
  contributorCapId: "<your contributor cap>",
  boardId: "<board object id>",
  taskId: 1,
  newStatus: "In Progress",
});
```

## 🧪 Testing the Integration

### 1. Verify Deployment
```bash
# Check contract on Sui Explorer
open "https://suiexplorer.com/object/YOUR_PACKAGE_ID?network=testnet"
```

### 2. Test Indexer API
```bash
curl http://localhost:3001/events/moveit/board-created
```

### 3. Test dApp
- Connect wallet
- Create a board
- Wait 5-10 seconds
- Verify board appears in indexer
- Create a task
- Verify task appears

## 🎯 What's Next?

After successful integration:

1. **Customize UI Components**
   - Update board display
   - Enhance task cards
   - Add filtering/sorting

2. **Add Features**
   - Task comments
   - File attachments
   - Notifications

3. **Production Deployment**
   - Deploy indexer to Railway/Render
   - Deploy dApp to Vercel
   - Set up monitoring

4. **Optimization**
   - Add pagination
   - Implement caching strategies
   - Optimize gas usage

## 📁 File Locations

### Smart Contract
```
contract/moveit/sources/moveit.move
```

### Indexer
```
indexer-ts/
├── config.ts              # Configuration
├── indexer.ts             # Main entry
├── server.ts              # REST API
├── handlers/moveit.ts     # Event handlers
└── prisma/schema.prisma   # Database schema
```

### dApp Integration
```
dapp/sui-tasks/
├── core/constants.ts                  # Configuration
├── services/
│   ├── moveit.service.ts             # Contract service
│   └── indexer.service.ts            # Indexer client
├── hooks/
│   ├── useMoveItContract.ts          # Contract hooks
│   ├── useIndexedBoards.ts           # Board hooks
│   └── useIndexedTasks.ts            # Task hooks
└── app/api/indexer/[...path]/route.ts # API proxy
```

## 🐛 Troubleshooting

### Common Issues

**1. Indexer not receiving events**
- Verify PACKAGE_ID matches deployed contract
- Check network configuration
- Restart indexer

**2. Transactions failing**
- Check gas budget
- Verify capability ownership
- Check object IDs

**3. dApp not showing data**
- Verify indexer is running
- Check INDEXER_URL
- Wait 5-10 seconds after transaction

See **DEPLOYMENT_GUIDE.md** for detailed troubleshooting.

## 🔐 Security Notes

⚠️ **Important:**
- Never commit `.env` or `.env.local` files
- Keep `ADMIN_CAP_ID` private
- Use environment variables for sensitive data
- Validate all user inputs
- Check capabilities before operations

## 📊 API Endpoints Reference

```
GET /events/moveit/board-created       # Board creation events
GET /events/moveit/board-migrated      # Board migrations
GET /events/moveit/status-added        # Status additions
GET /events/moveit/status-removed      # Status removals
GET /events/moveit/contributor-added   # New contributors
GET /events/moveit/task-created        # Task creation events
GET /events/moveit/task-updated        # Task updates
GET /events/moveit/task-status-changed # Status changes
GET /events/moveit/task-assigned       # Task assignments
```

## 🎓 Learning Resources

- [Sui Documentation](https://docs.sui.io/)
- [Sui dApp Kit](https://sdk.mystenlabs.com/dapp-kit)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [SWR Documentation](https://swr.vercel.app/)

## ✅ Checklist

Use this checklist to verify your integration:

- [ ] Smart contract deployed to testnet
- [ ] PACKAGE_ID and ADMIN_CAP_ID saved
- [ ] PostgreSQL database created
- [ ] Indexer environment configured
- [ ] Indexer database migrated
- [ ] Indexer running and processing events
- [ ] API server running on port 3001
- [ ] dApp environment configured
- [ ] dApp running on port 3000
- [ ] Wallet connected
- [ ] Board created successfully
- [ ] Board appears in indexer
- [ ] ContributorCap obtained
- [ ] Task created successfully
- [ ] Task appears in indexer
- [ ] Task status updated
- [ ] Real-time updates working

## 📝 Support

If you need help:

1. Check the documentation files
2. Review error messages in console/logs
3. Verify environment variables
4. Check Sui Explorer for transaction details
5. Inspect database with `npm run db:studio`

---

## Summary

You now have:

✅ Complete integration code  
✅ Environment configuration templates  
✅ Comprehensive documentation  
✅ Setup automation script  
✅ Working examples  

**Everything you need to integrate MoveIt with your dApp!**

Start with **DEPLOYMENT_GUIDE.md** and you'll be up and running in minutes.

Happy building! 🚀
