import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import ClientLayout from "@/app/client-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#3b82f6',
};

export const metadata: Metadata = {
  title: "Super Soldier Program",
  description: "Training and nutrition app for building the ultimate physique",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Super',
  },
  openGraph: {
    title: "Super Soldier Program",
    description: 'Super Soldier Program',
    url: 'https://super-soldier-app.vercel.app',
    siteName: 'Super Solider Program',
    images: [{ url: 'https://super-soldier-app.vercel.app/opengraph-evans.png' }]
  },
  icons: {
    icon: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/apple-icon.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overscroll-contain">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overscroll-contain`}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
