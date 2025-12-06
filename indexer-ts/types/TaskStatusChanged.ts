export interface TaskStatusChanged {
  board_id: string;
  task_id: string;
  old_status: string;
  new_status: string;
  changed_by: string;
}