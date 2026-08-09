import { TPeriod } from '@repo/models';
import { BarController, BarElement, CategoryScale, Chart, LinearScale, Tooltip } from 'chart.js';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useRef } from 'react';
import { match } from 'ts-pattern';

import { months, statsMap, TValues, weekDays } from '../types';

Chart.register(LinearScale, CategoryScale, BarController, BarElement, Tooltip);

const { format: formatDistance } = statsMap.distance;

export function DistanceChart({
  exported,
  period,
  values,
  setReady,
}: {
  exported?: boolean;
  period: TPeriod;
  setReady?: (ready: boolean) => void;
  values: TValues | undefined;
}) {
  const chartId = useMemo(
    () => (exported ? 'exported-distance-chart' : 'distance-chart'),
    [exported],
  );
  const chartRef = useRef<Chart>(null);
  const { theme } = useTheme();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const ctx = document.getElementById(chartId);
    if (ctx && ctx instanceof HTMLCanvasElement) {
      const { type: periodType, startDate, endDate } = period;
      const firstYear = period.startDate.getFullYear();
      const currentYear = new Date().getFullYear();
      const years = new Array(currentYear - firstYear + 1)
        .fill(null)
        .map((_, index) => firstYear + index);
      let labels: string[] = [];
      let tooltipLabels: string[] = [];

      if (periodType === 'allTime') {
        labels = years.map((year) => `${year}`);
        tooltipLabels = years.map((year) => `${year}`);
      } else if (periodType === 'year') {
        const year = startDate.getFullYear();
        labels = months.map((month) =>
          new Intl.DateTimeFormat('fr', { month: 'short' }).format(new Date(year, month, 1)),
        );
        tooltipLabels = months.map((_, month) =>
          new Intl.DateTimeFormat('fr', { month: 'long', year: 'numeric' }).format(
            new Date(year, month, 1),
          ),
        );
      } else {
        const currentDay = new Date(startDate);
        while (currentDay.getTime() <= endDate.getTime()) {
          match(periodType)
            .with('month', () => {
              labels.push(
                new Intl.DateTimeFormat('fr', {
                  weekday: 'short',
                  day: 'numeric',
                }).format(currentDay),
              );

              tooltipLabels.push(
                new Intl.DateTimeFormat('fr', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                }).format(currentDay),
              );
            })
            .with('week', () => {
              labels.push(
                new Intl.DateTimeFormat('fr', {
                  weekday: 'long',
                }).format(currentDay),
              );

              tooltipLabels.push(
                new Intl.DateTimeFormat('fr', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }).format(currentDay),
              );
            })
            .exhaustive();

          currentDay.setDate(currentDay.getDate() + 1);
        }
      }

      chartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              data: values
                ? match(periodType)
                    .with('week', () => weekDays.map((index) => values.distancesByWeekDays[index]))
                    .with('month', () => values.distancesByDays)
                    .with('year', () => values.distancesByMonth)
                    .with('allTime', () => years.map((year) => values.distancesByYears[year] ?? 0))
                    .exhaustive()
                : [],
              label: 'Distance roulée',
              backgroundColor: '#5ee9b5',
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: exported
                  ? '#fff'
                  : theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.5)'
                    : 'rgba(0, 0, 0, 0.5)',
                maxRotation: 0,
              },
            },
            y: {
              suggestedMax: 0,
              beginAtZero: true,
              grid: {
                color:
                  exported || theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              },
              ticks: {
                color: exported
                  ? '#fff'
                  : theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.5)'
                    : 'rgba(0, 0, 0, 0.5)',
                stepSize: 10000,
                maxTicksLimit: 5,
                callback: (value) =>
                  typeof value === 'number' ? `${formatDistance(value)} kms` : '',
              },
            },
          },
          plugins: {
            tooltip: {
              enabled: !exported,
              callbacks: {
                title: ([{ dataIndex }]) => tooltipLabels[dataIndex],
                label: ({ parsed: { y } }) => ` ${y ? formatDistance(y) : 0} kms`,
              },
            },
          },
        },
      });

      timeout = setTimeout(() => setReady?.(true), 500);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
      setReady?.(false);
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [period, theme]);

  useEffect(() => {
    if (chartRef.current && values) {
      const firstYear = period.startDate.getFullYear();
      const currentYear = new Date().getFullYear();
      const years = new Array(currentYear - firstYear + 1)
        .fill(null)
        .map((_, index) => firstYear + index);

      chartRef.current.data.datasets[0].data = match(period.type)
        .with('week', () => weekDays.map((index) => values.distancesByWeekDays[index]))
        .with('month', () => values.distancesByDays)
        .with('year', () => values.distancesByMonth)
        .with('allTime', () => years.map((year) => values.distancesByYears[year] ?? 0))
        .exhaustive();
      chartRef.current.update();
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.data.datasets[0].data = [];
        chartRef.current.update();
      }
    };
  }, [values]);

  return (
    <div className={exported ? 'h-100' : 'h-80'}>
      <canvas className="w-full h-full" id={chartId} />
    </div>
  );
}
