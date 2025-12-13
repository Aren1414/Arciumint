"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PhantomCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const errorCode = params.get("errorCode");
    const errorMessage = params.get("errorMessage");

    if (errorCode) {
      console.error("Phantom rejected:", errorCode, errorMessage);
    }

    
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Returning from Phantom…
    </div>
  );
}
