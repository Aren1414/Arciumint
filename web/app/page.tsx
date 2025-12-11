export default function Home() {
  return (
    <main className="relative min-h-screen text-white flex flex-col">

      {/* Global Neon Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-black" />

        {/* Neon blobs */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute w-[900px] h-[900px] -top-40 -left-40 bg-purple-600 blur-[180px]" />
          <div className="absolute w-[700px] h-[700px] bottom-0 right-0 bg-indigo-600 blur-[200px]" />
        </div>

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-10 bg-[url('/grid-lines.svg')] bg-repeat" />
      </div>

      {/* Header */}
      <header className="w-full border-b border-white/10 py-4 px-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Arciumint</h1>

        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
            Connect Wallet
          </button>

          <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            Faucet (Devnet)
          </button>
        </div>
      </header>

      {/* Banner Video - FULL VIDEO, NO CROP */}
      <section className="relative w-full h-[260px] sm:h-[350px] flex items-center justify-center overflow-hidden bg-black">

        {/* Neon background behind the video to avoid empty areas */}
        <div className="absolute inset-0 -z-10 opacity-40">
          <div className="absolute w-[700px] h-[700px] -top-20 left-1/2 -translate-x-1/2 bg-purple-700 blur-[160px]" />
          <div className="absolute w-[600px] h-[600px] bottom-0 left-1/3 bg-indigo-700 blur-[200px]" />
        </div>

        <video
          src="/banner.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="max-w-full max-h-full object-contain"
        />
      </section>

      {/* Description */}
      <section className="max-w-3xl mx-auto py-12 px-6 space-y-6">
        <h3 className="text-2xl font-semibold">About the Project</h3>

        <p className="text-white/80 leading-relaxed">
          This platform provides psychology-based personality evaluation tests, generates
          a unique NFT based on the results, and secures the asset using Arcium’s MPC
          infrastructure. The purpose is to offer deeper insight into behavioral tendencies
          for both users and Web3 projects.
        </p>

        <p className="text-white/80 leading-relaxed">
          Individuals benefit through better self-awareness and improved communication
          approaches. Projects gain access to aggregated, privacy-preserving insights
          without exposing any personal data, ensuring strong security through MPC.
        </p>

        <p className="text-white/80 leading-relaxed">
          The mainnet roadmap includes additional test categories and advanced personality
          analytics, fully powered by Arcium’s privacy architecture.
        </p>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-white/50 border-t border-white/10">
        © 2025 Arciumint — Devnet Demo
      </footer>
    </main>
  );
}
