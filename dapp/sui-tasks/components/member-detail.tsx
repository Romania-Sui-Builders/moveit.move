"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { X, Shield, Calendar, Trash2 } from "lucide-react"
import type { Member } from "@/lib/types"

interface MemberDetailProps {
  member: Member
  isOwner: boolean
  onClose: () => void
  onRoleChange?: (newRole: Member["role"]) => void
  onRemove?: () => void
}

const roleConfig = {
  owner: { label: "Owner", description: "Full control over the board" },
  admin: { label: "Admin", description: "Can manage tasks and members" },
  member: { label: "Member", description: "Can view and create tasks" },
}

export function MemberDetail({ member, isOwner, onClose, onRoleChange, onRemove }: MemberDetailProps) {
  const [role, setRole] = useState(member.role)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleRoleChange = async () => {
    if (role === member.role) return

    setIsUpdating(true)
    // Mock role update - will be replaced with blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("[v0] Updating member role:", { address: member.address, newRole: role })
    onRoleChange?.(role)
    setIsUpdating(false)
  }

  const handleRemove = async () => {
    if (!confirm(`Remove ${member.address} from this board?`)) {
      return
    }

    // Mock member removal - will be replaced with blockchain transaction
    console.log("[v0] Removing member:", member.address)
    onRemove?.()
    onClose()
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-mono text-lg">{member.address}</CardTitle>
            <CardDescription>Member details and permissions</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Current Role</Label>
          <div className="flex items-center gap-2">
            <Badge variant={member.role === "owner" ? "default" : member.role === "admin" ? "secondary" : "outline"}>
              <Shield className="h-3 w-3 mr-1" />
              {roleConfig[member.role].label}
            </Badge>
            <span className="text-sm text-muted-foreground">{roleConfig[member.role].description}</span>
          </div>
        </div>

        {isOwner && member.role !== "owner" && onRoleChange && (
          <div className="space-y-2">
            <Label htmlFor="role-select">Change Role</Label>
            <div className="flex gap-2">
              <Select value={role} onValueChange={(value: Member["role"]) => setRole(value)}>
                <SelectTrigger id="role-select" className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleRoleChange} disabled={role === member.role || isUpdating}>
                {isUpdating ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Member Since</Label>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(member.joinedAt).toLocaleString()}</span>
          </div>
        </div>

        {isOwner && member.role !== "owner" && onRemove && (
          <div className="pt-4 border-t">
            <Button variant="destructive" onClick={handleRemove} className="gap-2 w-full">
              <Trash2 className="h-4 w-4" />
              Remove from Board
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
