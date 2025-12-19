"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePhantom } from "@phantom/react-sdk";
import { discQuestions } from "./questions.public";
import { submitDiscMpc } from "@/lib/discMpc";

export default function DiscTestPage() {
  const router = useRouter();
  const { isConnected } = usePhantom();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isConnected) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white">
        Wallet not connected
      </main>
    );
  }

  const question = discQuestions[currentIndex];
  const total = discQuestions.length;

  const selectOption = (id: string) => {
    setAnswers((p) => ({ ...p, [question.id]: id }));
  };

  const submit = async () => {
    try {
      setSubmitting(true);

      if (Object.keys(answers).length !== total) {
        alert("Answer all questions");
        return;
      }

      const provider = (window as any).solana;
      if (!provider?.isPhantom) {
        alert("Phantom wallet not found");
        return;
      }

      if (!provider.isConnected) {
        await provider.connect();
      }

      const res = await submitDiscMpc({
        wallet: provider,
        answers,
      });

      setResult(res);
    } catch (e) {
      console.error(e);
      alert("MPC failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl mb-4">DISC Result (Private)</h1>
        <pre className="text-sm bg-black/40 p-4 rounded max-w-xl overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
        <button
          className="mt-6 px-4 py-2 bg-blue-600 rounded"
          onClick={() => {
            setResult(null);
            setAnswers({});
            setCurrentIndex(0);
          }}
        >
          Retake
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 text-white bg-[#0b0018]">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between mb-6">
          <h1 className="text-xl font-semibold">DISC Personality Test</h1>
          <span>{currentIndex + 1} / {total}</span>
        </div>

        <div className="bg-white/10 p-6 rounded-xl">
          <h2 className="text-lg mb-6">{question.text}</h2>

          <div className="space-y-3">
            {question.options.map((o) => {
              const selected = answers[question.id] === o.id;

              return (
                <button
                  key={o.id}
                  onClick={() => selectOption(o.id)}
                  className={`
                    w-full text-left px-4 py-3 rounded-lg border
                    transition
                    ${selected
                      ? "bg-purple-600 border-purple-400 text-white"
                      : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    }
                  `}
                >
                  {o.text}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => i - 1)}
            className="px-4 py-2 bg-white/10 rounded disabled:opacity-40"
          >
            Previous
          </button>

          {currentIndex < total - 1 ? (
            <button
              disabled={!answers[question.id]}
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="px-4 py-2 bg-purple-600 rounded disabled:opacity-40"
            >
              Next
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting}
              className="px-4 py-2 bg-green-600 rounded"
            >
              {submitting ? "Submitting..." : "Finish"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
