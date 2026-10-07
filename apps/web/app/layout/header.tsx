import Image from 'next/image';

import { Nav } from './nav';

export function Header() {
  return (
    <>
      <div className="h-16 shrink-0" />
      <div className="fixed top-0 left-0 w-full h-16 px-6 flex items-center justify-between bg-(--background) z-100">
        <div className="shrink-0 flex items-center gap-3">
          <Image priority alt="" className="dark:hidden" height={40} src="/logo.png" width={40} />
          <Image
            priority
            alt=""
            className="hidden dark:block"
            height={40}
            src="/logo-dark.png"
            width={40}
          />
          <span className="text-lg font-bold">Mon activité vélo</span>
        </div>
        <Nav />
      </div>
    </>
  );
}
