import { BriefcaseIcon, HomeIcon } from '@heroicons/react/24/outline';
import { TCommuteToWork, TPoint } from '@repo/models';
import { useMemo } from 'react';

import { Card, Skeleton } from '../../../components';
import { statsMap } from '../../stats/types';

const { format: formatDistance } = statsMap.distance;

export function CommutesToWork({
  commutesToWork,
}: {
  commutesToWork: TCommuteToWork[] | undefined;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-bold">Trajets</span>
      {commutesToWork?.map((commuteToWork, index) => (
        <CommuteToWork
          commuteToWork={commuteToWork}
          key={commuteToWork.id}
          title={commutesToWork.length > 1 ? `Trajet vélotaf ${index + 1}` : undefined}
        />
      )) || <CommuteToWork />}
    </div>
  );
}

export function CommuteToWork({
  title,
  commuteToWork,
}: {
  commuteToWork?: TCommuteToWork;
  title?: string;
}) {
  const home = useMemo(() => commuteToWork?.home, [commuteToWork]);
  const work = useMemo(() => commuteToWork?.work, [commuteToWork]);
  const homeToWorkDistance = useMemo(() => commuteToWork?.homeToWorkDistance, [commuteToWork]);
  const workToHomeDistance = useMemo(() => commuteToWork?.workToHomeDistance, [commuteToWork]);

  return (
    <Card>
      <div className="flex flex-col gap-2 p-2">
        {title && <span className="text-sm text-black/70 dark:text-white/70">{title}</span>}
        <div className="flex flex-col gap-2 mx-2">
          <Address Icon={HomeIcon} point={home} />
          <Address Icon={BriefcaseIcon} point={work} />
          <div className="flex gap-3 justify-end">
            <Distance distance={homeToWorkDistance} label="Aller" />
            <Distance distance={workToHomeDistance} label="Retour" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function Address({ Icon, point }: { Icon: typeof HomeIcon; point: TPoint | undefined }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 shrink-0 text-black/70 dark:text-white/70" />
      <div className="grow truncate">
        {point ? (
          <span className="text-sm">{point.properties.title}</span>
        ) : (
          <Skeleton size="sm" variant="text" width="w-[80%]" />
        )}
      </div>
    </div>
  );
}

function Distance({ label, distance }: { distance: number | undefined; label: string }) {
  return (
    <div className="flex gap-1 items-center">
      <span className="text-sm font-bold">{label}&nbsp;:</span>
      {distance ? (
        <span className="text-sm">{formatDistance(distance)}&nbsp;kms</span>
      ) : (
        <div className="w-10">
          <Skeleton size="sm" variant="text" width="w-[100%]" />
        </div>
      )}
    </div>
  );
}
