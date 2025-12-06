export interface TaskAssigned {
  board_id: string;
  task_id: string;
  assignees: string[];
  assigned_by: string;
}