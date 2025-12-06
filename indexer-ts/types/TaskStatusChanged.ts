export interface TaskStatusChanged {
  board_id: string;
  task_id: string;
  old_status: number;
  new_status: number;
  changed_by: string;
}