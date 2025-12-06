# MoveIt - Project Overview & Elevator Pitch

## 🎯 Elevator Pitch

**MoveIt is a decentralized work coordination platform built on Sui blockchain that enables teams to manage tasks transparently with on-chain access control, immutable audit trails, and cryptographically-secured permissions.**

In 30 seconds: "Traditional project management tools are centralized, opaque, and require trust. MoveIt leverages Sui's object model to create tamper-proof task boards where every action is transparent, permissions are enforced by smart contracts, and no single entity controls your team's data."

## 🚀 What We're Building (12-Hour MVP)

A **minimal but functional** on-chain task management system that demonstrates Sui Move's capabilities while delivering real value. We're building the **absolute essentials** needed for the hackathon requirements - nothing more, nothing less.

### Core Features (Must-Have for Demo)

1. **Board Management**

   - Create a board (workspace)
   - Store name and description on-chain
   - Board ownership via Sui object ownership

2. **Access Control**

   - Two roles: Contributor and Administrator
   - Capability-based permissions (no off-chain verification)
   - Add/remove members by administrators

3. **Task CRUD**

   - Create tasks with: title, description, status, due date, effort estimation
   - Assign tasks to users
   - Update task status and attributes
   - Query tasks by board

4. **Frontend Integration**
   - Connect wallet (dApp Kit)
   - Display owned boards
   - Create boards and tasks
   - View task lists
   - Submit transactions for updates

### What We're NOT Building (Yet)

Let's be **brutally honest** about the 12-hour constraint:

- ❌ No fancy UI/UX - basic forms and lists only
- ❌ No mobile optimization - desktop first
- ❌ No complex filtering/search - basic queries only
- ❌ No user profiles or avatars
- ❌ No notifications or alerts
- ❌ No data analytics or dashboards (keep this as low-hanging fruit for bonus)

## 🎖️ Strategic Bonus Features (If Time Permits)

Prioritized by implementation time vs. judging impact:

### High ROI (2-3 hours each)

1. **Display Object** - Easy win for object visibility
2. **Clock Object** - Timestamps for created_at/updated_at
3. **Basic Analytics** - Task counts by status (simple counters)

### Medium ROI (3-4 hours each)

4. **Dynamic Fields** - Store tasks as dynamic fields on boards
5. **Move Test Coverage** - Comprehensive test scenarios

### Low Priority (4+ hours each)

6. **Configurable Workflows** - Custom status transitions
7. **Subtasks** - Parent/child relationships
8. **Comments/Discussion** - On-chain message stream

## 📊 Success Metrics for Judging

Based on judging criteria weights:

| Criteria                 | Weight | Our Strategy                                                                     |
| ------------------------ | ------ | -------------------------------------------------------------------------------- |
| Technical Implementation | 30%    | Nail the object model, use capabilities properly, demonstrate Table/Vector usage |
| Product Completeness     | 25%    | 100% of core requirements working end-to-end                                     |
| Creativity & Bonus       | 20%    | Target 2-3 bonus features max (Display, Clock, Analytics)                        |
| UX & Design              | 15%    | Clean, functional UI using Radix UI - no custom CSS wrestling                    |
| Pitch Quality            | 10%    | Clear demo script, working live demo, backup video                               |

## 🏗️ Tech Stack

### Smart Contract Layer

- **Language**: Sui Move
- **Network**: Sui Devnet/Testnet
- **Tools**: Sui CLI, Move Analyzer

### Frontend Layer

- **Framework**: Next.js 16 (App Router)
- **UI Library**: Radix UI + Tailwind CSS
- **Blockchain SDK**: @mysten/dapp-kit, @mysten/sui
- **State Management**: TanStack Query (React Query)

### Development Tools

- **Testing**: Move unit tests (minimum 70% coverage target)
- **Type Safety**: TypeScript strict mode
- **Code Quality**: ESLint, Prettier

## 🚨 Risk Factors (Brutal Honesty)

### High Risk

- **Sui object model complexity** - Shared vs. owned objects decision is critical
- **Frontend-blockchain sync** - State management can get messy quickly
- **Time management** - Feature creep is the enemy

### Medium Risk

- **Access control bugs** - Capability management needs careful testing
- **Gas optimization** - Poor design could make transactions expensive
- **Team coordination** - 5 people need clear task separation

### Mitigation Strategy

- Timebox each feature strictly
- Use proven patterns from Sui examples
- Prioritize working demo over perfect code
- Cut features ruthlessly if behind schedule

## 🎬 Demo Story (5-Minute Pitch)

1. **Problem** (30 sec) - Centralized PM tools, trust issues, data ownership
2. **Solution** (30 sec) - Decentralized, transparent, cryptographically secured
3. **Live Demo** (3 min):
   - Create a board
   - Add a member with Contributor role
   - Create a task, assign it
   - Update task status
   - Show on-chain verification
4. **Sui Integration** (30 sec) - Capabilities, object model, Move features
5. **Future** (30 sec) - Bonus features roadmap

## 🔮 Post-Hackathon Extension Path

If we want to continue after the hackathon:

**Phase 1 (Week 1-2)**: Polish + bonus features

- Configurable workflows
- Subtasks and hierarchies
- Comments system

**Phase 2 (Month 1)**: Real-world ready

- Mobile responsive
- SuiNS integration for member invites
- zkLogin + Enoki for gasless UX

**Phase 3 (Month 2+)**: Advanced features

- Real-time updates via indexer
- Advanced analytics
- Token rewards for task completion
- DAO governance for boards

---

**Bottom Line**: We're building a **functional MVP that nails the requirements** and demonstrates Sui's unique features. We're not building the next Jira - we're building proof that decentralized work coordination is possible and valuable.
