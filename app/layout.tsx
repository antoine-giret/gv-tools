import type { Metadata } from "next";
import { Nunito_Sans, Titan_One } from "next/font/google";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

const titanOne = Titan_One({
  variable: "--font-titan-one",
  weight: '400',
});

export const metadata: Metadata = {
  title: "Geovelo tools",
  description: "Tools for Geovelo app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${nunitoSans.variable} ${titanOne.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
