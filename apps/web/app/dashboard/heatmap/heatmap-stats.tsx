import { PuzzlePieceIcon, SparklesIcon } from '@heroicons/react/24/outline';

import { StatCard } from '../../components';
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
        <StatCard Icon={Icon} key={label} label={label} value={value} />
      ))}
    </div>
  );
}
