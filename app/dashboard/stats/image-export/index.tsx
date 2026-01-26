'use client';

import html2canvas from 'html2canvas-pro';
import { Ref, useImperativeHandle, useMemo, useRef } from 'react';
import { saveAs } from 'file-saver';

import { TValues } from '../types';
import { TPeriod } from '../../../utils/period';

import { CalendarPage } from './calendar';
import { DistancePage } from './distance';
import { GlobalStatsPage } from './global-stats';

export type TStatsExportRef = { download: () => Promise<void> };

export function StatsExport(
  { ref, period, values }: { period: TPeriod; ref: Ref<TStatsExportRef>; values: TValues | undefined }
) {
  const startAndEndDateDuringSameYear = useMemo(() => {
    return period.startDate.getFullYear() === period.endDate.getFullYear();
  }, [period]);
  const startAndEndDateDuringSameMonth = useMemo(() => {
    return startAndEndDateDuringSameYear && period.startDate.getMonth() === period.endDate.getMonth();
  }, [startAndEndDateDuringSameYear, period]);
  const subtitle = useMemo(() => {
    const { type, startDate, endDate } = period;

    return type === 'week' ?
        `Du ${new Intl.DateTimeFormat('fr', { day: '2-digit', month: startAndEndDateDuringSameMonth ? undefined : 'short', year: startAndEndDateDuringSameYear ? undefined : 'numeric' }).format(startDate)} au ${new Intl.DateTimeFormat('fr', { day: '2-digit', month: 'short', year: 'numeric' }).format(endDate)}` :
        type === 'month' ?
          new Intl.DateTimeFormat('fr', { month: 'long', year: 'numeric' }).format(startDate) :
          new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(startDate);
  }, [period, startAndEndDateDuringSameYear, startAndEndDateDuringSameMonth]);
  const globalStatsPageRef = useRef<HTMLDivElement>(null);
  const distancePageRef = useRef<HTMLDivElement>(null);
  const calendarPageRef = useRef<HTMLDivElement>(null);

  async function download() {
    const pagesRefs = [globalStatsPageRef, distancePageRef];
    if (period.type === 'year') pagesRefs.push(calendarPageRef);

    const blobs = await Promise.all(pagesRefs.map(async (ref) => {
      if (!ref.current) return null;

      const canvas = await html2canvas(ref.current, { scale: 1, width: 1012 });

      return new Promise<Blob>((resolve, reject) => {
        try {
          canvas.toBlob(
            (blob) => {
              if (!blob) throw new Error('no blob');
              else resolve(blob);
            },
            'image/png',
            1.0,
          );
        } catch (err) {
          reject(err);
        }
      });
    }));

    const { type, startDate, endDate } = period;
    const title = [
      'mon_activite_velo',
      type === 'week' ?
        [
          new Intl.DateTimeFormat('fr', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(startDate),
          new Intl.DateTimeFormat('fr', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(endDate),
        ].join('_') :
        type === 'month' ?
          new Intl.DateTimeFormat('fr', { month: '2-digit', year: 'numeric' }).format(startDate).replace('/', '-') :
          new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(startDate),
    ].join('_');

    blobs.forEach((blob, index) => blob && saveAs(blob, `${title}_${index + 1}.png`));
  }

  useImperativeHandle(ref, () => {
    return {
      download,
    };
  });

  if (!values) return <></>;

  const title = "Mon activité vélo";

  return (
    <>
      <GlobalStatsPage
        ref={globalStatsPageRef}
        subtitle={subtitle}
        title={title}
        values={values}
      />
      <DistancePage
        period={period}
        ref={distancePageRef}
        subtitle={subtitle}
        title={title}
        values={values}
      />
      {period.type === 'year' && (
        <CalendarPage
          period={period}
          ref={calendarPageRef}
          subtitle={subtitle}
          title={title}
          values={values}
        />
      )}
    </>
  );
}
