import { Card } from '../../../components';
import { TCommuteToWork } from '../../../models';

import { CommutesToWork } from './commutes-to-work';

export function ConfigCard({ commutesToWork }: { commutesToWork: TCommuteToWork[] | undefined }) {
  return (
    <Card>
      <div className="flex flex-col gap-3 p-3">
        <CommutesToWork commutesToWork={commutesToWork} />
      </div>
    </Card>
  );
}
