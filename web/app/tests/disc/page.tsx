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
  const [mpcRawResult, setMpcRawResult] = useState<any>(null);

  if (!isConnected) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-white px-6">
        <h2 className="text-xl mb-4">Wallet not connected</h2>
        <button
          onClick={() => router.push("/tests")}
          className="px-4 py-2 bg-blue-600 rounded-lg"
        >
          Back
        </button>
      </main>
    );
  }

  const question = discQuestions[currentIndex];
  const total = discQuestions.length;

  const selectOption = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
  };

  const submit = async () => {
    try {
      setSubmitting(true);
      setMpcRawResult(null);

      if (Object.keys(answers).length !== total) {
        alert("Answer all questions");
        return;
      }

      // ✅ ONLY injected Solana provider
      const provider = (window as any).solana;
      if (!provider || !provider.isPhantom) {
        alert("Phantom wallet not found");
        return;
      }

      if (!provider.isConnected) {
        await provider.connect();
      }

      const result = await submitDiscMpc({
        wallet: provider,
        answers,
      });

      setMpcRawResult(result);
    } catch (e) {
      console.error(e);
      alert("MPC computation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (mpcRawResult) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl mb-4">DISC Result (Private)</h1>
        <pre className="text-sm max-w-xl whitespace-pre-wrap">
          {JSON.stringify(mpcRawResult, null, 2)}
        </pre>
        <button
          className="mt-6 px-4 py-2 bg-blue-600 rounded"
          onClick={() => {
            setMpcRawResult(null);
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
    <main className="min-h-screen px-6 py-10 text-white">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between mb-6">
          <h1>DISC Test</h1>
          <span>{currentIndex + 1}/{total}</span>
        </div>

        <div className="p-6 bg-white/10 rounded-xl">
          <h2 className="mb-4">{question.text}</h2>
          {question.options.map((o) => (
            <button
              key={o.id}
              onClick={() => selectOption(o.id)}
              className="block w-full text-left p-3 mb-2 bg-white/5 rounded"
            >
              {o.text}
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => i - 1)}
          >
            Previous
          </button>

          {currentIndex < total - 1 ? (
            <button
              disabled={!answers[question.id]}
              onClick={() => setCurrentIndex((i) => i + 1)}
            >
              Next
            </button>
          ) : (
            <button
              disabled={submitting}
              onClick={submit}
            >
              {submitting ? "Submitting..." : "Finish"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
