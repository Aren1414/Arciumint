export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">

      {/* Header */}
      <header className="w-full border-b border-white/10 py-4 px-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Arcium Personality Lab</h1>

        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
            Connect Wallet
          </button>

          <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            Faucet (Devnet)
          </button>
        </div>
      </header>

      {/* Banner / Video Section */}
      <section className="relative w-full h-[300px] sm:h-[380px] overflow-hidden">

        {/* Neon Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700/40 to-indigo-800/40 blur-2xl" />

        {/* Glow Layer */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-purple-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl" />
        </div>

        {/* Video */}
        <video
          src="/banner.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-contain z-10"
        />

      </section>

      {/* Description Section */}
      <section className="max-w-3xl mx-auto py-12 px-6 space-y-6">
        <h3 className="text-2xl font-semibold">About the Project</h3>

        <p className="text-white/80 leading-relaxed">
          This platform enables users to take psychology-based personality tests,
          generate a unique NFT from their results, and store it securely using
          Arcium’s MPC infrastructure. Our goal is to help both individuals and
          Web3 projects better understand behavioral patterns and decision-making styles.
        </p>

        <p className="text-white/80 leading-relaxed">
          For users, the insights can guide personal development and improve
          communication in real-world or business scenarios. For projects, aggregated
          insights (fully private and MPC-secured) help understand community traits
          without exposing any individual’s identity.
        </p>

        <p className="text-white/80 leading-relaxed">
          On mainnet, we plan to expand test categories and provide on-chain
          personality analytics with strong privacy guarantees powered by Arcium.
        </p>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-white/50 border-t border-white/10">
        © 2025 Arcium Personality Lab — Devnet Demo
      </footer>
    </main>
  );
}
