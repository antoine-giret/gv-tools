'use client';

import { useState } from 'react';

import { PeriodSelector } from '../../components';
import PrivatePage from '../../guards/private';
import { getInitialPeriod, TPeriodType } from '../../utils/period';

export default function StatsPage() {
  const [initialPeriodType] = useState<TPeriodType>('month');
  const [period, setPeriod] = useState(getInitialPeriod(initialPeriodType));

  return (
    <PrivatePage>
      <div className="flex flex-col gap-6">
        <PeriodSelector period={period} setPeriod={setPeriod} />
      </div>
    </PrivatePage>
  );
}
