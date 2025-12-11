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

        {/* Fine neon lines */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('/grid-lines.svg')] bg-repeat opacity-10" />
        </div>
      </div>

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

      {/* Banner Video */}
      <section className="relative w-full h-[320px] sm:h-[380px] bg-black flex items-center justify-center overflow-hidden">
        <video
          src="/banner.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain"
        />
      </section>

      {/* Description Section */}
      <section className="max-w-3xl mx-auto py-12 px-6 space-y-6">
        <h3 className="text-2xl font-semibold">About the Project</h3>

        <p className="text-white/80 leading-relaxed">
          This platform enables users to access psychology-based personality evaluations, 
          generate a unique NFT from their results, and secure it through Arcium MPC infrastructure. 
          The objective is to help individuals and Web3 projects better understand behavioral patterns 
          and decision-making tendencies.
        </p>

        <p className="text-white/80 leading-relaxed">
          For individuals, the insights support personal development and improve communication 
          in both real-world and professional environments. For projects, aggregated insights—secured 
          privately through MPC—provide a deeper understanding of community profiles without exposing 
          individual identities.
        </p>

        <p className="text-white/80 leading-relaxed">
          On mainnet, additional test categories and advanced on-chain personality analytics will be 
          introduced, backed by Arcium’s privacy-preserving architecture.
        </p>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-white/50 border-t border-white/10">
        © 2025 Arcium Personality Lab — Devnet Demo
      </footer>
    </main>
  );
}
