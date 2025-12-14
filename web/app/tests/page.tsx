"use client";

import Link from "next/link";

const tests = [
  {
    id: "disc",
    title: "DISC Personality Test",
    description: "Analyze your dominant behavioral traits",
  },
  {
    id: "bias",
    title: "Cognitive Bias Test",
    description: "Understand how biases affect your decisions",
  },
  {
    id: "decision",
    title: "Decision Style Test",
    description: "Evaluate your decision-making patterns",
  },
];

export default function TestsPage() {
  return (
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto text-white">
      <h1 className="text-3xl font-semibold mb-8">Assessments</h1>

      <div className="space-y-4">
        {tests.map((test) => (
          <Link key={test.id} href={`/tests/${test.id}`}>
            <div className="p-5 border border-white/10 rounded-xl hover:bg-white/5 transition cursor-pointer">
              <h2 className="text-xl font-medium">{test.title}</h2>
              <p className="text-white/70 mt-1">{test.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
