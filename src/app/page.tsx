"use client";
import Footer from "@/components/Footer";
import GamePlaceholder from "@/components/GamePlaceholder";
import { useEffect } from "react";

import { redirect } from "next/navigation";

export default function Page() {
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

  return (
    <div className="min-h-screen flex flex-col gradient-bg ">
      <main className="flex-1 overflow-hidden">
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
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
              Experience the future of crypto gaming with secure and transparent
              betting.
            </p>

            {/* Games Section - Feature Showcase */}
            <div className="mt-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 font-montserrat tracking-tight">
                Featured Games
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <GamePlaceholder
                  title="Mines"
                  index={0}
                  onSelect={() => redirect("/mines")}
                />
                <GamePlaceholder
                  title="Plinko"
                  index={1}
                  onSelect={() => redirect("/pliko")}
                />
                <GamePlaceholder
                  title="Dice Game"
                  index={2}
                  onSelect={() => redirect("/dice")}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
