"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePhantom } from "@phantom/react-sdk";
import { discQuestions } from "./questions.public";
import { submitDiscMpc } from "@/lib/discMpc";

export default function DiscTestPage() {
  const router = useRouter();
  const { isConnected, user, provider } = usePhantom();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [mpcRawResult, setMpcRawResult] = useState<any>(null);

  const address = useMemo(() => {
    const a = user?.addresses?.[0]?.address;
    return typeof a === "string" ? a : null;
  }, [user]);

  if (!isConnected || !user || !address || !provider) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-white px-6">
        <h2 className="text-xl mb-4">Wallet not connected</h2>
        <button
          onClick={() => router.push("/tests")}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          Back to Assessments
        </button>
      </main>
    );
  }

  const question = discQuestions[currentIndex];
  const total = discQuestions.length;

  const selectOption = (optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: optionId,
    }));
  };

  const submit = async () => {
    try {
      setSubmitting(true);
      setMpcRawResult(null);

      if (Object.keys(answers).length !== total) {
        alert("Answer all questions");
        return;
      }

      const result = await submitDiscMpc({
        wallet: provider,
        answers,
      });

      setMpcRawResult(result);
    } catch (err) {
      console.error(err);
      alert("MPC computation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (mpcRawResult) {
    return (
      <main className="relative min-h-screen px-6 py-10 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#4f1aff,#3700b3,#0b0018)] -z-10" />

        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">DISC Result</h1>
            <button
              onClick={() => {
                setMpcRawResult(null);
                setCurrentIndex(0);
                setAnswers({});
              }}
              className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
            >
              Retake
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg">
            <pre className="whitespace-pre-wrap break-words text-sm">
              {JSON.stringify(mpcRawResult, null, 2)}
            </pre>
          </div>

          <div className="mt-6">
            <button
              onClick={() => router.push("/tests")}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              Back to Assessments
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen px-6 py-10 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#4f1aff,#3700b3,#0b0018)] -z-10" />

      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">DISC Personality Assessment</h1>
          <span className="text-white/70">
            {currentIndex + 1} / {total}
          </span>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-medium mb-6">{question.text}</h2>

          <div className="space-y-3">
            {question.options.map((option) => {
              const selected = answers[question.id] === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => selectOption(option.id)}
                  className={`
                    w-full text-left px-4 py-3 rounded-lg border transition
                    ${
                      selected
                        ? "bg-purple-600/60 border-purple-400"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }
                  `}
                >
                  {option.text}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => router.push("/tests")}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
          >
            ← Back
          </button>

          <div className="flex gap-3">
            <button
              disabled={currentIndex === 0 || submitting}
              onClick={() => setCurrentIndex((i) => i - 1)}
              className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 disabled:opacity-40 transition"
            >
              Previous
            </button>

            {currentIndex < total - 1 ? (
              <button
                disabled={!answers[question.id] || submitting}
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-40 transition"
              >
                Next
              </button>
            ) : (
              <button
                disabled={Object.keys(answers).length !== total || submitting}
                onClick={submit}
                className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-40 transition"
              >
                {submitting ? "Submitting..." : "Finish"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
  }
