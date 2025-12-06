# Architecture Documentation - C4 Model

## Level 1: Context Diagram

### System Context

```
┌─────────────────────────────────────────────────────────────────┐
│                        External Systems                          │
│                                                                   │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │   Sui RPC    │         │    Wallet    │                      │
│  │   Nodes      │         │  (Sui Wallet/│                      │
│  │              │         │   Suiet)     │                      │
│  └──────────────┘         └──────────────┘                      │
│         ▲                        ▲                               │
│         │                        │                               │
│         │                        │                               │
└─────────┼────────────────────────┼───────────────────────────────┘
          │                        │
          │                        │
          │                        │
    ┌─────┴────────────────────────┴─────┐
    │                                     │
    │         MoveIt System               │
    │   (On-Chain Task Management)        │
    │                                     │
    │  ┌──────────────────────────────┐  │
    │  │   Smart Contracts (Move)     │  │
    │  │  - Board Management          │  │
    │  │  - Task Operations           │  │
    │  │  - Access Control            │  │
    │  └──────────────────────────────┘  │
    │                                     │
    │  ┌──────────────────────────────┐  │
    │  │   Frontend (Next.js)         │  │
    │  │  - Wallet Integration        │  │
    │  │  - Board UI                  │  │
    │  │  - Task Management           │  │
    │  └──────────────────────────────┘  │
    │                                     │
    └───────────────┬─────────────────────┘
                    │
                    │ uses
                    │
        ┌───────────┴──────────────┐
        │                          │
    ┌───▼───┐              ┌───────▼────┐
    │  DAO  │              │  Hackathon │
    │ Member│              │    Team    │
    │       │              │   Member   │
    └───────┘              └────────────┘
      User                     User
```

### System Description

**MoveIt** is a decentralized work coordination platform that enables teams to manage boards, tasks, and member permissions entirely on the Sui blockchain.

### Users (Actors)

#### Primary Users

1. **Board Administrator**
   - Creates and owns boards (workspaces)
   - Manages member access and roles
   - Configures board settings
   - Has full control over board state

2. **Board Contributor**
   - Creates and updates tasks
   - Assigns tasks to members
   - Updates task status and details
   - Cannot manage members or board settings

3. **Board Member (View-Only)**
   - Views tasks and board information
   - Cannot modify any data
   - For accountability and transparency

### External Systems

#### 1. Sui Blockchain Network

**Type**: Distributed Ledger
**Purpose**: Stores all application data and executes smart contracts

**Interactions**:
- Frontend submits transactions to Sui RPC
- Smart contracts execute on Sui validators
- State stored as Sui objects
- Events emitted for state changes

**Dependencies**:
- Network availability (devnet/testnet/mainnet)
- Gas token (SUI) availability
- RPC node uptime

#### 2. Wallet Providers

**Type**: Browser Extension / Mobile App
**Purpose**: User authentication and transaction signing

**Supported Wallets**:
- Sui Wallet (official)
- Suiet
- Ethos Wallet
- Any wallet supporting Sui standard

**Interactions**:
- User connects wallet to dApp
- Signs transactions for state changes
- Provides user address/identity
- Manages private keys (off-system)

#### 3. Sui RPC Nodes (Optional Future)

**Type**: API Service
**Purpose**: Query blockchain state efficiently

**Interactions**:
- Frontend queries object data
- Retrieves transaction history
- Fetches owned objects by address

### Data Flows

#### Primary Flow: Create and Manage Tasks

```
User → Wallet → MoveIt Frontend → Sui RPC → Smart Contract → Sui State
  ↑                                                               │
  └───────────────── Events / Updated State ─────────────────────┘
```

1. User initiates action in UI
2. Frontend prepares transaction
3. Wallet prompts for signature
4. Transaction submitted to Sui
5. Smart contract executes
6. State updated on-chain
7. Frontend queries new state
8. UI updates for user

### Trust Boundaries

```
┌──────────────────────────────────────────┐
│  User's Device (Trusted)                 │
│  - Wallet (private keys)                 │
│  - Browser (frontend code)               │
└──────────────────────────────────────────┘
              │
              │ HTTPS / RPC
              ▼
┌──────────────────────────────────────────┐
│  Sui Network (Trustless / Decentralized) │
│  - Smart Contracts (immutable logic)     │
│  - Object Storage (cryptographic proofs) │
│  - Validators (consensus)                │
└──────────────────────────────────────────┘
```

