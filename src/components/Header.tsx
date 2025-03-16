import { useState, useEffect } from "react";
import WalletAdapter from "./WalletAdapter";
import { cn } from "@/lib/utils";
import Link from "next/link";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  // Add shadow when scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-10 transition-all duration-300",
        "bg-tcore-darker/50 backdrop-blur-md border-b border-white/5",
        scrolled && "shadow-lg shadow-black/20"
      )}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center">
            <div className="text-2xl font-extrabold font-montserrat tracking-tight">
              <span className="text-tcore-blue">Core</span>
              <span className="text-white">Bet</span>
            </div>
          </div>
        </Link>

        <WalletAdapter />
      </div>
    </header>
  );
};

export default Header;
function calculateMinesReturn({
  betAmount,
  mines,
  safeCount,
  totalTiles = 25,
}: MinesReturnInput): number {
  // Calculate the number of safe tiles available in the grid.
  const safeTiles = totalTiles - mines;

  // Start with a base multiplier of 1.
  let multiplier = 1;

  // For each safe tile uncovered, boost the multiplier.
  // The idea: the "fair" multiplier for a safe pick equals the inverse chance of getting a safe pick.
  // That chance at the i-th pick is (safeTiles - i) / (totalTiles - i).
  for (let i = 0; i < safeCount; i++) {
    multiplier *= (totalTiles - i) / (safeTiles - i);
  }

  // Optionally adjust for a house edge (e.g., a 1% fee, giving around 99% RTP):
  multiplier *= 0.99;

  // The potential return is simply the wager multiplied by our computed multiplier.
  return betAmount * multiplier;
}
