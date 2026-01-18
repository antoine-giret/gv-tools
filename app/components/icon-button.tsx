import { ChevronLeftIcon } from '@heroicons/react/24/solid';

export function IconButton(
  {
    disabled,
    Icon,
    label,
    ...props
  }: {
    disabled?: boolean;
    Icon: typeof ChevronLeftIcon;
    label: string;
  } & ({ href: string } | { onClick: () => void })
) {
  const className =
    `rounded-full flex items-center justify-center h-9 w-9 ${disabled ? `text-black/50 dark:text-white/50 pointer-events-none` : `hover:bg-black/10 hover:dark:bg-white/10 focus:bg-black/20 focus:dark:bg-white/20`} cursor-pointer`;
  const iconClassName = `size-4 ${disabled ? 'text-gray-400 dark:text-black/50 dark:text-white/50' : 'text-black dark:text-white'}`;
  const ariaProps = { 'aria-label': label, title: label };

  if ('href' in props) {
    return (
      <a className={className} {...props} {...ariaProps}>
        <Icon className={iconClassName} />
      </a>
    );
  }

  return (
    <button
      className={className}
      disabled={disabled}
      {...props}
      {...ariaProps}
    >
      <Icon className={iconClassName} />
    </button>
  );
}
