"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function TestPlaceholderPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto text-white">
      <h1 className="text-3xl font-semibold mb-4">
        {slug.toUpperCase()} Test
      </h1>

      <p className="text-white/70 mb-6">
        This assessment will be available soon.
      </p>

      <Link href="/tests">
        <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
          Back to Assessments
        </button>
      </Link>
    </main>
  );
}
