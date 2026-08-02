import { BoltSlashIcon } from '@heroicons/react/24/outline';
import { TPeriod } from '@repo/models';
import { useMemo } from 'react';

export function EmptyState({ period }: { period: TPeriod }) {
  const isCurrent = useMemo(() => {
    const now = new Date();

    return period.startDate.getTime() <= now.getTime() && period.endDate.getTime() >= now.getTime();
  }, [period]);

  return (
    <div className="flex flex-col gap-3 items-center py-12">
      <BoltSlashIcon className="size-12 text-black/70 dark:text-white/70" />
      <div className="flex flex-col items-center">
        <span className="text-center font-bold text-md text-black dark:text-white">
          Aucun trajet n'a été enregistré sur cette période
        </span>
        <span className="text-center text-sm text-black/70 dark:text-white/70">
          {isCurrent
            ? "Il n'est pas encore trop tard, il faut juste sortir le vélo du garage..."
            : 'Il serait bien de ne pas reproduire cette hérésie...'}
        </span>
      </div>
    </div>
  );
}
