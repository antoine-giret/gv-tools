import { ComponentType, ReactNode, SVGProps } from 'react';

import { Card } from './card';
import { Skeleton } from './skeleton';

export function StatCard({
  children,
  Icon,
  label,
  truncateLabel = false,
  value,
}: {
  children?: ReactNode;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: ReactNode;
  truncateLabel?: boolean;
  value: string | undefined;
}) {
  return (
    <Card>
      <div className="flex flex-col items-center gap-3 p-3">
        <Icon className="size-8 text-emerald-500 dark:text-emerald-300" />
        <div className="w-full flex flex-col items-stretch gap-2 overflow-hidden">
          <div className="flex flex-col items-center">
            {value !== undefined ? (
              <span className="text-xl font-bold text-center">{value}</span>
            ) : (
              <Skeleton align="center" size="xl" variant="text" width="w-[50%]" />
            )}
            <span
              className={`max-w-full text-sm text-center ${truncateLabel ? 'truncate' : ''} text-black/70 dark:text-white/70`}
            >
              {label}
            </span>
          </div>
          {children}
        </div>
      </div>
    </Card>
  );
}
