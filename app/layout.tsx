import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Abricot",
  description: "Abricot frontend",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-white text-gray-900">
        <Navbar />
        <main className="min-h-[calc(100vh-8rem)]">{children}</main>
        <Footer />
        <div id="modal-root" />
      </body>
    </html>
  );
}
