"use client";

import { useRouter } from "next/navigation";
import { clearDiscResult, getDiscResult } from "@/lib/discStore";

export default function DiscResultClient() {
  const router = useRouter();
  const res = getDiscResult();

  if (!res) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-white px-6">
        <h1 className="text-2xl font-semibold mb-4">Result expired</h1>
        <button
          onClick={() => router.push("/tests/disc")}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          Retake DISC
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-white px-6">
      <h1 className="text-2xl font-semibold mb-6">Your DISC Result</h1>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg w-full max-w-md space-y-3 text-lg">
        <div className="flex justify-between">
          <span>D</span>
          <span className="font-semibold">{res.d}</span>
        </div>
        <div className="flex justify-between">
          <span>I</span>
          <span className="font-semibold">{res.i}</span>
        </div>
        <div className="flex justify-between">
          <span>S</span>
          <span className="font-semibold">{res.s}</span>
        </div>
        <div className="flex justify-between">
          <span>C</span>
          <span className="font-semibold">{res.c}</span>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={() => {
            clearDiscResult();
            router.push("/tests");
          }}
          className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
        >
          Back to Assessments
        </button>

        <button
          onClick={() => {
            clearDiscResult();
            router.push("/tests/disc");
          }}
          className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
        >
          Retake
        </button>
      </div>
    </main>
  );
}
