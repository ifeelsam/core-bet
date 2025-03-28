"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WagmiProvider } from "wagmi";
import Header from "@/components/Header";
import { config } from "@/lib/config";
const queryClient = new QueryClient();

export function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Header />
            {children}
          </TooltipProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}
