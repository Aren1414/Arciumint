"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PhantomCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const publicKey = params.get("public_key");
    const session = params.get("session");

    if (publicKey && session) {
      localStorage.setItem("phantom_public_key", publicKey);
      localStorage.setItem("phantom_session", session);
    }

    router.replace("/");
  }, [router]);

  return <div style={{ padding: 40, color: "white" }}>Connecting to Phantom...</div>;
}
