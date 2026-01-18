'use client';

import { ChartBarIcon, MapIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { Icon: ChartBarIcon, key: 'stats', label: 'Stats', path: '/dashboard/stats' },
  { Icon: MapIcon, key: 'heatmap', label: 'Heatmap', path: '/dashboard/heatmap' },
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
      <div className="hidden md:block fixed top-16 left-0 w-64 py-3 pr-[1px]">
        {navItems.map(({ key, Icon, label, path }) => {
          const active = pathname === path;

          if (active) {
            return (
              <div
                className="flex w-full px-6 py-3 items-center gap-3 text-emerald-500 dark:text-emerald-300"
                key={key}
              >
                <Icon className="size-4" />
                <span className="text-md">{label}</span>
              </div>
            );
          }

          return (
            <Link
              className="flex w-full px-6 py-3 items-center gap-3 hover:bg-black/10 hover:dark:bg-white/10"
              href={path}
              key={key}
            >
              <Icon className="size-4" />
              <span className="text-md">{label}</span>
            </Link>
          );
        })}
      </div>
      <div className="block md:hidden h-[50px] shrink-0" />
      <div className="flex md:hidden fixed top-16 left-0 w-full bg-(--background) border-b-1 border-black/20 dark:border-white/20 overflow-x-scroll">
        {navItems.map(({ key, Icon, label, path }) => {
          const active = pathname === path;

          if (active) {
            return (
              <div
                className="shrink-0 flex px-6 py-3 items-center gap-3 text-emerald-500 dark:text-emerald-300 border-b-2 border-emerald-500 dark:border-emerald-300"
                key={key}
              >
                <Icon className="size-4" />
                <span className="text-md">{label}</span>
              </div>
            );
          }

          return (
            <Link
              className="shrink-0 flex px-6 py-3 items-center gap-3 hover:bg-black/10 hover:dark:bg-white/10 border-b-2 border-transparent"
              href={path}
              key={key}
            >
              <Icon className="size-4" />
              <span className="text-md">{label}</span>
            </Link>
          );
        })}
        <div className="shrink-0 w-[1000px]" />
      </div>
      <div className="grow flex flex-col p-6 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}