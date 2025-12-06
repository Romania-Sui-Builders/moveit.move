# MoveIt Deployment Checklist

Use this checklist to ensure a successful deployment and integration.

## Pre-Deployment

### Prerequisites Check
- [ ] Sui CLI installed (`sui --version`)
- [ ] Node.js v18+ installed (`node --version`)
- [ ] PostgreSQL installed and running (`pg_isready`)
- [ ] Sui wallet configured with testnet SUI
- [ ] Git repository initialized

### Environment Preparation
- [ ] PostgreSQL database created
- [ ] Database user has correct permissions
- [ ] Connection string tested
- [ ] Firewall rules configured (if needed)

---

## Contract Deployment

### Build & Test
- [ ] Contract builds successfully (`sui move build`)
- [ ] Tests pass (`sui move test`)
- [ ] No warnings or errors
- [ ] Contract reviewed for security

### Deployment
- [ ] Contract published to testnet
- [ ] **PACKAGE_ID** saved: ________________
- [ ] **ADMIN_CAP_ID** saved: ________________
- [ ] Transaction verified on Sui Explorer
- [ ] Contract appears in wallet

### Verification
- [ ] Package ID accessible on Sui Explorer
- [ ] AdminCap object in your wallet
- [ ] Display objects created and transferred
- [ ] No deployment errors

---

## Indexer Setup

### Configuration
- [ ] `.env` file created in `indexer-ts/`
- [ ] `NETWORK` set correctly
- [ ] `PACKAGE_ID` matches deployment
- [ ] `DATABASE_URL` correct and tested
- [ ] `POLLING_INTERVAL_MS` configured
- [ ] `PORT` available (3001)

### Installation
- [ ] Dependencies installed (`npm install`)
- [ ] Prisma client generated
- [ ] Database migrations run successfully
- [ ] No installation errors

### Testing
- [ ] Indexer starts without errors
- [ ] Connects to Sui network
- [ ] Connects to database
- [ ] Event listener initialized
- [ ] No connection errors

### API Server
- [ ] API server starts on port 3001
- [ ] Endpoints accessible (`curl http://localhost:3001/events/moveit/board-created`)
- [ ] Returns valid JSON
- [ ] CORS configured correctly
- [ ] No runtime errors

---

## dApp Configuration

### Environment Setup
- [ ] `.env.local` file created
- [ ] `NEXT_PUBLIC_NETWORK` set
- [ ] `NEXT_PUBLIC_PACKAGE_ID` matches deployment
- [ ] `NEXT_PUBLIC_ADMIN_CAP_ID` correct
- [ ] `NEXT_PUBLIC_CLOCK_ID` is `0x6`
- [ ] `NEXT_PUBLIC_INDEXER_URL` correct

### Installation
- [ ] Dependencies installed (`npm install`)
- [ ] No installation errors
- [ ] TypeScript compiles without errors
- [ ] No missing dependencies

### Build
- [ ] Development build succeeds (`npm run dev`)
- [ ] Production build succeeds (`npm run build`)
- [ ] No build errors
- [ ] No TypeScript errors

### Testing
- [ ] App loads at http://localhost:3000
- [ ] No console errors
- [ ] Wallet connection works
- [ ] Network configuration correct

---

## Integration Testing

### Basic Functionality
- [ ] Wallet connects successfully
- [ ] Network displays correctly
- [ ] Balance shows (if implemented)
- [ ] No connection errors

### Board Management (Admin)
- [ ] Create board form loads
- [ ] Can input board name and description
- [ ] Can add initial statuses
- [ ] Transaction signs successfully
- [ ] Transaction confirms on chain
- [ ] Board creation event in indexer (wait 5-10 seconds)
- [ ] Board appears in UI

### Contributor Setup
- [ ] Admin can add contributor
- [ ] Contributor receives ContributorCap
- [ ] ContributorCap appears in wallet
- [ ] ContributorAdded event in indexer

### Task Management (Contributor)
- [ ] Create task form loads
- [ ] Can input task details
- [ ] Can select assignees
- [ ] Transaction signs successfully
- [ ] Transaction confirms on chain
- [ ] Task creation event in indexer (wait 5-10 seconds)
- [ ] Task appears in board

### Task Operations
- [ ] Update task works
- [ ] Change task status works
- [ ] Assign task works
- [ ] All events appear in indexer
- [ ] UI updates reflect changes

### Real-time Updates
- [ ] Boards refresh automatically (every 5s)
- [ ] Tasks refresh automatically (every 3s)
- [ ] Manual refresh works
- [ ] No stale data displayed

---

## Data Verification

### Indexer Database
- [ ] Open Prisma Studio (`npm run db:studio`)
- [ ] BoardCreated records exist
- [ ] TaskCreated records exist
- [ ] Event data is correct
- [ ] Timestamps are accurate
- [ ] No duplicate events

