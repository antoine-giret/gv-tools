'use client';

import { ChangeEvent } from 'react';

import { LayerCheckbox } from './layer-checkbox';
import { TLayer } from './types';

interface LegendItemProps {
  icon: React.ReactNode;
  label: string;
}

export function LegendItem({ icon, label }: LegendItemProps) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <p className="text-xs text-black dark:text-white">{label}</p>
    </div>
  );
}

interface LegendProps {
  selectedLayers: TLayer[];
  onChangeLayer: (event: ChangeEvent<HTMLInputElement>) => void;
  layers: readonly TLayer[];
  layersLabels: { [key in TLayer]: string };
}

export function Legend({ selectedLayers, onChangeLayer, layers, layersLabels }: LegendProps) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded text-sm w-64">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          {layers.map((key) => {
            const active = selectedLayers.includes(key);

            return (
              <div className="flex flex-col gap-3" key={key}>
                <label className="flex items-center gap-3 cursor-pointer">
                  {key === 'traces' ? (
                    <div className="w-4 h-1 bg-emerald-300 rounded flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 bg-emerald-500 rounded-sm flex-shrink-0" />
                  )}
                  <span className="grow text-sm font-medium text-black dark:text-white">
                    {layersLabels[key]}
                  </span>
                  <LayerCheckbox checked={active} onChange={onChangeLayer} value={key} />
                </label>
                {key === 'tiles' && (
                  <div className="flex flex-col gap-2 pl-3 border-l border-l-white/10">
                    <LegendItem
                      icon={<div className="w-4 h-4 bg-pink-500 rounded-sm flex-shrink-0" />}
                      label="Plus grand super hexa"
                    />
                    <LegendItem
                      icon={
                        <div className="w-4 h-4 rounded-sm flex-shrink-0 border-2 border-t-emerald-300 border-l-emerald-300 border-b-pink-300 border-r-pink-300" />
                      }
                      label="Nouvelles zones débloquées"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
