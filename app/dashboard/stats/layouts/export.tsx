import { Ref } from 'react';

export function ExportLayout(
  {
    ref,
    title,
    subtitle,
    children,
  }: {
    children: React.ReactNode;
    ref: Ref<HTMLDivElement>;
    subtitle: string;
    title: string;
  },
) {
  return (
    <div
      className="absolute top-[100%] flex flex-col items-center justify-between gap-[100px] h-[1350px] w-[1012px] px-[100px] py-[50px] bg-slate-900"
      ref={ref}
    >
      <div className="flex flex-col gap-[25px] items-center">
        <span className="font-(family-name:--font-titan-one) text-6xl font-normal text-center text-white">
          {title}
        </span>
        <span className="text-4xl font-normal text-center capitalize text-white">
          {subtitle}
        </span>
      </div>
      {children}
      <span className="text-xl text-white/80">Données issues de Geovelo</span>
    </div>
  );
}