### API Endpoints
- [ ] `/events/moveit/board-created` returns data
- [ ] `/events/moveit/task-created` returns data
- [ ] `/events/moveit/task-status-changed` returns data
- [ ] All events have correct structure
- [ ] Timestamps are in milliseconds

### Smart Contract State
- [ ] Board object is shared
- [ ] Board has correct statuses
- [ ] Tasks exist in board's table
- [ ] Task counter increments
- [ ] Capabilities work correctly

---

## Performance & Monitoring

### Indexer Performance
- [ ] Events processed within 5-10 seconds
- [ ] No memory leaks
- [ ] Database queries are fast
- [ ] API responses under 100ms
- [ ] No dropped events

### dApp Performance
- [ ] Initial load under 3 seconds
- [ ] Transactions confirm quickly
- [ ] UI responsive
- [ ] No lag when updating
- [ ] Smooth user experience

### Error Handling
- [ ] Transaction errors show user-friendly messages
- [ ] Network errors handled gracefully
- [ ] Loading states work correctly
- [ ] Error boundaries in place (if implemented)
- [ ] Failed transactions don't break UI

---

## Security Review

### Environment Variables
- [ ] `.env` files not committed to git
- [ ] `.env.local` not committed to git
- [ ] `.env.example` files provided
- [ ] Sensitive data in environment variables only
- [ ] `.gitignore` configured correctly

### Capabilities
- [ ] AdminCap ID not exposed in frontend code
- [ ] Only admin has AdminCap
- [ ] Contributors have correct ContributorCaps
- [ ] Capability checks in place
- [ ] No capability leaks

### Input Validation
- [ ] All user inputs validated
- [ ] Addresses validated before use
- [ ] Dates validated
- [ ] String lengths limited
- [ ] No SQL injection risks

---

## Documentation

### Code Documentation
- [ ] Functions have comments
- [ ] Complex logic explained
- [ ] Type definitions clear
- [ ] README files present
- [ ] API documented

### User Documentation
- [ ] INTEGRATION_GUIDE.md complete
- [ ] DEPLOYMENT_GUIDE.md complete
- [ ] INTEGRATION_QUICK_START.md complete
- [ ] Code examples work
- [ ] Screenshots added (optional)

---

## Production Readiness

### Indexer Production
- [ ] Environment variables set in production
- [ ] Database connection secure (SSL)
- [ ] API rate limiting implemented (optional)
- [ ] Monitoring set up (optional)
- [ ] Logging configured
- [ ] Backup strategy in place
- [ ] Auto-restart on failure

### dApp Production
- [ ] Environment variables set
- [ ] Production build optimized
- [ ] Analytics configured (optional)
- [ ] Error tracking set up (optional)
- [ ] CDN configured (optional)
- [ ] SSL certificate active
- [ ] Domain configured

### Deployment
- [ ] Indexer deployed to hosting service
- [ ] dApp deployed to hosting service
- [ ] Both services accessible via HTTPS
- [ ] Environment variables verified
- [ ] Health checks passing
- [ ] No production errors

---

## Post-Deployment

### Verification
- [ ] Create test board in production
- [ ] Create test task in production
- [ ] Verify events in production indexer
- [ ] Test all major features
- [ ] Check performance metrics
- [ ] No errors in production logs

### Monitoring
- [ ] Uptime monitoring configured (optional)
- [ ] Error alerts set up (optional)
- [ ] Database backups scheduled
- [ ] Logs being collected
- [ ] Metrics being tracked

### Maintenance
- [ ] Team has access to deployments
- [ ] Rollback procedure documented
- [ ] Update procedure documented
- [ ] Contact information for support
- [ ] Maintenance window scheduled (if needed)

---

## Final Checklist

- [ ] All tests passing
- [ ] No critical errors
- [ ] Documentation complete
- [ ] Team trained
- [ ] Users can access
- [ ] Features working as expected
- [ ] Performance acceptable
- [ ] Security reviewed
- [ ] Backup strategy in place
- [ ] Monitoring active

---

## Sign-off

**Deployed by:** ___________________  
**Date:** ___________________  
**Environment:** [ ] Testnet [ ] Mainnet  
**Version:** ___________________

**Package ID:** ___________________  
**Admin Cap ID:** ___________________  
**Indexer URL:** ___________________  
**dApp URL:** ___________________

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

## Emergency Contacts

**Smart Contract Issues:**
- Check Sui Explorer: https://suiexplorer.com

**Indexer Issues:**
- Check logs: `pm2 logs` or service logs
- Check database: `npm run db:studio`

**dApp Issues:**
- Check browser console
- Check network tab
- Verify environment variables

**Need Help?**
- Review DEPLOYMENT_GUIDE.md
- Check INTEGRATION_QUICK_START.md
- Inspect transaction on Sui Explorer
- Check indexer logs for processing errors

---

**Congratulations on your deployment! 🎉**
