import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthModal } from "@/components/AuthModal";

export const metadata: Metadata = {
  title: "Basistha Vedic Astronomical & Astrological Platform",
  description: "Modern Vedic Astrology, Interactive SVG Kundali Engine, Panchanga, Multi-Dasha, Shadbala, and Tajika Varshaphala powered by Basistha Astronomical Engine.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ne">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <LanguageProvider>
          <AuthProvider>
            {children}
            <AuthModal />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
