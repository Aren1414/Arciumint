import "./globals.css";
import PhantomWrapper from "@/components/PhantomWrapper";
import WalletComponent from "@/components/WalletComponent";

export const metadata = {
  title: "Arciumint",
  description: "Privacy-preserving personality evaluation powered by Arcium MPC.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PhantomWrapper>
          {children}
          <WalletComponent />
        </PhantomWrapper>
      </body>
    </html>
  );
}
