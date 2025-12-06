"use client"

import { Button } from "@/components/ui/button"
import { Circle, Clock, CheckCircle2 } from "lucide-react"
import type { Task } from "@/lib/types"

interface TaskStatusUpdateProps {
  task: Task
  onStatusChange: (newStatus: Task["status"]) => void
}

const statusFlow: Record<Task["status"], Task["status"] | null> = {
  todo: "in_progress",
  in_progress: "done",
  done: null,
}

const statusIcons = {
  todo: Circle,
  in_progress: Clock,
  done: CheckCircle2,
}

const statusLabels = {
  todo: "Start Task",
  in_progress: "Complete Task",
  done: "Completed",
}

export function TaskStatusUpdate({ task, onStatusChange }: TaskStatusUpdateProps) {
  const nextStatus = statusFlow[task.status]
  const Icon = statusIcons[task.status]

  if (!nextStatus) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <span>Task completed</span>
      </div>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={() => onStatusChange(nextStatus)} className="gap-2">
      <Icon className="h-4 w-4" />
      {statusLabels[task.status]}
    </Button>
  )
}
