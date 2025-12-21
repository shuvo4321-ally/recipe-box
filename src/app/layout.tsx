// src/app/layout.tsx
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google"; // <-- Correct font
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Recipe Box - Login",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} font-sans`} // <-- Correct font
        suppressHydrationWarning 
      >
        {children}
      </body>
    </html>
  );
}