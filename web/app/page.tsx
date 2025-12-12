"use client";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style jsx global>{`
        /* ========== Base reset ========== */
        html, body, #__next {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: auto;
          background: #050014; /* deep base — kept dark so neon reads well */
        }

        /* ========== Neon overlay (SINGLE UNIFORM LAYER) ========== */
        .neon-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: -10;

          /* put on its own compositing layer to avoid repaint artifacts */
          will-change: transform, opacity;
          transform: translateZ(0);
        }

        /* The single full-screen tint that produces an even neon look.
           This intentionally avoids multiple localized gradients that create
           stronger spots; instead we use a single tint + very subtle texture. */
        .neon-overlay::before {
          content: "";
          position: absolute;
          inset: 0;

          /* uniform neon tint (adjust rgba alpha to control strength) */
          background: rgba(138, 64, 255, 0.24); /* purple tint */
          mix-blend-mode: screen;

          /* slight blur to soften edges if any, but very small to avoid artifacts */
          filter: blur(18px);

          /* keep composited */
          will-change: opacity, transform;
          transform: translateZ(0);
        }

        /* Optional: faint secondary tint to add cyan hue evenly */
        .neon-overlay::after {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(38, 142, 255, 0.12); /* cyan tint */
          mix-blend-mode: screen;
          filter: blur(24px);
          opacity: 1;
        }

        /* Very subtle full-screen texture (low opacity) — won't change perceived tint */
        .neon-texture {
          position: absolute;
          inset: 0;
          background-image: url("/grid-lines.svg");
          background-repeat: repeat;
          opacity: 0.06;
          pointer-events: none;
        }

        /* Ensure main doesn't create its own background that overrides tint */
        main, section, header, footer {
          background: transparent;
        }

        /* Remove tap highlight */
        * { -webkit-tap-highlight-color: transparent; }

        /* Some accessibility / typography sanity */
        body { color: #fff; font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }
      `}</style>

      <main className="relative min-h-screen flex flex-col text-white overflow-x-hidden">

        {/* FULL-SCREEN UNIFORM NEON OVERLAY */}
        <div className="neon-overlay" aria-hidden="true">
          <div className="neon-texture" />
        </div>

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

        {/* BANNER VIDEO */}
        <section className="relative w-full bg-transparent">
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
            This platform offers a psychology-driven personality evaluation system that
            analyzes user responses, generates a uniquely encoded NFT that reflects the
            individual’s behavioral profile, and processes all sensitive computations through
            Arcium’s MPC infrastructure. By leveraging secure multi-party computation,
            personal data remains private while still enabling high-integrity behavioral
            insights suitable for both users and Web3-native applications.
          </p>

          <p className="text-white/80 leading-relaxed lg:text-3xl">
            Users gain a deeper understanding of their cognitive patterns, decision-making
            tendencies, and communication styles—empowering them with actionable
            self-awareness. Projects receive access to aggregated, privacy-preserving
            personality analytics secured by MPC, ensuring that no raw personal information
            is ever exposed during evaluation or storage.
          </p>

          <p className="text-white/80 leading-relaxed lg:text-3xl">
            The upcoming mainnet release will introduce expanded test categories, more
            advanced behavioral modeling, enriched analytics dashboards, and tighter
            integration with Arcium’s broader privacy architecture—all designed to provide a
            comprehensive and secure foundation for personality-based identity in Web3.
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
