'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas-pro';
import Image from 'next/image';

import { Button, Input } from './components';
import SummaryPage1 from './summary-pages/page-1';
import SummaryPage2 from './summary-pages/page-2';
import SummaryPage3 from './summary-pages/page-3';
import { months, TStat, TValues, weekDays } from './summary-pages/types';

const year = 2025;

export default function Home() {
  const [authorizationToken, setAuthorizationToken] = useState('');
  const [userId, setUserId] = useState('');
  const [values, setValues] = useState<TValues>();
  const [images, setImages] = useState<Array<{ blob: Blob; previewURL: string }>>();
  const [loading, setLoading] = useState(false);
  const summaryPage1Ref = useRef<HTMLDivElement>(null);
  const summaryPage2Ref = useRef<HTMLDivElement>(null);
  const summaryPage3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function generateBlobs() {
      const blobs = await Promise.all([summaryPage1Ref, summaryPage2Ref, summaryPage3Ref].map(async (ref) => {
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

      setImages(
        blobs.reduce<Array<{ blob: Blob; previewURL: string }>>((res, blob) => {
          if (blob) res.push({ blob, previewURL: URL.createObjectURL(blob) });
          return res;
        }, [])
      );
      setLoading(false);
    }

    if (values) generateBlobs();
  }, [values]);

  async function fetchStats(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);

    try {
      const res = await fetch(
        `https://backend.geovelo.fr/api/v2/users/${userId}/stats_traces?period=custom&date_start=01-01-${year}&date_end=31-12-${year}&unit=day`,
        {
          method: 'GET',
          headers: {
            'Api-Key': process.env.NEXT_PUBLIC_GV_API_KEY || '',
            source: process.env.NEXT_PUBLIC_GV_SOURCE || '',
            Authorization: `Token ${authorizationToken}`,
          },
        },
      );

      const {
        count: journeys,
        distance,
        duration,
        data,
      }: {
        count: number;
        data: Array<{ count: number; distance: number; duration: number; unit: number }>;
        distance: number;
        duration: number;
      } = await res.json();

      const daysMap = data.reduce<{ [key: string]: { [key in Exclude<TStat, 'activeDays'>]: number } }>((
        res,
        { unit, count: dataJourneys, distance: dataDistance, duration: dataDuration },
      ) => {
        res[unit] = {
          journeys: dataJourneys,
          distance: dataDistance,
          duration: dataDuration,
        }
        return res;
      }, {});

      let activeDays = 0;
      let activeDaysInARow = 0;
      let maxActiveDaysInARow = 0;
      let maxActiveDaysInARowStartIndex = 0;
      const distancesByMonth: { [key: number]: number } = {};
      const distancesByDays: { [key: number]: number } = {};
      const distancesByWeekDays: { [key: number]: number } = {};
      const startDay = new Date(year, 0, 0);
      const msInOneDay = 1000 * 60 * 60 * 24;
      const currentDay = new Date(year, 0, 1, 0, 0, 0, 0);
      const endDay = new Date(year, 11, 31, 23, 59, 59, 999);

      while (currentDay.getTime() < endDay.getTime()) {
        const key = currentDay.toISOString().replace(/T.*/, '');
        const dayDiff =
          (currentDay.getTime() - startDay.getTime()) +
          ((startDay.getTimezoneOffset() - currentDay.getTimezoneOffset()) * 60 * 1000);
        const day = Math.floor(dayDiff / msInOneDay) - 1;

        if (daysMap[key] && daysMap[key].journeys) {
          const month = currentDay.getMonth();
          const weekDay = currentDay.getDay();
          const { distance } = daysMap[key];

          ++activeDays;
          ++activeDaysInARow;

          if (!distancesByMonth[month]) distancesByMonth[month] = distance;
          else distancesByMonth[month] += distance;

          distancesByDays[day - 1] = distance;

          if (!distancesByWeekDays[weekDay]) distancesByWeekDays[weekDay] = distance;
          else distancesByWeekDays[weekDay] += distance;
        } else activeDaysInARow = 0;
        if (activeDaysInARow > maxActiveDaysInARow) {
          maxActiveDaysInARow = activeDaysInARow;
          maxActiveDaysInARowStartIndex = day - activeDaysInARow;
        }
        currentDay.setDate(currentDay.getDate() + 1);
      }

      setValues({
        journeys,
        distance,
        duration,
        activeDays,
        maxActiveDaysInARow,
        maxActiveDaysInARowStartIndex,
        distancesByMonth: months.map((key) => distancesByMonth[key] || 0),
        distancesByDays:
          new Array(((year % 4 === 0 && year % 100 > 0) || year % 400 == 0) ? 366 : 365)
            .fill(null)
            .map((_, index) => distancesByDays[index] || 0),
        distancesByWeekDays: weekDays.map(({ key }) => distancesByWeekDays[key] || 0),
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  async function download() {
    images?.forEach(({ blob }, index) => saveAs(blob, `recap-${year}-${index + 1}.png`));
  }

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-6 gap-6 overflow-hidden">
      {loading ? (
        <span className="font-medium text-white">Chargement des données</span>
      ) : images && images.length > 0 ? (
        <div className="w-150 max-w-full flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-6">
            {images.map(({ previewURL }, index) => (
              <div className="relative aspect-[calc(1012/1350)]" key={index}>
                <Image alt="" fill src={previewURL} />
              </div>
            ))}
          </div>
          <Button label="Télécharger" onClick={download} />
        </div>
      ) : (
        <>
          <form
            className="w-150 max-w-full grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-x-6 gap-y-3"
            onSubmit={(event) => fetchStats(event)}
          >
            <div>
              <Input
                id="user-id"
                label="ID utilisateur"
                onChange={setUserId}
                placeholder="42"
                required
                type="number"
                value={userId}
              />
            </div>
            <div className="sm:col-span-2 md:col-span-3">
              <Input
                required
                id="authorization-token"
                label="Token"
                onChange={setAuthorizationToken}
                placeholder="XXX"
                value={authorizationToken}
              />
            </div>
            <div className="flex items-end sm:col-span-3 md:col-span-1">
              <Button label="Valider" type="submit" />
            </div>
          </form>
        </>
      )}
      <SummaryPage1 ref={summaryPage1Ref} values={values} />
      <SummaryPage2 ref={summaryPage2Ref} values={values} />
      <SummaryPage3 ref={summaryPage3Ref} values={values} year={year} />
    </main>
  );
}
