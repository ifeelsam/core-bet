"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const BetPanel = () => {
  const [betAmount, setBetAmount] = useState<string>("");
  const [mineCount, setMineCount] = useState<string>("0");
  const [profitMultiplier, setProfitMultiplier] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { wallet } = useWallet();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setBetAmount(value);
    }
  };

  const handleSubmit = () => {
    if (!wallet.isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error("Please enter a valid bet amount");
      return;
    }

    if (parseFloat(betAmount) > wallet.balance) {
      toast.error("Insufficient balance");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Bet placed successfully!", {
        description: `You've placed a ${mineCount} difficulty bet of ${betAmount} TCORE`,
      });
      setBetAmount("");
      setIsSubmitting(false);
    }, 1500);
  };
  const totalTiles = 25;
  const safeTiles = totalTiles - Number(mineCount);
  const mineCounts = Number(mineCount);


  useEffect(() => {
    let baseMultiplier = 1.0;
    for (let i = 1; i < Number(mineCount); i++) {
      baseMultiplier += 0.03;
    }
    setProfitMultiplier(baseMultiplier);
  }, [mineCount]);


  const potentialReturn = betAmount
    ? parseFloat(betAmount) * profitMultiplier
    : 0;

  return (
    <div className="glass-card rounded-xl p-6 md:p-8 w-full animate-slide-up h-full overflow-auto">
      <h2 className="text-2xl font-bold mb-6 font-montserrat tracking-tight text-center">
        Place Your Bet
      </h2>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="difficulty"
            className="block text-sm font-medium mb-2 text-gray-300"
          >
            No. of Mines
          </label>
          <Select value={mineCount} onValueChange={setMineCount}>
            <SelectTrigger
              id="difficulty"
              className="w-full bg-black/30 border-white/10"
            >
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent className="bg-black flex justify-center">
              {Array.from({ length: 24 }, (_, i) => {
                const num = i + 1;
                return (
                  <SelectItem
                    key={num}
                    value={String(num)}
                    className="flex items-center justify-center gap-2 focus:bg-gray-700"
                  >
                    <span className="hover:bg-gray-700">{num}</span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label
            htmlFor="betAmount"
            className="block text-sm font-medium mb-2 text-gray-300 border-white/10"
          >
            Bet Amount ({profitMultiplier.toFixed(2)}x)
          </label>
          <div className="relative">
            <Input
              id="betAmount"
              type="text"
              value={betAmount}
              onChange={handleInputChange}
              placeholder="0.00"
              className="input-primary w-full border-white/10 focus:neon-border"
              disabled={!wallet.isConnected || isSubmitting}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <span className="text-tcore-blue font-medium">TCORE</span>
            </div>
          </div>
        </div>

        {betAmount && parseFloat(betAmount) > 0 && (
          <div className="flex justify-between items-center px-4 py-3 bg-tcore-blue/5 rounded-lg border border-tcore-blue/20">
            <span className="text-sm text-gray-300">Potential Return:</span>
            <span className="font-medium text-tcore-blue">
              {potentialReturn.toFixed(2)} TCORE
            </span>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={
            !wallet.isConnected ||
            isSubmitting ||
            !betAmount ||
            parseFloat(betAmount) <= 0
          }
          className="bg-tcore-blue/90 w-full flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-tcore-dark-text"></div>
          ) : (
            <>
              Place Bet
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </Button>

        {!wallet.isConnected && (
          <p className="text-center text-xs text-gray-400 mt-2">
            Please connect your wallet to place a bet
          </p>
        )}
      </div>
    </div>
  );
};

function GameGrid() {
  const [tiles, setTiles] = useState(
    Array.from({ length: 25 }, (_, idx) => ({
      id: idx,
      clicked: false,
      mine: false,
    }))
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Simulate fetching data from a Solidity contract.
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // In your real implementation, replace this with a call to your solidity contract.
        // use ethers.js:
        // const provider = new ethers.providers.Web3Provider(window.ethereum);
        // const contract = new ethers.Contract(contractAddress, abi, provider);
        // const data = await contract.getMinesData();
        // Then map the data to update the tiles state accordingly.

        // For demonstration, we simulate a delay.
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // If the contract returns game data, you can update the 'tiles' state here.
        // For now, we simply use our initial dummy data.
      } catch (err) {
        console.error("Error fetching game data:", err);
        setError("Failed to load game data.");
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Optional: handle a tile click. This function can also trigger a
  // transaction call to your Solidity contract if needed.
  function handleTileClick(index: number) {
    setTiles((prevTiles) =>
      prevTiles.map((tile, idx) =>
        idx === index ? { ...tile, clicked: true } : tile
      )
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-lg font-medium">
        Loading game data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-4 w-[90%] h-[90%] p-6">
      {tiles.map((tile, idx) => (
        <div
          key={tile.id}
          onClick={() => handleTileClick(idx)}
          className="relative group"
        >
          <div
            className=" absolute inset-0 rounded-lg bg-tcore-blue-dark/80 transform translate-y-2 transition-transform duration-300 group-hover:-translate-y-0"
            style={{ zIndex: 1 }}
          ></div>
          {/* Main Tile */}
          <div
            className={`relative z-10 w-full h-full flex items-center justify-center rounded-lg transition-transform duration-300 ${
              tile.clicked
                ? "bg-tcore-blue/60"
                : "bg-tcore-blue hover:bg-tcore-blue hover:-translate-y-2"
            }`}
          >
            {tile.clicked && <span className="text-lg font-bold">✔</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Mines() {
  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      <main className="flex-1 overflow-hidden">
        <section className="py-32 px-0 md:px-6 min-h-screen">
          <div className="max-w-[1400px] mx-auto h-[calc(100vh-12rem)]">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-full">
              <div className="md:col-span-2 h-full">
                <BetPanel />
              </div>
              {/* Right Column - Game Area */}
              <div className="md:col-span-3 h-full flex items-center justify-center glass-card rounded-xl overflow-hidden">
                <GameGrid />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
