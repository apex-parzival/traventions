import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Traventions | Premium Travel Experiences",
  description: "Next-generation travel planning and booking platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavbarWrapper />
        <main className="min-h-screen pt-20">
          {children}
        </main>
        <footer className="py-12 bg-[#0f172a] border-t border-white/10 text-center text-[#94a3b8] text-sm">
          <div className="max-w-[1200px] mx-auto px-8">
            <p>&copy; 2026 Traventions. All rights reserved. Premium Travel Experiences.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
