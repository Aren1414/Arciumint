import "./globals.css";
import "@phantom/react-sdk/dist/styles.css";

import { PhantomProvider, darkTheme, AddressType } from "@phantom/react-sdk";
import WalletComponent from "@/components/WalletComponent";

export const metadata = {
  title: "Arciumint",
  description: "Privacy-preserving personality evaluation powered by Arcium MPC.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PhantomProvider
          config={{
            providers: ["google", "apple", "injected"],
            appId: "e26969a5-9c5d-4e09-bf78-aa4a525a5d7f",
            addressTypes: ["Ethereum", "Solana", "BitcoinSegwit", "Sui"],
            authOptions: {
              redirectUrl: "https://www.arciumint.xyz/phantom-callback",
            },
          }}
          theme={darkTheme}
          appIcon="https://phantom-portal20240925173430423400000001.s3.ca-central-1.amazonaws.com/icons/eefe3956-73d8-4000-ad3d-c0829043f32e.png"
          appName="Arciumint"
        >
          {children}
          <WalletComponent />
        </PhantomProvider>
      </body>
    </html>
  );
}
