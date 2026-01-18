import { BarController, BarElement, CategoryScale, Chart, LinearScale, Tooltip } from 'chart.js';
import { useTheme } from 'next-themes';
import { useEffect, useRef } from 'react';

import { TPeriod } from '../../utils/period';
import { formatNumber } from '../../utils/stats';

import { TValues } from './types';

Chart.register(LinearScale, CategoryScale, BarController, BarElement, Tooltip);

const chartId = 'distance-chart';

export function Distance({ period, values }: { period: TPeriod; values: TValues | undefined }) {
  const chartRef = useRef<Chart>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const ctx = document.getElementById(chartId);
    if (ctx && ctx instanceof HTMLCanvasElement) {
      const { type: periodType, startDate, endDate } = period;
      let labels: string[] = [];
      let tooltipLabels: string[] = [];

      if (periodType === 'year') {
        const year = startDate.getFullYear();
        labels = new Array(12)
          .fill(null)
          .map((_, month) =>
            new Intl.DateTimeFormat('fr', { month: 'short' }).format(new Date(year, month, 1))
          );
        tooltipLabels = new Array(12)
          .fill(null)
          .map((_, month) =>
            new Intl.DateTimeFormat('fr', { month: 'long', year: 'numeric' }).format(new Date(year, month, 1))
          );
      } else {
        const currentDay = new Date(startDate);
        while (currentDay.getTime() < endDate.getTime()) {
          labels.push(new Intl.DateTimeFormat('fr', periodType === 'week' ? {
            weekday: 'long',
          } : {
            weekday: 'short',
            day: 'numeric',
          }).format(currentDay));

          tooltipLabels.push(new Intl.DateTimeFormat('fr', periodType === 'week' ? {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          } : {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          }).format(currentDay));

          currentDay.setDate(currentDay.getDate() + 1);
        }
      }

      chartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data: values ? period.type === 'year' ? values.distancesByMonth : values.distancesByDays : [],
            label: 'Distance roulée',
            backgroundColor: '#5ee9b5',
            borderRadius: 4,
          }],
        },
        options: {
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: {
                maxRotation: 0,
              },
              grid: {
                display: false,
              },
            },
            y: {
              suggestedMax: 0,
              beginAtZero: true,
              grid: {
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              },
              ticks: {
                stepSize: 10000,
                maxTicksLimit: 5,
                callback: (value) => typeof value === 'number' ? `${formatNumber(Math.round(value / 1000))} kms` : '',
              },
            },
          },
          plugins: {
            tooltip: {
              enabled: true,
              callbacks: {
                title: ([{ dataIndex }]) => tooltipLabels[dataIndex],
                label: ({ parsed: { y } }) => ` ${y ? formatNumber(Math.round(y / 100) / 10) : 0} kms`,
              },
            },
          },
        },
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, theme]);

  useEffect(() => {
    if (chartRef.current && values) {
      chartRef.current.data.datasets[0].data =
        period.type === 'year' ? values.distancesByMonth : values.distancesByDays;
      chartRef.current.update();
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.data.datasets[0].data = [];
        chartRef.current.update();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  return (
    <div className="w-full h-80">
      <canvas className="w-full h-full" id={chartId} />
    </div>
  );
}
