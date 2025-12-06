/**
 * Board Settings Component
 * 
 * Manages board configuration including name, description, and workflow statuses.
 * 
 * ✅ BLOCKCHAIN INTEGRATION:
 * - Updates are published to the blockchain when adminCapId is provided
 * - Uses three contract functions:
 *   1. update_board(AdminCap, board, name, description) - Update metadata
 *   2. add_status(AdminCap, board, status) - Add workflow status
 *   3. remove_status(AdminCap, board, status) - Remove workflow status
 * 
 * ⚠️ LIMITATIONS:
 * - Status reordering is UI-only (contract stores statuses as vector)
 * - Requires AdminCap to publish changes to blockchain
 * - Cannot remove the last status (contract validation)
 * 
 * 🔄 DATA FLOW:
 * 1. Load statuses from board.statuses (from contract)
 * 2. Convert to BoardColumn format for UI editing
 * 3. Track changes (added/removed statuses)
 * 4. On submit: publish changes to blockchain sequentially
 * 5. Update local state and refresh board data
 */
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus, GripVertical, Trash2, AlertCircle } from "lucide-react"
import type { Board, BoardColumn } from "@/lib/types"
import { useUpdateBoard, useAddStatus, useRemoveStatus } from "@/hooks/useBoardSettings"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BoardSettingsProps {
  board: Board
  onUpdate: (board: Board) => void
  onClose: () => void
  adminCapId?: string // ✅ AdminCap required for blockchain updates
}

// Helper function to assign default colors to columns
function getDefaultColumnColor(index: number): string {
  const colors = ["#64748b", "#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"]
  return colors[index % colors.length]
}

export function BoardSettings({ board, onUpdate, onClose, adminCapId }: BoardSettingsProps) {
  const [name, setName] = useState(board.name)
  const [description, setDescription] = useState(board.description)
  
  // ✅ Handle both contract statuses and UI columns
  const initialColumns = board.columns 
    ? [...board.columns].sort((a, b) => a.order - b.order)
    : board.statuses
      ? board.statuses.map((status, index) => ({
          id: `col_${index}`,
          name: status,
          order: index,
          color: getDefaultColumnColor(index),
        }))
      : []
  
  const [columns, setColumns] = useState<BoardColumn[]>(initialColumns)
  const [originalStatuses] = useState<string[]>(board.statuses || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // ✅ Blockchain hooks
  const updateBoard = useUpdateBoard()
  const addStatus = useAddStatus()
  const removeStatus = useRemoveStatus()
  
  // Track which statuses were added or removed
  const [statusChanges, setStatusChanges] = useState<{
    added: string[]
    removed: string[]
  }>({ added: [], removed: [] })
  
  useEffect(() => {
    const currentStatuses = columns.map(col => col.name)
    const added = currentStatuses.filter(s => !originalStatuses.includes(s))
    const removed = originalStatuses.filter(s => !currentStatuses.includes(s))
    setStatusChanges({ added, removed })
  }, [columns, originalStatuses])

  const handleAddColumn = () => {
    const newColumn: BoardColumn = {
      id: `col_${Date.now()}`,
      name: "New Column",
      order: columns.length,
      color: "#64748b",
    }
    setColumns([...columns, newColumn])
  }

  const handleUpdateColumn = (index: number, updates: Partial<BoardColumn>) => {
    const updated = [...columns]
    updated[index] = { ...updated[index], ...updates }
    setColumns(updated)
  }

  const handleDeleteColumn = (index: number) => {
    if (columns.length <= 1) {
      alert("You must have at least one column")
      return
    }
    const updated = columns.filter((_, i) => i !== index)
    // Reorder remaining columns
    updated.forEach((col, i) => {
      col.order = i
    })
    setColumns(updated)
  }

  const handleMoveColumn = (index: number, direction: "up" | "down") => {
    // ⚠️ NOTE: Status reordering is UI-only - contract stores statuses as a vector
    // The order is maintained locally but when syncing with blockchain, the order
    // in which statuses were added determines their order in the vector
    if ((direction === "up" && index === 0) || (direction === "down" && index === columns.length - 1)) {
      return
    }
    const updated = [...columns]
    const swapIndex = direction === "up" ? index - 1 : index + 1
    ;[updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]]
    // Update order values
    updated.forEach((col, i) => {
      col.order = i
    })
    setColumns(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // ✅ Publish to blockchain if AdminCap is available
      if (adminCapId) {
        // 1. Update board name and description
        if (name !== board.name || description !== board.description) {
          await updateBoard.mutateAsync({
            adminCapId,
            boardId: board.id,
            name,
            description,
          })
        }

        // 2. Add new statuses
        for (const status of statusChanges.added) {
          await addStatus.mutateAsync({
            adminCapId,
            boardId: board.id,
            status,
          })
        }

        // 3. Remove deleted statuses
        for (const status of statusChanges.removed) {
          await removeStatus.mutateAsync({
            adminCapId,
            boardId: board.id,
            status,
          })
        }

        console.log("✅ Board settings published to blockchain")
      } else {
        // Local update only (no AdminCap available)
        console.warn("⚠️ No AdminCap provided - updating locally only")
      }

      // Update local state
      const statuses = columns.map(col => col.name)
      const updatedBoard = {
        ...board,
        name,
        description,
        columns,
        statuses,
      }

      onUpdate(updatedBoard)
      onClose()
    } catch (error) {
      console.error("Failed to update board settings:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Board Settings</CardTitle>
            <CardDescription>Update board details, columns, and members</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* ✅ Warning when AdminCap not available */}
        {!adminCapId && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Admin capability not found. Changes will be local only and not published to the blockchain.
              You need AdminCap to update board settings on-chain.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Show pending changes */}
        {(statusChanges.added.length > 0 || statusChanges.removed.length > 0) && adminCapId && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {statusChanges.added.length > 0 && (
                <div>Adding statuses: {statusChanges.added.join(", ")}</div>
              )}
              {statusChanges.removed.length > 0 && (
                <div>Removing statuses: {statusChanges.removed.join(", ")}</div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Board Name</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>

          <div className="space-y-3 border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Board Columns</Label>
                <p className="text-sm text-muted-foreground">Configure workflow stages and their order</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddColumn}
                className="gap-2 bg-transparent"
              >
                <Plus className="h-4 w-4" />
                Add Column
              </Button>
            </div>

            <div className="space-y-2">
              {columns.map((column, index) => (
                <div key={column.id} className="flex items-center gap-2 p-3 border rounded-lg bg-card">
                  <div className="flex flex-col gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => handleMoveColumn(index, "up")}
                      disabled={index === 0}
                    >
                      <GripVertical className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => handleMoveColumn(index, "down")}
                      disabled={index === columns.length - 1}
                    >
                      <GripVertical className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Column name"
                      value={column.name}
                      onChange={(e) => handleUpdateColumn(index, { name: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={column.color || "#64748b"}
                        onChange={(e) => handleUpdateColumn(index, { color: e.target.value })}
                        className="w-20"
                      />
                      <Input
                        placeholder="ID"
                        value={column.id}
                        onChange={(e) => handleUpdateColumn(index, { id: e.target.value })}
                        className="font-mono text-xs flex-1"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteColumn(index)}
                    disabled={columns.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
