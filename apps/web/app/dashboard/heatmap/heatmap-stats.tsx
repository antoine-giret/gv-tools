import { PuzzlePieceIcon, SparklesIcon } from '@heroicons/react/24/outline';

import { Card, Skeleton } from '../../components';
import { formatNumber } from '../../utils/stats';
import { statsMap } from '../stats/types';

export function HeatmapStats({
  distance,
  exploredZones,
  newZones,
  showNewZones,
}: {
  distance: number | undefined;
  exploredZones: number | undefined;
  newZones: number | undefined;
  showNewZones: boolean;
}) {
  const cards = [
    {
      Icon: statsMap.distance.Icon,
      label: 'kms parcourus',
      value: distance === undefined ? undefined : statsMap.distance.format(distance),
    },
    {
      Icon: PuzzlePieceIcon,
      label: exploredZones === 0 ? 'zone explorée' : 'zones explorées',
      value: exploredZones === undefined ? undefined : formatNumber(exploredZones),
    },
    ...(showNewZones
      ? [
          {
            Icon: SparklesIcon,
            label: newZones === 0 ? 'nouvelle zone' : 'nouvelles zones',
            value: newZones === undefined ? undefined : formatNumber(newZones),
          },
        ]
      : []),
  ];

  return (
    <div
      className={`grid grid-cols-2 ${showNewZones ? '@2xl:grid-cols-4' : '@2xl:grid-cols-3'} gap-6`}
    >
      {cards.map(({ Icon, label, value }) => (
        <Card key={label}>
          <div className="flex flex-col items-center gap-3 p-3">
            <Icon className="size-8 text-emerald-500 dark:text-emerald-300" />
            <div className="w-full flex flex-col items-center gap-2">
              {value !== undefined ? (
                <span className="text-xl font-bold text-center">{value}</span>
              ) : (
                <Skeleton align="center" size="xl" variant="text" width="w-[50%]" />
              )}
              <span className="max-w-full text-sm text-center text-black/70 dark:text-white/70">
                {label}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
