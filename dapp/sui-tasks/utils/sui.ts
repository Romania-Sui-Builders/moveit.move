import { Board, Task, TaskStatus } from "../types/board";

export function parseBoard(obj: any): Board {
  const content = obj.data?.content?.fields;
  return {
    id: obj.data.objectId,
    name: content?.name || "Unnamed Board",
    description: content?.description || "",
    owner: content?.owner || "",
    createdAt: Number(content?.created_at || Date.now()),
    memberCount: content?.members?.fields?.size || 0,
  };
}

export function parseTask(obj: any): Task {
  const content = obj.data?.content?.fields;
  return {
    id: obj.data.objectId,
    boardId: content?.board_id || "",
    title: content?.title || "Untitled",
    description: content?.description || "",
    assignee: content?.assignee || "",
    status: content?.status || TaskStatus.TODO,
    dueDate: Number(content?.due_date || Date.now()),
    effortHours: Number(content?.effort_hours || 0),
    createdAt: Number(content?.created_at || Date.now()),
    updatedAt: Number(content?.updated_at || Date.now()),
    createdBy: content?.created_by || "",
  };
}

export function truncateAddress(address: string, chars = 6): string {
  if (!address || address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isValidSuiAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(address);
}

export function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.TODO:
      return "gray";
    case TaskStatus.IN_PROGRESS:
      return "blue";
    case TaskStatus.DONE:
      return "green";
    default:
      return "gray";
  }
}

export function getStatusText(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.TODO:
      return "To Do";
    case TaskStatus.IN_PROGRESS:
      return "In Progress";
    case TaskStatus.DONE:
      return "Done";
    default:
      return "Unknown";
  }
}
