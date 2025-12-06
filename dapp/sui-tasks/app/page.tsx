"use client";

import { Theme } from "@radix-ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";

import "@mysten/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";

import { networkConfig } from "../core/networkConfig";
const queryClient = new QueryClient();
import App from "../components/App";

export default function Home() {
  return (
    <div>
      <Theme appearance="dark">
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
            <WalletProvider autoConnect>
              <App />
            </WalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
      </Theme>
    </div>
  );
}
