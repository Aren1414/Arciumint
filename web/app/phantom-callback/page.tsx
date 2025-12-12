"use client";

import { useEffect } from "react";
import type { ReactElement } from "react";
import nacl from "tweetnacl";
import bs58 from "bs58";

interface PhantomSession {
  public_key: string;
  session: string;
  created: number;
}

export default function PhantomCallback(): ReactElement {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);

      const phantom_pub: string | null = params.get("phantom_encryption_public_key");
      const nonce58: string | null = params.get("nonce");
      const data58: string | null = params.get("data");

      const secret58: string | null = sessionStorage.getItem("phantom_dapp_secret");
      if (!secret58 || !phantom_pub || !nonce58 || !data58) {
        window.location.replace("/");
        return;
      }

      const dapp_secret: Uint8Array = bs58.decode(secret58).slice(0, 32);
      const phantom_pub_key: Uint8Array = bs58.decode(phantom_pub);
      const nonce: Uint8Array = bs58.decode(nonce58);
      const encryptedData: Uint8Array = bs58.decode(data58);

      const shared: Uint8Array = nacl.box.before(phantom_pub_key, dapp_secret);
      const decrypted: Uint8Array | null = nacl.box.open.after(encryptedData, nonce, shared);

      if (!decrypted) {
        window.location.replace("/");
        return;
      }

      const json = JSON.parse(new TextDecoder().decode(decrypted)) as {
        public_key: string;
        session: string;
      };

      const sessionObj: PhantomSession = {
        public_key: json.public_key,
        session: json.session,
        created: Date.now(),
      };

      localStorage.setItem("phantom_mobile_session", JSON.stringify(sessionObj));
      sessionStorage.removeItem("phantom_dapp_secret");

      window.location.replace("/");
    } catch (e: unknown) {
      console.error("Phantom callback error:", e);
      window.location.replace("/");
    }
  }, []);

  return <div style={{ padding: 40, color: "white" }}>Connecting...</div>;
}
