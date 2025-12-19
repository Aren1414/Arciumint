"use client";

import { useSearchParams } from "next/navigation";

export default function DiscResultClient() {
  const params = useSearchParams();

  const d = params.get("d");
  const i = params.get("i");
  const s = params.get("s");
  const c = params.get("c");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-white">
      <h1 className="text-2xl font-semibold mb-6">Your DISC Result</h1>

      <div className="space-y-2 text-lg">
        <div>D: {d ?? "-"}</div>
        <div>I: {i ?? "-"}</div>
        <div>S: {s ?? "-"}</div>
        <div>C: {c ?? "-"}</div>
      </div>
    </main>
  );
}
