import { JSX, SVGProps } from 'react';

import { ActiveDaysIcon, DistanceIcon, DurationIcon, JourneysIcon } from '../../components/icons';
import { formatNumber } from '../../utils/stats';

export const stats = ['distance', 'activeDays', 'journeys', 'duration'] as const;

export type TStat = (typeof stats)[number];

export const statsMap: {
  [key in TStat]: {
    format: (value: number) => string;
    Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
    label: string;
    unit: string;
  }
} = {
  activeDays: {
    Icon: ActiveDaysIcon,
    label: 'actifs',
    unit: 'jours',
    format: formatNumber,
  },
  distance: {
    Icon: DistanceIcon,
    label: 'parcourus',
    unit: 'kms',
    format: (value) => `${formatNumber(Math.round(value / 1000))}`,
  },
  duration: {
    Icon: DurationIcon,
    label: 'roulées',
    unit: 'heures',
    format: (value) => `${formatNumber(Math.round(value / 3600))}`,
  },
  journeys: {
    Icon: JourneysIcon,
    label: 'effectués',
    unit: 'trajets',
    format: formatNumber,
  },
};

export const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

export type TMonth = (typeof months)[number];

export const monthsMap: { [key in TMonth]: { label: string } } = {
  0: { label: 'janvier' },
  1: { label: 'février' },
  2: { label: 'mars' },
  3: { label: 'avril' },
  4: { label: 'mai' },
  5: { label: 'juin' },
  6: { label: 'juillet' },
  7: { label: 'août' },
  8: { label: 'septembre' },
  9: { label: 'octobre' },
  10: { label: 'novembre' },
  11: { label: 'décembre' },
}

export const weekDays = [
  { key: 1, shortLabel: 'L', label: 'lun.' },
  { key: 2, shortLabel: 'M', label: 'mar.' },
  { key: 3, shortLabel: 'M', label: 'mer.' },
  { key: 4, shortLabel: 'J', label: 'jeu.' },
  { key: 5, shortLabel: 'V', label: 'ven.' },
  { key: 6, shortLabel: 'S', label: 'sam.' },
  { key: 0, shortLabel: 'D', label: 'dim.' },
];

export type TValues =
  { [key in TStat | 'maxActiveDaysInARow' | 'maxActiveDaysInARowStartIndex']: number } &
  { distancesByMonth: number[]; distancesByDays: number[]; distancesByWeekDays: number[] };
