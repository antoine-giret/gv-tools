'use client';

import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { useContext, useEffect, useRef, useState } from 'react';

import { Button, PeriodSelector } from '../../components';
import { UserContext } from '../../context';
import PrivatePage from '../../guards/private';
import { TUser } from '../../models/user';
import { getInitialPeriod, TPeriodType } from '../../utils/period';

import { Days } from './days';
import { Distance } from './distance';
import { GlobalStats } from './global-stats';
import { StatsExport, TStatsExportRef } from './image-export';
import { months, TStat, TValues } from './types';
import { Calendar } from './calendar';

export default function StatsPage() {
  const [initialPeriodType] = useState<TPeriodType>('month');
  const [period, setPeriod] = useState(getInitialPeriod(initialPeriodType));
  const [values, setValues] = useState<TValues>();
  const [downloading, setDownloading] = useState(false);
  const { signedInUser } = useContext(UserContext);
  const statsExportRef = useRef<TStatsExportRef>(null);

  useEffect(() => {
    let active = true;

    async function fetchStats({ id: userId, authorizationToken }: TUser) {
      const { startDate, endDate } = period;
      const startDateFormatted = startDate.toISOString().split('T')[0].split('-').reverse().join('-');
      const endDateFormatted = endDate.toISOString().split('T')[0].split('-').reverse().join('-');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_GV_BACKEND_URL}/api/v2/users/${userId}/stats_traces?period=custom&date_start=${startDateFormatted}&date_end=${endDateFormatted}&unit=day`,
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
      const msInOneDay = 1000 * 60 * 60 * 24;
      const currentDay = new Date(startDate);

      let daysCount = 0;
      while (currentDay.getTime() <= endDate.getTime()) {
        const key = currentDay.toISOString().replace(/T.*/, '');
        const dayDiff =
          (currentDay.getTime() - startDate.getTime()) +
          ((startDate.getTimezoneOffset() - currentDay.getTimezoneOffset()) * 60 * 1000);
        const day = Math.floor(dayDiff / msInOneDay);

        if (daysMap[key] && daysMap[key].journeys) {
          const month = currentDay.getMonth();
          const weekDay = currentDay.getDay();
          const { distance } = daysMap[key];

          ++activeDays;
          ++activeDaysInARow;

          if (!distancesByMonth[month]) distancesByMonth[month] = distance;
          else distancesByMonth[month] += distance;

          distancesByDays[day] = distance;

          if (!distancesByWeekDays[weekDay]) distancesByWeekDays[weekDay] = distance;
          else distancesByWeekDays[weekDay] += distance;
        } else activeDaysInARow = 0;

        if (activeDaysInARow > maxActiveDaysInARow) {
          maxActiveDaysInARow = activeDaysInARow;
          maxActiveDaysInARowStartIndex = day - activeDaysInARow + 1;
        }

        currentDay.setDate(currentDay.getDate() + 1);
        ++daysCount;
      }

      if (active) {
        setValues({
          journeys,
          distance,
          duration,
          activeDays,
          maxActiveDaysInARow,
          maxActiveDaysInARowStartIndex,
          distancesByMonth: months.map((key) => distancesByMonth[key] || 0),
          distancesByDays: new Array(daysCount).fill(null).map((_, index) => distancesByDays[index] || 0),
          distancesByWeekDays,
        });
      }
    }

    if (signedInUser) fetchStats(signedInUser);

    return () => {
      active = false;
      setValues(undefined);
    };
  }, [signedInUser, period]);

  async function download() {
    setDownloading(true);

    try {
      await statsExportRef.current?.download();
    } catch (err) {
      console.error(err);
    }

    setDownloading(false);
  }

  return (
    <PrivatePage>
      <div className="flex flex-col items-stretch gap-12">
        <div className="flex flex-col gap-6">
          <h1 className="text-lg font-bold">Mes statistiques</h1>
          <div
            className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-6 items-stretch sm:items-center md:items-stretch lg:items-center justify-between"
          >
            <PeriodSelector period={period} setPeriod={setPeriod} />
            <div className="flex justify-end">
              <Button
                disabled={!values || downloading}
                Icon={ArrowDownTrayIcon}
                label="Télécharger"
                onClick={download}
              />
            </div>
          </div>
        </div>
        <GlobalStats values={values} />
        <Distance period={period} values={values} />
        {period.type !== 'week' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-12">
            {period.type === 'year' && <Calendar period={period} values={values} />}
            <Days values={values} />
          </div>
        )}
      </div>
      <StatsExport period={period} ref={statsExportRef} values={values} />
    </PrivatePage>
  );
}
