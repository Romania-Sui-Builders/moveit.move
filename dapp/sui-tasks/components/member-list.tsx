/**
 * ⚠️ MEMBER LIST - NOT SUPPORTED BY CONTRACT
 * 
 * The MoveIt smart contract does NOT store a members list in the Board struct.
 * Instead, it uses a capability-based access control system:
 * 
 * 1. AdminCap - Owned by board admin, allows board management
 * 2. ContributorCap - Given to contributors, allows task operations
 * 
 * ContributorCaps are separate objects owned by users, not stored in the board.
 * There's no on-chain way to query "all members of a board".
 * 
 * POSSIBLE SOLUTIONS:
 * - Use indexer to track ContributorAdded events
 * - Query owned ContributorCaps for current user
 * - Store members in off-chain database
 * 
 * For now, this component is disabled to prevent errors.
 */
"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import type { Board } from "@/lib/types"

interface MemberListProps {
  board: Board
}

export function MemberList({ board }: MemberListProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Member Management Not Available</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p>
            The MoveIt smart contract uses a <strong>capability-based access control</strong> system
            instead of storing a members list.
          </p>
          <div className="mt-3 space-y-1 text-sm">
            <p><strong>How it works:</strong></p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li><strong>AdminCap</strong> - Allows board management (owned by admin)</li>
              <li><strong>ContributorCap</strong> - Allows task operations (given to contributors)</li>
            </ul>
          </div>
          <div className="mt-3 space-y-1 text-sm">
            <p><strong>To add contributors:</strong></p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Use the admin dashboard to call <code className="bg-muted px-1 rounded">add_contributor()</code></li>
              <li>ContributorCap will be transferred to the new member's wallet</li>
            </ul>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Board ID: <code className="bg-muted px-1 rounded">{board.id}</code>
          </p>
        </AlertDescription>
      </Alert>

      {/* 
      ❌ COMMENTED OUT - Contract doesn't support member list
      
      const members: Member[] = board.members?.map((address, index) => ({
        address,
        role: index === 0 ? "owner" : index === 1 ? "admin" : "member",
        joinedAt: Date.now() - 86400000 * (board.members.length - index),
      })) || []
      */}
    </div>
  )
}
