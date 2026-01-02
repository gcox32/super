import type { Metadata, Viewport } from "next";
import { Sora, Outfit, JetBrains_Mono } from "next/font/google";
import "@/app/globals.css";
import ClientLayout from "@/app/client-layout";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
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
  title: "Aegis",
  description: "Train the will.",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Aegis',
  },
  openGraph: {
    title: "Aegis",
    description: 'Aegis',
    url: 'https://super-soldier-app.vercel.app',
    siteName: 'Aegis',
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
    <html lang="en">
      <body
        className={`${sora.variable} ${outfit.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
