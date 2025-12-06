# 🚀 Quick Start Commands

## 1. Get Your AdminCap ID

```bash
# Switch to testnet
sui client switch --env testnet

# List your objects
sui client objects

# Find the AdminCap object ID and copy it
# Look for: Type ending with "::moveit::AdminCap"
```

## 2. Update .env

```bash
cd /Users/paulserban/Desktop/projects/sui-bootcamp-hackathon/moveit.move/dapp/sui-tasks

# Edit .env file
nano .env

# Update this line with your actual AdminCap ID:
NEXT_PUBLIC_ADMIN_CAP_ID=0xYOUR_ADMIN_CAP_ID_HERE
```

## 3. Start Development Server

```bash
# Install dependencies (if needed)
npm install

# Start the server
npm run dev
```

## 4. Open Your App

Open browser to: http://localhost:3000

## 5. Connect Wallet

1. Click "Connect Wallet"
2. **IMPORTANT**: Make sure your wallet shows "Testnet"
3. If it says "Devnet", switch to Testnet in wallet
4. Reconnect

## 6. Create Your First Board

1. Click "Create Board"
2. Enter name and description
3. Choose initial statuses (e.g., To Do, In Progress, Done)
4. Submit

## 7. Add a Contributor

1. Go to board settings
2. Click "Add Contributor"
3. Enter wallet address
4. This gives them a ContributorCap

## 8. Create a Task

1. Go to the board
2. Click "Create Task"
3. **NOTE**: You need a ContributorCap to create tasks
4. If you're the admin, add yourself as a contributor first

## Troubleshooting

### "Admin capability not configured"
→ Did you update `.env` with your AdminCap ID?
→ Did you restart the dev server?

### "Package object does not exist"
→ Is your wallet on Testnet?
→ Check wallet network selector

### "No module found with module name board"
→ This is fixed! Clear cache: Ctrl+Shift+R or Cmd+Shift+R

### "Invalid board ID"
→ Make sure you're using the correct ContributorCap for that Board

## Quick Reference

| Action | Required | Command |
|--------|----------|---------|
| Create Board | AdminCap | `moveit::create_board` |
| Add Contributor | AdminCap | `moveit::add_contributor` |
| Create Task | ContributorCap | `moveit::create_task` |
| Update Task Status | ContributorCap | `moveit::update_task_status` |

## Environment Variables

```env
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=0x7dcd36441e0275a8e0d23f02cf6a3ec7e5aaabebf98374ad149a2921901e769a
NEXT_PUBLIC_ADMIN_CAP_ID=0xYOUR_ADMIN_CAP_ID
NEXT_PUBLIC_CLOCK_ID=0x6
NEXT_PUBLIC_INDEXER_URL=https://moveitmove-production.up.railway.app
```

## Important Notes

✅ **Network**: Testnet (not Devnet)
✅ **Module**: `moveit::moveit` (not `board`)
✅ **AdminCap**: Required for board/contributor operations
✅ **ContributorCap**: Required for task operations
✅ **Package ID**: Already correct in `.env`

## Success Indicators

When everything works:
- ✅ Wallet connects without network warning
- ✅ Can create boards
- ✅ Transactions complete successfully
- ✅ Can view transactions on SuiExplorer

## Explorer Links

- **Package**: https://suiexplorer.com/object/0x7dcd36441e0275a8e0d23f02cf6a3ec7e5aaabebf98374ad149a2921901e769a?network=testnet
- **Your Transactions**: https://suiexplorer.com/address/YOUR_ADDRESS?network=testnet
- **Indexer**: https://moveitmove-production.up.railway.app

## Need Help?

Check these files:
- `INTEGRATION_SUMMARY.md` - Complete overview
- `CONTRACT_INTEGRATION_FIXED.md` - Detailed integration guide
- `GET_ADMIN_CAP.md` - AdminCap instructions
- `NETWORK_FIX.md` - Network troubleshooting

---

🎉 **You're ready to go!** Just get that AdminCap ID and start building!
