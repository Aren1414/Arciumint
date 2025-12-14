"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PhantomCallback() {
  const router = useRouter();

  useEffect(() => {
    console.log("Returned from Phantom Connect");
    
    router.replace("/"); 
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Connecting wallet…
    </div>
  );
}
