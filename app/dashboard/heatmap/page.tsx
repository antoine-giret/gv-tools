'use client';

import { useState } from 'react';

import { PeriodSelector } from '../../components';
import PrivatePage from '../../guards/private';
import { getInitialPeriod, TPeriodType } from '../../utils/period';

export default function HeatmapPage() {
  const [initialPeriodType] = useState<TPeriodType>('month');
  const [period, setPeriod] = useState(getInitialPeriod(initialPeriodType));

  return (
    <PrivatePage>
      <div className="flex flex-col items-stretch gap-12">
        <div className="flex flex-col gap-6">
          <h1 className="text-lg font-bold">Ma heatmap</h1>
          <div
            className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-6 items-stretch sm:items-center md:items-stretch lg:items-center justify-between"
          >
            <PeriodSelector period={period} periodTypes={['month', 'year']} setPeriod={setPeriod} />
          </div>
        </div>
      </div>
    </PrivatePage>
  );
}
