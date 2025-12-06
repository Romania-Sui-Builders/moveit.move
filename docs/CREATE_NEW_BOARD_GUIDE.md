# Creating a New Board - Quick Guide

## Why Create a New Board?

Your current board uses **legacy Table storage** from an older version of the contract. The new contract architecture provides:

✅ **Full Task Updates** - Edit task details anytime  
✅ **Task Deletion** - Remove completed or obsolete tasks  
✅ **Better Performance** - Faster task queries  
✅ **Future Features** - New features will only work on new boards  

## How to Create a New Board

### Step 1: Navigate to Home
- Click the "Back to Boards" button or navigate to the home page
- You should see your existing boards listed

### Step 2: Create New Board
- Click the **"Create Board"** or **"New Board"** button
- Fill in the board details:
  - **Name**: Give your board a descriptive name
  - **Description**: Brief description of the board's purpose
  - (Optional) **Statuses**: Default is "To Do", "In Progress", "Done"

### Step 3: Wait for Blockchain Confirmation
- Click "Create Board"
- Approve the transaction in your Sui wallet
- Wait for blockchain confirmation (~2-5 seconds)

### Step 4: Add Contributors
- Navigate to your new board
- Go to the **"Contributors"** tab
- Enter contributor wallet addresses
- Each contributor receives a ContributorCap NFT

### Step 5: Start Creating Tasks
- Go to the **"Tasks"** tab
- Click **"New Task"** or **"Add Task"**
- Fill in task details
- Tasks are now fully editable! ✅

## What Happens to My Old Board?

- ✅ **Data preserved**: All existing tasks remain viewable
- ✅ **Read access**: You can still see all task details
- ✅ **Create tasks**: You can still add new tasks
- ❌ **Cannot edit**: Task updates not supported
- ❌ **Cannot delete**: Task deletion not supported

## Technical Details

### Old Architecture (Legacy)
```
Board → Table<u64, Task>
├── Tasks stored in dynamic fields
└── Limited to read + create operations
```

### New Architecture (Current)
```
Board → vector<Task Object IDs>
├── Tasks are separate Sui objects
├── Full CRUD operations (Create, Read, Update, Delete)
└── Better performance and scalability
```

## Troubleshooting

### "Admin capability required to add contributors"
- Make sure `NEXT_PUBLIC_ADMIN_CAP_ID` is set in your `.env` file
- You need the AdminCap to manage boards and contributors

### "ContributorCap required to create tasks"
- Admin must add you as a contributor first
- Check the Contributors tab to see if your address is listed
- Refresh the page after being added as a contributor

### Tasks not showing after creation
- Wait a few seconds for blockchain confirmation
- Refresh the page
- Check browser console for any errors

## Migration Strategy (Optional)

If you want to migrate tasks from old board to new board:

1. **Manual Migration**: Copy task details from old to new board
2. **Keep Both**: Use old board as archive, new board for active work
3. **Export/Import** (future feature): Wait for data export functionality

## Need Help?

Check the documentation:
- `docs/TASK_UPDATE_TABLE_ISSUE.md` - Technical details
- `docs/INTEGRATION_GUIDE.md` - Contract integration
- `docs/ACCESS_CONTROL_GUIDE.md` - Contributor management

---

**Summary**: Create a new board to unlock full task management capabilities. Your legacy board remains accessible for viewing historical data.
