import type { Metadata, Viewport } from 'next';
import { Nunito_Sans, Titan_One } from 'next/font/google';
import { Suspense } from 'react';

import './globals.css';

import { Wrapper } from './layout/wrapper';
import Loading from './loading';
import { ServiceWorkerRegister } from './service-worker-register';

const nunitoSans = Nunito_Sans({
  variable: '--font-nunito-sans',
  subsets: ['latin'],
});

const titanOne = Titan_One({
  variable: '--font-titan-one',
  weight: '400',
});

export const metadata: Metadata = {
  applicationName: 'Mon activité vélo',
  title: 'Mon activité vélo',
  description:
    'Plateforme permettant de visualiser votre activité vélo à partir des données Geovelo',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mon activité vélo',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="fr">
      <body className={`${nunitoSans.variable} ${titanOne.variable} antialiased`}>
        <ServiceWorkerRegister />
        <Suspense fallback={<Loading />}>
          <Wrapper>{children}</Wrapper>
        </Suspense>
      </body>
    </html>
  );
}
