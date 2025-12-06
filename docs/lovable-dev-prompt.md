# Lovable.dev Prompt for MoveIt - Sui Blockchain Task Management dApp

## Project Overview

Build **MoveIt** - a decentralized work coordination platform on Sui blockchain. This is a task management system where boards, tasks, and permissions are stored on-chain as Sui objects with cryptographic access control.

**Core Value Proposition**: Transparent, ownable, crypto-native work coordination for DAOs and blockchain teams. No centralized servers, no trust required, all actions immutably recorded on Sui blockchain.

---

## Tech Stack Requirements

### Framework & Language
- **Next.js 16** with App Router
- **TypeScript** (strict mode)
- **React 19.2.0**

### UI & Styling
- **Radix UI** (@radix-ui/themes ^3.2.1) for components
- **Radix UI Colors** for color system
- **Tailwind CSS 4** for utility styling
- Dark mode by default (Theme appearance="dark")

### Blockchain Integration
- **@mysten/dapp-kit** (0.19.11) - Sui wallet integration
- **@mysten/sui** (1.45.2) - Sui SDK
- **@tanstack/react-query** (^5.87.1) - State management for blockchain data

### Already Set Up
The project already has:
- Wallet providers configured
- Network configuration (`core/networkConfig.ts`)
- Basic app shell with providers
- Package dependencies installed

---

## Core Features to Build

### 1. Wallet Connection & Status (Priority: CRITICAL)

**Component**: `WalletStatus.tsx`

