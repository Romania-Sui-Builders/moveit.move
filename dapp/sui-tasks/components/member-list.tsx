"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Crown, Shield, User } from "lucide-react"
import type { Board, Member } from "@/lib/types"
import { AddMemberForm } from "./add-member-form"
import { MemberDetail } from "./member-detail"

interface MemberListProps {
  board: Board
}

const roleConfig = {
  owner: { label: "Owner", icon: Crown, variant: "default" as const },
  admin: { label: "Admin", icon: Shield, variant: "secondary" as const },
  member: { label: "Member", icon: User, variant: "outline" as const },
}

export function MemberList({ board }: MemberListProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  const members: Member[] = board.members.map((address, index) => ({
    address,
    role: index === 0 ? "owner" : index === 1 ? "admin" : "member",
    joinedAt: Date.now() - 86400000 * (board.members.length - index),
  }))

  const currentUserAddress = "0x1234...5678" // Mock current user
  const isOwner = board.owner === currentUserAddress

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Members</h2>
          <p className="text-sm text-muted-foreground">{board.members.length} members</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      {showAddForm && <AddMemberForm boardId={board.id} onClose={() => setShowAddForm(false)} />}

      {selectedMember && (
        <MemberDetail
          member={selectedMember}
          isOwner={isOwner}
          onClose={() => setSelectedMember(null)}
          onRoleChange={(newRole) => {
            console.log("[v0] Role changed for", selectedMember.address, "to", newRole)
            setSelectedMember(null)
          }}
          onRemove={() => {
            console.log("[v0] Member removed:", selectedMember.address)
            setSelectedMember(null)
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map((member) => {
          const config = roleConfig[member.role]
          const Icon = config.icon

          return (
            <Card
              key={member.address}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedMember(member)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-mono">{member.address}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant={config.variant} className="gap-1">
                  <Icon className="h-3 w-3" />
                  {config.label}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
