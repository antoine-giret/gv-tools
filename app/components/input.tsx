export function Input(
  {
    id,
    disabled,
    required,
    type,
    label,
    placeholder,
    value,
    onChange,
  }: {
    disabled?: boolean;
    id: string;
    label: string;
    onChange: (value: string) => void;
    placeholder: string;
    required?: boolean;
    type?: 'number';
    value: string;
  }
) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="block text-sm font-medium text-heading"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        autoComplete="nope"
        className="block w-full rounded-md px-3 h-9 bg-gray-800 focus:outline outline-emerald-400 outline-offset-2 text-heading text-sm placeholder:text-body"
        data-lpignore="true"
        data-form-type="other"
        disabled={disabled}
        id={id}
        onChange={({ currentTarget: { value } }) => onChange(value)}
        placeholder={placeholder}
        required={required}
        type={type || 'text'}
        value={value}
      />
    </div>
  );
}
