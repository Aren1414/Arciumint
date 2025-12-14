"use client";

import { useRouter } from "next/navigation";
import { usePhantom } from "@phantom/react-sdk";
import { useState } from "react";

export default function TestsPage() {
  const router = useRouter();
  const { isConnected } = usePhantom();

  // موقت — بعداً از NFT / MPC / backend می‌آید
  const [completedTests] = useState<string[]>([]);

  const tests = [
    {
      id: "disc",
      title: "DISC Personality Assessment",
      route: "/tests/disc",
    },
    {
      id: "cognitive",
      title: "Cognitive Style Assessment",
      route: "/tests/cognitive",
    },
    {
      id: "risk",
      title: "Risk & Decision-Making Assessment",
      route: "/tests/risk",
    },
  ];

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 text-white overflow-hidden">
      {/* Neon background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#4f1aff,#3700b3,#0b0018)] -z-10" />

      <h1 className="text-3xl lg:text-4xl font-semibold mb-10">
        Assessments
      </h1>

      <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => {
          const completed = completedTests.includes(test.id);
          const locked = !isConnected;

          return (
            <div
              key={test.id}
              className={`
                relative rounded-xl p-6 border border-white/10
                backdrop-blur-md shadow-lg transition
                ${
                  completed
                    ? "bg-green-600/20 border-green-500"
                    : "bg-white/10 hover:bg-white/15"
                }
                ${locked ? "opacity-50" : "cursor-pointer"}
              `}
              onClick={() => {
                if (locked || completed) return;
                router.push(test.route);
              }}
            >
              <h3 className="text-lg font-semibold mb-3">
                {test.title}
              </h3>

              {completed ? (
                <span className="inline-block mt-2 text-sm text-green-400">
                  ✓ Completed
                </span>
              ) : locked ? (
                <span className="inline-block mt-2 text-sm text-white/60">
                  Connect wallet to start
                </span>
              ) : (
                <span className="inline-block mt-2 text-sm text-purple-300">
                  Start assessment →
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-10 text-white/70 text-center max-w-xl">
        These assessments are privacy-preserving evaluations processed through
        secure multi-party computation (MPC). More tests and surveys will be
        introduced soon.
      </p>
    </main>
  );
}
