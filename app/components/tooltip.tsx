export function Tooltip(
  { position, label, children }: { children: React.ReactNode; label: string; position: 'bottom' | 'bottom-left' }
) {
  const positionClassNames = [];
  if (position === 'bottom' || position === 'bottom-left') {
    positionClassNames.push(
      'top-[100%] mt-[5px] -ml-15 after:content-[\'\'] after:absolute after:bottom-[100%] after:border-5 after:border-transparent after:border-b-white/80 dark:after:border-b-black/80'
    );
    if (position === 'bottom')
      positionClassNames.push('left-[50%] -ml-15 after:left-[50%] after:-ml-[5px]');
    if (position === 'bottom-left') positionClassNames.push('right-0 after:right-[14px] after:-ml-[5px]');
  }

  return (
    <div className="group relative inline-block cursor-pointer">
      {children}
      <div
        className={`absolute w-30 invisible group-hover:visible bg-white/80 dark:bg-black/80 px-2 py-1 rounded-md z-1 text-xs text-center ${positionClassNames.join(' ')}`}
      >
        {label}
      </div>
    </div>
  );
}
