// Mock data types matching Sui blockchain schema
export interface Board {
  id: string
  name: string
  description: string
  owner: string
  members: string[]
  taskIds: string[]
  createdAt: number
  columns: BoardColumn[]
}

export interface BoardColumn {
  id: string
  name: string
  order: number
  color?: string
}

export interface Task {
  id: string
  boardId: string
  title: string
  description: string
  status: string
  assignee: string | null
  creator: string
  createdAt: number
  updatedAt: number
  storyPoints?: number
  priority: "low" | "medium" | "high" | "urgent"
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
