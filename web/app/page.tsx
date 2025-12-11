export default function Home() {
  return (
    <main className="relative min-h-0 flex flex-col text-white">

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
        <h1 className="text-lg font-semibold lg:text-2xl">Arciumint</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm lg:text-base bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            Faucet (Devnet)
          </button>
          <button className="px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm lg:text-base bg-white/10 rounded-lg hover:bg-white/20 transition">
            Connect Wallet
          </button>
        </div>
      </header>

      {/* Banner Video */}
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
      <section className="max-w-3xl mx-auto px-6 py-10 lg:py-20 space-y-6 lg:space-y-8">
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

      {/* Footer */}
      <footer className="py-6 text-center text-white/50 border-t border-white/10 lg:text-lg">
        © 2025 Arciumint — Devnet Demo
      </footer>

    </main>
  );
}
