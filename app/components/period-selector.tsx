'use client';

import { ChevronDoubleRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useMemo, useState } from 'react';

import { getInitialPeriod, periodTypes, TPeriod, TPeriodType } from '../utils/period';

import { IconButton } from './icon-button';
import { Select } from './select';

const periodTypesLabels: { [ key in TPeriodType]: string } = {
  month: 'Par mois',
  week: 'Par semaine',
  year: 'Par an'
};

const now = new Date();

export function PeriodSelector(
  {
    period,
    setPeriod,
  } : {
    period: TPeriod,
    setPeriod: (period: TPeriod) => void;
  }) {
  const [periodType, setPeriodType] = useState<TPeriodType>('month');
  const [periodTypesOptions] = useState<Array<{ label: string; value: TPeriodType }>>(
    periodTypes.map((value) => ({ value, label: periodTypesLabels[value] })),
  );
  const isCurrentPeriod = useMemo(() => {
    return now.getTime() >= period.startDate.getTime() && now.getTime() <= period.endDate.getTime();
  }, [period]);
  const startAndEndDateDuringSameYear = useMemo(() => {
    return period.startDate.getFullYear() === period.endDate.getFullYear();
  }, [period]);
  const startAndEndDateDuringSameMonth = useMemo(() => {
    return startAndEndDateDuringSameYear && period.startDate.getMonth() === period.endDate.getMonth();
  }, [startAndEndDateDuringSameYear, period]);
  const prevPeriod = useMemo(() => {
    const { startDate: _startDate, endDate: _endDate } = period;
    const startDate = new Date(_startDate);
    const endDate = new Date(_endDate);

    switch (periodType) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        endDate.setDate(endDate.getDate() - 7);

        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        endDate.setMonth(endDate.getMonth() - 1);

        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        endDate.setFullYear(endDate.getFullYear() - 1);

        break;
      default:
        break;
    }

    if (startDate.getTime() < new Date(2020, 0, 1, 0, 0, 0, 0).getTime()) return null;

    return { type: periodType, startDate, endDate };
  }, [periodType, period]);

  function displayPrevPeriod() {
    if (prevPeriod) setPeriod(prevPeriod);
  }

  function displayNextPeriod() {
    const { startDate: _startDate, endDate: _endDate } = period;
    const startDate = new Date(_startDate);
    const endDate = new Date(_endDate);

    switch (periodType) {
      case 'week':
        startDate.setDate(startDate.getDate() + 7);
        endDate.setDate(endDate.getDate() + 7);

        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() + 1);
        endDate.setMonth(endDate.getMonth() + 1);

        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() + 1);
        endDate.setFullYear(endDate.getFullYear() + 1);

        break;
      default:
        break;
    }

    setPeriod({ type: periodType, startDate, endDate });
  }

  const { startDate, endDate } = period;

  return (
    <div className="flex items-center gap-6">
      <div className="w-32">
        <Select
          id="year"
          onChange={(type) => {
            setPeriodType(type);
            setPeriod(getInitialPeriod(type));
          }}
          options={periodTypesOptions}
          value={periodType}
        />
      </div>
      <div className="flex items-center gap-3">
        {periodType === 'week' ? (
          <>
            <div className="flex items-center gap-1">
              <IconButton
                disabled={!prevPeriod}
                Icon={ChevronLeftIcon}
                label="Semaine précédente"
                onClick={displayPrevPeriod}
              />
              <IconButton
                disabled={isCurrentPeriod}
                Icon={ChevronRightIcon}
                label="Semaine suivante"
                onClick={displayNextPeriod}
              />
              <IconButton
                disabled={isCurrentPeriod}
                Icon={ChevronDoubleRightIcon}
                label="Revenir à la semaine courante"
                onClick={() => setPeriod(getInitialPeriod(periodType))}
              />
            </div>
            <span className="text-md">
              Du {
                new Intl.DateTimeFormat('fr', {
                  day: '2-digit',
                  month: startAndEndDateDuringSameMonth ? undefined : 'short',
                  year: startAndEndDateDuringSameYear ? undefined : 'numeric',
                })
                  .format(startDate)
              }{' '}
              au {new Intl.DateTimeFormat('fr', { day: '2-digit', month: 'short', year: 'numeric' }).format(endDate)}
            </span>
          </>
        ) : periodType === 'month' ? (
          <>
            <div className="flex items-center gap-1">
              <IconButton
                disabled={!prevPeriod}
                Icon={ChevronLeftIcon}
                label="Mois précédent"
                onClick={displayPrevPeriod}
              />
              <IconButton
                disabled={isCurrentPeriod}
                Icon={ChevronRightIcon}
                label="Mois suivant"
                onClick={displayNextPeriod}
              />
              <IconButton
                disabled={isCurrentPeriod}
                Icon={ChevronDoubleRightIcon}
                label="Revenir au mois courant"
                onClick={() => setPeriod(getInitialPeriod(periodType))}
              />
            </div>
            <span className="text-md text-center capitalize">
              {new Intl.DateTimeFormat('fr', { month: 'short', year: 'numeric' }).format(startDate)}
            </span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1">
              <IconButton
                disabled={!prevPeriod}
                Icon={ChevronLeftIcon}
                label="Année précédente"
                onClick={displayPrevPeriod}
              />
              <IconButton
                disabled={isCurrentPeriod}
                Icon={ChevronRightIcon}
                label="Année suivante"
                onClick={displayNextPeriod}
              />
              <IconButton
                disabled={isCurrentPeriod}
                Icon={ChevronDoubleRightIcon}
                label="Revenir à l'année courante"
                onClick={() => setPeriod(getInitialPeriod(periodType))}
              />
            </div>
            <span className="text-md">
              {new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(startDate)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
