import { ChevronLeftIcon } from '@heroicons/react/24/solid';

export function Button(
  {
    disabled,
    Icon,
    label,
    variant,
    ...props
  }: {
    disabled?: boolean;
    Icon?: typeof ChevronLeftIcon;
    label: string;
    variant?: 'text';
  } & ({ href: string } | { onClick: () => void } | { type: 'submit' })
) {
  const className =
    `rounded-md flex items-center justify-center gap-3 px-6 h-9 ${disabled ? `${variant === 'text' ? '' : 'bg-gray-200 dark:bg-gray-800'} text-black/50 dark:text-white/50 pointer-events-none` : `${variant === 'text' ? 'hover:bg-black/10 hover:dark:bg-white/10 focus:bg-black/20 focus:dark:bg-white/20' : 'bg-emerald-500 hover:bg-emerald-600 hover:dark:bg-emerald-400'} text-white`} font-small font-bold cursor-pointer`;
  const iconClassName = `size-4 ${disabled ? 'text-black/50 dark:text-white/50' : 'text-white'}`;

  if ('href' in props) {
    const { href } = props;

    return (
      <a className={className} href={href}>
        {Icon && <Icon className={iconClassName} />}
        {label}
      </a>
    );
  }

  return (
    <button
      className={className}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon className={iconClassName} />}
      {label}
    </button>
  );
}
