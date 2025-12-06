/**
 * Task Creation Form
 * 
 * ✅ BLOCKCHAIN INTEGRATION:
 * Uses create_task() contract function with ContributorCap
 * 
 * CONTRACT FIELDS SUPPORTED:
 * - title: String ✅
 * - description: String ✅
 * - due_date: u64 (timestamp in ms) ✅
 * - effort: u64 (story points or hours) ✅
 * - assignees: vector<address> ✅
 * 
 * ⚠️ CONTRACT LIMITATIONS:
 * - Status is ALWAYS set to first status in board workflow (cannot choose)
 * - Priority field not in contract (UI-only, removed)
 * 
 * 🔄 WORKFLOW:
 * 1. User fills form
 * 2. Submit creates task with first status automatically
 * 3. To change status: use task detail view after creation
 */
"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, AlertCircle } from "lucide-react"
import type { Board } from "@/lib/types"
import { useCreateTask } from "@/hooks/useTasks"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { useContributorCapForBoard } from "@/hooks/useContributorCaps"

interface TaskFormProps {
  boardId: string
  board: Board
  onClose: () => void
}

export function TaskForm({ boardId, board, onClose }: TaskFormProps) {
  const account = useCurrentAccount()
  const createTask = useCreateTask(boardId)
  
  // ✅ Query ContributorCap for this board
  const { data: contributorCapId, isLoading: isLoadingCap } = useContributorCapForBoard(boardId)
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [effort, setEffort] = useState<number | "">("")
  const [assignee, setAssignee] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // ✅ Get initial status from contract's statuses array
  const statuses = board.statuses || []
  const initialStatus = statuses.length > 0 ? statuses[0] : "To-Do"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contributorCapId) {
      alert("ContributorCap required to create tasks")
      return
    }
    
    if (!account) {
      alert("Please connect your wallet")
      return
    }
    
    setIsSubmitting(true)

    try {
      // Convert due date to timestamp (milliseconds)
      const dueDateTimestamp = dueDate ? new Date(dueDate).getTime() : 0
      
      await createTask.mutateAsync({
        contributorCapId,
        title,
        description,
        assignee: assignee || account.address,
        dueDate: dueDateTimestamp,
        effortHours: typeof effort === 'number' ? effort : 0,
      })
      
      onClose()
    } catch (error) {
      console.error("Failed to create task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Create New Task</CardTitle>
            <CardDescription>Add a new task to this board</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* ✅ Loading state while checking for ContributorCap */}
        {isLoadingCap && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Checking contributor access...
            </AlertDescription>
          </Alert>
        )}
        
        {/* ✅ Warning when ContributorCap not available */}
        {!isLoadingCap && !contributorCapId && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need contributor access to create tasks on this board. Ask the board admin to add you as a contributor.
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="e.g., Implement user authentication"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide details about this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ⚠️ Status selector removed - contract creates tasks with first status automatically */}
            <div className="space-y-2">
              <Label htmlFor="initial-status">Initial Status</Label>
              <Input
                id="initial-status"
                value={initialStatus}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Tasks start with &quot;{initialStatus}&quot;
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="effort">Effort (Story Points/Hours)</Label>
              <Input
                id="effort"
                type="number"
                min="0"
                placeholder="e.g., 5"
                value={effort}
                onChange={(e) => setEffort(e.target.value ? Number(e.target.value) : "")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          
          {/* ❌ Priority field removed - not supported by contract */}

          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee (Optional)</Label>
            <Input
              id="assignee"
              placeholder="0x..."
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
