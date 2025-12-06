"use client"

import type { ReactNode } from "react"
import type { Member } from "@/lib/types"

interface PermissionGuardProps {
  children: ReactNode
  userRole: Member["role"]
  requiredRole?: Member["role"]
  fallback?: ReactNode
}

const roleHierarchy: Record<Member["role"], number> = {
  owner: 3,
  admin: 2,
  member: 1,
}

export function PermissionGuard({
  children,
  userRole,
  requiredRole = "member",
  fallback = null,
}: PermissionGuardProps) {
  const hasPermission = roleHierarchy[userRole] >= roleHierarchy[requiredRole]

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
