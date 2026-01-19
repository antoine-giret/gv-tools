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
    format: (value) => `${value > 100_000 ? formatNumber(Math.round(value / 1000)): formatNumber(Math.round(value / 100) / 10)}`,
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

export const weekDays = [1, 2, 3, 4, 5, 6, 0] as const;

type TWeekDay = (typeof weekDays) [number];

const firstWeekDate = new Date();
const weekDay = firstWeekDate.getDay();
firstWeekDate.setDate(firstWeekDate.getDate() - weekDay + (weekDay == 0 ? -7 : 0));
const weekDaysLabels = weekDays.map(() => {
  firstWeekDate.setDate(firstWeekDate.getDate() + 1);
  return new Intl.DateTimeFormat('fr', { weekday: 'short' }).format(firstWeekDate);
});

export const weekDaysMap: { [key in TWeekDay]: { label: string } } = {
  0: { label: weekDaysLabels[6] },
  1: { label: weekDaysLabels[0] },
  2: { label: weekDaysLabels[1] },
  3: { label: weekDaysLabels[2] },
  4: { label: weekDaysLabels[3] },
  5: { label: weekDaysLabels[4] },
  6: { label: weekDaysLabels[5] },
}

export const _weekDays = [
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
