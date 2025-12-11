"use client";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="relative min-h-screen flex flex-col text-white">

      {/* Global Neon Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 opacity-40">
          <div className="absolute w-[900px] h-[900px] -top-40 -left-40 bg-purple-600 blur-[180px]" />
          <div className="absolute w-[700px] h-[700px] bottom-0 right-0 bg-indigo-600 blur-[200px]" />
        </div>
        <div className="absolute inset-0 opacity-10 bg-[url('/grid-lines.svg')] bg-repeat" />
      </div>

      {/* Header */}
      <header className="w-full border-b border-white/10 py-3 px-4 flex items-center justify-between relative z-20">
        <h1 className="text-lg font-semibold lg:text-2xl">Arciumint</h1>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/tests">
            <button className="px-3 py-1 sm:px-4 sm:py-2 text-sm lg:text-base bg-purple-600 rounded-lg hover:bg-purple-700 transition">
              Start Assessment
            </button>
          </Link>
          <button className="px-3 py-1 sm:px-4 sm:py-2 text-sm lg:text-base bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            Faucet (Devnet)
          </button>
          <button className="px-3 py-1 sm:px-4 sm:py-2 text-sm lg:text-base bg-white/10 rounded-lg hover:bg-white/20 transition">
            Connect Wallet
          </button>
        </div>

        {/* Mobile Buttons */}
        <div className="flex lg:hidden items-center gap-3">
          <button className="px-3 py-1 sm:px-4 sm:py-2 text-sm bg-white/10 rounded-lg hover:bg-white/20 transition">
            Connect Wallet
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center gap-6 z-30 lg:hidden">
          <Link href="/tests">
            <button className="w-48 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition">
              Start Assessment
            </button>
          </Link>
          <button className="w-48 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            Faucet (Devnet)
          </button>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-48 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
          >
            Close Menu
          </button>
        </div>
      )}

      {/* Banner Video */}
      <section className="relative w-full bg-black">
        <video
          src="/banner.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto"
        />
      </section>

      {/* Description */}
      <section className="flex-1 max-w-3xl mx-auto px-6 py-10 lg:py-20 space-y-6 lg:space-y-8">
        <h3 className="text-2xl font-semibold lg:text-5xl">About the Project</h3>

        <p className="text-white/80 leading-relaxed lg:text-3xl lg:leading-relaxed">
          This platform offers a psychology-driven personality evaluation system that
          analyzes user responses, generates a uniquely encoded NFT that reflects the
          individual’s behavioral profile, and processes all sensitive computations through
          Arcium’s MPC infrastructure...
        </p>

        <p className="text-white/80 leading-relaxed lg:text-3xl lg:leading-relaxed">
          Users gain a deeper understanding of their cognitive patterns,
          decision-making tendencies, and communication styles...
        </p>

        <p className="text-white/80 leading-relaxed lg:text-3xl lg:leading-relaxed">
          The upcoming mainnet release will introduce expanded test categories...
        </p>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-white/50 border-t border-white/10 lg:text-lg">
        © 2025 Arciumint — Devnet Demo
      </footer>
    </main>
  );
}
