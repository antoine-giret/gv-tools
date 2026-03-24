'use client';

import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { TCommuteToWork, TCommuteToWorkOccurence, TCommuteToWorkOccurencesMap } from '@repo/models';
import { useContext, useMemo, useState } from 'react';

import { IconButton, PeriodSelector } from '../../components';
import { UserContext } from '../../context';
import PrivatePage from '../../guards/private';
import {
  useCommutesToWork,
  useCommutesToWorkOccurrences,
} from '../../hooks/queries/use-commutes-to-work';
import { getInitialPeriod } from '../../utils/period';

import { Calendar } from './calendar';
import { CompensationCard } from './compensation-card';
import { ConfigCard } from './config-card';

export default function FMDPage() {
  const [period, setPeriod] = useState(getInitialPeriod('month'));
  const { signedInUser } = useContext(UserContext);

  const { data: commutesToWorkData } = useCommutesToWork({ user: signedInUser });
  const { data: commutesToWorkOccurrencesData } = useCommutesToWorkOccurrences({
    user: signedInUser,
    period,
    commuteToWorkIds: commutesToWorkData?.results.map(({ id }) => id),
  });

  const commutesToWork = useMemo<TCommuteToWork[] | undefined>(() => {
    return commutesToWorkData?.results
      .filter(({ enabled }) => enabled)
      .map(
        ({
          id,
          distance_in_meters_start_end: homeToWorkDistance,
          distance_in_meters_end_start: workToHomeDistance,
          geo_start,
          geo_start_title,
          geo_end,
          geo_end_title,
        }) => ({
          id,
          home: {
            type: 'Feature',
            geometry: geo_start,
            properties: { title: geo_start_title },
          },
          work: {
            type: 'Feature',
            geometry: geo_end,
            properties: { title: geo_end_title },
          },
          homeToWorkDistance,
          workToHomeDistance,
        }),
      );
  }, [commutesToWorkData]);

  const commuteToWorkOccurrencesMap = useMemo<TCommuteToWorkOccurencesMap | undefined>(() => {
    const occurrences = commutesToWorkOccurrencesData?.map<TCommuteToWorkOccurence>(
      ({ id, user_reference_trip: commuteToWorkId, date, direction, enabled, candidate }) => ({
        id,
        commuteToWorkId,
        date: new Date(date),
        direction: direction === 'OUTWARD' ? 'homeToWork' : 'workToHome',
        enabled,
        candidate,
        order: enabled ? (candidate ? 2 : 1) : 3,
      }),
    );

    return occurrences?.reduce<TCommuteToWorkOccurencesMap>((res, occurrence) => {
      const { date, direction } = occurrence;
      const day = date.toISOString().split('T')[0];
      if (direction === 'homeToWork') {
        if (!res[day]) {
          res[day] = { homeToWork: [occurrence], workToHome: [] };
        } else {
          res[day].homeToWork.push(occurrence);
          res[day].homeToWork.sort((a, b) => a.order - b.order);
        }
      } else {
        if (!res[day]) {
          res[day] = { homeToWork: [], workToHome: [occurrence] };
        } else {
          res[day].workToHome.push(occurrence);
          res[day].workToHome.sort((a, b) => a.order - b.order);
        }
      }

      return res;
    }, {});
  }, [commutesToWorkOccurrencesData]);

  return (
    <PrivatePage>
      <div className="flex flex-col items-stretch gap-6 grow">
        <div className="flex gap-3 items-center justify-between">
          <h1 className="text-lg font-bold">Forfait Mobilités Durables</h1>
          <div className="lg:hidden">
            <IconButton
              Icon={Cog6ToothIcon}
              label="Paramètres"
              onClick={() => {
                const element = document.getElementById('config-card');
                if (element) element.scrollIntoView();
              }}
            />
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 items-stretch grow">
          <div className="flex flex-col gap-6 lg:grow">
            <PeriodSelector period={period} periodTypes={['month']} setPeriod={setPeriod} />
            <Calendar commuteToWorkOccurrencesMap={commuteToWorkOccurrencesMap} period={period} />
          </div>
          <div className="flex flex-col-reverse lg:flex-col gap-6 w-full lg:w-80 shrink-0 lg:border-t-0">
            <ConfigCard commutesToWork={commutesToWork} />
            <CompensationCard />
          </div>
        </div>
      </div>
    </PrivatePage>
  );
}
