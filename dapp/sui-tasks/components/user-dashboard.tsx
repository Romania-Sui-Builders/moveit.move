"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { BoardList } from "@/components/board-list"
import { UserAnalytics } from "@/components/user-analytics"
import { AdminDashboard } from "@/components/admin-dashboard"
import { mockBoards, mockTasks } from "@/lib/mock-data"
import { isAdmin } from "@/lib/types"
import useSWR from "swr"

interface UserDashboardProps {
  userAddress: string
}

export function UserDashboard({ userAddress }: UserDashboardProps) {
  const [currentView, setCurrentView] = useState<"boards" | "analytics" | "admin">("boards")
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null)

  const { data: boards = mockBoards } = useSWR("/api/boards", {
    fallbackData: mockBoards,
    refreshInterval: 3000,
  })

  const { data: tasks = mockTasks } = useSWR("/api/tasks", {
    fallbackData: mockTasks,
    refreshInterval: 3000,
  })

  const userBoards = boards.filter((board) => board.members.includes(userAddress))
  const userTasks = tasks.filter((task) => task.assignee === userAddress)
  const showAdminDashboard = isAdmin(userAddress)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <Sidebar
          boards={userBoards}
          currentView={currentView}
          onViewChange={setCurrentView}
          onBoardSelect={setSelectedBoardId}
          selectedBoardId={selectedBoardId}
          showAdminLink={showAdminDashboard}
        />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            {currentView === "boards" && <BoardList selectedBoardId={selectedBoardId} />}
            {currentView === "analytics" && <UserAnalytics boards={userBoards} tasks={userTasks} />}
            {currentView === "admin" && showAdminDashboard && <AdminDashboard />}
          </div>
        </main>
      </div>
    </div>
  )
}
