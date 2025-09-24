import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Footer, MainNav, Toaster } from "@woothomes/components";
import { QueryProvider } from "@woothomes/providers/QueryProvider";
import { ServiceWorkerRegistration } from "@woothomes/components/ServiceWorkerRegistration";
import { UpdateToast } from '../components/UpdateToast';
import { LaunchModalWrapper } from '@woothomes/components/LaunchModalWrapper';

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const montserratMono = Montserrat({
  variable: "--font-montserrat-mono",
  weight: ["400", "700"],
  style: "normal",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WootHomes",
  description: "Shortlet rental service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0c2d84" />
        <meta name="description" content="Modern luxury accommodation platform" />
        <meta name="application-name" content="Woothomes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Woothomes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" href="/favicon.ico" />
        <title>Woothomes</title>
      </head>
      <body
        className={`h-[100vh] ${montserrat.variable} ${montserratMono.variable} antialiased`}
      >
        <QueryProvider>
          <ServiceWorkerRegistration />
          <MainNav />
          {children}
          <Toaster />
          <Footer />
          <UpdateToast />
          <LaunchModalWrapper />
        </QueryProvider>
      </body>
    </html>
  );
}
