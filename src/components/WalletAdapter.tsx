import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { Wallet, ChevronDown, ChevronUp, LogOut, LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { coreDaoTestnet } from "@/lib/config";
import Link from "next/link";

const WalletAdapter = () => {
  const { wallet, isLoading, connect, disconnect } = useWallet();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsDropdownOpen(false);
    };

    if (isDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (!wallet.isConnected) {
    return (
      <Button
        onClick={connect}
        disabled={isLoading}
        className="btn-primary flex items-center gap-2 font-montserrat"
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-tcore-dark-text"></div>
        ) : (
          <Wallet className="h-4 w-4" />
        )}
        Connect Wallet
      </Button>
    );
  }

  const isTestnet = wallet.chainId === coreDaoTestnet.id;

  return (
    <div className="relative">
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-4 rounded-lg cursor-pointer transition-all duration-300",
          "glass-card hover:neon-border animate-blur-in"
        )}
        onClick={toggleDropdown}
      >
        <Wallet className="h-5 w-5 text-tcore-blue" />
        <div className="flex flex-col">
          {/* <span className="text-xs text-gray-400">Wallet</span> */}
          <span className="font-medium">{wallet.address}</span>
        </div>
        <div className="flex flex-col items-end ml-2">
          <span className="text-xs text-gray-400">Balance</span>
          <div className="flex items-center">
            <span className="font-medium text-tcore-blue">
              {wallet.balance.toFixed(3)} CORE
            </span>
            {isTestnet && (
              <span className="ml-1 text-xs px-1 bg-yellow-500/20 text-yellow-500 rounded">
                Testnet
              </span>
            )}
          </div>
        </div>
        {isDropdownOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </div>

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 p-2 glass-card rounded-lg shadow-xl w-full z-50">
          <button
            onClick={disconnect}
            className="w-full flex items-center gap-2 p-2 hover:bg-white/5 rounded transition-colors text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </button>
          <Link
            href={`${coreDaoTestnet.blockExplorers.default.url}/address/${wallet.walletAdd}`}
          >
            <button className="w-full flex items-center gap-2 p-2 hover:bg-white/5 rounded transition-colors text-gray-400">
              <LinkIcon className="h-4 w-4" />
              View on Explorer
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default WalletAdapter;
