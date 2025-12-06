// components/WalletStatus.tsx
"use client";

import { useState, useEffect } from "react";
import {
  ConnectButton,
  useCurrentAccount,
  useSuiClient,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@radix-ui/react-dropdown-menu";
import {
  Button,
  Text,
  Flex,
  Box,
  Badge,
  Heading,
  Avatar,
  Separator,
} from "@radix-ui/themes";
import { Copy, LogOut, ExternalLink, Wallet } from "lucide-react";
import { truncateAddress } from "@/utils/sui";
import { useToast } from "@/hooks/useToast";

export function WalletStatus() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const [balance, setBalance] = useState<string>("0");
  const { toast } = useToast();

  const { data: balanceData } = useSuiClientQuery(
    "getBalance",
    {
      owner: account?.address || "",
      coinType: "0x2::sui::SUI",
    },
    {
      enabled: !!account,
      refetchInterval: 10000, // Refresh every 10 seconds
    }
  );

  useEffect(() => {
    if (balanceData) {
      // Convert from MIST to SUI (1 SUI = 1,000,000,000 MIST)
      const suiBalance = Number(balanceData.totalBalance) / 1_000_000_000;
      setBalance(suiBalance.toFixed(4));
    }
  }, [balanceData]);

  const copyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address);
      toast("Address copied to clipboard");
    }
  };

  const openExplorer = () => {
    if (account?.address) {
      const explorerUrl = `https://suiexplorer.com/address/${account.address}?network=testnet`;
      window.open(explorerUrl, "_blank");
    }
  };

  if (!account) {
    return (
      <ConnectButton
        style={{
          backgroundColor: "var(--violet-9)",
          color: "white",
          padding: "8px 16px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="soft" className="cursor-pointer">
          <Flex align="center" gap="2">
            <Box
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: "var(--grass-9)",
              }}
            />
            <Avatar
              size="1"
              fallback={account.address.slice(2, 4).toUpperCase()}
            />
            <Text weight="medium">{truncateAddress(account.address)}</Text>
          </Flex>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">
              Connected Wallet
            </Text>
            <Flex align="center" gap="2">
              <Box
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: "var(--grass-9)",
                }}
              />
              <Text weight="bold">{truncateAddress(account.address)}</Text>
            </Flex>
          </Flex>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={copyAddress}>
          <Flex align="center" gap="2">
            <Copy className="w-4 h-4" />
            <Text>Copy Address</Text>
          </Flex>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={openExplorer}>
          <Flex align="center" gap="2">
            <ExternalLink className="w-4 h-4" />
            <Text>View on Explorer</Text>
          </Flex>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">
              Balance
            </Text>
            <Flex align="center" gap="2">
              <Wallet className="w-4 h-4" />
              <Text weight="bold">{balance} SUI</Text>
            </Flex>
          </Flex>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <ConnectButton
            style={{
              width: "100%",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              padding: "4px 8px",
              color: "var(--red-11)",
            }}
          >
            <Flex align="center" gap="2">
              <LogOut className="w-4 h-4" />
              <Text>Disconnect</Text>
            </Flex>
          </ConnectButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
