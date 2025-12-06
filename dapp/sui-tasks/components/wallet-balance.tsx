"use client"

import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins } from "lucide-react"

export function WalletBalance() {
  const account = useCurrentAccount()
  const suiClient = useSuiClient()

  const { data: balance, isLoading } = useQuery({
    queryKey: ["balance", account?.address],
    queryFn: async () => {
      if (!account?.address) return null

      const balance = await suiClient.getBalance({
        owner: account.address,
        coinType: "0x2::sui::SUI",
      })

      return balance
    },
    enabled: !!account?.address,
    refetchInterval: 10000, // Refetch every 10 seconds
  })

  if (!account) {
    return null
  }

  const formatBalance = (amount: string) => {
    const sui = Number(amount) / 1_000_000_000 // Convert MIST to SUI
    return sui.toFixed(4)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Wallet Balance
        </CardTitle>
        <CardDescription>Your current SUI balance</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : balance ? (
          <div className="space-y-2">
            <div className="text-3xl font-bold">{formatBalance(balance.totalBalance)} SUI</div>
            <Badge variant="secondary" className="font-mono text-xs">
              {balance.totalBalance} MIST
            </Badge>
          </div>
        ) : (
          <div className="text-muted-foreground">Unable to fetch balance</div>
        )}
      </CardContent>
    </Card>
  )
}
