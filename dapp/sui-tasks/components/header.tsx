import Link from "next/link";
import { WalletStatus } from "./wallet-status";
import { LayoutGrid } from "lucide-react";

import { useCurrentAccount } from "@mysten/dapp-kit";

export function Header() {
  const account = useCurrentAccount();
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-xl"
        >
          <LayoutGrid className="h-6 w-6 text-primary" />
          <span>MoveIt</span>
        </Link>

        <nav className="flex items-center gap-6">
          {account && (
            <>
              <Link
                href="/board"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Your Boards
              </Link>
            </>
          )}

          <WalletStatus />
        </nav>
      </div>
    </header>
  );
}
