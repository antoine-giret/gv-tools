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
    `rounded-md flex items-center justify-center gap-3 px-6 h-9 ${disabled ? `${variant === 'text' ? '' : 'bg-gray-800'} text-gray-600 pointer-events-none` : `${variant === 'text' ? 'hover:bg-white/10 outline-white' : 'bg-emerald-500 hover:bg-emerald-400 outline-emerald-400'} focus:outline outline-offset-2 text-white`} font-small font-bold cursor-pointer`;
  const iconClassName = `size-4 ${disabled ? 'text-gray-600' : 'text-white'}`;

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
