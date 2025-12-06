export interface BoardMigrated {
  board_id: string;
  old_version: string;
  new_version: string;
  migrated_by: string;
}