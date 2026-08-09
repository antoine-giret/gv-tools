import { TPeriod } from '@repo/models';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas-pro';
import { useEffect, useMemo, useState } from 'react';
import { match } from 'ts-pattern';

export function useExport({
  ready,
  period,
  title,
  setDownloading,
}: {
  period: TPeriod;
  ready: boolean;
  title?: string;
  setDownloading: (downloading: boolean) => void;
}) {
  const [exportRef, setExportRef] = useState<HTMLDivElement | null>(null);
  const startAndEndDateDuringSameYear = useMemo(() => {
    return period.startDate.getFullYear() === period.endDate.getFullYear();
  }, [period]);
  const startAndEndDateDuringSameMonth = useMemo(() => {
    return (
      startAndEndDateDuringSameYear && period.startDate.getMonth() === period.endDate.getMonth()
    );
  }, [startAndEndDateDuringSameYear, period]);
  const subtitle = useMemo(() => {
    const { type, startDate, endDate } = period;

    return match(type)
      .with(
        'week',
        () =>
          `Du ${new Intl.DateTimeFormat('fr', { day: '2-digit', month: startAndEndDateDuringSameMonth ? undefined : 'short', year: startAndEndDateDuringSameYear ? undefined : 'numeric' }).format(startDate)} au ${new Intl.DateTimeFormat('fr', { day: '2-digit', month: 'short', year: 'numeric' }).format(endDate)}`,
      )
      .with('month', () =>
        new Intl.DateTimeFormat('fr', { month: 'long', year: 'numeric' }).format(startDate),
      )
      .with('year', () => new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(startDate))
      .with('allTime', () => `Depuis ${period.startDate.getFullYear()}`)
      .exhaustive();
  }, [period, startAndEndDateDuringSameYear, startAndEndDateDuringSameMonth]);

  useEffect(() => {
    let active = true;

    async function download(ref: HTMLDivElement) {
      try {
        const canvas = await html2canvas(ref, { scale: 1, width: 1080 });

        const blob = await new Promise<Blob>((resolve, reject) => {
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

        if (!blob) throw new Error('no blob');

        const { type, startDate, endDate } = period;

        const _subtitle = match(type)
          .with('week', () =>
            [
              new Intl.DateTimeFormat('fr', { day: '2-digit', month: '2-digit', year: 'numeric' })
                .format(startDate)
                .replaceAll('/', '_'),
              new Intl.DateTimeFormat('fr', { day: '2-digit', month: '2-digit', year: 'numeric' })
                .format(endDate)
                .replaceAll('/', '_'),
            ].join('-'),
          )
          .with('month', () =>
            new Intl.DateTimeFormat('fr', { month: 'long', year: 'numeric' })
              .format(startDate)
              .toLowerCase()
              .replaceAll(' ', '_'),
          )
          .with('year', () => new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(startDate))
          .with('allTime', () => '')
          .exhaustive();

        saveAs(
          blob,
          `${['mon_activite_velo', _subtitle, title || ''].filter(Boolean).join('-')}.png`,
        );
      } catch (err) {
        console.error(err);
      }

      if (active) setDownloading(false);
    }

    if (exportRef && ready) download(exportRef);

    return () => {
      active = false;
    };
  }, [exportRef, ready]);

  return { title: 'Mon activité vélo', subtitle, setExportRef };
}
