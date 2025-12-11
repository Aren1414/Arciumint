"use client";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="relative min-h-screen flex flex-col text-white overflow-x-hidden overscroll-y-none">

      {/* Global fixes */}
      <style jsx global>{`
        html, body {
          background: #000;
        }
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>

      {/* Global Neon Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-black" />

        {/* Neon glows (tuned to avoid color band on mobile scroll) */}
        <div className="absolute inset-0 opacity-35">
          <div className="absolute w-[900px] h-[900px] -top-40 -left-40 bg-purple-600 blur-[160px]" />
          {/* Lift further from bottom and soften blur to avoid color band */}
          <div className="absolute w-[640px] h-[640px] bottom-40 right-2 bg-indigo-600 blur-[160px]" />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-8 bg-[url('/grid-lines.svg')] bg-repeat" />

        {/* Solid bottom mask to fully cover any edge glow on mobile */}
        <div className="absolute left-0 right-0 bottom-0 h-10 bg-black" />
      </div>

      {/* Header */}
      <header className="w-full border-b border-white/10 py-3 px-4 flex items-center justify-between relative z-20">
        <h1 className="text-lg font-semibold lg:text-2xl">Arciumint</h1>

        {/* Desktop: all buttons visible (no hamburger) */}
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/tests">
            <button className="px-4 py-2 text-sm lg:text-base bg-purple-600 rounded-lg hover:bg-purple-700 transition shadow-md">
              Start Assessment
            </button>
          </Link>
          <button className="px-4 py-2 text-sm lg:text-base bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md">
            Faucet (Devnet)
          </button>
          <button className="px-4 py-2 text-sm lg:text-base bg-white/10 rounded-lg hover:bg-white/20 transition shadow-md">
            Connect Wallet
          </button>
        </div>

        {/* Mobile: only Connect + hamburger */}
        <div className="flex sm:hidden items-center gap-3">
          <button className="px-3 py-2 text-sm bg-white/10 rounded-lg hover:bg-white/20 transition">
            Connect Wallet
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Mobile menu: inline, pushes video down; matches page background via translucent layer */}
      {menuOpen && (
        <div className="sm:hidden w-full bg-white/10 backdrop-blur-sm border-b border-white/20 flex flex-col p-4 gap-3 z-30">
          <Link href="/tests">
            <button className="w-full px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition shadow-md">
              Start Assessment
            </button>
          </Link>
          <button className="w-full px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md">
            Faucet (Devnet)
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
          Arcíum’s MPC infrastructure. By leveraging secure multi-party computation,
          personal data remains private while still enabling high-integrity behavioral
          insights suitable for both users and Web3-native applications.
        </p>

        <p className="text-white/80 leading-relaxed lg:text-3xl lg:leading-relaxed">
          Users gain a deeper understanding of their cognitive patterns, decision-making
          tendencies, and communication styles—empowering them with actionable
          self-awareness. Projects receive access to aggregated, privacy-preserving
          personality analytics secured by MPC, ensuring that no raw personal information
          is ever exposed during evaluation or storage.
        </p>

        <p className="text-white/80 leading-relaxed lg:text-3xl lg:leading-relaxed">
          The upcoming mainnet release will introduce expanded test categories, more
          advanced behavioral modeling, enriched analytics dashboards, and tighter
          integration with Arcíum’s broader privacy architecture—all designed to provide a
          comprehensive and secure foundation for personality-based identity in Web3.
        </p>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-white/50 border-t border-white/10 lg:text-lg">
        © 2025 Arciumint — Devnet Demo
      </footer>
    </main>
  );
}
