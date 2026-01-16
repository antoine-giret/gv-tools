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
    `rounded-full flex items-center justify-center h-9 w-9 ${disabled ? `bg-gray-800 text-gray-600 pointer-events-none` : `hover:bg-black/10 hover:dark:bg-white/10 outline-white focus:outline outline-offset-2`} cursor-pointer`;
  const iconClassName = `size-4 ${disabled ? 'text-gray-600' : 'text-black dark:text-white'}`;
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
