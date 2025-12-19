import { Suspense } from "react";
import DiscResultClient from "./result-client";

export default function DiscResultPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DiscResultClient />
    </Suspense>
  );
}

function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center text-white">
      Loading result...
    </main>
  );
}
