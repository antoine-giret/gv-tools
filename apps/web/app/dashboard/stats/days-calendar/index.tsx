import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { TPeriod } from '@repo/models';
import { useState } from 'react';

import { Button, Skeleton } from '../../../components';
import { useExport } from '../hooks/export';
import { TValues } from '../types';

import { Calendar } from './calendar';
import { CalendarExport } from './export';
import { Legend } from './legend';

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
              values.maxActiveDaysInARow && (
                <p className="text-sm text-black dark:text-white">
                  <span className="text-emerald-500 dark:text-emerald-300">
                    {values.maxActiveDaysInARow} jours
                  </span>{' '}
                  à la suite
                </p>
              )
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
