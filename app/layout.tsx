import type { Metadata } from 'next';
import { Nunito_Sans, Titan_One } from 'next/font/google';
import { Suspense } from 'react';

import './globals.css';

import { Wrapper } from './layout/wrapper';
import Loading from './loading';

const nunitoSans = Nunito_Sans({
  variable: '--font-nunito-sans',
  subsets: ['latin'],
});

const titanOne = Titan_One({
  variable: '--font-titan-one',
  weight: '400',
});

export const metadata: Metadata = {
  title: 'Mon activité vélo',
  description:
    'Plateforme permettant de visualiser votre activité vélo à partir des données Geovelo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="fr">
      <body className={`${nunitoSans.variable} ${titanOne.variable} antialiased`}>
        <Suspense fallback={<Loading />}>
          <Wrapper>{children}</Wrapper>
        </Suspense>
      </body>
    </html>
  );
}
