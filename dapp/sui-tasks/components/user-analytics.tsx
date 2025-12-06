"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Board, Task } from "@/lib/types"
import { CheckCircle2, Clock, ListTodo, Target } from "lucide-react"
import useSWR from "swr"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { useEffect, useState } from "react"

interface UserAnalyticsProps {
  boards: Board[]
  tasks: Task[]
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}

export function UserAnalytics({ boards }: UserAnalyticsProps) {
  const account = useCurrentAccount()
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch tasks from all boards
  useEffect(() => {
    const fetchAllTasks = async () => {
      if (!boards || boards.length === 0) {
        setAllTasks([])
        setIsLoading(false)
        return
      }

      try {
        const taskPromises = boards.map(board => 
          fetch(`/api/boards/${board.id}/tasks`).then(res => res.json())
        )
        const results = await Promise.all(taskPromises)
        const combinedTasks = results.flatMap(result => result.tasks || [])
        setAllTasks(combinedTasks)
      } catch (error) {
        console.error('Error fetching tasks:', error)
        setAllTasks([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllTasks()
  }, [boards])

  // Filter tasks assigned to current user
  const userTasks = allTasks.filter(task => 
    task.assignees?.includes(account?.address || '') || 
    task.assignee === account?.address
  )

  // Match status from blockchain (e.g., "Done", "In Progress", "To Do")
  const completedTasks = userTasks.filter((t) => 
    t.status.toLowerCase() === "done" || t.status.toLowerCase() === "completed"
  )
  const inProgressTasks = userTasks.filter((t) => 
    t.status.toLowerCase().includes("progress") || t.status.toLowerCase().includes("doing")
  )
  const totalEffort = userTasks.reduce((sum, task) => sum + (task.effort || task.storyPoints || 0), 0)
  const completedEffort = completedTasks.reduce((sum, task) => sum + (task.effort || task.storyPoints || 0), 0)

  const priorityCounts = {
    urgent: userTasks.filter((t) => t.priority === "urgent").length,
    high: userTasks.filter((t) => t.priority === "high").length,
    medium: userTasks.filter((t) => t.priority === "medium").length,
    low: userTasks.filter((t) => t.priority === "low").length,
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Analytics</h1>
          <p className="text-muted-foreground mt-1">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your progress and task statistics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Boards</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{boards.length}</div>
            <p className="text-xs text-muted-foreground">Boards you're a member of</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assigned Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userTasks.length}</div>
            <p className="text-xs text-muted-foreground">{completedTasks.length} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks.length}</div>
            <p className="text-xs text-muted-foreground">Active tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Effort Points</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedEffort}/{totalEffort}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalEffort > 0 ? Math.round((completedEffort / totalEffort) * 100) : 0}% completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Priority</CardTitle>
            <CardDescription>Distribution of your assigned tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="w-16 justify-center">
                  Urgent
                </Badge>
                <span className="text-sm text-muted-foreground">tasks</span>
              </div>
              <span className="text-2xl font-bold">{priorityCounts.urgent}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="w-16 justify-center bg-orange-500">High</Badge>
                <span className="text-sm text-muted-foreground">tasks</span>
              </div>
              <span className="text-2xl font-bold">{priorityCounts.high}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-16 justify-center">
                  Medium
                </Badge>
                <span className="text-sm text-muted-foreground">tasks</span>
              </div>
              <span className="text-2xl font-bold">{priorityCounts.medium}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-16 justify-center">
                  Low
                </Badge>
                <span className="text-sm text-muted-foreground">tasks</span>
              </div>
              <span className="text-2xl font-bold">{priorityCounts.low}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest task updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No tasks assigned yet</p>
              ) : (
                userTasks
                  .sort((a, b) => b.updatedAt - a.updatedAt)
                  .slice(0, 5)
                  .map((task) => (
                    <div key={task.id} className="flex items-start gap-3">
                      <CheckCircle2
                        className={`h-4 w-4 mt-1 ${
                          task.status.toLowerCase() === "done" || task.status.toLowerCase() === "completed"
                            ? "text-green-500" 
                            : "text-muted-foreground"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(task.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {task.status}
                      </Badge>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
