"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

type DiscScores = {
  d: number;
  i: number;
  s: number;
  c: number;
};

function interpretDisc({ d, i, s, c }: DiscScores) {
  const max = Math.max(d, i, s, c);

  if (max === d) return "Dominance — decisive, driven, results-oriented";
  if (max === i) return "Influence — social, expressive, enthusiastic";
  if (max === s) return "Steadiness — calm, reliable, supportive";
  return "Conscientiousness — analytical, precise, structured";
}

export default function DiscResultPage() {
  const params = useSearchParams();
  const router = useRouter();

  const d = Number(params.get("d"));
  const i = Number(params.get("i"));
  const s = Number(params.get("s"));
  const c = Number(params.get("c"));

  const isValid =
    Number.isFinite(d) &&
    Number.isFinite(i) &&
    Number.isFinite(s) &&
    Number.isFinite(c);

  useEffect(() => {
    if (!isValid) {
      router.replace("/tests");
    }
  }, [isValid, router]);

  if (!isValid) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white">
        Loading DISC result…
      </main>
    );
  }

  const interpretation = interpretDisc({ d, i, s, c });

  return (
    <main className="relative min-h-screen px-6 py-12 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#4f1aff,#3700b3,#0b0018)] -z-10" />

      <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-lg">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          Your DISC Profile
        </h1>

        <div className="grid grid-cols-2 gap-4 text-lg mb-6">
          <div>D: {d}</div>
          <div>I: {i}</div>
          <div>S: {s}</div>
          <div>C: {c}</div>
        </div>

        <div className="text-center text-purple-300 text-lg mb-8">
          {interpretation}
        </div>

        <button
          onClick={() => router.push("/tests")}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
        >
          Back to Assessments
        </button>
      </div>
    </main>
  );
}
