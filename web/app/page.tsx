export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">

      {/* Header */}
      <header className="w-full border-b border-white/10 py-4 px-6 flex items-center justify-between backdrop-blur-sm bg-black/40">
        <h1 className="text-xl font-semibold tracking-tight">Arciumint</h1>

        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
            Connect Wallet
          </button>

          <button className="px-4 py-2 bg-pink-600 rounded-lg hover:bg-pink-700 transition">
            Faucet (Devnet)
          </button>
        </div>
      </header>

      {/* Hero / Video Banner */}
      <section className="w-full h-[300px] relative overflow-hidden border-b border-white/10">
        <video
          src="/banner.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/90 flex items-end px-8 pb-8">
          <h2 className="text-3xl font-bold tracking-tight max-w-xl">
            Discover Your Personality. Fully On-Chain. Powered by Arcium MPC.
          </h2>
        </div>
      </section>

      {/* Description Section */}
      <section className="max-w-3xl mx-auto py-12 px-6 space-y-6">

        <h3 className="text-2xl font-semibold">About Arciumint</h3>

        <p className="text-white/80 leading-relaxed">
          Arciumint is an independent personality-profiling platform that transforms 
          psychology-based test results into unique, non-transferable NFTs. These results 
          are computed and secured using Arcium’s MPC technology, allowing users to verify 
          their personality type on-chain without revealing sensitive data.
        </p>

        <p className="text-white/80 leading-relaxed">
          For users, personality insights can improve self-awareness, relationships, 
          and decision-making. For Web3 projects, aggregated MPC-protected data can help 
          understand community behavior patterns — with full privacy guarantees.
        </p>

        <p className="text-white/80 leading-relaxed">
          Future plans for mainnet include expanded test categories, deeper analytics, 
          and advanced privacy-focused identity modules built on Arcium infrastructure.
        </p>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-white/40 border-t border-white/10">
        © 2025 Arciumint — Devnet Experimental Demo
      </footer>
    </main>
  );
}
