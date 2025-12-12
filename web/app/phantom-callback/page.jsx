"use client";

import { useEffect } from "react";
import nacl from "tweetnacl";
import bs58 from "bs58";

export default function PhantomCallback() {
  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);

        const phantom_pub = params.get("phantom_encryption_public_key");
        const nonce58 = params.get("nonce");
        const data58 = params.get("data");

        const secret58 = sessionStorage.getItem("phantom_dapp_secret");
        if (!secret58 || !phantom_pub || !nonce58 || !data58) {
          // nothing to do
          window.location.replace("/");
          return;
        }

        const dapp_secret = bs58.decode(secret58).slice(0, 32);
        const phantom_pub_key = bs58.decode(phantom_pub);
        const nonce = bs58.decode(nonce58);
        const encryptedData = bs58.decode(data58);

        const shared = nacl.box.before(phantom_pub_key, dapp_secret);
        const decrypted = nacl.box.open.after(encryptedData, nonce, shared);

        if (!decrypted) {
          window.location.replace("/");
          return;
        }

        const json = JSON.parse(new TextDecoder().decode(decrypted));

        const sessionObj = {
          public_key: json.public_key,
          session: json.session,
          created: Date.now(),
        };

        // If this callback tab was opened by the original page, send it there and close this tab
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({ type: "phantom_session", payload: sessionObj }, window.location.origin);
            // give a moment for the message to be delivered, then close
            setTimeout(() => {
              try {
                window.close();
              } catch (e) {
                // if close fails, redirect home
                window.location.replace("/");
              }
            }, 300);
            return;
          }
        } catch (e) {
          console.warn("postMessage to opener failed:", e);
        }

        // Otherwise store locally and redirect to home
        localStorage.setItem("phantom_mobile_session", JSON.stringify(sessionObj));
        sessionStorage.removeItem("phantom_dapp_secret");
        window.location.replace("/");
      } catch (e) {
        console.error("Phantom callback error:", e);
        try {
          window.location.replace("/");
        } catch {}
      }
    })();
  }, []);

  return <div style={{ padding: 40, color: "white" }}>Connecting...</div>;
}
