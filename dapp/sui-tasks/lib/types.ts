// Mock data types matching Sui blockchain schema
export interface Board {
  id: string
  name: string
  description: string
  owner?: string
  members?: string[] // ⚠️ NOT in contract - kept for backward compatibility with mock data
  taskIds?: string[]
  createdAt: number
  columns?: BoardColumn[] // ⚠️ UI representation of statuses
  // MoveIt contract fields (actual blockchain data)
  statuses?: string[] // ✅ Contract uses this - workflow statuses
  taskCounter?: number // ✅ Contract uses this
  version?: number // ✅ Contract uses this
  // Legacy Table structure detection (old boards)
  tableId?: string // ✅ Present if board uses old Table storage
  tableSize?: number // ✅ Number of tasks in Table
}

export interface BoardColumn {
  id: string
  name: string
  order: number
  color?: string
}

export interface Task {
  id: string // ✅ Task Object ID (from blockchain)
  boardId: string
  taskNumber?: number // ✅ Sequential number within board (for display like #123)
  title: string
  description: string
  status: string
  assignee: string | null // Legacy field for compatibility
  assignees?: string[] // ✅ Multiple assignees (from contract)
  dueDate?: number // ✅ Unix timestamp in milliseconds
  effort?: number // ✅ Effort estimation (story points or hours)
  creator: string
  createdAt: number
  updatedAt: number
  parentTaskId?: string // ✅ Parent task Object ID (for subtasks)
  subtaskIds?: string[] // ✅ Subtask Object IDs
  commentCount?: number // ✅ Number of comments
  // Legacy fields for backward compatibility
  storyPoints?: number
  priority?: "low" | "medium" | "high" | "urgent"
}

export interface Member {
  address: string
  role: "owner" | "admin" | "member"
  joinedAt: number
}

export function canManageMembers(userRole: Member["role"]): boolean {
  return userRole === "owner" || userRole === "admin"
}

export function canManageTasks(userRole: Member["role"]): boolean {
  return userRole === "owner" || userRole === "admin"
}

export function canDeleteBoard(userRole: Member["role"]): boolean {
  return userRole === "owner"
}

export function canEditTask(userRole: Member["role"], taskCreator: string, userAddress: string): boolean {
  if (userRole === "owner" || userRole === "admin") return true
  return taskCreator === userAddress
}

export function isAdmin(userAddress: string): boolean {
  // Mock admin check - will be replaced with blockchain check
  return userAddress === "0x1234...5678"
}
