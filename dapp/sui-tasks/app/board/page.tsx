"use client";

import { LandingPage } from "@/components/landing-page";
import { UserDashboard } from "@/components/user-dashboard";
import { useCurrentAccount } from "@mysten/dapp-kit";

export default function Home() {
  const account = useCurrentAccount();

  if (!account) {
    return <LandingPage />;
  }

  return <UserDashboard userAddress={account.address} />;
}
