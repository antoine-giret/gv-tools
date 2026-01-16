import { Providers } from '../providers';

import { Footer } from './footer';
import { Header } from './header';

export async function Wrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-col grow p-6">
          {children}
        </div>
        <Footer />
      </div>
    </Providers>
  );
}
