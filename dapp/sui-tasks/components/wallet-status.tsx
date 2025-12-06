"use client"

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut } from "lucide-react"
import { truncateAddress } from "@/utils/sui"

export function WalletStatus() {
  const account = useCurrentAccount()

  if (account) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2 bg-transparent pointer-events-none">
          <Wallet className="h-4 w-4" />
          <span className="font-mono text-xs">{truncateAddress(account.address)}</span>
        </Button>
        <ConnectButton
          connectText={
            <>
              <Wallet className="h-4 w-4" />
              Connect
            </>
          }
          className="sui-connect-button"
        />
      </div>
    )
  }

  return (
    <ConnectButton
      connectText={
        <>
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
        </>
      }
      className="sui-connect-button"
    />
  )
}
