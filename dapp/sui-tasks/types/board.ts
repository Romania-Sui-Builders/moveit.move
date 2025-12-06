// types/board.ts
export enum TaskStatus {
  TODO = 0,
  IN_PROGRESS = 1,
  DONE = 2,
}

export interface Board {
  id: string;
  name: string;
  description: string;
  owner: string;
  createdAt: number;
  memberCount: number;
}

export interface Task {
  id: string;
  boardId: string;
  title: string;
  description: string;
  assignee: string;
  status: TaskStatus;
  dueDate: number;
  effortHours: number;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

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

export interface BoardMember {
  address: string;
  role: 'admin' | 'contributor';
  addedAt: number;
}