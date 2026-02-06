import { Cog6ToothIcon } from '@heroicons/react/24/outline';

import { Card } from '../../../components';
import { TCommuteToWork } from '../../../models';

import { CommutesToWork } from './commutes-to-work';

export function ConfigCard({ commutesToWork }: { commutesToWork: TCommuteToWork[] | undefined }) {
  return (
    <Card id="config-card">
      <div className="flex flex-col gap-3 p-3">
        <div className="flex items-center gap-3">
          <Cog6ToothIcon className="size-6 text-emerald-500" />
          <span className="text-md font-bold">Paramètres</span>
        </div>
        <CommutesToWork commutesToWork={commutesToWork} />
      </div>
    </Card>
  );
}
