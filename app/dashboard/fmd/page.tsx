'use client';

import { useContext, useEffect, useState } from 'react';

import { PeriodSelector } from '../../components';
import { UserContext } from '../../context';
import PrivatePage from '../../guards/private';
import {
  TCommuteToWork,
  TCommuteToWorkOccurence,
  TCommuteToWorkOccurencesMap,
  TUser,
} from '../../models';
import { getInitialPeriod } from '../../utils/period';

import { Calendar } from './calendar';
import { CompensationCard } from './compensation-card';
import { ConfigCard } from './config-card';

export default function FMDPage() {
  const [period, setPeriod] = useState(getInitialPeriod('month'));
  const [commutesToWork, setCommutesToWork] = useState<TCommuteToWork[]>();
  const [commuteToWorkOccurrencesMap, setCommuteToWorkOccurrencesMap] =
    useState<TCommuteToWorkOccurencesMap>();
  const { signedInUser } = useContext(UserContext);

  useEffect(() => {
    let active = true;

    async function fetchCommutesToWork({
      user: { id: userId, authorizationToken },
    }: {
      user: TUser;
    }) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_GV_BACKEND_URL}/api/v3/users/${userId}/reference_trips`,
        {
          method: 'GET',
          headers: {
            'Api-Key': process.env.NEXT_PUBLIC_GV_API_KEY || '',
            source: process.env.NEXT_PUBLIC_GV_SOURCE || '',
            Authorization: `Token ${authorizationToken}`,
          },
        },
      );

      if (res.status !== 200) {
        console.error('cannot fetch reference trips');
        return;
      }

      const { results } = (await res.json()) as {
        results: Array<{
          id: number;
          distance_in_meters_end_start: number;
          distance_in_meters_start_end: number;
          enabled: boolean;
          geo_end: GeoJSON.Point;
          geo_end_title: string;
          geo_start: GeoJSON.Point;
          geo_start_title: string;
        }>;
      };

      if (active) {
        setCommutesToWork(
          results
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
            ),
        );
      }
    }

    if (signedInUser) fetchCommutesToWork({ user: signedInUser });

    return () => {
      active = false;
      setCommutesToWork(undefined);
    };
  }, [signedInUser]);

  useEffect(() => {
    let active = true;

    async function fetchOccurrences({
      user: { id: userId, authorizationToken },
      commutesToWork,
    }: {
      commutesToWork: TCommuteToWork[];
      user: TUser;
    }) {
      if (commutesToWork.length === 0) {
        setCommuteToWorkOccurrencesMap({});
      }

      const { startDate, endDate } = period;
      const startDateFormatted = startDate
        .toISOString()
        .split('T')[0]
        .split('-')
        .reverse()
        .join('-');
      const endDateFormatted = endDate.toISOString().split('T')[0].split('-').reverse().join('-');

      const allOccurrences = (
        await Promise.all<Promise<TCommuteToWorkOccurence[]>>(
          commutesToWork.map(async (commuteToWork) => {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_GV_BACKEND_URL}/api/v3/users/${userId}/reference_trips/${commuteToWork.id}/occurrences?period=custom&date_start=${startDateFormatted}&date_end=${endDateFormatted}`,
              {
                method: 'GET',
                headers: {
                  'Api-Key': process.env.NEXT_PUBLIC_GV_API_KEY || '',
                  source: process.env.NEXT_PUBLIC_GV_SOURCE || '',
                  Authorization: `Token ${authorizationToken}`,
                },
              },
            );

            if (res.status !== 200) {
              console.error('cannot fetch reference trips occurrences');
              return [];
            }

            const { results } = (await res.json()) as {
              results: Array<{
                candidate: boolean;
                date: string;
                direction: 'OUTWARD' | 'RETURN';
                id: number;
                enabled: boolean;
                user_reference_trip: number;
              }>;
            };

            return results.map<TCommuteToWorkOccurence>(
              ({
                id,
                user_reference_trip: commuteToWorkId,
                date,
                direction,
                enabled,
                candidate,
              }) => ({
                id,
                commuteToWorkId,
                date: new Date(date),
                direction: direction === 'OUTWARD' ? 'homeToWork' : 'workToHome',
                enabled,
                candidate,
                order: enabled ? (candidate ? 2 : 1) : 3,
              }),
            );
          }),
        )
      ).flatMap((occurrences) => occurrences);

      if (active) {
        const occurrencesMap = allOccurrences.reduce<TCommuteToWorkOccurencesMap>(
          (res, occurrence) => {
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
          },
          {},
        );

        setCommuteToWorkOccurrencesMap(occurrencesMap);
      }
    }

    if (signedInUser && commutesToWork) fetchOccurrences({ user: signedInUser, commutesToWork });

    return () => {
      active = false;
      setCommuteToWorkOccurrencesMap(undefined);
    };
  }, [signedInUser, period, commutesToWork]);

  return (
    <PrivatePage>
      <div className="flex flex-col items-stretch gap-6 grow">
        <h1 className="text-lg font-bold">Forfait Mobilités Durables</h1>
        <div className="flex flex-col lg:flex-row gap-6 items-stretch grow">
          <div className="flex flex-col gap-6 lg:grow">
            <PeriodSelector period={period} periodTypes={['month']} setPeriod={setPeriod} />
            <Calendar commuteToWorkOccurrencesMap={commuteToWorkOccurrencesMap} period={period} />
          </div>
          <div className="flex flex-col gap-6 w-full lg:w-80 shrink-0 lg:border-t-0">
            <ConfigCard commutesToWork={commutesToWork} />
            <CompensationCard />
          </div>
        </div>
      </div>
    </PrivatePage>
  );
}
