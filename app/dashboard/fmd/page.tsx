'use client';

import { useState } from 'react';

import { PeriodSelector } from '../../components';
import PrivatePage from '../../guards/private';
import { getInitialPeriod } from '../../utils/period';

import { Calendar } from './calendar';
import { CompensationCard } from './compensation-card';
import { ConfigCard } from './config-card';

export default function FMDPage() {
  const [period, setPeriod] = useState(getInitialPeriod('month'));

  return (
    <PrivatePage>
      <div className="flex flex-col items-stretch gap-6 grow">
        <h1 className="text-lg font-bold">Forfait Mobilités Durables</h1>
        <div className="flex flex-col lg:flex-row gap-6 items-stretch grow">
          <div className="flex flex-col gap-6 lg:grow">
            <PeriodSelector period={period} periodTypes={['month']} setPeriod={setPeriod} />
            <Calendar period={period} />
          </div>
          <div className="flex flex-col gap-6 w-full lg:w-80 shrink-0 lg:border-t-0">
            <ConfigCard />
            <CompensationCard />
          </div>
        </div>
      </div>
    </PrivatePage>
  );
}
