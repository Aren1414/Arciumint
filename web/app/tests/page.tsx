"use client";

import { useRouter } from "next/navigation";

export default function TestsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-white px-6">
      <h1 className="text-3xl font-semibold mb-8">
        Assessments
      </h1>

      <div className="w-full max-w-md space-y-4">
        <button
          className="w-full px-4 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
          onClick={() => router.push("/tests/disc")}
        >
          DISC Personality Assessment
        </button>

        <button
          className="w-full px-4 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
          onClick={() => router.push("/tests/cognitive")}
        >
          Cognitive Style Assessment
        </button>

        <button
          className="w-full px-4 py-3 bg-emerald-600 rounded-lg hover:bg-emerald-700 transition"
          onClick={() => router.push("/tests/risk")}
        >
          Risk & Decision-Making Assessment
        </button>
      </div>
    </main>
  );
}
