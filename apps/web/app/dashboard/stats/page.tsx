'use client';

import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { TPeriod, TPeriodType } from '@repo/models';
import { useContext, useMemo, useState } from 'react';

import { Button, PeriodSelector } from '../../components';
import { UserContext } from '../../context';
import PrivatePage from '../../guards/private';
import { TStatsData, useStats } from '../../hooks/queries/use-stats';
import { getInitialPeriod } from '../../utils/period';

import { Days } from './days';
import { DaysCalendar } from './days-calendar';
import { Distance } from './distance';
import { GlobalStats } from './global-stats';
import { months, TStat, TValues } from './types';

function parseStats({ period, data }: { data: TStatsData; period: TPeriod }): TValues {
  const daysMap = data.data.reduce<{
    [key: string]: { [key in Exclude<TStat, 'activeDays'>]: number };
  }>((res, { unit, count: dataJourneys, distance: dataDistance, duration: dataDuration }) => {
    res[unit] = {
      journeys: dataJourneys,
      distance: dataDistance,
      duration: dataDuration,
    };
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
  const { startDate, endDate } = period;
  const currentDay = new Date(startDate);

  let daysCount = 0;
  while (currentDay.getTime() <= endDate.getTime()) {
    const key = currentDay.toISOString().replace(/T.*/, '');
    const dayDiff =
      currentDay.getTime() -
      startDate.getTime() +
      (startDate.getTimezoneOffset() - currentDay.getTimezoneOffset()) * 60 * 1000;
    const day = Math.floor(dayDiff / msInOneDay);

    if (daysMap?.[key] && daysMap[key].journeys) {
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

  return {
    journeys: data.count,
    distance: data.distance,
    duration: data.duration,
    activeDays,
    maxActiveDaysInARow,
    maxActiveDaysInARowStartIndex,
    distancesByMonth: months.map((key) => distancesByMonth[key] || 0),
    distancesByDays: new Array(daysCount).fill(null).map((_, index) => distancesByDays[index] || 0),
    distancesByWeekDays,
  };
}

export default function StatsPage() {
  const [initialPeriodType] = useState<TPeriodType>('month');
  const [period, setPeriod] = useState(getInitialPeriod(initialPeriodType));
  const prevPeriod = useMemo<TPeriod>(() => {
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);
    const today = new Date();
    const comparingWithCurrentYear = period.startDate.getFullYear() === today.getFullYear();
    const comparingWithCurrentMonth =
      comparingWithCurrentYear && period.startDate.getMonth() === today.getMonth();

    if (period.type === 'week') {
      startDate.setDate(startDate.getDate() - 7);
      endDate.setDate(endDate.getDate() - 7);

      return { type: 'week', startDate, endDate };
    }

    if (period.type === 'month') {
      startDate.setFullYear(startDate.getFullYear() - 1, startDate.getMonth(), 1);
      if (comparingWithCurrentMonth)
        endDate.setFullYear(today.getFullYear() - 1, today.getMonth(), today.getDate());
      else endDate.setFullYear(endDate.getFullYear() - 1, startDate.getMonth() + 1, 0);

      return { type: 'month', startDate, endDate };
    }

    startDate.setFullYear(startDate.getFullYear() - 1, 0, 1);
    if (comparingWithCurrentYear)
      endDate.setFullYear(
        today.getFullYear() - 1,
        today.getMonth(),
        today.getMonth() === 1 && today.getDate() === 29 ? 28 : today.getDate(),
      );
    else endDate.setFullYear(endDate.getFullYear() - 1, 11, 31);

    return { type: 'year', startDate, endDate };
  }, [period]);
  const [downloading, setDownloading] = useState(false);
  const { signedInUser } = useContext(UserContext);

  const { data } = useStats({ user: signedInUser, period });
  const { data: prevData } = useStats({ user: signedInUser, period: prevPeriod });

  const values = useMemo<TValues | undefined>(() => {
    return data && parseStats({ period, data });
  }, [period, data]);
  const prevValues = useMemo<TValues | undefined>(() => {
    return prevData && parseStats({ period: prevPeriod, data: prevData });
  }, [prevPeriod, prevData]);

  return (
    <PrivatePage>
      <div className="flex flex-col items-stretch gap-12">
        <div className="flex flex-col gap-6">
          <h1 className="text-lg font-bold">Mes statistiques</h1>
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-6 items-stretch sm:items-center md:items-stretch lg:items-center justify-between">
            <PeriodSelector period={period} setPeriod={setPeriod} />
            <div className="flex justify-end">
              <Button
                disabled={!values || downloading}
                Icon={ArrowDownTrayIcon}
                label="Télécharger"
                onClick={() => setDownloading(true)}
              />
            </div>
          </div>
        </div>
        <GlobalStats
          downloading={downloading}
          period={period}
          prevValues={prevValues}
          setDownloading={setDownloading}
          values={values}
        />
        <Distance period={period} values={values} />
        {period.type !== 'week' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-12">
            {period.type === 'year' && <DaysCalendar period={period} values={values} />}
            <Days values={values} />
          </div>
        )}
      </div>
    </PrivatePage>
  );
}
