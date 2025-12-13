import "./globals.css";
import ClientWalletProvider from "@/components/ClientWalletProvider";

export const metadata = {
  title: "Arciumint",
  description: "Privacy-preserving personality evaluation powered by Arcium MPC.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientWalletProvider>{children}</ClientWalletProvider>
      </body>
    </html>
  );
}
