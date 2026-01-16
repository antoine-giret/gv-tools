export function Select<T extends string | number>(
  {
    id,
    disabled,
    label,
    value,
    options,
    onChange,
  }: {
    disabled?: boolean;
    id: string;
    label?: string;
    onChange: (value: T) => void;
    options: Array<{ label: string; value: T }>;
    value: T;
  }
) {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label
        className="block text-sm font-medium text-heading"
        htmlFor={id}
      >
        {label}
      </label>}
      <select
        className="block w-full rounded-md px-3 h-9 bg-black/10 dark:bg-white/10 focus:outline outline-emerald-400 outline-offset-2 text-heading text-sm"
        disabled={disabled}
        id={id}
        onChange={({ currentTarget: { value } }) => {
          onChange((typeof value === 'string' ? value : parseInt(value)) as T)
        }}
        value={value}
      >
        {options.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </div>
  );
}