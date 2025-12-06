"use client";
import { Inter } from "next/font/google";
import { Theme } from "@radix-ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { networkConfig } from "@/core/networkConfig";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Toaster } from "@/components/ui/Toaster";

const inter = Inter({ subsets: ["latin"] });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      cacheTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Theme appearance="dark" accentColor="violet" grayColor="slate">
          <QueryClientProvider client={queryClient}>
            <SuiClientProvider
              networks={networkConfig}
              defaultNetwork="testnet"
            >
              <WalletProvider autoConnect>
                <div className="min-h-screen bg-gray-1">
                  <Navigation />
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                  </main>
                  <Toaster />
                </div>
              </WalletProvider>
            </SuiClientProvider>
          </QueryClientProvider>
        </Theme>
      </body>
    </html>
  );
}
