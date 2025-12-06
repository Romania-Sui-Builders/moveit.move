"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Pencil, Save, Trash2, Calendar, AlertCircle } from "lucide-react"
import type { Task, Board } from "@/lib/types"
import { useContributorCapForBoard } from "@/hooks/useContributorCaps"
import { useUpdateTask } from "@/hooks/useTasks"

interface TaskDetailProps {
  task: Task
  board: Board
  onClose: () => void
}

export function TaskDetail({ task: initialTask, board, onClose }: TaskDetailProps) {
  const [task, setTask] = useState(initialTask)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [status, setStatus] = useState(task.status)
  const [assignee, setAssignee] = useState(task.assignee || "")
  const [storyPoints, setStoryPoints] = useState<number | "">(task.effort || "")
  const [priority, setPriority] = useState(task.priority)
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ""
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // ✅ Query ContributorCap for this board
  const { data: contributorCapId, isLoading: isLoadingCap } = useContributorCapForBoard(board.id)
  
  // ✅ Use blockchain update hook
  const { mutateAsync: updateTask } = useUpdateTask()

  const currentColumn = board.columns?.find((col) => col.id === task.status)

  const getPriorityVariant = (p: Task["priority"]) => {
    const variants: Record<NonNullable<Task["priority"]>, "default" | "secondary" | "destructive" | "outline"> = {
      urgent: "destructive",
      high: "default",
      medium: "secondary",
      low: "outline",
    }
    return p ? variants[p] ?? "default" : "default"
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contributorCapId) {
      alert("ContributorCap required to update tasks")
      return
    }
    
    setIsSubmitting(true)

    try {
      // Convert due date to timestamp
      const dueDateTimestamp = dueDate ? new Date(dueDate).getTime() : 0
      
      console.log("🔄 Attempting to update task:", {
        taskObjectId: task.id,
        boardId: board.id,
        contributorCapId,
        updates: {
          title,
          description,
          dueDate: dueDateTimestamp,
          effortHours: typeof storyPoints === 'number' ? storyPoints : 0,
        },
      })
      
      // Update task on blockchain
      await updateTask({
        taskObjectId: task.id,
        boardId: board.id,
        contributorCapId,
        updates: {
          title,
          description,
          dueDate: dueDateTimestamp,
          effortHours: typeof storyPoints === 'number' ? storyPoints : 0,
        },
      })

      // Update local state
      const updatedTask = {
        ...task,
        title,
        description,
        dueDate: dueDateTimestamp,
        effort: typeof storyPoints === 'number' ? storyPoints : 0,
        updatedAt: Date.now(),
      }

      console.log("✅ Task updated on blockchain:", updatedTask)
      setTask(updatedTask)
      setIsEditing(false)
      alert("Task updated successfully!")
    } catch (error) {
      console.error("❌ Failed to update task:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // Check if it's the Table structure issue
      if (errorMessage.includes("Table") || errorMessage.includes("dynamic_field")) {
        alert(
          "⚠️ Update Failed: This board uses the old Table structure.\n\n" +
          "Task updates are not yet supported for boards with Table storage.\n\n" +
          "Please create a new board to use the latest task management features."
        )
      } else {
        alert(`Failed to update task: ${errorMessage}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return
    }

    setIsDeleting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("[v0] Deleting task:", task.id)
    onClose()
  }

  const handleCancel = () => {
    setTitle(task.title)
    setDescription(task.description)
    setStatus(task.status)
    setAssignee(task.assignee || "")
    setStoryPoints(task.storyPoints || "")
    setPriority(task.priority)
    setIsEditing(false)
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        {/* ✅ Warning when ContributorCap not available */}
        {!isLoadingCap && !contributorCapId && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need contributor access to edit this task. Ask the board admin to add you as a contributor.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold h-auto py-2"
                required
              />
            ) : (
              <CardTitle className="text-2xl">{task.title}</CardTitle>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge className="text-white" style={{ backgroundColor: currentColumn?.color || "#64748b" }}>
                {currentColumn?.name || task.status}
              </Badge>
              <Badge variant={getPriorityVariant(task.priority)}>{(task.priority || 'low').toUpperCase()}</Badge>
              {task.storyPoints && (
                <Badge variant="outline">
                  {task.storyPoints} Story Point{task.storyPoints !== 1 ? "s" : ""}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                Created {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setIsEditing(true)}
                  disabled={!contributorCapId}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={handleDelete} 
                  disabled={isDeleting || !contributorCapId}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            {isEditing ? (
              <Textarea
                id="task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-status">Status</Label>
              {isEditing ? (
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="task-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(board.columns || [])
                      .sort((a, b) => a.order - b.order)
                      .map((column) => (
                        <SelectItem key={column.id} value={column.id}>
                          {column.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-10 flex items-center">
                  <Badge className="text-white" style={{ backgroundColor: currentColumn?.color || "#64748b" }}>
                    {currentColumn?.name || task.status}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              {isEditing ? (
                <Select value={priority} onValueChange={(value) => setPriority(value as typeof priority)}>
                  <SelectTrigger id="task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-10 flex items-center">
                  <Badge variant={getPriorityVariant(task.priority)}>{(task.priority || 'low').toUpperCase()}</Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-assignee">Assignee</Label>
              {isEditing ? (
                <Input
                  id="task-assignee"
                  placeholder="0x..."
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="font-mono"
                />
              ) : (
                <div className="h-10 flex items-center font-mono text-sm">
                  {task.assignee || <span className="text-muted-foreground">Unassigned</span>}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-story-points">Effort (Story Points/Hours)</Label>
              {isEditing ? (
                <Input
                  id="task-story-points"
                  type="number"
                  min="0"
                  placeholder="e.g., 5"
                  value={storyPoints}
                  onChange={(e) => setStoryPoints(e.target.value ? Number(e.target.value) : "")}
                />
              ) : (
                <div className="h-10 flex items-center text-sm">
                  {task.effort || <span className="text-muted-foreground">Not set</span>}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-due-date">Due Date</Label>
              {isEditing ? (
                <Input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              ) : (
                <div className="h-10 flex items-center text-sm">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : <span className="text-muted-foreground">Not set</span>}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Details</Label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Created: {new Date(task.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Updated: {new Date(task.updatedAt).toLocaleString()}</span>
              </div>
              <div className="col-span-2 font-mono text-xs">
                <span className="text-muted-foreground">Creator:</span> {task.creator}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <Save className="h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