**Requirements**:
- Display wallet connection status
- Show connected address (truncated: `0x1234...5678`)
- Show SUI balance
- Connect wallet button (use dapp-kit's `ConnectButton`)
- Disconnect functionality
- Network indicator (Testnet/Devnet)

**UI Design**:
- Top-right corner placement
- Clean, minimal design
- Green dot for connected, red for disconnected
- Dropdown menu for wallet details and disconnect

**Code Pattern**:
```typescript
import { ConnectButton, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';

export function WalletStatus() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  
  // Show balance, address, connection status
  // Use Radix UI Button and DropdownMenu
}
```

---

### 2. Board Management (Priority: HIGH)

**Pages**:
- `/boards` - List all boards owned by user
- `/boards/[boardId]` - Board detail with tasks

**Component**: `BoardList.tsx`

**Requirements**:
- Display grid of board cards (3 columns on desktop)
- Each card shows:
  - Board name (large, bold)
  - Description (2 lines max, truncate with "...")
  - Member count (icon + number)
  - Created date (relative: "2 days ago")
  - Click to navigate to board detail
- "Create Board" button (prominent, primary color)
- Empty state: "No boards yet. Create your first board!"
- Loading skeleton while fetching

**Component**: `BoardForm.tsx` (Dialog/Modal)

**Requirements**:
- Form fields:
  - Name (required, max 100 chars, text input)
  - Description (optional, max 500 chars, textarea)
- Submit button: "Create Board"
- Cancel button
- Validation:
  - Name required
  - Show character count
  - Disable submit if invalid
- On submit:
  - Build Sui transaction
  - Request wallet signature
  - Show loading state
  - Show success toast
  - Close modal and refresh boards
- Error handling:
  - Show error toast if transaction fails
  - Preserve form data on error

**Data Fetching Pattern**:
```typescript
// Use TanStack Query to fetch boards
const { data: boards, isLoading } = useQuery({
  queryKey: ['boards', address],
  queryFn: async () => {
    const { data } = await suiClient.getOwnedObjects({
      owner: address,
      filter: { StructType: `${PACKAGE_ID}::board::Board` },
      options: { showContent: true }
    });
    return data.map(obj => parseBoard(obj));
  },
  enabled: !!address
});
```

**Transaction Pattern**:
```typescript
// Use mutation to create board
const createBoard = useMutation({
  mutationFn: async ({ name, description }) => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::board::create`,
      arguments: [
        tx.pure.string(name),
        tx.pure.string(description),
        tx.object('0x6') // Clock object
      ]
    });
    return signAndExecuteTransaction({ transaction: tx });
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['boards']);
    toast.success('Board created!');
  }
});
```

---

### 3. Task Management (Priority: HIGH)

**Component**: `TaskList.tsx`

**Requirements**:
- Display tasks in table/list format
- Columns:
  - Checkbox (visual only for now)
  - Title (bold, clickable)
  - Status badge (TODO/IN_PROGRESS/DONE with colors)
  - Assignee (address or "Unassigned")
  - Due date (formatted: "Dec 15, 2025" or "Overdue" in red)
  - Effort (hours)
- Filter by status (tabs: All, TODO, In Progress, Done)
- Sort by: Due date, Created date, Status
- "Create Task" button
- Empty state: "No tasks yet. Create the first one!"
- Task row click → open task detail modal

**Component**: `TaskForm.tsx` (Dialog/Modal)

**Requirements**:
- Form fields:
  - Title (required, max 200 chars)
  - Description (optional, max 2000 chars, rich textarea)
  - Assignee (address input, validate Sui address format)
  - Status (dropdown: TODO, In Progress, Done)
  - Due date (date picker, can't be in past)
  - Effort hours (number input, 0-1000)
- Two modes: Create and Edit
- Validation for all fields
- Submit creates Sui transaction
- Show loading during transaction
- Success/error toasts

**Component**: `TaskCard.tsx` (Alternative card view)

**Requirements**:
- Card layout option (toggle with list view)
- Show title, status badge, assignee, due date
- Click to expand details
- Quick action buttons: Edit, Change Status
- Drag-and-drop to change status (bonus feature)

**Status Update Pattern**:
```typescript
const updateTaskStatus = useMutation({
  mutationFn: async ({ taskId, newStatus, capabilityId }) => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::task::update_status`,
      arguments: [
        tx.object(taskId),
        tx.pure.u8(newStatus),
        tx.object(capabilityId), // ContributorCap
        tx.object('0x6') // Clock
      ]
    });
    return signAndExecuteTransaction({ transaction: tx });
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['tasks']);
    toast.success('Task updated!');
  }
});
```

---

### 4. Member Management (Priority: MEDIUM)

**Component**: `MemberManager.tsx`

**Requirements**:
- Display current board members
- Show member address (truncated) and role badge
- "Add Member" button (only visible to admins)
- Add member form:
  - Address input (validate Sui address)
  - Role selector (Admin or Contributor radio buttons)
  - Explanation text for each role
- Remove member button (only admins, confirmation dialog)
- Show current user's role prominently
- Permission checks before showing actions

**Permission Display**:
- Clear indicators for what user can do:
  - ✅ "You can create and update tasks" (Contributor)
  - ✅ "You can manage members" (Admin)
  - ❌ "View only" (if no capability)

---

### 5. Board Detail Page (Priority: HIGH)

**Route**: `/boards/[boardId]/page.tsx`

**Layout**:
```
+----------------------------------------------------------+
| [< Back to Boards]                    [Wallet Status]    |
+----------------------------------------------------------+
| Board Name (H1)                                          |
| Description                                              |
| [Members: 5] [Tasks: 12]                                 |
| [Add Member] (if admin)                                  |
+----------------------------------------------------------+
| [Create Task]                 [Filter: All ▼] [View: List/Card] |
+----------------------------------------------------------+
| Task List / Task Cards                                    |
|                                                           |
+----------------------------------------------------------+
```

**Features**:
- Breadcrumb navigation
- Board header with metadata
- Member count (click to expand member list)
- Task count by status
- Integrated task list
- Create task button

---

### 6. Navigation & Layout (Priority: HIGH)

**Component**: `app/layout.tsx`

**Requirements**:
- Top navigation bar:
  - Logo/Title "MoveIt" (left)
  - Navigation links: Boards, About (center)
  - Wallet status (right)
- Sticky navigation
- Dark theme background
- Responsive (collapse to hamburger on mobile)

**Component**: `Navigation.tsx`

**Requirements**:
- Active route highlighting
- Smooth transitions
- Wallet connection required indicator for protected routes

---

### 7. Landing Page (Priority: MEDIUM)

**Route**: `/` or `/home`

**Content**:
- Hero section:
  - "Decentralized Work Coordination on Sui"
  - Tagline: "Own your tasks. Trust the blockchain."
  - "Connect Wallet to Start" CTA
- Features section (3 columns):
  - 🔗 "On-Chain Ownership" - Your boards, your data
  - 🔐 "Cryptographic Access Control" - Permissions via capabilities
  - 📊 "Transparent & Auditable" - Every action recorded
- How it works (3 steps):
  1. Connect wallet
  2. Create a board
  3. Manage tasks with your team
- "Get Started" button → /boards

---

## Design System

### Colors (Radix UI Colors)
- **Primary**: Use `violet` scale for main actions
- **Success**: Use `green` scale for completed tasks
- **Warning**: Use `amber` scale for overdue items
- **Error**: Use `red` scale for errors
- **Neutral**: Use `slate` scale for backgrounds and text

### Status Colors
- **TODO**: Gray/Slate
- **IN_PROGRESS**: Blue/Cyan
- **DONE**: Green
- **BLOCKED**: Red (bonus)

### Typography
- **Headings**: Bold, clear hierarchy (H1: 2.5rem, H2: 2rem, H3: 1.5rem)
- **Body**: 1rem, line-height 1.5
- **Code/Addresses**: Monospace font

### Spacing
- Use Tailwind spacing scale (4, 8, 16, 24, 32, 48px)
- Consistent padding in cards (16-24px)
- Generous whitespace

### Components
- Use Radix UI primitives:
  - Button
  - Dialog (for modals)
  - DropdownMenu
  - Select
  - TextField
  - TextArea
  - Badge
  - Card
  - Tabs
  - Toast (for notifications)

---

## Data Types & Interfaces

```typescript
// types/board.ts
export interface Board {
  id: string;
  name: string;
  description: string;
  owner: string;
  createdAt: number;
  memberCount: number;
}

// types/task.ts
export enum TaskStatus {
  TODO = 0,
  IN_PROGRESS = 1,
  DONE = 2,
}

export interface Task {
  id: string;
  boardId: string;
  title: string;
  description: string;
  assignee: string;
  status: TaskStatus;
  dueDate: number; // Unix timestamp
  effortHours: number;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

// types/capability.ts
export interface Capability {
  id: string;
  boardId: string;
  type: 'admin' | 'contributor';
}

export interface Permission {
  canCreateTasks: boolean;
  canUpdateTasks: boolean;
  canDeleteTasks: boolean;
  canManageMembers: boolean;
}
```

---

## Custom Hooks to Implement

### `useBoards(address?: string)`
Fetches all boards owned by the user.

### `useBoard(boardId: string)`
Fetches a specific board's details.

### `useTasks(boardId: string, filters?)`
Fetches tasks for a board with optional filtering.

### `useCapabilities(address: string, boardId: string)`
Fetches user's capabilities (AdminCap, ContributorCap) for a board.

### `usePermissions(boardId: string)`
Determines what the current user can do on a board.

### `useCreateBoard()`
Mutation hook to create a board.

### `useCreateTask(boardId: string)`
Mutation hook to create a task.

### `useUpdateTask()`
Mutation hook to update a task.

### `useAddMember(boardId: string)`
Mutation hook to add a member (requires AdminCap).

---

## Configuration Files

### `core/networkConfig.ts` (already exists)
```typescript
import { getFullnodeUrl } from '@mysten/sui/client';
import { createNetworkConfig } from '@mysten/dapp-kit';

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: { url: getFullnodeUrl('devnet') },
    testnet: { url: getFullnodeUrl('testnet') },
  });

export { networkConfig, useNetworkVariable, useNetworkVariables };
```

### `core/constants.ts` (create this)
```typescript
// Replace with actual deployed contract address
export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || '0x...';
export const CLOCK_ID = '0x6'; // Sui Clock object

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'testnet';

export const EXPLORER_URL = 
  NETWORK === 'testnet' 
    ? 'https://suiexplorer.com/?network=testnet'
    : 'https://suiexplorer.com/?network=devnet';
```

### `.env.local` (create this)
```
NEXT_PUBLIC_PACKAGE_ID=0x... # Replace after contract deployment
NEXT_PUBLIC_NETWORK=testnet
```

---

## Utility Functions

### `utils/sui.ts`
```typescript
// Parse Sui object response to Board
export function parseBoard(obj: any): Board {
  const content = obj.data?.content?.fields;
  return {
    id: obj.data.objectId,
    name: content.name,
    description: content.description,
    owner: content.owner,
    createdAt: Number(content.created_at),
    memberCount: content.members?.fields?.size || 0,
  };
}

// Parse task object
export function parseTask(obj: any): Task { /* ... */ }

// Truncate Sui address
export function truncateAddress(address: string, chars = 6): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// Format date relative
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  // Return "2 hours ago", "3 days ago", etc.
}

// Validate Sui address
export function isValidSuiAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(address);
}
```

---

## Error Handling

### Toast Notifications
- **Success**: Green toast, auto-dismiss in 3s
- **Error**: Red toast, dismissable, show error message
- **Loading**: Show loading toast during transactions

### Error Messages
Make them user-friendly:
- ❌ "Transaction failed: Error code 123"
- ✅ "Unable to create board. Please check your wallet has SUI for gas."

### Common Errors to Handle
- Wallet not connected → Prompt to connect
- Insufficient gas → "Add SUI tokens to your wallet"
- Permission denied → "You don't have permission to perform this action"
- Network error → "Connection error. Please try again."
- Transaction rejected → "Transaction was rejected"

---

## Loading States

### Skeleton Loaders
- Board cards: Gray rectangles with shimmer
- Task rows: Gray bars
- Use Radix UI Skeleton component

### Spinner
- Use Radix UI Spinner for inline loading
- Show during mutations

### Optimistic Updates
- Update UI immediately, rollback on error
- Example: Update task status in UI before blockchain confirms

---

## Responsive Design

### Breakpoints (Tailwind)
- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (md)
- Desktop: > 1024px (lg)

### Mobile Adaptations
- Stack board cards (1 column)
- Task table → Card view on mobile
- Hamburger menu for navigation
- Bottom sheet for forms instead of modals

---

## Performance Optimizations

### React Query Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

### Lazy Loading
- Lazy load board detail page
- Lazy load task forms
- Use Next.js dynamic imports

### Pagination (Future)
- Initially load all (assuming < 100 items)
- Add pagination when lists grow

---

## Accessibility

### Requirements
- All buttons have aria-labels
- Forms have proper labels
- Keyboard navigation works
- Focus indicators visible
- Color contrast meets WCAG AA
- Screen reader friendly

### Keyboard Shortcuts (Bonus)
- `Cmd/Ctrl + K`: Quick command palette
- `Cmd/Ctrl + N`: New board/task (context-aware)
- `Escape`: Close modals

---

## Testing Approach

### Manual Testing Checklist
- [ ] Connect wallet successfully
- [ ] Create board with valid data
- [ ] Create board with invalid data (shows errors)
- [ ] View board list
- [ ] Navigate to board detail
- [ ] Create task
- [ ] Update task status
- [ ] Add member (if admin)
- [ ] All transactions confirm on blockchain
- [ ] UI updates after transactions
- [ ] Error handling works
- [ ] Wallet disconnection handled

### Test with Multiple Accounts
- Test permission system: admin vs. contributor
- Test member addition/removal
- Test task assignment to other users

---

## Deployment Notes

### Environment Variables
```
NEXT_PUBLIC_PACKAGE_ID=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
NEXT_PUBLIC_NETWORK=testnet
```

### Vercel Deployment
```bash
npm run build
# Deploy to Vercel
# Set environment variables in Vercel dashboard
```

### Demo Data
- Pre-populate a demo board with tasks
- Use for presentation
- Document demo account addresses

---

## Known Limitations (Document These)

### MVP Constraints
- No real-time updates (manual refresh needed)
- No mobile app (web only)
- No notifications
- No search/filtering (basic only)
- No bulk actions
- No task comments
- No file attachments

### Future Enhancements
- Real-time subscriptions (Sui events)
- Advanced analytics dashboard
- Subtasks / task hierarchies
- Task dependencies
- Time tracking
- Gantt chart view
- Mobile app
- SuiNS integration for human-readable addresses
- zkLogin for gasless transactions

---

## Success Criteria

### Demo Ready Checklist
- [ ] Wallet connects in < 5 seconds
- [ ] Create board in < 30 seconds
- [ ] Create task in < 30 seconds
- [ ] Update status in < 15 seconds
- [ ] UI is clean and professional
- [ ] No console errors
- [ ] Works on latest Chrome/Firefox
- [ ] Responsive on tablet
- [ ] All transactions verify on Sui Explorer

### Judge Evaluation Points
- ✅ Clean, modern UI (Radix UI + Tailwind)
- ✅ Functional wallet integration
- ✅ All core features working
- ✅ Smooth user experience
- ✅ Professional presentation
- ✅ Error handling
- ✅ Loading states

---

## Development Priorities

### Phase 1 (Hours 1-4): Core Infrastructure
1. Set up project structure
2. Implement WalletStatus component
3. Create basic navigation
4. Implement BoardList with mock data
5. Implement BoardForm
6. Connect to blockchain (test with real wallet)

### Phase 2 (Hours 5-8): Task Management
1. Implement TaskList component
2. Implement TaskForm
3. Board detail page
4. Task CRUD operations with blockchain
5. Status update functionality

### Phase 3 (Hours 9-10): Member Management & Polish
1. MemberManager component
2. Permission checks throughout UI
3. Landing page
4. Error handling and loading states
5. Responsive design fixes
6. UI polish (spacing, colors, animations)

### Phase 4 (Hours 11-12): Final Polish & Demo Prep
1. Test all flows
2. Fix bugs
3. Add demo data
4. Performance optimization
5. Deployment
6. Documentation for demo

---

## Critical Success Factors

### Must Work for Demo
1. ✅ Wallet connection
2. ✅ Create board (with transaction confirmation)
3. ✅ View board list
4. ✅ Create task (with transaction confirmation)
5. ✅ Update task status (with transaction confirmation)
6. ✅ Show on-chain verification (link to Sui Explorer)

### Nice to Have for Demo
- Add member functionality
- Landing page
- Filtering and sorting
- Mobile responsive
- Animations and transitions

### Can Skip if Behind Schedule
- Task deletion
- Member removal
- Advanced filtering
- Analytics
- Keyboard shortcuts

---

## Final Notes

### Code Quality
- Use TypeScript strict mode
- Comment complex logic
- Extract reusable components
- Follow React best practices
- Use meaningful variable names

### Git Workflow
- Commit frequently
- Clear commit messages
- Branch: `feat/frontend-implementation`

### Documentation
- Add README with setup instructions
- Document environment variables
- Add inline comments for complex code
- Create demo walkthrough guide

### Team Coordination
- Frontend team focuses on UI first (mock data)
- Switch to blockchain integration once contracts deployed
- Have fallback plans if blockchain integration delayed
- Prioritize working demo over perfect code

---

## Example Component Structure

```typescript
// components/BoardCard.tsx
import { Card, Heading, Text, Badge } from '@radix-ui/themes';
import { formatRelativeTime } from '@/utils/sui';
import type { Board } from '@/types/board';

interface BoardCardProps {
  board: Board;
  onClick: () => void;
}

export function BoardCard({ board, onClick }: BoardCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <Heading size="5">{board.name}</Heading>
      <Text size="2" color="gray" className="line-clamp-2">
        {board.description}
      </Text>
      <div className="flex gap-2 mt-4">
        <Badge color="violet">{board.memberCount} members</Badge>
        <Text size="1" color="gray">
          {formatRelativeTime(board.createdAt)}
        </Text>
      </div>
    </Card>
  );
}
```

---

**This prompt is ready to paste into lovable.dev. It provides comprehensive guidance for building a production-ready Sui blockchain dApp in a hackathon timeframe.**

**Key Strengths**:
- ✅ Complete feature specifications
- ✅ Code examples and patterns
- ✅ UI/UX guidelines
- ✅ Error handling and edge cases
- ✅ Prioritization for time constraints
- ✅ Real blockchain integration patterns
- ✅ Type-safe TypeScript throughout
- ✅ Accessibility and responsive design
- ✅ Success criteria and testing approach

**Start building and good luck with the hackathon! 🚀**
