import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { TPeriod } from '@repo/models';
import { useState } from 'react';

import { Button, Skeleton } from '../../../components';
import { useExport } from '../hooks/export';
import { TValues } from '../types';

import { Calendar } from './calendar';
import { CalendarExport } from './export';
import { Legend } from './legend';

function DaysCalendarDescription({
  values: { maxActiveDaysInARow, currentActiveDaysInARow },
}: {
  values: TValues;
}) {
  if (!maxActiveDaysInARow) return null;

  const isBest = currentActiveDaysInARow === maxActiveDaysInARow;
  const daysForBest = maxActiveDaysInARow - currentActiveDaysInARow + 1;

  return (
    <>
      <p className="text-sm text-black dark:text-white">
        {currentActiveDaysInARow > 0 ? (
          <>
            <span className={isBest ? 'text-emerald-500 dark:text-emerald-300' : ''}>
              {currentActiveDaysInARow} {currentActiveDaysInARow > 1 ? 'jours' : 'jour'}
            </span>{' '}
            {currentActiveDaysInARow > 1 ? 'consécutifs' : 'consécutif'} en cours
            {isBest ? " (meilleure série de l'année 🔥)" : ''}
          </>
        ) : (
          <>
            Meilleure série de{' '}
            <span className="text-emerald-500 dark:text-emerald-300">
              {maxActiveDaysInARow} {maxActiveDaysInARow > 1 ? 'jours' : 'jour'}
            </span>{' '}
            {maxActiveDaysInARow > 1 ? 'consécutifs' : 'consécutif'} cette année 🔥
          </>
        )}
      </p>
      {!isBest && (
        <p className="text-sm text-black dark:text-white">
          Plus que {daysForBest} {daysForBest > 1 ? 'jours' : 'jour'} pour dépasser le record de{' '}
          <span className="text-emerald-500 dark:text-emerald-300">
            {maxActiveDaysInARow} {maxActiveDaysInARow > 1 ? 'jours' : 'jour'}
          </span>{' '}
          réalisé cette année 🔥
        </p>
      )}
    </>
  );
}

export function DaysCalendar({ period, values }: { period: TPeriod; values: TValues | undefined }) {
  const [downloading, setDownloading] = useState(false);
  const {
    title: exportTitle,
    subtitle: exportSubtitle,
    setExportRef,
  } = useExport({ ready: true, title: 'calendrier', period, setDownloading });

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex gap-6 items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-md font-bold text-black dark:text-white">
              Calendrier des jours roulés
            </h2>
            {values === undefined ? (
              <Skeleton size="sm" variant="text" width="w-[200px]" />
            ) : (
              <DaysCalendarDescription values={values} />
            )}
          </div>
          <Button
            disabled={!values || downloading}
            Icon={ArrowDownTrayIcon}
            label="Télécharger"
            onClick={() => setDownloading(true)}
            variant="outlined"
          />
        </div>
        <Calendar period={period} values={values} />
        <Legend />
      </div>
      {values && downloading && (
        <CalendarExport
          period={period}
          ref={setExportRef}
          subtitle={exportSubtitle}
          title={exportTitle}
          values={values}
        />
      )}
    </>
  );
}
