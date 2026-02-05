import { HomeIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useMemo } from 'react';

import { Card, Tooltip } from '../../../components';

const enableDays = [1, 2, 3, 4, 5];

export function Day({
  inAnotherMonth,
  day: { date },
}: {
  day: { index: number; date: Date };
  inAnotherMonth?: boolean;
}) {
  const day = useMemo(() => date.getDate(), [date]);
  const weekDay = useMemo(() => date.getDay(), [date]);
  const enabled = useMemo(() => enableDays.includes(weekDay), [weekDay]);

  return (
    <Card>
      <div
        className={`flex flex-col px-3 pt-1 pb-3 gap-3 ${inAnotherMonth ? 'bg-black/5 dark:bg-white/5 opacity-50' : ''}`}
      >
        <span className="text-sm">{day}</span>
        {enabled ? (
          inAnotherMonth ? (
            <div className="h-[52px]" />
          ) : (
            <div className="w-full flex flex-col items-stretch gap-1">
              <AddButton label="Ajouter l'aller manuellement" />
              <AddButton label="Ajouter le retour manuellement" />
            </div>
          )
        ) : (
          <div className="h-[52px] flex items-center justify-center">
            <HomeIcon className="size-6" />
          </div>
        )}
      </div>
    </Card>
  );
}

function AddButton({ label }: { label: string }) {
  return (
    <Tooltip label={label} position="bottom">
      <button className="w-full flex justify-center p-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 hover:dark:bg-white/10 focus:bg-black/20 focus:dark:bg-white/20 rounded-sm cursor-pointer">
        <PlusIcon className="size-4" />
      </button>
    </Tooltip>
  );
}