**Trust Model**:
- **User trusts**: Their wallet to secure private keys
- **User trusts**: Frontend to construct transactions correctly
- **User DOES NOT trust**: Any central server or authority
- **System guarantees**: Smart contract logic + blockchain consensus

### Key System Characteristics

#### Decentralization
- No central database or server
- All data stored on Sui blockchain
- No single point of failure
- Censorship resistant

#### Transparency
- All actions publicly auditable
- Transaction history immutable
- Permission changes visible on-chain
- No hidden administrator actions

#### Ownership
- Users own their board objects
- Capabilities grant explicit permissions
- Can't be taken away by platform
- Portable across interfaces

#### Composability
- Other dApps can read board/task data
- Can integrate with token systems
- Possible to build on top of protocol
- Permissionless innovation

### Non-Functional Requirements

#### Performance
- Transaction finality: < 3 seconds (Sui)
- UI responsiveness: < 100ms for reads
- Parallel task updates: 10+ simultaneous operations

#### Scalability (MVP Limits)
- Target: 10-50 boards per user
- Target: 100-500 tasks per board
- Target: 10-20 members per board

**Brutal Reality**:
- Not optimized for 1000s of tasks yet
- Query performance degrades with scale
- Need indexer for production scale

#### Security
- Smart contract auditing (post-MVP)
- Capability-based access control
- No private key storage in frontend
- Transaction simulation before signing

#### Cost
- Board creation: ~0.001 SUI
- Task operations: ~0.0001-0.001 SUI
- Target: < $0.10 per user session

### Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│  Development Environment                        │
│  - Local Sui Node (sui start)                   │
│  - Next.js Dev Server (localhost:3000)          │
│  - Hot reload for contracts and frontend        │
└─────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│  Testnet Deployment                             │
│  - Smart contracts on Sui Testnet               │
│  - Frontend on Vercel / Netlify                 │
│  - RPC via testnet.sui.io                       │
└─────────────────────────────────────────────────┘
              │
              ▼ (Future)
┌─────────────────────────────────────────────────┐
│  Mainnet Production                             │
│  - Smart contracts on Sui Mainnet               │
│  - Frontend on CDN                              │
│  - Dedicated RPC endpoints                      │
│  - Custom indexer (optional)                    │
└─────────────────────────────────────────────────┘
```

### Constraints & Assumptions

#### Technical Constraints
- Must use Sui blockchain (hackathon requirement)
- Must support wallet-based authentication
- Must be usable in 12 hours (MVP scope)
- Gas costs must be reasonable (< $0.01 per operation)

#### Business Constraints
- Free to use (no subscription model for MVP)
- Open source (likely requirement)
- No user data collection
- No central backend

#### Assumptions
- Users have wallets installed
- Users have SUI tokens for gas
- Users understand basic blockchain concepts
- Target audience is crypto-native

### Future Context (Post-MVP)

Potential external system integrations:

```
┌─────────────────────────────────────────────────┐
│  Future External Systems                        │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │   SuiNS      │  │    Enoki     │            │
│  │  (Naming)    │  │  (zkLogin)   │            │
│  └──────────────┘  └──────────────┘            │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ Custom       │  │   DAO        │            │
│  │ Indexer      │  │  Treasury    │            │
│  └──────────────┘  └──────────────┘            │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │   IPFS       │  │   Walrus     │            │
│  │ (Storage)    │  │  (Storage)   │            │
│  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────┘
```

**Potential Integrations**:
1. **SuiNS**: Human-readable names instead of addresses
2. **Enoki/zkLogin**: Gasless transactions, social login
3. **Custom Indexer**: Advanced queries and analytics
4. **DAO Treasury**: Automatic payment on task completion
5. **IPFS/Walrus**: Off-chain storage for large content
6. **Notification Services**: Off-chain alerts for task updates

---

**Summary**: MoveIt is a fully on-chain task management system where users interact through wallets, frontend submits transactions to Sui blockchain, and all state is stored as Sui objects. The system has clear trust boundaries, prioritizes transparency and ownership, and can integrate with the broader Sui ecosystem.
