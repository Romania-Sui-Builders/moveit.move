# Deployment & Setup Guide

This guide walks you through deploying the MoveIt smart contract, setting up the indexer, and configuring the dApp.

## Prerequisites

- [Sui CLI](https://docs.sui.io/guides/developer/getting-started/sui-install) installed
- [Node.js](https://nodejs.org/) v18 or higher
- [PostgreSQL](https://www.postgresql.org/) database
- A Sui wallet with testnet SUI tokens

---

## Step 1: Deploy Smart Contract

### 1.1 Build and Publish

```bash
cd contract/moveit

# Build the contract
sui move build

# Publish to testnet
sui client publish --gas-budget 100000000
```

### 1.2 Save Deployment Information

After publishing, you'll see output like this:

```
Package ID: 0xabcd1234...
AdminCap Object ID: 0xefgh5678...
```

**Save these values!** You'll need them for the next steps.

### 1.3 Verify Deployment

```bash
# Check the package on Sui Explorer
open "https://suiexplorer.com/object/YOUR_PACKAGE_ID?network=testnet"
```

---

## Step 2: Set Up PostgreSQL Database

### 2.1 Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE moveit_indexer;

# Exit psql
\q
```

### 2.2 Set Database URL

The connection string format is:
```
postgresql://username:password@host:port/database
```

Example:
```
postgresql://postgres:password@localhost:5432/moveit_indexer
```

---

## Step 3: Configure Indexer

### 3.1 Create Environment File

```bash
cd indexer-ts

# Copy example file
cp .env.example .env

# Edit .env file
nano .env
```

### 3.2 Update Environment Variables

```env
NETWORK=testnet
PACKAGE_ID=0xYOUR_PACKAGE_ID_FROM_STEP_1
DATABASE_URL=postgresql://postgres:password@localhost:5432/moveit_indexer
POLLING_INTERVAL_MS=5000
PORT=3001
NODE_ENV=development
```

### 3.3 Install Dependencies and Set Up Database

```bash
npm install

# Run migrations
npm run db:setup:dev
```

### 3.4 Start Indexer

Open two terminal windows:

**Terminal 1 - Event Indexer:**
```bash
npm run indexer
```

You should see: "Setting up event listeners..."

**Terminal 2 - API Server:**
```bash
npm run api:dev
```

You should see: "Server listening on port 3001"

### 3.5 Verify Indexer

```bash
# Test API endpoint
curl http://localhost:3001/events/moveit/board-created
```

Should return: `[]` (empty array initially)

---

## Step 4: Configure dApp

### 4.1 Create Environment File

```bash
cd dapp/sui-tasks

# Copy example file
cp .env.local.example .env.local

# Edit .env.local file
nano .env.local
```

### 4.2 Update Environment Variables

```env
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=0xYOUR_PACKAGE_ID_FROM_STEP_1
NEXT_PUBLIC_ADMIN_CAP_ID=0xYOUR_ADMIN_CAP_ID_FROM_STEP_1
NEXT_PUBLIC_CLOCK_ID=0x6
NEXT_PUBLIC_INDEXER_URL=http://localhost:3001
NEXT_PUBLIC_EXPLORER_URL=https://suiexplorer.com/?network=testnet
```

### 4.3 Install Dependencies

```bash
npm install
```

### 4.4 Start Development Server

```bash
npm run dev
```

The dApp should be available at: http://localhost:3000

---

## Step 5: Test the Integration

### 5.1 Connect Wallet

1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Connect your Sui wallet

### 5.2 Create a Board (Admin)

```bash
# Using the dApp UI:
1. Navigate to admin panel
2. Click "Create Board"
3. Enter board name and description
4. Add initial statuses: ["To Do", "In Progress", "Done"]
5. Submit transaction
```

### 5.3 Verify in Indexer

Wait 5-10 seconds, then check the indexer:

```bash
curl http://localhost:3001/events/moveit/board-created
```

You should see your board creation event!

### 5.4 Get Board Object ID

Check Sui Explorer for the board object ID:

```bash
# Find it in the transaction effects under "Created Objects"
open "https://suiexplorer.com/?network=testnet"
```

### 5.5 Add Yourself as Contributor

Using the dApp or CLI:

```bash
# The transaction will create a ContributorCap for you
```

### 5.6 Create a Task

```bash
# Using the dApp UI:
1. Navigate to your board
2. Click "Create Task"
3. Fill in task details
4. Submit transaction
```

### 5.7 Verify Task in Indexer

```bash
curl http://localhost:3001/events/moveit/task-created
```

---

## Step 6: Production Deployment

### 6.1 Deploy Indexer

**Railway / Render / Fly.io:**

1. Create new PostgreSQL database
2. Deploy indexer service
3. Set environment variables
4. Ensure both indexer and API server are running

**Environment Variables:**
```env
NETWORK=testnet
PACKAGE_ID=0xYOUR_PACKAGE_ID
DATABASE_URL=postgresql://...
PORT=3001
NODE_ENV=production
```

### 6.2 Deploy dApp

**Vercel / Netlify:**

1. Connect GitHub repository
2. Set environment variables
3. Deploy

**Environment Variables:**
```env
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=0xYOUR_PACKAGE_ID
NEXT_PUBLIC_ADMIN_CAP_ID=0xYOUR_ADMIN_CAP_ID
NEXT_PUBLIC_CLOCK_ID=0x6
NEXT_PUBLIC_INDEXER_URL=https://your-indexer-url.com
```

---

## Troubleshooting

### Indexer not processing events

**Problem:** Indexer logs show no events

**Solutions:**
- Verify PACKAGE_ID matches deployed contract
- Check network setting (testnet vs devnet)
- Ensure transactions are successful on Sui Explorer
- Restart indexer with: `npm run indexer`

### Database connection errors

**Problem:** Cannot connect to PostgreSQL

**Solutions:**
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format
- Test connection: `psql postgresql://...`
- Check firewall settings

### Transaction failures

**Problem:** Transactions fail with errors

**Solutions:**
- Ensure you have testnet SUI tokens
- Check gas budget (increase if needed)
- Verify you have correct capability (AdminCap or ContributorCap)
- Check board/task IDs are correct
- View error in Sui Explorer

### dApp can't connect to indexer

**Problem:** Frontend shows no data

**Solutions:**
- Verify indexer is running: `curl http://localhost:3001/events/moveit/board-created`
- Check NEXT_PUBLIC_INDEXER_URL is correct
- Check browser console for CORS errors
- Verify API proxy route is working

---

## Useful Commands

### Contract
```bash
# Build
cd contract/moveit && sui move build

# Test
sui move test

# Publish
sui client publish --gas-budget 100000000
```

### Indexer
```bash
cd indexer-ts

# Reset database
npm run db:reset:dev

# View database
npm run db:studio

# Fast indexing (1 second polling)
npm run indexer:fast

# Slow indexing (10 second polling)
npm run indexer:slow
```

### dApp
```bash
cd dapp/sui-tasks

# Development
npm run dev

# Build
npm run build

# Production
npm start
```

---

## Next Steps

1. ✅ Deploy contract to testnet
2. ✅ Set up indexer with PostgreSQL
3. ✅ Configure dApp with correct IDs
4. ✅ Test board creation
5. ✅ Test task management
6. 📝 Deploy to production
7. 📝 Set up monitoring
8. 📝 Add analytics

---

## Support

If you encounter issues:

1. Check the [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for architecture details
2. Review transaction on [Sui Explorer](https://suiexplorer.com/?network=testnet)
3. Check indexer logs
4. Verify database state: `npm run db:studio`
5. Check browser console for frontend errors
