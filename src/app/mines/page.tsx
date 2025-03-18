"use client";
import React, { useState, useEffect, useCallback } from "react";
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
// const constractId = "0xA0b8C076d6dB3F355DedA352b5098f4a8E1A5B9F";
import { abi, CONTRACT_ADDRESS } from "@/contracts/abi/mines.abi";
import { useAccount } from "wagmi";
import { parseEther } from "viem";
import { config, coreDaoTestnet } from "@/lib/config";
import { writeContract, readContract } from "@wagmi/core";
import { switchChain } from "@wagmi/core";
import { debounce } from "lodash"; // Add this import

interface Tile {
  id: number;
  clicked: boolean;
  mine: boolean;
}

interface GameData {
  betAmount: string;
  mineCount: number;
  seed: string;
  revealedCount: number;
  revealed: Array<{
    actual_value: boolean;
    isreveal: boolean;
  }>;
  active: boolean;
  cashed: boolean;
}


export default function Mines() {
  const [betAmount, setBetAmount] = useState<string>("");
  const [mineCount, setMineCount] = useState<string>("0");
  const [profitMultiplier, setProfitMultiplier] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { wallet } = useWallet();

  // const { writeContract } = useWriteContract();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setBetAmount(value);
    }
  };

  const handleSubmit = async () => {
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

    await switchChain(config, { chainId: coreDaoTestnet.id });
    try {
      const result = await writeContract(config, {
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "placeBet",
        args: [mineCount],
        chainId: coreDaoTestnet.id,
        value: parseEther(betAmount.toString()),
      });

      console.log("Place Bet!: ", result);

      // Add this: Wait for transaction to be mined then fetch game data
      setTimeout(() => {
        fetchGameData(true); // Force fetch after placing bet
      }, 2000);
    } catch (error) {
      console.error("Error placing bet:", error);
      toast.error("Failed to place bet");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const [tiles, setTiles] = useState<Tile[]>(
    Array.from({ length: 25 }, (_, idx) => ({
      id: idx,
      clicked: false,
      mine: false,
    }))
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [cachedGameData, setCachedGameData] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [loadingStartTime, setLoadingStartTime] = useState(0);

  const CACHE_DURATION = 3000; // 3 seconds
  const MINIMUM_LOADING_TIME = 500; // ms

  const account = useAccount();

  // Function to fetch game data from the contract
  const fetchGameData = useCallback(
    async (force = false) => {
      if (!account.address) return;

      const now = Date.now();
      if (!force && cachedGameData && now - lastFetchTime < CACHE_DURATION) {
        return cachedGameData; // Use cached data if recent
      }

      setLoadingStartTime(now);
      if (!gameData) setLoading(true); // Only show loading on initial load

      try {
        const result = await readContract(config, {
          abi,
          address: CONTRACT_ADDRESS,
          functionName: "getGameStatus",
          args: [account.address],
        });

        // Convert BigInt values to strings for JSON serialization
        const processedResult = JSON.parse(
          JSON.stringify(result, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
          )
        );

        console.log("getGameStatus:", processedResult);

        // Only update state if data has changed
        if (
          !gameData ||
          JSON.stringify(processedResult) !== JSON.stringify(gameData)
        ) {
          setGameData(processedResult);
          setCachedGameData(processedResult);
          setLastFetchTime(now);

          // Update tiles based on contract data
          if (processedResult && processedResult.revealed) {
            setTiles((prev) => {
              const needsUpdate = processedResult.revealed.some(
                (tile: any, idx: number) =>
                  tile.isreveal !== prev[idx].clicked ||
                  tile.actual_value !== prev[idx].mine
              );

              if (!needsUpdate) return prev; // Skip update if no changes

              return prev.map((tile, idx) => ({
                ...tile,
                clicked: processedResult.revealed[idx].isreveal,
                mine: processedResult.revealed[idx].actual_value,
              }));
            });

            setIsGameActive(processedResult.active);
          }
        }

        // Ensure loading state shows for at least MINIMUM_LOADING_TIME
        const loadingElapsed = Date.now() - loadingStartTime;
        if (loadingElapsed < MINIMUM_LOADING_TIME) {
          await new Promise((resolve) =>
            setTimeout(resolve, MINIMUM_LOADING_TIME - loadingElapsed)
          );
        }

        setLoading(false);
        return processedResult;
      } catch (err) {
        console.error("Error fetching game data:", err);

        // Wait minimum time even on error
        const loadingElapsed = Date.now() - loadingStartTime;
        if (loadingElapsed < MINIMUM_LOADING_TIME) {
          await new Promise((resolve) =>
            setTimeout(resolve, MINIMUM_LOADING_TIME - loadingElapsed)
          );
        }

        setLoading(false);
        setError("Failed to load game data. Please try again.");
        return null;
      }
    },
    [account.address, gameData, cachedGameData, lastFetchTime]
  );

  // Create a debounced version of the fetch function
  const debouncedFetchGameData = useCallback(
    debounce((force = false) => {
      fetchGameData(force);
    }, 300),
    [fetchGameData]
  );

  // Initial data fetch and polling setup
  useEffect(() => {
    // Initial fetch when component mounts
    const initialFetch = async () => {
      await fetchGameData(true); // Force initial fetch
    };

    initialFetch();

    // Set up polling for updates
    const intervalId = setInterval(() => {
      // Only fetch if game is active
      if (isGameActive) {
        debouncedFetchGameData();
      }
    }, 5000); // Poll every 5 seconds when game is active

    return () => {
      clearInterval(intervalId); // Clean up interval on unmount
    };
  }, [fetchGameData, debouncedFetchGameData, isGameActive]);

  // Handle tile click
  async function handleTileClick(index: number) {
    // Don't allow clicks if the game is not active
    if (!isGameActive) {
      console.log("Game is not active");
      return;
    }

    // Don't allow clicks on already revealed tiles
    if (tiles[index].clicked) {
      console.log("Tile already revealed");
      return;
    }

    try {
      // Make sure we're on the right chain
      await switchChain(config, { chainId: coreDaoTestnet.id });

      // Call the contract to reveal the tile
      const result = await writeContract(config, {
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "revealTile",
        args: [index],
        chainId: coreDaoTestnet.id,
      });

      console.log("revealTile transaction:", result);

      // Optimistically update the UI
      setTiles((prevTiles) =>
        prevTiles.map((tile, idx) =>
          idx === index ? { ...tile, clicked: true } : tile
        )
      );

      // Wait a bit for the transaction to be processed before fetching updated state
      setTimeout(() => {
        fetchGameData(true); // Force fetch after tile reveal
      }, 2000);
    } catch (err) {
      console.error("Error revealing tile:", err);
      setError("Failed to reveal tile. Please try again.");
    }
  }

  if (loading && !gameData) {
    return (
      <div className="grid grid-cols-5 gap-4 w-[90%] h-[90%] p-6">
        {Array.from({ length: 25 }).map((_, index) => (
          <div
            key={index}
            className="relative animate-pulse bg-gray-300 rounded-lg w-full h-full"
          />
        ))}
      </div>
    );
  }

  if (error && !gameData) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      <main className="flex-1 overflow-hidden">
        <section className="py-32 px-0 md:px-6 min-h-screen">
          <div className="max-w-[1400px] mx-auto h-[calc(100vh-12rem)]">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-full">
              <div className="md:col-span-2 h-full">
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
                          <span className="text-tcore-blue font-medium">
                            TCORE
                          </span>
                        </div>
                      </div>
                    </div>

                    {betAmount && parseFloat(betAmount) > 0 && (
                      <div className="flex justify-between items-center px-4 py-3 bg-tcore-blue/5 rounded-lg border border-tcore-blue/20">
                        <span className="text-sm text-gray-300">
                          Potential Return:
                        </span>
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
                        parseFloat(betAmount) <= 0 ||
                        isGameActive // Add this condition
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

                    {isGameActive && ( // Only show when game is active
                      <Button
                        className="bg-tcore-blue/90 w-full flex items-center justify-center gap-2"
                        onClick={async () => {
                          await switchChain(config, {
                            chainId: coreDaoTestnet.id,
                          });

                          const result = await writeContract(config, {
                            abi,
                            address: CONTRACT_ADDRESS,
                            functionName: "cashOut",
                            chainId: coreDaoTestnet.id,
                          });

                          console.log("cashOut: ", result);

                          // Add this: Fetch updated game data after cashing out
                          setTimeout(() => {
                            fetchGameData(true);
                          }, 2000);
                        }}
                      >
                        Cash Out
                      </Button>
                    )}

                    {!wallet.isConnected && (
                      <p className="text-center text-xs text-gray-400 mt-2">
                        Please connect your wallet to place a bet
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {/* Right Column - Game Area */}
              <div className="md:col-span-3 h-full flex items-center justify-center glass-card rounded-xl overflow-hidden">
                {isGameActive ? (
                  // Show active game grid
                  <div className="grid grid-cols-5 gap-4 w-[90%] h-[90%] p-6">
                    {tiles.map((tile, idx) => (
                      <div
                        key={tile.id}
                        onClick={() => handleTileClick(idx)}
                        className="relative group cursor-pointer"
                      >
                        <div
                          className="absolute inset-0 rounded-lg bg-tcore-blue-dark/80 transform translate-y-2 transition-transform duration-300 group-hover:-translate-y-0"
                          style={{ zIndex: 1 }}
                        ></div>
                        {/* Main Tile */}
                        <div
                          className={`relative z-10 w-full h-full flex items-center justify-center rounded-lg transition-transform duration-300 ${
                            tile.clicked
                              ? tile.mine
                                ? "bg-red-500" // Mine
                                : "bg-green-500" // Safe tile
                              : "bg-tcore-blue hover:bg-tcore-blue hover:-translate-y-2"
                          }`}
                        >
                          {tile.clicked && (
                            <span className="text-lg font-bold">
                              {tile.mine ? "💣" : "💎"}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Show inactive game message
                  <div className="flex flex-col items-center justify-center text-center p-6">
                    <h3 className="text-xl font-bold mb-4">No Active Game</h3>
                    <p className="text-gray-300 mb-6">
                      Place a bet to start playing!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
