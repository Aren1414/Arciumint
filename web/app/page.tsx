"use client";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          overscroll-behavior: none;
          background: #0b0018;
        }
      `}</style>

      <main className="relative min-h-screen flex flex-col text-white overflow-x-hidden touch-manipulation">

        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[#0b0018]" />
          <div className="absolute inset-0 opacity-40">
            <div className="absolute w-[900px] h-[900px] -top-40 -left-40 bg-purple-700 blur-[180px]" />
            <div className="absolute w-[700px] h-[700px] -bottom-40 right-0 bg-indigo-700 blur-[180px]" />
          </div>
          <div className="absolute inset-0 opacity-10 bg-[url('/grid-lines.svg')] bg-repeat" />
        </div>

        <header className="w-full border-b border-white/10 py-3 px-4 flex items-center justify-between relative z-20">
          <h1 className="text-lg font-semibold lg:text-2xl">Arciumint</h1>
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

        <section className="relative w-full bg-[#0b0018]">
          <video
            src="/banner.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto"
          />
        </section>

        <section className="flex-1 max-w-3xl mx-auto px-6 py-10 lg:py-20 space-y-6 lg:space-y-8">
          <h3 className="text-2xl font-semibold lg:text-5xl">About the Project</h3>
          <p className="text-white/80 leading-relaxed lg:text-3xl lg:leading-relaxed">
            This platform offers a psychology-driven personality evaluation system that
            analyzes user responses, generates a uniquely encoded NFT that reflects the
            individual’s behavioral profile, and processes all sensitive computations through
            Arcium’s MPC infrastructure. By leveraging secure multi-party computation,
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
            integration with Arcium’s broader privacy architecture—all designed to provide a
            comprehensive and secure foundation for personality-based identity in Web3.
          </p>
        </section>

        <footer className="py-6 text-center text-white/50 border-t border-white/10 lg:text-lg">
          © 2025 Arciumint — Devnet Demo
        </footer>
      </main>
    </>
  );
}
