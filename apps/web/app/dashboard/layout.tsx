'use client';

import { ChartBarIcon, CurrencyEuroIcon, MapIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { Icon: ChartBarIcon, key: 'stats', label: 'Stats', path: '/dashboard/stats' },
  { Icon: MapIcon, key: 'heatmap', label: 'Heatmap', path: '/dashboard/heatmap' },
  { Icon: CurrencyEuroIcon, key: 'fmd', label: 'FMD', path: '/dashboard/fmd' },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <div className="flex flex-grow flex-col md:flex-row">
      <div className="hidden md:block w-64 shrink-0 border-r-1 border-black/20 dark:border-white/20" />
      <div className="block md:hidden h-[50px] shrink-0" />
      <nav
        aria-label="Navigation du tableau de bord"
        className="fixed top-16 left-0 z-100 flex w-full overflow-x-auto border-b-1 border-black/20 bg-(--background) dark:border-white/20 md:w-64 md:flex-col md:overflow-visible md:border-b-0 md:bg-transparent md:py-3 md:pr-[1px]"
      >
        {navItems.map(({ key, Icon, label, path }) => {
          const active = pathname === path;

          return (
            <Link
              aria-current={active ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-3 border-b-2 px-6 py-3 md:w-full md:border-b-0 ${
                active
                  ? 'border-emerald-500 text-emerald-500 dark:border-emerald-300 dark:text-emerald-300'
                  : 'border-transparent hover:bg-black/10 hover:dark:bg-white/10'
              }`}
              href={path}
              key={key}
            >
              <Icon aria-hidden="true" className="size-4" />
              <span className="text-md">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="grow flex flex-col p-6 min-w-0">{children}</div>
    </div>
  );
}
