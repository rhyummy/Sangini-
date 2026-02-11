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
          <footer className="bg-gradient-to-r from-pink-50/80 to-rose-50/80 backdrop-blur-sm border-t border-pink-200/50 py-6 mt-12">
            <div className="max-w-6xl mx-auto px-4 text-center text-sm text-pink-600">
              <p>&copy; 2026 Sangini — Built with care 💗</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
