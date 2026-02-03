import PrivatePage from '../../guards/private';

export default function FMDPage() {
  return (
    <PrivatePage>
      <div className="flex flex-col items-stretch gap-6 grow">
        <div className="flex flex-col gap-6 shrink-0">
          <h1 className="text-lg font-bold">Forfait Mobilités Durables</h1>
        </div>
      </div>
    </PrivatePage>
  );
}
