import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/lib/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sangini — Early Awareness & Support Platform",
  description: "Breast cancer risk awareness, self-assessment, doctor support, and community — empowering early detection through explainable AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="bg-white border-t border-pink-100 py-6 mt-12">
            <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
              <p className="font-semibold text-pink-600 mb-1">Medical Disclaimer</p>
              <p>This platform is for awareness and educational purposes only. It does NOT diagnose cancer or any medical condition. Always consult a qualified healthcare professional for medical advice, diagnosis, or treatment.</p>
              <p className="mt-3 text-xs text-gray-400">&copy; 2026 Sangini — Hackathon MVP. Built with care.</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
