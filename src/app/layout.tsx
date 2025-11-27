import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import BottomNav from "@/components/layout/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Super Soldier Program",
  description: "Training and nutrition app for building the ultimate physique",
  openGraph: {
    title: "Super Soldier Program",
    description: 'Super Soldier Program',
    url: 'https://super-soldier-app.vercel.app',
    siteName: 'Super Solider Program',
    images: [{ url: 'https://super-soldier-app.vercel.app/opengraph-evans.png' }]
  },
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
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
