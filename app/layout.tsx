import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { IntlProviderWrapper } from "@/components/providers/intl-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Colombia Employer Cost Calculator",
  description:
    "Calculate total Colombian employer costs with real-time statutory breakdowns in English and Spanish.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-neutral-100 antialiased`}
      >
        <IntlProviderWrapper>{children}</IntlProviderWrapper>
      </body>
    </html>
  );
}
