import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const instrumentSerif = Instrument_Serif({ 
  weight: "400", 
  subsets: ["latin"], 
  style: ["normal", "italic"],
  variable: "--font-instrument" 
});

export const metadata: Metadata = {
  title: "ASSASSIN - AI Assignment Generator",
  description: "Create assignments in seconds. Not hours.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable} scroll-smooth`}>
      <body className="font-sans text-[#0C0C0B] bg-[#FAFAF9]">{children}</body>
    </html>
  );
}
