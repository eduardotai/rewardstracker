import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";
import "./globals.css";
import 'react-tooltip/dist/react-tooltip.css';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rewards Tracker BR",
  description: "Gerenciador de Pontos Microsoft Rewards para usuários brasileiros",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#107C10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#ffffff',
              border: '1px solid #333333',
            },
            success: {
              iconTheme: {
                primary: '#107C10',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}

