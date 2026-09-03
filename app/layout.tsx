import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import "./globals.css";
import { navigationLinks } from '../config/navigation'

<Navbar links={navigationLinks} />

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  const navigationLinks: unknown[] = [];

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar links={navigationLinks} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
