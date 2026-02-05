import { HomeIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, PlusIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid';
import { useMemo } from 'react';

import { Card, Skeleton, Tooltip } from '../../../components';
import { TCommuteToWorkOccurence } from '../../../models';

const enableDays = [1, 2, 3, 4, 5];

export function Day({
  inAnotherMonth,
  commuteToWorkOccurrencesMap,
  day: { date },
}: {
  commuteToWorkOccurrencesMap?:
    | { homeToWork: TCommuteToWorkOccurence[]; workToHome: TCommuteToWorkOccurence[] }
    | undefined;
  day: { date: Date; key: string };
  inAnotherMonth?: boolean;
}) {
  const day = useMemo(() => date.getDate(), [date]);
  const weekDay = useMemo(() => date.getDay(), [date]);
  const enabled = useMemo(() => enableDays.includes(weekDay), [weekDay]);
  const homeToWorkOccurrence = useMemo(
    () =>
      commuteToWorkOccurrencesMap
        ? commuteToWorkOccurrencesMap.homeToWork.find(({ enabled }) => enabled) || null
        : undefined,
    [commuteToWorkOccurrencesMap],
  );
  const workToHomeOccurrence = useMemo(
    () =>
      commuteToWorkOccurrencesMap
        ? commuteToWorkOccurrencesMap.workToHome.find(({ enabled }) => enabled) || null
        : undefined,
    [commuteToWorkOccurrencesMap],
  );

  return (
    <Card>
      <div
        className={`flex flex-col p-1 gap-2 ${inAnotherMonth ? 'bg-black/5 dark:bg-white/5 opacity-50' : ''}`}
      >
        <span className="ml-1 text-sm">{day}</span>
        {enabled ? (
          inAnotherMonth ? (
            <div className="h-[52px]" />
          ) : (
            <div className="w-full flex flex-col items-stretch gap-1">
              {homeToWorkOccurrence !== undefined ? (
                homeToWorkOccurrence ? (
                  homeToWorkOccurrence.candidate ? (
                    <CandidateButton label="Valider cet aller" />
                  ) : (
                    <CheckedButton label="Supprimer cet aller" />
                  )
                ) : (
                  <AddButton label="Ajouter l'aller manuellement" />
                )
              ) : (
                <Skeleton height="h-[24px]" variant="rounded" width="w-full" />
              )}
              {workToHomeOccurrence !== undefined ? (
                workToHomeOccurrence ? (
                  workToHomeOccurrence.candidate ? (
                    <CandidateButton label="Valider ce retour" />
                  ) : (
                    <CheckedButton label="Supprimer ce retour" />
                  )
                ) : (
                  <AddButton label="Ajouter le retour manuellement" />
                )
              ) : (
                <Skeleton height="h-[24px]" variant="rounded" width="w-full" />
              )}
            </div>
          )
        ) : (
          <div className="h-[52px] flex items-center justify-center">
            <HomeIcon className="size-6" />
          </div>
        )}
      </div>
    </Card>
  );
}

function CheckedButton({ label }: { label: string }) {
  return (
    <Tooltip label={label} position="bottom">
      <div className="w-full bg-green-500 rounded-sm">
        <button className="w-full flex justify-center p-1 hover:bg-black/10 focus:bg-black/20 rounded-sm cursor-pointer">
          <CheckCircleIcon className="size-4" />
        </button>
      </div>
    </Tooltip>
  );
}

function CandidateButton({ label }: { label: string }) {
  return (
    <Tooltip label={label} position="bottom">
      <div className="w-full bg-orange-500 rounded-sm">
        <button className="w-full flex justify-center p-1 hover:bg-black/10 focus:bg-black/20 rounded-sm cursor-pointer">
          <QuestionMarkCircleIcon className="size-4" />
        </button>
      </div>
    </Tooltip>
  );
}

function AddButton({ label }: { label: string }) {
  return (
    <Tooltip label={label} position="bottom">
      <button className="w-full flex justify-center p-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 hover:dark:bg-white/10 focus:bg-black/20 focus:dark:bg-white/20 rounded-sm cursor-pointer">
        <PlusIcon className="size-4" />
      </button>
    </Tooltip>
  );
}
