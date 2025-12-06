"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, BarChart3, Shield, Plus } from "lucide-react"
import type { Board } from "@/lib/types"

interface SidebarProps {
  boards: Board[]
  currentView: "boards" | "analytics" | "admin"
  onViewChange: (view: "boards" | "analytics" | "admin") => void
  onBoardSelect: (boardId: string | null) => void
  selectedBoardId: string | null
  showAdminLink: boolean
}

export function Sidebar({
  boards,
  currentView,
  onViewChange,
  onBoardSelect,
  selectedBoardId,
  showAdminLink,
}: SidebarProps) {
  return (
    <aside className="w-64 border-r border-border bg-card/30 flex flex-col">
      <div className="p-4 space-y-2">
        <Button
          variant={currentView === "boards" ? "secondary" : "ghost"}
          className={cn("w-full justify-start gap-2", currentView === "boards" && "bg-primary/10")}
          onClick={() => {
            onViewChange("boards")
            onBoardSelect(null)
          }}
        >
          <LayoutDashboard className="h-4 w-4" />
          All Boards
        </Button>
        <Button
          variant={currentView === "analytics" ? "secondary" : "ghost"}
          className={cn("w-full justify-start gap-2", currentView === "analytics" && "bg-primary/10")}
          onClick={() => {
            onViewChange("analytics")
            onBoardSelect(null)
          }}
        >
          <BarChart3 className="h-4 w-4" />
          My Analytics
        </Button>
        {showAdminLink && (
          <Button
            variant={currentView === "admin" ? "secondary" : "ghost"}
            className={cn("w-full justify-start gap-2", currentView === "admin" && "bg-primary/10")}
            onClick={() => {
              onViewChange("admin")
              onBoardSelect(null)
            }}
          >
            <Shield className="h-4 w-4" />
            Admin Dashboard
          </Button>
        )}
      </div>

      <div className="border-t border-border my-2" />

      {/* <div className="px-4 py-2 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Your Boards</span>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Plus className="h-4 w-4" />
        </Button>
      </div> */}

      {/* <div className="flex-1 overflow-auto px-2 pb-4">
        {boards.map((board) => (
          <Button
            key={board.id}
            variant="ghost"
            className={cn(
              "w-full justify-start mb-1 text-sm font-normal",
              selectedBoardId === board.id && "bg-primary/10",
            )}
            onClick={() => {
              onViewChange("boards")
              onBoardSelect(board.id)
            }}
          >
            <span className="truncate">{board.name}</span>
          </Button>
        ))}
      </div> */}
    </aside>
  )
}
