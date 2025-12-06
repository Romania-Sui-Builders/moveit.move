// services/indexer.service.ts
import { INDEXER_URL } from '@/core/constants';

export interface BoardCreatedEvent {
  dbId: string;
  board_id: string;
  name: string;
  created_by: string;
  version: string;
}

export interface TaskCreatedEvent {
  dbId: string;
  board_id: string;
  task_id: string;
  title: string;
  creator: string;
}

export interface TaskStatusChangedEvent {
  dbId: string;
  board_id: string;
  task_id: string;
  old_status: string;
  new_status: string;
  changed_by: string;
}

export interface TaskAssignedEvent {
  dbId: string;
  board_id: string;
  task_id: string;
  assignees: string[];
  assigned_by: string;
}

export interface TaskUpdatedEvent {
  dbId: string;
  board_id: string;
  task_id: string;
  updated_by: string;
}

export interface ContributorAddedEvent {
  dbId: string;
  board_id: string;
  contributor: string;
  added_by: string;
}

export interface StatusAddedEvent {
  dbId: string;
  board_id: string;
  status: string;
  added_by: string;
}

export interface StatusRemovedEvent {
  dbId: string;
  board_id: string;
  status: string;
  removed_by: string;
}

export class IndexerService {
  private baseUrl: string;

  constructor(baseUrl: string = INDEXER_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Indexer request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getBoardCreatedEvents(): Promise<BoardCreatedEvent[]> {
    return this.fetch<BoardCreatedEvent[]>('/events/moveit/board-created');
  }

  async getTaskCreatedEvents(boardId?: string): Promise<TaskCreatedEvent[]> {
    const events = await this.fetch<TaskCreatedEvent[]>('/events/moveit/task-created');
    return boardId ? events.filter(e => e.board_id === boardId) : events;
  }

  async getTaskStatusChangedEvents(boardId?: string): Promise<TaskStatusChangedEvent[]> {
    const events = await this.fetch<TaskStatusChangedEvent[]>('/events/moveit/task-status-changed');
    return boardId ? events.filter(e => e.board_id === boardId) : events;
  }

  async getTaskAssignedEvents(boardId?: string): Promise<TaskAssignedEvent[]> {
    const events = await this.fetch<TaskAssignedEvent[]>('/events/moveit/task-assigned');
    return boardId ? events.filter(e => e.board_id === boardId) : events;
  }

  async getTaskUpdatedEvents(boardId?: string): Promise<TaskUpdatedEvent[]> {
    const events = await this.fetch<TaskUpdatedEvent[]>('/events/moveit/task-updated');
    return boardId ? events.filter(e => e.board_id === boardId) : events;
  }

  async getContributorAddedEvents(boardId?: string): Promise<ContributorAddedEvent[]> {
    const events = await this.fetch<ContributorAddedEvent[]>('/events/moveit/contributor-added');
    return boardId ? events.filter(e => e.board_id === boardId) : events;
  }

  async getStatusAddedEvents(boardId?: string): Promise<StatusAddedEvent[]> {
    const events = await this.fetch<StatusAddedEvent[]>('/events/moveit/status-added');
    return boardId ? events.filter(e => e.board_id === boardId) : events;
  }

  async getStatusRemovedEvents(boardId?: string): Promise<StatusRemovedEvent[]> {
    const events = await this.fetch<StatusRemovedEvent[]>('/events/moveit/status-removed');
    return boardId ? events.filter(e => e.board_id === boardId) : events;
  }

  // Helper methods to get aggregated data
  async getBoardsWithMetadata(): Promise<Array<BoardCreatedEvent & { taskCount: number }>> {
    const boards = await this.getBoardCreatedEvents();
    const tasks = await this.getTaskCreatedEvents();

    return boards.map(board => ({
      ...board,
      taskCount: tasks.filter(t => t.board_id === board.board_id).length,
    }));
  }

  async getTasksForBoard(boardId: string) {
    const [created, statusChanges, assigned, updated] = await Promise.all([
      this.getTaskCreatedEvents(boardId),
      this.getTaskStatusChangedEvents(boardId),
      this.getTaskAssignedEvents(boardId),
      this.getTaskUpdatedEvents(boardId),
    ]);

    // Combine all events by task_id to get current state
    const tasksMap = new Map();

    // Initialize with created events
    created.forEach(event => {
      tasksMap.set(event.task_id, {
        task_id: event.task_id,
        board_id: event.board_id,
        title: event.title,
        creator: event.creator,
        status: 'initial', // Will be updated by status changes
        assignees: [],
        lastUpdated: event.dbId,
      });
    });

    // Apply status changes (in order)
    statusChanges.forEach(event => {
      const task = tasksMap.get(event.task_id);
      if (task) {
        task.status = event.new_status;
      }
    });

    // Apply assignments (in order)
    assigned.forEach(event => {
      const task = tasksMap.get(event.task_id);
      if (task) {
        task.assignees = event.assignees;
      }
    });

    return Array.from(tasksMap.values());
  }
}

export const indexerService = new IndexerService();
