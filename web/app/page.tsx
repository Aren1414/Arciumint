"use client";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style jsx global>{`
        html,
        body,
        #__next {
          margin: 0;
          padding: 0;
          height: 100%;
          background: linear-gradient(180deg, #050009 0%, #0e0220 100%);
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: auto;
        }

        .glow-wrapper {
          position: fixed;
          inset: 0;
          z-index: -10;
          pointer-events: none;
          overflow: hidden;
          will-change: transform, opacity;
          transform: translateZ(0);
        }

        .glow-layer {
          position: absolute;
          inset: 0;
          opacity: 0.45;
          mix-blend-mode: screen;
          will-change: transform;
          transform: translateZ(0);
        }
      `}</style>

      <main className="relative min-h-screen flex flex-col text-white overflow-x-hidden">

        {/* === UNIFIED BACKGROUND (FINAL FIX) === */}
        <div className="glow-wrapper">
          {/* Glow layer */}
          <div className="glow-layer">
            <div
              className="absolute w-[900px] h-[900px] -top-40 -left-40 bg-purple-600 blur-[200px]"
            />
            <div
              className="absolute w-[800px] h-[800px] bottom-0 right-0 bg-indigo-600 blur-[220px]"
            />
          </div>

          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-10 bg-[url('/grid-lines.svg')] bg-repeat" />
        </div>
        {/* === END BACKGROUND === */}

        {/* HEADER */}
        <header className="w-full border-b border-white/10 py-3 px-4 flex items-center justify-between z-20">
          <h1 className="text-lg font-semibold lg:text-2xl">Arciumint</h1>

          <div className="hidden sm:flex items-center gap-3">
            <Link href="/tests">
              <button className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition shadow-md">
                Start Assessment
              </button>
            </Link>
            <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md">
              Faucet (Devnet)
            </button>
            <button className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition shadow-md">
              Connect Wallet
            </button>
          </div>

          <div className="flex sm:hidden items-center gap-3">
            <button className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
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

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="sm:hidden w-full bg-white/5 backdrop-blur-md border-b border-white/20 flex flex-col p-4 gap-3 z-30">
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

        {/* VIDEO */}
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

        {/* CONTENT */}
        <section className="flex-1 max-w-3xl mx-auto px-6 py-10 lg:py-20 space-y-6">
          <h3 className="text-2xl font-semibold lg:text-5xl">About the Project</h3>

          <p className="text-white/80 leading-relaxed lg:text-3xl">
            This platform offers a psychology-driven personality evaluation system that analyzes user 
            responses, generates a uniquely encoded NFT that reflects the individual’s behavioral profile, 
            and processes all sensitive computations through Arcium’s MPC infrastructure.
          </p>

          <p className="text-white/80 leading-relaxed lg:text-3xl">
            Users gain a deeper understanding of their cognitive patterns, decision-making tendencies, 
            and communication styles—empowering them with actionable self-awareness.
          </p>

          <p className="text-white/80 leading-relaxed lg:text-3xl">
            The upcoming mainnet release will introduce expanded test categories, more advanced behavioral 
            modeling, enriched analytics dashboards, and tighter integration with Arcium’s broader privacy 
            architecture.
          </p>
        </section>

        {/* FOOTER */}
        <footer className="py-6 text-center text-white/50 border-t border-white/10 lg:text-lg">
          © 2025 Arciumint — Devnet Demo
        </footer>
      </main>
    </>
  );
}
