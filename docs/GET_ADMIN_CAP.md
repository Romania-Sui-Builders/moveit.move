# Quick Start: Get Your AdminCap ID

## Method 1: Using Sui CLI (Recommended)

```bash
# Make sure you're on the right network
sui client switch --env testnet

# List all your owned objects
sui client objects

# Look for output like this:
# ╭──────────────────────────────────────────────────────────────────────╮
# │ Object ID      │ Version │ Type                                       │
# ├──────────────────────────────────────────────────────────────────────┤
# │ 0xABC123...    │ 1       │ 0x7dcd...::moveit::AdminCap               │
# ╰──────────────────────────────────────────────────────────────────────╯
```

Copy the Object ID that has type ending in `::moveit::AdminCap`

## Method 2: Using the Transaction Explorer

1. Find your deployment transaction digest
2. Go to: https://suiexplorer.com/txblock/YOUR_TX_DIGEST?network=testnet
3. Look in the "Created Objects" section
4. Find the object with type `AdminCap`
5. Copy its Object ID

## Method 3: Using JSON Output

```bash
sui client objects --json | grep -A 5 "AdminCap"
```

Example output:
```json
{
  "objectId": "0xABC123...",
  "type": "0x7dcd36441e0275a8e0d23f02cf6a3ec7e5aaabebf98374ad149a2921901e769a::moveit::AdminCap",
  "version": "1"
}
```

## Method 4: Check Deployment Output

When you deployed the contract, look for output like:

```
Created Objects:
  ┌──
  │ ObjectID: 0xABC123...
  │ Sender: 0x...
  │ Owner: Account Address ( 0x... )
  │ ObjectType: 0x7dcd...::moveit::AdminCap
  │ Version: 1
  │ Digest: ...
  └──
```

## Update Your .env File

Once you have the AdminCap ID:

```bash
# Edit the .env file
cd /Users/paulserban/Desktop/projects/sui-bootcamp-hackathon/moveit.move/dapp/sui-tasks
nano .env
```

Replace this line:
```env
NEXT_PUBLIC_ADMIN_CAP_ID=YOUR_ADMIN_CAP_ID_HERE
```

With your actual AdminCap ID:
```env
NEXT_PUBLIC_ADMIN_CAP_ID=0xYOUR_ACTUAL_ADMIN_CAP_OBJECT_ID
```

## Verify It's Correct

```bash
# Check the object details
sui client object <YOUR_ADMIN_CAP_ID>
```

You should see:
- Owner: Your address
- Type: Ends with `::moveit::AdminCap`
- Version: 1 or higher

## Start Your App

```bash
npm run dev
```

## Test It

1. Open http://localhost:3000
2. Connect your wallet
3. Try creating a board
4. If you see "Unable to process transaction", check:
   - AdminCap ID is correct in .env
   - Wallet is on testnet
   - You own the AdminCap object

## Common Issues

### "Object not found"
- Check you copied the full object ID
- Make sure you're on the same network (testnet)

### "Invalid capability"
- The AdminCap must be owned by your wallet address
- Check `sui client active-address` matches the owner

### "Still says YOUR_ADMIN_CAP_ID_HERE"
- Restart your development server after editing .env
- Make sure .env file is in the correct directory

## Success!

You should now be able to:
- ✅ Create boards
- ✅ Add contributors
- ✅ Manage statuses

Next: Get a ContributorCap to create tasks!
