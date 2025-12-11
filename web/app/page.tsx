export default function Home() {
  return (
    <main className="relative min-h-screen text-white flex flex-col">

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
      <header className="w-full border-b border-white/10 py-3 px-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Arciumint</h1>

        <div className="flex items-center gap-2 sm:gap-4">
          <button className="px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            Faucet (Devnet)
          </button>

          <button className="px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm bg-white/10 rounded-lg hover:bg-white/20 transition">
            Connect Wallet
          </button>
        </div>
      </header>

      {/* ====== FULL VIDEO — NO CROP — NO EMPTY SPACE ====== */}
      <section className="relative w-full aspect-[852/416] bg-black">
        <video
          src="/banner.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain"
        />
      </section>

      {/* Description */}
      <section className="max-w-3xl mx-auto py-12 px-6 space-y-6">
        <h3 className="text-2xl font-semibold">About the Project</h3>

        <p className="text-white/80 leading-relaxed">
          This platform provides psychology-based personality evaluation tests, generates
          a unique NFT based on the results, and secures it using Arcium’s MPC
          infrastructure. The goal is to deliver deeper insight into behavioral tendencies
          for both users and Web3 projects.
        </p>

        <p className="text-white/80 leading-relaxed">
          Users benefit through increased self-awareness and improved communication
          strategies. Projects gain access to aggregated personality insights secured
          through MPC, without exposing any sensitive information.
        </p>

        <p className="text-white/80 leading-relaxed">
          The mainnet version will include additional test categories, enhanced analytics,
          and expanded personality modeling powered by Arcium’s privacy architecture.
        </p>
      </section>

      <footer className="mt-auto py-6 text-center text-white/50 border-t border-white/10">
        © 2025 Arciumint — Devnet Demo
      </footer>
    </main>
  );
}
