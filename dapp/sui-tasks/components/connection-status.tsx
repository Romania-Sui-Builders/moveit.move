"use client"

import { useCurrentAccount, useCurrentWallet } from "@mysten/dapp-kit"
import { CheckCircle2, XCircle, Wallet } from "lucide-react"
import { truncateAddress } from "@/utils/sui"

export function ConnectionStatus() {
  const account = useCurrentAccount()
  const { currentWallet, connectionStatus } = useCurrentWallet()

  if (connectionStatus === "connecting") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
        <span>Connecting...</span>
      </div>
    )
  }

  if (!account || connectionStatus === "disconnected") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <XCircle className="h-4 w-4 text-destructive" />
        <span>Not Connected</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <CheckCircle2 className="h-4 w-4 text-green-500" />
      <div className="flex flex-col">
        <span className="font-medium">{currentWallet?.name || "Connected"}</span>
        <span className="font-mono text-xs text-muted-foreground">{truncateAddress(account.address)}</span>
      </div>
    </div>
  )
}
