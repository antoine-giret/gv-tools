import { Ref } from 'react';

export default function SummaryPageContainer(
  { ref, children }: { children: React.ReactNode; ref: Ref<HTMLDivElement> },
) {
  return (
    <div
      className="absolute top-[100%] flex flex-col items-center justify-between gap-[100px] h-[1350px] w-[1012px] px-[100px] py-[50px] bg-slate-900"
      ref={ref}
    >
      <span className="font-(family-name:--font-titan-one) text-6xl font-normal">
        Mon année à vélo 2025
      </span>
      {children}
      <span className="text-xl text-white/80">Données issues de Geovelo</span>
    </div>
  );
}