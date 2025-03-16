"use client";
import BetPanel from "@/components/BetPanel";
import Footer from "@/components/Footer";
import GamePlaceholder from "@/components/GamePlaceholder";
import { useState, useEffect } from "react";

export default function Page() {
  const [gameSelected, setGameSelected] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroSectionElement = document.getElementById("hero-background");

      if (heroSectionElement) {
        heroSectionElement.style.transform = `translateY(${scrollY * 0.2}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleGameSelect = (gameTitle: string) => {
    setSelectedGame(gameTitle);
    setGameSelected(true);
  };

  return (
    <div className="min-h-screen flex flex-col gradient-bg ">

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {!gameSelected ? (
          // Welcome Screen - Before Game Selection
          <section className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* Background blur effect */}
            <div
              id="hero-background"
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,224,255,0.15)_0%,_transparent_70%)]"
            />

            <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 font-montserrat tracking-tight">
                <span className="text-white">Welcome to </span>
                <span className="text-tcore-blue">CoreBet</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 font-light">
                Experience the future of crypto gaming with secure and
                transparent betting.
              </p>

              {/* Games Section - Feature Showcase */}
              <div className="mt-16">
                <h2 className="text-2xl md:text-3xl font-bold mb-8 font-montserrat tracking-tight">
                  Featured Games
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <GamePlaceholder
                    title="Game 1"
                    index={0}
                    onSelect={() => handleGameSelect("Game 1")}
                  />
                  <GamePlaceholder
                    title="Game 2"
                    index={1}
                    onSelect={() => handleGameSelect("Game 2")}
                  />
                  <GamePlaceholder
                    title="Game 3"
                    index={2}
                    onSelect={() => handleGameSelect("Game 3")}
                  />
                </div>
              </div>
            </div>
          </section>
        ) : (
          // Two-Column Layout - After Game Selection
          <section className="py-20 px-4 md:px-6 min-h-screen">
            <div className="max-w-7xl mx-auto h-[calc(100vh-12rem)]">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-full">
                {/* Left Column - Bet Panel */}
                <div className="md:col-span-2 h-full">
                  <BetPanel />
                </div>

                {/* Right Column - Game Area */}
                <div className="md:col-span-3 h-full flex items-center justify-center glass-card rounded-xl overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-tcore-blue mb-4">
                        {selectedGame}
                      </h2>
                      <p className="text-gray-400">
                        Game content will load here
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
