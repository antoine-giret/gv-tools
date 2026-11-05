import { CheckIcon } from '@heroicons/react/24/solid';
import { ChangeEvent } from 'react';

interface LayerCheckboxProps {
  checked: boolean;
  disabled?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  value: string;
}

export function LayerCheckbox({ checked, disabled, onChange, value }: LayerCheckboxProps) {
  return (
    <span className="relative flex shrink-0 w-4 h-4">
      <input
        checked={checked}
        className={`peer w-4 h-4 border-2 rounded-xs outline-none appearance-none cursor-pointer disabled:cursor-default disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-500 ${checked ? 'bg-emerald-500 border-emerald-500' : 'bg-white dark:bg-gray-800 border-black/50 dark:border-white/50 hover:border-emerald-500'}`}
        disabled={disabled}
        onChange={onChange}
        type="checkbox"
        value={value}
      />
      {checked && (
        <CheckIcon
          className={`absolute inset-0 w-4 h-4 p-px text-white pointer-events-none ${disabled ? 'opacity-50' : ''}`}
        />
      )}
    </span>
  );
}
