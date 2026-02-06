import { ChevronLeftIcon } from '@heroicons/react/24/solid';

export function Button({
  disabled,
  Icon,
  label,
  variant: _variant,
  ...props
}: {
  disabled?: boolean;
  Icon?: typeof ChevronLeftIcon;
  label: string;
  variant?: 'text' | 'outlined' | 'contained';
} & ({ href: string } | { onClick: () => void } | { type: 'submit' })) {
  const variant = _variant || 'contained';
  const textClassName = `${disabled ? 'text-black/50' : variant === 'contained' ? 'text-white' : 'text-emerald-500'} font-small font-bold`;
  const bgClassName =
    variant === 'contained'
      ? disabled
        ? 'bg-black/10 dark:bg-white/10'
        : 'hover:bg-white/5 focus:bg-white/10'
      : disabled
        ? ''
        : 'hover:bg-black/5 hover:dark:bg-white/5 focus:bg-black/10 focus:dark:bg-white/10';
  const borderClassName =
    variant === 'outlined' ? `border-1 ${disabled ? '' : 'border-emerald-500'}` : '';
  const className = `rounded-md flex items-center justify-center gap-3 px-6 h-9 ${disabled ? 'pointer-events-none' : 'cursor-pointer'} ${bgClassName} ${borderClassName} ${textClassName}`;
  const iconClassName = `size-4 ${textClassName}`;
  const rippleClassName = disabled
    ? ''
    : `rounded-md ${variant === 'contained' ? 'bg-emerald-500' : ''}`;

  if ('href' in props) {
    const { href } = props;

    return (
      <div className={rippleClassName}>
        <a className={className} href={href}>
          {Icon && <Icon className={iconClassName} />}
          {label}
        </a>
      </div>
    );
  }

  return (
    <div className={rippleClassName}>
      <button className={className} disabled={disabled} {...props}>
        {Icon && <Icon className={iconClassName} />}
        {label}
      </button>
    </div>
  );
}
