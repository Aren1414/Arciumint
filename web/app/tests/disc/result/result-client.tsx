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
      <h1 className="text-2xl font-semibold mb-2">Your DISC Result</h1>
      <p className="text-white/70 mb-6">
        Dominant: <span className="font-semibold">{res.dominant}</span>
      </p>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg w-full max-w-md space-y-3 text-base">
        <Row label="D" value={`${res.dPct}%`} sub={`${res.d}/28`} />
        <Row label="I" value={`${res.iPct}%`} sub={`${res.i}/28`} />
        <Row label="S" value={`${res.sPct}%`} sub={`${res.s}/28`} />
        <Row label="C" value={`${res.cPct}%`} sub={`${res.c}/28`} />
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

function Row(props: { label: string; value: string; sub: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-3">
      <div className="text-lg">{props.label}</div>
      <div className="text-right">
        <div className="font-semibold text-lg">{props.value}</div>
        <div className="text-white/60 text-sm">{props.sub}</div>
      </div>
    </div>
  );
}
