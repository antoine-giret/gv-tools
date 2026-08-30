import { TPeriod } from '@repo/models';
import { useMemo } from 'react';

import { Skeleton } from '../../../components';
import { months, statsMap, TValues, weekDays, weekDaysMap } from '../types';

const { format: formatDistance } = statsMap.distance;

type THeader = {
  period: TPeriod;
  values: TValues | undefined;
  exported?: boolean;
};

function Header({
  exported,
  title,
  bestValue,
  averageValue,
}: {
  exported?: boolean;
  title: string;
  bestValue: { distance: string; label: string } | null | undefined;
  averageValue: { distance: string; label: string } | null | undefined;
}) {
  return (
    <div className={`flex flex-col ${exported ? 'dark' : 'gap-1'}`}>
      <h2 className={`${exported ? 'text-3xl' : 'text-md'} font-bold text-black dark:text-white`}>
        {title}
      </h2>
      {!exported &&
        (bestValue === undefined ? (
          <Skeleton size="sm" variant="text" width="w-[200px]" />
        ) : (
          bestValue && (
            <p className="text-sm text-black dark:text-white">
              <span className="text-emerald-500 dark:text-emerald-300">{bestValue.distance}</span>{' '}
              {bestValue.label}
            </p>
          )
        ))}
      {averageValue === undefined
        ? !exported && <Skeleton size="sm" variant="text" width="w-[200px]" />
        : averageValue && (
            <p className={exported ? 'text-2xl' : 'text-sm text-black dark:text-white'}>
              En moyenne {averageValue.distance} {averageValue.label}
            </p>
          )}
    </div>
  );
}

function AllTimeHeader({ period, values, exported }: THeader) {
  const firstYear = useMemo(() => period.startDate.getFullYear(), [period]);
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return new Array(currentYear - firstYear + 1).fill(null).map((_, index) => firstYear + index);
  }, [firstYear, period]);
  const bestYear = useMemo(() => {
    if (!values) return undefined;

    let _bestYear = firstYear;
    let bestYearDistance = 0;
    years.forEach((year) => {
      const distance = values.distancesByYears[year];
      if (distance > bestYearDistance) {
        _bestYear = year;
        bestYearDistance = distance;
      }
    });

    const distance = values.distancesByYears[_bestYear];
    if (!distance) return null;

    return {
      label: `en ${_bestYear}`,
      distance: `${formatDistance(distance)} kms`,
    };
  }, [firstYear, years, values]);
  const averageYear = useMemo(() => {
    if (!values) return undefined;

    return {
      label: 'par an',
      distance: `${formatDistance(values.distance / years.length)} kms`,
    };
  }, [period, values]);

  return (
    <Header
      averageValue={averageYear}
      bestValue={bestYear}
      exported={exported}
      title="Distance parcourue par année"
    />
  );
}

function YearHeader({ period, values, exported }: THeader) {
  const bestMonth = useMemo(() => {
    if (!values) return undefined;

    const year = period.startDate.getFullYear();
    let bestMonthIndex = 0;
    let bestMonthDistance = 0;
    months.forEach((index) => {
      const distance = values.distancesByMonth[index];
      if (distance > bestMonthDistance) {
        bestMonthIndex = index;
        bestMonthDistance = distance;
      }
    });

    const distance = values.distancesByMonth[bestMonthIndex];
    if (!distance) return null;

    return {
      label: `en ${new Intl.DateTimeFormat('fr', { month: 'long' }).format(
        new Date(year, bestMonthIndex, 1),
      )}`,
      distance: `${formatDistance(distance)} kms`,
    };
  }, [period, values]);
  const averageMonth = useMemo(() => {
    if (!values) return undefined;

    const today = new Date();
    const isCurrentYear = period.startDate.getFullYear() === today.getFullYear();

    return {
      label: 'par mois',
      distance: `${formatDistance(values.distance / (isCurrentYear ? today.getMonth() + 1 : 12))} kms`,
    };
  }, [period, values]);

  return (
    <Header
      averageValue={averageMonth}
      bestValue={bestMonth}
      exported={exported}
      title="Distance parcourue par mois"
    />
  );
}

function MonthHeader({ period, values, exported }: THeader) {
  const bestDay = useMemo(() => {
    if (!values) return undefined;

    const year = period.startDate.getFullYear();
    const month = period.startDate.getMonth();
    let bestDayIndex = 0;
    let bestDayDistance = 0;
    new Array(31).fill(null).forEach((_, index) => {
      const distance = values.distancesByDays[index] ?? 0;
      if (distance > bestDayDistance) {
        bestDayIndex = index;
        bestDayDistance = distance;
      }
    });

    const distance = values.distancesByDays[bestDayIndex];
    if (!distance) return null;

    return {
      label: `le ${new Intl.DateTimeFormat('fr', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(new Date(year, month, bestDayIndex + 1))}`,
      distance: `${formatDistance(distance)} kms`,
    };
  }, [period, values]);
  const averageDay = useMemo(() => {
    if (!values) return undefined;

    const today = new Date();
    const isCurrentMonth =
      period.startDate.getFullYear() === today.getFullYear() &&
      period.startDate.getMonth() === today.getMonth();

    return {
      label: 'par jour',
      distance: `${formatDistance(values.distance / (isCurrentMonth ? today.getDate() : period.endDate.getDate()))} kms`,
    };
  }, [period, values]);

  return (
    <>
      <Header
        averageValue={averageDay}
        bestValue={bestDay}
        exported={exported}
        title="Distance parcourue par jour"
      />
    </>
  );
}

function WeekHeader({ period, values, exported }: THeader) {
  const bestWeekDay = useMemo(() => {
    if (!values) return undefined;

    let bestWeekDayIndex = 0;
    let bestWeekDayDistance = 0;
    weekDays.forEach((index) => {
      const distance = values.distancesByWeekDays[index];
      if (distance > bestWeekDayDistance) {
        bestWeekDayIndex = index;
        bestWeekDayDistance = distance;
      }
    });

    const distance = values.distancesByWeekDays[bestWeekDayIndex];
    if (!distance) return null;

    return {
      label: weekDaysMap[bestWeekDayIndex].label,
      distance: `${formatDistance(distance)} kms`,
    };
  }, [period, values]);
  const averageWeekDay = useMemo(() => {
    if (!values) return undefined;

    const today = new Date();
    const todayWeekDay = today.getDay() === 0 ? 7 : today.getDay();
    const isCurrentWeek =
      period.startDate.getTime() < today.getTime() && today.getTime() < period.endDate.getTime();

    return {
      label: 'par jour',
      distance: `${formatDistance(values.distance / (isCurrentWeek ? todayWeekDay : 7))} kms`,
    };
  }, [period, values]);

  return (
    <>
      <Header
        averageValue={averageWeekDay}
        bestValue={bestWeekDay}
        exported={exported}
        title="Distance parcourue par jour"
      />
    </>
  );
}

export function DistanceHeader(props: THeader) {
  if (props.period.type === 'year') return <YearHeader {...props} />;
  if (props.period.type === 'month') return <MonthHeader {...props} />;
  if (props.period.type === 'allTime') return <AllTimeHeader {...props} />;

  return <WeekHeader {...props} />;
}
